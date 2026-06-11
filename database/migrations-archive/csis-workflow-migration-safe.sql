-- ============================================================================
-- CSIS Workflow Migration (Safe Version)
-- Adds new tables and enums for CSIS-inspired workflow
-- This version checks for existence before creating
-- ============================================================================

-- Create new enums (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE "SpotStatus" AS ENUM ('Pending', 'In_Progress', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "QuestionnaireStatus" AS ENUM ('Pending', 'In_Progress', 'Completed', 'Flagged_For_Substitution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VisitOutcome" AS ENUM ('Callback_Needed', 'Interview_Started', 'Interview_Completed', 'Refused', 'Household_Moved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- Create Spots Table (only if it doesn't exist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "spots" (
    "spot_id" SERIAL PRIMARY KEY,
    "cycle_id" INTEGER NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "spot_name" VARCHAR(100) NOT NULL,
    "starting_point" JSONB NOT NULL,
    "random_start" INTEGER NOT NULL,
    "assigned_fi_id" INTEGER,
    "status" "SpotStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)
);

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "spots"
    ADD CONSTRAINT "spots_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "survey_cycle"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "spots"
    ADD CONSTRAINT "spots_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "spots"
    ADD CONSTRAINT "spots_assigned_fi_id_fkey" FOREIGN KEY ("assigned_fi_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for spots table (only if they don't exist)
CREATE INDEX IF NOT EXISTS "spots_cycle_id_idx" ON "spots"("cycle_id");
CREATE INDEX IF NOT EXISTS "spots_barangay_id_idx" ON "spots"("barangay_id");
CREATE INDEX IF NOT EXISTS "spots_assigned_fi_id_idx" ON "spots"("assigned_fi_id");
CREATE INDEX IF NOT EXISTS "spots_status_idx" ON "spots"("status");

-- ============================================================================
-- Create Questionnaires Table (only if it doesn't exist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "questionnaires" (
    "questionnaire_id" VARCHAR(50) PRIMARY KEY,
    "spot_id" INTEGER NOT NULL,
    "cycle_id" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'Pending',
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3)
);

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "questionnaires"
    ADD CONSTRAINT "questionnaires_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "spots"("spot_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "questionnaires"
    ADD CONSTRAINT "questionnaires_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "survey_cycle"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for questionnaires table (only if they don't exist)
CREATE INDEX IF NOT EXISTS "questionnaires_spot_id_idx" ON "questionnaires"("spot_id");
CREATE INDEX IF NOT EXISTS "questionnaires_cycle_id_idx" ON "questionnaires"("cycle_id");
CREATE INDEX IF NOT EXISTS "questionnaires_status_idx" ON "questionnaires"("status");

-- ============================================================================
-- Create Visits Table (only if it doesn't exist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "visits" (
    "visit_id" SERIAL PRIMARY KEY,
    "questionnaire_id" VARCHAR(50) NOT NULL,
    "visit_number" INTEGER NOT NULL,
    "visit_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outcome" "VisitOutcome" NOT NULL,
    "notes" TEXT,
    "location_lat" DECIMAL(10, 8),
    "location_lng" DECIMAL(11, 8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint (only if it doesn't exist)
DO $$ BEGIN
    ALTER TABLE "visits"
    ADD CONSTRAINT "visits_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("questionnaire_id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for visits table (only if they don't exist)
CREATE INDEX IF NOT EXISTS "visits_questionnaire_id_idx" ON "visits"("questionnaire_id");
CREATE INDEX IF NOT EXISTS "visits_visit_timestamp_idx" ON "visits"("visit_timestamp");

-- ============================================================================
-- Update Survey Response Table
-- ============================================================================
-- Add columns only if they don't exist
DO $$ BEGIN
    ALTER TABLE "survey_response" ADD COLUMN "questionnaire_id" VARCHAR(50);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "survey_response" ADD COLUMN "spot_id" INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "survey_response" ADD COLUMN "visit_count" INTEGER DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "survey_response"
    ADD CONSTRAINT "survey_response_questionnaire_id_fkey" 
        FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("questionnaire_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "survey_response"
    ADD CONSTRAINT "survey_response_spot_id_fkey" 
        FOREIGN KEY ("spot_id") REFERENCES "spots"("spot_id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add unique constraint on questionnaire_id (only if it doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'survey_response_questionnaire_id_key'
    ) THEN
        ALTER TABLE "survey_response"
        ADD CONSTRAINT "survey_response_questionnaire_id_key" UNIQUE ("questionnaire_id");
    END IF;
END $$;

-- Create indexes for new survey_response columns (only if they don't exist)
CREATE INDEX IF NOT EXISTS "survey_response_questionnaire_id_idx" ON "survey_response"("questionnaire_id");
CREATE INDEX IF NOT EXISTS "survey_response_spot_id_idx" ON "survey_response"("spot_id");

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- - Created 3 new tables: spots, questionnaires, visits (if they didn't exist)
-- - Created 3 new enums: SpotStatus, QuestionnaireStatus, VisitOutcome (if they didn't exist)
-- - Updated survey_response table with questionnaire_id, spot_id, visit_count (if columns didn't exist)
-- - Added appropriate indexes for performance (if they didn't exist)
-- - User table already supports FS role via existing role field

SELECT 'CSIS Workflow Migration completed successfully!' as status;
