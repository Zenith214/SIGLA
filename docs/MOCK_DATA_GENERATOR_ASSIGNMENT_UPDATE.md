# Mock Data Generator - Assignment Creation Update

## ✅ What Was Added

Updated the mock data generator to automatically create and update assignment records when generating survey responses. This enables proper testing of assignment completion metrics and target progress in the Analytics dashboard.

## Problem Solved

### Before
- Mock data generator only created survey responses
- No assignment records were created
- Analytics dashboard showed error: "Error fetching completed assignments count"
- Assignment completion metrics were unavailable
- Target progress worked, but assignment tracking didn't

### After
- Mock data generator creates/updates assignments automatically
- Assignment records linked to interviewer and cycle
- Assignment status updates based on progress (in_progress → completed)
- Assignment completion metrics now work correctly
- Full analytics dashboard functionality enabled

## Implementation

### New Function: `ensureAssignmentExists()`

```typescript
async function ensureAssignmentExists(
  client: any, 
  barangayId: number, 
  interviewerId: number, 
  cycleId: number, 
  progress: number
)
```

**Logic**:
1. Checks if assignment already exists for (barangay + interviewer + cycle)
2. If exists: Updates progress and status
3. If not exists: Creates new assignment
4. Status automatically set based on progress:
   - `in_progress` if progress < 100%
   - `completed` if progress >= 100%

### Integration

Called after each survey response is successfully created and target progress is updated:

```typescript
// Update survey target progress
await client.query('UPDATE survey_target SET achieved = $1, percentage = $2 ...');

// Create or update assignment
await ensureAssignmentExists(client, barangayId, interviewerId, cycleId, newPercentage);
```

## How It Works

### Scenario: Generate 150 Responses for Barangay 17

**Target**: 150 responses
**Interviewer**: ID 1 (default)
**Cycle**: Active cycle

**Progress**:
1. Response 1 created → Assignment created (progress: 1%, status: in_progress)
2. Response 2 created → Assignment updated (progress: 1%, status: in_progress)
3. ...
4. Response 75 created → Assignment updated (progress: 50%, status: in_progress)
5. ...
6. Response 150 created → Assignment updated (progress: 100%, status: completed)

**Result**:
- 1 assignment record for Barangay 17
- Status: completed
- Progress: 100%
- All 150 responses linked to this assignment

## Benefits

### 1. Complete Analytics Data
- ✅ Assignment completion rate now calculated correctly
- ✅ No more "Error fetching completed assignments count"
- ✅ Historical dashboard shows accurate assignment metrics

### 2. Realistic Testing
- ✅ Mimics actual workflow (assignment → responses → completion)
- ✅ Tests assignment tracking functionality
- ✅ Validates analytics calculations

### 3. Progress Tracking
- ✅ Assignment progress updates incrementally
- ✅ Status changes automatically at 100%
- ✅ Matches real-world behavior

## Analytics Dashboard Metrics Now Available

### Historical Cycles Tab
- ✅ **Total Assignments** - Count of assignments per cycle
- ✅ **Completed Assignments** - Count of completed assignments
- ✅ **Assignment Completion Rate** - Percentage of completed assignments
- ✅ **Target Progress** - Survey target achievement

### Overall Analytics Tab
- ✅ **System-wide assignment statistics**
- ✅ **Barangay performance with assignment data**
- ✅ **Completion trends across cycles**

## Database Schema

### Assignment Table
```sql
CREATE TABLE assignment (
  assignment_id SERIAL PRIMARY KEY,
  barangay_id INTEGER REFERENCES barangay(barangay_id),
  user_id INTEGER REFERENCES "user"(id),
  survey_cycle_id INTEGER REFERENCES survey_cycle(cycle_id),
  status VARCHAR(50),  -- 'in_progress' or 'completed'
  progress INTEGER,     -- 0-100
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Assignment Status Values
- `in_progress` - Assignment active, responses being collected
- `completed` - Target reached (100% progress)

## Testing Instructions

### 1. Generate Mock Data
```
1. Go to Tools → Generate Mock Survey Data
2. Select Barangay (e.g., Barangay 17)
3. Set Response Count (e.g., 150)
4. Select Profile (e.g., high-performer)
5. Click "Generate"
```

### 2. Verify Assignment Creation
```sql
SELECT 
  a.assignment_id,
  b.barangay_name,
  u."firstName" || ' ' || u."lastName" as interviewer,
  a.status,
  a.progress,
  sc.name as cycle
FROM assignment a
JOIN barangay b ON a.barangay_id = b.barangay_id
JOIN "user" u ON a.user_id = u.id
JOIN survey_cycle sc ON a.survey_cycle_id = sc.cycle_id
WHERE a.barangay_id = 17;
```

### 3. Check Analytics Dashboard
```
1. Go to Dashboard → Analytics
2. Click "Historical Cycles" tab
3. Select a cycle
4. Verify metrics show:
   - Total Assignments: 1
   - Completed Assignments: 1
   - Assignment Completion Rate: 100%
   - Target Progress: 100%
```

## Edge Cases Handled

### Multiple Generations
- ✅ If you generate more data for same barangay, assignment updates (doesn't duplicate)
- ✅ Progress can exceed 100% (e.g., 150/150 = 100%, then 200/150 = 133%)
- ✅ Status remains "completed" once reached

### Different Interviewers
- ✅ Each interviewer gets separate assignment for same barangay
- ✅ Supports multiple interviewers per barangay per cycle

### Multiple Cycles
- ✅ Assignments are cycle-specific
- ✅ Same barangay can have assignments in different cycles
- ✅ Historical data preserved per cycle

## Limitations

### Current Implementation
- Uses default interviewer ID (1) for all mock data
- All responses for a barangay assigned to same interviewer
- Assignment created even if target not set (progress = 0%)

### Future Enhancements
1. **Multiple Interviewers**: Distribute responses across multiple interviewers
2. **Realistic Distribution**: Some assignments partial, some complete
3. **Assignment Dates**: Set realistic created/updated timestamps
4. **Assignment Notes**: Add notes or comments to assignments

## Files Modified

1. ✅ `src/app/api/tools/generate-mock-survey-data/route.ts`
   - Added `ensureAssignmentExists()` function
   - Integrated assignment creation into response submission
   - Updated progress and status tracking

## Status: ✅ COMPLETE

The mock data generator now creates complete, realistic data including:
- ✅ Survey responses
- ✅ Survey sections
- ✅ Survey targets (updated)
- ✅ Assignments (created/updated)

All analytics dashboard features can now be properly tested with mock data! 🎉
