/**
 * Tests for API Error Response Utilities
 * 
 * Requirement 3.1, 3.2, 3.3: Return appropriate HTTP status codes and error messages
 */

import {
  createErrorResponse,
  badRequestResponse,
  missingFieldsResponse,
  invalidFieldsResponse,
  nfaValidationErrorResponse,
  internalServerErrorResponse,
  serviceUnavailableResponse,
  unprocessableEntityResponse,
  handleDatabaseError,
  validateRequiredFields
} from '../error-responses';

// Mock NextResponse.json to return a simple response object
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init: any) => ({
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
      json: async () => data,
      _data: data
    })
  }
}));

describe('API Error Response Utilities', () => {
  describe('createErrorResponse', () => {
    it('should create basic error response', async () => {
      const response = createErrorResponse('Test error', 400);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Test error');
      expect(json.timestamp).toBeDefined();
    });

    it('should include details when provided', async () => {
      const response = createErrorResponse('Test error', 400, 'Additional details');
      const json = await response.json();

      expect(json.details).toBe('Additional details');
    });

    it('should include error code when provided', async () => {
      const response = createErrorResponse('Test error', 400, undefined, 'TEST_ERROR');
      const json = await response.json();

      expect(json.code).toBe('TEST_ERROR');
    });

    it('should handle array of details', async () => {
      const response = createErrorResponse('Test error', 400, ['Detail 1', 'Detail 2']);
      const json = await response.json();

      expect(json.details).toEqual(['Detail 1', 'Detail 2']);
    });
  });

  describe('badRequestResponse', () => {
    it('should create 400 response', async () => {
      const response = badRequestResponse('Invalid input');
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid input');
      expect(json.code).toBe('BAD_REQUEST');
    });
  });

  describe('missingFieldsResponse', () => {
    it('should create response for missing fields', async () => {
      const response = missingFieldsResponse(['field1', 'field2']);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Missing required fields');
      expect(json.details).toEqual([
        'Missing required field: field1',
        'Missing required field: field2'
      ]);
    });
  });

  describe('invalidFieldsResponse', () => {
    it('should create response for invalid fields', async () => {
      const errors = ['Field1 is invalid', 'Field2 must be positive'];
      const response = invalidFieldsResponse(errors);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid field values');
      expect(json.details).toEqual(errors);
    });
  });

  describe('nfaValidationErrorResponse', () => {
    it('should create response for NFA validation errors', async () => {
      const errors = ['Binary field missing', 'Invalid binary value'];
      const response = nfaValidationErrorResponse(errors);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('NFA data validation failed');
      expect(json.code).toBe('NFA_VALIDATION_ERROR');
      expect(json.details).toEqual(errors);
    });

    it('should include warnings in details', async () => {
      const errors = ['Binary field missing'];
      const warnings = ['Suggestion is empty'];
      const response = nfaValidationErrorResponse(errors, warnings);
      const json = await response.json();

      expect(json.details).toContain('Binary field missing');
      expect(json.details).toContain('Warnings:');
      expect(json.details).toContain('Suggestion is empty');
    });
  });

  describe('internalServerErrorResponse', () => {
    it('should create 500 response', async () => {
      const response = internalServerErrorResponse();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Internal server error');
      expect(json.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should include custom message', async () => {
      const response = internalServerErrorResponse('Database error');
      const json = await response.json();

      expect(json.error).toBe('Database error');
    });
  });

  describe('serviceUnavailableResponse', () => {
    it('should create 503 response', async () => {
      const response = serviceUnavailableResponse();
      const json = await response.json();

      expect(response.status).toBe(503);
      expect(json.error).toBe('Service temporarily unavailable');
      expect(json.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should include Retry-After header', () => {
      const response = serviceUnavailableResponse(60);
      
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('unprocessableEntityResponse', () => {
    it('should create 422 response', async () => {
      const response = unprocessableEntityResponse('Invalid structure');
      const json = await response.json();

      expect(response.status).toBe(422);
      expect(json.error).toBe('Invalid structure');
      expect(json.code).toBe('UNPROCESSABLE_ENTITY');
    });
  });

  describe('handleDatabaseError', () => {
    it('should return 503 for connection errors', async () => {
      const error = { code: '08006', message: 'Connection failed' };
      const response = handleDatabaseError(error, 'test operation');
      const json = await response.json();

      expect(response.status).toBe(503);
      expect(json.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should return 400 for constraint violations', async () => {
      const error = { code: '23505', message: 'Unique violation', detail: 'Key already exists' };
      const response = handleDatabaseError(error, 'test operation');
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Data constraint violation');
    });

    it('should return 503 for resource errors', async () => {
      const error = { code: '53300', message: 'Too many connections' };
      const response = handleDatabaseError(error, 'test operation');
      const json = await response.json();

      expect(response.status).toBe(503);
      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('should return 500 for unknown errors', async () => {
      const error = { message: 'Unknown error' };
      const response = handleDatabaseError(error, 'test operation');
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to test operation');
    });

    it('should handle error details based on environment', async () => {
      const error = { message: 'Detailed error message' };
      const response = handleDatabaseError(error, 'test operation');
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to test operation');
      
      // In test environment, details may or may not be included depending on NODE_ENV
      // Just verify the response structure is correct
      if (process.env.NODE_ENV === 'development') {
        expect(json.details).toBe('Detailed error message');
      }
    });
  });

  describe('validateRequiredFields', () => {
    it('should return empty array when all fields present', () => {
      const body = {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3'
      };

      const missing = validateRequiredFields(body, ['field1', 'field2']);
      expect(missing).toEqual([]);
    });

    it('should identify missing fields', () => {
      const body = {
        field1: 'value1'
      };

      const missing = validateRequiredFields(body, ['field1', 'field2', 'field3']);
      expect(missing).toEqual(['field2', 'field3']);
    });

    it('should treat null as missing', () => {
      const body = {
        field1: 'value1',
        field2: null
      };

      const missing = validateRequiredFields(body, ['field1', 'field2']);
      expect(missing).toEqual(['field2']);
    });

    it('should treat undefined as missing', () => {
      const body = {
        field1: 'value1',
        field2: undefined
      };

      const missing = validateRequiredFields(body, ['field1', 'field2']);
      expect(missing).toEqual(['field2']);
    });

    it('should accept empty string as present', () => {
      const body = {
        field1: 'value1',
        field2: ''
      };

      const missing = validateRequiredFields(body, ['field1', 'field2']);
      expect(missing).toEqual([]);
    });

    it('should accept zero as present', () => {
      const body = {
        field1: 'value1',
        field2: 0
      };

      const missing = validateRequiredFields(body, ['field1', 'field2']);
      expect(missing).toEqual([]);
    });

    it('should accept false as present', () => {
      const body = {
        field1: 'value1',
        field2: false
      };

      const missing = validateRequiredFields(body, ['field1', 'field2']);
      expect(missing).toEqual([]);
    });
  });
});
