const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables');
    return;
  }
  
  console.log('✅ DATABASE_URL found');
  console.log(`   URL: ${databaseUrl.substring(0, 20)}...`);
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  let client;
  try {
    console.log('\n1. Testing connection...');
    client = await pool.connect();
    console.log('✅ Database connection successful');
    
    console.log('\n2. Testing assignment table...');
    const assignmentQuery = 'SELECT COUNT(*) as count FROM assignment';
    const assignmentResult = await client.query(assignmentQuery);
    console.log(`✅ Assignment table accessible, ${assignmentResult.rows[0].count} records`);
    
    console.log('\n3. Testing assignment table structure...');
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'assignment'
      ORDER BY ordinal_position
    `;
    const structureResult = await client.query(structureQuery);
    console.log('✅ Assignment table structure:');
    structureResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\n4. Testing related tables...');
    
    // Test barangay table
    const barangayQuery = 'SELECT COUNT(*) as count FROM barangay WHERE is_active = true';
    const barangayResult = await client.query(barangayQuery);
    console.log(`✅ Barangay table: ${barangayResult.rows[0].count} active records`);
    
    // Test user table
    const userQuery = `SELECT COUNT(*) as count FROM "user" WHERE role = 'interviewer'`;
    const userResult = await client.query(userQuery);
    console.log(`✅ User table: ${userResult.rows[0].count} interviewer records`);
    
    console.log('\n5. Testing a sample assignment query...');
    const sampleQuery = `
      SELECT 
        a.assignment_id,
        a.barangay_id,
        a.user_id,
        a.status,
        a.progress,
        b.barangay_name,
        u."firstName",
        u."lastName"
      FROM assignment a
      LEFT JOIN barangay b ON a.barangay_id = b.barangay_id
      LEFT JOIN "user" u ON a.user_id = u.id
      LIMIT 1
    `;
    
    const sampleResult = await client.query(sampleQuery);
    if (sampleResult.rows.length > 0) {
      console.log('✅ Sample assignment query successful:');
      console.log('   Assignment:', sampleResult.rows[0]);
    } else {
      console.log('ℹ️  No assignments found in database');
    }
    
    console.log('\n6. Testing transaction support...');
    await client.query('BEGIN');
    await client.query('SELECT 1');
    await client.query('ROLLBACK');
    console.log('✅ Transaction support working');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\nError details:');
    console.log(`   Code: ${error.code}`);
    console.log(`   Detail: ${error.detail}`);
    console.log(`   Hint: ${error.hint}`);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testDatabaseConnection();