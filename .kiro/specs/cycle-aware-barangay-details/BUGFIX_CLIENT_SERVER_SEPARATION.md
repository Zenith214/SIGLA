# Bug Fix: Client-Server Code Separation

**Date:** October 26, 2025  
**Issue:** Runtime error - "supabaseKey is required"  
**Status:** ✅ FIXED

---

## Problem Description

### Error Message
```
supabaseKey is required.
at src\lib\supabase.ts:12:42
```

### Root Cause
The `satisfactionDataHelpers.ts` utility (used in client-side components) was importing `getActiveCycleId()` from `surveyCycleHelpers.ts`, which in turn imported `supabaseAdmin` from `src/lib/supabase.ts`.

The `supabaseAdmin` client requires the `SUPABASE_SERVICE_ROLE_KEY` environment variable, which is:
- Server-side only (not exposed to the browser)
- Not available in client-side code
- Causes a runtime error when webpack tries to bundle it for the browser

### Code Flow That Caused the Issue
```
BarangayDetailsCard.tsx (client)
  └─> satisfactionDataHelpers.ts (client)
      └─> surveyCycleHelpers.ts (server-only)
          └─> supabaseAdmin (requires SUPABASE_SERVICE_ROLE_KEY)
              └─> ❌ ERROR: Key not available in browser
```

---

## Solution

### Changes Made

#### 1. Removed Server-Side Import from Client Utility
**File:** `src/utils/satisfactionDataHelpers.ts`

**Before:**
```typescript
import { getActiveCycleId } from './surveyCycleHelpers';
import { satisfactionCache } from './satisfactionCache';

export async function fetchSatisfactionData(
  barangayId: number,
  cycleId: number | null = null
): Promise<SatisfactionData> {
  try {
    // If no cycleId provided, use the active cycle
    let effectiveCycleId = cycleId;
    
    if (!effectiveCycleId) {
      effectiveCycleId = await getActiveCycleId(); // ❌ Server-side call
    }
    
    if (!effectiveCycleId) {
      throw new Error('No active cycle found and no cycle ID provided');
    }
    // ...
}
```

**After:**
```typescript
import { satisfactionCache } from './satisfactionCache';

export async function fetchSatisfactionData(
  barangayId: number,
  cycleId: number | null = null
): Promise<SatisfactionData> {
  try {
    // cycleId is required - it should be passed from the component
    // The component should use useActiveCycle hook to get the active cycle
    if (!cycleId) {
      throw new Error('Cycle ID is required. Please ensure an active cycle is selected.');
    }
    
    const effectiveCycleId = cycleId;
    // ...
}
```

#### 2. Updated Component to Always Provide Cycle ID
**File:** `src/components/dashboard/BarangayDetailsCard.tsx`

**Before:**
```typescript
const fetchData = async () => {
  if (!selectedBarangay) return;

  setLoading(true);
  setError(null);

  try {
    const data = await fetchSatisfactionData(selectedBarangay.id, selectedCycleId);
    // ...
  }
}
```

**After:**
```typescript
const fetchData = async () => {
  if (!selectedBarangay) return;

  // Determine which cycle to use: selected cycle or active cycle
  const effectiveCycleId = selectedCycleId || activeCycle?.cycle_id;
  
  if (!effectiveCycleId) {
    setError('No active cycle available. Please ensure a survey cycle is active.');
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const data = await fetchSatisfactionData(selectedBarangay.id, effectiveCycleId);
    // ...
  }
}
```

---

## Architecture Principles Applied

### 1. Client-Server Separation
- **Client-side code** should never import server-side utilities that use `supabaseAdmin`
- **Server-side code** (API routes, server components) can use `supabaseAdmin`
- **Client-side code** should use:
  - React hooks (like `useActiveCycle`)
  - API routes (via `fetch`)
  - Client-safe utilities

### 2. Dependency Flow
```
✅ CORRECT:
Client Component
  └─> Client Hook (useActiveCycle)
  └─> Client Utility (satisfactionDataHelpers)
      └─> API Route (via fetch)
          └─> Server Utility (surveyCycleHelpers)
              └─> supabaseAdmin

❌ INCORRECT:
Client Component
  └─> Client Utility
      └─> Server Utility (surveyCycleHelpers)
          └─> supabaseAdmin ❌ ERROR
```

### 3. Data Flow Pattern
1. **Component** uses `useActiveCycle` hook to get active cycle from context
2. **Component** passes cycle ID to utility function
3. **Utility** makes API call with cycle ID
4. **API route** uses server-side utilities and database access
5. **Response** flows back through the chain

---

## Verification

### Build Test
```bash
npm run build
```
**Result:** ✅ Compiled successfully in 17.5s

### Runtime Test
1. Start dev server: `npm run dev`
2. Navigate to Map Dashboard
3. Select a barangay
4. Verify satisfaction data loads without errors

**Result:** ✅ No runtime errors

---

## Related Files

### Modified Files
- `src/utils/satisfactionDataHelpers.ts` - Removed server-side import
- `src/components/dashboard/BarangayDetailsCard.tsx` - Added cycle ID fallback logic

### Unmodified (Working Correctly)
- `src/utils/surveyCycleHelpers.ts` - Server-side only, used in API routes
- `src/hooks/useSurveyCycle.tsx` - Client-side hook for getting active cycle
- `src/lib/supabase.ts` - Server-side Supabase admin client

---

## Lessons Learned

### 1. Environment Variable Visibility
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Non-prefixed variables (like `SUPABASE_SERVICE_ROLE_KEY`) are server-only
- Never try to access server-only variables in client code

### 2. Import Analysis
- Webpack bundles all imports for client-side code
- Importing server-side code causes it to be bundled for the browser
- This can expose secrets or cause runtime errors

### 3. Next.js Architecture
- Use API routes as the boundary between client and server
- Client components should never directly access the database
- Use React hooks and context for client-side state management

### 4. Testing Strategy
- Always test builds (`npm run build`) to catch bundling issues
- Runtime errors in development may not appear until production build
- Integration tests should cover both client and server code paths

---

## Prevention Guidelines

### For Future Development

1. **Before importing a utility in client code:**
   - Check if it imports `supabaseAdmin`
   - Check if it uses server-only environment variables
   - Check if it's marked as server-only

2. **When creating new utilities:**
   - Clearly separate client and server utilities
   - Use naming conventions (e.g., `*.server.ts` for server-only)
   - Document which environment the utility is for

3. **When using environment variables:**
   - Use `NEXT_PUBLIC_*` prefix for client-accessible variables
   - Never expose service role keys or secrets to the client
   - Use API routes to access server-side data

4. **Testing checklist:**
   - [ ] Run `npm run build` to verify production build
   - [ ] Check browser console for errors
   - [ ] Verify no server-only code in client bundles
   - [ ] Test in both development and production modes

---

## Impact Assessment

### Before Fix
- ❌ Application crashed on page load
- ❌ Dashboard unusable
- ❌ Production build would fail

### After Fix
- ✅ Application loads successfully
- ✅ Dashboard fully functional
- ✅ Production build succeeds
- ✅ Proper client-server separation maintained
- ✅ No security issues (service role key not exposed)

---

## Sign-Off

**Issue:** Client-server code separation violation  
**Fix:** Removed server-side imports from client utilities  
**Verification:** Build successful, runtime tested  
**Status:** ✅ RESOLVED

**Date:** October 26, 2025
