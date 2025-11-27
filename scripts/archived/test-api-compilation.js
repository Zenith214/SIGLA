const fs = require('fs');
const path = require('path');

function checkApiRoute(filePath) {
  console.log(`🔍 Checking ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for common issues
  const issues = [];
  
  // Check if still has supabase imports
  if (content.includes('@supabase/supabase-js')) {
    issues.push('Still has Supabase import');
  }
  
  // Check if has prisma import
  if (!content.includes('@prisma/client')) {
    issues.push('Missing Prisma import');
  }
  
  // Check if still has supabase variable
  if (content.includes('const supabase =')) {
    issues.push('Still has supabase variable');
  }
  
  // Check if has prisma variable
  if (!content.includes('const prisma =')) {
    issues.push('Missing prisma variable');
  }
  
  // Check for supabase query patterns
  if (content.includes('supabase.from(')) {
    issues.push('Still has Supabase query syntax');
  }
  
  // Check for prisma disconnect
  if (content.includes('prisma.') && !content.includes('prisma.$disconnect()')) {
    issues.push('Missing prisma.$disconnect()');
  }
  
  if (issues.length === 0) {
    console.log(`✅ ${filePath} looks good`);
    return true;
  } else {
    console.log(`⚠️ ${filePath} has issues:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
}

const apiRoutes = [
  'src/app/api/login/route.ts',
  'src/app/api/barangays/route.ts',
  'src/app/api/barangays/all/route.ts',
  'src/app/api/barangays/[id]/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/assignments/route.ts',
  'src/app/api/survey-cycles/route.ts',
  'src/app/api/survey-targets/route.ts'
];

console.log('🔍 Checking API routes for compilation issues...\n');

let allGood = true;
apiRoutes.forEach(route => {
  const isGood = checkApiRoute(route);
  allGood = allGood && isGood;
  console.log('');
});

if (allGood) {
  console.log('🎉 All API routes look good for compilation!');
} else {
  console.log('⚠️ Some API routes need manual fixes.');
}