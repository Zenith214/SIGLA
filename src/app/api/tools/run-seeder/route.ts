import { NextRequest, NextResponse } from "next/server";
import { DatabaseSeeder, UserSeeder, SpotSeeder, AssignmentSeeder } from '@/lib/seeders';

const seeders = {
  DatabaseSeeder,
  UserSeeder,
  SpotSeeder,
  AssignmentSeeder
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seederName, options = {} } = body;

    if (!seederName || !seeders[seederName as keyof typeof seeders]) {
      return NextResponse.json(
        { error: `Invalid seeder name. Available: ${Object.keys(seeders).join(', ')}` },
        { status: 400 }
      );
    }

    const SeederClass = seeders[seederName as keyof typeof seeders];
    const seeder = new SeederClass(options);

    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      await seeder.run();
      console.log = originalLog;

      return NextResponse.json({
        success: true,
        seederName,
        options,
        logs
      });
    } catch (error) {
      console.log = originalLog;
      throw error;
    }
  } catch (error) {
    console.error('Seeder execution failed:', error);
    return NextResponse.json(
      { error: `Seeder failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
