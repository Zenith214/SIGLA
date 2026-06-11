-- ============================================================================
-- CONDITIONAL QUESTIONS MIGRATION
-- ============================================================================
-- This script adds support for Unawareness and Non-Availment conditional
-- question modules to the SIGLA survey system.
--
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Open Supabase Dashboard → SQL Editor
-- 3. Paste and run this script
-- 4. Then run: npx prisma migrate resolve --applied 20251218090840_add_conditional_questions
-- 5. Then run: npx prisma generate
-- ============================================================================

-- Add new JSONB columns to survey_response table
ALTER TABLE "survey_response" 
ADD COLUMN IF NOT EXISTS "unawareness_reasons" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "non_availment_reasons" JSONB DEFAULT '{}';

-- Create GIN indexes for efficient JSONB queries
CREATE INDEX IF NOT EXISTS "idx_survey_response_unawareness_reasons" 
ON "survey_response" USING GIN ("unawareness_reasons");

CREATE INDEX IF NOT EXISTS "idx_survey_response_non_availment_reasons" 
ON "survey_response" USING GIN ("non_availment_reasons");

-- Add documentation comments
COMMENT ON COLUMN "survey_response"."unawareness_reasons" 
IS 'Stores reasons for unawareness per service indicator. Format: {"serviceId": "reason_value"}';

COMMENT ON COLUMN "survey_response"."non_availment_reasons" 
IS 'Stores reasons for non-availment per service indicator. Format: {"serviceId": "reason_value"}';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration was successful:

-- 1. Check if columns were created
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'survey_response' 
AND column_name IN ('unawareness_reasons', 'non_availment_reasons')
ORDER BY column_name;

-- Expected output:
-- column_name              | data_type | column_default | is_nullable
-- -------------------------+-----------+----------------+-------------
-- non_availment_reasons    | jsonb     | '{}'::jsonb    | YES
-- unawareness_reasons      | jsonb     | '{}'::jsonb    | YES

-- 2. Check if indexes were created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'survey_response' 
AND (indexname LIKE '%unawareness%' OR indexname LIKE '%availment%')
ORDER BY indexname;

-- Expected output:
-- indexname                                    | indexdef
-- ---------------------------------------------+------------------------------------------
-- idx_survey_response_non_availment_reasons    | CREATE INDEX ... USING gin ...
-- idx_survey_response_unawareness_reasons      | CREATE INDEX ... USING gin ...

-- 3. Check column comments
SELECT 
    col_description('survey_response'::regclass, attnum) as description,
    attname as column_name
FROM pg_attribute 
WHERE attrelid = 'survey_response'::regclass 
AND attname IN ('unawareness_reasons', 'non_availment_reasons')
ORDER BY attname;

-- ============================================================================
-- SAMPLE DATA QUERIES (After collecting responses)
-- ============================================================================

-- View responses with unawareness reasons
SELECT 
    response_id,
    survey_number,
    unawareness_reasons,
    created_at
FROM survey_response
WHERE unawareness_reasons != '{}'::jsonb
ORDER BY created_at DESC
LIMIT 5;

-- View responses with non-availment reasons
SELECT 
    response_id,
    survey_number,
    non_availment_reasons,
    created_at
FROM survey_response
WHERE non_availment_reasons != '{}'::jsonb
ORDER BY created_at DESC
LIMIT 5;

-- Count responses by type
SELECT 
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE unawareness_reasons != '{}'::jsonb) as with_unawareness,
    COUNT(*) FILTER (WHERE non_availment_reasons != '{}'::jsonb) as with_non_availment,
    COUNT(*) FILTER (
        WHERE unawareness_reasons != '{}'::jsonb 
        OR non_availment_reasons != '{}'::jsonb
    ) as with_conditional_data
FROM survey_response;

-- ============================================================================
-- ANALYTICS QUERIES
-- ============================================================================

-- Top unawareness reasons across all services
SELECT 
    reason,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
    SELECT 
        jsonb_each_text(unawareness_reasons) as reason_pair
    FROM survey_response
    WHERE unawareness_reasons != '{}'::jsonb
) as reasons,
LATERAL (SELECT (reason_pair).value as reason) as extracted
GROUP BY reason
ORDER BY count DESC
LIMIT 10;

-- Top non-availment barriers across all services
SELECT 
    barrier,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
    SELECT 
        jsonb_each_text(non_availment_reasons) as barrier_pair
    FROM survey_response
    WHERE non_availment_reasons != '{}'::jsonb
) as barriers,
LATERAL (SELECT (barrier_pair).value as barrier) as extracted
GROUP BY barrier
ORDER BY count DESC
LIMIT 10;

-- Unawareness reasons by service indicator
SELECT 
    service_id,
    reason,
    COUNT(*) as count
FROM (
    SELECT 
        (jsonb_each_text(unawareness_reasons)).key as service_id,
        (jsonb_each_text(unawareness_reasons)).value as reason
    FROM survey_response
    WHERE unawareness_reasons != '{}'::jsonb
) as service_reasons
GROUP BY service_id, reason
ORDER BY service_id, count DESC;

-- Non-availment barriers by service indicator
SELECT 
    service_id,
    barrier,
    COUNT(*) as count
FROM (
    SELECT 
        (jsonb_each_text(non_availment_reasons)).key as service_id,
        (jsonb_each_text(non_availment_reasons)).value as barrier
    FROM survey_response
    WHERE non_availment_reasons != '{}'::jsonb
) as service_barriers
GROUP BY service_id, barrier
ORDER BY service_id, count DESC;

-- ============================================================================
-- ROLLBACK (IF NEEDED)
-- ============================================================================
-- Uncomment and run these commands if you need to rollback the migration:

-- DROP INDEX IF EXISTS idx_survey_response_unawareness_reasons;
-- DROP INDEX IF EXISTS idx_survey_response_non_availment_reasons;
-- ALTER TABLE survey_response DROP COLUMN IF EXISTS unawareness_reasons;
-- ALTER TABLE survey_response DROP COLUMN IF EXISTS non_availment_reasons;

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================

-- After running this script successfully:
-- 1. Run: npx prisma migrate resolve --applied 20251218090840_add_conditional_questions
-- 2. Run: npx prisma generate
-- 3. Restart your application: npm run dev
-- 4. Test the conditional questions feature
-- 5. Check the analytics dashboard

-- For troubleshooting, see: docs/MIGRATION_TROUBLESHOOTING.md
-- For complete documentation, see: docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md