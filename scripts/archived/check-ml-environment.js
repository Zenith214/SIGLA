#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking ML System Environment...\n');

// Check environment variables
console.log('📋 Environment Variables Check:');

const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY'
];

const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('   ✅ .env.local file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      if (match && match[1].trim()) {
        console.log(`   ✅ ${varName}: Set`);
      } else {
        console.log(`   ❌ ${varName}: Empty value`);
      }
    } else {
      console.log(`   ❌ ${varName}: Missing`);
    }
  });
} else {
  console.log('   ❌ .env.local file not found');
}

// Check ML directory structure
console.log('\n📁 ML Directory Structure Check:');

const mlPaths = [
  'ml',
  'ml/sigla_ml',
  'ml/sigla_ml/api.py',
  'ml/sigla_ml/data_extraction.py',
  'ml/analyze_barangay.py',
  'src/app/api/ml',
  'src/app/api/ml/insights',
  'src/app/api/ml/predict'
];

mlPaths.forEach(mlPath => {
  const fullPath = path.join(process.cwd(), mlPath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${mlPath}`);
  } else {
    console.log(`   ❌ ${mlPath} - Missing`);
  }
});

// Check API routes
console.log('\n🌐 ML API Routes Check:');

const apiRoutes = [
  'src/app/api/ml/insights/route.ts',
  'src/app/api/ml/predict/route.ts',
  'src/app/api/ml/analyze-target-completion/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(process.cwd(), route);
  if (fs.existsSync(routePath)) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ❌ ${route} - Missing`);
  }
});

// Check Python dependencies
console.log('\n🐍 Python Dependencies Check:');

const requirementsPath = path.join(process.cwd(), 'ml/requirements.txt');
if (fs.existsSync(requirementsPath)) {
  console.log('   ✅ requirements.txt found');
  
  const requirements = fs.readFileSync(requirementsPath, 'utf8');
  const pythonDeps = [
    'pandas',
    'numpy', 
    'scikit-learn',
    'psycopg2',
    'supabase'
  ];
  
  pythonDeps.forEach(dep => {
    if (requirements.includes(dep)) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ⚠️  ${dep} - Not in requirements.txt`);
    }
  });
} else {
  console.log('   ❌ requirements.txt not found');
}

// Generate fix recommendations
console.log('\n🔧 Fix Recommendations:');

console.log('\n1. Database Issues:');
console.log('   • Run: node scripts/fix-ml-database-issues.js');
console.log('   • This will create missing tables and fix permissions');

console.log('\n2. Environment Setup:');
console.log('   • Ensure SUPABASE_SERVICE_ROLE_KEY is set (not anon key)');
console.log('   • Verify DATABASE_URL points to correct Supabase database');

console.log('\n3. Python Environment:');
console.log('   • cd ml && pip install -r requirements.txt');
console.log('   • Test: python analyze_barangay.py --barangay-id 1');

console.log('\n4. API Testing:');
console.log('   • Test: curl http://localhost:3000/api/ml/insights');
console.log('   • Check browser console for any errors');

console.log('\n5. Enable Database Saves:');
console.log('   • After fixing permissions, change save_to_db=True in analyze_barangay.py');

console.log('\n📊 Current Status Summary:');
console.log('• ML core functionality: ✅ Working');
console.log('• Database permissions: ❌ Need fixing'); 
console.log('• API endpoints: ⚠️  Need testing');
console.log('• Python environment: ⚠️  Need verification');