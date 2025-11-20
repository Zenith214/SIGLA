# CPAP E2E Tests

End-to-end tests for the CPAP (Citizen Priority Action Plan) module using Playwright.

## Overview

These tests validate complete user workflows from a browser perspective, including:

1. **OFFICER Creating and Submitting CPAP**
   - Accessing CPAP interface from dashboard
   - Creating CPAP items with all required fields
   - Submitting CPAP for DILG review

2. **ADMIN Reviewing and Approving CPAP**
   - Accessing CPAP management dashboard
   - Reviewing submitted CPAPs
   - Approving CPAPs with comments

3. **ADMIN Requesting Revision**
   - Requesting revisions on submitted CPAPs
   - Providing revision comments

4. **OFFICER Updating Progress**
   - Updating progress on approved CPAPs
   - Tracking actual outputs and accomplishment status

5. **Permission Denied Scenarios**
   - FS users cannot access CPAP interface
   - Interviewer users cannot access CPAP interface
   - CPAP buttons hidden from unauthorized roles

## Requirements Tested

- **1.1**: OFFICER access to CPAP creation interface
- **2.1**: OFFICER creating and editing CPAP items
- **3.1**: OFFICER submitting CPAP for review
- **5.1**: ADMIN reviewing and approving CPAPs
- **6.1**: ADMIN requesting revisions
- **7.1**: OFFICER updating progress on approved CPAPs
- **11.5**: Permission denied for FS/INTERVIEWER users

## Prerequisites

1. **Install Playwright**:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install chromium
   ```

2. **Environment Setup**:
   - Ensure `.env` file exists in project root with:
     - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
     - `JWT_SECRET` - Secret for JWT token generation
   - Set `NEXT_PUBLIC_BASE_URL` (defaults to `http://localhost:3000`)

3. **Database Setup**:
   - CPAP tables must be created (run migrations)
   - Test barangays (ID 1 and 2) must exist
   - Test survey cycle (ID 1) must exist

## Running Tests

### Run all E2E tests:
```bash
npx playwright test
```

### Run specific test file:
```bash
npx playwright test tests/e2e/cpap-workflows.spec.ts
```

### Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

### Run tests in debug mode:
```bash
npx playwright test --debug
```

### Run specific test:
```bash
npx playwright test -g "should allow OFFICER to create CPAP items"
```

### View test report:
```bash
npx playwright show-report
```

## Test Structure

### Test Users

The tests create the following test users:

- **e2e.officer1@cpap.test**: Officer for barangay 1
- **e2e.officer2@cpap.test**: Officer for barangay 2
- **e2e.admin@cpap.test**: Admin user
- **e2e.fs@cpap.test**: Field Supervisor user
- **e2e.interviewer@cpap.test**: Interviewer user

These users are automatically created before tests and cleaned up after.

### Test Data

- Test CPAPs are created for barangays 1 and 2
- Test CPAP items are created with sample data
- All test data is cleaned up after tests complete

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Test directory**: `./tests/e2e`
- **Workers**: 1 (sequential execution to avoid conflicts)
- **Retries**: 2 in CI, 0 locally
- **Reporter**: HTML report
- **Screenshots**: Only on failure
- **Trace**: On first retry

## Troubleshooting

### Tests fail with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Check that `@playwright/test` and `dotenv` are in `devDependencies`

### Tests fail with "supabaseUrl is required"
- Ensure `.env` file exists in project root
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set in `.env`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`

### Tests fail with database errors
- Ensure database migrations have been run
- Check that test barangays and survey cycles exist
- Verify database connection in `.env` file

### Tests timeout
- Increase timeout in test configuration
- Check that dev server is running
- Verify network connectivity

### Authentication issues
- Check `JWT_SECRET` environment variable
- Verify cookie settings in test helpers
- Ensure test users are created successfully

## CI/CD Integration

To run E2E tests in CI/CD:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npx playwright test
  env:
    CI: true
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Best Practices

1. **Keep tests independent**: Each test should be able to run in isolation
2. **Clean up test data**: Always clean up created data in `afterAll` hooks
3. **Use meaningful selectors**: Prefer text content and semantic selectors over CSS classes
4. **Handle async operations**: Use `waitForLoadState` and `expect` with timeouts
5. **Test user flows**: Focus on complete workflows rather than individual actions
6. **Verify outcomes**: Check both UI state and database state when appropriate

## Maintenance

### Adding New Tests

1. Add test to `cpap-workflows.spec.ts` or create new spec file
2. Follow existing patterns for user login and data setup
3. Use descriptive test names that explain the scenario
4. Add cleanup in `afterAll` hooks

### Updating Selectors

If UI changes break tests:

1. Update selectors to match new UI structure
2. Use `.or()` to provide fallback selectors
3. Prefer stable selectors (text content, data attributes)
4. Avoid brittle selectors (CSS classes, complex XPath)

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [CPAP API Documentation](../../docs/CPAP_API_QUICK_REFERENCE.md)
- [CPAP Officer Guide](../../docs/CPAP_OFFICER_QUICK_GUIDE.md)
- [CPAP Admin Guide](../../docs/CPAP_ADMIN_QUICK_GUIDE.md)
