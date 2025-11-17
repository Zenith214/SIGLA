# Subsequent Visit Workflow Implementation

## Overview

This document summarizes the implementation of Task 15: "Implement subsequent visit workflow" from the CSIS workflow upgrade specification. This task enables Field Interviewers to resume incomplete interviews from previous visits and implements automatic flagging for substitution after 3 failed attempts.

## Implementation Date

November 16, 2025

## Components Modified

### 1. InterviewSlotCard Component
**File:** `src/components/fi-dashboard/InterviewSlotCard.tsx`

**Changes:**
- Updated `handleAction` to check IndexedDB for existing records when tapping an "In Progress" slot
- Changed button label from "Log Visit Status" to "Resume Interview" for clarity
- Enhanced visit history display to show last visit details (date, outcome, notes preview)
- Added automatic navigation to survey form when existing record is found

**Key Features:**
- Loads existing record from IndexedDB on slot tap
- Displays previous visit notes in the card
- Shows last visit date and outcome
- Provides "View full visit history" button

### 2. Survey Forms Page
**File:** `src/app/survey/forms/page.tsx`

**Changes:**
- Added automatic visit count increment when loading existing records
- Creates a new visit entry with "Interview Started" outcome when resuming
- Enhanced success message to indicate callback completion
- Detects if interview was completed after callbacks and shows appropriate message

**Key Features:**
- Automatically increments visit count when resuming interview
- Logs visit with notes: "Visit N - Resuming interview"
- Shows special success message: "Interview completed successfully after callback visits!"

### 3. VisitStatusModal Component
**File:** `src/components/fi-dashboard/VisitStatusModal.tsx`

**Changes:**
- Updated navigation to include cycleId parameter when starting interview
- Enhanced IndexedDB logic to count failed attempts correctly
- Added logging for substitution flagging threshold

**Key Features:**
- Passes spot and cycle info when navigating to survey form
- Counts failed attempts (excluding "Interview Started" and "Interview Completed")
- Logs warning when questionnaire will be flagged after 3 attempts

### 4. FI Assignments API
**File:** `src/app/api/fi/assignments/route.ts`

**Changes:**
- Added visits data to questionnaire query
- Includes full visit history with each interview slot
- Returns visit details: visitId, visitNumber, timestamp, outcome, notes, location

**Key Features:**
- Fetches complete visit history for each questionnaire
- Sorts visits by visit number
- Formats location data properly

## Substitution Flagging Logic

### Automatic Flagging
The system automatically flags questionnaires for substitution after 3 failed attempts:

**Visits API** (`src/app/api/visits/route.ts`):
- Counts failed attempts on each visit log
- Failed attempts include: "Callback_Needed", "Refused", "Household_Moved"
- Updates questionnaire status to "Flagged_For_Substitution" when count >= 3
- Increments visit_count on each visit

### Visual Indicators

**InterviewSlotCard:**
- Red badge: "Substitution Needed"
- Warning message: "3 failed attempts - This slot has been flagged for substitution"
- Disabled button: "Request Substitution"
- Shows visit history button

**ProgressMap:**
- Red marker for flagged spots
- Shows flagged count in popup
- Legend includes "Flagged" status

**FIPerformanceTable:**
- "Flagged" column shows count of flagged questionnaires per FI
- Included in CSV export
- Color-coded in red

## Workflow Flow

### First Visit (Already Implemented in Task 14)
1. FI taps "Start Interview" on pending slot
2. System creates IndexedDB record with Visit 1
3. FI can log callback or start interview
4. If callback logged, status becomes "In Progress (Callback 1)"

### Subsequent Visits (Task 15)
1. FI taps "Resume Interview" on in-progress slot
2. System checks IndexedDB for existing record
3. If found:
   - Loads survey data
   - Increments visit count (adds Visit N)
   - Displays previous visit notes
   - Navigates to survey form
4. FI can:
   - Complete the interview → Status: "Completed (Pending Sync)"
   - Log another callback → Status: "In Progress (Callback N+1)"
5. If 3 failed attempts reached:
   - Status: "Flagged_For_Substitution"
   - Red badge displayed
   - FS notified via monitoring dashboard

### Callback Completion
1. FI resumes interview after callbacks
2. Completes all survey sections
3. Submits survey
4. System:
   - Marks record as "Completed (Pending Sync)" in IndexedDB
   - Saves to database via API
   - Shows success message mentioning callback completion
   - Updates questionnaire status to "Completed"

## Data Flow

### IndexedDB
```typescript
SurveyRecord {
  id: "2024-001-001_1"
  questionnaireId: "2024-001-001"
  cycleId: 1
  spotId: 5
  status: "In Progress"
  visits: [
    { visitNumber: 1, outcome: "Interview Started", notes: "First visit" },
    { visitNumber: 2, outcome: "Callback Needed", notes: "No one home" },
    { visitNumber: 3, outcome: "Interview Started", notes: "Resuming interview" }
  ]
  surveyData: { ... }
}
```

### Database
```sql
-- questionnaires table
questionnaire_id | status      | visit_count
2024-001-001    | In_Progress | 3

-- visits table
visit_id | questionnaire_id | visit_number | outcome
1        | 2024-001-001    | 1            | Interview_Started
2        | 2024-001-001    | 2            | Callback_Needed
3        | 2024-001-001    | 3            | Interview_Started
```

## Testing Recommendations

### Manual Testing
1. **Resume Interview:**
   - Start interview, log callback
   - Return to spot assignments
   - Tap "Resume Interview"
   - Verify survey data is loaded
   - Verify visit count incremented

2. **Callback Completion:**
   - Resume interview after 2 callbacks
   - Complete all sections
   - Submit survey
   - Verify success message mentions callbacks
   - Verify status is "Completed"

3. **Substitution Flagging:**
   - Log 3 callbacks on same questionnaire
   - Verify status becomes "Flagged_For_Substitution"
   - Verify red badge displayed
   - Verify appears in FS monitoring dashboard

4. **Visit History:**
   - Log multiple visits with different outcomes
   - Tap "View full visit history"
   - Verify all visits displayed with correct details

### API Testing
```bash
# Test visit logging
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{
    "questionnaireId": "2024-001-001",
    "outcome": "Callback_Needed",
    "notes": "No one home"
  }'

# Test FI assignments with visits
curl http://localhost:3000/api/fi/assignments?cycleId=1
```

## Requirements Satisfied

### Requirement 5.1 ✅
"WHEN the FI taps a slot marked 'In Progress (Callback N)', THE PULSE System SHALL load the existing incomplete record from IndexedDB"
- Implemented in InterviewSlotCard.handleAction()

### Requirement 5.2 ✅
"THE PULSE System SHALL increment the visit count in the visits array"
- Implemented in survey forms page loadSurveyData()

### Requirement 5.3 ✅
"THE PULSE System SHALL display notes from all previous visits to the FI"
- Implemented in InterviewSlotCard visit history display

### Requirement 5.4 ✅
"WHERE the FI successfully completes the interview, THE PULSE System SHALL update the record status to 'Completed (Pending Sync)'"
- Implemented in survey forms page submission handler

### Requirement 5.5 ✅
"WHERE the FI logs another unsuccessful callback, THE PULSE System SHALL update the slot status to show the incremented callback count"
- Implemented in visits API and InterviewSlotCard

### Requirement 5.6 ✅
"WHEN a record reaches 3 failed callback attempts, THE PULSE System SHALL flag the record for substitution"
- Implemented in visits API route

### Requirement 5.7 ✅
"THE PULSE System SHALL maintain the 'In Progress' status for records with fewer than 3 failed attempts"
- Implemented in visits API status logic

## Known Limitations

1. **Offline Flagging:** Substitution flagging only happens when online (via API). IndexedDB doesn't update status to "Flagged_For_Substitution" offline.

2. **Visit Count Sync:** Visit count in IndexedDB and database may temporarily differ if offline. Syncs when online.

3. **Concurrent Edits:** If same questionnaire edited on multiple devices offline, last-write-wins on sync.

## Future Enhancements

1. **Substitution Request:** Add ability for FI to request substitution before 3 attempts
2. **Visit Notifications:** Notify FS when questionnaire is flagged
3. **Visit Scheduling:** Allow FI to schedule callback visits
4. **Visit Photos:** Allow FI to attach photos to visit notes
5. **Offline Flagging:** Implement client-side flagging logic in IndexedDB

## Related Documentation

- [First Visit Workflow Implementation](./FIRST_VISIT_WORKFLOW_IMPLEMENTATION.md)
- [IndexedDB Implementation](./INDEXEDDB_OFFLINE_STORAGE_IMPLEMENTATION.md)
- [Interview Slot Management](./INTERVIEW_SLOT_MANAGEMENT_IMPLEMENTATION.md)
- [Visit Tracking API](./VISIT_TRACKING_API_IMPLEMENTATION.md)

## Conclusion

Task 15 has been successfully implemented. Field Interviewers can now:
- Resume incomplete interviews from previous visits
- See previous visit history and notes
- Complete interviews after multiple callbacks
- Automatically flag questionnaires after 3 failed attempts

The system provides clear visual indicators for flagged questionnaires and notifies Field Supervisors through the monitoring dashboard.
