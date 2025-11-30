const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addBarangayDesignationColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding barangayDesignation column to user table...');
    
    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name = 'barangayDesignation'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ barangayDesignation column already exists');
      return;
    }
    
    // Add the column (nullable for non-officer roles)
    await client.query(`
      ALTER TABLE "user" 
      ADD COLUMN "barangayDesignation" INTEGER REFERENCES barangay(barangay_id) ON DELETE SET NULL
    `);
    
    console.log('✅ Successfully added barangayDesignation column');
    console.log('📝 Column type: INTEGER (foreign key to barangay table)');
    console.log('📝 Nullable: YES (for non-officer roles)');
    
  } catch (error) {
    console.error('❌ Error adding barangayDesignation column:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addBarangayDesignationColumn()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
