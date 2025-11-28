# Survey Cycle Delete - Enhanced Logging

## Summary

Added comprehensive console logging to the survey cycle deletion process to help debug deletion failures.

## Changes Made

### 1. API Route Logging (`src/app/api/survey-cycles/route.ts`)

Added detailed logs at every step of the DELETE endpoint:

- **Request received** - Logs when the endpoint is hit
- **Authentication** - Logs auth success/failure
- **Request body** - Logs the full request payload
- **Validation** - Logs missing required fields
- **Delete attempt** - Logs the cycle ID and force flag
- **Delete result** - Logs the complete result object
- **Success/Failure** - Logs final outcome
- **Errors** - Logs full error details including stack trace

### 2. Helper Function Logging (`src/utils/surveyCycleHelpers.ts`)

Added detailed logs throughout the `deleteSurveyCycle` function:

- **Start** - Logs cycle ID and force flag
- **Cycle lookup** - Logs if cycle exists and its details
- **Active check** - Logs if trying to delete active cycle
- **Associated data checks** - Logs counts for:
  - Spots
  - Survey responses
  - Assignments
- **Force delete** - Logs each deletion step:
  - Questionnaires query
  - Visits deletion
  - Questionnaires deletion
  - Spots deletion
  - Survey responses deletion
  - Assignments deletion
  - Final cycle deletion
- **Errors** - Logs all errors with full details and stack traces

## Log Format

All logs use emoji prefixes for easy scanning:

- 🗑️ - Deletion operation
- 🔍 - Lookup/query operation
- ✅ - Success
- ❌ - Error
- ⚠️ - Warning
- 📦 - Data/payload
- 📊 - Statistics/counts
- 🔥 - Force delete operation
- 📝 - Audit log

## Example Log Output

### Successful Deletion (No Associated Data)

```
🗑️ DELETE /api/survey-cycles - Request received
✅ DELETE /api/survey-cycles - Auth successful
📦 DELETE /api/survey-cycles - Request body: {
  "cycle_id": 5,
  "force": false
}
🔍 DELETE /api/survey-cycles - Attempting to delete cycle 5 (force: false)
🗑️ deleteSurveyCycle - Starting deletion for cycle 5 (force: false)
🔍 deleteSurveyCycle - Checking if cycle 5 exists
✅ deleteSurveyCycle - Found cycle: {
  "cycle_id": 5,
  "name": "Test Cycle",
  "year": 2024,
  "is_active": false
}
🔍 deleteSurveyCycle - Checking for associated spots
📊 deleteSurveyCycle - Found 0 spots
🔍 deleteSurveyCycle - Checking for associated survey responses
📊 deleteSurveyCycle - Found 0 survey responses
🔍 deleteSurveyCycle - Checking for associated assignments
📊 deleteSurveyCycle - Found 0 assignments
📊 deleteSurveyCycle - Has associated data: false
🗑️ deleteSurveyCycle - Deleting cycle 5 from survey_cycle table
✅ deleteSurveyCycle - Cycle 5 deleted successfully
📊 DELETE /api/survey-cycles - Delete result: {
  "success": true,
  "message": "Survey cycle \"Test Cycle\" deleted successfully."
}
✅ DELETE /api/survey-cycles - Cycle deleted successfully
```

### Failed Deletion (Has Associated Data, No Force)

```
🗑️ DELETE /api/survey-cycles - Request received
✅ DELETE /api/survey-cycles - Auth successful
📦 DELETE /api/survey-cycles - Request body: {
  "cycle_id": 3,
  "force": false
}
🔍 DELETE /api/survey-cycles - Attempting to delete cycle 3 (force: false)
🗑️ deleteSurveyCycle - Starting deletion for cycle 3 (force: false)
🔍 deleteSurveyCycle - Checking if cycle 3 exists
✅ deleteSurveyCycle - Found cycle: {
  "cycle_id": 3,
  "name": "2024 Survey",
  "year": 2024,
  "is_active": false
}
🔍 deleteSurveyCycle - Checking for associated spots
📊 deleteSurveyCycle - Found 15 spots
🔍 deleteSurveyCycle - Checking for associated survey responses
📊 deleteSurveyCycle - Found 150 survey responses
🔍 deleteSurveyCycle - Checking for associated assignments
📊 deleteSurveyCycle - Found 5 assignments
📊 deleteSurveyCycle - Has associated data: true
⚠️ deleteSurveyCycle - Preventing deletion due to associated data (force not enabled)
📊 DELETE /api/survey-cycles - Delete result: {
  "success": false,
  "message": "Cannot delete survey cycle \"2024 Survey\". It has 15 spots, 150 survey responses, and 5 assignments. Use force delete to remove all associated data.",
  "deletedData": {
    "spotsCount": 15,
    "responsesCount": 150,
    "assignmentsCount": 5
  }
}
⚠️ DELETE /api/survey-cycles - Delete prevented: Cannot delete survey cycle "2024 Survey"...
```

### Force Deletion (With Associated Data)

```
🗑️ DELETE /api/survey-cycles - Request received
✅ DELETE /api/survey-cycles - Auth successful
📦 DELETE /api/survey-cycles - Request body: {
  "cycle_id": 3,
  "force": true
}
🔍 DELETE /api/survey-cycles - Attempting to delete cycle 3 (force: true)
🗑️ deleteSurveyCycle - Starting deletion for cycle 3 (force: true)
🔍 deleteSurveyCycle - Checking if cycle 3 exists
✅ deleteSurveyCycle - Found cycle: {...}
🔍 deleteSurveyCycle - Checking for associated spots
📊 deleteSurveyCycle - Found 15 spots
🔍 deleteSurveyCycle - Checking for associated survey responses
📊 deleteSurveyCycle - Found 150 survey responses
🔍 deleteSurveyCycle - Checking for associated assignments
📊 deleteSurveyCycle - Found 5 assignments
📊 deleteSurveyCycle - Has associated data: true
🔥 deleteSurveyCycle - Force delete enabled, removing all associated data
🔍 deleteSurveyCycle - Fetching questionnaires for cycle 3
📊 deleteSurveyCycle - Found 75 questionnaires
🗑️ deleteSurveyCycle - Deleting visits for 75 questionnaires
✅ deleteSurveyCycle - Visits deleted successfully
🗑️ deleteSurveyCycle - Deleting questionnaires for cycle 3
✅ deleteSurveyCycle - Questionnaires deleted successfully
🗑️ deleteSurveyCycle - Deleting spots for cycle 3
✅ deleteSurveyCycle - Spots deleted successfully
🗑️ deleteSurveyCycle - Deleting survey responses for cycle 3
✅ deleteSurveyCycle - Survey responses deleted successfully
🗑️ deleteSurveyCycle - Deleting assignments for cycle 3
✅ deleteSurveyCycle - Assignments deleted successfully
🗑️ deleteSurveyCycle - Deleting cycle 3 from survey_cycle table
✅ deleteSurveyCycle - Cycle 3 deleted successfully
📊 DELETE /api/survey-cycles - Delete result: {...}
✅ DELETE /api/survey-cycles - Cycle deleted successfully
```

### Error Case

```
🗑️ DELETE /api/survey-cycles - Request received
✅ DELETE /api/survey-cycles - Auth successful
📦 DELETE /api/survey-cycles - Request body: {
  "cycle_id": 999,
  "force": false
}
🔍 DELETE /api/survey-cycles - Attempting to delete cycle 999 (force: false)
🗑️ deleteSurveyCycle - Starting deletion for cycle 999 (force: false)
🔍 deleteSurveyCycle - Checking if cycle 999 exists
❌ deleteSurveyCycle - Error fetching cycle: {
  "code": "PGRST116",
  "message": "No rows found"
}
❌ deleteSurveyCycle - Fatal error: Error: Survey cycle not found: No rows found
❌ deleteSurveyCycle - Error stack: Error: Survey cycle not found...
❌ DELETE /api/survey-cycles - Error: Error: Failed to delete survey cycle: Survey cycle not found: No rows found
❌ DELETE /api/survey-cycles - Error stack: Error: Failed to delete survey cycle...
```

## Debugging Guide

### Common Issues

#### 1. Cycle Not Found
**Logs to check:**
- `❌ deleteSurveyCycle - Cycle X not found in database`
- `❌ deleteSurveyCycle - Error fetching cycle`

**Solution:** Verify the cycle_id exists in the database

#### 2. Active Cycle Deletion Attempt
**Logs to check:**
- `⚠️ deleteSurveyCycle - Cannot delete active cycle X`

**Solution:** Deactivate the cycle first before deletion

#### 3. Associated Data Preventing Deletion
**Logs to check:**
- `📊 deleteSurveyCycle - Found X spots`
- `📊 deleteSurveyCycle - Found X survey responses`
- `📊 deleteSurveyCycle - Found X assignments`
- `⚠️ deleteSurveyCycle - Preventing deletion due to associated data`

**Solution:** Use force delete or manually remove associated data

#### 4. Foreign Key Constraint Errors
**Logs to check:**
- `❌ deleteSurveyCycle - Error deleting [table]`
- Look for Supabase error codes and messages

**Solution:** Check database foreign key constraints and deletion order

#### 5. Permission Errors
**Logs to check:**
- `❌ DELETE /api/survey-cycles - Auth failed`

**Solution:** Ensure user has admin role

## Testing

To test the logging:

1. **Open browser console** (F12)
2. **Open terminal** running the dev server
3. **Attempt to delete a cycle** from the UI
4. **Check both consoles** for log output

### Test Cases

1. **Delete cycle with no data** - Should succeed
2. **Delete cycle with data (no force)** - Should fail with counts
3. **Delete cycle with data (force)** - Should succeed with cascade
4. **Delete active cycle** - Should fail
5. **Delete non-existent cycle** - Should error

## Files Modified

- `src/app/api/survey-cycles/route.ts` - Added API route logging
- `src/utils/surveyCycleHelpers.ts` - Added helper function logging

## Benefits

1. **Easy debugging** - See exactly where the process fails
2. **Data visibility** - Know what data exists before deletion
3. **Error tracking** - Full error messages and stack traces
4. **Performance monitoring** - See how long each step takes
5. **Audit trail** - Complete log of deletion attempts

## Next Steps

When you encounter a deletion failure:

1. Check the browser console for client-side errors
2. Check the server terminal for detailed logs
3. Look for the specific error emoji (❌)
4. Read the error message and context
5. Follow the debugging guide above

---

**Status**: ✅ Complete
**Date**: 2025-11-27
**Purpose**: Debug survey cycle deletion failures
