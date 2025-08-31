import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO } from 'date-fns';
import {
  StoredActivityLog,
  StoredDailySummary,
  NotificationSettings,
  TimeSlot,
  Activity,
  DailyLog,
  AppError,
  Result,
  success,
  failure,
  isValidTimeSlot,
} from '../types';
import { supabaseService } from './SupabaseService';

class StorageService {
  // Storage keys
  private readonly KEYS = {
    ACTIVITY_LOGS: 'activity_logs',
    DAILY_SUMMARIES: 'daily_summaries',
    NOTIFICATION_SETTINGS: 'notification_settings',
    APP_CONFIG: 'app_config',
    LAST_SYNC: 'last_sync',
    DEVICE_ID: 'device_id',
  } as const;

  constructor() {
    this.initializeDeviceId();
  }

  /**
   * Initialize or retrieve device ID
   */
  private async initializeDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        await AsyncStorage.setItem(this.KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Failed to initialize device ID:', error);
      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Get device ID
   */
  async getDeviceId(): Promise<string> {
    return await this.initializeDeviceId();
  }

  // Activity Logs Management

  /**
   * Save activity log
   */
  async saveActivityLog(timeSlot: TimeSlot): Promise<Result<void>> {
    if (!timeSlot.activity) {
      return failure(this.createAppError(
        'INVALID_TIME_SLOT',
        'Cannot save activity log without activity',
        undefined,
        { timeSlotId: timeSlot.id }
      ));
    }

    if (!isValidTimeSlot(timeSlot)) {
      return failure(this.createAppError(
        'INVALID_TIME_SLOT_DATA',
        'Time slot data is invalid',
        undefined,
        { timeSlot }
      ));
    }

    try {
      const deviceId = await this.getDeviceId();
      const storedLog: StoredActivityLog = {
        id: timeSlot.id,
        activityName: timeSlot.activity.name,
        activityId: timeSlot.activity.id,
        hourlyValue: timeSlot.activity.hourlyValue,
        blockValue: timeSlot.activity.blockValue,
        timeSlotStart: timeSlot.startTime.toISOString(),
        timeSlotEnd: timeSlot.endTime.toISOString(),
        loggedAt: new Date().toISOString(),
        deviceId,
      };

      const existingLogs = await this.getAllActivityLogs();
      const updatedLogs = existingLogs.filter(log => log.id !== storedLog.id);
      updatedLogs.push(storedLog);

      await AsyncStorage.setItem(
        this.KEYS.ACTIVITY_LOGS,
        JSON.stringify(updatedLogs)
      );

      // Sync to Supabase (optional, will fail gracefully if offline)
      try {
        await supabaseService.syncActivityLog(storedLog);
        console.log('Activity log synced to Supabase');
      } catch (syncError) {
        console.warn('Failed to sync activity log to Supabase:', syncError);
        // Continue execution - sync failure shouldn't block local storage
      }

      return success(undefined);
    } catch (error) {
      return failure(this.createAppError(
        'SAVE_ACTIVITY_LOG_FAILED',
        'Failed to save activity log',
        error,
        { timeSlotId: timeSlot.id }
      ));
    }
  }

  /**
   * Get all activity logs
   */
  async getAllActivityLogs(): Promise<StoredActivityLog[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.ACTIVITY_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get activity logs:', error);
      return [];
    }
  }

  /**
   * Get activity logs for a specific date
   */
  async getActivityLogsForDate(date: Date): Promise<StoredActivityLog[]> {
    try {
      const allLogs = await this.getAllActivityLogs();
      const targetDate = format(date, 'yyyy-MM-dd');
      
      return allLogs.filter(log => {
        const logDate = format(parseISO(log.timeSlotStart), 'yyyy-MM-dd');
        return logDate === targetDate;
      });
    } catch (error) {
      console.error('Failed to get activity logs for date:', error);
      return [];
    }
  }

  /**
   * Get activity logs for date range
   */
  async getActivityLogsForDateRange(startDate: Date, endDate: Date): Promise<StoredActivityLog[]> {
    try {
      const allLogs = await this.getAllActivityLogs();
      
      return allLogs.filter(log => {
        const logTime = parseISO(log.timeSlotStart);
        return logTime >= startDate && logTime <= endDate;
      });
    } catch (error) {
      console.error('Failed to get activity logs for date range:', error);
      return [];
    }
  }

  /**
   * Delete activity log
   */
  async deleteActivityLog(id: string): Promise<Result<void>> {
    if (!id || typeof id !== 'string') {
      return failure(this.createAppError(
        'INVALID_ID',
        'Invalid activity log ID provided',
        undefined,
        { id }
      ));
    }
    try {
      const existingLogs = await this.getAllActivityLogs();
      const updatedLogs = existingLogs.filter(log => log.id !== id);
      
      await AsyncStorage.setItem(
        this.KEYS.ACTIVITY_LOGS,
        JSON.stringify(updatedLogs)
      );

      // Sync deletion to Supabase (optional, will fail gracefully if offline)
      try {
        await supabaseService.deleteActivityLog(id);
        console.log('Activity log deletion synced to Supabase');
      } catch (syncError) {
        console.warn('Failed to sync activity log deletion to Supabase:', syncError);
        // Continue execution - sync failure shouldn't block local deletion
      }

      return success(undefined);
    } catch (error) {
      return failure(this.createAppError(
        'DELETE_ACTIVITY_LOG_FAILED',
        'Failed to delete activity log',
        error,
        { id }
      ));
    }
  }

  // Daily Summaries Management

  /**
   * Save daily summary
   */
  async saveDailySummary(dailyLog: DailyLog): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      const storedSummary: StoredDailySummary = {
        id: `summary_${dailyLog.date}_${deviceId}`,
        date: dailyLog.date,
        totalValue: dailyLog.totalValue,
        activityCount: dailyLog.activityCount,
        computedAt: new Date().toISOString(),
        deviceId,
      };

      const existingSummaries = await this.getAllDailySummaries();
      const updatedSummaries = existingSummaries.filter(
        summary => summary.date !== storedSummary.date
      );
      updatedSummaries.push(storedSummary);

      await AsyncStorage.setItem(
        this.KEYS.DAILY_SUMMARIES,
        JSON.stringify(updatedSummaries)
      );

      // Sync to Supabase (optional, will fail gracefully if offline)
      try {
        await supabaseService.syncDailySummary(storedSummary);
        console.log('Daily summary synced to Supabase');
      } catch (syncError) {
        console.warn('Failed to sync daily summary to Supabase:', syncError);
        // Continue execution - sync failure shouldn't block local storage
      }
    } catch (error) {
      throw this.createAppError('SAVE_DAILY_SUMMARY_FAILED', 'Failed to save daily summary', error);
    }
  }

  /**
   * Get all daily summaries
   */
  async getAllDailySummaries(): Promise<StoredDailySummary[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.DAILY_SUMMARIES);
      const summaries = data ? JSON.parse(data) : [];
      
      // Sort by date (newest first)
      return summaries.sort((a: StoredDailySummary, b: StoredDailySummary) => 
        b.date.localeCompare(a.date)
      );
    } catch (error) {
      console.error('Failed to get daily summaries:', error);
      return [];
    }
  }

  /**
   * Get daily summary for specific date
   */
  async getDailySummaryForDate(date: Date): Promise<StoredDailySummary | null> {
    try {
      const targetDate = format(date, 'yyyy-MM-dd');
      const summaries = await this.getAllDailySummaries();
      return summaries.find(summary => summary.date === targetDate) || null;
    } catch (error) {
      console.error('Failed to get daily summary for date:', error);
      return null;
    }
  }

  /**
   * Get monthly summaries
   */
  async getMonthlySummaries(year: number, month: number): Promise<StoredDailySummary[]> {
    try {
      const summaries = await this.getAllDailySummaries();
      const targetMonth = format(new Date(year, month - 1), 'yyyy-MM');
      
      return summaries.filter(summary => 
        summary.date.startsWith(targetMonth)
      );
    } catch (error) {
      console.error('Failed to get monthly summaries:', error);
      return [];
    }
  }

  // Notification Settings Management

  /**
   * Save notification settings
   */
  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.NOTIFICATION_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      throw this.createAppError('SAVE_NOTIFICATION_SETTINGS_FAILED', 'Failed to save notification settings', error);
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.NOTIFICATION_SETTINGS);
      
      if (data) {
        return JSON.parse(data);
      }

      // Return default settings
      const defaultSettings: NotificationSettings = {
        enabled: true,
        startTime: '06:00',
        endTime: '22:00', // 10 PM - more reasonable default
        intervalMinutes: 30,
        skipFilledSlots: true,
      };

      await this.saveNotificationSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      // Return safe defaults
      return {
        enabled: false,
        startTime: '06:00',
        endTime: '24:00',
        intervalMinutes: 30,
        skipFilledSlots: true,
      };
    }
  }

  // Data Management Utilities

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.ACTIVITY_LOGS,
        this.KEYS.DAILY_SUMMARIES,
      ]);
    } catch (error) {
      throw this.createAppError('CLEAR_DATA_FAILED', 'Failed to clear all data', error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalActivityLogs: number;
    totalDailySummaries: number;
    oldestLogDate: string | null;
    newestLogDate: string | null;
    totalStorageSize: number;
  }> {
    try {
      const [activityLogs, dailySummaries] = await Promise.all([
        this.getAllActivityLogs(),
        this.getAllDailySummaries(),
      ]);

      // Calculate oldest and newest log dates
      const logDates = activityLogs
        .map(log => log.timeSlotStart)
        .sort();

      const oldestLogDate = logDates.length > 0 ? logDates[0] : null;
      const newestLogDate = logDates.length > 0 ? logDates[logDates.length - 1] : null;

      // Estimate storage size (rough calculation)
      const activityLogsSize = JSON.stringify(activityLogs).length;
      const dailySummariesSize = JSON.stringify(dailySummaries).length;
      const totalStorageSize = activityLogsSize + dailySummariesSize;

      return {
        totalActivityLogs: activityLogs.length,
        totalDailySummaries: dailySummaries.length,
        oldestLogDate,
        newestLogDate,
        totalStorageSize,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalActivityLogs: 0,
        totalDailySummaries: 0,
        oldestLogDate: null,
        newestLogDate: null,
        totalStorageSize: 0,
      };
    }
  }

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<{
    activityLogs: StoredActivityLog[];
    dailySummaries: StoredDailySummary[];
    notificationSettings: NotificationSettings;
    deviceId: string;
    exportedAt: string;
  }> {
    try {
      const [activityLogs, dailySummaries, notificationSettings, deviceId] = await Promise.all([
        this.getAllActivityLogs(),
        this.getAllDailySummaries(),
        this.getNotificationSettings(),
        this.getDeviceId(),
      ]);

      return {
        activityLogs,
        dailySummaries,
        notificationSettings,
        deviceId,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw this.createAppError('EXPORT_DATA_FAILED', 'Failed to export data', error);
    }
  }

  /**
   * Import data from backup
   */
  async importData(data: {
    activityLogs?: StoredActivityLog[];
    dailySummaries?: StoredDailySummary[];
    notificationSettings?: NotificationSettings;
  }): Promise<void> {
    try {
      if (data.activityLogs) {
        await AsyncStorage.setItem(
          this.KEYS.ACTIVITY_LOGS,
          JSON.stringify(data.activityLogs)
        );
      }

      if (data.dailySummaries) {
        await AsyncStorage.setItem(
          this.KEYS.DAILY_SUMMARIES,
          JSON.stringify(data.dailySummaries)
        );
      }

      if (data.notificationSettings) {
        await this.saveNotificationSettings(data.notificationSettings);
      }
    } catch (error) {
      throw this.createAppError('IMPORT_DATA_FAILED', 'Failed to import data', error);
    }
  }

  /**
   * Cleanup old data (keep last 90 days)
   */
  async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Clean activity logs
      const activityLogs = await this.getAllActivityLogs();
      const recentLogs = activityLogs.filter(log => {
        const logDate = parseISO(log.timeSlotStart);
        return logDate >= cutoffDate;
      });

      // Clean daily summaries
      const dailySummaries = await this.getAllDailySummaries();
      const recentSummaries = dailySummaries.filter(summary => {
        const summaryDate = parseISO(summary.date);
        return summaryDate >= cutoffDate;
      });

      await Promise.all([
        AsyncStorage.setItem(this.KEYS.ACTIVITY_LOGS, JSON.stringify(recentLogs)),
        AsyncStorage.setItem(this.KEYS.DAILY_SUMMARIES, JSON.stringify(recentSummaries)),
      ]);

      const removedCount = (activityLogs.length - recentLogs.length) + 
                          (dailySummaries.length - recentSummaries.length);
      
      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      return 0;
    }
  }

  /**
   * Create standardized app error
   */
  private createAppError(
    code: string,
    message: string,
    originalError?: unknown,
    context?: Record<string, unknown>
  ): AppError {
    return {
      code,
      message,
      details: originalError instanceof Error ? originalError.message : originalError,
      timestamp: new Date(),
      context,
    };
  }

  /**
   * Save last sync timestamp
   */
  async saveLastSyncTime(timestamp: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.LAST_SYNC, timestamp.toISOString());
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.LAST_SYNC);
      return data ? parseISO(data) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }
}

// Create and export singleton instance
export const storageService = new StorageService();
export default storageService;