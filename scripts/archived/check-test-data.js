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

async function checkTestData() {
  try {
    // Check active cycle
    const { data: cycleData } = await supabase
      .from('survey_cycle')
      .select('cycle_id, name')
      .eq('is_active', true)
      .single();
    
    console.log('Active Survey Cycle:');
    console.log(`  ID: ${cycleData?.cycle_id}, Name: ${cycleData?.name}\n`);
    
    // Check barangays
    const { data: barangayData } = await supabase
      .from('barangay')
      .select('barangay_id, barangay_name')
      .limit(5);
    
    console.log('Sample Barangays:');
    barangayData?.forEach(b => {
      console.log(`  ID: ${b.barangay_id}, Name: ${b.barangay_name}`);
    });
    console.log('');
    
    // Check users with Interviewer role
    const { data: userData } = await supabase
      .from('user')
      .select('id, email, firstName, lastName, role')
      .eq('role', 'Interviewer')
      .limit(5);
    
    console.log('Sample Interviewers:');
    if (userData && userData.length > 0) {
      userData.forEach(u => {
        console.log(`  ID: ${u.id}, Name: ${u.firstName} ${u.lastName}, Email: ${u.email}`);
      });
    } else {
      console.log('  No interviewers found!');
      
      // Check all users
      const { data: allUsers } = await supabase
        .from('user')
        .select('id, email, firstName, lastName, role')
        .limit(5);
      
      console.log('\n  Available users (any role):');
      if (allUsers && allUsers.length > 0) {
        allUsers.forEach(u => {
          console.log(`    ID: ${u.id}, Role: ${u.role}, Name: ${u.firstName} ${u.lastName}`);
        });
      } else {
        console.log('    No users found at all!');
      }
    }
    console.log('');
    
    // Suggest test configuration
    if (cycleData && barangayData && barangayData.length > 0 && userData && userData.length > 0) {
      console.log('Suggested Test Configuration:');
      console.log('=============================');
      console.log(`const TEST_CYCLE_ID = ${cycleData.cycle_id};`);
      console.log(`const TEST_BARANGAY_ID = ${barangayData[0].barangay_id};`);
      console.log(`const TEST_FI_ID = ${userData[0].id};`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTestData();
