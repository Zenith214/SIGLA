# CPAP Module Deployment Checklist

## Overview

This checklist ensures a smooth deployment of the Citizen Priority Action Plan (CPAP) module to production. Follow each step carefully and verify completion before proceeding.

## Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Database Migration](#database-migration)
3. [Application Deployment](#application-deployment)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring](#monitoring)

---

## Pre-Deployment

### 1. Environment Preparation

- [ ] **Backup Production Database**
  ```bash
  # Create full database backup
  pg_dump -h <host> -U <user> -d pulse_production > backup_pre_cpap_$(date +%Y%m%d_%H%M%S).sql
  ```
  - Store backup in secure location
  - Verify backup file integrity
  - Document backup location and timestamp

- [ ] **Verify Environment Variables**
  ```bash
  # Check required environment variables
  echo $DATABASE_URL
  echo $NEXTAUTH_SECRET
  echo $NEXTAUTH_URL
  ```
  - Confirm all variables are set
  - Verify database connection string
  - Check authentication configuration

- [ ] **Review System Requirements**
  - Node.js version: 18.x or higher
  - PostgreSQL version: 14.x or higher
  - Disk space: Minimum 10GB free
  - Memory: Minimum 4GB available

### 2. Code Preparation

- [ ] **Pull Latest Code**
  ```bash
  git checkout main
  git pull origin main
  git log -1  # Verify latest commit
  ```

- [ ] **Install Dependencies**
  ```bash
  npm ci  # Clean install from package-lock.json
  ```

- [ ] **Run Tests**
  ```bash
  # Unit tests
  npm run test:unit
  
  # Integration tests
  npm run test:integration
  
  # E2E tests (optional in staging)
  npm run test:e2e
  ```
  - All tests must pass
  - Review any warnings
  - Document any skipped tests

- [ ] **Build Application**
  ```bash
  npm run build
  ```
  - Verify build completes without errors
  - Check build output size
  - Review any build warnings

### 3. Staging Verification

- [ ] **Deploy to Staging**
  - Deploy code to staging environment
  - Run database migrations on staging
  - Verify application starts successfully

- [ ] **Staging Tests**
  - [ ] OFFICER user can access CPAP module
  - [ ] ADMIN user can access CPAP management
  - [ ] FS/INTERVIEWER users cannot access CPAP
  - [ ] AI Suggestions feature works
  - [ ] Submit workflow functions correctly
  - [ ] Approve workflow functions correctly
  - [ ] Revision request workflow functions correctly
  - [ ] Progress tracking works

- [ ] **Performance Testing**
  - Load test with expected user volume
  - Verify response times < 2 seconds
  - Check database query performance
  - Monitor memory usage

### 4. Communication

- [ ] **Notify Stakeholders**
  - Send deployment notification to:
    - DILG administrators
    - LGU officers
    - Technical support team
    - System administrators
  - Include:
    - Deployment date and time
    - Expected downtime (if any)
    - New features overview
    - Support contact information

- [ ] **Prepare User Communications**
  - User guides ready for distribution
  - Quick start guides available
  - FAQ document prepared
  - Training materials ready

---

## Database Migration

### 1. Pre-Migration Checks

- [ ] **Verify Database Connection**
  ```bash
  node scripts/check-database-connection.js
  ```

- [ ] **Check Current Schema**
  ```bash
  node scripts/check-cpap-tables.js
  ```
  - Verify CPAP tables don't already exist
  - Check for conflicting table names
  - Review current User table structure

- [ ] **Review Migration Files**
  - Location: `prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/`
  - Review SQL statements
  - Verify no destructive operations
  - Check rollback SQL is available

### 2. Execute Migration

- [ ] **Set Maintenance Mode** (if applicable)
  ```bash
  # Prevent new user sessions
  echo "MAINTENANCE_MODE=true" >> .env
  ```

- [ ] **Run Migration Script**
  ```bash
  node scripts/apply-cpap-migration.js
  ```
  
  **Expected Output:**
  ```
  ✓ Database connection successful
  ✓ Creating cpaps table...
  ✓ Creating cpap_items table...
  ✓ Creating CPAPStatus enum...
  ✓ Adding indexes...
  ✓ Migrating VIEWER role to OFFICER...
  ✓ Updating X user records...
  ✓ Migration completed successfully
  ```

- [ ] **Verify Migration Success**
  ```bash
  node scripts/verify-cpap-schema.js
  ```
  
  **Verify:**
  - [ ] `cpaps` table exists with correct columns
  - [ ] `cpap_items` table exists with correct columns
  - [ ] `CPAPStatus` enum exists with all values
  - [ ] Indexes created on key columns
  - [ ] Foreign key constraints in place
  - [ ] User role updated from "Viewer" to "Officer"
  - [ ] No data loss in User table

### 3. Post-Migration Validation

- [ ] **Check Data Integrity**
  ```bash
  # Verify user role migration
  node scripts/check-users-roles.js
  
  # Check table constraints
  node scripts/check-table-schemas.js
  ```

- [ ] **Test Database Operations**
  ```bash
  # Test CPAP creation
  node scripts/test-cpap-creation.js
  
  # Test item operations
  node scripts/test-cpap-items.js
  ```

- [ ] **Review Migration Logs**
  - Check for any warnings or errors
  - Verify row counts match expectations
  - Document any anomalies

---

## Application Deployment

### 1. Deploy Application Code

- [ ] **Stop Application** (if not using zero-downtime deployment)
  ```bash
  pm2 stop pulse-app
  ```

- [ ] **Deploy New Code**
  ```bash
  # Pull latest code
  git pull origin main
  
  # Install dependencies
  npm ci
  
  # Build application
  npm run build
  ```

- [ ] **Update Environment Variables** (if needed)
  ```bash
  # Add any new environment variables
  nano .env
  ```

- [ ] **Start Application**
  ```bash
  pm2 start pulse-app
  pm2 save
  ```

### 2. Verify Application Start

- [ ] **Check Application Logs**
  ```bash
  pm2 logs pulse-app --lines 100
  ```
  - No error messages
  - Database connection successful
  - All services initialized

- [ ] **Verify Process Status**
  ```bash
  pm2 status
  ```
  - Application status: online
  - CPU usage: normal
  - Memory usage: within limits

- [ ] **Test Health Endpoint**
  ```bash
  curl https://pulse.gov.ph/api/health
  ```
  - Response: 200 OK
  - Database: connected
  - Services: operational

### 3. Disable Maintenance Mode

- [ ] **Remove Maintenance Flag**
  ```bash
  # Remove maintenance mode
  sed -i '/MAINTENANCE_MODE/d' .env
  ```

- [ ] **Restart Application**
  ```bash
  pm2 restart pulse-app
  ```

---

## Post-Deployment Verification

### 1. Functional Testing

#### OFFICER User Tests

- [ ] **Login as OFFICER**
  - Username: [test_officer@example.com]
  - Verify successful login

- [ ] **Access CPAP Module**
  - [ ] "CPAP Submission" button visible in menu
  - [ ] Click button navigates to CPAP editor
  - [ ] CPAP auto-created for barangay and cycle

- [ ] **Create CPAP Items**
  - [ ] Add new item form works
  - [ ] All fields accept input
  - [ ] Save button functions
  - [ ] Item appears in list

- [ ] **AI Suggestions**
  - [ ] "AI Suggestions" button visible
  - [ ] Click generates suggestions
  - [ ] Suggestions display in modal
  - [ ] "Use These Suggestions" pre-fills items
  - [ ] Can edit AI-generated items

- [ ] **Submit CPAP**
  - [ ] "Submit to DILG" button visible
  - [ ] Validation works (requires complete items)
  - [ ] Submission succeeds
  - [ ] Status changes to "Submitted"
  - [ ] Fields become read-only

#### ADMIN User Tests

- [ ] **Login as ADMIN**
  - Username: [test_admin@example.com]
  - Verify successful login

- [ ] **Access CPAP Management**
  - [ ] "CPAP Management" button visible in menu
  - [ ] Click navigates to management dashboard
  - [ ] List of CPAPs displays

- [ ] **Review CPAP**
  - [ ] Click on submitted CPAP opens review modal
  - [ ] All items visible
  - [ ] "Approve" and "Request Revision" buttons present

- [ ] **Approve CPAP**
  - [ ] Click "Approve" button
  - [ ] Optional comments field works
  - [ ] Approval succeeds
  - [ ] Status changes to "Approved"
  - [ ] OFFICER receives notification

- [ ] **Request Revision**
  - [ ] Click "Request Revision" button
  - [ ] Comments field required
  - [ ] Revision request succeeds
  - [ ] Status changes to "Revision_Requested"
  - [ ] OFFICER receives notification with comments

- [ ] **Monitor Progress**
  - [ ] Switch to "Monitoring" view
  - [ ] Approved CPAPs display
  - [ ] Progress indicators visible
  - [ ] Can view detailed progress

#### Access Control Tests

- [ ] **FS User**
  - [ ] Login as FS user
  - [ ] No CPAP buttons in menu
  - [ ] Direct URL access returns 403
  - [ ] Redirected to appropriate dashboard

- [ ] **INTERVIEWER User**
  - [ ] Login as INTERVIEWER user
  - [ ] No CPAP buttons in menu
  - [ ] Direct URL access returns 403
  - [ ] Redirected to appropriate dashboard

### 2. Integration Testing

- [ ] **Survey Cycle Integration**
  - [ ] CPAPs correctly scoped to cycles
  - [ ] Cycle selector works
  - [ ] Data filtered by cycle

- [ ] **Barangay Integration**
  - [ ] CPAPs correctly scoped to barangays
  - [ ] OFFICER sees only their barangay
  - [ ] ADMIN sees all barangays

- [ ] **Notification System**
  - [ ] Notifications sent on submission
  - [ ] Notifications sent on approval
  - [ ] Notifications sent on revision request
  - [ ] Notification content correct

### 3. Performance Testing

- [ ] **Response Times**
  - [ ] CPAP list loads < 2 seconds
  - [ ] CPAP detail loads < 1 second
  - [ ] AI suggestions generate < 5 seconds
  - [ ] Save operations complete < 2 seconds

- [ ] **Database Performance**
  - [ ] Query execution times acceptable
  - [ ] No N+1 query issues
  - [ ] Indexes being used
  - [ ] Connection pool stable

- [ ] **Resource Usage**
  - [ ] CPU usage normal
  - [ ] Memory usage stable
  - [ ] No memory leaks
  - [ ] Disk I/O acceptable

### 4. Data Verification

- [ ] **User Roles**
  ```bash
  # Verify all VIEWER users migrated to OFFICER
  node scripts/check-users-roles.js
  ```
  - [ ] No "Viewer" roles remain
  - [ ] All converted to "Officer"
  - [ ] User count unchanged

- [ ] **Database Integrity**
  ```bash
  # Check referential integrity
  node scripts/verify-database-integrity.js
  ```
  - [ ] All foreign keys valid
  - [ ] No orphaned records
  - [ ] Constraints enforced

---

## Rollback Procedures

### When to Rollback

Rollback if:
- Critical bugs discovered in production
- Data integrity issues detected
- Performance degradation observed
- User access problems widespread
- Migration failures or data loss

### Rollback Steps

See [CPAP_ROLLBACK_PROCEDURES.md](./CPAP_ROLLBACK_PROCEDURES.md) for detailed instructions.

**Quick Rollback:**

1. **Stop Application**
   ```bash
   pm2 stop pulse-app
   ```

2. **Restore Database**
   ```bash
   node scripts/test-cpap-rollback.js
   ```

3. **Revert Code**
   ```bash
   git checkout <previous_commit>
   npm ci
   npm run build
   ```

4. **Restart Application**
   ```bash
   pm2 start pulse-app
   ```

---

## Monitoring

### 1. Immediate Monitoring (First 24 Hours)

- [ ] **Application Logs**
  ```bash
  pm2 logs pulse-app --lines 1000
  ```
  - Monitor for errors
  - Check for warnings
  - Review unusual patterns

- [ ] **Error Tracking**
  - Check error monitoring service (e.g., Sentry)
  - Review error rates
  - Investigate any new error types

- [ ] **Performance Metrics**
  - Response times
  - Database query performance
  - API endpoint latency
  - Resource utilization

- [ ] **User Activity**
  - Login success rates
  - CPAP creation rates
  - Submission rates
  - Error rates by user role

### 2. Ongoing Monitoring (First Week)

- [ ] **Daily Checks**
  - Review application logs
  - Check error rates
  - Monitor performance metrics
  - Review user feedback

- [ ] **Database Monitoring**
  - Table sizes
  - Query performance
  - Index usage
  - Connection pool status

- [ ] **User Support**
  - Track support tickets
  - Document common issues
  - Update FAQs as needed
  - Provide additional training if needed

### 3. Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time | < 2s | > 5s |
| Error Rate | < 1% | > 5% |
| CPAP Creation Success | > 95% | < 90% |
| Submission Success | > 95% | < 90% |
| Database CPU | < 70% | > 85% |
| Application Memory | < 80% | > 90% |

---

## Post-Deployment Tasks

### 1. Documentation

- [ ] **Update System Documentation**
  - Add CPAP module to architecture docs
  - Update API documentation
  - Document new database schema
  - Update deployment procedures

- [ ] **User Documentation**
  - Distribute user guides
  - Publish quick start guides
  - Update help center
  - Create video tutorials (optional)

### 2. Training

- [ ] **OFFICER Training**
  - Schedule training sessions
  - Provide user guides
  - Offer Q&A sessions
  - Create training materials

- [ ] **ADMIN Training**
  - Review workflow training
  - Monitoring dashboard training
  - Best practices session
  - Q&A session

### 3. Communication

- [ ] **Success Announcement**
  - Notify stakeholders of successful deployment
  - Highlight new features
  - Provide access instructions
  - Share support contact information

- [ ] **Feedback Collection**
  - Set up feedback mechanism
  - Schedule user interviews
  - Create feedback survey
  - Monitor support channels

---

## Troubleshooting

### Common Issues

#### Issue: Migration Fails

**Symptoms:**
- Migration script errors
- Database connection issues
- Constraint violations

**Solutions:**
1. Check database connection
2. Verify database permissions
3. Review migration logs
4. Check for conflicting data
5. Rollback and retry

#### Issue: Application Won't Start

**Symptoms:**
- PM2 shows error status
- Application crashes on startup
- Database connection errors

**Solutions:**
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Check file permissions
5. Review build output

#### Issue: Users Can't Access CPAP

**Symptoms:**
- 403 Forbidden errors
- Missing menu buttons
- Redirect loops

**Solutions:**
1. Verify user roles in database
2. Check middleware configuration
3. Clear user sessions
4. Verify authentication tokens
5. Check role-based routing

#### Issue: AI Suggestions Not Working

**Symptoms:**
- Button doesn't respond
- API errors
- No suggestions generated

**Solutions:**
1. Check ML service status
2. Verify survey data exists
3. Review API logs
4. Check database queries
5. Verify funnel analysis API

---

## Sign-Off

### Deployment Team

- [ ] **Database Administrator**
  - Name: ___________________
  - Date: ___________________
  - Signature: _______________

- [ ] **Application Developer**
  - Name: ___________________
  - Date: ___________________
  - Signature: _______________

- [ ] **System Administrator**
  - Name: ___________________
  - Date: ___________________
  - Signature: _______________

- [ ] **QA Lead**
  - Name: ___________________
  - Date: ___________________
  - Signature: _______________

- [ ] **Project Manager**
  - Name: ___________________
  - Date: ___________________
  - Signature: _______________

### Deployment Summary

- **Deployment Date:** ___________________
- **Deployment Time:** ___________________
- **Deployment Duration:** ___________________
- **Issues Encountered:** ___________________
- **Resolution Actions:** ___________________
- **Final Status:** ☐ Success ☐ Partial ☐ Rollback

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Next Review:** After first production deployment
