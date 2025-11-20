# CPAP Notification Service

## Overview

The CPAP Notification Service handles all notification logic for the Citizen Priority Action Plan (CPAP) module. It sends notifications to relevant users when CPAP status changes occur, ensuring that ADMIN and OFFICER users are kept informed of important workflow events.

## Purpose

This service provides a centralized notification mechanism for:
- Alerting ADMIN users when new CPAPs are submitted for review
- Notifying OFFICER users when their CPAPs are approved
- Notifying OFFICER users when revisions are requested with admin feedback

## Architecture

### Service Location
- **File**: `src/lib/services/cpap-notification.service.ts`
- **Type**: Static class with async methods
- **Dependencies**: Supabase Admin client

### Integration Points
- **CPAPService**: Calls notification methods after status transitions
- **User Table**: Queries for ADMIN and OFFICER users
- **Assignment Table**: Finds OFFICER users assigned to specific barangays

## Methods

### 1. notifyCPAPSubmitted(cpapId: number)

**Purpose**: Notify all ADMIN users when a CPAP is submitted for review

**Parameters**:
- `cpapId` (number): The ID of the submitted CPAP

**Behavior**:
1. Fetches CPAP details including barangay and cycle information
2. Queries all users with ADMIN role
3. Logs notification details to console
4. Records notification in audit log
5. (TODO) Sends actual email/push notifications

**Requirements Mapping**: 3.5

**Example Usage**:
```typescript
// Called automatically by CPAPService.submitCPAP()
await CPAPNotificationService.notifyCPAPSubmitted(123);
```

**Console Output**:
```
[CPAP Notification] CPAP #123 submitted for review
  Barangay: San Jose
  Cycle: 2024 Q1
  Notifying 3 ADMIN users:
    - John Admin (john@example.com)
    - Jane Admin (jane@example.com)
    - Bob Admin (bob@example.com)
```

### 2. notifyCPAPApproved(cpapId: number)

**Purpose**: Notify OFFICER user(s) when their CPAP is approved

**Parameters**:
- `cpapId` (number): The ID of the approved CPAP

**Behavior**:
1. Fetches CPAP details including barangay and cycle information
2. Finds OFFICER users assigned to the CPAP's barangay
3. Logs notification details to console
4. Records notification in audit log
5. (TODO) Sends actual email/push notifications

**Requirements Mapping**: 5.3

**Example Usage**:
```typescript
// Called automatically by CPAPService.approveCPAP()
await CPAPNotificationService.notifyCPAPApproved(123);
```

**Console Output**:
```
[CPAP Notification] CPAP #123 approved
  Barangay: San Jose
  Cycle: 2024 Q1
  Notifying 1 OFFICER users:
    - Maria Officer (maria@example.com)
```

### 3. notifyCPAPRevisionRequested(cpapId: number, comments: string)

**Purpose**: Notify OFFICER user(s) when revisions are requested with admin feedback

**Parameters**:
- `cpapId` (number): The ID of the CPAP requiring revision
- `comments` (string): Admin comments explaining what needs to be revised

**Behavior**:
1. Fetches CPAP details including barangay and cycle information
2. Finds OFFICER users assigned to the CPAP's barangay
3. Logs notification details including admin comments to console
4. Records notification in audit log
5. (TODO) Sends actual email/push notifications with comments

**Requirements Mapping**: 5.5, 6.1

**Example Usage**:
```typescript
// Called automatically by CPAPService.requestRevision()
await CPAPNotificationService.notifyCPAPRevisionRequested(
  123,
  'Please provide more specific success indicators for items 2 and 3.'
);
```

**Console Output**:
```
[CPAP Notification] CPAP #123 revision requested
  Barangay: San Jose
  Cycle: 2024 Q1
  Admin Comments: Please provide more specific success indicators for items 2 and 3.
  Notifying 1 OFFICER users:
    - Maria Officer (maria@example.com)
```

## Error Handling

All notification methods use try-catch blocks and **do not throw errors**. This design ensures that notification failures do not break the CPAP workflow.

**Rationale**:
- CPAP status transitions should succeed even if notifications fail
- Notification errors are logged but don't propagate
- Users can still see status changes in the UI

**Error Logging**:
```typescript
catch (error) {
  console.error('Error in notifyCPAPSubmitted:', error);
  // Don't throw - notification failures shouldn't break the workflow
}
```

## Current Implementation Status

### ✅ Implemented
- Console logging of all notifications
- User lookup (ADMIN and OFFICER)
- Barangay assignment resolution
- Audit trail logging
- Integration with CPAPService

### 🚧 TODO (Future Enhancement)
- Actual email sending (SendGrid, AWS SES, etc.)
- In-app notification system
- SMS notifications (Twilio)
- Push notifications
- Database table for notification history
- Notification preferences per user
- Batch notification processing
- Retry logic for failed notifications

## Database Queries

### Finding ADMIN Users
```typescript
const { data: adminUsers } = await supabaseAdmin
  .from('user')
  .select('id, email, firstName, lastName')
  .ilike('role', 'admin');
```

### Finding OFFICER Users for Barangay
```typescript
const { data: assignments } = await supabaseAdmin
  .from('assignment')
  .select(`
    user_id,
    user:user_id (
      id,
      email,
      firstName,
      lastName,
      role
    )
  `)
  .eq('barangay_id', barangayId);

const officerUsers = assignments
  ?.filter((a: any) => a.user?.role?.toLowerCase() === 'officer')
  .map((a: any) => a.user) || [];
```

## Integration with CPAPService

The notification service is automatically called by CPAPService methods:

```typescript
// In CPAPService.submitCPAP()
await CPAPNotificationService.notifyCPAPSubmitted(cpapId);

// In CPAPService.approveCPAP()
await CPAPNotificationService.notifyCPAPApproved(cpapId);

// In CPAPService.requestRevision()
await CPAPNotificationService.notifyCPAPRevisionRequested(cpapId, comments);
```

## Testing

### Manual Testing
1. Submit a CPAP and check console for ADMIN notifications
2. Approve a CPAP and check console for OFFICER notifications
3. Request revision and check console for OFFICER notifications with comments

### Unit Testing
```typescript
describe('CPAPNotificationService', () => {
  it('should notify all ADMIN users on CPAP submission', async () => {
    await CPAPNotificationService.notifyCPAPSubmitted(1);
    // Verify console logs or database records
  });

  it('should notify OFFICER users on CPAP approval', async () => {
    await CPAPNotificationService.notifyCPAPApproved(1);
    // Verify console logs or database records
  });

  it('should notify OFFICER users on revision request', async () => {
    await CPAPNotificationService.notifyCPAPRevisionRequested(1, 'Test comments');
    // Verify console logs or database records
  });
});
```

## Future Email Implementation Example

When implementing actual email notifications, the pattern would be:

```typescript
import { sendEmail } from '@/lib/email'; // Your email service

// In notifyCPAPSubmitted
for (const admin of adminUsers) {
  await sendEmail({
    to: admin.email,
    subject: `New CPAP Submission - ${barangayName}`,
    template: 'cpap-submitted',
    data: {
      adminName: `${admin.firstName} ${admin.lastName}`,
      barangayName,
      cycleName,
      cpapId,
      reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/cpap?id=${cpapId}`
    }
  });
}
```

## Requirements Mapping

| Requirement | Method | Description |
|------------|--------|-------------|
| 3.5 | notifyCPAPSubmitted | Send notification to ADMIN users when CPAP is submitted |
| 5.3 | notifyCPAPApproved | Notify OFFICER user when CPAP is approved |
| 5.5 | notifyCPAPRevisionRequested | Notify OFFICER user with admin comments |
| 6.1 | notifyCPAPRevisionRequested | Send notification when revision is requested |

## Related Services

- **CPAPService**: Business logic for CPAP operations
- **CPAPValidationService**: Data validation
- **CPAPPermissionService**: Authorization checks

## Troubleshooting

### No notifications appearing
- Check console logs for error messages
- Verify users have correct roles (Admin/Officer)
- Verify barangay assignments exist for OFFICER users
- Check Supabase connection

### Wrong users being notified
- Verify role names match exactly (case-insensitive comparison used)
- Check assignment table for correct barangay_id mappings
- Verify user status is Active

### Notification errors breaking workflow
- This should not happen - notifications are designed to fail silently
- If workflow breaks, check for syntax errors in notification service
- Review error logs for root cause

## Best Practices

1. **Never throw errors** - Notifications should fail gracefully
2. **Log everything** - Console logs provide audit trail
3. **Include context** - Always include barangay, cycle, and user info
4. **Test thoroughly** - Verify notifications reach correct users
5. **Plan for scale** - Consider batch processing for large user bases

## Changelog

### Version 1.0.0 (Initial Implementation)
- Console-based notification logging
- Integration with CPAPService
- Support for all three notification types
- Audit trail logging
- Error handling without workflow interruption
