# Inline Visit Status Fields in Initialization

## Overview
Replaced the "Log Visit Status" button with inline form fields directly in the initialization section. Users no longer need to click a button to access the visit logging form.

## Changes Made

### Before (Button + Modal)
```
┌────────────────────────────────────────┐
│ 📋 Initialize Survey                   │
├────────────────────────────────────────┤
│ ✅ Barangay: Katipunan                 │
│                                        │
│ [Log Visit Status] ← Click to open    │
│                                        │
│ [Continue to Survey →]                 │
└────────────────────────────────────────┘

Click button → Modal opens → Fill form → Submit
```

### After (Inline Fields)
```
┌────────────────────────────────────────┐
│ 📋 Initialize Survey                   │
├────────────────────────────────────────┤
│ ✅ Barangay: Katipunan                 │
│                                        │
│ Visit #2 - Log the outcome...          │
│                                        │
│ Visit Outcome *                        │
│ ○ Callback Needed                      │
│ ○ Interview Started                    │
│ ○ Refused to Participate               │
│ ○ Household Moved                      │
│                                        │
│ [Callback Reason dropdown if needed]   │
│                                        │
│ Digital Fieldwork Diary Notes          │
│ [Text area for notes]                  │
│                                        │
│ [Log Visit & Continue →]               │
└────────────────────────────────────────┘

Fill form → Click continue → Done
```

## Implementation Details

### 1. Removed Dependencies
```typescript
// REMOVED:
import { VisitStatusButton } from "@/components/survey/VisitStatusButton"

// ADDED:
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
```

### 2. Added Form State
```typescript
const [isLoggingVisit, setIsLoggingVisit] = useState(false)
const [outcome, setOutcome] = useState<string>("")
const [callbackReason, setCallbackReason] = useState<string>("")
const [notes, setNotes] = useState<string>("")
const [errors, setErrors] = useState<{ outcome?: string; callbackReason?: string }>({})
const isCallback = !!questionnaireIdParam
```

### 3. Added Validation Function
```typescript
const validateVisitForm = (): boolean => {
  if (!isCallback) return true
  
  const newErrors: typeof errors = {}
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

### 4. Added Visit Logging Function
```typescript
const logVisit = async () => {
  // Get GPS location
  // Prepare notes with callback reason
  // Save to IndexedDB
  // Save to API
}
```

### 5. Enhanced handleNext Function
```typescript
const handleNext = async () => {
  // Validate visit form if callback
  if (isCallback && !validateVisitForm()) {
    return
  }
  
  // Log visit if callback
  if (isCallback && outcome) {
    await logVisit()
  }
  
  // Generate questionnaire number
  // Continue to next section
}
```

### 6. Inline Form Fields
```typescript
{isCallback && (
  <div className="space-y-4">
    {/* Visit number indicator */}
    <div className="p-3 bg-blue-50 ...">
      Visit #{currentVisitCount + 1}
    </div>
    
    {/* Visit Outcome Radio Group */}
    <RadioGroup value={outcome} onValueChange={setOutcome}>
      <RadioGroupItem value="Callback_Needed" />
      <RadioGroupItem value="Interview_Started" />
      <RadioGroupItem value="Refused" />
      <RadioGroupItem value="Household_Moved" />
    </RadioGroup>
    
    {/* Callback Reason (conditional) */}
    {outcome === "Callback_Needed" && (
      <Select value={callbackReason} onValueChange={setCallbackReason}>
        ...
      </Select>
    )}
    
    {/* Notes Textarea */}
    <Textarea value={notes} onChange={...} />
    
    {/* Warning for 3rd attempt */}
    {currentVisitCount >= 2 && ...}
  </div>
)}
```

## User Experience

### Scenario 1: New Survey (No Callback)
```
User starts new survey
    ↓
Initialization page loads
    ↓
Shows: ✅ Barangay: Katipunan
    ↓
No visit fields shown
    ↓
Click [Continue to Survey →]
    ↓
Proceeds to Respondent Selection
```

### Scenario 2: Callback Survey (Visit #2)
```
User resumes survey (questionnaireId in URL)
    ↓
Initialization page loads
    ↓
Shows: ✅ Barangay: Katipunan
Shows: Visit #2 - Log the outcome...
Shows: Visit outcome radio buttons
    ↓
User selects "Callback Needed"
    ↓
Callback reason dropdown appears
    ↓
User selects "No one home"
    ↓
User adds notes (optional)
    ↓
Click [Log Visit & Continue →]
    ↓
Visit logged to IndexedDB + API
    ↓
Proceeds to Respondent Selection
```

### Scenario 3: Final Attempt (Visit #3)
```
User returns for 3rd visit
    ↓
Initialization page loads
    ↓
Shows: Visit #3 - Log the outcome...
Shows: Visit outcome radio buttons
    ↓
User selects "Refused"
    ↓
⚠️ Warning appears: "Final Attempt - Will be flagged"
    ↓
Click [Log Visit & Continue →]
    ↓
Visit logged
Questionnaire flagged for substitution
    ↓
Proceeds (or exits based on outcome)
```

## Benefits

### 1. Fewer Clicks
- ✅ No button to click to open modal
- ✅ Direct access to form fields
- ✅ Faster workflow

### 2. Better Context
- ✅ Visit fields are part of initialization
- ✅ Clear that visit logging happens first
- ✅ No context switching (modal)

### 3. Cleaner Code
- ✅ No separate modal component
- ✅ All logic in one place
- ✅ Easier to maintain

### 4. Mobile-Friendly
- ✅ No modal overlay
- ✅ Natural scrolling
- ✅ Better touch experience

## Conditional Display

### For New Surveys (No questionnaireId)
```
┌────────────────────────────────────────┐
│ 📋 Initialize Survey                   │
├────────────────────────────────────────┤
│ ✅ Barangay: Katipunan                 │
│                                        │
│ [Continue to Survey →]                 │
└────────────────────────────────────────┘
```

### For Callbacks (With questionnaireId)
```
┌────────────────────────────────────────┐
│ 📋 Initialize Survey                   │
├────────────────────────────────────────┤
│ ✅ Barangay: Katipunan                 │
│                                        │
│ Visit #2 - Log the outcome...          │
│                                        │
│ [Visit outcome radio buttons]          │
│ [Callback reason if needed]            │
│ [Notes textarea]                       │
│ [Warning if 3rd attempt]               │
│                                        │
│ [Log Visit & Continue →]               │
└────────────────────────────────────────┘
```

## Validation

### Required Fields
- **Visit Outcome**: Always required for callbacks
- **Callback Reason**: Required only if outcome is "Callback Needed"
- **Notes**: Optional

### Error Messages
```typescript
{errors.outcome && (
  <p className="text-sm text-red-500">Please select a visit outcome</p>
)}

{errors.callbackReason && (
  <p className="text-sm text-red-500">Please select a callback reason</p>
)}
```

### Button States
```typescript
// Disabled while logging or generating
disabled={isGeneratingNumber || isLoggingVisit}

// Dynamic button text
{isLoggingVisit ? 'Logging Visit...' : 
 isGeneratingNumber ? 'Generating Number...' : 
 isCallback ? 'Log Visit & Continue →' : 
 'Continue to Survey →'}
```

## Data Flow

### 1. User Fills Form
```
outcome = "Callback_Needed"
callbackReason = "No one home"
notes = "Gate was locked"
```

### 2. Validation
```
validateVisitForm() → true
```

### 3. Log Visit
```
logVisit() → {
  Get GPS location
  Prepare notes: "Reason: No one home\n\nGate was locked"
  Save to IndexedDB
  Save to API
}
```

### 4. Continue
```
Generate questionnaire number (if needed)
Navigate to Respondent Selection
```

## Files Modified

1. ✅ `src/app/survey/forms/sections/survey-initialization.tsx`
   - Removed VisitStatusButton import
   - Added UI component imports (Label, Textarea, RadioGroup, Select)
   - Added form state management
   - Added validation function
   - Added visit logging function
   - Inlined visit status fields
   - Enhanced handleNext function

## Testing Checklist

- [ ] New survey: No visit fields shown
- [ ] Callback survey: Visit fields shown
- [ ] Visit number displays correctly
- [ ] Radio buttons work
- [ ] Callback reason shows when "Callback Needed" selected
- [ ] Callback reason hides for other outcomes
- [ ] Notes textarea works
- [ ] Warning shows for 3rd attempt
- [ ] Validation works (required fields)
- [ ] Error messages display
- [ ] Button text changes based on state
- [ ] Button disabled while logging
- [ ] Visit logged to IndexedDB
- [ ] Visit logged to API
- [ ] GPS location captured
- [ ] Continues to next section after logging

## Future Enhancements

1. **Auto-save**: Save form state as user types
2. **GPS Indicator**: Show GPS capture status
3. **Visit History**: Show previous visits inline
4. **Quick Actions**: Pre-fill common scenarios
5. **Offline Support**: Queue visits when offline
