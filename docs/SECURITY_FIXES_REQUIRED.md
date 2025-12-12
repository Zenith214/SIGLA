# Critical Security and Role Interaction Fixes Required

## 🚨 Immediate Action Required

### 1. Add Authentication to Unprotected API Routes

**Critical Routes Missing Authentication:**
- `src/app/api/tools/run-seeder/route.ts` - Database seeder access
- `src/app/api/visits/route.ts` - Visit logging
- `src/app/api/survey-responses/route.ts` - Survey data access
- `src/app/api/fs/interviews/[id]/route.ts` - Interview details

**Fix:** Add `requireAuth()` or `requireAdmin()` checks at the start of each route.

### 2. Role-Based Access Control Issues

**Problems:**
- Inconsistent role validation across API routes
- Some routes check roles, others don't
- Developer role bypass not consistently implemented
- Missing role checks in sensitive operations

**Fix:** Implement consistent role checking middleware for all protected routes.

### 3. Feature Interaction Vulnerabilities

**Issues:**
- Survey data can be accessed by unauthorized users
- Barangay assignments lack proper permission checks
- Spot management missing supervisor validation
- Cross-feature data leakage possible

### 4. Authentication State Management

**Problems:**
- Multiple auth check mechanisms
- Potential race conditions in auth updates
- Cookie handling inconsistencies
- Middleware vs component auth conflicts

## 🔧 Recommended Implementation

### Step 1: Secure Unprotected Routes
```typescript
// Add to each unprotected route
import { requireAuth, requireAdmin } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // For admin-only operations
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }
  
  // For authenticated operations
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }
  
  // Rest of route logic...
}
```

### Step 2: Implement Consistent Role Checking
```typescript
// Create role-specific middleware
export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = verifyAuth(request);
  if (!authResult.success) return authResult;
  
  const userRole = authResult.user?.role;
  if (userRole === 'developer') return null; // Developer bypass
  
  if (!allowedRoles.includes(userRole)) {
    return { success: false, error: 'Insufficient permissions' };
  }
  
  return null;
}
```

### Step 3: Add Route-Level Role Validation
```typescript
// Example for interviewer-only routes
const roleError = requireRole(request, ['interviewer', 'fs', 'admin']);
if (roleError) {
  return NextResponse.json({ error: roleError.error }, { status: 403 });
}
```

### Step 4: Implement Data Access Controls
- Add user ID validation for data access
- Implement barangay-level permissions
- Add supervisor-subordinate relationship checks
- Validate cross-feature data access

## 🎯 Priority Order

1. **CRITICAL**: Secure `/api/tools/run-seeder/route.ts` (database access)
2. **HIGH**: Secure survey and visit API routes
3. **HIGH**: Implement consistent role checking
4. **MEDIUM**: Add data access controls
5. **MEDIUM**: Fix authentication state management

## 🧪 Testing Required

After fixes:
1. Test all API routes with different user roles
2. Verify proper error responses for unauthorized access
3. Test cross-feature interactions
4. Validate authentication state consistency
5. Check for privilege escalation vulnerabilities

## 📊 Impact Assessment

**Current Risk Level: HIGH**
- Unauthorized database access possible
- Survey data manipulation possible
- Role bypass vulnerabilities exist
- Data leakage across features possible

**Post-Fix Risk Level: LOW**
- All routes properly authenticated
- Role-based access enforced
- Data access properly controlled
- Feature interactions secured