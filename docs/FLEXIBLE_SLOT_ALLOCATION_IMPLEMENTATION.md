# Flexible Slot Allocation - Implementation Summary

## Overview
Implementing a flexible slot allocation system where Field Supervisors can:
1. Specify the number of questionnaires when creating a spot (instead of fixed 5)
2. Assign specific numbers of questionnaires to different interviewers
3. Track slot allocation and availability

## Changes Implemented

### ✅ Phase 1: Variable Questionnaire Count per Spot

#### 1. UI Changes - Spot Creation Modal
**File:** `src/components/fs-dashboard/SpotCreationModal.tsx`

**Added:**
- New form field: `numberOfQuestionnaires` (default: 5, range: 1-50)
- Validation for questionnaire count
- Dynamic success message showing actual count
- Help text explaining the field purpose

**Changes:**
- Form state includes `numberOfQuestionnaires`
- Validation checks 1-50 range
- API call includes `numberOfQuestionnaires` parameter
- Success toast shows dynamic count

#### 2. API Changes - Spot Creation
**File:** `src/app/api/spots/route.ts`

**Added:**
- Accept `numberOfQuestionnaires` from request body (default: 5)
- Validation: must be between 1 and 50
- Dynamic loop to create N questionnaires instead of hardcoded 5
- Dynamic success message

**Changes:**
```typescript
// OLD: Always 5
for (let sequence = 1; sequence <= 5; sequence++) { ... }

// NEW: Variable count
const numberOfQuestionnaires = body.numberOfQuestionnaires || 5;
for (let sequence = 1; sequence <= numberOfQuestionnaires; sequence++) { ... }
```

### 🔄 Phase 2: Individual Questionnaire Assignment (Next Steps)

#### Current System:
- Entire spot assigned to one interviewer
- All questionnaires in a spot go to the same person

#### Proposed System:
- Individual questionnaires can be assigned to different interviewers
- Field Supervisor can allocate: 10 to Interviewer A, 7 to Interviewer B, etc.

#### Required Changes:

**1. Database Schema Update**
```sql
-- Add interviewer assignment to questionnaires table
ALTER TABLE questionnaires 
ADD COLUMN assigned_interviewer_id INTEGER REFERENCES "user"(id);

-- Add index for performance
CREATE INDEX idx_questionnaires_assigned_interviewer 
ON questionnaires(assigned_interviewer_id);
```

**2. New API Endpoint: Assign Questionnaires**
**File:** `src/app/api/questionnaires/assign/route.ts` (NEW)

```typescript
POST /api/questionnaires/assign
Body: {
  questionnaireIds: string[],  // Array of questionnaire IDs
  interviewerId: number
}
```

**3. UI Component: Questionnaire Assignment Modal**
**File:** `src/components/fs-dashboard/QuestionnaireAssignmentModal.tsx` (NEW)

Features:
- Show all questionnaires in a spot
- Show which are assigned/unassigned
- Allow selecting multiple questionnaires
- Assign selected questionnaires to an interviewer
- Show allocation summary (e.g., "10/20 assigned")

**4. Update Spot Assignment Panel**
**File:** `src/components/fs-dashboard/SpotAssignmentPanel.tsx`

Add:
- "Manage Assignments" button for each spot
- Shows: "15/20 questionnaires assigned"
- Opens QuestionnaireAssignmentModal
- Color coding: Green (all assigned), Yellow (partial), Gray (none)

## Usage Examples

### Example 1: Small Rural Area
```
Create Spot:
- Name: "Purok 1 Mountain"
- Barangay: Balasinon
- Questionnaires: 5
- Result: Creates 2024-001-001 through 2024-001-005

Assign:
- All 5 → Interviewer Juan
```

### Example 2: Large Urban Area with Multiple Interviewers
```
Create Spot:
- Name: "Poblacion Center"
- Barangay: Poblacion
- Questionnaires: 20
- Result: Creates 2024-002-001 through 2024-002-020

Assign:
- 10 questionnaires (001-010) → Interviewer Maria
- 7 questionnaires (011-017) → Interviewer Juan
- 3 questionnaires (018-020) → Interviewer Pedro
```

### Example 3: Flexible Workload Distribution
```
Create Spot:
- Name: "Sitio Riverside"
- Barangay: Kiblawan
- Questionnaires: 15
- Result: Creates 2024-003-001 through 2024-003-015

Assign:
- 8 questionnaires → Senior Interviewer (experienced)
- 5 questionnaires → Junior Interviewer 1
- 2 questionnaires → Junior Interviewer 2 (training)
```

## Benefits

### 1. Flexibility
- Match spot size to actual area coverage needs
- No more wasted questionnaire IDs
- No need to create multiple small spots

### 2. Better Workload Management
- Distribute work based on interviewer capacity
- Senior interviewers can handle more
- New interviewers can start with fewer

### 3. Realistic Planning
- 8 households in area? Create 8 questionnaires
- 25 households? Create 25 questionnaires
- No artificial constraints

### 4. Efficient Resource Allocation
- Multiple interviewers can work same spot
- Parallel data collection
- Faster completion times

## Current Status

✅ **Completed:**
- Variable questionnaire count per spot (1-50)
- UI field for specifying count
- API validation and creation
- Dynamic success messages

⏳ **Pending (Phase 2):**
- Database schema update for individual assignments
- Questionnaire assignment API
- Assignment management UI
- Allocation tracking and reporting

## Migration Notes

### Backward Compatibility
- Default value is 5 (maintains current behavior)
- Existing spots continue to work
- No breaking changes to existing functionality

### Testing Checklist
- [ ] Create spot with 1 questionnaire
- [ ] Create spot with 5 questionnaires (default)
- [ ] Create spot with 50 questionnaires (max)
- [ ] Validate error for 0 questionnaires
- [ ] Validate error for 51+ questionnaires
- [ ] Verify questionnaire IDs are sequential
- [ ] Check success messages show correct count

## Future Enhancements

1. **Bulk Assignment**
   - Assign multiple spots at once
   - Auto-distribute questionnaires evenly

2. **Workload Analytics**
   - Show interviewer capacity
   - Suggest optimal distribution
   - Track completion rates per interviewer

3. **Reassignment**
   - Move questionnaires between interviewers
   - Handle interviewer unavailability
   - Rebalance workload

4. **Quota Management**
   - Set max questionnaires per interviewer
   - Prevent overallocation
   - Track daily/weekly limits
