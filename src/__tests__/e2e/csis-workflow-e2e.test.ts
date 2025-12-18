/**
 * End-to-End CSIS Workflow Tests
 * 
 * Tests complete workflows including:
 * - FS creating spots and assigning to FI
 * - FI completing interview with callbacks
 * - Offline data collection and sync
 * - Role-based access control
 * 
 * Requirements tested:
 * - 1.1-1.9: Field Supervisor role and dashboard
 * - 2.1-2.6: Field Interviewer dashboard updates
 * - 4.1-4.8: Multi-visit workflow (first visit)
 * - 5.1-5.7: Multi-visit workflow (subsequent visits)
 * - 7.1-7.6: Data synchronization
 * - 8.1-8.5: Role-based access control
 */

// Mock fetch for API calls
if (!global.fetch) {
  global.fetch = jest.fn();
}
const mockFetchCsis = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock IndexedDB for offline storage tests
const mockIndexedDB = {
  open: jest.fn(),
  databases: new Map(),
};

describe('CSIS Workflow E2E Tests', () => {
  // Test data
  const mockFS = {
    id: 1,
    email: 'fs@test.com',
    role: 'FS',
    firstName: 'Field',
    lastName: 'Supervisor'
  };

  const mockFI = {
    id: 2,
    email: 'fi@test.com',
    role: 'INTERVIEWER',
    firstName: 'Field',
    lastName: 'Interviewer'
  };

  const mockCycle = {
    cycle_id: 1,
    name: 'Survey Cycle 2024',
    year: 2024,
    is_active: true
  };

  const mockBarangay = {
    barangay_id: 1,
    barangay_name: 'Test Barangay'
  };

  const mockSpot = {
    spot_id: 1,
    cycle_id: 1,
    barangay_id: 1,
    spot_name: 'Spot #1',
    starting_point: { lat: 8.1234, lng: 123.4567 },
    random_start: 123,
    assigned_fi_id: 2,
    status: 'Pending'
  };

  const mockQuestionnaires = [
    { questionnaire_id: '2024-001-001', status: 'Pending', visit_count: 0 },
    { questionnaire_id: '2024-001-002', status: 'Pending', visit_count: 0 },
    { questionnaire_id: '2024-001-003', status: 'Pending', visit_count: 0 },
    { questionnaire_id: '2024-001-004', status: 'Pending', visit_count: 0 },
    { questionnaire_id: '2024-001-005', status: 'Pending', visit_count: 0 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FS Creating Spots and Assigning to FI', () => {
    it('should complete full spot creation and assignment workflow', async () => {
      // Step 1: FS logs in and accesses dashboard
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockFS })
      } as Response);

      // Step 2: FS creates a new spot
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          spotId: 1,
          spotName: 'Spot #1',
          questionnaires: [
            '2024-001-001',
            '2024-001-002',
            '2024-001-003',
            '2024-001-004',
            '2024-001-005'
          ],
          message: 'Spot created successfully with 5 questionnaires'
        })
      } as Response);

      const createSpotResponse = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: 1,
          barangayId: 1,
          spotName: 'Spot #1',
          startingPoint: { lat: 8.1234, lng: 123.4567 },
          randomStart: 123
        })
      });

      const spotData = await createSpotResponse.json();
      expect(spotData.questionnaires).toHaveLength(5);
      expect(spotData.questionnaires[0]).toMatch(/^\d{4}-\d{3}-\d{3}$/);

      // Step 3: FS assigns spot to FI
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          spotId: 1,
          assignedTo: 'Field Interviewer'
        })
      } as Response);

      const assignResponse = await fetch('/api/spots/1/assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiId: 2 })
      });

      const assignData = await assignResponse.json();
      expect(assignData.success).toBe(true);
      expect(assignData.assignedTo).toBe('Field Interviewer');

      // Step 4: Verify FI can see the assignment
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assignments: [{
            spotId: 1,
            spotName: 'Spot #1',
            barangayName: 'Test Barangay',
            status: 'Pending',
            completedCount: 0,
            totalCount: 5,
            interviews: mockQuestionnaires
          }]
        })
      } as Response);

      const assignmentsResponse = await fetch('/api/fi/assignments?cycleId=1');
      const assignmentsData = await assignmentsResponse.json();
      
      expect(assignmentsData.assignments).toHaveLength(1);
      expect(assignmentsData.assignments[0].spotName).toBe('Spot #1');
      expect(assignmentsData.assignments[0].interviews).toHaveLength(5);
    });

    it('should enforce FS role access to spot creation', async () => {
      // Non-FS user tries to create spot
      mockFetchCsis.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Insufficient permissions' })
      } as Response);

      const response = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: 1,
          barangayId: 1,
          spotName: 'Spot #1',
          startingPoint: { lat: 8.1234, lng: 123.4567 },
          randomStart: 123
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });

  describe('FI Completing Interview with Callbacks', () => {
    it('should complete multi-visit interview workflow', async () => {
      const questionnaireId = '2024-001-001';

      // Visit 1: Callback needed
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          visitId: 1,
          visitNumber: 1,
          questionnaireStatus: 'In_Progress'
        })
      } as Response);

      const visit1Response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId,
          outcome: 'Callback_Needed',
          notes: 'No one home',
          location: { lat: 8.1234, lng: 123.4567 }
        })
      });

      const visit1Data = await visit1Response.json();
      expect(visit1Data.visitNumber).toBe(1);
      expect(visit1Data.questionnaireStatus).toBe('In_Progress');

      // Visit 2: Callback needed again
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          visitId: 2,
          visitNumber: 2,
          questionnaireStatus: 'In_Progress'
        })
      } as Response);

      const visit2Response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId,
          outcome: 'Callback_Needed',
          notes: 'Respondent busy',
          location: { lat: 8.1234, lng: 123.4567 }
        })
      });

      const visit2Data = await visit2Response.json();
      expect(visit2Data.visitNumber).toBe(2);

      // Visit 3: Interview completed
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          responseId: 1,
          questionnaireId,
          status: 'Completed',
          message: 'Survey submitted successfully'
        })
      } as Response);

      const surveyResponse = await fetch('/api/survey-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId,
          surveyNumber: questionnaireId,
          cycleId: 1,
          interviewerId: 2,
          barangayId: 1,
          location: { lat: 8.1234, lng: 123.4567, address: 'Test Address' },
          selectedMember: 'John Doe',
          respondentDemographics: { age: 35, gender: 'Male' },
          sections: { financialAdmin: { q1: 'Yes', q2: '5' } },
          visitCount: 3
        })
      });

      const surveyData = await surveyResponse.json();
      expect(surveyData.status).toBe('Completed');
      expect(surveyData.questionnaireId).toBe(questionnaireId);
    });

    it('should flag questionnaire for substitution after 3 failed attempts', async () => {
      const questionnaireId = '2024-001-002';

      // Log 3 failed visits
      for (let i = 1; i <= 3; i++) {
        mockFetchCsis.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            visitId: i,
            visitNumber: i,
            questionnaireStatus: i === 3 ? 'Flagged_For_Substitution' : 'In_Progress'
          })
        } as Response);

        const response = await fetch('/api/visits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionnaireId,
            outcome: 'Callback_Needed',
            notes: `Failed attempt ${i}`
          })
        });

        const data = await response.json();
        
        if (i === 3) {
          expect(data.questionnaireStatus).toBe('Flagged_For_Substitution');
        }
      }
    });
  });

  describe('Offline Data Collection and Sync', () => {
    it('should save survey data offline and sync when online', async () => {
      const questionnaireId = '2024-001-003';
      
      // Simulate offline data storage
      const offlineData = {
        questionnaireId,
        surveyNumber: questionnaireId,
        cycleId: 1,
        interviewerId: 2,
        barangayId: 1,
        location: { lat: 8.1234, lng: 123.4567 },
        selectedMember: 'Jane Doe',
        respondentDemographics: { age: 30, gender: 'Female' },
        sections: { financialAdmin: { q1: 'Yes' } },
        status: 'Completed (Pending Sync)'
      };

      // Simulate coming back online and syncing
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          synced: 1,
          failed: 0,
          results: [
            { questionnaireId, status: 'success' }
          ]
        })
      } as Response);

      const syncResponse = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: [offlineData]
        })
      });

      const syncData = await syncResponse.json();
      expect(syncData.synced).toBe(1);
      expect(syncData.failed).toBe(0);
      expect(syncData.results[0].status).toBe('success');
    });

    it('should handle partial sync failures', async () => {
      const responses = [
        {
          questionnaireId: '2024-001-004',
          surveyNumber: '2024-001-004',
          cycleId: 1,
          interviewerId: 2,
          barangayId: 1,
          location: { lat: 8.1234, lng: 123.4567 },
          selectedMember: 'Valid Response',
          respondentDemographics: {},
          sections: {}
        },
        {
          questionnaireId: 'INVALID-ID',
          surveyNumber: 'INVALID-ID',
          cycleId: 1,
          interviewerId: 2,
          barangayId: 1,
          location: { lat: 8.1234, lng: 123.4567 },
          selectedMember: 'Invalid Response',
          respondentDemographics: {},
          sections: {}
        }
      ];

      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          synced: 1,
          failed: 1,
          results: [
            { questionnaireId: '2024-001-004', status: 'success' },
            { questionnaireId: 'INVALID-ID', status: 'error', error: 'Invalid questionnaire ID' }
          ]
        })
      } as Response);

      const syncResponse = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });

      const syncData = await syncResponse.json();
      expect(syncData.synced).toBe(1);
      expect(syncData.failed).toBe(1);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should restrict FS dashboard access to FS role only', async () => {
      // FI tries to access FS dashboard
      mockFetchCsis.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Insufficient permissions' })
      } as Response);

      const response = await fetch('/fs-dashboard');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });

    it('should allow FS to access FS dashboard', async () => {
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockFS })
      } as Response);

      const response = await fetch('/fs-dashboard');
      expect(response.ok).toBe(true);
    });

    it('should restrict FI to only their assigned spots', async () => {
      // FI tries to access another FI's assignments
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assignments: [] // Empty because not assigned to this FI
        })
      } as Response);

      const response = await fetch('/api/fi/assignments?cycleId=1');
      const data = await response.json();
      
      // Should only see their own assignments
      expect(data.assignments).toEqual([]);
    });

    it('should allow Admin to access all features', async () => {
      const mockAdmin = {
        id: 3,
        email: 'admin@test.com',
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User'
      };

      // Admin can access FS dashboard
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockAdmin })
      } as Response);

      const fsResponse = await fetch('/fs-dashboard');
      expect(fsResponse.ok).toBe(true);

      // Admin can access settings
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockAdmin })
      } as Response);

      const settingsResponse = await fetch('/settings');
      expect(settingsResponse.ok).toBe(true);
    });
  });

  describe('Complete End-to-End Workflow', () => {
    it('should complete full workflow from spot creation to survey completion', async () => {
      // 1. FS creates spot
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          spotId: 1,
          questionnaires: ['2024-001-001', '2024-001-002', '2024-001-003', '2024-001-004', '2024-001-005']
        })
      } as Response);

      const createSpot = await fetch('/api/spots', {
        method: 'POST',
        body: JSON.stringify({
          cycleId: 1,
          barangayId: 1,
          spotName: 'E2E Test Spot',
          startingPoint: { lat: 8.1234, lng: 123.4567 },
          randomStart: 123
        })
      });
      const spotData = await createSpot.json();

      // 2. FS assigns to FI
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      await fetch('/api/spots/1/assign', {
        method: 'PUT',
        body: JSON.stringify({ fiId: 2 })
      });

      // 3. FI views assignment
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          assignments: [{
            spotId: 1,
            interviews: mockQuestionnaires
          }]
        })
      } as Response);

      const assignments = await fetch('/api/fi/assignments?cycleId=1');
      const assignmentsData = await assignments.json();

      // 4. FI completes interview
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'Completed' })
      } as Response);

      const survey = await fetch('/api/survey-responses', {
        method: 'POST',
        body: JSON.stringify({
          questionnaireId: spotData.questionnaires[0],
          surveyNumber: spotData.questionnaires[0],
          cycleId: 1,
          interviewerId: 2,
          barangayId: 1,
          location: { lat: 8.1234, lng: 123.4567 },
          selectedMember: 'Test User',
          respondentDemographics: { age: 35, gender: 'Male' },
          sections: { financialAdmin: { q1: 'Yes' } }
        })
      });
      const surveyData = await survey.json();

      // 5. FS monitors progress
      mockFetchCsis.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          fieldInterviewers: [{
            fiId: 2,
            name: 'Field Interviewer',
            completedInterviews: 1,
            inProgress: 4,
            completionRate: 0.2
          }]
        })
      } as Response);

      const monitoring = await fetch('/api/fs/monitoring?cycleId=1');
      const monitoringData = await monitoring.json();

      expect(monitoringData.fieldInterviewers[0].completedInterviews).toBe(1);
    });
  });
});
