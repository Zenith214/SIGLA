// Check current database status across all tables
require('dotenv').config({ path: '.env.local' });
console.log('🔍 Checking Current Database Status...\n');

async function checkDatabaseStatus() {
  try {
    const baseUrl = 'http://localhost:3000';
    
    // Check barangays
    console.log('1. 📍 Barangays Status:');
    const barangaysResponse = await fetch(`${baseUrl}/api/barangays/all`);
    if (barangaysResponse.ok) {
      const barangays = await barangaysResponse.json();
      console.log(`   ✅ Total barangays: ${barangays.length}`);
      console.log(`   🏆 Awardees: ${barangays.filter(b => b.seal === 'yes').length}`);
      console.log(`   📊 Non-awardees: ${barangays.filter(b => b.seal === 'no').length}`);
    } else {
      console.log('   ❌ Failed to fetch barangays');
    }
    
    // Check survey targets
    console.log('\n2. 🎯 Survey Targets Status:');
    const targetsResponse = await fetch(`${baseUrl}/api/survey-targets`);
    if (targetsResponse.ok) {
      const targets = await targetsResponse.json();
      console.log(`   ✅ Total survey targets: ${targets.length}`);
      if (targets.length > 0) {
        const totalTarget = targets.reduce((sum, t) => sum + (t.target || 0), 0);
        const totalAchieved = targets.reduce((sum, t) => sum + (t.achieved || 0), 0);
        console.log(`   📈 Total target: ${totalTarget}`);
        console.log(`   ✅ Total achieved: ${totalAchieved}`);
        console.log(`   📊 Overall progress: ${totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0}%`);
      }
    } else {
      console.log('   ❌ Failed to fetch survey targets');
    }
    
    // Check survey cycles
    console.log('\n3. 🔄 Survey Cycles Status:');
    const cyclesResponse = await fetch(`${baseUrl}/api/survey-cycles`);
    if (cyclesResponse.ok) {
      const cycles = await cyclesResponse.json();
      console.log(`   ✅ Total survey cycles: ${cycles.length}`);
      if (cycles.length > 0) {
        cycles.forEach(cycle => {
          console.log(`   📅 ${cycle.year}: ${cycle.status} (${cycle.responses || 0} responses)`);
        });
      }
    } else {
      console.log('   ❌ Failed to fetch survey cycles');
    }
    
    // Check assignments
    console.log('\n4. 📋 Assignments Status:');
    const assignmentsResponse = await fetch(`${baseUrl}/api/assignments`);
    if (assignmentsResponse.ok) {
      const assignments = await assignmentsResponse.json();
      console.log(`   ✅ Total assignments: ${assignments.length}`);
      if (assignments.length > 0) {
        const statusCounts = assignments.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {});
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`   📊 ${status}: ${count}`);
        });
      }
    } else {
      console.log('   ❌ Failed to fetch assignments');
    }
    
    // Check users (with auth)
    console.log('\n5. 👥 Users Status:');
    try {
      // Login first
      const loginResponse = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@sigla.com', password: 'password' })
      });
      
      if (loginResponse.ok) {
        const cookies = loginResponse.headers.get('set-cookie');
        const usersResponse = await fetch(`${baseUrl}/api/users`, {
          headers: { 'Cookie': cookies || '' }
        });
        
        if (usersResponse.ok) {
          const userData = await usersResponse.json();
          const users = userData.users || [];
          console.log(`   ✅ Total users: ${users.length}`);
          const roleCounts = users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
          }, {});
          Object.entries(roleCounts).forEach(([role, count]) => {
            console.log(`   👤 ${role}: ${count}`);
          });
        } else {
          console.log('   ❌ Failed to fetch users');
        }
      } else {
        console.log('   ❌ Failed to authenticate');
      }
    } catch (error) {
      console.log('   ❌ Error checking users:', error.message);
    }
    
    console.log('\n📊 Database Status Summary:');
    console.log('   🔍 Analysis complete - ready for seeding recommendations');
    
  } catch (error) {
    console.error('💥 Error checking database status:', error.message);
  }
}

checkDatabaseStatus();