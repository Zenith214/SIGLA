-- Migration: Add questionnaire_counter table for atomic questionnaire number generation
-- Date: 2025-11-05
-- Description: Creates a counter table to atomically generate sequential questionnaire numbers per barangay per cycle

-- Drop old table if exists (for migration)
DROP TABLE IF EXISTS questionnaire_counter;

-- Create barangay and cycle-specific counter table
CREATE TABLE IF NOT EXISTS questionnaire_counter (
  barangay_id INT NOT NULL,
  cycle_id INT NOT NULL,
  current_number INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (barangay_id, cycle_id),
  CONSTRAINT fk_barangay FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id) ON DELETE CASCADE,
  CONSTRAINT fk_cycle FOREIGN KEY (cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_counter_updated 
ON questionnaire_counter(updated_at);

CREATE INDEX IF NOT EXISTS idx_questionnaire_counter_cycle
ON questionnaire_counter(cycle_id);

-- Add comments
COMMENT ON TABLE questionnaire_counter IS 'Stores the current questionnaire number counter per barangay per cycle for atomic increment operations';
COMMENT ON COLUMN questionnaire_counter.barangay_id IS 'Barangay ID - each barangay has its own counter per cycle';
COMMENT ON COLUMN questionnaire_counter.cycle_id IS 'Survey cycle ID - counters reset per cycle';
COMMENT ON COLUMN questionnaire_counter.current_number IS 'Current questionnaire number for this barangay in this cycle, incremented atomically';
COMMENT ON COLUMN questionnaire_counter.updated_at IS 'Last time the counter was incremented';
