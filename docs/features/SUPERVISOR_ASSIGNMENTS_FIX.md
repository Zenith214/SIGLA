# Supervisor Assignments - Cycle Awareness Fix

## Issue Identified

The Supervisor Assignments page was showing assignments from **all cycles** (including old 2025 assignments) even when the active cycle was 2026.

## Root Cause

The UI was not filtering assignments by the active cycle when fetching data:

**Before (Line 79):**
```typescript
fetch("/api/supervisor-assignments"),  // ❌ Fetches ALL assignments
```

The API endpoint **does support** cycle filtering via query parameter, but the UI wasn't using it.

## Solution Applied

Updated the `fetchData()` function to include the active cycle_id in the API request:

**After:**
```typescript
const assignmentsUrl = activeCycle?.cycle_id 
  ? `/api/supervisor-assignments?cycle_id=${activeCycle.cycle_id}`
  : "/api/supervisor-assignments"

fetch(assignmentsUrl),  // ✅ Fetches only active cycle assignments
```

## What This Fixes

### Before Fix
- Supervisor Assignments page showed assignments from **all cycles**
- John Mclane's assignment showed "Survey Cycle 2025 (2025)"
- Confusing when active cycle is 2026
- FS dashboard showed "No Assignments" because it correctly filters by active cycle

### After Fix
- Supervisor Assignments page shows **only active cycle assignments**
- If John Mclane has no assignment for 2026, the page will show empty
- Consistent with FS dashboard behavior
- Clear indication of which cycle assignments are for

## Related Issue: FS Dashboard "No Assignments"

The FS dashboard was correctly filtering by active cycle, but John Mclane's assignment was for cycle 2025, not 2026.

### To Fix This

Run this SQL in Supabase SQL Editor to update the assignment to the current cycle:

```sql
-- Check current assignment
SELECT 
  sa.id,
  sa.supervisor_id,
  sa.barangay_id,
  sa.cycle_id,
  sa.status,
  b.barangay_name,
  sc.name as cycle_name,
  sc.year as cycle_year
FROM supervisor_assignments sa
INNER JOIN barangay b ON sa.barangay_id = b.barangay_id
INNER JOIN survey_cycle sc ON sa.cycle_id = sc.cycle_id
WHERE sa.supervisor_id = 5;  -- John Mclane's ID

-- Update to current cycle (2026, cycle_id = 21)
UPDATE supervisor_assignments
SET cycle_id = 21, status = 'Active'
WHERE supervisor_id = 5;
```

## Testing

1. **Refresh the Supervisor Assignments page**
   - Should now show only 2026 assignments
   - Old 2025 assignments won't appear

2. **After running the SQL update**
   - Supervisor Assignments page will show John Mclane → Balacaon (2026)
   - FS dashboard will show the assignment
   - Both pages will be in sync

## Files Modified

- `src/app/settings/ui/sections/supervisor-assignments.tsx` - Added cycle filtering

## API Endpoint

The API already supported cycle filtering:
- **Endpoint**: `/api/supervisor-assignments`
- **Query Parameter**: `?cycle_id={cycle_id}`
- **File**: `src/app/api/supervisor-assignments/route.ts`

## Benefits

✅ **Cycle Awareness** - Only shows relevant assignments  
✅ **Consistency** - Matches FS dashboard behavior  
✅ **Clarity** - Clear which cycle assignments are for  
✅ **Performance** - Fewer records to load and display  
✅ **Data Integrity** - Prevents confusion with old assignments  

## Additional Notes

### Why This Matters

In a multi-cycle survey system:
- Each cycle has its own assignments
- Supervisors may be assigned different barangays each cycle
- Showing old assignments is confusing and misleading
- The active cycle is the only relevant one for current operations

### Future Enhancements

Consider adding:
1. **Cycle Selector** - Allow viewing assignments from previous cycles
2. **Copy Assignments** - Button to copy assignments from previous cycle to current
3. **Assignment History** - View all historical assignments per supervisor
4. **Bulk Update** - Update multiple assignments to new cycle at once

## Summary

The fix ensures that the Supervisor Assignments page is now **cycle-aware** and only displays assignments for the currently active survey cycle, making it consistent with the FS dashboard and preventing confusion from old assignments.
