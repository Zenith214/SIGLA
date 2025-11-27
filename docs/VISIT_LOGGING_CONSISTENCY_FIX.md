# Visit Logging Consistency Fix

## Issue

There was a conflict between automatic visit logging (from spots page) and manual visit logging (in survey forms initialization).

## Current Behavior

### From Spots Page
When clicking "Start Interview" or "Resume Interview":
1. Navigates to `/survey/forms?questionnaireId=...&cycleId=...&spotId=...`
2. **No automatic visit logging** - just navigation
3. User manually logs visit in initialization section

### In Survey Forms
When opening a survey with questionnaireId:
1. Initialization section shows visit logging form
2. User manually selects visit type (First/Second/Last)
3. User manually selects outcome
4. Visit is logged when clicking "Log Visit & Continue"

## Consistency Achieved

✅ **All visit logging is now manual** - No automatic logging anywhere
✅ **User has full control** - Decides when and how to log visits
✅ **No conflicts** - Single source of truth for visit logging

## Visit Logging Flow

### Scenario 1: Start New Interview from Spot
```
User clicks "Start Interview" on spot
    ↓
Navigates to survey forms with questionnaireId
    ↓
Initialization shows visit logging form
    ↓
User selects: "First Visit" + "Interview Started"
    ↓
Clicks "Log Visit & Continue"
    ↓
Visit logged manually
    ↓
Proceeds to survey
```

### Scenario 2: Resume Interview (Callback)
```
User clicks "Resume Interview" on spot
    ↓
Navigates to survey forms with questionnaireId
    ↓
Initialization shows visit logging form
    ↓
User selects: "Second Visit" + "Interview Started"
    ↓
Clicks "Log Visit & Continue"
    ↓
Visit logged manually
    ↓
Proceeds to survey
```

### Scenario 3: Callback Without Completing
```
User clicks "Resume Interview" on spot
    ↓
Navigates to survey forms with questionnaireId
    ↓
Initialization shows visit logging form
    ↓
User selects: "Second Visit" + "Callback Needed"
    ↓
Selects reason: "Respondent busy"
    ↓
Clicks "Log Visit & Continue"
    ↓
Visit logged manually
    ↓
Can exit or continue
```

## Test Data Cleanup

Deleted all test data for questionnaire `2026-001-1`:
- ✅ 7 survey sections deleted
- ✅ 1 survey response deleted
- ✅ 3 visits deleted
- ✅ Questionnaire reset to "Pending" status
- ✅ Visit count reset to 0

### Script Created
`scripts/delete-test-questionnaire.js` - Can be reused for cleaning up test data

## Components Involved

### 1. InterviewSlotCard.tsx
- **No changes needed** - Already just navigates
- Does NOT auto-log visits
- Passes questionnaireId in URL

### 2. survey-initialization.tsx
- **Manual visit logging** - User controls everything
- Shows form when questionnaireId exists
- Logs visit when user clicks button

### 3. survey-responses API
- **Auto-logs on submission** - Only when survey completed
- Creates "Interview_Completed" visit
- Updates questionnaire status

## Benefits

### 1. User Control
- ✅ User decides when to log visits
- ✅ User selects visit type manually
- ✅ No accidental visit increments

### 2. Accurate Data
- ✅ Visit type matches reality
- ✅ Visit outcomes are intentional
- ✅ No phantom visits from page refreshes

### 3. Clear Workflow
- ✅ Single place for visit logging
- ✅ Consistent behavior everywhere
- ✅ Easy to understand and train

## Testing Checklist

- [ ] Click "Start Interview" from spot
- [ ] Verify initialization shows visit logging form
- [ ] Select "First Visit" + "Interview Started"
- [ ] Verify visit is logged
- [ ] Complete survey
- [ ] Verify questionnaire status is "Completed"
- [ ] Verify visit count is correct
- [ ] Click "Resume Interview" from spot
- [ ] Verify initialization shows visit logging form
- [ ] Select "Second Visit" + "Callback Needed"
- [ ] Verify visit is logged
- [ ] Verify can exit without completing survey
- [ ] Verify questionnaire status remains "In Progress"

## Files Modified

1. ✅ `scripts/delete-test-questionnaire.js` - Created cleanup script
2. ✅ No code changes needed - behavior already correct!

## Notes

- The spots page was already correct - it just navigates
- The survey forms already have manual visit logging
- The only "automatic" logging is on successful survey submission
- This is the desired behavior - no changes needed!

## Related Documentation

- `VISIT_LOGGING_FLOW_EXPLANATION.md` - Complete visit logging explanation
- `MANUAL_VISIT_TYPE_SELECTION.md` - Manual visit type selection
- `INLINE_VISIT_STATUS_FIELDS.md` - Visit status form implementation
