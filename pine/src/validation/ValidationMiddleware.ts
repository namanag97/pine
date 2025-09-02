import { EnhancedAppError, createError, errorManager } from '../utils/errorHandling';
import { Result, success, failure } from '../types';
import { CompositeValidator, ValidationResult } from './ValidationSchemas';

/**
 * Validation Middleware - Intercepts data operations to ensure validation
 * Integrates with repository pattern to provide automatic validation
 */

export interface ValidationConfig {
  enabled: boolean;
  throwOnWarnings: boolean;
  logValidationErrors: boolean;
  logValidationWarnings: boolean;
}

const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enabled: true,
  throwOnWarnings: false,
  logValidationErrors: true,
  logValidationWarnings: true,
};

export class ValidationMiddleware {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_VALIDATION_CONFIG, ...config };
  }

  /**
   * Validate activity data before operations
   */
  async validateActivity<T>(
    data: T,
    operation: 'create' | 'update' | 'read',
    context?: string
  ): Promise<Result<T>> {
    if (!this.config.enabled) return success(data);

    try {
      let validation: ValidationResult;
      
      if (operation === 'create') {
        validation = CompositeValidator.validateActivityForCreation(data as any);
      } else {
        validation = CompositeValidator.validateActivity(data as any);
      }

      return this.processValidationResult(validation, data, 'Activity', context);
    } catch (error) {
      const appError = createError.validation('Activity validation failed', error);
      if (this.config.logValidationErrors) {
        errorManager.handleError(appError, { context, operation });
      }
      return failure(appError);
    }
  }

  /**
   * Validate time slot data before operations
   */
  async validateTimeSlot<T>(
    data: T,
    operation: 'create' | 'update' | 'read',
    context?: string
  ): Promise<Result<T>> {
    if (!this.config.enabled) return success(data);

    try {
      let validation: ValidationResult;
      
      if (operation === 'create') {
        validation = CompositeValidator.validateTimeSlotForCreation(data as any);
      } else {
        validation = CompositeValidator.validateTimeSlot(data as any);
      }

      return this.processValidationResult(validation, data, 'TimeSlot', context);
    } catch (error) {
      const appError = createError.validation('TimeSlot validation failed', error);
      if (this.config.logValidationErrors) {
        errorManager.handleError(appError, { context, operation });
      }
      return failure(appError);
    }
  }

  /**
   * Validate daily log data before operations
   */
  async validateDailyLog<T>(
    data: T,
    operation: 'create' | 'update' | 'read',
    context?: string
  ): Promise<Result<T>> {
    if (!this.config.enabled) return success(data);

    try {
      const validation = CompositeValidator.validateDailyLog(data as any);
      return this.processValidationResult(validation, data, 'DailyLog', context);
    } catch (error) {
      const appError = createError.validation('DailyLog validation failed', error);
      if (this.config.logValidationErrors) {
        errorManager.handleError(appError, { context, operation });
      }
      return failure(appError);
    }
  }

  /**
   * Validate notification settings data before operations
   */
  async validateNotificationSettings<T>(
    data: T,
    operation: 'create' | 'update' | 'read',
    context?: string
  ): Promise<Result<T>> {
    if (!this.config.enabled) return success(data);

    try {
      const validation = CompositeValidator.validateNotificationSettings(data as any);
      return this.processValidationResult(validation, data, 'NotificationSettings', context);
    } catch (error) {
      const appError = createError.validation('NotificationSettings validation failed', error);
      if (this.config.logValidationErrors) {
        errorManager.handleError(appError, { context, operation });
      }
      return failure(appError);
    }
  }

  /**
   * Batch validate multiple entities
   */
  async validateBatch(entities: Array<{
    type: 'activity' | 'timeSlot' | 'dailyLog' | 'notificationSettings';
    data: any;
    operation: 'create' | 'update' | 'read';
    context?: string;
  }>): Promise<Result<any[]>> {
    if (!this.config.enabled) return success(entities.map(e => e.data));

    try {
      const validationEntities = entities.map(entity => ({
        type: entity.type,
        data: entity.data,
        context: entity.context || `${entity.type}_${entity.operation}`,
      }));

      const batchResult = CompositeValidator.validateBatch(validationEntities);
      
      if (!batchResult.isValid) {
        const allErrors: string[] = [];
        const allWarnings: string[] = [];

        batchResult.results.forEach(result => {
          if (result.validation.errors.length > 0) {
            allErrors.push(`${result.context}: ${result.validation.errors.join(', ')}`);
          }
          if (result.validation.warnings && result.validation.warnings.length > 0) {
            allWarnings.push(`${result.context}: ${result.validation.warnings.join(', ')}`);
          }
        });

        if (this.config.logValidationErrors && allErrors.length > 0) {
          const errorMessage = `Batch validation failed: ${allErrors.join('; ')}`;
          errorManager.handleError(createError.validation(errorMessage), { 
            batchSize: entities.length,
            errorCount: allErrors.length 
          });
        }

        if (this.config.logValidationWarnings && allWarnings.length > 0) {
          console.warn('Batch validation warnings:', allWarnings.join('; '));
        }

        const appError = createError.validation(`Batch validation failed: ${allErrors[0]}`, {
          errors: allErrors,
          warnings: allWarnings,
        });

        return failure(appError);
      }

      if (this.config.logValidationWarnings) {
        const allWarnings: string[] = [];
        batchResult.results.forEach(result => {
          if (result.validation.warnings && result.validation.warnings.length > 0) {
            allWarnings.push(`${result.context}: ${result.validation.warnings.join(', ')}`);
          }
        });

        if (allWarnings.length > 0) {
          console.warn('Batch validation warnings:', allWarnings.join('; '));
        }
      }

      return success(entities.map(e => e.data));
    } catch (error) {
      const appError = createError.validation('Batch validation failed', error);
      if (this.config.logValidationErrors) {
        errorManager.handleError(appError, { batchSize: entities.length });
      }
      return failure(appError);
    }
  }

  /**
   * Process validation result and handle errors/warnings
   */
  private processValidationResult<T>(
    validation: ValidationResult,
    data: T,
    entityType: string,
    context?: string
  ): Result<T> {
    if (!validation.isValid) {
      const errorMessage = `${entityType} validation failed: ${validation.errors.join(', ')}`;
      
      if (this.config.logValidationErrors) {
        errorManager.handleError(createError.validation(errorMessage), { 
          context, 
          entityType,
          errors: validation.errors 
        });
      }

      const appError = createError.validation(errorMessage, {
        entityType,
        context,
        errors: validation.errors,
        warnings: validation.warnings,
      });

      return failure(appError);
    }

    // Handle warnings
    if (validation.warnings && validation.warnings.length > 0) {
      if (this.config.logValidationWarnings) {
        console.warn(`${entityType} validation warnings:`, validation.warnings.join(', '));
      }

      if (this.config.throwOnWarnings) {
        const warningMessage = `${entityType} validation warnings: ${validation.warnings.join(', ')}`;
        const appError = createError.validation(warningMessage, {
          entityType,
          context,
          warnings: validation.warnings,
        });
        return failure(appError);
      }
    }

    return success(data);
  }

  /**
   * Update validation configuration
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current validation configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }
}

/**
 * Repository validation decorator
 * Adds automatic validation to repository operations
 */
export function withValidation<T extends { new(...args: any[]): {} }>(
  validationMiddleware: ValidationMiddleware,
  entityType: 'activity' | 'timeSlot' | 'dailyLog' | 'notificationSettings'
) {
  return function (constructor: T) {
    return class extends constructor {
      async create(data: any): Promise<Result<any>> {
        // Validate before creation
        const validationResult = await this.validateForOperation(data, 'create');
        if (!validationResult.success) {
          return validationResult;
        }

        // Call original create method
        return super.create(validationResult.data);
      }

      async update(id: string, data: any): Promise<Result<any>> {
        // Validate before update
        const validationResult = await this.validateForOperation(data, 'update');
        if (!validationResult.success) {
          return validationResult;
        }

        // Call original update method
        return super.update(id, validationResult.data);
      }

      async findById(id: string): Promise<Result<any>> {
        // Call original findById method
        const result = await super.findById(id);
        
        if (result.success) {
          // Validate retrieved data
          const validationResult = await this.validateForOperation(result.data, 'read');
          return validationResult.success ? result : validationResult;
        }

        return result;
      }

      private async validateForOperation(data: any, operation: 'create' | 'update' | 'read'): Promise<Result<any>> {
        switch (entityType) {
          case 'activity':
            return validationMiddleware.validateActivity(data, operation);
          case 'timeSlot':
            return validationMiddleware.validateTimeSlot(data, operation);
          case 'dailyLog':
            return validationMiddleware.validateDailyLog(data, operation);
          case 'notificationSettings':
            return validationMiddleware.validateNotificationSettings(data, operation);
          default:
            return success(data);
        }
      }
    };
  };
}

// Global validation middleware instance
export const globalValidationMiddleware = new ValidationMiddleware();

// Convenience validation functions
export const validateActivity = (data: any, operation: 'create' | 'update' | 'read' = 'create', context?: string) =>
  globalValidationMiddleware.validateActivity(data, operation, context);

export const validateTimeSlot = (data: any, operation: 'create' | 'update' | 'read' = 'create', context?: string) =>
  globalValidationMiddleware.validateTimeSlot(data, operation, context);

export const validateDailyLog = (data: any, operation: 'create' | 'update' | 'read' = 'create', context?: string) =>
  globalValidationMiddleware.validateDailyLog(data, operation, context);

export const validateNotificationSettings = (data: any, operation: 'create' | 'update' | 'read' = 'create', context?: string) =>
  globalValidationMiddleware.validateNotificationSettings(data, operation, context);