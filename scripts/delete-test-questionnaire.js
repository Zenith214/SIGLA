/**
 * Delete Test Questionnaire Data
 * Deletes all data for questionnaire 2026-001-1 including:
 * - Survey responses
 * - Survey sections
 * - Visits
 * - IndexedDB records
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function deleteTestQuestionnaire(questionnaireId) {
  if (!questionnaireId) {
    console.error('❌ Please provide a questionnaire ID');
    console.log('Usage: node scripts/delete-test-questionnaire.js <questionnaireId>');
    console.log('Example: node scripts/delete-test-questionnaire.js 2026-001-1');
    process.exit(1);
  }
  
  let client;

  try {
    client = await pool.connect();
    console.log('✅ Connected to database');

    // Start transaction
    await client.query('BEGIN');

    // 1. Delete survey sections
    const sectionsResult = await client.query(
      'DELETE FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE survey_number = $1)',
      [questionnaireId]
    );
    console.log(`🗑️  Deleted ${sectionsResult.rowCount} survey sections`);

    // 2. Delete survey responses
    const responsesResult = await client.query(
      'DELETE FROM survey_response WHERE survey_number = $1',
      [questionnaireId]
    );
    console.log(`🗑️  Deleted ${responsesResult.rowCount} survey responses`);

    // 3. Delete visits
    const visitsResult = await client.query(
      'DELETE FROM visits WHERE questionnaire_id = $1',
      [questionnaireId]
    );
    console.log(`🗑️  Deleted ${visitsResult.rowCount} visits`);

    // 4. Reset questionnaire status to Pending
    const questionnaireResult = await client.query(
      `UPDATE questionnaires 
       SET status = 'Pending', 
           visit_count = 0,
           updated_at = NOW()
       WHERE questionnaire_id = $1`,
      [questionnaireId]
    );
    console.log(`🔄 Reset ${questionnaireResult.rowCount} questionnaire to Pending status`);

    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully');

    // Show final status
    const finalStatus = await client.query(
      'SELECT questionnaire_id, status, visit_count FROM questionnaires WHERE questionnaire_id = $1',
      [questionnaireId]
    );
    
    if (finalStatus.rows.length > 0) {
      console.log('\n📊 Final Status:');
      console.log(finalStatus.rows[0]);
    }

    console.log(`\n✅ Successfully deleted all data for questionnaire ${questionnaireId}`);
    console.log('⚠️  Note: IndexedDB data on client devices will need to be cleared manually');

  } catch (error) {
    // Rollback on error
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('❌ Error deleting test questionnaire:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Get questionnaire ID from command line argument
const questionnaireId = process.argv[2];

// Run the script
deleteTestQuestionnaire(questionnaireId)
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
