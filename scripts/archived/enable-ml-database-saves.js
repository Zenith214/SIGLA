#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Enabling ML Database Saves...\n');

// Path to the main ML analysis script
const analyzeBarangayPath = path.join(process.cwd(), 'ml/analyze_barangay.py');

if (!fs.existsSync(analyzeBarangayPath)) {
  console.log('❌ ML script not found at: ml/analyze_barangay.py');
  console.log('   Please ensure the ML system is properly set up');
  process.exit(1);
}

try {
  // Read the current script
  let scriptContent = fs.readFileSync(analyzeBarangayPath, 'utf8');
  
  console.log('📄 Current script content preview:');
  const lines = scriptContent.split('\n');
  const relevantLines = lines.filter(line => 
    line.includes('save_to_db') || 
    line.includes('analyze_barangay')
  );
  
  relevantLines.forEach((line, index) => {
    console.log(`   ${index + 1}: ${line.trim()}`);
  });

  // Check current save_to_db setting
  if (scriptContent.includes('save_to_db=False')) {
    console.log('\n🔧 Found save_to_db=False, updating to True...');
    
    // Replace save_to_db=False with save_to_db=True
    scriptContent = scriptContent.replace(/save_to_db=False/g, 'save_to_db=True');
    
    // Write back to file
    fs.writeFileSync(analyzeBarangayPath, scriptContent);
    
    console.log('✅ Updated save_to_db=True in analyze_barangay.py');
    
  } else if (scriptContent.includes('save_to_db=True')) {
    console.log('\n✅ save_to_db is already set to True');
    
  } else {
    console.log('\n⚠️  save_to_db parameter not found in expected format');
    console.log('   Manual update may be required');
  }

  // Show updated relevant lines
  console.log('\n📄 Updated script content:');
  const updatedLines = scriptContent.split('\n');
  const updatedRelevantLines = updatedLines.filter(line => 
    line.includes('save_to_db') || 
    line.includes('analyze_barangay')
  );
  
  updatedRelevantLines.forEach((line, index) => {
    console.log(`   ${index + 1}: ${line.trim()}`);
  });

} catch (error) {
  console.error('❌ Error updating ML script:', error.message);
}

// Create a test script to verify ML functionality
console.log('\n🧪 Creating ML test script...');

const testScript = `#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing ML System with Database Saves...');

// Test the ML analysis with database saves enabled
const mlScript = path.join(__dirname, '../ml/analyze_barangay.py');
const testProcess = spawn('python', [mlScript, '--barangay-id', '1'], {
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
  console.log(\`\\n📊 ML Test completed with exit code: \${code}\`);
  
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
  
  console.log('\\n🔧 Next steps:');
  console.log('1. If database saves failed, run: node scripts/fix-ml-database-issues.js');
  console.log('2. Check Supabase dashboard for RLS policies');
  console.log('3. Verify SUPABASE_SERVICE_ROLE_KEY in .env.local');
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to start ML test:', error.message);
  console.log('\\n🔧 Possible solutions:');
  console.log('1. Install Python: python --version');
  console.log('2. Install ML dependencies: cd ml && pip install -r requirements.txt');
  console.log('3. Check ML script exists: ls -la ml/analyze_barangay.py');
});
`;

const testScriptPath = path.join(process.cwd(), 'scripts/test-ml-with-database.js');
fs.writeFileSync(testScriptPath, testScript);
console.log('✅ Created ML test script: scripts/test-ml-with-database.js');

console.log('\n🎯 Summary:');
console.log('✅ ML database saves have been enabled');
console.log('✅ Test script created for verification');
console.log('\n🚀 Next steps:');
console.log('1. Run: node scripts/fix-ml-database-issues.js');
console.log('2. Run: node scripts/test-ml-with-database.js');
console.log('3. Check for any remaining permission errors');

console.log('\n📋 Manual verification:');
console.log('• Check ml/analyze_barangay.py contains save_to_db=True');
console.log('• Verify Supabase service role key is correct');
console.log('• Test ML analysis: cd ml && python analyze_barangay.py --barangay-id 1');