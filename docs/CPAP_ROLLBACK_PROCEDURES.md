# CPAP Module Rollback Procedures

## Overview

This document provides detailed procedures for rolling back the CPAP module deployment in case of critical issues. Follow these steps carefully to restore the system to its pre-deployment state.

## Table of Contents

1. [When to Rollback](#when-to-rollback)
2. [Rollback Decision Matrix](#rollback-decision-matrix)
3. [Pre-Rollback Preparation](#pre-rollback-preparation)
4. [Database Rollback](#database-rollback)
5. [Application Rollback](#application-rollback)
6. [Verification](#verification)
7. [Post-Rollback Actions](#post-rollback-actions)
8. [Troubleshooting](#troubleshooting)

---

## When to Rollback

### Critical Issues Requiring Immediate Rollback

- **Data Loss or Corruption**
  - User data missing or corrupted
  - Database integrity violations
  - Unrecoverable data errors

- **System Unavailability**
  - Application crashes repeatedly
  - Database connection failures
  - Critical features completely broken

- **Security Vulnerabilities**
  - Unauthorized access discovered
  - Data exposure detected
  - Authentication bypass found

- **Performance Degradation**
  - System response time > 10 seconds
  - Database deadlocks
  - Memory leaks causing crashes

### Issues That May Not Require Rollback

- **Minor UI Issues**
  - Cosmetic problems
  - Non-critical display issues
  - Can be fixed with hotfix

- **Limited Feature Issues**
  - Single feature not working
  - Affects small user subset
  - Workaround available

- **Performance Issues**
  - Slight slowdown (< 2x normal)
  - Can be optimized without rollback
  - Affects non-critical operations

---

## Rollback Decision Matrix

| Issue Severity | User Impact | Data Risk | Decision |
|----------------|-------------|-----------|----------|
| Critical | High (>50% users) | High | **ROLLBACK IMMEDIATELY** |
| Critical | Medium (10-50%) | High | **ROLLBACK IMMEDIATELY** |
| Critical | Low (<10%) | High | **ROLLBACK IMMEDIATELY** |
| High | High | Medium | **ROLLBACK** (within 1 hour) |
| High | Medium | Medium | **EVALUATE** (consider hotfix) |
| High | Low | Low | **HOTFIX** (no rollback) |
| Medium | Any | Low | **HOTFIX** (no rollback) |
| Low | Any | None | **DEFER** (fix in next release) |

### Decision Makers

Rollback decision requires approval from:
- **Technical Lead** (required)
- **Database Administrator** (required for DB rollback)
- **Project Manager** (required)
- **DILG Stakeholder** (for production only)

---

## Pre-Rollback Preparation

### 1. Assess the Situation

- [ ] **Document the Issue**
  - What is the problem?
  - When did it start?
  - How many users affected?
  - What is the impact?
  - Can it be fixed without rollback?

- [ ] **Gather Evidence**
  - Application logs
  - Database logs
  - Error messages
  - User reports
  - Screenshots

- [ ] **Estimate Impact**
  - Number of affected users
  - Data at risk
  - Business impact
  - Urgency level

### 2. Communication

- [ ] **Notify Stakeholders**
  - Technical team
  - Management
  - DILG administrators
  - Affected users (if applicable)

- [ ] **Set Expectations**
  - Estimated rollback duration
  - Expected downtime
  - Data implications
  - Next steps

### 3. Backup Current State

Even when rolling back, backup the current state for analysis:

```bash
# Backup current database state
pg_dump -h <host> -U <user> -d pulse_production > backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql

# Backup current code
git branch backup-before-rollback-$(date +%Y%m%d_%H%M%S)
git push origin backup-before-rollback-$(date +%Y%m%d_%H%M%S)

# Backup current logs
pm2 logs pulse-app --lines 10000 > logs_before_rollback_$(date +%Y%m%d_%H%M%S).log
```

---

## Database Rollback

### Option 1: Automated Rollback Script (Recommended)

Use the provided rollback script for safe, automated rollback:

```bash
# Run rollback script
node scripts/test-cpap-rollback.js
```

**Script Actions:**
1. Verifies database connection
2. Checks for CPAP data
3. Backs up CPAP data (if any exists)
4. Drops CPAP tables
5. Reverts OFFICER role to VIEWER
6. Verifies rollback success

**Expected Output:**
```
✓ Database connection successful
✓ Checking for CPAP data...
  Found X CPAPs with Y items
✓ Backing up CPAP data...
  Backup saved to: cpap_backup_20251120_143022.json
✓ Dropping cpap_items table...
✓ Dropping cpaps table...
✓ Dropping CPAPStatus enum...
✓ Reverting OFFICER role to VIEWER...
  Updated X user records
✓ Rollback completed successfully
```

### Option 2: Manual Database Rollback

If the automated script fails, use manual SQL:

#### Step 1: Backup CPAP Data (if needed)

```sql
-- Export CPAP data to JSON
COPY (
  SELECT json_agg(row_to_json(t))
  FROM (
    SELECT c.*, 
           json_agg(i.*) as items
    FROM cpaps c
    LEFT JOIN cpap_items i ON i.cpap_id = c.id
    GROUP BY c.id
  ) t
) TO '/tmp/cpap_backup.json';
```

#### Step 2: Drop CPAP Tables

```sql
-- Drop tables in correct order (foreign keys first)
DROP TABLE IF EXISTS cpap_items CASCADE;
DROP TABLE IF EXISTS cpaps CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS "CPAPStatus" CASCADE;
```

#### Step 3: Revert Role Migration

```sql
-- Revert OFFICER back to VIEWER
UPDATE "User"
SET role = 'Viewer'
WHERE role = 'Officer';

-- Update default role in schema (requires migration)
-- This will be handled by code rollback
```

#### Step 4: Verify Rollback

```sql
-- Verify tables are gone
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('cpaps', 'cpap_items');
-- Should return 0 rows

-- Verify enum is gone
SELECT typname 
FROM pg_type 
WHERE typname = 'CPAPStatus';
-- Should return 0 rows

-- Verify role reversion
SELECT role, COUNT(*) 
FROM "User" 
GROUP BY role;
-- Should show "Viewer" instead of "Officer"
```

### Option 3: Full Database Restore

If rollback script fails and manual rollback has issues:

```bash
# Stop application
pm2 stop pulse-app

# Restore from pre-deployment backup
psql -h <host> -U <user> -d pulse_production < backup_pre_cpap_YYYYMMDD_HHMMSS.sql

# Verify restoration
psql -h <host> -U <user> -d pulse_production -c "\dt"
```

**⚠️ WARNING:** Full restore will lose ALL data created since deployment, not just CPAP data.

---

## Application Rollback

### Step 1: Identify Previous Version

```bash
# View recent commits
git log --oneline -10

# Identify commit before CPAP deployment
# Look for commit message like "Pre-CPAP deployment" or similar
```

### Step 2: Stop Application

```bash
# Stop the application
pm2 stop pulse-app

# Verify it's stopped
pm2 status
```

### Step 3: Revert Code

```bash
# Checkout previous version
git checkout <commit_hash_before_cpap>

# Or revert to specific tag
git checkout tags/v1.0.0-pre-cpap

# Or revert specific commits
git revert <cpap_commit_hash> --no-commit
git commit -m "Rollback CPAP module"
```

### Step 4: Reinstall Dependencies

```bash
# Clean install dependencies
rm -rf node_modules
npm ci

# Verify package versions
npm list --depth=0
```

### Step 5: Rebuild Application

```bash
# Clean previous build
rm -rf .next

# Rebuild
npm run build

# Verify build success
echo $?  # Should output 0
```

### Step 6: Update Environment Variables

```bash
# Remove any CPAP-specific environment variables
nano .env

# Remove lines like:
# CPAP_FEATURE_ENABLED=true
# CPAP_AI_SUGGESTIONS_ENABLED=true
```

### Step 7: Restart Application

```bash
# Start application
pm2 start pulse-app

# Save PM2 configuration
pm2 save

# Monitor logs
pm2 logs pulse-app --lines 100
```

---

## Verification

### 1. Application Health

- [ ] **Application Status**
  ```bash
  pm2 status
  ```
  - Status: online
  - Uptime: > 1 minute
  - Restarts: 0

- [ ] **Health Endpoint**
  ```bash
  curl https://pulse.gov.ph/api/health
  ```
  - Response: 200 OK
  - Database: connected

- [ ] **Application Logs**
  ```bash
  pm2 logs pulse-app --lines 100
  ```
  - No error messages
  - No CPAP-related errors
  - Normal startup sequence

### 2. Database Verification

- [ ] **Tables Removed**
  ```sql
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_name IN ('cpaps', 'cpap_items');
  ```
  - Should return 0 rows

- [ ] **Roles Reverted**
  ```sql
  SELECT role, COUNT(*) 
  FROM "User" 
  GROUP BY role;
  ```
  - Should show "Viewer" not "Officer"
  - User count unchanged

- [ ] **Data Integrity**
  ```sql
  -- Check user table
  SELECT COUNT(*) FROM "User";
  
  -- Check other critical tables
  SELECT COUNT(*) FROM "Barangay";
  SELECT COUNT(*) FROM "SurveyCycle";
  SELECT COUNT(*) FROM "SurveyResponse";
  ```
  - Counts match pre-deployment

### 3. Functional Testing

- [ ] **User Login**
  - ADMIN can login
  - OFFICER (formerly VIEWER) can login
  - FS can login
  - INTERVIEWER can login

- [ ] **Navigation**
  - No CPAP buttons in menus
  - All other menu items work
  - No broken links

- [ ] **Core Features**
  - Survey submission works
  - Report cards display
  - Analytics function
  - User management works

- [ ] **Access Control**
  - Direct CPAP URLs return 404
  - No CPAP API endpoints accessible
  - Role-based access still works for other features

### 4. Performance Check

- [ ] **Response Times**
  - Homepage loads < 2 seconds
  - API responses < 1 second
  - Database queries fast

- [ ] **Resource Usage**
  - CPU usage normal
  - Memory usage stable
  - No memory leaks

---

## Post-Rollback Actions

### 1. Immediate Actions

- [ ] **Notify Users**
  - Send notification about rollback
  - Explain what happened
  - Provide timeline for resolution
  - Offer support contact

- [ ] **Document Incident**
  - What went wrong
  - When it was detected
  - How it was resolved
  - Lessons learned

- [ ] **Preserve Evidence**
  - Save all logs
  - Keep database backups
  - Document error messages
  - Save screenshots

### 2. Root Cause Analysis

- [ ] **Investigate Issue**
  - Review logs thoroughly
  - Analyze error patterns
  - Identify root cause
  - Document findings

- [ ] **Identify Fixes**
  - What needs to be fixed
  - How to prevent recurrence
  - Testing requirements
  - Validation criteria

- [ ] **Create Action Plan**
  - Fix development timeline
  - Testing strategy
  - Deployment approach
  - Risk mitigation

### 3. Communication

- [ ] **Stakeholder Update**
  - Explain what happened
  - Share root cause analysis
  - Present fix timeline
  - Address concerns

- [ ] **User Communication**
  - Apologize for disruption
  - Explain resolution plan
  - Provide updated timeline
  - Thank for patience

### 4. Prepare for Redeployment

- [ ] **Fix Issues**
  - Implement fixes
  - Add additional tests
  - Improve error handling
  - Enhance monitoring

- [ ] **Enhanced Testing**
  - More comprehensive test suite
  - Load testing
  - Stress testing
  - User acceptance testing

- [ ] **Improved Deployment**
  - Better rollback procedures
  - Enhanced monitoring
  - Staged rollout plan
  - Faster detection mechanisms

---

## Troubleshooting

### Issue: Rollback Script Fails

**Symptoms:**
- Script errors out
- Database connection issues
- Permission errors

**Solutions:**

1. **Check Database Connection**
   ```bash
   node scripts/check-database-connection.js
   ```

2. **Verify Permissions**
   ```sql
   -- Check user permissions
   SELECT * FROM information_schema.role_table_grants 
   WHERE grantee = current_user;
   ```

3. **Manual Rollback**
   - Use manual SQL commands (see Option 2 above)
   - Execute commands one at a time
   - Verify each step

4. **Full Restore**
   - If all else fails, restore from backup
   - See Option 3 above

### Issue: Application Won't Start After Rollback

**Symptoms:**
- PM2 shows error status
- Application crashes
- Build errors

**Solutions:**

1. **Check Build**
   ```bash
   npm run build
   ```
   - Review build errors
   - Fix any issues
   - Rebuild

2. **Verify Dependencies**
   ```bash
   rm -rf node_modules
   npm ci
   ```

3. **Check Environment**
   ```bash
   # Verify environment variables
   cat .env
   ```
   - Remove CPAP-specific variables
   - Verify database URL

4. **Review Logs**
   ```bash
   pm2 logs pulse-app --err --lines 200
   ```
   - Identify specific errors
   - Fix issues
   - Restart

### Issue: Users Still See CPAP Features

**Symptoms:**
- CPAP buttons still visible
- CPAP pages accessible
- Cached content

**Solutions:**

1. **Clear Application Cache**
   ```bash
   rm -rf .next
   npm run build
   pm2 restart pulse-app
   ```

2. **Clear User Sessions**
   ```sql
   -- Clear all sessions (forces re-login)
   DELETE FROM "Session";
   ```

3. **Clear Browser Cache**
   - Instruct users to clear cache
   - Or use hard refresh (Ctrl+Shift+R)

4. **Verify Code Version**
   ```bash
   git log -1
   ```
   - Ensure correct commit
   - Verify no CPAP code present

### Issue: Data Loss Detected

**Symptoms:**
- User data missing
- Survey responses gone
- Other tables affected

**Solutions:**

1. **Stop Immediately**
   ```bash
   pm2 stop pulse-app
   ```

2. **Assess Damage**
   ```sql
   -- Check all table counts
   SELECT 
     schemaname,
     tablename,
     n_live_tup as row_count
   FROM pg_stat_user_tables
   ORDER BY n_live_tup DESC;
   ```

3. **Restore from Backup**
   ```bash
   # Restore full database
   psql -h <host> -U <user> -d pulse_production < backup_pre_cpap_YYYYMMDD_HHMMSS.sql
   ```

4. **Verify Restoration**
   - Check all table counts
   - Verify user data
   - Test critical features

5. **Incident Report**
   - Document what happened
   - Notify all stakeholders
   - Conduct thorough investigation

---

## Rollback Checklist

### Pre-Rollback

- [ ] Issue documented
- [ ] Stakeholders notified
- [ ] Decision approved
- [ ] Current state backed up
- [ ] Rollback plan reviewed

### Database Rollback

- [ ] Database backed up
- [ ] Rollback script executed OR manual SQL run
- [ ] Tables dropped
- [ ] Roles reverted
- [ ] Verification queries run
- [ ] Results documented

### Application Rollback

- [ ] Application stopped
- [ ] Code reverted
- [ ] Dependencies reinstalled
- [ ] Application rebuilt
- [ ] Environment updated
- [ ] Application restarted

### Verification

- [ ] Application health checked
- [ ] Database verified
- [ ] Functional tests passed
- [ ] Performance acceptable
- [ ] No errors in logs

### Post-Rollback

- [ ] Users notified
- [ ] Incident documented
- [ ] Root cause analyzed
- [ ] Fix plan created
- [ ] Stakeholders updated

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Technical Lead | [Name] | [Phone/Email] | 24/7 |
| Database Admin | [Name] | [Phone/Email] | 24/7 |
| DevOps Lead | [Name] | [Phone/Email] | 24/7 |
| Project Manager | [Name] | [Phone/Email] | Business hours |
| DILG Stakeholder | [Name] | [Phone/Email] | Business hours |

---

## Rollback Log Template

```
ROLLBACK INCIDENT REPORT

Date: ___________________
Time: ___________________
Initiated By: ___________________

ISSUE DESCRIPTION:
[Describe the problem that triggered rollback]

IMPACT ASSESSMENT:
- Users Affected: ___________________
- Data at Risk: ___________________
- Business Impact: ___________________

ROLLBACK ACTIONS TAKEN:
1. [Action 1]
2. [Action 2]
3. [Action 3]

VERIFICATION RESULTS:
- Application Status: ___________________
- Database Status: ___________________
- Functional Tests: ___________________

ROOT CAUSE:
[Describe root cause if known]

NEXT STEPS:
1. [Next step 1]
2. [Next step 2]

LESSONS LEARNED:
[What we learned from this incident]

SIGN-OFF:
Technical Lead: ___________________ Date: ___________
Database Admin: ___________________ Date: ___________
Project Manager: ___________________ Date: ___________
```

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Review Frequency:** After each deployment or rollback
