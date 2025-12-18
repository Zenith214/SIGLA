const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkProfilePicture() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking profile picture for user ID 6...\n');
    
    const result = await client.query(`
      SELECT 
        id, 
        email, 
        "firstName", 
        "lastName",
        CASE 
          WHEN "profilePicture" IS NULL THEN 'NULL'
          WHEN "profilePicture" = '' THEN 'EMPTY STRING'
          ELSE 'HAS DATA (' || LENGTH("profilePicture") || ' chars)'
        END as profile_picture_status,
        LEFT("profilePicture", 50) as picture_preview
      FROM "user" 
      WHERE id = 6
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User Info:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.firstName, user.lastName);
    console.log('  Profile Picture:', user.profile_picture_status);
    if (user.picture_preview) {
      console.log('  Preview:', user.picture_preview + '...');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkProfilePicture();
