# CRITICAL: CycleId Missing from API Response

## Issue
The `cycleId` was showing as `undefined` in the survey form URL, causing surveys to be saved with invalid keys like `2026-001-1_undefined` or `2026-001-1_NaN` in IndexedDB. This prevented surveys from being properly retrieved and caused data mapping issues.

### Symptoms:
- URL showed: `/survey/forms?questionnaireId=2026-001-1&cycleId=undefined&spotId=1&barangayId=18`
- Console error: `Survey not found: 2026-001-1_NaN`
- Surveys couldn't be loaded from IndexedDB
- Data appeared scrambled between sections

## Root Cause
The `/api/fi/assignments` endpoint was fetching `cycle_id` from the database but **NOT including it** in the response object when mapping the spot data.

### The Bug:
```typescript
// In src/app/api/fi/assignments/route.ts
return {
  spotId: spot.spot_id,
  spotName: spot.spot_name,
  barangayId: spot.barangay_id,
  barangayName: barangay?.barangay_name || null,
  // ❌ cycleId was MISSING here!
  startingPoint: spot.starting_point,
  ...
}
```

## Solution
Added `cycleId: spot.cycle_id` to the response object mapping.

### The Fix:
```typescript
return {
  spotId: spot.spot_id,
  spotName: spot.spot_name,
  barangayId: spot.barangay_id,
  barangayName: barangay?.barangay_name || null,
  cycleId: spot.cycle_id,  // ✅ Now included!
  startingPoint: spot.starting_point,
  ...
}
```

## Impact
This was a **CRITICAL** bug that affected:
1. **Survey Storage**: Surveys couldn't be saved with proper keys in IndexedDB
2. **Survey Retrieval**: Existing surveys couldn't be loaded
3. **Data Integrity**: Survey data appeared scrambled because it couldn't be properly associated with cycles
4. **Workflow**: Field interviewers couldn't resume surveys or track progress

## Files Modified
- `src/app/api/fi/assignments/route.ts` - Added cycleId to response mapping

## Testing
After this fix:
1. Start a new interview from the FI dashboard
2. Check the URL - it should show a valid cycleId (e.g., `cycleId=1`)
3. Survey should save properly to IndexedDB with key like `2026-001-1_1`
4. Survey can be resumed and data loads correctly

## Note on Existing Data
Surveys that were saved with `undefined` or `NaN` cycleId will need to be:
1. Manually fixed in IndexedDB, OR
2. Re-entered with the correct cycleId

The data mapping issues (wrong questions in wrong sections) were likely a side effect of this bug causing data to be saved/loaded incorrectly.
