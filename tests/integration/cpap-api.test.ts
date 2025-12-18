/**
 * Integration tests for CPAP API Endpoints
 * 
 * Tests the complete CPAP workflow including:
 * - CPAP creation and listing with role-based filtering
 * - CPAP submission with validation
 * - CPAP approval by ADMIN
 * - CPAP revision requests by ADMIN
 * - Progress updates by OFFICER
 * - Authorization failures for FS and INTERVIEWER roles
 * 
 * Requirements tested:
 * - 10.1: Authentication and authorization
 * - 10.2: Role-based access control for OFFICER users
 * - 10.3: Role-based access control for ADMIN users
 * - 10.4: Permission checks for different operations
 * - 10.5: Access logging and audit trail
 */

import { supabaseAdmin } from '../../src/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Test data
const TEST_CYCLE_ID = 1;
const TEST_BARANGAY_ID = 1;
const TEST_BARANGAY_ID_2 = 2;

// Test users
let testOfficerUser: any;
let testOfficerUser2: any;
let testAdminUser: any;
let testFSUser: any;
let testInterviewerUser: any;

// Test CPAP IDs
let createdCPAPId: number;
let createdCPAPId2: number;

describe('CPAP API Integration Tests', () => {
  // Setup test users and data before all tests
  beforeAll(async () => {
    await setupTestUsers();
    await cleanupTestData();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await cleanupTestData();
    await cleanupTestUsers();
  });

  /**
   * Setup test users with different roles
   */
  async function setupTestUsers() {
    // Create Officer user for barangay 1
    const { data: officer1, error: officer1Error } = await supabaseAdmin
      .from('user')
      .upsert({
        email: 'test.officer1@cpap.test',
        first_name: 'Test',
        last_name: 'Officer1',
        role: 'Officer',
        barangay_id: TEST_BARANGAY_ID,
        password_hash: 'test_hash'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (officer1Error && officer1Error.code !== '23505') {
      console.error('Error creating officer1:', officer1Error);
    }
    testOfficerUser = officer1 || (await supabaseAdmin
      .from('user')
      .select()
      .eq('email', 'test.officer1@cpap.test')
      .single()).data;

    // Create Officer user for barangay 2
    const { data: officer2, error: officer2Error } = await supabaseAdmin
      .from('user')
      .upsert({
        email: 'test.officer2@cpap.test',
        first_name: 'Test',
        last_name: 'Officer2',
        role: 'Officer',
        barangay_id: TEST_BARANGAY_ID_2,
        password_hash: 'test_hash'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (officer2Error && officer2Error.code !== '23505') {
      console.error('Error creating officer2:', officer2Error);
    }
    testOfficerUser2 = officer2 || (await supabaseAdmin
      .from('user')
      .select()
      .eq('email', 'test.officer2@cpap.test')
      .single()).data;

    // Create Admin user
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('user')
      .upsert({
        email: 'test.admin@cpap.test',
        first_name: 'Test',
        last_name: 'Admin',
        role: 'Admin',
        password_hash: 'test_hash'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (adminError && adminError.code !== '23505') {
      console.error('Error creating admin:', adminError);
    }
    testAdminUser = admin || (await supabaseAdmin
      .from('user')
      .select()
      .eq('email', 'test.admin@cpap.test')
      .single()).data;

    // Create FS user
    const { data: fs, error: fsError } = await supabaseAdmin
      .from('user')
      .upsert({
        email: 'test.fs@cpap.test',
        first_name: 'Test',
        last_name: 'FS',
        role: 'FS',
        password_hash: 'test_hash'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (fsError && fsError.code !== '23505') {
      console.error('Error creating fs:', fsError);
    }
    testFSUser = fs || (await supabaseAdmin
      .from('user')
      .select()
      .eq('email', 'test.fs@cpap.test')
      .single()).data;

    // Create Interviewer user
    const { data: interviewer, error: interviewerError } = await supabaseAdmin
      .from('user')
      .upsert({
        email: 'test.interviewer@cpap.test',
        first_name: 'Test',
        last_name: 'Interviewer',
        role: 'Interviewer',
        password_hash: 'test_hash'
      }, { onConflict: 'email' })
      .select()
      .single();

    if (interviewerError && interviewerError.code !== '23505') {
      console.error('Error creating interviewer:', interviewerError);
    }
    testInterviewerUser = interviewer || (await supabaseAdmin
      .from('user')
      .select()
      .eq('email', 'test.interviewer@cpap.test')
      .single()).data;
  }

  /**
   * Cleanup test users
   */
  async function cleanupTestUsers() {
    const testEmails = [
      'test.officer1@cpap.test',
      'test.officer2@cpap.test',
      'test.admin@cpap.test',
      'test.fs@cpap.test',
      'test.interviewer@cpap.test'
    ];

    await supabaseAdmin
      .from('user')
      .delete()
      .in('email', testEmails);
  }

  /**
   * Cleanup test CPAP data
   */
  async function cleanupTestData() {
    // Delete test CPAPs (cascade will handle items)
    await supabaseAdmin
      .from('cpaps')
      .delete()
      .in('barangay_id', [TEST_BARANGAY_ID, TEST_BARANGAY_ID_2]);
  }

  /**
   * Generate JWT token for test user
   */
  function generateToken(user: any): string {
    return jwt.sign(
      {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Make API request with authentication
   */
  async function makeRequest(
    method: string,
    path: string,
    token?: string,
    body?: any
  ): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Cookie'] = `pulse_token=${token}`;
    }

    return fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  }

  describe('GET /api/cpap - List CPAPs with role-based filtering', () => {
    beforeAll(async () => {
      // Create test CPAPs
      const { data: cpap1 } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: TEST_BARANGAY_ID,
          cycle_id: TEST_CYCLE_ID,
          status: 'Draft'
        })
        .select()
        .single();

      createdCPAPId = cpap1!.id;

      const { data: cpap2 } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: TEST_BARANGAY_ID_2,
          cycle_id: TEST_CYCLE_ID,
          status: 'Submitted'
        })
        .select()
        .single();

      createdCPAPId2 = cpap2!.id;
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await makeRequest('GET', '/api/cpap');
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 for FS user', async () => {
      const token = generateToken(testFSUser);
      const response = await makeRequest('GET', '/api/cpap', token);
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('permission');
    });

    it('should return 403 for Interviewer user', async () => {
      const token = generateToken(testInterviewerUser);
      const response = await makeRequest('GET', '/api/cpap', token);
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('permission');
    });

    it('should return only assigned barangay CPAP for Officer user', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest('GET', '/api/cpap', token);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cpaps).toBeDefined();
      expect(Array.isArray(data.cpaps)).toBe(true);
      expect(data.cpaps.length).toBe(1);
      expect(data.cpaps[0].barangay_id).toBe(TEST_BARANGAY_ID);
    });

    it('should return all CPAPs for Admin user', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest('GET', '/api/cpap', token);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cpaps).toBeDefined();
      expect(data.cpaps.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter CPAPs by status', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest('GET', '/api/cpap?status=Submitted', token);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cpaps.every((c: any) => c.status === 'Submitted')).toBe(true);
    });
  });

  describe('POST /api/cpap/[id]/submit - Submit CPAP with validation', () => {
    let testCPAPId: number;

    beforeAll(async () => {
      // Create a CPAP with items for submission testing
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: TEST_BARANGAY_ID,
          cycle_id: TEST_CYCLE_ID,
          status: 'Draft'
        })
        .select()
        .single();

      testCPAPId = cpap!.id;

      // Add items to the CPAP
      await supabaseAdmin
        .from('cpap_items')
        .insert([
          {
            cpap_id: testCPAPId,
            priority_area: 'Health Services',
            target_output: 'Improve health center accessibility',
            success_indicator: '80% satisfaction rate',
            responsible_person: 'Health Officer',
            timeline_start: '2025-01-01',
            timeline_end: '2025-12-31'
          },
          {
            cpap_id: testCPAPId,
            priority_area: 'Education',
            target_output: 'Increase school enrollment',
            success_indicator: '95% enrollment rate',
            responsible_person: 'Education Coordinator',
            timeline_start: '2025-01-01',
            timeline_end: '2025-12-31'
          }
        ]);
    });

    afterAll(async () => {
      await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', testCPAPId);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`);
      expect(response.status).toBe(401);
    });

    it('should return 403 for FS user', async () => {
      const token = generateToken(testFSUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`, token);
      expect(response.status).toBe(403);
    });

    it('should return 403 for Interviewer user', async () => {
      const token = generateToken(testInterviewerUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`, token);
      expect(response.status).toBe(403);
    });

    it('should return 403 for Admin user', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`, token);
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.message).toContain('Officer');
    });

    it('should return 403 for Officer from different barangay', async () => {
      const token = generateToken(testOfficerUser2);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`, token);
      expect(response.status).toBe(403);
    });

    it('should successfully submit CPAP with valid items', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`, token);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('submitted');

      // Verify status changed in database
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select('status, submitted_at')
        .eq('id', testCPAPId)
        .single();

      expect(cpap!.status).toBe('Submitted');
      expect(cpap!.submitted_at).not.toBeNull();
    });

    it('should return 400 when trying to submit already submitted CPAP', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/submit`, token);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/cpap/[id]/approve - Approve CPAP', () => {
    let testCPAPId: number;

    beforeAll(async () => {
      // Create a submitted CPAP for approval testing
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

      testCPAPId = cpap!.id;

      // Add items
      await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: testCPAPId,
          priority_area: 'Infrastructure',
          target_output: 'Build community center',
          success_indicator: 'Center operational',
          responsible_person: 'Engineering Office',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        });
    });

    afterAll(async () => {
      await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', testCPAPId);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/approve`);
      expect(response.status).toBe(401);
    });

    it('should return 403 for FS user', async () => {
      const token = generateToken(testFSUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/approve`, token);
      expect(response.status).toBe(403);
    });

    it('should return 403 for Interviewer user', async () => {
      const token = generateToken(testInterviewerUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/approve`, token);
      expect(response.status).toBe(403);
    });

    it('should return 403 for Officer user', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/approve`, token);
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.message).toContain('Admin');
    });

    it('should successfully approve CPAP as Admin', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/approve`,
        token,
        { comments: 'Approved - good plan' }
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('approved');

      // Verify status changed in database
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select('status, approved_at, admin_comments')
        .eq('id', testCPAPId)
        .single();

      expect(cpap!.status).toBe('Approved');
      expect(cpap!.approved_at).not.toBeNull();
      expect(cpap!.admin_comments).toBe('Approved - good plan');
    });

    it('should return 400 when trying to approve already approved CPAP', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest('POST', `/api/cpap/${testCPAPId}/approve`, token);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/cpap/[id]/request-revision - Request CPAP revision', () => {
    let testCPAPId: number;

    beforeAll(async () => {
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

      testCPAPId = cpap!.id;

      // Add items
      await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: testCPAPId,
          priority_area: 'Social Services',
          target_output: 'Expand social welfare programs',
          success_indicator: '100 families assisted',
          responsible_person: 'Social Welfare Officer',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        });
    });

    afterAll(async () => {
      await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', testCPAPId);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/request-revision`,
        undefined,
        { comments: 'Needs revision' }
      );
      expect(response.status).toBe(401);
    });

    it('should return 403 for FS user', async () => {
      const token = generateToken(testFSUser);
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/request-revision`,
        token,
        { comments: 'Needs revision' }
      );
      expect(response.status).toBe(403);
    });

    it('should return 403 for Interviewer user', async () => {
      const token = generateToken(testInterviewerUser);
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/request-revision`,
        token,
        { comments: 'Needs revision' }
      );
      expect(response.status).toBe(403);
    });

    it('should return 403 for Officer user', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/request-revision`,
        token,
        { comments: 'Needs revision' }
      );
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.message).toContain('Admin');
    });

    it('should return 400 when comments are missing', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/request-revision`,
        token,
        {}
      );
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.message).toContain('Comments');
    });

    it('should successfully request revision as Admin', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest(
        'POST',
        `/api/cpap/${testCPAPId}/request-revision`,
        token,
        { comments: 'Please add more specific success indicators' }
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('revision');

      // Verify status changed in database
      const { data: cpap } = await supabaseAdmin
        .from('cpaps')
        .select('status, admin_comments')
        .eq('id', testCPAPId)
        .single();

      expect(cpap!.status).toBe('Revision_Requested');
      expect(cpap!.admin_comments).toBe('Please add more specific success indicators');
    });
  });

  describe('PUT /api/cpap/[id]/progress - Update CPAP progress', () => {
    let testCPAPId: number;
    let testItemId: number;

    beforeAll(async () => {
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

      testCPAPId = cpap!.id;

      // Add items
      const { data: item } = await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: testCPAPId,
          priority_area: 'Economic Development',
          target_output: 'Support local businesses',
          success_indicator: '50 businesses assisted',
          responsible_person: 'Economic Development Officer',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        })
        .select()
        .single();

      testItemId = item!.id;
    });

    afterAll(async () => {
      await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', testCPAPId);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        undefined,
        { items: [{ id: testItemId, actual_output: 'Progress update' }] }
      );
      expect(response.status).toBe(401);
    });

    it('should return 403 for FS user', async () => {
      const token = generateToken(testFSUser);
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        token,
        { items: [{ id: testItemId, actual_output: 'Progress update' }] }
      );
      expect(response.status).toBe(403);
    });

    it('should return 403 for Interviewer user', async () => {
      const token = generateToken(testInterviewerUser);
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        token,
        { items: [{ id: testItemId, actual_output: 'Progress update' }] }
      );
      expect(response.status).toBe(403);
    });

    it('should return 403 for Admin user', async () => {
      const token = generateToken(testAdminUser);
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        token,
        { items: [{ id: testItemId, actual_output: 'Progress update' }] }
      );
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.message).toContain('Officer');
    });

    it('should return 403 for Officer from different barangay', async () => {
      const token = generateToken(testOfficerUser2);
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        token,
        { items: [{ id: testItemId, actual_output: 'Progress update' }] }
      );
      expect(response.status).toBe(403);
    });

    it('should return 400 when items array is missing', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        token,
        {}
      );
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.message).toContain('items');
    });

    it('should successfully update progress as Officer', async () => {
      const token = generateToken(testOfficerUser);
      const response = await makeRequest(
        'PUT',
        `/api/cpap/${testCPAPId}/progress`,
        token,
        {
          items: [
            {
              id: testItemId,
              actual_output: '25 businesses assisted so far',
              accomplishment_status: 'On Track',
              remarks: 'Good progress in Q1'
            }
          ]
        }
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('progress');

      // Verify progress updated in database
      const { data: item } = await supabaseAdmin
        .from('cpap_items')
        .select('actual_output, accomplishment_status, remarks')
        .eq('id', testItemId)
        .single();

      expect(item!.actual_output).toBe('25 businesses assisted so far');
      expect(item!.accomplishment_status).toBe('On Track');
      expect(item!.remarks).toBe('Good progress in Q1');
    });
  });

  describe('Complete CPAP Workflow Integration', () => {
    let workflowCPAPId: number;
    let workflowItemId: number;

    it('should complete full workflow: create -> submit -> approve -> progress', async () => {
      // 1. Officer creates CPAP
      const officerToken = generateToken(testOfficerUser);
      const createResponse = await makeRequest(
        'POST',
        '/api/cpap',
        officerToken,
        {
          barangay_id: TEST_BARANGAY_ID,
          cycle_id: TEST_CYCLE_ID
        }
      );

      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json();
      expect(createData.success).toBe(true);
      workflowCPAPId = createData.cpap.id;

      // 2. Officer adds items
      const { data: item } = await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: workflowCPAPId,
          priority_area: 'Complete Workflow Test',
          target_output: 'Test target',
          success_indicator: 'Test indicator',
          responsible_person: 'Test Person',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        })
        .select()
        .single();

      workflowItemId = item!.id;

      // 3. Officer submits CPAP
      const submitResponse = await makeRequest(
        'POST',
        `/api/cpap/${workflowCPAPId}/submit`,
        officerToken
      );

      expect(submitResponse.status).toBe(200);
      const submitData = await submitResponse.json();
      expect(submitData.success).toBe(true);

      // Verify status is Submitted
      const { data: submittedCPAP } = await supabaseAdmin
        .from('cpaps')
        .select('status')
        .eq('id', workflowCPAPId)
        .single();

      expect(submittedCPAP!.status).toBe('Submitted');

      // 4. Admin approves CPAP
      const adminToken = generateToken(testAdminUser);
      const approveResponse = await makeRequest(
        'POST',
        `/api/cpap/${workflowCPAPId}/approve`,
        adminToken,
        { comments: 'Workflow test approval' }
      );

      expect(approveResponse.status).toBe(200);
      const approveData = await approveResponse.json();
      expect(approveData.success).toBe(true);

      // Verify status is Approved
      const { data: approvedCPAP } = await supabaseAdmin
        .from('cpaps')
        .select('status, approved_at')
        .eq('id', workflowCPAPId)
        .single();

      expect(approvedCPAP!.status).toBe('Approved');
      expect(approvedCPAP!.approved_at).not.toBeNull();

      // 5. Officer updates progress
      const progressResponse = await makeRequest(
        'PUT',
        `/api/cpap/${workflowCPAPId}/progress`,
        officerToken,
        {
          items: [
            {
              id: workflowItemId,
              actual_output: 'Workflow test progress',
              accomplishment_status: 'Completed',
              remarks: 'Workflow test complete'
            }
          ]
        }
      );

      expect(progressResponse.status).toBe(200);
      const progressData = await progressResponse.json();
      expect(progressData.success).toBe(true);

      // Verify progress was updated
      const { data: updatedItem } = await supabaseAdmin
        .from('cpap_items')
        .select('actual_output, accomplishment_status, remarks')
        .eq('id', workflowItemId)
        .single();

      expect(updatedItem!.actual_output).toBe('Workflow test progress');
      expect(updatedItem!.accomplishment_status).toBe('Completed');
      expect(updatedItem!.remarks).toBe('Workflow test complete');

      // Cleanup
      await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', workflowCPAPId);
    });

    it('should complete revision workflow: submit -> request revision -> resubmit -> approve', async () => {
      // 1. Create and submit CPAP
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

      const revisionCPAPId = cpap!.id;

      await supabaseAdmin
        .from('cpap_items')
        .insert({
          cpap_id: revisionCPAPId,
          priority_area: 'Revision Test',
          target_output: 'Test target',
          success_indicator: 'Test indicator',
          responsible_person: 'Test Person',
          timeline_start: '2025-01-01',
          timeline_end: '2025-12-31'
        });

      // 2. Admin requests revision
      const adminToken = generateToken(testAdminUser);
      const revisionResponse = await makeRequest(
        'POST',
        `/api/cpap/${revisionCPAPId}/request-revision`,
        adminToken,
        { comments: 'Please improve success indicators' }
      );

      expect(revisionResponse.status).toBe(200);

      // Verify status is Revision_Requested
      const { data: revisionCPAP } = await supabaseAdmin
        .from('cpaps')
        .select('status, admin_comments')
        .eq('id', revisionCPAPId)
        .single();

      expect(revisionCPAP!.status).toBe('Revision_Requested');
      expect(revisionCPAP!.admin_comments).toBe('Please improve success indicators');

      // 3. Officer resubmits
      const officerToken = generateToken(testOfficerUser);
      const resubmitResponse = await makeRequest(
        'POST',
        `/api/cpap/${revisionCPAPId}/submit`,
        officerToken
      );

      expect(resubmitResponse.status).toBe(200);

      // Verify status is Submitted again
      const { data: resubmittedCPAP } = await supabaseAdmin
        .from('cpaps')
        .select('status')
        .eq('id', revisionCPAPId)
        .single();

      expect(resubmittedCPAP!.status).toBe('Submitted');

      // 4. Admin approves
      const finalApproveResponse = await makeRequest(
        'POST',
        `/api/cpap/${revisionCPAPId}/approve`,
        adminToken,
        { comments: 'Approved after revision' }
      );

      expect(finalApproveResponse.status).toBe(200);

      // Verify final status
      const { data: finalCPAP } = await supabaseAdmin
        .from('cpaps')
        .select('status, approved_at')
        .eq('id', revisionCPAPId)
        .single();

      expect(finalCPAP!.status).toBe('Approved');
      expect(finalCPAP!.approved_at).not.toBeNull();

      // Cleanup
      await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', revisionCPAPId);
    });
  });
});
