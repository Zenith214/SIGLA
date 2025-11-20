/**
 * CPAP Notification Service - Usage Examples
 * 
 * This file demonstrates how the CPAP Notification Service is used
 * within the CPAP workflow. Notifications are automatically triggered
 * by CPAPService methods.
 */

import { CPAPService } from '../cpap.service';
import { CPAPNotificationService } from '../cpap-notification.service';

/**
 * Example 1: Submit CPAP (triggers notification to ADMIN users)
 * 
 * When an OFFICER submits a CPAP, all ADMIN users are automatically notified.
 */
async function exampleSubmitCPAP() {
  const cpapId = 123;
  
  try {
    // CPAPService.submitCPAP() automatically calls:
    // await CPAPNotificationService.notifyCPAPSubmitted(cpapId);
    await CPAPService.submitCPAP(cpapId);
    
    console.log('CPAP submitted successfully');
    // Console will show:
    // [CPAP Notification] CPAP #123 submitted for review
    //   Barangay: San Jose
    //   Cycle: 2024 Q1
    //   Notifying 3 ADMIN users:
    //     - John Admin (john@example.com)
    //     - Jane Admin (jane@example.com)
    //     - Bob Admin (bob@example.com)
    
  } catch (error) {
    console.error('Failed to submit CPAP:', error);
  }
}

/**
 * Example 2: Approve CPAP (triggers notification to OFFICER user)
 * 
 * When an ADMIN approves a CPAP, the OFFICER assigned to that barangay is notified.
 */
async function exampleApproveCPAP() {
  const cpapId = 123;
  const adminComments = 'Great work! The action plan is comprehensive and well-structured.';
  
  try {
    // CPAPService.approveCPAP() automatically calls:
    // await CPAPNotificationService.notifyCPAPApproved(cpapId);
    await CPAPService.approveCPAP(cpapId, adminComments);
    
    console.log('CPAP approved successfully');
    // Console will show:
    // [CPAP Notification] CPAP #123 approved
    //   Barangay: San Jose
    //   Cycle: 2024 Q1
    //   Notifying 1 OFFICER users:
    //     - Maria Officer (maria@example.com)
    
  } catch (error) {
    console.error('Failed to approve CPAP:', error);
  }
}

/**
 * Example 3: Request Revision (triggers notification to OFFICER user with comments)
 * 
 * When an ADMIN requests revisions, the OFFICER is notified with the admin's feedback.
 */
async function exampleRequestRevision() {
  const cpapId = 123;
  const adminComments = `Please revise the following items:
  
1. Item 2: The success indicator needs to be more specific and measurable.
2. Item 3: The timeline seems too ambitious. Please extend by 2 months.
3. Item 5: Add more detail about the responsible person's role.`;
  
  try {
    // CPAPService.requestRevision() automatically calls:
    // await CPAPNotificationService.notifyCPAPRevisionRequested(cpapId, adminComments);
    await CPAPService.requestRevision(cpapId, adminComments);
    
    console.log('Revision requested successfully');
    // Console will show:
    // [CPAP Notification] CPAP #123 revision requested
    //   Barangay: San Jose
    //   Cycle: 2024 Q1
    //   Admin Comments: Please revise the following items: ...
    //   Notifying 1 OFFICER users:
    //     - Maria Officer (maria@example.com)
    
  } catch (error) {
    console.error('Failed to request revision:', error);
  }
}

/**
 * Example 4: Manual notification (advanced use case)
 * 
 * In rare cases, you might need to manually trigger notifications.
 * This is NOT recommended for normal workflow - use CPAPService methods instead.
 */
async function exampleManualNotification() {
  const cpapId = 123;
  
  try {
    // Manual notification (only use if you have a specific reason)
    await CPAPNotificationService.notifyCPAPSubmitted(cpapId);
    
    console.log('Manual notification sent');
    
  } catch (error) {
    // Notifications never throw errors, so this won't happen
    console.error('This will never execute');
  }
}

/**
 * Example 5: Complete workflow with notifications
 * 
 * This shows the full CPAP lifecycle with automatic notifications at each step.
 */
async function exampleCompleteWorkflow() {
  const barangayId = 1;
  const cycleId = 1;
  
  try {
    // Step 1: OFFICER creates CPAP (no notification)
    const cpap = await CPAPService.getOrCreateCPAP(barangayId, cycleId);
    console.log('CPAP created:', cpap.id);
    
    // Step 2: OFFICER adds items (no notification)
    await CPAPService.updateCPAPItems(cpap.id, [
      {
        priority_area: 'Financial Administration',
        target_output: 'Improve tax collection efficiency',
        success_indicator: 'Increase collection rate by 20%',
        responsible_person: 'Municipal Treasurer',
        timeline_start: '2024-01-01',
        timeline_end: '2024-06-30'
      }
    ]);
    console.log('Items added');
    
    // Step 3: OFFICER submits CPAP
    // ✅ Notification sent to ALL ADMIN users
    await CPAPService.submitCPAP(cpap.id);
    console.log('CPAP submitted - ADMIN users notified');
    
    // Step 4: ADMIN reviews and approves
    // ✅ Notification sent to OFFICER user
    await CPAPService.approveCPAP(cpap.id, 'Approved - excellent plan!');
    console.log('CPAP approved - OFFICER user notified');
    
    // Step 5: OFFICER updates progress (no notification)
    await CPAPService.updateProgress(cpap.id, [
      {
        id: 1,
        actual_output: 'Collection rate increased by 15% so far',
        accomplishment_status: 'In Progress',
        remarks: 'On track to meet target'
      }
    ]);
    console.log('Progress updated');
    
  } catch (error) {
    console.error('Workflow error:', error);
  }
}

/**
 * Example 6: Revision workflow with notifications
 * 
 * This shows what happens when an ADMIN requests revisions.
 */
async function exampleRevisionWorkflow() {
  const cpapId = 123;
  
  try {
    // Step 1: ADMIN requests revision
    // ✅ Notification sent to OFFICER user with comments
    await CPAPService.requestRevision(
      cpapId,
      'Please provide more specific success indicators for items 2 and 3.'
    );
    console.log('Revision requested - OFFICER user notified with feedback');
    
    // Step 2: OFFICER makes revisions (no notification)
    await CPAPService.updateCPAPItems(cpapId, [
      {
        id: 2,
        priority_area: 'Disaster Preparedness',
        target_output: 'Conduct disaster drills',
        success_indicator: 'Complete 4 quarterly drills with 90% participation',
        responsible_person: 'MDRRMO Chief',
        timeline_start: '2024-01-01',
        timeline_end: '2024-12-31'
      }
    ]);
    console.log('Revisions made');
    
    // Step 3: OFFICER resubmits
    // ✅ Notification sent to ALL ADMIN users again
    await CPAPService.submitCPAP(cpapId);
    console.log('CPAP resubmitted - ADMIN users notified');
    
  } catch (error) {
    console.error('Revision workflow error:', error);
  }
}

/**
 * Example 7: Error handling (notifications never break workflow)
 * 
 * Even if notification fails, the CPAP workflow continues successfully.
 */
async function exampleErrorHandling() {
  const cpapId = 123;
  
  try {
    // Even if there are no ADMIN users or database errors,
    // the CPAP submission will still succeed
    await CPAPService.submitCPAP(cpapId);
    
    console.log('CPAP submitted successfully');
    // If notification fails, you'll see:
    // Error in notifyCPAPSubmitted: [error details]
    // But the submission still succeeds!
    
  } catch (error) {
    // This error would be from submitCPAP validation, not notifications
    console.error('CPAP submission failed:', error);
  }
}

// Export examples for documentation
export {
  exampleSubmitCPAP,
  exampleApproveCPAP,
  exampleRequestRevision,
  exampleManualNotification,
  exampleCompleteWorkflow,
  exampleRevisionWorkflow,
  exampleErrorHandling
};
