# Fix: Barangay ID Not Passed from Spot to Survey Forms

## Problem

When field interviewers navigate from their assigned spots to start a survey, the barangay ID was not being passed to the survey forms. This caused the survey initialization screen to show "Please select a barangay first" error even though the spot already has the barangay information.

## Root Causes

1. **Missing URL Parameters**: The `InterviewSlotCard` component was constructing the URL to navigate to survey forms with only `questionnaireId` and `spotId`, but was missing:
   - `barangayId` - Required to pre-select the barangay
   - `cycleId` - Required for IndexedDB operations

2. **Questionnaire Number Not Pre-loaded**: When coming from spot workflow with a pre-assigned questionnaire number in the URL, the system wasn't setting it in the survey data state, causing the initialization to try generating a new number (which requires barangayId).

3. **Barangay ID Effect Dependency**: The effect that sets barangayId from URL had a dependency on `surveyData.barangayId` which prevented it from updating properly.

## Solution

### Changes Made

#### 1. SpotWorkflowScreen.tsx
- **Updated `SpotDetails` interface**: Added `cycleId: number` field
- **Updated prop passing**: Pass both `cycleId` and `barangayId` to `InterviewSlotCard`

#### 2. InterviewSlotCard.tsx
- **Updated props interface**: Added `cycleId: number` and `barangayId: number` parameters
- **Updated URL construction**: Include all required parameters in navigation URL

**Before:**
```typescript
// Missing barangayId and cycleId
window.location.href = `/survey/forms?questionnaireId=${interview.questionnaireId}&spotId=${spotId}`;
```

**After:**
```typescript
// Includes all required parameters
window.location.href = `/survey/forms?questionnaireId=${interview.questionnaireId}&cycleId=${cycleId}&spotId=${spotId}&barangayId=${barangayId}`;
```

#### 3. page.tsx (Survey Forms Main)
- **Pre-load questionnaire number**: When `questionnaireId` is in URL but no IndexedDB record exists, set it as the survey number immediately
- **Fixed barangayId effect**: Removed dependency on `surveyData.barangayId` to ensure it always updates from URL parameter

**Before:**
```typescript
// Only loaded from IndexedDB, didn't handle new interviews with pre-assigned numbers
if (existingRecord) {
  // Load data...
}
// Falls through to localStorage
```

**After:**
```typescript
if (existingRecord) {
  // Load data...
} else {
  // NEW: Handle pre-assigned questionnaire number for new interviews
  setSurveyData(prev => ({ 
    ...prev, 
    surveyNumber: questionnaireIdParam 
  }));
  setQuestionnaireIdFromUrl(questionnaireIdParam);
  // Set cycleId and spotId...
}
```

## How It Works Now

### New Interview Flow (Pending Status)
1. FI clicks "Start Interview" from spot
2. URL includes: `questionnaireId=BB-2024-0001&cycleId=1&spotId=123&barangayId=26`
3. Page.tsx detects no IndexedDB record exists
4. Sets `surveyData.surveyNumber = "BB-2024-0001"` from URL
5. Sets `surveyData.barangayId = 26` from URL
6. SurveyInitialization component receives pre-populated data
7. When clicking "Continue", it detects existing survey number and skips generation
8. Proceeds directly to respondent selection

### Resume Interview Flow (In Progress Status)
1. FI clicks "Resume Interview" from spot
2. URL includes same parameters
3. Page.tsx loads existing record from IndexedDB
4. Increments visit count
5. Resumes from last section

## Impact

✅ Field interviewers no longer see "Please select a barangay first" error  
✅ Survey initialization is faster and more streamlined  
✅ Reduces potential for data entry errors  
✅ Ensures proper IndexedDB record creation with cycle context  
✅ Pre-assigned questionnaire numbers are properly recognized  
✅ No unnecessary API calls to generate new questionnaire numbers  

## Testing

To verify the fix:
1. Log in as a field interviewer
2. Navigate to an assigned spot (e.g., "Spot 1 McKinley")
3. Click "Start Interview" on a pending slot
4. ✅ Verify that the survey initialization screen shows the pre-selected barangay name
5. ✅ Verify that no "Please select a barangay first" error appears
6. ✅ Verify that the questionnaire number is already assigned (shown in blue info box)
7. ✅ Click "Continue" and verify it proceeds to respondent selection without errors

