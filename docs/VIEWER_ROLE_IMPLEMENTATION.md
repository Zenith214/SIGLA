# Viewer Role Implementation

## Overview

The Viewer role has been reinstated to provide read-only access to the PULSE system. Viewers can access dashboards and view data but cannot perform any create, update, or delete operations.

## Viewer Role Permissions

### ✅ Allowed Access

1. **Main Dashboard**
   - Map Tab: View barangay locations and survey data
   - Analytics Tab: View all analytics and reports

2. **CPAP Management Dashboard**
   - View CPAP submissions (read-only)
   - View action items and progress
   - Cannot create, edit, or submit CPAPs

3. **Backup Settings**
   - Access backup management
   - View backup history
   - Perform backup operations

### ❌ Restricted Access

1. **CRUD Operations**
   - Cannot create new records
   - Cannot edit existing records
   - Cannot delete any data

2. **CPAP Actions**
   - Cannot answer CPAP questions
   - Cannot create action items
   - Cannot edit action items
   - Cannot submit CPAPs to DILG
   - Cannot update progress

3. **Admin Settings**
   - Cannot access Survey Cycles management
   - Cannot access Barangays management
   - Cannot access Award Management
   - Cannot access Survey Targets
   - Cannot access Supervisor Assignments
   - Cannot access Users & Roles management

4. **Survey Operations**
   - Cannot conduct surveys
   - Cannot submit survey responses
   - Cannot manage assignments

## Implementation Details

### Database Changes

**File**: `database/reinstate-viewer-role.sql`

- Adds viewer role back to the system
- Creates sample viewer user for testing
- Documents viewer permissions

### Permission System

**File**: `src/lib/permissions.ts`

Centralized permission checking functions:
- `isViewer(user)` - Check if user is a viewer
- `canPerformWriteOperations(user)` - Check if user can write (false for viewers)
- `canAccessCPAPDashboard(user)` - Check CPAP dashboard access
- `canEditCPAP(user)` - Check CPAP edit permission
- `canSubmitCPAP(user)` - Check CPAP submit permission
- `canAccessBackupSettings(user)` - Check backup access
- `canAccessAdminSettings(user)` - Check admin settings access

### React Hook

**File**: `src/hooks/usePermissions.ts`

React hook for easy permission checking in components:
```typescript
const { 
  isViewer, 
  canWrite, 
  canEditCPAP, 
  canSubmitCPAP 
} = usePermissions();
```

### Auth Middleware

**File**: `src/lib/auth-middleware.ts`

Added `requireWritePermission()` middleware function to protect write operations at the API level.

### UI Components Updated

1. **CPAP Page** (`src/app/cpap/page.tsx`)
   - Shows "Viewing Mode" notice for viewers
   - Hides Add Item button
   - Hides AI Suggestions button
   - Hides Submit button
   - Allows viewers to access the page

2. **CPAP Item List** (`src/components/cpap/CPAPItemList.tsx`)
   - Hides Edit and Delete buttons for viewers
   - Shows read-only badge

3. **Settings Page** (`src/app/settings/page.tsx`)
   - Redirects viewers to backup section
   - Restricts access to other admin sections

4. **Admin Sidebar** (`src/app/settings/ui/admin-sidebar.tsx`)
   - Shows only Backup option for viewers
   - Shows all options for admins

## Testing

### Test User Credentials

**Email**: viewer@sigla.com  
**Password**: viewer123

### Test Scenarios

1. **Login as Viewer**
   - ✅ Should successfully log in
   - ✅ Should see Main Dashboard

2. **Main Dashboard Access**
   - ✅ Should see Map Tab
   - ✅ Should see Analytics Tab
   - ✅ Should view all data

3. **CPAP Dashboard Access**
   - ✅ Should access CPAP page
   - ✅ Should see "Viewing Mode" notice
   - ❌ Should NOT see Add Item button
   - ❌ Should NOT see AI Suggestions button
   - ❌ Should NOT see Edit buttons on items
   - ❌ Should NOT see Delete buttons on items
   - ❌ Should NOT see Submit button

4. **Settings Access**
   - ✅ Should access Settings page
   - ✅ Should see only Backup option in sidebar
   - ✅ Should be redirected to Backup section
   - ❌ Should NOT see other admin sections

5. **API Protection**
   - ❌ POST/PUT/DELETE requests should be rejected
   - ✅ GET requests should work

## API Route Protection

To protect API routes from viewer write operations, use the `requireWritePermission` middleware:

```typescript
import { requireWritePermission } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Check write permission
  const authError = requireWritePermission(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 403 }
    );
  }
  
  // Continue with write operation
  // ...
}
```

## Migration Steps

### 1. Run Database Migration

```bash
# For MySQL/MariaDB
mysql -u username -p database_name < database/reinstate-viewer-role.sql

# For Supabase (if using PostgreSQL)
# Adapt the SQL syntax for PostgreSQL
```

### 2. Verify Installation

```bash
# Check if viewer user exists
SELECT id, email, firstName, lastName, role, status 
FROM user 
WHERE role = 'viewer';
```

### 3. Create Viewer Users via UI

Admins can now create viewer users directly from the Settings page:

1. Navigate to Settings > Users & Roles
2. Click "Add User" button
3. Fill in user details
4. Select "Viewer" from the Role dropdown
5. Click "Save"

The viewer role is now available in the role selection dropdown alongside Admin, Supervisor, Interviewer, and Officer.

### 4. Test Permissions

1. Log in as viewer user
2. Navigate to each allowed section
3. Verify action buttons are hidden
4. Attempt API write operations (should fail)

## Role Comparison

| Feature | Admin | Developer | Officer | Viewer | FS | Interviewer |
|---------|-------|-----------|---------|--------|----|-----------| 
| View Dashboards | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View CPAP | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit CPAP | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Submit CPAP | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Admin Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Backup Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Conduct Surveys | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Assignments | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

## Security Considerations

1. **Client-Side Protection**: UI elements are hidden but not removed from the bundle
2. **Server-Side Protection**: API routes must validate permissions
3. **Token Validation**: JWT tokens include role information
4. **Middleware Protection**: All write operations should use `requireWritePermission`

## Future Enhancements

1. **Granular Permissions**: Add more fine-grained permission controls
2. **Permission Groups**: Create permission groups for easier management
3. **Audit Logging**: Log viewer access for compliance
4. **Time-Limited Access**: Add expiration dates for viewer accounts
5. **Resource-Level Permissions**: Control access to specific barangays or cycles

## Troubleshooting

### Viewer Can Still Edit

**Problem**: Viewer sees edit buttons or can perform write operations

**Solution**:
1. Check if `usePermissions` hook is imported
2. Verify `canEdit` prop is passed to components
3. Check API route has `requireWritePermission` middleware
4. Clear browser cache and reload

### Viewer Cannot Access Backup

**Problem**: Viewer cannot access backup settings

**Solution**:
1. Verify viewer role is set correctly in database
2. Check sidebar filtering logic
3. Verify `canAccessBackupSettings` returns true

### API Returns 403 for Viewer

**Problem**: Viewer gets 403 errors on GET requests

**Solution**:
1. Ensure only write operations use `requireWritePermission`
2. Use `requireAuth` for read operations
3. Check middleware order in API routes

## Support

For issues or questions about the Viewer role implementation:
1. Check this documentation
2. Review permission utility functions
3. Test with sample viewer account
4. Check browser console for errors
5. Review API response messages

## Changelog

### 2024-12-02
- Reinstated viewer role
- Created permission utility system
- Updated CPAP page for viewer access
- Updated settings page for viewer restrictions
- Added comprehensive documentation
- Created test user account
