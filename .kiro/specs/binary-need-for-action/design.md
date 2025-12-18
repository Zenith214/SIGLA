# Design Document

## Overview

This design document outlines the implementation of a two-part "Need for Action" component for the PULSE survey system. The feature introduces a binary yes/no question that controls the validation of an existing open-ended suggestion field across all service indicators. This change affects the survey form UI, data storage schema, analytics calculation logic, and mock data generation.

The implementation follows a conditional validation pattern where:
1. A binary question asks if improvement is needed (required)
2. The suggestion field becomes conditionally required based on the binary answer
3. Both responses are stored and used for analytics
4. The NFA Rate calculation uses only the binary response

## Architecture

### System Components

The implementation spans four major components:

1. **Survey Form Component** - React/TypeScript PWA interface
2. **Data Storage Layer** - PostgreSQL database with JSONB fields
3. **Analytics API** - Backend calculation engine
4. **Mock Data Generator** - Synthetic data generation tool

### Data Flow

```
Survey Form (UI)
    ↓
Binary Question Answer → Validation Logic → Suggestion Field
    ↓
Survey Submission
    ↓
Database Storage (JSONB structure)
    ↓
Analytics API Query
    ↓
NFA Rate Calculation (Binary responses only)
```

## Components and Interfaces

### 1. Survey Form Component

**Location**: Survey form components (to be identified in codebase)

**Interface Changes**:

```typescript
interface ServiceIndicatorQuestion {
  id: string;
  type: 'radio' | 'text' | 'textarea';
  questionText: string;
  options?: string[];
  required: boolean | ((formData: any) => boolean); // Support conditional requirement
  dependsOn?: string; // Field ID this question depends on
}

interface NeedForActionBinaryQuestion extends ServiceIndicatorQuestion {
  id: `${string}_nfa_binary`;
  type: 'radio';
  options: ['Yes', 'No'];
  required: true;
}

interface NeedForActionSuggestionQuestion extends ServiceIndicatorQuestion {
  id: `${string}_nfa_suggestion`;
  type: 'textarea';
  required: (formData: any) => boolean; // Conditional based on binary answer
  dependsOn: `${string}_nfa_binary`;
}
```

**Validation Logic**:

```typescript
function validateSuggestionField(
  binaryAnswer: 'Yes' | 'No',
  suggestionText: string
): ValidationResult {
  if (binaryAnswer === 'Yes' && !suggestionText.trim()) {
    return {
      valid: false,
      error: 'Please provide specific comments or suggestions for improvement'
    };
  }
  return { valid: true };
}
```

### 2. Data Storage Schema

**Table**: `survey_section`

**JSONB Structure** (per service indicator):

```typescript
interface ServiceIndicatorData {
  satisfaction_rating?: number; // 1-5 scale
  need_for_action_binary: 'Yes' | 'No'; // NEW: Binary decision
  need_for_action_suggestion: string | null; // MODIFIED: Now explicitly paired with binary
}

// Example for Financial Administration section
interface FinancialSectionData {
  // Projects subsection
  awarenessProjects?: 'Oo' | 'Hindi';
  benefitedProjects?: 'Oo' | 'Hindi';
  satisfactionProjects?: string; // '1' to '5'
  need_for_action_binary_projects: 'Oo' | 'Hindi'; // NEW
  need_for_action_suggestion_projects: string | null; // RENAMED from suggestionsProjects
  
  // Financial Transparency subsection
  awarenessFinancial?: 'Oo' | 'Hindi';
  usedFinancialInfo?: 'Oo' | 'Hindi';
  satisfactionFinancial?: string;
  need_for_action_binary_financial: 'Oo' | 'Hindi'; // NEW
  need_for_action_suggestion_financial: string | null; // RENAMED from suggestionsFinancial
  
  // ... similar pattern for other subsections
}
```

**Migration Strategy**:

Existing data will need field renaming:
- `suggestionsProjects` → `need_for_action_suggestion_projects`
- `suggestionsFinancial` → `need_for_action_suggestion_financial`
- etc.

New fields will be added:
- `need_for_action_binary_projects`
- `need_for_action_binary_financial`
- etc.

### 3. Analytics API

**Endpoint**: `/api/survey-analytics`

**Calculation Interface**:

```typescript
interface NFACalculationInput {
  serviceIndicator: string;
  cycleId?: number;
  barangayId?: number;
}

interface NFACalculationResult {
  totalResponses: number;
  yesCount: number;
  noCount: number;
  nfaRate: number; // Percentage (0-100)
}

function calculateNFARate(input: NFACalculationInput): NFACalculationResult {
  // Query all responses for the service indicator
  // Count where need_for_action_binary = 'Yes'
  // Calculate percentage
  
  const yesCount = countBinaryYes(input);
  const totalResponses = countTotalResponses(input);
  const nfaRate = totalResponses > 0 
    ? (yesCount / totalResponses) * 100 
    : 0;
    
  return {
    totalResponses,
    yesCount,
    noCount: totalResponses - yesCount,
    nfaRate
  };
}
```

**SQL Query Pattern**:

```sql
-- Example for Financial Administration - Projects
SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') = 'Oo'
  ) as yes_count
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = $1
  AND barangay_id = $2;
```

### 4. Mock Data Generator

**Location**: `src/app/api/tools/generate-mock-survey-data/route.ts`

**Generation Logic**:

```typescript
interface MockDataGenerationConfig {
  needActionScore: number; // 0-1 probability
}

function generateNeedForActionData(
  config: MockDataGenerationConfig
): { binary: string; suggestion: string | null } {
  // Step 1: Determine binary answer based on needActionScore
  const binary = Math.random() < config.needActionScore ? 'Yes' : 'No';
  
  // Step 2: Generate suggestion conditionally
  let suggestion: string | null = null;
  
  if (binary === 'Yes') {
    // Always generate a suggestion when binary is Yes
    suggestion = generateRealisticSuggestion();
  } else {
    // 10-15% chance of suggestion when binary is No
    if (Math.random() < 0.125) { // 12.5% average
      suggestion = generateNeutralComment();
    }
  }
  
  return { binary, suggestion };
}

function generateRealisticSuggestion(): string {
  // Generate actionable improvement suggestions
  const suggestions = [
    "More frequent service availability needed",
    "Better communication about service schedules",
    "Improve staff training and responsiveness",
    // ... more suggestions
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function generateNeutralComment(): string {
  // Generate neutral/positive comments
  const comments = [
    "Service is generally good",
    "Keep up the current level of service",
    "No major issues to report",
    // ... more neutral comments
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}
```

## Data Models

### Service Indicator Mapping

The system has 6 main service areas with multiple indicators each:

1. **Financial Administration**
   - Projects (`_projects`)
   - Financial Transparency (`_financial`)
   - Social Programs (`_socialPrograms`)
   - Corruption Perception (`_corruption`)

2. **Disaster Preparedness**
   - Disaster Information (`_disasterInfo`)
   - Evacuation Resources (`_evacuation`)

3. **Safety & Peace Order**
   - Barangay Tanods (`_tanods`)
   - Lupon/Dispute Resolution (`_lupon`)
   - Anti-Drug Programs (`_antiDrug`)

4. **Social Protection**
   - Health Services (`_healthServices`)
   - Women & Children Protection (`_womenChildrenProtection`)
   - Community Participation (`_communityParticipation`)

5. **Business Friendliness**
   - Business Clearance (`_businessClearance`)

6. **Environmental Management**
   - Waste Management (`_wasteManagement`)

Each indicator will have:
- `need_for_action_binary_{indicator}`: 'Yes'/'No' or 'Oo'/'Hindi'
- `need_for_action_suggestion_{indicator}`: string | null


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Binary question structure consistency
*For any* service indicator, the binary question should have exactly two options: "Yes" and "No" (or their localized equivalents "Oo" and "Hindi")
**Validates: Requirements 1.2**

### Property 2: Conditional validation - Yes requires suggestion
*For any* service indicator, when the binary answer is "Yes", validation should fail if the suggestion field is empty or contains only whitespace
**Validates: Requirements 1.4**

### Property 3: Conditional validation - No allows empty suggestion
*For any* service indicator, when the binary answer is "No", validation should pass even if the suggestion field is empty
**Validates: Requirements 1.5**

### Property 4: Binary question is always required
*For any* service indicator, attempting to submit without answering the binary question should fail validation
**Validates: Requirements 1.3**

### Property 5: Field naming convention consistency
*For any* service indicator with ID `service_id`, the binary field should be named `need_for_action_binary_{service_id}` and the suggestion field should be named `need_for_action_suggestion_{service_id}`
**Validates: Requirements 2.2, 2.3, 2.4**

### Property 6: Data structure completeness
*For any* stored survey response, each service indicator should contain both `need_for_action_binary` and `need_for_action_suggestion` fields in the JSONB structure
**Validates: Requirements 2.5, 3.3**

### Property 7: NFA Rate calculation accuracy
*For any* set of survey responses for a service indicator, the NFA Rate should equal (count of "Yes" responses / total responses) × 100
**Validates: Requirements 4.1, 4.2, 4.3**

### Property 8: NFA Rate uses only binary field
*For any* NFA Rate calculation, the result should be identical whether suggestion fields are populated or not, as long as binary values are the same
**Validates: Requirements 4.5**

### Property 9: Mock data conditional generation - Yes case
*For any* mock survey response where `need_for_action_binary` is "Yes", the `need_for_action_suggestion` field should contain a non-empty string
**Validates: Requirements 5.2**

### Property 10: Mock data conditional generation - No case probability
*For any* large set of mock survey responses where `need_for_action_binary` is "No", approximately 10-15% should have non-empty `need_for_action_suggestion` values
**Validates: Requirements 5.3**

### Property 11: Dynamic validation updates
*For any* service indicator, changing the binary answer should immediately update the required status of the suggestion field without requiring a page refresh
**Validates: Requirements 6.1, 6.2**

### Property 12: Text preservation during validation changes
*For any* service indicator with text in the suggestion field, changing the binary answer from "Yes" to "No" should preserve the existing text
**Validates: Requirements 6.3** 

## 
Error Handling

### Survey Form Validation Errors

**Scenario 1: Missing Binary Answer**
- **Trigger**: User attempts to proceed without selecting "Yes" or "No"
- **Response**: Display inline error message: "Please indicate whether this service needs improvement"
- **Recovery**: User must select an option to proceed

**Scenario 2: Yes Selected with Empty Suggestion**
- **Trigger**: User selects "Yes" but leaves suggestion field empty or whitespace-only
- **Response**: Display inline error message: "Please provide specific comments or suggestions for improvement"
- **Recovery**: User must enter text in the suggestion field

**Scenario 3: Form State Inconsistency**
- **Trigger**: Binary answer changes after suggestion is entered
- **Response**: Silently update validation rules; preserve entered text
- **Recovery**: Automatic - no user action needed

### Data Storage Errors

**Scenario 4: Missing Required Fields**
- **Trigger**: Survey submission with incomplete NFA data structure
- **Response**: Return 400 Bad Request with detailed field validation errors
- **Recovery**: Client should retry with complete data

**Scenario 5: Invalid Binary Value**
- **Trigger**: Binary field contains value other than "Yes"/"No" or "Oo"/"Hindi"
- **Response**: Return 400 Bad Request: "Invalid binary value for need_for_action"
- **Recovery**: Client should correct the value and resubmit

**Scenario 6: Database Connection Failure**
- **Trigger**: Unable to connect to PostgreSQL during survey submission
- **Response**: Return 503 Service Unavailable with retry-after header
- **Recovery**: Client should implement exponential backoff retry logic

### Analytics API Errors

**Scenario 7: No Data Available**
- **Trigger**: NFA Rate calculation requested for service indicator with zero responses
- **Response**: Return NFA Rate as 0 with metadata indicating zero responses
- **Recovery**: Display "No data available" in UI

**Scenario 8: Malformed JSONB Data**
- **Trigger**: Survey response has corrupted or missing NFA fields in JSONB
- **Response**: Log warning, exclude from calculation, continue processing other responses
- **Recovery**: Return partial results with count of excluded responses

**Scenario 9: Invalid Query Parameters**
- **Trigger**: Analytics API called with invalid service indicator ID
- **Response**: Return 400 Bad Request: "Invalid service indicator"
- **Recovery**: Client should validate service indicator IDs before calling API

### Mock Data Generator Errors

**Scenario 10: Generation Constraint Violation**
- **Trigger**: Mock data generator produces "Yes" with empty suggestion
- **Response**: Log error, regenerate that specific indicator's data
- **Recovery**: Automatic retry with different random seed

**Scenario 11: Probability Distribution Failure**
- **Trigger**: Generated "No" responses have suggestion rate outside 10-15% range
- **Response**: Log warning but continue (acceptable variance for small sample sizes)
- **Recovery**: No action needed for small batches; investigate for large batches

## Testing Strategy

### Unit Testing

**Framework**: Jest with TypeScript support

**Test Coverage Areas**:

1. **Validation Logic Tests**
   - Test `validateSuggestionField()` with all combinations of binary answers and suggestion text
   - Test required field validation for binary question
   - Test conditional validation state changes
   - Test whitespace-only suggestion rejection

2. **Data Structure Tests**
   - Test JSONB structure creation with correct field names
   - Test field naming convention for all service indicators
   - Test data serialization and deserialization

3. **NFA Rate Calculation Tests**
   - Test calculation with various response distributions
   - Test edge case: zero responses
   - Test edge case: all "Yes" responses
   - Test edge case: all "No" responses
   - Test that suggestion field content doesn't affect calculation

4. **Mock Data Generation Tests**
   - Test that "Yes" responses always have suggestions
   - Test that "No" responses have suggestions 10-15% of the time (statistical test with large sample)
   - Test field naming consistency in generated data

**Example Unit Test**:

```typescript
describe('validateSuggestionField', () => {
  it('should fail validation when binary is Yes and suggestion is empty', () => {
    const result = validateSuggestionField('Yes', '');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('provide specific comments');
  });

  it('should pass validation when binary is No and suggestion is empty', () => {
    const result = validateSuggestionField('No', '');
    expect(result.valid).toBe(true);
  });

  it('should pass validation when binary is Yes and suggestion has content', () => {
    const result = validateSuggestionField('Yes', 'Need more training');
    expect(result.valid).toBe(true);
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Property Test Coverage**:

Each property test must be tagged with a comment referencing the design document property:

1. **Property Test 1: Binary question structure**
   - **Tag**: `// Feature: binary-need-for-action, Property 1: Binary question structure consistency`
   - **Test**: Generate random service indicators, verify binary question has exactly 2 options

2. **Property Test 2: Conditional validation - Yes case**
   - **Tag**: `// Feature: binary-need-for-action, Property 2: Conditional validation - Yes requires suggestion`
   - **Test**: Generate random service indicators with "Yes" and empty/whitespace suggestions, verify all fail validation

3. **Property Test 3: Conditional validation - No case**
   - **Tag**: `// Feature: binary-need-for-action, Property 3: Conditional validation - No allows empty suggestion`
   - **Test**: Generate random service indicators with "No" and empty suggestions, verify all pass validation

4. **Property Test 4: Field naming convention**
   - **Tag**: `// Feature: binary-need-for-action, Property 5: Field naming convention consistency`
   - **Test**: Generate random service IDs, verify generated field names follow convention

5. **Property Test 5: NFA Rate calculation**
   - **Tag**: `// Feature: binary-need-for-action, Property 7: NFA Rate calculation accuracy`
   - **Test**: Generate random sets of responses, verify NFA Rate = (Yes count / total) × 100

6. **Property Test 6: NFA Rate independence from suggestions**
   - **Tag**: `// Feature: binary-need-for-action, Property 8: NFA Rate uses only binary field`
   - **Test**: Generate two response sets with same binary values but different suggestions, verify identical NFA Rates

7. **Property Test 7: Mock data Yes case**
   - **Tag**: `// Feature: binary-need-for-action, Property 9: Mock data conditional generation - Yes case`
   - **Test**: Generate many mock responses, verify all "Yes" responses have non-empty suggestions

8. **Property Test 8: Mock data No case probability**
   - **Tag**: `// Feature: binary-need-for-action, Property 10: Mock data conditional generation - No case probability`
   - **Test**: Generate 1000+ mock "No" responses, verify 10-15% have suggestions (with statistical tolerance)

9. **Property Test 9: Text preservation**
   - **Tag**: `// Feature: binary-need-for-action, Property 12: Text preservation during validation changes`
   - **Test**: Generate random service indicators with text, change binary from "Yes" to "No", verify text preserved

**Example Property Test**:

```typescript
import fc from 'fast-check';

// Feature: binary-need-for-action, Property 2: Conditional validation - Yes requires suggestion
describe('Property: Conditional validation - Yes requires suggestion', () => {
  it('should fail validation for any service indicator with Yes and empty suggestion', () => {
    fc.assert(
      fc.property(
        fc.string(), // Random service indicator ID
        fc.constantFrom('', '   ', '\t\n'), // Various empty/whitespace strings
        (serviceId, suggestion) => {
          const result = validateSuggestionField('Yes', suggestion);
          return !result.valid;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: binary-need-for-action, Property 7: NFA Rate calculation accuracy
describe('Property: NFA Rate calculation accuracy', () => {
  it('should calculate NFA Rate as (Yes count / total) * 100 for any response set', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('Yes', 'No'), { minLength: 1, maxLength: 100 }),
        (responses) => {
          const yesCount = responses.filter(r => r === 'Yes').length;
          const expectedRate = (yesCount / responses.length) * 100;
          const actualRate = calculateNFARate({ responses });
          return Math.abs(actualRate - expectedRate) < 0.01; // Allow for floating point precision
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Framework**: Playwright for end-to-end testing

**Test Scenarios**:

1. **Complete Survey Flow**
   - Navigate through all service indicators
   - Test binary question interaction for each
   - Test conditional validation in real form context
   - Submit survey and verify data storage

2. **Analytics Dashboard**
   - Generate mock data with known distribution
   - Verify NFA Rate displays correctly
   - Test filtering by cycle and barangay

3. **Data Migration**
   - Test migration script on sample data
   - Verify field renaming and new field addition
   - Verify data integrity after migration

### Manual Testing Checklist

- [ ] Binary question appears for all 13 service indicators
- [ ] Validation works correctly when changing binary answer
- [ ] Text is preserved when switching from "Yes" to "No"
- [ ] Survey submission stores both binary and suggestion fields
- [ ] Analytics dashboard shows correct NFA Rates
- [ ] Mock data generator produces realistic distributions
- [ ] Localization works correctly (English "Yes"/"No" vs Tagalog "Oo"/"Hindi")
- [ ] Mobile responsive design works on various screen sizes
- [ ] Accessibility: keyboard navigation and screen reader support

## Implementation Notes

### Localization Considerations

The system supports both English and Tagalog:
- English: "Yes" / "No"
- Tagalog: "Oo" / "Hindi"

All validation and calculation logic must handle both language variants equivalently.

### Performance Considerations

1. **Form Validation**: Validation should be debounced to avoid excessive re-renders when user types in suggestion field
2. **Analytics Queries**: JSONB field access should use GIN indexes for optimal performance
3. **Mock Data Generation**: Batch generation should be used for large datasets (>1000 responses)

### Migration Strategy

**Phase 1: Schema Update**
- Add new binary fields to all service indicators
- Rename existing suggestion fields
- Default binary values to "No" for existing data

**Phase 2: Code Deployment**
- Deploy updated survey form with conditional validation
- Deploy updated analytics API
- Deploy updated mock data generator

**Phase 3: Data Backfill**
- Run migration script to populate binary fields for historical data
- Use heuristic: if suggestion exists and is non-empty, set binary to "Yes", otherwise "No"

**Phase 4: Validation**
- Verify NFA Rates are calculated correctly
- Compare old vs new calculation methods for consistency
- Monitor for any data quality issues

### Backward Compatibility

During migration period:
- Analytics API should handle both old and new data formats
- If binary field is missing, fall back to checking if suggestion field is non-empty
- Log warnings for responses using old format to track migration progress
