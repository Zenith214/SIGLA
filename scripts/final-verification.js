/**
 * Final Verification - Check all sections have been migrated
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('========================================');
    console.log('FINAL MIGRATION VERIFICATION');
    console.log('========================================\n');

    // Check all section types
    const sections = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
    
    for (const sectionKey of sections) {
      console.log(`\n📊 Checking ${sectionKey} section...`);
      
      const result = await client.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN data ? 'need_for_action_binary_projects' 
                          OR data ? 'need_for_action_binary_disaster_info'
                          OR data ? 'need_for_action_binary_tanods'
                          OR data ? 'need_for_action_binary_health_services'
                          OR data ? 'need_for_action_binary_business_clearance'
                          OR data ? 'need_for_action_binary_waste_management'
                     THEN 1 END) as with_new_fields,
          COUNT(CASE WHEN data ? 'suggestionsProjects' 
                          OR data ? 'suggestionsDisasterInfo'
                          OR data ? 'suggestionsTanods'
                          OR data ? 'suggestionsHealthServices'
                          OR data ? 'suggestionsBusinessClearance'
                          OR data ? 'suggestionsWasteManagement'
                     THEN 1 END) as with_old_fields
        FROM survey_section
        WHERE section_key = $1
      `, [sectionKey]);

      const stats = result.rows[0];
      console.log(`   Total sections: ${stats.total}`);
      console.log(`   With new fields: ${stats.with_new_fields}`);
      console.log(`   With old fields: ${stats.with_old_fields}`);
      
      if (stats.total > 0) {
        if (stats.with_new_fields === stats.total && stats.with_old_fields === '0') {
          console.log(`   ✅ Migration successful!`);
        } else {
          console.log(`   ⚠️  Migration incomplete or not applicable`);
        }
      } else {
        console.log(`   ℹ️  No sections found`);
      }
    }

    // Check data type
    console.log(`\n\n📊 Checking data column type...`);
    const typeResult = await client.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'survey_section' AND column_name = 'data'
    `);
    
    const dataType = typeResult.rows[0].data_type;
    console.log(`   Data column type: ${dataType}`);
    if (dataType === 'jsonb') {
      console.log(`   ✅ Correctly converted to JSONB`);
    } else {
      console.log(`   ⚠️  Still ${dataType} (expected jsonb)`);
    }

    // Check indexes
    console.log(`\n\n📊 Checking indexes...`);
    const indexResult = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'survey_section'
        AND (indexname LIKE '%nfa%' OR indexname LIKE '%section_key%')
    `);
    
    console.log(`   Found ${indexResult.rows.length} NFA-related indexes:`);
    indexResult.rows.forEach(row => {
      console.log(`   - ${row.indexname}`);
    });

    console.log('\n\n========================================');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
