# CPAP Spreadsheet Implementation

## Overview
This document describes the new embedded spreadsheet interface for CPAP (Citizen Priority Action Plan) submission.

## Changes Implemented

### 1. New CPAP Editor Page
**Location:** `src/app/cpap/editor/page.tsx`

A dedicated page for creating and editing CPAPs with a spreadsheet-like interface.

**Features:**
- Full-width spreadsheet view
- Header shows "Barangay of:" instead of "Municipality"
- Shows survey cycle title instead of "C.Y."
- Auto-save functionality
- Navigation back to CPAP list

### 2. CPAPSpreadsheet Component
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx`

An embedded spreadsheet component that mimics the CPAP form structure from the provided image.

**Features:**
- 13 columns matching the CPAP form:
  1. Results/Observations on Specific Target Service Area
  2. Plan of Action
  3. Activity
  4. Output
  5. Actual Output
  6. Status of Accomplishment
  7. Implementation Schedule
  8. Actual Date
  9. Financial Requirements
  10. Responsible Person/Office
  11. Committed/To be Committed in Sectoral Plan/Budget
  12. Means of Verification
  13. Actions (Delete button)

- **Service Areas** (organized as row groups):
  - FINANCIAL ADMINISTRATION
  - DISASTER PREPAREDNESS
  - SOCIAL PROTECTION
  - SAFETY AND PEACE
  - BUSINESS-FRIENDLY
  - ENVIRONMENTAL MANAGEMENT

- **Row Management:**
  - Each service area has its own section
  - Add multiple rows per service area
  - Delete individual rows
  - Empty service areas show "Add row" button

### 3. Updated Main CPAP Page
**Location:** `src/app/cpap/page.tsx`

**Changes:**
- Shows "Create a Plan" button when no CPAP exists
- Redirects to `/cpap/editor` for spreadsheet editing
- Added "Edit in Spreadsheet View" button for existing CPAPs
- No longer auto-creates CPAP on page load

## User Workflow

### Creating a New CPAP
1. User navigates to `/cpap`
2. If no CPAP exists, sees "Create a Plan" button
3. Clicks button → redirects to `/cpap/editor`
4. Spreadsheet interface loads with 8 service area sections
5. User fills in data for each service area
6. Clicks "Save Plan" to persist changes

### Editing an Existing CPAP
1. User navigates to `/cpap`
2. Sees existing CPAP with "Edit in Spreadsheet View" button
3. Clicks button → redirects to `/cpap/editor`
4. Spreadsheet loads with existing data
5. User makes changes
6. Clicks "Save All Changes" to persist

## Data Mapping

The spreadsheet columns map to CPAP database fields as follows:

| Spreadsheet Column | Database Field |
|-------------------|----------------|
| Service Area | `priority_area` |
| Output | `target_output` |
| Actual Output | `actual_output` |
| Status of Accomplishment | `accomplishment_status` |
| Implementation Schedule | `timeline_start` + `timeline_end` |
| Responsible Person/Office | `responsible_person` |
| Means of Verification | `success_indicator` |

**Note:** Some columns (Observation, Plan of Action, Activity, Actual Date, Financial Requirements, Committed/To be Committed) are currently stored in the spreadsheet state but not yet mapped to database fields. These can be added to the schema in future backend work.

## Technical Details

### Component Structure
```
/cpap
  ├── page.tsx (Main CPAP list/view)
  └── /editor
      └── page.tsx (Spreadsheet editor)

/components/cpap
  ├── CPAPSpreadsheet.tsx (New spreadsheet component)
  ├── CPAPItemForm.tsx (Existing form component)
  ├── CPAPItemList.tsx (Existing list component)
  └── ... (other CPAP components)
```

### State Management
- Spreadsheet rows are managed in local state
- Changes are saved via existing CPAP API endpoints
- Data is converted between spreadsheet format and CPAP item format

### Styling
- Uses Tailwind CSS for styling
- Table has fixed column widths for better UX
- Responsive design with horizontal scroll
- Textarea inputs for multi-line content
- Input fields for single-line content

## Future Enhancements (Backend Work)

1. **Database Schema Updates:**
   - Add fields for: observation, plan_of_action, activity, actual_date, financial_requirements, committed_to_be_committed
   - Update CPAP item model to include these fields

2. **API Updates:**
   - Modify PUT `/api/cpap/[id]` to handle new fields
   - Update validation logic

3. **Additional Features:**
   - Export to Excel/PDF
   - Import from Excel
   - Print view
   - Bulk operations
   - Version history

## Testing Checklist

- [ ] Create new CPAP from empty state
- [ ] Add rows to each service area
- [ ] Delete rows
- [ ] Save changes
- [ ] Navigate back to main CPAP page
- [ ] Edit existing CPAP
- [ ] Verify data persistence
- [ ] Test with different user roles (Officer, Admin, Viewer)
- [ ] Test responsive design on different screen sizes

## Notes

- Frontend-only implementation (no backend changes required yet)
- Existing CPAP functionality remains intact
- Old form-based interface still accessible
- Data is compatible with existing database schema
