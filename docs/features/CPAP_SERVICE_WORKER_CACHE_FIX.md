# CPAP Service Worker Cache Fix

## Problem
After saving CPAP data and redirecting to the overview page, users saw empty/old data instead of the newly saved data. A hard refresh (Ctrl+Shift+R) would show the correct data, confirming it was a caching issue.

## Root Cause
The service worker (`public/sw.js`) was caching ALL API responses, including CPAP GET requests. The flow was:

1. User edits CPAP data in spreadsheet
2. User clicks "Save All Changes"
3. PUT request saves data to database ✅
4. Page redirects to `/cpap` overview
5. Overview page makes GET request to `/api/cpap/[id]`
6. Service worker returns CACHED old data ❌
7. User sees empty fields even though database has the data

## Solution - Multi-Layer Approach

### 1. Service Worker: Exclude CPAP from Caching
Modified the service worker to NEVER cache CPAP API endpoints (`/api/cpap/*`). These endpoints now use a network-only strategy.

### 2. Client-Side: Cache-Busting + Cache Control Headers
Added multiple cache-busting techniques to CPAP fetch requests:
- **Timestamp query parameter**: `?_t=${Date.now()}` forces unique URLs
- **Next.js cache control**: `cache: 'no-store'` disables Next.js caching
- **HTTP headers**: `Cache-Control: no-cache, no-store, must-revalidate` and `Pragma: no-cache`

### 3. Enhanced Logging
Added console logs to track data fetching and verify fresh data is loaded.

## Changes Made

### File: `public/sw.js`

1. **Added CPAP-specific handling** (lines 63-77):
   ```javascript
   // CPAP API endpoints - NEVER cache to ensure fresh data after saves
   if (url.pathname.startsWith('/api/cpap')) {
     event.respondWith(
       fetch(request)
         .then((response) => {
           console.log('[SW] CPAP API - Network only (no cache):', url.pathname);
           return response;
         })
         .catch((error) => {
           // Return error response for failed CPAP API calls
           return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
             status: 503,
             headers: { 'Content-Type': 'application/json' },
           });
         })
     );
     return;
   }
   ```

2. **Updated cache version** to force service worker update:
   - `CACHE_NAME`: `pulse-fi-pwa-v5` → `pulse-fi-pwa-v6`
   - `RUNTIME_CACHE`: `pulse-fi-runtime-v5` → `pulse-fi-runtime-v6`

### File: `src/app/cpap/editor/page.tsx`

Updated `fetchOrCreateCPAP` function with cache-busting:
```typescript
const timestamp = Date.now();
const listResponse = await fetch(
  `/api/cpap?barangay_id=${userBarangayId}&cycle_id=${activeCycle.cycle_id}&_t=${timestamp}`,
  {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  }
);
```

### File: `src/app/cpap/page.tsx`

Same cache-busting approach applied to overview page's `fetchOrCreateCPAP` function.

## Testing

### Before Fix
1. Edit CPAP data (e.g., add "test" to Actual Output field)
2. Click "Save All Changes"
3. Redirect to overview
4. **BUG**: Field shows empty (cached old data)
5. Hard refresh (Ctrl+Shift+R)
6. Field shows "test" (fresh data)

### After Fix
1. Edit CPAP data (e.g., add "test" to Actual Output field)
2. Click "Save All Changes"
3. Redirect to overview
4. **FIXED**: Field shows "test" immediately (fresh data)
5. No hard refresh needed
6. Console logs show: "🔄 [OVERVIEW] Fetching CPAP with cache-busting timestamp: 1703123456789"

## How to Apply

### For Users
1. The service worker will auto-update on next page load
2. Users may need to:
   - Close all tabs of the app
   - Reopen the app
   - Or wait for the service worker to update automatically

### For Testing (Force Immediate Update)
1. Open DevTools → Application → Service Workers
2. Click "Unregister" on the old service worker
3. Refresh the page
4. New service worker will install

### Verify Fix is Working
Check browser console for these logs:
- `🔄 [FETCH] Fetching CPAP with cache-busting timestamp: ...`
- `✅ [FETCH] CPAP data loaded: { id: X, itemCount: Y, ... }`
- `[SW] CPAP API - Network only (no cache): /api/cpap/18`

## Impact

- ✅ CPAP data now appears immediately after save
- ✅ No more stale data issues
- ✅ No hard refresh needed
- ✅ Other API endpoints still benefit from caching
- ✅ Offline functionality preserved for non-CPAP endpoints
- ✅ Enhanced debugging with console logs
- ⚠️ CPAP endpoints require network connection (acceptable trade-off)

## Database Verification

To verify data is being saved correctly, run this SQL in Supabase:
```sql
SELECT 
  id,
  priority_area,
  target_output,
  observation,
  plan_of_action,
  activity,
  actual_output,
  accomplishment_status,
  actual_date
FROM cpap_items
WHERE cpap_id = YOUR_CPAP_ID
ORDER BY id DESC
LIMIT 5;
```

## Related Files
- `public/sw.js` - Service worker with cache fix
- `src/app/cpap/editor/page.tsx` - CPAP editor with cache-busting
- `src/app/cpap/page.tsx` - CPAP overview with cache-busting
- `src/components/cpap/CPAPSpreadsheet.tsx` - Spreadsheet component

## Previous Related Fixes
1. CPAP Type Definitions Fix
2. Row Update Index Bug Fix (using row IDs instead of indices)
3. Actual Date Flexible Input (TEXT instead of DATE)
4. Output Field Required Validation
5. Save Redirect to Overview
6. **Service Worker Cache Fix** (this document)

## Troubleshooting

### If data still doesn't appear:
1. Check browser console for error messages
2. Verify service worker is updated (DevTools → Application → Service Workers)
3. Check Network tab to see if requests have `?_t=` parameter
4. Verify database has the data using SQL query above
5. Try in incognito/private browsing mode
6. Clear all browser cache and cookies
