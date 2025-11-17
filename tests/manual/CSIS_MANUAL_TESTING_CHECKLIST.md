# CSIS Workflow Manual Testing Checklist

This document provides a comprehensive manual testing checklist for the CSIS workflow upgrade. Complete all tests before deploying to production.

## Test Environment Setup

- [ ] Development environment running locally
- [ ] Test database with sample barangays and spots
- [ ] Test user accounts (FI, Supervisor, Admin roles)
- [ ] Browser DevTools open for debugging
- [ ] Network throttling available for offline testing
- [ ] Multiple devices available (desktop, tablet, mobile)

## 1. Kish Grid Validation Tests

### 1.1 Single Member Household
- [ ] Create household with 1 eligible member (18+ years)
- [ ] Click "Select Respondent"
- [ ] **Expected**: That single member is always selected
- [ ] **Verify**: Kish Grid shows row=1, correct column based on questionnaire number
- [ ] **Verify**: Grid value = 1

### 1.2 Small Household (2-5 Members)
- [ ] Create household with 3 eligible members
- [ ] Note the questionnaire number
- [ ] Click "Select Respondent"
- [ ] **Expected**: Member selected matches Kish Grid calculation
- [ ] **Verify**: Column = (questionnaire number % 10) or 10 if result is 0
- [ ] **Verify**: Row = 3 (number of eligible members)
- [ ] **Verify**: Selected member index matches grid value

### 1.3 Medium Household (6-11 Members)
- [ ] Create household with 8 eligible members
- [ ] Click "Select Respondent"
- [ ] **Expected**: Correct member selected from 8 options
- [ ] **Verify**: Row = 8 in Kish Grid display
- [ ] **Verify**: Selection is deterministic (same result on retry)

### 1.4 Large Household (12+ Members)
- [ ] Create household with 15 eligible members
- [ ] Click "Select Respondent"
- [ ] **Expected**: Row capped at 12 in Kish Grid
- [ ] **Verify**: Kish Grid display shows row=12
- [ ] **Verify**: Member selected from the 15 available
- [ ] **Verify**: Uses special row 12 pattern from grid

### 1.5 Questionnaire Number Edge Cases
- [ ] Test with questionnaire ending in 0 (e.g., 10, 20, 30)
- [ ] **Expected**: Column = 10 (not 0)
- [ ] Test with questionnaire #1
- [ ] **Expected**: Column = 1
- [ ] Test with questionnaire #150
- [ ] **Expected**: Column = 10 (150 % 10 = 0 → 10)

### 1.6 Gender Requirement Validation
- [ ] Test with odd questionnaire number (e.g., 1, 3, 5)
- [ ] **Expected**: System requires Male respondent
- [ ] **Verify**: Only male members shown as eligible
- [ ] Test with even questionnaire number (e.g., 2, 4, 6)
- [ ] **Expected**: System requires Female respondent
- [ ] **Verify**: Only female members shown as eligible

### 1.7 No Eligible Members Error
- [ ] Create household with only members under 18
- [ ] Click "Select Respondent"
- [ ] **Expected**: Error message "No eligible household members found"
- [ ] Create household with only wrong gender for questionnaire type
- [ ] **Expected**: Error message about no qualified respondent

## 2. Section Randomization Validation Tests

### 2.1 Questionnaire #1 Section Order
- [ ] Start survey with questionnaire #1
- [ ] Complete respondent selection and demographics
- [ ] **Expected**: First section matches CSIS randomization map for #1
- [ ] **Verify**: All 6 sections appear in sidebar
- [ ] **Verify**: Sections are in rotated canonical order

### 2.2 Questionnaire #50 Section Order
- [ ] Start survey with questionnaire #50
- [ ] **Expected**: Starting section matches CSIS map entry #50
- [ ] **Verify**: Remaining 5 sections follow in rotated order
- [ ] **Verify**: No duplicate sections

### 2.3 Questionnaire #150 Section Order
- [ ] Start survey with questionnaire #150
- [ ] **Expected**: Starting section matches CSIS map entry #150
- [ ] **Verify**: All 6 sections present and unique

### 2.4 Section Order Persistence
- [ ] Start survey and note section order
- [ ] Refresh browser page
- [ ] **Expected**: Section order remains the same
- [ ] Navigate back and forth between sections
- [ ] **Expected**: Order never changes during survey

### 2.5 Progress Bar Display
- [ ] Complete demographics section
- [ ] **Verify**: Progress shows "Section 1 of 6"
- [ ] Complete first service section
- [ ] **Verify**: Progress shows "Section 2 of 6"
- [ ] Continue through all sections
- [ ] **Verify**: Progress correctly shows X of 6 for each section

### 2.6 All Six Sections Accessible
- [ ] Navigate through all 6 service sections
- [ ] **Verify**: Financial Administration section accessible
- [ ] **Verify**: Disaster Preparedness section accessible
- [ ] **Verify**: Safety & Peace section accessible
- [ ] **Verify**: Social Protection section accessible
- [ ] **Verify**: Business-Friendly section accessible
- [ ] **Verify**: Environmental Management section accessible

## 3. GPS Verification Validation Tests

### 3.1 GPS Capture at Household
- [ ] Reach respondent selection step
- [ ] Click "Capture GPS Location" button
- [ ] **Expected**: Browser requests location permission
- [ ] Grant permission
- [ ] **Expected**: GPS coordinates captured and displayed
- [ ] **Verify**: Latitude and longitude shown
- [ ] **Verify**: Accuracy value displayed
- [ ] **Verify**: Timestamp recorded

### 3.2 GPS Capture Success Indicator
- [ ] After successful GPS capture
- [ ] **Verify**: Green checkmark or success indicator shown
- [ ] **Verify**: "GPS Captured" status displayed
- [ ] **Verify**: Can proceed with household enumeration

### 3.3 GPS Capture Failure Handling
- [ ] Deny location permission
- [ ] **Expected**: Error message displayed
- [ ] **Verify**: Option to retry GPS capture
- [ ] **Verify**: Option to continue without GPS (with warning)
- [ ] **Verify**: Survey flagged if proceeding without GPS

### 3.4 GPS Capture Timeout
- [ ] Simulate poor GPS signal (if possible)
- [ ] Wait for timeout (15 seconds)
- [ ] **Expected**: Timeout error message
- [ ] **Verify**: Retry option available
- [ ] **Verify**: Manual skip option with warning

### 3.5 GPS Data Saved with Survey
- [ ] Complete survey with GPS captured
- [ ] Submit survey
- [ ] Check database/API response
- [ ] **Verify**: verificationLocation field contains GPS data
- [ ] **Verify**: Latitude, longitude, accuracy, timestamp all saved

### 3.6 Supervisor Dashboard - Within Threshold
- [ ] Login as Supervisor
- [ ] View submitted interview with GPS within 200m of assigned spot
- [ ] **Expected**: Map shows two pins (blue and green)
- [ ] **Verify**: Blue pin at assigned spot location
- [ ] **Verify**: Green pin at actual interview location
- [ ] **Verify**: Line between pins is green
- [ ] **Verify**: Distance displayed (e.g., "85m")
- [ ] **Verify**: Status shows "Within Threshold"
- [ ] **Verify**: No "Flagged for Review" badge

### 3.7 Supervisor Dashboard - Beyond Threshold
- [ ] View interview with GPS >200m from assigned spot
- [ ] **Expected**: Map shows two pins with red line
- [ ] **Verify**: Distance displayed (e.g., "350m")
- [ ] **Verify**: Status shows "Beyond Threshold"
- [ ] **Verify**: "Flagged for Review" badge displayed in red
- [ ] **Verify**: Interview appears in flagged interviews list

### 3.8 GPS Verification Calculation Accuracy
- [ ] Note assigned spot coordinates
- [ ] Note actual interview coordinates
- [ ] Calculate distance manually using Haversine formula
- [ ] **Verify**: System-calculated distance matches manual calculation (±5m)

### 3.9 Missing Assigned Spot Handling
- [ ] Create survey without assigned spot data
- [ ] Submit with GPS captured
- [ ] **Expected**: System handles gracefully
- [ ] **Verify**: No crash or error
- [ ] **Verify**: Interview flagged for manual review
- [ ] **Verify**: Supervisor sees warning about missing spot data

## 4. Navigation and Flow Tests

### 4.1 Complete Survey Flow (Desktop)
- [ ] Start new survey on desktop browser
- [ ] Complete initialization (questionnaire number generated)
- [ ] Complete respondent selection with GPS capture
- [ ] Complete household enumeration
- [ ] Select respondent using Kish Grid
- [ ] Complete demographics
- [ ] Complete all 6 service sections in order
- [ ] Review summary
- [ ] Submit survey
- [ ] **Verify**: No errors throughout entire flow
- [ ] **Verify**: All data saved correctly

### 4.2 Complete Survey Flow (Tablet)
- [ ] Repeat 4.1 on tablet device (iPad, Android tablet)
- [ ] **Verify**: Touch interactions work correctly
- [ ] **Verify**: GPS capture works on mobile device
- [ ] **Verify**: All 6 sections visible and navigable
- [ ] **Verify**: Progress bar displays correctly

### 4.3 Complete Survey Flow (Mobile Phone)
- [ ] Repeat 4.1 on mobile phone
- [ ] **Verify**: Responsive layout works
- [ ] **Verify**: Section sidebar adapts to small screen
- [ ] **Verify**: GPS capture uses device GPS
- [ ] **Verify**: Kish Grid display readable on small screen

### 4.4 Back Navigation
- [ ] Start survey and reach section 3
- [ ] Click "Back" button
- [ ] **Expected**: Navigate to section 2
- [ ] **Verify**: Data from section 3 preserved
- [ ] Click "Back" again
- [ ] **Expected**: Navigate to section 1
- [ ] Navigate forward again
- [ ] **Verify**: Can return to section 3

### 4.5 Section Skipping Prevention
- [ ] Try to navigate directly to section 4 without completing 1-3
- [ ] **Expected**: System prevents skipping
- [ ] **Verify**: Must complete sections in order
- [ ] **Verify**: Cannot access summary without completing all sections

### 4.6 Page Refresh During Survey
- [ ] Start survey and complete 2 sections
- [ ] Refresh browser page
- [ ] **Expected**: Survey state restored from IndexedDB
- [ ] **Verify**: Completed sections still marked complete
- [ ] **Verify**: Can continue from where left off
- [ ] **Verify**: Section order unchanged

## 5. Offline Mode and Sync Tests

### 5.1 Start Survey Offline
- [ ] Disconnect from network
- [ ] Start new survey
- [ ] **Expected**: Survey works offline
- [ ] **Verify**: Questionnaire number generated from local counter
- [ ] **Verify**: All sections accessible
- [ ] **Verify**: Data saved to IndexedDB

### 5.2 Complete Survey Offline
- [ ] Complete entire survey while offline
- [ ] Submit survey
- [ ] **Expected**: Survey queued for sync
- [ ] **Verify**: "Pending Sync" indicator shown
- [ ] **Verify**: Survey stored in IndexedDB
- [ ] **Verify**: Can start another survey offline

### 5.3 Sync After Reconnection
- [ ] Reconnect to network
- [ ] **Expected**: Auto-sync triggers
- [ ] **Verify**: Pending surveys uploaded to server
- [ ] **Verify**: Success notification shown
- [ ] **Verify**: Surveys removed from pending queue
- [ ] **Verify**: Data matches what was entered offline

### 5.4 GPS Capture Offline
- [ ] Go offline
- [ ] Capture GPS at household
- [ ] **Expected**: GPS still works (device GPS, not network)
- [ ] **Verify**: Coordinates captured and saved
- [ ] **Verify**: GPS data syncs when reconnected

### 5.5 Conflict Resolution
- [ ] Start survey offline
- [ ] Complete and queue for sync
- [ ] Modify same survey on another device
- [ ] Reconnect and sync
- [ ] **Expected**: Conflict handled gracefully
- [ ] **Verify**: No data loss
- [ ] **Verify**: User notified of conflict if applicable

## 6. Callback and Multi-Visit Tests

### 6.1 First Visit Incomplete
- [ ] Start survey (first visit)
- [ ] Complete only 3 of 6 sections
- [ ] Mark as "Callback Required"
- [ ] Save and exit
- [ ] **Verify**: Survey saved with partial completion
- [ ] **Verify**: Callback status recorded

### 6.2 Second Visit Continuation
- [ ] Return to callback survey
- [ ] **Expected**: Resume from where left off
- [ ] **Verify**: Completed sections still marked complete
- [ ] **Verify**: Can complete remaining 3 sections
- [ ] **Verify**: Section order unchanged from first visit
- [ ] Complete and submit
- [ ] **Verify**: Survey marked as complete

### 6.3 Multiple Callbacks
- [ ] Create survey requiring 3 visits
- [ ] Visit 1: Complete 2 sections, save as callback
- [ ] Visit 2: Complete 2 more sections, save as callback
- [ ] Visit 3: Complete final 2 sections, submit
- [ ] **Verify**: All data from all visits preserved
- [ ] **Verify**: No duplicate sections
- [ ] **Verify**: Final submission includes all data

## 7. Backward Compatibility Tests

### 7.1 Existing LocalStorage Data
- [ ] Create survey using old system (if available)
- [ ] Upgrade to new CSIS system
- [ ] **Expected**: Old data migrates gracefully
- [ ] **Verify**: No data loss
- [ ] **Verify**: Can complete old surveys

### 7.2 Existing IndexedDB Records
- [ ] Check for existing IndexedDB surveys
- [ ] Load application with new CSIS code
- [ ] **Expected**: Old surveys still accessible
- [ ] **Verify**: Can view old survey data
- [ ] **Verify**: Can sync old surveys

### 7.3 Old Questionnaire Type Field
- [ ] Check surveys with old questionnaireType field
- [ ] **Expected**: System ignores old field
- [ ] **Verify**: Gender calculated dynamically from number
- [ ] **Verify**: No errors from deprecated field

## 8. Error Handling and Edge Cases

### 8.1 Invalid Questionnaire Number
- [ ] Manually set questionnaire number to 0
- [ ] **Expected**: Error or fallback to default order
- [ ] Set to 999 (out of range)
- [ ] **Expected**: Error or fallback to default order

### 8.2 Corrupted Survey Data
- [ ] Manually corrupt IndexedDB data
- [ ] Try to load survey
- [ ] **Expected**: Graceful error handling
- [ ] **Verify**: User notified of corruption
- [ ] **Verify**: Option to start fresh survey

### 8.3 Network Interruption During Sync
- [ ] Start syncing survey
- [ ] Disconnect network mid-sync
- [ ] **Expected**: Sync fails gracefully
- [ ] **Verify**: Survey remains in queue
- [ ] **Verify**: Retry on reconnection

### 8.4 GPS Permission Revoked Mid-Survey
- [ ] Capture GPS successfully
- [ ] Revoke location permission in browser
- [ ] Try to capture GPS again
- [ ] **Expected**: Permission error shown
- [ ] **Verify**: Option to re-enable permission
- [ ] **Verify**: Can continue survey without GPS

## 9. Performance Tests

### 9.1 Section Assignment Speed
- [ ] Generate 10 questionnaire numbers
- [ ] Measure time for section assignment
- [ ] **Expected**: <10ms per assignment
- [ ] **Verify**: No noticeable delay

### 9.2 Kish Grid Selection Speed
- [ ] Select respondent from 12-member household
- [ ] Measure selection time
- [ ] **Expected**: <5ms
- [ ] **Verify**: Instant response

### 9.3 GPS Distance Calculation Speed
- [ ] Calculate distance for 100 interviews
- [ ] Measure average calculation time
- [ ] **Expected**: <1ms per calculation
- [ ] **Verify**: No performance impact on dashboard

### 9.4 Page Load Time
- [ ] Measure page load time with new CSIS code
- [ ] Compare to baseline (if available)
- [ ] **Expected**: No significant increase
- [ ] **Verify**: <3 seconds on 3G connection

## 10. Accessibility Tests

### 10.1 Screen Reader Support
- [ ] Enable screen reader (NVDA, JAWS, VoiceOver)
- [ ] Navigate through survey
- [ ] **Verify**: All sections announced
- [ ] **Verify**: Kish Grid result announced
- [ ] **Verify**: GPS status announced
- [ ] **Verify**: Progress updates announced

### 10.2 Keyboard Navigation
- [ ] Navigate entire survey using only keyboard
- [ ] **Verify**: All buttons reachable with Tab
- [ ] **Verify**: Can select respondent with keyboard
- [ ] **Verify**: Can navigate sections with keyboard
- [ ] **Verify**: Modal dialogs trap focus

### 10.3 Color Contrast
- [ ] Check GPS verification indicators
- [ ] **Verify**: Green/red indicators have sufficient contrast
- [ ] **Verify**: Text readable on all backgrounds
- [ ] Use browser accessibility tools to verify WCAG compliance

### 10.4 Touch Target Sizes
- [ ] Test on mobile device
- [ ] **Verify**: All buttons at least 44x44px
- [ ] **Verify**: Section navigation buttons easily tappable
- [ ] **Verify**: GPS capture button large enough

## 11. Cross-Browser Tests

### 11.1 Chrome/Edge (Chromium)
- [ ] Complete full survey flow
- [ ] Test GPS capture
- [ ] Test offline mode
- [ ] **Verify**: All features work correctly

### 11.2 Firefox
- [ ] Repeat 11.1 tests
- [ ] **Verify**: IndexedDB works correctly
- [ ] **Verify**: GPS capture works
- [ ] **Verify**: No console errors

### 11.3 Safari (Desktop)
- [ ] Repeat 11.1 tests
- [ ] **Verify**: No Safari-specific issues
- [ ] **Verify**: GPS capture works

### 11.4 Safari (iOS)
- [ ] Test on iPhone/iPad
- [ ] **Verify**: GPS capture uses device GPS
- [ ] **Verify**: Offline mode works
- [ ] **Verify**: Touch interactions smooth

### 11.5 Chrome (Android)
- [ ] Test on Android device
- [ ] **Verify**: All features work
- [ ] **Verify**: GPS accuracy acceptable
- [ ] **Verify**: Performance acceptable

## 12. Security Tests

### 12.1 GPS Data Privacy
- [ ] Login as FI
- [ ] Try to access GPS verification dashboard
- [ ] **Expected**: Access denied
- [ ] Login as Supervisor
- [ ] **Expected**: Can view GPS verification

### 12.2 Questionnaire Number Manipulation
- [ ] Try to manually change questionnaire number
- [ ] **Expected**: Server validates number
- [ ] Try to reuse questionnaire number
- [ ] **Expected**: Server rejects duplicate

### 12.3 Section Skipping Attempt
- [ ] Try to submit survey with missing sections
- [ ] **Expected**: Server validation fails
- [ ] **Verify**: Error message shown
- [ ] **Verify**: Must complete all sections

## Test Summary

### Completion Status
- Total Tests: ___
- Passed: ___
- Failed: ___
- Blocked: ___
- Not Applicable: ___

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

### Sign-Off
- [ ] All critical tests passed
- [ ] All blocking issues resolved
- [ ] Ready for user acceptance testing
- [ ] Ready for production deployment

**Tester Name**: _______________
**Date**: _______________
**Signature**: _______________
