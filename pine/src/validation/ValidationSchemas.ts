import { Activity, TimeSlot, DailyLog, NotificationSettings } from '../types';

/**
 * Comprehensive validation schemas for all data entities
 * Provides runtime validation to ensure data integrity across the application
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationRule<T> {
  name: string;
  validate: (value: T) => { isValid: boolean; message?: string };
  severity: 'error' | 'warning';
}

/**
 * Base validation utilities
 */
export class ValidationUtils {
  static isString(value: any): value is string {
    return typeof value === 'string';
  }

  static isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  static isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
  }

  static isDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isArray(value: any): value is Array<any> {
    return Array.isArray(value);
  }

  static isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static isValidDateString(dateStr: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date.toISOString().substring(0, 10) === dateStr;
  }
}

/**
 * Activity validation schema
 */
export class ActivityValidator {
  private static rules: ValidationRule<Partial<Activity>>[] = [
    {
      name: 'id_required',
      validate: (activity) => ({
        isValid: ValidationUtils.isString(activity.id) && !ValidationUtils.isEmpty(activity.id),
        message: 'Activity ID is required and must be a non-empty string'
      }),
      severity: 'error'
    },
    {
      name: 'name_required',
      validate: (activity) => ({
        isValid: ValidationUtils.isString(activity.name) && activity.name.trim().length > 0,
        message: 'Activity name is required and must be a non-empty string'
      }),
      severity: 'error'
    },
    {
      name: 'name_length',
      validate: (activity) => ({
        isValid: !activity.name || activity.name.length <= 100,
        message: 'Activity name must be 100 characters or less'
      }),
      severity: 'error'
    },
    {
      name: 'hourly_value_type',
      validate: (activity) => ({
        isValid: ValidationUtils.isNumber(activity.hourlyValue),
        message: 'Hourly value must be a number'
      }),
      severity: 'error'
    },
    {
      name: 'hourly_value_range',
      validate: (activity) => ({
        isValid: !ValidationUtils.isNumber(activity.hourlyValue) || activity.hourlyValue >= -10000,
        message: 'Hourly value must be greater than or equal to -10000'
      }),
      severity: 'error'
    },
    {
      name: 'block_value_calculation',
      validate: (activity) => {
        if (!ValidationUtils.isNumber(activity.hourlyValue) || !ValidationUtils.isNumber(activity.blockValue)) {
          return { isValid: true }; // Skip if values are not numbers
        }
        const expectedBlockValue = activity.hourlyValue / 2;
        const isValid = Math.abs(activity.blockValue - expectedBlockValue) < 0.01;
        return {
          isValid,
          message: 'Block value must be exactly half of hourly value'
        };
      },
      severity: 'error'
    },
    {
      name: 'category_required',
      validate: (activity) => ({
        isValid: ValidationUtils.isString(activity.category) && activity.category.trim().length > 0,
        message: 'Category is required and must be a non-empty string'
      }),
      severity: 'error'
    },
    {
      name: 'search_tags_type',
      validate: (activity) => ({
        isValid: !activity.searchTags || (ValidationUtils.isArray(activity.searchTags) && 
          activity.searchTags.every(tag => ValidationUtils.isString(tag))),
        message: 'Search tags must be an array of strings'
      }),
      severity: 'error'
    },
    {
      name: 'search_tags_count',
      validate: (activity) => ({
        isValid: !activity.searchTags || activity.searchTags.length <= 20,
        message: 'Maximum 20 search tags allowed'
      }),
      severity: 'warning'
    }
  ];

  static validate(activity: Partial<Activity>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.rules.forEach(rule => {
      const result = rule.validate(activity);
      if (!result.isValid && result.message) {
        if (rule.severity === 'error') {
          errors.push(result.message);
        } else {
          warnings.push(result.message);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  static validateForCreation(activity: Omit<Activity, 'id'>): ValidationResult {
    // For creation, we don't require ID
    const activityWithTempId = { ...activity, id: 'temp' };
    const result = this.validate(activityWithTempId);
    
    // Remove ID error if it exists
    result.errors = result.errors.filter(error => !error.includes('Activity ID'));
    result.isValid = result.errors.length === 0;
    
    return result;
  }
}

/**
 * TimeSlot validation schema
 */
export class TimeSlotValidator {
  private static rules: ValidationRule<Partial<TimeSlot>>[] = [
    {
      name: 'id_required',
      validate: (timeSlot) => ({
        isValid: ValidationUtils.isString(timeSlot.id) && !ValidationUtils.isEmpty(timeSlot.id),
        message: 'TimeSlot ID is required and must be a non-empty string'
      }),
      severity: 'error'
    },
    {
      name: 'start_time_required',
      validate: (timeSlot) => ({
        isValid: ValidationUtils.isDate(timeSlot.startTime),
        message: 'Start time is required and must be a valid Date object'
      }),
      severity: 'error'
    },
    {
      name: 'end_time_required',
      validate: (timeSlot) => ({
        isValid: ValidationUtils.isDate(timeSlot.endTime),
        message: 'End time is required and must be a valid Date object'
      }),
      severity: 'error'
    },
    {
      name: 'time_order',
      validate: (timeSlot) => {
        if (!ValidationUtils.isDate(timeSlot.startTime) || !ValidationUtils.isDate(timeSlot.endTime)) {
          return { isValid: true }; // Skip if dates are invalid
        }
        return {
          isValid: timeSlot.startTime < timeSlot.endTime,
          message: 'Start time must be before end time'
        };
      },
      severity: 'error'
    },
    {
      name: 'duration_30_minutes',
      validate: (timeSlot) => {
        if (!ValidationUtils.isDate(timeSlot.startTime) || !ValidationUtils.isDate(timeSlot.endTime)) {
          return { isValid: true }; // Skip if dates are invalid
        }
        const durationMinutes = (timeSlot.endTime.getTime() - timeSlot.startTime.getTime()) / (1000 * 60);
        return {
          isValid: Math.abs(durationMinutes - 30) < 0.1, // Allow small floating point differences
          message: 'Time slot duration must be exactly 30 minutes'
        };
      },
      severity: 'error'
    },
    {
      name: 'value_type',
      validate: (timeSlot) => ({
        isValid: ValidationUtils.isNumber(timeSlot.value),
        message: 'Value must be a number'
      }),
      severity: 'error'
    },
    {
      name: 'value_non_negative',
      validate: (timeSlot) => ({
        isValid: !ValidationUtils.isNumber(timeSlot.value) || timeSlot.value >= -10000,
        message: 'Value must be greater than or equal to -10000'
      }),
      severity: 'error'
    },
    {
      name: 'is_logged_type',
      validate: (timeSlot) => ({
        isValid: ValidationUtils.isBoolean(timeSlot.isLogged),
        message: 'isLogged must be a boolean'
      }),
      severity: 'error'
    },
    {
      name: 'activity_consistency',
      validate: (timeSlot) => {
        if (!timeSlot.activity) {
          // If no activity, value should be 0 and isLogged should be false
          const valueIsZero = timeSlot.value === 0;
          const notLogged = timeSlot.isLogged === false;
          return {
            isValid: valueIsZero && notLogged,
            message: 'Time slot without activity must have value 0 and isLogged false'
          };
        } else {
          // If has activity, value should match activity's block value
          const valueMatches = timeSlot.value === timeSlot.activity.blockValue;
          return {
            isValid: valueMatches,
            message: 'Time slot value must match activity block value'
          };
        }
      },
      severity: 'error'
    },
    {
      name: 'activity_validation',
      validate: (timeSlot) => {
        if (!timeSlot.activity) return { isValid: true };
        
        const activityValidation = ActivityValidator.validate(timeSlot.activity);
        return {
          isValid: activityValidation.isValid,
          message: activityValidation.errors[0] || 'Associated activity is invalid'
        };
      },
      severity: 'error'
    }
  ];

  static validate(timeSlot: Partial<TimeSlot>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.rules.forEach(rule => {
      const result = rule.validate(timeSlot);
      if (!result.isValid && result.message) {
        if (rule.severity === 'error') {
          errors.push(result.message);
        } else {
          warnings.push(result.message);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  static validateForCreation(timeSlot: Omit<TimeSlot, 'id'>): ValidationResult {
    // For creation, we don't require ID
    const timeSlotWithTempId = { ...timeSlot, id: 'temp' };
    const result = this.validate(timeSlotWithTempId);
    
    // Remove ID error if it exists
    result.errors = result.errors.filter(error => !error.includes('TimeSlot ID'));
    result.isValid = result.errors.length === 0;
    
    return result;
  }
}

/**
 * DailyLog validation schema
 */
export class DailyLogValidator {
  private static rules: ValidationRule<Partial<DailyLog>>[] = [
    {
      name: 'date_format',
      validate: (dailyLog) => ({
        isValid: ValidationUtils.isString(dailyLog.date) && ValidationUtils.isValidDateString(dailyLog.date),
        message: 'Date must be a valid date string in YYYY-MM-DD format'
      }),
      severity: 'error'
    },
    {
      name: 'time_slots_type',
      validate: (dailyLog) => ({
        isValid: ValidationUtils.isArray(dailyLog.timeSlots),
        message: 'Time slots must be an array'
      }),
      severity: 'error'
    },
    {
      name: 'total_value_type',
      validate: (dailyLog) => ({
        isValid: ValidationUtils.isNumber(dailyLog.totalValue),
        message: 'Total value must be a number'
      }),
      severity: 'error'
    },
    {
      name: 'activity_count_type',
      validate: (dailyLog) => ({
        isValid: ValidationUtils.isNumber(dailyLog.activityCount) && dailyLog.activityCount >= 0,
        message: 'Activity count must be a non-negative number'
      }),
      severity: 'error'
    },
    {
      name: 'completed_slots_type',
      validate: (dailyLog) => ({
        isValid: ValidationUtils.isNumber(dailyLog.completedSlots) && dailyLog.completedSlots >= 0,
        message: 'Completed slots must be a non-negative number'
      }),
      severity: 'error'
    },
    {
      name: 'calculation_consistency',
      validate: (dailyLog) => {
        if (!ValidationUtils.isArray(dailyLog.timeSlots)) return { isValid: true };
        
        const calculatedTotal = dailyLog.timeSlots.reduce((sum: number, slot: TimeSlot) => sum + (slot.value || 0), 0);
        const calculatedActivityCount = dailyLog.timeSlots.filter((slot: TimeSlot) => slot.activity).length;
        const calculatedCompletedSlots = dailyLog.timeSlots.filter((slot: TimeSlot) => slot.isLogged).length;
        
        const totalMatches = Math.abs(calculatedTotal - (dailyLog.totalValue || 0)) < 0.01;
        const activityCountMatches = calculatedActivityCount === dailyLog.activityCount;
        const completedSlotsMatches = calculatedCompletedSlots === dailyLog.completedSlots;
        
        return {
          isValid: totalMatches && activityCountMatches && completedSlotsMatches,
          message: 'Calculated values do not match provided totals'
        };
      },
      severity: 'warning'
    }
  ];

  static validate(dailyLog: Partial<DailyLog>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.rules.forEach(rule => {
      const result = rule.validate(dailyLog);
      if (!result.isValid && result.message) {
        if (rule.severity === 'error') {
          errors.push(result.message);
        } else {
          warnings.push(result.message);
        }
      }
    });

    // Validate each time slot
    if (ValidationUtils.isArray(dailyLog.timeSlots)) {
      dailyLog.timeSlots.forEach((slot: TimeSlot, index: number) => {
        const slotValidation = TimeSlotValidator.validate(slot);
        if (!slotValidation.isValid) {
          errors.push(`Time slot ${index}: ${slotValidation.errors[0]}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}

/**
 * NotificationSettings validation schema
 */
export class NotificationSettingsValidator {
  private static rules: ValidationRule<Partial<NotificationSettings>>[] = [
    {
      name: 'enabled_type',
      validate: (settings) => ({
        isValid: ValidationUtils.isBoolean(settings.enabled),
        message: 'Enabled must be a boolean'
      }),
      severity: 'error'
    },
    {
      name: 'start_time_format',
      validate: (settings) => ({
        isValid: !settings.startTime || ValidationUtils.isValidTimeFormat(settings.startTime),
        message: 'Start time must be in HH:MM format'
      }),
      severity: 'error'
    },
    {
      name: 'end_time_format',
      validate: (settings) => ({
        isValid: !settings.endTime || ValidationUtils.isValidTimeFormat(settings.endTime),
        message: 'End time must be in HH:MM format'
      }),
      severity: 'error'
    },
    {
      name: 'time_order',
      validate: (settings) => {
        if (!settings.startTime || !settings.endTime) return { isValid: true };
        
        const [startHour, startMinute] = settings.startTime.split(':').map(Number);
        const [endHour, endMinute] = settings.endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        
        return {
          isValid: startMinutes < endMinutes,
          message: 'Start time must be before end time'
        };
      },
      severity: 'error'
    },
    {
      name: 'skip_filled_slots_type',
      validate: (settings) => ({
        isValid: !settings.skipFilledSlots || ValidationUtils.isBoolean(settings.skipFilledSlots),
        message: 'Skip filled slots must be a boolean'
      }),
      severity: 'error'
    }
  ];

  static validate(settings: Partial<NotificationSettings>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.rules.forEach(rule => {
      const result = rule.validate(settings);
      if (!result.isValid && result.message) {
        if (rule.severity === 'error') {
          errors.push(result.message);
        } else {
          warnings.push(result.message);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }
}

/**
 * Composite validator for validating multiple entities at once
 */
export class CompositeValidator {
  static validateActivity = ActivityValidator.validate;
  static validateActivityForCreation = ActivityValidator.validateForCreation;
  static validateTimeSlot = TimeSlotValidator.validate;
  static validateTimeSlotForCreation = TimeSlotValidator.validateForCreation;
  static validateDailyLog = DailyLogValidator.validate;
  static validateNotificationSettings = NotificationSettingsValidator.validate;

  /**
   * Validate multiple entities of different types
   */
  static validateBatch(entities: Array<{
    type: 'activity' | 'timeSlot' | 'dailyLog' | 'notificationSettings';
    data: any;
    context?: string;
  }>): { isValid: boolean; results: Array<{ context: string; validation: ValidationResult }> } {
    const results: Array<{ context: string; validation: ValidationResult }> = [];
    let overallValid = true;

    entities.forEach((entity, index) => {
      const context = entity.context || `${entity.type}_${index}`;
      let validation: ValidationResult;

      switch (entity.type) {
        case 'activity':
          validation = ActivityValidator.validate(entity.data);
          break;
        case 'timeSlot':
          validation = TimeSlotValidator.validate(entity.data);
          break;
        case 'dailyLog':
          validation = DailyLogValidator.validate(entity.data);
          break;
        case 'notificationSettings':
          validation = NotificationSettingsValidator.validate(entity.data);
          break;
        default:
          validation = { isValid: false, errors: [`Unknown entity type: ${entity.type}`] };
      }

      results.push({ context, validation });
      if (!validation.isValid) {
        overallValid = false;
      }
    });

    return { isValid: overallValid, results };
  }
}