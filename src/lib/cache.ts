/**
 * In-memory cache utility for API responses
 * Implements a simple TTL-based caching mechanism
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) { // Default 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate a cache key from query parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${prefix}:${sortedParams}`;
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.defaultTTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set data in cache with current timestamp
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Optional: Set expiration timer
    if (ttl) {
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl);
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let count = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }
}

// Export singleton instance with 5-minute TTL
export const apiCache = new Cache(5 * 60 * 1000);

// Export class for custom instances
export { Cache };

/**
 * Decorator function for caching API responses
 */
export function withCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = apiCache.get<T>(cacheKey);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetcher().then(data => {
    apiCache.set(cacheKey, data, ttl);
    return data;
  });
}

/**
 * Cache invalidation helper
 */
export const invalidateCache = {
  /**
   * Invalidate all barangay comparison caches
   */
  barangayComparison: () => {
    return apiCache.clearPattern('^barangay-comparison:');
  },

  /**
   * Invalidate all service area ranking caches
   */
  serviceAreaRankings: () => {
    return apiCache.clearPattern('^service-area-rankings:');
  },

  /**
   * Invalidate all service trends caches
   */
  serviceTrends: () => {
    return apiCache.clearPattern('^service-trends:');
  },

  /**
   * Invalidate all award leaderboard caches
   */
  awardLeaderboard: () => {
    return apiCache.clearPattern('^award-leaderboard:');
  },

  /**
   * Invalidate all analytics caches
   */
  all: () => {
    apiCache.clear();
  },

  /**
   * Invalidate caches for a specific cycle
   */
  cycle: (cycleId: number) => {
    return apiCache.clearPattern(`cycle_id.*${cycleId}`);
  },

  /**
   * Invalidate caches for a specific barangay
   */
  barangay: (barangayId: number) => {
    return apiCache.clearPattern(`barangay.*${barangayId}`);
  }
};
