import { EnhancedAppError, createError, errorManager } from '../utils/errorHandling';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { Activity, Result, success, failure, SearchFilters } from '../types';
import { serviceContainer } from './ServiceContainer';
import { useAppStore } from '../store';
import activityData from '../../cost_per_hour_json.json';

/**
 * Modern ActivityService using repository pattern and dependency injection
 * Replaces the old ActivityService with improved architecture
 */
export class ActivityService {
  private initialized = false;
  private dependencies?: {
    activityRepository: ActivityRepository;
  };

  constructor(private activityRepository?: ActivityRepository) {
    // Initialize repository if not provided (for backward compatibility)
    if (!activityRepository) {
      this.activityRepository = serviceContainer.resolve<ActivityRepository>('activityRepository');
    }
  }

  setDependencies(deps: { activityRepository: ActivityRepository }) {
    this.dependencies = deps;
  }

  private getRepository(): ActivityRepository {
    return this.activityRepository || this.dependencies?.activityRepository || 
           serviceContainer.resolve<ActivityRepository>('activityRepository');
  }

  /**
   * Initialize service by populating repository with activities from JSON
   */
  async initialize(): Promise<Result<void>> {
    if (this.initialized) return success(undefined);

    try {
      const repository = this.getRepository();
      
      // Check if activities are already loaded
      const existingActivities = await repository.findAll();
      if (existingActivities.success && existingActivities.data.length > 0) {
        this.initialized = true;
        return success(undefined);
      }

      // Parse and create activities from JSON
      const activities = await this.parseActivityDataFromJSON();
      if (!activities.success) return activities;

      // Populate repository
      for (const activityData of activities.data) {
        const createResult = await repository.create(activityData);
        if (!createResult.success) {
          console.warn(`Failed to create activity: ${activityData.name}`, createResult.error);
        }
      }

      this.initialized = true;
      
      // Update store with loaded activities
      const store = useAppStore.getState();
      const allActivities = await repository.findAll();
      if (allActivities.success) {
        store.setActivities(allActivities.data);
      }

      return success(undefined);
    } catch (error) {
      const appError = createError.unknown('Failed to initialize ActivityService', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Parse activity data from JSON file
   */
  private async parseActivityDataFromJSON(): Promise<Result<Omit<Activity, 'id'>[]>> {
    try {
      const data = activityData as any;
      const activities: Omit<Activity, 'id'>[] = [];

      Object.entries(data.activity_categories).forEach(([valueStr, category]: [string, any]) => {
        const hourlyValue = parseFloat(valueStr);
        const blockValue = this.calculateBlockValue(hourlyValue);

        category.activities.forEach((activityName: string) => {
          const activity: Omit<Activity, 'id'> = {
            name: activityName,
            hourlyValue,
            blockValue,
            category: category.label,
            searchTags: this.generateSearchTags(activityName, category.label),
          };

          activities.push(activity);
        });
      });

      return success(activities);
    } catch (error) {
      const appError = createError.validation('Failed to parse activity data from JSON', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Calculate 30-minute block value from hourly value
   */
  private calculateBlockValue(hourlyValue: number): number {
    return hourlyValue / 2;
  }

  /**
   * Generate search tags for improved searchability
   */
  private generateSearchTags(activityName: string, categoryLabel: string): string[] {
    const tags: string[] = [];
    
    // Add the original activity name
    tags.push(activityName.toLowerCase());
    
    // Add individual words from the activity name
    const words = activityName.toLowerCase().split(/[\s&,]+/);
    tags.push(...words);
    
    // Add category name
    tags.push(categoryLabel.toLowerCase());
    
    // Add some common synonyms/variations
    const synonymMap: Record<string, string[]> = {
      'client': ['customer', 'customer service'],
      'work': ['working', 'job', 'task'],
      'meeting': ['call', 'conference', 'discussion'],
      'writing': ['write', 'document', 'documenting'],
      'reading': ['read', 'study', 'learning'],
      'exercise': ['workout', 'fitness', 'gym'],
      'cooking': ['cook', 'meal', 'food'],
      'cleaning': ['clean', 'tidy', 'organizing'],
    };

    words.forEach(word => {
      if (synonymMap[word]) {
        tags.push(...synonymMap[word]);
      }
    });

    // Remove duplicates and empty strings
    return [...new Set(tags.filter(tag => tag.length > 0))];
  }

  /**
   * Get all activities
   */
  async getAllActivities(): Promise<Result<Activity[]>> {
    await this.initialize();
    return this.getRepository().findAll({
      sortBy: 'hourlyValue',
      sortOrder: 'desc'
    });
  }

  /**
   * Get activities by category
   */
  async getActivitiesByCategory(category: string): Promise<Result<Activity[]>> {
    await this.initialize();
    return this.getRepository().findByCategory(category);
  }

  /**
   * Get activities within a value range
   */
  async getActivitiesByValueRange(minValue: number, maxValue: number): Promise<Result<Activity[]>> {
    await this.initialize();
    return this.getRepository().findByValueRange(minValue, maxValue);
  }

  /**
   * Search activities by name, category, or tags
   */
  async searchActivities(query: string, limit?: number): Promise<Result<Activity[]>> {
    await this.initialize();
    return this.getRepository().search(query, limit);
  }

  /**
   * Get activity by ID
   */
  async getActivityById(id: string): Promise<Result<Activity | null>> {
    await this.initialize();
    const result = await this.getRepository().findById(id);
    if (result.success) {
      return success(result.data);
    } else if (result.error?.code === 'NOT_FOUND') {
      return success(null);
    }
    return result as Result<Activity | null>;
  }

  /**
   * Create new custom activity
   */
  async createActivity(activityData: {
    name: string;
    hourlyValue: number;
    category: string;
    searchTags?: string[];
  }): Promise<Result<Activity>> {
    await this.initialize();
    const repository = this.getRepository();
    
    const createResult = await repository.createWithValidation(activityData);
    if (createResult.success) {
      // Update store
      const store = useAppStore.getState();
      store.addActivity(createResult.data);
    }
    
    return createResult;
  }

  /**
   * Update activity hourly value
   */
  async updateActivityValue(id: string, newHourlyValue: number): Promise<Result<Activity>> {
    await this.initialize();
    const repository = this.getRepository();
    
    const updateResult = await repository.updateHourlyValue(id, newHourlyValue);
    if (updateResult.success) {
      // Update store
      const store = useAppStore.getState();
      store.updateActivity(updateResult.data);
    }
    
    return updateResult;
  }

  /**
   * Add search tag to activity
   */
  async addSearchTag(id: string, tag: string): Promise<Result<Activity>> {
    await this.initialize();
    const repository = this.getRepository();
    
    const updateResult = await repository.addSearchTag(id, tag);
    if (updateResult.success) {
      // Update store
      const store = useAppStore.getState();
      store.updateActivity(updateResult.data);
    }
    
    return updateResult;
  }

  /**
   * Remove search tag from activity
   */
  async removeSearchTag(id: string, tag: string): Promise<Result<Activity>> {
    await this.initialize();
    const repository = this.getRepository();
    
    const updateResult = await repository.removeSearchTag(id, tag);
    if (updateResult.success) {
      // Update store
      const store = useAppStore.getState();
      store.updateActivity(updateResult.data);
    }
    
    return updateResult;
  }

  /**
   * Advanced search with filters
   */
  async searchWithFilters(filters: SearchFilters): Promise<Result<Activity[]>> {
    await this.initialize();
    const repository = this.getRepository();
    
    // Build repository filters from SearchFilters
    const repoFilters: any = {
      limit: filters.limit,
      sortBy: filters.sortBy === 'value' ? 'hourlyValue' : filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    
    // Apply search query
    if (filters.query.trim()) {
      repoFilters.search = filters.query;
    }
    
    // Apply category filter
    if (filters.categoryFilter) {
      repoFilters.category = filters.categoryFilter;
    }
    
    // Apply value range filter
    if (filters.valueRangeFilter) {
      repoFilters.minValue = filters.valueRangeFilter.min;
      repoFilters.maxValue = filters.valueRangeFilter.max;
    }
    
    return repository.findAll(repoFilters);
  }

  /**
   * Get unique categories
   */
  async getCategories(): Promise<Result<string[]>> {
    await this.initialize();
    const activitiesResult = await this.getRepository().findAll();
    
    if (!activitiesResult.success) return activitiesResult as Result<string[]>;
    
    const categories = new Set(activitiesResult.data.map(activity => activity.category));
    return success(Array.from(categories).sort());
  }

  /**
   * Get top activities by value
   */
  async getTopActivities(limit: number = 10): Promise<Result<Activity[]>> {
    await this.initialize();
    return this.getRepository().getTopActivities(limit);
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(): Promise<Result<{
    total: number;
    byCategory: Record<string, number>;
    valueRange: { min: number; max: number };
    averageValue: number;
  }>> {
    await this.initialize();
    return this.getRepository().getActivityStats();
  }

  /**
   * Get suggested activities based on context
   */
  async getSuggestedActivities(context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    recentActivities?: string[];
  }): Promise<Result<Activity[]>> {
    await this.initialize();
    
    // Simple suggestion logic - return high-value activities
    // In future versions, this could be more sophisticated based on context
    return this.getRepository().findAll({
      minValue: 1000,
      sortBy: 'hourlyValue',
      sortOrder: 'desc',
      limit: 5
    });
  }

  /**
   * Get value ranges for filtering
   */
  getValueRanges(): Array<{label: string, min: number, max: number}> {
    return [
      { label: 'Negative (< ₹0)', min: -Infinity, max: -0.01 },
      { label: 'Free (₹0)', min: 0, max: 0 },
      { label: 'Low (₹0.01 - ₹500)', min: 0.01, max: 500 },
      { label: 'Medium (₹500 - ₹5,000)', min: 500, max: 5000 },
      { label: 'High (₹5,000 - ₹50,000)', min: 5000, max: 50000 },
      { label: 'Very High (> ₹50,000)', min: 50000, max: Infinity },
    ];
  }
}

// Export service factory for dependency injection
export const createActivityService = (activityRepository: ActivityRepository) => {
  return new ActivityService(activityRepository);
};