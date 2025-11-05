# Delete All Responses - Cycle-Scoped Update

## Overview

Updated the "Delete All Responses" functionality to be cycle-scoped, deleting only responses for the selected barangay in the active cycle, making it distinct from "Delete Mock Data".

## Changes Made

### 1. Updated Tools Page (`src/app/tools/page.tsx`)

#### Function: `deleteAllResponses()`

**Before:**
- Deleted ALL responses for a barangay across all cycles
- Same behavior as "Delete Mock Data"
- No cycle awareness

**After:**
- Deletes only responses in the active cycle
- Passes `cycleId` parameter to API
- Shows cycle name in confirmation and messages
- Refreshes barangay list after deletion
- Disabled when no active cycle

**Key Changes:**
```typescript
// Check for active cycle
if (!activeCycle) {
  addResult({ success: false, message: 'No active cycle found' });
  return;
}

// Updated confirmation message
confirm(`Delete ALL responses for ${barangayName} in ${activeCycle.name}?`)

// Pass cycleId to API
fetch(`/api/survey-responses/delete-by-barangay?barangayId=${barangayId}&cycleId=${activeCycle.cycle_id}&confirmWord=DELETE`)

// Refresh barangays list to update counts
await fetchBarangays();
```

#### Button Updates

**Text Changed:**
- Before: "Delete All Responses"
- After: "Delete All (Active Cycle)"

**Disabled Conditions:**
- Added: `!hasActiveCycle` - Disabled when no active cycle set

### 2. Updated API Endpoint (`src/app/api/survey-responses/delete-by-barangay/route.ts`)

#### Added Optional `cycleId` Parameter

**Before:**
- Always used active cycle
- No way to specify different cycle

**After:**
- Accepts optional `cycleId` query parameter
- Falls back to active cycle if not provided
- Validates cycle exists if provided

**Implementation:**
```typescript
const cycleIdParam = searchParams.get('cycleId');

let targetCycle;
if (cycleIdParam) {
  // Use specified cycle
  const cycleResult = await client.query(
    'SELECT * FROM survey_cycle WHERE cycle_id = $1',
    [parseInt(cycleIdParam)]
  );
  targetCycle = cycleResult.rows[0];
} else {
  // Use active cycle
  targetCycle = await getActiveCycle();
}
```

## Functional Differences

### Delete Mock Data
- **Purpose:** Remove test/mock data only
- **Scope:** Barangay-specific, cycle-aware
- **Use Case:** Clean up after testing
- **Button:** Orange outline (warning)

### Delete All (Active Cycle)
- **Purpose:** Remove ALL responses (mock + real) in active cycle
- **Scope:** Barangay + active cycle specific
- **Use Case:** Reset barangay data for current cycle
- **Button:** Red destructive

## User Experience

### Confirmation Dialog

**Before:**
```
Are you sure you want to delete ALL survey responses 
(including real data) for Katipunan (Barangay 6)? 
This action cannot be undone.
```

**After:**
```
Are you sure you want to delete ALL responses for Katipunan 
in PULSE SURVEY 2026? This will delete ALL data (mock and real) 
for this barangay in the active cycle. This action cannot be undone.
```

### Terminal Messages

**Before:**
```
> [SUCCESS] Successfully deleted 150 responses for Katipunan (Barangay 6)
```

**After:**
```
> [SUCCESS] Successfully deleted 150 responses for Katipunan in PULSE SURVEY 2026
```

### Current Action Display

**Before:**
```
Deleting all survey responses...
```

**After:**
```
Deleting all responses for Katipunan in PULSE SURVEY 2026...
```

## Benefits

### Data Safety
✅ **Cycle Isolation** - Won't accidentally delete historical data  
✅ **Clear Scope** - User knows exactly what will be deleted  
✅ **Explicit Cycle** - Cycle name shown in all messages

### Workflow Improvement
✅ **Distinct Functions** - Two delete buttons now have different purposes  
✅ **Cycle-Aware** - Respects active cycle context  
✅ **Better Feedback** - Messages include cycle information

### Testing Flexibility
✅ **Reset Current Cycle** - Clean slate for active cycle  
✅ **Preserve History** - Historical cycles remain intact  
✅ **Quick Cleanup** - Easy to reset and regenerate

## Use Cases

### Scenario 1: Reset Active Cycle Data
```
1. User generated test data in PULSE SURVEY 2026
2. Wants to start fresh for this cycle
3. Clicks "Delete All (Active Cycle)"
4. Only 2026 data deleted, 2025 data preserved
```

### Scenario 2: Clean Up Mock Data
```
1. User generated mock data for testing
2. Wants to remove only mock data
3. Clicks "Delete Mock Data"
4. Only mock/test data removed
```

### Scenario 3: No Active Cycle
```
1. No active cycle set in system
2. "Delete All (Active Cycle)" button disabled
3. User must set active cycle first
4. Prevents accidental deletions
```

## API Behavior

### With cycleId Parameter
```bash
DELETE /api/survey-responses/delete-by-barangay?barangayId=6&cycleId=18&confirmWord=DELETE

Response:
{
  "success": true,
  "message": "Successfully deleted all survey responses for Katipunan in cycle PULSE SURVEY 2026",
  "deletedCount": 150,
  "cycleId": 18,
  "cycleName": "PULSE SURVEY 2026"
}
```

### Without cycleId Parameter (Default)
```bash
DELETE /api/survey-responses/delete-by-barangay?barangayId=6&confirmWord=DELETE

Response:
{
  "success": true,
  "message": "Successfully deleted all survey responses for Katipunan in cycle PULSE SURVEY 2026",
  "deletedCount": 150,
  "cycleId": 18,  // Active cycle
  "cycleName": "PULSE SURVEY 2026"
}
```

## Database Operations

### Cycle-Scoped Deletions

All deletions now include `survey_cycle_id` filter:

```sql
-- Delete sections
DELETE FROM survey_section 
WHERE response_id IN (
  SELECT response_id FROM survey_response 
  WHERE barangay_id = $1 AND survey_cycle_id = $2
)

-- Delete responses
DELETE FROM survey_response 
WHERE barangay_id = $1 AND survey_cycle_id = $2

-- Reset target
UPDATE survey_target 
SET achieved = 0, percentage = 0 
WHERE barangay_id = $1 AND survey_cycle_id = $2
```

## Edge Cases Handled

### No Active Cycle
- Button disabled
- Error message if function called
- Prevents deletion without cycle context

### Invalid Cycle ID
- API returns 404 error
- User-friendly error message
- Transaction rolled back

### No Responses Found
- Returns success with 0 count
- No database changes
- Informative message

### Transaction Failure
- All changes rolled back
- Database remains consistent
- Error logged and returned

## Testing Checklist

- [x] Delete with active cycle works
- [x] Delete with specific cycleId works
- [x] Button disabled when no active cycle
- [x] Confirmation shows cycle name
- [x] Terminal shows cycle name
- [x] Barangay list refreshes after delete
- [x] Only active cycle data deleted
- [x] Historical data preserved
- [x] Target progress reset correctly
- [x] Transaction rollback on error

## Related Files

- **Tools Page:** `src/app/tools/page.tsx`
- **Delete API:** `src/app/api/survey-responses/delete-by-barangay/route.ts`

---

**Created:** October 26, 2025  
**Status:** ✅ Complete and tested  
**Version:** 1.0.0
