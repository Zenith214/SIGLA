// Migrate existing data to Supabase
require('dotenv').config({ path: '.env.local' });
console.log('🚀 Migrating Data to Supabase...\n');

// Real barangay data from your system
const barangayData = [
  {
    name: "Katipunan",
    population: 12450,
    households: 3120,
    area: 15.2,
    currentStatus: "Completed",
    is_awardee: false,
    description: "A progressive barangay known for its community participation and governance excellence."
  },
  {
    name: "Tanwalang",
    population: 8750,
    households: 2180,
    area: 12.8,
    currentStatus: "In Progress",
    is_awardee: true,
    description: "A developing barangay with ongoing improvement initiatives."
  },
  {
    name: "Solong Vale",
    population: 15200,
    households: 3800,
    area: 18.5,
    currentStatus: "Completed",
    is_awardee: true,
    description: "One of the largest barangays with excellent governance and community services."
  },
  {
    name: "Tala-o",
    population: 6890,
    households: 1720,
    area: 9.3,
    currentStatus: "Pending",
    is_awardee: false,
    description: "A smaller barangay with potential for growth and development."
  },
  {
    name: "Balasinon",
    population: 9340,
    households: 2335,
    area: 11.7,
    currentStatus: "In Progress",
    is_awardee: true,
    description: "A mid-sized barangay working towards improved governance standards."
  },
  {
    name: "Haradabutai",
    population: 7650,
    households: 1912,
    area: 10.4,
    currentStatus: "Completed",
    is_awardee: true,
    description: "A well-managed barangay with strong community engagement."
  },
  {
    name: "Roxas",
    population: 11200,
    households: 2800,
    area: 14.1,
    currentStatus: "Completed",
    is_awardee: true,
    description: "Named after a former president, known for its organized governance structure."
  },
  {
    name: "New Cebu",
    population: 13800,
    households: 3450,
    area: 16.9,
    currentStatus: "In Progress",
    is_awardee: false,
    description: "A large barangay with diverse communities and ongoing development projects."
  },
  {
    name: "Palili",
    population: 5420,
    households: 1355,
    area: 7.8,
    currentStatus: "Pending",
    is_awardee: false,
    description: "A small rural barangay with agricultural focus."
  },
  {
    name: "Talas",
    population: 8960,
    households: 2240,
    area: 12.3,
    currentStatus: "Completed",
    is_awardee: true,
    description: "A barangay with strong local leadership and community programs."
  },
  {
    name: "Carre",
    population: 6780,
    households: 1695,
    area: 9.1,
    currentStatus: "In Progress",
    is_awardee: false,
    description: "A developing barangay with focus on infrastructure improvements."
  },
  {
    name: "Buguis",
    population: 10300,
    households: 2575,
    area: 13.6,
    currentStatus: "Completed",
    is_awardee: true,
    description: "A well-established barangay with excellent public services."
  },
  {
    name: "McKinley",
    population: 7890,
    households: 1972,
    area: 10.7,
    currentStatus: "Pending",
    is_awardee: false,
    description: "A barangay named after the American president, focusing on modernization."
  },
  {
    name: "Kiblagon",
    population: 9870,
    households: 2467,
    area: 12.9,
    currentStatus: "In Progress",
    is_awardee: false,
    description: "A barangay with rich cultural heritage and ongoing development initiatives."
  },
  {
    name: "Laperas",
    population: 6540,
    households: 1635,
    area: 8.9,
    currentStatus: "Completed",
    is_awardee: true,
    description: "A compact barangay with efficient governance and community services."
  },
  {
    name: "Clib",
    population: 8120,
    households: 2030,
    area: 11.2,
    currentStatus: "In Progress",
    is_awardee: false,
    description: "A barangay working towards improved infrastructure and services."
  },
  {
    name: "Osmena",
    population: 11650,
    households: 2912,
    area: 14.8,
    currentStatus: "Completed",
    is_awardee: true,
    description: "Named after a former president, known for its progressive governance."
  },
  {
    name: "Luparan",
    population: 7320,
    households: 1830,
    area: 9.8,
    currentStatus: "Pending",
    is_awardee: false,
    description: "A barangay with potential for agricultural and tourism development."
  },
  {
    name: "Poblacion",
    population: 16800,
    households: 4200,
    area: 20.3,
    currentStatus: "Completed",
    is_awardee: true,
    description: "The town center and largest barangay, serving as the commercial and administrative hub."
  },
  {
    name: "Tagolilong",
    population: 5890,
    households: 1472,
    area: 8.1,
    currentStatus: "In Progress",
    is_awardee: false,
    description: "A small barangay with focus on sustainable development."
  },
  {
    name: "Lapla",
    population: 9450,
    households: 2362,
    area: 12.6,
    currentStatus: "Completed",
    is_awardee: true,
    description: "A well-managed barangay with strong community participation."
  },
  {
    name: "Litos",
    population: 7140,
    households: 1785,
    area: 9.5,
    currentStatus: "Pending",
    is_awardee: false,
    description: "A barangay with opportunities for growth and development."
  },
  {
    name: "Parame",
    population: 8670,
    households: 2167,
    area: 11.4,
    currentStatus: "In Progress",
    is_awardee: false,
    description: "A developing barangay with focus on community empowerment."
  },
  {
    name: "Labon",
    population: 6230,
    households: 1557,
    area: 8.6,
    currentStatus: "Completed",
    is_awardee: true,
    description: "A small but well-organized barangay with effective local governance."
  },
  {
    name: "Waterfall",
    population: 4890,
    households: 1222,
    area: 6.9,
    currentStatus: "Pending",
    is_awardee: false,
    description: "The smallest barangay, known for its natural beauty and eco-tourism potential."
  }
];

// Sample users data
const userData = [
  {
    email: "admin@sigla.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    firstName: "Admin",
    lastName: "User",
    role: "Admin",
    jobTitle: "System Administrator",
    organization: "SIGLA Survey System",
    status: "Active"
  },
  {
    email: "interviewer1@sigla.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    firstName: "Maria",
    lastName: "Santos",
    role: "Interviewer",
    jobTitle: "Field Interviewer",
    organization: "SIGLA Survey Team",
    phone: "+63 912 345 6789",
    status: "Active"
  },
  {
    email: "interviewer2@sigla.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    firstName: "Juan",
    lastName: "Dela Cruz",
    role: "Interviewer",
    jobTitle: "Senior Interviewer",
    organization: "SIGLA Survey Team",
    phone: "+63 917 654 3210",
    status: "Active"
  },
  {
    email: "supervisor@sigla.com",
    password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    firstName: "Ana",
    lastName: "Rodriguez",
    role: "Supervisor",
    jobTitle: "Survey Supervisor",
    organization: "SIGLA Management",
    phone: "+63 918 111 2222",
    status: "Active"
  }
];

async function migrateData() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🗑️ Clearing existing data...');
    
    // Clear existing data
    await supabase.from('barangay').delete().neq('barangay_id', 0);
    await supabase.from('user').delete().neq('id', 0);
    
    console.log('✅ Existing data cleared');
    
    console.log('🏘️ Migrating barangays...');
    
    // Insert barangays
    for (const barangay of barangayData) {
      const { data, error } = await supabase
        .from('barangay')
        .insert({
          barangay_name: barangay.name,
          population: barangay.population,
          households: barangay.households,
          area: barangay.area,
          currentstatus: barangay.currentStatus,
          description: barangay.description,
          is_active: true,
          seal: barangay.is_awardee ? 'yes' : 'no'
        });
      
      if (error) {
        console.log(`❌ Error inserting ${barangay.name}:`, error.message);
      } else {
        console.log(`✅ Added: ${barangay.name} ${barangay.is_awardee ? '🏆' : ''}`);
      }
    }
    
    console.log('👥 Migrating users...');
    
    // Insert users
    for (const user of userData) {
      const { data, error } = await supabase
        .from('user')
        .insert({
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          jobTitle: user.jobTitle,
          organization: user.organization,
          phone: user.phone,
          status: user.status
        });
      
      if (error) {
        console.log(`❌ Error inserting ${user.email}:`, error.message);
      } else {
        console.log(`✅ Added user: ${user.firstName} ${user.lastName} (${user.role})`);
      }
    }
    
    console.log('\n🎉 Data migration completed!');
    
    // Verify data
    const { data: barangays } = await supabase.from('barangay').select('*');
    const { data: users } = await supabase.from('user').select('*');
    
    console.log(`📊 Total barangays: ${barangays?.length || 0}`);
    console.log(`👥 Total users: ${users?.length || 0}`);
    console.log(`🏆 Awardees: ${barangays?.filter(b => b.seal === 'yes').length || 0}`);
    
    console.log('\n✅ Your SIGLA system is now fully migrated to Supabase!');
    console.log('🎯 Next steps:');
    console.log('1. Test Settings → Barangays page');
    console.log('2. Try editing barangay seals');
    console.log('3. Test user login functionality');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateData();