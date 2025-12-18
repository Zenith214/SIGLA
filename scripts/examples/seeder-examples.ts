#!/usr/bin/env node
/**
 * Seeder Usage Examples
 * Demonstrates how to use the seeder system
 */

import { UserSeeder, SpotSeeder, AssignmentSeeder } from '../../src/lib/seeders';

async function examples() {
  console.log('\n🌱 Seeder Usage Examples\n');

  // Example 1: Run user seeder
  console.log('1️⃣  Running UserSeeder...');
  const userSeeder = new UserSeeder();
  await userSeeder.run();

  // Example 2: Run spot seeder with options
  console.log('\n2️⃣  Running SpotSeeder with custom count...');
  const spotSeeder = new SpotSeeder({ count: 15 });
  await spotSeeder.run();

  // Example 3: Run assignment seeder with status filter
  console.log('\n3️⃣  Running AssignmentSeeder for pending assignments...');
  const assignmentSeeder = new AssignmentSeeder({ 
    count: 10, 
    status: 'Pending' 
  });
  await assignmentSeeder.run();

  console.log('\n🎉 Examples complete!\n');
}

examples().catch(console.error);
