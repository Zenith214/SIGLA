// Direct Supabase database seeding (no server required)
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🌱 Direct Supabase Database Seeding...\n');

async function seedSupabaseDirectly() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔗 Connected to Supabase');
    
    // 1. Get existing barangays
    console.log('\n📍 Fetching existing barangays...');
    const { data: barangays, error: barangaysError } = await supabase
      .from('barangay')
      .select('*')
      .eq('is_active', true);
    
    if (barangaysError) {
      throw new Error(`Failed to fetch barangays: ${barangaysError.message}`);
    }
    
    console.log(`   ✅ Found ${barangays.length} barangays`);
    
    // 2. Seed Survey Cycles
    console.log('\n🔄 Seeding Survey Cycles...');
    const surveyCycles = [
      {
        year: 2024,
        status: 'Active',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        responses: 1250,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        year: 2023,
        status: 'Completed',
        start_date: '2023-01-01T00:00:00Z',
        end_date: '2023-12-31T23:59:59Z',
        responses: 2100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        year: 2022,
        status: 'Completed',
        start_date: '2022-01-01T00:00:00Z',
        end_date: '2022-12-31T23:59:59Z',
        responses: 1890,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Check if cycles already exist
    const { data: existingCycles } = await supabase
      .from('survey_cycle')
      .select('year');
    
    const existingYears = existingCycles?.map(c => c.year) || [];
    
    for (const cycle of surveyCycles) {
      if (!existingYears.includes(cycle.year)) {
        const { error } = await supabase
          .from('survey_cycle')
          .insert(cycle);
        
        if (error) {
          console.log(`   ⚠️  Error creating cycle ${cycle.year}: ${error.message}`);
        } else {
          console.log(`   ✅ Created survey cycle: ${cycle.year}`);
        }
      } else {
        console.log(`   ⚠️  Survey cycle ${cycle.year} already exists`);
      }
    }
    
    // 3. Seed Survey Targets
    console.log('\n🎯 Seeding Survey Targets...');
    
    // Check existing targets
    const { data: existingTargets } = await supabase
      .from('survey_target')
      .select('barangay_id');
    
    const existingTargetBarangayIds = existingTargets?.map(t => t.barangay_id) || [];
    
    for (const barangay of barangays) {
      if (!existingTargetBarangayIds.includes(barangay.barangay_id)) {
        // Generate realistic survey targets based on barangay characteristics
        let baseTarget, achieved, percentage;
        
        if (barangay.seal === 'yes') {
          // Awardees tend to have higher targets and achievement
          baseTarget = Math.floor(Math.random() * 50) + 100; // 100-150
          achieved = Math.floor(baseTarget * (0.7 + Math.random() * 0.3)); // 70-100% achievement
        } else {
          // Non-awardees have varied performance
          baseTarget = Math.floor(Math.random() * 80) + 50; // 50-130
          achieved = Math.floor(baseTarget * (0.3 + Math.random() * 0.6)); // 30-90% achievement
        }
        
        percentage = Math.round((achieved / baseTarget) * 100);
        
        const targetData = {
          barangay_id: barangay.barangay_id,
          target: baseTarget,
          achieved: achieved,
          percentage: percentage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('survey_target')
          .insert(targetData);
        
        if (error) {
          console.log(`   ⚠️  Error creating target for ${barangay.barangay_name}: ${error.message}`);
        } else {
          console.log(`   ✅ Created target for ${barangay.barangay_name}: ${achieved}/${baseTarget} (${percentage}%)`);
        }
      } else {
        console.log(`   ⚠️  Target for ${barangay.barangay_name} already exists`);
      }
    }
    
    // 4. Seed Additional Users
    console.log('\n👥 Seeding Additional Users...');
    const bcrypt = require('bcryptjs');
    
    const additionalUsers = [
      {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@sigla.com',
        role: 'interviewer',
        status: 'active',
        organization: 'SIGLA Survey Team',
        jobTitle: 'Senior Interviewer'
      },
      {
        firstName: 'Juan',
        lastName: 'Cruz',
        email: 'juan.cruz@sigla.com',
        role: 'interviewer',
        status: 'active',
        organization: 'SIGLA Survey Team',
        jobTitle: 'Field Interviewer'
      },
      {
        firstName: 'Ana',
        lastName: 'Reyes',
        email: 'ana.reyes@sigla.com',
        role: 'viewer',
        status: 'active',
        organization: 'SIGLA Analytics',
        jobTitle: 'Data Analyst'
      },
      {
        firstName: 'Carlos',
        lastName: 'Mendoza',
        email: 'carlos.mendoza@sigla.com',
        role: 'interviewer',
        status: 'active',
        organization: 'SIGLA Survey Team',
        jobTitle: 'Field Supervisor'
      }
    ];
    
    // Check existing users
    const { data: existingUsers } = await supabase
      .from('user')
      .select('email');
    
    const existingEmails = existingUsers?.map(u => u.email) || [];
    
    for (const user of additionalUsers) {
      if (!existingEmails.includes(user.email)) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const userData = {
          ...user,
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          lastLogin: null
        };
        
        const { error } = await supabase
          .from('user')
          .insert(userData);
        
        if (error) {
          console.log(`   ⚠️  Error creating user ${user.email}: ${error.message}`);
        } else {
          console.log(`   ✅ Created user: ${user.firstName} ${user.lastName} (${user.role})`);
        }
      } else {
        console.log(`   ⚠️  User ${user.email} already exists`);
      }
    }
    
    // 5. Seed Assignments
    console.log('\n📋 Seeding Assignments...');
    
    // Get all users for assignments
    const { data: allUsers } = await supabase
      .from('user')
      .select('*');
    
    const interviewers = allUsers?.filter(u => u.role === 'interviewer') || [];
    
    // Check existing assignments
    const { data: existingAssignments } = await supabase
      .from('assignment')
      .select('barangay_id, user_id');
    
    const existingAssignmentKeys = existingAssignments?.map(a => `${a.barangay_id}-${a.user_id}`) || [];
    
    // Create assignments for awardee barangays
    const awardeeBarangays = barangays.filter(b => b.seal === 'yes');
    
    for (let i = 0; i < Math.min(awardeeBarangays.length, interviewers.length * 3); i++) {
      const barangay = awardeeBarangays[i % awardeeBarangays.length];
      const interviewer = interviewers[i % interviewers.length];
      const assignmentKey = `${barangay.barangay_id}-${interviewer.id}`;
      
      if (!existingAssignmentKeys.includes(assignmentKey)) {
        const progress = Math.floor(Math.random() * 100);
        
        let status = 'Pending';
        if (progress > 80) status = 'Completed';
        else if (progress > 30) status = 'In Progress';
        
        const assignmentData = {
          barangay_id: barangay.barangay_id,
          user_id: interviewer.id,
          status: status,
          progress: progress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('assignment')
          .insert(assignmentData);
        
        if (error) {
          console.log(`   ⚠️  Error creating assignment: ${error.message}`);
        } else {
          console.log(`   ✅ Assigned ${barangay.barangay_name} to ${interviewer.firstName} ${interviewer.lastName} (${status})`);
        }
      }
    }
    
    // 6. Update barangay current status based on targets
    console.log('\n📊 Updating Barangay Status...');
    
    const { data: targets } = await supabase
      .from('survey_target')
      .select('*');
    
    for (const target of targets || []) {
      let currentStatus = 'Pending';
      if (target.percentage >= 100) {
        currentStatus = 'Completed';
      } else if (target.percentage > 0) {
        currentStatus = 'In Progress';
      }
      
      const { error } = await supabase
        .from('barangay')
        .update({ currentstatus: currentStatus })
        .eq('barangay_id', target.barangay_id);
      
      if (!error) {
        const barangay = barangays.find(b => b.barangay_id === target.barangay_id);
        console.log(`   ✅ Updated ${barangay?.barangay_name} status to: ${currentStatus}`);
      }
    }
    
    console.log('\n🎉 Direct Supabase Seeding Complete!');
    console.log('\n📊 Summary of seeded data:');
    console.log('   🔄 Survey Cycles: 2022, 2023, 2024 with realistic response counts');
    console.log('   🎯 Survey Targets: Realistic targets for all barangays based on award status');
    console.log('   👥 Additional Users: 4 new users (interviewers, analyst, supervisor)');
    console.log('   📋 Assignments: Interviewers assigned to awardee barangays with progress');
    console.log('   📊 Barangay Status: Updated based on survey target completion');
    console.log('\n🚀 Your database now has comprehensive, realistic test data!');
    
  } catch (error) {
    console.error('💥 Direct seeding failed:', error.message);
  }
}

seedSupabaseDirectly();