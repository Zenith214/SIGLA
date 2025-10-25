# Complete Cycle Feature

## Overview

Added a "Complete Cycle" button to mark the active survey cycle as completed and deactivate it. This allows you to finish data collection for one cycle and start a new one.

## What Was Added

### 1. UI Component (`src/app/settings/ui/sections/survey-cycles.tsx`)

**Complete Button**:
- Shows next to the active cycle indicator (green checkmark)
- Only visible for the currently active cycle
- Opens a confirmation dialog before completing

**Confirmation Dialog**:
- Shows cycle name and response count
- Warns that the cycle will be deactivated
- Confirms that data will be preserved
- Requires explicit confirmation

### 2. API Endpoint (`src/app/api/survey-cycles/complete/route.ts`)

**POST /api/survey-cycles/complete**:
- Requires admin authentication
- Validates that the cycle exists and is active
- Deactivates the cycle (`is_active = false`)
- Creates an audit log entry
- Returns success confirmation

## How It Works

### Step-by-Step Flow

1. **User clicks "Complete" button** on active cycle
   ```
   Active Cycle: 2025 Q1 (300 responses) [✓] [Complete]
   ```

2. **Confirmation dialog appears**:
   ```
   Complete Survey Cycle
   
   Are you sure you want to mark 2025 Q1 as completed?
   
   This will deactivate the cycle and preserve all collected 
   data (300 responses). You can create a new cycle to 
   continue data collection.
   
   [Cancel] [Complete Cycle]
   ```

3. **System deactivates the cycle**:
   - Sets `is_active = false`
   - Updates `updated_at` timestamp
   - Preserves all survey responses
   - Creates audit log

4. **Result**:
   ```
   Completed Cycle: 2025 Q1 (300 responses) [Inactive]
   No active cycle - Create a new one to continue
   ```

## Use Cases

### Scenario 1: Quarterly Survey Cycles

```
Q1 2025 (Jan-Mar)
├── Collect 300 responses
├── Click "Complete" on March 31
└── Status: Completed ✓

Q2 2025 (Apr-Jun)
├── Create new cycle
├── Set as active
└── Start collecting new responses
```

### Scenario 2: Annual Survey with Trends

```
Year 1 (2025)
├── Collect baseline data
├── Complete cycle
└── Data preserved for comparison

Year 2 (2026)
├── Create new cycle
├── Collect new data
└── System shows trends: ↑ +7% vs 2025
```

## Benefits

✅ **Clean Data Separation**: Each cycle's data is isolated  
✅ **Trend Analysis**: Compare completed cycles over time  
✅ **Data Preservation**: All responses remain intact  
✅ **Clear Workflow**: Explicit start and end for each cycle  
✅ **Audit Trail**: Logs who completed which cycle and when  

## Testing

### Test the Complete Cycle Feature

1. **Go to Settings → Survey Cycles**
2. **Find the active cycle** (has green checkmark)
3. **Click "Complete" button**
4. **Confirm in the dialog**
5. **Verify**:
   - Cycle is now marked as "Inactive"
   - No active cycle warning appears
   - Response count is preserved
   - Can create a new cycle

### Test Cycle Transition

1. **Complete current cycle** (e.g., "2025 Q1")
2. **Create new cycle** (e.g., "2025 Q2")
3. **Set new cycle as active**
4. **Generate mock data** for new cycle
5. **View Report Card**:
   - Should show trends comparing Q2 vs Q1
   - Each cycle's data remains separate

## API Details

### Request

```typescript
POST /api/survey-cycles/complete
Content-Type: application/json

{
  "cycle_id": 1
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Survey cycle completed successfully",
  "data": {
    "cycle_id": 1,
    "name": "2025 Q1",
    "year": 2025
  }
}
```

### Response (Error)

```json
{
  "error": "This cycle is not currently active"
}
```

## Database Changes

**Before Completion**:
```sql
cycle_id | name     | year | is_active | responses
---------|----------|------|-----------|----------
1        | 2025 Q1  | 2025 | true      | 300
```

**After Completion**:
```sql
cycle_id | name     | year | is_active | responses
---------|----------|------|-----------|----------
1        | 2025 Q1  | 2025 | false     | 300
```

**Survey Responses Remain Intact**:
```sql
response_id | survey_cycle_id | barangay_id | status
------------|-----------------|-------------|----------
1           | 1               | 17          | completed
2           | 1               | 17          | completed
...         | ...             | ...         | ...
300         | 1               | 18          | completed
```

## Security

- ✅ Requires admin authentication
- ✅ Validates cycle exists
- ✅ Validates cycle is active
- ✅ Creates audit log entry
- ✅ Cannot complete already completed cycles
- ✅ Cannot complete non-existent cycles

## Future Enhancements

### Cycle Status Field

Currently uses `is_active` boolean. Could add a `status` enum:
- `active` - Currently collecting data
- `completed` - Data collection finished
- `archived` - Old cycle, no longer relevant

### Completion Metadata

Add fields to track completion:
- `completed_at` - Timestamp when cycle was completed
- `completed_by` - User who completed the cycle
- `final_response_count` - Snapshot of responses at completion

### Automatic Completion

Add option to automatically complete cycle when:
- End date is reached
- Target response count is met
- All barangays have submitted data

## Files Modified

1. **src/app/settings/ui/sections/survey-cycles.tsx**
   - Added `completingCycle` state
   - Added `handleCompleteCycleClick()` handler
   - Added `handleCompleteCycleConfirm()` handler
   - Added "Complete" button to active cycle
   - Added confirmation dialog

2. **src/app/api/survey-cycles/complete/route.ts** (NEW)
   - Created POST endpoint
   - Validates cycle and authentication
   - Deactivates cycle
   - Creates audit log

## Reactivating a Completed Cycle

**Yes! You can "un-complete" a cycle** by using the **Set Active** button (Power icon ⚡).

### How to Reactivate

1. **Find the completed cycle** in the list (shows "Inactive" badge)
2. **Click the Power icon** (⚡) button
3. **Confirm reactivation** in the dialog:
   ```
   Set Active Survey Cycle
   
   Are you sure you want to set 2025 Q1 as the active survey cycle?
   
   This will reactivate the cycle and allow you to continue 
   collecting data.
   
   [Cancel] [Set Active]
   ```
4. **Cycle is reactivated**:
   - Status changes to "Active"
   - Can continue collecting responses
   - All existing data preserved

### Use Cases for Reactivation

**Scenario 1: Accidentally Completed**
```
1. Clicked "Complete" by mistake
2. Click Power icon to reactivate
3. Continue data collection
```

**Scenario 2: Need More Data**
```
1. Completed cycle with 300 responses
2. Realized need 50 more responses
3. Reactivate cycle
4. Collect additional responses
5. Complete again when done
```

**Scenario 3: Extended Timeline**
```
1. Completed Q1 cycle early
2. Management extends deadline
3. Reactivate cycle
4. Continue collecting until new deadline
```

## Summary

The Complete Cycle feature provides a clean way to finish data collection for one survey cycle and transition to the next. It preserves all data, enables trend analysis, and maintains a clear audit trail of cycle transitions.

Now you can:
1. ✅ Complete the current cycle
2. ✅ Reactivate a completed cycle (if needed)
3. ✅ Create a new cycle (e.g., "2025 Q2")
4. ✅ Set it as active
5. ✅ Generate new data
6. ✅ See trends comparing cycles!
