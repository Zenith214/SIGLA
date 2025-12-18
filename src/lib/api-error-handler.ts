/**
 * API Error Handling Utilities
 * Provides comprehensive error handling for API routes including:
 * - Try-catch blocks
 * - Timeout handling
 * - HTTP status codes
 * - Error logging with context
 * - Retry logic for transient failures
 */

import { NextResponse } from 'next/server';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Custom API Error class
export class APIError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.severity = severity;
    this.context = context;
    this.isRetryable = isRetryable;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

// Error logger with context
export const logError = (
  error: Error | APIError,
  endpoint: string,
  additionalContext?: Record<string, any>
) => {
  const timestamp = new Date().toISOString();
  const isAPIError = error instanceof APIError;

  const logEntry = {
    timestamp,
    endpoint,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(isAPIError && {
        type: error.type,
        statusCode: error.statusCode,
        severity: error.severity,
        context: error.context,
        isRetryable: error.isRetryable,
      }),
    },
    ...additionalContext,
  };

  // Log based on severity
  if (isAPIError) {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('[API ERROR - HIGH]', JSON.stringify(logEntry, null, 2));
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[API ERROR - MEDIUM]', JSON.stringify(logEntry, null, 2));
        break;
      case ErrorSeverity.LOW:
        console.log('[API ERROR - LOW]', JSON.stringify(logEntry, null, 2));
        break;
    }
  } else {
    console.error('[API ERROR]', JSON.stringify(logEntry, null, 2));
  }

  // In production, you might want to send to external logging service
  // e.g., Sentry, DataDog, CloudWatch, etc.
};

// Format error response
export const formatErrorResponse = (error: Error | APIError) => {
  const isAPIError = error instanceof APIError;

  return {
    error: error.message,
    type: isAPIError ? error.type : ErrorType.INTERNAL,
    ...(isAPIError && error.isRetryable && { retryable: true }),
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
};

// Create error response
export const createErrorResponse = (
  error: Error | APIError,
  endpoint: string,
  additionalContext?: Record<string, any>
): NextResponse => {
  // Log the error
  logError(error, endpoint, additionalContext);

  // Determine status code
  const statusCode = error instanceof APIError ? error.statusCode : 500;

  // Format response
  const response = formatErrorResponse(error);

  return NextResponse.json(response, { status: statusCode });
};

// Async error handler wrapper
export const withErrorHandler = <T>(
  handler: () => Promise<T>,
  endpoint: string,
  context?: Record<string, any>
): Promise<T> => {
  return handler().catch((error) => {
    logError(error, endpoint, context);
    throw error;
  });
};

// Timeout wrapper for fetch requests
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new APIError(
        `Request timed out after ${timeoutMs}ms`,
        ErrorType.TIMEOUT,
        408,
        ErrorSeverity.MEDIUM,
        { url, timeoutMs },
        true // Timeout errors are retryable
      );
    }
    
    throw new APIError(
      `Network request failed: ${error.message}`,
      ErrorType.EXTERNAL_API,
      503,
      ErrorSeverity.HIGH,
      { url, originalError: error.message },
      true // Network errors are retryable
    );
  }
};

// Retry logic for transient failures
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    retryableErrors?: ErrorType[];
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableErrors = [ErrorType.TIMEOUT, ErrorType.EXTERNAL_API, ErrorType.DATABASE],
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error instanceof APIError &&
        (error.isRetryable || retryableErrors.includes(error.type));

      // Don't retry if not retryable or last attempt
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Database error handler
export const handleDatabaseError = (error: any, operation: string): APIError => {
  // Check for specific database error codes
  const errorCode = error?.code;
  const errorMessage = error?.message || 'Database operation failed';

  // Common PostgreSQL error codes
  switch (errorCode) {
    case '23505': // unique_violation
      return new APIError(
        'A record with this information already exists',
        ErrorType.VALIDATION,
        409,
        ErrorSeverity.LOW,
        { operation, originalError: errorMessage }
      );
    case '23503': // foreign_key_violation
      return new APIError(
        'Referenced record does not exist',
        ErrorType.VALIDATION,
        400,
        ErrorSeverity.LOW,
        { operation, originalError: errorMessage }
      );
    case '23502': // not_null_violation
      return new APIError(
        'Required field is missing',
        ErrorType.VALIDATION,
        400,
        ErrorSeverity.LOW,
        { operation, originalError: errorMessage }
      );
    case '42P01': // undefined_table
      return new APIError(
        'Database table not found',
        ErrorType.DATABASE,
        500,
        ErrorSeverity.CRITICAL,
        { operation, originalError: errorMessage }
      );
    case '08006': // connection_failure
    case '08003': // connection_does_not_exist
      return new APIError(
        'Database connection failed',
        ErrorType.DATABASE,
        503,
        ErrorSeverity.HIGH,
        { operation, originalError: errorMessage },
        true // Connection errors are retryable
      );
    default:
      return new APIError(
        `Database error: ${errorMessage}`,
        ErrorType.DATABASE,
        500,
        ErrorSeverity.HIGH,
        { operation, errorCode, originalError: errorMessage },
        true // Unknown database errors might be transient
      );
  }
};

// Validation error helper
export const createValidationError = (
  message: string,
  field?: string,
  value?: any
): APIError => {
  return new APIError(
    message,
    ErrorType.VALIDATION,
    400,
    ErrorSeverity.LOW,
    { field, value }
  );
};

// Authentication error helper
export const createAuthError = (message: string = 'Authentication required'): APIError => {
  return new APIError(
    message,
    ErrorType.AUTHENTICATION,
    401,
    ErrorSeverity.MEDIUM
  );
};

// Authorization error helper
export const createAuthorizationError = (
  message: string = 'Insufficient permissions'
): APIError => {
  return new APIError(
    message,
    ErrorType.AUTHORIZATION,
    403,
    ErrorSeverity.MEDIUM
  );
};

// Not found error helper
export const createNotFoundError = (resource: string): APIError => {
  return new APIError(
    `${resource} not found`,
    ErrorType.NOT_FOUND,
    404,
    ErrorSeverity.LOW,
    { resource }
  );
};

// Rate limit error helper
export const createRateLimitError = (
  limit: number,
  windowSeconds: number
): APIError => {
  return new APIError(
    `Rate limit exceeded. Maximum ${limit} requests per ${windowSeconds} seconds`,
    ErrorType.RATE_LIMIT,
    429,
    ErrorSeverity.LOW,
    { limit, windowSeconds }
  );
};
