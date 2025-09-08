// Update admin user password hash in the database
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

async function updateAdminPassword() {
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    
    // Generate a new hash for 'password'
    const plainPassword = 'password';
    const newHash = await bcrypt.hash(plainPassword, 10);
    console.log('New password hash generated:', newHash);
    
    // Update admin user's password hash
    const updateResult = await client.query(
      'UPDATE "user" SET password = $1 WHERE email = $2 RETURNING id, email',
      [newHash, 'admin@sigla.com']
    );
    
    if (updateResult.rows.length === 0) {
      console.log('Admin user not found or update failed');
      return;
    }
    
    console.log('Updated password hash for user:', updateResult.rows[0]);
    
    // Verify the new hash works
    const userResult = await client.query('SELECT password FROM "user" WHERE email = $1', ['admin@sigla.com']);
    const storedHash = userResult.rows[0].password;
    
    const isMatch = await bcrypt.compare(plainPassword, storedHash);
    console.log(`Password '${plainPassword}' now matches stored hash:`, isMatch);
    
  } catch (err) {
    console.error('Error updating password hash:', err);
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // End the pool
    await pool.end();
  }
}

updateAdminPassword();