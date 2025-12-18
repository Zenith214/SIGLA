# Fieldwork Monitoring Tab Implementation

## Overview

This document describes the implementation of the Fieldwork Monitoring tab for the Field Supervisor dashboard, which provides real-time visibility into fieldwork progress and Field Interviewer performance.

## Implementation Date

November 16, 2025

## Components Implemented

### 1. Monitoring API Endpoint (`/api/fs/monitoring`)

**File:** `src/app/api/fs/monitoring/route.ts`

**Purpose:** Aggregates and returns real-time monitoring data for all Field Interviewers in the active survey cycle.

**Query Parameters:**
- `cycleId` (required): Survey cycle ID

**Response Structure:**
```json
{
  "cycleId": 1,
  "cycleName": "2024 Survey Cycle",
  "spots": [
    {
      "spotId": 1,
      "spotName": "Spot #1",
      "barangayName": "Katipunan",
      "status": "In_Progress",
      "startingPoint": { "lat": 8.1234, "lng": 123.4567 },
      "assignedFI": "John Doe",
      "assignedFIId": 5,
      "completedCount": 3,
      "totalCount": 5,
      "inProgressCount": 2,
      "flaggedCount": 0,
      "questionnaires": [...]
    }
  ],
  "fieldInterviewers": [
    {
      "fiId": 5,
      "name": "John Doe",
      "email": "john@example.com",
      "assignedSpots": 6,
      "completedInterviews": 18,
      "inProgress": 7,
      "callbacks": 5,
      "flaggedForSubstitution": 0,
      "totalInterviews": 30,
      "completionRate": 0.60
    }
  ],
  "summary": {
    "totalSpots": 30,
    "assignedSpots": 28,
    "unassignedSpots": 2,
    "completedSpots": 10,
    "totalInterviews": 150,
    "completedInterviews": 75,
    "totalFIs": 3
  }
}
```

**Features:**
- Aggregates spot and questionnaire data
- Calculates FI performance metrics
- Determines spot status based on questionnaire progress
- Provides summary statistics
- Handles Supabase nested relations

### 2. ProgressMap Component

**File:** `src/components/fs-dashboard/ProgressMap.tsx`

**Purpose:** Displays all spots on an interactive map with color-coded pins indicating status.

**Features:**
- Color-coded markers:
  - Gray: Pending
  - Blue: In Progress
  - Green: Completed
  - Red: Flagged for substitution
- Interactive popups showing:
  - Spot name and barangay
  - Assigned FI
  - Progress (X/5 completed)
  - In-progress and flagged counts
  - Individual questionnaire statuses
- Auto-centers map based on spot locations
- Legend for status colors
- Responsive design

**Props:**
```typescript
interface ProgressMapProps {
  spots: SpotData[];
  loading?: boolean;
}
```

### 3. FIPerformanceTable Component

**File:** `src/components/fs-dashboard/FIPerformanceTable.tsx`

**Purpose:** Displays Field Interviewer performance metrics in a sortable table.

**Features:**
- Sortable columns:
  - Name
  - Email
  - Assigned Spots
  - Completed Interviews
  - In Progress
  - Callbacks
  - Flagged
  - Completion Rate
- Visual completion rate indicator (progress bar)
- Color-coded completion rates:
  - Green: ≥80%
  - Blue: ≥50%
  - Orange: ≥30%
  - Red: <30%
- Export to CSV functionality
- Summary footer with overall statistics
- Responsive design

**Props:**
```typescript
interface FIPerformanceTableProps {
  fieldInterviewers: FIPerformance[];
  loading?: boolean;
}
```

### 4. FieldworkMonitoring Component (Enhanced)

**File:** `src/components/fs-dashboard/FieldworkMonitoring.tsx`

**Purpose:** Main container component that integrates the map and table with data fetching.

**Features:**
- Fetches monitoring data from API
- Auto-refresh every 30 seconds
- Manual refresh button
- Summary cards showing:
  - Total spots
  - Assigned/unassigned spots
  - Completed spots
  - Interview progress
  - Number of FIs
  - Overall progress percentage
- Split-screen layout (map on left, table on right)
- Loading states
- Error handling
- Last refresh timestamp

## Data Flow

```
1. FieldworkMonitoring component mounts
   ↓
2. Fetches active cycle from context
   ↓
3. Calls /api/fs/monitoring?cycleId={id}
   ↓
4. API aggregates data from:
   - spots table
   - questionnaires table
   - visits table
   - user table
   ↓
5. Returns formatted data
   ↓
6. FieldworkMonitoring passes data to:
   - ProgressMap (spots data)
   - FIPerformanceTable (FI metrics)
   ↓
7. Components render visualizations
   ↓
8. Auto-refresh every 30 seconds
```

## Status Determination Logic

### Spot Status
```typescript
if (flaggedCount > 0) {
  status = "Flagged";
} else if (completedCount === 5) {
  status = "Completed";
} else if (inProgressCount > 0 || completedCount > 0) {
  status = "In_Progress";
} else {
  status = "Pending";
}
```

### Questionnaire Status
- `Pending`: No visits yet
- `In_Progress`: 1-2 visits, not completed
- `Completed`: Interview finished
- `Flagged_For_Substitution`: 3+ failed visits

## Performance Metrics Calculation

### Completion Rate
```typescript
completionRate = completedInterviews / totalInterviews
totalInterviews = assignedSpots × 5
```

### Callbacks
```typescript
callbacks = sum of (visit_count - 1) for all In_Progress questionnaires
// Subtract 1 because first visit is not a callback
```

## Testing

### Test Script
**File:** `scripts/test-fieldwork-monitoring.js`

**Usage:**
```bash
node scripts/test-fieldwork-monitoring.js
```

**Tests:**
1. Active cycle retrieval
2. Spots data availability
3. API endpoint functionality
4. Response structure validation
5. Spots data validation
6. FI performance data validation
7. Summary data validation

## UI/UX Features

### Summary Cards
- 7 metric cards at the top
- Color-coded for visual distinction
- Large numbers for quick scanning

### Map View
- Interactive Leaflet map
- Click markers for detailed popup
- Legend for status colors
- Auto-centering based on spots

### Performance Table
- Sortable columns (click header to sort)
- Visual progress bars
- Color-coded completion rates
- Export to CSV button
- Summary footer

### Auto-Refresh
- Updates every 30 seconds
- Manual refresh button
- Last refresh timestamp
- Loading indicators

## Integration Points

### Existing Components Used
- `useActiveCycle` hook for cycle data
- `FSDashboardLayout` for page structure
- `FSNavbar` for navigation
- Leaflet map library (consistent with SpotAllocationMap)

### New Exports
Added to `src/components/fs-dashboard/index.ts`:
- `ProgressMap`
- `FIPerformanceTable`

## Database Queries

### Main Query (Supabase)
```typescript
supabaseAdmin
  .from('spots')
  .select(`
    spot_id,
    spot_name,
    starting_point,
    status,
    assigned_fi_id,
    barangay:barangay_id (barangay_name),
    assigned_fi:assigned_fi_id (id, firstName, lastName),
    questionnaires (questionnaire_id, status, visit_count)
  `)
  .eq('cycle_id', cycleId)
```

## Error Handling

### API Errors
- Missing cycleId: 400 Bad Request
- Invalid cycleId: 400 Bad Request
- Cycle not found: 404 Not Found
- Database errors: 500 Internal Server Error

### UI Errors
- No active cycle: Friendly message
- API failure: Error message with retry button
- No data: Empty state messages

## Future Enhancements

### Potential Improvements
1. WebSocket for real-time updates (instead of polling)
2. Filtering by barangay or FI
3. Date range filtering
4. Detailed drill-down views
5. Performance trends over time
6. Export to PDF reports
7. Email notifications for flagged spots
8. Mobile-optimized view

## Requirements Satisfied

✅ **Requirement 1.8:** Display real-time fieldwork progress including interview statuses on a map view
✅ **Requirement 1.9:** Display a table showing Field Interviewer performance metrics

## Task Completion

- ✅ Task 8.1: Create ProgressMap component
- ✅ Task 8.2: Create FIPerformanceTable component
- ✅ Task 8.3: Create monitoring API endpoint
- ✅ Task 8: Implement fieldwork monitoring tab

## Files Created/Modified

### Created
- `src/app/api/fs/monitoring/route.ts`
- `src/components/fs-dashboard/ProgressMap.tsx`
- `src/components/fs-dashboard/FIPerformanceTable.tsx`
- `scripts/test-fieldwork-monitoring.js`
- `docs/FIELDWORK_MONITORING_IMPLEMENTATION.md`

### Modified
- `src/components/fs-dashboard/FieldworkMonitoring.tsx`
- `src/components/fs-dashboard/index.ts`

## Notes

- The monitoring tab uses polling (30-second intervals) for updates. For production with many users, consider implementing WebSocket connections for true real-time updates.
- The CSV export includes all visible data at the time of export.
- Map markers use custom SVG icons for consistent styling.
- The component is fully responsive and works on mobile devices.
- All data is scoped to the active survey cycle.

## Conclusion

The Fieldwork Monitoring tab provides Field Supervisors with comprehensive visibility into ongoing fieldwork operations. The combination of map visualization and performance metrics enables effective monitoring and management of Field Interviewers, helping ensure survey quality and completion targets are met.
