-- ============================================================================
-- ROLLBACK: SUPERVISOR ASSIGNMENTS
-- ============================================================================
-- This script removes the supervisor_assignments table and related objects
-- ============================================================================

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_supervisor_assignments_updated_at ON supervisor_assignments;

-- Drop function
DROP FUNCTION IF EXISTS update_supervisor_assignments_updated_at();

-- Drop table
DROP TABLE IF EXISTS supervisor_assignments CASCADE;

-- Verification
SELECT 'Supervisor assignments table and related objects have been removed.' AS status;
