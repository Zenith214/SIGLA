-- ============================================================================
-- CSIS Workflow Migration
-- Adds new tables and enums for CSIS-inspired workflow
-- ============================================================================

-- Create new enums
CREATE TYPE "SpotStatus" AS ENUM ('Pending', 'In_Progress', 'Completed');
CREATE TYPE "QuestionnaireStatus" AS ENUM ('Pending', 'In_Progress', 'Completed', 'Flagged_For_Substitution');
CREATE TYPE "VisitOutcome" AS ENUM ('Callback_Needed', 'Interview_Started', 'Interview_Completed', 'Refused', 'Household_Moved');

-- ============================================================================
-- Create Spots Table
-- ============================================================================
CREATE TABLE "spots" (
    "spot_id" SERIAL PRIMARY KEY,
    "cycle_id" INTEGER NOT NULL,
    "barangay_id" INTEGER NOT NULL,
    "spot_name" VARCHAR(100) NOT NULL,
    "starting_point" JSONB NOT NULL,
    "random_start" INTEGER NOT NULL,
    "assigned_fi_id" INTEGER,
    "status" "SpotStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    
    CONSTRAINT "spots_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "survey_cycle"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "spots_barangay_id_fkey" FOREIGN KEY ("barangay_id") REFERENCES "barangay"("barangay_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "spots_assigned_fi_id_fkey" FOREIGN KEY ("assigned_fi_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for spots table
CREATE INDEX "spots_cycle_id_idx" ON "spots"("cycle_id");
CREATE INDEX "spots_barangay_id_idx" ON "spots"("barangay_id");
CREATE INDEX "spots_assigned_fi_id_idx" ON "spots"("assigned_fi_id");
CREATE INDEX "spots_status_idx" ON "spots"("status");

-- ============================================================================
-- Create Questionnaires Table
-- ============================================================================
CREATE TABLE "questionnaires" (
    "questionnaire_id" VARCHAR(50) PRIMARY KEY,
    "spot_id" INTEGER NOT NULL,
    "cycle_id" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'Pending',
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    
    CONSTRAINT "questionnaires_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "spots"("spot_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "questionnaires_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "survey_cycle"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for questionnaires table
CREATE INDEX "questionnaires_spot_id_idx" ON "questionnaires"("spot_id");
CREATE INDEX "questionnaires_cycle_id_idx" ON "questionnaires"("cycle_id");
CREATE INDEX "questionnaires_status_idx" ON "questionnaires"("status");

-- ============================================================================
-- Create Visits Table
-- ============================================================================
CREATE TABLE "visits" (
    "visit_id" SERIAL PRIMARY KEY,
    "questionnaire_id" VARCHAR(50) NOT NULL,
    "visit_number" INTEGER NOT NULL,
    "visit_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outcome" "VisitOutcome" NOT NULL,
    "notes" TEXT,
    "location_lat" DECIMAL(10, 8),
    "location_lng" DECIMAL(11, 8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "visits_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("questionnaire_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for visits table
CREATE INDEX "visits_questionnaire_id_idx" ON "visits"("questionnaire_id");
CREATE INDEX "visits_visit_timestamp_idx" ON "visits"("visit_timestamp");

-- ============================================================================
-- Update Survey Response Table
-- ============================================================================
ALTER TABLE "survey_response" 
ADD COLUMN "questionnaire_id" VARCHAR(50),
ADD COLUMN "spot_id" INTEGER,
ADD COLUMN "visit_count" INTEGER DEFAULT 1;

-- Add foreign key constraints
ALTER TABLE "survey_response"
ADD CONSTRAINT "survey_response_questionnaire_id_fkey" 
    FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("questionnaire_id") ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "survey_response_spot_id_fkey" 
    FOREIGN KEY ("spot_id") REFERENCES "spots"("spot_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique constraint on questionnaire_id
ALTER TABLE "survey_response"
ADD CONSTRAINT "survey_response_questionnaire_id_key" UNIQUE ("questionnaire_id");

-- Create indexes for new survey_response columns
CREATE INDEX "survey_response_questionnaire_id_idx" ON "survey_response"("questionnaire_id");
CREATE INDEX "survey_response_spot_id_idx" ON "survey_response"("spot_id");

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- - Created 3 new tables: spots, questionnaires, visits
-- - Created 3 new enums: SpotStatus, QuestionnaireStatus, VisitOutcome
-- - Updated survey_response table with questionnaire_id, spot_id, visit_count
-- - Added appropriate indexes for performance
-- - User table already supports FS role via existing role field
