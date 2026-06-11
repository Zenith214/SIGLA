# NFA Binary Field Migration - Quick Reference

## TL;DR

This migration renames suggestion fields and adds binary yes/no fields for all 14 service indicators in the survey system.

## Quick Commands

### Run Migration
```bash
psql -h your-host -U your-user -d your-database -f database/nfa-binary-field-migration.sql
```

### Rollback Migration
```bash
psql -h your-host -U your-user -d your-database -f database/nfa-binary-field-rollback.sql
```

### Verify Migration
```sql
-- Should return 0 old fields
SELECT COUNT(*) FROM survey_section 
WHERE data ? 'suggestionsProjects';

-- Should return count of new fields
SELECT COUNT(*) FROM survey_section 
WHERE data ? 'need_for_action_binary_projects';
```

## Field Name Changes

| Old Field Name | New Field Name |
|----------------|----------------|
| `suggestionsProjects` | `need_for_action_suggestion_projects` |
| `suggestionsFinancial` | `need_for_action_suggestion_financial` |
| `suggestionsSocialPrograms` | `need_for_action_suggestion_social_programs` |
| `suggestionsCorruption` | `need_for_action_suggestion_corruption` |
| `suggestionsDisasterInfo` | `need_for_action_suggestion_disaster_info` |
| `suggestionsEvacuation` | `need_for_action_suggestion_evacuation` |
| `suggestionsTanods` | `need_for_action_suggestion_tanods` |
| `suggestionsLupon` | `need_for_action_suggestion_lupon` |
| `suggestionsAntiDrug` | `need_for_action_suggestion_anti_drug` |
| `suggestionsHealthServices` | `need_for_action_suggestion_health_services` |
| `suggestionsWomenChildrenProtection` | `need_for_action_suggestion_women_children_protection` |
| `suggestionsCommunityParticipation` | `need_for_action_suggestion_community_participation` |
| `suggestionsBusinessClearance` | `need_for_action_suggestion_business_clearance` |
| `suggestionsWasteManagement` | `need_for_action_suggestion_waste_management` |

## New Binary Fields Added

For each indicator above, a corresponding binary field is added:
- `need_for_action_binary_projects`
- `need_for_action_binary_financial`
- `need_for_action_binary_social_programs`
- etc.

Binary values: `"Yes"` or `"No"` (or `"Oo"` / `"Hindi"` in Tagalog)

## Data Backfill Logic

```
IF suggestion exists AND is non-empty:
  binary = "Yes"
ELSE:
  binary = "No"
```

## Section Keys

| Section Key | Service Area |
|-------------|--------------|
| `financial` | Financial Administration |
| `disaster` | Disaster Preparedness |
| `safety` | Safety & Peace Order |
| `social` | Social Protection |
| `business` | Business Friendliness |
| `environmental` | Environmental Management |

## Common Queries

### Check Migration Status
```sql
-- Count records by section with new fields
SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as migrated
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;
```

### View Sample Migrated Data
```sql
SELECT 
  section_key,
  data->>'need_for_action_binary_projects' as binary,
  data->>'need_for_action_suggestion_projects' as suggestion
FROM survey_section
WHERE section_key = 'financial'
LIMIT 5;
```

### Find Unmigrated Records
```sql
SELECT section_id, section_key
FROM survey_section
WHERE data ? 'suggestionsProjects'
   OR data ? 'suggestionsFinancial';
```

## Application Code

### Transform Fields Before Saving
```typescript
import { transformNFAFields } from '@/app/survey/forms/utils/nfaFieldTransform';

const transformedData = transformNFAFields(sectionData);
// Now save transformedData to database
```

### Validate Fields
```typescript
import { validateNFAFields } from '@/app/survey/forms/utils/nfaFieldTransform';

const validation = validateNFAFields(sectionData);
if (!validation.isValid) {
  console.error(validation.errors);
}
```

### Query New Fields
```typescript
// In analytics queries
const nfaRate = await db.query(`
  SELECT 
    COUNT(*) FILTER (
      WHERE data->>'need_for_action_binary_projects' = 'Yes'
    ) * 100.0 / COUNT(*) as nfa_rate
  FROM survey_section
  WHERE section_key = 'financial'
`);
```

## Rollback Impact

⚠️ **Warning**: Rollback will:
- Remove all binary field data (cannot be recovered)
- Restore original suggestion field names
- Preserve suggestion text content

## Pre-Migration Checklist

- [ ] Backup database
- [ ] Test on staging environment
- [ ] Update application code
- [ ] Plan for brief downtime
- [ ] Notify team members

## Post-Migration Checklist

- [ ] Run verification queries
- [ ] Test survey submission
- [ ] Test analytics dashboard
- [ ] Monitor for errors
- [ ] Update documentation

## Need Help?

See full documentation: `database/README-NFA-BINARY-MIGRATION.md`
