# CPAP E2E Tests Implementation Summary

## Overview

End-to-end tests have been implemented for the CPAP module using Playwright to validate complete user workflows from a browser perspective.

## Implementation Details

### Files Created

1. **playwright.config.ts** - Playwright configuration
   - Test directory: `./tests/e2e`
   - Single worker for sequential execution
   - Automatic dev server startup
   - HTML reporter with screenshots on failure

2. **tests/e2e/cpap-workflows.spec.ts** - Main E2E test suite
   - 13 comprehensive E2E tests covering all workflows
   - Test user setup and cleanup
   - Test data management
   - Authentication helpers

3. **tests/e2e/README.md** - Documentation
   - Test overview and structure
   - Running instructions
   - Troubleshooting guide
   - CI/CD integration examples

4. **package.json** - Updated with E2E scripts
   - `npm run test:e2e` - Run all E2E tests
   - `npm run test:e2e:headed` - Run with visible browser
   - `npm run test:e2e:debug` - Run in debug mode
   - `npm run test:e2e:report` - View test report

### Test Coverage

#### 1. OFFICER Creating and Submitting CPAP (3 tests)
- ✅ Access CPAP interface from dashboard
- ✅ Create CPAP items with all required fields
- ✅ Submit CPAP for DILG review

**Requirements tested**: 1.1, 2.1, 3.1

#### 2. ADMIN Reviewing and Approving CPAP (2 tests)
- ✅ Access CPAP management dashboard
- ✅ Review and approve submitted CPAPs

**Requirements tested**: 5.1

#### 3. ADMIN Requesting Revision (1 test)
- ✅ Request revisions with comments

**Requirements tested**: 6.1

#### 4. OFFICER Updating Progress (1 test)
- ✅ Update progress on approved CPAPs
- ✅ Track actual outputs and accomplishment status

**Requirements tested**: 7.1

#### 5. Permission Denied Scenarios (6 tests)
- ✅ FS user denied access to CPAP interface
- ✅ Interviewer user denied access to CPAP interface
- ✅ FS user denied access to admin CPAP management
- ✅ Interviewer user denied access to admin CPAP management
- ✅ CPAP button hidden from FS user navigation
- ✅ CPAP button hidden from Interviewer user navigation

**Requirements tested**: 11.5

### Test Users

The tests automatically create and manage the following test users:

| Email | Role | Barangay | Purpose |
|-------|------|----------|---------|
| e2e.officer1@cpap.test | Officer | 1 | Primary officer for testing CPAP creation and progress |
| e2e.officer2@cpap.test | Officer | 2 | Secondary officer for cross-barangay permission tests |
| e2e.admin@cpap.test | Admin | - | Admin for testing review and approval workflows |
| e2e.fs@cpap.test | FS | - | Field supervisor for permission denial tests |
| e2e.interviewer@cpap.test | Interviewer | - | Interviewer for permission denial tests |

All test users are automatically cleaned up after tests complete.

### Test Data Management

- **Setup**: Test users and CPAPs created in `beforeAll` hooks
- **Cleanup**: All test data removed in `afterAll` hooks
- **Isolation**: Each test group has its own test data
- **Database**: Uses Supabase admin client for direct data manipulation

### Key Features

1. **Realistic User Flows**: Tests simulate actual user interactions
2. **Authentication**: JWT token-based authentication with cookies
3. **Flexible Selectors**: Multiple selector strategies for robustness
4. **Error Handling**: Graceful handling of timing and visibility issues
5. **Comprehensive Coverage**: All major workflows and edge cases tested

## Running the Tests

### Prerequisites

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browser
npx playwright install chromium
```

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Environment Requirements

- Database with CPAP tables created
- Test barangays (ID 1 and 2) must exist
- Test survey cycle (ID 1) must exist
- `JWT_SECRET` environment variable set
- Dev server accessible at `http://localhost:3000`

## Test Results

### Expected Outcomes

When all tests pass, you should see:

```
Running 13 tests using 1 worker

✓ OFFICER Creating and Submitting CPAP
  ✓ should allow OFFICER to access CPAP interface from dashboard
  ✓ should allow OFFICER to create CPAP items
  ✓ should allow OFFICER to submit CPAP for review

✓ ADMIN Reviewing and Approving CPAP
  ✓ should allow ADMIN to access CPAP management dashboard
  ✓ should allow ADMIN to review and approve CPAP

✓ ADMIN Requesting Revision
  ✓ should allow ADMIN to request revision on CPAP

✓ OFFICER Updating Progress on Approved CPAP
  ✓ should allow OFFICER to update progress on approved CPAP

✓ Permission Denied Scenarios
  ✓ should deny FS user access to CPAP interface
  ✓ should deny Interviewer user access to CPAP interface
  ✓ should deny FS user access to admin CPAP management
  ✓ should deny Interviewer user access to admin CPAP management
  ✓ should not show CPAP button in FS user navigation
  ✓ should not show CPAP button in Interviewer user navigation

13 passed (45s)
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
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

## Troubleshooting

### Common Issues

1. **Tests timeout**
   - Increase timeout in `playwright.config.ts`
   - Check dev server is running
   - Verify database connectivity

2. **Authentication failures**
   - Verify `JWT_SECRET` is set correctly
   - Check cookie domain matches test URL
   - Ensure test users are created successfully

3. **Element not found**
   - UI may have changed - update selectors
   - Check for loading states
   - Verify user has correct permissions

4. **Database errors**
   - Run database migrations
   - Ensure test barangays exist
   - Check database connection string

## Maintenance

### Updating Tests

When UI changes:
1. Update selectors in test file
2. Use `.or()` for fallback selectors
3. Prefer text content over CSS classes
4. Test changes locally before committing

### Adding New Tests

1. Add to existing test groups or create new describe block
2. Follow existing patterns for setup/cleanup
3. Use descriptive test names
4. Document requirements tested

## Requirements Validation

All requirements from Task 16 have been implemented:

- ✅ Write E2E test for OFFICER creating and submitting CPAP
- ✅ Write E2E test for ADMIN reviewing and approving CPAP
- ✅ Write E2E test for ADMIN requesting revision
- ✅ Write E2E test for OFFICER updating progress on approved CPAP
- ✅ Write E2E test for permission denied scenarios (FS/INTERVIEWER access)
- ✅ Use Playwright for browser automation

**Requirements tested**: 1.1, 2.1, 3.1, 5.1, 6.1, 7.1, 11.5

## Next Steps

1. **Run tests locally** to verify they pass in your environment
2. **Integrate with CI/CD** to run tests automatically on commits
3. **Monitor test results** and update as UI evolves
4. **Expand coverage** as new features are added to CPAP module

## Related Documentation

- [E2E Test README](./README.md)
- [CPAP API Documentation](../../docs/CPAP_API_QUICK_REFERENCE.md)
- [CPAP Officer Guide](../../docs/CPAP_OFFICER_QUICK_GUIDE.md)
- [CPAP Admin Guide](../../docs/CPAP_ADMIN_QUICK_GUIDE.md)
- [Integration Tests](../integration/CPAP-API-INTEGRATION-TESTS.md)
