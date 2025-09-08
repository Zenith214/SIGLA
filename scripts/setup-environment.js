#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 SIGLA-2 Environment Setup');
console.log('============================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file already exists');
  console.log('📝 Current content:');
  console.log('-------------------');
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content);
} else {
  console.log('❌ .env.local file not found');
  console.log('\n📋 Please create a .env.local file with the following content:\n');
  
  const envTemplate = `# SIGLA-2 Environment Configuration
# Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://[your-project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# JWT Configuration
JWT_SECRET="your_secure_jwt_secret_key_here_change_this_in_production"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"

# Development Configuration
NODE_ENV="development"`;

  console.log(envTemplate);
  
  console.log('\n🔧 Setup Instructions:');
  console.log('1. Create a new file called .env.local in your project root');
  console.log('2. Copy the template above into the file');
  console.log('3. Replace [YOUR_PASSWORD], [YOUR_HOST], etc. with your actual values');
  console.log('4. If using XAMPP MySQL instead of Supabase, use:');
  console.log('   DATABASE_URL="mysql://root@localhost:3306/sigla_db"');
}

console.log('\n🔍 Current Database Configuration:');
console.log('===================================');

// Check Prisma schema
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const providerMatch = schema.match(/provider\s*=\s*"([^"]+)"/);
  if (providerMatch) {
    console.log(`📊 Database Provider: ${providerMatch[1]}`);
  }
  
  const urlMatch = schema.match(/url\s*=\s*env\("([^"]+)"\)/);
  if (urlMatch) {
    console.log(`🔗 Environment Variable: ${urlMatch[1]}`);
  }
}

console.log('\n🚀 Next Steps:');
console.log('1. Ensure your database is running (XAMPP MySQL or Supabase)');
console.log('2. Update your .env.local file with correct credentials');
console.log('3. Run: npx prisma generate');
console.log('4. Run: npx prisma db push');
console.log('5. Restart your Next.js development server');

