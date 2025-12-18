// CPAP Module TypeScript Types and Interfaces

export type CPAPStatus = 'Draft' | 'Submitted' | 'Approved' | 'Revision_Requested';

export interface CPAP {
  id: number;
  barangay_id: number;
  cycle_id: number;
  status: CPAPStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  admin_comments: string | null;
  barangay?: {
    barangay_id: number;
    barangay_name: string;
  };
  cycle?: {
    cycle_id: number;
    name: string;
    year: number;
  };
  items: CPAPItem[];
}

export interface CPAPItem {
  id: number;
  cpap_id: number;
  priority_area: string;
  target_output: string;
  success_indicator: string;
  responsible_person: string;
  timeline_start: string;
  timeline_end: string;
  actual_output: string | null;
  accomplishment_status: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

// Input types for API
export interface CPAPItemInput {
  id?: number;
  priority_area: string;
  target_output: string;
  success_indicator: string;
  responsible_person: string;
  timeline_start: string;
  timeline_end: string;
}

export interface ProgressUpdate {
  id: number;
  actual_output?: string;
  accomplishment_status?: string;
  remarks?: string;
}

export interface CPAPFilters {
  status?: CPAPStatus | 'all';
  cycle_id?: number;
  barangay_id?: number;
  search?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface CPAPWithDetails extends CPAP {
  barangay: {
    barangay_id: number;
    barangay_name: string;
  };
  cycle: {
    cycle_id: number;
    name: string;
    year: number;
  };
}

export interface CPAPListItem {
  id: number;
  barangay_id: number;
  barangay_name: string;
  cycle_id: number;
  cycle_name: string;
  status: CPAPStatus;
  created_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  item_count: number;
}

// AI Suggestions types
export interface AISuggestion {
  priority_area: string;
  target_output: string;
  success_indicator: string;
  timeline_months: string;
  source: string;
}

export interface AISuggestionsResponse {
  shortTerm: AISuggestion[];
  mediumTerm: AISuggestion[];
  longTerm: AISuggestion[];
}

export interface AISuggestionsMetadata {
  generated_at: string;
  based_on_responses: number;
  service_areas_analyzed: string[];
}
