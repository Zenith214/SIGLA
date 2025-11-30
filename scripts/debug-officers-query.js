/**
 * Debug script to check officer query
 */
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function debugOfficersQuery() {
  let client;
  try {
    client = await pool.connect();
    
    console.log('🔍 Checking officers in database...\n');
    
    // Check all users with role officer
    const allOfficersQuery = `
      SELECT 
        id,
        "firstName",
        "lastName",
        email,
        role,
        status,
        "barangayDesignation"
      FROM "user"
      WHERE role = 'officer'
      ORDER BY id
    `;
    
    const allOfficers = await client.query(allOfficersQuery);
    console.log('📋 All officers in system:');
    console.log(allOfficers.rows);
    console.log('');
    
    // Check officers with designation
    const officersWithDesignationQuery = `
      SELECT 
        id,
        "firstName",
        "lastName",
        email,
        role,
        status,
        "barangayDesignation"
      FROM "user"
      WHERE role = 'officer' 
        AND "barangayDesignation" IS NOT NULL
      ORDER BY id
    `;
    
    const officersWithDesignation = await client.query(officersWithDesignationQuery);
    console.log('📋 Officers with barangay designation:');
    console.log(officersWithDesignation.rows);
    console.log('');
    
    // Check active officers with designation
    const activeOfficersQuery = `
      SELECT 
        id,
        "firstName",
        "lastName",
        email,
        role,
        status,
        "barangayDesignation"
      FROM "user"
      WHERE role = 'officer' 
        AND "barangayDesignation" IS NOT NULL
        AND LOWER(status) = 'active'
      ORDER BY id
    `;
    
    const activeOfficers = await client.query(activeOfficersQuery);
    console.log('📋 Active officers with barangay designation:');
    console.log(activeOfficers.rows);
    console.log('');
    
    // Check the exact query used in the API
    const apiQuery = `
      SELECT 
        "barangayDesignation",
        "firstName",
        "lastName",
        email
      FROM "user"
      WHERE role = 'officer' 
        AND "barangayDesignation" IS NOT NULL
        AND LOWER(status) = 'active'
      ORDER BY "firstName", "lastName"
    `;
    
    const apiResult = await client.query(apiQuery);
    console.log('📋 API Query Result:');
    console.log(apiResult.rows);
    console.log('');
    
    console.log('✅ Debug complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

debugOfficersQuery();
