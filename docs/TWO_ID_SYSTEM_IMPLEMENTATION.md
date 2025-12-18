# Two-ID System Implementation Plan

## Overview
Implement a dual-ID system where:
- **Backend/Database**: Uses hierarchical `full_id` (e.g., `2025-10-02-003`)
- **Frontend/User**: Shows simple `display_id` (e.g., `6`)

## ID Calculation Formula
```javascript
display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number

Examples:
- Spot 1, Q1: ((1-1) * 5) + 1 = 1
- Spot 1, Q5: ((1-1) * 5) + 5 = 5
- Spot 2, Q1: ((2-1) * 5) + 1 = 6
- Spot 2, Q3: ((2-1) * 5) + 3 = 8
- Spot 30, Q5: ((30-1) * 5) + 5 = 150
```

## Parsing Full ID
```javascript
// Format: YYYY-BB-SS-QQQ
const parts = full_id.split('-')
const year = parts[0]
const barangay_id = parts[1]
const spot_number = parseInt(parts[2])
const questionnaire_number = parseInt(parts[3])
```

## Implementation Checklist

### Phase 1: Backend API Updates
- [ ] Update `GET /api/fi/my-interviews` - Add display_id calculation
- [ ] Update `GET /api/spots` - Add display_id to questionnaires
- [ ] Update `GET /api/questionnaires` - Add display_id calculation
- [ ] Create utility function `calculateDisplayId(full_id)`

### Phase 2: Frontend Display Updates
- [ ] FI Dashboard - Show "Interview #6" instead of "2025-10-02-003"
- [ ] Survey Form Header - Show "Interview #6"
- [ ] Spot Assignment Panel - Show display_id
- [ ] Questionnaire Assignment Modal - Show display_id

### Phase 3: Internal Logic (Keep full_id)
- [ ] URL parameters - Continue using full_id
- [ ] API calls - Continue using full_id
- [ ] IndexedDB keys - Continue using full_id
- [ ] Database primary keys - Continue using full_id

### Phase 4: CSIS Algorithms
- [ ] Kish Grid - Use display_id as questionnaireNumber
- [ ] Service Area Randomization - Use display_id as questionnaireNumber
- [ ] Update `getSectionOrder()` function
- [ ] Update `getKishGridSelection()` function

## Files to Modify

### Backend
1. `src/app/api/fi/my-interviews/route.ts`
2. `src/app/api/spots/route.ts`
3. `src/utils/questionnaireUtils.ts` (new utility file)

### Frontend Components
1. `src/components/fi-dashboard/InterviewSlotCard.tsx`
2. `src/app/survey/forms/sections/header.tsx`
3. `src/components/fs-dashboard/QuestionnaireAssignmentModal.tsx`
4. `src/components/fs-dashboard/SpotAssignmentPanel.tsx`

### CSIS Logic
1. `src/app/survey/forms/utils/sectionAssignment.ts`
2. `src/app/survey/forms/utils/kishGrid.ts`

## Testing Strategy
1. Create 3 spots (15 questionnaires)
2. Verify display_ids are 1-15
3. Click "Interview #6" → URL has full_id `2025-10-02-001`
4. Verify Kish Grid uses display_id (6)
5. Verify section randomization uses display_id (6)
6. Submit survey → Database has full_id as primary key

## Rollback Plan
If issues arise, the full_id is still the source of truth in the database. We can revert frontend changes without data loss.
