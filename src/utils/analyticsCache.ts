/**
 * Client-side caching utility for analytics data
 * Implements TTL-based caching with automatic invalidation
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class AnalyticsCache {
  private cache: Map<string, CacheEntry<any>>
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.cache = new Map()
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${endpoint}?${sortedParams}`
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl
  }

  /**
   * Get data from cache
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key)
      return null
    }

    console.log(`[Analytics Cache] HIT: ${key}`)
    return entry.data as T
  }

  /**
   * Set data in cache
   */
  set<T>(
    endpoint: string, 
    data: T, 
    params?: Record<string, any>, 
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = this.generateKey(endpoint, params)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    console.log(`[Analytics Cache] SET: ${key} (TTL: ${ttl}ms)`)
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(endpoint: string, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params)
    this.cache.delete(key)
    console.log(`[Analytics Cache] INVALIDATE: ${key}`)
  }

  /**
   * Invalidate all cache entries for an endpoint
   */
  invalidateEndpoint(endpoint: string): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(endpoint)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
    console.log(`[Analytics Cache] INVALIDATE ENDPOINT: ${endpoint} (${keysToDelete.length} entries)`)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    console.log(`[Analytics Cache] CLEAR ALL (${size} entries)`)
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (!this.isValid(entry)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.cache.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`[Analytics Cache] CLEANUP: Removed ${keysToDelete.length} expired entries`)
    }
  }
}

// Singleton instance
export const analyticsCache = new AnalyticsCache()

// Auto-cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    analyticsCache.cleanup()
  }, 10 * 60 * 1000)
}

/**
 * Hook for fetching analytics data with caching
 */
export async function fetchWithCache<T>(
  endpoint: string,
  params?: Record<string, any>,
  options?: {
    ttl?: number
    forceRefresh?: boolean
  }
): Promise<T> {
  const { ttl, forceRefresh = false } = options || {}

  // Check cache first
  if (!forceRefresh) {
    const cached = analyticsCache.get<T>(endpoint, params)
    if (cached) {
      return cached
    }
  }

  // Build URL with params
  const url = new URL(endpoint, window.location.origin)
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, String(params[key]))
      }
    })
  }

  // Fetch data
  console.log(`[Analytics Cache] MISS: Fetching ${url.pathname}${url.search}`)
  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }

  const data = await response.json()

  // Cache the result
  analyticsCache.set(endpoint, data, params, ttl)

  return data
}
