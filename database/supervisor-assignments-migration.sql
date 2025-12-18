-- ============================================================================
-- SUPERVISOR ASSIGNMENTS MIGRATION
-- ============================================================================
-- Purpose: Allow admins to assign supervisors (FS role) to specific barangays
--          for a given survey cycle, defining their scope of work.
-- ============================================================================

-- Create supervisor_assignments table
CREATE TABLE IF NOT EXISTS supervisor_assignments (
  id SERIAL PRIMARY KEY,
  supervisor_id INTEGER NOT NULL,
  barangay_id INTEGER NOT NULL,
  cycle_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_supervisor FOREIGN KEY (supervisor_id) 
    REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT fk_barangay FOREIGN KEY (barangay_id) 
    REFERENCES barangay(barangay_id) ON DELETE CASCADE,
  CONSTRAINT fk_cycle FOREIGN KEY (cycle_id) 
    REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
  
  -- Unique constraint: one supervisor per barangay per cycle
  CONSTRAINT unique_supervisor_barangay_cycle 
    UNIQUE (supervisor_id, barangay_id, cycle_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_supervisor_assignments_supervisor ON supervisor_assignments(supervisor_id);
CREATE INDEX idx_supervisor_assignments_barangay ON supervisor_assignments(barangay_id);
CREATE INDEX idx_supervisor_assignments_cycle ON supervisor_assignments(cycle_id);
CREATE INDEX idx_supervisor_assignments_status ON supervisor_assignments(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_supervisor_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_supervisor_assignments_updated_at
  BEFORE UPDATE ON supervisor_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_supervisor_assignments_updated_at();

-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================
-- To rollback this migration, run:
-- DROP TRIGGER IF EXISTS trigger_supervisor_assignments_updated_at ON supervisor_assignments;
-- DROP FUNCTION IF EXISTS update_supervisor_assignments_updated_at();
-- DROP TABLE IF EXISTS supervisor_assignments CASCADE;
