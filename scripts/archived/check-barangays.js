const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkBarangays() {
  try {
    const result = await pool.query('SELECT barangay_id, barangay_name FROM barangay ORDER BY barangay_id');
    
    console.log('\n📍 Barangays in database:\n');
    result.rows.forEach(b => {
      console.log(`  ${String(b.barangay_id).padStart(2, ' ')}: ${b.barangay_name}`);
    });
    console.log(`\n  Total: ${result.rows.length} barangays\n`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkBarangays();
