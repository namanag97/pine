import { Activity, ActivityData, ActivityCategory, SearchFilters } from '../types';
import activityData from '../../cost_per_hour_json.json';

class ActivityService {
  private activities: Activity[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Parse the cost_per_hour_json.json file and transform it into Activity objects
   */
  private initialize(): void {
    if (this.initialized) return;

    const data = activityData as ActivityData;
    this.activities = this.parseActivityData(data);
    this.initialized = true;
  }

  /**
   * Transform the JSON data structure into normalized Activity objects
   */
  private parseActivityData(data: ActivityData): Activity[] {
    const activities: Activity[] = [];

    Object.entries(data.activity_categories).forEach(([valueStr, category]) => {
      const hourlyValue = parseFloat(valueStr);
      const blockValue = this.calculateBlockValue(hourlyValue);

      category.activities.forEach((activityName, index) => {
        const activity: Activity = {
          id: `${valueStr}_${index}`,
          name: activityName,
          hourlyValue,
          blockValue,
          category: category.label,
          searchTags: this.generateSearchTags(activityName, category.label),
        };

        activities.push(activity);
      });
    });

    // Sort activities by hourly value (descending - highest value first)
    return activities.sort((a, b) => b.hourlyValue - a.hourlyValue);
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
  getAllActivities(): Activity[] {
    this.initialize();
    return [...this.activities];
  }

  /**
   * Get activities by value category
   */
  getActivitiesByCategory(category: string): Activity[] {
    this.initialize();
    return this.activities.filter(activity => activity.category === category);
  }

  /**
   * Get activities within a value range
   */
  getActivitiesByValueRange(minValue: number, maxValue: number): Activity[] {
    this.initialize();
    return this.activities.filter(activity => 
      activity.hourlyValue >= minValue && activity.hourlyValue <= maxValue
    );
  }

  /**
   * Search activities by name, category, or tags
   */
  searchActivities(query: string, limit?: number): Activity[] {
    this.initialize();
    
    if (!query.trim()) {
      return limit ? this.activities.slice(0, limit) : this.activities;
    }

    const searchTerm = query.toLowerCase().trim();
    const results: Array<{activity: Activity, score: number}> = [];

    this.activities.forEach(activity => {
      let score = 0;

      // Exact name match gets highest score
      if (activity.name.toLowerCase() === searchTerm) {
        score = 100;
      }
      // Name starts with search term
      else if (activity.name.toLowerCase().startsWith(searchTerm)) {
        score = 90;
      }
      // Name contains search term
      else if (activity.name.toLowerCase().includes(searchTerm)) {
        score = 80;
      }
      // Search in tags
      else if (activity.searchTags.some(tag => tag.includes(searchTerm))) {
        score = 70;
        // Boost score if tag starts with search term
        if (activity.searchTags.some(tag => tag.startsWith(searchTerm))) {
          score = 75;
        }
      }
      // Fuzzy matching for typos (simple version)
      else if (this.fuzzyMatch(activity.name.toLowerCase(), searchTerm)) {
        score = 60;
      }

      if (score > 0) {
        results.push({ activity, score });
      }
    });

    // Sort by score (descending) then by hourly value (descending)
    results.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return b.activity.hourlyValue - a.activity.hourlyValue;
    });

    const searchResults = results.map(result => result.activity);
    return limit ? searchResults.slice(0, limit) : searchResults;
  }

  /**
   * Simple fuzzy matching for typos
   */
  private fuzzyMatch(text: string, pattern: string): boolean {
    // Simple implementation: check if all characters of pattern exist in text in order
    let textIndex = 0;
    let patternIndex = 0;

    while (textIndex < text.length && patternIndex < pattern.length) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++;
      }
      textIndex++;
    }

    return patternIndex === pattern.length;
  }

  /**
   * Advanced search with filters
   */
  searchWithFilters(filters: SearchFilters): Activity[] {
    this.initialize();
    
    let results = this.activities;

    // Apply text search
    if (filters.query.trim()) {
      results = this.searchActivities(filters.query);
    }

    // Apply category filter
    if (filters.categoryFilter) {
      results = results.filter(activity => activity.category === filters.categoryFilter);
    }

    // Apply value range filter
    if (filters.valueRangeFilter) {
      const { min, max } = filters.valueRangeFilter;
      results = results.filter(activity => 
        activity.hourlyValue >= min && activity.hourlyValue <= max
      );
    }

    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.hourlyValue - b.hourlyValue;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return results;
  }

  /**
   * Get unique categories
   */
  getCategories(): string[] {
    this.initialize();
    const categories = new Set(this.activities.map(activity => activity.category));
    return Array.from(categories).sort();
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

  /**
   * Get activity by ID
   */
  getActivityById(id: string): Activity | null {
    this.initialize();
    return this.activities.find(activity => activity.id === id) || null;
  }

  /**
   * Get activity statistics
   */
  getActivityStats() {
    this.initialize();
    
    const stats = {
      totalActivities: this.activities.length,
      categories: this.getCategories().length,
      valueRange: {
        min: Math.min(...this.activities.map(a => a.hourlyValue)),
        max: Math.max(...this.activities.map(a => a.hourlyValue)),
      },
      distribution: {} as Record<string, number>,
    };

    // Count activities per category
    this.activities.forEach(activity => {
      stats.distribution[activity.category] = 
        (stats.distribution[activity.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get suggested activities based on time of day or other factors
   */
  getSuggestedActivities(context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    recentActivities?: string[];
  }): Activity[] {
    this.initialize();
    
    // Simple suggestion logic - return high-value activities
    // In future versions, this could be more sophisticated based on context
    const highValueActivities = this.activities
      .filter(activity => activity.hourlyValue > 1000)
      .slice(0, 5);

    return highValueActivities;
  }
}

// Create and export singleton instance
export const activityService = new ActivityService();
export default activityService;