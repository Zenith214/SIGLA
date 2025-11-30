require('dotenv').config({path:'.env'});
const {Pool} = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});

async function checkGenderColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='survey_response' 
      AND (column_name LIKE '%gender%' OR column_name LIKE '%sex%')
      ORDER BY ordinal_position
    `);
    
    console.log('Gender/Sex columns in survey_response:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkGenderColumns();
