/**
 * Apply performance optimization indexes to the database
 * This script adds composite indexes for frequently queried field combinations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyIndexes() {
  console.log('🚀 Starting performance optimization...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'performance-optimization-indexes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Loaded SQL file:', sqlPath);
    console.log('📊 Applying performance indexes...\n');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      // Extract index name for logging
      const indexMatch = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i);
      const indexName = indexMatch ? indexMatch[1] : 'unknown';

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

        if (error) {
          // Check if index already exists
          if (error.message && error.message.includes('already exists')) {
            console.log(`⏭️  Index ${indexName} already exists, skipping`);
            skipCount++;
          } else {
            console.error(`❌ Error creating ${indexName}:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Created index: ${indexName}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error executing statement for ${indexName}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n✨ Performance optimization completed successfully!');
    } else {
      console.log('\n⚠️  Performance optimization completed with some errors');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
applyIndexes()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
