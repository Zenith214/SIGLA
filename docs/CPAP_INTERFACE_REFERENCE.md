# CPAP Interface Reference

## Visual Layout

### Main CPAP Page (`/cpap`)

#### When No CPAP Exists:
```
┌─────────────────────────────────────────────────────────────┐
│  ← CPAP Submission                                          │
│     Citizen Priority Action Plan                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    [Blue Circle Icon]                        │
│                                                              │
│              No CPAP Created Yet                             │
│                                                              │
│   Create your Citizen Priority Action Plan to document      │
│   and track your barangay's priority actions based on       │
│   survey results.                                            │
│                                                              │
│              [+ Create a Plan]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### When CPAP Exists:
```
┌─────────────────────────────────────────────────────────────┐
│  ← CPAP Submission                              [Status]     │
│     Citizen Priority Action Plan                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Barangay Name                [Edit in Spreadsheet View]    │
│  Survey Cycle - 2024                                        │
│                                                              │
│  [Action Items List...]                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### CPAP Editor Page (`/cpap/editor`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← CITIZEN PRIORITY ACTION PLAN                      [💾 Save Plan]          │
│     Barangay of: Zamboanguita    Survey Cycle 2024: 2024                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Results/ │ Plan of │ Activity │ Output │ Actual │ Status │ ... │ Actions││
│  │ Observ.  │ Action  │          │        │ Output │ of Acc.│     │        ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ HEALTH                                                                   ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ [Textarea] [Textarea] [Textarea] [Textarea] [Textarea] [Input] ... [🗑] ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                        [+ Add another row]                               ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ EDUCATION                                                                ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ [Textarea] [Textarea] [Textarea] [Textarea] [Textarea] [Input] ... [🗑] ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                        [+ Add another row]                               ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ SOCIAL WELFARE AND DEVELOPMENT                                           ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │                    [+ Add row for SOCIAL WELFARE]                        ││
│  ├─────────────────────────────────────────────────────────────────────────┤│
│  │ ... (more service areas)                                                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                               │
│                                        [Save All Changes]                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Spreadsheet Columns (13 Total)

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Results/   │  Plan of     │   Activity   │    Output    │   Actual     │
│ Observations │   Action     │              │              │   Output     │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│  [Textarea]  │  [Textarea]  │  [Textarea]  │  [Textarea]  │  [Textarea]  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Status of  │Implementat'n │   Actual     │  Financial   │ Responsible  │
│Accomplishment│   Schedule   │    Date      │Requirements  │Person/Office │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│  [Textarea]  │    [Input]   │    [Input]   │    [Input]   │    [Input]   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┐
│ Committed/To │    Means of  │   Actions    │
│be Committed  │ Verification │              │
├──────────────┼──────────────┼──────────────┤
│    [Input]   │  [Textarea]  │     [🗑]     │
└──────────────┴──────────────┴──────────────┘
```

## Service Area Sections

Each service area has its own section in the spreadsheet:

1. **FINANCIAL ADMINISTRATION** (Blue header row)
   - Add rows for financial administration action items
   
2. **DISASTER PREPAREDNESS** (Blue header row)
   - Add rows for disaster preparedness action items
   
3. **SOCIAL PROTECTION** (Blue header row)
   - Add rows for social protection action items
   
4. **SAFETY AND PEACE** (Blue header row)
   - Add rows for safety and peace action items
   
5. **BUSINESS-FRIENDLY** (Blue header row)
   - Add rows for business-friendly action items
   
6. **ENVIRONMENTAL MANAGEMENT** (Blue header row)
   - Add rows for environmental management action items

## Color Scheme

- **Header Background**: Gray (#f3f4f6)
- **Service Area Headers**: Light Blue (#eff6ff)
- **Table Borders**: Gray (#d1d5db)
- **Row Hover**: Light Gray (#f9fafb)
- **Primary Button**: Blue (#2563eb)
- **Delete Button**: Red (#dc2626)

## Responsive Behavior

- **Desktop (>1024px)**: Full table visible
- **Tablet (768-1024px)**: Horizontal scroll enabled
- **Mobile (<768px)**: Horizontal scroll with sticky first column

## Input Types

- **Textarea**: Multi-line text fields (auto-expanding)
  - Results/Observations
  - Plan of Action
  - Activity
  - Output
  - Actual Output
  - Status of Accomplishment
  - Means of Verification

- **Input**: Single-line text fields
  - Implementation Schedule
  - Actual Date
  - Financial Requirements
  - Responsible Person/Office
  - Committed/To be Committed

## Button Actions

- **← (Back Arrow)**: Navigate back to `/cpap`
- **💾 Save Plan**: Save all changes (top-right)
- **+ Add another row**: Add new row to service area
- **+ Add row for [Area]**: Add first row to empty service area
- **🗑 (Delete)**: Remove row from spreadsheet
- **Save All Changes**: Save all changes (bottom)

## Example Data Flow

### Creating a New Entry:

1. User clicks "Create a Plan" on `/cpap`
2. Redirects to `/cpap/editor`
3. Spreadsheet loads with 8 empty service area sections
4. User clicks "+ Add row for HEALTH"
5. New row appears with empty input fields
6. User fills in:
   - Observation: "Availment of services on the Prevention..."
   - Plan of Action: "Acquisition of medical equipment"
   - Activity: "Purchase of Newborn Test Machine"
   - Output: "Acquisition of 1 Newborn Screening Test Machine"
   - Implementation Schedule: "Jan - Dec 2018"
   - Financial Requirements: "50,000.00"
   - Responsible Person: "MHO"
   - Means of Verification: "List of patient"
7. User clicks "Save All Changes"
8. Data is saved to database
9. Success toast appears

### Editing an Existing Entry:

1. User navigates to `/cpap`
2. Sees existing CPAP with data
3. Clicks "Edit in Spreadsheet View"
4. Redirects to `/cpap/editor`
5. Spreadsheet loads with existing data populated
6. User modifies any cell
7. User clicks "Save All Changes"
8. Changes are persisted
9. Success toast appears

## Navigation Flow

```
Dashboard
    ↓
/cpap (Main CPAP Page)
    ↓
    ├─→ No CPAP: Click "Create a Plan" → /cpap/editor
    │
    └─→ Has CPAP: Click "Edit in Spreadsheet View" → /cpap/editor
            ↓
        /cpap/editor (Spreadsheet Editor)
            ↓
        Click ← (Back) → /cpap
```

## Key Features

✅ **Inline Editing**: Click any cell to edit
✅ **Tab Navigation**: Use Tab key to move between cells
✅ **Auto-save**: Click save button to persist changes
✅ **Row Management**: Add/delete rows per service area
✅ **Service Area Organization**: Grouped by 8 service areas
✅ **Responsive Design**: Works on all screen sizes
✅ **Data Persistence**: Saves to existing CPAP database
✅ **User-friendly**: Familiar spreadsheet interface
