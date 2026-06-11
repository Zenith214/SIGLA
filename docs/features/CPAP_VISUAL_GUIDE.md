# CPAP Visual Guide

## Before & After Comparison

### BEFORE: Old CPAP Interface

**Main Page:**
- Auto-created CPAP on page load
- Form-based interface
- "Add Item" button opens modal
- Individual item cards
- Limited visibility of all data

**Editing:**
- Modal popup for each item
- One item at a time
- Separate fields for each property
- Save button per item

### AFTER: New CPAP Interface

**Main Page:**
- "Create a Plan" button when no CPAP exists
- Link to spreadsheet editor
- Overview of existing CPAP
- "Edit in Spreadsheet View" button

**Editing:**
- Full spreadsheet interface
- See all items at once
- Organized by service areas
- Bulk editing capability
- Single save for all changes

## Detailed Visual Descriptions

### 1. Main CPAP Page - Empty State

```
┌────────────────────────────────────────────────────────────────┐
│ Header (Dark Slate Background)                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ [←]  CPAP Submission                                      │  │
│ │      Citizen Priority Action Plan                         │  │
│ └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│ Content Area (Light Blue Background)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │                    ╭─────────────╮                        │ │
│  │                    │             │                        │ │
│  │                    │   [ICON]    │  (Blue circle with    │ │
│  │                    │     +       │   plus icon)          │ │
│  │                    │             │                        │ │
│  │                    ╰─────────────╯                        │ │
│  │                                                           │ │
│  │              No CPAP Created Yet                          │ │
│  │                                                           │ │
│  │   Create your Citizen Priority Action Plan to            │ │
│  │   document and track your barangay's priority            │ │
│  │   actions based on survey results.                       │ │
│  │                                                           │ │
│  │          ┌─────────────────────────┐                     │ │
│  │          │  [+] Create a Plan      │  (Blue button)      │ │
│  │          └─────────────────────────┘                     │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Large blue circle icon with plus symbol
- Clear heading "No CPAP Created Yet"
- Descriptive text explaining purpose
- Prominent blue "Create a Plan" button
- Clean, centered layout

### 2. Main CPAP Page - With Existing CPAP

```
┌────────────────────────────────────────────────────────────────┐
│ Header (Dark Slate Background)                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ [←]  CPAP Submission                    [Draft Badge]    │  │
│ │      Citizen Priority Action Plan                         │  │
│ └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│ Content Area (Light Blue Background)                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                           │ │
│  │  Zamboanguita, Negros Oriental                           │ │
│  │  Survey Cycle 2024 - 2024                                │ │
│  │                                                           │ │
│  │                    [Edit in Spreadsheet View]  (Button)  │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ Revision Requested (if applicable)                 │ │ │
│  │  │ Admin comments here...                             │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  [+ Add Item]  [✨ AI Suggestions]                       │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ Item 1: Health - Newborn Screening                 │ │ │
│  │  │ Target: Acquisition of 1 machine                   │ │ │
│  │  │ Timeline: Jan - Dec 2018                           │ │ │
│  │  │ [Edit] [Delete]                                    │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │ Item 2: Education - School Building                │ │ │
│  │  │ ...                                                │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │                    [Submit to DILG for Review]           │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Status badge (Draft, Submitted, Approved, etc.)
- Barangay name and survey cycle info
- "Edit in Spreadsheet View" button (NEW)
- List of existing items
- Submit button at bottom

### 3. CPAP Editor Page - Spreadsheet View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header (White Background)                                                   │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ [←]  CITIZEN PRIORITY ACTION PLAN          [💾 Save Plan]            │  │
│ │      Barangay of: Zamboanguita    Survey Cycle 2024: 2024            │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Content Area (Gray Background)                                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Spreadsheet Table (White Background)                                  │ │
│  │                                                                        │ │
│  │ ┌──────────┬──────────┬──────────┬──────────┬──────────┬─────────┐  │ │
│  │ │ Results/ │ Plan of  │ Activity │  Output  │  Actual  │ Status  │  │ │
│  │ │ Observ.  │  Action  │          │          │  Output  │ of Acc. │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │ HEALTH                                                          │  │ │
│  │ ├──────────┬──────────┬──────────┬──────────┬──────────┬─────────┤  │ │
│  │ │ Availm't │ Acquisit │ Purchase │ Acquisit │ New born │ To be   │  │ │
│  │ │ of serv  │ of medic │ of Newb  │ of 1 New │ babies   │ purchas │  │ │
│  │ │ on Prev  │ equipmnt │ Test Mac │ Screenin │ undergon │ ed      │  │ │
│  │ │ ...      │          │          │ ...      │ screenin │         │  │ │
│  │ │          │          │          │          │          │    [🗑] │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │                    [+ Add another row]                          │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │ EDUCATION                                                       │  │ │
│  │ ├──────────┬──────────┬──────────┬──────────┬──────────┬─────────┤  │ │
│  │ │          │          │          │          │          │         │  │ │
│  │ │          │          │          │          │          │    [🗑] │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │                    [+ Add another row]                          │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │ SOCIAL WELFARE AND DEVELOPMENT                                  │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │              [+ Add row for SOCIAL WELFARE]                     │  │ │
│  │ ├──────────┴──────────┴──────────┴──────────┴──────────┴─────────┤  │ │
│  │ │ ... (more service areas)                                        │  │ │
│  │ └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │ ┌───────────────────────────────────────────────────────────────────┐│ │
│  │ │                                    [Save All Changes]             ││ │
│  │ └───────────────────────────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Full-width spreadsheet table
- 13 columns with headers
- Service area section headers (blue background)
- Editable cells (textarea and input)
- Add row buttons per section
- Delete buttons per row
- Save button in header and footer

### 4. Spreadsheet Cell Types

#### Textarea Cell (Multi-line)
```
┌─────────────────────────────┐
│ Availment of services on    │
│ the Prevention and          │
│ Management of Diseases      │
│                             │
│ [Cursor here]               │
└─────────────────────────────┘
```
- Auto-expands with content
- Minimum height: 60px
- Border appears on focus
- Text wraps automatically

#### Input Cell (Single-line)
```
┌─────────────────────────────┐
│ Jan - Dec 2018              │
└─────────────────────────────┘
```
- Fixed height
- Border appears on focus
- Placeholder text when empty

### 5. Service Area Section

```
┌─────────────────────────────────────────────────────────────────┐
│ HEALTH                                                          │ ← Blue header
├─────────────────────────────────────────────────────────────────┤
│ [Row 1 with all 13 columns]                                     │
├─────────────────────────────────────────────────────────────────┤
│ [Row 2 with all 13 columns]                                     │
├─────────────────────────────────────────────────────────────────┤
│                    [+ Add another row]                          │ ← Gray footer
└─────────────────────────────────────────────────────────────────┘
```

### 6. Empty Service Area Section

```
┌─────────────────────────────────────────────────────────────────┐
│ PEACE AND ORDER                                                 │ ← Blue header
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│              [+ Add row for PEACE AND ORDER]                    │ ← Centered button
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Action Buttons

#### Delete Button
```
┌─────┐
│ 🗑  │  ← Red trash icon
└─────┘
```
- Appears in Actions column
- Red color on hover
- Removes row immediately

#### Add Row Button
```
┌──────────────────────┐
│ [+] Add another row  │  ← Blue text, ghost style
└──────────────────────┘
```
- Appears at bottom of each service area
- Blue text color
- Ghost button style

#### Save Button (Header)
```
┌──────────────────────┐
│ [💾] Save Plan       │  ← Blue background
└──────────────────────┘
```
- Solid blue button
- Save icon
- Top-right corner

#### Save Button (Footer)
```
┌──────────────────────────┐
│ Save All Changes         │  ← Blue background
└──────────────────────────┘
```
- Solid blue button
- Bottom of spreadsheet
- Right-aligned

### 8. Loading States

#### Page Loading
```
┌─────────────────────────────┐
│                             │
│         ⟳ Loading...        │  ← Spinning icon
│                             │
└─────────────────────────────┘
```

#### Saving
```
┌──────────────────────────┐
│ [⟳] Saving...            │  ← Button disabled, spinner
└──────────────────────────┘
```

### 9. Toast Notifications

#### Success Toast
```
┌─────────────────────────────────┐
│ ✓ Success                       │  ← Green background
│ CPAP saved successfully         │
└─────────────────────────────────┘
```

#### Error Toast
```
┌─────────────────────────────────┐
│ ✗ Error                         │  ← Red background
│ Failed to save changes          │
└─────────────────────────────────┘
```

## Color Palette

### Primary Colors
- **Blue**: #2563eb (Buttons, links, accents)
- **Light Blue**: #eff6ff (Service area headers)
- **Dark Slate**: #1e293b (Page header background)

### Neutral Colors
- **White**: #ffffff (Card backgrounds, table cells)
- **Light Gray**: #f3f4f6 (Table header background)
- **Gray**: #d1d5db (Borders)
- **Dark Gray**: #374151 (Text)

### Status Colors
- **Green**: #10b981 (Success, approved)
- **Red**: #dc2626 (Error, delete, revision)
- **Yellow**: #f59e0b (Warning)
- **Blue**: #3b82f6 (Info, draft)

## Typography

### Headings
- **Page Title**: 24px, Bold, Dark Gray
- **Section Title**: 18px, Semibold, Dark Gray
- **Service Area**: 14px, Bold, Dark Gray

### Body Text
- **Regular**: 14px, Normal, Dark Gray
- **Small**: 12px, Normal, Gray
- **Input Text**: 12px, Normal, Dark Gray

## Spacing

- **Page Padding**: 24px (desktop), 16px (mobile)
- **Card Padding**: 24px
- **Table Cell Padding**: 8px
- **Button Padding**: 12px 24px
- **Section Spacing**: 16px

## Responsive Breakpoints

- **Desktop**: > 1024px (Full table visible)
- **Tablet**: 768px - 1024px (Horizontal scroll)
- **Mobile**: < 768px (Horizontal scroll, smaller padding)

## Accessibility

- **Focus States**: Blue outline on all interactive elements
- **Keyboard Navigation**: Tab through all fields
- **Screen Reader**: Proper labels on all inputs
- **Color Contrast**: WCAG AA compliant
- **Touch Targets**: Minimum 44x44px on mobile
