#!/usr/bin/env node
/**
 * Database Seeder CLI
 * Usage: npm run db:seed [SeederName] [-- --options]
 */

import { DatabaseSeeder, UserSeeder, SpotSeeder, AssignmentSeeder } from '../src/lib/seeders';

const seeders = {
  DatabaseSeeder,
  UserSeeder,
  SpotSeeder,
  AssignmentSeeder
};

async function main() {
  const args = process.argv.slice(2);
  const seederName = args[0] || 'DatabaseSeeder';

  // Parse options
  const options: Record<string, any> = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      
      // Convert to appropriate type
      if (value && !value.startsWith('--')) {
        options[key] = isNaN(Number(value)) ? value : Number(value);
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  const SeederClass = seeders[seederName as keyof typeof seeders];

  if (!SeederClass) {
    console.error(`❌ Seeder "${seederName}" not found.`);
    console.log('\nAvailable seeders:');
    Object.keys(seeders).forEach(name => console.log(`  - ${name}`));
    process.exit(1);
  }

  try {
    const seeder = new SeederClass(options);
    await seeder.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
