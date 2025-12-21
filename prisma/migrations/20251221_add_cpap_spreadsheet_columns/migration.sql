-- Add new columns to cpap_items table for spreadsheet view
-- Migration: Add observation, plan_of_action, activity, financial_requirements, committed_to_be_committed, actual_date

ALTER TABLE "cpap_items" 
ADD COLUMN IF NOT EXISTS "observation" TEXT,
ADD COLUMN IF NOT EXISTS "plan_of_action" TEXT,
ADD COLUMN IF NOT EXISTS "activity" TEXT,
ADD COLUMN IF NOT EXISTS "financial_requirements" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "committed_to_be_committed" TEXT,
ADD COLUMN IF NOT EXISTS "actual_date" DATE;

-- Add comments to document the new columns
COMMENT ON COLUMN "cpap_items"."observation" IS 'Results/Observations on Specific Target Service Area';
COMMENT ON COLUMN "cpap_items"."plan_of_action" IS 'Plan of Action for the service area';
COMMENT ON COLUMN "cpap_items"."activity" IS 'Specific activities to be performed';
COMMENT ON COLUMN "cpap_items"."financial_requirements" IS 'Budget or financial resources needed';
COMMENT ON COLUMN "cpap_items"."committed_to_be_committed" IS 'Committed/To be Committed in Sectoral Plan/Budget';
COMMENT ON COLUMN "cpap_items"."actual_date" IS 'Actual date of completion';
