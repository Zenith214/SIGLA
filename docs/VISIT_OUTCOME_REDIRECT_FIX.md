# Visit Outcome Redirect Fix

## Issue

When logging a visit with outcome "Callback Needed", "Refused", or "Household Moved", the user was still able to continue to the survey forms. This doesn't make sense because these outcomes indicate the interview cannot proceed.

## Solution

Added automatic redirect to spots dashboard for failed visit outcomes.

## Implementation

### Updated handleNext Function

```typescript
const handleNext = async () => {
  // ... validation ...

  try {
    // Log visit if this is a callback
    if (isCallback && outcome) {
      await logVisit()
      
      // If outcome is not "Interview_Started", redirect back to spots dashboard
      if (outcome !== "Interview_Started") {
        console.log(`📍 Visit logged with outcome: ${outcome}. Redirecting...`)
        alert(`Visit logged successfully. ${
          outcome === "Callback_Needed" 
            ? "You can return later to complete the interview." 
            : "Returning to spots dashboard."
        }`);
        
        // Redirect to spots page
        window.location.href = `/survey/spots`;
        return;
      }
    }
    
    // Continue with survey only if outcome is "Interview_Started"
    // ... rest of function ...
  }
}
```

## Behavior by Outcome

### Interview_Started ✅
```
User selects: "Interview Started"
    ↓
Visit logged
    ↓
Continues to survey forms
    ↓
Can complete interview
```

### Callback_Needed 🔄
```
User selects: "Callback Needed"
    ↓
Visit logged
    ↓
Alert: "Visit logged successfully. You can return later..."
    ↓
Redirects to spots dashboard
    ↓
Can return for next visit
```

### Refused ❌
```
User selects: "Refused to Participate"
    ↓
Visit logged
    ↓
Alert: "Visit logged successfully. Returning to spots dashboard."
    ↓
Redirects to spots dashboard
    ↓
Questionnaire flagged (if last visit)
```

### Household_Moved 🏠
```
User selects: "Household Moved"
    ↓
Visit logged
    ↓
Alert: "Visit logged successfully. Returning to spots dashboard."
    ↓
Redirects to spots dashboard
    ↓
Questionnaire flagged (if last visit)
```

## User Experience

### Scenario 1: First Visit - Callback Needed
```
1. User arrives at household
2. Opens survey from spot
3. Initialization shows visit logging
4. Selects: "First Visit" + "Callback Needed"
5. Selects reason: "No one home"
6. Clicks "Log Visit & Continue"
7. Visit logged
8. Alert shown
9. Redirected to spots dashboard ✅
10. Can return later for "Second Visit"
```

### Scenario 2: Second Visit - Interview Started
```
1. User returns to household
2. Opens survey from spot
3. Initialization shows visit logging
4. Selects: "Second Visit" + "Interview Started"
5. Clicks "Log Visit & Continue"
6. Visit logged
7. Continues to survey forms ✅
8. Completes interview
```

### Scenario 3: Last Visit - Refused
```
1. User returns for final attempt
2. Opens survey from spot
3. Initialization shows visit logging
4. Selects: "Last Visit" + "Refused"
5. Warning shown about final attempt
6. Clicks "Log Visit & Continue"
7. Visit logged
8. Alert shown
9. Redirected to spots dashboard ✅
10. Questionnaire flagged for substitution
11. Move to next spot
```

## Benefits

### 1. Prevents Confusion
- ✅ Can't continue survey if interview can't proceed
- ✅ Clear feedback about what happens next
- ✅ Automatic redirect - no manual navigation needed

### 2. Correct Workflow
- ✅ Failed outcomes return to dashboard
- ✅ Successful outcome continues to survey
- ✅ Matches real-world field interviewer workflow

### 3. Data Integrity
- ✅ Visit logged before redirect
- ✅ Questionnaire status updated correctly
- ✅ No partial survey data for failed visits

### 4. User Guidance
- ✅ Alert message explains what's happening
- ✅ Different messages for different outcomes
- ✅ Clear next steps

## Alert Messages

### Callback Needed
```
"Visit logged successfully. You can return later to complete the interview."
```
- Positive tone
- Indicates they can come back
- Encourages return visit

### Refused / Household Moved
```
"Visit logged successfully. Returning to spots dashboard."
```
- Neutral tone
- Confirms action taken
- Indicates what's happening next

## Technical Details

### Redirect URL
```typescript
window.location.href = `/survey/spots`;
```
- Full page navigation (not router.push)
- Ensures clean state
- Clears any form data

### Timing
1. Visit logged to IndexedDB
2. Visit logged to API
3. Alert shown
4. User clicks OK
5. Redirect happens

### Error Handling
If visit logging fails:
- Error is caught
- Alert shown with error message
- No redirect happens
- User can retry

## Testing Checklist

- [ ] Select "Callback Needed" → Redirects to spots
- [ ] Select "Refused" → Redirects to spots
- [ ] Select "Household Moved" → Redirects to spots
- [ ] Select "Interview Started" → Continues to survey
- [ ] Alert message shows for failed outcomes
- [ ] Alert message is appropriate for each outcome
- [ ] Visit is logged before redirect
- [ ] Can return and log another visit
- [ ] Questionnaire status updates correctly

## Files Modified

1. ✅ `src/app/survey/forms/sections/survey-initialization.tsx`
   - Added redirect logic after logging visit
   - Added alert messages
   - Only continues to survey if outcome is "Interview_Started"

## Related Documentation

- `VISIT_LOGGING_FLOW_EXPLANATION.md` - Complete visit logging flow
- `MANUAL_VISIT_TYPE_SELECTION.md` - Manual visit type selection
- `VISIT_LOGGING_CONSISTENCY_FIX.md` - Visit logging consistency

## Notes

- Redirect only happens for callbacks (when questionnaireId exists)
- New surveys (no questionnaireId) are not affected
- Visit is always logged before redirect
- User sees confirmation before redirect
- Clean page navigation ensures no stale state
