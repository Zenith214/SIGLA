// Test direct PostgreSQL connection with new credentials
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

console.log('Database URL found in environment variables');

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to PostgreSQL database...');
    
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connection successful!');
    
    // Test query to check if we can access the database
    const userResult = await client.query('SELECT id, email FROM "user" LIMIT 1');
    console.log('User query result:', userResult.rows);
    
    // Test query for barangay table
    const barangayResult = await client.query('SELECT barangay_id, barangay_name FROM barangay LIMIT 3');
    console.log('Barangay query result:', barangayResult.rows);
    
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // End the pool
    await pool.end();
  }
}

testConnection();