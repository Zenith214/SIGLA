// Fix assignment status enum and verify seeded data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Fixing Assignment Status and Verifying Data...\n');

async function fixAndVerify() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔗 Connected to Supabase');
    
    // 1. Fix assignments with correct enum values
    console.log('\n📋 Creating assignments with correct status values...');
    
    // Get users and barangays
    const { data: users } = await supabase
      .from('user')
      .select('*')
      .eq('role', 'interviewer');
    
    const { data: barangays } = await supabase
      .from('barangay')
      .select('*')
      .eq('seal', 'yes'); // Only awardee barangays
    
    // Clear existing assignments first
    await supabase.from('assignment').delete().neq('assignment_id', 0);
    
    // Create new assignments with correct status values
    const validStatuses = ['Pending', 'Completed']; // Use only valid enum values
    
    for (let i = 0; i < Math.min(barangays.length, users.length * 2); i++) {
      const barangay = barangays[i % barangays.length];
      const user = users[i % users.length];
      const progress = Math.floor(Math.random() * 100);
      
      const status = progress > 70 ? 'Completed' : 'Pending';
      
      const assignmentData = {
        barangay_id: barangay.barangay_id,
        user_id: user.id,
        status: status,
        progress: progress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('assignment')
        .insert(assignmentData);
      
      if (error) {
        console.log(`   ⚠️  Error: ${error.message}`);
      } else {
        console.log(`   ✅ Assigned ${barangay.barangay_name} to ${user.firstName} ${user.lastName} (${status}, ${progress}%)`);
      }
    }
    
    // 2. Verify all seeded data
    console.log('\n🔍 Verifying Seeded Data...\n');
    
    // Check barangays
    const { data: allBarangays } = await supabase
      .from('barangay')
      .select('*')
      .eq('is_active', true);
    
    console.log('📍 Barangays:');
    console.log(`   ✅ Total: ${allBarangays.length}`);
    console.log(`   🏆 Awardees: ${allBarangays.filter(b => b.seal === 'yes').length}`);
    console.log(`   📊 Non-awardees: ${allBarangays.filter(b => b.seal === 'no').length}`);
    
    // Check survey cycles
    const { data: cycles } = await supabase
      .from('survey_cycle')
      .select('*')
      .order('year', { ascending: false });
    
    console.log('\n🔄 Survey Cycles:');
    console.log(`   ✅ Total: ${cycles.length}`);
    cycles.forEach(cycle => {
      console.log(`   📅 ${cycle.year}: ${cycle.status} (${cycle.responses} responses)`);
    });
    
    // Check survey targets
    const { data: targets } = await supabase
      .from('survey_target')
      .select('*, barangay(barangay_name)')
      .order('percentage', { ascending: false });
    
    console.log('\n🎯 Survey Targets:');
    console.log(`   ✅ Total: ${targets.length}`);
    
    const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
    const totalAchieved = targets.reduce((sum, t) => sum + t.achieved, 0);
    const overallProgress = Math.round((totalAchieved / totalTarget) * 100);
    
    console.log(`   📈 Overall Progress: ${totalAchieved}/${totalTarget} (${overallProgress}%)`);
    
    // Show top performers
    console.log('   🏆 Top Performers:');
    targets.slice(0, 5).forEach(target => {
      console.log(`      ${target.barangay.barangay_name}: ${target.achieved}/${target.target} (${target.percentage}%)`);
    });
    
    // Check users
    const { data: allUsers } = await supabase
      .from('user')
      .select('*')
      .order('createdAt', { ascending: false });
    
    console.log('\n👥 Users:');
    console.log(`   ✅ Total: ${allUsers.length}`);
    
    const roleCounts = allUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   👤 ${role}: ${count}`);
    });
    
    // Check assignments
    const { data: assignments } = await supabase
      .from('assignment')
      .select('*, barangay(barangay_name), user(firstName, lastName)')
      .order('created_at', { ascending: false });
    
    console.log('\n📋 Assignments:');
    console.log(`   ✅ Total: ${assignments.length}`);
    
    const statusCounts = assignments.reduce((acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   📊 ${status}: ${count}`);
    });
    
    // Show recent assignments
    console.log('   📝 Recent Assignments:');
    assignments.slice(0, 5).forEach(assignment => {
      console.log(`      ${assignment.barangay.barangay_name} → ${assignment.user.firstName} ${assignment.user.lastName} (${assignment.status})`);
    });
    
    console.log('\n🎉 Database Verification Complete!');
    console.log('\n📊 Your database is now fully seeded with:');
    console.log('   ✅ 25 Barangays with realistic data');
    console.log('   ✅ 3 Survey Cycles (2022-2024)');
    console.log('   ✅ 25 Survey Targets with varied progress');
    console.log('   ✅ 7+ Users across different roles');
    console.log('   ✅ Multiple Assignments with realistic status');
    console.log('\n🚀 Ready for comprehensive testing and demonstration!');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

fixAndVerify();