# Migration Guide: Conditional Questions Implementation

## Overview

This guide will help you apply the database migration for the new conditional questions feature (Unawareness & Non-Availment modules).

## Prerequisites

- PostgreSQL database access
- Prisma CLI installed (`npm install -g prisma` or use `npx prisma`)
- Database connection configured in `.env` file

## Migration Steps

### Option 1: Using Prisma Migrate (Recommended)

1. **Review the migration**
   ```bash
   # View the migration file
   cat prisma/migrations/20251218090840_add_conditional_questions/migration.sql
   ```

2. **Apply the migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify the migration**
   ```bash
   npx prisma migrate status
   ```

### Option 2: Manual SQL Execution

If you prefer to run the SQL directly:

1. **Connect to your database**
   ```bash
   psql -U your_username -d your_database_name
   ```

2. **Run the migration SQL**
   ```sql
   -- Add new columns
   ALTER TABLE "survey_response" 
   ADD COLUMN IF NOT EXISTS "unawareness_reasons" JSONB DEFAULT '{}',
   ADD COLUMN IF NOT EXISTS "non_availment_reasons" JSONB DEFAULT '{}';

   -- Create indexes for better performance
   CREATE INDEX IF NOT EXISTS "idx_survey_response_unawareness_reasons" 
   ON "survey_response" USING GIN ("unawareness_reasons");
   
   CREATE INDEX IF NOT EXISTS "idx_survey_response_non_availment_reasons" 
   ON "survey_response" USING GIN ("non_availment_reasons");

   -- Add documentation comments
   COMMENT ON COLUMN "survey_response"."unawareness_reasons" 
   IS 'Stores reasons for unawareness per service indicator. Format: {"serviceId": "reason_value"}';
   
   COMMENT ON COLUMN "survey_response"."non_availment_reasons" 
   IS 'Stores reasons for non-availment per service indicator. Format: {"serviceId": "reason_value"}';
   ```

3. **Verify the changes**
   ```sql
   -- Check if columns exist
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'survey_response' 
   AND column_name IN ('unawareness_reasons', 'non_availment_reasons');

   -- Check if indexes exist
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'survey_response' 
   AND indexname LIKE '%unawareness%' OR indexname LIKE '%availment%';
   ```

## Post-Migration Steps

### 1. Regenerate Prisma Client

After applying the migration, regenerate the Prisma client:

```bash
npx prisma generate
```

### 2. Restart Your Application

Restart your Next.js development server to pick up the new schema:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 3. Test the New Features

1. **Test Unawareness Module**
   - Navigate to a survey form
   - Answer "No" to an awareness question
   - Verify the unawareness reason question appears
   - Submit and check database

2. **Test Non-Availment Module**
   - Answer "Yes" to awareness
   - Answer "No" to availment/experience
   - Verify the non-availment reason question appears
   - Submit and check database

3. **Test Analytics Dashboard**
   - Navigate to `/analytics` or your analytics page
   - Add the ConditionalInsightsChart component
   - Verify data displays correctly

### 4. Verify Data Storage

Check that data is being stored correctly:

```sql
-- View sample data
SELECT 
  response_id,
  survey_number,
  unawareness_reasons,
  non_availment_reasons
FROM survey_response
WHERE unawareness_reasons != '{}'::jsonb 
   OR non_availment_reasons != '{}'::jsonb
LIMIT 5;
```

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_survey_response_unawareness_reasons;
DROP INDEX IF EXISTS idx_survey_response_non_availment_reasons;

-- Remove columns
ALTER TABLE survey_response 
DROP COLUMN IF EXISTS unawareness_reasons,
DROP COLUMN IF EXISTS non_availment_reasons;
```

Then regenerate Prisma client:
```bash
npx prisma generate
```

## Troubleshooting

### Error: "prepared statement already exists"

This error occurs when there's an active connection issue. Solutions:

1. **Close all database connections**
   ```sql
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE datname = 'your_database_name' 
   AND pid <> pg_backend_pid();
   ```

2. **Restart PostgreSQL service**
   ```bash
   # On Linux/Mac
   sudo service postgresql restart
   
   # On Windows (as Administrator)
   net stop postgresql-x64-14
   net start postgresql-x64-14
   ```

3. **Use a fresh connection**
   - Close your IDE/editor
   - Close any database GUI tools (pgAdmin, DBeaver, etc.)
   - Reconnect and try again

### Error: "relation does not exist"

Make sure you're connected to the correct database:

```bash
# Check current database
psql -U your_username -d your_database_name -c "SELECT current_database();"
```

### Migration Already Applied

If the migration was already applied:

```bash
# Mark migration as applied without running it
npx prisma migrate resolve --applied 20251218090840_add_conditional_questions
```

## Verification Checklist

- [ ] Migration applied successfully
- [ ] Prisma client regenerated
- [ ] Application restarted
- [ ] Unawareness module displays correctly
- [ ] Non-availment module displays correctly
- [ ] Data saves to database correctly
- [ ] Analytics dashboard shows conditional insights
- [ ] No console errors in browser
- [ ] No server errors in logs

## Support

If you encounter issues:

1. Check the main documentation: `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md`
2. Review the Prisma schema: `prisma/schema.prisma`
3. Check migration files: `prisma/migrations/`
4. Review API endpoints: `src/app/api/survey/conditional-responses/`

## Next Steps

After successful migration:

1. Review the implementation guide: `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md`
2. Test all survey sections with conditional questions
3. Explore the analytics dashboard
4. Train users on the new features
5. Monitor data collection and quality