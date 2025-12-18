const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addProfilePictureColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding profilePicture column to user table...');
    
    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name = 'profilePicture'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ profilePicture column already exists');
      return;
    }
    
    // Add the column
    await client.query(`
      ALTER TABLE "user" 
      ADD COLUMN "profilePicture" TEXT
    `);
    
    console.log('✅ Successfully added profilePicture column');
    console.log('📝 Column type: TEXT (for storing base64 images)');
    
  } catch (error) {
    console.error('❌ Error adding profilePicture column:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addProfilePictureColumn()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
