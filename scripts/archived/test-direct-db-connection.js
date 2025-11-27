// Test direct database connection without Prisma
require('dotenv').config({ path: '.env.local' });
console.log('🔍 Testing Direct Database Connection (bypassing Prisma)\n');

async function testDirectConnection() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL not found');
    return;
  }
  
  console.log('Database URL:', dbUrl.replace(/:[^:@]*@/, ':****@'));
  
  try {
    // Try to install pg if not available
    let pg;
    try {
      pg = require('pg');
    } catch (e) {
      console.log('📦 Installing pg package...');
      const { execSync } = require('child_process');
      execSync('npm install pg', { stdio: 'inherit' });
      pg = require('pg');
    }
    
    const { Client } = pg;
    const client = new Client({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('🔌 Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Query successful:', result.rows[0].version.substring(0, 50) + '...');
    
    // Test if we can create a simple table
    console.log('🧪 Testing table creation...');
    try {
      await client.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)');
      console.log('✅ Table creation successful');
      
      // Clean up
      await client.query('DROP TABLE IF EXISTS test_table');
      console.log('✅ Table cleanup successful');
    } catch (error) {
      console.log('❌ Table creation failed:', error.message);
    }
    
    await client.end();
    console.log('✅ Connection closed');
    
    console.log('\n🎉 DIRECT CONNECTION SUCCESSFUL!');
    console.log('✅ Database is ready and working');
    console.log('✅ The issue is likely with Prisma, not Supabase');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Try: npx prisma generate --force');
    console.log('2. Try: npx prisma db push --force-reset');
    console.log('3. Check Prisma version compatibility');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 DNS resolution failed - check hostname');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Connection refused - database not ready yet');
    } else if (error.message.includes('authentication')) {
      console.log('💡 Authentication failed - check password');
    } else {
      console.log('💡 Unknown error - database might still be initializing');
    }
  }
}

testDirectConnection();