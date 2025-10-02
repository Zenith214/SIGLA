#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing ML System with Database Saves...');

// Test the ML analysis with database saves enabled
const mlScript = path.join(__dirname, '../ml/analyze_barangay.py');
const testProcess = spawn('python', [mlScript, '--barangay_id', '1'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let output = '';
let errorOutput = '';

testProcess.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

testProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  process.stderr.write(data);
});

testProcess.on('close', (code) => {
  console.log(`\n📊 ML Test completed with exit code: ${code}`);
  
  if (code === 0) {
    console.log('✅ ML analysis successful!');
    
    if (output.includes('Database save successful') || output.includes('saved to database')) {
      console.log('✅ Database saves are working!');
    } else if (output.includes('Database save failed') || errorOutput.includes('403') || errorOutput.includes('400')) {
      console.log('❌ Database saves still failing - check permissions');
    } else {
      console.log('⚠️  Database save status unclear - check output above');
    }
  } else {
    console.log('❌ ML analysis failed - check error output above');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('1. If database saves failed, run: node scripts/fix-ml-database-issues.js');
  console.log('2. Check Supabase dashboard for RLS policies');
  console.log('3. Verify SUPABASE_SERVICE_ROLE_KEY in .env.local');
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to start ML test:', error.message);
  console.log('\n🔧 Possible solutions:');
  console.log('1. Install Python: python --version');
  console.log('2. Install ML dependencies: cd ml && pip install -r requirements.txt');
  console.log('3. Check ML script exists: ls -la ml/analyze_barangay.py');
});
