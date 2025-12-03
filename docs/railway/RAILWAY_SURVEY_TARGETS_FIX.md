# Railway Survey Targets Error Fix

## Problem
The survey targets page on Railway deployment was showing:
```
Application error: a client-side exception has occurred while loading mlgrc-pulse.up.railway.app
```

## Root Cause
The `useSurveyCycle` context hook was not properly handling cases where:
1. The context was accessed outside of the provider
2. The context returned undefined values
3. API calls failed during initial load

## Changes Made

### 1. Improved Context Error Handling
**File:** `src/contexts/SurveyCycleContext.tsx`

- Changed context default value from empty object to `undefined`
- Added proper error checking in `useSurveyCycle()` hook
- Now throws descriptive error if hook is used outside provider

```typescript
// Before
const SurveyCycleContext = createContext<SurveyCycleContextType>({...});

// After
const SurveyCycleContext = createContext<SurveyCycleContextType | undefined>(undefined);

export function useSurveyCycle() {
  const context = useContext(SurveyCycleContext);
  if (context === undefined) {
    throw new Error('useSurveyCycle must be used within a SurveyCycleProvider');
  }
  return context;
}
```

### 2. Added Error Boundary Component
**File:** `src/components/ErrorBoundary.tsx` (NEW)

- Created React Error Boundary to catch and display client-side errors gracefully
- Shows user-friendly error message with reload option
- Prevents entire app from crashing on component errors

### 3. Wrapped Settings Page with Error Boundary
**File:** `src/app/settings/page.tsx`

- Wrapped the entire settings page with `<ErrorBoundary>`
- Ensures errors in survey targets or other sections are caught and displayed properly
- Provides better user experience on production

## Deployment Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "fix: Add error boundary and improve context handling for survey targets"
   git push origin main
   ```

2. **Railway will auto-deploy** (if connected to your repo)
   - Monitor the deployment logs in Railway dashboard
   - Wait for build to complete

3. **Verify the fix:**
   - Navigate to: `https://mlgrc-pulse.up.railway.app/settings`
   - Click on "Survey Targets" section
   - Should now load without errors

4. **If error persists, check:**
   - Railway environment variables (DATABASE_URL, etc.)
   - Railway logs for server-side errors
   - Browser console for specific error messages

## Additional Notes

- The error boundary will now catch any React component errors and display a friendly message
- The context now properly validates it's being used within the provider
- All existing functionality remains unchanged
- No database migrations required

## Testing Locally

Before deploying, test locally:
```bash
npm run build
npm start
```

Then navigate to `http://localhost:3000/settings` and test the Survey Targets section.
