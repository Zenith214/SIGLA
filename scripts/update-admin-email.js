const { Pool } = require('pg');
require('dotenv').config();

async function updateAdminEmail() {
  console.log('🔄 Updating admin email from SIGLA to PULSE...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  let client;
  try {
    client = await pool.connect();
    
    console.log('1. Checking current admin user...');
    const currentAdmin = await client.query('SELECT * FROM "user" WHERE email = $1', ['admin@sigla.com']);
    
    if (currentAdmin.rows.length > 0) {
      console.log('✅ Found admin user with SIGLA email');
      
      console.log('2. Updating email to PULSE...');
      const updateResult = await client.query(
        'UPDATE "user" SET email = $1 WHERE email = $2 RETURNING id, email, "firstName", "lastName"',
        ['admin@pulse.com', 'admin@sigla.com']
      );
      
      if (updateResult.rows.length > 0) {
        console.log('✅ Successfully updated admin email:');
        console.log(`   Old: admin@sigla.com`);
        console.log(`   New: ${updateResult.rows[0].email}`);
        console.log(`   User: ${updateResult.rows[0].firstName} ${updateResult.rows[0].lastName}`);
      }
    } else {
      console.log('ℹ️  No admin user found with SIGLA email, checking for PULSE email...');
      
      const pulseAdmin = await client.query('SELECT * FROM "user" WHERE email = $1', ['admin@pulse.com']);
      if (pulseAdmin.rows.length > 0) {
        console.log('✅ Admin user already has PULSE email');
      } else {
        console.log('❌ No admin user found with either email');
      }
    }
    
    console.log('\n3. Updating other SIGLA email addresses...');
    
    // Update other users with sigla.com emails
    const otherUsers = await client.query('SELECT * FROM "user" WHERE email LIKE $1', ['%@sigla.com']);
    
    for (const user of otherUsers.rows) {
      const newEmail = user.email.replace('@sigla.com', '@pulse.com');
      await client.query(
        'UPDATE "user" SET email = $1 WHERE id = $2',
        [newEmail, user.id]
      );
      console.log(`   Updated: ${user.email} → ${newEmail}`);
    }
    
    console.log('\n✅ Email update complete!');
    console.log('\n📋 New login credentials:');
    console.log('   Email: admin@pulse.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

updateAdminEmail();