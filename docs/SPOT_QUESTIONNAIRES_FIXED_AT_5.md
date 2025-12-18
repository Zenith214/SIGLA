# Spot Questionnaires Fixed at 5 - Survey Methodology Standard

## Overview
Updated the spot creation process to enforce the survey methodology standard of exactly 5 questionnaires per spot. The number of questionnaires is no longer a user input but a fixed constant.

## Changes Made

### Before
Field Supervisors could manually input the number of questionnaires per spot (1-50 range):
```
┌─────────────────────────────────────┐
│ Number of Questionnaires (1-50) *   │
│ ┌─────────────────────────────────┐ │
│ │ [Input: 1-50]                   │ │
│ └─────────────────────────────────┘ │
│ How many interviews/households      │
│ will be covered in this spot        │
└─────────────────────────────────────┘
```

### After
Fixed at 5 questionnaires per spot with informational display:
```
┌─────────────────────────────────────┐
│ Questionnaires per Spot             │
│ ┌─────────────────────────────────┐ │
│ │  5  questionnaires              │ │
│ │  Fixed at 5 per survey          │ │
│ │  methodology standard           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Implementation Details

### 1. **Constant Value**
```typescript
// Fixed at 5 questionnaires per spot as per survey methodology
const numberOfQuestionnaires = 5;
```

### 2. **Removed User Input**
- Removed the input field for number of questionnaires
- Removed validation for questionnaire count
- Removed state management for this field

### 3. **Added Informational Display**
- Shows the fixed value of 5 in a prominent blue box
- Explains it's fixed per survey methodology standard
- Clear visual indication that this is not editable

### 4. **Updated Form Reset**
- Removed `numberOfQuestionnaires` from form reset logic
- Simplified state management

## Benefits

### 1. **Methodology Compliance**
- Ensures all spots follow the standard 5 questionnaires per spot
- Eliminates human error in spot creation
- Consistent with survey methodology manual

### 2. **Simplified UX**
- One less field for supervisors to fill out
- Reduces cognitive load
- Faster spot creation process

### 3. **Data Consistency**
- All spots have uniform questionnaire counts
- Easier to calculate survey targets
- Predictable data collection patterns

### 4. **Clearer Communication**
- Explicitly states the methodology standard
- Educates users about the fixed requirement
- Reduces confusion about spot sizing

## Survey Methodology Rationale

The 5 questionnaires per spot standard is based on:
- **Statistical sampling requirements**
- **Field interviewer workload optimization**
- **Geographic coverage efficiency**
- **Data quality management**

Each spot represents a manageable unit of work for a field interviewer, with 5 households/interviews being the optimal number for:
- Maintaining data quality
- Completing within a reasonable timeframe
- Ensuring proper geographic distribution

## Impact on Existing Features

### Spot Creation
- Supervisors now only need to specify:
  - Spot name
  - Barangay
  - Starting point (map click)
  - Random start number
- System automatically assigns 5 questionnaires

### Survey Target Calculation
- Survey targets should be divisible by 5 for optimal spot allocation
- Example: Target of 100 responses = 20 spots needed
- Example: Target of 47 responses = 10 spots (50 questionnaires)

### Questionnaire ID Generation
- Each spot generates exactly 5 questionnaire IDs
- Format: YYYY-BB-SS-QQQ (Year-Barangay-Spot-Questionnaire)
- Example: 2024-05-01-001 through 2024-05-01-005

## User Interface Changes

### Form Fields (Before → After)
1. ~~Spot Name~~ → **Spot Name** ✓
2. ~~Barangay~~ → **Barangay** ✓
3. ~~Starting Point~~ → **Starting Point** ✓
4. ~~Number of Questionnaires (1-50)~~ → **Removed** ❌
5. **Questionnaires per Spot** → **Added (Display Only)** ✓
6. ~~Random Start~~ → **Random Start** ✓

### Visual Design
The new questionnaires display uses:
- **Blue color scheme** - Informational, not editable
- **Large number (5)** - Prominent display
- **Explanatory text** - "Fixed at 5 per survey methodology standard"
- **Consistent styling** - Matches other info displays in the form

## Testing Checklist

- [x] Spot creation works with fixed 5 questionnaires
- [x] Form validation passes without questionnaire input
- [x] Success message shows "5 questionnaires"
- [x] Questionnaire IDs generated correctly (5 per spot)
- [x] UI displays the fixed value clearly
- [x] No console errors or warnings
- [x] Form reset works properly
- [x] API receives numberOfQuestionnaires: 5

## Files Modified

**File:** `src/components/fs-dashboard/SpotCreationModal.tsx`

### Changes:
1. Changed `numberOfQuestionnaires` from state to constant
2. Removed input field and validation
3. Added informational display component
4. Updated form submission logic
5. Simplified form reset
6. Updated success message

## Related Documentation

- Survey Methodology Manual (reference for 5 questionnaires standard)
- `docs/SPOT_MANAGEMENT.md` - Spot management overview
- `docs/COMPLETE_SURVEY_WORKFLOW.md` - Full survey workflow

## Future Considerations

### If Methodology Changes
If the survey methodology ever changes to allow different questionnaire counts:

1. Change the constant:
   ```typescript
   const QUESTIONNAIRES_PER_SPOT = 5; // Make this configurable
   ```

2. Consider making it a system setting:
   - Add to Settings → Survey Configuration
   - Store in database
   - Fetch on component mount

3. Update validation and UI accordingly

### Bulk Spot Creation
Consider adding a feature to create multiple spots at once:
- Input: Number of spots needed
- System calculates: spots × 5 = total questionnaires
- Validates against survey target
- Creates all spots in one operation

## Conclusion

The spot creation process now enforces the survey methodology standard of 5 questionnaires per spot. This change improves data consistency, simplifies the user experience, and ensures compliance with survey methodology requirements.
