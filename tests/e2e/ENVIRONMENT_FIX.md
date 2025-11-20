# E2E Tests Environment Variable Fix

## Issue

The E2E tests were failing with the error:
```
Error: supabaseUrl is required. at ..\..\src\lib\supabase.ts:8
```

This occurred because the test file was importing `supabaseAdmin` from `src/lib/supabase.ts` at the top level, which tried to initialize the Supabase client before environment variables were loaded.

## Solution

### 1. Created Test Helpers Module

Created `tests/e2e/test-helpers.ts` that:
- Loads environment variables using `dotenv` before any imports
- Validates required environment variables
- Initializes Supabase admin client with proper configuration
- Exports all test setup and utility functions

### 2. Installed dotenv

```bash
npm install --save-dev dotenv
```

### 3. Updated Test File

Modified `tests/e2e/cpap-workflows.spec.ts` to:
- Import from `test-helpers.ts` instead of `src/lib/supabase.ts`
- Use the pre-configured Supabase client
- Use helper functions for test setup

### 4. Updated Documentation

Updated all documentation files to reflect:
- Required environment variables
- Troubleshooting steps for environment issues
- Proper setup instructions

## Required Environment Variables

The E2E tests require the following environment variables in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

## Files Modified

1. **tests/e2e/test-helpers.ts** (NEW)
   - Environment variable loading
   - Supabase client initialization
   - Test user setup/cleanup functions
   - Authentication helpers

2. **tests/e2e/cpap-workflows.spec.ts** (MODIFIED)
   - Removed direct Supabase import
   - Import from test-helpers instead
   - Updated test user references

3. **package.json** (MODIFIED)
   - Added `dotenv` to devDependencies

4. **tests/e2e/README.md** (MODIFIED)
   - Updated prerequisites section
   - Added environment variable troubleshooting

5. **tests/e2e/QUICK_START.md** (MODIFIED)
   - Updated prerequisites
   - Added environment error troubleshooting

## Verification

To verify the fix works:

1. Ensure `.env` file exists with required variables
2. Run the tests:
   ```bash
   npm run test:e2e
   ```

The tests should now initialize properly without environment variable errors.

## Benefits

1. **Proper Environment Loading**: Environment variables are loaded before any client initialization
2. **Better Error Messages**: Clear validation of required environment variables
3. **Test Isolation**: Test helpers are separate from application code
4. **Maintainability**: Centralized test configuration and setup
5. **Reusability**: Helper functions can be used across multiple test files

## Future Considerations

If adding more E2E test files:
- Import from `test-helpers.ts` for consistent environment setup
- Use the exported `supabaseAdmin` client
- Use the exported helper functions for authentication and data management
