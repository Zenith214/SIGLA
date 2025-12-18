# Interview Slot Management Implementation

## Overview

This document summarizes the implementation of Task 10: Interview Slot Management for the CSIS workflow upgrade. This task implements the complete multi-visit workflow UI components that allow Field Interviewers to manage interview slots, log visit statuses, and view visit history.

## Implementation Date

November 16, 2025

## Components Implemented

### 1. InterviewSlotCard Component (Enhanced)

**Location:** `src/components/fi-dashboard/InterviewSlotCard.tsx`

**Features:**
- Displays questionnaire ID and sequence number
- Shows status badge with appropriate colors and icons:
  - **Pending** (Gray): Ready to start
  - **In Progress** (Orange): Has callbacks, shows callback count
  - **Completed** (Green): Interview finished
  - **Flagged for Substitution** (Red): 3 failed attempts
- Shows visit history summary for in-progress interviews
- Renders appropriate action buttons based on status:
  - "Start Interview" for Pending
  - "Log Visit Status" for In Progress
  - "View Details" for Completed (disabled)
  - "Request Substitution" for Flagged (disabled)
- Integrates with VisitStatusModal for logging visits
- Integrates with VisitHistoryDisplay for viewing history
- Provides "View visit history" link when visits exist

**Props:**
```typescript
interface InterviewSlotCardProps {
  interview: Interview;
  spotId: number;
  onUpdate?: () => void;
}
```

### 2. VisitStatusModal Component

**Location:** `src/components/fi-dashboard/VisitStatusModal.tsx`

**Features:**
- Modal dialog for logging visit outcomes
- Radio group with four visit outcome options:
  - **Callback Needed**: Requires callback reason selection
  - **Interview Started**: Marks interview as started
  - **Refused to Participate**: Household refused
  - **Household Moved**: Household no longer at location
- Callback reason dropdown (shown only for "Callback Needed"):
  - No one home
  - Respondent busy
  - Respondent unavailable
  - Bad weather
  - Other (specify in notes)
- Digital Fieldwork Diary notes textarea
- Automatic geolocation capture (if available)
- Warning message for 3rd failed attempt
- Form validation
- Submits to `POST /api/visits` endpoint
- Updates slot status after successful submission
- Toast notifications for success/error

**Props:**
```typescript
interface VisitStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  questionnaireId: string;
  currentVisitCount: number;
}
```

### 3. VisitHistoryDisplay Component

**Location:** `src/components/fi-dashboard/VisitHistoryDisplay.tsx`

**Features:**
- Modal dialog showing complete visit timeline
- Summary statistics:
  - Total visits count
  - Callbacks count
- Visit list with detailed information:
  - Visit number
  - Outcome with color-coded badge and icon
  - Timestamp (date and time)
  - Location coordinates (if available)
  - Notes from Digital Fieldwork Diary
- Highlights most recent visit with blue ring
- Sorted by visit number (most recent first)
- Color-coded outcomes:
  - **Interview Completed** (Green)
  - **Interview Started** (Blue)
  - **Callback Needed** (Orange)
  - **Refused** (Red)
  - **Household Moved** (Gray)

**Props:**
```typescript
interface VisitHistoryDisplayProps {
  open: boolean;
  onClose: () => void;
  questionnaireId: string;
  visits: Visit[];
}
```

### 4. Supporting UI Components

#### RadioGroup Component
**Location:** `src/components/ui/radio-group.tsx`

- Radix UI-based radio group component
- Consistent styling with shadcn/ui design system
- Accessible keyboard navigation

#### Textarea Component
**Location:** `src/components/ui/textarea.tsx`

- Standard textarea with consistent styling
- Focus ring and disabled states
- Placeholder text support

## Integration Changes

### SpotWorkflowScreen Updates

**Location:** `src/components/fi-dashboard/SpotWorkflowScreen.tsx`

**Changes:**
- Added `Visit` interface definition
- Updated `Interview` interface to include optional `visits` array
- Enhanced `fetchSpotDetails` to fetch visit history for each interview
- Passes visit data to `InterviewSlotCard` components
- Provides `onUpdate` callback to refresh data after visit logging

### Component Exports

**Location:** `src/components/fi-dashboard/index.ts`

**Added exports:**
```typescript
export { VisitStatusModal } from './VisitStatusModal';
export { VisitHistoryDisplay } from './VisitHistoryDisplay';
```

## Dependencies Added

- `@radix-ui/react-radio-group`: Radio button group component

## API Integration

### POST /api/visits

The VisitStatusModal submits visit data to this endpoint:

**Request:**
```json
{
  "questionnaireId": "2024-001-002",
  "outcome": "Callback_Needed",
  "notes": "Reason: No one home\n\nWill return tomorrow afternoon",
  "location": {
    "lat": 8.1234,
    "lng": 123.4567
  }
}
```

**Response:**
```json
{
  "visitId": 123,
  "visitNumber": 2,
  "questionnaireStatus": "In_Progress",
  "message": "Visit logged successfully"
}
```

### GET /api/questionnaires/:questionnaireId

The SpotWorkflowScreen fetches visit history from this endpoint:

**Response:**
```json
{
  "questionnaireId": "2024-001-002",
  "visits": [
    {
      "visitId": 122,
      "visitNumber": 1,
      "timestamp": "2024-01-15T10:30:00Z",
      "outcome": "Callback_Needed",
      "notes": "No one home",
      "location": { "lat": 8.1234, "lng": 123.4567 }
    }
  ]
}
```

## User Workflows

### Starting a New Interview

1. FI opens spot workflow screen
2. Taps "Start Interview" on a pending slot
3. VisitStatusModal opens
4. FI selects outcome (e.g., "Interview Started" or "Callback Needed")
5. If callback, selects reason and adds notes
6. Submits visit log
7. Slot status updates to "In Progress"

### Logging a Callback

1. FI taps "Log Visit Status" on in-progress slot
2. VisitStatusModal opens showing visit count
3. FI selects "Callback Needed" and reason
4. Adds notes in Digital Fieldwork Diary
5. Submits visit log
6. Callback count increments
7. If 3rd failed attempt, slot flagged for substitution

### Viewing Visit History

1. FI taps "View visit history" link on any slot with visits
2. VisitHistoryDisplay modal opens
3. Shows summary stats (total visits, callbacks)
4. Displays timeline of all visits
5. Most recent visit highlighted
6. Each visit shows outcome, timestamp, location, and notes

## Requirements Satisfied

### Requirement 4.1 - First Visit Workflow
✓ FI can tap pending slot to start interview
✓ Creates new record with "In Progress" status
✓ Logs Visit 1 in visits array

### Requirement 4.3 - Log Visit Status
✓ "Log Visit Status" button accessible before interview
✓ Modal with visit outcome options

### Requirement 4.4 - Callback Logging
✓ "Callback Needed" option available
✓ Updates visits array when selected

### Requirement 4.5 - Digital Fieldwork Diary
✓ Notes textarea for callback details
✓ Notes stored with visit record

### Requirement 4.6 - Status Updates
✓ Slot status updates after callback
✓ Shows "In Progress (Callback N)" format

### Requirement 5.1 - Resume Interviews
✓ In-progress slots show "Log Visit Status" button
✓ Loads existing record when tapped

### Requirement 5.2 - Visit History
✓ Displays all previous visits
✓ Shows visit count prominently

### Requirement 5.3 - Previous Visit Notes
✓ Visit history displays notes from all visits
✓ Notes accessible via "View visit history" link

### Requirement 5.5 - Callback Completion
✓ FI can log additional callbacks
✓ Callback count increments in UI

### Requirement 5.7 - Substitution Flagging
✓ Red badge for flagged slots
✓ Warning message about 3 failed attempts
✓ "Request Substitution" button (disabled)

## Testing

A comprehensive test script was created to verify the implementation:

**Location:** `scripts/test-interview-slot-management.js`

**Test Coverage:**
- ✓ InterviewSlotCard component features
- ✓ VisitStatusModal component features
- ✓ VisitHistoryDisplay component features
- ✓ SpotWorkflowScreen integration
- ✓ UI component availability
- ✓ Component exports

**Test Results:** All tests passed ✓

## UI/UX Highlights

### Visual Feedback
- Color-coded status badges for quick recognition
- Icons for each status type
- Progress indicators showing callback counts
- Warning messages for critical states

### Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- Focus management in modals
- Clear error messages

### Mobile Optimization
- Touch-friendly button sizes
- Responsive modal layouts
- Scrollable visit history
- Geolocation integration

### User Guidance
- Contextual help text
- Validation messages
- Success/error toasts
- Warning for final attempts

## Next Steps

The interview slot management UI is now complete. The next phase (Task 11-13) will implement:

1. **PWA Infrastructure** (Task 11)
   - Service Worker for offline caching
   - Web App Manifest
   - Offline indicator component

2. **IndexedDB Integration** (Task 12)
   - Offline data storage
   - Sync service
   - Sync UI component

3. **Offline Workflow Integration** (Task 13)
   - Survey form integration with IndexedDB
   - Auto-sync on reconnection
   - Offline-first architecture

## Files Modified

### New Files
- `src/components/fi-dashboard/VisitStatusModal.tsx`
- `src/components/fi-dashboard/VisitHistoryDisplay.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/textarea.tsx`
- `scripts/test-interview-slot-management.js`
- `docs/INTERVIEW_SLOT_MANAGEMENT_IMPLEMENTATION.md`

### Modified Files
- `src/components/fi-dashboard/InterviewSlotCard.tsx`
- `src/components/fi-dashboard/SpotWorkflowScreen.tsx`
- `src/components/fi-dashboard/index.ts`

## Conclusion

Task 10 has been successfully completed. The interview slot management system provides Field Interviewers with a comprehensive interface for managing multi-visit workflows, logging visit outcomes, and tracking interview progress. All requirements have been satisfied and the implementation has been thoroughly tested.
