#!/usr/bin/env node
/**
 * Factory Usage Examples
 * Demonstrates how to use the factory system
 */

import { userFactory, spotFactory, assignmentFactory } from '../../src/lib/factories';

async function examples() {
  console.log('\n🎯 Factory Usage Examples\n');

  // Example 1: Create a single interviewer
  console.log('1️⃣  Creating a single interviewer...');
  const interviewer = await userFactory()
    .interviewer()
    .create();
  console.log('   ✅ Created:', interviewer);

  // Example 2: Create multiple users with custom attributes
  console.log('\n2️⃣  Creating 3 custom interviewers...');
  const interviewers = await userFactory()
    .interviewer()
    .with({ organization: 'SIGLA Field Team' })
    .times(3)
    .create();
  console.log(`   ✅ Created ${Array.isArray(interviewers) ? interviewers.length : 1} interviewers`);

  // Example 3: Create spots for a barangay
  console.log('\n3️⃣  Creating 5 spots for Barangay 101...');
  const spots = await spotFactory()
    .forCycle(1)
    .forBarangay(101, 'Test Barangay')
    .unassigned()
    .times(5)
    .create();
  console.log(`   ✅ Created ${Array.isArray(spots) ? spots.length : 1} spots`);

  // Example 4: Create assignments
  console.log('\n4️⃣  Creating pending assignments...');
  const assignments = await assignmentFactory()
    .pending()
    .times(3)
    .create();
  console.log(`   ✅ Created ${Array.isArray(assignments) ? assignments.length : 1} assignments`);

  // Example 5: Make data without persisting
  console.log('\n5️⃣  Making data without saving to database...');
  const mockUser = userFactory()
    .admin()
    .with({ firstName: 'Test', lastName: 'Admin' })
    .make();
  console.log('   ✅ Mock data:', mockUser);

  console.log('\n🎉 Examples complete!\n');
}

examples().catch(console.error);
