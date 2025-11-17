# Digital Fieldwork Diary - Implementation Status

## Overview

**Status**: ✅ **FULLY IMPLEMENTED**

The Digital Fieldwork Diary is a core feature of the PULSE system that allows field interviewers to document their visit attempts, observations, and callback reasons. It is integrated into the visit tracking workflow.

---

## Implementation Details

### 1. Where It's Implemented

The Digital Fieldwork Diary is implemented as part of the **Visit Status Modal** component:

**File**: `src/components/fi-dashboard/VisitStatusModal.tsx`

### 2. How It Works

#### Entry Point
Field interviewers access the diary through the **"Log Visit Status"** button available on each interview slot in their spot assignments.

#### User Flow
```
1. FI clicks "Log Visit Status" on an interview slot
2. VisitStatusModal opens
3. FI selects visit outcome:
   - Callback Needed
   - Interview Started
   - Refused to Participate
   - Household Moved
4. If "Callback Needed", FI selects reason:
   - No one home
   - Respondent busy
   - Respondent unavailable
   - Bad weather
   - Other (specify in notes)
5. FI enters notes in "Digital Fieldwork Diary Notes" textarea
6. System captures GPS location automatically (if available)
7. FI clicks "Log Visit" to save
```

### 3. Features

#### Input Fields
- **Visit Outcome** (Required): Radio button selection
- **Callback Reason** (Required if callback): Dropdown selection
- **Digital Fieldwork Diary Notes** (Optional): Multi-line text area
- **GPS Location** (Automatic): Captured in background

#### Data Captured
```typescript
interface Visit {
  visitId: number
  visitNumber: number
  timestamp: string
  outcome: string
  notes: string | null          // Diary entries
  location?: {
    lat: number
    lng: number
  } | null
}
```

#### Storage
- **IndexedDB**: Immediate local storage for offline capability
- **API**: Synced to server via `POST /api/visits`
- **Database**: Persisted in `visits` table

#### Special Features
- **Automatic Location Capture**: GPS coordinates captured when available
- **Callback Reason Integration**: Reason prepended to notes for callbacks
- **3rd Attempt Warning**: Shows alert when logging 3rd failed attempt
- **Auto-flagging**: Questionnaire flagged for substitution after 3 failed attempts

---

## Viewing Diary Entries

### Visit History Display

**File**: `src/components/fi-dashboard/VisitHistoryDisplay.tsx`

Field interviewers can view all diary entries through the **"View visit history"** link on interview slots.

#### Features
- **Timeline View**: Shows all visits in reverse chronological order
- **Most Recent Highlight**: Latest visit highlighted with blue ring
- **Summary Statistics**: Total visits and callback count
- **Complete Details**: Each visit shows:
  - Visit number
  - Outcome with color-coded badge
  - Date and time
  - GPS coordinates (if captured)
  - **Diary notes** (prominently displayed)

#### Visual Design
```
┌─────────────────────────────────────────────────┐
│ Visit History                                   │
│ Complete visit history for BB-2024-0001         │
├─────────────────────────────────────────────────┤
│ [Total Visits: 3]  [Callbacks: 2]              │
├─────────────────────────────────────────────────┤
│ Visit Timeline                                  │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🔵 Visit #3 [Most Recent]              │   │
│ │ Callback Needed                         │   │
│ │ 📅 Nov 16, 2024 at 2:30 PM             │   │
│ │ 📍 14.123456, 121.234567                │   │
│ │ ─────────────────────────────────────── │   │
│ │ 📝 Notes:                               │   │
│ │ Reason: No one home                     │   │
│ │                                         │   │
│ │ Neighbor mentioned family went to       │   │
│ │ market. Will return around 4pm.         │   │
│ │ Scheduled callback for tomorrow.        │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 🟠 Visit #2                             │   │
│ │ Callback Needed                         │   │
│ │ ...                                     │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Interview Slot Card
**File**: `src/components/fi-dashboard/InterviewSlotCard.tsx`

- Shows visit count for in-progress interviews
- Displays last visit summary with diary excerpt
- Provides "View full visit history" link
- Integrates VisitStatusModal for logging new visits

### 2. Spot Workflow Screen
**File**: `src/components/fi-dashboard/SpotWorkflowScreen.tsx`

- Displays all interview slots with visit status
- Shows aggregated visit counts per spot
- Provides access to diary through slot cards

### 3. API Endpoints

#### POST /api/visits
**File**: `src/app/api/visits/route.ts`

Saves diary entries to database:
```typescript
{
  questionnaireId: string
  outcome: string
  notes: string | null      // Diary entry
  location: {
    lat: number
    lng: number
  } | null
}
```

#### GET /api/questionnaires/:id
**File**: `src/app/api/questionnaires/[id]/route.ts`

Retrieves all visits including diary entries:
```typescript
{
  visits: [
    {
      visitId: number
      visitNumber: number
      timestamp: string
      outcome: string
      notes: string | null    // Diary entry
      location: object | null
    }
  ]
}
```

---

## Use Cases

### 1. Callback Documentation
**Scenario**: Respondent not available

```
Visit Outcome: Callback Needed
Callback Reason: No one home
Diary Notes:
"House was locked. Neighbor said family went to 
provincial town for the weekend. Will return Monday. 
Scheduled callback for Tuesday morning."
```

### 2. Refusal Documentation
**Scenario**: Respondent refuses to participate

```
Visit Outcome: Refused to Participate
Diary Notes:
"Respondent cited privacy concerns and lack of time. 
Was polite but firm in refusal. Did not want to 
reschedule."
```

### 3. Household Moved
**Scenario**: Household no longer at address

```
Visit Outcome: Household Moved
Diary Notes:
"New occupants confirmed previous family moved out 
3 months ago. No forwarding address available. 
House now occupied by different family."
```

### 4. Successful Interview
**Scenario**: Interview completed

```
Visit Outcome: Interview Started
Diary Notes:
"Respondent very cooperative. Interview took 35 minutes. 
Good understanding of questions. No issues encountered."
```

---

## Data Flow

```
┌─────────────────────┐
│ Field Interviewer   │
│ Logs Visit          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ VisitStatusModal                    │
│ - Captures outcome                  │
│ - Captures callback reason          │
│ - Captures diary notes              │
│ - Captures GPS location             │
└──────────┬──────────────────────────┘
           │
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│ IndexedDB        │  │ POST /api/   │  │ Database     │
│ (Offline)        │  │ visits       │  │ visits table │
│ - Immediate save │  │ (Online)     │  │ - Persistent │
└──────────────────┘  └──────────────┘  └──────────────┘
           │                 │                 │
           └─────────────────┴─────────────────┘
                             │
                             ▼
           ┌─────────────────────────────────┐
           │ VisitHistoryDisplay             │
           │ - Shows all diary entries       │
           │ - Timeline view                 │
           │ - Complete visit details        │
           └─────────────────────────────────┘
```

---

## Technical Specifications

### Component Props

#### VisitStatusModal
```typescript
interface VisitStatusModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  questionnaireId: string
  currentVisitCount: number
}
```

#### VisitHistoryDisplay
```typescript
interface VisitHistoryDisplayProps {
  open: boolean
  onClose: () => void
  questionnaireId: string
  visits: Visit[]
}
```

### Database Schema

```sql
CREATE TABLE visits (
  visit_id SERIAL PRIMARY KEY,
  questionnaire_id VARCHAR(50) NOT NULL,
  visit_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  outcome VARCHAR(50) NOT NULL,
  notes TEXT,                          -- Diary entry
  location JSONB,                      -- {lat, lng}
  interviewer_id INTEGER,
  FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(questionnaire_id)
);
```

---

## Offline Capability

The Digital Fieldwork Diary works **fully offline**:

1. **Entry**: Notes can be entered without internet connection
2. **Storage**: Immediately saved to IndexedDB
3. **Sync**: Automatically synced to server when connection restored
4. **Viewing**: All diary entries viewable offline from IndexedDB

---

## Best Practices for Field Interviewers

### What to Document

✅ **DO Document**:
- Specific reasons for callbacks
- Observations about household
- Scheduled callback times
- Neighbor information
- Environmental factors (weather, accessibility)
- Respondent concerns or questions
- Any unusual circumstances

❌ **DON'T Document**:
- Personal opinions or judgments
- Sensitive personal information
- Irrelevant details
- Complaints about respondents

### Example Good Entries

**Callback - No one home**:
```
"Visited at 2pm. House locked, no response to knocking. 
Neighbor mentioned family works until 5pm on weekdays. 
Will attempt callback tomorrow at 6pm."
```

**Callback - Respondent busy**:
```
"Respondent was preparing for family event. Asked to 
return next week. Scheduled callback for Tuesday, 
Nov 21 at 10am. Respondent confirmed availability."
```

**Refused**:
```
"Respondent declined participation citing survey fatigue 
from previous studies. Was respectful but firm. Did not 
want to be contacted again."
```

---

## Future Enhancements

Potential improvements (not yet implemented):

- 📸 **Photo Attachments**: Attach photos of location/household
- 🎤 **Voice Notes**: Record audio diary entries
- 📊 **Diary Analytics**: Analyze common callback reasons
- 🔍 **Search**: Search diary entries by keyword
- 📤 **Export**: Export diary entries to PDF/CSV
- 🏷️ **Tags**: Categorize entries with tags
- ⏰ **Reminders**: Set callback reminders from diary

---

## Testing Checklist

To verify the Digital Fieldwork Diary is working:

- [ ] Open spot workflow screen
- [ ] Click "Log Visit Status" on an interview slot
- [ ] Select "Callback Needed" outcome
- [ ] Choose callback reason
- [ ] Enter notes in diary textarea
- [ ] Submit visit log
- [ ] Verify visit appears in slot card
- [ ] Click "View visit history"
- [ ] Verify diary notes are displayed
- [ ] Test offline: Disable network, log visit
- [ ] Re-enable network, verify sync

---

## Related Documentation

- [Interview Slot Management Implementation](./INTERVIEW_SLOT_MANAGEMENT_IMPLEMENTATION.md)
- [Visit Tracking API Implementation](./VISIT_TRACKING_API_IMPLEMENTATION.md)
- [First Visit Workflow Implementation](./FIRST_VISIT_WORKFLOW_IMPLEMENTATION.md)
- [Complete Integration Summary](./COMPLETE_INTEGRATION_SUMMARY.md)

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Status**: Complete and Operational

