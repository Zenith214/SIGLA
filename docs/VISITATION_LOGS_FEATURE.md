# Visitation Logs Feature

## Overview

The Visitation Logs feature allows supervisors and admins to view all visit attempts made by interviewers for surveys in a specific barangay. This provides transparency and helps track field operations.

## Location

The visitation logs are displayed on the **Barangay Survey Responses** page:
- URL: `/survey/barangay/[id]`
- Example: `http://localhost:3000/survey/barangay/24`

## What is Displayed

The Visitation Logs card shows:

1. **Survey ID** - The questionnaire display ID (e.g., 2025-24-01-001)
2. **Respondent** - Name of the respondent (if available)
3. **Spot** - The survey location/spot name
4. **Visit #** - The visit number (1st visit, 2nd visit, etc.)
5. **Outcome** - The result of the visit:
   - ✅ **Completed** - Survey successfully completed
   - ⏰ **Callback Needed** - Need to return later
   - ❌ **Refused** - Respondent refused to participate
   - 🏠 **Household Moved** - Household no longer at location
6. **Date & Time** - When the visit occurred
7. **Notes** - Any notes recorded by the interviewer

## How It Works

### Data Flow

```
Interviewer → Logs visit in survey form → Visit saved to database → Displayed on barangay page
```

### Database Structure

Visits are stored in the `visits` table with the following key fields:
- `visit_id` - Unique identifier
- `questionnaire_id` - Links to the survey questionnaire
- `visit_number` - Sequential visit number (1, 2, 3, etc.)
- `visit_timestamp` - When the visit occurred
- `outcome` - Result of the visit
- `notes` - Optional notes from interviewer
- `location_lat/lng` - GPS coordinates (if captured)

### API Endpoint

**GET** `/api/barangays/[id]/visits`

Fetches all visitation logs for a specific barangay by:
1. Joining `visits` → `questionnaires` → `spots` → `barangays`
2. Filtering by `barangay_id`
3. Ordering by `visit_timestamp` (most recent first)

## User Access

### Who Can View Visitation Logs?

- ✅ **Admin** - Can view all barangays
- ✅ **Field Supervisor (FS)** - Can view assigned barangays
- ❌ **Interviewer** - Cannot access barangay detail pages
- ❌ **Barangay Official** - Cannot access survey operations

## Use Cases

### 1. Monitor Field Operations
Supervisors can track:
- How many visits have been made
- Which surveys need callbacks
- Refusal rates
- Field team productivity

### 2. Quality Assurance
Admins can verify:
- Visit timestamps are reasonable
- Notes provide adequate context
- Proper follow-up procedures are followed

### 3. Problem Identification
Identify issues such as:
- High refusal rates in certain spots
- Households that have moved
- Surveys requiring multiple callbacks

### 4. Performance Tracking
Track interviewer performance:
- Success rate on first visit
- Average visits per completed survey
- Time between visits

## Visual Design

The Visitation Logs card follows the same design pattern as other cards on the page:
- White background with rounded corners
- Shadow and border for depth
- Responsive table layout
- Color-coded outcome badges
- Icons for visual clarity

### Outcome Color Coding

- 🟢 **Green** - Completed
- 🟡 **Amber** - Callback Needed
- 🔴 **Red** - Refused
- ⚫ **Gray** - Household Moved

## Technical Implementation

### Components

1. **VisitationLogsCard.tsx**
   - Location: `src/components/survey/VisitationLogsCard.tsx`
   - Fetches and displays visitation logs
   - Handles loading and error states
   - Formats outcomes with icons and colors

2. **API Route**
   - Location: `src/app/api/barangays/[id]/visits/route.ts`
   - Fetches visits with related data
   - Filters by barangay ID
   - Returns formatted JSON response

3. **Integration**
   - Added to: `src/app/survey/barangay/[id]/page.tsx`
   - Placed below "Assigned Interviewers" card
   - Automatically loads when page loads

### Key Features

- **Real-time data** - Fetches latest visits on page load
- **Responsive design** - Works on mobile and desktop
- **Error handling** - Graceful error messages
- **Empty state** - Clear message when no visits exist
- **Performance** - Efficient database queries with proper joins

## Future Enhancements

Potential improvements:
- [ ] Filter by outcome type
- [ ] Filter by date range
- [ ] Export to CSV
- [ ] Show GPS location on map
- [ ] Group by interviewer
- [ ] Show visit duration
- [ ] Add pagination for large datasets
- [ ] Real-time updates via websockets

## Testing

To test the feature:

1. Navigate to a barangay detail page
2. Scroll down to "Visitation Logs" section
3. Verify visits are displayed correctly
4. Check that outcomes are color-coded
5. Verify notes are shown/hidden appropriately
6. Test with barangays that have no visits

## Related Documentation

- [CPAP Workflow Diagram](./CPAP_WORKFLOW_DIAGRAM.md) - Complete system workflow
- [CPAP Testing Guide](./CPAP_TESTING_GUIDE.md) - Testing procedures
- Survey Forms Documentation - Visit logging in survey forms
