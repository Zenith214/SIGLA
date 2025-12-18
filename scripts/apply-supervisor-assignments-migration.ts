import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('🚀 Starting Supervisor Assignments Migration...\n')

    // Execute the migration SQL directly
    console.log('⏳ Creating supervisor_assignments table...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS supervisor_assignments (
        id SERIAL PRIMARY KEY,
        supervisor_id INTEGER NOT NULL,
        barangay_id INTEGER NOT NULL,
        cycle_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'Active',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_supervisor FOREIGN KEY (supervisor_id) 
          REFERENCES "user"(id) ON DELETE CASCADE,
        CONSTRAINT fk_barangay FOREIGN KEY (barangay_id) 
          REFERENCES barangay(barangay_id) ON DELETE CASCADE,
        CONSTRAINT fk_cycle FOREIGN KEY (cycle_id) 
          REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
        
        CONSTRAINT unique_supervisor_barangay_cycle 
          UNIQUE (supervisor_id, barangay_id, cycle_id)
      )
    `)
    console.log('✅ Table created successfully\n')

    // Create indexes
    console.log('⏳ Creating indexes...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_supervisor 
      ON supervisor_assignments(supervisor_id)
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_barangay 
      ON supervisor_assignments(barangay_id)
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_cycle 
      ON supervisor_assignments(cycle_id)
    `)
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_supervisor_assignments_status 
      ON supervisor_assignments(status)
    `)
    console.log('✅ Indexes created successfully\n')

    // Create trigger function
    console.log('⏳ Creating trigger function...')
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_supervisor_assignments_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)
    console.log('✅ Trigger function created successfully\n')

    // Create trigger
    console.log('⏳ Creating trigger...')
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS trigger_supervisor_assignments_updated_at ON supervisor_assignments
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER trigger_supervisor_assignments_updated_at
        BEFORE UPDATE ON supervisor_assignments
        FOR EACH ROW
        EXECUTE FUNCTION update_supervisor_assignments_updated_at()
    `)
    console.log('✅ Trigger created successfully\n')

    // Verify the table was created
    console.log('🔍 Verifying table creation...')
    const result = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'supervisor_assignments'
    `)
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('✅ Table "supervisor_assignments" created successfully!\n')
    } else {
      throw new Error('Table verification failed')
    }

    // Check indexes
    console.log('🔍 Verifying indexes...')
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'supervisor_assignments'
    `) as any[]
    
    console.log(`✅ Found ${indexes.length} indexes:`)
    indexes.forEach((idx: any) => {
      console.log(`   - ${idx.indexname}`)
    })
    console.log('')

    // Check trigger
    console.log('🔍 Verifying trigger...')
    const triggers = await prisma.$queryRawUnsafe(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_table = 'supervisor_assignments'
    `) as any[]
    
    if (triggers.length > 0) {
      console.log(`✅ Found ${triggers.length} trigger(s):`)
      triggers.forEach((trg: any) => {
        console.log(`   - ${trg.trigger_name}`)
      })
      console.log('')
    }

    console.log('🎉 Migration completed successfully!')
    console.log('\n📋 Next Steps:')
    console.log('   1. Restart your development server')
    console.log('   2. Navigate to Settings → Supervisor Assignments')
    console.log('   3. Create your first assignment\n')

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   - Check your database connection in .env')
    console.error('   - Ensure you have CREATE TABLE permissions')
    console.error('   - Review the error message above\n')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
applyMigration()
