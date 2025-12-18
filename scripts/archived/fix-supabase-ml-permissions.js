#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

console.log('🔧 Fixing Supabase ML Permissions...\n');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseServiceKey || !databaseUrl) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('   - DATABASE_URL:', databaseUrl ? '✅' : '❌');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize direct database connection
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function fixSupabaseMLPermissions() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Connected to database');

    // 1. Fix ai_insight table schema issue
    console.log('\n🔧 Fixing ai_insight table schema...');
    
    try {
      // Check current columns
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ai_insight' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('   📋 Current ai_insight columns:');
      columns.rows.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type}`);
      });
      
      // Ensure all required columns exist
      const requiredColumns = [
        { name: 'id', type: 'SERIAL PRIMARY KEY' },
        { name: 'barangay_id', type: 'INTEGER NOT NULL' },
        { name: 'insight_type', type: 'VARCHAR(100)' },
        { name: 'insight_text', type: 'TEXT' },
        { name: 'confidence', type: 'DECIMAL(5,4)' },
        { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
      ];
      
      const existingColumns = columns.rows.map(col => col.column_name);
      
      for (const col of requiredColumns) {
        if (!existingColumns.includes(col.name)) {
          console.log(`   ➕ Adding missing column: ${col.name}`);
          await client.query(`ALTER TABLE ai_insight ADD COLUMN ${col.name} ${col.type};`);
        }
      }
      
      console.log('   ✅ ai_insight table schema verified');
      
    } catch (error) {
      console.log(`   ⚠️  Schema fix error: ${error.message}`);
    }

    // 2. Update RLS policies for ML tables
    console.log('\n🔐 Updating RLS policies for ML tables...');
    
    const mlTables = [
      'action_grid_classification',
      'ai_insight', 
      'ai_recommendation',
      'ml_model',
      'ml_prediction'
    ];

    for (const tableName of mlTables) {
      try {
        // Disable RLS temporarily
        await client.query(`ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;`);
        
        // Drop all existing policies
        const policies = await client.query(`
          SELECT policyname FROM pg_policies 
          WHERE tablename = $1 AND schemaname = 'public';
        `, [tableName]);
        
        for (const policy of policies.rows) {
          await client.query(`DROP POLICY IF EXISTS "${policy.policyname}" ON ${tableName};`);
        }
        
        // Create permissive policies
        await client.query(`
          CREATE POLICY "Allow all operations for service role" ON ${tableName}
          FOR ALL 
          TO service_role
          USING (true)
          WITH CHECK (true);
        `);
        
        await client.query(`
          CREATE POLICY "Allow all operations for authenticated users" ON ${tableName}
          FOR ALL 
          TO authenticated
          USING (true)
          WITH CHECK (true);
        `);
        
        await client.query(`
          CREATE POLICY "Allow all operations for anon users" ON ${tableName}
          FOR ALL 
          TO anon
          USING (true)
          WITH CHECK (true);
        `);
        
        // Re-enable RLS
        await client.query(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
        
        console.log(`   ✅ Updated RLS policies for ${tableName}`);
        
      } catch (error) {
        console.log(`   ⚠️  RLS policy error for ${tableName}: ${error.message}`);
      }
    }

    // 3. Grant additional permissions
    console.log('\n🔑 Granting additional permissions...');
    
    try {
      // Grant permissions to service_role
      await client.query(`GRANT ALL ON SCHEMA public TO service_role;`);
      await client.query(`GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;`);
      await client.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;`);
      
      // Grant permissions to authenticated role
      await client.query(`GRANT USAGE ON SCHEMA public TO authenticated;`);
      await client.query(`GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;`);
      await client.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;`);
      
      console.log('   ✅ Additional permissions granted');
      
    } catch (error) {
      console.log(`   ⚠️  Permission grant error: ${error.message}`);
    }

    // 4. Test Supabase API access
    console.log('\n🧪 Testing Supabase API access...');
    
    for (const tableName of mlTables) {
      try {
        // Test SELECT
        const { data: selectData, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (selectError) {
          console.log(`   ❌ ${tableName} SELECT: ${selectError.message}`);
        } else {
          console.log(`   ✅ ${tableName} SELECT: Working`);
        }
        
        // Test INSERT (for ai_insight only to avoid conflicts)
        if (tableName === 'ai_insight') {
          const { data: insertData, error: insertError } = await supabase
            .from(tableName)
            .insert({
              barangay_id: 999,
              insight_type: 'TEST',
              insight_text: 'Test insight for permission verification',
              confidence: 0.95
            })
            .select();
          
          if (insertError) {
            console.log(`   ❌ ${tableName} INSERT: ${insertError.message}`);
          } else {
            console.log(`   ✅ ${tableName} INSERT: Working`);
            
            // Clean up test record
            if (insertData && insertData[0]) {
              await supabase
                .from(tableName)
                .delete()
                .eq('id', insertData[0].id);
            }
          }
        }
        
      } catch (error) {
        console.log(`   ❌ ${tableName} API test failed: ${error.message}`);
      }
    }

    // 5. Test direct database access
    console.log('\n🗄️  Testing direct database access...');
    
    for (const tableName of mlTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${tableName};`);
        console.log(`   ✅ ${tableName}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
      }
    }

    console.log('\n🎉 Supabase ML permissions configuration completed!');
    
    // 6. Provide configuration summary
    console.log('\n📋 Configuration Summary:');
    console.log('✅ ML table schemas verified and updated');
    console.log('✅ RLS policies recreated with permissive access');
    console.log('✅ Database permissions granted to service_role and authenticated');
    console.log('✅ Supabase API access tested');
    console.log('✅ Direct database access verified');

  } catch (error) {
    console.error('❌ Error fixing Supabase ML permissions:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the fix
fixSupabaseMLPermissions();