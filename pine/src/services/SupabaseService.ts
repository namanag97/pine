import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StoredActivityLog, StoredDailySummary, SupabaseActivityLog, SupabaseDailySummary } from '../types';

const supabaseUrl = 'https://rytwvofsiltrvdthfbml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dHd2b2ZzaWx0cnZkdGhmYm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTYwOTIsImV4cCI6MjA3MjAzMjA5Mn0.7z_KpJwE0G5rNLr1kO1dYoNDScjXy_oBk0Gp4XfCDvs';

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async syncActivityLog(log: StoredActivityLog): Promise<void> {
    const supabaseLog: SupabaseActivityLog = {
      id: log.id,
      activity_name: log.activityName,
      hourly_value: log.hourlyValue,
      block_value: log.blockValue,
      time_slot_start: log.timeSlotStart,
      time_slot_end: log.timeSlotEnd,
      logged_at: log.loggedAt,
      device_id: log.deviceId,
    };

    const { error } = await this.client
      .from('activity_logs')
      .upsert(supabaseLog);

    if (error) throw error;
  }

  async syncDailySummary(summary: StoredDailySummary): Promise<void> {
    const supabaseSummary: SupabaseDailySummary = {
      id: summary.id,
      date: summary.date,
      total_value: summary.totalValue,
      activity_count: summary.activityCount,
      computed_at: summary.computedAt,
      device_id: summary.deviceId,
    };

    const { error } = await this.client
      .from('daily_summaries')
      .upsert(supabaseSummary);

    if (error) throw error;
  }

  async deleteActivityLog(id: string): Promise<void> {
    const { error } = await this.client
      .from('activity_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteDailySummary(id: string): Promise<void> {
    const { error } = await this.client
      .from('daily_summaries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async fetchActivityLogs(deviceId: string): Promise<StoredActivityLog[]> {
    const { data, error } = await this.client
      .from('activity_logs')
      .select('*')
      .eq('device_id', deviceId);

    if (error) throw error;

    return (data || []).map((item: SupabaseActivityLog): StoredActivityLog => ({
      id: item.id,
      activityName: item.activity_name,
      activityId: '', // Not stored in Supabase
      hourlyValue: item.hourly_value,
      blockValue: item.block_value,
      timeSlotStart: item.time_slot_start,
      timeSlotEnd: item.time_slot_end,
      loggedAt: item.logged_at,
      deviceId: item.device_id,
    }));
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;