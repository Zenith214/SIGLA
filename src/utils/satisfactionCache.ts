/**
 * Satisfaction Data Cache Utility
 * In-memory cache for satisfaction data with TTL and LRU eviction
 */

import { type SatisfactionData } from './satisfactionDataHelpers';

/**
 * Interface for cached data entry
 */
interface CachedEntry {
  data: SatisfactionData;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_SIZE: 50, // Maximum number of entries
};

/**
 * In-memory cache using Map
 * Key format: `${barangayId}-${cycleId}`
 */
class SatisfactionCache {
  private cache: Map<string, CachedEntry>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key from barangay ID and cycle ID
   */
  private generateKey(barangayId: number, cycleId: number): string {
    return `${barangayId}-${cycleId}`;
  }

  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: CachedEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get data from cache
   * Returns null if not found or expired
   */
  get(barangayId: number, cycleId: number): SatisfactionData | null {
    const key = this.generateKey(barangayId, cycleId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU (move to end)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Set data in cache
   * Implements LRU eviction when cache exceeds max size
   */
  set(barangayId: number, cycleId: number, data: SatisfactionData): void {
    const key = this.generateKey(barangayId, cycleId);
    const now = Date.now();

    const entry: CachedEntry = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_CONFIG.TTL,
    };

    // If key already exists, delete it first (will be re-added at end)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Check if we need to evict (LRU - remove oldest entry)
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      // Get first (oldest) key
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Add new entry (at end of Map)
    this.cache.set(key, entry);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   * Can be called periodically to clean up
   */
  clearExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if cache has a specific entry
   */
  has(barangayId: number, cycleId: number): boolean {
    const key = this.generateKey(barangayId, cycleId);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const satisfactionCache = new SatisfactionCache();

/**
 * Start periodic cleanup of expired entries
 * Runs every 60 seconds to clear expired cache entries
 */
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setInterval(() => {
    satisfactionCache.clearExpired();
    console.log(`Cache cleanup: ${satisfactionCache.size()} entries remaining`);
  }, 60 * 1000); // Run every 60 seconds
}
