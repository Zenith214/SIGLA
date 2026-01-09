# Role-Based Access Control - Security Improvements

## Summary

Added proper role-based access restrictions to administrative pages that were previously accessible via direct URL despite having no UI links for restricted roles.

## Problem Identified

Several administrative pages had `<ProtectedRoute>` without `allowedRoles` parameter, meaning:
- ✅ Required authentication (login)
- ❌ Did NOT restrict by role
- 🔓 Any authenticated user could access via direct URL

This was "security by obscurity" - relying on hidden UI links rather than actual access control.

## Changes Applied

### 1. Dashboard Page
**File:** `src/app/dashboard/page.tsx`

**Before:**
```tsx
<ProtectedRoute>
  <DashboardLayout>...</DashboardLayout>
</ProtectedRoute>
```

**After:**
```tsx
<ProtectedRoute allowedRoles={['admin', 'developer', 'fs', 'officer', 'viewer']}>
  <DashboardLayout>...</DashboardLayout>
</ProtectedRoute>
```

**Impact:**
- Interviewers now get 403 Forbidden when accessing `/dashboard`
- Already had no UI link for interviewers (hidden in `/survey` page)
- Now properly enforced at route level

---

### 2. Field Supervisor Dashboard
**File:** `src/app/fs-dashboard/page.tsx`

**Before:**
```tsx
<ProtectedRoute>
  <FSDashboardLayout>...</FSDashboardLayout>
</ProtectedRoute>
```

**After:**
```tsx
<ProtectedRoute allowedRoles={['admin', 'developer', 'fs']}>
  <FSDashboardLayout>...</FSDashboardLayout>
</ProtectedRoute>
```

**Impact:**
- Only Field Supervisors, Admins, and Developers can access
- Interviewers and Officers blocked from supervisor tools
- Prevents unauthorized access to interviewer assignment management

---

### 3. Admin CPAP Management
**File:** `src/app/admin/cpap/page.tsx`

**Before:**
```tsx
<ProtectedRoute>
  <div>CPAP List...</div>
</ProtectedRoute>
```

**After:**
```tsx
<ProtectedRoute allowedRoles={['admin', 'developer']}>
  <div>CPAP List...</div>
</ProtectedRoute>
```

**Impact:**
- Only Admins and Developers can access admin CPAP interface
- Field Supervisors and Officers use `/cpap` (different page with different permissions)
- Consistent with existing role check in component logic

---

### 4. Admin CPAP Review
**File:** `src/app/admin/cpap/review/[id]/page.tsx`

**Before:**
```tsx
<ProtectedRoute>
  <div>CPAP Review...</div>
</ProtectedRoute>
```

**After:**
```tsx
<ProtectedRoute allowedRoles={['admin', 'developer']}>
  <div>CPAP Review...</div>
</ProtectedRoute>
```

**Impact:**
- Only Admins and Developers can review CPAPs from admin interface
- Prevents unauthorized CPAP approval/rejection

---

## Security Benefits

### Before
- ❌ Interviewers could access `/dashboard` by typing URL
- ❌ Any user could access `/fs-dashboard` via direct URL
- ❌ Any user could access `/admin/cpap` pages via direct URL
- ⚠️ Relied on UI hiding rather than actual access control

### After
- ✅ Proper 403 Forbidden responses for unauthorized roles
- ✅ Consistent role-based access control across all pages
- ✅ Defense in depth - both UI hiding AND route protection
- ✅ Prevents privilege escalation via URL manipulation

## Role Access Matrix

| Page | Interviewer | FS | Officer | Admin | Developer | Viewer |
|------|-------------|----|---------| ------|-----------|--------|
| `/survey` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/survey/forms` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/survey/spot/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/profile` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/fs-dashboard` | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `/cpap` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/admin/cpap` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |

**Note:** Developer role bypasses all role checks (implemented in `ProtectedRoute` component)

## Testing Recommendations

### Manual Testing
1. **As Interviewer:**
   - Try accessing `/dashboard` → Should get 403 Forbidden
   - Try accessing `/fs-dashboard` → Should get 403 Forbidden
   - Try accessing `/admin/cpap` → Should get 403 Forbidden
   - Verify `/survey` and `/survey/forms` still work

2. **As Field Supervisor:**
   - Verify `/fs-dashboard` works
   - Verify `/dashboard` works
   - Try accessing `/admin/cpap` → Should get 403 Forbidden

3. **As Admin:**
   - Verify all pages accessible
   - Verify no regression in existing functionality

### Automated Testing
- Add E2E tests for role-based access control
- Test 403 responses for unauthorized role access
- Verify proper redirects to `/forbidden` page

## Related Documentation

- `INTERVIEWER_ACCESS_ANALYSIS.md` - Complete analysis of interviewer access patterns
- `HOVER_PREVIEW_FEATURE.md` - Recent dashboard UX improvements
- `src/components/auth/ProtectedRoute.tsx` - Route protection implementation

## Next Steps

Consider implementing role-based service worker registration:
- Only register service worker for Interviewer role
- Reduces cache bloat for office users
- Improves debugging for admin/FS users
- See `INTERVIEWER_ACCESS_ANALYSIS.md` for full analysis
