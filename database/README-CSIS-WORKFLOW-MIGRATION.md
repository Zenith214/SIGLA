# CSIS Workflow Database Migration

This directory contains the database migration scripts for implementing the CSIS-inspired workflow in the PULSE system.

## Overview

The CSIS workflow upgrade introduces:
- **Spot Management**: Geographic work areas containing 5 interview assignments
- **Questionnaire Tracking**: Individual interview assignments with unique IDs
- **Visit Logging**: Multi-visit workflow with callback tracking
- **Field Supervisor Role**: New user role for managing field operations

## Migration Files

### `csis-workflow-migration.sql`
Main migration script that:
- Creates 3 new tables: `spots`, `questionnaires`, `visits`
- Creates 3 new enums: `SpotStatus`, `QuestionnaireStatus`, `VisitOutcome`
- Updates `survey_response` table with new fields
- Adds appropriate indexes for performance

### `csis-workflow-rollback.sql`
Rollback script to undo the migration if needed.
**WARNING**: This will delete all data in the new tables!

## Database Schema Changes

### New Tables

#### `spots`
Represents geographic work areas assigned to Field Interviewers.
- Primary Key: `spot_id`
- Foreign Keys: `cycle_id`, `barangay_id`, `assigned_fi_id`
- Contains: spot name, starting point coordinates, random start number, status

#### `questionnaires`
Individual interview assignments within a spot (5 per spot).
- Primary Key: `questionnaire_id` (format: `YYYY-NNN-S`, e.g., "2024-001-003")
- Foreign Keys: `spot_id`, `cycle_id`
- Contains: sequence number, status, visit count

#### `visits`
Logs each visit attempt to a household.
- Primary Key: `visit_id`
- Foreign Key: `questionnaire_id`
- Contains: visit number, timestamp, outcome, notes, location

### Updated Tables

#### `survey_response`
Added fields:
- `questionnaire_id` (VARCHAR(50), UNIQUE, nullable)
- `spot_id` (INTEGER, nullable)
- `visit_count` (INTEGER, default 1)

### New Enums

#### `SpotStatus`
- `Pending`: Spot created but no interviews started
- `In_Progress`: At least one interview in progress
- `Completed`: All 5 interviews completed

#### `QuestionnaireStatus`
- `Pending`: Not yet started
- `In_Progress`: Interview started or callbacks logged
- `Completed`: Interview successfully completed
- `Flagged_For_Substitution`: 3+ failed attempts, needs substitution

#### `VisitOutcome`
- `Callback_Needed`: Need to return (no one home, respondent busy, etc.)
- `Interview_Started`: Interview began
- `Interview_Completed`: Interview successfully finished
- `Refused`: Respondent refused to participate
- `Household_Moved`: Household no longer at location

## How to Apply Migration

### Option 1: Using psql (Recommended for Production)

```bash
# Connect to your database
psql -h your-host -U your-user -d your-database

# Run the migration
\i database/csis-workflow-migration.sql
```

### Option 2: Using Supabase SQL Editor

1. Open your Supabase project
2. Go to SQL Editor
3. Copy the contents of `csis-workflow-migration.sql`
4. Paste and execute

### Option 3: Using Prisma (Development Only)

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## How to Rollback

If you need to undo the migration:

```bash
# Using psql
psql -h your-host -U your-user -d your-database
\i database/csis-workflow-rollback.sql
```

**WARNING**: Rollback will delete all data in the new tables!

## Verification

After applying the migration, verify the changes:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('spots', 'questionnaires', 'visits');

-- Check if new enums exist
SELECT typname 
FROM pg_type 
WHERE typname IN ('SpotStatus', 'QuestionnaireStatus', 'VisitOutcome');

-- Check if survey_response columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'survey_response' 
AND column_name IN ('questionnaire_id', 'spot_id', 'visit_count');
```

## User Role Support

The existing `user` table already supports the Field Supervisor (FS) role through the `role` field (VARCHAR(32)). Valid role values are:
- `Admin`: Full system access
- `FS`: Field Supervisor - manages spots and field operations
- `Interviewer`: Field Interviewer - conducts surveys
- `Viewer`: Read-only access

No changes to the user table are required for role support.

## Performance Considerations

The migration includes indexes on:
- All foreign key columns
- Status columns for filtering
- Timestamp columns for sorting
- Frequently queried columns

These indexes ensure optimal query performance for:
- Fetching spots by cycle and barangay
- Loading questionnaires for a spot
- Retrieving visit history
- Filtering by status

## Data Integrity

The migration maintains data integrity through:
- Foreign key constraints with appropriate CASCADE/SET NULL actions
- Unique constraints on questionnaire_id
- Default values for status and counts
- NOT NULL constraints on required fields

## Backward Compatibility

The migration is designed to be backward compatible:
- Existing survey responses continue to work (new fields are nullable)
- No changes to existing tables' structure (only additions)
- Existing queries remain functional
- New features are opt-in (questionnaire_id is optional)

## Next Steps

After applying the migration:
1. Verify all tables and indexes were created successfully
2. Test the Prisma client generation: `npx prisma generate`
3. Update application code to use new models
4. Implement API endpoints for spot management
5. Create UI components for Field Supervisor dashboard

## Support

For issues or questions about this migration:
- Review the design document: `.kiro/specs/csis-workflow-upgrade/design.md`
- Check the requirements: `.kiro/specs/csis-workflow-upgrade/requirements.md`
- Refer to the implementation tasks: `.kiro/specs/csis-workflow-upgrade/tasks.md`
