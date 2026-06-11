# Offline Testing Guide for FI Dashboard

## Changes Made

### 1. Improved Service Worker Caching (v5)
- Better error handling for offline API requests
- More detailed logging for cache hits/misses
- Proper cache fallback when network fails

### 2. Enhanced MySpotAssignments Component
- Detects offline mode and shows appropriate message
- Distinguishes between "no assignments" and "offline with no cache"
- Provides "Try Again" button when offline

### 3. Cache Debugging Utilities
- Added `inspectCache()` function to check what's cached
- Added `clearAllCaches()` function to reset cache
- Available in browser console for debugging

## How to Test Offline Functionality

### Step 1: Load Data While Online
1. Open the FI Dashboard in your browser
2. Make sure you're logged in as an interviewer
3. Navigate to the "My Spots" tab
4. Wait for all assignments to load
5. Open browser DevTools (F12) → Console
6. Run: `inspectCache()` to verify data is cached

### Step 2: Go Offline
**Option A: Chrome DevTools**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox at the top

**Option B: Airplane Mode**
1. Enable airplane mode on your device
2. Or disconnect from WiFi/network

### Step 3: Test Offline Access
1. Refresh the page (or close and reopen the app)
2. You should see your cached assignments
3. If you see "You're Offline" message, it means:
   - No cached data was available
   - You need to load data while online first

### Step 4: Verify Cache
In browser console, run:
```javascript
// Check what's cached
inspectCache()

// Should show something like:
// 📦 Available caches: ['pulse-fi-pwa-v5', 'pulse-fi-runtime-v5']
// 📂 Cache: pulse-fi-pwa-v5
//    Items: 15
//    API Endpoints cached:
//    - /api/fi/assignments
//    - /api/barangays-with-assignments
//    - /api/questionnaires/123
```

## Expected Behavior

### When Online
- ✅ Fresh data loaded from server
- ✅ Data automatically cached for offline use
- ✅ Normal functionality

### When Offline (with cached data)
- ✅ Cached assignments displayed
- ✅ Can view spot details
- ✅ Can work with previously loaded data
- ⚠️ Offline indicator shows at top
- ⚠️ Cannot sync new data until online

### When Offline (without cached data)
- ⚠️ Shows "You're Offline" message
- ⚠️ Explains need to connect once
- ✅ "Try Again" button available
- ✅ Will work once you go back online

## Troubleshooting

### Problem: "You're Offline" even though I loaded data
**Solution:**
1. Clear cache: `clearAllCaches()`
2. Go online
3. Refresh page to reload data
4. Check cache: `inspectCache()`
5. Go offline and test again

### Problem: Old data showing
**Solution:**
1. Service worker caches data when online
2. To force refresh: Clear cache and reload while online
3. Or wait for automatic update check (every 30 seconds)

### Problem: Some spots missing offline
**Solution:**
- Only data that was loaded while online is cached
- Make sure to view all spots at least once while online
- Navigate through all tabs to cache all data

## Cache Debugging Commands

Open browser console and use these commands:

```javascript
// Inspect what's cached
inspectCache()

// Clear all caches (requires reload)
clearAllCaches()

// Check if service worker is active
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? 'Active' : 'Not registered');
  if (reg) console.log('State:', reg.active?.state);
});

// Force service worker update
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) reg.update();
});
```

## Important Notes

1. **First Load Must Be Online**: Users must load the app while online at least once to cache data

2. **Cache Scope**: Only API endpoints that were called while online are cached

3. **Cache Updates**: Cache is updated every time you're online and make API calls

4. **Service Worker Updates**: New service worker versions (v5) will automatically update when deployed

5. **PWA Installation**: For best offline experience, install the PWA to home screen

## For Developers

### Testing New Cache Version
1. Update cache version in `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'pulse-fi-pwa-v6'; // Increment
   const RUNTIME_CACHE = 'pulse-fi-runtime-v6';
   ```

2. Deploy changes

3. Users will see update prompt within 30 seconds

4. After update, old caches are automatically cleaned up

### Adding New API Endpoints to Cache
The service worker automatically caches all `/api/*` endpoints. No configuration needed!

### Monitoring Cache in Production
Check browser console logs for:
- `[SW] Cached API response: /api/...` - Data cached
- `[SW] ✅ Using cached API response: /api/...` - Cache hit
- `[SW] ❌ No cache available: /api/...` - Cache miss
