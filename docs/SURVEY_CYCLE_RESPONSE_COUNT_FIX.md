# Survey Cycle Response Count Fix

## Issue

The survey cycle history was showing **0 responses collected** even though 150 responses were generated for each barangay. The `responses` field in the `survey_cycle` table was not being updated when survey responses were created.

## Root Cause

The `survey_cycle` table has a `responses` field that was designed to store the count, but:
1. ❌ This field was never being updated when responses were created
2. ❌ The mock data generator updates `survey_target.achieved` but not `survey_cycle.responses`
3. ❌ The `getSurveyCycles()` function just returned the static value from the database

## Solution

Updated the survey cycle helper functions to **dynamically calculate** the actual response count from the `survey_response` table:

### 1. Updated `getSurveyCycles()` Function

**Before**:
```typescript
export async function getSurveyCycles(activeOnly: boolean = false): Promise<SurveyCycle[]> {
  // Just returns the static 'responses' field from database
  const { data: cycles, error } = await query;
  return cycles || [];
}
```

**After**:
```typescript
export async function getSurveyCycles(activeOnly: boolean = false): Promise<SurveyCycle[]> {
  const { data: cycles, error } = await query;
  
  // Calculate actual response counts for each cycle
  const cyclesWithCounts = await Promise.all(
    (cycles || []).map(async (cycle) => {
      // Count unique survey responses for this cycle
      const { count } = await supabaseAdmin
        .from('survey_response')
        .select('response_id', { count: 'exact', head: true })
        .eq('survey_cycle_id', cycle.cycle_id);
      
      return { ...cycle, responses: count || 0 };
    })
  );
  
  return cyclesWithCounts;
}
```

### 2. Updated `getActiveCycle()` Function

**Before**:
```typescript
export async function getActiveCycle(): Promise<SurveyCycle | null> {
  // Just returns the static 'responses' field from database
  const { data: activeCycle, error } = await query;
  return activeCycle;
}
```

**After**:
```typescript
export async function getActiveCycle(): Promise<SurveyCycle | null> {
  const { data: activeCycle, error } = await query;
  
  if (!activeCycle) return null;
  
  // Calculate actual response count for the active cycle
  const { count } = await supabaseAdmin
    .from('survey_response')
    .select('response_id', { count: 'exact', head: true })
    .eq('survey_cycle_id', activeCycle.cycle_id);
  
  return { ...activeCycle, responses: count || 0 };
}
```

## How It Works Now

1. **Survey Response Created**:
   - Response is saved to `survey_response` table with `survey_cycle_id`
   - No need to manually update `survey_cycle.responses`

2. **Survey Cycle Fetched**:
   - System queries `survey_response` table
   - Counts responses where `survey_cycle_id` matches
   - Returns the actual count dynamically

3. **Display**:
   - Survey Cycle History shows: "300 responses collected" (150 from Barangay 17 + 150 from Barangay 18)
   - Always accurate and up-to-date

## Benefits

✅ **Always Accurate**: Response count is calculated from actual data, not a static field  
✅ **No Manual Updates**: No need to update `survey_cycle.responses` when creating responses  
✅ **Real-time**: Count updates automatically when responses are added or deleted  
✅ **Cycle-Aware**: Correctly counts responses per cycle, supporting multiple cycles  

## Testing

1. **Check Current Count**:
   - Go to Settings → Survey Cycles
   - View the "# responses collected" for each cycle
   - Should now show the actual count (e.g., 300 if you have 150 responses from 2 barangays)

2. **Add More Responses**:
   - Generate more mock data
   - Refresh the Survey Cycles page
   - Count should increase automatically

3. **Delete Responses**:
   - Delete some survey responses
   - Refresh the Survey Cycles page
   - Count should decrease automatically

## Database Schema Note

The `survey_cycle.responses` field in the database is now **redundant** but kept for backward compatibility. The system now calculates the count dynamically instead of relying on this field.

**Optional Future Enhancement**: Remove the `responses` field from the `survey_cycle` table since it's no longer used.

## Files Modified

- **src/utils/surveyCycleHelpers.ts**
  - Updated `getSurveyCycles()` to calculate response counts dynamically
  - Updated `getActiveCycle()` to calculate response count dynamically
  - Both functions now query `survey_response` table to get accurate counts

## Impact

- ✅ Survey Cycle History now shows correct response counts
- ✅ Active cycle displays accurate response count
- ✅ No changes needed to mock data generator or response creation logic
- ✅ Works retroactively for all existing cycles and responses
