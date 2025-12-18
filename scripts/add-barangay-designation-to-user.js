/**
 * Migration Script: Add barangayDesignation column to User table
 * 
 * This script adds a nullable barangayDesignation column to the user table
 * for officers to be designated to specific barangays.
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addBarangayDesignationColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Add barangayDesignation column to user table...');
    
    // Check if column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name = 'barangayDesignation'
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✓ Column barangayDesignation already exists. Skipping migration.');
      return;
    }
    
    // Add the column
    const alterQuery = `
      ALTER TABLE "user" 
      ADD COLUMN "barangayDesignation" INTEGER NULL
    `;
    
    await client.query(alterQuery);
    console.log('✓ Added barangayDesignation column to user table');
    
    // Add foreign key constraint
    const fkQuery = `
      ALTER TABLE "user"
      ADD CONSTRAINT fk_user_barangay_designation
      FOREIGN KEY ("barangayDesignation")
      REFERENCES barangay(barangay_id)
      ON DELETE SET NULL
    `;
    
    await client.query(fkQuery);
    console.log('✓ Added foreign key constraint to barangay table');
    
    // Add index for better query performance
    const indexQuery = `
      CREATE INDEX idx_user_barangay_designation 
      ON "user"("barangayDesignation")
    `;
    
    await client.query(indexQuery);
    console.log('✓ Added index on barangayDesignation column');
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
addBarangayDesignationColumn()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
