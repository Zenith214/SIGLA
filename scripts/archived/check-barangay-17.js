const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBarangay17() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking database state for Barangay 17...\n');

    console.log('Survey Target:');
    const targetResult = await client.query('SELECT * FROM survey_target WHERE barangay_id = 17');
    console.log(JSON.stringify(targetResult.rows, null, 2));

    console.log('\nSurvey Response Count:');
    const responseResult = await client.query('SELECT COUNT(*) as count FROM survey_response WHERE barangay_id = 17');
    console.log(`Total responses: ${responseResult.rows[0].count}`);

    if (responseResult.rows[0].count > 0) {
      console.log('\nSample responses:');
      const sampleResult = await client.query('SELECT response_id, survey_number, submitted_at FROM survey_response WHERE barangay_id = 17 LIMIT 3');
      console.log(JSON.stringify(sampleResult.rows, null, 2));
    }

  } finally {
    client.release();
    pool.end();
  }
}

checkBarangay17().catch(console.error);