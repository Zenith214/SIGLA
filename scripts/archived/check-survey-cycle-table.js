const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSurveyCycleTable() {
  const client = await pool.connect();
  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'survey_cycle'
      );
    `);
    
    console.log('Table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get table structure
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'survey_cycle'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nTable structure:');
      structure.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // Check existing data
      const data = await client.query('SELECT * FROM survey_cycle ORDER BY created_at DESC LIMIT 5');
      console.log('\nSample data:', data.rows.length, 'rows');
      data.rows.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.year} - ${row.status} (${row.cycle_id})`);
      });
    } else {
      console.log('Table does not exist - need to create it');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSurveyCycleTable();