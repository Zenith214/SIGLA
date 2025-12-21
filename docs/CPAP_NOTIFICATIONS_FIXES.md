# CPAP Notifications and Timestamp Fixes

## Issues Fixed

### 1. Notification Badge Not Appearing When Saving Changes

**Problem**: When an officer saved changes to an approved CPAP, no notification badge appeared for admins.

**Root Cause**: The notification service was created but not integrated into the CPAP update API route.

**Solution**: 
- Added `CPAPNotificationSimpleService` import to `/api/cpap/[id]/route.ts`
- Added notification trigger after successful CPAP update
- Checks if CPAP status is "Approved" before sending notification
- Only notifies admins when approved CPAPs are updated

**Files Modified**:
- `src/app/api/cpap/[id]/route.ts`
  - Added imports for notification service and supabaseAdmin
  - Added notification call after `updateCPAPItems()`
  - Wrapped in try-catch to prevent notification errors from failing the request

**Code Added**:
```typescript
// Check if CPAP is approved and notify admins of update
try {
  const { data: cpapData } = await supabaseAdmin
    .from('cpaps')
    .select('status')
    .eq('id', cpapId)
    .single();

  if (cpapData?.status === 'Approved') {
    await CPAPNotificationSimpleService.notifyCPAPUpdated(cpapId, user.id);
  }
} catch (notifError) {
  console.error('Error sending update notification:', notifError);
  // Don't fail the request if notification fails
}
```

### 2. Comment Timestamps Showing "8h ago" for Just-Sent Comments

**Problem**: Comments sent "just now" were showing as "8h ago" due to timezone issues.

**Root Cause**: 
- Database columns use `TIMESTAMP` instead of `TIMESTAMPTZ`
- PostgreSQL stores timestamps without timezone information
- When retrieved, timestamps are interpreted as local time instead of UTC
- This causes an 8-hour difference (UTC+8 timezone)

**Solution**:
1. **Database Fix** (Recommended - Run this in Supabase SQL Editor):
   - Created migration script: `database/fix-comment-timestamps.sql`
   - Converts `TIMESTAMP` columns to `TIMESTAMPTZ` (timestamp with timezone)
   - Applies to both `cpap_comments` and `cpap_notifications` tables
   - Preserves existing data by explicitly setting timezone to UTC

2. **Client-Side Fix** (Already Applied):
   - Updated `formatTimestamp()` function in `CPAPCommentsSidebar.tsx`
   - Added comments explaining UTC handling
   - JavaScript `Date` object properly handles ISO strings with timezone info

**Files Created**:
- `database/fix-comment-timestamps.sql` - Migration to fix timestamp columns

**Files Modified**:
- `src/components/cpap/CPAPCommentsSidebar.tsx` - Added comments to timestamp function

## Testing Instructions

### Test Notification System

1. **As Officer**:
   - Open an approved CPAP
   - Make a change (e.g., update progress, actual output, or add comment)
   - Click "Save Changes"
   - Log out

2. **As Admin**:
   - Log in
   - Check user dropdown menu (top right)
   - Should see red badge with "1" next to "CPAP Management"
   - Click "CPAP Management"
   - Badge should disappear

3. **Test Comment Notifications**:
   - As Officer: Add a comment to CPAP
   - As Admin: Should see notification badge
   - As Admin: Add a comment back
   - As Officer: Should see notification badge

### Test Timestamp Fix

**Before running database migration**:
- Comments will show incorrect time (8 hours off)

**After running database migration**:
1. Run `database/fix-comment-timestamps.sql` in Supabase SQL Editor
2. Refresh the page
3. Add a new comment
4. Should show "Just now" immediately
5. Wait 2 minutes, refresh - should show "2m ago"
6. Old comments will now show correct timestamps

## Database Migration Required

**IMPORTANT**: Run this SQL script in Supabase SQL Editor to fix timestamps:

```sql
-- File: database/fix-comment-timestamps.sql

ALTER TABLE cpap_comments 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE cpap_notifications 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
```

## Notification Flow Summary

### When Officer Updates Approved CPAP
1. Officer saves changes to approved CPAP
2. API route checks CPAP status
3. If status is "Approved", notification is created
4. All admins receive notification
5. Badge appears in admin dropdown menu
6. Badge clears when admin visits CPAP management page

### When Comment is Added
1. User adds comment
2. Comment is saved to database
3. Notification service determines recipients:
   - If admin commented → notify officer
   - If officer commented → notify all admins
4. Notification created for recipients
5. Badge appears in recipient's dropdown menu
6. Badge clears when recipient visits their CPAP page

## Files Modified Summary

### Notification Integration
- ✅ `src/app/api/cpap/[id]/route.ts` - Added notification on CPAP update

### Timestamp Fix
- ✅ `database/fix-comment-timestamps.sql` - Created migration script
- ✅ `src/components/cpap/CPAPCommentsSidebar.tsx` - Added comments

### Documentation
- ✅ `docs/CPAP_NOTIFICATIONS_FIXES.md` - This file

## Next Steps

1. ✅ Code changes applied
2. ⏳ Run `database/fix-comment-timestamps.sql` in Supabase SQL Editor
3. ⏳ Test notification system with officer and admin accounts
4. ⏳ Verify timestamps show correctly after migration

## Notes

- Notification errors don't fail the main request (wrapped in try-catch)
- Notifications poll every 30 seconds for updates
- Badge shows count up to 9, then "9+" for 10 or more
- All notifications marked as read when visiting CPAP pages
- Timestamp fix is backward compatible (preserves existing data)

---

**Status**: ✅ Code Complete - Database Migration Required
**Priority**: Run timestamp migration to fix "8h ago" issue
