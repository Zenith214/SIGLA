# CPAP Testing Guide - After Bug Fixes

## 🎯 Purpose
This guide helps you test the CPAP spreadsheet implementation after bug fixes to ensure everything works correctly.

## ✅ Pre-Testing Checklist

- [ ] Development server is running (`npm run dev`)
- [ ] Database is connected
- [ ] Test users exist (Officer, Admin, Viewer)
- [ ] Active survey cycle exists
- [ ] Test barangay is assigned to Officer user

## 🧪 Test Scenarios

### Test 1: Permission Check (CRITICAL)
**Purpose:** Verify only Officer role can access editor

**Steps:**
1. Log in as **Viewer** user
2. Navigate to `/cpap/editor` directly
3. **Expected:** Redirected to `/forbidden` page

4. Log in as **Admin** user
5. Navigate to `/cpap/editor` directly
6. **Expected:** Redirected to `/forbidden` page

7. Log in as **Officer** user
8. Navigate to `/cpap/editor` directly
9. **Expected:** Editor page loads successfully

**Status:** ☐ Pass ☐ Fail

---

### Test 2: Empty Implementation Schedule (CRITICAL)
**Purpose:** Verify saving works with empty schedule

**Steps:**
1. Log in as **Officer**
2. Go to `/cpap/editor`
3. Click "Add row for HEALTH"
4. Fill in **Output** field only: "Test output"
5. Leave **Implementation Schedule** empty
6. Click "Save All Changes"
7. **Expected:** Saves successfully with default dates

**Verification:**
- Check database: `timeline_start` and `timeline_end` should have today's date
- No validation errors

**Status:** ☐ Pass ☐ Fail

---

### Test 3: Save Button Behavior (CRITICAL)
**Purpose:** Verify save button saves current state

**Steps:**
1. Log in as **Officer**
2. Go to `/cpap/editor`
3. Add a row with output: "Original output"
4. Click "Save All Changes"
5. Edit the output to: "Modified output"
6. **DO NOT** click save yet
7. Check if there's a save button in the header
8. **Expected:** No save button in header (removed)
9. Click "Save All Changes" at bottom
10. Refresh page
11. **Expected:** Shows "Modified output"

**Status:** ☐ Pass ☐ Fail

---

### Test 4: Filter Logic (MEDIUM)
**Purpose:** Verify only rows with output are saved

**Steps:**
1. Log in as **Officer**
2. Go to `/cpap/editor`
3. Add row for HEALTH
4. Fill **Observation** only: "Test observation"
5. Leave **Output** empty
6. Add another row for EDUCATION
7. Fill **Output**: "Test output"
8. Click "Save All Changes"
9. Refresh page
10. **Expected:** 
    - HEALTH row is NOT saved (no output)
    - EDUCATION row IS saved (has output)

**Status:** ☐ Pass ☐ Fail

---

### Test 5: Date Format Display (LOW)
**Purpose:** Verify dates display without time

**Steps:**
1. Create CPAP item via API with ISO dates:
   ```json
   {
     "timeline_start": "2024-01-01T00:00:00.000Z",
     "timeline_end": "2024-12-31T23:59:59.999Z"
   }
   ```
2. Go to `/cpap/editor`
3. Check **Implementation Schedule** field
4. **Expected:** Shows "2024-01-01 - 2024-12-31" (no time)

**Status:** ☐ Pass ☐ Fail

---

### Test 6: Empty Rows Initialization (LOW)
**Purpose:** Verify no empty rows on start

**Steps:**
1. Log in as **Officer**
2. Create new CPAP (no items)
3. Go to `/cpap/editor`
4. **Expected:** 
   - No data rows visible
   - Each service area shows "Add row for [AREA]" button
   - 8 service area sections visible

**Status:** ☐ Pass ☐ Fail

---

### Test 7: React Warnings (LOW)
**Purpose:** Verify no console warnings

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Navigate to `/cpap/editor`
5. Add rows to different service areas
6. Delete some rows
7. Save changes
8. **Expected:** No React warnings about keys or fragments

**Status:** ☐ Pass ☐ Fail

---

### Test 8: Create CPAP Flow (END-TO-END)
**Purpose:** Test complete creation workflow

**Steps:**
1. Log in as **Officer**
2. Go to `/cpap`
3. **Expected:** "Create a Plan" button visible
4. Click "Create a Plan"
5. **Expected:** Redirected to `/cpap/editor`
6. **Expected:** Header shows "Barangay of: [Name]"
7. **Expected:** Header shows survey cycle title
8. Click "Add row for HEALTH"
9. Fill in:
   - Observation: "Need medical equipment"
   - Output: "Purchase 1 machine"
   - Implementation Schedule: "Jan - Dec 2024"
   - Responsible Person: "MHO"
10. Click "Add row for EDUCATION"
11. Fill in:
    - Output: "Build classroom"
    - Responsible Person: "Principal"
12. Click "Save All Changes"
13. **Expected:** Success toast appears
14. Click back arrow
15. **Expected:** Redirected to `/cpap`
16. **Expected:** CPAP is visible with 2 items
17. Click "Edit in Spreadsheet View"
18. **Expected:** Both rows are visible with correct data

**Status:** ☐ Pass ☐ Fail

---

### Test 9: Edit Existing CPAP (END-TO-END)
**Purpose:** Test editing workflow

**Steps:**
1. Log in as **Officer** with existing CPAP
2. Go to `/cpap`
3. Click "Edit in Spreadsheet View"
4. **Expected:** Existing rows load correctly
5. Modify an existing row's output
6. Add a new row
7. Delete an existing row
8. Click "Save All Changes"
9. **Expected:** Success toast
10. Navigate back to `/cpap`
11. **Expected:** Changes are reflected

**Status:** ☐ Pass ☐ Fail

---

### Test 10: Multiple Service Areas (FUNCTIONAL)
**Purpose:** Test all 8 service areas

**Steps:**
1. Log in as **Officer**
2. Go to `/cpap/editor`
3. Add one row to each service area:
   - FINANCIAL ADMINISTRATION
   - DISASTER PREPAREDNESS
   - SOCIAL PROTECTION
   - SAFETY AND PEACE
   - BUSINESS-FRIENDLY
   - ENVIRONMENTAL MANAGEMENT
4. Fill output for each
5. Click "Save All Changes"
6. Refresh page
7. **Expected:** All 6 rows are saved and visible

**Status:** ☐ Pass ☐ Fail

---

## 🔍 Edge Cases to Test

### Edge Case 1: Special Characters
**Steps:**
1. Add row with special characters in output: `"Test & <script>alert('xss')</script>"`
2. Save
3. **Expected:** Characters are escaped/sanitized

**Status:** ☐ Pass ☐ Fail

---

### Edge Case 2: Very Long Text
**Steps:**
1. Add row with 1000+ character output
2. Save
3. **Expected:** Saves successfully, textarea expands

**Status:** ☐ Pass ☐ Fail

---

### Edge Case 3: Empty CPAP Save
**Steps:**
1. Go to editor with no rows
2. Click "Save All Changes"
3. **Expected:** Nothing happens (no error, no save)

**Status:** ☐ Pass ☐ Fail

---

### Edge Case 4: Rapid Clicking
**Steps:**
1. Add a row
2. Click "Save All Changes" multiple times rapidly
3. **Expected:** Button disables, only saves once

**Status:** ☐ Pass ☐ Fail

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Permission Check | ☐ | |
| 2. Empty Schedule | ☐ | |
| 3. Save Button | ☐ | |
| 4. Filter Logic | ☐ | |
| 5. Date Format | ☐ | |
| 6. Empty Rows | ☐ | |
| 7. React Warnings | ☐ | |
| 8. Create Flow | ☐ | |
| 9. Edit Flow | ☐ | |
| 10. Multiple Areas | ☐ | |
| Edge Case 1 | ☐ | |
| Edge Case 2 | ☐ | |
| Edge Case 3 | ☐ | |
| Edge Case 4 | ☐ | |

**Total Tests:** 14
**Passed:** ___
**Failed:** ___
**Pass Rate:** ___%

## 🐛 Bug Report Template

If you find a bug, document it here:

### Bug #1
**Title:** 
**Severity:** ☐ Critical ☐ High ☐ Medium ☐ Low
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Screenshots:**

**Browser/Device:**

---

## ✅ Sign-Off

**Tested By:** _______________
**Date:** _______________
**Environment:** ☐ Development ☐ Staging ☐ Production
**Overall Status:** ☐ Pass ☐ Fail ☐ Pass with Issues

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Approved for Production:** ☐ Yes ☐ No

**Approver:** _______________
**Date:** _______________
