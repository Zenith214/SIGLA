# CSIS Manual Test Execution Guide

This guide provides step-by-step instructions for executing the manual testing checklist for the CSIS workflow upgrade.

## Prerequisites

### Environment Setup

1. **Development Environment**
   ```bash
   npm install
   npm run dev
   ```
   - Ensure the application is running on `http://localhost:3000`

2. **Test Database**
   - Run database migrations:
     ```bash
     node scripts/apply-gps-verification-migration.js
     ```
   - Seed test data:
     ```bash
     node scripts/comprehensive-database-seeding.js
     ```

3. **Test User Accounts**
   Create test accounts with different roles:
   - FI (Field Interviewer): `fi-test@example.com` / `password123`
   - Supervisor: `supervisor-test@example.com` / `password123`
   - Admin: `admin-test@example.com` / `password123`

4. **Browser Setup**
   - Install browsers: Chrome, Firefox, Safari (if on Mac)
   - Enable location services in browser settings
   - Open DevTools (F12) for debugging

5. **Mobile Device Setup**
   - Connect mobile devices to same network
   - Access app via local IP: `http://192.168.x.x:3000`
   - Enable location services on devices

## Test Execution Order

Execute tests in the following order to ensure dependencies are met:

### Phase 1: Core Algorithm Tests (30 minutes)
1. Kish Grid Validation Tests (Section 1)
2. Section Randomization Tests (Section 2)

### Phase 2: GPS and Navigation Tests (45 minutes)
3. GPS Verification Tests (Section 3)
4. Navigation and Flow Tests (Section 4)

### Phase 3: Advanced Features (60 minutes)
5. Offline Mode and Sync Tests (Section 5)
6. Callback and Multi-Visit Tests (Section 6)
7. Backward Compatibility Tests (Section 7)

### Phase 4: Quality Assurance (45 minutes)
8. Error Handling Tests (Section 8)
9. Performance Tests (Section 9)
10. Accessibility Tests (Section 10)

### Phase 5: Cross-Platform (60 minutes)
11. Cross-Browser Tests (Section 11)
12. Security Tests (Section 12)

**Total Estimated Time**: 4-5 hours

## Detailed Test Instructions

### Section 1: Kish Grid Validation

#### Test 1.1: Single Member Household

**Setup:**
1. Login as FI: `fi-test@example.com`
2. Navigate to: `/survey/forms?barangayId=1`
3. Click "Continue to Survey" to generate questionnaire number
4. Note the questionnaire number (e.g., BB-2024-0001)

**Execution:**
1. In "Household Enumeration" section:
   - Click "Add Member"
   - Enter: Name: "John Doe", Birthdate: "1980-01-01", Gender: "Male"
   - Click "Save Member"
2. Click "Select Respondent" button
3. Observe the Kish Grid display modal

**Verification:**
- [ ] Modal shows "Selected Respondent: John Doe"
- [ ] Kish Grid shows Row = 1
- [ ] Column matches (questionnaire number % 10) or 10 if 0
- [ ] Grid value = 1
- [ ] "John Doe" is highlighted in the member list

**Screenshot Location**: `tests/manual/screenshots/kish-grid-single-member.png`

#### Test 1.2: Small Household (3 Members)

**Setup:**
1. Start new survey (new questionnaire number)
2. Note questionnaire number: _______

**Execution:**
1. Add 3 household members:
   - Member 1: "Alice Smith", "1985-03-15", "Female"
   - Member 2: "Bob Smith", "1982-07-20", "Male"
   - Member 3: "Carol Smith", "1990-11-05", "Female"
2. Click "Select Respondent"

**Verification:**
- [ ] Kish Grid shows Row = 3
- [ ] Column = (questionnaire number % 10) or 10
- [ ] Selected member matches grid lookup
- [ ] Can verify selection manually using Kish Grid table

**Manual Verification:**
1. Look up questionnaire number in CSIS randomization map
2. Calculate: Column = questionnaire_number % 10 (or 10 if 0)
3. Look up KISH_GRID_TABLE[2][column-1] (row 3 = index 2)
4. Verify selected member index matches grid value

#### Test 1.4: Large Household (15 Members)

**Setup:**
1. Start new survey
2. Use the "Quick Add" feature if available, or add members manually

**Execution:**
1. Add 15 household members (mix of genders, all 18+)
2. Click "Select Respondent"

**Verification:**
- [ ] Kish Grid shows Row = 12 (capped, not 15)
- [ ] System uses row 12 pattern from grid
- [ ] Selected member is from the 15 available
- [ ] No error or crash with large household

#### Test 1.6: Gender Requirement Validation

**Setup:**
1. Create two surveys with consecutive questionnaire numbers
2. Survey A: Odd number (e.g., BB-2024-0001)
3. Survey B: Even number (e.g., BB-2024-0002)

**Execution for Survey A (Odd):**
1. Add household with both male and female members
2. Click "Select Respondent"
3. Observe eligible members list

**Verification:**
- [ ] Only male members shown as eligible
- [ ] Female members grayed out or not selectable
- [ ] Message indicates "Male respondent required"

**Execution for Survey B (Even):**
1. Repeat with even questionnaire number
2. Observe eligible members list

**Verification:**
- [ ] Only female members shown as eligible
- [ ] Male members grayed out or not selectable
- [ ] Message indicates "Female respondent required"

### Section 2: Section Randomization

#### Test 2.1: Questionnaire #1 Section Order

**Setup:**
1. Ensure questionnaire counter is reset or at #1
2. Start new survey to get questionnaire #1

**Execution:**
1. Complete initialization
2. Complete respondent selection
3. Complete demographics
4. Observe section sidebar

**Verification:**
- [ ] First section matches CSIS map entry for #1 (should be "Financial Administration")
- [ ] All 6 sections visible in sidebar
- [ ] Sections in order: Financial, Disaster, Social, Safety, Business, Environmental
- [ ] Progress shows "Section 1 of 6"

**Reference**: Check `src/app/survey/forms/utils/sectionAssignment.ts` for CSIS_RANDOMIZATION_MAP[1]

#### Test 2.4: Section Order Persistence

**Setup:**
1. Start survey and complete 2 sections
2. Note the section order

**Execution:**
1. Press F5 to refresh browser
2. Observe section order after reload
3. Navigate back to section 1
4. Navigate forward to section 3
5. Refresh again

**Verification:**
- [ ] Section order identical after refresh
- [ ] Completed sections still marked complete
- [ ] Current section restored correctly
- [ ] No sections reordered or duplicated

### Section 3: GPS Verification

#### Test 3.1: GPS Capture at Household

**Setup:**
1. Start new survey
2. Reach "Respondent Selection" step
3. Ensure browser location permission is granted

**Execution:**
1. Look for "Capture GPS Location" button
2. Click the button
3. Wait for GPS capture (may take 5-15 seconds)

**Verification:**
- [ ] Button shows loading state during capture
- [ ] Success message appears
- [ ] Latitude displayed (e.g., "14.5995")
- [ ] Longitude displayed (e.g., "120.9842")
- [ ] Accuracy shown (e.g., "±15m")
- [ ] Timestamp recorded
- [ ] Green checkmark or success icon visible

**Troubleshooting:**
- If GPS fails, check browser console for errors
- Verify location permission granted in browser settings
- Try in different browser if issues persist

#### Test 3.6: Supervisor Dashboard - Within Threshold

**Setup:**
1. Complete and submit a survey with GPS captured
2. Ensure assigned spot is within 200m of captured GPS
3. Login as Supervisor

**Execution:**
1. Navigate to Supervisor Dashboard
2. Find the submitted interview
3. Click to view interview details
4. Navigate to "GPS Verification" tab

**Verification:**
- [ ] Map loads and displays correctly
- [ ] Blue pin visible at assigned spot location
- [ ] Green pin visible at actual interview location
- [ ] Line connecting pins is green
- [ ] Distance displayed (e.g., "85m")
- [ ] Status badge shows "Within Threshold" in green
- [ ] No "Flagged for Review" badge present

**Screenshot**: Capture map view for documentation

#### Test 3.7: Supervisor Dashboard - Beyond Threshold

**Setup:**
1. Create test survey with GPS >200m from assigned spot
2. This may require manual data manipulation or field testing

**Execution:**
1. View interview in Supervisor Dashboard
2. Check GPS Verification tab

**Verification:**
- [ ] Line connecting pins is red
- [ ] Distance displayed (e.g., "350m")
- [ ] Status badge shows "Beyond Threshold" in red
- [ ] "Flagged for Review" badge visible
- [ ] Interview appears in "Flagged Interviews" list
- [ ] Can add supervisor notes/comments

### Section 4: Navigation and Flow

#### Test 4.1: Complete Survey Flow (Desktop)

**Setup:**
1. Fresh browser session (clear cache/cookies)
2. Login as FI
3. Desktop browser (Chrome recommended)

**Execution:**
1. Start new survey
2. Complete initialization (questionnaire generated)
3. Capture GPS location
4. Enumerate household (3 members)
5. Select respondent via Kish Grid
6. Complete demographics
7. Complete all 6 service sections:
   - Answer all required questions in each section
   - Use "Next" button to proceed
8. Review summary
9. Click "Submit Survey"

**Verification:**
- [ ] No errors in browser console
- [ ] No UI glitches or broken layouts
- [ ] All data saved correctly
- [ ] Progress bar updates correctly (1/6, 2/6, ... 6/6)
- [ ] Can navigate back and forward
- [ ] Summary shows all entered data
- [ ] Submission successful
- [ ] Confirmation message displayed

**Time Tracking**: Record time to complete: _______ minutes

#### Test 4.2: Complete Survey Flow (Tablet)

**Setup:**
1. iPad or Android tablet
2. Access app via local network
3. Login as FI

**Execution:**
1. Repeat Test 4.1 on tablet

**Verification:**
- [ ] Touch interactions work smoothly
- [ ] GPS capture uses device GPS
- [ ] All buttons easily tappable
- [ ] Section sidebar adapts to tablet screen
- [ ] Kish Grid display readable
- [ ] No horizontal scrolling required
- [ ] Virtual keyboard doesn't obscure inputs

#### Test 4.6: Page Refresh During Survey

**Setup:**
1. Start survey and complete 2 sections
2. Note current section and entered data

**Execution:**
1. Press F5 to refresh page
2. Observe what happens

**Verification:**
- [ ] Survey state restored from IndexedDB
- [ ] Completed sections marked complete
- [ ] Current section restored
- [ ] All entered data preserved
- [ ] Can continue from where left off
- [ ] Section order unchanged
- [ ] No data loss

### Section 5: Offline Mode and Sync

#### Test 5.1: Start Survey Offline

**Setup:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Or disable network adapter

**Execution:**
1. Try to start new survey while offline
2. Observe behavior

**Verification:**
- [ ] Survey starts successfully
- [ ] Questionnaire number generated from local counter
- [ ] Format: BB-OFFLINE-XXXX or similar
- [ ] All sections accessible
- [ ] Can enter data normally
- [ ] Data saved to IndexedDB

#### Test 5.2: Complete Survey Offline

**Setup:**
1. Remain offline from Test 5.1

**Execution:**
1. Complete entire survey offline
2. Click "Submit Survey"

**Verification:**
- [ ] Survey queued for sync
- [ ] "Pending Sync" indicator shown
- [ ] Survey stored in IndexedDB
- [ ] Can start another survey offline
- [ ] Pending count increments

#### Test 5.3: Sync After Reconnection

**Setup:**
1. Have 1-2 surveys pending sync
2. Re-enable network

**Execution:**
1. Reconnect to network
2. Observe auto-sync behavior

**Verification:**
- [ ] Auto-sync triggers within 30 seconds
- [ ] Progress indicator shown during sync
- [ ] Success notification appears
- [ ] Pending surveys uploaded to server
- [ ] Surveys removed from pending queue
- [ ] Can verify data in database
- [ ] Questionnaire numbers updated to server format

### Section 8: Error Handling

#### Test 8.1: Invalid Questionnaire Number

**Setup:**
1. Open browser DevTools
2. Find survey data in IndexedDB or localStorage

**Execution:**
1. Manually change questionnaire number to 0
2. Reload page
3. Observe behavior

**Verification:**
- [ ] System handles gracefully (no crash)
- [ ] Falls back to default section order
- [ ] Error logged to console
- [ ] User can continue survey

**Repeat with:**
- [ ] Questionnaire number = 999
- [ ] Questionnaire number = -1
- [ ] Questionnaire number = "invalid"

#### Test 8.3: Network Interruption During Sync

**Setup:**
1. Have survey ready to sync
2. Start sync process

**Execution:**
1. Click "Sync Now"
2. Immediately disable network (within 2 seconds)
3. Wait for timeout

**Verification:**
- [ ] Sync fails gracefully
- [ ] Error message shown
- [ ] Survey remains in queue
- [ ] Can retry sync
- [ ] No data corruption
- [ ] Retry succeeds when network restored

## Recording Test Results

### For Each Test:
1. Check the checkbox in the checklist
2. Take screenshots of key steps
3. Note any issues in the "Issues Found" section
4. Record actual vs expected behavior

### Screenshot Naming Convention:
```
tests/manual/screenshots/[test-section]-[test-number]-[description].png

Examples:
- kish-grid-1.1-single-member.png
- gps-verification-3.6-within-threshold.png
- offline-sync-5.3-success.png
```

### Issue Reporting Format:
```markdown
## Issue #[number]
**Test**: [Test section and number]
**Severity**: Critical / Major / Minor
**Description**: [What went wrong]
**Steps to Reproduce**:
1. 
2. 
3. 
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshot**: [Link to screenshot]
**Browser**: [Browser and version]
**Device**: [Device type]
```

## Test Data Reference

### Sample Questionnaire Numbers for Testing:
- #1: Financial (starting section)
- #10: Column = 10 edge case
- #50: Mid-range randomization
- #150: End-range randomization

### Sample Household Configurations:
- Single member: 1 person, 18+
- Small: 3 people, mixed gender
- Medium: 8 people, mixed gender
- Large: 15 people, mixed gender
- Edge: All same gender (test gender filtering)

### Sample GPS Coordinates (Philippines):
- Manila City Hall: 14.5995° N, 120.9842° E
- Quezon City Hall: 14.6760° N, 121.0437° E
- Makati City Hall: 14.5547° N, 121.0244° E

### Distance Calculations:
- Within threshold: <200m difference
- Beyond threshold: >200m difference
- Test cases: 50m, 150m, 250m, 500m

## Post-Testing Activities

### 1. Compile Results
- [ ] Fill out Test Summary section in checklist
- [ ] Calculate pass/fail rates
- [ ] Categorize issues by severity

### 2. Create Test Report
- [ ] Document all issues found
- [ ] Include screenshots
- [ ] Provide recommendations

### 3. Update Documentation
- [ ] Update known issues list
- [ ] Update troubleshooting guide
- [ ] Update user training materials

### 4. Sign-Off
- [ ] Review with development team
- [ ] Get stakeholder approval
- [ ] Schedule UAT if tests pass

## Tips for Effective Testing

1. **Test Systematically**: Follow the checklist order
2. **Document Everything**: Screenshots and notes are crucial
3. **Test Edge Cases**: Don't just test happy paths
4. **Use Real Devices**: Emulators don't catch all issues
5. **Test Slowly**: Rushing leads to missed issues
6. **Clear Cache**: Start fresh for each major test section
7. **Check Console**: Always have DevTools open
8. **Test Offline**: Network issues are common in field
9. **Vary Data**: Use different names, dates, locations
10. **Ask Questions**: If behavior is unclear, document it

## Support and Questions

If you encounter issues during testing:
1. Check the CSIS Troubleshooting Guide
2. Review browser console for errors
3. Check IndexedDB for data integrity
4. Contact development team with details

**Development Team Contact**: [Add contact info]
**Testing Coordinator**: [Add contact info]
