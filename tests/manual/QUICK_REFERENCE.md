# CSIS Testing Quick Reference

Quick reference guide for manual testers. Keep this handy during testing sessions.

## Quick Start

```bash
# Start development server
npm run dev

# Access application
http://localhost:3000

# Access from mobile device (replace with your IP)
http://192.168.1.100:3000
```

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Field Interviewer | fi-test@example.com | password123 |
| Supervisor | supervisor-test@example.com | password123 |
| Admin | admin-test@example.com | password123 |

## Key URLs

| Page | URL |
|------|-----|
| Login | `/login` |
| Survey Form | `/survey/forms?barangayId=1` |
| Supervisor Dashboard | `/fs-dashboard` |
| Admin Settings | `/settings` |

## Kish Grid Quick Reference

### Column Calculation
```
Column = (Questionnaire Number % 10) OR 10 if result is 0

Examples:
- Q#1 → Column 1
- Q#10 → Column 10 (not 0)
- Q#25 → Column 5
- Q#150 → Column 10
```

### Row Calculation
```
Row = Number of Eligible Members (capped at 12)

Examples:
- 3 members → Row 3
- 8 members → Row 8
- 15 members → Row 12 (capped)
```

### Kish Grid Table (12x10)

| Members | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 | Col 8 | Col 9 | Col 10 |
|---------|-------|-------|-------|-------|-------|-------|-------|-------|-------|--------|
| 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| 2 | 1 | 2 | 1 | 1 | 2 | 2 | 1 | 1 | 2 | 2 |
| 3 | 1 | 2 | 3 | 1 | 2 | 3 | 1 | 2 | 3 | 1 |
| 4 | 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 | 1 | 2 |
| 5 | 1 | 2 | 3 | 4 | 5 | 1 | 2 | 3 | 4 | 5 |
| 6 | 1 | 2 | 3 | 4 | 5 | 6 | 1 | 2 | 3 | 4 |
| 7 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 1 | 2 | 3 |
| 8 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 1 | 2 |
| 9 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 1 |
| 10 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| 11 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| 12+ | 1 | 3 | 7 | 5 | 6 | 4 | 8 | 10 | 12 | 9 |

## Section Randomization

### Canonical Section Order
1. Financial Administration
2. Disaster Preparedness
3. Social Protection
4. Safety & Peace
5. Business-Friendly
6. Environmental Management

### Sample Randomization (First 10)
| Q# | Starting Section |
|----|------------------|
| 1 | Financial |
| 2 | Disaster |
| 3 | Social |
| 4 | Safety |
| 5 | Business |
| 6 | Environmental |
| 7 | Financial |
| 8 | Disaster |
| 9 | Social |
| 10 | Safety |

*Full map in: `src/app/survey/forms/utils/sectionAssignment.ts`*

## Gender Requirements

```
Odd Questionnaire Number → Male Respondent Required
Even Questionnaire Number → Female Respondent Required

Examples:
- Q#1 (odd) → Male
- Q#2 (even) → Female
- Q#25 (odd) → Male
- Q#150 (even) → Female
```

## GPS Verification

### Threshold
- **Default**: 200 meters
- **Within Threshold**: Green indicator, no flag
- **Beyond Threshold**: Red indicator, flagged for review

### Distance Calculation
Uses Haversine formula for accuracy on Earth's surface.

### Map Pins
- **Blue Pin**: Assigned spot location
- **Green Pin**: Actual interview location
- **Line Color**: Green (within) / Red (beyond threshold)

## Browser DevTools Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open DevTools | F12 | Cmd+Opt+I |
| Console | Ctrl+Shift+J | Cmd+Opt+J |
| Network Tab | Ctrl+Shift+E | Cmd+Opt+E |
| Go Offline | Network Tab → Offline checkbox | Same |
| Clear Cache | Ctrl+Shift+Delete | Cmd+Shift+Delete |

## Common Test Scenarios

### Scenario 1: Basic Survey
1. Login as FI
2. Start survey (Q# generated)
3. Capture GPS
4. Add 3 household members
5. Select respondent (Kish Grid)
6. Complete demographics
7. Complete all 6 sections
8. Submit

**Expected Time**: 15-20 minutes

### Scenario 2: Offline Survey
1. Go offline (DevTools)
2. Start survey
3. Complete entire survey
4. Submit (queued)
5. Go online
6. Auto-sync

**Expected**: Survey syncs successfully

### Scenario 3: Callback
1. Start survey
2. Complete 3 of 6 sections
3. Mark as callback
4. Save and exit
5. Return later
6. Complete remaining 3 sections
7. Submit

**Expected**: All data preserved

### Scenario 4: Large Household
1. Start survey
2. Add 15 household members
3. Select respondent
4. Verify row capped at 12
5. Complete survey

**Expected**: Kish Grid handles correctly

## Verification Checklist

### After Each Test
- [ ] Check browser console for errors
- [ ] Verify data in IndexedDB (DevTools → Application → IndexedDB)
- [ ] Take screenshot if issue found
- [ ] Note actual vs expected behavior
- [ ] Record in test results template

### Before Moving to Next Section
- [ ] All tests in section completed
- [ ] Issues documented
- [ ] Screenshots captured
- [ ] Results recorded

## Common Issues and Solutions

### GPS Not Capturing
**Symptoms**: Button stuck on "Capturing..."
**Solutions**:
1. Check location permission in browser
2. Try different browser
3. Check if HTTPS (required for GPS)
4. Try on mobile device

### Survey Not Saving
**Symptoms**: Data lost on refresh
**Solutions**:
1. Check IndexedDB in DevTools
2. Verify no console errors
3. Check browser storage quota
4. Clear cache and retry

### Kish Grid Wrong Selection
**Symptoms**: Selected member doesn't match expected
**Solutions**:
1. Verify questionnaire number
2. Calculate column manually (Q# % 10)
3. Count eligible members (row)
4. Check Kish Grid table
5. Verify gender filtering

### Sections Not Appearing
**Symptoms**: Less than 6 sections shown
**Solutions**:
1. Check questionnaire number valid (1-150)
2. Verify section assignment in console
3. Check for JavaScript errors
4. Refresh and retry

### Offline Sync Failing
**Symptoms**: Surveys stuck in pending
**Solutions**:
1. Check network connection
2. Verify API endpoint accessible
3. Check authentication token
4. Try manual sync button
5. Check console for errors

## Data Validation

### Valid Questionnaire Number
- Range: 1-150
- Format: BB-YYYY-NNNN (online) or BB-OFFLINE-NNNN (offline)

### Valid Household Member
- Name: Not empty
- Birthdate: Valid date, age 18+
- Gender: Male or Female

### Valid GPS Coordinates (Philippines)
- Latitude: ~4° to 21° N
- Longitude: ~116° to 127° E
- Accuracy: <100m preferred

## Performance Benchmarks

| Operation | Target | Acceptable | Poor |
|-----------|--------|------------|------|
| Section Assignment | <10ms | <50ms | >50ms |
| Kish Grid Selection | <5ms | <20ms | >20ms |
| GPS Calculation | <1ms | <10ms | >10ms |
| Page Load | <2s | <5s | >5s |
| Survey Completion | 15min | 25min | >30min |

## Screenshot Guidelines

### Naming Convention
```
[section]-[test-number]-[description]-[status].png

Examples:
- kish-grid-1.1-single-member-pass.png
- gps-3.6-within-threshold-pass.png
- offline-5.3-sync-fail.png
```

### What to Capture
- Full screen for context
- Highlight issue area
- Include browser console if error
- Show DevTools if relevant
- Capture before and after states

### Storage Location
```
tests/manual/screenshots/[date]/
```

## Quick Commands

### Reset Test Database
```bash
node scripts/comprehensive-database-seeding.js
```

### Check Database Connection
```bash
node scripts/check-database-connection.js
```

### Clear ML Cache
```bash
node scripts/clear-ml-cache.js
```

### View Survey Responses
```bash
node scripts/check-survey-responses.js
```

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Lead Developer | [Name] | [Email/Phone] |
| Test Coordinator | [Name] | [Email/Phone] |
| Project Manager | [Name] | [Email/Phone] |

## Additional Resources

- **Full Checklist**: `tests/manual/CSIS_MANUAL_TESTING_CHECKLIST.md`
- **Execution Guide**: `tests/manual/TEST_EXECUTION_GUIDE.md`
- **Design Document**: `.kiro/specs/csis-workflow-upgrade/design.md`
- **Troubleshooting**: `docs/CSIS_TROUBLESHOOTING_GUIDE.md`
- **FI Training**: `docs/FI_TRAINING_GUIDE_CSIS.md`

## Notes Section

Use this space for quick notes during testing:

```
[Date] [Time] - [Note]
_________________________________
_________________________________
_________________________________
_________________________________
_________________________________
```
