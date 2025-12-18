# CSIS Manual Testing Documentation

This directory contains all manual testing documentation for the CSIS workflow upgrade.

## Overview

The CSIS (Citizen Satisfaction Index System) workflow upgrade introduces significant changes to the survey system, including:
- 6-section randomization using CSIS methodology
- Kish Grid respondent selection
- GPS verification for quality control
- Enhanced offline capabilities

Manual testing is critical to ensure these features work correctly across different devices, browsers, and network conditions.

## Documentation Files

### 1. CSIS_MANUAL_TESTING_CHECKLIST.md
**Purpose**: Comprehensive checklist of all manual tests to be performed.

**Contents**:
- 12 major test sections
- 100+ individual test cases
- Verification criteria for each test
- Sign-off section

**When to Use**: During formal testing sessions to ensure complete coverage.

### 2. TEST_EXECUTION_GUIDE.md
**Purpose**: Step-by-step instructions for executing each test.

**Contents**:
- Detailed test procedures
- Setup instructions
- Expected results
- Troubleshooting tips
- Screenshot guidelines

**When to Use**: While actively performing tests to ensure correct execution.

### 3. TEST_RESULTS_TEMPLATE.md
**Purpose**: Template for documenting test results.

**Contents**:
- Test result tables
- Issue tracking format
- Performance metrics
- Sign-off sections

**When to Use**: To record results during and after testing.

### 4. QUICK_REFERENCE.md
**Purpose**: Quick lookup guide for common information.

**Contents**:
- Kish Grid table
- Test accounts
- Common commands
- Troubleshooting tips

**When to Use**: Keep open during testing for quick reference.

## Testing Workflow

```
1. Setup Environment
   ↓
2. Review Checklist (CSIS_MANUAL_TESTING_CHECKLIST.md)
   ↓
3. Follow Execution Guide (TEST_EXECUTION_GUIDE.md)
   ↓
4. Use Quick Reference as needed (QUICK_REFERENCE.md)
   ↓
5. Document Results (TEST_RESULTS_TEMPLATE.md)
   ↓
6. Review and Sign-off
```

## Getting Started

### Prerequisites

1. **Development Environment**
   ```bash
   npm install
   npm run dev
   ```

2. **Test Database**
   ```bash
   node scripts/comprehensive-database-seeding.js
   ```

3. **Test Accounts**
   - FI: fi-test@example.com / password123
   - Supervisor: supervisor-test@example.com / password123
   - Admin: admin-test@example.com / password123

4. **Devices**
   - Desktop browser (Chrome, Firefox, Safari)
   - Tablet (iPad or Android)
   - Mobile phone (iOS or Android)

### Quick Start

1. **Read the Execution Guide**
   ```bash
   # Open in your editor
   tests/manual/TEST_EXECUTION_GUIDE.md
   ```

2. **Print or Open the Checklist**
   ```bash
   # Open in your editor
   tests/manual/CSIS_MANUAL_TESTING_CHECKLIST.md
   ```

3. **Keep Quick Reference Handy**
   ```bash
   # Open in browser or editor
   tests/manual/QUICK_REFERENCE.md
   ```

4. **Start Testing**
   - Follow the execution guide
   - Check off items in the checklist
   - Document results in the template

## Test Sections

### Section 1: Kish Grid Validation (30 min)
Tests the respondent selection algorithm with various household sizes.

**Key Tests**:
- Single member household
- Small households (2-5 members)
- Large households (12+ members)
- Gender requirement validation

### Section 2: Section Randomization (30 min)
Verifies that all 6 service sections are assigned in correct randomized order.

**Key Tests**:
- Questionnaire #1, #50, #150 orders
- Section persistence across refreshes
- Progress bar display

### Section 3: GPS Verification (45 min)
Tests GPS capture and verification functionality.

**Key Tests**:
- GPS capture at household
- Within/beyond threshold detection
- Supervisor dashboard display
- Error handling

### Section 4: Navigation and Flow (45 min)
Tests complete survey flow on multiple devices.

**Key Tests**:
- Desktop, tablet, mobile flows
- Back navigation
- Page refresh handling
- Section skipping prevention

### Section 5: Offline Mode (60 min)
Tests offline capabilities and sync functionality.

**Key Tests**:
- Start survey offline
- Complete survey offline
- Sync after reconnection
- Conflict resolution

### Section 6: Callbacks (30 min)
Tests multi-visit survey scenarios.

**Key Tests**:
- Incomplete first visit
- Continuation on second visit
- Multiple callbacks

### Section 7: Backward Compatibility (30 min)
Tests compatibility with existing data.

**Key Tests**:
- Existing localStorage data
- Existing IndexedDB records
- Old questionnaire type field

### Section 8: Error Handling (30 min)
Tests system behavior under error conditions.

**Key Tests**:
- Invalid questionnaire numbers
- Corrupted data
- Network interruptions
- Permission errors

### Section 9: Performance (30 min)
Measures system performance.

**Key Tests**:
- Section assignment speed
- Kish Grid selection speed
- GPS calculation speed
- Page load time

### Section 10: Accessibility (45 min)
Tests accessibility features.

**Key Tests**:
- Screen reader support
- Keyboard navigation
- Color contrast
- Touch target sizes

### Section 11: Cross-Browser (60 min)
Tests on multiple browsers and platforms.

**Key Tests**:
- Chrome/Edge
- Firefox
- Safari (desktop and iOS)
- Chrome (Android)

### Section 12: Security (30 min)
Tests security and access controls.

**Key Tests**:
- GPS data privacy
- Questionnaire number validation
- Section skipping prevention

**Total Estimated Time**: 6-7 hours

## Test Artifacts

### Screenshots
Store in: `tests/manual/screenshots/[date]/`

**Naming Convention**:
```
[section]-[test-number]-[description]-[status].png

Examples:
- kish-grid-1.1-single-member-pass.png
- gps-3.6-within-threshold-fail.png
```

### Screen Recordings
Store in: `tests/manual/recordings/[date]/`

**When to Record**:
- Complex interactions
- Bugs that are hard to describe
- Performance issues
- User flow demonstrations

### Test Data
Store in: `tests/manual/data/[date]/`

**What to Save**:
- Database backups
- Sample survey data
- Configuration files
- Log files

### Test Results
Store in: `tests/manual/results/[date]/`

**Files**:
- Completed TEST_RESULTS_TEMPLATE.md
- Issue reports
- Performance metrics
- Sign-off documents

## Issue Reporting

### Issue Template

```markdown
## Issue #[number]
**Test**: [Section and test number]
**Severity**: Critical / Major / Minor
**Status**: Open / In Progress / Resolved

**Description**: 
[Clear description of the issue]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happened]

**Environment**:
- Browser: [Name and version]
- Device: [Desktop/Tablet/Mobile]
- OS: [Operating system]
- Network: [Online/Offline/3G/etc]

**Screenshots**: 
[Links to screenshots]

**Console Errors**: 
```
[Paste any console errors]
```

**Impact**: 
[How this affects users]

**Workaround**: 
[If any workaround exists]

**Recommendation**: 
[Suggested fix or next steps]
```

### Severity Levels

**Critical (Blocker)**:
- System crash or data loss
- Core functionality completely broken
- Security vulnerability
- Blocks testing of other features

**Major**:
- Important feature not working
- Significant user impact
- No workaround available
- Affects multiple users

**Minor**:
- Cosmetic issue
- Minor inconvenience
- Workaround available
- Affects few users

## Best Practices

### Before Testing
1. ✅ Read all documentation
2. ✅ Set up test environment
3. ✅ Verify test accounts work
4. ✅ Prepare devices
5. ✅ Clear browser cache
6. ✅ Open DevTools

### During Testing
1. ✅ Follow execution guide
2. ✅ Test systematically
3. ✅ Document everything
4. ✅ Take screenshots
5. ✅ Check console for errors
6. ✅ Verify data in IndexedDB
7. ✅ Test edge cases
8. ✅ Don't rush

### After Testing
1. ✅ Complete test results template
2. ✅ Organize screenshots
3. ✅ File issue reports
4. ✅ Review with team
5. ✅ Get sign-off
6. ✅ Archive test artifacts

## Tips for Effective Testing

### 1. Test Systematically
- Follow the checklist order
- Don't skip tests
- Complete one section before moving to next

### 2. Document Everything
- Screenshots are crucial
- Note unexpected behavior
- Record actual vs expected results

### 3. Test Edge Cases
- Don't just test happy paths
- Try invalid inputs
- Test boundary conditions

### 4. Use Real Devices
- Emulators don't catch all issues
- Test on actual phones/tablets
- Test in real network conditions

### 5. Test Slowly
- Rushing leads to missed issues
- Take time to verify results
- Double-check critical tests

### 6. Clear Cache Between Tests
- Start fresh for major test sections
- Prevents interference between tests
- Ensures clean state

### 7. Check Console Always
- Keep DevTools open
- Watch for errors and warnings
- Check network requests

### 8. Test Offline Thoroughly
- Network issues are common in field
- Test all offline scenarios
- Verify sync works correctly

### 9. Vary Test Data
- Use different names, dates, locations
- Test with various household sizes
- Try different questionnaire numbers

### 10. Ask Questions
- If behavior is unclear, document it
- Don't assume something is correct
- Verify with development team

## Common Pitfalls to Avoid

❌ **Skipping tests** - Every test is important
❌ **Not documenting issues** - If it's not documented, it didn't happen
❌ **Testing too quickly** - Slow down and be thorough
❌ **Not clearing cache** - Old data can cause false results
❌ **Ignoring console errors** - Errors indicate problems
❌ **Not testing offline** - Offline mode is critical
❌ **Only testing happy paths** - Edge cases reveal bugs
❌ **Not taking screenshots** - Visual proof is essential
❌ **Testing alone** - Pair testing catches more issues
❌ **Not verifying data** - Always check data was saved correctly

## Support and Resources

### Documentation
- **Design Document**: `.kiro/specs/csis-workflow-upgrade/design.md`
- **Requirements**: `.kiro/specs/csis-workflow-upgrade/requirements.md`
- **Tasks**: `.kiro/specs/csis-workflow-upgrade/tasks.md`
- **Troubleshooting**: `docs/CSIS_TROUBLESHOOTING_GUIDE.md`
- **FI Training**: `docs/FI_TRAINING_GUIDE_CSIS.md`
- **API Documentation**: `docs/API_DOCUMENTATION_CSIS.md`

### Code References
- **Kish Grid**: `src/app/survey/forms/utils/kishGrid.ts`
- **Section Assignment**: `src/app/survey/forms/utils/sectionAssignment.ts`
- **GPS Verification**: `src/app/survey/forms/utils/gpsVerification.ts`
- **Survey Page**: `src/app/survey/forms/page.tsx`

### Getting Help
If you encounter issues during testing:
1. Check the Troubleshooting Guide
2. Review browser console for errors
3. Check IndexedDB for data integrity
4. Contact development team with details

**Development Team**: [Add contact info]
**Test Coordinator**: [Add contact info]
**Project Manager**: [Add contact info]

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial manual testing documentation | [Name] |

## License

Internal use only. Do not distribute outside the organization.
