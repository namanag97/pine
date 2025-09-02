import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageAdapter } from '../BaseRepository';
import { AppError, Result, success, failure } from '../../types';

export class AsyncStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = 'pine') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string): Promise<Result<T>> {
    try {
      const fullKey = this.getKey(key);
      const value = await AsyncStorage.getItem(fullKey);
      
      if (value === null) {
        return failure(new AppError('NOT_FOUND', `Key ${key} not found in storage`));
      }

      const parsed = JSON.parse(value);
      return success(parsed as T);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', `Failed to get ${key} from AsyncStorage`, error));
    }
  }

  async set<T>(key: string, value: T): Promise<Result<void>> {
    try {
      const fullKey = this.getKey(key);
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(fullKey, serialized);
      return success(undefined);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', `Failed to set ${key} in AsyncStorage`, error));
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      const fullKey = this.getKey(key);
      await AsyncStorage.removeItem(fullKey);
      return success(undefined);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', `Failed to delete ${key} from AsyncStorage`, error));
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      const value = await AsyncStorage.getItem(fullKey);
      return value !== null;
    } catch (error) {
      console.error(`Failed to check existence of ${key}:`, error);
      return false;
    }
  }

  async keys(pattern?: string): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const prefixedKeys = allKeys.filter(key => key.startsWith(`${this.prefix}:`));
      
      if (pattern) {
        // Simple pattern matching (supports wildcards with *)
        const regexPattern = pattern
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        const regex = new RegExp(`^${this.prefix}:${regexPattern}$`);
        return prefixedKeys.filter(key => regex.test(key));
      }

      return prefixedKeys.map(key => key.replace(`${this.prefix}:`, ''));
    } catch (error) {
      console.error('Failed to get keys from AsyncStorage:', error);
      return [];
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      const keys = await this.keys();
      const fullKeys = keys.map(key => this.getKey(key));
      await AsyncStorage.multiRemove(fullKeys);
      return success(undefined);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', 'Failed to clear AsyncStorage', error));
    }
  }

  // Batch operations for better performance
  async multiGet<T>(keys: string[]): Promise<Result<Record<string, T>>> {
    try {
      const fullKeys = keys.map(key => this.getKey(key));
      const results = await AsyncStorage.multiGet(fullKeys);
      
      const data: Record<string, T> = {};
      results.forEach(([fullKey, value], index) => {
        if (value !== null) {
          const originalKey = keys[index];
          data[originalKey] = JSON.parse(value) as T;
        }
      });

      return success(data);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', 'Failed to get multiple items from AsyncStorage', error));
    }
  }

  async multiSet<T>(keyValuePairs: Array<[string, T]>): Promise<Result<void>> {
    try {
      const fullKeyValuePairs: Array<[string, string]> = keyValuePairs.map(([key, value]) => [
        this.getKey(key),
        JSON.stringify(value)
      ]);

      await AsyncStorage.multiSet(fullKeyValuePairs);
      return success(undefined);
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', 'Failed to set multiple items in AsyncStorage', error));
    }
  }

  async getSize(): Promise<Result<{ totalSize: number; itemCount: number }>> {
    try {
      const keys = await this.keys();
      const results = await this.multiGet(keys);
      
      if (!results.success) {
        return results as Result<{ totalSize: number; itemCount: number }>;
      }

      let totalSize = 0;
      Object.values(results.data).forEach(value => {
        totalSize += JSON.stringify(value).length;
      });

      return success({
        totalSize,
        itemCount: Object.keys(results.data).length,
      });
    } catch (error) {
      return failure(new AppError('STORAGE_ERROR', 'Failed to get storage size', error));
    }
  }
}