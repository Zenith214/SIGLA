/**
 * Database Truncate
 * Removes all data but keeps table structure
 */

import 'dotenv/config';
import { supabaseAdmin } from '../src/lib/supabase';

async function truncate() {
  console.log('\n🗑️  Truncating all tables...\n');
  console.log('⚠️  This will delete ALL data but keep table structure\n');

  try {
    // Truncate in reverse order of dependencies
    const tables = [
      'spots',           // Has assignments via assigned_fi_id
      'user',            // Referenced by spots
      'survey_cycles',   // Referenced by spots
      'barangays',       // Referenced by spots
      // Add other tables as needed
    ];

    for (const table of tables) {
      console.log(`Truncating ${table}...`);
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error) {
        console.warn(`⚠️  Warning truncating ${table}:`, error.message);
      } else {
        console.log(`✅ ${table} truncated`);
      }
    }

    console.log('\n🎉 Database Truncate Complete!\n');
    console.log('💡 Table structure preserved, all data removed\n');
  } catch (error) {
    console.error('\n💥 Database Truncate Failed:', error);
    process.exit(1);
  }
}

truncate();
