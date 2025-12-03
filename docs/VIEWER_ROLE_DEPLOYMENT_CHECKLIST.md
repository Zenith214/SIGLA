# Viewer Role Deployment Checklist

## Pre-Deployment

### 1. Code Review
- [ ] Review all modified files
- [ ] Check TypeScript compilation (no errors)
- [ ] Verify all imports are correct
- [ ] Review permission logic

### 2. Local Testing
- [ ] Run database migration locally
- [ ] Test viewer login
- [ ] Test Main Dashboard access (Map and Analytics)
- [ ] Test CPAP Dashboard access (read-only)
- [ ] Test Settings page (Backup only)
- [ ] Verify action buttons are hidden
- [ ] Test API write operations (should return 403)
- [ ] Test with other roles (admin, officer) to ensure no regression

### 3. Database Preparation
- [ ] Backup production database
- [ ] Review migration SQL script
- [ ] Test migration on staging database
- [ ] Verify rollback procedure

## Deployment Steps

### Step 1: Database Migration

```bash
# Connect to database
mysql -u [username] -p [database_name]

# Or for Supabase/PostgreSQL, adapt the SQL syntax

# Run migration
source database/reinstate-viewer-role.sql;

# Verify viewer user created
SELECT id, email, firstName, lastName, role, status 
FROM user 
WHERE role = 'viewer';
```

### Step 2: Deploy Code Changes

```bash
# Pull latest changes
git pull origin main

# Install dependencies (if needed)
npm install

# Build application
npm run build

# Restart application
pm2 restart pulse-app
# or
systemctl restart pulse-service
```

### Step 3: Verify Deployment

#### Test Viewer Creation via UI
- [ ] Login as admin
- [ ] Navigate to Settings > Users & Roles
- [ ] Click "Add User"
- [ ] Verify "Viewer" appears in role dropdown
- [ ] Create a test viewer user
- [ ] Verify viewer appears in user list with green badge

#### Test Viewer Login
- [ ] Navigate to login page
- [ ] Login with viewer@sigla.com / viewer123 (or newly created viewer)
- [ ] Verify successful login

#### Test Dashboard Access
- [ ] Access Main Dashboard
- [ ] Verify Map Tab loads
- [ ] Verify Analytics Tab loads
- [ ] Check data displays correctly

#### Test CPAP Access
- [ ] Navigate to CPAP page
- [ ] Verify "Viewing Mode" notice appears
- [ ] Verify no Add Item button
- [ ] Verify no Edit buttons on items
- [ ] Verify no Delete buttons on items
- [ ] Verify no Submit button

#### Test Settings Access
- [ ] Navigate to Settings page
- [ ] Verify only Backup option in sidebar
- [ ] Verify cannot access other admin sections
- [ ] Verify backup functionality works

#### Test API Protection
```bash
# Test CPAP creation (should fail)
curl -X POST https://your-domain.com/api/cpap \
  -H "Content-Type: application/json" \
  -H "Cookie: pulse_token=VIEWER_TOKEN" \
  -d '{"barangay_id": 1, "cycle_id": 1}'

# Expected: 403 Forbidden with message about read-only access
```

### Step 4: Test Other Roles

#### Test Admin Role
- [ ] Login as admin
- [ ] Verify full access to all features
- [ ] Verify can create/edit/delete
- [ ] Verify can access all admin settings

#### Test Officer Role
- [ ] Login as officer
- [ ] Verify can access CPAP
- [ ] Verify can create/edit CPAP items
- [ ] Verify can submit CPAP

## Post-Deployment

### 1. Monitoring
- [ ] Check application logs for errors
- [ ] Monitor API error rates
- [ ] Check for 403 responses from viewers
- [ ] Monitor user feedback

### 2. Documentation
- [ ] Update user documentation
- [ ] Notify team about viewer role
- [ ] Share test credentials (if needed)
- [ ] Update training materials

### 3. User Communication
- [ ] Notify existing users about viewer role
- [ ] Provide viewer account credentials to stakeholders
- [ ] Explain viewer limitations
- [ ] Provide support contact

## Rollback Procedure

If issues occur, follow these steps:

### 1. Revert Code Changes
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Redeploy
npm run build
pm2 restart pulse-app
```

### 2. Revert Database Changes (Optional)
```sql
-- Remove viewer users (if needed)
DELETE FROM user WHERE role = 'viewer';

-- Or update viewer users to officer
UPDATE user SET role = 'officer' WHERE role = 'viewer';
```

### 3. Verify Rollback
- [ ] Test application functionality
- [ ] Verify no errors in logs
- [ ] Test with different user roles

## Troubleshooting

### Issue: Viewer can still edit
**Solution**:
1. Clear browser cache
2. Verify JWT token has correct role
3. Check API route protection
4. Review permission checks in components

### Issue: Viewer cannot access dashboards
**Solution**:
1. Check middleware configuration
2. Verify role in database
3. Check JWT token generation
4. Review protected route configuration

### Issue: 403 errors for all users
**Solution**:
1. Check if `requireWritePermission` is used on GET routes
2. Verify middleware order
3. Check role normalization (lowercase)
4. Review auth middleware logic

### Issue: Viewer sees action buttons
**Solution**:
1. Check if `usePermissions` hook is imported
2. Verify `canEdit` prop is passed correctly
3. Clear browser cache
4. Check component conditional rendering

## Success Criteria

Deployment is successful when:

- ✅ Viewer can login successfully
- ✅ Viewer can access Main Dashboard (Map and Analytics)
- ✅ Viewer can access CPAP Dashboard (read-only)
- ✅ Viewer can access Backup Settings
- ✅ Viewer cannot see action buttons (Edit, Delete, Create, Submit)
- ✅ Viewer API write requests return 403
- ✅ Other roles (Admin, Officer) work normally
- ✅ No errors in application logs
- ✅ No regression in existing functionality

## Files to Deploy

### New Files
- `database/reinstate-viewer-role.sql`
- `src/lib/permissions.ts`
- `src/hooks/usePermissions.ts`
- `docs/VIEWER_ROLE_IMPLEMENTATION.md`
- `docs/VIEWER_ROLE_QUICK_REFERENCE.md`
- `VIEWER_ROLE_REINSTATEMENT_SUMMARY.md`
- `VIEWER_ROLE_DEPLOYMENT_CHECKLIST.md`

### Modified Files
- `src/lib/auth-middleware.ts`
- `src/app/cpap/page.tsx`
- `src/components/cpap/CPAPItemList.tsx`
- `src/app/settings/page.tsx`
- `src/app/settings/ui/admin-sidebar.tsx`
- `src/app/api/cpap/route.ts`
- `src/app/api/cpap/[id]/route.ts`
- `src/app/api/cpap/[id]/submit/route.ts`
- `src/app/api/cpap/[id]/progress/route.ts`

## Support Contacts

- **Technical Issues**: [Your Dev Team]
- **User Support**: [Your Support Team]
- **Documentation**: See `docs/VIEWER_ROLE_IMPLEMENTATION.md`

## Sign-Off

- [ ] Code reviewed by: _______________
- [ ] Tested by: _______________
- [ ] Approved by: _______________
- [ ] Deployed by: _______________
- [ ] Deployment date: _______________
- [ ] Verified by: _______________

---

**Note**: Keep this checklist for future reference and update as needed based on deployment experience.
