import { format, addMinutes, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { EnhancedAppError, createError, errorManager } from '../utils/errorHandling';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';
import { TimeSlot, Activity, DailyLog, AppConfig, Result, success, failure } from '../types';
import { serviceContainer } from './ServiceContainer';
import { useAppStore } from '../store';

/**
 * Modern TimeSlotService using repository pattern and dependency injection
 * Replaces the old TimeSlotService with improved architecture
 */
export class TimeSlotService {
  private readonly config: AppConfig = {
    NOTIFICATION_INTERVAL: 30,
    DEFAULT_START_TIME: '00:00',
    DEFAULT_END_TIME: '23:59',
    TIME_SLOT_DURATION: 30,
    CURRENCY_SYMBOL: '₹',
    EXPORT_MAX_RECORDS: 10000,
  };

  private dependencies?: {
    timeSlotRepository: TimeSlotRepository;
  };

  constructor(private timeSlotRepository?: TimeSlotRepository) {
    // Initialize repository if not provided (for backward compatibility)
    if (!timeSlotRepository) {
      this.timeSlotRepository = serviceContainer.resolve<TimeSlotRepository>('timeSlotRepository');
    }
  }

  setDependencies(deps: { timeSlotRepository: TimeSlotRepository }) {
    this.dependencies = deps;
  }

  private getRepository(): TimeSlotRepository {
    return this.timeSlotRepository || this.dependencies?.timeSlotRepository || 
           serviceContainer.resolve<TimeSlotRepository>('timeSlotRepository');
  }

  /**
   * Generate all 30-minute time slots for a given date
   */
  async generateTimeSlotsForDate(date: Date): Promise<Result<TimeSlot[]>> {
    try {
      const repository = this.getRepository();
      const dateStr = format(date, 'yyyy-MM-dd');

      // Check if slots already exist for this date
      const existingSlots = await repository.findByDate(dateStr);
      if (existingSlots.success && existingSlots.data.length > 0) {
        return existingSlots;
      }

      // Generate new slots using repository method
      const generateResult = await repository.generateDailySlots(dateStr, this.config.TIME_SLOT_DURATION);
      
      if (generateResult.success) {
        // Update store
        const store = useAppStore.getState();
        generateResult.data.forEach(slot => {
          store.addTimeSlot(slot);
        });
      }

      return generateResult;
    } catch (error) {
      const appError = createError.unknown('Failed to generate time slots for date', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Create a time slot with an activity
   */
  async createTimeSlotWithActivity(startTime: Date, activity: Activity): Promise<Result<TimeSlot>> {
    try {
      const repository = this.getRepository();
      const endTime = addMinutes(startTime, this.config.TIME_SLOT_DURATION);
      
      const createResult = await repository.createTimeSlot({
        startTime,
        endTime,
        activity,
      });

      if (createResult.success) {
        // Update store
        const store = useAppStore.getState();
        store.addTimeSlot(createResult.data);
      }

      return createResult;
    } catch (error) {
      const appError = createError.unknown('Failed to create time slot with activity', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Update a time slot with a new activity
   */
  async updateTimeSlotActivity(timeSlotId: string, activity: Activity | null): Promise<Result<TimeSlot>> {
    try {
      const repository = this.getRepository();
      const updateResult = await repository.logActivity(timeSlotId, activity);

      if (updateResult.success) {
        // Update store
        const store = useAppStore.getState();
        store.updateTimeSlot(updateResult.data);
      }

      return updateResult;
    } catch (error) {
      const appError = createError.unknown('Failed to update time slot activity', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get time slots for a specific date
   */
  async getTimeSlotsForDate(date: Date): Promise<Result<TimeSlot[]>> {
    try {
      const repository = this.getRepository();
      const dateStr = format(date, 'yyyy-MM-dd');
      return repository.findByDate(dateStr);
    } catch (error) {
      const appError = createError.unknown('Failed to get time slots for date', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get time slots for a date range
   */
  async getTimeSlotsInRange(startDate: Date, endDate: Date): Promise<Result<TimeSlot[]>> {
    try {
      const repository = this.getRepository();
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      return repository.findByDateRange(startDateStr, endDateStr);
    } catch (error) {
      const appError = createError.unknown('Failed to get time slots in range', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get current active time slot
   */
  async getCurrentTimeSlot(): Promise<Result<TimeSlot | null>> {
    try {
      const repository = this.getRepository();
      return repository.getCurrentTimeSlot();
    } catch (error) {
      const appError = createError.unknown('Failed to get current time slot', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Find time slot by time
   */
  async findTimeSlotByTime(date: string, time: Date): Promise<Result<TimeSlot | null>> {
    try {
      const repository = this.getRepository();
      return repository.getTimeSlotByTime(date, time);
    } catch (error) {
      const appError = createError.unknown('Failed to find time slot by time', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get unlogged time slots
   */
  async getUnloggedSlots(date?: string): Promise<Result<TimeSlot[]>> {
    try {
      const repository = this.getRepository();
      return repository.findUnloggedSlots(date);
    } catch (error) {
      const appError = createError.unknown('Failed to get unlogged slots', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Calculate daily summary from time slots
   */
  async calculateDailyLog(date: Date): Promise<Result<DailyLog>> {
    try {
      const repository = this.getRepository();
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const slotsResult = await repository.findByDate(dateStr);
      if (!slotsResult.success) return slotsResult as Result<DailyLog>;

      const timeSlots = slotsResult.data;
      const totalValue = timeSlots.reduce((sum, slot) => sum + slot.value, 0);
      const activityCount = timeSlots.filter(slot => slot.activity).length;
      const completedSlots = timeSlots.filter(slot => slot.isLogged).length;

      const dailyLog: DailyLog = {
        date: dateStr,
        timeSlots,
        totalValue,
        activityCount,
        completedSlots,
      };

      return success(dailyLog);
    } catch (error) {
      const appError = createError.unknown('Failed to calculate daily log', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get daily statistics
   */
  async getDailyStats(date: Date): Promise<Result<{
    totalSlots: number;
    loggedSlots: number;
    totalValue: number;
    averageValue: number;
    activitiesCount: number;
    topActivities: Array<{ activity: Activity; count: number; totalValue: number }>;
  }>> {
    try {
      const repository = this.getRepository();
      const dateStr = format(date, 'yyyy-MM-dd');
      return repository.getDailyStats(dateStr);
    } catch (error) {
      const appError = createError.unknown('Failed to get daily stats', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get weekly statistics
   */
  async getWeeklyStats(startDate: Date): Promise<Result<{
    totalValue: number;
    dailyTotals: Record<string, number>;
    mostProductiveDay: string;
    averageDailyValue: number;
  }>> {
    try {
      const repository = this.getRepository();
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      return repository.getWeeklyStats(startDateStr);
    } catch (error) {
      const appError = createError.unknown('Failed to get weekly stats', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Get time slot statistics
   */
  async getTimeSlotStats(timeSlots?: TimeSlot[]): Promise<Result<{
    total: number;
    filled: number;
    empty: number;
    fillRate: number;
    totalValue: number;
    averageValue: number;
  }>> {
    try {
      let slots: TimeSlot[];

      if (timeSlots) {
        slots = timeSlots;
      } else {
        // Get today's time slots
        const today = new Date();
        const todayResult = await this.getTimeSlotsForDate(today);
        if (!todayResult.success) return todayResult as Result<any>;
        slots = todayResult.data;
      }

      const total = slots.length;
      const filled = slots.filter(slot => slot.activity).length;
      const empty = total - filled;
      const fillRate = total > 0 ? (filled / total) * 100 : 0;
      const totalValue = slots.reduce((sum, slot) => sum + slot.value, 0);
      const averageValue = filled > 0 ? totalValue / filled : 0;

      return success({
        total,
        filled,
        empty,
        fillRate,
        totalValue,
        averageValue,
      });
    } catch (error) {
      const appError = createError.unknown('Failed to get time slot stats', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Clear empty slots for a date
   */
  async clearEmptySlots(date: Date): Promise<Result<number>> {
    try {
      const repository = this.getRepository();
      const dateStr = format(date, 'yyyy-MM-dd');
      const clearResult = await repository.clearEmptySlots(dateStr);

      if (clearResult.success) {
        // Update store by removing empty slots
        const store = useAppStore.getState();
        const remainingSlotsResult = await repository.findByDate(dateStr);
        if (remainingSlotsResult.success) {
          store.setTimeSlotsForDate(dateStr, remainingSlotsResult.data);
        }
      }

      return clearResult;
    } catch (error) {
      const appError = createError.unknown('Failed to clear empty slots', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Check time slot conflicts (legacy method for backward compatibility)
   */
  async checkTimeSlotConflict(
    newSlot: TimeSlot,
    existingSlots?: TimeSlot[]
  ): Promise<Result<{ hasConflict: boolean; conflictingSlot?: TimeSlot }>> {
    try {
      let slots: TimeSlot[];

      if (existingSlots) {
        slots = existingSlots;
      } else {
        const dateStr = format(newSlot.startTime, 'yyyy-MM-dd');
        const slotsResult = await this.getTimeSlotsForDate(parseISO(dateStr));
        if (!slotsResult.success) return slotsResult as Result<any>;
        slots = slotsResult.data;
      }

      const conflictingSlot = slots.find(slot => {
        return (
          slot.id !== newSlot.id &&
          ((newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
           (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
           (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime))
        );
      });

      return success({
        hasConflict: conflictingSlot !== undefined,
        conflictingSlot,
      });
    } catch (error) {
      const appError = createError.unknown('Failed to check time slot conflict', error);
      errorManager.handleError(appError);
      return failure(appError);
    }
  }

  /**
   * Check if it's time to send notification for a time slot
   */
  shouldNotifyForTimeSlot(timeSlot: TimeSlot, notificationSettings: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    skipFilledSlots: boolean;
  }): boolean {
    if (!notificationSettings.enabled) return false;
    
    // Don't notify if slot is already filled and skipFilledSlots is true
    if (notificationSettings.skipFilledSlots && timeSlot.activity) {
      return false;
    }

    const now = new Date();
    const slotStart = timeSlot.startTime;
    const slotEnd = timeSlot.endTime;

    // Check if current time is within the slot
    const isCurrentSlot = now >= slotStart && now < slotEnd;
    
    // Check if it's within notification hours
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = notificationSettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = notificationSettings.endTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    const isWithinNotificationHours = 
      currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes;

    return isCurrentSlot && isWithinNotificationHours;
  }

  /**
   * Format time slot for display
   */
  formatTimeSlotDisplay(timeSlot: TimeSlot): {
    timeRange: string;
    activityName: string;
    valueDisplay: string;
    statusText: string;
  } {
    const timeRange = `${format(timeSlot.startTime, 'HH:mm')} - ${format(timeSlot.endTime, 'HH:mm')}`;
    const activityName = timeSlot.activity?.name || 'No activity';
    const valueDisplay = `${this.config.CURRENCY_SYMBOL}${timeSlot.value.toFixed(2)}`;
    
    let statusText = '';
    if (timeSlot.activity) {
      statusText = timeSlot.isLogged ? 'Logged' : 'Auto-filled';
    } else {
      statusText = 'Empty';
    }

    return {
      timeRange,
      activityName,
      valueDisplay,
      statusText,
    };
  }

  /**
   * Group time slots by day
   */
  groupTimeSlotsByDay(timeSlots: TimeSlot[]): Record<string, TimeSlot[]> {
    const grouped: Record<string, TimeSlot[]> = {};

    timeSlots.forEach(slot => {
      const dateKey = format(slot.startTime, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // Sort slots within each day
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });

    return grouped;
  }

  /**
   * Get configuration
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AppConfig>): void {
    Object.assign(this.config, newConfig);
  }
}

// Export service factory for dependency injection
export const createTimeSlotService = (timeSlotRepository: TimeSlotRepository) => {
  return new TimeSlotService(timeSlotRepository);
};