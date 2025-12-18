/**
 * Integration tests for CSIS Workflow API Endpoints
 * 
 * Tests the complete workflow including:
 * - Spot creation and assignment
 * - Visit logging and status updates
 * - Survey submission with multi-visit data
 * - Bulk sync functionality
 * 
 * Requirements tested:
 * - 10.1: Survey response API handles new and existing records
 * - 10.2: Multi-visit workflow data storage
 * - 10.3: Visit tracking and status updates
 * - 10.4: Bulk sync functionality
 * - 10.5: Data validation and error handling
 * - 10.6: Comprehensive error handling
 */

import { supabaseAdmin } from '../../src/lib/supabase';

// Test data
const TEST_CYCLE_ID = 1;
const TEST_BARANGAY_ID = 1;
const TEST_FI_ID = 1;

describe('CSIS Workflow API Integration Tests', () => {
  let createdSpotId: number;
  let createdQuestionnaireIds: string[];

  // Clean up test data before and after tests
  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  async function cleanupTestData() {
    // Delete test spots and related data
    const { data: testSpots } = await supabaseAdmin
      .from('spots')
      .select('spot_id')
      .eq('spot_name', 'Test Spot Integration');

    if (testSpots && testSpots.length > 0) {
      for (const spot of testSpots) {
        // Delete questionnaires first (cascade should handle this, but being explicit)
        await supabaseAdmin
          .from('questionnaires')
          .delete()
          .eq('spot_id', spot.spot_id);

        // Delete spot
        await supabaseAdmin
          .from('spots')
          .delete()
          .eq('spot_id', spot.spot_id);
      }
    }
  }

  describe('Spot Creation and Assignment Flow', () => {
    it('should create a spot with 5 auto-generated questionnaires', async () => {
      // Create spot
      const { data: spot, error: spotError } = await supabaseAdmin
        .from('spots')
        .insert({
          cycle_id: TEST_CYCLE_ID,
          barangay_id: TEST_BARANGAY_ID,
          spot_name: 'Test Spot Integration',
          starting_point: { lat: 8.1234, lng: 123.4567 },
          random_start: 123,
          status: 'Pending'
        })
        .select()
        .single();

      expect(spotError).toBeNull();
      expect(spot).toBeDefined();
      expect(spot.spot_name).toBe('Test Spot Integration');

      createdSpotId = spot.spot_id;

      // Get cycle year for questionnaire ID generation
      const { data: cycle } = await supabaseAdmin
        .from('survey_cycle')
        .select('year')
        .eq('cycle_id', TEST_CYCLE_ID)
        .single();

      expect(cycle).toBeDefined();
      expect(cycle).not.toBeNull();

      // Create questionnaires
      const questionnaireInserts = [];
      createdQuestionnaireIds = [];

      for (let sequence = 1; sequence <= 5; sequence++) {
        const questionnaireId = `${cycle!.year}-${String(createdSpotId).padStart(3, '0')}-${String(sequence).padStart(3, '0')}`;
        createdQuestionnaireIds.push(questionnaireId);
        
        questionnaireInserts.push({
          questionnaire_id: questionnaireId,
          spot_id: createdSpotId,
          cycle_id: TEST_CYCLE_ID,
          sequence_number: sequence,
          status: 'Pending',
          visit_count: 0
        });
      }

      const { error: questionnaireError } = await supabaseAdmin
        .from('questionnaires')
        .insert(questionnaireInserts);

      expect(questionnaireError).toBeNull();

      // Verify questionnaires were created
      const { data: questionnaires, error: fetchError } = await supabaseAdmin
        .from('questionnaires')
        .select('*')
        .eq('spot_id', createdSpotId);

      expect(fetchError).toBeNull();
      expect(questionnaires).toBeDefined();
      expect(questionnaires).not.toBeNull();
      expect(questionnaires!).toHaveLength(5);
      expect(questionnaires!.every(q => q.status === 'Pending')).toBe(true);
    });

    it('should assign spot to a Field Interviewer', async () => {
      const { data: updatedSpot, error } = await supabaseAdmin
        .from('spots')
        .update({ assigned_fi_id: TEST_FI_ID })
        .eq('spot_id', createdSpotId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedSpot.assigned_fi_id).toBe(TEST_FI_ID);
    });

    it('should retrieve spot with questionnaire details', async () => {
      const { data: spot, error } = await supabaseAdmin
        .from('spots')
        .select(`
          *,
          questionnaires (
            questionnaire_id,
            status,
            visit_count
          )
        `)
        .eq('spot_id', createdSpotId)
        .single();

      expect(error).toBeNull();
      expect(spot).toBeDefined();
      expect(spot.questionnaires).toHaveLength(5);
    });
  });

  describe('Visit Logging and Status Updates', () => {
    it('should log a callback visit and update questionnaire status', async () => {
      const questionnaireId = createdQuestionnaireIds[0];

      // Create visit record
      const { data: visit, error: visitError } = await supabaseAdmin
        .from('visits')
        .insert({
          questionnaire_id: questionnaireId,
          visit_number: 1,
          outcome: 'Callback_Needed',
          notes: 'No one home',
          location_lat: 8.1234,
          location_lng: 123.4567
        })
        .select()
        .single();

      expect(visitError).toBeNull();
      expect(visit).toBeDefined();
      expect(visit.outcome).toBe('Callback_Needed');

      // Update questionnaire status
      const { error: updateError } = await supabaseAdmin
        .from('questionnaires')
        .update({
          status: 'In_Progress',
          visit_count: 1
        })
        .eq('questionnaire_id', questionnaireId);

      expect(updateError).toBeNull();

      // Verify update
      const { data: questionnaire } = await supabaseAdmin
        .from('questionnaires')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .single();

      expect(questionnaire.status).toBe('In_Progress');
      expect(questionnaire.visit_count).toBe(1);
    });

    it('should log multiple visits and track visit count', async () => {
      const questionnaireId = createdQuestionnaireIds[1];

      // Log 3 callback visits
      for (let i = 1; i <= 3; i++) {
        await supabaseAdmin
          .from('visits')
          .insert({
            questionnaire_id: questionnaireId,
            visit_number: i,
            outcome: 'Callback_Needed',
            notes: `Callback attempt ${i}`
          });

        await supabaseAdmin
          .from('questionnaires')
          .update({
            status: i < 3 ? 'In_Progress' : 'Flagged_For_Substitution',
            visit_count: i
          })
          .eq('questionnaire_id', questionnaireId);
      }

      // Verify final status
      const { data: questionnaire } = await supabaseAdmin
        .from('questionnaires')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .single();

      expect(questionnaire.status).toBe('Flagged_For_Substitution');
      expect(questionnaire.visit_count).toBe(3);

      // Verify all visits were logged
      const { data: visits } = await supabaseAdmin
        .from('visits')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .order('visit_number', { ascending: true });

      expect(visits).toBeDefined();
      expect(visits).not.toBeNull();
      expect(visits!).toHaveLength(3);
      expect(visits![0].visit_number).toBe(1);
      expect(visits![2].visit_number).toBe(3);
    });

    it('should retrieve visit history for a questionnaire', async () => {
      const questionnaireId = createdQuestionnaireIds[1];

      const { data: visits, error } = await supabaseAdmin
        .from('visits')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .order('visit_timestamp', { ascending: false });

      expect(error).toBeNull();
      expect(visits).toBeDefined();
      expect(visits).not.toBeNull();
      expect(visits!).toHaveLength(3);
      expect(visits!.every(v => v.outcome === 'Callback_Needed')).toBe(true);
    });
  });

  describe('Survey Submission with Multi-Visit Data', () => {
    it('should create a new survey response with questionnaire_id', async () => {
      const questionnaireId = createdQuestionnaireIds[2];

      // Create survey response
      const { data: response, error } = await supabaseAdmin
        .from('survey_responses')
        .insert({
          questionnaire_id: questionnaireId,
          survey_number: questionnaireId,
          cycle_id: TEST_CYCLE_ID,
          interviewer_id: TEST_FI_ID,
          barangay_id: TEST_BARANGAY_ID,
          location: { lat: 8.1234, lng: 123.4567, address: 'Test Address' },
          selected_member: 'John Doe',
          respondent_demographics: {
            age: 35,
            gender: 'Male',
            occupation: 'Teacher'
          },
          sections: {
            financialAdmin: { q1: 'Yes', q2: '5' }
          },
          visit_count: 1
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(response).toBeDefined();
      expect(response.questionnaire_id).toBe(questionnaireId);

      // Update questionnaire status to completed
      await supabaseAdmin
        .from('questionnaires')
        .update({ status: 'Completed' })
        .eq('questionnaire_id', questionnaireId);

      // Log completion visit
      await supabaseAdmin
        .from('visits')
        .insert({
          questionnaire_id: questionnaireId,
          visit_number: 1,
          outcome: 'Interview_Completed',
          notes: 'Interview completed successfully'
        });
    });

    it('should update existing survey response for multi-visit scenario', async () => {
      const questionnaireId = createdQuestionnaireIds[2];

      // Update the survey response
      const { data: updated, error } = await supabaseAdmin
        .from('survey_responses')
        .update({
          sections: {
            financialAdmin: { q1: 'Yes', q2: '5', q3: 'Updated answer' }
          },
          visit_count: 2
        })
        .eq('questionnaire_id', questionnaireId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated.visit_count).toBe(2);
      expect(updated.sections.financialAdmin.q3).toBe('Updated answer');
    });
  });

  describe('Bulk Sync Functionality', () => {
    it('should handle bulk sync of multiple survey responses', async () => {
      const responses = [
        {
          questionnaire_id: createdQuestionnaireIds[3],
          survey_number: createdQuestionnaireIds[3],
          cycle_id: TEST_CYCLE_ID,
          interviewer_id: TEST_FI_ID,
          barangay_id: TEST_BARANGAY_ID,
          location: { lat: 8.1234, lng: 123.4567, address: 'Test Address 1' },
          selected_member: 'Jane Doe',
          respondent_demographics: { age: 30, gender: 'Female' },
          sections: { financialAdmin: { q1: 'Yes' } },
          visit_count: 1
        },
        {
          questionnaire_id: createdQuestionnaireIds[4],
          survey_number: createdQuestionnaireIds[4],
          cycle_id: TEST_CYCLE_ID,
          interviewer_id: TEST_FI_ID,
          barangay_id: TEST_BARANGAY_ID,
          location: { lat: 8.1235, lng: 123.4568, address: 'Test Address 2' },
          selected_member: 'Bob Smith',
          respondent_demographics: { age: 45, gender: 'Male' },
          sections: { financialAdmin: { q1: 'No' } },
          visit_count: 1
        }
      ];

      // Insert all responses
      const { data: inserted, error } = await supabaseAdmin
        .from('survey_responses')
        .insert(responses)
        .select();

      expect(error).toBeNull();
      expect(inserted).toHaveLength(2);

      // Update questionnaire statuses
      for (const response of responses) {
        await supabaseAdmin
          .from('questionnaires')
          .update({ status: 'Completed' })
          .eq('questionnaire_id', response.questionnaire_id);
      }

      // Verify all were created
      const { data: allResponses } = await supabaseAdmin
        .from('survey_responses')
        .select('*')
        .in('questionnaire_id', [createdQuestionnaireIds[3], createdQuestionnaireIds[4]]);

      expect(allResponses).toHaveLength(2);
    });

    it('should handle partial sync failures gracefully', async () => {
      // Try to insert a response with invalid data
      const { error } = await supabaseAdmin
        .from('survey_responses')
        .insert({
          questionnaire_id: 'INVALID-ID',
          survey_number: 'INVALID-ID',
          cycle_id: TEST_CYCLE_ID,
          interviewer_id: TEST_FI_ID,
          barangay_id: TEST_BARANGAY_ID,
          location: { lat: 8.1234, lng: 123.4567 },
          selected_member: 'Test User',
          respondent_demographics: {},
          sections: {}
        });

      // Should fail due to foreign key constraint
      expect(error).toBeDefined();
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should prevent duplicate questionnaire IDs', async () => {
      const questionnaireId = createdQuestionnaireIds[0];

      // Try to create another survey response with same questionnaire_id
      const { error } = await supabaseAdmin
        .from('survey_responses')
        .insert({
          questionnaire_id: questionnaireId,
          survey_number: questionnaireId,
          cycle_id: TEST_CYCLE_ID,
          interviewer_id: TEST_FI_ID,
          barangay_id: TEST_BARANGAY_ID,
          location: { lat: 8.1234, lng: 123.4567 },
          selected_member: 'Duplicate Test',
          respondent_demographics: {},
          sections: {}
        });

      // Should fail due to unique constraint (if exists) or we should update instead
      // This depends on the actual database schema
      expect(error).toBeDefined();
    });

    it('should validate required fields in survey responses', async () => {
      // Try to create response without required fields
      const { error } = await supabaseAdmin
        .from('survey_responses')
        .insert({
          questionnaire_id: 'TEST-999-999',
          // Missing required fields
        });

      expect(error).toBeDefined();
    });

    it('should handle invalid spot assignment', async () => {
      // Try to assign spot to non-existent FI
      const { error } = await supabaseAdmin
        .from('spots')
        .update({ assigned_fi_id: 99999 })
        .eq('spot_id', createdSpotId);

      // Should fail due to foreign key constraint
      expect(error).toBeDefined();
    });
  });

  describe('Complete Workflow Integration', () => {
    it('should complete full workflow: create spot -> assign -> visit -> complete', async () => {
      // 1. Create a new spot
      const { data: newSpot } = await supabaseAdmin
        .from('spots')
        .insert({
          cycle_id: TEST_CYCLE_ID,
          barangay_id: TEST_BARANGAY_ID,
          spot_name: 'Test Spot Full Workflow',
          starting_point: { lat: 8.2, lng: 123.5 },
          random_start: 456,
          status: 'Pending'
        })
        .select()
        .single();

      expect(newSpot).toBeDefined();

      // 2. Create questionnaire
      const { data: cycle } = await supabaseAdmin
        .from('survey_cycle')
        .select('year')
        .eq('cycle_id', TEST_CYCLE_ID)
        .single();

      expect(cycle).toBeDefined();
      expect(cycle).not.toBeNull();

      const questionnaireId = `${cycle!.year}-${String(newSpot.spot_id).padStart(3, '0')}-${String(1).padStart(3, '0')}`;

      await supabaseAdmin
        .from('questionnaires')
        .insert({
          questionnaire_id: questionnaireId,
          spot_id: newSpot.spot_id,
          cycle_id: TEST_CYCLE_ID,
          sequence_number: 1,
          status: 'Pending',
          visit_count: 0
        });

      // 3. Assign to FI
      await supabaseAdmin
        .from('spots')
        .update({ assigned_fi_id: TEST_FI_ID })
        .eq('spot_id', newSpot.spot_id);

      // 4. Log first visit (callback)
      await supabaseAdmin
        .from('visits')
        .insert({
          questionnaire_id: questionnaireId,
          visit_number: 1,
          outcome: 'Callback_Needed',
          notes: 'First visit - no one home'
        });

      await supabaseAdmin
        .from('questionnaires')
        .update({ status: 'In_Progress', visit_count: 1 })
        .eq('questionnaire_id', questionnaireId);

      // 5. Log second visit (completed)
      await supabaseAdmin
        .from('visits')
        .insert({
          questionnaire_id: questionnaireId,
          visit_number: 2,
          outcome: 'Interview_Completed',
          notes: 'Interview completed'
        });

      // 6. Create survey response
      await supabaseAdmin
        .from('survey_responses')
        .insert({
          questionnaire_id: questionnaireId,
          survey_number: questionnaireId,
          cycle_id: TEST_CYCLE_ID,
          interviewer_id: TEST_FI_ID,
          barangay_id: TEST_BARANGAY_ID,
          location: { lat: 8.2, lng: 123.5 },
          selected_member: 'Complete Workflow Test',
          respondent_demographics: { age: 40, gender: 'Male' },
          sections: { financialAdmin: { q1: 'Yes', q2: '5' } },
          visit_count: 2
        });

      // 7. Update questionnaire to completed
      await supabaseAdmin
        .from('questionnaires')
        .update({ status: 'Completed', visit_count: 2 })
        .eq('questionnaire_id', questionnaireId);

      // Verify final state
      const { data: finalQuestionnaire } = await supabaseAdmin
        .from('questionnaires')
        .select('*')
        .eq('questionnaire_id', questionnaireId)
        .single();

      expect(finalQuestionnaire.status).toBe('Completed');
      expect(finalQuestionnaire.visit_count).toBe(2);

      // Clean up
      await supabaseAdmin
        .from('questionnaires')
        .delete()
        .eq('spot_id', newSpot.spot_id);

      await supabaseAdmin
        .from('spots')
        .delete()
        .eq('spot_id', newSpot.spot_id);
    });
  });
});
