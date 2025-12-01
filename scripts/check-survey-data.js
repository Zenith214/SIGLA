/**
 * Check Survey Data Structure
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get sample survey sections
    const result = await client.query(`
      SELECT 
        section_id,
        section_key,
        section_name,
        data
      FROM survey_section
      LIMIT 5
    `);

    console.log(`Found ${result.rows.length} survey sections:\n`);

    result.rows.forEach((row, index) => {
      console.log(`\n========== Section ${index + 1} ==========`);
      console.log(`ID: ${row.section_id}`);
      console.log(`Key: ${row.section_key}`);
      console.log(`Name: ${row.section_name}`);
      console.log(`Data:`, JSON.stringify(row.data, null, 2));
    });

    // Check all section keys
    const keysResult = await client.query(`
      SELECT DISTINCT section_key, COUNT(*) as count
      FROM survey_section
      GROUP BY section_key
      ORDER BY section_key
    `);

    console.log(`\n\n========== Section Keys Summary ==========`);
    keysResult.rows.forEach(row => {
      console.log(`${row.section_key}: ${row.count} sections`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
