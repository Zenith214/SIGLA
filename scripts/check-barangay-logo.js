const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBarangayLogo() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT barangay_id, barangay_name, logo_url FROM barangay WHERE barangay_id = 10'
    );
    
    console.log('=== Balasinon (ID: 10) Logo Info ===');
    console.log(result.rows[0]);
    
    if (result.rows[0].logo_url) {
      console.log('\n✅ Logo URL exists in database');
      console.log('Full path:', result.rows[0].logo_url);
    } else {
      console.log('\n❌ No logo URL in database');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkBarangayLogo().catch(console.error);
