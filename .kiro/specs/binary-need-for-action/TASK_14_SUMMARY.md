# Task 14: Add Error Handling for Analytics API - Implementation Summary

## Overview
Implemented comprehensive error handling for the NFA (Need for Action) analytics API, addressing all three error scenarios specified in the design document.

## Requirements Addressed
- **Requirement 4.4**: Handle zero responses case gracefully

## Error Scenarios Implemented

### Scenario 7: Zero Responses Case (Requirement 4.4)
**Implementation**: Modified `calculateNFARateForIndicatorDirect()` in `src/lib/nfa-analytics-queries.ts`

- Returns `{ totalResponses: 0, yesCount: 0, nfaRatePercentage: 0 }` when no responses exist
- Includes metadata in API responses indicating data availability
- Provides user-friendly messages like "No responses available for this indicator"

**Code Changes**:
```typescript
// Scenario 7: Handle zero responses case gracefully (Requirement 4.4)
if (!sections || sections.length === 0) {
  return {
    totalResponses: 0,
    yesCount: 0,
    nfaRatePercentage: 0,
  };
}
```

### Scenario 8: Malformed JSONB Data
**Implementation**: Added try-catch blocks and validation in multiple locations

1. **NFA Analytics Queries** (`src/lib/nfa-analytics-queries.ts`):
   - Wraps JSON parsing in try-catch blocks
   - Validates that parsed data is an object
   - Logs warnings for malformed data
   - Excludes malformed responses from calculations
   - Tracks count of excluded responses

2. **Survey Analytics API** (`src/app/api/survey-analytics/route.ts`):
   - Added malformed data handling in `getAggregatedAnalytics()`
   - Added malformed data handling in `getExportData()`
   - Returns count of excluded responses in API response
   - Includes warning messages when data is excluded

**Code Changes**:
```typescript
try {
  const data = typeof section.data === 'string' 
    ? JSON.parse(section.data) 
    : section.data;
  
  // Validate that data is an object
  if (!data || typeof data !== 'object') {
    console.warn(`Malformed JSONB data in section (not an object), skipping`);
    malformedCount++;
    continue;
  }
  // ... process data
} catch (parseError) {
  console.warn(`Failed to parse JSONB data in section, skipping:`, parseError);
  malformedCount++;
  continue;
}
```

### Scenario 9: Query Parameter Validation
**Implementation**: Created comprehensive validation functions and API endpoint

1. **Validation Functions** (`src/lib/nfa-analytics-queries.ts`):
   - `isValidServiceArea()` - Validates service area keys
   - `isValidBinaryFieldName()` - Validates binary field names for a service area
   - `isValidCycleId()` - Validates cycle IDs (positive integers)
   - `isValidBarangayId()` - Validates barangay IDs (positive integers)
   - `getValidServiceAreas()` - Returns list of valid service areas
   - `getValidBinaryFieldNames()` - Returns list of valid binary fields for a service area

2. **NFA Rates API Endpoint** (`src/app/api/analytics/nfa-rates/route.ts`):
   - New dedicated endpoint for NFA rate calculations
   - Validates all query parameters before processing
   - Returns 400 Bad Request with detailed error messages for invalid parameters
   - Supports multiple modes: indicator, service-area, all-areas, barangay-comparison, trend
   - Uses standardized error response functions

**Code Changes**:
```typescript
// Validate mode
const validModes = ['indicator', 'service-area', 'all-areas', 'barangay-comparison', 'trend'];
if (!validModes.includes(mode)) {
  return badRequestResponse(
    'Invalid mode parameter',
    `Mode must be one of: ${validModes.join(', ')}`
  );
}

// Validate cycleId
if (!isValidCycleId(cycleIdParam)) {
  return badRequestResponse(
    'Invalid cycleId parameter',
    'cycleId must be a positive integer'
  );
}
```

## Files Created/Modified

### Created Files:
1. `src/app/api/analytics/nfa-rates/route.ts` - New NFA analytics API endpoint with comprehensive error handling
2. `src/app/api/analytics/nfa-rates/__tests__/error-handling.test.ts` - API error handling tests
3. `src/lib/__tests__/nfa-analytics-error-handling.test.ts` - Validation function tests
4. `.kiro/specs/binary-need-for-action/TASK_14_SUMMARY.md` - This summary document

### Modified Files:
1. `src/lib/nfa-analytics-queries.ts`:
   - Added error handling in `calculateNFARateForIndicatorDirect()`
   - Added validation functions
   - Added `NFARateResultWithMetadata` interface

2. `src/app/api/survey-analytics/route.ts`:
   - Added malformed JSONB data handling in `getAggregatedAnalytics()`
   - Added malformed JSONB data handling in `getExportData()`

## Testing

### Unit Tests Created:
1. **Validation Function Tests** (`src/lib/__tests__/nfa-analytics-error-handling.test.ts`):
   - ✅ 16 tests passing
   - Tests for `isValidServiceArea()`
   - Tests for `isValidBinaryFieldName()`
   - Tests for `isValidCycleId()`
   - Tests for `isValidBarangayId()`
   - Tests for `getValidServiceAreas()`
   - Tests for `getValidBinaryFieldNames()`

2. **API Error Handling Tests** (`src/app/api/analytics/nfa-rates/__tests__/error-handling.test.ts`):
   - Tests for invalid mode parameter
   - Tests for missing/invalid cycleId
   - Tests for missing/invalid serviceArea
   - Tests for missing/invalid binaryFieldName
   - Tests for missing/invalid barangayId
   - Tests for zero responses case
   - Tests for successful requests

### Test Results:
```
PASS  src/lib/__tests__/nfa-analytics-error-handling.test.ts
  ✓ 16 tests passing
  ✓ All validation functions working correctly
```

## API Usage Examples

### Example 1: Calculate NFA Rate for Specific Indicator
```
GET /api/analytics/nfa-rates?mode=indicator&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects&barangayId=1
```

**Success Response (200)**:
```json
{
  "mode": "indicator",
  "serviceArea": "financial",
  "binaryFieldName": "need_for_action_binary_projects",
  "cycleId": 1,
  "barangayId": 1,
  "result": {
    "totalResponses": 100,
    "yesCount": 45,
    "nfaRatePercentage": 45.0
  },
  "hasData": true
}
```

**Zero Responses Response (200)**:
```json
{
  "mode": "indicator",
  "result": {
    "totalResponses": 0,
    "yesCount": 0,
    "nfaRatePercentage": 0
  },
  "hasData": false,
  "message": "No responses available for this indicator"
}
```

**Error Response (400)**:
```json
{
  "error": "Invalid cycleId parameter",
  "details": "cycleId must be a positive integer",
  "code": "BAD_REQUEST",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Example 2: Calculate NFA Rates for Service Area
```
GET /api/analytics/nfa-rates?mode=service-area&cycleId=1&serviceArea=financial&barangayId=1
```

### Example 3: Compare NFA Rates Across Barangays
```
GET /api/analytics/nfa-rates?mode=barangay-comparison&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects
```

### Example 4: Calculate NFA Rate Trend
```
GET /api/analytics/nfa-rates?mode=trend&cycleId=1&serviceArea=financial&binaryFieldName=need_for_action_binary_projects&barangayId=1
```

## Error Response Structure

All error responses follow a standardized format:

```typescript
interface ErrorResponse {
  error: string;           // Main error message
  details?: string | string[]; // Additional error details
  code?: string;           // Error code for client-side handling
  timestamp?: string;      // ISO timestamp
}
```

## Validation Rules

### Service Area Validation:
- Must be one of: `financial`, `disaster`, `safety`, `social`, `business`, `environmental`
- Case-sensitive

### Binary Field Name Validation:
- Must follow pattern: `need_for_action_binary_{indicator}`
- Must be valid for the specified service area
- Examples: `need_for_action_binary_projects`, `need_for_action_binary_tanods`

### Cycle ID Validation:
- Must be a positive integer
- Cannot be 0, negative, or non-numeric

### Barangay ID Validation:
- Must be a positive integer
- Cannot be 0, negative, or non-numeric

## Logging

The implementation includes comprehensive logging for debugging:

1. **Malformed Data Warnings**:
   ```
   Malformed JSONB data in section (not an object), skipping
   Failed to parse JSONB data in section, skipping: [error details]
   Excluded N malformed responses from NFA calculation
   ```

2. **Database Errors**:
   ```
   Error fetching survey sections: [error details]
   Database error during [operation]: [error details]
   ```

3. **Calculation Errors**:
   ```
   Error calculating NFA rate for [indicator]: [error details]
   ```

## Benefits

1. **Robustness**: System handles edge cases gracefully without crashing
2. **User Experience**: Clear error messages help users understand what went wrong
3. **Data Integrity**: Malformed data is excluded from calculations, ensuring accurate results
4. **Debugging**: Comprehensive logging helps identify and fix issues quickly
5. **API Consistency**: Standardized error responses across all endpoints
6. **Requirement Compliance**: Fully implements Requirement 4.4 for zero responses handling

## Next Steps

1. Consider adding rate limiting to prevent API abuse
2. Add caching for frequently requested NFA rates
3. Consider adding more detailed analytics modes (e.g., by date range, by interviewer)
4. Add monitoring/alerting for high rates of malformed data
5. Consider adding batch calculation endpoints for efficiency

## Notes

- The API endpoint uses the existing `supabase` client from `@/lib/supabase`
- All validation functions are exported and can be reused in other parts of the application
- The error handling is defensive and fails gracefully, never exposing sensitive information
- The implementation follows the existing error response patterns in the codebase
