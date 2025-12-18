# Migration Troubleshooting Guide

## Error: "prepared statement 's0' already exists"

This error occurs due to PostgreSQL connection pooling issues, particularly common with Supabase pooler connections.

## ✅ Solution Options

### Option 1: Use Direct Connection (Recommended)

Temporarily use the direct database connection instead of the pooler:

1. **Check your `.env` file:**
   ```env
   # Current (Pooler - causes issues with migrations)
   DATABASE_URL="postgresql://user:pass@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
   
   # Change to Direct Connection for migration
   DATABASE_URL="postgresql://user:pass@aws-1-ap-southeast-1.aws.neon.tech:5432/postgres"
   ```

2. **Find your direct connection URL:**
   - Go to Supabase Dashboard
   - Project Settings → Database
   - Look for "Connection string" → "Direct connection"
   - Copy the URI mode connection string

3. **Run migration with direct connection:**
   ```bash
   # Set direct connection temporarily
   DATABASE_URL="your_direct_connection_url" npx prisma migrate deploy
   
   # Generate client
   npx prisma generate
   ```

4. **Restore pooler connection:**
   - Change `.env` back to pooler URL for application runtime
   - Pooler is fine for app, just not for migrations

### Option 2: Manual SQL Execution

Run the migration SQL directly in Supabase SQL Editor:

1. **Open Supabase Dashboard**
   - Go to SQL Editor
   - Create new query

2. **Copy and paste this SQL:**
   ```sql
   -- Add new columns to survey_response table
   ALTER TABLE "survey_response" 
   ADD COLUMN IF NOT EXISTS "unawareness_reasons" JSONB DEFAULT '{}',
   ADD COLUMN IF NOT EXISTS "non_availment_reasons" JSONB DEFAULT '{}';

   -- Create GIN indexes for better JSONB query performance
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

3. **Execute the query** (Click "Run" or press F5)

4. **Mark migration as applied:**
   ```bash
   npx prisma migrate resolve --applied 20251218090840_add_conditional_questions
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

### Option 3: Use pgBouncer Transaction Mode

If you must use pooler for migrations:

1. **Update your connection string:**
   ```env
   # Add pgbouncer=true parameter
   DATABASE_URL="postgresql://user:pass@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

2. **Run migration:**
   ```bash
   npx prisma migrate deploy
   ```

### Option 4: Close All Connections

If you have access to database admin:

1. **Connect to database:**
   ```bash
   psql "your_direct_connection_url"
   ```

2. **Terminate all connections:**
   ```sql
   SELECT pg_terminate_backend(pid) 
   FROM pg_stat_activity 
   WHERE datname = 'postgres' 
   AND pid <> pg_backend_pid();
   ```

3. **Run migration immediately:**
   ```bash
   npx prisma migrate deploy
   ```

## 🔍 Verification

After applying migration with any method, verify:

```sql
-- Check columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'survey_response' 
AND column_name IN ('unawareness_reasons', 'non_availment_reasons');

-- Expected output:
-- column_name              | data_type | column_default
-- -------------------------+-----------+----------------
-- unawareness_reasons      | jsonb     | '{}'::jsonb
-- non_availment_reasons    | jsonb     | '{}'::jsonb
```

## 📝 Post-Migration Steps

Regardless of which method you used:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Restart your application:**
   ```bash
   npm run dev
   ```

3. **Test the feature:**
   - Navigate to survey form
   - Test conditional questions
   - Verify data saves correctly

## 🎯 Best Practices

### For Development
- Use **direct connection** for migrations
- Use **pooler connection** for application runtime

### For Production
1. Run migrations during maintenance window
2. Use direct connection for migrations
3. Test thoroughly in staging first
4. Have rollback plan ready

### Connection String Management

Create two environment variables:

```env
# .env
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres"  # For app
DIRECT_DATABASE_URL="postgresql://...aws.neon.tech:5432/postgres"  # For migrations
```

Then use:
```bash
# For migrations
DATABASE_URL=$DIRECT_DATABASE_URL npx prisma migrate deploy

# For app (automatic from .env)
npm run dev
```

## 🆘 Still Having Issues?

### Check Connection String Format

Ensure your connection string includes all required parameters:

```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

### Common Issues

1. **Wrong port:**
   - Pooler: 6543
   - Direct: 5432

2. **Missing password:**
   - Check Supabase dashboard for correct password
   - Password may contain special characters that need URL encoding

3. **SSL issues:**
   - Add `?sslmode=require` to connection string

4. **Timeout:**
   - Add `?connect_timeout=10` to connection string

### Test Connection

```bash
# Test if you can connect
psql "your_connection_string"

# If successful, you'll see:
# postgres=>
```

## ✅ Recommended Approach

**For this specific migration, I recommend Option 2 (Manual SQL Execution):**

1. It's the fastest and most reliable
2. No connection issues
3. Works with Supabase SQL Editor
4. Can verify results immediately

**Steps:**
1. Copy SQL from Option 2 above
2. Paste in Supabase SQL Editor
3. Run query
4. Mark migration as applied: `npx prisma migrate resolve --applied 20251218090840_add_conditional_questions`
5. Generate client: `npx prisma generate`
6. Restart app: `npm run dev`

Done! ✨

---

**Need more help?** Check the main migration guide: `docs/MIGRATION_GUIDE.md`