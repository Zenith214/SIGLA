# Offline Mode Implementation Summary

## ✅ What's Already Working

### Service Worker (v5)
- **Automatically caches ALL `/api/*` endpoints**
- Network-first strategy with cache fallback
- No configuration needed for new API endpoints
- Caches responses when online, serves from cache when offline

### Cached API Endpoints
The service worker automatically caches these when you use them online:

**FI Dashboard:**
- `/api/me` - User authentication
- `/api/survey-cycles/active` - Active survey cycle
- `/api/survey-cycles` - All cycles
- `/api/barangays-with-assignments` - Barangay list
- `/api/fi/assignments` - Your spot assignments

**Spot Details:**
- `/api/fi/assignments` - Spot data
- `/api/questionnaires/[id]` - Questionnaire details
- `/api/visits` - Visit records

**Survey Forms:**
- `/api/barangays/[id]` - Barangay details
- `/api/barangays/by-name` - Barangay lookup
- `/api/questionnaire-number` - Generate questionnaire number
- `/api/survey-responses` - Submit survey (queued offline)
- `/api/visits` - Visit tracking

### Offline Storage
- **IndexedDB** stores survey data locally
- Surveys can be filled out completely offline
- Data syncs automatically when back online
- `AutoSync` component handles background sync

## 📱 How It Works

### When Online:
1. User loads FI Dashboard
2. Service worker caches all API responses
3. Data stored in IndexedDB
4. Everything works normally

### When Going Offline:
1. Service worker intercepts API calls
2. Returns cached responses instead of failing
3. User can view cached spots and assignments
4. Can fill out surveys using IndexedDB
5. Submissions queued for sync

### When Back Online:
1. `AutoSync` component detects connection
2. Queued surveys automatically sync
3. Fresh data fetched and cached
4. User sees updated information

## 🎯 User Experience

### FI Dashboard (My Spots)
- ✅ View assigned spots offline
- ✅ See spot progress and status
- ✅ Access spot details
- ⚠️ Shows "You're Offline" if no cached data

### Spot Workflow
- ✅ View spot details offline
- ✅ See interview list
- ✅ Access questionnaires
- ✅ Start new interviews

### Survey Forms
- ✅ Fill out surveys completely offline
- ✅ All data stored in IndexedDB
- ✅ GPS coordinates captured
- ✅ Submissions queued for sync
- ⚠️ Cannot generate new questionnaire numbers offline
- ⚠️ Cannot fetch new barangay data offline

## 🔧 Technical Details

### Service Worker Cache Strategy
```javascript
// Network-first with cache fallback
1. Try to fetch from network
2. If successful, cache the response
3. If network fails (offline), return cached version
4. If no cache, return offline error
```

### Cache Versions
- **Current**: v5
- **Runtime Cache**: v5
- Old caches automatically cleaned up

### Offline Detection
- `OfflineIndicator` component shows connection status
- Components detect "Failed to fetch" errors
- Graceful fallback to cached data

## 📋 Testing Offline Mode

### Step 1: Load Data While Online
1. Open FI Dashboard
2. Navigate to "My Spots"
3. Click on a spot to view details
4. Open a survey form
5. Wait for all data to load

### Step 2: Go Offline
- **DevTools**: Network tab → Check "Offline"
- **Or**: Enable airplane mode

### Step 3: Test Functionality
- ✅ Refresh page - should load from cache
- ✅ Navigate to My Spots - should show assignments
- ✅ Open spot details - should work
- ✅ Fill out survey - should save to IndexedDB
- ✅ Submit survey - should queue for sync

### Step 4: Go Back Online
- ✅ Queued surveys sync automatically
- ✅ Fresh data fetched
- ✅ Cache updated

## 🐛 Debugging

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? 'Registered' : 'Not registered');
  if (reg) console.log('State:', reg.active?.state);
});
```

### Inspect Cache
```javascript
inspectCache() // Shows all cached API endpoints
```

### Clear Cache
```javascript
clearAllCaches() // Removes all cached data
```

### Check Console Logs
Look for these logs:
- `✅ [SW] Service Worker registered successfully`
- `[SW] Cached API response: /api/...`
- `[SW] ✅ Using cached API response: /api/...`
- `[SW] ❌ No cache available: /api/...`

## ⚠️ Limitations

### Cannot Do Offline:
1. **Generate new questionnaire numbers** - Requires server
2. **Fetch new barangay data** - Must be cached first
3. **Submit surveys to database** - Queued until online
4. **Update spot progress** - Syncs when online
5. **Load uncached data** - Must visit while online first

### Must Do Online First:
1. **Initial login** - Authentication requires server
2. **Load assignments** - Must cache at least once
3. **View spot details** - Must open while online first
4. **Access survey forms** - Barangay data must be cached

## 🚀 Best Practices for Field Interviewers

### Before Going to the Field:
1. ✅ Open the app while connected to WiFi
2. ✅ Navigate to "My Spots" and let it load
3. ✅ Open each spot to cache details
4. ✅ Verify data is loaded (run `inspectCache()`)
5. ✅ Test offline mode before leaving

### In the Field (Offline):
1. ✅ Fill out surveys normally
2. ✅ Data saves automatically to device
3. ✅ Continue to next interview
4. ⚠️ Note: Submissions queued for sync

### After Returning (Online):
1. ✅ Connect to WiFi
2. ✅ Open app - auto-sync starts
3. ✅ Wait for "Synced" confirmation
4. ✅ Verify submissions in dashboard

## 📊 Monitoring

### For Admins:
- Check service worker logs in browser console
- Monitor sync queue in IndexedDB
- Track submission timestamps
- Review offline usage patterns

### For Developers:
- Service worker version: v5
- Cache strategy: Network-first with fallback
- Storage: IndexedDB + Service Worker Cache
- Sync: Automatic on reconnection

## 🔄 Updates

### Automatic Updates:
- Service worker checks for updates every 30 seconds
- Updates when app becomes visible
- User sees update prompt
- Click "Update Now" to get latest version

### Manual Update:
1. Clear cache: `clearAllCaches()`
2. Unregister service worker in DevTools
3. Hard refresh (Ctrl+Shift+R)
4. Service worker re-registers automatically

## 📝 Notes

- Service worker only works on HTTPS (or localhost)
- Cache persists across sessions
- IndexedDB has ~50MB storage limit (browser dependent)
- Offline mode requires initial online load
- PWA installation recommended for best experience
