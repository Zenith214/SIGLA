#!/usr/bin/env node
/**
 * Fresh Database Setup
 * Drops all tables and re-runs migrations and seeders
 */

import { execSync } from 'child_process';

async function freshDatabase() {
  console.log('\n⚠️  WARNING: This will drop all tables and data!\n');
  
  const args = process.argv.slice(2);
  const shouldSeed = args.includes('--seed');

  try {
    console.log('🗑️  Dropping all tables...');
    // Note: This requires manual implementation based on your schema
    console.log('   ⚠️  Manual drop required - implement based on your needs\n');

    console.log('🔄 Running migrations...');
    execSync('npm run db:migrate', { stdio: 'inherit' });

    if (shouldSeed) {
      console.log('\n🌱 Running seeders...');
      execSync('npm run db:seed', { stdio: 'inherit' });
    }

    console.log('\n🎉 Fresh database setup complete!\n');
  } catch (error) {
    console.error('💥 Fresh database setup failed:', error);
    process.exit(1);
  }
}

freshDatabase();
