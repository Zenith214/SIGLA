# CPAP Cache Fix - Testing Guide

## ✅ Database Verification - PASSED

The database is saving data correctly. Sample data shows:
```json
{
  "id": 409,
  "priority_area": "Environmental Management",
  "observation": "Based on survey data: environmental",
  "plan_of_action": "Build comprehensive waste management system",
  "activity": "To be determined"
}
```

## 🧪 Testing the Cache Fix

### Step 1: Clear Service Worker (One-Time Setup)
1. Open the app in your browser
2. Press `F12` to open DevTools
3. Go to **Application** tab → **Service Workers**
4. Click **Unregister** on any existing service workers
5. Close DevTools
6. **Close ALL tabs** of the app
7. Reopen the app in a new tab

### Step 2: Test the Fix
1. **Navigate to CPAP Editor**: `/cpap/editor`
2. **Open Browser Console** (F12 → Console tab)
3. **Look for these logs**:
   ```
   🔄 [FETCH] Fetching CPAP with cache-busting timestamp: 1703123456789
   🔄 [FETCH] Fetching CPAP details for ID: 18
   ✅ [FETCH] CPAP data loaded: { id: 18, itemCount: 5, ... }
   ```

4. **Edit a field**:
   - Find any row in the spreadsheet
   - Type something in the "Actual Output" field (e.g., "TEST DATA")
   - Type something in the "Status of Accomplishment" field (e.g., "In Progress")

5. **Check console for update logs**:
   ```
   📝 [UPDATE] Row ID 409, Field: actualOutput, Value: TEST DATA
   📝 [UPDATE] Updated row: { ... }
   ```

6. **Click "Save All Changes"**
   - Should see: `💾 Saving item: { id: 409, actual_output: "TEST DATA", ... }`
   - Should see success toast: "CPAP saved successfully. Redirecting to overview..."
   - Page should redirect to `/cpap` after 1 second

7. **Check the Overview Page**:
   - Console should show:
     ```
     🔄 [OVERVIEW] Fetching CPAP with cache-busting timestamp: 1703123457890
     🔄 [OVERVIEW] Fetching CPAP details for ID: 18
     ✅ [OVERVIEW] CPAP data loaded: { id: 18, itemCount: 5, firstItemSample: { actualOutput: "TEST DATA" } }
     ```
   - **CRITICAL**: The `firstItemSample` should show your "TEST DATA"

8. **Verify in the UI**:
   - Click "Edit in Spreadsheet View" button
   - Find the row you edited
   - **The "Actual Output" field should show "TEST DATA"** ✅
   - **NO hard refresh should be needed** ✅

### Step 3: Verify Service Worker Behavior
1. Open DevTools → **Network** tab
2. Filter by "cpap"
3. Look for requests to `/api/cpap/18` (or your CPAP ID)
4. Check the request URL - should have `?_t=1703123456789` parameter
5. Check Response Headers - should NOT have cached response

### Step 4: Check Service Worker Logs
1. Open DevTools → **Console** tab
2. Look for service worker logs:
   ```
   [SW] CPAP API - Network only (no cache): /api/cpap/18
   ```
3. This confirms the service worker is NOT caching CPAP requests

## 🐛 Troubleshooting

### Issue: Still seeing old data after save

**Solution 1: Force Service Worker Update**
```javascript
// Run this in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('✅ All service workers unregistered');
  location.reload();
});
```

**Solution 2: Check if service worker is actually updated**
1. DevTools → Application → Service Workers
2. Check version - should be `pulse-fi-pwa-v6`
3. If still v5, click "Update" or "Skip waiting"

**Solution 3: Test in Incognito/Private Mode**
- Open app in incognito window
- No service worker or cache interference
- If it works here, it's definitely a cache issue

**Solution 4: Check Network Requests**
1. DevTools → Network tab
2. Look for `/api/cpap/18?_t=...` requests
3. If no `?_t=` parameter, the cache-busting isn't working
4. Check if you're on the latest code version

### Issue: Console logs not appearing

**Check:**
1. Console filter is set to "All levels" (not just Errors)
2. "Preserve log" is checked
3. You're looking at the right tab (not a different browser tab)

### Issue: Data saves but doesn't appear in specific fields

**This is the original bug we fixed!**
- Check console for: `📝 [UPDATE] Row ID X, Field: Y, Value: Z`
- If you see `Row X` instead of `Row ID X`, you're on old code
- The fix uses row IDs, not indices

## ✅ Success Criteria

The fix is working if:
1. ✅ Console shows cache-busting timestamps
2. ✅ Console shows "CPAP data loaded" with correct data
3. ✅ Service worker logs show "Network only (no cache)"
4. ✅ Saved data appears immediately after redirect
5. ✅ No hard refresh (Ctrl+Shift+R) needed
6. ✅ Network requests have `?_t=` parameter

## 📊 Expected Console Output (Full Flow)

```
// On Editor Page Load
🔄 [FETCH] Fetching CPAP with cache-busting timestamp: 1703123456789
🔄 [FETCH] Fetching CPAP details for ID: 18
✅ [FETCH] CPAP data loaded: { id: 18, itemCount: 5, firstItemSample: {...} }

// On Field Edit
📝 [UPDATE] Row ID 409, Field: actualOutput, Value: TEST DATA
📝 [UPDATE] Updated row: { id: 409, actualOutput: "TEST DATA", ... }

// On Save
💾 Saving item: { id: 409, actual_output: "TEST DATA", ... }
💾 Total items to save: 5

// After Redirect to Overview
🔄 [OVERVIEW] Fetching CPAP with cache-busting timestamp: 1703123457890
🔄 [OVERVIEW] Fetching CPAP details for ID: 18
✅ [OVERVIEW] CPAP data loaded: { id: 18, itemCount: 5, firstItemSample: { actualOutput: "TEST DATA" } }

// Service Worker (in separate console context)
[SW] CPAP API - Network only (no cache): /api/cpap?barangay_id=1&cycle_id=1&_t=1703123456789
[SW] CPAP API - Network only (no cache): /api/cpap/18?_t=1703123456789
```

## 🎯 Next Steps

If the fix is working:
1. ✅ Mark this issue as resolved
2. ✅ Test with multiple users
3. ✅ Monitor for any edge cases

If still not working:
1. Share console logs (full output)
2. Share Network tab screenshot
3. Share Service Worker status
4. We'll investigate further
