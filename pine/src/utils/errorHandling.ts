import { AppError } from '../types';

// Enhanced Error Types
export enum ErrorCode {
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CACHE_ERROR = 'CACHE_ERROR',
  CACHE_MISS = 'CACHE_MISS',
  CACHE_EXPIRED = 'CACHE_EXPIRED',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SUPABASE_ERROR = 'SUPABASE_ERROR',
  SYNC_ERROR = 'SYNC_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Repository errors
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  
  // Service errors
  SERVICE_ERROR = 'SERVICE_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  
  // User errors
  USER_INPUT_ERROR = 'USER_INPUT_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE = 'INVALID_STATE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',        // Non-critical, user can continue
  MEDIUM = 'medium',  // Important, user should be aware
  HIGH = 'high',      // Critical, requires immediate attention
  CRITICAL = 'critical', // System failure, app may be unusable
}

// Enhanced AppError with more context
export class EnhancedAppError extends Error implements AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  readonly severity: ErrorSeverity;
  readonly recoverable: boolean;
  readonly userMessage?: string;
  readonly originalError?: Error;

  constructor(
    code: string,
    message: string,
    details?: unknown,
    options?: {
      context?: Record<string, unknown>;
      severity?: ErrorSeverity;
      recoverable?: boolean;
      userMessage?: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'EnhancedAppError';
    this.code = code;
    this.message = message;
    this.details = details;
    this.timestamp = new Date();
    this.context = options?.context;
    this.severity = options?.severity || ErrorSeverity.MEDIUM;
    this.recoverable = options?.recoverable ?? true;
    this.userMessage = options?.userMessage;
    this.originalError = options?.originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnhancedAppError);
    }
  }

  // Serialization for logging/storage
  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      severity: this.severity,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      stack: this.stack,
    };
  }

  // Create user-friendly message
  getUserMessage(): string {
    if (this.userMessage) {
      return this.userMessage;
    }

    // Default user messages based on error code
    switch (this.code) {
      case ErrorCode.NETWORK_ERROR:
        return 'Please check your internet connection and try again.';
      case ErrorCode.SUPABASE_ERROR:
        return 'Unable to sync data. Your changes are saved locally.';
      case ErrorCode.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      case ErrorCode.NOT_FOUND:
        return 'The requested item could not be found.';
      case ErrorCode.PERMISSION_DENIED:
        return 'You do not have permission to perform this action.';
      case ErrorCode.STORAGE_ERROR:
        return 'Unable to save data. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

// Error Factory Functions
export const createError = {
  unknown: (message: string, details?: unknown) =>
    new EnhancedAppError(ErrorCode.UNKNOWN_ERROR, message, details, { severity: ErrorSeverity.HIGH }),

  validation: (message: string, details?: unknown) =>
    new EnhancedAppError(ErrorCode.VALIDATION_ERROR, message, details, { 
      severity: ErrorSeverity.LOW,
      userMessage: 'Please check your input and try again.'
    }),

  storage: (message: string, details?: unknown) =>
    new EnhancedAppError(ErrorCode.STORAGE_ERROR, message, details, { severity: ErrorSeverity.HIGH }),

  network: (message: string, details?: unknown) =>
    new EnhancedAppError(ErrorCode.NETWORK_ERROR, message, details, { 
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Please check your internet connection and try again.'
    }),

  supabase: (message: string, details?: unknown) =>
    new EnhancedAppError(ErrorCode.SUPABASE_ERROR, message, details, { 
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Unable to sync data. Your changes are saved locally.'
    }),

  notFound: (resource: string) =>
    new EnhancedAppError(ErrorCode.NOT_FOUND, `${resource} not found`, undefined, { 
      severity: ErrorSeverity.LOW,
      userMessage: 'The requested item could not be found.'
    }),

  permission: (action: string) =>
    new EnhancedAppError(ErrorCode.PERMISSION_DENIED, `Permission denied: ${action}`, undefined, { 
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'You do not have permission to perform this action.'
    }),

  businessRule: (rule: string, details?: unknown) =>
    new EnhancedAppError(ErrorCode.BUSINESS_RULE_VIOLATION, `Business rule violation: ${rule}`, details, { 
      severity: ErrorSeverity.MEDIUM 
    }),

  timeout: (operation: string, timeoutMs: number) =>
    new EnhancedAppError(ErrorCode.TIMEOUT_ERROR, `Operation ${operation} timed out after ${timeoutMs}ms`, undefined, { 
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'The operation took too long. Please try again.'
    }),
};

// Error Handler Interface
export interface ErrorHandler {
  handle(error: EnhancedAppError, context?: Record<string, unknown>): void;
  canHandle(error: EnhancedAppError): boolean;
}

// Console Error Handler
export class ConsoleErrorHandler implements ErrorHandler {
  canHandle(_error: EnhancedAppError): boolean {
    return true; // Can handle all errors
  }

  handle(error: EnhancedAppError, context?: Record<string, unknown>): void {
    const logLevel = this.getLogLevel(error.severity);
    const logData = {
      ...error.toJSON(),
      handlerContext: context,
    };

    switch (logLevel) {
      case 'error':
        console.error(`[${error.code}] ${error.message}`, logData);
        break;
      case 'warn':
        console.warn(`[${error.code}] ${error.message}`, logData);
        break;
      default:
        console.log(`[${error.code}] ${error.message}`, logData);
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      default:
        return 'log';
    }
  }
}

// Toast/Alert Error Handler
export class UserNotificationErrorHandler implements ErrorHandler {
  canHandle(error: EnhancedAppError): boolean {
    return error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL;
  }

  handle(error: EnhancedAppError, _context?: Record<string, unknown>): void {
    // This would integrate with your toast/alert system
    // For now, we'll use a simple alert
    const userMessage = error.getUserMessage();
    
    if (error.severity === ErrorSeverity.CRITICAL) {
      // Show blocking error dialog
      console.error('CRITICAL ERROR:', userMessage);
    } else {
      // Show toast notification
      console.warn('ERROR NOTIFICATION:', userMessage);
    }
  }
}

// Analytics Error Handler
export class AnalyticsErrorHandler implements ErrorHandler {
  canHandle(_error: EnhancedAppError): boolean {
    return true; // Track all errors
  }

  handle(error: EnhancedAppError, context?: Record<string, unknown>): void {
    // This would integrate with your analytics service
    const eventData = {
      error_code: error.code,
      error_message: error.message,
      error_severity: error.severity,
      error_recoverable: error.recoverable,
      timestamp: error.timestamp.toISOString(),
      context,
    };

    console.log('ANALYTICS_EVENT: error_occurred', eventData);
  }
}

// Error Manager
export class ErrorManager {
  private handlers: ErrorHandler[] = [];
  private static instance: ErrorManager;

  private constructor() {
    // Register default handlers
    this.registerHandler(new ConsoleErrorHandler());
    this.registerHandler(new UserNotificationErrorHandler());
    this.registerHandler(new AnalyticsErrorHandler());
  }

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  registerHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: ErrorHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  handleError(error: Error | EnhancedAppError, context?: Record<string, unknown>): void {
    // Convert regular Error to EnhancedAppError
    const enhancedError = error instanceof EnhancedAppError 
      ? error 
      : new EnhancedAppError(
          ErrorCode.UNKNOWN_ERROR,
          error.message,
          { originalStack: error.stack },
          { originalError: error }
        );

    // Execute all applicable handlers
    this.handlers.forEach(handler => {
      if (handler.canHandle(enhancedError)) {
        try {
          handler.handle(enhancedError, context);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
        }
      }
    });
  }

  // Convenience method for handling errors with context
  handleWithContext(error: Error | EnhancedAppError, context: Record<string, unknown>): void {
    this.handleError(error, context);
  }
}

// Global error manager instance
export const errorManager = ErrorManager.getInstance();

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    errorManager.handleError(error as Error, context);
    return null;
  }
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R,
  context?: Record<string, unknown>
) => {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      errorManager.handleError(error as Error, context);
      return null;
    }
  };
};

// React Error Boundary Hook Integration
export const useErrorHandler = () => {
  return {
    handleError: (error: Error, context?: Record<string, unknown>) => 
      errorManager.handleError(error, context),
    createError,
  };
};

// Type guards
export const isEnhancedAppError = (error: unknown): error is EnhancedAppError => {
  return error instanceof EnhancedAppError;
};

export const isRecoverableError = (error: unknown): boolean => {
  if (isEnhancedAppError(error)) {
    return error.recoverable;
  }
  return true; // Assume recoverable by default
};

export const isCriticalError = (error: unknown): boolean => {
  if (isEnhancedAppError(error)) {
    return error.severity === ErrorSeverity.CRITICAL;
  }
  return false;
};