# CPAP Notification Service - Quick Reference

## Import
```typescript
import { CPAPNotificationService } from '@/lib/services/cpap-notification.service';
```

## Methods

### Notify ADMIN Users of Submission
```typescript
await CPAPNotificationService.notifyCPAPSubmitted(cpapId);
```
- **When**: After CPAP status changes to "Submitted"
- **Who**: All ADMIN users
- **Purpose**: Alert admins to review new CPAP

### Notify OFFICER of Approval
```typescript
await CPAPNotificationService.notifyCPAPApproved(cpapId);
```
- **When**: After CPAP status changes to "Approved"
- **Who**: OFFICER users assigned to the barangay
- **Purpose**: Inform officer they can track progress

### Notify OFFICER of Revision Request
```typescript
await CPAPNotificationService.notifyCPAPRevisionRequested(cpapId, comments);
```
- **When**: After CPAP status changes to "Revision_Requested"
- **Who**: OFFICER users assigned to the barangay
- **Purpose**: Inform officer of required changes with admin feedback

## Integration Pattern

Notifications are automatically called by CPAPService:

```typescript
// CPAPService.submitCPAP()
await supabaseAdmin.from('cpaps').update({ status: 'Submitted' });
await CPAPNotificationService.notifyCPAPSubmitted(cpapId); // ✅ Auto-called

// CPAPService.approveCPAP()
await supabaseAdmin.from('cpaps').update({ status: 'Approved' });
await CPAPNotificationService.notifyCPAPApproved(cpapId); // ✅ Auto-called

// CPAPService.requestRevision()
await supabaseAdmin.from('cpaps').update({ status: 'Revision_Requested' });
await CPAPNotificationService.notifyCPAPRevisionRequested(cpapId, comments); // ✅ Auto-called
```

## Error Handling

✅ **Notifications never throw errors** - they fail silently to avoid breaking workflows

```typescript
try {
  await CPAPNotificationService.notifyCPAPSubmitted(cpapId);
} catch (error) {
  // This will never happen - errors are caught internally
}
```

## Current Status

### ✅ Working
- Console logging
- User lookup
- Audit trail

### 🚧 TODO
- Email sending
- In-app notifications
- SMS/Push notifications

## Console Output Example

```
[CPAP Notification] CPAP #123 submitted for review
  Barangay: San Jose
  Cycle: 2024 Q1
  Notifying 3 ADMIN users:
    - John Admin (john@example.com)
    - Jane Admin (jane@example.com)
    - Bob Admin (bob@example.com)
```

## Requirements Covered

- ✅ 3.5: Notify ADMIN on submission
- ✅ 5.3: Notify OFFICER on approval
- ✅ 5.5: Notify OFFICER on revision request
- ✅ 6.1: Include admin comments in revision notification
