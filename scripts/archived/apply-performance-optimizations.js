/**
 * Apply Performance Optimizations
 * 
 * This script applies database indexes and creates materialized views
 * to improve analytics dashboard query performance.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filePath) {
  console.log(`\n📄 Reading SQL file: ${filePath}`);
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolons but keep them for individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
      continue;
    }

    // Extract statement type for logging
    const statementType = statement.split(/\s+/)[0].toUpperCase();
    const statementPreview = statement.substring(0, 80).replace(/\n/g, ' ');

    try {
      console.log(`⏳ [${i + 1}/${statements.length}] Executing ${statementType}...`);
      console.log(`   ${statementPreview}${statement.length > 80 ? '...' : ''}`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });

      if (error) {
        // Some errors are expected (e.g., "index already exists")
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Already exists, skipping`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ Exception: ${err.message}`);
      errorCount++;
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${statements.length}`);

  return { successCount, errorCount };
}

async function checkIndexes() {
  console.log('\n🔍 Checking existing indexes...\n');

  const { data, error } = await supabase
    .from('pg_indexes')
    .select('tablename, indexname')
    .in('tablename', ['ml_cache', 'cycle_award', 'survey_cycle', 'survey_response', 'barangay'])
    .order('tablename');

  if (error) {
    console.error('❌ Error checking indexes:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('📋 Existing indexes:');
    const grouped = data.reduce((acc, row) => {
      if (!acc[row.tablename]) {
        acc[row.tablename] = [];
      }
      acc[row.tablename].push(row.indexname);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([table, indexes]) => {
      console.log(`\n   ${table}:`);
      indexes.forEach(index => {
        console.log(`      - ${index}`);
      });
    });
  } else {
    console.log('   No indexes found');
  }
}

async function checkMaterializedView() {
  console.log('\n🔍 Checking materialized view...\n');

  try {
    const { data, error } = await supabase
      .from('award_statistics')
      .select('count')
      .limit(1);

    if (error) {
      console.log('   ⚠️  Materialized view does not exist yet');
    } else {
      console.log('   ✅ Materialized view exists');
      
      // Get row count
      const { count } = await supabase
        .from('award_statistics')
        .select('*', { count: 'exact', head: true });

      console.log(`   📊 Contains ${count} rows`);
    }
  } catch (err) {
    console.log('   ⚠️  Materialized view does not exist yet');
  }
}

async function refreshMaterializedView() {
  console.log('\n🔄 Refreshing materialized view...\n');

  try {
    const { error } = await supabase.rpc('refresh_award_statistics');

    if (error) {
      console.error('   ❌ Error refreshing view:', error.message);
    } else {
      console.log('   ✅ Materialized view refreshed successfully');
    }
  } catch (err) {
    console.error('   ❌ Exception:', err.message);
  }
}

async function main() {
  console.log('🚀 Performance Optimization Script');
  console.log('===================================\n');

  // Check current state
  await checkIndexes();
  await checkMaterializedView();

  // Ask for confirmation
  console.log('\n⚠️  This script will create indexes and materialized views.');
  console.log('   This may take several minutes depending on data size.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Apply optimizations
  const sqlFilePath = path.join(__dirname, '..', 'database', 'performance-indexes.sql');
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ SQL file not found: ${sqlFilePath}`);
    process.exit(1);
  }

  const result = await executeSQLFile(sqlFilePath);

  // Refresh materialized view
  if (result.successCount > 0) {
    await refreshMaterializedView();
  }

  // Check final state
  console.log('\n📊 Final State:');
  await checkIndexes();
  await checkMaterializedView();

  console.log('\n✅ Performance optimization complete!');
  console.log('\n💡 Tips:');
  console.log('   - Run ANALYZE periodically to update query planner statistics');
  console.log('   - Refresh materialized view after award updates');
  console.log('   - Monitor index usage with pg_stat_user_indexes');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
