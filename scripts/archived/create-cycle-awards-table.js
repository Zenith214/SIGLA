const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCycleAwardsTable() {
  try {
    console.log('🚀 Creating cycle_awards table...');
    
    // Execute the raw SQL to create the table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS cycle_awards (
        id SERIAL PRIMARY KEY,
        barangay_id INTEGER NOT NULL,
        cycle_id INTEGER NOT NULL,
        is_awardee BOOLEAN NOT NULL DEFAULT false,
        awarded_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        
        CONSTRAINT fk_cycle_awards_barangay 
          FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id) ON DELETE CASCADE,
        CONSTRAINT fk_cycle_awards_cycle 
          FOREIGN KEY (cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
        CONSTRAINT fk_cycle_awards_user 
          FOREIGN KEY (created_by) REFERENCES "user"(id) ON DELETE SET NULL,
        CONSTRAINT uk_cycle_awards_barangay_cycle UNIQUE(barangay_id, cycle_id)
      )
    `;
    
    console.log('✅ cycle_awards table created successfully');
    
    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_cycle_awards_cycle ON cycle_awards(cycle_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_cycle_awards_barangay ON cycle_awards(barangay_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_cycle_awards_status ON cycle_awards(is_awardee)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_cycle_awards_created_at ON cycle_awards(created_at)`;
    
    console.log('✅ Indexes created successfully');
    
    // Create update trigger function
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_cycle_awards_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    
    // Drop existing trigger if it exists
    await prisma.$executeRaw`DROP TRIGGER IF EXISTS trigger_cycle_awards_updated_at ON cycle_awards`;
    
    // Create trigger
    await prisma.$executeRaw`
      CREATE TRIGGER trigger_cycle_awards_updated_at
        BEFORE UPDATE ON cycle_awards
        FOR EACH ROW
        EXECUTE FUNCTION update_cycle_awards_updated_at()
    `;
    
    console.log('✅ Update trigger created successfully');
    
    // Test the table by checking if it exists
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'cycle_awards'
    `;
    
    if (result.length > 0) {
      console.log('✅ Table verification successful');
    } else {
      console.log('⚠️  Table verification failed');
    }
    
    // Check for existing barangays with seals to migrate
    const barangaysWithSeals = await prisma.barangay.findMany({
      where: { seal: 'yes' },
      select: { barangay_id: true, barangay_name: true }
    });
    
    if (barangaysWithSeals.length > 0) {
      console.log(`📊 Found ${barangaysWithSeals.length} barangays with existing seals:`);
      barangaysWithSeals.forEach(b => {
        console.log(`  - ${b.barangay_name} (ID: ${b.barangay_id})`);
      });
      console.log('💡 These can be migrated to cycle-specific awards in the next step');
    } else {
      console.log('✅ No existing seal data found to migrate');
    }
    
    console.log('🎉 Cycle awards table setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating cycle_awards table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
createCycleAwardsTable();