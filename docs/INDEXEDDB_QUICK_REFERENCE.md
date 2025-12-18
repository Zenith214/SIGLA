# IndexedDB Quick Reference Guide

## Quick Start

### Installation

The `idb` library is already installed. No additional setup required.

### Import

```typescript
// Database operations
import {
  createSurveyRecord,
  getSurveyRecord,
  updateSurveyData,
  addVisit,
  markCompletedPendingSync,
} from '@/lib/indexedDB';

// Sync operations
import {
  syncPendingRecords,
  getPendingSyncCount,
} from '@/lib/syncService';

// UI components
import { SyncButton } from '@/components/SyncButton';
import { SyncStatus } from '@/components/SyncStatus';
```

## Common Operations

### 1. Create a New Survey Record

```typescript
const record = await createSurveyRecord(
  '2024-001-003',  // questionnaireId
  1,               // cycleId
  5,               // spotId
  {                // initial data (optional)
    interviewerId: 123,
    barangayId: 26,
  }
);
```

### 2. Get an Existing Record

```typescript
const record = await getSurveyRecord('2024-001-003', 1);

if (record) {
  console.log('Status:', record.status);
  console.log('Visits:', record.visits.length);
}
```

### 3. Update Survey Data

```typescript
await updateSurveyData('2024-001-003', 1, {
  selectedMember: 'Jane Doe',
  respondentDemographics: {
    age: 35,
    gender: 'Female',
  },
  sections: {
    financial: { data: { /* ... */ } },
  },
});
```

### 4. Add a Visit

```typescript
await addVisit(
  '2024-001-003',
  1,
  'Callback Needed',
  'No one home, will return tomorrow',
  { lat: 8.1234, lng: 123.4567 }
);
```

### 5. Mark as Completed

```typescript
await markCompletedPendingSync('2024-001-003', 1);
```

### 6. Sync to Server

```typescript
const result = await syncPendingRecords((progress) => {
  console.log(`Syncing ${progress.current} of ${progress.total}`);
});

console.log(`Synced ${result.synced} records`);
```

### 7. Check Pending Count

```typescript
const count = await getPendingSyncCount();
console.log(`${count} records pending sync`);
```

## UI Components

### SyncButton

Simple sync button with progress indicator.

```typescript
<SyncButton 
  showCount={true}
  variant="default"
  size="default"
  onSyncComplete={(result) => {
    console.log('Sync complete:', result);
  }}
  onSyncError={(error) => {
    console.error('Sync error:', error);
  }}
/>
```

### SyncStatus

Comprehensive sync status display.

```typescript
<SyncStatus 
  autoSync={true}
  showDetails={true}
  className="mb-4"
/>
```

## Status Values

- `Pending`: Interview not started
- `In Progress`: Interview started but not completed
- `Completed`: Interview completed and synced
- `Completed (Pending Sync)`: Interview completed but not yet synced

## Visit Outcomes

- `Callback Needed`: Need to return for interview
- `Interview Started`: Interview has begun
- `Interview Completed`: Interview successfully completed
- `Refused`: Respondent refused to participate
- `Household Moved`: Household no longer at location

## Complete Workflow Example

```typescript
import {
  createSurveyRecord,
  updateSurveyData,
  addVisit,
  markCompletedPendingSync,
} from '@/lib/indexedDB';
import { syncPendingRecords } from '@/lib/syncService';

async function conductInterview() {
  // 1. Create record when starting
  const record = await createSurveyRecord(
    '2024-001-003',
    1,
    5,
    { interviewerId: 123, barangayId: 26 }
  );

  // 2. Log first visit
  await addVisit(
    '2024-001-003',
    1,
    'Interview Started',
    'Respondent available'
  );

  // 3. Save form data as user progresses
  await updateSurveyData('2024-001-003', 1, {
    selectedMember: 'Jane Doe',
    respondentDemographics: {
      age: 35,
      gender: 'Female',
    },
  });

  // 4. Continue updating as sections are completed
  await updateSurveyData('2024-001-003', 1, {
    sections: {
      financial: { data: { /* ... */ } },
    },
  });

  // 5. Mark as completed
  await markCompletedPendingSync('2024-001-003', 1);

  // 6. Sync when online
  if (navigator.onLine) {
    const result = await syncPendingRecords();
    console.log(`Synced ${result.synced} records`);
  }
}
```

## Callback Workflow Example

```typescript
async function handleCallback() {
  // 1. Get existing record
  const record = await getSurveyRecord('2024-001-003', 1);

  if (!record) {
    console.error('Record not found');
    return;
  }

  // 2. Log callback visit
  await addVisit(
    '2024-001-003',
    1,
    'Callback Needed',
    'Respondent busy, scheduled for tomorrow 2pm'
  );

  // 3. Check visit count
  const updatedRecord = await getSurveyRecord('2024-001-003', 1);
  console.log(`Visit count: ${updatedRecord.visits.length}`);

  // 4. Flag for substitution after 3 failed attempts
  if (updatedRecord.visits.length >= 3) {
    await updateStatus('2024-001-003', 1, 'Flagged_For_Substitution');
  }
}
```

## Error Handling

```typescript
try {
  await syncPendingRecords();
} catch (error) {
  if (error instanceof Error) {
    console.error('Sync failed:', error.message);
    // Show error to user
    alert(`Sync failed: ${error.message}`);
  }
}
```

## Utility Functions

### Get All Records

```typescript
import { getAllSurveyRecords } from '@/lib/indexedDB';

const allRecords = await getAllSurveyRecords();
console.log(`Total records: ${allRecords.length}`);
```

### Get Records by Status

```typescript
import { getSurveyRecordsByStatus } from '@/lib/indexedDB';

const pendingRecords = await getSurveyRecordsByStatus('Pending');
const inProgressRecords = await getSurveyRecordsByStatus('In Progress');
```

### Get Database Stats

```typescript
import { getDBStats } from '@/lib/indexedDB';

const stats = await getDBStats();
console.log('Total:', stats.total);
console.log('Pending:', stats.pending);
console.log('In Progress:', stats.inProgress);
console.log('Completed:', stats.completed);
console.log('Pending Sync:', stats.pendingSync);
```

### Check if Record Exists

```typescript
import { recordExists } from '@/lib/indexedDB';

const exists = await recordExists('2024-001-003', 1);
if (exists) {
  console.log('Record already exists');
}
```

## Auto-Sync on Reconnection

```typescript
import { autoSyncOnReconnect } from '@/lib/syncService';

// Listen for online event
window.addEventListener('online', () => {
  autoSyncOnReconnect();
});

// Or use in a React component
useEffect(() => {
  if (isOnline) {
    autoSyncOnReconnect();
  }
}, [isOnline]);
```

## TypeScript Types

```typescript
import type {
  SurveyRecord,
  Visit,
  SurveyData,
  SurveyRecordStatus,
  VisitOutcome,
} from '@/lib/indexedDB';

import type {
  SyncResult,
  SyncResponse,
  SyncProgress,
} from '@/lib/syncService';
```

## Best Practices

1. **Always check if record exists** before creating
2. **Use try-catch** for all async operations
3. **Update data incrementally** as user progresses
4. **Log visits** for audit trail
5. **Sync regularly** when online
6. **Handle errors gracefully** and inform user
7. **Clear old synced records** periodically

## Troubleshooting

### Record not found
```typescript
const record = await getSurveyRecord(questionnaireId, cycleId);
if (!record) {
  // Create new record
  await createSurveyRecord(questionnaireId, cycleId, spotId);
}
```

### Sync fails
```typescript
// Check if online
if (!navigator.onLine) {
  console.log('Device is offline');
  return;
}

// Retry failed syncs
import { retryFailedSyncs } from '@/lib/syncService';
await retryFailedSyncs();
```

### Database quota exceeded
```typescript
// Clear old synced records
import { getSurveyRecordsByStatus, deleteSurveyRecord } from '@/lib/indexedDB';

const syncedRecords = await getSurveyRecordsByStatus('Completed');
for (const record of syncedRecords) {
  if (record.syncedAt && isOlderThan30Days(record.syncedAt)) {
    await deleteSurveyRecord(record.questionnaireId, record.cycleId);
  }
}
```

## Performance Tips

1. **Use indexes** for filtering (by-status, by-cycle, etc.)
2. **Batch updates** when possible
3. **Avoid frequent reads** - cache in memory when needed
4. **Clear old data** regularly
5. **Use progress callbacks** for long operations

## Related Documentation

- [Full Implementation Guide](./INDEXEDDB_OFFLINE_STORAGE_IMPLEMENTATION.md)
- [Task 12 Completion Summary](./TASK_12_COMPLETION_SUMMARY.md)
- [PWA Infrastructure](./PWA_INFRASTRUCTURE_IMPLEMENTATION.md)
