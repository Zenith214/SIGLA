# First Visit Workflow Implementation Summary

## Overview

This document summarizes the implementation of Task 14: "Implement first visit workflow" from the CSIS workflow upgrade specification. The implementation adds multi-visit tracking capabilities to the survey system, allowing Field Interviewers to log visit outcomes and manage callbacks effectively.

## Implementation Date

November 16, 2025

## Components Implemented

### 1. Task 14.1: Update Survey Initialization to Create IndexedDB Record

**Status:** ✅ Completed

**Changes Made:**

- **File:** `src/lib/indexedDB.ts`
  - Updated `createSurveyRecord()` function to automatically log Visit 1 when a new survey record is created
  - Visit 1 is created with outcome "Interview Started" and timestamp
  - Ensures every survey record starts with proper visit tracking

**Key Features:**
- Automatic Visit 1 creation on record initialization
- Status set to "In Progress" by default
- Stores questionnaire_id, cycle_id, and spot_id for proper tracking
- Console logging for debugging and verification

**Requirements Addressed:**
- 4.1: Create record with status "In Progress" on interview start
- 4.2: Log Visit 1 in visits array

---

### 2. Task 14.2: Add "Log Visit Status" Button to Survey Form

**Status:** ✅ Completed

**Changes Made:**

- **New File:** `src/components/survey/VisitStatusButton.tsx`
  - Created reusable component for logging visit status
  - Displays informational banner before interview questions
  - Opens VisitStatusModal when clicked
  - Only shown for questionnaire-based surveys (with questionnaire_id and cycle_id)

- **File:** `src/app/survey/forms/sections/respondent-selection.tsx`
  - Integrated VisitStatusButton at the beginning of respondent selection
  - Added URL parameter parsing for questionnaire context
  - Loads current visit count from IndexedDB
  - Updates visit count after logging

- **File:** `src/components/fi-dashboard/VisitStatusModal.tsx`
  - Enhanced to save visits to both IndexedDB and API
  - Automatically flags questionnaires after 3 failed attempts
  - Handles callback reasons and digital fieldwork diary notes
  - Captures location data when available

**Key Features:**
- Prominent "Log Visit Status" button with clear instructions
- Dual-save mechanism (IndexedDB + API) for offline support
- Real-time visit count tracking
- Automatic status updates based on visit outcomes
- Callback reason dropdown with predefined options
- Digital Fieldwork Diary notes textarea
- Warning message for 3rd failed attempt

**Requirements Addressed:**
- 4.3: Display button before interview questions
- 4.4: Open VisitStatusModal on click
- 4.5: Save callback to IndexedDB and API
- 4.6: Update slot status to "In Progress (Callback N)"

---

### 3. Task 14.3: Implement Digital Kish Grid Component

**Status:** ✅ Completed

**Changes Made:**

- **New File:** `src/components/survey/KishGridDisplay.tsx`
  - Created visual Kish Grid selection display component
  - Shows selection algorithm details (questionnaire number, selection key, formula)
  - Lists all eligible household members with visual indication of selected respondent
  - Displays calculation: `lastDigit % eligibleMembers = selectedIndex`
  - Includes educational note about methodology

- **File:** `src/app/survey/forms/sections/respondent-selection.tsx`
  - Enhanced modal to display KishGridDisplay component
  - Prepares eligible members data with ages
  - Tracks selected index for visual highlighting
  - Expanded modal width to accommodate detailed display
  - Made modal scrollable for better mobile experience

**Key Features:**
- Visual representation of Kish Grid algorithm
- Step-by-step calculation display
- Color-coded selection (green highlight for selected member)
- Eligible members list with age and gender
- Educational information about random selection methodology
- Responsive design with scrollable modal
- Clear indication that selection cannot be changed

**Requirements Addressed:**
- 4.7: Create form for household member input (name, age, gender)
- 4.8: Implement Kish Grid selection algorithm
- Use questionnaire_id last digit as selection key
- Display selected respondent prominently
- Integrate into respondent selection section

---

## Technical Implementation Details

### IndexedDB Integration

The implementation leverages the existing IndexedDB infrastructure:

```typescript
// Automatic Visit 1 creation
const visit1: Visit = {
  visitNumber: 1,
  timestamp: now,
  outcome: 'Interview Started',
  notes: 'First visit - interview initiated',
};
```

### Visit Logging Flow

1. FI clicks "Log Visit Status" button
2. VisitStatusModal opens with form
3. FI selects outcome (Callback Needed, Interview Started, Refused, Household Moved)
4. If callback, FI selects reason and adds notes
5. Visit saved to IndexedDB first (offline-first)
6. Visit saved to API (when online)
7. Status updated based on visit count
8. UI refreshes to show updated visit count

### Kish Grid Algorithm

The implementation uses the official CSIS Kish Grid methodology:

```typescript
// Extract questionnaire number from format BB-YYYY-NNNN
let questionnaireNumber = surveyNumber;
if (surveyNumber.includes('-')) {
  const parts = surveyNumber.split('-');
  if (parts.length === 3) {
    questionnaireNumber = parts[2]; // Extract NNNN part
  }
}

// Calculate selection index
const lastDigit = parseInt(questionnaireNumber.slice(-1)) || 0;
const selectedIndex = lastDigit % eligibleMembers.length;
const selected = eligibleMembers[selectedIndex];
```

---

## User Experience Improvements

### For Field Interviewers

1. **Clear Guidance:** Blue informational banner explains when to log visit status
2. **Easy Access:** Button prominently displayed before interview questions
3. **Visual Feedback:** Visit count displayed and updated in real-time
4. **Offline Support:** Works without internet connection via IndexedDB
5. **Transparent Selection:** Kish Grid display shows exactly how respondent was selected

### For Field Supervisors

1. **Visit Tracking:** All visit attempts logged with timestamps and notes
2. **Automatic Flagging:** Questionnaires flagged after 3 failed attempts
3. **Audit Trail:** Complete history of visit outcomes and reasons
4. **Location Data:** GPS coordinates captured when available

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Survey Initialization                     │
│  - Create IndexedDB record with Visit 1                     │
│  - Status: "In Progress"                                    │
│  - Store questionnaire_id, cycle_id, spot_id               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Respondent Selection                        │
│  - Display "Log Visit Status" button                        │
│  - Show current visit count                                 │
│  - Kish Grid selection with visual display                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Visit Status Modal                         │
│  - Select outcome (Callback/Started/Refused/Moved)          │
│  - Enter callback reason (if applicable)                    │
│  - Add digital fieldwork diary notes                        │
│  - Capture location                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Save Visit Data                           │
│  1. Save to IndexedDB (offline-first)                       │
│  2. Save to API (when online)                               │
│  3. Update visit count                                      │
│  4. Check for 3rd failed attempt → Flag if needed           │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Recommendations

### Manual Testing Checklist

- [ ] Create new survey with questionnaire_id
- [ ] Verify Visit 1 is automatically logged in IndexedDB
- [ ] Click "Log Visit Status" button
- [ ] Select "Callback Needed" and choose reason
- [ ] Add notes in Digital Fieldwork Diary
- [ ] Verify visit saved to IndexedDB
- [ ] Verify visit saved to API
- [ ] Check visit count increments
- [ ] Log 3 callbacks and verify flagging
- [ ] Test Kish Grid with different household sizes
- [ ] Verify selected respondent matches algorithm
- [ ] Test offline functionality (disconnect network)
- [ ] Verify data syncs when reconnected

### Edge Cases to Test

1. **No questionnaire_id:** Button should not appear
2. **First visit:** Should show visit count = 1
3. **Third callback:** Should show warning message
4. **Offline mode:** Should save to IndexedDB only
5. **Network error:** Should handle gracefully
6. **Empty household:** Should show validation error
7. **All members under 18:** Should show validation error
8. **Single eligible member:** Kish Grid should select that member

---

## Files Modified

### New Files Created
1. `src/components/survey/VisitStatusButton.tsx` - Visit status logging button component
2. `src/components/survey/KishGridDisplay.tsx` - Visual Kish Grid display component
3. `docs/FIRST_VISIT_WORKFLOW_IMPLEMENTATION.md` - This documentation

### Existing Files Modified
1. `src/lib/indexedDB.ts` - Added automatic Visit 1 logging
2. `src/app/survey/forms/sections/respondent-selection.tsx` - Integrated visit status button and Kish Grid display
3. `src/components/fi-dashboard/VisitStatusModal.tsx` - Enhanced with IndexedDB integration

---

## Requirements Traceability

| Requirement | Description | Status | Implementation |
|-------------|-------------|--------|----------------|
| 4.1 | Create record with status "In Progress" | ✅ | `indexedDB.ts` - createSurveyRecord() |
| 4.2 | Log Visit 1 in visits array | ✅ | `indexedDB.ts` - automatic visit1 creation |
| 4.3 | Display button before interview questions | ✅ | `VisitStatusButton.tsx` + respondent-selection.tsx |
| 4.4 | Open VisitStatusModal on click | ✅ | `VisitStatusButton.tsx` |
| 4.5 | Save callback to IndexedDB and API | ✅ | `VisitStatusModal.tsx` - dual save |
| 4.6 | Update slot status | ✅ | `VisitStatusModal.tsx` - status updates |
| 4.7 | Form for household member input | ✅ | `respondent-selection.tsx` - existing form |
| 4.8 | Implement Kish Grid algorithm | ✅ | `respondent-selection.tsx` + KishGridDisplay.tsx |

---

## Next Steps

The first visit workflow is now complete. The next phase (Task 15) will implement the subsequent visit workflow, including:

1. Loading existing records for callbacks
2. Displaying previous visit notes
3. Completing interviews after callbacks
4. Substitution flagging after 3 failed attempts

---

## Notes

- All implementations follow the offline-first architecture
- Data is saved to IndexedDB before API for reliability
- The Kish Grid implementation matches CSIS methodology exactly
- Visit tracking provides complete audit trail for quality assurance
- The system is ready for field testing with real interviewers

---

## Support

For questions or issues related to this implementation, refer to:
- Design Document: `.kiro/specs/csis-workflow-upgrade/design.md`
- Requirements: `.kiro/specs/csis-workflow-upgrade/requirements.md`
- Tasks: `.kiro/specs/csis-workflow-upgrade/tasks.md`
