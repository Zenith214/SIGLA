const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsersAndRoles() {
  console.log('🔍 Checking Users and Roles in Database...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${users.length} users in database\n`);

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('   This explains why the interviewer dropdown is empty.');
      console.log('   You need to create users with "interviewer" role.\n');
      
      console.log('💡 To fix this, you can:');
      console.log('   1. Register new users through /register page');
      console.log('   2. Use the Users & Roles section in settings to create users');
      console.log('   3. Manually create users in the database\n');
      
      return { success: true, users: [], interviewers: [] };
    }

    // Display all users
    console.log('👥 All Users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role || 'No role set'}`);
      console.log(`      Status: ${user.status || 'Active'}`);
      console.log(`      ID: ${user.id}`);
      console.log('');
    });

    // Filter interviewers
    const interviewers = users.filter(user => {
      const role = (user.role || '').toLowerCase().trim();
      return role === 'interviewer';
    });

    console.log(`🎯 Interviewers Found: ${interviewers.length}`);
    if (interviewers.length > 0) {
      interviewers.forEach((interviewer, index) => {
        console.log(`   ${index + 1}. ${interviewer.firstName} ${interviewer.lastName} (ID: ${interviewer.id})`);
      });
    } else {
      console.log('   ❌ No users with "interviewer" role found!');
      console.log('   This is why the interviewer dropdown is empty.\n');
      
      console.log('🔧 To fix this:');
      console.log('   1. Go to Settings > Users & Roles');
      console.log('   2. Edit existing users and change their role to "interviewer"');
      console.log('   3. Or create new users with "interviewer" role\n');
      
      // Show role distribution
      const roleDistribution = {};
      users.forEach(user => {
        const role = user.role || 'No role';
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      });
      
      console.log('📊 Current Role Distribution:');
      Object.entries(roleDistribution).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} users`);
      });
    }

    return {
      success: true,
      users,
      interviewers,
      totalUsers: users.length,
      totalInterviewers: interviewers.length
    };

  } catch (error) {
    console.error('❌ Error checking users:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUsersAndRoles()
  .then(result => {
    if (result.success) {
      console.log('\n✅ User check completed!');
      if (result.totalInterviewers === 0) {
        console.log('\n🚨 ACTION REQUIRED:');
        console.log('   Create users with "interviewer" role to populate the dropdown.');
      } else {
        console.log('\n🎉 Interviewer dropdown should be working!');
      }
    } else {
      console.log('\n❌ User check failed:', result.error);
    }
  })
  .catch(console.error);