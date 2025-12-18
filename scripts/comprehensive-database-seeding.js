// Comprehensive database seeding script
require('dotenv').config({ path: '.env.local' });
console.log('🌱 Comprehensive Database Seeding...\n');

async function seedDatabase() {
  try {
    const baseUrl = 'http://localhost:3000';
    
    // First, get authentication token
    console.log('🔐 Authenticating...');
    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sigla.com', password: 'password' })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Authentication failed');
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('   ✅ Authenticated successfully');
    
    // Get current barangays
    console.log('\n📍 Fetching barangays...');
    const barangaysResponse = await fetch(`${baseUrl}/api/barangays/all`);
    const barangays = await barangaysResponse.json();
    console.log(`   ✅ Found ${barangays.length} barangays`);
    
    // 1. Seed Survey Cycles
    console.log('\n🔄 Seeding Survey Cycles...');
    const surveyCycles = [
      {
        year: 2024,
        status: 'Active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        responses: 1250
      },
      {
        year: 2023,
        status: 'Completed',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        responses: 2100
      },
      {
        year: 2022,
        status: 'Completed',
        start_date: '2022-01-01',
        end_date: '2022-12-31',
        responses: 1890
      }
    ];
    
    for (const cycle of surveyCycles) {
      try {
        const response = await fetch(`${baseUrl}/api/survey-cycles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cycle)
        });
        
        if (response.ok) {
          console.log(`   ✅ Created survey cycle: ${cycle.year}`);
        } else {
          console.log(`   ⚠️  Survey cycle ${cycle.year} may already exist`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error creating cycle ${cycle.year}:`, error.message);
      }
    }
    
    // 2. Seed Survey Targets for each barangay
    console.log('\n🎯 Seeding Survey Targets...');
    for (const barangay of barangays) {
      const baseTarget = Math.floor(Math.random() * 100) + 50; // 50-150 target
      const achieved = Math.floor(Math.random() * baseTarget); // Random achievement
      const percentage = Math.round((achieved / baseTarget) * 100);
      
      const targetData = {
        barangay_id: barangay.barangay_id,
        target: baseTarget,
        achieved: achieved,
        percentage: percentage
      };
      
      try {
        const response = await fetch(`${baseUrl}/api/survey-targets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetData)
        });
        
        if (response.ok) {
          console.log(`   ✅ Created target for ${barangay.name}: ${achieved}/${baseTarget} (${percentage}%)`);
        } else {
          console.log(`   ⚠️  Target for ${barangay.name} may already exist`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error creating target for ${barangay.name}:`, error.message);
      }
    }
    
    // 3. Seed Additional Users
    console.log('\n👥 Seeding Additional Users...');
    const additionalUsers = [
      {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@sigla.com',
        password: 'password123',
        role: 'interviewer',
        status: 'active',
        organization: 'SIGLA Survey Team',
        jobTitle: 'Senior Interviewer'
      },
      {
        firstName: 'Juan',
        lastName: 'Cruz',
        email: 'juan.cruz@sigla.com',
        password: 'password123',
        role: 'interviewer',
        status: 'active',
        organization: 'SIGLA Survey Team',
        jobTitle: 'Field Interviewer'
      },
      {
        firstName: 'Ana',
        lastName: 'Reyes',
        email: 'ana.reyes@sigla.com',
        password: 'password123',
        role: 'viewer',
        status: 'active',
        organization: 'SIGLA Analytics',
        jobTitle: 'Data Analyst'
      }
    ];
    
    for (const user of additionalUsers) {
      try {
        const response = await fetch(`${baseUrl}/api/users`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': cookies || ''
          },
          body: JSON.stringify(user)
        });
        
        if (response.ok) {
          console.log(`   ✅ Created user: ${user.firstName} ${user.lastName} (${user.role})`);
        } else {
          console.log(`   ⚠️  User ${user.email} may already exist`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error creating user ${user.email}:`, error.message);
      }
    }
    
    // 4. Seed Assignments
    console.log('\n📋 Seeding Assignments...');
    
    // Get users for assignments
    const usersResponse = await fetch(`${baseUrl}/api/users`, {
      headers: { 'Cookie': cookies || '' }
    });
    
    if (usersResponse.ok) {
      const userData = await usersResponse.json();
      const interviewers = userData.users.filter(u => u.role === 'interviewer');
      
      // Create assignments for awardee barangays
      const awardeeBarangays = barangays.filter(b => b.seal === 'yes');
      
      for (let i = 0; i < Math.min(awardeeBarangays.length, interviewers.length * 2); i++) {
        const barangay = awardeeBarangays[i];
        const interviewer = interviewers[i % interviewers.length];
        const progress = Math.floor(Math.random() * 100);
        
        let status = 'Pending';
        if (progress > 80) status = 'Completed';
        else if (progress > 30) status = 'In Progress';
        
        const assignmentData = {
          barangay_id: barangay.barangay_id,
          user_id: interviewer.id,
          status: status,
          progress: progress
        };
        
        try {
          const response = await fetch(`${baseUrl}/api/assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData)
          });
          
          if (response.ok) {
            console.log(`   ✅ Assigned ${barangay.name} to ${interviewer.firstName} ${interviewer.lastName} (${status})`);
          } else {
            console.log(`   ⚠️  Assignment may already exist`);
          }
        } catch (error) {
          console.log(`   ⚠️  Error creating assignment:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Database Seeding Complete!');
    console.log('\n📊 Summary of seeded data:');
    console.log('   🔄 Survey Cycles: 2022, 2023, 2024');
    console.log('   🎯 Survey Targets: One for each barangay with realistic progress');
    console.log('   👥 Additional Users: 3 new users (interviewers and analyst)');
    console.log('   📋 Assignments: Interviewers assigned to awardee barangays');
    console.log('\n🚀 Your application now has comprehensive test data!');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    console.log('\n💡 Make sure your development server is running: npm run dev');
  }
}

seedDatabase();