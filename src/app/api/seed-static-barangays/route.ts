import { NextResponse } from "next/server";
import * as Prisma from "@prisma/client";

const prisma = new Prisma.PrismaClient();

// Static barangay data from the dashboard
const staticBarangayData = [
  { name: "Katipunan", population: 12450, households: 3120, surveyStatus: "Completed", seal: "yes" },
  { name: "Tanwalang", population: 8750, households: 2180, surveyStatus: "In Progress", seal: "yes" },
  { name: "Solong Vale", population: 15200, households: 3800, surveyStatus: "Completed", seal: "yes" },
  { name: "Tala-o", population: 6890, households: 1720, surveyStatus: "Pending", seal: "yes" },
  { name: "Balasinon", population: 9340, households: 2335, surveyStatus: "In Progress", seal: "yes" },
  { name: "Haradabutai", population: 7650, households: 1912, surveyStatus: "Completed", seal: "yes" },
  { name: "Roxas", population: 11200, households: 2800, surveyStatus: "Completed", seal: "yes" },
  { name: "New Cebu", population: 13800, households: 3450, surveyStatus: "In Progress", seal: "yes" },
  { name: "Palili", population: 5420, households: 1355, surveyStatus: "Pending", seal: "yes" },
  { name: "Talas", population: 8960, households: 2240, surveyStatus: "Completed", seal: "yes" },
  { name: "Carre", population: 6780, households: 1695, surveyStatus: "In Progress", seal: "yes" },
  { name: "Buguis", population: 10300, households: 2575, surveyStatus: "Completed", seal: "yes" },
  { name: "McKinley", population: 7890, households: 1972, surveyStatus: "Pending", seal: "yes" },
  { name: "Kiblagon", population: 9870, households: 2467, surveyStatus: "In Progress", seal: "yes" },
  { name: "Laperas", population: 6540, households: 1635, surveyStatus: "Completed", seal: "yes" },
  { name: "Clib", population: 8120, households: 2030, surveyStatus: "In Progress", seal: "yes" },
  { name: "Osmena", population: 11650, households: 2912, surveyStatus: "Completed", seal: "yes" },
  { name: "Luparan", population: 7320, households: 1830, surveyStatus: "Pending", seal: "yes" },
  { name: "Poblacion", population: 16800, households: 4200, surveyStatus: "Completed", seal: "yes" },
  { name: "Tagolilong", population: 5890, households: 1472, surveyStatus: "In Progress", seal: "yes" },
  { name: "Lapla", population: 9450, households: 2362, surveyStatus: "Completed", seal: "yes" },
  { name: "Litos", population: 7140, households: 1785, surveyStatus: "Pending", seal: "yes" },
  { name: "Parame", population: 8670, households: 2167, surveyStatus: "In Progress", seal: "yes" },
  { name: "Labon", population: 6230, households: 1557, surveyStatus: "Completed", seal: "yes" },
  { name: "Waterfall", population: 4890, households: 1222, surveyStatus: "Pending", seal: "yes" }
];

export async function POST() {
  try {
    console.log('🌱 Starting to seed static barangay data...');

    // Check if barangays already exist
    const existingBarangays = await prisma.barangay.findMany();
    console.log(`📊 Found ${existingBarangays.length} existing barangays in database`);

    if (existingBarangays.length > 0) {
      return NextResponse.json({ 
        message: 'Barangays already exist in database', 
        count: existingBarangays.length 
      });
    }

    const createdBarangays = [];

    // Seed barangays
    for (const barangayData of staticBarangayData) {
      console.log(`🏘️  Creating barangay: ${barangayData.name}`);
      
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
      let targetProgress = 150; // Standard target
      let achievedProgress = 0;
      
      switch (barangayData.surveyStatus) {
        case 'Completed':
          achievedProgress = 150; // Fully achieved
          break;
        case 'In Progress':
          achievedProgress = Math.floor(Math.random() * 100) + 50; // 50-149
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

      createdBarangays.push({
        id: barangay.barangay_id,
        name: barangay.barangay_name,
        progress: percentage
      });

      console.log(`✅ Created ${barangayData.name} with ${percentage}% progress`);
    }

    console.log('🎉 Successfully seeded all static barangay data!');

    return NextResponse.json({ 
      message: 'Successfully seeded static barangay data', 
      count: createdBarangays.length,
      barangays: createdBarangays
    });

  } catch (error: any) {
    console.error('❌ Error seeding static barangay data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}