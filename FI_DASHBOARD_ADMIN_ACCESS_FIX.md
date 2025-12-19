# Survey Dashboard Admin Access Fix

## Problem
Admins accessing the Survey Dashboard couldn't see any data because:
1. **Barangay Survey Targets** (Overall Progress tab) - The API was filtering to only show barangays where the user had assignments
2. **Spots** (All Spots tab) - The API was filtering spots by `assigned_fi_id`, and the UI tab was hidden for admins

Since admins typically don't have assignments, they would see empty dashboards.

## Solution
Modified `/api/fi/assignments/route.ts` to check the user's role from the JWT token. If the user is an **admin** or **developer**, the API now returns all spots for the active cycle instead of filtering by assigned FI.

## Changes Made

### File 1: `src/app/api/fi/assignments/route.ts`

1. **Extract user role from JWT token** (lines 27-28):
   ```typescript
   let userId: number;
   let userRole: string;
   try {
     const decoded = jwt.verify(token, JWT_SECRET) as any;
     userId = decoded.id;
     userRole = (decoded.role || '').toLowerCase();
     // ...
   }
   ```

2. **Check if user is admin or developer** (line 45):
   ```typescript
   const isAdminOrDeveloper = userRole === 'admin' || userRole === 'developer';
   ```

3. **Conditionally filter spots** (lines 119-122):
   ```typescript
   // Filter by assigned FI only if user is not admin/developer
   if (!isAdminOrDeveloper) {
     spotsQuery = spotsQuery.eq('assigned_fi_id', userId);
   }
   ```

### File 2: `src/app/api/barangays-with-assignments/route.ts`

1. **Extract user role and check admin status** (lines ~38-40):
   ```typescript
   // Check if user is admin or developer (they can see all barangays)
   const isAdminOrDeveloper = userRole === 'admin' || userRole === 'developer';
   ```

2. **Conditionally filter spots query** (lines ~80-90):
   ```typescript
   let spotsQuery = supabaseAdmin
     .from('spots')
     .select(...)
     .eq('cycle_id', activeCycle.cycle_id);

   // Filter by assigned FI only if user is not admin/developer
   if (!isAdminOrDeveloper) {
     spotsQuery = spotsQuery.eq('assigned_fi_id', userId);
   }
   ```

3. **Include all barangays for admins** (line ~122):
   ```typescript
   // Admin/Developer can see all barangays, FI can only see assigned barangays
   const shouldInclude = isAdminOrDeveloper || allAssignedBarangayIds.has(barangay.barangay_id);
   ```

### File 3: `src/app/survey/page.tsx`

1. **Show "Spots" tab for admins and developers** (line ~350):
   ```typescript
   {(user?.role?.toLowerCase() === 'interviewer' || 
     user?.role?.toLowerCase() === 'admin' || 
     user?.role?.toLowerCase() === 'developer') && (
     <>
       <button onClick={() => setActiveTab('spots')}>
         {user?.role?.toLowerCase() === 'interviewer' ? 'My Spots' : 'All Spots'}
       </button>
     </>
   )}
   ```

2. **Show MySpotAssignments component for admins and developers** (line ~558):
   ```typescript
   {activeTab === 'spots' && (user?.role?.toLowerCase() === 'interviewer' || 
     user?.role?.toLowerCase() === 'admin' || 
     user?.role?.toLowerCase() === 'developer') && (
     <div>
       <MySpotAssignments cycleId={activeCycle?.cycle_id} />
     </div>
   )}
   ```

## Behavior

### For Field Interviewers (FI)
- **Overall Progress tab**: See only barangays where they have assignments
- **All Spots tab**: See only spots assigned to them
- Dashboard shows their specific assignments (existing behavior maintained)

### For Admins and Developers
- **Overall Progress tab**: See **all barangay survey targets** for the active cycle
- **All Spots tab**: See **all spots** for the active survey cycle (tab now visible)
- Can monitor all field activities across all barangays
- No longer restricted to assigned barangays/spots

## Testing
To test this fix:

### As Admin:
1. Log in as an admin user
2. Navigate to `/survey` page
3. On the "Overall Progress" tab, verify all 8 barangay survey targets are visible
4. Click on the "All Spots" tab (previously hidden for admins)
5. Verify that all spots for the active cycle are visible (if any exist)

### As Field Interviewer:
1. Log in as a regular FI user
2. Navigate to `/survey` page
3. On the "Overall Progress" tab, verify only assigned barangays are shown
4. Click on the "My Spots" tab
5. Verify they still only see their assigned spots

## Impact
- **No breaking changes** for existing FI users
- Admins now have full visibility into all survey targets
- Maintains role-based access control
