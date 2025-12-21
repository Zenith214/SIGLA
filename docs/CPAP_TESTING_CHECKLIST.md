# CPAP Spreadsheet Testing Checklist

## Pre-Testing Setup

- [ ] Development server is running (`npm run dev`)
- [ ] Database is connected and accessible
- [ ] Test user accounts are available (Officer, Admin, Viewer)
- [ ] Active survey cycle exists
- [ ] Test barangay is assigned to test users

## Functional Testing

### 1. Page Access & Navigation

- [ ] Navigate to `/cpap` as Officer user
- [ ] Navigate to `/cpap` as Admin user
- [ ] Navigate to `/cpap` as Viewer user
- [ ] Verify FS/Interviewer users cannot access (403 Forbidden)
- [ ] Back button navigates to dashboard
- [ ] Navigation between `/cpap` and `/cpap/editor` works

### 2. Create New CPAP

- [ ] No CPAP exists for barangay/cycle
- [ ] "Create a Plan" button is visible
- [ ] Button has proper styling (blue, with icon)
- [ ] Clicking button redirects to `/cpap/editor`
- [ ] Editor page loads successfully
- [ ] Header shows "Barangay of: [Name]"
- [ ] Header shows survey cycle title and year
- [ ] All 8 service area sections are visible

### 3. Spreadsheet Interface

#### Header
- [ ] All 13 column headers are visible
- [ ] Column headers have proper labels
- [ ] Headers are styled correctly (gray background)
- [ ] Table is scrollable horizontally on small screens

#### Service Areas
- [ ] FINANCIAL ADMINISTRATION section is visible
- [ ] DISASTER PREPAREDNESS section is visible
- [ ] SOCIAL PROTECTION section is visible
- [ ] SAFETY AND PEACE section is visible
- [ ] BUSINESS-FRIENDLY section is visible
- [ ] ENVIRONMENTAL MANAGEMENT section is visible
- [ ] Service area headers have blue background
- [ ] Service area names are bold

#### Empty State
- [ ] Empty service areas show "Add row for [Area]" button
- [ ] Button is centered and styled correctly
- [ ] Clicking button adds a new row

### 4. Row Management

#### Adding Rows
- [ ] Click "+ Add row for HEALTH" adds a row
- [ ] New row has all 13 input fields
- [ ] Input fields are empty
- [ ] Row is added to correct service area
- [ ] Can add multiple rows to same service area
- [ ] "+ Add another row" button appears after first row
- [ ] Can add rows to all 8 service areas

#### Deleting Rows
- [ ] Delete button (trash icon) is visible in Actions column
- [ ] Clicking delete removes the row immediately
- [ ] Deleted row disappears from UI
- [ ] Can delete any row
- [ ] Deleting all rows shows "Add row" button again

### 5. Data Entry

#### Textarea Fields
- [ ] Results/Observations field accepts multi-line text
- [ ] Plan of Action field accepts multi-line text
- [ ] Activity field accepts multi-line text
- [ ] Output field accepts multi-line text
- [ ] Actual Output field accepts multi-line text
- [ ] Status of Accomplishment field accepts multi-line text
- [ ] Means of Verification field accepts multi-line text
- [ ] Textareas auto-expand with content
- [ ] Text wraps properly

#### Input Fields
- [ ] Implementation Schedule accepts text
- [ ] Actual Date accepts text
- [ ] Financial Requirements accepts text
- [ ] Responsible Person/Office accepts text
- [ ] Committed/To be Committed accepts text
- [ ] Input fields have proper width

#### Keyboard Navigation
- [ ] Tab key moves to next field
- [ ] Shift+Tab moves to previous field
- [ ] Enter key creates new line in textarea
- [ ] Can type in all fields without issues

### 6. Saving Data

#### Save Button (Top)
- [ ] "Save Plan" button is visible in header
- [ ] Button has save icon
- [ ] Button is styled correctly (blue)
- [ ] Clicking button saves data
- [ ] Loading state shows "Saving..." with spinner
- [ ] Success toast appears after save
- [ ] Button is disabled while saving

#### Save Button (Bottom)
- [ ] "Save All Changes" button is visible at bottom
- [ ] Button saves data when clicked
- [ ] Same behavior as top save button

#### Data Persistence
- [ ] Saved data persists after page refresh
- [ ] Navigate away and back - data is still there
- [ ] Multiple saves don't duplicate data
- [ ] Empty rows are not saved

### 7. Edit Existing CPAP

#### Loading Existing Data
- [ ] Navigate to `/cpap` with existing CPAP
- [ ] "Edit in Spreadsheet View" button is visible
- [ ] Clicking button redirects to `/cpap/editor`
- [ ] Existing data loads in spreadsheet
- [ ] Data appears in correct columns
- [ ] Data appears in correct service areas
- [ ] All rows are visible

#### Editing Data
- [ ] Can modify any cell
- [ ] Changes are reflected immediately in UI
- [ ] Can add new rows to existing data
- [ ] Can delete existing rows
- [ ] Saving updates the data
- [ ] Changes persist after save

### 8. Error Handling

- [ ] No barangay assignment shows error message
- [ ] No active cycle shows error message
- [ ] Network error shows error toast
- [ ] Save failure shows error toast
- [ ] Invalid data shows validation error
- [ ] Error messages are clear and helpful

### 9. User Roles & Permissions

#### Officer Role
- [ ] Can access `/cpap`
- [ ] Can access `/cpap/editor`
- [ ] Can create CPAP
- [ ] Can edit CPAP
- [ ] Can save changes
- [ ] Can only access own barangay CPAP

#### Admin Role
- [ ] Can access `/cpap`
- [ ] Can access `/cpap/editor`
- [ ] Can view all CPAPs
- [ ] Cannot create CPAP (Officer only)
- [ ] Can view in read-only mode

#### Viewer Role
- [ ] Can access `/cpap`
- [ ] Can view CPAP
- [ ] Cannot edit CPAP
- [ ] "Edit in Spreadsheet View" button not visible
- [ ] Shows "Viewing Mode" notice

#### FS/Interviewer Roles
- [ ] Cannot access `/cpap` (403 Forbidden)
- [ ] Cannot access `/cpap/editor` (403 Forbidden)
- [ ] Redirected to forbidden page

### 10. UI/UX Testing

#### Visual Design
- [ ] Table borders are visible and consistent
- [ ] Colors match design (blue, gray, white)
- [ ] Fonts are readable
- [ ] Icons are clear and appropriate
- [ ] Spacing is consistent
- [ ] No visual glitches or overlaps

#### Responsiveness
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Horizontal scroll works on small screens
- [ ] Buttons are clickable on touch devices
- [ ] Text is readable on all screen sizes

#### User Experience
- [ ] Interface is intuitive
- [ ] Actions are clear and obvious
- [ ] Feedback is immediate (loading states, toasts)
- [ ] No confusing elements
- [ ] Help text is available where needed
- [ ] Error messages are helpful

### 11. Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Spreadsheet renders quickly
- [ ] No lag when typing in fields
- [ ] Save operation completes in < 2 seconds
- [ ] No memory leaks (check browser dev tools)
- [ ] Smooth scrolling
- [ ] No UI freezing

### 12. Browser Compatibility

- [ ] Works in Chrome (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Works in Edge (latest)
- [ ] No console errors in any browser
- [ ] Consistent behavior across browsers

### 13. Data Validation

- [ ] Empty rows are not saved
- [ ] Required fields are validated (if applicable)
- [ ] Date formats are accepted
- [ ] Number formats are accepted
- [ ] Special characters are handled correctly
- [ ] Long text doesn't break layout

### 14. Integration Testing

- [ ] CPAP data appears in main `/cpap` page
- [ ] CPAP status is correct
- [ ] CPAP items count is accurate
- [ ] Barangay name is correct
- [ ] Survey cycle info is correct
- [ ] Timestamps are accurate

### 15. Edge Cases

- [ ] Very long text in textarea
- [ ] Special characters (é, ñ, etc.)
- [ ] Empty CPAP (no rows)
- [ ] CPAP with 50+ rows
- [ ] Multiple users editing same CPAP
- [ ] Network disconnection during save
- [ ] Browser back button behavior
- [ ] Page refresh during edit

## Post-Testing

- [ ] All critical bugs are documented
- [ ] All medium bugs are documented
- [ ] All minor issues are documented
- [ ] Screenshots of issues are captured
- [ ] Test results are shared with team
- [ ] Stakeholder demo is scheduled

## Test Results Summary

**Date Tested:** _______________
**Tested By:** _______________
**Browser:** _______________
**Device:** _______________

**Total Tests:** _____ / _____
**Passed:** _____
**Failed:** _____
**Blocked:** _____

**Critical Issues:** _____
**Medium Issues:** _____
**Minor Issues:** _____

**Overall Status:** ☐ Pass ☐ Fail ☐ Pass with Issues

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
