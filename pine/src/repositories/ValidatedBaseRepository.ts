import { BaseRepository, QueryFilter, StorageAdapter } from './BaseRepository';
import { ValidationMiddleware } from '../validation/ValidationMiddleware';
import { Result, success, failure } from '../types';
import { createError, errorManager } from '../utils/errorHandling';

/**
 * Extended BaseRepository with integrated validation
 * Provides automatic validation for all repository operations
 */
export abstract class ValidatedBaseRepository<T extends { id: string }, K = string> extends BaseRepository<T, K> {
  protected validationMiddleware: ValidationMiddleware;
  protected abstract entityType: 'activity' | 'timeSlot' | 'dailyLog' | 'notificationSettings';

  constructor(
    localStorage: StorageAdapter,
    cloudStorage: StorageAdapter,
    cache?: any,
    validationConfig?: {
      enabled?: boolean;
      throwOnWarnings?: boolean;
      logValidationErrors?: boolean;
      logValidationWarnings?: boolean;
    }
  ) {
    super(localStorage, cloudStorage, cache);
    this.validationMiddleware = new ValidationMiddleware(validationConfig);
  }

  /**
   * Create entity with validation
   */
  async create(entity: Omit<T, 'id'>): Promise<Result<T>> {
    try {
      // Validate entity before creation
      const validationResult = await this.validateForOperation(entity, 'create');
      if (!validationResult.success) {
        return validationResult as Result<T>;
      }

      // Call parent create method
      return super.create(validationResult.data);
    } catch (error) {
      const appError = createError.unknown('Failed to create entity with validation', error);
      errorManager.handleError(appError, { entityType: this.entityType });
      return failure(appError);
    }
  }

  /**
   * Update entity with validation
   */
  async update(id: K, updates: Partial<Omit<T, 'id'>>): Promise<Result<T>> {
    try {
      // Get existing entity for complete validation
      const existingResult = await super.findById(id);
      if (!existingResult.success) {
        return existingResult;
      }

      const updatedEntity = { ...existingResult.data, ...updates };
      
      // Validate updated entity
      const validationResult = await this.validateForOperation(updatedEntity, 'update');
      if (!validationResult.success) {
        return validationResult as Result<T>;
      }

      // Call parent update method
      return super.update(id, updates);
    } catch (error) {
      const appError = createError.unknown('Failed to update entity with validation', error);
      errorManager.handleError(appError, { entityType: this.entityType, entityId: id });
      return failure(appError);
    }
  }

  /**
   * Find entity by ID with validation
   */
  async findById(id: K): Promise<Result<T>> {
    try {
      const result = await super.findById(id);
      
      if (result.success) {
        // Validate retrieved entity
        const validationResult = await this.validateForOperation(result.data, 'read');
        if (!validationResult.success) {
          // Log validation error but don't fail the operation for existing data
          console.warn(`Retrieved ${this.entityType} failed validation:`, validationResult.error?.message);
          
          // Return original data with warning
          return result;
        }
      }
      
      return result;
    } catch (error) {
      const appError = createError.unknown('Failed to find entity with validation', error);
      errorManager.handleError(appError, { entityType: this.entityType, entityId: id });
      return failure(appError);
    }
  }

  /**
   * Find all entities with validation
   */
  async findAll(filters?: QueryFilter): Promise<Result<T[]>> {
    try {
      const result = await super.findAll(filters);
      
      if (result.success && result.data.length > 0) {
        // Validate all retrieved entities
        const validatedEntities: T[] = [];
        const invalidEntities: Array<{ entity: T; error: string }> = [];
        
        for (const entity of result.data) {
          const validationResult = await this.validateForOperation(entity, 'read');
          if (validationResult.success) {
            validatedEntities.push(entity);
          } else {
            invalidEntities.push({
              entity,
              error: validationResult.error?.message || 'Unknown validation error'
            });
          }
        }
        
        // Log invalid entities but don't fail the operation
        if (invalidEntities.length > 0) {
          console.warn(`Found ${invalidEntities.length} invalid ${this.entityType} entities:`, 
                      invalidEntities.map(item => ({ id: item.entity.id, error: item.error })));
        }
        
        // Return valid entities only
        return success(validatedEntities);
      }
      
      return result;
    } catch (error) {
      const appError = createError.unknown('Failed to find entities with validation', error);
      errorManager.handleError(appError, { entityType: this.entityType });
      return failure(appError);
    }
  }

  /**
   * Bulk create entities with validation
   */
  async bulkCreate(entities: Array<Omit<T, 'id'>>): Promise<Result<T[]>> {
    try {
      // Validate all entities before creation
      const validationEntities = entities.map((entity, index) => ({
        type: this.entityType,
        data: entity,
        operation: 'create' as const,
        context: `bulk_create_${index}`
      }));

      const batchValidationResult = await this.validationMiddleware.validateBatch(validationEntities);
      if (!batchValidationResult.success) {
        return batchValidationResult as Result<T[]>;
      }

      // Proceed with bulk creation using parent method
      const results: T[] = [];
      for (const entity of entities) {
        const createResult = await super.create(entity);
        if (createResult.success) {
          results.push(createResult.data);
        } else {
          // If any creation fails, return the error
          return createResult as Result<T[]>;
        }
      }

      return success(results);
    } catch (error) {
      const appError = createError.unknown('Failed to bulk create entities with validation', error);
      errorManager.handleError(appError, { entityType: this.entityType, count: entities.length });
      return failure(appError);
    }
  }

  /**
   * Bulk update entities with validation
   */
  async bulkUpdate(updates: Array<{ id: K; updates: Partial<Omit<T, 'id'>> }>): Promise<Result<T[]>> {
    try {
      // Get all existing entities and prepare for validation
      const validationData: Array<{
        type: 'activity' | 'timeSlot' | 'dailyLog' | 'notificationSettings';
        data: any;
        operation: 'update';
        context: string;
      }> = [];

      for (const { id, updates: entityUpdates } of updates) {
        const existingResult = await super.findById(id);
        if (!existingResult.success) {
          return existingResult as Result<T[]>;
        }

        const updatedEntity = { ...existingResult.data, ...entityUpdates };
        validationData.push({
          type: this.entityType,
          data: updatedEntity,
          operation: 'update',
          context: `bulk_update_${id}`
        });
      }

      // Validate all updates
      const batchValidationResult = await this.validationMiddleware.validateBatch(validationData);
      if (!batchValidationResult.success) {
        return batchValidationResult as Result<T[]>;
      }

      // Proceed with bulk updates using parent method
      const results: T[] = [];
      for (const { id, updates: entityUpdates } of updates) {
        const updateResult = await super.update(id, entityUpdates);
        if (updateResult.success) {
          results.push(updateResult.data);
        } else {
          // If any update fails, return the error
          return updateResult as Result<T[]>;
        }
      }

      return success(results);
    } catch (error) {
      const appError = createError.unknown('Failed to bulk update entities with validation', error);
      errorManager.handleError(appError, { entityType: this.entityType, count: updates.length });
      return failure(appError);
    }
  }

  /**
   * Validate entity for specific operation
   */
  private async validateForOperation(data: any, operation: 'create' | 'update' | 'read'): Promise<Result<any>> {
    switch (this.entityType) {
      case 'activity':
        return this.validationMiddleware.validateActivity(data, operation);
      case 'timeSlot':
        return this.validationMiddleware.validateTimeSlot(data, operation);
      case 'dailyLog':
        return this.validationMiddleware.validateDailyLog(data, operation);
      case 'notificationSettings':
        return this.validationMiddleware.validateNotificationSettings(data, operation);
      default:
        return success(data);
    }
  }

  /**
   * Get validation configuration
   */
  getValidationConfig() {
    return this.validationMiddleware.getConfig();
  }

  /**
   * Update validation configuration
   */
  updateValidationConfig(config: {
    enabled?: boolean;
    throwOnWarnings?: boolean;
    logValidationErrors?: boolean;
    logValidationWarnings?: boolean;
  }): void {
    this.validationMiddleware.updateConfig(config);
  }

  /**
   * Manually validate an entity
   */
  async validateEntity(entity: T, operation: 'create' | 'update' | 'read' = 'read'): Promise<Result<T>> {
    return this.validateForOperation(entity, operation);
  }
}