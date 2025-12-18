require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  const client = await pool.connect();
  
  try {
    console.log('🔐 Testing Ana Reyes login...\n');
    
    // Get user
    const result = await client.query(
      'SELECT id, email, "firstName", "lastName", password FROM "user" WHERE email = $1',
      ['ana.reyes2@sigla.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User Info:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.firstName, user.lastName);
    console.log('  Password Hash:', user.password.substring(0, 30) + '...');
    
    // Test password
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('\n🔑 Password Test:');
    console.log(`  Testing: "${testPassword}"`);
    console.log(`  Result: ${isValid ? '✅ SUCCESS - Password matches!' : '❌ FAILED - Password does not match'}`);
    
    if (isValid) {
      console.log('\n✅ Ana Reyes can now log in with password: password123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testLogin();
