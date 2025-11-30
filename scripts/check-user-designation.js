const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUserDesignation() {
  const client = await pool.connect();
  
  try {
    // Check current user
    const userResult = await client.query(
      'SELECT id, email, "firstName", "lastName", role, "barangayDesignation" FROM "user" WHERE email = $1',
      ['lisan@pulse.com']
    );
    
    console.log('=== Your User Info ===');
    console.log(userResult.rows[0]);
    
    // Get available barangays
    const barangayResult = await client.query(
      'SELECT barangay_id, barangay_name FROM barangay WHERE is_active = true ORDER BY barangay_name LIMIT 10'
    );
    
    console.log('\n=== Available Barangays ===');
    barangayResult.rows.forEach(b => {
      console.log(`ID: ${b.barangay_id}, Name: ${b.barangay_name}`);
    });
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkUserDesignation().catch(console.error);
