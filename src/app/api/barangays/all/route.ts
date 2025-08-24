import { NextResponse } from "next/server";
import * as Prisma from "@prisma/client";

const prisma = new Prisma.PrismaClient();

// Static barangay data for seeding - realistic distribution of awardees
const staticBarangayData = [
  { name: "Katipunan", population: 12450, households: 3120, surveyStatus: "Completed", seal: "no" },
  { name: "Tanwalang", population: 8750, households: 2180, surveyStatus: "In Progress", seal: "yes" },
  { name: "Solong Vale", population: 15200, households: 3800, surveyStatus: "Completed", seal: "yes" },
  { name: "Tala-o", population: 6890, households: 1720, surveyStatus: "Pending", seal: "no" },
  { name: "Balasinon", population: 9340, households: 2335, surveyStatus: "In Progress", seal: "yes" },
  { name: "Haradabutai", population: 7650, households: 1912, surveyStatus: "Completed", seal: "no" },
  { name: "Roxas", population: 11200, households: 2800, surveyStatus: "Completed", seal: "no" },
  { name: "New Cebu", population: 13800, households: 3450, surveyStatus: "In Progress", seal: "no" },
  { name: "Palili", population: 5420, households: 1355, surveyStatus: "Pending", seal: "no" },
  { name: "Talas", population: 8960, households: 2240, surveyStatus: "Completed", seal: "yes" },
  { name: "Carre", population: 6780, households: 1695, surveyStatus: "In Progress", seal: "yes" },
  { name: "Buguis", population: 10300, households: 2575, surveyStatus: "Completed", seal: "yes" },
  { name: "McKinley", population: 7890, households: 1972, surveyStatus: "Pending", seal: "no" },
  { name: "Kiblagon", population: 9870, households: 2467, surveyStatus: "In Progress", seal: "no" },
  { name: "Laperas", population: 6540, households: 1635, surveyStatus: "Completed", seal: "no" },
  { name: "Clib", population: 8120, households: 2030, surveyStatus: "In Progress", seal: "no" },
  { name: "Osmena", population: 11650, households: 2912, surveyStatus: "Completed", seal: "no" },
  { name: "Luparan", population: 7320, households: 1830, surveyStatus: "Pending", seal: "yes" },
  { name: "Poblacion", population: 16800, households: 4200, surveyStatus: "Completed", seal: "yes" },
  { name: "Tagolilong", population: 5890, households: 1472, surveyStatus: "In Progress", seal: "no" },
  { name: "Lapla", population: 9450, households: 2362, surveyStatus: "Completed", seal: "no" },
  { name: "Litos", population: 7140, households: 1785, surveyStatus: "Pending", seal: "no" },
  { name: "Parame", population: 8670, households: 2167, surveyStatus: "In Progress", seal: "no" },
  { name: "Labon", population: 6230, households: 1557, surveyStatus: "Completed", seal: "no" },
  { name: "Waterfall", population: 4890, households: 1222, surveyStatus: "Pending", seal: "no" }
];

async function seedStaticData() {
  console.log('🌱 Seeding static barangay data...');
  
  for (const barangayData of staticBarangayData) {
    const barangay = await prisma.barangay.create({
      data: {
        barangay_name: barangayData.name,
        population: barangayData.population,
        households: barangayData.households,
        seal: barangayData.seal as "yes" | "no",
        currentStatus: barangayData.surveyStatus,
        is_active: true,
        description: `${barangayData.name} is a barangay with ${barangayData.population.toLocaleString()} residents and ${barangayData.households.toLocaleString()} households.`
      }
    });

    // Create survey targets based on status
    let targetProgress = 150;
    let achievedProgress = 0;
    
    switch (barangayData.surveyStatus) {
      case 'Completed':
        achievedProgress = 150;
        break;
      case 'In Progress':
        achievedProgress = Math.floor(Math.random() * 100) + 50;
        break;
      case 'Pending':
        achievedProgress = 0;
        break;
    }

    const percentage = Math.round((achievedProgress / targetProgress) * 100);

    await prisma.surveyTarget.create({
      data: {
        barangay_id: barangay.barangay_id,
        target: targetProgress,
        achieved: achievedProgress,
        percentage: percentage
      }
    });
  }
  
  console.log('✅ Static data seeded successfully');
}

export async function GET() {
  try {
    // Check if barangays exist, if not, seed them
    const existingCount = await prisma.barangay.count();
    if (existingCount === 0) {
      console.log('No barangays found, seeding static data...');
      await seedStaticData();
    }

    // Fetch ALL barangays (including those without seals) for settings management
    const barangays = await prisma.barangay.findMany({
      where: {
        is_active: true
        // No seal filter - show all barangays
      },
      include: {
        surveyTargets: {
          select: {
            target: true,
            achieved: true,
            percentage: true,
            created_at: true
          }
        },
        survey_response: {
          where: {
            status: 'completed'
          },
          select: {
            completed_at: true,
            status: true
          }
        }
      },
      orderBy: {
        barangay_name: 'asc'
      }
    });

    // Return raw barangay data for settings (no transformation needed)
    return NextResponse.json(barangays);

  } catch (error: any) {
    console.error("Error fetching all barangays:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT method for updating barangays
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { barangay_id, ...updateData } = data;

    const updatedBarangay = await prisma.barangay.update({
      where: { barangay_id: parseInt(barangay_id) },
      data: updateData
    });

    return NextResponse.json(updatedBarangay);
  } catch (error: any) {
    console.error("Error updating barangay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}