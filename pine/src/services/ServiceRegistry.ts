import { serviceContainer } from './ServiceContainer';
import { SyncEngine } from './SyncEngine';
import { ActivityService, createActivityService } from './RefactoredActivityService';
import { TimeSlotService, createTimeSlotService } from './RefactoredTimeSlotService';
import { ValidatedActivityRepository } from '../repositories/ValidatedActivityRepository';
import { ValidatedTimeSlotRepository } from '../repositories/ValidatedTimeSlotRepository';
import { AsyncStorageAdapter } from '../repositories/adapters/AsyncStorageAdapter';
import { SupabaseAdapter } from '../repositories/adapters/SupabaseAdapter';
import { MemoryCacheManager } from '../repositories/adapters/MemoryCacheManager';
import { ValidatedBaseRepository } from '../repositories/ValidatedBaseRepository';

/**
 * Service Registry - Central configuration for all services and dependencies
 * This replaces scattered service instantiation with proper dependency injection
 */

// Storage Adapters
serviceContainer.registerSingleton('memoryCacheManager', () => new MemoryCacheManager());
serviceContainer.registerSingleton('asyncStorageAdapter', () => new AsyncStorageAdapter());
serviceContainer.registerSingleton('supabaseAdapter', () => new SupabaseAdapter());

// Repositories
serviceContainer.registerSingleton('activityRepository', () => {
  const memoryCache = serviceContainer.resolve<MemoryCacheManager>('memoryCacheManager');
  const localStorage = serviceContainer.resolve<AsyncStorageAdapter>('asyncStorageAdapter');
  const cloudStorage = serviceContainer.resolve<SupabaseAdapter>('supabaseAdapter');
  
  return new ValidatedActivityRepository(localStorage, cloudStorage, memoryCache, {
    enabled: true,
    throwOnWarnings: false,
    logValidationErrors: true,
    logValidationWarnings: true
  });
}, ['memoryCacheManager', 'asyncStorageAdapter', 'supabaseAdapter']);

serviceContainer.registerSingleton('timeSlotRepository', () => {
  const memoryCache = serviceContainer.resolve<MemoryCacheManager>('memoryCacheManager');
  const localStorage = serviceContainer.resolve<AsyncStorageAdapter>('asyncStorageAdapter');
  const cloudStorage = serviceContainer.resolve<SupabaseAdapter>('supabaseAdapter');
  
  return new ValidatedTimeSlotRepository(localStorage, cloudStorage, memoryCache, {
    enabled: true,
    throwOnWarnings: false,
    logValidationErrors: true,
    logValidationWarnings: true
  });
}, ['memoryCacheManager', 'asyncStorageAdapter', 'supabaseAdapter']);

// Core Services
serviceContainer.registerSingleton('activityService', () => {
  const activityRepository = serviceContainer.resolve<ValidatedActivityRepository>('activityRepository');
  return createActivityService(activityRepository);
}, ['activityRepository']);

serviceContainer.registerSingleton('timeSlotService', () => {
  const timeSlotRepository = serviceContainer.resolve<ValidatedTimeSlotRepository>('timeSlotRepository');
  return createTimeSlotService(timeSlotRepository);
}, ['timeSlotRepository']);

// Sync Engine
serviceContainer.registerSingleton('syncEngine', () => {
  const localStorage = serviceContainer.resolve<AsyncStorageAdapter>('asyncStorageAdapter');
  const cloudStorage = serviceContainer.resolve<SupabaseAdapter>('supabaseAdapter');
  return new SyncEngine(localStorage, cloudStorage);
}, ['asyncStorageAdapter', 'supabaseAdapter']);

/**
 * Service Provider - Easy access to services with proper typing
 */
export class ServiceProvider {
  static getActivityService(): ActivityService {
    return serviceContainer.resolve<ActivityService>('activityService');
  }

  static getTimeSlotService(): TimeSlotService {
    return serviceContainer.resolve<TimeSlotService>('timeSlotService');
  }

  static getActivityRepository(): ValidatedActivityRepository {
    return serviceContainer.resolve<ValidatedActivityRepository>('activityRepository');
  }

  static getTimeSlotRepository(): ValidatedTimeSlotRepository {
    return serviceContainer.resolve<ValidatedTimeSlotRepository>('timeSlotRepository');
  }

  static getSyncEngine(): SyncEngine {
    return serviceContainer.resolve<SyncEngine>('syncEngine');
  }

  static getMemoryCacheManager(): MemoryCacheManager {
    return serviceContainer.resolve<MemoryCacheManager>('memoryCacheManager');
  }

  static getAsyncStorageAdapter(): AsyncStorageAdapter {
    return serviceContainer.resolve<AsyncStorageAdapter>('asyncStorageAdapter');
  }

  static getSupabaseAdapter(): SupabaseAdapter {
    return serviceContainer.resolve<SupabaseAdapter>('supabaseAdapter');
  }

  /**
   * Initialize all services - call this during app startup
   */
  static async initializeServices(): Promise<void> {
    try {
      await serviceContainer.initializeAllServices();
      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Get service health status for monitoring
   */
  static getServiceHealth() {
    return serviceContainer.getServiceHealth();
  }

  /**
   * Clear all services and their caches
   */
  static clearServices(): void {
    serviceContainer.clear();
  }
}

/**
 * Legacy service exports for backward compatibility during migration
 * These will be removed once all components are updated to use ServiceProvider
 */
export const activityService = ServiceProvider.getActivityService();
export const timeSlotService = ServiceProvider.getTimeSlotService();
export const syncEngine = ServiceProvider.getSyncEngine();