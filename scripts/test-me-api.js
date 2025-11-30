// This script simulates what happens when you're logged in
// It shows what the /api/me endpoint would return

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testMeAPI() {
  const client = await pool.connect();
  
  try {
    // Simulate getting user ID 3 (your officer account)
    const userId = 3;
    
    const result = await client.query(
      'SELECT id, "firstName", "lastName", email, role, "profilePicture", "barangayDesignation" FROM "user" WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = result.rows[0];
    
    console.log('=== What /api/me returns for your account ===');
    console.log({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role?.toLowerCase(),
      profilePicture: user.profilePicture,
      barangayDesignation: user.barangayDesignation
    });
    
    console.log('\n=== Condition Check ===');
    console.log(`role === 'officer': ${user.role?.toLowerCase() === 'officer'}`);
    console.log(`barangayDesignation exists: ${!!user.barangayDesignation}`);
    console.log(`Should show Barangay Logo section: ${user.role?.toLowerCase() === 'officer' && !!user.barangayDesignation}`);
    
    if (user.barangayDesignation) {
      const barangayResult = await client.query(
        'SELECT barangay_id, barangay_name, logo_url FROM barangay WHERE barangay_id = $1',
        [user.barangayDesignation]
      );
      
      console.log('\n=== Your Designated Barangay ===');
      console.log(barangayResult.rows[0]);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

testMeAPI().catch(console.error);
