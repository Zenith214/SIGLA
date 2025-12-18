import {
  getActiveCycle,
  setActiveCycle,
  validateSingleActiveCycle,
  createSurveyCycle,
  getSurveyCycles,
  getActiveCycleId,
  createCycleScopedWhere,
  generateSurveyNumber,
  getNextSurveySequence,
  getSurveyCycleById,
  getHistoricalCycles,
  createSpecificCycleScopedWhere,
  SurveyCycle
} from '../surveyCycleHelpers';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

import { supabaseAdmin } from '@/lib/supabase';

describe('Survey Cycle Helpers', () => {
  const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
  
  // Mock survey cycle data
  const mockActiveCycle: SurveyCycle = {
    cycle_id: 1,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: true,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-12-31'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  const mockInactiveCycle: SurveyCycle = {
    cycle_id: 2,
    name: 'Survey Cycle 2023',
    year: 2023,
    is_active: false,
    start_date: new Date('2023-01-01'),
    end_date: new Date('2023-12-31'),
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveCycle', () => {
    it('should return the active cycle when one exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await getActiveCycle();

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('survey_cycle');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result).toEqual(mockActiveCycle);
    });

    it('should return null when no active cycle exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await getActiveCycle();

      expect(result).toBeNull();
    });

    it('should throw error when database error occurs', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'OTHER_ERROR', message: 'Database error' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      await expect(getActiveCycle()).rejects.toThrow('Failed to retrieve active survey cycle');
    });
  });

  describe('setActiveCycle', () => {
    it('should successfully set a cycle as active', async () => {
      // Mock cycle existence check
      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockInactiveCycle, error: null })
      };

      // Mock deactivate query
      const mockDeactivateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      // Mock activate query
      const mockActivateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockSelectQuery as any)
        .mockReturnValueOnce(mockDeactivateQuery as any)
        .mockReturnValueOnce(mockActivateQuery as any);

      await setActiveCycle(2);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledTimes(3);
      expect(mockSelectQuery.eq).toHaveBeenCalledWith('cycle_id', 2);
      expect(mockDeactivateQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockActivateQuery.eq).toHaveBeenCalledWith('cycle_id', 2);
    });

    it('should throw error when cycle does not exist', async () => {
      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };

      mockSupabaseAdmin.from.mockReturnValue(mockSelectQuery as any);

      await expect(setActiveCycle(999)).rejects.toThrow('Survey cycle with ID 999 not found');
    });

    it('should throw error when deactivation fails', async () => {
      const deactivationError = { message: 'Deactivation failed' };
      
      const mockSelectQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockInactiveCycle, error: null })
      };

      const mockDeactivateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: deactivationError })
      };

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockSelectQuery as any)
        .mockReturnValueOnce(mockDeactivateQuery as any);

      await expect(setActiveCycle(2)).rejects.toEqual(deactivationError);
    });
  });

  describe('validateSingleActiveCycle', () => {
    it('should return true when no active cycles exist', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await validateSingleActiveCycle();

      expect(result).toBe(true);
    });

    it('should return true when exactly one active cycle exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ cycle_id: 1 }], error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await validateSingleActiveCycle();

      expect(result).toBe(true);
    });

    it('should return false when multiple active cycles exist', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [{ cycle_id: 1 }, { cycle_id: 2 }], error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await validateSingleActiveCycle();

      expect(result).toBe(false);
    });

    it('should throw error when database error occurs', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      await expect(validateSingleActiveCycle()).rejects.toThrow('Failed to validate active cycle constraint');
    });
  });

  describe('createSurveyCycle', () => {
    it('should successfully create a new survey cycle', async () => {
      const newCycle = {
        cycle_id: 3,
        name: 'Survey Cycle 2025',
        year: 2025,
        is_active: false,
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        created_at: new Date(),
        updated_at: null
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: newCycle, error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await createSurveyCycle('Survey Cycle 2025', 2025, new Date('2025-01-01'), new Date('2025-12-31'));

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('survey_cycle');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        name: 'Survey Cycle 2025',
        year: 2025,
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        is_active: false
      });
      expect(result).toEqual(newCycle);
    });

    it('should throw error when creation fails', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Creation failed' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      await expect(createSurveyCycle('Test Cycle', 2025)).rejects.toThrow('Failed to create survey cycle');
    });
  });

  describe('getActiveCycleId', () => {
    it('should return active cycle ID when active cycle exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await getActiveCycleId();

      expect(result).toBe(1);
    });

    it('should return null when no active cycle exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await getActiveCycleId();

      expect(result).toBeNull();
    });
  });

  describe('createCycleScopedWhere', () => {
    it('should create where conditions with active cycle ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await createCycleScopedWhere({ barangay_id: 5 });

      expect(result).toEqual({
        barangay_id: 5,
        survey_cycle_id: 1
      });
    });

    it('should create where conditions with null cycle ID when no active cycle', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await createCycleScopedWhere({ barangay_id: 5 });

      expect(result).toEqual({
        barangay_id: 5,
        survey_cycle_id: null
      });
    });
  });

  describe('generateSurveyNumber', () => {
    it('should generate correct survey number format', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await generateSurveyNumber(5, 123);

      expect(result).toBe('05-2024-0123');
    });

    it('should throw error when no active cycle exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      await expect(generateSurveyNumber(5, 123)).rejects.toThrow('No active survey cycle found. Cannot generate survey number.');
    });
  });

  describe('getNextSurveySequence', () => {
    it('should return next sequence number for active cycle', async () => {
      // Mock getActiveCycleId
      const mockActiveCycleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };

      // Mock count query
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ count: 5, error: null })
      };

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockActiveCycleQuery as any)
        .mockReturnValueOnce(mockCountQuery as any);

      const result = await getNextSurveySequence();

      expect(result).toBe(6);
    });

    it('should return 1 when no surveys exist in active cycle', async () => {
      // Mock getActiveCycleId
      const mockActiveCycleQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };

      // Mock count query
      const mockCountQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({ count: 0, error: null })
      };

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockActiveCycleQuery as any)
        .mockReturnValueOnce(mockCountQuery as any);

      const result = await getNextSurveySequence();

      expect(result).toBe(1);
    });

    it('should throw error when no active cycle exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      await expect(getNextSurveySequence()).rejects.toThrow('No active survey cycle found. Cannot generate sequence number.');
    });
  });

  describe('getSurveyCycleById', () => {
    it('should return cycle when it exists', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockActiveCycle, error: null })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await getSurveyCycleById(1);

      expect(result).toEqual(mockActiveCycle);
      expect(mockQuery.eq).toHaveBeenCalledWith('cycle_id', 1);
    });

    it('should return null when cycle does not exist', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      
      mockSupabaseAdmin.from.mockReturnValue(mockQuery as any);

      const result = await getSurveyCycleById(999);

      expect(result).toBeNull();
    });
  });

  describe('createSpecificCycleScopedWhere', () => {
    it('should create where conditions with specific cycle ID', () => {
      const result = createSpecificCycleScopedWhere(5, { barangay_id: 10 });

      expect(result).toEqual({
        barangay_id: 10,
        survey_cycle_id: 5
      });
    });

    it('should work with empty additional conditions', () => {
      const result = createSpecificCycleScopedWhere(3);

      expect(result).toEqual({
        survey_cycle_id: 3
      });
    });
  });
});