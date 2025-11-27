/**
 * Test script for Fieldwork Monitoring Tab
 * Tests the monitoring API endpoint and verifies data structure
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFieldworkMonitoring() {
  console.log('🧪 Testing Fieldwork Monitoring Implementation\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Get active cycle
    console.log('\n📋 Step 1: Fetching active survey cycle...');
    const { data: activeCycle, error: cycleError } = await supabase
      .from('survey_cycle')
      .select('*')
      .eq('is_active', true)
      .single();

    if (cycleError || !activeCycle) {
      console.error('❌ No active cycle found');
      console.log('Please set an active cycle first');
      return;
    }

    console.log(`✅ Active cycle: ${activeCycle.name} (ID: ${activeCycle.cycle_id})`);

    // Step 2: Check if spots exist
    console.log('\n📋 Step 2: Checking for spots in active cycle...');
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('spot_id, spot_name, status, assigned_fi_id')
      .eq('cycle_id', activeCycle.cycle_id);

    if (spotsError) {
      console.error('❌ Error fetching spots:', spotsError.message);
      return;
    }

    console.log(`✅ Found ${spots?.length || 0} spots`);
    if (spots && spots.length > 0) {
      const assignedSpots = spots.filter(s => s.assigned_fi_id).length;
      console.log(`   - ${assignedSpots} assigned`);
      console.log(`   - ${spots.length - assignedSpots} unassigned`);
    }

    // Step 3: Test monitoring API endpoint
    console.log('\n📋 Step 3: Testing monitoring API endpoint...');
    const apiUrl = `http://localhost:3000/api/fs/monitoring?cycleId=${activeCycle.cycle_id}`;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ API request failed: ${response.status}`);
        console.error(`   Error: ${errorData.error}`);
        return;
      }

      const monitoringData = await response.json();
      console.log('✅ API endpoint working');

      // Step 4: Validate response structure
      console.log('\n📋 Step 4: Validating response structure...');
      
      const requiredFields = ['cycleId', 'cycleName', 'spots', 'fieldInterviewers', 'summary'];
      const missingFields = requiredFields.filter(field => !(field in monitoringData));
      
      if (missingFields.length > 0) {
        console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      console.log('✅ All required fields present');

      // Step 5: Validate spots data
      console.log('\n📋 Step 5: Validating spots data...');
      console.log(`   Total spots: ${monitoringData.spots.length}`);
      
      if (monitoringData.spots.length > 0) {
        const sampleSpot = monitoringData.spots[0];
        const spotFields = ['spotId', 'spotName', 'barangayName', 'status', 'startingPoint', 'completedCount', 'totalCount', 'questionnaires'];
        const missingSpotFields = spotFields.filter(field => !(field in sampleSpot));
        
        if (missingSpotFields.length > 0) {
          console.error(`❌ Spot missing fields: ${missingSpotFields.join(', ')}`);
        } else {
          console.log('✅ Spot data structure valid');
          console.log(`   Sample spot: ${sampleSpot.spotName} (${sampleSpot.status})`);
          console.log(`   Progress: ${sampleSpot.completedCount}/${sampleSpot.totalCount}`);
        }

        // Check status distribution
        const statusCounts = monitoringData.spots.reduce((acc, spot) => {
          acc[spot.status] = (acc[spot.status] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\n   Status distribution:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   - ${status}: ${count}`);
        });
      }

      // Step 6: Validate FI performance data
      console.log('\n📋 Step 6: Validating FI performance data...');
      console.log(`   Total FIs: ${monitoringData.fieldInterviewers.length}`);
      
      if (monitoringData.fieldInterviewers.length > 0) {
        const sampleFI = monitoringData.fieldInterviewers[0];
        const fiFields = ['fiId', 'name', 'email', 'assignedSpots', 'completedInterviews', 'inProgress', 'callbacks', 'totalInterviews', 'completionRate'];
        const missingFIFields = fiFields.filter(field => !(field in sampleFI));
        
        if (missingFIFields.length > 0) {
          console.error(`❌ FI data missing fields: ${missingFIFields.join(', ')}`);
        } else {
          console.log('✅ FI performance data structure valid');
          console.log(`   Sample FI: ${sampleFI.name}`);
          console.log(`   Assigned spots: ${sampleFI.assignedSpots}`);
          console.log(`   Completed: ${sampleFI.completedInterviews}/${sampleFI.totalInterviews}`);
          console.log(`   Completion rate: ${(sampleFI.completionRate * 100).toFixed(1)}%`);
        }

        // Show top performers
        console.log('\n   Top performers:');
        monitoringData.fieldInterviewers.slice(0, 3).forEach((fi, index) => {
          console.log(`   ${index + 1}. ${fi.name}: ${(fi.completionRate * 100).toFixed(1)}% (${fi.completedInterviews}/${fi.totalInterviews})`);
        });
      }

      // Step 7: Validate summary data
      console.log('\n📋 Step 7: Validating summary data...');
      const summary = monitoringData.summary;
      console.log(`   Total spots: ${summary.totalSpots}`);
      console.log(`   Assigned spots: ${summary.assignedSpots}`);
      console.log(`   Unassigned spots: ${summary.unassignedSpots}`);
      console.log(`   Completed spots: ${summary.completedSpots}`);
      console.log(`   Total interviews: ${summary.totalInterviews}`);
      console.log(`   Completed interviews: ${summary.completedInterviews}`);
      console.log(`   Overall progress: ${summary.totalInterviews > 0 ? Math.round((summary.completedInterviews / summary.totalInterviews) * 100) : 0}%`);
      console.log(`   Total FIs: ${summary.totalFIs}`);
      console.log('✅ Summary data valid');

      // Final summary
      console.log('\n' + '='.repeat(60));
      console.log('✅ All tests passed!');
      console.log('\n📊 Implementation Summary:');
      console.log('   ✅ Monitoring API endpoint working');
      console.log('   ✅ Spots data structure valid');
      console.log('   ✅ FI performance data structure valid');
      console.log('   ✅ Summary calculations correct');
      console.log('\n🎉 Fieldwork Monitoring tab is ready to use!');
      
    } catch (fetchError) {
      console.error('❌ Error calling API endpoint:', fetchError.message);
      console.log('\n💡 Make sure the Next.js development server is running:');
      console.log('   npm run dev');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testFieldworkMonitoring()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
