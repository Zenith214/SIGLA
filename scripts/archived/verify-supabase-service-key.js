#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Supabase Service Key Configuration...\n');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('📋 Environment Variables Check:');
console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ Missing required Supabase configuration');
  console.log('\n🔧 To fix this:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the following values to your .env.local file:');
  console.log('   - Project URL (as SUPABASE_URL)');
  console.log('   - service_role key (as SUPABASE_SERVICE_ROLE_KEY) - NOT the anon key!');
  process.exit(1);
}

// Analyze the keys to ensure they're correct
console.log('\n🔍 Key Analysis:');

if (supabaseServiceKey) {
  // Service role keys typically start with 'eyJ' and are much longer
  const isLikelyServiceKey = supabaseServiceKey.startsWith('eyJ') && supabaseServiceKey.length > 100;
  console.log(`   Service Key Format: ${isLikelyServiceKey ? '✅ Looks correct' : '⚠️  Might be wrong format'}`);
  console.log(`   Service Key Length: ${supabaseServiceKey.length} characters`);
  
  if (!isLikelyServiceKey) {
    console.log('\n⚠️  WARNING: Your SUPABASE_SERVICE_ROLE_KEY might not be correct!');
    console.log('   Service role keys should:');
    console.log('   - Start with "eyJ"');
    console.log('   - Be very long (200+ characters)');
    console.log('   - Have "service_role" in the decoded JWT payload');
  }
}

if (supabaseAnonKey) {
  const isLikelyAnonKey = supabaseAnonKey.startsWith('eyJ');
  console.log(`   Anon Key Format: ${isLikelyAnonKey ? '✅ Looks correct' : '⚠️  Might be wrong format'}`);
  console.log(`   Anon Key Length: ${supabaseAnonKey.length} characters`);
}

// Check if they're the same (common mistake)
if (supabaseServiceKey && supabaseAnonKey && supabaseServiceKey === supabaseAnonKey) {
  console.log('\n❌ ERROR: Service key and anon key are the same!');
  console.log('   This is incorrect. You need two different keys:');
  console.log('   - SUPABASE_ANON_KEY: For client-side operations');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY: For server-side operations with elevated permissions');
}

// Test the service key by trying to decode it (basic check)
if (supabaseServiceKey && supabaseServiceKey.startsWith('eyJ')) {
  try {
    const payload = JSON.parse(Buffer.from(supabaseServiceKey.split('.')[1], 'base64').toString());
    console.log('\n🔓 Service Key JWT Payload:');
    console.log(`   Role: ${payload.role || 'Not specified'}`);
    console.log(`   Issuer: ${payload.iss || 'Not specified'}`);
    console.log(`   Expires: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Never'}`);
    
    if (payload.role === 'service_role') {
      console.log('   ✅ Correct role: service_role');
    } else {
      console.log(`   ❌ Wrong role: ${payload.role} (should be service_role)`);
    }
  } catch (error) {
    console.log('\n⚠️  Could not decode service key JWT');
  }
}

console.log('\n📋 Supabase Dashboard Instructions:');
console.log('1. Open: https://supabase.com/dashboard/projects');
console.log('2. Select your project');
console.log('3. Go to: Settings → API');
console.log('4. Find these sections:');
console.log('   - "Project URL" → Copy to SUPABASE_URL');
console.log('   - "Project API keys" → Copy "service_role" key to SUPABASE_SERVICE_ROLE_KEY');
console.log('   - "Project API keys" → Copy "anon public" key to SUPABASE_ANON_KEY');

console.log('\n🔧 Example .env.local format:');
console.log('SUPABASE_URL=https://your-project.supabase.co');
console.log('SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...(very long)');
console.log('SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...(different from service key)');

if (supabaseServiceKey && supabaseServiceKey.startsWith('eyJ')) {
  console.log('\n✅ Your service key appears to be in the correct format');
  console.log('🚀 Ready to run: node scripts/fix-supabase-ml-permissions.js');
} else {
  console.log('\n❌ Please verify your service key before proceeding');
}