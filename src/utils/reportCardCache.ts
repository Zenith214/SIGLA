/**
 * Report Card Cache Utility
 * 
 * Implements in-memory caching for report card data to improve performance
 * and reduce API calls when viewing the same barangay/cycle combinations.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ReportCardCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly TTL: number = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_SIZE: number = 50;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key from barangay ID and cycle ID
   */
  private getCacheKey(barangayId: string | number, cycleId: number, dataType: string): string {
    return `${dataType}-${barangayId}-${cycleId}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(barangayId: string | number, cycleId: number, dataType: string): T | null {
    const key = this.getCacheKey(barangayId, cycleId, dataType);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Cache hit for ${dataType}: barangay ${barangayId}, cycle ${cycleId}`);
    return entry.data as T;
  }

  /**
   * Store data in cache
   */
  set<T>(barangayId: string | number, cycleId: number, dataType: string, data: T): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const key = this.getCacheKey(barangayId, cycleId, dataType);
    const now = Date.now();

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.TTL
    });

    console.log(`💾 Cached ${dataType} for barangay ${barangayId}, cycle ${cycleId}`);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Report card cache cleared');
  }

  /**
   * Clear cache for specific barangay and cycle
   */
  clearForBarangay(barangayId: string | number, cycleId: number): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(`-${barangayId}-${cycleId}`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🗑️ Cleared cache for barangay ${barangayId}, cycle ${cycleId}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      ttl: this.TTL
    };
  }
}

// Export singleton instance
export const reportCardCache = new ReportCardCache();
