import { EnhancedAppError, createError, errorManager } from '../utils/errorHandling';
import { AppError, Result, success, failure } from '../types';
import { StorageAdapter } from '../repositories/BaseRepository';
import { useAppStore } from '../store';

// Sync Operation Types
export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  BATCH = 'BATCH',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  entity: string;
  entityId: string;
  data: any;
  localTimestamp: Date;
  cloudTimestamp?: Date;
  status: SyncStatus;
  retries: number;
  maxRetries: number;
  lastError?: string;
  priority: number; // Higher number = higher priority
}

export interface SyncResult {
  success: boolean;
  operationsProcessed: number;
  operationsSuccessful: number;
  operationsFailed: number;
  errors: string[];
  conflictsResolved: number;
}

export interface SyncConflict {
  operation: SyncOperation;
  localData: any;
  cloudData: any;
  resolution: 'local' | 'cloud' | 'merge' | 'manual';
}

// Sync Strategy Interface
export interface SyncStrategy {
  shouldSync(): Promise<boolean>;
  handleConflict(conflict: SyncConflict): Promise<any>;
  getPriority(operation: SyncOperation): number;
  getRetryDelay(attempt: number): number;
}

// Default Sync Strategy
export class DefaultSyncStrategy implements SyncStrategy {
  async shouldSync(): Promise<boolean> {
    // Check network connectivity, user preferences, etc.
    return navigator.onLine;
  }

  async handleConflict(conflict: SyncConflict): Promise<any> {
    // Last-write-wins with local preference
    if (conflict.localData.timestamp > conflict.cloudData.timestamp) {
      return conflict.localData;
    }
    return conflict.cloudData;
  }

  getPriority(operation: SyncOperation): number {
    // Higher priority for newer operations
    const age = Date.now() - operation.localTimestamp.getTime();
    const basePriority = operation.priority || 0;
    const agePenalty = Math.floor(age / (60 * 60 * 1000)); // 1 point per hour
    return basePriority - agePenalty;
  }

  getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const maxDelay = 60000; // 1 minute max
    const jitter = Math.random() * 1000; // Up to 1 second jitter
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }
}

// Sync Engine Implementation
export class SyncEngine {
  private operations: Map<string, SyncOperation> = new Map();
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private strategy: SyncStrategy;
  private listeners: Set<(result: SyncResult) => void> = new Set();

  constructor(
    private localStorage: StorageAdapter,
    private cloudStorage: StorageAdapter,
    strategy?: SyncStrategy
  ) {
    this.strategy = strategy || new DefaultSyncStrategy();
    this.loadPendingOperations();
  }

  // Start automatic sync
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.sync();
      } catch (error) {
        errorManager.handleError(error as Error, { context: 'auto_sync' });
      }
    }, intervalMs);
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Add operation to sync queue
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'status' | 'retries'>): Promise<void> {
    const syncOp: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      status: SyncStatus.PENDING,
      retries: 0,
      maxRetries: 3,
      priority: 1,
      ...operation,
    };

    this.operations.set(syncOp.id, syncOp);
    await this.persistOperations();

    // Update store with pending operation
    const store = useAppStore.getState();
    store.addPendingOperation({
      id: syncOp.id,
      type: syncOp.type,
      entity: syncOp.entity,
      entityId: syncOp.entityId,
      data: syncOp.data,
      timestamp: syncOp.localTimestamp,
      retries: syncOp.retries,
    });

    // Trigger immediate sync if not already running
    if (!this.isRunning) {
      this.sync().catch(error => {
        errorManager.handleError(error as Error, { context: 'queue_operation_sync' });
      });
    }
  }

  // Perform sync operation
  async sync(): Promise<SyncResult> {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping...');
      return {
        success: true,
        operationsProcessed: 0,
        operationsSuccessful: 0,
        operationsFailed: 0,
        errors: [],
        conflictsResolved: 0,
      };
    }

    this.isRunning = true;
    const store = useAppStore.getState();
    
    try {
      store.setSyncStatus({ syncing: true, lastError: null });

      // Check if we should sync
      const shouldSync = await this.strategy.shouldSync();
      if (!shouldSync) {
        console.log('Sync strategy indicates we should not sync now');
        return {
          success: true,
          operationsProcessed: 0,
          operationsSuccessful: 0,
          operationsFailed: 0,
          errors: [],
          conflictsResolved: 0,
        };
      }

      // Get pending operations sorted by priority
      const pendingOps = Array.from(this.operations.values())
        .filter(op => op.status === SyncStatus.PENDING || op.status === SyncStatus.FAILED)
        .sort((a, b) => this.strategy.getPriority(b) - this.strategy.getPriority(a));

      if (pendingOps.length === 0) {
        console.log('No pending operations to sync');
        store.setSyncStatus({ connected: true, syncing: false });
        return {
          success: true,
          operationsProcessed: 0,
          operationsSuccessful: 0,
          operationsFailed: 0,
          errors: [],
          conflictsResolved: 0,
        };
      }

      console.log(`Starting sync of ${pendingOps.length} operations`);

      let successful = 0;
      let failed = 0;
      let conflictsResolved = 0;
      const errors: string[] = [];

      // Process operations
      for (const operation of pendingOps) {
        try {
          operation.status = SyncStatus.IN_PROGRESS;
          await this.persistOperations();

          const result = await this.processOperation(operation);
          
          if (result.success) {
            operation.status = SyncStatus.COMPLETED;
            successful++;
            
            if (result.conflictResolved) {
              conflictsResolved++;
            }

            // Remove completed operation
            this.operations.delete(operation.id);
            store.removePendingOperation(operation.id);
          } else {
            operation.status = SyncStatus.FAILED;
            operation.retries++;
            operation.lastError = result.error;
            failed++;
            errors.push(`${operation.entity}:${operation.entityId} - ${result.error}`);

            // Remove if max retries exceeded
            if (operation.retries >= operation.maxRetries) {
              console.error(`Operation ${operation.id} exceeded max retries, removing`);
              this.operations.delete(operation.id);
              store.removePendingOperation(operation.id);
            } else {
              // Schedule retry
              operation.status = SyncStatus.PENDING;
              console.log(`Scheduling retry ${operation.retries}/${operation.maxRetries} for operation ${operation.id}`);
            }
          }

          await this.persistOperations();

        } catch (error) {
          operation.status = SyncStatus.FAILED;
          operation.retries++;
          operation.lastError = (error as Error).message;
          failed++;
          errors.push(`${operation.entity}:${operation.entityId} - ${(error as Error).message}`);

          errorManager.handleError(error as Error, {
            context: 'sync_operation',
            operationId: operation.id,
            entityType: operation.entity,
          });

          await this.persistOperations();
        }
      }

      const result: SyncResult = {
        success: errors.length === 0,
        operationsProcessed: pendingOps.length,
        operationsSuccessful: successful,
        operationsFailed: failed,
        errors,
        conflictsResolved,
      };

      // Update store
      store.setSyncStatus({
        connected: true,
        syncing: false,
        lastError: errors.length > 0 ? errors[0] : null,
        pendingCount: this.operations.size,
      });

      store.setLastSyncTime(new Date());

      // Notify listeners
      this.notifyListeners(result);

      console.log('Sync completed:', result);
      return result;

    } catch (error) {
      const errorMessage = (error as Error).message;
      store.setSyncStatus({
        connected: false,
        syncing: false,
        lastError: errorMessage,
      });

      errorManager.handleError(error as Error, { context: 'sync_engine' });

      return {
        success: false,
        operationsProcessed: 0,
        operationsSuccessful: 0,
        operationsFailed: this.operations.size,
        errors: [errorMessage],
        conflictsResolved: 0,
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Process individual sync operation
  private async processOperation(operation: SyncOperation): Promise<{
    success: boolean;
    error?: string;
    conflictResolved?: boolean;
  }> {
    try {
      const key = `${operation.entity}/${operation.entityId}`;

      switch (operation.type) {
        case SyncOperationType.CREATE:
        case SyncOperationType.UPDATE:
          // Check for conflicts
          const existingResult = await this.cloudStorage.get(key);
          
          if (existingResult.success) {
            // Conflict detected
            const conflict: SyncConflict = {
              operation,
              localData: operation.data,
              cloudData: existingResult.data,
              resolution: 'local', // Will be determined by strategy
            };

            const resolvedData = await this.strategy.handleConflict(conflict);
            const setResult = await this.cloudStorage.set(key, resolvedData);
            
            if (!setResult.success) {
              throw new Error(`Failed to resolve conflict: ${setResult.error?.message}`);
            }

            return { success: true, conflictResolved: true };
          } else {
            // No conflict, simple create/update
            const setResult = await this.cloudStorage.set(key, operation.data);
            
            if (!setResult.success) {
              throw new Error(`Failed to sync: ${setResult.error?.message}`);
            }

            return { success: true };
          }

        case SyncOperationType.DELETE:
          const deleteResult = await this.cloudStorage.delete(key);
          
          if (!deleteResult.success) {
            throw new Error(`Failed to delete: ${deleteResult.error?.message}`);
          }

          return { success: true };

        default:
          throw new Error(`Unsupported operation type: ${operation.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // Force sync all local data to cloud
  async forceSyncAllData(): Promise<SyncResult> {
    try {
      // Get all local data
      const localKeys = await this.localStorage.keys();
      const operations: SyncOperation[] = [];

      for (const key of localKeys) {
        const dataResult = await this.localStorage.get(key);
        if (dataResult.success) {
          const [entity, entityId] = key.split('/');
          
          operations.push({
            id: `force_sync_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            type: SyncOperationType.UPDATE,
            entity,
            entityId,
            data: dataResult.data,
            localTimestamp: new Date(),
            status: SyncStatus.PENDING,
            retries: 0,
            maxRetries: 3,
            priority: 10, // High priority for force sync
          });
        }
      }

      // Queue all operations
      for (const op of operations) {
        this.operations.set(op.id, op);
      }

      await this.persistOperations();

      // Perform sync
      return this.sync();
    } catch (error) {
      errorManager.handleError(error as Error, { context: 'force_sync_all' });
      throw error;
    }
  }

  // Test cloud connectivity
  async testConnection(): Promise<Result<boolean>> {
    try {
      // Try a simple operation to test connectivity
      const testKey = `connectivity_test_${Date.now()}`;
      const testData = { timestamp: new Date().toISOString() };

      const setResult = await this.cloudStorage.set(testKey, testData);
      if (!setResult.success) {
        return setResult as Result<boolean>;
      }

      const getResult = await this.cloudStorage.get(testKey);
      if (!getResult.success) {
        return getResult as Result<boolean>;
      }

      // Cleanup test data
      await this.cloudStorage.delete(testKey);

      return success(true);
    } catch (error) {
      return failure(createError.network('Cloud connectivity test failed', error));
    }
  }

  // Get sync statistics
  getSyncStats(): {
    pendingOperations: number;
    failedOperations: number;
    lastSyncTime: Date | null;
    isRunning: boolean;
  } {
    const store = useAppStore.getState();
    const failed = Array.from(this.operations.values())
      .filter(op => op.status === SyncStatus.FAILED).length;

    return {
      pendingOperations: this.operations.size,
      failedOperations: failed,
      lastSyncTime: store.lastSyncTime,
      isRunning: this.isRunning,
    };
  }

  // Event listeners
  addSyncListener(listener: (result: SyncResult) => void): void {
    this.listeners.add(listener);
  }

  removeSyncListener(listener: (result: SyncResult) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(result: SyncResult): void {
    this.listeners.forEach(listener => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Persistence methods
  private async persistOperations(): Promise<void> {
    try {
      const operations = Array.from(this.operations.values());
      await this.localStorage.set('sync_operations', operations);
    } catch (error) {
      console.error('Failed to persist sync operations:', error);
    }
  }

  private async loadPendingOperations(): Promise<void> {
    try {
      const result = await this.localStorage.get<SyncOperation[]>('sync_operations');
      if (result.success) {
        result.data.forEach(op => {
          // Convert timestamp strings back to Date objects
          op.localTimestamp = new Date(op.localTimestamp);
          if (op.cloudTimestamp) {
            op.cloudTimestamp = new Date(op.cloudTimestamp);
          }
          
          // Reset in-progress operations to pending
          if (op.status === SyncStatus.IN_PROGRESS) {
            op.status = SyncStatus.PENDING;
          }
          
          this.operations.set(op.id, op);
        });

        console.log(`Loaded ${this.operations.size} pending sync operations`);
      }
    } catch (error) {
      console.error('Failed to load pending sync operations:', error);
    }
  }

  // Cleanup
  async destroy(): Promise<void> {
    this.stopAutoSync();
    await this.persistOperations();
    this.operations.clear();
    this.listeners.clear();
  }
}