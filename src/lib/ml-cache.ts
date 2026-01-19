/**
 * ML Cache Utility
 * Provides caching functionality for expensive ML computations
 * Implements stale-while-revalidate pattern for optimal UX
 */

import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export interface CacheOptions {
  ttl?: number // Time to live in seconds (default: 24 hours)
  staleWhileRevalidate?: boolean // Return stale data while recomputing (default: true)
  forceRefresh?: boolean // Force recomputation even if cache exists
}

export interface CachedResult<T> {
  data: T
  cached: boolean
  stale: boolean
  computedAt: Date
  expiresAt: Date
}

/**
 * Generate a cache key from endpoint and parameters
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key]
      return acc
    }, {} as Record<string, any>)

  const paramString = JSON.stringify(sortedParams)
  const hash = crypto.createHash('md5').update(paramString).digest('hex')
  return `${endpoint}:${hash}`
}

/**
 * Get cached data or compute new data
 */
export async function getCachedOrCompute<T>(
  endpoint: string,
  params: Record<string, any>,
  computeFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<CachedResult<T>> {
  const {
    ttl = 86400, // 24 hours default
    staleWhileRevalidate = true,
    forceRefresh = false
  } = options

  const cacheKey = generateCacheKey(endpoint, params)
  const supabase = supabaseAdmin

  // Check if force refresh is requested
  if (forceRefresh) {
    console.log(`🔄 [${endpoint}] Force refresh - computing...`);
    const data = await computeFn()
    await saveToCache(cacheKey, endpoint, params, data, ttl)
    console.log(`✅ [${endpoint}] Computed and cached`);
    return {
      data,
      cached: false,
      stale: false,
      computedAt: new Date(),
      expiresAt: new Date(Date.now() + ttl * 1000)
    }
  }

  // Try to get from cache
  const { data: cached, error } = await supabase
    .from('ml_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .single()

  const now = new Date()

  // Cache hit - fresh data
  if (cached && new Date(cached.expires_at) > now) {
    console.log(`✅ [${endpoint}] Cache hit (fresh, hits: ${cached.hit_count || 0})`);
    
    // Update hit count and last accessed
    await supabase
      .from('ml_cache')
      .update({
        hit_count: (cached.hit_count || 0) + 1,
        last_accessed_at: now.toISOString()
      })
      .eq('id', cached.id)

    return {
      data: cached.data as T,
      cached: true,
      stale: false,
      computedAt: new Date(cached.computed_at),
      expiresAt: new Date(cached.expires_at)
    }
  }

  // Cache hit - stale data
  if (cached && staleWhileRevalidate) {
    console.log(`⚠️ [${endpoint}] Cache hit (stale) - returning old data, refreshing in background`);
    
    // Return stale data immediately
    const staleResult = {
      data: cached.data as T,
      cached: true,
      stale: true,
      computedAt: new Date(cached.computed_at),
      expiresAt: new Date(cached.expires_at)
    }

    // Trigger background recomputation (don't await)
    recomputeInBackground(cacheKey, endpoint, params, computeFn, ttl)

    return staleResult
  }

  // Cache miss or no stale-while-revalidate - compute now
  console.log(`❌ [${endpoint}] Cache miss - computing...`);
  const data = await computeFn()
  await saveToCache(cacheKey, endpoint, params, data, ttl)
  console.log(`✅ [${endpoint}] Computed and cached`);

  return {
    data,
    cached: false,
    stale: false,
    computedAt: new Date(),
    expiresAt: new Date(Date.now() + ttl * 1000)
  }
}

/**
 * Save data to cache
 */
async function saveToCache<T>(
  cacheKey: string,
  endpoint: string,
  params: Record<string, any>,
  data: T,
  ttl: number
): Promise<void> {
  const supabase = supabaseAdmin
  const now = new Date()
  const expiresAt = new Date(Date.now() + ttl * 1000)

  const cacheEntry = {
    cache_key: cacheKey,
    endpoint,
    cycle_id: params.cycleId || params.cycle_id || null,
    barangay_id: params.barangayId || params.barangay_id || null,
    data: data as any,
    computed_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_stale: false,
    updated_at: now.toISOString()
  }

  // Use upsert to handle race conditions
  const { error } = await supabase
    .from('ml_cache')
    .upsert(cacheEntry, {
      onConflict: 'cache_key',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`❌ [${endpoint}] Cache save failed:`, error.message)
  }
}

/**
 * Recompute data in background (fire and forget)
 */
async function recomputeInBackground<T>(
  cacheKey: string,
  endpoint: string,
  params: Record<string, any>,
  computeFn: () => Promise<T>,
  ttl: number
): Promise<void> {
  try {
    const data = await computeFn()
    await saveToCache(cacheKey, endpoint, params, data, ttl)
  } catch (error) {
    console.error('Background recomputation error:', error)
  }
}

/**
 * Invalidate cache for a specific key
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  const supabase = supabaseAdmin
  await supabase.from('ml_cache').delete().eq('cache_key', cacheKey)
}

/**
 * Invalidate cache by pattern (e.g., all caches for a cycle)
 */
export async function invalidateCachePattern(
  endpoint?: string,
  cycleId?: number,
  barangayId?: number
): Promise<void> {
  const supabase = supabaseAdmin
  let query = supabase.from('ml_cache').delete()

  if (endpoint) {
    query = query.eq('endpoint', endpoint)
  }
  if (cycleId) {
    query = query.eq('cycle_id', cycleId)
  }
  if (barangayId) {
    query = query.eq('barangay_id', barangayId)
  }

  await query
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  const supabase = supabaseAdmin

  const { data: stats } = await supabase
    .from('ml_cache')
    .select('endpoint, hit_count, is_stale, computed_at, expires_at')

  if (!stats) return null

  const now = new Date()
  const totalEntries = stats.length
  const staleEntries = stats.filter((s: any) => s.is_stale || new Date(s.expires_at) < now).length
  const freshEntries = totalEntries - staleEntries
  const totalHits = stats.reduce((sum: number, s: any) => sum + (s.hit_count || 0), 0)
  const avgHitsPerEntry = totalEntries > 0 ? totalHits / totalEntries : 0

  const byEndpoint = stats.reduce((acc: Record<string, { count: number; hits: number }>, s: any) => {
    if (!acc[s.endpoint]) {
      acc[s.endpoint] = { count: 0, hits: 0 }
    }
    acc[s.endpoint].count++
    acc[s.endpoint].hits += s.hit_count || 0
    return acc
  }, {} as Record<string, { count: number; hits: number }>)

  return {
    totalEntries,
    freshEntries,
    staleEntries,
    totalHits,
    avgHitsPerEntry,
    byEndpoint
  }
}

/**
 * Clean up old cache entries
 */
export async function cleanupOldCache(daysOld: number = 30): Promise<number> {
  const supabase = supabaseAdmin
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('ml_cache')
    .delete()
    .lt('computed_at', cutoffDate.toISOString())
    .select('id')

  if (error) {
    console.error('Cache cleanup error:', error)
    return 0
  }

  return data?.length || 0
}
