/**
 * Code Integration Verification Script
 * Verifies that all components are properly integrated without requiring a running server
 */

const fs = require('fs');
const path = require('path');

// Helper functions
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'info');
  console.log('='.repeat(60) + '\n');
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function checkFileContains(filePath, searchStrings) {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    const results = {};
    
    for (const [key, searchString] of Object.entries(searchStrings)) {
      results[key] = content.includes(searchString);
    }
    
    return results;
  } catch (error) {
    return null;
  }
}

// Verification tests
const verifications = {
  'FS Dashboard Components': {
    files: [
      'src/app/fs-dashboard/page.tsx',
      'src/components/fs-dashboard/SpotAllocation.tsx',
      'src/components/fs-dashboard/SpotAllocationMap.tsx',
      'src/components/fs-dashboard/SpotCreationModal.tsx',
      'src/components/fs-dashboard/SpotAssignmentPanel.tsx',
      'src/components/fs-dashboard/InterviewerAssignmentTable.tsx',
      'src/components/fs-dashboard/FieldworkMonitoring.tsx',
      'src/components/fs-dashboard/ProgressMap.tsx',
      'src/components/fs-dashboard/FIPerformanceTable.tsx',
    ],
    apiIntegrations: {
      'src/components/fs-dashboard/SpotAllocation.tsx': {
        'fetchSpots': '/api/spots',
        'cycleId': 'cycleId',
      },
      'src/components/fs-dashboard/SpotCreationModal.tsx': {
        'createSpot': 'POST',
        'fetchBarangays': '/api/barangays',
      },
      'src/components/fs-dashboard/SpotAssignmentPanel.tsx': {
        'assignSpot': '/api/spots/',
        'assign': 'assign',
      },
      'src/components/fs-dashboard/FieldworkMonitoring.tsx': {
        'monitoring': '/api/fs/monitoring',
        'fetchMonitoring': 'fetchMonitoringData',
      },
    },
  },
  'FI Dashboard Components': {
    files: [
      'src/components/fi-dashboard/MySpotAssignments.tsx',
      'src/components/fi-dashboard/SpotCard.tsx',
      'src/components/fi-dashboard/SpotWorkflowScreen.tsx',
      'src/components/fi-dashboard/InterviewSlotCard.tsx',
      'src/components/fi-dashboard/VisitStatusModal.tsx',
      'src/components/fi-dashboard/VisitHistoryDisplay.tsx',
    ],
    apiIntegrations: {
      'src/components/fi-dashboard/MySpotAssignments.tsx': {
        'fetchAssignments': '/api/fi/assignments',
        'cycleId': 'cycleId',
      },
      'src/components/fi-dashboard/SpotWorkflowScreen.tsx': {
        'fetchSpotDetails': '/api/fi/assignments',
        'questionnaires': '/api/questionnaires/',
      },
      'src/components/fi-dashboard/VisitStatusModal.tsx': {
        'logVisit': '/api/visits',
        'POST': 'POST',
      },
    },
  },
  'Offline Sync Components': {
    files: [
      'src/lib/syncService.ts',
      'src/lib/indexedDB.ts',
      'src/components/SyncButton.tsx',
      'src/components/AutoSync.tsx',
      'src/components/SyncStatus.tsx',
      'src/hooks/useSurveyRecord.ts',
    ],
    apiIntegrations: {
      'src/lib/syncService.ts': {
        'syncEndpoint': '/api/sync',
        'retryLogic': 'RETRY_DELAYS',
        'exponentialBackoff': '[2000, 4000, 8000]',
      },
      'src/components/SyncButton.tsx': {
        'syncPendingRecords': 'syncPendingRecords',
        'progress': 'SyncProgress',
      },
      'src/components/AutoSync.tsx': {
        'autoSync': 'autoSyncOnReconnect',
        'onlineStatus': 'useOnlineStatus',
      },
    },
  },
  'API Endpoints': {
    files: [
      'src/app/api/spots/route.ts',
      'src/app/api/spots/[spotId]/route.ts',
      'src/app/api/spots/[spotId]/assign/route.ts',
      'src/app/api/fi/assignments/route.ts',
      'src/app/api/questionnaires/[questionnaireId]/route.ts',
      'src/app/api/visits/route.ts',
      'src/app/api/survey-responses/route.ts',
      'src/app/api/sync/route.ts',
      'src/app/api/fs/monitoring/route.ts',
    ],
    apiIntegrations: {
      'src/app/api/spots/route.ts': {
        'GET': 'GET',
        'POST': 'POST',
        'cycleId': 'cycleId',
      },
      'src/app/api/fi/assignments/route.ts': {
        'GET': 'GET',
        'assignments': 'assignments',
      },
      'src/app/api/sync/route.ts': {
        'POST': 'POST',
        'responses': 'responses',
        'bulk': 'bulk',
      },
    },
  },
  'PWA Infrastructure': {
    files: [
      'public/sw.js',
      'public/manifest.json',
      'public/offline.html',
      'src/lib/serviceWorkerRegistration.ts',
      'src/components/ServiceWorkerRegistration.tsx',
      'src/components/OfflineIndicator.tsx',
      'src/hooks/useOnlineStatus.ts',
    ],
    apiIntegrations: {
      'public/sw.js': {
        'cacheFirst': 'cache-first',
        'networkFirst': 'network-first',
      },
      'src/components/OfflineIndicator.tsx': {
        'onlineStatus': 'useOnlineStatus',
        'offline': 'offline',
      },
    },
  },
};

// Run verifications
function runVerifications() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'info');
  log('║     CSIS Workflow Code Integration Verification           ║', 'info');
  log('╚════════════════════════════════════════════════════════════╝', 'info');
  console.log('\n');

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;

  for (const [category, config] of Object.entries(verifications)) {
    logSection(category);

    // Check files exist
    log('Checking files...', 'info');
    for (const file of config.files) {
      totalChecks++;
      if (fileExists(file)) {
        log(`  ✓ ${file}`, 'success');
        passedChecks++;
      } else {
        log(`  ✗ ${file} - NOT FOUND`, 'error');
        failedChecks++;
      }
    }

    // Check API integrations
    if (config.apiIntegrations) {
      log('\nChecking API integrations...', 'info');
      for (const [file, checks] of Object.entries(config.apiIntegrations)) {
        totalChecks++;
        if (fileExists(file)) {
          const results = checkFileContains(file, checks);
          if (results) {
            const allPassed = Object.values(results).every(r => r);
            if (allPassed) {
              log(`  ✓ ${file} - All integrations found`, 'success');
              passedChecks++;
            } else {
              log(`  ⚠ ${file} - Some integrations missing:`, 'warning');
              for (const [key, found] of Object.entries(results)) {
                if (!found) {
                  log(`    ✗ ${key}`, 'error');
                }
              }
              failedChecks++;
            }
          } else {
            log(`  ✗ ${file} - Could not read file`, 'error');
            failedChecks++;
          }
        } else {
          log(`  ✗ ${file} - File not found`, 'error');
          failedChecks++;
        }
      }
    }
  }

  // Print summary
  logSection('Verification Summary');
  log(`Total Checks: ${totalChecks}`, 'info');
  log(`Passed: ${passedChecks}`, 'success');
  log(`Failed: ${failedChecks}`, failedChecks > 0 ? 'error' : 'success');
  log(`Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`, 
      failedChecks === 0 ? 'success' : 'warning');

  console.log('\n');

  // Additional checks
  logSection('Additional Integration Checks');

  // Check error handling
  const errorHandlingFiles = [
    'src/components/fs-dashboard/SpotAllocation.tsx',
    'src/components/fi-dashboard/MySpotAssignments.tsx',
    'src/lib/syncService.ts',
  ];

  log('Checking error handling...', 'info');
  for (const file of errorHandlingFiles) {
    const results = checkFileContains(file, {
      'try-catch': 'try {',
      'error': 'error',
      'catch': 'catch',
    });
    if (results && Object.values(results).every(r => r)) {
      log(`  ✓ ${file} - Has error handling`, 'success');
    } else {
      log(`  ⚠ ${file} - May be missing error handling`, 'warning');
    }
  }

  // Check loading states
  log('\nChecking loading states...', 'info');
  const loadingStateFiles = [
    'src/components/fs-dashboard/SpotAllocation.tsx',
    'src/components/fi-dashboard/MySpotAssignments.tsx',
    'src/components/SyncButton.tsx',
  ];

  for (const file of loadingStateFiles) {
    const results = checkFileContains(file, {
      'loading': 'loading',
      'setLoading': 'setLoading',
    });
    if (results && Object.values(results).every(r => r)) {
      log(`  ✓ ${file} - Has loading states`, 'success');
    } else {
      log(`  ⚠ ${file} - May be missing loading states`, 'warning');
    }
  }

  // Check toast notifications
  log('\nChecking user feedback (toasts)...', 'info');
  const toastFiles = [
    'src/components/fs-dashboard/SpotCreationModal.tsx',
    'src/components/fi-dashboard/VisitStatusModal.tsx',
    'src/components/SyncButton.tsx',
  ];

  for (const file of toastFiles) {
    const results = checkFileContains(file, {
      'toast': 'toast',
      'useToast': 'useToast',
    });
    if (results && Object.values(results).every(r => r)) {
      log(`  ✓ ${file} - Has toast notifications`, 'success');
    } else {
      log(`  ⚠ ${file} - May be missing toast notifications`, 'warning');
    }
  }

  console.log('\n');

  if (failedChecks === 0) {
    log('🎉 All code integration checks passed!', 'success');
    log('The components are properly integrated with backend APIs.', 'success');
    return 0;
  } else {
    log('⚠️  Some integration checks failed.', 'warning');
    log('Please review the output above for details.', 'warning');
    return 1;
  }
}

// Run verifications
const exitCode = runVerifications();
process.exit(exitCode);
