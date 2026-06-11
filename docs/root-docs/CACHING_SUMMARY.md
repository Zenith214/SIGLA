# Report Card Caching - Summary & Next Steps

## What I Found

The caching system **IS properly implemented** with a two-tier approach:

### Tier 1: Client-Side Cache (In-Memory)
- **Location**: `src/utils/reportCardCache.ts`
- **TTL**: 10 minutes
- **Purpose**: Instant loads when navigating within the same session
- **Status**: ✅ Working correctly

### Tier 2: Server-Side Cache (Database)
- **Location**: `ml_cache` table in Supabase
- **TTL**: 12 hours
- **Strategy**: Stale-while-revalidate (returns old data instantly while refreshing in background)
- **Purpose**: Fast loads across sessions and users
- **Status**: ⚠️ **Needs verification** - may not be working as expected

## The Problem

You're experiencing slow loads every time, which suggests:

1. **Cache is not being saved** to the database, OR
2. **Cache lookups are failing** (wrong key, database issue), OR
3. **Cache is being invalidated** too frequently

Without proper logging, it was impossible to diagnose which of these was happening.

## What I Fixed

### Added Comprehensive Logging

I've added detailed logging throughout the caching system so you can now see exactly what's happening:

**Files Modified:**
1. `src/lib/ml-cache.ts` - Added cache lookup, hit/miss, and save logging
2. `src/app/api/ml/funnel-analysis/route.ts` - Added API-level cache logging

**Log Markers:**
- `🔍 [CACHE]` - Cache lookup operations
- `✅ [CACHE HIT - FRESH]` - Cache hit with fresh data (< 12 hours old)
- `⚠️ [CACHE HIT - STALE]` - Cache hit with stale data (> 12 hours old, returns instantly + refreshes in background)
- `❌ [CACHE MISS]` - Cache miss, computing new data
- `💾 [CACHE SAVE]` - Saving data to cache
- `🔄 [CACHE]` - Background recomputation

## How to Test

### Test 1: Verify Cache is Working

1. **Open your server logs** (where Next.js is running)

2. **Load a report card** for any barangay
   - First load should show: `❌ [CACHE MISS] Computing new data...`
   - Should take 10-30 seconds
   - Should end with: `💾 [CACHE SAVE] Successfully inserted new cache entry`

3. **Reload the same report card** (refresh page or navigate away and back)
   - Second load should show: `✅ [CACHE HIT - FRESH] Data found, expires at ...`
   - Should load in < 1 second

4. **If second load is still slow**, check the logs for:
   - Is it showing `❌ [CACHE MISS]` again? → Cache not being saved or wrong key
   - Is it showing `🔄 [CACHE] Force refresh requested`? → Something is passing `refresh=true`
   - Is there an error message? → Database or permission issue

### Test 2: Check Database Cache

Run this query in your Supabase SQL editor:

```sql
SELECT 
  id,
  endpoint,
  barangay_id,
  cycle_id,
  hit_count,
  computed_at,
  expires_at,
  is_stale,
  last_accessed_at,
  created_at
FROM ml_cache
WHERE endpoint = 'ml-funnel-analysis'
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- ✅ Entries should exist after loading report cards
- ✅ `hit_count` should increase on subsequent loads
- ✅ `expires_at` should be ~12 hours after `computed_at`
- ❌ If no entries exist → Cache is not being saved (check for errors in logs)
- ❌ If `hit_count` is always 0 → Cache is not being hit (key mismatch issue)

## Expected Behavior

| Scenario | Load Time | What You'll See in Logs |
|----------|-----------|------------------------|
| **First time loading a barangay** | 10-30 sec | `❌ [CACHE MISS]` → ML computation → `💾 [CACHE SAVE]` |
| **Second time (within 12 hours)** | < 1 sec | `✅ [CACHE HIT - FRESH]` |
| **After 12 hours** | < 1 sec | `⚠️ [CACHE HIT - STALE]` (returns old data instantly, refreshes in background) |
| **Force refresh button** | 10-30 sec | `🔄 [CACHE] Force refresh requested` |

## Common Issues & Solutions

### Issue: "Second load is still slow"

**Check logs for:**
```
❌ [CACHE MISS] No cache entry found for key: ml-funnel-analysis:abc123...
```

**Possible causes:**
1. Cache key is changing between requests (parameter type mismatch)
2. Database connection issue
3. Cache is being cleared between requests

**Solution:** 
- Compare cache keys in logs between first and second load - they should match exactly
- Check for any errors in the `💾 [CACHE SAVE]` logs

### Issue: "Always shows force refresh"

**Check logs for:**
```
🔄 [CACHE] Force refresh requested, computing new data...
```

**Cause:** The API is receiving `refresh=true` parameter

**Solution:** Check if the report card page is accidentally passing `?refresh=true` in the URL

### Issue: "Cache save errors"

**Check logs for:**
```
❌ [CACHE SAVE] Cache insert error: ...
```

**Possible causes:**
1. Database permissions issue
2. Table doesn't exist
3. Schema mismatch

**Solution:** 
- Verify `ml_cache` table exists in Supabase
- Check Supabase admin client has write permissions
- Verify table schema matches the code

## Next Steps

1. **Load a report card** and watch the server logs
2. **Share the log output** with me if you still see slow loads on the second access
3. **Check the database** using the SQL query above
4. **Report back** with:
   - What you see in the logs (cache hit or miss?)
   - What you see in the database (entries exist? hit_count increasing?)
   - How long the second load takes

With this logging in place, we can quickly identify exactly where the caching is failing and fix it.

## Files Changed

1. `src/lib/ml-cache.ts` - Added comprehensive logging
2. `src/app/api/ml/funnel-analysis/route.ts` - Added API-level logging
3. `REPORT_CARD_CACHING_FIX.md` - Detailed documentation
4. `REPORT_CARD_CACHING_DIAGNOSIS.md` - Diagnostic guide
5. `CACHING_SUMMARY.md` - This file

All changes are **non-breaking** - they only add logging, no functionality changes.
