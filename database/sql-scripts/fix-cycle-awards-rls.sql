-- Fix RLS policies for cycle_awards table
-- Run this in your Supabase SQL editor

-- First, check if the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'cycle_awards';

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS cycle_awards (
    id SERIAL PRIMARY KEY,
    barangay_id INTEGER NOT NULL,
    cycle_id INTEGER NOT NULL,
    is_awardee BOOLEAN NOT NULL DEFAULT false,
    awarded_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    -- Foreign key constraints
    CONSTRAINT fk_cycle_awards_barangay 
        FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id) ON DELETE CASCADE,
    CONSTRAINT fk_cycle_awards_cycle 
        FOREIGN KEY (cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
    CONSTRAINT fk_cycle_awards_user 
        FOREIGN KEY (created_by) REFERENCES "user"(id) ON DELETE SET NULL,
    
    -- Unique constraint to prevent duplicate awards per barangay per cycle
    CONSTRAINT uk_cycle_awards_barangay_cycle UNIQUE(barangay_id, cycle_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cycle_awards_cycle ON cycle_awards(cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_awards_barangay ON cycle_awards(barangay_id);
CREATE INDEX IF NOT EXISTS idx_cycle_awards_status ON cycle_awards(is_awardee);
CREATE INDEX IF NOT EXISTS idx_cycle_awards_created_at ON cycle_awards(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_cycle_awards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_cycle_awards_updated_at ON cycle_awards;
CREATE TRIGGER trigger_cycle_awards_updated_at
    BEFORE UPDATE ON cycle_awards
    FOR EACH ROW
    EXECUTE FUNCTION update_cycle_awards_updated_at();

-- Enable RLS on the table
ALTER TABLE cycle_awards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON cycle_awards;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON cycle_awards;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON cycle_awards;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON cycle_awards;

-- Create policies that allow authenticated users to access cycle awards
CREATE POLICY "Enable read access for authenticated users" 
ON cycle_awards FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" 
ON cycle_awards FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" 
ON cycle_awards FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" 
ON cycle_awards FOR DELETE 
USING (auth.role() = 'authenticated');

-- Grant necessary permissions to authenticated role
GRANT ALL ON cycle_awards TO authenticated;
GRANT ALL ON cycle_awards TO service_role;

-- Grant usage on the sequence
GRANT USAGE, SELECT ON SEQUENCE cycle_awards_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cycle_awards_id_seq TO service_role;

-- Add comments for documentation
COMMENT ON TABLE cycle_awards IS 'Tracks SGLGB award status per barangay per survey cycle';
COMMENT ON COLUMN cycle_awards.barangay_id IS 'Reference to the barangay receiving the award';
COMMENT ON COLUMN cycle_awards.cycle_id IS 'Reference to the survey cycle for this award';
COMMENT ON COLUMN cycle_awards.is_awardee IS 'Whether the barangay is an awardee for this cycle';
COMMENT ON COLUMN cycle_awards.awarded_date IS 'Date when the award was granted';
COMMENT ON COLUMN cycle_awards.notes IS 'Additional notes about the award decision';
COMMENT ON COLUMN cycle_awards.created_by IS 'User who created this award record';

-- Test the setup by selecting from the table
SELECT 'cycle_awards table setup completed successfully' as status;

-- Show existing data if any
SELECT COUNT(*) as existing_records FROM cycle_awards;