// Core App Types for Activity Value Tracker

export interface ActivityCategory {
  readonly label: string;
  readonly description: string;
  readonly activities: readonly string[];
}

export interface ActivityData {
  title: string;
  currency: string;
  activity_categories: Record<string, ActivityCategory>;
  metadata: {
    total_categories: number;
    value_range: { minimum: number; maximum: number };
    concept: string;
  };
}

export interface Activity {
  readonly id: string;
  readonly name: string;
  readonly hourlyValue: number;
  readonly blockValue: number; // hourlyValue / 2 (30-minute value)
  readonly category: string;
  readonly searchTags: readonly string[]; // For enhanced searching
}

export interface TimeSlot {
  readonly id: string;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly activity?: Activity;
  readonly value: number; // Activity value for this slot, 0 if empty
  readonly isLogged: boolean; // Whether user has manually logged this slot
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  totalValue: number;
  activityCount: number;
  completedSlots: number; // Number of slots with activities
}

export interface MonthlySummary {
  month: string; // YYYY-MM format
  totalValue: number;
  totalActivities: number;
  averageDailyValue: number;
  daysWithActivity: number;
  topActivities: Array<{ activity: string; count: number; totalValue: number }>;
}

export interface NotificationSettings {
  enabled: boolean;
  startTime: string; // HH:MM format (e.g., "09:00")
  endTime: string; // HH:MM format (e.g., "22:00")
  intervalMinutes: number; // Default: 30
  skipFilledSlots: boolean; // Don't notify if current slot already has activity
}

// Type guards
export const isValidTimeFormat = (time: string): boolean => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const isValidActivity = (obj: any): obj is Activity => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.hourlyValue === 'number' &&
    typeof obj.blockValue === 'number' &&
    typeof obj.category === 'string' &&
    Array.isArray(obj.searchTags)
  );
};

export const isValidTimeSlot = (obj: any): obj is TimeSlot => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.startTime instanceof Date &&
    obj.endTime instanceof Date &&
    typeof obj.value === 'number' &&
    typeof obj.isLogged === 'boolean' &&
    (obj.activity === undefined || isValidActivity(obj.activity))
  );
};

export interface AppConfig {
  NOTIFICATION_INTERVAL: number; // minutes
  DEFAULT_START_TIME: string;
  DEFAULT_END_TIME: string;
  TIME_SLOT_DURATION: number; // minutes
  CURRENCY_SYMBOL: string;
  EXPORT_MAX_RECORDS: number;
}

// Storage interfaces
export interface StoredActivityLog {
  readonly id: string;
  readonly activityName: string;
  readonly activityId: string;
  readonly hourlyValue: number;
  readonly blockValue: number;
  readonly timeSlotStart: string; // ISO string
  readonly timeSlotEnd: string; // ISO string
  readonly loggedAt: string; // ISO string
  readonly deviceId?: string;
}

// Type guard for StoredActivityLog
export const isValidStoredActivityLog = (obj: any): obj is StoredActivityLog => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.activityName === 'string' &&
    typeof obj.activityId === 'string' &&
    typeof obj.hourlyValue === 'number' &&
    typeof obj.blockValue === 'number' &&
    typeof obj.timeSlotStart === 'string' &&
    typeof obj.timeSlotEnd === 'string' &&
    typeof obj.loggedAt === 'string' &&
    (obj.deviceId === undefined || typeof obj.deviceId === 'string')
  );
};

export interface StoredDailySummary {
  readonly id: string;
  readonly date: string; // YYYY-MM-DD format
  readonly totalValue: number;
  readonly activityCount: number;
  readonly computedAt: string; // ISO string
  readonly deviceId?: string;
}

// Type guard for StoredDailySummary
export const isValidStoredDailySummary = (obj: any): obj is StoredDailySummary => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(obj.date) && // Validate YYYY-MM-DD format
    typeof obj.totalValue === 'number' &&
    typeof obj.activityCount === 'number' &&
    typeof obj.computedAt === 'string' &&
    (obj.deviceId === undefined || typeof obj.deviceId === 'string')
  );
};

// Removed unused UI Component Props interfaces

// Search and Filter types
// Enhanced search and filter types with better constraints
export type SortBy = 'name' | 'value' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface ValueRange {
  readonly min: number;
  readonly max: number;
}

export interface SearchFilters {
  readonly query: string;
  readonly categoryFilter: string | null;
  readonly valueRangeFilter: ValueRange | null;
  readonly sortBy: SortBy;
  readonly sortOrder: SortOrder;
}

// Type guard for SearchFilters
export const isValidSearchFilters = (obj: any): obj is SearchFilters => {
  const validSortBy = ['name', 'value', 'category'];
  const validSortOrder = ['asc', 'desc'];
  
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.query === 'string' &&
    (obj.categoryFilter === null || typeof obj.categoryFilter === 'string') &&
    (obj.valueRangeFilter === null || (
      typeof obj.valueRangeFilter === 'object' &&
      typeof obj.valueRangeFilter.min === 'number' &&
      typeof obj.valueRangeFilter.max === 'number'
    )) &&
    validSortBy.includes(obj.sortBy) &&
    validSortOrder.includes(obj.sortOrder)
  );
};

// Navigation types - Enhanced with better type safety
export type RootStackParamList = {
  Main: { selectedDate?: string }; // ISO date string
  Settings: undefined;
  Stats: undefined;
  DataSync: undefined;
  ActivitySelection: {
    timeSlot: TimeSlot;
    onActivitySelected: (activity: Activity | null) => void;
  };
  ActivityLog: undefined;
  DayView: { selectedDate?: string }; // ISO date string
};

// Screen navigation props for better type safety
export interface ScreenNavigationProps<T extends keyof RootStackParamList> {
  navigation: any; // TODO: Replace with proper navigation type
  route: {
    params?: RootStackParamList[T];
  };
}

// API Response types (for Supabase)
export interface SupabaseActivityLog {
  id: string;
  activity_name: string;
  hourly_value: number;
  block_value: number;
  time_slot_start: string;
  time_slot_end: string;
  logged_at: string;
  device_id?: string;
}

export interface SupabaseDailySummary {
  id: string;
  date: string;
  total_value: number;
  activity_count: number;
  computed_at: string;
  device_id?: string;
}

// Removed unused utility types

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface ExportData {
  logs: StoredActivityLog[];
  summaries: StoredDailySummary[];
  dateRange: DateRange;
  totalRecords: number;
}

// Error types
export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly timestamp?: Date;
  readonly context?: Record<string, unknown>;
}

// Result types for better error handling
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Helper functions for Result type
export const success = <T>(data: T): Result<T> => ({ success: true, data });
export const failure = <E = AppError>(error: E): Result<never, E> => ({ success: false, error });

// Removed unused loading state interfaces