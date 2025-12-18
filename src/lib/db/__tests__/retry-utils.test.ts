/**
 * Tests for Database Retry Utilities
 * 
 * Requirement 3.3: Implement retry logic for database connection failures
 */

import {
  isRetryableError,
  withRetry,
  queryWithRetry,
  getClientWithRetry
} from '../retry-utils';

describe('Database Retry Utilities', () => {
  describe('isRetryableError', () => {
    it('should identify connection errors as retryable', () => {
      const connectionErrors = [
        { code: '08000' }, // connection_exception
        { code: '08003' }, // connection_does_not_exist
        { code: '08006' }, // connection_failure
        { code: '57P03' }  // cannot_connect_now
      ];

      connectionErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should identify timeout errors as retryable', () => {
      const timeoutErrors = [
        { message: 'Connection timeout' },
        { message: 'ETIMEDOUT' },
        { message: 'Network timeout occurred' }
      ];

      timeoutErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should identify resource errors as retryable', () => {
      const resourceErrors = [
        { code: '53000' }, // insufficient_resources
        { code: '53200' }, // out_of_memory
        { code: '53300' }  // too_many_connections
      ];

      resourceErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should identify deadlock errors as retryable', () => {
      const deadlockErrors = [
        { code: '40001' }, // serialization_failure
        { code: '40P01' }  // deadlock_detected
      ];

      deadlockErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should not retry constraint violations', () => {
      const constraintErrors = [
        { code: '23000' }, // integrity_constraint_violation
        { code: '23505' }, // unique_violation
        { code: '23503' }  // foreign_key_violation
      ];

      constraintErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });

    it('should not retry validation errors', () => {
      const validationErrors = [
        { message: 'Invalid input' },
        { message: 'Validation failed' },
        { code: '22000' } // data_exception
      ];

      validationErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });

    it('should handle null and undefined errors', () => {
      expect(isRetryableError(null)).toBe(false);
      expect(isRetryableError(undefined)).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ code: '08006', message: 'Connection failed' })
        .mockResolvedValueOnce('success');

      const result = await withRetry(operation, {
        maxAttempts: 3,
        initialDelayMs: 10
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable error', async () => {
      const operation = jest.fn()
        .mockRejectedValue({ code: '23505', message: 'Unique violation' });

      await expect(withRetry(operation, { maxAttempts: 3 }))
        .rejects
        .toMatchObject({ code: '23505' });

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should throw after max attempts with retryable error', async () => {
      const operation = jest.fn()
        .mockRejectedValue({ code: '08006', message: 'Connection failed' });

      await expect(withRetry(operation, {
        maxAttempts: 3,
        initialDelayMs: 10
      }))
        .rejects
        .toMatchObject({ code: '08006' });

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should use custom retry logic', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ message: 'Custom error' })
        .mockResolvedValueOnce('success');

      const customIsRetryable = (error: any) => error.message === 'Custom error';

      const result = await withRetry(operation, {
        maxAttempts: 3,
        initialDelayMs: 10,
        isRetryable: customIsRetryable
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should apply exponential backoff', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ code: '08006' })
        .mockRejectedValueOnce({ code: '08006' })
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      
      await withRetry(operation, {
        maxAttempts: 3,
        initialDelayMs: 50,
        backoffMultiplier: 2
      });

      const duration = Date.now() - startTime;
      
      // Should have delays of ~50ms and ~100ms (with jitter)
      // Total should be at least 150ms but allow for jitter and execution time
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(operation).toHaveBeenCalledTimes(3);
    });
  });

  describe('queryWithRetry', () => {
    it('should execute query successfully', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }] })
      };

      const result = await queryWithRetry(
        mockClient,
        'SELECT * FROM table',
        [1]
      );

      expect(result.rows).toEqual([{ id: 1 }]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM table', [1]);
    });

    it('should retry query on connection error', async () => {
      const mockClient = {
        query: jest.fn()
          .mockRejectedValueOnce({ code: '08006' })
          .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      };

      const result = await queryWithRetry(
        mockClient,
        'SELECT * FROM table',
        [1],
        { maxAttempts: 3, initialDelayMs: 10 }
      );

      expect(result.rows).toEqual([{ id: 1 }]);
      expect(mockClient.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('getClientWithRetry', () => {
    it('should get client successfully', async () => {
      const mockClient = { id: 'client-1' };
      const mockPool = {
        connect: jest.fn().mockResolvedValue(mockClient)
      };

      const client = await getClientWithRetry(mockPool);

      expect(client).toBe(mockClient);
      expect(mockPool.connect).toHaveBeenCalledTimes(1);
    });

    it('should retry on connection failure', async () => {
      const mockClient = { id: 'client-1' };
      const mockPool = {
        connect: jest.fn()
          .mockRejectedValueOnce({ code: '08006', message: 'Connection failed' })
          .mockResolvedValueOnce(mockClient)
      };

      const client = await getClientWithRetry(mockPool, {
        maxAttempts: 3,
        initialDelayMs: 10
      });

      expect(client).toBe(mockClient);
      expect(mockPool.connect).toHaveBeenCalledTimes(2);
    });

    it('should throw after max connection attempts', async () => {
      const mockPool = {
        connect: jest.fn()
          .mockRejectedValue({ code: '08006', message: 'Connection failed' })
      };

      await expect(getClientWithRetry(mockPool, {
        maxAttempts: 3,
        initialDelayMs: 10
      }))
        .rejects
        .toMatchObject({ code: '08006' });

      expect(mockPool.connect).toHaveBeenCalledTimes(3);
    });
  });
});
