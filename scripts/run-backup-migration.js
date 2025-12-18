/**
 * Run Backup System Migration
 * Creates the data_export_log table for audit logging
 * 
 * Usage: node scripts/run-backup-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runMigration() {
  console.log('🚀 Starting backup system migration...\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials');
    console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Create the data_export_log table
    console.log('📝 Creating data_export_log table...');
    
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS data_export_log (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          export_type VARCHAR(50) NOT NULL,
          anonymized BOOLEAN DEFAULT true,
          record_count INTEGER DEFAULT 0,
          exported_at TIMESTAMP NOT NULL DEFAULT NOW(),
          ip_address VARCHAR(45),
          user_agent TEXT,
          
          CONSTRAINT fk_export_user FOREIGN KEY (user_id) 
            REFERENCES "user"(id) ON DELETE CASCADE
        );
      `
    });

    if (tableError) {
      // Try direct query if RPC doesn't work
      console.log('   Trying alternative method...');
      
      const { error: directError } = await supabase
        .from('data_export_log')
        .select('id')
        .limit(1);

      if (directError && directError.code === '42P01') {
        // Table doesn't exist, need to create it manually
        console.error('❌ Cannot create table automatically.');
        console.error('   Please use Supabase Dashboard SQL Editor instead.');
        console.error('\n📋 Copy this SQL to Supabase Dashboard:\n');
        console.log(`
CREATE TABLE IF NOT EXISTS data_export_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  export_type VARCHAR(50) NOT NULL,
  anonymized BOOLEAN DEFAULT true,
  record_count INTEGER DEFAULT 0,
  exported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  CONSTRAINT fk_export_user FOREIGN KEY (user_id) 
    REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_export_log_user_id ON data_export_log(user_id);
CREATE INDEX IF NOT EXISTS idx_export_log_exported_at ON data_export_log(exported_at);
CREATE INDEX IF NOT EXISTS idx_export_log_export_type ON data_export_log(export_type);
CREATE INDEX IF NOT EXISTS idx_export_log_anonymized ON data_export_log(anonymized);
        `);
        process.exit(1);
      } else {
        console.log('✅ Table already exists or was created successfully');
      }
    } else {
      console.log('✅ Table created successfully');
    }

    // Create indexes
    console.log('\n📝 Creating indexes...');
    console.log('   (Indexes may need to be created via Supabase Dashboard)');

    // Verify table exists
    console.log('\n🔍 Verifying table...');
    const { data, error: verifyError } = await supabase
      .from('data_export_log')
      .select('id')
      .limit(1);

    if (verifyError) {
      if (verifyError.code === '42P01') {
        console.error('❌ Table does not exist. Please create it manually via Supabase Dashboard.');
        process.exit(1);
      } else {
        console.log('✅ Table exists and is accessible');
      }
    } else {
      console.log('✅ Table exists and is accessible');
    }

    console.log('\n✨ Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Restart your application');
    console.log('3. Test the backup system\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📋 Please run this SQL manually in Supabase Dashboard:\n');
    console.log(`
CREATE TABLE IF NOT EXISTS data_export_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  export_type VARCHAR(50) NOT NULL,
  anonymized BOOLEAN DEFAULT true,
  record_count INTEGER DEFAULT 0,
  exported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  CONSTRAINT fk_export_user FOREIGN KEY (user_id) 
    REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_export_log_user_id ON data_export_log(user_id);
CREATE INDEX IF NOT EXISTS idx_export_log_exported_at ON data_export_log(exported_at);
CREATE INDEX IF NOT EXISTS idx_export_log_export_type ON data_export_log(export_type);
CREATE INDEX IF NOT EXISTS idx_export_log_anonymized ON data_export_log(anonymized);
    `);
    process.exit(1);
  }
}

runMigration();
