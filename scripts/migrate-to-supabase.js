const { PrismaClient } = require('@prisma/client');

async function migrateToSupabase() {
  console.log('🚀 Starting Supabase migration...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test connection
    console.log('📡 Testing Supabase connection...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully!');

    // Check if tables exist
    console.log('🔍 Checking existing tables...');
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('📋 Existing tables:', result);

    // Run Prisma migrations
    console.log('🔄 Running Prisma migrations...');
    const { execSync } = require('child_process');
    
    try {
      // Generate Prisma client
      console.log('📦 Generating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      
      // Push schema to database
      console.log('📤 Pushing schema to Supabase...');
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      
      console.log('✅ Schema migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      throw error;
    }

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const finalResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('📋 Final tables:', finalResult);
    console.log(`✅ Migration complete! Created ${finalResult.length} tables.`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateToSupabase()
    .then(() => {
      console.log('🎉 Supabase migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToSupabase };