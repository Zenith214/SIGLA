/**
 * Chart Utilities and Helpers
 * 
 * Data transformation, color palettes, and validation helpers for chart rendering
 * Ensures WCAG-compliant colors and proper data sanitization
 */

import type {
  ServiceAreaType,
  ServiceScores,
  BarangayComparisonData,
  ServiceAreaRanking,
  RadarChartData,
  HeatmapCellData,
} from '@/types/analytics';

// ============================================================================
// Color Palettes (WCAG AA Compliant)
// ============================================================================

/**
 * Primary color palette with 4.5:1 contrast ratio on white background
 */
export const colors = {
  excellent: '#059669', // Green - for high satisfaction (80-100%)
  good: '#2563eb',      // Blue - for good satisfaction (60-79%)
  fair: '#d97706',      // Orange - for fair satisfaction (40-59%)
  poor: '#dc2626',      // Red - for poor satisfaction (0-39%)
  text: '#1f2937',      // Dark gray - for primary text
  textLight: '#6b7280', // Medium gray - for secondary text
  border: '#e5e7eb',    // Light gray - for borders
  background: '#f9fafb', // Very light gray - for backgrounds
} as const;

/**
 * Color-blind safe palette for multi-barangay comparisons
 * Distinguishable for users with color vision deficiencies
 */
export const colorBlindSafeColors = [
  '#0173B2', // Blue
  '#DE8F05', // Orange
  '#029E73', // Green
  '#CC78BC', // Purple
  '#CA9161', // Brown
  '#949494', // Gray
  '#ECE133', // Yellow
  '#56B4E9', // Sky Blue
] as const;

/**
 * Action grid quadrant colors
 */
export const quadrantColors = {
  maintain: '#10b981',     // Green - high satisfaction, low need
  fix_now: '#ef4444',      // Red - low satisfaction, high need
  monitor: '#f59e0b',      // Yellow - medium satisfaction/need
  low_priority: '#9ca3af', // Gray - low satisfaction, low need
} as const;

// ============================================================================
// Data Transformation Functions
// ============================================================================

/**
 * Transform barangay comparison data for radar chart
 */
export const transformToRadarData = (
  data: BarangayComparisonData[]
): RadarChartData[] => {
  return data.map((barangay) => ({
    barangay_name: barangay.name,
    scores: barangay.service_scores,
  }));
};

/**
 * Transform service scores to array format for charts
 */
export const serviceScoresToArray = (scores: ServiceScores) => {
  return [
    { area: 'Financial', value: scores.financial },
    { area: 'Disaster', value: scores.disaster },
    { area: 'Health', value: scores.health },
    { area: 'Peace', value: scores.peace },
    { area: 'Infrastructure', value: scores.infrastructure },
    { area: 'Environmental', value: scores.environmental },
  ];
};

/**
 * Transform barangay comparison data for heatmap
 */
export const transformToHeatmapData = (
  data: BarangayComparisonData[]
): HeatmapCellData[] => {
  const cells: HeatmapCellData[] = [];
  
  data.forEach((barangay) => {
    const serviceAreas: ServiceAreaType[] = [
      'financial',
      'disaster',
      'health',
      'peace',
      'infrastructure',
      'environmental',
    ];
    
    serviceAreas.forEach((area) => {
      const quadrant = getQuadrantForService(area, barangay.action_grid);
      
      cells.push({
        barangay_name: barangay.name,
        service_area: area,
        satisfaction: barangay.service_scores[area],
        need_action: 0, // Will be populated from API
        quadrant,
      });
    });
  });
  
  return cells;
};

/**
 * Get quadrant classification for a service area
 */
const getQuadrantForService = (
  serviceArea: ServiceAreaType,
  actionGrid: BarangayComparisonData['action_grid']
): 'maintain' | 'fix_now' | 'monitor' | 'low_priority' => {
  if (actionGrid.maintain.includes(serviceArea)) return 'maintain';
  if (actionGrid.fix_now.includes(serviceArea)) return 'fix_now';
  if (actionGrid.monitor.includes(serviceArea)) return 'monitor';
  return 'low_priority';
};

// ============================================================================
// Data Sanitization Functions
// ============================================================================

/**
 * Sanitize numeric value for chart rendering
 * Handles null, undefined, NaN, and out-of-range values
 */
export const sanitizeNumericValue = (
  value: any,
  defaultValue: number = 0,
  min: number = 0,
  max: number = 100
): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue;
  }
  
  const num = Number(value);
  return Math.max(min, Math.min(max, num));
};

/**
 * Sanitize service scores object
 */
export const sanitizeServiceScores = (scores: Partial<ServiceScores>): ServiceScores => {
  return {
    financial: sanitizeNumericValue(scores.financial),
    disaster: sanitizeNumericValue(scores.disaster),
    health: sanitizeNumericValue(scores.health),
    peace: sanitizeNumericValue(scores.peace),
    infrastructure: sanitizeNumericValue(scores.infrastructure),
    environmental: sanitizeNumericValue(scores.environmental),
  };
};

/**
 * Sanitize array of rankings data
 */
export const sanitizeRankingsData = (
  rankings: ServiceAreaRanking[]
): ServiceAreaRanking[] => {
  return rankings.map((ranking) => ({
    ...ranking,
    satisfaction: sanitizeNumericValue(ranking.satisfaction),
    need_action: sanitizeNumericValue(ranking.need_action),
    improvement_rate: sanitizeNumericValue(ranking.improvement_rate, 0, -100, 100),
  }));
};

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that chart data is not empty
 */
export const hasChartData = (data: any[] | null | undefined): boolean => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Validate service scores completeness
 */
export const hasCompleteServiceScores = (scores: Partial<ServiceScores>): boolean => {
  const requiredFields: (keyof ServiceScores)[] = [
    'financial',
    'disaster',
    'health',
    'peace',
    'infrastructure',
    'environmental',
  ];
  
  return requiredFields.every(
    (field) => scores[field] !== null && scores[field] !== undefined
  );
};

/**
 * Validate barangay selection count (2-5 required)
 */
export const isValidBarangaySelection = (count: number): boolean => {
  return count >= 2 && count <= 5;
};

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Get color based on satisfaction score
 */
export const getSatisfactionColor = (score: number): string => {
  if (score >= 80) return colors.excellent;
  if (score >= 60) return colors.good;
  if (score >= 40) return colors.fair;
  return colors.poor;
};

/**
 * Get color for barangay comparison (from color-blind safe palette)
 */
export const getBarangayColor = (index: number): string => {
  return colorBlindSafeColors[index % colorBlindSafeColors.length];
};

/**
 * Get quadrant color
 */
export const getQuadrantColor = (
  quadrant: 'maintain' | 'fix_now' | 'monitor' | 'low_priority'
): string => {
  return quadrantColors[quadrant];
};

/**
 * Get trend indicator color
 */
export const getTrendColor = (trend: 'improving' | 'declining' | 'stable'): string => {
  if (trend === 'improving') return colors.excellent;
  if (trend === 'declining') return colors.poor;
  return colors.textLight;
};

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format percentage value for display
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

/**
 * Get service area display name
 */
export const getServiceAreaLabel = (serviceArea: ServiceAreaType): string => {
  const labels: Record<ServiceAreaType, string> = {
    financial: 'Financial Assistance',
    disaster: 'Disaster Preparedness',
    health: 'Health Services',
    peace: 'Peace and Order',
    infrastructure: 'Infrastructure',
    environmental: 'Environmental Management',
  };
  
  return labels[serviceArea];
};

/**
 * Get trend indicator symbol
 */
export const getTrendSymbol = (trend: 'improving' | 'declining' | 'stable'): string => {
  if (trend === 'improving') return '↑';
  if (trend === 'declining') return '↓';
  return '→';
};

/**
 * Get trend indicator label for screen readers
 */
export const getTrendLabel = (trend: 'improving' | 'declining' | 'stable'): string => {
  if (trend === 'improving') return 'Improving';
  if (trend === 'declining') return 'Declining';
  return 'Stable';
};

// ============================================================================
// Chart Configuration Helpers
// ============================================================================

/**
 * Get responsive chart dimensions based on screen size
 */
export const getResponsiveChartSize = (
  screenWidth: number
): { width: number; height: number } => {
  if (screenWidth < 640) {
    // Mobile
    return { width: 300, height: 300 };
  } else if (screenWidth < 1024) {
    // Tablet
    return { width: 400, height: 350 };
  } else {
    // Desktop
    return { width: 600, height: 400 };
  }
};

/**
 * Calculate action grid quadrant based on satisfaction and need-action scores
 * Uses dynamic cut-off based on sample size (CSIS methodology)
 * 
 * @param satisfaction - Satisfaction score (0-100)
 * @param needAction - Need for action score (0-100)
 * @param sampleSize - Sample size for calculating margin of error (optional, defaults to 150)
 */
export const calculateQuadrant = (
  satisfaction: number,
  needAction: number,
  sampleSize: number = 150
): 'maintain' | 'fix_now' | 'monitor' | 'low_priority' => {
  // Calculate dynamic cut-off using CSIS methodology
  // MoE = 0.98 / sqrt(n)
  const moe = sampleSize > 0 ? 0.98 / Math.sqrt(sampleSize) : 0.08;
  // Cut-off = 50% + MoE
  const cutoffDecimal = 0.50 + moe;
  const cutoffPercentage = cutoffDecimal * 100;
  
  // Classify scores as High or Low based on dynamic cut-off
  const satisfactionHigh = satisfaction >= cutoffPercentage;
  const needActionHigh = needAction >= cutoffPercentage;
  
  if (satisfactionHigh && needActionHigh) {
    return 'maintain'; // High satisfaction, high need (Continued Emphasis)
  } else if (!satisfactionHigh && needActionHigh) {
    return 'fix_now'; // Low satisfaction, high need (Opportunities for Improvement)
  } else if (satisfactionHigh && !needActionHigh) {
    return 'monitor'; // High satisfaction, low need (Exceeded Expectations)
  } else {
    return 'low_priority'; // Low satisfaction, low need (Secondary Priority)
  }
};

/**
 * Calculate improvement rate between two values
 */
export const calculateImprovementRate = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate improvement velocity (rate of change per cycle)
 */
export const calculateImprovementVelocity = (
  satisfactionChange: number,
  cyclesAnalyzed: number
): number => {
  if (cyclesAnalyzed <= 1) return 0;
  return satisfactionChange / (cyclesAnalyzed - 1);
};

/**
 * Determine trend based on improvement rate
 */
export const determineTrend = (
  improvementRate: number
): 'improving' | 'declining' | 'stable' => {
  const threshold = 5; // 5% threshold for stability
  
  if (improvementRate > threshold) return 'improving';
  if (improvementRate < -threshold) return 'declining';
  return 'stable';
};

// ============================================================================
// Data Quality Helpers
// ============================================================================

/**
 * Check if data point is missing or invalid
 */
export const isMissingData = (value: any): boolean => {
  return value === null || value === undefined || isNaN(value);
};

/**
 * Get missing data indicator text
 */
export const getMissingDataText = (): string => {
  return 'No Data';
};

/**
 * Filter out incomplete data points
 */
export const filterCompleteData = <T extends Record<string, any>>(
  data: T[],
  requiredFields: (keyof T)[]
): T[] => {
  return data.filter((item) =>
    requiredFields.every((field) => !isMissingData(item[field]))
  );
};
