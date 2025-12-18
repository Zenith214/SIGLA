# CSIS Workflow Rollback Guide

This guide provides instructions for rolling back the CSIS Workflow Upgrade from production if issues are encountered.

## Table of Contents

1. [When to Rollback](#when-to-rollback)
2. [Rollback Options](#rollback-options)
3. [Pre-Rollback Checklist](#pre-rollback-checklist)
4. [Rollback Procedures](#rollback-procedures)
5. [Post-Rollback Verification](#post-rollback-verification)
6. [Troubleshooting](#troubleshooting)

## When to Rollback

Consider rolling back the CSIS deployment if you encounter:

- **Critical Errors**: System crashes, data corruption, or complete feature failure
- **High Error Rate**: More than 10% of surveys failing or encountering errors
- **GPS Capture Failures**: Less than 70% GPS capture success rate
- **Performance Issues**: Significant slowdown in survey completion times
- **User Complaints**: Multiple field staff reporting blocking issues
- **Data Integrity Issues**: Incorrect data being saved or retrieved

## Rollback Options

The rollback script supports two modes:

### 1. Feature Flag Rollback Only (Recommended)

Disables CSIS features but keeps GPS verification data in the database.

```bash
node scripts/rollback-production.js
```

**Pros:**
- Quick rollback (minutes)
- Preserves GPS verification data for analysis
- Can re-enable features easily
- No data loss

**Cons:**
- GPS verification columns remain in database
- Slightly larger database size

### 2. Full Rollback with Database Changes

Disables CSIS features AND removes GPS verification columns from database.

```bash
node scripts/rollback-production.js --rollback-db
```

**Pros:**
- Complete rollback to pre-CSIS state
- Removes unused database columns
- Clean database schema

**Cons:**
- **DELETES ALL GPS VERIFICATION DATA**
- Takes longer to execute
- Cannot easily re-enable features
- Requires database migration to redeploy

### 3. Force Mode (Skip Confirmations)

Use with caution - skips all confirmation prompts.

```bash
node scripts/rollback-production.js --force
node scripts/rollback-production.js --rollback-db --force
```

## Pre-Rollback Checklist

Before executing rollback:

- [ ] **Identify the Issue**: Document what went wrong and why rollback is needed
- [ ] **Notify Stakeholders**: Inform field staff and supervisors of the rollback
- [ ] **Create Backup**: Ensure recent database backup exists
- [ ] **Check Monitoring**: Review error logs and metrics to confirm issue severity
- [ ] **Test in Staging**: If possible, test rollback procedure in staging first
- [ ] **Prepare Communication**: Draft message to users about feature changes
- [ ] **Document Decision**: Record rollback decision and reasons in issue tracker

## Rollback Procedures

### Step 1: Test Rollback in Staging (Recommended)

Before rolling back production, test the procedure in staging:

```bash
# Test rollback in staging environment
node scripts/test-rollback-staging.js

# Full test with integration checks
node scripts/test-rollback-staging.js --full-test
```

This verifies:
- Rollback script executes without errors
- Feature flag is properly disabled
- Database rollback works correctly (if enabled)
- Data integrity is maintained
- System remains functional

### Step 2: Execute Production Rollback

#### Option A: Feature Flag Only (Recommended)

```bash
# Interactive mode with confirmations
node scripts/rollback-production.js

# Follow the prompts:
# 1. Confirm rollback decision
# 2. Verify backup is complete
# 3. Confirm feature flag disable
# 4. Confirm application redeployment
```

#### Option B: Full Rollback with Database

```bash
# Interactive mode with confirmations
node scripts/rollback-production.js --rollback-db

# Follow the prompts:
# 1. Confirm rollback decision
# 2. Verify backup is complete
# 3. Confirm feature flag disable
# 4. Confirm database column removal (DELETES GPS DATA)
# 5. Confirm application redeployment
```

### Step 3: Redeploy Application

After disabling the feature flag, redeploy the application:

```bash
# Build production bundle
npm run build

# Deploy to your hosting platform
# (Vercel, AWS, Docker, etc.)
```

### Step 4: Monitor Post-Rollback

Monitor the system for 15-30 minutes after rollback:

```bash
# Run monitoring script
node scripts/monitor-deployment.js --duration=1800
```

Check:
- Error logs for new issues
- Survey submission success rate
- API response times
- User feedback from field staff

## Post-Rollback Verification

After rollback, verify the following:

### 1. Feature Flag Verification

```bash
# Check .env.production file
cat .env.production | grep NEXT_PUBLIC_USE_CSIS

# Should show:
# NEXT_PUBLIC_USE_CSIS=false
```

### 2. Database Verification

```bash
# Run data integrity check
node scripts/verify-rollback.js
```

Verify:
- All survey responses are intact
- No data corruption
- Queries execute successfully
- Survey count matches pre-rollback count

### 3. Functional Testing

Test the following manually:

- [ ] Survey initialization works
- [ ] Respondent selection works (old 3-section flow)
- [ ] Survey submission succeeds
- [ ] Supervisor dashboard displays data
- [ ] No console errors in browser
- [ ] Mobile devices work correctly

### 4. User Communication

After successful rollback:

1. **Notify Field Staff**: Inform FIs and FSs that CSIS features are disabled
2. **Update Training**: Remind staff of old survey workflow (3 sections, modulo selection)
3. **Document Issues**: Record what went wrong for future reference
4. **Plan Fix**: Schedule time to fix issues before redeployment

## Troubleshooting

### Issue: Rollback Script Fails

**Symptoms**: Script exits with error before completion

**Solutions**:
1. Check database connection:
   ```bash
   node scripts/check-database-connection.js
   ```
2. Verify environment variables are set correctly
3. Check Supabase service key has proper permissions
4. Review error message and logs
5. Try manual rollback steps (see below)

### Issue: Feature Flag Still Enabled

**Symptoms**: CSIS features still active after rollback

**Solutions**:
1. Check `.env.production` file manually
2. Verify application was redeployed
3. Clear browser cache and reload
4. Check if feature flag is managed elsewhere (Vercel, LaunchDarkly, etc.)
5. Manually set `NEXT_PUBLIC_USE_CSIS=false` in hosting platform

### Issue: Database Rollback Fails

**Symptoms**: GPS verification columns not removed

**Solutions**:
1. Run manual SQL rollback:
   ```bash
   psql $DATABASE_URL -f database/rollback-gps-verification.sql
   ```
2. Check database permissions
3. Verify columns exist before rollback
4. Review Supabase logs for errors

### Issue: Data Integrity Problems

**Symptoms**: Missing surveys, corrupted data

**Solutions**:
1. **STOP IMMEDIATELY** - Do not proceed
2. Restore from pre-rollback backup
3. Contact database administrator
4. Review rollback logs for errors
5. Do not attempt rollback again until issue is resolved

## Manual Rollback Steps

If the automated script fails, follow these manual steps:

### 1. Disable Feature Flag

Edit `.env.production`:
```bash
# Change from:
NEXT_PUBLIC_USE_CSIS=true

# To:
NEXT_PUBLIC_USE_CSIS=false
```

### 2. Redeploy Application

```bash
npm run build
# Deploy to hosting platform
```

### 3. Remove GPS Verification Columns (Optional)

Run SQL manually:
```sql
-- Remove GPS verification columns
ALTER TABLE survey_response 
DROP COLUMN IF EXISTS verification_location,
DROP COLUMN IF EXISTS gps_verification_status,
DROP COLUMN IF EXISTS gps_distance_meters;

-- Remove GPS verification index
DROP INDEX IF EXISTS idx_survey_responses_gps_flagged;
```

### 4. Verify Data Integrity

```sql
-- Check survey response count
SELECT COUNT(*) FROM survey_response;

-- Check recent surveys
SELECT id, survey_number, created_at 
FROM survey_response 
ORDER BY created_at DESC 
LIMIT 10;
```

## Recovery and Redeployment

After rolling back and fixing issues:

### 1. Root Cause Analysis

- Document what went wrong
- Identify the root cause
- Develop fix or workaround
- Test fix in development environment

### 2. Fix and Test

- Implement fixes
- Run unit tests
- Run integration tests
- Test in staging environment
- Conduct UAT with field staff

### 3. Redeploy CSIS Features

When ready to redeploy:

```bash
# Deploy to staging first
node scripts/deploy-to-staging.js

# Monitor staging for 24-48 hours

# Deploy to production with canary
node scripts/deploy-to-production.js --canary-percentage=10

# Gradually increase canary percentage
node scripts/increase-canary.js --percentage=25
node scripts/increase-canary.js --percentage=50
node scripts/increase-canary.js --percentage=100
```

## Support and Escalation

If you encounter issues during rollback:

1. **Check Documentation**: Review this guide and troubleshooting section
2. **Check Logs**: Review application and database logs
3. **Contact Team**: Reach out to development team
4. **Escalate**: If critical, escalate to system administrator

## Related Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Monitoring Guide](./MONITORING_GUIDE.md)
- [CSIS Documentation Index](./CSIS_DOCUMENTATION_INDEX.md)
- [Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md)

---

**Last Updated**: 2024-11-17  
**Version**: 1.0  
**Maintained By**: SIGLA Development Team
