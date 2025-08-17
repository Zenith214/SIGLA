#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Updating database schema and regenerating Prisma client...');

try {
  // Push schema changes to database
  console.log('📤 Pushing schema changes to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🔧 Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Database update completed successfully!');
  console.log('');
  console.log('You can now run the seeding script:');
  console.log('  npm run seed-barangays');
  console.log('');
  console.log('Or use the web interface:');
  console.log('  Go to Settings > Barangays > Click "Seed Real Data"');
  
} catch (error) {
  console.error('❌ Error updating database:', error.message);
  process.exit(1);
}