# Manual Visit Type Selection

## Overview
Changed from automatic visit counting to manual visit type selection. Users now explicitly choose "First Visit", "Second Visit", or "Last Visit" instead of the system auto-incrementing visit numbers.

## Problem with Auto-Increment

### Before (Auto-Increment Issues)
```
Visit #1 → Page loads → Auto-increments to Visit #2
Visit #2 → Page refresh → Auto-increments to Visit #3
Visit #3 → Accidental refresh → Auto-increments to Visit #4 ❌
```

**Problems:**
- ❌ Page refreshes increment visit count
- ❌ Accidental navigation increments count
- ❌ No clear indication of "last attempt"
- ❌ Visit count can become inaccurate
- ❌ Reached Visit #11 due to refreshes

## Solution: Manual Selection

### After (Manual Selection)
```
User explicitly selects:
○ First Visit
○ Second Visit  
○ Last Visit (3rd Attempt)
```

**Benefits:**
- ✅ No accidental increments
- ✅ User controls visit type
- ✅ Clear "Last Visit" option
- ✅ Accurate visit tracking
- ✅ Prevents refresh issues

## Implementation

### 1. Added Visit Type State
```typescript
const [visitType, setVisitType] = useState<string>("")
const [errors, setErrors] = useState<{ 
  visitType?: string; 
  outcome?: string; 
  callbackReason?: string 
}>({})
```

### 2. Updated Validation
```typescript
const validateVisitForm = (): boolean => {
  const newErrors: typeof errors = {}

  if (!visitType) {
    newErrors.visitType = "Please select which visit this is"
  }

  if (!outcome) {
    newErrors.outcome = "Please select a visit outcome"
  }

  if (outcome === "Callback_Needed" && !callbackReason) {
    newErrors.callbackReason = "Please select a callback reason"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### 3. Updated Notes Format
```typescript
// Include visit type in notes
let finalNotes = `Visit Type: ${visitType}\n`
if (outcome === "Callback_Needed" && callbackReason) {
  finalNotes += `Callback Reason: ${callbackReason}\n`
}
if (notes.trim()) {
  finalNotes += `\nNotes: ${notes.trim()}`
}
```

### 4. Added Visit Type Radio Buttons
```typescript
<div className="space-y-3">
  <Label>
    Which Visit Is This? <span className="text-red-500">*</span>
  </Label>
  <RadioGroup value={visitType} onValueChange={setVisitType}>
    <RadioGroupItem value="First Visit" id="first-visit" />
    <RadioGroupItem value="Second Visit" id="second-visit" />
    <RadioGroupItem value="Last Visit" id="last-visit" />
  </RadioGroup>
  {errors.visitType && (
    <p className="text-sm text-red-500">{errors.visitType}</p>
  )}
</div>
```

### 5. Added Last Visit Note
```typescript
{visitType === "Last Visit" && (
  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
    <strong>Note:</strong> After this visit, you should move to another 
    spot if the interview cannot be completed.
  </div>
)}
```

### 6. Updated Warning Logic
```typescript
// Show warning only for "Last Visit" with failed outcome
{visitType === "Last Visit" && outcome && outcome !== "Interview_Started" && (
  <div className="p-3 bg-red-50 border border-red-200 rounded">
    <AlertCircle />
    <p className="font-medium text-red-800">Warning: Last Visit</p>
    <p className="text-red-600">
      This is the final attempt. After logging this visit, you should 
      move to another spot. The questionnaire will be flagged for substitution.
    </p>
  </div>
)}
```

## User Interface

### Complete Form
```
┌────────────────────────────────────────────────┐
│ 📋 Initialize Survey                           │
├────────────────────────────────────────────────┤
│ ✅ Barangay: Katipunan                         │
│                                                │
│ 📍 Log Visit Status                            │
│ Select which visit this is and record outcome  │
│                                                │
│ Which Visit Is This? *                         │
│ ○ First Visit                                  │
│ ○ Second Visit                                 │
│ ● Last Visit (3rd Attempt)                     │
│ ⚠️ Note: After this visit, move to another spot│
│                                                │
│ Visit Outcome *                                │
│ ○ Callback Needed                              │
│ ○ Interview Started                            │
│ ● Refused to Participate                       │
│ ○ Household Moved                              │
│                                                │
│ ⚠️ Warning: Last Visit                         │
│ This is the final attempt. After logging this  │
│ visit, you should move to another spot.        │
│                                                │
│ Digital Fieldwork Diary Notes                  │
│ ┌────────────────────────────────────────────┐ │
│ │ Respondent refused to participate          │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ [Log Visit & Continue →]                       │
└────────────────────────────────────────────────┘
```

## User Workflow

### Scenario 1: First Visit - Callback Needed
```
1. User arrives at household
2. Opens survey initialization
3. Selects: ○ First Visit
4. Selects: ○ Callback Needed
5. Selects reason: "No one home"
6. Adds notes: "Will return tomorrow morning"
7. Clicks [Log Visit & Continue →]
8. Visit logged, can exit or continue
```

### Scenario 2: Second Visit - Interview Started
```
1. User returns to household
2. Opens survey initialization
3. Selects: ○ Second Visit
4. Selects: ○ Interview Started
5. Adds notes: "Respondent available"
6. Clicks [Log Visit & Continue →]
7. Visit logged, proceeds to interview
```

### Scenario 3: Last Visit - Refused
```
1. User returns for final attempt
2. Opens survey initialization
3. Selects: ○ Last Visit (3rd Attempt)
4. ⚠️ Note appears: "Move to another spot after"
5. Selects: ○ Refused to Participate
6. ⚠️ Warning appears: "Final attempt, will be flagged"
7. Adds notes: "Respondent not interested"
8. Clicks [Log Visit & Continue →]
9. Visit logged, questionnaire flagged
10. User moves to next spot
```

## Data Stored

### Visit Record Format
```json
{
  "questionnaireId": "2026-001-1",
  "visitNumber": 3,
  "outcome": "Refused",
  "notes": "Visit Type: Last Visit\nNotes: Respondent not interested",
  "location": { "lat": 14.123, "lng": 121.456 },
  "timestamp": "2025-11-26T10:30:00Z"
}
```

### Notes Format
```
Visit Type: Last Visit
Callback Reason: No one home
Notes: Gate was locked, will try again tomorrow
```

## Benefits

### 1. Prevents Accidental Increments
- ✅ Page refresh doesn't increment
- ✅ Navigation doesn't increment
- ✅ User has full control

### 2. Clear Communication
- ✅ "Last Visit" explicitly indicates final attempt
- ✅ Warning shows when to move to another spot
- ✅ No confusion about visit count

### 3. Accurate Tracking
- ✅ Visit type matches reality
- ✅ No inflated visit counts
- ✅ Better data quality

### 4. Better Workflow
- ✅ User knows when to give up
- ✅ Clear indication of final attempt
- ✅ Helps with spot substitution decisions

## Validation Rules

### Required Fields
1. **Visit Type**: Always required for callbacks
2. **Visit Outcome**: Always required for callbacks
3. **Callback Reason**: Required only if outcome is "Callback Needed"
4. **Notes**: Optional

### Error Messages
```typescript
{errors.visitType && (
  <p className="text-sm text-red-500">
    Please select which visit this is
  </p>
)}

{errors.outcome && (
  <p className="text-sm text-red-500">
    Please select a visit outcome
  </p>
)}

{errors.callbackReason && (
  <p className="text-sm text-red-500">
    Please select a callback reason
  </p>
)}
```

## Spot Substitution Logic

### When to Move to Another Spot
```
Last Visit + Failed Outcome = Move to Another Spot

Failed Outcomes:
- Callback Needed
- Refused to Participate
- Household Moved

Success Outcome:
- Interview Started (continue with interview)
```

### Flagging Logic
```typescript
if (visitType === "Last Visit" && outcome !== "Interview_Started") {
  // Flag questionnaire for substitution
  // User should move to another spot
  // Supervisor will review
}
```

## Files Modified

1. ✅ `src/app/survey/forms/sections/survey-initialization.tsx`
   - Added `visitType` state
   - Updated validation to require visit type
   - Added visit type radio buttons
   - Updated notes format to include visit type
   - Changed warning logic to use visit type
   - Added "Last Visit" note
   - Removed auto-increment display

## Testing Checklist

- [ ] Visit type selection required
- [ ] "First Visit" option works
- [ ] "Second Visit" option works
- [ ] "Last Visit" option works
- [ ] Note appears for "Last Visit"
- [ ] Warning appears for "Last Visit" + failed outcome
- [ ] Validation error shows if visit type not selected
- [ ] Visit type included in saved notes
- [ ] Page refresh doesn't change visit type
- [ ] Can change visit type before submitting
- [ ] Form submits correctly with visit type

## Migration Notes

**Existing visits in database:**
- Old visits don't have visit type in notes
- New visits will have "Visit Type: ..." in notes
- Both formats are valid
- No data migration needed

## Future Enhancements

1. **Visit History**: Show previous visits with their types
2. **Smart Suggestions**: Suggest visit type based on history
3. **Visit Scheduling**: Allow scheduling next visit
4. **GPS Tracking**: Track distance traveled between visits
5. **Time Tracking**: Record time spent at each visit
