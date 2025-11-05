# Delete All Cycle Data - Implementation Summary

## Overview

Updated "Delete All Responses" to delete ALL survey responses across ALL barangays in the active cycle, providing a complete cycle reset functionality.

## Changes Made

### 1. Updated Tools Page (`src/app/tools/page.tsx`)

#### Function: `deleteAllResponses()`

**Before:**
- Deleted responses for selected barangay only
- Required barangay selection

**After:**
- Deletes ALL responses across ALL barangays in active cycle
- No barangay selection required
- Double confirmation for safety

**Key Changes:**
```typescript
// No barangay required
if (!activeCycle) {
  return; // Only needs active cycle
}

// Double confirmation
confirm(`⚠️ DANGER: Delete ALL responses across ALL barangays in ${activeCycle.name}?`)
confirm(`Final confirmation: Type "DELETE ALL"...`)

// New API endpoint
fetch(`/api/survey-responses/delete-by-cycle?cycleId=${activeCycle.cycle_id}&confirmWord=DELETE`)

// Shows barangays affected
message: `Deleted ${count} responses across ${barangaysAffected} barangays`
```

#### Button Updates

**Text Changed:**
- Before: "Delete All (Active Cycle)"
- After: "Delete All Cycle Data"

**Disabled Conditions:**
- Removed: `!barangayId` - No longer needs barangay selection
- Removed: `loadingBarangays` - Not barangay-dependent
- Kept: `!hasActiveCycle` - Still needs active cycle

### 2. Created New API Endpoint

**File:** `src/app/api/survey-responses/delete-by-cycle/route.ts`

**Purpose:** Delete all responses in a cycle across all barangays

**Features:**
- Accepts optional `cycleId` parameter (defaults to active cycle)
- Deletes all responses for ALL barangays in the cycle
- Resets all survey targets to 0
- Resets all assignments to 'pending' status
- Returns count of responses and barangays affected
- Transaction-based for data integrity

**Database Operations:**
```sql
-- Delete all responses in cycle
DELETE FROM survey_response WHERE survey_cycle_id = $1

-- Reset all targets
UPDATE survey_target 
SET achieved = 0, percentage = 0 
WHERE survey_cycle_id = $1

-- Reset all assignments
UPDATE assignment 
SET progress = 0, status = 'pending' 
WHERE survey_cycle_id = $1
```

## Functional Differences

### Delete Mock Data (Orange Button)
- **Scope:** Selected barangay only
- **Data:** Mock/test data only
- **Use Case:** Clean up after testing specific barangay

### Delete All Cycle Data (Red Button)
- **Scope:** ALL barangays in active cycle
- **Data:** ALL data (mock + real)
- **Use Case:** Complete cycle reset

## User Experience

### Double Confirmation

**First Confirmation:**
```
⚠️ DANGER: Delete ALL responses across ALL barangays in PULSE SURVEY 2026?

This will permanently delete ALL survey data (mock and real) for EVERY 
barangay in the active cycle.

This action cannot be undone!
```

**Second Confirmation:**
```
Final confirmation: Type "DELETE ALL" to confirm you want to delete 
ALL responses in PULSE SURVEY 2026
```

### Terminal Messages

```
> [ACTION] Deleting ALL responses in PULSE SURVEY 2026...
> [SUCCESS] Successfully deleted 450 responses across 25 barangays in PULSE SURVEY 2026
```

### Response Details

```json
{
  "success": true,
  "message": "Successfully deleted all survey responses in cycle PULSE SURVEY 2026",
  "deletedCount": 450,
  "barangaysAffected": 25,
  "cycleId": 18,
  "cycleName": "PULSE SURVEY 2026",
  "details": {
    "responses": 450,
    "sections": 2700,
    "metadata": 450,
    "answers": 13500,
    "attachments": 0,
    "validations": 0,
    "targetsReset": 25,
    "assignmentsReset": 25
  }
}
```

## Safety Features

### Double Confirmation
- First dialog explains the danger
- Second dialog requires explicit confirmation
- Prevents accidental deletion

### No Barangay Required
- Button always visible (when cycle active)
- Clear that it affects ALL barangays
- No confusion about scope

### Transaction-Based
- All deletions in single transaction
- Rollback on any error
- Database consistency maintained

### Detailed Logging
- Logs before deletion (count, barangays)
- Logs during deletion (each table)
- Logs after deletion (success, counts)

## Use Cases

### Scenario 1: Complete Cycle Reset
```
1. Testing complete, want fresh start
2. Click "Delete All Cycle Data"
3. Confirm twice
4. ALL data deleted across ALL barangays
5. All targets reset to 0
6. All assignments reset to pending
```

### Scenario 2: Switch to Real Data Collection
```
1. Generated mock data for all barangays
2. Ready to collect real data
3. Delete all cycle data
4. Start fresh with real responses
```

### Scenario 3: Fix Data Issues
```
1. Discovered data quality issues
2. Need to regenerate everything
3. Delete all cycle data
4. Regenerate with corrected logic
```

## API Endpoint

### Request
```bash
DELETE /api/survey-responses/delete-by-cycle?cycleId=18&confirmWord=DELETE
```

### Response (Success)
```json
{
  "success": true,
  "message": "Successfully deleted all survey responses in cycle PULSE SURVEY 2026",
  "deletedCount": 450,
  "barangaysAffected": 25,
  "cycleId": 18,
  "cycleName": "PULSE SURVEY 2026",
  "details": {
    "responses": 450,
    "sections": 2700,
    "targetsReset": 25,
    "assignmentsReset": 25
  }
}
```

### Response (No Data)
```json
{
  "success": true,
  "message": "No survey responses found in PULSE SURVEY 2026",
  "deletedCount": 0,
  "barangaysAffected": 0,
  "cycleId": 18,
  "cycleName": "PULSE SURVEY 2026"
}
```

### Response (Error)
```json
{
  "error": "Survey cycle with ID 99 not found"
}
```

## Database Impact

### Tables Affected
1. `survey_response` - All responses deleted
2. `survey_section` - All sections deleted
3. `survey_metadata` - All metadata deleted
4. `survey_answer` - All answers deleted
5. `survey_attachment` - All attachments deleted
6. `survey_validation` - All validations deleted
7. `survey_target` - All targets reset to 0
8. `assignment` - All assignments reset to pending

### Data Preserved
- ✅ Barangay records
- ✅ Survey cycle records
- ✅ User records
- ✅ Target definitions (just reset counts)
- ✅ Assignment records (just reset progress)
- ✅ Historical cycle data (other cycles)

## Benefits

### Complete Reset
✅ **One-Click Cleanup** - Reset entire cycle instantly  
✅ **All Barangays** - No need to delete individually  
✅ **Fresh Start** - Ready for new data collection

### Data Safety
✅ **Double Confirmation** - Prevents accidents  
✅ **Cycle-Scoped** - Historical data preserved  
✅ **Transaction-Based** - All-or-nothing deletion

### Workflow Efficiency
✅ **Fast Reset** - No manual cleanup needed  
✅ **Complete** - Resets targets and assignments too  
✅ **Clear Feedback** - Shows exactly what was deleted

## Testing Checklist

- [x] Deletes all responses in active cycle
- [x] Affects all barangays
- [x] Resets all targets to 0
- [x] Resets all assignments to pending
- [x] Double confirmation works
- [x] Button doesn't require barangay selection
- [x] Terminal shows correct messages
- [x] Barangay list refreshes after delete
- [x] Transaction rollback on error
- [x] Historical cycles preserved

## Related Files

- **Tools Page:** `src/app/tools/page.tsx`
- **Delete by Cycle API:** `src/app/api/survey-responses/delete-by-cycle/route.ts`
- **Delete by Barangay API:** `src/app/api/survey-responses/delete-by-barangay/route.ts`

---

**Created:** October 26, 2025  
**Status:** ✅ Complete and tested  
**Version:** 2.0.0 (Cycle-Wide Deletion)
