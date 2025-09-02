import { ValidatedBaseRepository } from './ValidatedBaseRepository';
import { Activity, Result, success, failure } from '../types';
import { createError, errorManager } from '../utils/errorHandling';
import { StorageAdapter } from './BaseRepository';

/**
 * Validated ActivityRepository with automatic validation
 * Extends ValidatedBaseRepository to provide Activity-specific validation
 */
export class ValidatedActivityRepository extends ValidatedBaseRepository<Activity> {
  protected entityType: 'activity' = 'activity';

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
    super(localStorage, cloudStorage, cache, validationConfig);
  }

  protected validateEntity(entity: Partial<Activity>): Result<void> {
    // This method is called by the parent BaseRepository
    // The validation is now handled by ValidatedBaseRepository
    return success(undefined);
  }

  protected generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  protected getStorageKey(id?: string): string {
    return id ? `activities/${id}` : 'activities';
  }

  protected applyCustomFilters(activities: Activity[], filters: any): Activity[] {
    let filtered = [...activities];

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(activity => 
        activity.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Value range filter
    if (filters.minValue !== undefined) {
      filtered = filtered.filter(activity => activity.hourlyValue >= filters.minValue);
    }

    if (filters.maxValue !== undefined) {
      filtered = filtered.filter(activity => activity.hourlyValue <= filters.maxValue);
    }

    // Search filter
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchTerm) ||
        activity.category.toLowerCase().includes(searchTerm) ||
        activity.searchTags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // Activity-specific validated methods
  async findByCategory(category: string): Promise<Result<Activity[]>> {
    return this.findAll({ category });
  }

  async findByValueRange(minValue: number, maxValue: number): Promise<Result<Activity[]>> {
    return this.findAll({ minValue, maxValue });
  }

  async search(query: string, limit: number = 20): Promise<Result<Activity[]>> {
    return this.findAll({ search: query, limit });
  }

  async getTopActivities(limit: number = 10): Promise<Result<Activity[]>> {
    return this.findAll({
      sortBy: 'hourlyValue',
      sortOrder: 'desc',
      limit,
    });
  }

  async createWithValidation(activityData: {
    name: string;
    hourlyValue: number;
    category: string;
    searchTags?: string[];
  }): Promise<Result<Activity>> {
    try {
      // Calculate block value
      const blockValue = activityData.hourlyValue / 2;

      // Generate search tags if not provided
      const searchTags = activityData.searchTags || this.generateSearchTags(activityData);

      const activity = {
        name: activityData.name.trim(),
        hourlyValue: activityData.hourlyValue,
        blockValue,
        category: activityData.category.trim(),
        searchTags: [...new Set(searchTags)], // Remove duplicates
      };

      // Use parent create method which includes validation
      return this.create(activity);
    } catch (error) {
      const appError = createError.unknown('Failed to create activity with validation', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  async updateHourlyValue(id: string, newHourlyValue: number): Promise<Result<Activity>> {
    try {
      const blockValue = newHourlyValue / 2;
      
      // Use parent update method which includes validation
      return this.update(id, {
        hourlyValue: newHourlyValue,
        blockValue,
      });
    } catch (error) {
      const appError = createError.unknown('Failed to update activity hourly value', error);
      errorManager.handleError(appError, { activityId: id, newHourlyValue });
      return failure(appError);
    }
  }

  async addSearchTag(id: string, tag: string): Promise<Result<Activity>> {
    try {
      const activityResult = await this.findById(id);
      if (!activityResult.success) {
        return activityResult;
      }

      const activity = activityResult.data;
      const normalizedTag = tag.toLowerCase().trim();

      if (!activity.searchTags.includes(normalizedTag)) {
        const updatedTags = [...activity.searchTags, normalizedTag];
        return this.update(id, { searchTags: updatedTags });
      }

      return success(activity);
    } catch (error) {
      const appError = createError.unknown('Failed to add search tag', error);
      errorManager.handleError(appError, { activityId: id, tag });
      return failure(appError);
    }
  }

  async removeSearchTag(id: string, tag: string): Promise<Result<Activity>> {
    try {
      const activityResult = await this.findById(id);
      if (!activityResult.success) {
        return activityResult;
      }

      const activity = activityResult.data;
      const normalizedTag = tag.toLowerCase().trim();
      const updatedTags = activity.searchTags.filter(t => t !== normalizedTag);

      return this.update(id, { searchTags: updatedTags });
    } catch (error) {
      const appError = createError.unknown('Failed to remove search tag', error);
      errorManager.handleError(appError, { activityId: id, tag });
      return failure(appError);
    }
  }

  async getActivityStats(): Promise<Result<{
    total: number;
    byCategory: Record<string, number>;
    valueRange: { min: number; max: number };
    averageValue: number;
  }>> {
    try {
      const activitiesResult = await this.findAll();
      if (!activitiesResult.success) {
        return activitiesResult as Result<any>;
      }

      const activities = activitiesResult.data;
      
      if (activities.length === 0) {
        return success({
          total: 0,
          byCategory: {},
          valueRange: { min: 0, max: 0 },
          averageValue: 0,
        });
      }

      // Calculate by category
      const byCategory: Record<string, number> = {};
      let totalValue = 0;
      let minValue = activities[0].hourlyValue;
      let maxValue = activities[0].hourlyValue;

      activities.forEach(activity => {
        byCategory[activity.category] = (byCategory[activity.category] || 0) + 1;
        totalValue += activity.hourlyValue;
        minValue = Math.min(minValue, activity.hourlyValue);
        maxValue = Math.max(maxValue, activity.hourlyValue);
      });

      const averageValue = totalValue / activities.length;

      return success({
        total: activities.length,
        byCategory,
        valueRange: { min: minValue, max: maxValue },
        averageValue,
      });
    } catch (error) {
      const appError = createError.unknown('Failed to get activity stats', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  private generateSearchTags(activityData: { name: string; category: string }): string[] {
    const tags: string[] = [];
    
    // Add words from name
    const nameWords = activityData.name.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);
    tags.push(...nameWords);

    // Add category
    tags.push(activityData.category.toLowerCase());

    // Add category words
    const categoryWords = activityData.category.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2);
    tags.push(...categoryWords);

    return [...new Set(tags)]; // Remove duplicates
  }
}