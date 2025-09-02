import { storageService } from './StorageService';
import { supabaseService } from './SupabaseService';
import { StoredActivityLog } from '../types';

class DataSyncService {
  private syncInProgress = false;

  /**
   * Force sync all local data to Supabase
   */
  async syncAllLocalData(): Promise<{ success: boolean; synced: number; errors: string[] }> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, errors: ['Sync already in progress'] };
    }

    this.syncInProgress = true;
    let syncedCount = 0;
    const errors: string[] = [];

    try {
      console.log('🔄 Starting data sync to Supabase...');

      // Get all local activity logs
      const localLogs = await storageService.getAllActivityLogs();
      console.log(`📊 Found ${localLogs.length} local activity logs`);

      // Sync each log
      for (const log of localLogs) {
        try {
          await supabaseService.syncActivityLog(log);
          syncedCount++;
          console.log(`✅ Synced log: ${log.activityName} at ${new Date(log.timeSlotStart).toLocaleString()}`);
        } catch (error) {
          const errorMsg = `Failed to sync log ${log.id}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Get all local daily summaries
      const localSummaries = await storageService.getAllDailySummaries();
      console.log(`📈 Found ${localSummaries.length} local daily summaries`);

      // Sync each summary
      for (const summary of localSummaries) {
        try {
          await supabaseService.syncDailySummary(summary);
          syncedCount++;
          console.log(`✅ Synced summary: ${summary.date} (₹${summary.totalValue})`);
        } catch (error) {
          const errorMsg = `Failed to sync summary ${summary.id}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Save last sync time
      await storageService.saveLastSyncTime(new Date());

      console.log(`🎉 Sync completed: ${syncedCount} items synced, ${errors.length} errors`);
      
      return {
        success: errors.length === 0,
        synced: syncedCount,
        errors
      };

    } catch (error) {
      const errorMsg = `Sync process failed: ${error.message}`;
      errors.push(errorMsg);
      console.error(`💥 ${errorMsg}`);
      
      return {
        success: false,
        synced: syncedCount,
        errors
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Fetch all data from Supabase and merge with local data
   */
  async fetchAndMergeFromSupabase(): Promise<{ success: boolean; fetched: number; errors: string[] }> {
    const errors: string[] = [];
    let fetchedCount = 0;

    try {
      console.log('📥 Fetching data from Supabase...');
      
      // Get device ID
      const deviceId = await storageService.getDeviceId();
      
      // Fetch activity logs from Supabase
      const supabaseLogs = await supabaseService.fetchActivityLogs(deviceId);
      console.log(`📊 Found ${supabaseLogs.length} logs in Supabase`);

      // Get current local logs
      const localLogs = await storageService.getAllActivityLogs();
      const localLogIds = new Set(localLogs.map(log => log.id));

      // Merge missing logs from Supabase
      const missingLogs = supabaseLogs.filter(log => !localLogIds.has(log.id));
      
      if (missingLogs.length > 0) {
        console.log(`📥 Found ${missingLogs.length} missing logs, merging...`);
        
        // Add missing logs to local storage
        const allLogs = [...localLogs, ...missingLogs];
        // Sort by time for consistency
        allLogs.sort((a, b) => a.timeSlotStart.localeCompare(b.timeSlotStart));
        
        // Save merged data
        // Note: This bypasses the normal saveActivityLog to avoid re-syncing
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        await AsyncStorage.setItem('activity_logs', JSON.stringify(allLogs));
        
        fetchedCount = missingLogs.length;
        console.log(`✅ Merged ${missingLogs.length} missing logs`);
      } else {
        console.log('✅ Local data is up to date');
      }

      return {
        success: true,
        fetched: fetchedCount,
        errors
      };

    } catch (error) {
      const errorMsg = `Failed to fetch from Supabase: ${error.message}`;
      errors.push(errorMsg);
      console.error(`💥 ${errorMsg}`);
      
      return {
        success: false,
        fetched: fetchedCount,
        errors
      };
    }
  }

  /**
   * Test Supabase connection
   */
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      const deviceId = await storageService.getDeviceId();
      await supabaseService.fetchActivityLogs(deviceId);
      
      console.log('✅ Supabase connection successful');
      return { connected: true };
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return { 
        connected: false, 
        error: error.message 
      };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    lastSyncTime: Date | null;
    localLogs: number;
    localSummaries: number;
    pendingSync: boolean;
  }> {
    const [lastSyncTime, stats] = await Promise.all([
      storageService.getLastSyncTime(),
      storageService.getStorageStats()
    ]);

    return {
      lastSyncTime,
      localLogs: stats.totalActivityLogs,
      localSummaries: stats.totalDailySummaries,
      pendingSync: this.syncInProgress
    };
  }
}

export const dataSyncService = new DataSyncService();
export default dataSyncService;