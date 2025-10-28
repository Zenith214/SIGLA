/**
 * Data Validation and Sanitization Utilities
 * Validates and sanitizes data before rendering charts and components
 */

import { ServiceAreaType } from '@/lib/api-validators';

// Service scores interface
export interface ServiceScores {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
}

// Validate and sanitize score (0-100 range)
export const validateScore = (score: any): number => {
  // Handle null, undefined, NaN
  if (score === null || score === undefined || isNaN(Number(score))) {
    return 0;
  }

  const numScore = Number(score);

  // Clamp to 0-100 range
  if (numScore < 0) return 0;
  if (numScore > 100) return 100;

  // Round to nearest integer
  return Math.round(numScore);
};

// Validate service scores object
export const validateServiceScores = (scores: any): ServiceScores => {
  if (!scores || typeof scores !== 'object') {
    return {
      financial: 0,
      disaster: 0,
      health: 0,
      peace: 0,
      infrastructure: 0,
      environmental: 0,
    };
  }

  return {
    financial: validateScore(scores.financial),
    disaster: validateScore(scores.disaster),
    health: validateScore(scores.health),
    peace: validateScore(scores.peace),
    infrastructure: validateScore(scores.infrastructure),
    environmental: validateScore(scores.environmental),
  };
};

// Check if service scores have any data
export const hasServiceScoresData = (scores: ServiceScores): boolean => {
  return Object.values(scores).some((score) => score > 0);
};

// Get missing service areas
export const getMissingServiceAreas = (scores: ServiceScores): ServiceAreaType[] => {
  const missing: ServiceAreaType[] = [];
  const serviceAreas: ServiceAreaType[] = [
    'financial',
    'disaster',
    'health',
    'peace',
    'infrastructure',
    'environmental',
  ];

  serviceAreas.forEach((area: ServiceAreaType) => {
    if (scores[area] === 0) {
      missing.push(area);
    }
  });

  return missing;
};

// Validate array data
export const validateArrayData = <T>(
  data: any,
  validator: (item: any) => T | null
): T[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(validator)
    .filter((item): item is T => item !== null);
};

// Sanitize null/undefined values in object
export const sanitizeObject = <T extends Record<string, any>>(
  obj: any,
  defaults: T
): T => {
  if (!obj || typeof obj !== 'object') {
    return defaults;
  }

  const sanitized = { ...defaults };

  Object.keys(defaults).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined) {
      sanitized[key as keyof T] = obj[key];
    }
  });

  return sanitized;
};

// Validate barangay comparison data
export interface BarangayComparisonData {
  barangay_id: number;
  name: string;
  service_scores: ServiceScores;
  overall_satisfaction: number;
  awards?: {
    total: number;
    consecutive: number;
    win_rate: number;
  };
  action_grid?: {
    maintain: string[];
    fix_now: string[];
    monitor: string[];
    low_priority: string[];
  };
}

export const validateBarangayComparisonData = (
  data: any
): BarangayComparisonData | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Required fields
  if (!data.barangay_id || !data.name) {
    return null;
  }

  return {
    barangay_id: Number(data.barangay_id),
    name: String(data.name),
    service_scores: validateServiceScores(data.service_scores),
    overall_satisfaction: validateScore(data.overall_satisfaction),
    awards: data.awards
      ? {
          total: Math.max(0, Number(data.awards.total) || 0),
          consecutive: Math.max(0, Number(data.awards.consecutive) || 0),
          win_rate: validateScore(data.awards.win_rate),
        }
      : undefined,
    action_grid: data.action_grid
      ? {
          maintain: Array.isArray(data.action_grid.maintain)
            ? data.action_grid.maintain
            : [],
          fix_now: Array.isArray(data.action_grid.fix_now)
            ? data.action_grid.fix_now
            : [],
          monitor: Array.isArray(data.action_grid.monitor)
            ? data.action_grid.monitor
            : [],
          low_priority: Array.isArray(data.action_grid.low_priority)
            ? data.action_grid.low_priority
            : [],
        }
      : undefined,
  };
};

// Validate service area ranking data
export interface ServiceAreaRanking {
  rank: number;
  barangay_id: number;
  name: string;
  satisfaction: number;
  need_action: number;
  trend: 'improving' | 'declining' | 'stable';
  improvement_rate: number;
}

export const validateServiceAreaRanking = (
  data: any
): ServiceAreaRanking | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Required fields
  if (!data.barangay_id || !data.name) {
    return null;
  }

  // Validate trend
  const validTrends = ['improving', 'declining', 'stable'];
  const trend = validTrends.includes(data.trend) ? data.trend : 'stable';

  return {
    rank: Math.max(1, Number(data.rank) || 1),
    barangay_id: Number(data.barangay_id),
    name: String(data.name),
    satisfaction: validateScore(data.satisfaction),
    need_action: validateScore(data.need_action),
    trend,
    improvement_rate: Number(data.improvement_rate) || 0,
  };
};

// Validate service trend data
export interface ServiceTrendData {
  cycle_id: number;
  year: number;
  satisfaction: number;
  need_action: number;
  awareness?: number;
  availment?: number;
}

export const validateServiceTrendData = (data: any): ServiceTrendData | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Required fields
  if (!data.cycle_id || !data.year) {
    return null;
  }

  return {
    cycle_id: Number(data.cycle_id),
    year: Number(data.year),
    satisfaction: validateScore(data.satisfaction),
    need_action: validateScore(data.need_action),
    awareness: data.awareness !== undefined ? validateScore(data.awareness) : undefined,
    availment: data.availment !== undefined ? validateScore(data.availment) : undefined,
  };
};

// Validate award leaderboard entry
export interface AwardLeaderboardEntry {
  rank: number;
  barangay_id: number;
  name: string;
  total_awards: number;
  consecutive_streak: number;
  longest_streak: number;
  win_rate: number;
  last_award_year: number | null;
  years_since_last_award: number | null;
  first_time_winner: boolean;
  award_history: Array<{
    year: number;
    cycle_id: number;
    awarded_date?: string;
  }>;
}

export const validateAwardLeaderboardEntry = (
  data: any
): AwardLeaderboardEntry | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Required fields
  if (!data.barangay_id || !data.name) {
    return null;
  }

  return {
    rank: Math.max(1, Number(data.rank) || 1),
    barangay_id: Number(data.barangay_id),
    name: String(data.name),
    total_awards: Math.max(0, Number(data.total_awards) || 0),
    consecutive_streak: Math.max(0, Number(data.consecutive_streak) || 0),
    longest_streak: Math.max(0, Number(data.longest_streak) || 0),
    win_rate: validateScore(data.win_rate),
    last_award_year: data.last_award_year ? Number(data.last_award_year) : null,
    years_since_last_award: data.years_since_last_award
      ? Number(data.years_since_last_award)
      : null,
    first_time_winner: Boolean(data.first_time_winner),
    award_history: Array.isArray(data.award_history)
      ? data.award_history
          .map((award: { year?: number; cycle_id?: number; awarded_date?: string }) => {
            if (!award || !award.year || !award.cycle_id) return null;
            return {
              year: Number(award.year),
              cycle_id: Number(award.cycle_id),
              awarded_date: award.awarded_date ? String(award.awarded_date) : undefined,
            };
          })
          .filter((award: any): award is { year: number; cycle_id: number; awarded_date?: string } => award !== null)
      : [],
  };
};

// Validate funnel data
export interface FunnelData {
  awareness: number;
  availment: number;
  satisfaction: number;
  awareness_to_availment_rate: number;
  availment_to_satisfaction_rate: number;
}

export const validateFunnelData = (data: any): FunnelData => {
  if (!data || typeof data !== 'object') {
    return {
      awareness: 0,
      availment: 0,
      satisfaction: 0,
      awareness_to_availment_rate: 0,
      availment_to_satisfaction_rate: 0,
    };
  }

  return {
    awareness: validateScore(data.awareness),
    availment: validateScore(data.availment),
    satisfaction: validateScore(data.satisfaction),
    awareness_to_availment_rate: validateScore(data.awareness_to_availment_rate),
    availment_to_satisfaction_rate: validateScore(data.availment_to_satisfaction_rate),
  };
};

// Check if funnel data is valid (has progression)
export const isFunnelDataValid = (data: FunnelData): boolean => {
  // Funnel should show progression: awareness >= availment >= satisfaction
  return (
    data.awareness > 0 &&
    data.awareness >= data.availment &&
    data.availment >= data.satisfaction
  );
};

// Data quality check
export interface DataQualityReport {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  missingFields: string[];
}

export const checkDataQuality = (
  data: any,
  requiredFields: string[]
): DataQualityReport => {
  const report: DataQualityReport = {
    isValid: true,
    warnings: [],
    errors: [],
    missingFields: [],
  };

  // Check if data exists
  if (!data || typeof data !== 'object') {
    report.isValid = false;
    report.errors.push('Data is null or not an object');
    return report;
  }

  // Check required fields
  requiredFields.forEach((field) => {
    if (data[field] === null || data[field] === undefined) {
      report.missingFields.push(field);
      report.warnings.push(`Missing required field: ${field}`);
    }
  });

  // Check for invalid scores
  const scoreFields = Object.keys(data).filter((key) =>
    key.includes('satisfaction') ||
    key.includes('score') ||
    key.includes('rate')
  );

  scoreFields.forEach((field) => {
    const value = data[field];
    if (typeof value === 'number' && (value < 0 || value > 100)) {
      report.warnings.push(`Score out of range (0-100): ${field} = ${value}`);
    }
  });

  // Set overall validity
  report.isValid = report.errors.length === 0;

  return report;
};

// Sanitize chart data for Recharts
export const sanitizeChartData = <T extends Record<string, any>>(
  data: T[]
): T[] => {
  return data.map((item) => {
    const sanitized = { ...item };

    // Replace null/undefined/NaN with 0 for numeric fields
    Object.keys(sanitized).forEach((key) => {
      const value = sanitized[key];
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        (sanitized as any)[key] = 0;
      } else if (value === null || value === undefined) {
        // Keep string fields as empty string, numbers as 0
        (sanitized as any)[key] = typeof item[key] === 'number' ? 0 : '';
      }
    });

    return sanitized;
  });
};

// Format service area name
export const formatServiceAreaName = (serviceArea: ServiceAreaType): string => {
  const names: Record<ServiceAreaType, string> = {
    financial: 'Financial Assistance',
    disaster: 'Disaster Preparedness',
    health: 'Health Services',
    peace: 'Peace and Order',
    infrastructure: 'Infrastructure',
    environmental: 'Environmental Management',
  };

  return names[serviceArea] || serviceArea;
};

// Validate percentage value
export const validatePercentage = (value: any): number => {
  return validateScore(value);
};

// Validate year
export const validateYear = (year: any): number => {
  const numYear = Number(year);
  if (isNaN(numYear) || numYear < 2000 || numYear > 2100) {
    return new Date().getFullYear();
  }
  return numYear;
};

// Validate ID
export const validateId = (id: any): number => {
  const numId = Number(id);
  if (isNaN(numId) || numId <= 0) {
    return 0;
  }
  return Math.floor(numId);
};
