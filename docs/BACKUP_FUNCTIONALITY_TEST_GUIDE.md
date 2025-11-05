# Backup Functionality Test Guide

## Overview
This guide provides comprehensive testing instructions for the SIGLA system's backup functionality. The backup system includes data export capabilities and backup management features.

## Test Results Summary
✅ **All automated logic tests passed (5/5)**
- CSV Conversion Logic: PASSED
- Backup History Generation: PASSED  
- Backup Creation Logic: PASSED
- Report Generation Logic: PASSED
- Data Validation Logic: PASSED

## Prerequisites
1. Next.js development server running (`npm run dev`)
2. Supabase database connection configured
3. Access to the settings page at `http://localhost:3000/settings`

## Manual Testing Checklist

### 1. Access Backup Section
- [ ] Navigate to `http://localhost:3000/settings`
- [ ] Click on the "Backup" section
- [ ] Verify the page loads without errors
- [ ] Confirm all UI elements are visible:
  - [ ] Data Export section
  - [ ] Backup Management section  
  - [ ] Backup History section

### 2. Data Export Testing

#### 2.1 Survey Data Export
- [ ] Click "Export All Survey Data" button
- [ ] Verify toast notification appears: "Export Started"
- [ ] Wait for download to complete
- [ ] Check downloaded file:
  - [ ] File name format: `survey_data_YYYY-MM-DD.csv`
  - [ ] File opens correctly in spreadsheet software
  - [ ] Contains expected headers: `response_id`, `barangay_id`, `interviewer_id`, `respondent_name`, `respondent_age`, `respondent_gender`, `household_head`, `contact_number`, `created_at`, `updated_at`
  - [ ] Data rows are properly formatted
- [ ] Verify success toast: "Export Complete"

#### 2.2 User Data Export
- [ ] Click "Export User Data" button
- [ ] Verify toast notification appears: "Export Started"
- [ ] Wait for download to complete
- [ ] Check downloaded file:
  - [ ] File name format: `user_data_YYYY-MM-DD.csv`
  - [ ] Contains expected headers: `user_id`, `username`, `email`, `role`, `created_at`, `updated_at`
  - [ ] Data is properly formatted
- [ ] Verify success toast: "Export Complete"

#### 2.3 Barangay Data Export
- [ ] Click "Export Barangay Data" button
- [ ] Verify toast notification appears: "Export Started"
- [ ] Wait for download to complete
- [ ] Check downloaded file:
  - [ ] File name format: `barangay_data_YYYY-MM-DD.csv`
  - [ ] Contains expected headers: `barangay_id`, `barangay_name`, `population`, `households`, `area`, `seal`, `created_at`, `updated_at`
  - [ ] Data includes all barangays
- [ ] Verify success toast: "Export Complete"

#### 2.4 Reports Export
- [ ] Click "Export Reports" button
- [ ] Verify toast notification appears: "Export Started"
- [ ] Wait for download to complete
- [ ] Check downloaded file:
  - [ ] File name format: `sigla_report_YYYY-MM-DD.txt`
  - [ ] Contains report sections:
    - [ ] SIGLA System Report header
    - [ ] BARANGAY SUMMARY section
    - [ ] SURVEY SUMMARY section
    - [ ] BARANGAY DETAILS section
  - [ ] Statistics are calculated correctly
  - [ ] Generation timestamp is present
- [ ] Verify success toast: "Export Complete"

### 3. Backup Management Testing

#### 3.1 Automatic Backup Toggle
- [ ] Verify "Automatic Daily Backup" switch is present
- [ ] Toggle switch ON/OFF
- [ ] Verify switch state changes correctly
- [ ] Check description text: "Automatically backup data every day at 2:30 PM"

#### 3.2 Manual Backup Creation
- [ ] Click "Create Backup Now" button
- [ ] Verify toast notification: "Backup Started"
- [ ] Wait for completion
- [ ] Verify success toast: "Backup Complete"
- [ ] Check that backup progress indicator appears (if implemented)

#### 3.3 Download Latest Backup
- [ ] Click "Download Latest Backup" button
- [ ] Verify toast notification: "Download Started"
- [ ] Verify success message appears

### 4. Backup History Testing

#### 4.1 History Display
- [ ] Verify backup history section shows entries
- [ ] Check each history entry contains:
  - [ ] Date and time
  - [ ] File size
  - [ ] Status badge (Success/Failed)
  - [ ] Download button (for successful backups)
- [ ] Verify entries are sorted by date (newest first)

#### 4.2 History Entry Actions
- [ ] Click download button on a successful backup entry
- [ ] Verify download initiates
- [ ] Check that failed entries don't have download buttons
- [ ] Verify status badges are color-coded correctly:
  - [ ] Green for "Success"
  - [ ] Red for "Failed"

### 5. Error Handling Testing

#### 5.1 Network Error Simulation
- [ ] Disconnect internet/stop server
- [ ] Try each export function
- [ ] Verify error toast appears: "Export Failed"
- [ ] Try creating backup
- [ ] Verify error toast appears: "Backup Failed"

#### 5.2 Invalid Request Testing
- [ ] Test with invalid export parameters (if accessible via URL)
- [ ] Verify appropriate error responses

### 6. UI/UX Testing

#### 6.1 Responsive Design
- [ ] Test on different screen sizes:
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] Verify buttons stack properly on smaller screens
- [ ] Check that text remains readable

#### 6.2 Loading States
- [ ] Verify loading indicators during operations
- [ ] Check that buttons are disabled during processing
- [ ] Confirm progress bars work correctly (if implemented)

#### 6.3 Toast Notifications
- [ ] Verify all toast messages appear
- [ ] Check toast timing (should auto-dismiss after 4 seconds)
- [ ] Confirm toast types are correct:
  - [ ] Info (blue) for "Started" messages
  - [ ] Success (green) for "Complete" messages
  - [ ] Error (red) for "Failed" messages

### 7. Data Integrity Testing

#### 7.1 CSV Data Validation
- [ ] Open exported CSV files in text editor
- [ ] Verify special characters are properly escaped:
  - [ ] Commas in data are quoted
  - [ ] Quotes in data are doubled
  - [ ] Newlines are escaped as `\\n`
- [ ] Check null/empty values are handled correctly

#### 7.2 Report Content Validation
- [ ] Verify report calculations match database:
  - [ ] Total barangays count
  - [ ] Barangays with seals count
  - [ ] Total population sum
  - [ ] Total households sum
  - [ ] Survey responses count
- [ ] Check barangay details list is complete

### 8. Performance Testing

#### 8.1 Large Dataset Handling
- [ ] Test exports with large amounts of data
- [ ] Verify reasonable response times
- [ ] Check memory usage doesn't spike excessively
- [ ] Confirm downloads complete successfully

#### 8.2 Concurrent Operations
- [ ] Try multiple export operations simultaneously
- [ ] Verify all complete successfully
- [ ] Check for any race conditions

## Expected Results

### Successful Test Outcomes
- All export functions download files with correct data
- Backup creation completes without errors
- UI is responsive and user-friendly
- Toast notifications provide clear feedback
- Error handling works appropriately
- Data integrity is maintained in exports

### Common Issues to Watch For
- Missing or incorrect CSV headers
- Improperly escaped special characters in CSV
- Broken download links
- Missing toast notifications
- UI layout issues on mobile devices
- Slow response times with large datasets

## Troubleshooting

### If Exports Fail
1. Check browser console for JavaScript errors
2. Verify Supabase connection is working
3. Check server logs for API errors
4. Ensure environment variables are set correctly

### If UI Issues Occur
1. Clear browser cache
2. Check for CSS/styling conflicts
3. Verify responsive design breakpoints
4. Test in different browsers

### If Performance Issues Occur
1. Check database query performance
2. Monitor server resource usage
3. Consider implementing pagination for large datasets
4. Add loading indicators for better UX

## Test Completion Checklist

- [ ] All manual tests completed
- [ ] No critical issues found
- [ ] Performance is acceptable
- [ ] Error handling works correctly
- [ ] UI/UX meets requirements
- [ ] Data integrity verified
- [ ] Documentation updated

## Notes
- Test results should be documented with screenshots
- Any issues found should be reported with reproduction steps
- Performance metrics should be recorded for future reference
- Consider automated testing for regression prevention

---

**Test Status**: ✅ Ready for Manual Testing  
**Last Updated**: December 10, 2025  
**Automated Tests**: 5/5 Passed  
**Manual Tests**: Pending Execution