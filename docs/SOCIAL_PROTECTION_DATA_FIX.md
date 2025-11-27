# Social Protection Section Data Fix

## Issue
The Social Protection section in the survey summary was displaying Financial Administration questions instead of the correct Social Protection questions (Health Services, Women/Children Protection, Community Participation).

## Root Cause
Survey data was saved with incorrect section mapping - the `socialProtection` field contained Financial Administration question responses, while the `financialAdmin` field likely contained Social Protection responses.

## Solution Implemented

### 1. Data Migration Utility
Created `src/app/survey/forms/utils/dataMigration.ts` that:
- Automatically detects section data mismatches by analyzing question IDs
- Swaps data between sections when mismatches are detected
- Runs automatically when loading survey data from IndexedDB

### 2. Manual Fix Utility
Created `src/app/survey/forms/utils/fixSurveyData.ts` that provides a browser console function to manually fix data for specific surveys.

### 3. Debug Logging
Added console logging in `tabbed-summary.tsx` to help identify data mapping issues.

## How to Use the Manual Fix

If you encounter a survey with incorrect section data:

1. Open the survey in the browser
2. Open the browser console (F12)
3. Run the following command:
   ```javascript
   await window.fixSurveyData('your-questionnaire-id')
   ```
4. Reload the page to see the corrected data

The function will:
- Check if Social Protection section has Financial Admin questions
- Check if Financial Admin section has Social Protection questions
- Swap the data if both conditions are true
- Save the corrected data back to IndexedDB

## Prevention

The migration utility now runs automatically when loading survey data, so new surveys should not experience this issue. The root cause was likely a temporary bug in an earlier version of the code that has since been fixed.

## Verification

After applying the fix:
- Social Protection tab should show: Health Services, Women/Children Protection, Community Participation questions
- Financial Administration tab should show: Projects, Financial Transparency, Social Programs, Corruption questions

## Files Modified
- `src/app/survey/forms/utils/dataMigration.ts` (new)
- `src/app/survey/forms/utils/fixSurveyData.ts` (new)
- `src/app/survey/forms/page.tsx` (added migration and fix utilities)
- `src/app/survey/forms/sections/tabbed-summary.tsx` (added debug logging)
