/**
 * API Input Validation Schemas
 * Zod schemas for validating API request inputs
 */

import { z } from 'zod';
import { createValidationError } from './api-error-handler';

// Service area enum
export const ServiceAreaSchema = z.enum([
  'financial',
  'disaster',
  'health',
  'peace',
  'infrastructure',
  'environmental',
]);

export type ServiceAreaType = z.infer<typeof ServiceAreaSchema>;

// Barangay comparison request schema
export const BarangayComparisonRequestSchema = z.object({
  barangay_ids: z
    .array(z.number().int().positive('Barangay ID must be a positive integer'))
    .min(2, 'At least 2 barangays are required for comparison')
    .max(5, 'Maximum 5 barangays can be compared at once')
    .refine((ids: number[]) => new Set(ids).size === ids.length, {
      message: 'Barangay IDs must be unique',
    }),
  cycle_id: z.number().int().positive('Cycle ID must be a positive integer'),
  metrics: z
    .array(z.enum(['service_scores', 'awards', 'trends']))
    .optional()
    .default(['service_scores', 'awards']),
});

export type BarangayComparisonRequest = z.infer<typeof BarangayComparisonRequestSchema>;

// Service area rankings query schema
export const ServiceAreaRankingsQuerySchema = z.object({
  service_area: ServiceAreaSchema,
  cycle_id: z.string().transform((val: string, ctx: z.RefinementCtx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cycle ID must be a positive integer',
      });
      return z.NEVER;
    }
    return parsed;
  }),
});

export type ServiceAreaRankingsQuery = z.infer<typeof ServiceAreaRankingsQuerySchema>;

// Service trends query schema
export const ServiceTrendsQuerySchema = z.object({
  service_area: ServiceAreaSchema,
  barangay_id: z
    .string()
    .optional()
    .transform((val: string | undefined, ctx: z.RefinementCtx) => {
      if (!val) return undefined;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Barangay ID must be a positive integer',
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export type ServiceTrendsQuery = z.infer<typeof ServiceTrendsQuerySchema>;

// Award leaderboard query schema
export const AwardLeaderboardQuerySchema = z.object({
  sort_by: z
    .enum(['total_awards', 'win_rate', 'consecutive_streak', 'last_award'])
    .optional()
    .default('total_awards'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z
    .string()
    .optional()
    .default('25')
    .transform((val: string, ctx: z.RefinementCtx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Limit must be between 1 and 100',
        });
        return z.NEVER;
      }
      return parsed;
    }),
  year_filter: z
    .string()
    .optional()
    .transform((val: string | undefined, ctx: z.RefinementCtx) => {
      if (!val) return undefined;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 2000 || parsed > 2100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Year must be between 2000 and 2100',
        });
        return z.NEVER;
      }
      return parsed;
    }),
  cycle_filter: z
    .string()
    .optional()
    .transform((val: string | undefined, ctx: z.RefinementCtx) => {
      if (!val) return undefined;
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cycle ID must be a positive integer',
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export type AwardLeaderboardQuery = z.infer<typeof AwardLeaderboardQuerySchema>;

// Validation helper function
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: Error } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const zodError = error as any;
      const firstError = zodError.errors[0];
      const field = firstError.path.join('.');
      const message = firstError.message;
      
      return {
        success: false,
        error: createValidationError(
          message,
          field,
          firstError.path.length > 0 ? (data as any)[firstError.path[0]] : undefined
        ),
      };
    }
    
    return {
      success: false,
      error: createValidationError('Invalid request data'),
    };
  }
};

// Validate query parameters from URL
export const validateQueryParams = <T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: Error } => {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return validateRequest(schema, params);
};

// Data sanitization helpers
export const sanitizeString = (value: string, maxLength: number = 255): string => {
  return value
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, ''); // Remove HTML tags
};

export const sanitizeNumber = (value: number, min?: number, max?: number): number => {
  let sanitized = value;
  
  if (min !== undefined && sanitized < min) {
    sanitized = min;
  }
  
  if (max !== undefined && sanitized > max) {
    sanitized = max;
  }
  
  return sanitized;
};

export const sanitizeArray = <T>(
  value: T[],
  maxLength: number = 100
): T[] => {
  return value.slice(0, maxLength);
};

// Score validation (0-100 range)
export const validateScore = (score: number): number => {
  return sanitizeNumber(score, 0, 100);
};

// Validate and sanitize service scores
export const validateServiceScores = (scores: any): {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
} => {
  return {
    financial: validateScore(scores?.financial ?? 0),
    disaster: validateScore(scores?.disaster ?? 0),
    health: validateScore(scores?.health ?? 0),
    peace: validateScore(scores?.peace ?? 0),
    infrastructure: validateScore(scores?.infrastructure ?? 0),
    environmental: validateScore(scores?.environmental ?? 0),
  };
};

// Type guard for service area
export const isServiceAreaType = (value: string): value is ServiceAreaType => {
  return ['financial', 'disaster', 'health', 'peace', 'infrastructure', 'environmental'].includes(
    value
  );
};

// Validate date range
export const validateDateRange = (
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } => {
  if (startDate > endDate) {
    return {
      valid: false,
      error: 'Start date must be before end date',
    };
  }
  
  const now = new Date();
  if (endDate > now) {
    return {
      valid: false,
      error: 'End date cannot be in the future',
    };
  }
  
  // Check if range is reasonable (not more than 10 years)
  const maxRange = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
  if (endDate.getTime() - startDate.getTime() > maxRange) {
    return {
      valid: false,
      error: 'Date range cannot exceed 10 years',
    };
  }
  
  return { valid: true };
};

// Validate cycle ID exists
export const validateCycleId = async (
  cycleId: number,
  supabase: any
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('survey_cycle')
      .select('cycle_id')
      .eq('cycle_id', cycleId)
      .single();
    
    if (error || !data) {
      return {
        valid: false,
        error: `Cycle ID ${cycleId} does not exist`,
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate cycle ID',
    };
  }
};

// Validate barangay IDs exist
export const validateBarangayIds = async (
  barangayIds: number[],
  supabase: any
): Promise<{ valid: boolean; error?: string; invalidIds?: number[] }> => {
  try {
    const { data, error } = await supabase
      .from('barangay')
      .select('barangay_id')
      .in('barangay_id', barangayIds);
    
    if (error) {
      return {
        valid: false,
        error: 'Failed to validate barangay IDs',
      };
    }
    
    const validIds = new Set(data.map((b: any) => b.barangay_id));
    const invalidIds = barangayIds.filter((id) => !validIds.has(id));
    
    if (invalidIds.length > 0) {
      return {
        valid: false,
        error: `Invalid barangay IDs: ${invalidIds.join(', ')}`,
        invalidIds,
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate barangay IDs',
    };
  }
};
