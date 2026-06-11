# Need for Action (NFA) Binary Field Migration Guide

## Overview

This migration updates the survey_section JSONB data structure to support the two-part "Need for Action" component across all service indicators in the PULSE survey system.

**Requirements:** 2.5, 3.3

## What This Migration Does

### 1. Field Renaming
Renames existing suggestion fields to follow standardized naming convention:
- `suggestionsProjects` → `need_for_action_suggestion_projects`
- `suggestionsFinancial` → `need_for_action_suggestion_financial`
- And so on for all 14 service indicators

### 2. Binary Field Addition
Adds new binary yes/no fields for each service indicator:
- `need_for_action_binary_projects`
- `need_for_action_binary_financial`
- And so on for all 14 service indicators

### 3. Data Backfill
Automatically populates binary fields based on existing suggestion data:
- Sets to `"Yes"` if suggestion exists and is non-empty
- Sets to `"No"` if suggestion is null or empty

## Service Indicators Affected

### Financial Administration (section_key: 'financial')
- `projects` - Barangay Projects and Programs
- `financial` - Financial Transparency
- `social_programs` - Social Programs
- `corruption` - Corruption Perception

### Disaster Preparedness (section_key: 'disaster')
- `disaster_info` - Disaster Information
- `evacuation` - Evacuation Resources

### Safety & Peace Order (section_key: 'safety')
- `tanods` - Barangay Tanods
- `lupon` - Lupon/Dispute Resolution
- `anti_drug` - Anti-Drug Programs

### Social Protection (section_key: 'social')
- `health_services` - Health Services
- `women_children_protection` - Women & Children Protection
- `community_participation` - Community Participation

### Business Friendliness (section_key: 'business')
- `business_clearance` - Business Clearance

### Environmental Management (section_key: 'environmental')
- `waste_management` - Waste Management

## Pre-Migration Checklist

- [ ] **Backup Database**: Create a full database backup before running migration
- [ ] **Test Environment**: Run migration on test/staging environment first
- [ ] **Verify Data**: Check current data structure using verification queries
- [ ] **Review Code**: Ensure application code is updated to use new field names
- [ ] **Downtime Planning**: Plan for brief downtime if needed (migration is fast but locks tables)

## Running the Migration

### Step 1: Backup Database

```bash
# Using pg_dump (adjust connection details as needed)
pg_dump -h your-host -U your-user -d your-database > backup_before_nfa_migration.sql

# Or using Supabase CLI
supabase db dump -f backup_before_nfa_migration.sql
```

### Step 2: Run Migration Script

```bash
# Using psql
psql -h your-host -U your-user -d your-database -f database/nfa-binary-field-migration.sql

# Or using Supabase SQL Editor
# Copy and paste the contents of nfa-binary-field-migration.sql into the SQL Editor
```

### Step 3: Verify Migration Success

Run the verification queries included at the end of the migration script:

```sql
-- 1. Count records with new binary fields
SELECT 
  section_key,
  COUNT(*) as total_records,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as has_binary_projects,
  COUNT(CASE WHEN data ? 'need_for_action_suggestion_projects' THEN 1 END) as has_suggestion_projects,
  COUNT(CASE WHEN data ? 'suggestionsProjects' THEN 1 END) as has_old_suggestions_projects
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;
```

Expected result: `has_old_suggestions_projects` should be 0, while `has_binary_projects` and `has_suggestion_projects` should match `total_records`.

### Step 4: Deploy Application Code

Deploy the updated application code that uses the new field names. The application should already be updated to:
- Use `transformNFAFields()` function for field name transformation
- Validate binary values using `validateNFAFields()` function
- Handle both old and new field names during transition period (if needed)

## Rollback Procedure

If you need to rollback the migration:

### Step 1: Run Rollback Script

```bash
# Using psql
psql -h your-host -U your-user -d your-database -f database/nfa-binary-field-rollback.sql

# Or using Supabase SQL Editor
# Copy and paste the contents of nfa-binary-field-rollback.sql into the SQL Editor
```

### Step 2: Verify Rollback Success

Run the verification queries included at the end of the rollback script:

```sql
-- Check for any remaining new field names
SELECT 
  section_key,
  COUNT(*) as count_with_new_fields
FROM survey_section
WHERE data ? 'need_for_action_binary_projects'
   OR data ? 'need_for_action_suggestion_projects'
GROUP BY section_key;
```

Expected result: `count_with_new_fields` should be 0.

### Step 3: Restore Previous Application Code

Revert to the previous version of the application code that uses the old field names.

## Migration Performance

### Expected Duration
- **Small datasets** (<1,000 records): < 1 second
- **Medium datasets** (1,000-10,000 records): 1-5 seconds
- **Large datasets** (>10,000 records): 5-30 seconds

### Database Locks
The migration uses UPDATE statements that will lock the affected rows. During migration:
- Reads are still possible
- Writes to survey_section table will be blocked temporarily
- Plan for brief downtime or run during low-traffic period

## Data Integrity Checks

### Before Migration

```sql
-- Count total survey sections by type
SELECT section_key, COUNT(*) as count
FROM survey_section
GROUP BY section_key
ORDER BY section_key;

-- Sample existing data structure
SELECT 
  section_id,
  section_key,
  jsonb_object_keys(data) as field_names
FROM survey_section
WHERE section_key = 'financial'
LIMIT 5;
```

### After Migration

```sql
-- Verify all sections have binary fields
SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as with_binary
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;

-- Check binary value distribution
SELECT 
  section_key,
  data->>'need_for_action_binary_projects' as binary_value,
  COUNT(*) as count
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects'
GROUP BY section_key, binary_value;

-- Verify no old field names remain
SELECT COUNT(*) as old_fields_remaining
FROM survey_section
WHERE data ? 'suggestionsProjects'
   OR data ? 'suggestionsFinancial'
   OR data ? 'suggestionsSocialPrograms';
```

## Troubleshooting

### Issue: Migration Script Fails Midway

**Solution:**
1. Check error message for specific issue
2. Rollback using rollback script
3. Fix the issue (e.g., data type mismatch, constraint violation)
4. Re-run migration

### Issue: Some Records Still Have Old Field Names

**Solution:**
```sql
-- Find records with old field names
SELECT section_id, section_key, data
FROM survey_section
WHERE data ? 'suggestionsProjects'
LIMIT 10;

-- Manually update specific records if needed
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_projects}',
    '"No"'::jsonb
  ),
  '{need_for_action_suggestion_projects}',
  COALESCE(data->'suggestionsProjects', 'null'::jsonb)
) - 'suggestionsProjects'
WHERE section_id = <specific_id>;
```

### Issue: Binary Values Are Not "Yes" or "No"

**Solution:**
The migration sets binary values to "Yes" or "No" in English. If your system uses Tagalog ("Oo"/"Hindi"), you may need to adjust the migration script or handle translation in the application layer.

### Issue: Performance Degradation After Migration

**Solution:**
1. Ensure indexes were created successfully:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'survey_section';
```

2. Run VACUUM ANALYZE to update statistics:
```sql
VACUUM ANALYZE survey_section;
```

## Application Code Updates

### Required Changes

The application code should already be updated to use the new field names. Key files:

1. **Field Transformation**: `src/app/survey/forms/utils/nfaFieldTransform.ts`
   - Handles transformation from internal names to database names
   - Validates binary values and field structure

2. **Survey Submission**: `src/app/api/survey-responses/route.ts`
   - Uses `transformNFAFields()` before saving to database
   - Validates data structure before submission

3. **Analytics Queries**: Update any analytics code to use new field names
   - Replace `data->>'suggestionsProjects'` with `data->>'need_for_action_suggestion_projects'`
   - Use `data->>'need_for_action_binary_projects'` for NFA Rate calculations

### Backward Compatibility

During the transition period, the application can support both old and new field names:

```typescript
// Example: Read from either old or new field name
const suggestion = 
  data.need_for_action_suggestion_projects || 
  data.suggestionsProjects || 
  null;
```

However, always write using the new field names.

## Testing Checklist

After migration, test the following:

- [ ] **Survey Submission**: Submit a new survey and verify data is saved with new field names
- [ ] **Survey Retrieval**: Retrieve existing surveys and verify data is accessible
- [ ] **Analytics Dashboard**: Verify NFA Rate calculations work correctly
- [ ] **Mock Data Generator**: Verify mock data uses new field names
- [ ] **Data Export**: Verify exported data includes new field names
- [ ] **Backward Compatibility**: Verify old surveys (if any) are still accessible

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the verification queries to diagnose the issue
3. Check application logs for errors
4. Contact the development team with specific error messages

## References

- **Requirements Document**: `.kiro/specs/binary-need-for-action/requirements.md`
- **Design Document**: `.kiro/specs/binary-need-for-action/design.md`
- **Task List**: `.kiro/specs/binary-need-for-action/tasks.md`
- **Field Transformation Code**: `src/app/survey/forms/utils/nfaFieldTransform.ts`
