# Tools Page Active Cycle Detection Fix

## Issue
The synthetic data generation tool was unable to detect the active survey cycle, showing the error:
```
❌ No active survey cycle found. Please create and activate a cycle first.
```

This occurred even when an active cycle was properly set in the system.

## Root Cause
The `generateSyntheticData` function was making its own API call to fetch the active cycle:
```typescript
const cycleResponse = await fetch('/api/survey-cycles?status=Active');
```

However, the component was already using the `useActiveCycle` hook which provides the active cycle information. The duplicate API call was either:
1. Not finding the cycle due to query parameter issues
2. Timing out or failing silently
3. Not properly parsing the response

## Solution
Updated the `generateSyntheticData` function to use the `activeCycle` from the `useActiveCycle` hook instead of making a separate API call:

### Before
```typescript
// Get active cycle
let activeCycleId = null;
try {
  const cycleResponse = await fetch('/api/survey-cycles?status=Active');
  if (cycleResponse.ok) {
    const cycles = await cycleResponse.json();
    if (cycles.length > 0) {
      activeCycleId = cycles[0].cycle_id;
    }
  }
} catch (error) {
  console.error('Error fetching active cycle:', error);
}

if (!activeCycleId) {
  addResult({
    success: false,
    message: `❌ No active survey cycle found. Please create and activate a cycle first.`
  });
  return;
}
```

### After
```typescript
// Check if active cycle is available
if (!activeCycle || !activeCycle.cycle_id) {
  addResult({
    success: false,
    message: `❌ No active survey cycle found. Please create and activate a cycle in Settings → Survey Cycles.`
  });
  return;
}

const activeCycleId = activeCycle.cycle_id;
```

## Benefits

### 1. **Reliability**
- Uses the same cycle data source as the rest of the component
- No duplicate API calls that could fail
- Consistent behavior across all tools

### 2. **Performance**
- Eliminates unnecessary API call
- Faster execution
- Reduced server load

### 3. **Better Error Messages**
- More specific guidance: "Please create and activate a cycle in Settings → Survey Cycles"
- Helps users understand where to fix the issue

### 4. **Consistency**
- Other functions like `deleteAllResponses` and `debugTrends` already use `activeCycle` from the hook
- Now all functions use the same pattern

## Testing

To verify the fix:

1. **With Active Cycle:**
   - Go to Settings → Survey Cycles
   - Ensure a cycle is marked as "Active"
   - Go to Tools page
   - Select a barangay
   - Click "Generate Synthetic Data"
   - Should work without errors

2. **Without Active Cycle:**
   - Deactivate all cycles
   - Go to Tools page
   - Try to generate synthetic data
   - Should show clear error message with guidance

## Files Modified

**File:** `src/app/tools/page.tsx`
- Updated `generateSyntheticData` function
- Removed duplicate API call
- Uses `activeCycle` from `useActiveCycle` hook

## Related Components

The `useActiveCycle` hook is used throughout the application:
- Dashboard components
- Report card
- Survey forms
- Analytics views

This fix ensures the tools page follows the same pattern as other components.

## Conclusion

The tools page now properly detects the active survey cycle by using the `useActiveCycle` hook instead of making duplicate API calls. This improves reliability, performance, and provides better error messages to users.
