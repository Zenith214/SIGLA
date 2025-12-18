# Visit Logging Flow Explanation

## Question: How to Log a Successful First Visit Interview?

### Answer: You Don't Need To!

Visit logging is **only for callbacks** (return visits), not for new surveys.

## The Two Scenarios

### Scenario 1: New Survey (First Visit - Successful Interview)
```
User arrives at household for first time
    ↓
Opens survey form (no questionnaireId in URL)
    ↓
Initialization page shows:
    ✅ Barangay: Katipunan
    [Continue to Survey →]
    ↓
NO visit logging form shown
    ↓
User completes entire survey
    ↓
Submits survey
    ↓
Visit automatically logged as "Interview_Completed"
    ↓
Done!
```

**Key Points:**
- ✅ No manual visit logging needed
- ✅ Visit is automatically created when survey is submitted
- ✅ Visit outcome is "Interview_Completed"
- ✅ Visit number is 1

### Scenario 2: Callback Visit (Return Visit)
```
User returns to household (2nd or 3rd visit)
    ↓
Opens survey form (questionnaireId in URL)
    ↓
Initialization page shows:
    ✅ Barangay: Katipunan
    
    Which Visit Is This? *
    ○ First Visit
    ○ Second Visit
    ○ Last Visit (3rd Attempt)
    
    Visit Outcome *
    ○ Callback Needed
    ○ Interview Started
    ○ Refused to Participate
    ○ Household Moved
    
    [Log Visit & Continue →]
    ↓
User selects visit type and outcome
    ↓
If "Interview Started": Continues with survey
If "Callback Needed": Logs visit and exits
If "Refused/Moved": Logs visit and exits
    ↓
Done!
```

**Key Points:**
- ✅ Manual visit logging required
- ✅ User selects which visit (First/Second/Last)
- ✅ User selects outcome
- ✅ Can log callback without completing survey

## Why This Design?

### For New Surveys:
1. **Simpler Flow** - No extra step before starting
2. **Automatic Logging** - Visit logged when survey submitted
3. **Accurate Data** - Visit outcome matches reality (completed)
4. **Faster Start** - User can start survey immediately

### For Callbacks:
1. **Flexible Logging** - Can log visit without completing survey
2. **Track Attempts** - Records each visit attempt
3. **Callback Reasons** - Captures why callback is needed
4. **Quality Control** - Tracks multiple visit attempts

## Visit Outcomes Explained

### For New Surveys (Automatic):
- **Interview_Completed** - Survey was completed and submitted

### For Callbacks (Manual):
- **Callback_Needed** - Need to return (respondent busy, not home, etc.)
- **Interview_Started** - Starting/resuming the interview
- **Refused** - Respondent refused to participate
- **Household_Moved** - Household no longer at this location

## Data Flow

### New Survey Visit Logging (Automatic)
```typescript
// When survey is submitted
const response = await fetch('/api/survey-responses', {
  method: 'POST',
  body: JSON.stringify({
    questionnaireId: generatedQuestionnaireId,
    // ... survey data
  })
})

// API automatically creates visit record
await addVisit(
  questionnaireId,
  cycleId,
  'Interview_Completed',
  'Interview completed successfully',
  gpsLocation
)
```

### Callback Visit Logging (Manual)
```typescript
// When user clicks "Log Visit & Continue"
await addVisit(
  questionnaireId,
  cycleId,
  outcome, // User-selected: Callback_Needed, Interview_Started, etc.
  notes,
  gpsLocation
)
```

## Common Questions

### Q: What if first visit is unsuccessful?
**A:** If you arrive at a household for the first time but can't complete the interview:
1. Don't start a new survey
2. The household should already have a questionnaire assigned
3. Open that questionnaire (it will have questionnaireId in URL)
4. Log the visit with appropriate outcome (Callback_Needed, Refused, etc.)

### Q: When do I use "First Visit" in the visit type selector?
**A:** Use "First Visit" when:
- You're returning to a household that was assigned a questionnaire
- But you haven't visited them yet (or previous visit wasn't logged)
- This is your first actual visit to that specific household

### Q: What's the difference between "First Visit" and a new survey?
**A:**
- **New Survey**: No questionnaire assigned yet, you're creating one
- **First Visit**: Questionnaire already assigned, you're visiting for first time

### Q: Can I have a "First Visit" that's a callback?
**A:** Yes! If:
1. Questionnaire was assigned to household
2. You visit for the first time
3. Respondent is not available
4. You select "First Visit" + "Callback Needed"
5. You'll return for "Second Visit"

## Technical Implementation

### How the System Knows It's a Callback
```typescript
// In survey-initialization.tsx
const questionnaireIdParam = searchParams.get('questionnaireId')
const isCallback = !!questionnaireIdParam

// Show visit logging only for callbacks
{isCallback && (
  <div>
    {/* Visit logging form */}
  </div>
)}
```

### URL Patterns

**New Survey:**
```
/survey/forms?barangayId=26
```
- No questionnaireId
- No visit logging shown
- Visit logged automatically on submission

**Callback Survey:**
```
/survey/forms?questionnaireId=2026-001-1&cycleId=1&spotId=123
```
- Has questionnaireId
- Visit logging shown
- User manually logs visit

## Best Practices

### For Field Interviewers:

1. **Starting Fresh at a Household:**
   - Use "Start New Survey" from dashboard
   - No visit logging needed
   - Complete and submit survey

2. **Returning to a Household:**
   - Use "Resume" from dashboard
   - Log visit status first
   - Then continue with interview (if applicable)

3. **Multiple Attempts:**
   - First attempt: "First Visit"
   - Second attempt: "Second Visit"
   - Final attempt: "Last Visit"

4. **After Last Visit:**
   - If still unsuccessful, move to another household
   - Questionnaire will be flagged for substitution

### For Supervisors:

1. **Review Visit Logs:**
   - Check households with multiple failed attempts
   - Verify callback reasons are valid
   - Identify households needing substitution

2. **Quality Control:**
   - Ensure visits are logged correctly
   - Check GPS verification for each visit
   - Monitor interviewer performance

## Summary

**Simple Rule:**
- **New household** = No visit logging, just complete survey
- **Return visit** = Log visit status first, then proceed

The system automatically handles visit logging for successful first-time interviews. Manual visit logging is only needed for callbacks and unsuccessful visits.
