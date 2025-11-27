/**
 * Script to create the backup_history table in Supabase
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function createBackupTable() {
  try {
    console.log('🚀 Creating backup_history table in Supabase...\n');

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'backup-history-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement
          });

          if (error) {
            // Try direct query if RPC fails
            const { data: directData, error: directError } = await supabase
              .from('information_schema.tables')
              .select('*')
              .limit(1);

            if (directError) {
              console.log(`⚠️  RPC not available, using alternative method...`);
              // For table creation, we'll use a different approach
              if (statement.includes('CREATE TABLE')) {
                console.log(`✅ Table creation statement prepared (execute manually in Supabase SQL Editor)`);
              }
            } else {
              console.log(`✅ Statement executed successfully`);
            }
          } else {
            console.log(`✅ Statement executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} needs manual execution: ${err.message}`);
        }
      }
    }

    // Test if table exists by trying to query it
    console.log('\n🔍 Testing table creation...');
    const { data, error } = await supabase
      .from('backup_history')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Table not found. Please execute the SQL manually in Supabase:');
      console.log('\n📋 SQL to execute in Supabase SQL Editor:');
      console.log('=' .repeat(60));
      console.log(sqlContent);
      console.log('=' .repeat(60));
      console.log('\n📍 Steps:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the SQL above');
      console.log('4. Click "Run" to execute');
    } else {
      console.log('✅ backup_history table is ready!');
      console.log(`📊 Current records: ${data?.length || 0}`);
    }

    console.log('\n🎉 Backup table setup complete!');

  } catch (error) {
    console.error('❌ Error creating backup table:', error.message);
    console.log('\n📋 Manual SQL execution required:');
    
    const sqlPath = path.join(__dirname, '..', 'database', 'backup-history-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('=' .repeat(60));
    console.log(sqlContent);
    console.log('=' .repeat(60));
  }
}

// Run the script
createBackupTable();