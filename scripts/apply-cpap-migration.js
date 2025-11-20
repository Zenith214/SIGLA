const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function applyCPAPMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Starting CPAP Module Migration...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20251119081816_add_cpap_module_and_rename_viewer_to_officer', 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded\n');
    
    // Remove comments and split into statements
    const cleanSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');
      console.log(`Executing statement ${i + 1}/${statements.length}: ${preview}...`);
      
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
      } catch (error) {
        // Check if error is because object already exists
        if (error.message.includes('already exists') || error.code === '42P07' || error.code === '42710') {
          console.log(`⚠️  Statement ${i + 1} skipped (object already exists)\n`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error(`   Code: ${error.code}`);
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration applied successfully!');
    console.log('\nVerifying migration...\n');
    
    // Verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('cpaps', 'cpap_items')
    `;
    
    console.log('✅ Tables created:', tables.map(t => t.table_name).join(', '));
    
    // Verify enum exists
    const enums = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'CPAPStatus'
      )
    `;
    
    console.log('✅ CPAPStatus enum values:', enums.map(e => e.enumlabel).join(', '));
    
    // Verify role default
    const roleDefault = await prisma.$queryRaw`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user' 
      AND column_name = 'role'
    `;
    
    console.log('✅ User role default:', roleDefault[0]?.column_default);
    
    // Check role distribution
    const roleCounts = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count 
      FROM "user" 
      GROUP BY role
    `;
    
    console.log('✅ User role distribution:');
    roleCounts.forEach(r => {
      console.log(`   - ${r.role}: ${r.count}`);
    });
    
    console.log('\n🎉 CPAP Module Migration Complete!\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease check the error and try again.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyCPAPMigration();
