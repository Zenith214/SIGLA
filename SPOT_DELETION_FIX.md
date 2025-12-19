# Fix: Spot Deletion Not Updating Assigned Barangay Progress

## Problem
When a spot is deleted in the FS dashboard, the assigned barangay progress in the SupervisorOverview component doesn't update. The progress bars and achievement counts remain the same even though spots (and their associated questionnaires/responses) have been removed.

## Root Cause
The spot deletion API endpoints (`DELETE /api/spots` and `DELETE /api/spots/:spotId`) were deleting spots and their related data but not triggering a recalculation of the `survey_target` table. The SupervisorOverview component fetches progress data from `/api/supervisor-assignments/my-barangays`, which reads from the `survey_target` table.

## Solution

### 1. Updated Spot Deletion APIs
**Files Modified:**
- `src/app/api/spots/route.ts` (DELETE endpoint)
- `src/app/api/spots/[spotId]/route.ts` (DELETE endpoint)

**Changes:**
After successfully deleting a spot, both endpoints now call the `/api/survey-targets/calculate-progress` API to recalculate the survey target progress for the affected barangay.

```typescript
// Recalculate survey target progress for the affected barangay
try {
  const recalcResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/survey-targets/calculate-progress`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barangayId: spot.barangay_id,
        cycleId: spot.cycle_id
      })
    }
  );
} catch (recalcError) {
  console.error('Error recalculating survey target progress:', recalcError);
  // Don't fail the deletion if recalculation fails
}
```

### 2. Enhanced Calculate Progress API
**File Modified:**
- `src/app/api/survey-targets/calculate-progress/route.ts`

**Changes:**
Updated the API to accept both `cycleId` and `barangayId` parameters (in addition to the existing `cycle_id` and `barangay_id` for backward compatibility).

```typescript
// Get optional parameters from request body
const { barangay_id, barangayId, cycle_id, cycleId } = await req.json().catch(() => ({}));

// Support both naming conventions
const targetBarangayId = barangay_id || barangayId;
const targetCycleId = cycle_id || cycleId;

// Get active cycle ID if not provided
const activeCycleId = targetCycleId || await getActiveCycleId();
```

## How It Works

### Before Fix:
1. User deletes a spot
2. Spot, questionnaires, and responses are deleted from database
3. `survey_target` table is NOT updated
4. Dashboard still shows old progress (e.g., "150/150 achieved")
5. User has to manually refresh or wait for next sync

### After Fix:
1. User deletes a spot
2. Spot, questionnaires, and responses are deleted from database
3. API automatically calls `/api/survey-targets/calculate-progress`
4. `survey_target` table is recalculated based on actual survey responses
5. Dashboard immediately shows updated progress (e.g., "145/150 achieved")

## Data Flow

```
User Action: Delete Spot
    ↓
DELETE /api/spots or /api/spots/:spotId
    ↓
Delete spot + questionnaires + responses
    ↓
POST /api/survey-targets/calculate-progress
    ↓
Recalculate: achieved = COUNT(survey_response WHERE status IN ('completed', 'submitted'))
    ↓
UPDATE survey_target SET achieved = X, percentage = Y
    ↓
SupervisorOverview fetches updated data
    ↓
Dashboard shows correct progress
```

## Testing Checklist

- [x] Delete unassigned spot → progress updates
- [x] Delete spot with force flag → progress updates
- [x] Delete spot via /api/spots endpoint → progress updates
- [x] Delete spot via /api/spots/:spotId endpoint → progress updates
- [x] Multiple spots deleted → progress updates correctly
- [x] Deletion fails → progress remains unchanged
- [x] Recalculation fails → spot still deleted (graceful degradation)

## Error Handling

The fix includes graceful error handling:
- If the progress recalculation fails, the spot deletion still succeeds
- Errors are logged but don't block the deletion operation
- This prevents a recalculation failure from leaving the system in an inconsistent state

## Benefits

1. **Real-time Updates**: Dashboard reflects changes immediately
2. **Data Consistency**: Survey targets always match actual response counts
3. **Better UX**: Supervisors see accurate progress without manual refresh
4. **Automatic**: No manual intervention required
5. **Robust**: Graceful error handling prevents blocking operations

## Related Components

- **SupervisorOverview**: Displays barangay progress cards
- **SpotAllocation**: Component where spots are created/deleted
- **survey_target table**: Stores target and achieved counts
- **survey_response table**: Source of truth for actual responses

## Notes

- The recalculation is scoped to the specific barangay and cycle, so it's efficient
- The fix works for both deletion endpoints (with and without spotId parameter)
- Backward compatibility maintained with both parameter naming conventions
- No database schema changes required
