# CSIS Workflow Database Schema Implementation Summary

## Task Completed
✅ **Task 1: Create database schema for CSIS workflow**

## What Was Implemented

### 1. Updated Prisma Schema (`prisma/schema.prisma`)

#### New Tables Created

**`spots` Table**
- Represents geographic work areas containing 5 interview assignments
- Fields:
  - `spot_id` (Primary Key)
  - `cycle_id` (Foreign Key → survey_cycle)
  - `barangay_id` (Foreign Key → barangay)
  - `spot_name` (VARCHAR 100)
  - `starting_point` (JSON - coordinates)
  - `random_start` (Integer 1-999)
  - `assigned_fi_id` (Foreign Key → user, nullable)
  - `status` (SpotStatus enum)
  - `created_at`, `updated_at` (Timestamps)
- Indexes: cycle_id, barangay_id, assigned_fi_id, status

**`questionnaires` Table**
- Individual interview assignments (5 per spot)
- Fields:
  - `questionnaire_id` (Primary Key, VARCHAR 50, format: "YYYY-NNN-S")
  - `spot_id` (Foreign Key → spots)
  - `cycle_id` (Foreign Key → survey_cycle)
  - `sequence_number` (Integer 1-5)
  - `status` (QuestionnaireStatus enum)
  - `visit_count` (Integer, default 0)
  - `created_at`, `updated_at` (Timestamps)
- Indexes: spot_id, cycle_id, status

**`visits` Table**
- Logs each visit attempt to a household
- Fields:
  - `visit_id` (Primary Key)
  - `questionnaire_id` (Foreign Key → questionnaires)
  - `visit_number` (Integer)
  - `visit_timestamp` (Timestamp)
  - `outcome` (VisitOutcome enum)
  - `notes` (Text, nullable)
  - `location_lat`, `location_lng` (Decimal, nullable)
  - `created_at` (Timestamp)
- Indexes: questionnaire_id, visit_timestamp

#### New Enums Created

**`SpotStatus`**
- `Pending` - Spot created but no interviews started
- `In_Progress` - At least one interview in progress
- `Completed` - All 5 interviews completed

**`QuestionnaireStatus`**
- `Pending` - Not yet started
- `In_Progress` - Interview started or callbacks logged
- `Completed` - Interview successfully completed
- `Flagged_For_Substitution` - 3+ failed attempts, needs substitution

**`VisitOutcome`**
- `Callback_Needed` - Need to return
- `Interview_Started` - Interview began
- `Interview_Completed` - Interview successfully finished
- `Refused` - Respondent refused to participate
- `Household_Moved` - Household no longer at location

#### Updated Existing Tables

**`survey_response` Table**
- Added fields:
  - `questionnaire_id` (VARCHAR 50, UNIQUE, nullable)
  - `spot_id` (Integer, nullable)
  - `visit_count` (Integer, default 1)
- Added relations:
  - Foreign key to `questionnaires` table
  - Foreign key to `spots` table
- Added indexes on new fields

**`user` Table**
- Added relation: `assigned_spots` (one-to-many with spots)
- Note: Role field already supports "FS" value (VARCHAR 32)

**`barangay` Table**
- Added relation: `spots` (one-to-many with spots)

**`survey_cycle` Table**
- Added relations:
  - `spots` (one-to-many with spots)
  - `questionnaires` (one-to-many with questionnaires)

### 2. SQL Migration Files Created

**`database/csis-workflow-migration.sql`**
- Complete SQL script to apply all schema changes
- Can be executed directly on PostgreSQL database
- Includes all CREATE TABLE, ALTER TABLE, and CREATE INDEX statements
- Safe to run on existing database (uses IF NOT EXISTS where applicable)

**`database/csis-workflow-rollback.sql`**
- Rollback script to undo all changes
- Removes tables, columns, and enums in correct order
- WARNING: Deletes all data in new tables

### 3. Documentation Created

**`database/README-CSIS-WORKFLOW-MIGRATION.md`**
- Comprehensive migration guide
- Explains all schema changes
- Provides multiple migration methods (psql, Supabase, Prisma)
- Includes verification queries
- Documents rollback procedure
- Lists performance considerations

**`database/CSIS-MIGRATION-SUMMARY.md`** (this file)
- Summary of implementation
- Quick reference for what was created

### 4. Verification Script Created

**`scripts/verify-csis-migration.js`**
- Automated verification script
- Checks if tables exist
- Verifies new columns in survey_response
- Validates Prisma client is up to date
- Provides clear pass/fail status

## Schema Validation

✅ Prisma schema validated successfully with `npx prisma validate`
✅ Prisma client generated successfully with `npx prisma generate`
✅ No TypeScript or linting errors in schema file

## Data Relationships

```
SurveyCycle (1) ──< (N) Spot
Barangay (1) ──< (N) Spot
User/FI (1) ──< (N) Spot [assigned_fi_id]
Spot (1) ──< (5) Questionnaire
Questionnaire (1) ──< (N) Visit
Questionnaire (1) ── (0..1) SurveyResponse
```

## Performance Optimizations

All tables include appropriate indexes:
- Foreign key columns for JOIN operations
- Status columns for filtering
- Timestamp columns for sorting
- Unique constraints where needed

## Backward Compatibility

✅ Existing survey responses continue to work
✅ New fields are nullable (optional)
✅ No breaking changes to existing tables
✅ Existing queries remain functional

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 8.1**: User table supports FS role (via existing role field)
- ✅ **Requirement 9.1**: survey_responses has cycle_id foreign key (already existed)
- ✅ **Requirement 9.2**: spots table has cycle_id foreign key
- ✅ **Requirement 9.3**: assignments table has cycle_id foreign key (already existed)

## Next Steps

1. **Apply Migration**
   ```bash
   # Option 1: Using psql
   psql -h host -U user -d database -f database/csis-workflow-migration.sql
   
   # Option 2: Using Supabase SQL Editor
   # Copy contents of csis-workflow-migration.sql and execute
   
   # Option 3: Using Prisma (dev only)
   npx prisma db push
   ```

2. **Verify Migration**
   ```bash
   node scripts/verify-csis-migration.js
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Begin API Implementation**
   - Proceed to Task 2: Implement core spot management API endpoints
   - Use new Prisma models: `prisma.spot`, `prisma.questionnaire`, `prisma.visit`

## Files Modified/Created

### Modified
- `prisma/schema.prisma` - Updated with new tables, enums, and relations

### Created
- `database/csis-workflow-migration.sql` - SQL migration script
- `database/csis-workflow-rollback.sql` - Rollback script
- `database/README-CSIS-WORKFLOW-MIGRATION.md` - Migration documentation
- `database/CSIS-MIGRATION-SUMMARY.md` - This summary
- `scripts/verify-csis-migration.js` - Verification script

## Notes

- The database connection was not available during implementation, so the migration was not applied to the live database
- SQL migration files are ready to be executed when database access is available
- Prisma schema is valid and client has been generated
- All foreign key relationships use appropriate CASCADE/SET NULL actions
- Indexes are optimized for expected query patterns
