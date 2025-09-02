import { AppError, Result, success, failure } from '../types';

// Generic Repository Interface
export interface Repository<T, K = string> {
  findById(id: K): Promise<Result<T>>;
  findAll(filters?: QueryFilter): Promise<Result<T[]>>;
  create(entity: Omit<T, 'id'>): Promise<Result<T>>;
  update(id: K, updates: Partial<T>): Promise<Result<T>>;
  delete(id: K): Promise<Result<void>>;
  exists(id: K): Promise<boolean>;
  count(filters?: QueryFilter): Promise<number>;
}

// Storage Adapter Interface
export interface StorageAdapter {
  get<T>(key: string): Promise<Result<T>>;
  set<T>(key: string, value: T): Promise<Result<void>>;
  delete(key: string): Promise<Result<void>>;
  exists(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  clear(): Promise<Result<void>>;
}

// Cache Manager Interface
export interface CacheManager {
  get<T>(key: string): Promise<Result<T>>;
  set<T>(key: string, value: T, ttl?: number): Promise<Result<void>>;
  delete(key: string): Promise<Result<void>>;
  clear(): Promise<Result<void>>;
  invalidate(pattern: string): Promise<Result<void>>;
}

// Query Filter Interface
export interface QueryFilter {
  [key: string]: any;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Base Repository Implementation
export abstract class BaseRepository<T extends { id: string }, K = string> implements Repository<T, K> {
  protected constructor(
    protected localStorage: StorageAdapter,
    protected cloudStorage: StorageAdapter,
    protected cache: CacheManager,
    protected entityName: string
  ) {}

  // Abstract methods that must be implemented by subclasses
  protected abstract validateEntity(entity: Partial<T>): Result<void>;
  protected abstract generateId(): string;
  protected abstract getStorageKey(id?: K): string;

  async findById(id: K): Promise<Result<T>> {
    try {
      const cacheKey = `${this.entityName}:${id}`;
      
      // 1. Check cache first
      const cached = await this.cache.get<T>(cacheKey);
      if (cached.success) {
        return cached;
      }

      // 2. Check local storage
      const storageKey = this.getStorageKey(id);
      const local = await this.localStorage.get<T>(storageKey);
      if (local.success) {
        // Cache the result
        await this.cache.set(cacheKey, local.data, 300000); // 5 minutes
        return local;
      }

      // 3. Fallback to cloud storage
      const cloud = await this.cloudStorage.get<T>(storageKey);
      if (cloud.success) {
        // Store locally and cache
        await this.localStorage.set(storageKey, cloud.data);
        await this.cache.set(cacheKey, cloud.data, 300000); // 5 minutes
        return cloud;
      }

      return failure(new AppError('NOT_FOUND', `${this.entityName} with id ${id} not found`));
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', `Failed to find ${this.entityName}`, error));
    }
  }

  async findAll(filters: QueryFilter = {}): Promise<Result<T[]>> {
    try {
      const cacheKey = `${this.entityName}:all:${JSON.stringify(filters)}`;
      
      // Check cache for frequent queries
      if (!filters.limit || filters.limit > 10) {
        const cached = await this.cache.get<T[]>(cacheKey);
        if (cached.success) {
          return cached;
        }
      }

      // Get from local storage first
      const localResult = await this.getEntitiesFromStorage(this.localStorage, filters);
      let entities = localResult.success ? localResult.data : [];

      // Try to merge with cloud data if connected
      try {
        const cloudResult = await this.getEntitiesFromStorage(this.cloudStorage, filters);
        if (cloudResult.success) {
          entities = this.mergeEntities(entities, cloudResult.data);
        }
      } catch (error) {
        // Cloud storage unavailable, continue with local data
        console.warn(`Cloud storage unavailable for ${this.entityName}:`, error.message);
      }

      // Apply filters and sorting
      const filtered = this.applyFilters(entities, filters);
      
      // Cache the result
      if (filtered.length <= 100) { // Don't cache very large results
        await this.cache.set(cacheKey, filtered, 60000); // 1 minute
      }

      return success(filtered);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', `Failed to find ${this.entityName} entities`, error));
    }
  }

  async create(entity: Omit<T, 'id'>): Promise<Result<T>> {
    try {
      // Validate entity
      const validation = this.validateEntity(entity);
      if (!validation.success) {
        return validation as Result<T>;
      }

      // Generate ID and create full entity
      const id = this.generateId();
      const fullEntity = { ...entity, id } as T;

      // Store locally first (optimistic)
      const localKey = this.getStorageKey(id as K);
      const localResult = await this.localStorage.set(localKey, fullEntity);
      if (!localResult.success) {
        return localResult as Result<T>;
      }

      // Cache the entity
      await this.cache.set(`${this.entityName}:${id}`, fullEntity, 300000); // 5 minutes

      // Try to sync to cloud (background)
      this.syncToCloud(fullEntity).catch(error => {
        console.error(`Failed to sync ${this.entityName} to cloud:`, error);
        // TODO: Add to pending sync queue
      });

      // Invalidate list cache
      await this.cache.invalidate(`${this.entityName}:all:*`);

      return success(fullEntity);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', `Failed to create ${this.entityName}`, error));
    }
  }

  async update(id: K, updates: Partial<T>): Promise<Result<T>> {
    try {
      // Get existing entity
      const existingResult = await this.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      // Merge updates
      const updatedEntity = { ...existingResult.data, ...updates };

      // Validate updated entity
      const validation = this.validateEntity(updatedEntity);
      if (!validation.success) {
        return validation as Result<T>;
      }

      // Store locally first (optimistic)
      const localKey = this.getStorageKey(id);
      const localResult = await this.localStorage.set(localKey, updatedEntity);
      if (!localResult.success) {
        return localResult as Result<T>;
      }

      // Update cache
      await this.cache.set(`${this.entityName}:${id}`, updatedEntity, 300000); // 5 minutes

      // Try to sync to cloud (background)
      this.syncToCloud(updatedEntity).catch(error => {
        console.error(`Failed to sync updated ${this.entityName} to cloud:`, error);
        // TODO: Add to pending sync queue
      });

      // Invalidate list cache
      await this.cache.invalidate(`${this.entityName}:all:*`);

      return success(updatedEntity);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', `Failed to update ${this.entityName}`, error));
    }
  }

  async delete(id: K): Promise<Result<void>> {
    try {
      // Delete from local storage
      const localKey = this.getStorageKey(id);
      const localResult = await this.localStorage.delete(localKey);
      if (!localResult.success) {
        return localResult;
      }

      // Remove from cache
      await this.cache.delete(`${this.entityName}:${id}`);

      // Try to delete from cloud (background)
      this.deleteFromCloud(id).catch(error => {
        console.error(`Failed to delete ${this.entityName} from cloud:`, error);
        // TODO: Add to pending sync queue
      });

      // Invalidate list cache
      await this.cache.invalidate(`${this.entityName}:all:*`);

      return success(undefined);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', `Failed to delete ${this.entityName}`, error));
    }
  }

  async exists(id: K): Promise<boolean> {
    try {
      const localKey = this.getStorageKey(id);
      const localExists = await this.localStorage.exists(localKey);
      
      if (localExists) {
        return true;
      }

      // Check cloud if not found locally
      const cloudExists = await this.cloudStorage.exists(localKey);
      return cloudExists;
    } catch (error) {
      console.error(`Failed to check existence of ${this.entityName}:`, error);
      return false;
    }
  }

  async count(filters: QueryFilter = {}): Promise<number> {
    try {
      const result = await this.findAll(filters);
      return result.success ? result.data.length : 0;
    } catch (error) {
      console.error(`Failed to count ${this.entityName}:`, error);
      return 0;
    }
  }

  // Protected helper methods
  protected async getEntitiesFromStorage(storage: StorageAdapter, filters: QueryFilter): Promise<Result<T[]>> {
    try {
      const pattern = `${this.entityName}:*`;
      const keys = await storage.keys(pattern);
      const entities: T[] = [];

      for (const key of keys) {
        const result = await storage.get<T>(key);
        if (result.success) {
          entities.push(result.data);
        }
      }

      return success(entities);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', `Failed to get ${this.entityName} from storage`, error));
    }
  }

  protected mergeEntities(local: T[], cloud: T[]): T[] {
    const merged = new Map<string, T>();

    // Add local entities first
    local.forEach(entity => merged.set(entity.id, entity));

    // Add cloud entities (will overwrite local if cloud is newer)
    cloud.forEach(entity => {
      const existing = merged.get(entity.id);
      if (!existing || this.isNewerEntity(entity, existing)) {
        merged.set(entity.id, entity);
      }
    });

    return Array.from(merged.values());
  }

  protected isNewerEntity(a: T, b: T): boolean {
    // Override this method to implement entity-specific comparison
    // Default: assume both are equal
    return false;
  }

  protected applyFilters(entities: T[], filters: QueryFilter): T[] {
    let filtered = [...entities];

    // Apply custom filters (override in subclasses)
    filtered = this.applyCustomFilters(filtered, filters);

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[filters.sortBy!];
        const bVal = (b as any)[filters.sortBy!];
        const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return filters.sortOrder === 'desc' ? -result : result;
      });
    }

    // Apply pagination
    if (filters.offset) {
      filtered = filtered.slice(filters.offset);
    }
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  protected applyCustomFilters(entities: T[], filters: QueryFilter): T[] {
    // Override in subclasses for entity-specific filtering
    return entities;
  }

  protected async syncToCloud(entity: T): Promise<Result<void>> {
    const key = this.getStorageKey(entity.id as K);
    return this.cloudStorage.set(key, entity);
  }

  protected async deleteFromCloud(id: K): Promise<Result<void>> {
    const key = this.getStorageKey(id);
    return this.cloudStorage.delete(key);
  }
}