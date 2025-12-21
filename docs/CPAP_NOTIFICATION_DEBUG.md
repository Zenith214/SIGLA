# CPAP Notification System - Debug & Fixes

## Issues Fixed

### 1. verifyAuth Not Async
**Problem**: The notifications API was using `await verifyAuth(request)` but verifyAuth is synchronous.

**Fix**: Removed `await` from verifyAuth calls in `/api/cpap/notifications/route.ts`

### 2. TypeScript Error with Barangay Data
**Problem**: Supabase returns barangay as an array `[{barangay_name: string}]` instead of a single object.

**Fix**: Added array handling like in cpap-notification.service.ts:
```typescript
const barangay = Array.isArray(cpap?.barangay) ? cpap.barangay[0] : cpap?.barangay;
const barangayName = barangay?.barangay_name || 'Unknown';
```

### 3. Added Debug Logging
Added comprehensive console logging to track notification flow:
- When notification methods are called
- CPAP and user query results
- Notification creation success/failure

## Testing Steps

### 1. Verify Database Migration
Run this in Supabase SQL Editor to check if table exists:
```sql
SELECT * FROM cpap_notifications LIMIT 5;
```

If table doesn't exist, run: `database/add-cpap-notifications.sql`

### 2. Test Comment Notifications

**As Admin:**
1. Open browser console (F12)
2. Go to a CPAP and add a comment
3. Check console for logs like:
   ```
   [Notification] notifyCommentAdded called: {cpapId: 19, commenterId: 1, commenterRole: "admin"}
   [Notification] Admin commented, finding officer for barangay: 5
   [Notification] Officer query result: {officer: {id: 10}, officerError: null}
   [Notification] Creating notification for officer: 10
   [Notification] Notification created successfully
   ```

**As Officer:**
1. Log out and log in as officer
2. Check user dropdown menu (top right)
3. Should see red badge with "1" next to "CPAP Submission"
4. Click "CPAP Submission" - badge should disappear

### 3. Test Update Notifications

**As Officer:**
1. Open an approved CPAP
2. Make a change (update progress, actual output, etc.)
3. Click "Save Changes"
4. Check console for notification logs

**As Admin:**
1. Log in as admin
2. Check dropdown menu - should see badge next to "CPAP Management"

### 4. Check Database
Run this to see all notifications:
```sql
SELECT 
  n.id,
  n.user_id,
  u.firstName || ' ' || u.lastName as user_name,
  u.role,
  n.notification_type,
  n.message,
  n.is_read,
  n.created_at
FROM cpap_notifications n
JOIN "user" u ON u.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 10;
```

## Common Issues

### Badge Not Appearing
1. **Check console for errors** - Look for notification-related errors
2. **Verify database migration** - Run check query above
3. **Check user role** - Badge only shows for correct role (officer/admin)
4. **Wait 30 seconds** - Badge polls every 30 seconds

### Notifications Not Created
1. **Check console logs** - Should see `[Notification]` prefixed messages
2. **Check database permissions** - Run grants in migration script
3. **Verify user assignment** - Officer must be assigned to barangay

### Wrong User Notified
1. **Check barangayDesignation** - Officer must have correct barangay ID
2. **Check role** - User role must be exactly "admin" or "officer" (case-insensitive)

## Files Modified

1. ✅ `src/app/api/cpap/notifications/route.ts` - Removed await from verifyAuth
2. ✅ `src/lib/services/cpap-notification-simple.service.ts` - Fixed barangay array handling, added logging
3. ✅ `src/app/api/cpap/[id]/route.ts` - Added notification on CPAP update
4. ✅ `src/app/api/cpap/[id]/comments/route.ts` - Added notification on comment
5. ✅ `src/components/dashboard/UserDropdown.tsx` - Added badges to menu items
6. ✅ `src/app/cpap/page.tsx` - Added mark-as-read on visit
7. ✅ `src/app/admin/cpap/page.tsx` - Added mark-as-read on visit
8. ✅ `src/components/cpap/CPAPCommentsSidebar.tsx` - Moved button to top

## Next Steps

1. ⏳ Test with real user accounts
2. ⏳ Run timestamp migration (`database/fix-comment-timestamps.sql`)
3. ⏳ Remove debug console.log statements after confirming it works
4. ⏳ Consider adding real-time updates with WebSockets

---

**Status**: ✅ Code Fixed - Ready for Testing
**Debug Mode**: Enabled (console logging active)
