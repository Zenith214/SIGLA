# CPAP Module Access Control Implementation

## Overview

This document describes the implementation of access control for the CPAP (Citizen Priority Action Plan) module, ensuring that FS (Field Supervisor) and INTERVIEWER users cannot access CPAP-related features.

## Implementation Date

November 19, 2025

## Requirements Addressed

- **Requirement 11.1**: No CPAP-related buttons appear in FS dashboard navigation
- **Requirement 11.2**: No CPAP-related buttons appear in INTERVIEWER dashboard navigation
- **Requirement 11.3**: Redirect to appropriate dashboard if direct URL access attempted
- **Requirement 11.4**: Add 403 error page for unauthorized access attempts
- **Requirement 11.5**: Ensure FS and INTERVIEWER roles receive 403 for CPAP endpoints

## Components Modified

### 1. Navigation Components

#### UserDropdown Component (`src/components/dashboard/UserDropdown.tsx`)

**Changes:**
- CPAP Submission menu item only visible to users with `Officer` role
- CPAP Management menu item only visible to users with `Admin` role
- FS and INTERVIEWER users will not see any CPAP-related menu items

**Code:**
```typescript
{/* Show CPAP Submission for Officer role only */}
{user?.role === 'Officer' && (
  <DropdownMenuItem onClick={() => handleMenuClick("cpap")}>
    <ClipboardList className="mr-2 h-4 w-4" />
    <span>CPAP Submission</span>
  </DropdownMenuItem>
)}

{/* Show CPAP Management for Admin role only */}
{user?.role === 'Admin' && (
  <DropdownMenuItem onClick={() => handleMenuClick("cpap-management")}>
    <CheckSquare className="mr-2 h-4 w-4" />
    <span>CPAP Management</span>
  </DropdownMenuItem>
)}
```

### 2. Middleware Protection (`middleware.ts`)

**Changes:**
- Updated Officer route protection to redirect unauthorized users to `/forbidden` page
- Updated Admin route protection to redirect unauthorized users to `/forbidden` page
- API endpoints return 403 Forbidden for unauthorized roles

**Officer Routes Protection:**
```typescript
// Check Officer routes (Officer and Admin can access)
if (OFFICER_ROUTES.some(route => pathname.startsWith(route))) {
  if (userRole !== 'officer' && userRole !== 'admin') {
    // For API routes, return a 403 Forbidden response
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Insufficient permissions', message: 'You need Officer privileges to access this resource' },
        { status: 403 }
      );
    }
    
    // Redirect to 403 forbidden page for FS and INTERVIEWER users
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = '/forbidden';
    forbiddenUrl.searchParams.set('reason', 'role_restricted');
    forbiddenUrl.searchParams.set('attempted_path', pathname);
    return NextResponse.redirect(forbiddenUrl);
  }
}
```

**Admin Routes Protection:**
```typescript
// Check admin routes
if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
  if (userRole !== 'admin') {
    // For API routes, return a 403 Forbidden response
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Insufficient permissions', message: 'You need admin privileges to access this resource' },
        { status: 403 }
      );
    }
    
    // Redirect to 403 forbidden page for non-admin users
    const forbiddenUrl = request.nextUrl.clone();
    forbiddenUrl.pathname = '/forbidden';
    forbiddenUrl.searchParams.set('reason', 'insufficient_permissions');
    forbiddenUrl.searchParams.set('attempted_path', pathname);
    return NextResponse.redirect(forbiddenUrl);
  }
}
```

### 3. CPAP Pages

#### Officer CPAP Page (`src/app/cpap/page.tsx`)

**Changes:**
- Added client-side role check that redirects unauthorized users to `/forbidden`
- Allows both Officer and Admin roles to access

**Code:**
```typescript
// Check if user has Officer or Admin role
useEffect(() => {
  if (user && user.role !== "Officer" && user.role !== "Admin") {
    router.push("/forbidden?reason=role_restricted&attempted_path=/cpap");
  }
}, [user, router]);
```

#### Admin CPAP Page (`src/app/admin/cpap/page.tsx`)

**Changes:**
- Added client-side role check that redirects unauthorized users to `/forbidden`
- Only allows Admin role to access

**Code:**
```typescript
useEffect(() => {
  if (user && user.role !== "Admin") {
    router.push("/forbidden?reason=insufficient_permissions&attempted_path=/admin/cpap");
  }
}, [user, router]);
```

### 4. 403 Forbidden Page (`src/app/forbidden/page.tsx`)

**New Component:**
- Created a dedicated 403 Forbidden error page
- Displays clear error message explaining why access was denied
- Shows the attempted path and user information
- Provides navigation options to return to appropriate dashboard
- Automatically redirects to login if user is not authenticated

**Features:**
- **User-friendly error message**: Explains the access restriction
- **Attempted path display**: Shows which resource the user tried to access
- **User information**: Displays current user email and role
- **Smart navigation**: "Go to Dashboard" button redirects to role-appropriate dashboard
- **Back button**: Allows user to return to previous page
- **Help text**: Suggests contacting administrator if access should be granted

**Role-based Dashboard Routing:**
```typescript
const getDashboardPath = () => {
  if (!user) return "/login";
  
  const role = user.role?.toLowerCase();
  switch (role) {
    case "admin":
      return "/dashboard";
    case "officer":
      return "/dashboard";
    case "fs":
      return "/fs-dashboard";
    case "interviewer":
      return "/survey/forms";
    default:
      return "/dashboard";
  }
};
```

## Access Control Matrix

| User Role   | /cpap Access | /admin/cpap Access | /api/cpap Access | Navigation Menu |
|-------------|--------------|-------------------|------------------|-----------------|
| Admin       | ✅ Allowed   | ✅ Allowed        | ✅ Allowed       | Shows "CPAP Management" |
| Officer     | ✅ Allowed   | ❌ Forbidden      | ✅ Allowed       | Shows "CPAP Submission" |
| FS          | ❌ Forbidden | ❌ Forbidden      | ❌ Forbidden     | No CPAP items   |
| Interviewer | ❌ Forbidden | ❌ Forbidden      | ❌ Forbidden     | No CPAP items   |

## Security Layers

The implementation provides multiple layers of security:

1. **UI Layer**: Navigation items are conditionally rendered based on user role
2. **Client-side Routing**: Page components check user role and redirect if unauthorized
3. **Middleware Layer**: Server-side route protection with automatic redirects
4. **API Layer**: API endpoints return 403 Forbidden for unauthorized requests

## Testing

### Manual Testing Steps

1. **Test FS User Access:**
   - Login as FS user
   - Verify no CPAP menu items appear in user dropdown
   - Attempt to navigate to `/cpap` directly → Should redirect to `/forbidden`
   - Attempt to navigate to `/admin/cpap` directly → Should redirect to `/forbidden`
   - Attempt API call to `/api/cpap` → Should receive 403 response

2. **Test INTERVIEWER User Access:**
   - Login as INTERVIEWER user
   - Verify no CPAP menu items appear in user dropdown
   - Attempt to navigate to `/cpap` directly → Should redirect to `/forbidden`
   - Attempt to navigate to `/admin/cpap` directly → Should redirect to `/forbidden`
   - Attempt API call to `/api/cpap` → Should receive 403 response

3. **Test Officer User Access:**
   - Login as Officer user
   - Verify "CPAP Submission" menu item appears
   - Verify can access `/cpap` page
   - Verify cannot access `/admin/cpap` → Should redirect to `/forbidden`
   - Verify can access `/api/cpap` endpoints

4. **Test Admin User Access:**
   - Login as Admin user
   - Verify "CPAP Management" menu item appears
   - Verify can access `/cpap` page
   - Verify can access `/admin/cpap` page
   - Verify can access all `/api/cpap` endpoints

### Automated Testing

A test script has been created at `scripts/test-cpap-access-control.js` that verifies:
- FS users are properly blocked from CPAP routes
- INTERVIEWER users are properly blocked from CPAP routes
- Unauthorized users receive 403 responses from API endpoints
- Authorized users (Officer, Admin) can access appropriate routes

**Run the test:**
```bash
node scripts/test-cpap-access-control.js
```

## Error Handling

### Page Access Errors

When an unauthorized user attempts to access a CPAP page:
1. Middleware intercepts the request
2. User is redirected to `/forbidden` with query parameters:
   - `reason`: Type of access restriction (e.g., "role_restricted", "insufficient_permissions")
   - `attempted_path`: The path the user tried to access
3. Forbidden page displays user-friendly error message
4. User can navigate back or go to their role-appropriate dashboard

### API Access Errors

When an unauthorized user attempts to access a CPAP API endpoint:
1. Middleware intercepts the request
2. Returns 403 Forbidden response with JSON body:
   ```json
   {
     "error": "Insufficient permissions",
     "message": "You need Officer privileges to access this resource"
   }
   ```
3. Client-side code handles the error and displays appropriate message

## Redirect Behavior

### FS Users
- Attempting `/cpap` → Redirected to `/forbidden`
- Attempting `/admin/cpap` → Redirected to `/forbidden`
- From `/forbidden`, "Go to Dashboard" → Redirected to `/fs-dashboard`

### INTERVIEWER Users
- Attempting `/cpap` → Redirected to `/forbidden`
- Attempting `/admin/cpap` → Redirected to `/forbidden`
- From `/forbidden`, "Go to Dashboard" → Redirected to `/survey/forms`

### Officer Users
- Can access `/cpap` normally
- Attempting `/admin/cpap` → Redirected to `/forbidden`
- From `/forbidden`, "Go to Dashboard" → Redirected to `/dashboard`

### Admin Users
- Can access `/cpap` normally
- Can access `/admin/cpap` normally
- No restrictions on CPAP module

## Files Modified

1. `src/components/dashboard/UserDropdown.tsx` - Navigation menu filtering
2. `middleware.ts` - Server-side route protection
3. `src/app/cpap/page.tsx` - Client-side role check
4. `src/app/admin/cpap/page.tsx` - Client-side role check

## Files Created

1. `src/app/forbidden/page.tsx` - 403 Forbidden error page
2. `scripts/test-cpap-access-control.js` - Automated access control tests
3. `docs/CPAP_ACCESS_CONTROL_IMPLEMENTATION.md` - This documentation

## Compliance

This implementation fully satisfies the following requirements:

✅ **Requirement 11.1**: No CPAP-related buttons appear in FS dashboard navigation
✅ **Requirement 11.2**: No CPAP-related buttons appear in INTERVIEWER dashboard navigation  
✅ **Requirement 11.3**: Redirect to appropriate dashboard if direct URL access attempted
✅ **Requirement 11.4**: Add 403 error page for unauthorized access attempts
✅ **Requirement 11.5**: Ensure FS and INTERVIEWER roles receive 403 for CPAP endpoints

## Future Enhancements

1. **Audit Logging**: Log all unauthorized access attempts for security monitoring
2. **Rate Limiting**: Implement rate limiting on the forbidden page to prevent abuse
3. **Custom Error Messages**: Provide role-specific error messages on the forbidden page
4. **Email Notifications**: Notify administrators of repeated unauthorized access attempts

## Maintenance Notes

- When adding new CPAP-related routes, ensure they are added to `OFFICER_ROUTES` or `ADMIN_ROUTES` in middleware
- When adding new navigation items, ensure role checks are implemented
- Test all changes with different user roles before deploying to production
- Keep the access control matrix updated when roles or permissions change
