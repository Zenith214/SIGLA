# Role Case Sensitivity Fix

## Issue

The application was experiencing 403 Forbidden errors for Admin users trying to access `/admin/cpap` because role checks were case-sensitive. The database stores roles with capital first letters (e.g., "Admin", "Officer"), but some code was checking for exact case matches.

## Root Cause

Multiple components were checking user roles with case-sensitive comparisons:
- `user.role === "Admin"` would fail if the database had "admin"
- `user.role === "Officer"` would fail if the database had "officer"

## Solution

Made all role checks case-insensitive throughout the application by using `.toLowerCase()` on the role value before comparison.

## Files Modified

### 1. `src/components/dashboard/UserDropdown.tsx`
**Changed:** All role checks now use `.toLowerCase()`

```typescript
// Before
{user?.role === 'Officer' && (...)}
{user?.role === 'Admin' && (...)}

// After
{user?.role?.toLowerCase() === 'officer' && (...)}
{user?.role?.toLowerCase() === 'admin' && (...)}
```

### 2. `src/app/admin/cpap/page.tsx`
**Changed:** Admin role checks now case-insensitive

```typescript
// Before
if (user && user.role !== "Admin") {...}
if (user?.role === "Admin") {...}
if (!user || user.role !== "Admin") {...}

// After
if (user && user.role?.toLowerCase() !== "admin") {...}
if (user?.role?.toLowerCase() === "admin") {...}
if (!user || user.role?.toLowerCase() !== "admin") {...}
```

### 3. `src/app/cpap/page.tsx`
**Changed:** Officer and Admin role checks now case-insensitive

```typescript
// Before
if (user && user.role !== "Officer" && user.role !== "Admin") {...}

// After
if (user && user.role?.toLowerCase() !== "officer" && user.role?.toLowerCase() !== "admin") {...}
```

### 4. `middleware.ts` ✅
**Already correct:** Middleware was already using `.toLowerCase()`

```typescript
const userRole = (user.role || 'officer').toLowerCase();
```

### 5. `src/lib/services/cpap-permission.service.ts` ✅
**Already correct:** Permission service was already using `.toLowerCase()`

```typescript
const normalizedRole = userRole.toLowerCase();
```

### 6. `src/app/forbidden/page.tsx` ✅
**Already correct:** Forbidden page was already using `.toLowerCase()`

```typescript
const role = user.role?.toLowerCase();
```

## Testing

After these changes, the application now works correctly regardless of how roles are stored in the database:

| Database Value | Code Check | Result |
|----------------|------------|--------|
| "Admin" | `.toLowerCase() === 'admin'` | ✅ Match |
| "admin" | `.toLowerCase() === 'admin'` | ✅ Match |
| "ADMIN" | `.toLowerCase() === 'admin'` | ✅ Match |
| "Officer" | `.toLowerCase() === 'officer'` | ✅ Match |
| "officer" | `.toLowerCase() === 'officer'` | ✅ Match |

## Verification Steps

1. **Admin User Access:**
   - Login as admin user
   - Check that "CPAP Management" appears in dropdown menu
   - Navigate to `/admin/cpap` - should load successfully
   - No 403 Forbidden errors

2. **Officer User Access:**
   - Login as officer user
   - Check that "CPAP Submission" appears in dropdown menu
   - Navigate to `/cpap` - should load successfully
   - No 403 Forbidden errors

3. **FS/Interviewer Users:**
   - Should NOT see CPAP menu items
   - Direct navigation to CPAP pages should redirect to `/forbidden`

## Best Practices Going Forward

### ✅ DO:
```typescript
// Always use toLowerCase() for role checks
if (user?.role?.toLowerCase() === 'admin') {...}
if (user?.role?.toLowerCase() === 'officer') {...}

// Use optional chaining to handle null/undefined
user?.role?.toLowerCase()
```

### ❌ DON'T:
```typescript
// Never use exact case matching
if (user.role === 'Admin') {...}  // BAD
if (user.role === 'Officer') {...}  // BAD

// Don't forget optional chaining
user.role.toLowerCase()  // BAD - will error if role is null
```

## Database Role Values

The application now supports any case variation of these roles:
- **Admin** (or admin, ADMIN, etc.)
- **Officer** (or officer, OFFICER, etc.)
- **FS** (or fs, Fs, etc.)
- **Interviewer** (or interviewer, INTERVIEWER, etc.)

## Related Documentation

- [CPAP Admin User Guide](./CPAP_ADMIN_USER_GUIDE.md)
- [CPAP Officer User Guide](./CPAP_OFFICER_USER_GUIDE.md)
- [CPAP Access Control Implementation](./CPAP_ACCESS_CONTROL_IMPLEMENTATION.md)

---

**Fixed:** November 20, 2025  
**Issue:** Case-sensitive role checks causing 403 errors  
**Solution:** Made all role checks case-insensitive with `.toLowerCase()`
