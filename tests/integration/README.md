# Funnel Calculation Integration Tests

This directory contains integration tests that verify consistency between Python and TypeScript implementations of funnel calculations.

## Overview

The integration tests ensure that both implementations produce identical results when given the same input data. This validates Requirements 3.4, 3.5, 7.3, and 7.5 from the funnel calculation methodology specification.

## Test Structure

```
tests/integration/
├── README.md                          # This file
├── funnel-consistency.test.ts         # Main integration test suite
├── run-python-funnel.py              # Python wrapper for integration tests
├── generate-test-data.js             # Script to generate test fixtures
└── fixtures/
    └── funnel-test-data.json         # Shared test data for both implementations
```

## Test Scenarios

The integration tests cover the following scenarios:

1. **Basic Three-Stage Funnel**
   - 50 respondents, 45 aware (90%), 30 availed (66.7%), 25 satisfied
   - Tests normal funnel progression

2. **Zero Awareness**
   - 50 respondents, 0 aware
   - Tests edge case where no one is aware

3. **Zero Availment**
   - 50 respondents, 45 aware (90%), 0 availed
   - Tests edge case where people are aware but no one availed

4. **Multiple Service Areas**
   - Tests with both financial and disaster service areas
   - Validates independent calculation per service area

## Running the Tests

### Prerequisites

- Node.js and npm installed
- Python 3.x installed
- All dependencies installed:
  ```bash
  npm install
  pip install -r ml/requirements.txt
  ```

### Generate Test Data

```bash
node tests/integration/generate-test-data.js
```

This creates `fixtures/funnel-test-data.json` with test scenarios.

### Run Integration Tests

```bash
# Using Jest
npm test tests/integration/funnel-consistency.test.ts

# Using Vitest
npx vitest run tests/integration/funnel-consistency.test.ts
```

## Validation Criteria

The tests validate:

1. **Exact Count Matching**
   - Awareness count, total, availment count, total, satisfaction count, total must match exactly

2. **Percentage Tolerance**
   - Percentages must match within 0.1% (1 decimal place)
   - Accounts for minor rounding differences between implementations

3. **Null Handling**
   - Both implementations must return null for the same edge cases

4. **Subset Relationships**
   - Validates: availed ⊆ aware ⊆ all respondents
   - Ensures cascading funnel logic is correct

## Test Data Format

### Input Format (Python)

```json
{
  "respondent_id": 1,
  "question_text": "Are you aware of financial services?",
  "answer": "Yes"
}
```

### Input Format (TypeScript)

```json
{
  "response_id": 1,
  "respondent_id": 1,
  "survey_section": {
    "section_key": "financial",
    "data": {
      "are_you_aware_of_financial_services": "Yes"
    }
  }
}
```

### Output Format (Both)

```json
{
  "awareness": {
    "count": 45,
    "total": 50,
    "percentage": 90.0
  },
  "availment": {
    "count": 30,
    "total": 45,
    "percentage": 66.7
  },
  "satisfaction": {
    "count": 25,
    "total": 30,
    "percentage": 90.0
  }
}
```

## Troubleshooting

### Python Script Fails

If `run-python-funnel.py` fails:

1. Check Python path is correct
2. Verify `sigla_ml` module is importable
3. Check Python dependencies are installed

### Test Timeout

If tests timeout:

1. Increase timeout in test file (default: 30 seconds)
2. Check Python script is not hanging
3. Verify test data is not too large

### Percentage Mismatch

If percentages don't match:

1. Check rounding logic in both implementations
2. Verify tolerance is set to 0.1% in tests
3. Review calculation formulas for consistency

## Maintenance

### Adding New Test Scenarios

1. Add scenario to `generate-test-data.js`
2. Define expected results
3. Run generation script
4. Tests will automatically pick up new scenarios

### Updating Implementations

When updating either implementation:

1. Run integration tests to verify consistency
2. Update expected values if methodology changes
3. Document any breaking changes

## Requirements Coverage

- **Requirement 3.4**: Identical metric outputs across calculation systems
- **Requirement 3.5**: Automated consistency validation
- **Requirement 7.3**: Integration tests comparing Python and TypeScript outputs
- **Requirement 7.5**: 90% code coverage for funnel calculations
