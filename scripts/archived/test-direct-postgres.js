// Test direct PostgreSQL connection
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testDirectConnection() {
  console.log('Testing direct PostgreSQL connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database!');
    
    // Test query
    const result = await client.query('SELECT * FROM "user" WHERE email = $1', ['admin@sigla.com']);
    console.log('Query result:', result.rows);
    
    client.release();
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  } finally {
    await pool.end();
  }
}

testDirectConnection();