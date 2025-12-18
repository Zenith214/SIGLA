/**
 * Analytics Types and Interfaces
 * 
 * Type definitions for the Enhanced Analytics Dashboard
 * Includes service area types, comparison data, rankings, and awards
 */

// ============================================================================
// Service Area Types
// ============================================================================

export type ServiceAreaType = 
  | 'financial' 
  | 'disaster' 
  | 'health' 
  | 'peace' 
  | 'infrastructure' 
  | 'environmental';

export interface ServiceScores {
  financial: number;
  disaster: number;
  health: number;
  peace: number;
  infrastructure: number;
  environmental: number;
}

// ============================================================================
// Barangay Comparison Types
// ============================================================================

export interface BarangayComparisonData {
  barangay_id: number;
  name: string;
  service_scores: ServiceScores;
  overall_satisfaction: number;
  awards: AwardData;
  action_grid: ActionGridData;
}

export interface ActionGridData {
  maintain: ServiceAreaType[];
  fix_now: ServiceAreaType[];
  monitor: ServiceAreaType[];
  low_priority: ServiceAreaType[];
}

// ============================================================================
// Award Types
// ============================================================================

export interface AwardData {
  total: number;
  consecutive: number;
  win_rate: number;
}

export interface AwardLeaderboardEntry {
  rank: number;
  barangay_id: number;
  name: string;
  total_awards: number;
  consecutive_years: number;
  win_rate: number;
  last_award_year: number;
  years_since_last_award: number;
  first_time_winner: boolean;
  award_history: AwardHistoryItem[];
}

export interface AwardHistoryItem {
  year: number;
  cycle_id: number;
  award_type: string;
}

export interface AwardStatistics {
  top_10_lifetime: {
    barangay_id: number;
    name: string;
    total_awards: number;
    win_rate: number;
    consecutive_streak: number;
  }[];
  recent_winners: {
    cycle_id: number;
    year: number;
    winners: string[];
  }[];
  award_distribution: {
    barangay_name: string;
    award_count: number;
  }[];
}

// ============================================================================
// Service Area Rankings Types
// ============================================================================

export interface ServiceAreaRanking {
  rank: number;
  barangay_id: number;
  name: string;
  satisfaction: number;
  need_action: number;
  trend: 'improving' | 'declining' | 'stable';
  improvement_rate: number;
}

export interface ServiceTrendData {
  cycle_id: number;
  year: number;
  satisfaction: number;
  need_action: number;
  awareness: number;
  availment: number;
}

export interface FunnelData {
  awareness: number;
  availment: number;
  satisfaction: number;
  awareness_to_availment_rate: number;
  availment_to_satisfaction_rate: number;
}

// ============================================================================
// Historical Cycle Types
// ============================================================================

export interface CycleMetrics {
  total_responses: number;
  total_assignments: number;
  target_responses: number;
  completion_rate: number;
}

export interface BarangayPerformance {
  barangay_id: number;
  name: string;
  responses: number;
  satisfaction: number;
  rank: number;
}

export interface ServiceAreaBreakdown {
  service_area: ServiceAreaType;
  satisfaction: number;
  need_action: number;
  awareness: number;
  availment: number;
}

export interface SatisfactionSummary {
  average: number;
  top_performer: {
    name: string;
    score: number;
  };
  bottom_performer: {
    name: string;
    score: number;
  };
}

// ============================================================================
// Overall Analytics Types
// ============================================================================

export interface SystemStatistics {
  total_barangays: number;
  total_cycles: number;
  total_responses: number;
  average_satisfaction: number;
}

export interface BarangayRanking {
  rank: number;
  barangay_id: number;
  name: string;
  overall_satisfaction: number;
  total_responses: number;
}

export interface ServiceAreaTrend {
  service_area: ServiceAreaType;
  current_satisfaction: number;
  previous_satisfaction: number;
  trend: 'improving' | 'declining' | 'stable';
  change_percentage: number;
}

export interface ImprovementRanking {
  barangay_id: number;
  name: string;
  improvement_velocity: number;
  cycles_analyzed: number;
  satisfaction_scores?: number[];
  average_satisfaction?: number;
  latest_satisfaction?: number;
  vs_system_average?: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface BarangayComparisonRequest {
  barangay_ids: number[];
  cycle_id: number;
  metrics: ('service_scores' | 'awards' | 'trends')[];
}

export interface BarangayComparisonResponse {
  barangays: BarangayComparisonData[];
}

export interface ServiceAreaRankingsParams {
  service_area: ServiceAreaType;
  cycle_id: number;
}

export interface ServiceAreaRankingsResponse {
  service_area: string;
  cycle_id: number;
  rankings: ServiceAreaRanking[];
}

export interface ServiceTrendsParams {
  service_area: string;
  barangay_id?: number;
}

export interface ServiceTrendsResponse {
  service_area: string;
  barangay_id?: number;
  trends: ServiceTrendData[];
}

export interface AwardLeaderboardParams {
  sort_by?: 'total_awards' | 'win_rate' | 'consecutive_streak' | 'last_award';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  year_filter?: number;
}

export interface AwardLeaderboardResponse {
  leaderboard: AwardLeaderboardEntry[];
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface RadarChartData {
  barangay_name: string;
  scores: ServiceScores;
}

export interface HeatmapCellData {
  barangay_name: string;
  service_area: ServiceAreaType;
  satisfaction: number;
  need_action: number;
  quadrant: 'maintain' | 'fix_now' | 'monitor' | 'low_priority';
}

export interface TimelineData {
  barangay_name: string;
  awards: AwardHistoryItem[];
}

// ============================================================================
// Type Guards
// ============================================================================

export const isServiceAreaType = (value: string): value is ServiceAreaType => {
  return ['financial', 'disaster', 'health', 'peace', 'infrastructure', 'environmental']
    .includes(value);
};

export const isValidServiceScores = (scores: any): scores is ServiceScores => {
  if (typeof scores !== 'object' || scores === null) {
    return false;
  }
  
  return (
    typeof scores.financial === 'number' &&
    typeof scores.disaster === 'number' &&
    typeof scores.health === 'number' &&
    typeof scores.peace === 'number' &&
    typeof scores.infrastructure === 'number' &&
    typeof scores.environmental === 'number'
  );
};

export const isValidTrend = (value: string): value is 'improving' | 'declining' | 'stable' => {
  return ['improving', 'declining', 'stable'].includes(value);
};

export const isValidQuadrant = (value: string): value is 'maintain' | 'fix_now' | 'monitor' | 'low_priority' => {
  return ['maintain', 'fix_now', 'monitor', 'low_priority'].includes(value);
};

// ============================================================================
// Utility Types
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
