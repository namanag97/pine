import { format, startOfDay, addMinutes, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { TimeSlot, Activity, DailyLog, AppConfig } from '../types';

class TimeSlotService {
  private readonly config: AppConfig = {
    NOTIFICATION_INTERVAL: 30,
    DEFAULT_START_TIME: '00:00',
    DEFAULT_END_TIME: '23:59',
    TIME_SLOT_DURATION: 30,
    CURRENCY_SYMBOL: '₹',
    EXPORT_MAX_RECORDS: 10000,
  };

  /**
   * Generate all 30-minute time slots for a given date
   */
  generateTimeSlotsForDate(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayStart = startOfDay(date);
    
    // Generate exactly 48 slots for full 24-hour coverage (30-minute intervals)
    let currentTime = new Date(dayStart);
    currentTime.setHours(0, 0, 0, 0); // Start at midnight
    
    // Generate 48 slots (24 hours × 2 slots per hour)
    for (let i = 0; i < 48; i++) {
      const slotEndTime = addMinutes(currentTime, this.config.TIME_SLOT_DURATION);
      
      const timeSlot: TimeSlot = {
        id: this.generateTimeSlotId(currentTime),
        startTime: new Date(currentTime),
        endTime: new Date(slotEndTime),
        value: 0,
        isLogged: false,
      };
      
      slots.push(timeSlot);
      currentTime = slotEndTime;
    }
    
    return slots;
  }

  /**
   * Generate a unique ID for a time slot based on start time
   */
  generateTimeSlotId(startTime: Date): string {
    return `slot_${startTime.toISOString()}`;
  }

  /**
   * Create a time slot with an activity
   */
  createTimeSlotWithActivity(startTime: Date, activity: Activity): TimeSlot {
    const endTime = addMinutes(startTime, this.config.TIME_SLOT_DURATION);
    
    return {
      id: this.generateTimeSlotId(startTime),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      activity,
      value: activity.blockValue,
      isLogged: true,
    };
  }

  /**
   * Update a time slot with a new activity
   */
  updateTimeSlotActivity(timeSlot: TimeSlot, activity: Activity | null): TimeSlot {
    return {
      ...timeSlot,
      activity: activity || undefined,
      value: activity ? activity.blockValue : 0,
      isLogged: activity !== null,
    };
  }

  /**
   * Check if a time slot overlaps with existing time slots
   */
  checkTimeSlotConflict(
    newSlot: TimeSlot,
    existingSlots: TimeSlot[]
  ): { hasConflict: boolean; conflictingSlot?: TimeSlot } {
    const conflictingSlot = existingSlots.find(slot => {
      return (
        slot.id !== newSlot.id &&
        ((newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
         (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
         (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime))
      );
    });

    return {
      hasConflict: conflictingSlot !== undefined,
      conflictingSlot,
    };
  }

  /**
   * Validate time slot data
   */
  validateTimeSlot(timeSlot: TimeSlot): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if start time is before end time
    if (timeSlot.startTime >= timeSlot.endTime) {
      errors.push('Start time must be before end time');
    }
    
    // Check if duration is correct (30 minutes)
    const durationMinutes = (timeSlot.endTime.getTime() - timeSlot.startTime.getTime()) / (1000 * 60);
    if (durationMinutes !== this.config.TIME_SLOT_DURATION) {
      errors.push(`Time slot duration must be ${this.config.TIME_SLOT_DURATION} minutes`);
    }
    
    // Check if time slot is within allowed hours
    const startHour = timeSlot.startTime.getHours();
    const startMinute = timeSlot.startTime.getMinutes();
    const endHour = timeSlot.endTime.getHours();
    const endMinute = timeSlot.endTime.getMinutes();
    
    const [configStartHour, configStartMinute] = this.config.DEFAULT_START_TIME.split(':').map(Number);
    const [configEndHour, configEndMinute] = this.config.DEFAULT_END_TIME.split(':').map(Number);
    
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    const configStartMinutes = configStartHour * 60 + configStartMinute;
    const configEndMinutes = configEndHour * 60 + configEndMinute;
    
    if (startTimeMinutes < configStartMinutes || endTimeMinutes > configEndMinutes) {
      errors.push(`Time slot must be within ${this.config.DEFAULT_START_TIME} - ${this.config.DEFAULT_END_TIME}`);
    }
    
    // Check if activity value matches expected value
    if (timeSlot.activity && timeSlot.value !== timeSlot.activity.blockValue) {
      errors.push('Time slot value does not match activity block value');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate daily summary from time slots
   */
  calculateDailyLog(date: Date, timeSlots: TimeSlot[]): DailyLog {
    const dayTimeSlots = timeSlots.filter(slot => 
      isSameDay(slot.startTime, date)
    );

    const totalValue = dayTimeSlots.reduce((sum, slot) => sum + slot.value, 0);
    const activityCount = dayTimeSlots.filter(slot => slot.activity).length;
    const completedSlots = dayTimeSlots.filter(slot => slot.isLogged).length;

    return {
      date: format(date, 'yyyy-MM-dd'),
      timeSlots: dayTimeSlots,
      totalValue,
      activityCount,
      completedSlots,
    };
  }

  /**
   * Get time slots for a specific date range
   */
  getTimeSlotsInRange(
    timeSlots: TimeSlot[],
    startDate: Date,
    endDate: Date
  ): TimeSlot[] {
    return timeSlots.filter(slot =>
      isWithinInterval(slot.startTime, { start: startDate, end: endDate })
    );
  }

  /**
   * Find time slot by time
   */
  findTimeSlotByTime(timeSlots: TimeSlot[], targetTime: Date): TimeSlot | null {
    return timeSlots.find(slot =>
      targetTime >= slot.startTime && targetTime < slot.endTime
    ) || null;
  }

  /**
   * Get current active time slot
   */
  getCurrentTimeSlot(timeSlots: TimeSlot[]): TimeSlot | null {
    const now = new Date();
    return this.findTimeSlotByTime(timeSlots, now);
  }

  /**
   * Get next empty time slot
   */
  getNextEmptyTimeSlot(timeSlots: TimeSlot[], fromTime?: Date): TimeSlot | null {
    const referenceTime = fromTime || new Date();
    
    const futureSlots = timeSlots
      .filter(slot => slot.startTime > referenceTime && !slot.activity)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return futureSlots[0] || null;
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
   * Get time slot statistics
   */
  getTimeSlotStats(timeSlots: TimeSlot[]): {
    total: number;
    filled: number;
    empty: number;
    fillRate: number;
    totalValue: number;
    averageValue: number;
  } {
    const total = timeSlots.length;
    const filled = timeSlots.filter(slot => slot.activity).length;
    const empty = total - filled;
    const fillRate = total > 0 ? (filled / total) * 100 : 0;
    const totalValue = timeSlots.reduce((sum, slot) => sum + slot.value, 0);
    const averageValue = filled > 0 ? totalValue / filled : 0;

    return {
      total,
      filled,
      empty,
      fillRate,
      totalValue,
      averageValue,
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

// Create and export singleton instance
export const timeSlotService = new TimeSlotService();
export default timeSlotService;