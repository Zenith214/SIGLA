const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSurveyCycles() {
  try {
    const { data, error } = await supabase
      .from('survey_cycle')
      .select('cycle_id, name, year, is_active')
      .order('cycle_id');
    
    if (error) {
      console.error('Error fetching survey cycles:', error.message);
      return;
    }
    
    console.log('Survey Cycles in Database:');
    console.log('===========================');
    
    if (!data || data.length === 0) {
      console.log('No survey cycles found!');
    } else {
      data.forEach(row => {
        console.log(`ID: ${row.cycle_id}, Name: ${row.name}, Year: ${row.year}, Active: ${row.is_active}`);
      });
    }
    
    const { data: activeData, error: activeError } = await supabase
      .from('survey_cycle')
      .select('cycle_id, name')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (activeError && activeError.code !== 'PGRST116') {
      console.error('\nError fetching active cycle:', activeError.message);
    } else if (activeData) {
      console.log('\nActive Cycle:');
      console.log(`  ID: ${activeData.cycle_id}, Name: ${activeData.name}`);
    } else {
      console.log('\nNo active cycle found!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSurveyCycles();
