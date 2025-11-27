// Test password hash compatibility
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

async function testPasswordHash() {
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    
    // Get admin user's password hash
    const userResult = await client.query('SELECT password FROM "user" WHERE email = $1', ['admin@sigla.com']);
    
    if (userResult.rows.length === 0) {
      console.log('Admin user not found');
      return;
    }
    
    const storedHash = userResult.rows[0].password;
    console.log('Stored password hash:', storedHash);
    
    // Test with known password 'password'
    const testPassword = 'password';
    const isMatch = await bcrypt.compare(testPassword, storedHash);
    
    console.log(`Password '${testPassword}' matches stored hash:`, isMatch);
    
    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log('Newly generated hash for same password:', newHash);
    
    // Verify the new hash works
    const newHashMatch = await bcrypt.compare(testPassword, newHash);
    console.log('New hash verification:', newHashMatch);
    
  } catch (err) {
    console.error('Error testing password hash:', err);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // End the pool
    await pool.end();
  }
}

testPasswordHash();