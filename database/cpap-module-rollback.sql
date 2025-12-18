-- Rollback script for CPAP Module Migration
-- This script reverses the changes made by the CPAP module migration

-- Drop foreign key constraints first
ALTER TABLE "cpap_items" DROP CONSTRAINT IF EXISTS "cpap_items_cpap_id_fkey";
ALTER TABLE "cpaps" DROP CONSTRAINT IF EXISTS "cpaps_cycle_id_fkey";
ALTER TABLE "cpaps" DROP CONSTRAINT IF EXISTS "cpaps_barangay_id_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "cpap_items_cpap_id_idx";
DROP INDEX IF EXISTS "cpaps_cycle_id_idx";
DROP INDEX IF EXISTS "cpaps_barangay_id_idx";
DROP INDEX IF EXISTS "cpaps_status_idx";
DROP INDEX IF EXISTS "cpaps_barangay_id_cycle_id_key";

-- Drop tables
DROP TABLE IF EXISTS "cpap_items";
DROP TABLE IF EXISTS "cpaps";

-- Drop enum
DROP TYPE IF EXISTS "CPAPStatus";

-- Revert User role default from 'Officer' back to 'Viewer'
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'Viewer';

-- Data Rollback: Update existing 'Officer' roles back to 'Viewer' (if needed)
-- WARNING: This will affect all Officer users, not just those migrated from Viewer
-- UPDATE "user" SET "role" = 'Viewer' WHERE "role" = 'Officer';
