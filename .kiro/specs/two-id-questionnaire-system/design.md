# Design Document: Two-ID Questionnaire System

## Overview

The Two-ID Questionnaire System implements a dual-identifier architecture that balances user experience with data integrity. The system maintains the hierarchical `full_id` (format: YYYY-BB-SS-QQQ) as the authoritative database identifier while presenting users with a simplified, sequential `display_id` (1-150) throughout the user interface.

This design ensures:
- **User Experience**: Field interviewers see simple, memorable numbers (1-150)
- **Data Integrity**: All backend operations use the hierarchical full_id as the primary key
- **Methodological Compliance**: CSIS algorithms receive the display_id as input for proper randomization
- **Consistency**: The display_id is calculated deterministically from the full_id using a pure function

The system bridges the gap between human-friendly identifiers and machine-optimized data structures without compromising either concern.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (PWA)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  UI Components (Display display_id to users)           │ │
│  │  - Assignment List: "Interview #6"                     │ │
│  │  - Survey Header: "Interview #6"                       │ │
│  │  - Spot Panels: "Interview #6"                         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Internal Logic (Use full_id for operations)           │ │
│  │  - API Calls: /api/questionnaires/2025-10-02-001      │ │
│  │  - URL Params: ?questionnaireId=2025-10-02-001        │ │
│  │  - IndexedDB Keys: "2025-10-02-001"                    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  CSIS Algorithms (Use display_id for calculations)     │ │
│  │  - Kish Grid: selectRespondent(displayId=6)           │ │
│  │  - Section Order: getSectionOrder(displayId=6)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ API Response: { full_id, display_id }
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  GET /api/assignments                                   │ │
│  │  - Fetch questionnaires by full_id                     │ │
│  │  - Calculate display_id dynamically                    │ │
│  │  - Return both identifiers                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Utility: calculateDisplayId(full_id)                  │ │
│  │  - Parse YYYY-BB-SS-QQQ format                         │ │
│  │  - Extract spot_number (SS) and questionnaire (QQQ)    │ │
│  │  - Apply formula: ((SS-1) * 5) + QQQ                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ Query by full_id
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  questionnaires table                                   │ │
│  │  - PRIMARY KEY: questionnaire_id (full_id)             │ │
│  │  - NO display_id column (calculated on-demand)         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  survey_response table                                  │ │
│  │  - FOREIGN KEY: questionnaire_id (full_id)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Questionnaire Creation**: System generates full_id (YYYY-BB-SS-QQQ) and stores in database
2. **API Request**: Frontend requests assignments via GET /api/assignments
3. **Display ID Calculation**: Backend parses full_id and calculates display_id dynamically
4. **API Response**: Backend returns both full_id and display_id
5. **UI Rendering**: Frontend displays display_id to users ("Interview #6")
6. **User Interaction**: User clicks on interview, URL contains full_id parameter
7. **CSIS Execution**: Algorithms receive display_id for Kish Grid and section randomization
8. **Data Operations**: All database queries, API calls, and storage use full_id

## Components and Interfaces

### Backend Components

#### 1. Display ID Calculation Utility

**Location**: `src/utils/displayIdCalculator.ts`

**Purpose**: Centralized utility for calculating display_id from full_id

**Interface**:
```typescript
/**
 * Calculate display_id from full_id
 * Formula: display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number
 * 
 * @param full_id - Hierarchical questionnaire ID (YYYY-BB-SS-QQQ)
 * @returns display_id (1-150) or null if invalid
 */
export function calculateDisplayId(full_id: string): number | null;

/**
 * Parse full_id into components
 * @param full_id - Hierarchical questionnaire ID
 * @returns Parsed components or null if invalid
 */
export interface ParsedFullId {
  year: number;
  barangay_id: number;
  spot_number: number;
  questionnaire_number: number;
}

export function parseFullId(full_id: string): ParsedFullId | null;
```

**Implementation Details**:
- Reuses existing `parseQuestionnaireId()` from `src/utils/questionnaireIdParser.ts`
- Validates full_id format before calculation
- Returns null for invalid inputs (graceful degradation)
- Pure function with no side effects

#### 2. API Endpoint Updates

**Endpoint**: `GET /api/assignments`

**Current Behavior**: Returns questionnaires with full_id only

**New Behavior**: Returns questionnaires with both full_id and display_id

**Response Schema**:
```typescript
interface QuestionnaireAssignment {
  questionnaire_id: string;      // full_id (e.g., "2025-10-02-001")
  display_id: number;             // calculated (e.g., 6)
  spot_id: string;
  cycle_id: number;
  status: string;
  assigned_fi_id: number | null;
  // ... other fields
}
```

**Implementation**:
```typescript
// Pseudo-code
async function GET_assignments(request) {
  // 1. Fetch questionnaires from database
  const questionnaires = await db.query('SELECT * FROM questionnaires WHERE ...');
  
  // 2. Augment each questionnaire with display_id
  const augmented = questionnaires.map(q => ({
    ...q,
    display_id: calculateDisplayId(q.questionnaire_id)
  }));
  
  // 3. Return augmented data
  return Response.json(augmented);
}
```

**Other Endpoints to Update**:
- `GET /api/spots` - Add display_id to nested questionnaires
- `GET /api/questionnaires` - Add display_id to individual questionnaire responses
- `GET /api/fi/my-interviews` - Add display_id to FI assignment list

### Frontend Components

#### 1. Assignment Display Components

**Components to Update**:
- `src/components/fi-dashboard/InterviewSlotCard.tsx`
- `src/components/fs-dashboard/SpotAssignmentPanel.tsx`
- `src/components/fs-dashboard/QuestionnaireAssignmentModal.tsx`

**Changes**:
```typescript
// Before
<div>Questionnaire: {questionnaire.questionnaire_id}</div>

// After
<div>Interview #{questionnaire.display_id}</div>
```

**Internal Logic** (unchanged):
```typescript
// URL navigation still uses full_id
router.push(`/survey/forms?questionnaireId=${questionnaire.questionnaire_id}`);

// IndexedDB still uses full_id
await db.questionnaires.put({ id: questionnaire.questionnaire_id, ... });
```

#### 2. Survey Form Header

**Component**: `src/app/survey/forms/sections/header.tsx`

**Changes**:
```typescript
// Before
<h1>Survey: {questionnaireId}</h1>

// After
<h1>Interview #{displayId}</h1>
```

**Data Flow**:
1. Component receives `questionnaireId` (full_id) from URL params
2. Component fetches questionnaire data from API or IndexedDB
3. API/IndexedDB response includes `display_id`
4. Component displays `display_id` to user

#### 3. CSIS Algorithm Integration

**Files to Update**:
- `src/app/survey/forms/utils/kishGrid.ts` (already accepts number)
- `src/app/survey/forms/utils/sectionAssignment.ts` (already accepts number)

**Changes**:
```typescript
// Before (using parsed questionnaire_number from full_id)
const parsed = parseQuestionnaireId(questionnaireId);
const kishResult = selectRespondentKishGrid(parsed.questionnaireNumber, members);
const sectionOrder = getSectionOrder(parsed.questionnaireNumber);

// After (using display_id)
const kishResult = selectRespondentKishGrid(displayId, members);
const sectionOrder = getSectionOrder(displayId);
```

**Rationale**: The CSIS algorithms expect a sequential number (1-150) for proper randomization. The display_id provides this, while the questionnaire_number component of full_id may not be sequential across spots.

## Data Models

### Database Schema (No Changes)

The database schema remains unchanged. The display_id is NOT stored as a column.

**questionnaires table**:
```sql
CREATE TABLE questionnaires (
  questionnaire_id VARCHAR(20) PRIMARY KEY,  -- full_id (YYYY-BB-SS-QQQ)
  spot_id VARCHAR(20) NOT NULL,
  cycle_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  assigned_fi_id INTEGER,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id),
  FOREIGN KEY (cycle_id) REFERENCES survey_cycles(cycle_id)
);
```

### API Response Models

**QuestionnaireWithDisplayId**:
```typescript
interface QuestionnaireWithDisplayId {
  // Database fields
  questionnaire_id: string;      // full_id
  spot_id: string;
  cycle_id: number;
  status: string;
  assigned_fi_id: number | null;
  visit_count: number;
  created_at: string;
  updated_at: string;
  
  // Calculated field
  display_id: number;             // 1-150
}
```

### IndexedDB Schema (No Changes)

IndexedDB continues to use full_id as the primary key:

```typescript
const db = await openDB('pulse-survey', 1, {
  upgrade(db) {
    // Questionnaires store
    const questionnaireStore = db.createObjectStore('questionnaires', {
      keyPath: 'questionnaire_id'  // full_id
    });
    
    // Survey responses store
    const responseStore = db.createObjectStore('survey_responses', {
      keyPath: 'response_id',
      autoIncrement: true
    });
    responseStore.createIndex('questionnaire_id', 'questionnaire_id');  // full_id
  }
});
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Display ID Formula Correctness
*For any* valid full_id in format YYYY-BB-SS-QQQ, the calculated display_id should equal ((spot_number - 1) * 5) + questionnaire_within_spot_number
**Validates: Requirements 3.1, 3.3**

### Property 2: Display ID Determinism
*For any* valid full_id, calculating the display_id multiple times should always return the same value regardless of when, where, or how many times it is calculated
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 3: UI Display Consistency
*For any* user-facing component rendering a questionnaire, the displayed text should contain the display_id and should not contain the full_id
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 4: Internal Operations Use Full ID
*For any* internal operation (API calls, database queries, IndexedDB operations, URL parameters), the system should use full_id as the identifier
**Validates: Requirements 1.5, 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 5: API Response Completeness
*For any* API endpoint returning questionnaire data, the response should include both full_id and display_id fields
**Validates: Requirements 3.2**

### Property 6: Database Foreign Key Integrity
*For any* survey response or related record, the foreign key reference should use full_id to link to the questionnaire
**Validates: Requirements 2.2, 2.3**

### Property 7: Sync Operation Identifier
*For any* data synchronization operation between offline and online storage, the matching logic should use full_id as the unique identifier
**Validates: Requirements 2.5**

### Property 8: CSIS Algorithm Input
*For any* call to Kish Grid or Service Area Order Randomization algorithms, the questionnaireNumber parameter should be the display_id, not the full_id
**Validates: Requirements 5.1, 5.2, 5.5**

### Property 9: Error Handling Graceful Degradation
*For any* invalid full_id input to calculateDisplayId(), the function should return null or throw a descriptive error without crashing
**Validates: Requirements 7.3**

### Property 10: Creation Order Independence
*For any* set of questionnaires created in random order, the display_id for each should reflect its spot_number and questionnaire_number from the full_id, not the creation sequence
**Validates: Requirements 6.5**

### Property 11: Full ID Parsing Correctness
*For any* valid full_id in format YYYY-BB-SS-QQQ, parsing should correctly extract year, barangay_id, spot_number, and questionnaire_number as integers
**Validates: Requirements 3.3**

## Error Handling

### Error Scenarios and Handling Strategies

#### 1. Invalid Full ID Format

**Scenario**: calculateDisplayId() receives malformed input

**Examples**:
- Missing components: "2025-10-02"
- Invalid format: "2025/10/02/001"
- Non-numeric components: "2025-10-AA-001"
- Empty or null input

**Handling**:
```typescript
function calculateDisplayId(full_id: string): number | null {
  // Validate input
  if (!full_id || typeof full_id !== 'string') {
    console.warn('Invalid full_id: null or non-string');
    return null;
  }
  
  // Parse using existing utility
  const parsed = parseQuestionnaireId(full_id);
  
  if (!parsed.isValid) {
    console.warn(`Invalid full_id format: ${full_id}`);
    return null;
  }
  
  // Calculate display_id
  return ((parsed.spotNumber - 1) * 5) + parsed.questionnaireNumber;
}
```

**UI Behavior**: If display_id is null, fall back to showing full_id with a warning indicator

#### 2. Display ID Out of Expected Range

**Scenario**: Calculated display_id is outside 1-150 range

**Causes**:
- Spot number > 30
- Questionnaire number > 5
- Spot number = 0 (on-the-fly questionnaires)

**Handling**:
```typescript
function calculateDisplayId(full_id: string): number | null {
  const parsed = parseQuestionnaireId(full_id);
  
  if (!parsed.isValid) {
    return null;
  }
  
  // Handle on-the-fly questionnaires (spot_number = 0)
  if (parsed.spotNumber === 0) {
    console.info(`On-the-fly questionnaire detected: ${full_id}`);
    return null; // No display_id for on-the-fly
  }
  
  const display_id = ((parsed.spotNumber - 1) * 5) + parsed.questionnaireNumber;
  
  // Validate range
  if (display_id < 1 || display_id > 150) {
    console.warn(`Display ID out of range: ${display_id} for ${full_id}`);
    // Still return the calculated value for debugging
    return display_id;
  }
  
  return display_id;
}
```

**UI Behavior**: Display the calculated display_id even if out of range, but log a warning

#### 3. API Response Missing Display ID

**Scenario**: API returns questionnaire without display_id field

**Causes**:
- Backend calculation failed
- Old API version
- Network corruption

**Handling**:
```typescript
// Frontend component
function renderQuestionnaire(questionnaire: any) {
  // Calculate display_id on frontend as fallback
  const displayId = questionnaire.display_id ?? 
                    calculateDisplayId(questionnaire.questionnaire_id);
  
  if (displayId === null) {
    // Ultimate fallback: show full_id
    return <div>Questionnaire: {questionnaire.questionnaire_id}</div>;
  }
  
  return <div>Interview #{displayId}</div>;
}
```

#### 4. CSIS Algorithm Receives Invalid Display ID

**Scenario**: Kish Grid or Section Order receives null or out-of-range display_id

**Handling**:
```typescript
// In survey form component
function initializeSurvey(questionnaireId: string) {
  const displayId = calculateDisplayId(questionnaireId);
  
  if (displayId === null || displayId < 1 || displayId > 150) {
    // Fall back to parsing questionnaire_number from full_id
    const parsed = parseQuestionnaireId(questionnaireId);
    
    if (parsed.isValid) {
      console.warn(`Using questionnaire_number ${parsed.questionnaireNumber} for CSIS algorithms`);
      return {
        kishInput: parsed.questionnaireNumber,
        sectionOrderInput: parsed.questionnaireNumber
      };
    }
    
    // Ultimate fallback: use 1
    console.error(`Cannot determine questionnaire number for ${questionnaireId}, using 1`);
    return {
      kishInput: 1,
      sectionOrderInput: 1
    };
  }
  
  return {
    kishInput: displayId,
    sectionOrderInput: displayId
  };
}
```

### Error Logging Strategy

**Backend**:
- Log all display_id calculation failures with full_id context
- Track frequency of invalid full_id formats
- Alert if > 1% of calculations fail

**Frontend**:
- Log display_id calculation failures to console
- Track in analytics if display_id is null
- Show user-friendly fallback (full_id) without error message

## Testing Strategy

### Unit Testing

#### Backend Unit Tests

**File**: `src/utils/__tests__/displayIdCalculator.test.ts`

**Test Cases**:
1. **Valid Full ID Parsing**
   - Test: Parse "2025-10-02-001"
   - Expected: { year: 2025, barangay_id: 10, spot_number: 2, questionnaire_number: 1 }

2. **Display ID Calculation - Boundary Cases**
   - Test: calculateDisplayId("2025-10-01-001")
   - Expected: 1
   - Test: calculateDisplayId("2025-10-30-005")
   - Expected: 150

3. **Display ID Calculation - Mid-Range**
   - Test: calculateDisplayId("2025-10-02-001")
   - Expected: 6
   - Test: calculateDisplayId("2025-10-15-003")
   - Expected: 73

4. **Invalid Input Handling**
   - Test: calculateDisplayId("invalid")
   - Expected: null
   - Test: calculateDisplayId("")
   - Expected: null
   - Test: calculateDisplayId(null)
   - Expected: null

5. **On-the-Fly Questionnaires**
   - Test: calculateDisplayId("2025-10-00-001")
   - Expected: null (spot_number = 0)

#### Frontend Unit Tests

**File**: `src/components/__tests__/questionnaireDisplay.test.tsx`

**Test Cases**:
1. **Display ID Rendering**
   - Test: Render questionnaire with display_id = 6
   - Expected: UI shows "Interview #6"

2. **Full ID in URL**
   - Test: Click on questionnaire
   - Expected: URL contains "questionnaireId=2025-10-02-001"

3. **Fallback to Full ID**
   - Test: Render questionnaire with display_id = null
   - Expected: UI shows full_id

#### CSIS Algorithm Tests

**File**: `src/app/survey/forms/utils/__tests__/csisIntegration.test.ts`

**Test Cases**:
1. **Kish Grid with Display ID**
   - Test: selectRespondentKishGrid(6, members)
   - Expected: Uses column 6 in Kish Grid table

2. **Section Order with Display ID**
   - Test: getSectionOrder(6)
   - Expected: Returns rotated section order based on CSIS_RANDOMIZATION_MAP[6]

### Property-Based Testing

Property-based tests will use **fast-check** library for TypeScript. Each test will run a minimum of 100 iterations.

#### Property Test 1: Display ID Formula Correctness

**File**: `src/utils/__tests__/displayIdCalculator.property.test.ts`

**Test**:
```typescript
import fc from 'fast-check';

test('Property 1: Display ID formula correctness', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2020, max: 2030 }),  // year
      fc.integer({ min: 1, max: 50 }),       // barangay_id
      fc.integer({ min: 1, max: 30 }),       // spot_number
      fc.integer({ min: 1, max: 5 }),        // questionnaire_number
      (year, barangay_id, spot_number, questionnaire_number) => {
        const full_id = formatQuestionnaireId(year, barangay_id, spot_number, questionnaire_number);
        const display_id = calculateDisplayId(full_id);
        const expected = ((spot_number - 1) * 5) + questionnaire_number;
        
        expect(display_id).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});
```
**Feature: two-id-questionnaire-system, Property 1: Display ID Formula Correctness**

#### Property Test 2: Display ID Determinism

**Test**:
```typescript
test('Property 2: Display ID determinism', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2020, max: 2030 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 30 }),
      fc.integer({ min: 1, max: 5 }),
      (year, barangay_id, spot_number, questionnaire_number) => {
        const full_id = formatQuestionnaireId(year, barangay_id, spot_number, questionnaire_number);
        
        // Calculate multiple times
        const result1 = calculateDisplayId(full_id);
        const result2 = calculateDisplayId(full_id);
        const result3 = calculateDisplayId(full_id);
        
        // All should be equal
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      }
    ),
    { numRuns: 100 }
  );
});
```
**Feature: two-id-questionnaire-system, Property 2: Display ID Determinism**

#### Property Test 3: UI Display Consistency

**Test**:
```typescript
test('Property 3: UI displays display_id not full_id', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2020, max: 2030 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 30 }),
      fc.integer({ min: 1, max: 5 }),
      (year, barangay_id, spot_number, questionnaire_number) => {
        const full_id = formatQuestionnaireId(year, barangay_id, spot_number, questionnaire_number);
        const display_id = calculateDisplayId(full_id);
        
        const questionnaire = {
          questionnaire_id: full_id,
          display_id: display_id,
          // ... other fields
        };
        
        // Render component
        const { container } = render(<InterviewSlotCard questionnaire={questionnaire} />);
        const text = container.textContent;
        
        // Should contain display_id
        expect(text).toContain(`#${display_id}`);
        
        // Should NOT contain full_id
        expect(text).not.toContain(full_id);
      }
    ),
    { numRuns: 100 }
  );
});
```
**Feature: two-id-questionnaire-system, Property 3: UI Display Consistency**

#### Property Test 4: Internal Operations Use Full ID

**Test**:
```typescript
test('Property 4: Internal operations use full_id', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2020, max: 2030 }),
      fc.integer({ min: 1, max: 50 }),
      fc.integer({ min: 1, max: 30 }),
      fc.integer({ min: 1, max: 5 }),
      (year, barangay_id, spot_number, questionnaire_number) => {
        const full_id = formatQuestionnaireId(year, barangay_id, spot_number, questionnaire_number);
        
        // Test URL construction
        const url = constructSurveyUrl(full_id);
        expect(url).toContain(full_id);
        
        // Test IndexedDB key
        const dbKey = getIndexedDBKey(full_id);
        expect(dbKey).toBe(full_id);
        
        // Test API call URL
        const apiUrl = constructApiUrl(full_id);
        expect(apiUrl).toContain(full_id);
      }
    ),
    { numRuns: 100 }
  );
});
```
**Feature: two-id-questionnaire-system, Property 4: Internal Operations Use Full ID**

#### Property Test 5: Error Handling Graceful Degradation

**Test**:
```typescript
test('Property 9: Error handling graceful degradation', () => {
  fc.assert(
    fc.property(
      fc.string(),  // Any random string
      (invalidInput) => {
        // Should not throw
        expect(() => {
          const result = calculateDisplayId(invalidInput);
          // Result should be null for invalid input
          if (!isValidQuestionnaireId(invalidInput)) {
            expect(result).toBeNull();
          }
        }).not.toThrow();
      }
    ),
    { numRuns: 100 }
  );
});
```
**Feature: two-id-questionnaire-system, Property 9: Error Handling Graceful Degradation**

#### Property Test 6: Creation Order Independence

**Test**:
```typescript
test('Property 10: Creation order independence', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          year: fc.integer({ min: 2020, max: 2030 }),
          barangay_id: fc.integer({ min: 1, max: 50 }),
          spot_number: fc.integer({ min: 1, max: 30 }),
          questionnaire_number: fc.integer({ min: 1, max: 5 })
        }),
        { minLength: 5, maxLength: 15 }
      ),
      (questionnaires) => {
        // Create questionnaires in random order
        const shuffled = [...questionnaires].sort(() => Math.random() - 0.5);
        
        // Calculate display_ids
        const displayIds = shuffled.map(q => {
          const full_id = formatQuestionnaireId(q.year, q.barangay_id, q.spot_number, q.questionnaire_number);
          return {
            full_id,
            display_id: calculateDisplayId(full_id),
            spot_number: q.spot_number,
            questionnaire_number: q.questionnaire_number
          };
        });
        
        // Verify each display_id matches spot/questionnaire, not creation order
        displayIds.forEach(item => {
          const expected = ((item.spot_number - 1) * 5) + item.questionnaire_number;
          expect(item.display_id).toBe(expected);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```
**Feature: two-id-questionnaire-system, Property 10: Creation Order Independence**

### Integration Testing

#### End-to-End Test Scenarios

**Test 1: Complete User Flow**
1. Create 3 spots with 5 questionnaires each (display_ids 1-15)
2. FI views assignment list → sees "Interview #1" through "Interview #15"
3. FI clicks "Interview #6" → URL contains "2025-10-02-001"
4. Survey form header shows "Interview #6"
5. Kish Grid uses display_id=6 for selection
6. Section order uses display_id=6 for randomization
7. Survey submitted → database record has full_id as primary key
8. Offline sync → matches records using full_id

**Test 2: Error Recovery**
1. API returns questionnaire without display_id
2. Frontend calculates display_id as fallback
3. UI still shows "Interview #6"
4. All operations continue normally

**Test 3: Cross-Device Consistency**
1. Create questionnaire on Device A
2. Sync to server
3. View on Device B
4. Verify same display_id shown on both devices

## Performance Considerations

### Display ID Calculation Performance

**Complexity**: O(1) - constant time
- String split: O(1) for fixed format
- Integer parsing: O(1) for fixed-length components
- Arithmetic: O(1)

**Caching Strategy**: Not needed - calculation is fast enough to perform on-demand

### API Response Size Impact

**Additional Data**: +8 bytes per questionnaire (display_id as integer)

**Impact**: Negligible
- 150 questionnaires = 1.2 KB additional data
- Acceptable for mobile networks

### IndexedDB Query Performance

**No Impact**: IndexedDB continues to use full_id as primary key
- No schema changes
- No index changes
- Query performance unchanged

## Migration Strategy

### Phase 1: Backend Implementation (No Breaking Changes)

1. Create `src/utils/displayIdCalculator.ts`
2. Add unit tests for calculation logic
3. Update API endpoints to include display_id in responses
4. Deploy backend changes
5. Verify API responses include both full_id and display_id

**Rollback**: Remove display_id from API responses (frontend still works with full_id)

### Phase 2: Frontend Display Updates (Gradual Rollout)

1. Update one component at a time:
   - Start with InterviewSlotCard
   - Then SpotAssignmentPanel
   - Then Survey Form Header
2. Add fallback logic (if display_id missing, show full_id)
3. Deploy frontend changes
4. Monitor for errors

**Rollback**: Revert component changes (backend still provides display_id for future use)

### Phase 3: CSIS Algorithm Updates (Critical)

1. Update Kish Grid to accept display_id parameter
2. Update Section Order to accept display_id parameter
3. Update survey initialization to pass display_id
4. Thoroughly test with known questionnaire numbers
5. Deploy with feature flag
6. Monitor Kish Grid selections for correctness

**Rollback**: Revert to using parsed questionnaire_number from full_id

### Phase 4: Validation and Monitoring

1. Compare Kish Grid selections before/after (should be different but valid)
2. Verify section order randomization (should be different but valid)
3. Monitor user feedback on display_id usability
4. Track any display_id calculation failures

## Security Considerations

### No Security Impact

The two-ID system does not introduce security vulnerabilities:

1. **Display ID is not secret**: It's derived from public full_id
2. **No authentication bypass**: full_id remains the authoritative identifier
3. **No injection risk**: display_id is always an integer (1-150)
4. **No authorization changes**: Access control still based on full_id

### Validation Requirements

**Backend**:
- Continue validating full_id format in all API endpoints
- Validate display_id is in expected range (1-150) if provided by client
- Never trust client-provided display_id for authorization decisions

**Frontend**:
- Validate display_id is a positive integer before display
- Fall back to full_id if display_id is invalid

## Accessibility Considerations

### Improved Usability

**Benefits**:
- Simpler numbers are easier to read aloud
- Reduced cognitive load for field interviewers
- Easier to reference in verbal communication
- Better for users with dyslexia or reading difficulties

**Screen Reader Support**:
```html
<!-- Before -->
<div>Questionnaire: 2025-10-02-001</div>

<!-- After -->
<div aria-label="Interview number 6">Interview #6</div>
```

### Internationalization

Display ID format is culture-neutral:
- Numbers are universal
- No date/time formatting issues
- No text translation needed

## Future Enhancements

### Potential Improvements

1. **Display ID in QR Codes**: Encode display_id in QR codes for easier scanning
2. **Display ID Search**: Allow FIs to search by display_id in addition to full_id
3. **Display ID in Reports**: Include display_id in exported reports for readability
4. **Display ID Validation**: Add API endpoint to validate display_id ↔ full_id mapping

### Backward Compatibility

If the system needs to support questionnaires without spots (spot_number = 0):
- calculateDisplayId() returns null
- UI falls back to showing full_id
- CSIS algorithms use parsed questionnaire_number from full_id

## Conclusion

The Two-ID Questionnaire System provides a clean separation between user-facing identifiers and internal data structures. By calculating display_id dynamically from full_id, the system maintains data integrity while significantly improving usability for field interviewers. The design ensures methodological compliance with CSIS algorithms while preserving all existing database relationships and query patterns.

