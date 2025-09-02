import { CacheManager } from '../BaseRepository';
import { AppError, Result, success, failure } from '../../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class MemoryCacheManager implements CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private defaultTtl: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize: number = 1000, defaultTtl: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;

    // Start cleanup interval every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  async get<T>(key: string): Promise<Result<T>> {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return failure(new AppError('CACHE_MISS', `Key ${key} not found in cache`));
      }

      const now = Date.now();
      
      // Check if entry has expired
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        return failure(new AppError('CACHE_EXPIRED', `Key ${key} has expired`));
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = now;

      return success(entry.data as T);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', `Failed to get ${key} from cache`, error));
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<Result<void>> {
    try {
      const now = Date.now();
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: now,
        ttl: ttl || this.defaultTtl,
        accessCount: 1,
        lastAccessed: now,
      };

      // Check if we need to evict entries
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictLeastUsed();
      }

      this.cache.set(key, entry);
      return success(undefined);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', `Failed to set ${key} in cache`, error));
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      this.cache.delete(key);
      return success(undefined);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', `Failed to delete ${key} from cache`, error));
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      this.cache.clear();
      return success(undefined);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', 'Failed to clear cache', error));
    }
  }

  async invalidate(pattern: string): Promise<Result<void>> {
    try {
      // Convert pattern to regex
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);

      const keysToDelete: string[] = [];
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));
      return success(undefined);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', `Failed to invalidate pattern ${pattern}`, error));
    }
  }

  // Cache management methods
  getSize(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    let totalAccesses = 0;
    let memoryUsage = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalAccesses += entry.accessCount;
      // Rough memory estimation
      memoryUsage += key.length * 2; // Unicode chars are 2 bytes
      memoryUsage += JSON.stringify(entry.data).length * 2;
      memoryUsage += 64; // Overhead for entry object
    }

    const hitRate = totalAccesses > 0 ? (this.cache.size / totalAccesses) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      memoryUsage,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => this.cache.delete(key));

    console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
  }

  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    let leastUsedKey: string | null = null;
    let leastUsedScore = Infinity;

    const now = Date.now();

    // Calculate LRU score for each entry
    for (const [key, entry] of this.cache.entries()) {
      // Score based on access frequency and recency
      const timeSinceAccess = now - entry.lastAccessed;
      const score = timeSinceAccess / (entry.accessCount + 1);

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      console.log(`Cache eviction: removed least used key ${leastUsedKey}`);
    }
  }

  // Advanced cache operations
  async getMultiple<T>(keys: string[]): Promise<Result<Record<string, T>>> {
    try {
      const result: Record<string, T> = {};
      const missingKeys: string[] = [];

      for (const key of keys) {
        const getResult = await this.get<T>(key);
        if (getResult.success) {
          result[key] = getResult.data;
        } else {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        return failure(new AppError('PARTIAL_CACHE_MISS', `Missing keys: ${missingKeys.join(', ')}`));
      }

      return success(result);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', 'Failed to get multiple keys', error));
    }
  }

  async setMultiple<T>(keyValuePairs: Array<[string, T]>, ttl?: number): Promise<Result<void>> {
    try {
      const promises = keyValuePairs.map(([key, value]) => 
        this.set(key, value, ttl)
      );

      const results = await Promise.all(promises);
      const failedResults = results.filter(result => !result.success);

      if (failedResults.length > 0) {
        return failure(new AppError('CACHE_ERROR', `Failed to set ${failedResults.length} keys`));
      }

      return success(undefined);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', 'Failed to set multiple keys', error));
    }
  }

  async has(key: string): Promise<boolean> {
    const result = await this.get(key);
    return result.success;
  }

  async touch(key: string, ttl?: number): Promise<Result<void>> {
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        return failure(new AppError('CACHE_MISS', `Key ${key} not found`));
      }

      const now = Date.now();
      entry.timestamp = now;
      entry.lastAccessed = now;
      if (ttl !== undefined) {
        entry.ttl = ttl;
      }

      return success(undefined);
    } catch (error) {
      return failure(new AppError('CACHE_ERROR', `Failed to touch ${key}`, error));
    }
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}