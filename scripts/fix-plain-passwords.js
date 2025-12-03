require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixPlainPasswords() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Finding users with plain text passwords...\n');
    
    // Get all users
    const result = await client.query(
      'SELECT id, email, "firstName", "lastName", password FROM "user"'
    );
    
    console.log(`Found ${result.rows.length} total users\n`);
    
    let fixedCount = 0;
    
    for (const user of result.rows) {
      // Check if password is a bcrypt hash (starts with $2a$, $2b$, or $2y$ and is 60 chars)
      const isBcryptHash = user.password && 
                          user.password.match(/^\$2[aby]\$\d{2}\$/) && 
                          user.password.length === 60;
      
      if (!isBcryptHash) {
        console.log(`❌ Plain text password found for: ${user.email}`);
        console.log(`   Current: "${user.password}"`);
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Update the database
        await client.query(
          'UPDATE "user" SET password = $1 WHERE id = $2',
          [hashedPassword, user.id]
        );
        
        console.log(`   ✅ Updated to hashed password`);
        console.log(`   New hash: ${hashedPassword.substring(0, 20)}...\n`);
        fixedCount++;
      } else {
        console.log(`✅ ${user.email} - password already hashed`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total users: ${result.rows.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Already hashed: ${result.rows.length - fixedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPlainPasswords();
