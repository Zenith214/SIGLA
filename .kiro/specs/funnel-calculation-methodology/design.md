# Design Document: Funnel Calculation Methodology

## Overview

This design addresses a critical flaw in the current analytics system where awareness, availment, and satisfaction metrics are calculated independently using total respondents as the denominator. This produces mathematically incorrect results that misrepresent the service delivery funnel.

The new design implements a cascading funnel calculation where:
1. **Awareness** is calculated from all respondents
2. **Availment** is calculated only from aware respondents
3. **Satisfaction** is calculated only from respondents who availed services

This ensures each stage uses the appropriate population as its denominator, reflecting the true progression through the service delivery journey.

### Design Rationale

The cascading funnel approach is chosen because:
- It accurately models real-world service delivery progression (you can't avail a service you're unaware of)
- It provides meaningful percentages at each stage (e.g., "80% of aware residents availed the service")
- It enables proper funnel analysis to identify drop-off points
- It aligns with standard analytics practices for conversion funnels

## Architecture

### System Components

The analytics system has three calculation engines that must be synchronized:

1. **Python ML Module** (`ml/sigla_ml/feature_engineering.py`)
   - Core calculation engine for ML analysis
   - Processes raw survey data into metrics
   - Stores results in ML cache

2. **Executive Summary API** (`src/app/api/ai/executive-summary/route.ts`)
   - TypeScript endpoint for AI-powered summaries
   - Calculates metrics on-demand from survey responses
   - Feeds data to Gemini AI for narrative generation

3. **Funnel Analysis API** (`src/app/api/ml/funnel-analysis/route.ts`)
   - TypeScript endpoint for funnel visualization
   - Calculates stage-by-stage progression metrics
   - Returns structured data for charts

### Design Decision: Shared Calculation Logic

**Decision**: Extract funnel calculation logic into a shared TypeScript utility module that both APIs import.

**Rationale**: 
- Ensures identical calculation logic across both TypeScript APIs
- Reduces code duplication and maintenance burden
- Makes testing easier (single source of truth)
- Allows Python module to remain independent while TypeScript APIs share code

### Data Flow

```
Survey Responses (Database)
         ↓
    [Filter by Cycle/Barangay]
         ↓
    [Stage 1: Awareness]
    - Input: All respondents
    - Output: Set of aware respondent IDs
         ↓
    [Stage 2: Availment]
    - Input: Aware respondents only
    - Output: Set of availed respondent IDs
         ↓
    [Stage 3: Satisfaction]
    - Input: Availed respondents only
    - Output: Satisfaction metrics
```

## Components and Interfaces

### Python Module Components

#### Core Calculation Methods

```python
class FeatureEngineering:
    def _identify_aware_respondents(
        self, 
        responses: List[Dict], 
        service_area: str
    ) -> Set[int]:
        """
        Identifies respondents who answered 'Yes' to any awareness question
        for the given service area.
        
        Returns: Set of respondent IDs who are aware
        """
        pass
    
    def _identify_availed_respondents(
        self,
        responses: List[Dict],
        service_area: str,
        aware_ids: Set[int]
    ) -> Set[int]:
        """
        Identifies respondents who answered 'Yes' to any availment question,
        filtered to only include aware respondents.
        
        Returns: Set of respondent IDs who availed (subset of aware_ids)
        """
        pass
    
    def _calculate_satisfaction_from_availed(
        self,
        responses: List[Dict],
        service_area: str,
        availed_ids: Set[int]
    ) -> Dict:
        """
        Calculates satisfaction metrics only from respondents who availed.
        
        Returns: {
            'count': int,  # Number of satisfied respondents
            'total': int,  # Number of availed respondents
            'percentage': float | None
        }
        """
        pass
    
    def _calculate_funnel_metrics(
        self,
        responses: List[Dict],
        service_area: str
    ) -> Dict:
        """
        Orchestrates three-stage funnel calculation.
        
        Returns: {
            'awareness': {'count': int, 'total': int, 'percentage': float},
            'availment': {'count': int, 'total': int, 'percentage': float | None},
            'satisfaction': {'count': int, 'total': int, 'percentage': float | None}
        }
        """
        pass
```

#### Updated calculate_service_scores Method

```python
def calculate_service_scores(
    self,
    responses: List[Dict],
    service_areas: List[str]
) -> Dict[str, Dict]:
    """
    Calculates funnel metrics for each service area.
    
    Returns: {
        'financial_services': {
            'awareness': {'count': 45, 'total': 50, 'percentage': 90.0},
            'availment': {'count': 30, 'total': 45, 'percentage': 66.7},
            'satisfaction': {'count': 25, 'total': 30, 'percentage': 83.3}
        },
        ...
    }
    """
    pass
```

### TypeScript Shared Utility Module

#### Interface Definitions

```typescript
interface FunnelStageMetrics {
  count: number;        // Numerator (e.g., number aware)
  total: number;        // Denominator (e.g., total respondents)
  percentage: number | null;  // Calculated percentage or null if total is 0
}

interface ServiceFunnelMetrics {
  awareness: FunnelStageMetrics;
  availment: FunnelStageMetrics;
  satisfaction: FunnelStageMetrics;
}
```

#### Core Functions (`src/lib/funnel-calculations.ts`)

```typescript
function identifyAwareRespondents(
  responses: SurveyResponse[],
  serviceArea: string
): Set<number> {
  /**
   * Identifies respondents who answered 'Yes' to any awareness question.
   * Returns: Set of respondent IDs
   */
}

function identifyAvailedRespondents(
  responses: SurveyResponse[],
  serviceArea: string,
  awareIds: Set<number>
): Set<number> {
  /**
   * Identifies respondents who answered 'Yes' to any availment question,
   * filtered to only include aware respondents.
   * Returns: Set of respondent IDs (subset of awareIds)
   */
}

function calculateSatisfactionFromAvailed(
  responses: SurveyResponse[],
  serviceArea: string,
  availedIds: Set<number>
): FunnelStageMetrics {
  /**
   * Calculates satisfaction metrics only from availed respondents.
   */
}

function calculateServiceFunnelMetrics(
  responses: SurveyResponse[],
  serviceArea: string
): ServiceFunnelMetrics {
  /**
   * Orchestrates three-stage funnel calculation.
   * Main entry point for funnel calculations.
   */
}
```

#### Helper Functions

```typescript
function findAwarenessQuestions(serviceArea: string): string[] {
  // Returns question IDs for awareness questions in this service area
}

function findAvailmentQuestions(serviceArea: string): string[] {
  // Returns question IDs for availment questions in this service area
}

function findSatisfactionQuestions(serviceArea: string): string[] {
  // Returns question IDs for satisfaction questions in this service area
}

function isYesAnswer(answer: string): boolean {
  // Determines if an answer represents "Yes" (handles variations)
}

function parseRating(answer: string): number | null {
  // Parses satisfaction ratings from answer text
}
```

### Design Decision: Question Identification Strategy

**Decision**: Use question text pattern matching to identify awareness, availment, and satisfaction questions.

**Rationale**:
- Survey questions follow consistent naming patterns (e.g., "Are you aware of...", "Have you availed...")
- Pattern matching is more flexible than hardcoded question IDs
- Allows system to work with different survey cycles without configuration changes
- Falls back gracefully if patterns don't match (returns empty arrays)

**Implementation**:
- Awareness: Questions containing "aware" or "know about"
- Availment: Questions containing "avail" or "use" or "access"
- Satisfaction: Questions containing "satisf" or "rate" or "quality"

## Data Models

### Input Data Structure

```typescript
interface SurveyResponse {
  id: number;
  respondent_id: number;
  question_id: string;
  question_text: string;
  answer: string;
  service_area: string;
  cycle_id: number;
  barangay_id: number;
}
```

### Output Data Structure

```typescript
interface ServiceAreaMetrics {
  [serviceArea: string]: ServiceFunnelMetrics;
}

// Example output:
{
  "financial_services": {
    "awareness": {
      "count": 45,
      "total": 50,
      "percentage": 90.0
    },
    "availment": {
      "count": 30,
      "total": 45,  // Uses aware count as denominator
      "percentage": 66.7
    },
    "satisfaction": {
      "count": 25,
      "total": 30,  // Uses availed count as denominator
      "percentage": 83.3
    }
  }
}
```

### Design Decision: Structured Metrics Format

**Decision**: Return structured objects with count, total, and percentage for each stage instead of just percentages.

**Rationale**:
- Enables detailed funnel visualizations showing drop-off at each stage
- Allows frontend to display both percentages and absolute numbers
- Makes debugging easier (can verify denominators are correct)
- Supports edge case handling (null percentages when total is 0)
- Provides transparency into calculation methodology

## Error Handling

### Edge Cases

#### 1. Zero Awareness
```typescript
// When no respondents are aware of a service
{
  "awareness": {"count": 0, "total": 50, "percentage": 0.0},
  "availment": {"count": 0, "total": 0, "percentage": null},
  "satisfaction": {"count": 0, "total": 0, "percentage": null}
}
```

**Handling**: Return null for availment and satisfaction percentages since calculations are undefined.

#### 2. Zero Availment
```typescript
// When respondents are aware but none availed
{
  "awareness": {"count": 45, "total": 50, "percentage": 90.0},
  "availment": {"count": 0, "total": 45, "percentage": 0.0},
  "satisfaction": {"count": 0, "total": 0, "percentage": null}
}
```

**Handling**: Return null for satisfaction percentage since no one availed.

#### 3. Missing Questions
```typescript
// When a service area has no awareness questions
{
  "awareness": {"count": 0, "total": 0, "percentage": null},
  "availment": {"count": 0, "total": 0, "percentage": null},
  "satisfaction": {"count": 0, "total": 0, "percentage": null}
}
```

**Handling**: Return null for all stages when foundational questions are missing.

#### 4. Skipped Questions
**Handling**: Exclude respondents who skip questions from subsequent stage calculations. Track exclusions for debugging.

### Design Decision: Null vs Zero

**Decision**: Use null for percentages when calculations are undefined (division by zero), use 0.0 when calculation is valid but result is zero.

**Rationale**:
- Distinguishes between "0% aware" (valid) and "cannot calculate availment" (invalid)
- Prevents misleading metrics (e.g., showing "0% satisfaction" when no one availed)
- Allows frontend to display appropriate messages ("No data" vs "0%")
- Follows standard analytics practices

### Validation and Logging

```typescript
function validateFunnelIntegrity(
  awareIds: Set<number>,
  availedIds: Set<number>,
  allRespondentIds: Set<number>
): void {
  // Validate: availedIds ⊆ awareIds ⊆ allRespondentIds
  // Log warnings if validation fails
  // Track excluded respondents and reasons
}
```

## Testing Strategy

### Unit Tests

#### Python Tests (`ml/tests/test_funnel_calculations.py`)

1. **Basic Funnel Test**
   - Input: 50 respondents, 45 aware, 30 availed, 25 satisfied
   - Expected: Awareness 90%, Availment 66.7%, Satisfaction 83.3%

2. **Zero Awareness Test**
   - Input: 50 respondents, 0 aware
   - Expected: Awareness 0%, Availment null, Satisfaction null

3. **Zero Availment Test**
   - Input: 50 respondents, 45 aware, 0 availed
   - Expected: Awareness 90%, Availment 0%, Satisfaction null

4. **Missing Questions Test**
   - Input: Responses with no awareness questions
   - Expected: All stages return null

5. **Subset Validation Test**
   - Verify: availed_ids ⊆ aware_ids ⊆ all_respondent_ids

6. **Exclusion Test**
   - Verify: Satisfaction excludes non-availed respondents

#### TypeScript Tests (`src/lib/__tests__/funnel-calculations.test.ts`)

Mirror all Python tests with identical test cases to ensure consistency.

### Integration Tests

#### Cross-Language Consistency Test

```typescript
describe('Python-TypeScript Consistency', () => {
  it('should produce identical results for same input', async () => {
    const testData = loadTestSurveyData();
    
    const pythonResults = await callPythonMLEndpoint(testData);
    const typescriptResults = calculateServiceFunnelMetrics(testData);
    
    // Compare with 0.1% tolerance for rounding
    expect(pythonResults.awareness.percentage)
      .toBeCloseTo(typescriptResults.awareness.percentage, 1);
    
    // Counts must match exactly
    expect(pythonResults.awareness.count)
      .toBe(typescriptResults.awareness.count);
  });
});
```

### Design Decision: 90% Code Coverage Target

**Decision**: Require 90% code coverage for all funnel calculation functions.

**Rationale**:
- Funnel calculations are critical business logic
- High coverage ensures edge cases are tested
- Prevents regressions during future changes
- 90% is achievable while allowing flexibility for trivial code

## Migration Strategy

### Phase 1: Implementation
1. Implement Python funnel calculations
2. Implement TypeScript shared utility module
3. Update both APIs to use new calculations
4. Add feature flag `ENABLE_FUNNEL_CALCULATIONS` (default: false)

### Phase 2: Testing
1. Run unit tests for both Python and TypeScript
2. Run integration tests for cross-language consistency
3. Perform manual QA with sample data
4. Validate edge case handling

### Phase 3: Cache Invalidation
1. Create `scripts/invalidate-ml-cache.ts`
2. Run script to clear all existing ML cache entries
3. Log cleared entries for audit trail
4. Verify cache is empty

### Phase 4: Deployment
1. Deploy code with feature flag disabled
2. Enable feature flag in production
3. Run `scripts/regenerate-analytics.ts` to recalculate historical data
4. Monitor logs for errors
5. Validate new metrics are being served

### Phase 5: Verification
1. Compare sample calculations before/after
2. Verify satisfaction scores increased (smaller denominator)
3. Verify availment scores changed appropriately
4. Check for any anomalies in historical data

### Design Decision: Feature Flag Approach

**Decision**: Use feature flag to toggle between old and new methodology during transition.

**Rationale**:
- Allows safe deployment without immediate impact
- Enables A/B testing of new calculations
- Provides rollback mechanism if issues arise
- Allows gradual migration per service area if needed

### Backward Compatibility

```typescript
interface LegacyMetrics {
  awareness_percentage: number;
  availment_percentage: number;
  satisfaction_percentage: number;
}

function normalizeMetrics(
  metrics: ServiceFunnelMetrics | LegacyMetrics
): ServiceFunnelMetrics {
  // Converts old format to new format if needed
  // Ensures frontend components work during transition
}
```

## Performance Considerations

### Calculation Complexity

- **Time Complexity**: O(n × m) where n = respondents, m = questions per service area
- **Space Complexity**: O(n) for storing respondent ID sets

### Optimization Strategies

1. **Set-based Filtering**: Use Set data structures for O(1) membership checks
2. **Single Pass Processing**: Process responses once, building all sets simultaneously
3. **Early Termination**: Skip processing if awareness count is 0
4. **Batch Processing**: Process multiple service areas in parallel

### Performance Target

**Requirement**: Complete cache regeneration within 300 seconds for 10,000 respondents.

**Estimated Performance**:
- 10,000 respondents × 50 questions = 500,000 response records
- Processing rate: ~1,667 responses/second
- Well within target for modern hardware

### Design Decision: In-Memory Processing

**Decision**: Load all responses for a cycle into memory and process in-memory.

**Rationale**:
- Faster than multiple database queries
- Typical datasets (10K respondents) fit easily in memory
- Simplifies code (no pagination logic needed)
- Enables efficient set operations

## Documentation Requirements

### Methodology Documentation (`docs/funnel-methodology.md`)

Must include:
1. Explanation of cascading funnel approach
2. Visual diagrams showing three-stage flow
3. Example calculations comparing old vs new methodology
4. Expected impact on metrics
5. Migration notes about historical discontinuities

### API Documentation

Must include:
1. New response format with examples
2. Field definitions for count, total, percentage
3. Edge case examples (null values)
4. Migration guide for frontend consumers

### Code Documentation

Must include:
1. Inline comments explaining funnel logic
2. JSDoc/docstrings for all public functions
3. Examples in function documentation
4. Edge case handling notes

## Security Considerations

No new security concerns introduced. Calculations operate on already-authorized data.

## Monitoring and Observability

### Logging Requirements

1. **Cache Invalidation**: Log each cleared cache entry
2. **Regeneration**: Log progress (cycle ID, timestamp, duration)
3. **Validation Failures**: Log when subset validation fails
4. **Edge Cases**: Log when null values are returned and why

### Metrics to Track

1. Calculation duration per service area
2. Cache hit/miss rates after regeneration
3. Frequency of null values by service area
4. Comparison of old vs new metric values

## Future Enhancements

### Potential Improvements

1. **Multi-stage Funnels**: Support more than 3 stages if needed
2. **Custom Denominators**: Allow configuration of which stage to use as denominator
3. **Trend Analysis**: Track funnel conversion rates over time
4. **Anomaly Detection**: Flag unusual drop-offs between stages
5. **Respondent Journey Tracking**: Store individual respondent paths through funnel

### Design Extensibility

The modular design supports future enhancements:
- New stages can be added by creating additional `_identify_*` methods
- Custom funnel configurations can be supported via parameters
- Calculation logic is isolated and can be swapped without affecting APIs
