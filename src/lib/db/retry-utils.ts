/**
 * Database Retry Utilities
 * 
 * This module provides retry logic for database operations with exponential backoff.
 * 
 * Requirement 3.3: Implement retry logic for database connection failures
 */

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds */
  maxDelayMs?: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;
  /** Function to determine if error is retryable */
  isRetryable?: (error: any) => boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  isRetryable: isRetryableError
};

/**
 * Determine if an error is retryable
 * 
 * Retryable errors include:
 * - Connection errors
 * - Timeout errors
 * - Temporary database unavailability
 * 
 * Non-retryable errors include:
 * - Validation errors
 * - Constraint violations
 * - Authentication errors
 * 
 * @param error - The error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  // PostgreSQL error codes that are retryable
  const retryablePostgresErrors = [
    '08000', // connection_exception
    '08003', // connection_does_not_exist
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '08007', // transaction_resolution_unknown
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '53000', // insufficient_resources
    '53100', // disk_full
    '53200', // out_of_memory
    '53300', // too_many_connections
    '57P03', // cannot_connect_now
    '58000', // system_error
    '58030'  // io_error
  ];

  // Check PostgreSQL error code
  if (error.code && retryablePostgresErrors.includes(error.code)) {
    return true;
  }

  // Check error message for common connection issues
  const errorMessage = error.message?.toLowerCase() || '';
  const retryableMessages = [
    'connection',
    'timeout',
    'econnrefused',
    'enotfound',
    'etimedout',
    'network',
    'unavailable',
    'temporary'
  ];

  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Sleep for a specified duration
 * 
 * @param ms - Duration in milliseconds
 * @returns Promise that resolves after the duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay for exponential backoff with jitter
 * 
 * @param attempt - Current attempt number (0-indexed)
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt);
  
  // Cap at maximum delay
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);
  
  // Add jitter (random value between 0 and 25% of delay)
  const jitter = Math.random() * cappedDelay * 0.25;
  
  return Math.floor(cappedDelay + jitter);
}

/**
 * Execute a database operation with retry logic
 * 
 * This function will retry the operation if it fails with a retryable error,
 * using exponential backoff with jitter.
 * 
 * @param operation - The async operation to execute
 * @param options - Retry configuration options
 * @returns Promise that resolves with the operation result
 * @throws The last error if all retry attempts fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      // Execute the operation
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = config.isRetryable(error);
      const isLastAttempt = attempt === config.maxAttempts - 1;

      if (!shouldRetry || isLastAttempt) {
        // Don't retry non-retryable errors or if this was the last attempt
        throw error;
      }

      // Calculate delay and wait before retrying
      const delay = calculateDelay(attempt, config);
      console.warn(
        `Database operation failed (attempt ${attempt + 1}/${config.maxAttempts}). ` +
        `Retrying in ${delay}ms...`,
        { error: error.message, code: error.code }
      );

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Execute a database query with retry logic
 * 
 * This is a convenience wrapper around withRetry for database queries.
 * 
 * @param client - Database client
 * @param query - SQL query string
 * @param params - Query parameters
 * @param options - Retry configuration options
 * @returns Promise that resolves with the query result
 */
export async function queryWithRetry<T = any>(
  client: any,
  query: string,
  params?: any[],
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(
    async () => {
      return await client.query(query, params);
    },
    options
  );
}

/**
 * Get a database client connection with retry logic
 * 
 * @param pool - Database connection pool
 * @param options - Retry configuration options
 * @returns Promise that resolves with a database client
 */
export async function getClientWithRetry(
  pool: any,
  options: RetryOptions = {}
): Promise<any> {
  return withRetry(
    async () => {
      return await pool.connect();
    },
    options
  );
}
