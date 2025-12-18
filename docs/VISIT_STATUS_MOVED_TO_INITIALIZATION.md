# Visit Status Button Moved to Initialization

## Overview
Moved the Visit Status Button from the Respondent Selection section to the Survey Initialization section for better user experience and logical flow.

## Rationale

### Before (Problems)
- Visit status button was in Respondent Selection section
- Users had to navigate past initialization to log visits
- Initialization section was just a wall of text
- Visit logging felt disconnected from survey start

### After (Benefits)
- Visit status button is now in Initialization section
- Users can log visits immediately when starting/resuming survey
- Initialization section is more interactive
- Better logical flow: Log visit → Generate number → Start survey

## Changes Made

### 1. Survey Initialization (`survey-initialization.tsx`)

#### Added Imports
```typescript
import { useSearchParams } from "next/navigation"
import { VisitStatusButton } from "@/components/survey/VisitStatusButton"
import { getSurveyRecordByQuestionnaire } from "@/lib/indexedDB"
```

#### Added State Management
```typescript
const searchParams = useSearchParams()
const [currentVisitCount, setCurrentVisitCount] = useState(0)

// Get questionnaire context from URL
const questionnaireIdParam = searchParams.get('questionnaireId')
const cycleIdParam = searchParams.get('cycleId')

// Load visit count from IndexedDB
useEffect(() => {
  const loadVisitCount = async () => {
    if (questionnaireIdParam) {
      try {
        const record = await getSurveyRecordByQuestionnaire(questionnaireIdParam)
        if (record) {
          setCurrentVisitCount(record.visits.length)
        }
      } catch (error) {
        console.error('Error loading visit count:', error)
      }
    }
  }
  loadVisitCount()
}, [questionnaireIdParam])
```

#### Added Visit Status Button to UI
```typescript
<div className="space-y-6">
  {/* Visit Status Button - shown only for questionnaire-based surveys */}
  {questionnaireIdParam && (
    <VisitStatusButton
      questionnaireId={questionnaireIdParam}
      cycleId={cycleIdParam ? parseInt(cycleIdParam) : null}
      currentVisitCount={currentVisitCount}
      onVisitLogged={() => {
        // Reload visit count after logging
        if (questionnaireIdParam) {
          getSurveyRecordByQuestionnaire(questionnaireIdParam).then(record => {
            if (record) {
              setCurrentVisitCount(record.visits.length)
            }
          })
        }
      }}
    />
  )}
  
  {/* Rest of initialization content */}
</div>
```

### 2. Respondent Selection (`respondent-selection.tsx`)

#### Removed Imports
```typescript
// REMOVED:
import { VisitStatusButton } from "@/components/survey/VisitStatusButton"
import { useSearchParams } from "next/navigation"
import { getSurveyRecordByQuestionnaire } from "@/lib/indexedDB"
```

#### Removed State Management
```typescript
// REMOVED:
const searchParams = useSearchParams()
const questionnaireIdParam = searchParams.get('questionnaireId')
const cycleIdParam = searchParams.get('cycleId')
const [currentVisitCount, setCurrentVisitCount] = useState(0)

// REMOVED: useEffect for loading visit count
```

#### Removed Visit Status Button from UI
```typescript
// REMOVED:
<VisitStatusButton
  questionnaireId={questionnaireIdParam}
  cycleId={cycleIdParam ? parseInt(cycleIdParam) : null}
  currentVisitCount={currentVisitCount}
  onVisitLogged={...}
/>
```

## User Experience Flow

### New Flow
```
1. Survey Initialization
   ├─ Visit Status Button (if callback)
   ├─ Questionnaire Assignment Info
   ├─ Pre-selected Barangay (if any)
   ├─ Survey Flow Information
   └─ [Continue to Survey →]
   
2. Respondent Selection
   ├─ Survey Number Display
   ├─ GPS Verification (auto-capture)
   ├─ Household Members
   └─ [Select Respondent]
```

### Visit Logging Scenarios

#### Scenario 1: First Visit (New Interview)
```
User arrives at survey
    ↓
Initialization page loads
    ↓
No visit button shown (new interview)
    ↓
Click "Continue to Survey"
    ↓
Proceed to Respondent Selection
```

#### Scenario 2: Callback Visit (Resuming Interview)
```
User arrives at survey with questionnaireId in URL
    ↓
Initialization page loads
    ↓
Visit Status Button appears
    ↓
User clicks "Log Visit Status"
    ↓
Selects outcome (e.g., "Respondent Not Home")
    ↓
Visit logged to IndexedDB
    ↓
Visit count increments
    ↓
User can continue or exit
```

#### Scenario 3: Multiple Callbacks
```
User returns for 3rd visit
    ↓
Initialization page shows "Visit 3"
    ↓
User logs visit status
    ↓
Continues with interview
    ↓
All visits tracked in IndexedDB
```

## Benefits

### 1. Better User Experience
- ✅ Visit logging happens at the start
- ✅ More intuitive flow
- ✅ Less navigation required
- ✅ Initialization section is more interactive

### 2. Logical Flow
- ✅ Log visit → Generate number → Start survey
- ✅ Visit context established early
- ✅ Clear separation of concerns

### 3. Cleaner Code
- ✅ Respondent selection is simpler
- ✅ Visit logic centralized in initialization
- ✅ Fewer props to pass around

### 4. Data Quality
- ✅ Visits logged before survey starts
- ✅ Better tracking of callback attempts
- ✅ Clear audit trail

## UI Comparison

### Before (Respondent Selection)
```
┌────────────────────────────────────────┐
│ Respondent Selection (Kish Grid)      │
├────────────────────────────────────────┤
│ [Log Visit Status] ← Felt out of place│
│                                        │
│ Survey Number: 2026-001-1              │
│ GPS Verification                       │
│ Household Members                      │
└────────────────────────────────────────┘
```

### After (Initialization)
```
┌────────────────────────────────────────┐
│ Initialize Survey                      │
├────────────────────────────────────────┤
│ [Log Visit Status] ← Makes sense here │
│                                        │
│ Questionnaire Assignment               │
│ Survey Flow Information                │
│ [Continue to Survey →]                 │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Respondent Selection (Kish Grid)      │
├────────────────────────────────────────┤
│ Survey Number: 2026-001-1              │
│ GPS Verification                       │
│ Household Members                      │
└────────────────────────────────────────┘
```

## Files Modified

1. ✅ `src/app/survey/forms/sections/survey-initialization.tsx`
   - Added visit status button
   - Added state management for visit tracking
   - Added questionnaire context from URL

2. ✅ `src/app/survey/forms/sections/respondent-selection.tsx`
   - Removed visit status button
   - Removed visit tracking state
   - Simplified component

## Testing Checklist

- [ ] Visit button appears in initialization for callback surveys
- [ ] Visit button does NOT appear for new surveys
- [ ] Visit count displays correctly
- [ ] Logging visit updates count
- [ ] Visit button removed from respondent selection
- [ ] Respondent selection still works normally
- [ ] GPS auto-capture still works
- [ ] Survey flow is unaffected

## Migration Notes

**No data migration needed** - This is purely a UI reorganization. All existing functionality remains the same, just moved to a different section.

## Future Enhancements

1. **Visit History Display**: Show list of previous visits in initialization
2. **Visit Reminders**: Suggest optimal callback times
3. **Visit Analytics**: Show success rates for different visit times
4. **Quick Actions**: Pre-fill common visit outcomes
