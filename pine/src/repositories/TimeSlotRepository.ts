import { BaseRepository, QueryFilter } from './BaseRepository';
import { TimeSlot, Activity, AppError, Result, success, failure, isValidTimeSlot } from '../types';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

export interface TimeSlotFilter extends QueryFilter {
  date?: string; // YYYY-MM-DD format
  startDate?: string;
  endDate?: string;
  hasActivity?: boolean;
  activityId?: string;
  minValue?: number;
  maxValue?: number;
  isLogged?: boolean;
}

export class TimeSlotRepository extends BaseRepository<TimeSlot> {
  protected validateEntity(entity: Partial<TimeSlot>): Result<void> {
    if (!isValidTimeSlot(entity)) {
      return failure(new AppError('VALIDATION_ERROR', 'Invalid time slot data'));
    }

    if (!(entity.startTime instanceof Date) || !(entity.endTime instanceof Date)) {
      return failure(new AppError('VALIDATION_ERROR', 'Start time and end time must be Date objects'));
    }

    if (entity.startTime >= entity.endTime) {
      return failure(new AppError('VALIDATION_ERROR', 'Start time must be before end time'));
    }

    if (typeof entity.value !== 'number' || entity.value < 0) {
      return failure(new AppError('VALIDATION_ERROR', 'Value must be a non-negative number'));
    }

    if (typeof entity.isLogged !== 'boolean') {
      return failure(new AppError('VALIDATION_ERROR', 'isLogged must be a boolean'));
    }

    return success(undefined);
  }

  protected generateId(): string {
    return `timeslot_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  protected getStorageKey(id?: string): string {
    return id ? `timeslots/${id}` : 'timeslots';
  }

  protected applyCustomFilters(timeSlots: TimeSlot[], filters: QueryFilter): TimeSlot[] {
    const tsFilters = filters as TimeSlotFilter;
    let filtered = [...timeSlots];

    // Date filtering
    if (tsFilters.date) {
      const targetDate = tsFilters.date;
      filtered = filtered.filter(slot => 
        format(slot.startTime, 'yyyy-MM-dd') === targetDate
      );
    }

    // Date range filtering
    if (tsFilters.startDate) {
      const startDate = parseISO(tsFilters.startDate);
      filtered = filtered.filter(slot => 
        isAfter(slot.startTime, startOfDay(startDate)) || 
        slot.startTime.getTime() === startOfDay(startDate).getTime()
      );
    }

    if (tsFilters.endDate) {
      const endDate = parseISO(tsFilters.endDate);
      filtered = filtered.filter(slot => 
        isBefore(slot.endTime, endOfDay(endDate)) ||
        slot.endTime.getTime() === endOfDay(endDate).getTime()
      );
    }

    // Activity filtering
    if (tsFilters.hasActivity !== undefined) {
      filtered = filtered.filter(slot => 
        tsFilters.hasActivity ? slot.activity !== undefined : slot.activity === undefined
      );
    }

    if (tsFilters.activityId) {
      filtered = filtered.filter(slot => 
        slot.activity?.id === tsFilters.activityId
      );
    }

    // Value filtering
    if (tsFilters.minValue !== undefined) {
      filtered = filtered.filter(slot => slot.value >= tsFilters.minValue!);
    }

    if (tsFilters.maxValue !== undefined) {
      filtered = filtered.filter(slot => slot.value <= tsFilters.maxValue!);
    }

    // Logging status filtering
    if (tsFilters.isLogged !== undefined) {
      filtered = filtered.filter(slot => slot.isLogged === tsFilters.isLogged);
    }

    return filtered;
  }

  // TimeSlot-specific methods
  async findByDate(date: string): Promise<Result<TimeSlot[]>> {
    return this.findAll({ 
      date,
      sortBy: 'startTime',
      sortOrder: 'asc',
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Result<TimeSlot[]>> {
    return this.findAll({
      startDate,
      endDate,
      sortBy: 'startTime',
      sortOrder: 'asc',
    });
  }

  async findByActivity(activityId: string): Promise<Result<TimeSlot[]>> {
    return this.findAll({ 
      activityId,
      sortBy: 'startTime',
      sortOrder: 'desc',
    });
  }

  async findUnloggedSlots(date?: string): Promise<Result<TimeSlot[]>> {
    const filters: TimeSlotFilter = {
      isLogged: false,
      sortBy: 'startTime',
      sortOrder: 'asc',
    };

    if (date) {
      filters.date = date;
    }

    return this.findAll(filters);
  }

  async createTimeSlot(data: {
    startTime: Date;
    endTime: Date;
    activity?: Activity;
  }): Promise<Result<TimeSlot>> {
    const value = data.activity ? data.activity.blockValue : 0;
    
    const timeSlot = {
      startTime: data.startTime,
      endTime: data.endTime,
      activity: data.activity,
      value,
      isLogged: data.activity !== undefined,
    };

    return this.create(timeSlot);
  }

  async logActivity(id: string, activity: Activity | null): Promise<Result<TimeSlot>> {
    const value = activity ? activity.blockValue : 0;
    
    return this.update(id, {
      activity,
      value,
      isLogged: activity !== null,
    });
  }

  async generateDailySlots(date: string, intervalMinutes: number = 30): Promise<Result<TimeSlot[]>> {
    try {
      const targetDate = parseISO(date);
      const slots: TimeSlot[] = [];
      
      // Generate 48 slots for a full day (24 hours * 2 slots per hour)
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
          const startTime = new Date(targetDate);
          startTime.setHours(hour, minute, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + intervalMinutes);

          const slot: Omit<TimeSlot, 'id'> = {
            startTime,
            endTime,
            activity: undefined,
            value: 0,
            isLogged: false,
          };

          const createResult = await this.create(slot);
          if (createResult.success) {
            slots.push(createResult.data);
          }
        }
      }

      return success(slots);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to generate daily slots', error));
    }
  }

  async getDailyStats(date: string): Promise<Result<{
    totalSlots: number;
    loggedSlots: number;
    totalValue: number;
    averageValue: number;
    activitiesCount: number;
    topActivities: Array<{ activity: Activity; count: number; totalValue: number }>;
  }>> {
    try {
      const slotsResult = await this.findByDate(date);
      if (!slotsResult.success) {
        return slotsResult as Result<any>;
      }

      const slots = slotsResult.data;
      const loggedSlots = slots.filter(slot => slot.isLogged);
      const totalValue = slots.reduce((sum, slot) => sum + slot.value, 0);
      const activitiesMap = new Map<string, { activity: Activity; count: number; totalValue: number }>();

      loggedSlots.forEach(slot => {
        if (slot.activity) {
          const key = slot.activity.id;
          const existing = activitiesMap.get(key);
          
          if (existing) {
            existing.count++;
            existing.totalValue += slot.value;
          } else {
            activitiesMap.set(key, {
              activity: slot.activity,
              count: 1,
              totalValue: slot.value,
            });
          }
        }
      });

      const topActivities = Array.from(activitiesMap.values())
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 5);

      return success({
        totalSlots: slots.length,
        loggedSlots: loggedSlots.length,
        totalValue,
        averageValue: loggedSlots.length > 0 ? totalValue / loggedSlots.length : 0,
        activitiesCount: activitiesMap.size,
        topActivities,
      });
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to get daily stats', error));
    }
  }

  async getCurrentTimeSlot(): Promise<Result<TimeSlot | null>> {
    try {
      const now = new Date();
      const currentDate = format(now, 'yyyy-MM-dd');
      
      const slotsResult = await this.findByDate(currentDate);
      if (!slotsResult.success) {
        return slotsResult as Result<TimeSlot | null>;
      }

      const currentSlot = slotsResult.data.find(slot => 
        now >= slot.startTime && now < slot.endTime
      );

      return success(currentSlot || null);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to get current time slot', error));
    }
  }

  async getTimeSlotByTime(date: string, time: Date): Promise<Result<TimeSlot | null>> {
    try {
      const slotsResult = await this.findByDate(date);
      if (!slotsResult.success) {
        return slotsResult as Result<TimeSlot | null>;
      }

      const targetSlot = slotsResult.data.find(slot => 
        time >= slot.startTime && time < slot.endTime
      );

      return success(targetSlot || null);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to get time slot by time', error));
    }
  }

  async getWeeklyStats(startDate: string): Promise<Result<{
    totalValue: number;
    dailyTotals: Record<string, number>;
    mostProductiveDay: string;
    averageDailyValue: number;
  }>> {
    try {
      const endDate = format(
        new Date(parseISO(startDate).getTime() + 6 * 24 * 60 * 60 * 1000),
        'yyyy-MM-dd'
      );

      const slotsResult = await this.findByDateRange(startDate, endDate);
      if (!slotsResult.success) {
        return slotsResult as Result<any>;
      }

      const slots = slotsResult.data;
      const dailyTotals: Record<string, number> = {};
      let totalValue = 0;

      slots.forEach(slot => {
        const date = format(slot.startTime, 'yyyy-MM-dd');
        dailyTotals[date] = (dailyTotals[date] || 0) + slot.value;
        totalValue += slot.value;
      });

      const mostProductiveDay = Object.entries(dailyTotals)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || startDate;

      const averageDailyValue = Object.keys(dailyTotals).length > 0 
        ? totalValue / Object.keys(dailyTotals).length 
        : 0;

      return success({
        totalValue,
        dailyTotals,
        mostProductiveDay,
        averageDailyValue,
      });
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to get weekly stats', error));
    }
  }

  async clearEmptySlots(date: string): Promise<Result<number>> {
    try {
      const slotsResult = await this.findAll({ 
        date, 
        hasActivity: false, 
        isLogged: false 
      });
      
      if (!slotsResult.success) {
        return slotsResult as Result<number>;
      }

      let deletedCount = 0;
      for (const slot of slotsResult.data) {
        const deleteResult = await this.delete(slot.id);
        if (deleteResult.success) {
          deletedCount++;
        }
      }

      return success(deletedCount);
    } catch (error) {
      return failure(new AppError('REPOSITORY_ERROR', 'Failed to clear empty slots', error));
    }
  }
}