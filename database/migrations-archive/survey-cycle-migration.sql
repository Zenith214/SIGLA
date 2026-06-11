-- Survey Cycle Integration Migration
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Update SurveyCycle table structure
ALTER TABLE survey_cycle ADD COLUMN IF NOT EXISTS name VARCHAR(191);
ALTER TABLE survey_cycle ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Update year column to integer if it's still string (handle gracefully)
DO $$
BEGIN
    BEGIN
        ALTER TABLE survey_cycle ALTER COLUMN year TYPE INTEGER USING year::integer;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Year column may already be integer type or conversion failed';
    END;
END $$;

-- Make start_date and end_date nullable
DO $$
BEGIN
    BEGIN
        ALTER TABLE survey_cycle ALTER COLUMN start_date DROP NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'start_date column may already be nullable';
    END;
END $$;

DO $$
BEGIN
    BEGIN
        ALTER TABLE survey_cycle ALTER COLUMN end_date DROP NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'end_date column may already be nullable';
    END;
END $$;

-- Remove old columns if they exist
ALTER TABLE survey_cycle DROP COLUMN IF EXISTS status;
ALTER TABLE survey_cycle DROP COLUMN IF EXISTS responses;

-- Step 2: Add survey_cycle_id columns to related tables
ALTER TABLE survey_response ADD COLUMN IF NOT EXISTS survey_cycle_id INTEGER;
ALTER TABLE survey_target ADD COLUMN IF NOT EXISTS survey_cycle_id INTEGER;
ALTER TABLE assignment ADD COLUMN IF NOT EXISTS survey_cycle_id INTEGER;

-- Step 3: Create foreign key constraints
DO $$
BEGIN
    BEGIN
        ALTER TABLE survey_response 
        ADD CONSTRAINT fk_survey_response_cycle 
        FOREIGN KEY (survey_cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Foreign key constraint for survey_response already exists';
    END;
END $$;

DO $$
BEGIN
    BEGIN
        ALTER TABLE survey_target 
        ADD CONSTRAINT fk_survey_target_cycle 
        FOREIGN KEY (survey_cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Foreign key constraint for survey_target already exists';
    END;
END $$;

DO $$
BEGIN
    BEGIN
        ALTER TABLE assignment 
        ADD CONSTRAINT fk_assignment_cycle 
        FOREIGN KEY (survey_cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Foreign key constraint for assignment already exists';
    END;
END $$;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_cycle_is_active ON survey_cycle(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_response_cycle_id ON survey_response(survey_cycle_id);
CREATE INDEX IF NOT EXISTS idx_survey_target_cycle_id ON survey_target(survey_cycle_id);
CREATE INDEX IF NOT EXISTS idx_assignment_cycle_id ON assignment(survey_cycle_id);

-- Step 5: Create a default survey cycle if none exists
DO $$
DECLARE
    cycle_count INTEGER;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
    SELECT COUNT(*) INTO cycle_count FROM survey_cycle;
    
    IF cycle_count = 0 THEN
        INSERT INTO survey_cycle (name, year, is_active, start_date, end_date, created_at)
        VALUES (
            'Survey Cycle ' || current_year,
            current_year,
            true,
            (current_year || '-01-01')::date,
            (current_year || '-12-31')::date,
            NOW()
        );
        RAISE NOTICE 'Created default survey cycle for year %', current_year;
    ELSE
        -- Update existing cycles to have proper names if they don't
        UPDATE survey_cycle 
        SET name = 'Survey Cycle ' || year::text
        WHERE name IS NULL OR name = '';
        RAISE NOTICE 'Updated existing cycle names';
    END IF;
END $$;

-- Step 6: Ensure only one active cycle exists
DO $$
DECLARE
    active_count INTEGER;
    most_recent_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_count FROM survey_cycle WHERE is_active = true;
    
    IF active_count > 1 THEN
        RAISE NOTICE 'Multiple active cycles detected. Setting only the most recent as active...';
        
        -- Deactivate all cycles
        UPDATE survey_cycle SET is_active = false;
        
        -- Get the most recent cycle
        SELECT cycle_id INTO most_recent_id 
        FROM survey_cycle 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Activate the most recent cycle
        UPDATE survey_cycle 
        SET is_active = true 
        WHERE cycle_id = most_recent_id;
        
        RAISE NOTICE 'Set cycle % as the active cycle', most_recent_id;
    END IF;
END $$;

-- Display summary
DO $$
DECLARE
    total_cycles INTEGER;
    active_cycle_name TEXT;
    active_cycle_year INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_cycles FROM survey_cycle;
    
    SELECT name, year INTO active_cycle_name, active_cycle_year 
    FROM survey_cycle 
    WHERE is_active = true 
    LIMIT 1;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '- Total survey cycles: %', total_cycles;
    
    IF active_cycle_name IS NOT NULL THEN
        RAISE NOTICE '- Active cycle: % (%)', active_cycle_name, active_cycle_year;
    ELSE
        RAISE NOTICE '- Active cycle: None';
    END IF;
END $$;