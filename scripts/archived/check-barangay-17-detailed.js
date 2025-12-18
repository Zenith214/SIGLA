const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBarangay17Detailed() {
  const client = await pool.connect();
  try {
    console.log('🔍 Detailed check for Barangay 17...\n');

    console.log('Survey Target:');
    const targetResult = await client.query('SELECT * FROM survey_target WHERE barangay_id = 17');
    console.log(JSON.stringify(targetResult.rows, null, 2));

    console.log('\nSurvey Response Count:');
    const responseResult = await client.query('SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = 17');
    console.log(`Total responses: ${responseResult.rows[0].count}`);

    console.log('\nSurvey Section Count:');
    const sectionResult = await client.query('SELECT COUNT(*) as count FROM survey_section WHERE response_id IN (SELECT response_id FROM survey_response WHERE barangay_id = 17)');
    console.log(`Total sections: ${sectionResult.rows[0].count}`);

    console.log('\nChecking for orphaned sections (sections without responses):');
    const orphanedResult = await client.query(`
      SELECT COUNT(*) as count FROM survey_section ss
      LEFT JOIN survey_response sr ON ss.response_id = sr.response_id
      WHERE sr.response_id IS NULL
    `);
    console.log(`Orphaned sections: ${orphanedResult.rows[0].count}`);

    console.log('\nChecking for sections linked to barangay 17 (even if response is gone):');
    const linkedSections = await client.query(`
      SELECT COUNT(*) as count FROM survey_section ss
      WHERE ss.response_id IN (
        SELECT response_id FROM survey_response WHERE barangay_id = 17
      )
    `);
    console.log(`Sections linked to barangay 17: ${linkedSections.rows[0].count}`);

    // Check if there are any cached or computed values
    console.log('\nChecking if there are any computed analytics:');
    const analyticsResult = await client.query('SELECT * FROM barangay_analytics WHERE barangay_id = 17');
    console.log(`Analytics records: ${analyticsResult.rows.length}`);
    if (analyticsResult.rows.length > 0) {
      console.log(JSON.stringify(analyticsResult.rows, null, 2));
    }

  } finally {
    client.release();
    pool.end();
  }
}

checkBarangay17Detailed().catch(console.error);