# CPAP E2E Tests - Quick Start Guide

## Installation

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install Chromium browser
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run with visible browser
```bash
npm run test:e2e:headed
```

### Run in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test
```bash
npx playwright test -g "should allow OFFICER to create CPAP items"
```

### View test report
```bash
npm run test:e2e:report
```

## Prerequisites

Before running tests, ensure:

1. ✅ Database migrations are applied
2. ✅ Test barangays exist (ID 1 and 2)
3. ✅ Test survey cycle exists (ID 1)
4. ✅ `.env` file exists with required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
5. ✅ Dev server can start on port 3000

## Test Coverage

- ✅ OFFICER creating and submitting CPAP (3 tests)
- ✅ ADMIN reviewing and approving CPAP (2 tests)
- ✅ ADMIN requesting revision (1 test)
- ✅ OFFICER updating progress (1 test)
- ✅ Permission denied scenarios (6 tests)

**Total: 13 E2E tests**

## Expected Output

```
Running 13 tests using 1 worker

✓ tests/e2e/cpap-workflows.spec.ts:13 tests (45s)

13 passed (45s)
```

## Troubleshooting

### Tests fail with timeout
- Check dev server is running
- Increase timeout in `playwright.config.ts`

### Authentication errors
- Verify `JWT_SECRET` in `.env`
- Check test users are created

### "supabaseUrl is required" error
- Ensure `.env` file exists in project root
- Verify all required environment variables are set

### Database errors
- Run migrations: `npx prisma migrate deploy`
- Verify test data exists

## More Information

- [Full Documentation](./README.md)
- [Implementation Details](./CPAP-E2E-TESTS-IMPLEMENTATION.md)
- [Task Completion Summary](../../docs/TASK_16_COMPLETION_SUMMARY.md)
