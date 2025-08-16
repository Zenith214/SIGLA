import { NextRequest, NextResponse } from 'next/server';
import * as Prisma from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new Prisma.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Helper to verify admin role
async function verifyAdminRole(request: NextRequest) {
  const token = request.cookies.get('sigla_token')?.value;
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// Real barangay data from the map
const barangayData = [
  {
    name: "Katipunan",
    population: 12450,
    households: 3120,
    area: 15.2,
    currentStatus: "Completed",
    is_awardee: false, // ❌ NOT AWARDEE
    description: "A progressive barangay known for its community participation and governance excellence."
  },
  {
    name: "Tanwalang",
    population: 8750,
    households: 2180,
    area: 12.8,
    currentStatus: "In Progress",
    is_awardee: true, // ✅ AWARDEE
    description: "A developing barangay with ongoing improvement initiatives."
  },
  {
    name: "Solong Vale",
    population: 15200,
    households: 3800,
    area: 18.5,
    currentStatus: "Completed",
    is_awardee: true, // ✅ AWARDEE (Solongvale)
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
    is_awardee: true, // ✅ AWARDEE
    description: "A mid-sized barangay working towards improved governance standards."
  },
  {
    name: "Haradabutai",
    population: 7650,
    households: 1912,
    area: 10.4,
    currentStatus: "Completed",
    is_awardee: false, // ❌ NOT AWARDEE
    description: "A well-managed barangay with strong community engagement."
  },
  {
    name: "Roxas",
    population: 11200,
    households: 2800,
    area: 14.1,
    currentStatus: "Completed",
    is_awardee: false, // ❌ NOT AWARDEE
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
    is_awardee: true, // ✅ AWARDEE
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
    is_awardee: false, // ❌ NOT AWARDEE
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
    is_awardee: false, // ❌ NOT AWARDEE
    description: "Named after a former president, known for its progressive governance."
  },
  {
    name: "Luparan",
    population: 7320,
    households: 1830,
    area: 9.8,
    currentStatus: "Pending",
    is_awardee: true, // ✅ AWARDEE
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
    is_awardee: false, // ❌ NOT AWARDEE
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
    is_awardee: false, // ❌ NOT AWARDEE
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

export async function POST(request: NextRequest) {
  // Check if user is admin
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Delete all existing barangays
    await prisma.barangay.deleteMany({});
    
    // Insert new barangay data
    const createdBarangays = [];
    for (const barangay of barangayData) {
      const created = await prisma.barangay.create({
        data: {
          barangay_name: barangay.name,
          population: barangay.population,
          households: barangay.households,
          area: barangay.area,
          currentStatus: barangay.currentStatus,
          is_awardee: barangay.is_awardee,
          description: barangay.description,
          is_active: true,
          seal: barangay.is_awardee ? "yes" : "no", // Awardees have seals
        }
      });
      createdBarangays.push(created);
    }
    
    const awardeeCount = barangayData.filter(b => b.is_awardee).length;
    
    return NextResponse.json({ 
      message: 'Barangays seeded successfully',
      total: barangayData.length,
      awardees: awardeeCount,
      barangays: createdBarangays
    });
  } catch (error) {
    console.error('Error seeding barangays:', error);
    return NextResponse.json({ 
      message: 'Failed to seed barangays', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}