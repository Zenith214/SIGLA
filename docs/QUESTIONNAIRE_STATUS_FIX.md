# Questionnaire Status Update Fix

## Problem

After completing a survey, the questionnaire status remained as "In Progress" instead of being updated to "Completed". This caused the spot to show "Resume Interview/Callback" instead of showing it as completed.

## Root Cause

The `questionnaireId` and `spotId` were not being included in the survey submission data, so the API couldn't:
1. Create a visit record with "Interview_Completed" outcome
2. Update the questionnaire status to "Completed"
3. Calculate GPS verification distance

## Solution

Added `questionnaireId` and `spotId` to the submission data in `page.tsx`:

```typescript
const submissionData = {
  surveyNumber: finalSurveyNumber,
  location: surveyData.location,
  verificationLocation: surveyData.verificationLocation,
  selectedMember: surveyData.selectedMember,
  respondentDemographics: surveyData.respondentDemographics,
  interviewerId: user?.id,
  barangayId: barangayId,
  questionnaireId: questionnaireIdFromUrl, // ← ADDED
  spotId: spotIdFromUrl,                   // ← ADDED
  sections: { ... }
}
```

## What This Fixes

### 1. Visit Record Creation
```sql
-- Now creates visit record when survey is submitted
INSERT INTO visits (
  questionnaire_id,
  visit_number,
  outcome,
  notes
) VALUES (
  '2026-001-1',
  1,
  'Interview_Completed',
  'Interview completed successfully'
);
```

### 2. Questionnaire Status Update
```sql
-- Now updates questionnaire status to Completed
UPDATE questionnaires 
SET status = 'Completed',
    visit_count = visit_count + 1,
    updated_at = NOW()
WHERE questionnaire_id = '2026-001-1';
```

### 3. GPS Verification
```sql
-- Now calculates distance from assigned spot
UPDATE survey_response
SET gps_verification_status = 'verified',
    gps_distance_meters = 45.23
WHERE response_id = 123;
```

## Before vs After

### Before (Bug)
```
User completes survey
    ↓
Survey submitted
    ↓
Questionnaire status: "In Progress" ❌
    ↓
Spot shows: "Resume Interview/Callback" ❌
    ↓
No visit record created ❌
```

### After (Fixed)
```
User completes survey
    ↓
Survey submitted with questionnaireId
    ↓
Visit record created: "Interview_Completed" ✅
    ↓
Questionnaire status: "Completed" ✅
    ↓
Spot shows: "Completed" ✅
    ↓
GPS verification calculated ✅
```

## Impact

### For New Surveys
- If started from spot assignment (has questionnaireId):
  - ✅ Visit logged automatically
  - ✅ Status updated to Completed
  - ✅ GPS verification calculated

- If started without spot assignment (no questionnaireId):
  - ⚠️ No visit logged (expected - not from spot)
  - ⚠️ No status update (expected - no questionnaire)
  - ⚠️ No GPS verification (expected - no assigned spot)

### For Callbacks
- ✅ Visit logged automatically on submission
- ✅ Status updated to Completed
- ✅ GPS verification calculated
- ✅ Visit count incremented

## Testing

### Test Case 1: Complete Survey from Spot Assignment
```
1. Open spot with assigned questionnaire
2. Click "Start Interview"
3. Complete entire survey
4. Submit survey
5. Check questionnaire status → Should be "Completed"
6. Check spot → Should show "Completed"
7. Check visits table → Should have "Interview_Completed" record
```

### Test Case 2: Complete Survey from Callback
```
1. Open spot with "In Progress" questionnaire
2. Click "Resume"
3. Complete remaining sections
4. Submit survey
5. Check questionnaire status → Should be "Completed"
6. Check spot → Should show "Completed"
7. Check visits table → Should have "Interview_Completed" record
```

### Test Case 3: GPS Verification
```
1. Complete survey from spot assignment
2. Check survey_response table
3. Verify gps_verification_status is set
4. Verify gps_distance_meters is calculated
5. If distance > 200m, status should be "flagged"
6. If distance ≤ 200m, status should be "verified"
```

## Database Queries to Verify

### Check Questionnaire Status
```sql
SELECT 
  questionnaire_id,
  status,
  visit_count,
  updated_at
FROM questionnaires
WHERE questionnaire_id = '2026-001-1';
```

### Check Visit Records
```sql
SELECT 
  visit_number,
  outcome,
  notes,
  visit_timestamp
FROM visits
WHERE questionnaire_id = '2026-001-1'
ORDER BY visit_number;
```

### Check GPS Verification
```sql
SELECT 
  survey_number,
  gps_verification_status,
  gps_distance_meters,
  verification_location
FROM survey_response
WHERE survey_number = '2026-001-1';
```

## Files Modified

1. ✅ `src/app/survey/forms/page.tsx`
   - Added `questionnaireId` to submission data
   - Added `spotId` to submission data

## Related Documentation

- `VISIT_LOGGING_FLOW_EXPLANATION.md` - Explains visit logging flow
- `GPS_VERIFICATION_MIGRATION_GUIDE.md` - GPS verification setup
- `AUTOMATIC_GPS_WITH_FALLBACK.md` - GPS capture implementation

## Notes

- This fix only affects surveys started from spot assignments
- Surveys started without spot assignments work as before
- The API already had the logic to handle this - we just needed to pass the data
- No database migration needed - just a code fix
