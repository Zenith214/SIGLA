require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkPassword() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking Ana Reyes password...\n');
    
    // Get user info
    const result = await client.query(
      'SELECT id, email, "firstName", "lastName", role, password FROM "user" WHERE email = $1',
      ['ana.reyes2@sigla.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User Info:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.firstName, user.lastName);
    console.log('  Role:', user.role);
    console.log('  Password Hash:', user.password);
    console.log('  Hash Length:', user.password?.length);
    console.log('  Hash Starts With:', user.password?.substring(0, 10));
    
    // Test password123
    console.log('\n🔐 Testing passwords:');
    const testPasswords = ['password123', 'Password123', 'PASSWORD123', 'password', '123'];
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`  "${pwd}": ${isValid ? '✅ MATCH' : '❌ no match'}`);
    }
    
    // Generate new hash for password123
    console.log('\n🔑 New hash for "password123":');
    const newHash = await bcrypt.hash('password123', 10);
    console.log('  ', newHash);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPassword();
