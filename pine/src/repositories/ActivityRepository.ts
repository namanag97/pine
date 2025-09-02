import { BaseRepository, QueryFilter } from './BaseRepository';
import { Activity, AppError, Result, success, failure, isValidActivity } from '../types';

export interface ActivityFilter extends QueryFilter {
  category?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
  favorite?: boolean;
}

export class ActivityRepository extends BaseRepository<Activity> {
  protected validateEntity(entity: Partial<Activity>): Result<void> {
    if (!isValidActivity(entity)) {
      return failure(new AppError('VALIDATION_ERROR', 'Invalid activity data'));
    }

    if (typeof entity.hourlyValue !== 'number' || entity.hourlyValue < -10000) {
      return failure(new AppError('VALIDATION_ERROR', 'Invalid hourly value'));
    }

    if (typeof entity.blockValue !== 'number' || Math.abs(entity.blockValue - (entity.hourlyValue / 2)) > 0.01) {
      return failure(new AppError('VALIDATION_ERROR', 'Block value must be half of hourly value'));
    }

    if (!entity.name || typeof entity.name !== 'string' || entity.name.trim().length === 0) {
      return failure(new AppError('VALIDATION_ERROR', 'Activity name is required'));
    }

    if (!entity.category || typeof entity.category !== 'string' || entity.category.trim().length === 0) {
      return failure(new AppError('VALIDATION_ERROR', 'Activity category is required'));
    }

    return success(undefined);
  }

  protected generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  protected getStorageKey(id?: string): string {
    return id ? `activities/${id}` : 'activities';
  }

  protected applyCustomFilters(activities: Activity[], filters: QueryFilter): Activity[] {
    const activityFilters = filters as ActivityFilter;
    let filtered = [...activities];

    // Category filter
    if (activityFilters.category) {
      filtered = filtered.filter(activity => 
        activity.category.toLowerCase().includes(activityFilters.category!.toLowerCase())
      );
    }

    // Value range filter
    if (activityFilters.minValue !== undefined) {
      filtered = filtered.filter(activity => activity.hourlyValue >= activityFilters.minValue!);
    }

    if (activityFilters.maxValue !== undefined) {
      filtered = filtered.filter(activity => activity.hourlyValue <= activityFilters.maxValue!);
    }

    // Search filter
    if (activityFilters.search && activityFilters.search.trim() !== '') {
      const searchTerm = activityFilters.search.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchTerm) ||
        activity.category.toLowerCase().includes(searchTerm) ||
        activity.searchTags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // Activity-specific methods
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

    return this.create(activity);
  }

  async updateHourlyValue(id: string, newHourlyValue: number): Promise<Result<Activity>> {
    const blockValue = newHourlyValue / 2;
    return this.update(id, {
      hourlyValue: newHourlyValue,
      blockValue,
    });
  }

  async addSearchTag(id: string, tag: string): Promise<Result<Activity>> {
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
  }

  async removeSearchTag(id: string, tag: string): Promise<Result<Activity>> {
    const activityResult = await this.findById(id);
    if (!activityResult.success) {
      return activityResult;
    }

    const activity = activityResult.data;
    const normalizedTag = tag.toLowerCase().trim();
    const updatedTags = activity.searchTags.filter(t => t !== normalizedTag);

    return this.update(id, { searchTags: updatedTags });
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
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to get activity stats', error));
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