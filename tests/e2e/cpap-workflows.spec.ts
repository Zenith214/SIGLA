/**
 * E2E Tests for CPAP Complete Workflows
 * 
 * Tests the complete CPAP workflows from a user perspective:
 * - OFFICER creating and submitting CPAP
 * - ADMIN reviewing and approving CPAP
 * - ADMIN requesting revision
 * - OFFICER updating progress on approved CPAP
 * - Permission denied scenarios (FS/INTERVIEWER access)
 * 
 * Requirements tested:
 * - 1.1: OFFICER access to CPAP creation interface
 * - 2.1: OFFICER creating and editing CPAP items
 * - 3.1: OFFICER submitting CPAP for review
 * - 5.1: ADMIN reviewing and approving CPAPs
 * - 6.1: ADMIN requesting revisions
 * - 7.1: OFFICER updating progress on approved CPAPs
 * - 11.5: Permission denied for FS/INTERVIEWER users
 */

import { test, expect } from '@playwright/test';
import {
  supabaseAdmin,
  setupTestUsers,
  cleanupTestUsers,
  cleanupTestData,
  loginUser,
  TEST_CYCLE_ID,
  TEST_BARANGAY_ID,
  TEST_BARANGAY_ID_2
} from './test-helpers';

// Test users
let testUsers: any = {};

// Test CPAP IDs
let createdCPAPId: number;

// Setup and teardown
test.beforeAll(async () => {
  testUsers = await setupTestUsers();
  await cleanupTestData();
});

test.afterAll(async () => {
  await cleanupTestData();
  await cleanupTestUsers();
});

test.describe('CPAP E2E Workflows', () => {
  test.describe('OFFICER Creating and Submitting CPAP', () => {
    test('should allow OFFICER to access CPAP interface from dashboard', async ({ page }) => {
      // Login as Officer
      await loginUser(page, testUsers.officer1);
      
      // Navigate to dashboard
      await page.goto('/');
      
      // Look for CPAP Submission button in navigation
      const cpapButton = page.locator('text=CPAP Submission').or(page.locator('a[href="/cpap"]'));
      await expect(cpapButton).toBeVisible({ timeout: 10000 });
      
      // Click CPAP button
      await cpapButton.click();
      
      // Should navigate to CPAP page
      await expect(page).toHaveURL(/\/cpap/);
      
      // Should see CPAP editor interface
      await expect(page.locator('text=Citizen Priority Action Plan').or(page.locator('text=CPAP'))).toBeVisible();
    });

    test('should allow OFFICER to create CPAP items', async ({ page }) => {
      // Login as Officer
      await loginUser(page, testUsers.officer1);
      
      // Navigate to CPAP page
      await page.goto('/cpap');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Look for add item button or form
      const addButton = page.locator('button:has-text("Add Item")').or(
        page.locator('button:has-text("Add Action")')
      ).or(
        page.locator('button:has-text("New Item")')
      );
      
      // If add button exists, click it
      if (await addButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addButton.click();
      }
      
      // Fill in CPAP item form
      await page.fill('input[name="priority_area"]', 'E2E Test Priority Area');
      await page.fill('textarea[name="target_output"]', 'E2E Test Target Output');
      await page.fill('textarea[name="success_indicator"]', 'E2E Test Success Indicator');
      await page.fill('input[name="responsible_person"]', 'E2E Test Person');
      await page.fill('input[name="timeline_start"]', '2025-01-01');
      await page.fill('input[name="timeline_end"]', '2025-12-31');
      
      // Save the item
      const saveButton = page.locator('button:has-text("Save")').or(
        page.locator('button:has-text("Add")')
      );
      await saveButton.click();
      
      // Should see success message or item in list
      await expect(page.locator('text=E2E Test Priority Area')).toBeVisible({ timeout: 10000 });
    });

    test('should allow OFFICER to submit CPAP for review', async ({ page }) => {
      // Login as Officer
      await loginUser(page, testUsers.officer1);
      
      // Navigate to CPAP page
      await page.goto('/cpap');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Look for submit button
      const submitButton = page.locator('button:has-text("Submit")').or(
        page.locator('button:has-text("Submit to DILG")')
      ).or(
        page.locator('button:has-text("Submit for Review")')
      );
      
      await expect(submitButton).toBeVisible({ timeout: 10000 });
      
      // Click submit button
      await submitButton.click();
      
      // Confirm submission if there's a dialog
      const confirmButton = page.locator('button:has-text("Confirm")').or(
        page.locator('button:has-text("Yes")')
      ).or(
        page.locator('button:has-text("Submit")')
      );
      
      if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmButton.click();
      }
      
      // Should see success message
      await expect(page.locator('text=submitted').or(page.locator('text=Submitted'))).toBeVisible({ timeout: 10000 });
      
      // Status should change to Submitted
      await expect(page.locator('text=Submitted')).toBeVisible();
    });
  });

  test.describe('ADMIN Reviewing and Approving CPAP', () => {
    test.beforeAll(async () => {
      // Create a submitted CPAP for admin to review
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: TEST_BARANGAY_ID,
          cycle_id: TEST_CYCLE_ID,
          status: 'Submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      createdCPAPId = cpap!.id;

      // Add items
      await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: createdCPAPId,
          priority_area: 'Admin Review Test',
          target_output: 'Test target for admin review',
          success_indicator: 'Test indicator',
          responsible_person: 'Test Person',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        });
    });

    test('should allow ADMIN to access CPAP management dashboard', async ({ page }) => {
      // Login as Admin
      await loginUser(page, testUsers.admin);
      
      // Navigate to dashboard
      await page.goto('/');
      
      // Look for CPAP Management button in navigation
      const cpapButton = page.locator('text=CPAP Management').or(
        page.locator('a[href="/admin/cpap"]')
      );
      await expect(cpapButton).toBeVisible({ timeout: 10000 });
      
      // Click CPAP Management button
      await cpapButton.click();
      
      // Should navigate to admin CPAP page
      await expect(page).toHaveURL(/\/admin\/cpap/);
      
      // Should see CPAP list
      await expect(page.locator('text=CPAP').or(page.locator('text=Management'))).toBeVisible();
    });

    test('should allow ADMIN to review and approve CPAP', async ({ page }) => {
      // Login as Admin
      await loginUser(page, testUsers.admin);
      
      // Navigate to admin CPAP page
      await page.goto('/admin/cpap');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Look for submitted CPAP in list
      const cpapRow = page.locator(`text=Admin Review Test`).or(
        page.locator(`text=Submitted`)
      ).first();
      
      await expect(cpapRow).toBeVisible({ timeout: 10000 });
      
      // Click on CPAP to review (look for review/view button)
      const reviewButton = page.locator('button:has-text("Review")').or(
        page.locator('button:has-text("View")')
      ).first();
      
      if (await reviewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reviewButton.click();
      } else {
        await cpapRow.click();
      }
      
      // Should see CPAP details
      await expect(page.locator('text=Admin Review Test')).toBeVisible({ timeout: 10000 });
      
      // Look for approve button
      const approveButton = page.locator('button:has-text("Approve")');
      await expect(approveButton).toBeVisible({ timeout: 10000 });
      
      // Click approve button
      await approveButton.click();
      
      // Confirm approval if there's a dialog
      const confirmButton = page.locator('button:has-text("Confirm")').or(
        page.locator('button:has-text("Yes")')
      ).or(
        page.locator('button:has-text("Approve")')
      );
      
      if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmButton.click();
      }
      
      // Should see success message
      await expect(page.locator('text=approved').or(page.locator('text=Approved'))).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('ADMIN Requesting Revision', () => {
    let revisionCPAPId: number;

    test.beforeAll(async () => {
      // Create a submitted CPAP for revision testing
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: TEST_BARANGAY_ID,
          cycle_id: TEST_CYCLE_ID,
          status: 'Submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      revisionCPAPId = cpap!.id;

      // Add items
      await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: revisionCPAPId,
          priority_area: 'Revision Test',
          target_output: 'Test target for revision',
          success_indicator: 'Test indicator',
          responsible_person: 'Test Person',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        });
    });

    test('should allow ADMIN to request revision on CPAP', async ({ page }) => {
      // Login as Admin
      await loginUser(page, testUsers.admin);
      
      // Navigate to admin CPAP page
      await page.goto('/admin/cpap');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Look for submitted CPAP in list
      const cpapRow = page.locator(`text=Revision Test`).or(
        page.locator(`text=Submitted`)
      ).first();
      
      await expect(cpapRow).toBeVisible({ timeout: 10000 });
      
      // Click on CPAP to review
      const reviewButton = page.locator('button:has-text("Review")').or(
        page.locator('button:has-text("View")')
      ).first();
      
      if (await reviewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await reviewButton.click();
      } else {
        await cpapRow.click();
      }
      
      // Look for request revision button
      const revisionButton = page.locator('button:has-text("Request Revision")').or(
        page.locator('button:has-text("Revision")')
      );
      await expect(revisionButton).toBeVisible({ timeout: 10000 });
      
      // Click request revision button
      await revisionButton.click();
      
      // Fill in comments
      const commentsField = page.locator('textarea[name="comments"]').or(
        page.locator('textarea[placeholder*="comment"]')
      );
      await commentsField.fill('E2E Test: Please add more specific success indicators');
      
      // Submit revision request
      const submitButton = page.locator('button:has-text("Submit")').or(
        page.locator('button:has-text("Request")')
      );
      await submitButton.click();
      
      // Should see success message
      await expect(page.locator('text=revision').or(page.locator('text=Revision'))).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('OFFICER Updating Progress on Approved CPAP', () => {
    let approvedCPAPId: number;
    let approvedItemId: number;

    test.beforeAll(async () => {
      // Create an approved CPAP for progress testing
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: TEST_BARANGAY_ID,
          cycle_id: TEST_CYCLE_ID,
          status: 'Approved',
          submitted_at: new Date().toISOString(),
          approved_at: new Date().toISOString()
        })
        .select()
        .single();

      approvedCPAPId = cpap!.id;

      // Add items
      const { data: item } = await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: approvedCPAPId,
          priority_area: 'Progress Test',
          target_output: 'Test target for progress',
          success_indicator: 'Test indicator',
          responsible_person: 'Test Person',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        })
        .select()
        .single();

      approvedItemId = item!.id;
    });

    test('should allow OFFICER to update progress on approved CPAP', async ({ page }) => {
      // Login as Officer
      await loginUser(page, testUsers.officer1);
      
      // Navigate to CPAP page
      await page.goto('/cpap');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Should see approved status
      await expect(page.locator('text=Approved')).toBeVisible({ timeout: 10000 });
      
      // Look for progress fields
      const actualOutputField = page.locator('textarea[name="actual_output"]').or(
        page.locator('input[name="actual_output"]')
      ).first();
      
      await expect(actualOutputField).toBeVisible({ timeout: 10000 });
      
      // Fill in progress update
      await actualOutputField.fill('E2E Test: 50% complete');
      
      const statusField = page.locator('select[name="accomplishment_status"]').or(
        page.locator('input[name="accomplishment_status"]')
      ).first();
      
      if (await statusField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await statusField.fill('On Track');
      }
      
      const remarksField = page.locator('textarea[name="remarks"]').first();
      if (await remarksField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await remarksField.fill('E2E Test: Good progress so far');
      }
      
      // Save progress update
      const saveButton = page.locator('button:has-text("Save Progress")').or(
        page.locator('button:has-text("Update Progress")')
      ).or(
        page.locator('button:has-text("Save")')
      );
      
      await saveButton.click();
      
      // Should see success message
      await expect(page.locator('text=progress').or(page.locator('text=updated'))).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Permission Denied Scenarios', () => {
    test('should deny FS user access to CPAP interface', async ({ page }) => {
      // Login as FS user
      await loginUser(page, testUsers.fs);
      
      // Try to navigate to CPAP page
      await page.goto('/cpap');
      
      // Should be redirected or see forbidden message
      await page.waitForLoadState('networkidle');
      
      // Should either be on forbidden page or redirected to dashboard
      const isForbidden = await page.locator('text=403').or(
        page.locator('text=Forbidden')
      ).or(
        page.locator('text=permission')
      ).isVisible({ timeout: 5000 }).catch(() => false);
      
      const isRedirected = !page.url().includes('/cpap');
      
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('should deny Interviewer user access to CPAP interface', async ({ page }) => {
      // Login as Interviewer user
      await loginUser(page, testUsers.interviewer);
      
      // Try to navigate to CPAP page
      await page.goto('/cpap');
      
      // Should be redirected or see forbidden message
      await page.waitForLoadState('networkidle');
      
      // Should either be on forbidden page or redirected to dashboard
      const isForbidden = await page.locator('text=403').or(
        page.locator('text=Forbidden')
      ).or(
        page.locator('text=permission')
      ).isVisible({ timeout: 5000 }).catch(() => false);
      
      const isRedirected = !page.url().includes('/cpap');
      
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('should deny FS user access to admin CPAP management', async ({ page }) => {
      // Login as FS user
      await loginUser(page, testUsers.fs);
      
      // Try to navigate to admin CPAP page
      await page.goto('/admin/cpap');
      
      // Should be redirected or see forbidden message
      await page.waitForLoadState('networkidle');
      
      // Should either be on forbidden page or redirected to dashboard
      const isForbidden = await page.locator('text=403').or(
        page.locator('text=Forbidden')
      ).or(
        page.locator('text=permission')
      ).isVisible({ timeout: 5000 }).catch(() => false);
      
      const isRedirected = !page.url().includes('/admin/cpap');
      
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('should deny Interviewer user access to admin CPAP management', async ({ page }) => {
      // Login as Interviewer user
      await loginUser(page, testUsers.interviewer);
      
      // Try to navigate to admin CPAP page
      await page.goto('/admin/cpap');
      
      // Should be redirected or see forbidden message
      await page.waitForLoadState('networkidle');
      
      // Should either be on forbidden page or redirected to dashboard
      const isForbidden = await page.locator('text=403').or(
        page.locator('text=Forbidden')
      ).or(
        page.locator('text=permission')
      ).isVisible({ timeout: 5000 }).catch(() => false);
      
      const isRedirected = !page.url().includes('/admin/cpap');
      
      expect(isForbidden || isRedirected).toBe(true);
    });

    test('should not show CPAP button in FS user navigation', async ({ page }) => {
      // Login as FS user
      await loginUser(page, testUsers.fs);
      
      // Navigate to dashboard
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // CPAP button should not be visible
      const cpapButton = page.locator('text=CPAP Submission').or(
        page.locator('a[href="/cpap"]')
      );
      
      const isVisible = await cpapButton.isVisible({ timeout: 3000 }).catch(() => false);
      expect(isVisible).toBe(false);
    });

    test('should not show CPAP button in Interviewer user navigation', async ({ page }) => {
      // Login as Interviewer user
      await loginUser(page, testUsers.interviewer);
      
      // Navigate to dashboard
      await page.goto('/');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // CPAP button should not be visible
      const cpapButton = page.locator('text=CPAP Submission').or(
        page.locator('a[href="/cpap"]')
      );
      
      const isVisible = await cpapButton.isVisible({ timeout: 3000 }).catch(() => false);
      expect(isVisible).toBe(false);
    });
  });
});
