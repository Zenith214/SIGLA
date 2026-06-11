# Report Card Caching Fix

## Problem
The report card page was taking forever to load because it appeared to be running the ML algorithm every time instead of using cached results.

## Root Cause Analysis

The caching system **IS** properly implemented with:
- ✅ Server-side database cache (`ml_cache` table)
- ✅ Client-side in-memory cache (`reportCardCache`)
- ✅ 12-hour TTL with stale-while-revalidate strategy
- ✅ Proper cache key generation

However, there was **insufficient logging** to diagnose whether:
1. Cache was being saved properly
2. Cache lookups were succeeding
3. Cache keys were being generated consistently
4. Any errors were occurring during cache operations

## Solution Implemented

### Added Comprehensive Logging

I've added detailed logging throughout the caching flow to help diagnose issues:

#### 1. Cache Lookup Logging (`src/lib/ml-cache.ts`)
```typescript
console.log(`🔍 [CACHE] Looking up cache for endpoint: ${endpoint}`);
console.log(`🔍 [CACHE] Parameters:`, params);
console.log(`🔍 [CACHE] Cache key: ${cacheKey}`);
console.log(`🔍 [CACHE] Force refresh: ${forceRefresh}`);
```

#### 2. Cache Hit/Miss Logging
- **Fresh Cache Hit**: `✅ [CACHE HIT - FRESH] Data found, expires at ...`
- **Stale Cache Hit**: `⚠️ [CACHE HIT - STALE] Returning stale data while revalidating...`
- **Cache Miss**: `❌ [CACHE MISS] No cache entry found for key: ...`

#### 3. Cache Save Logging
```typescript
console.log(`💾 [CACHE SAVE] Saving to cache...`);
console.log(`💾 [CACHE SAVE] Key: ${cacheKey}`);
console.log(`💾 [CACHE SAVE] Barangay ID: ${barangayId}`);
console.log(`💾 [CACHE SAVE] Cycle ID: ${cycleId}`);
console.log(`💾 [CACHE SAVE] Expires at: ${expiresAt}`);
```

#### 4. API Level Logging (`src/app/api/ml/funnel-analysis/route.ts`)
```typescript
console.log(`🔍 [ML FUNNEL] Calling getCachedOrCompute with params:`, {
  barangayId: parseInt(barangayId),
  cycleId: parseInt(cycleId),
  forceRefresh
});
```

## How to Diagnose Now

### Step 1: Check Server Logs
When you load a report card, you should see one of these patterns:

**Pattern A: Cache Hit (Fast Load)**
```
🔍 [ML FUNNEL] Request received - Barangay: 123, Cycle: 1, Refresh: false
✅ [ML FUNNEL] Survey complete (100%) - Proceeding with ML analysis
🔍 [CACHE] Looking up cache for endpoint: ml-funnel-analysis
🔍 [CACHE] Cache key: ml-funnel-analysis:abc123...
✅ [CACHE HIT - FRESH] Data found, expires at 2026-01-20T...
✅ [ML FUNNEL] Returned fresh cached data for barangay 123
```

**Pattern B: Cache Miss (Slow Load - First Time)**
```
🔍 [ML FUNNEL] Request received - Barangay: 123, Cycle: 1, Refresh: false
✅ [ML FUNNEL] Survey complete (100%) - Proceeding with ML analysis
🔍 [CACHE] Looking up cache for endpoint: ml-funnel-analysis
🔍 [CACHE] Cache key: ml-funnel-analysis:abc123...
❌ [CACHE MISS] No cache entry found for key: ml-funnel-analysis:abc123...
❌ [CACHE MISS] Computing new data...
🔄 [ML FUNNEL] Computing funnel analysis for barangay 123, cycle 1...
[ML computation logs...]
💾 [CACHE SAVE] Saving to cache...
✅ [CACHE SAVE] Successfully inserted new cache entry
✅ [ML FUNNEL] Returned newly computed data for barangay 123
```

**Pattern C: Stale Cache Hit (Fast Load + Background Refresh)**
```
🔍 [ML FUNNEL] Request received - Barangay: 123, Cycle: 1, Refresh: false
✅ [ML FUNNEL] Survey complete (100%) - Proceeding with ML analysis
🔍 [CACHE] Looking up cache for endpoint: ml-funnel-analysis
⚠️ [CACHE HIT - STALE] Returning stale data while revalidating in background
🔄 [CACHE] Triggering background recomputation...
✅ [ML FUNNEL] Returned stale cached data for barangay 123
```

### Step 2: Check Database Cache
Query the `ml_cache` table to see cached entries:

```sql
SELECT 
  endpoint,
  barangay_id,
  cycle_id,
  hit_count,
  computed_at,
  expires_at,
  is_stale,
  last_accessed_at
FROM ml_cache
WHERE endpoint = 'ml-funnel-analysis'
ORDER BY computed_at DESC;
```

**What to look for:**
- ✅ Entries exist for your barangay/cycle combinations
- ✅ `hit_count` increases on subsequent loads (shows cache is being used)
- ✅ `expires_at` is in the future (cache is fresh)
- ❌ If `hit_count` is always 0, cache is not being hit
- ❌ If no entries exist, cache is not being saved

### Step 3: Test Cache Behavior

1. **First Load (Should be slow)**:
   - Open report card for a barangay
   - Check logs for `❌ [CACHE MISS]` and `💾 [CACHE SAVE]`
   - Should take 10-30 seconds (ML computation time)

2. **Second Load (Should be instant)**:
   - Refresh the same report card
   - Check logs for `✅ [CACHE HIT - FRESH]`
   - Should load in < 1 second

3. **After 12 Hours (Should be fast with background refresh)**:
   - Load report card after cache expires
   - Check logs for `⚠️ [CACHE HIT - STALE]`
   - Should load instantly with stale data
   - Background recomputation happens without blocking

## Common Issues and Solutions

### Issue 1: Cache Never Hits
**Symptoms**: Always see `❌ [CACHE MISS]` even on second load

**Possible Causes**:
- Cache key generation is inconsistent
- Parameters are being passed with different types (string vs number)
- Database connection issues

**Solution**: Check logs for cache key consistency:
```
First load:  🔍 [CACHE] Cache key: ml-funnel-analysis:abc123...
Second load: 🔍 [CACHE] Cache key: ml-funnel-analysis:abc123...
```
Keys should match exactly.

### Issue 2: Cache Not Being Saved
**Symptoms**: See `❌ [CACHE SAVE] Cache insert error`

**Possible Causes**:
- Database permissions issue
- Table schema mismatch
- Connection timeout

**Solution**: Check the error message in logs and verify:
- `ml_cache` table exists
- Supabase admin client has write permissions
- Table schema matches the cache entry structure

### Issue 3: Force Refresh Always On
**Symptoms**: Always see `🔄 [CACHE] Force refresh requested`

**Possible Causes**:
- Report card page is passing `refresh=true` parameter
- Client-side cache is being cleared on every load

**Solution**: Check the API URL being called:
```typescript
// Should be:
/api/ml/funnel-analysis?barangayId=123&cycleId=1

// NOT:
/api/ml/funnel-analysis?barangayId=123&cycleId=1&refresh=true
```

## Performance Expectations

With caching working properly:

| Scenario | Expected Load Time | Cache Status |
|----------|-------------------|--------------|
| First load (cache miss) | 10-30 seconds | Computing + Saving |
| Subsequent loads (cache hit) | < 1 second | Fresh cache |
| After 12 hours (stale cache) | < 1 second | Stale cache (background refresh) |
| Force refresh | 10-30 seconds | Bypassing cache |

## Next Steps

1. **Monitor the logs** when loading report cards to see which pattern appears
2. **Check the database** to verify cache entries are being created
3. **Test the cache** by loading the same report card twice
4. **Report findings** based on the log patterns observed

If you still see slow loads after the second access to the same report card, share the logs and we can diagnose further.
