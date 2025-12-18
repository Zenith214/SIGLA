-- Performance Optimization Indexes for CSIS Workflow
-- This migration adds composite indexes for frequently queried field combinations

-- Composite index for spots filtered by cycle and barangay (common FS query)
CREATE INDEX IF NOT EXISTS idx_spots_cycle_barangay ON spots(cycle_id, barangay_id);

-- Composite index for spots filtered by cycle and assigned FI (common FI query)
CREATE INDEX IF NOT EXISTS idx_spots_cycle_fi ON spots(cycle_id, assigned_fi_id);

-- Composite index for questionnaires by spot and status (for progress calculations)
CREATE INDEX IF NOT EXISTS idx_questionnaires_spot_status ON questionnaires(spot_id, status);

-- Composite index for visits by questionnaire and timestamp (for visit history)
CREATE INDEX IF NOT EXISTS idx_visits_questionnaire_timestamp ON visits(questionnaire_id, visit_timestamp DESC);

-- Composite index for survey responses by cycle and status (for analytics)
CREATE INDEX IF NOT EXISTS idx_survey_responses_cycle_status ON survey_response(survey_cycle_id, status);

-- Composite index for survey responses by interviewer and cycle (for FI performance)
CREATE INDEX IF NOT EXISTS idx_survey_responses_interviewer_cycle ON survey_response(interviewer_id, survey_cycle_id);

-- Composite index for assignments by user and cycle (for assignment lookups)
CREATE INDEX IF NOT EXISTS idx_assignments_user_cycle ON assignment(user_id, survey_cycle_id);

-- Index for survey responses by completion date (for time-based queries)
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed_at ON survey_response(completed_at) WHERE completed_at IS NOT NULL;

-- Partial index for active survey cycles (frequently queried)
CREATE INDEX IF NOT EXISTS idx_survey_cycle_active ON survey_cycle(is_active) WHERE is_active = true;

-- Composite index for survey targets by cycle and barangay
CREATE INDEX IF NOT EXISTS idx_survey_targets_cycle_barangay ON survey_target(survey_cycle_id, barangay_id);

-- Add BRIN index for large time-series data (survey responses by created_at)
-- BRIN indexes are very efficient for large tables with natural ordering
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at_brin ON survey_response USING BRIN (created_at);

-- Add GIN index for JSON fields that are frequently queried
-- This helps with queries that search within JSON data
CREATE INDEX IF NOT EXISTS idx_spots_starting_point_gin ON spots USING GIN (starting_point);

-- Analyze tables to update statistics for query planner
ANALYZE spots;
ANALYZE questionnaires;
ANALYZE visits;
ANALYZE survey_response;
ANALYZE assignment;
ANALYZE survey_cycle;
ANALYZE survey_target;
