#!/usr/bin/env tsx

/**
 * Create Developer User Script
 * 
 * Creates a developer user with full system access.
 * Usage: npm run create-dev-user
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Make sure your .env file contains these variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createDeveloperUser() {
  console.log('🔧 Developer User Creation Tool\n');
  console.log('⚠️  WARNING: Developer role has FULL SYSTEM ACCESS');
  console.log('⚠️  Use only in development environments\n');

  // Get user input
  const firstName = await question('First Name (default: System): ') || 'System';
  const lastName = await question('Last Name (default: Developer): ') || 'Developer';
  const email = await question('Email (default: dev@pulse.local): ') || 'dev@pulse.local';
  const password = await question('Password (default: developer123): ') || 'developer123';
  const phone = await question('Phone (default: +1234567890): ') || '+1234567890';

  console.log('\n📝 Creating developer user with:');
  console.log(`   Name: ${firstName} ${lastName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: developer`);
  console.log(`   Phone: ${phone}\n`);

  const confirm = await question('Continue? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('❌ Cancelled');
    rl.close();
    process.exit(0);
  }

  try {
    // Hash the password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    console.log('🔍 Checking for existing user...');
    const { data: existingUser } = await supabase
      .from('user')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log(`⚠️  User with email ${email} already exists`);
      const update = await question('Update existing user to developer role? (yes/no): ');
      
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        const { error } = await supabase
          .from('user')
          .update({
            firstName: firstName,
            lastName: lastName,
            password: hashedPassword,
            role: 'developer',
            phone,
            organization: 'PULSE Development',
            jobTitle: 'System Developer',
          })
          .eq('email', email);

        if (error) {
          console.error('❌ Error updating user:', error.message);
          rl.close();
          process.exit(1);
        }

        console.log('\n✅ Developer user updated successfully!');
      } else {
        console.log('❌ Cancelled');
        rl.close();
        process.exit(0);
      }
    } else {
      // Create new user
      console.log('➕ Creating new developer user...');
      const { error } = await supabase
        .from('user')
        .insert({
          firstName: firstName,
          lastName: lastName,
          email,
          password: hashedPassword,
          role: 'developer',
          phone,
          organization: 'PULSE Development',
          jobTitle: 'System Developer',
        });

      if (error) {
        console.error('❌ Error creating user:', error.message);
        rl.close();
        process.exit(1);
      }

      console.log('\n✅ Developer user created successfully!');
    }

    // Verify the user
    console.log('\n🔍 Verifying user...');
    const { data: verifyUser, error: verifyError } = await supabase
      .from('user')
      .select('id, firstName, lastName, email, role')
      .eq('email', email)
      .single();

    if (verifyError || !verifyUser) {
      console.error('❌ Error verifying user:', verifyError?.message);
      rl.close();
      process.exit(1);
    }

    console.log('\n✅ User verified:');
    console.log(`   ID: ${verifyUser.id}`);
    console.log(`   Name: ${verifyUser.firstName} ${verifyUser.lastName}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Role: ${verifyUser.role}`);

    console.log('\n🎉 Developer user is ready to use!');
    console.log('\n📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🔗 Access the developer dashboard at:');
    console.log('   http://localhost:3000/dev-dashboard');
    console.log('\n⚠️  Remember: Developer role should ONLY be used in development!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// Run the script
createDeveloperUser().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
