# Task 13: Add Error Handling for Data Storage - Implementation Summary

## Overview
Implemented comprehensive error handling for NFA data storage, including validation, retry logic, and appropriate HTTP error responses.

## Requirements Addressed
- **3.1**: Validate binary answer is stored correctly
- **3.2**: Validate suggestion text is stored correctly  
- **3.3**: Validate both fields are present in JSONB structure, implement retry logic for database connection failures, and return appropriate HTTP status codes

## Implementation Details

### 1. NFA Storage Validation Module (`src/lib/validation/nfa-storage-validation.ts`)

Created comprehensive validation utilities for NFA data before storage:

**Key Functions:**
- `isValidBinaryValue()` - Validates binary values are "Yes"/"No" or "Oo"/"Hindi"
- `validateNFAFieldPair()` - Validates a single indicator's binary + suggestion pair
- `validateSectionNFAData()` - Validates all NFA fields in a section
- `validateSurveyNFAData()` - Validates complete survey response NFA data
- `sanitizeNFAData()` - Cleans invalid data before storage

**Validation Rules:**
- Binary field must be one of: "Yes", "No", "Oo", "Hindi"
- Suggestion field must be string or null
- Both fields must be present for each indicator
- Logical consistency checks (warns if "Yes" with empty suggestion)

**Error Reporting:**
- Returns detailed error messages for each validation failure
- Includes warnings for data quality issues
- Identifies specific fields and indicators with problems

### 2. Database Retry Utilities (`src/lib/db/retry-utils.ts`)

Implemented retry logic with exponential backoff for database operations:

**Key Functions:**
- `isRetryableError()` - Determines if an error should trigger a retry
- `withRetry()` - Wraps any async operation with retry logic
- `queryWithRetry()` - Convenience wrapper for database queries
- `getClientWithRetry()` - Gets database client with retry logic

**Retry Configuration:**
- Default: 3 attempts with exponential backoff
- Initial delay: 100ms
- Maximum delay: 5000ms
- Backoff multiplier: 2x
- Includes jitter to prevent thundering herd

**Retryable Errors:**
- Connection errors (08xxx PostgreSQL codes)
- Timeout errors (ETIMEDOUT, etc.)
- Resource exhaustion (53xxx codes)
- Deadlocks (40001, 40P01)

**Non-Retryable Errors:**
- Constraint violations (23xxx codes)
- Validation errors
- Authentication errors

### 3. API Error Response Utilities (`src/lib/api/error-responses.ts`)

Created standardized error response functions:

**Response Functions:**
- `createErrorResponse()` - Base error response creator
- `badRequestResponse()` - 400 Bad Request
- `missingFieldsResponse()` - 400 for missing required fields
- `invalidFieldsResponse()` - 400 for invalid field values
- `nfaValidationErrorResponse()` - 400 for NFA validation errors
- `internalServerErrorResponse()` - 500 Internal Server Error
- `serviceUnavailableResponse()` - 503 Service Unavailable (with Retry-After header)
- `unprocessableEntityResponse()` - 422 Unprocessable Entity
- `handleDatabaseError()` - Analyzes database errors and returns appropriate response

**Error Response Structure:**
```typescript
{
  error: string,           // Main error message
  details?: string | string[], // Additional error details
  code?: string,           // Error code for client-side handling
  timestamp?: string       // ISO timestamp
}
```

**HTTP Status Code Mapping:**
- 400: Validation errors, missing fields, constraint violations
- 422: Data structure errors
- 500: Unknown errors, general failures
- 503: Connection failures, resource exhaustion (includes Retry-After header)

### 4. Updated API Endpoints

**Survey Responses Endpoint (`src/app/api/survey-responses/route.ts`):**
- Added NFA data validation before storage
- Implemented retry logic for database connections
- Returns appropriate HTTP status codes and error messages
- Logs warnings for data quality issues

**Sync Endpoint (`src/app/api/sync/route.ts`):**
- Added NFA data validation for each response in batch
- Implemented retry logic for database connections
- Returns detailed error information for each failed response
- Continues processing other responses if one fails

**Changes Made:**
1. Import validation and error handling utilities
2. Validate required fields using `validateRequiredFields()`
3. Validate NFA data structure using `validateSurveyNFAData()`
4. Get database client with retry logic using `getClientWithRetry()`
5. Return appropriate error responses using utility functions
6. Handle database errors with `handleDatabaseError()`

## Testing

### Unit Tests Created

**1. Storage Validation Tests (`src/lib/validation/__tests__/nfa-storage-validation.test.ts`)**
- 24 tests covering all validation scenarios
- Tests for valid and invalid binary values
- Tests for field pair validation
- Tests for section and survey validation
- Tests for data sanitization
- All tests passing ✓

**2. Retry Utilities Tests (`src/lib/db/__tests__/retry-utils.test.ts`)**
- 18 tests covering retry logic
- Tests for retryable vs non-retryable errors
- Tests for exponential backoff
- Tests for custom retry logic
- Tests for query and client retry wrappers
- All tests passing ✓

**3. Error Response Tests (`src/lib/api/__tests__/error-responses.test.ts`)**
- 26 tests covering all response functions
- Tests for each HTTP status code
- Tests for error message formatting
- Tests for database error handling
- Tests for required field validation
- All tests passing ✓

**Total: 68 tests, all passing ✓**

## Error Handling Flow

### 1. Request Validation
```
Request → Validate Required Fields → Validate NFA Data Structure → Proceed or Return 400
```

### 2. Database Operations
```
Operation → Retry on Connection Error → Success or Return 503/500
```

### 3. Error Response
```
Error → Analyze Error Type → Return Appropriate Status Code + Message
```

## Example Error Responses

### Missing Required Fields
```json
{
  "error": "Missing required fields",
  "details": [
    "Missing required field: location",
    "Missing required field: interviewerId"
  ],
  "code": "BAD_REQUEST",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### NFA Validation Error
```json
{
  "error": "NFA data validation failed",
  "details": [
    "Invalid binary value 'Maybe' for 'need_for_action_binary_projects'. Must be one of: Yes, No, Oo, Hindi",
    "Missing suggestion field 'need_for_action_suggestion_financial' for indicator 'financial'"
  ],
  "code": "NFA_VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Database Connection Error
```json
{
  "error": "Service temporarily unavailable",
  "details": "Database connection failed. Please try again later.",
  "code": "SERVICE_UNAVAILABLE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
*Response includes `Retry-After: 30` header*

## Benefits

1. **Data Integrity**: Validates all NFA data before storage, preventing invalid data from entering the database
2. **Reliability**: Automatic retry logic handles transient connection failures
3. **User Experience**: Clear, actionable error messages help users fix issues
4. **Debugging**: Detailed error logging helps developers diagnose problems
5. **Consistency**: Standardized error responses across all endpoints
6. **Resilience**: Graceful degradation under load with retry logic and backoff

## Files Created
- `src/lib/validation/nfa-storage-validation.ts` - Storage validation utilities
- `src/lib/db/retry-utils.ts` - Database retry logic
- `src/lib/api/error-responses.ts` - Error response utilities
- `src/lib/validation/__tests__/nfa-storage-validation.test.ts` - Validation tests
- `src/lib/db/__tests__/retry-utils.test.ts` - Retry logic tests
- `src/lib/api/__tests__/error-responses.test.ts` - Error response tests

## Files Modified
- `src/app/api/survey-responses/route.ts` - Added validation and error handling
- `src/app/api/sync/route.ts` - Added validation and error handling
- `jest.setup.js` - Added Response mock for testing

## Next Steps
Task 13 is complete. The error handling infrastructure is now in place for data storage operations. The next task (Task 14) will add error handling for the analytics API.
