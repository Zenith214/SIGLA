const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// List of the 8 real barangays that can be awardees
const realAwardeeBarangays = [
  'Balasinon', 'Poblacion', 'Buguis', 'Tanwalang', 
  'Luparan', 'Carre', 'Talas', 'Solongvale'
];

// All 25 barangays from the map with their details
const allBarangays = [
  {
    name: "Katipunan",
    population: 12450,
    households: 3120,
    captain: "Manuel Rivera",
    description: "A mountainous barangay with scenic views.",
    canBeAwardee: false
  },
  {
    name: "Tanwalang",
    population: 4560,
    households: 1140,
    captain: "Pedro Martinez", 
    description: "A growing barangay with excellent road connectivity.",
    canBeAwardee: true
  },
  {
    name: "Solongvale",
    population: 1980,
    households: 495,
    captain: "Diego Fernandez",
    description: "The smallest barangay with stunning valley views.",
    canBeAwardee: true
  },
  {
    name: "Tala-o",
    population: 6890,
    households: 1720,
    captain: "Rosa Garcia",
    description: "A peaceful rural barangay.",
    canBeAwardee: false
  },
  {
    name: "Balasinon",
    population: 3420,
    households: 855,
    captain: "Maria Santos",
    description: "A progressive barangay known for its agricultural activities.",
    canBeAwardee: true
  },
  {
    name: "Haradabutai",
    population: 7650,
    households: 1912,
    captain: "Antonio Lopez",
    description: "A barangay with rich cultural traditions.",
    canBeAwardee: false
  },
  {
    name: "Roxas",
    population: 11200,
    households: 2800,
    captain: "Elena Morales",
    description: "A well-developed barangay with good infrastructure.",
    canBeAwardee: false
  },
  {
    name: "New Cebu",
    population: 13800,
    households: 3450,
    captain: "Miguel Santos",
    description: "A modern barangay with urban characteristics.",
    canBeAwardee: false
  },
  {
    name: "Palili",
    population: 5420,
    households: 1355,
    captain: "Carmen Reyes",
    description: "A quiet barangay known for its festivals.",
    canBeAwardee: false
  },
  {
    name: "Talas",
    population: 5120,
    households: 1280,
    captain: "Carmen Reyes",
    description: "A barangay famous for its natural springs and eco-tourism.",
    canBeAwardee: true
  },
  {
    name: "Carre",
    population: 3680,
    households: 920,
    captain: "Roberto Santos",
    description: "Known for its strong community spirit and local festivals.",
    canBeAwardee: true
  },
  {
    name: "Buguis",
    population: 2890,
    households: 722,
    captain: "Ana Rodriguez",
    description: "A peaceful barangay with rich cultural heritage.",
    canBeAwardee: true
  },
  {
    name: "McKinley",
    population: 7890,
    households: 1972,
    captain: "James Wilson",
    description: "A barangay with historical significance.",
    canBeAwardee: false
  },
  {
    name: "Kiblagon",
    population: 9870,
    households: 2467,
    captain: "Sofia Martinez",
    description: "A thriving agricultural community.",
    canBeAwardee: false
  },
  {
    name: "Laperas",
    population: 6540,
    households: 1635,
    captain: "David Cruz",
    description: "A coastal barangay with fishing activities.",
    canBeAwardee: false
  },
  {
    name: "Clib",
    population: 8120,
    households: 2030,
    captain: "Isabella Garcia",
    description: "A riverside barangay with beautiful scenery.",
    canBeAwardee: false
  },
  {
    name: "Osmena",
    population: 11650,
    households: 2912,
    captain: "Fernando Lopez",
    description: "A commercial hub within the municipality.",
    canBeAwardee: false
  },
  {
    name: "Luparan",
    population: 2150,
    households: 537,
    captain: "Lisa Garcia",
    description: "A small but vibrant barangay nestled in the hills.",
    canBeAwardee: true
  },
  {
    name: "Poblacion",
    population: 8750,
    households: 2187,
    captain: "Juan Dela Cruz",
    description: "The central barangay and seat of municipal government.",
    canBeAwardee: true
  },
  {
    name: "Tagolilong",
    population: 5890,
    households: 1472,
    captain: "Patricia Santos",
    description: "A developing barangay with growing population.",
    canBeAwardee: false
  },
  {
    name: "Lapla",
    population: 9450,
    households: 2362,
    captain: "Ricardo Morales",
    description: "A barangay known for its educational institutions.",
    canBeAwardee: false
  },
  {
    name: "Litos",
    population: 7140,
    households: 1785,
    captain: "Monica Rivera",
    description: "A barangay with diverse economic activities.",
    canBeAwardee: false
  },
  {
    name: "Parame",
    population: 8670,
    households: 2167,
    captain: "Gabriel Cruz",
    description: "A barangay with strong agricultural base.",
    canBeAwardee: false
  },
  {
    name: "Labon",
    population: 6230,
    households: 1557,
    captain: "Victoria Lopez",
    description: "A barangay known for its artisan crafts.",
    canBeAwardee: false
  },
  {
    name: "Waterfall",
    population: 4890,
    households: 1222,
    captain: "Alexander Garcia",
    description: "A scenic barangay with natural waterfalls.",
    canBeAwardee: false
  }
];

const generateHistory = (canBeAwardee) => {
  if (canBeAwardee) {
    // Real barangays have varied realistic history
    const histories = [
      [
        { year: "2024", status: "In Progress" },
        { year: "2023", status: "Completed" },
        { year: "2022", status: "Completed" },
        { year: "2021", status: "Completed" }
      ],
      [
        { year: "2024", status: "Completed" },
        { year: "2023", status: "Completed" },
        { year: "2022", status: "Completed" },
        { year: "2021", status: "Completed" }
      ],
      [
        { year: "2024", status: "Pending" },
        { year: "2023", status: "Completed" },
        { year: "2022", status: "Completed" },
        { year: "2021", status: "Pending" }
      ]
    ];
    return histories[Math.floor(Math.random() * histories.length)];
  } else {
    // Non-awardee barangays have simpler history
    return [
      { year: "2024", status: "Pending" },
      { year: "2023", status: "Pending" },
      { year: "2022", status: "Pending" },
      { year: "2021", status: "Pending" }
    ];
  }
};

async function populateAllBarangays() {
  try {
    console.log('🚀 Populating database with all 25 barangays...');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.assignment.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.surveyTarget.deleteMany();
    await prisma.barangay.deleteMany();
    
    console.log('📝 Inserting all barangays...');
    
    for (const barangay of allBarangays) {
      const history = generateHistory(barangay.canBeAwardee);
      
      const result = await prisma.barangay.create({
        data: {
          barangay_name: barangay.name,
          population: barangay.population,
          households: barangay.households,
          captain: barangay.captain,
          description: barangay.description,
          currentStatus: barangay.canBeAwardee ? 'Active' : 'Inactive',
          history: JSON.stringify(history),
          is_active: true,
          seal: barangay.canBeAwardee && ['Poblacion', 'Talas'].includes(barangay.name) ? 'yes' : 'no',
        }
      });
      
      const awardeeStatus = barangay.canBeAwardee ? '🏆 (Can be awardee)' : '📍 (Cannot be awardee)';
      console.log(`✅ Created: ${barangay.name} (ID: ${result.barangay_id}) ${awardeeStatus}`);
    }
    
    console.log(`\n🎉 Successfully created all ${allBarangays.length} barangays!`);
    
    // Verify the real awardee barangays
    const realBarangayCount = allBarangays.filter(b => b.canBeAwardee).length;
    console.log(`🏆 Real awardee-eligible barangays: ${realBarangayCount}`);
    console.log(`📍 Other geographical areas: ${allBarangays.length - realBarangayCount}`);
    
    // List awardee-eligible barangays
    console.log('\n🏆 Awardee-eligible barangays:');
    allBarangays.filter(b => b.canBeAwardee).forEach(b => {
      console.log(`   - ${b.name} (Pop: ${b.population.toLocaleString()})`);
    });
    
  } catch (error) {
    console.error('❌ Error populating barangays:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  populateAllBarangays()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = populateAllBarangays;
