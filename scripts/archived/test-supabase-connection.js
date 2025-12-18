const { PrismaClient } = require('@prisma/client');

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test basic connection
    console.log('📡 Connecting to Supabase...');
    await prisma.$connect();
    console.log('✅ Connected successfully!');

    // Test database query
    console.log('🔍 Testing database query...');
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Database version:', result);

    // Check current schema
    console.log('🔍 Checking current schema...');
    const tables = await prisma.$queryRaw`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📋 Current tables:', tables);
    console.log(`📊 Total tables: ${tables.length}`);

    // Test environment variables
    console.log('🔧 Environment check:');
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

    return true;

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
if (require.main === module) {
  testSupabaseConnection()
    .then((success) => {
      if (success) {
        console.log('🎉 Supabase connection test passed!');
        process.exit(0);
      } else {
        console.log('💥 Supabase connection test failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Test error:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseConnection };