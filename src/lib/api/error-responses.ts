/**
 * API Error Response Utilities
 * 
 * This module provides standardized error response functions for API endpoints.
 * 
 * Requirement 3.1, 3.2, 3.3: Return appropriate HTTP status codes and error messages
 */

import { NextResponse } from 'next/server';

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  details?: string | string[];
  code?: string;
  timestamp?: string;
}

/**
 * Create a standardized error response
 * 
 * @param message - Main error message
 * @param status - HTTP status code
 * @param details - Additional error details
 * @param code - Error code for client-side handling
 * @returns NextResponse with error payload
 */
export function createErrorResponse(
  message: string,
  status: number,
  details?: string | string[],
  code?: string
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    errorResponse.details = details;
  }

  if (code) {
    errorResponse.code = code;
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Create a 400 Bad Request response for validation errors
 * 
 * @param message - Error message
 * @param details - Validation error details
 * @returns NextResponse with 400 status
 */
export function badRequestResponse(
  message: string,
  details?: string | string[]
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, 400, details, 'BAD_REQUEST');
}

/**
 * Create a 400 Bad Request response for missing required fields
 * 
 * @param fields - Array of missing field names
 * @returns NextResponse with 400 status
 */
export function missingFieldsResponse(fields: string[]): NextResponse<ErrorResponse> {
  return badRequestResponse(
    'Missing required fields',
    fields.map(field => `Missing required field: ${field}`)
  );
}

/**
 * Create a 400 Bad Request response for invalid field values
 * 
 * @param errors - Array of validation error messages
 * @returns NextResponse with 400 status
 */
export function invalidFieldsResponse(errors: string[]): NextResponse<ErrorResponse> {
  return badRequestResponse('Invalid field values', errors);
}

/**
 * Create a 400 Bad Request response for NFA data validation errors
 * 
 * @param errors - Array of NFA validation error messages
 * @param warnings - Optional array of warning messages
 * @returns NextResponse with 400 status
 */
export function nfaValidationErrorResponse(
  errors: string[],
  warnings?: string[]
): NextResponse<ErrorResponse> {
  const details = [...errors];
  if (warnings && warnings.length > 0) {
    details.push('', 'Warnings:', ...warnings);
  }

  return createErrorResponse(
    'NFA data validation failed',
    400,
    details,
    'NFA_VALIDATION_ERROR'
  );
}

/**
 * Create a 500 Internal Server Error response
 * 
 * @param message - Error message
 * @param details - Additional error details (should not expose sensitive info)
 * @returns NextResponse with 500 status
 */
export function internalServerErrorResponse(
  message: string = 'Internal server error',
  details?: string
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, 500, details, 'INTERNAL_SERVER_ERROR');
}

/**
 * Create a 503 Service Unavailable response for database connection failures
 * 
 * @param retryAfterSeconds - Number of seconds to wait before retrying
 * @returns NextResponse with 503 status and Retry-After header
 */
export function serviceUnavailableResponse(
  retryAfterSeconds: number = 30
): NextResponse<ErrorResponse> {
  const response = createErrorResponse(
    'Service temporarily unavailable',
    503,
    'Database connection failed. Please try again later.',
    'SERVICE_UNAVAILABLE'
  );

  // Add Retry-After header
  response.headers.set('Retry-After', retryAfterSeconds.toString());

  return response;
}

/**
 * Create a 422 Unprocessable Entity response for data structure errors
 * 
 * @param message - Error message
 * @param details - Structural error details
 * @returns NextResponse with 422 status
 */
export function unprocessableEntityResponse(
  message: string,
  details?: string | string[]
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, 422, details, 'UNPROCESSABLE_ENTITY');
}

/**
 * Handle database errors and return appropriate response
 * 
 * This function analyzes database errors and returns the appropriate HTTP response.
 * 
 * @param error - The database error
 * @param operation - Description of the operation that failed
 * @returns NextResponse with appropriate status code
 */
export function handleDatabaseError(
  error: any,
  operation: string = 'database operation'
): NextResponse<ErrorResponse> {
  console.error(`Database error during ${operation}:`, error);

  // Check for connection errors
  const connectionErrorCodes = ['08000', '08003', '08006', '08001', '08004', '57P03'];
  if (error.code && connectionErrorCodes.includes(error.code)) {
    return serviceUnavailableResponse();
  }

  // Check for constraint violations (these are client errors, not server errors)
  const constraintErrorCodes = ['23000', '23001', '23502', '23503', '23505', '23514'];
  if (error.code && constraintErrorCodes.includes(error.code)) {
    return badRequestResponse(
      'Data constraint violation',
      error.detail || error.message
    );
  }

  // Check for insufficient resources
  const resourceErrorCodes = ['53000', '53100', '53200', '53300'];
  if (error.code && resourceErrorCodes.includes(error.code)) {
    return serviceUnavailableResponse(60); // Retry after 60 seconds
  }

  // Default to internal server error
  return internalServerErrorResponse(
    `Failed to ${operation}`,
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
}

/**
 * Validate required fields in request body
 * 
 * @param body - Request body object
 * @param requiredFields - Array of required field names
 * @returns Array of missing field names (empty if all present)
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === undefined || body[field] === null) {
      missing.push(field);
    }
  }

  return missing;
}
