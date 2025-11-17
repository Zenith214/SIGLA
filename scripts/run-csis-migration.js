/**
 * Script to run the CSIS workflow migration
 * This creates the spots, questionnaires, and visits tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running CSIS Workflow Migration\n');
  console.log('=' .repeat(60));

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'csis-workflow-migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('\n📄 Migration file loaded');
    console.log('   File:', migrationPath);
    console.log('   Size:', migrationSQL.length, 'bytes');

    console.log('\n⚠️  IMPORTANT: This migration will create new tables and enums.');
    console.log('   Tables to be created: spots, questionnaires, visits');
    console.log('   Enums to be created: SpotStatus, QuestionnaireStatus, VisitOutcome');
    console.log('   Updates: survey_response table will get new columns');

    console.log('\n🔄 Executing migration...');
    
    // Note: Supabase JS client doesn't support raw SQL execution
    // Users need to run this via Supabase SQL Editor or psql
    console.log('\n⚠️  The Supabase JS client cannot execute raw SQL migrations.');
    console.log('   Please run the migration using one of these methods:\n');
    
    console.log('   Method 1: Supabase SQL Editor (Recommended)');
    console.log('   1. Open your Supabase project dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Copy the contents of: database/csis-workflow-migration.sql');
    console.log('   4. Paste and click "Run"\n');
    
    console.log('   Method 2: psql Command Line');
    console.log('   psql -h your-host -U your-user -d your-database -f database/csis-workflow-migration.sql\n');
    
    console.log('   Method 3: Prisma (Development Only)');
    console.log('   npx prisma db push\n');

    console.log('=' .repeat(60));
    console.log('\n📋 After running the migration, verify with:');
    console.log('   node scripts/verify-csis-migration.js');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n✅ Migration instructions provided');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
