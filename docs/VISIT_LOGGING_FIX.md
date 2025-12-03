# Visit Logging Fix - Prevent Duplicate Visits

## Problem
Visits were being logged too early in the survey process, causing duplicate visit counts when:
- Interviewers refreshed the page
- Interviewers navigated to check the form without completing it
- Interviewers accidentally opened the survey

This resulted in inflated visit counts (e.g., 2 visits when only 1 actual attempt was made).

## Root Cause
1. `createSurveyRecord()` in IndexedDB automatically logged Visit 1 when creating a new record
2. This happened during the initialization section, before any meaningful data was collected
3. Any page refresh or navigation would trigger another record creation attempt

## Solution Implemented

### 1. Removed Automatic Visit Logging from Record Creation
**File:** `src/lib/indexedDB.ts`
- Removed automatic Visit 1 creation in `createSurveyRecord()`
- Records now start with an empty visits array: `visits: []`
- Updated documentation to clarify visits must be logged explicitly

### 2. Added Visit Logging to Respondent Demographics Completion
**File:** `src/app/survey/forms/sections/respondent-demographics.tsx`
- Visits are now logged when the respondent completes the demographics section
- This ensures meaningful progress has been made before counting a visit
- Includes safety check: only logs if `record.visits.length === 0` (prevents duplicates)
- Logs to both IndexedDB and API
- Captures GPS location at time of visit logging
- Works for both first visits and callback visits with "Interview Started" outcome

### 3. Updated Callback Visit Logic
**File:** `src/app/survey/forms/sections/survey-initialization.tsx`
- Visit form only shows if `currentVisitCount > 0` (existing visits)
- For callbacks with "Interview Started" outcome: Visit is logged in demographics (not initialization)
- For callbacks with other outcomes (Callback Needed, NQR, OR, Moved): Visit is logged in initialization
- This prevents premature visit logging when user navigates away before completing demographics

## Visit Logging Flow

### New Survey (First Visit)
1. User opens survey form → No visit logged yet, no visit form shown
2. User completes initialization → No visit logged yet
3. User selects respondent → No visit logged yet
4. User completes demographics → **Visit 1 logged** ✅
5. User continues to service sections → Visit already logged

### Callback Survey - Interview Started (Subsequent Visits)
1. User opens callback survey → No visit logged yet
2. User sees visit status form (because visits exist)
3. User selects "Interview Started" → No visit logged yet (will log in demographics)
4. User completes demographics → **Visit N logged** ✅
5. User continues to survey

### Callback Survey - Other Outcomes
1. User opens callback survey → No visit logged yet
2. User sees visit status form (because visits exist)
3. User selects "Callback Needed" or "NQR/OR/Moved" → **Visit N logged** ✅
4. System redirects to dashboard (no interview)

### Accidental Refresh/Navigation Before Demographics
1. User opens survey form → No visit logged
2. User completes initialization → No visit logged
3. User selects respondent → No visit logged
4. User refreshes page or navigates away → No visit logged
5. **Result:** No duplicate visits, accurate count ✅

## Benefits
1. **Accurate visit counts** - Only counts visits when meaningful progress is made
2. **Prevents duplicates** - Refreshes and accidental navigation don't create new visits
3. **Maintains CSIS protocol** - Callback visits are still properly logged with outcomes
4. **Better data quality** - Visit counts reflect actual interview attempts

## Testing Recommendations
1. Test new survey flow - verify Visit 1 is logged after demographics
2. Test page refresh - verify no duplicate visits are created
3. Test callback flow - verify subsequent visits are logged correctly
4. Test navigation away - verify no visits are logged if user doesn't complete demographics
5. Check visit counts in database match actual attempts

## Migration Notes
- Existing surveys with Visit 1 already logged will continue to work normally
- New surveys will follow the new logging pattern
- No data migration needed - the change is forward-compatible
