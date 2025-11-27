// Check if admin user exists in PostgreSQL database directly
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

async function checkAdminUser() {
  let client;
  try {
    console.log('Attempting to connect to PostgreSQL database...');
    
    // Get a client from the pool
    client = await pool.connect();
    console.log('Connection successful!');
    
    // Check if admin user exists
    const userResult = await client.query('SELECT * FROM "user" WHERE email = $1', ['admin@sigla.com']);
    
    if (userResult.rows.length > 0) {
      console.log('Admin user found:', userResult.rows[0]);
      console.log('Password hash:', userResult.rows[0].password);
    } else {
      console.log('Admin user not found in database');
    }
    
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

checkAdminUser();