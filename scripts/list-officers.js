const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listOfficers() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, "firstName", "lastName", role, "barangayDesignation" FROM "user" WHERE role = $1 ORDER BY id',
      ['officer']
    );
    
    console.log('=== Officer Users ===');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}, Name: ${user.firstName} ${user.lastName}, Email: ${user.email}, Designation: ${user.barangayDesignation || 'None'}`);
    });
    
    console.log('\n=== Available Barangays (first 10) ===');
    const barangays = await client.query(
      'SELECT barangay_id, barangay_name FROM barangay WHERE is_active = true ORDER BY barangay_name LIMIT 10'
    );
    barangays.rows.forEach(b => {
      console.log(`ID: ${b.barangay_id}, Name: ${b.barangay_name}`);
    });
    
  } finally {
    client.release();
    await pool.end();
  }
}

listOfficers().catch(console.error);
