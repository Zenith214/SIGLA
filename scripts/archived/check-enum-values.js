const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkEnumValues() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT t.typname, e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname LIKE '%status%' OR t.typname LIKE '%survey%'
      ORDER BY t.typname, e.enumsortorder
    `);
    
    console.log('Enum types and values:');
    const enums = {};
    result.rows.forEach(row => {
      if (!enums[row.typname]) {
        enums[row.typname] = [];
      }
      enums[row.typname].push(row.enumlabel);
    });
    
    Object.entries(enums).forEach(([typname, labels]) => {
      console.log(`  ${typname}:`);
      labels.forEach(label => {
        console.log(`    - ${label}`);
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkEnumValues();