import { StorageAdapter } from '../BaseRepository';
import { AppError, Result, success, failure } from '../../types';
import { supabase } from '../../services/SupabaseService';

interface SupabaseRecord {
  id: string;
  key: string;
  data: any;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  device_id?: string;
}

export class SupabaseAdapter implements StorageAdapter {
  private tableName: string;
  private userId?: string;
  private deviceId?: string;

  constructor(tableName: string = 'app_storage') {
    this.tableName = tableName;
    this.initializeUserContext();
  }

  private async initializeUserContext() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id;

      // Get device ID (you may want to store this in AsyncStorage)
      this.deviceId = await this.getDeviceId();
    } catch (error) {
      console.error('Failed to initialize Supabase user context:', error);
    }
  }

  private async getDeviceId(): Promise<string> {
    // This should be stored in AsyncStorage and reused
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private async ensureUserContext() {
    if (!this.userId || !this.deviceId) {
      await this.initializeUserContext();
    }
  }

  async get<T>(key: string): Promise<Result<T>> {
    try {
      await this.ensureUserContext();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('data')
        .eq('key', key)
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return failure(new AppError('NOT_FOUND', `Key ${key} not found in Supabase`));
        }
        throw error;
      }

      return success(data.data as T);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', `Failed to get ${key} from Supabase`, error));
    }
  }

  async set<T>(key: string, value: T): Promise<Result<void>> {
    try {
      await this.ensureUserContext();

      const record: Partial<SupabaseRecord> = {
        key,
        data: value,
        user_id: this.userId,
        device_id: this.deviceId,
      };

      const { error } = await supabase
        .from(this.tableName)
        .upsert(record, {
          onConflict: 'user_id,key',
        });

      if (error) {
        throw error;
      }

      return success(undefined);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', `Failed to set ${key} in Supabase`, error));
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      await this.ensureUserContext();

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('key', key)
        .eq('user_id', this.userId);

      if (error) {
        throw error;
      }

      return success(undefined);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', `Failed to delete ${key} from Supabase`, error));
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureUserContext();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('key', key)
        .eq('user_id', this.userId)
        .limit(1)
        .single();

      return !error && data !== null;
    } catch (error) {
      console.error(`Failed to check existence of ${key}:`, error);
      return false;
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      await this.ensureUserContext();

      let query = supabase
        .from(this.tableName)
        .select('key')
        .eq('user_id', this.userId);

      if (pattern) {
        // Convert wildcard pattern to SQL LIKE pattern
        const likePattern = pattern.replace(/\*/g, '%').replace(/\?/g, '_');
        query = query.like('key', likePattern);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data?.map(record => record.key) || [];
    } catch (error) {
      console.error('Failed to get keys from Supabase:', error);
      return [];
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      await this.ensureUserContext();

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', this.userId);

      if (error) {
        throw error;
      }

      return success(undefined);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', 'Failed to clear Supabase storage', error));
    }
  }

  // Batch operations for better performance
  async multiGet<T>(keys: string[]): Promise<Result<Record<string, T>>> {
    try {
      await this.ensureUserContext();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('key, data')
        .eq('user_id', this.userId)
        .in('key', keys);

      if (error) {
        throw error;
      }

      const result: Record<string, T> = {};
      data?.forEach(record => {
        result[record.key] = record.data as T;
      });

      return success(result);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', 'Failed to get multiple items from Supabase', error));
    }
  }

  async multiSet<T>(keyValuePairs: Array<[string, T]>): Promise<Result<void>> {
    try {
      await this.ensureUserContext();

      const records: Partial<SupabaseRecord>[] = keyValuePairs.map(([key, value]) => ({
        key,
        data: value,
        user_id: this.userId,
        device_id: this.deviceId,
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(records, {
          onConflict: 'user_id,key',
        });

      if (error) {
        throw error;
      }

      return success(undefined);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', 'Failed to set multiple items in Supabase', error));
    }
  }

  // Supabase-specific methods
  async getByTimeRange(fromTime: Date, toTime: Date): Promise<Result<SupabaseRecord[]>> {
    try {
      await this.ensureUserContext();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', this.userId)
        .gte('created_at', fromTime.toISOString())
        .lte('created_at', toTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return success(data || []);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', 'Failed to get records by time range', error));
    }
  }

  async getUpdatedSince(timestamp: Date): Promise<Result<SupabaseRecord[]>> {
    try {
      await this.ensureUserContext();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', this.userId)
        .gt('updated_at', timestamp.toISOString())
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return success(data || []);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', 'Failed to get updated records', error));
    }
  }

  async testConnection(): Promise<Result<boolean>> {
    try {
      await this.ensureUserContext();

      // Try a simple query to test connection
      const { error } = await supabase
        .from(this.tableName)
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }

      return success(true);
    } catch (error) {
      return failure(new AppError('SUPABASE_ERROR', 'Supabase connection test failed', error));
    }
  }
}