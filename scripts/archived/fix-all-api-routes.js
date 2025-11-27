const fs = require('fs');
const path = require('path');

function fixApiRoute(filePath) {
  console.log(`🔧 Fixing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Supabase import with Prisma (if not already done)
  content = content.replace(
    /import { createClient } from '@supabase\/supabase-js';/g,
    "import { PrismaClient } from '@prisma/client';"
  );
  
  // Replace Supabase client creation with Prisma (if not already done)
  content = content.replace(
    /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY!\s*\);/g,
    'const prisma = new PrismaClient();'
  );

  // Fix common Supabase query patterns
  
  // Replace .from('table').select() patterns
  content = content.replace(
    /await supabase\s*\.from\('(\w+)'\)\s*\.select\([^)]*\)/g,
    'await prisma.$1.findMany()'
  );
  
  // Replace basic supabase queries with prisma equivalents
  content = content.replace(/supabase\s*\./g, 'prisma.');
  
  // Add prisma disconnect in catch blocks
  if (content.includes('} catch') && !content.includes('prisma.$disconnect()')) {
    content = content.replace(
      /(\s*}\s*catch[^}]+}\s*)$/,
      '$1 finally {\n    await prisma.$disconnect();\n  }\n}'
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// List of API routes to fix
const apiRoutes = [
  'src/app/api/survey-targets/route.ts',
  'src/app/api/users/route.ts', 
  'src/app/api/users/[id]/route.ts',
  'src/app/api/survey-cycles/route.ts',
  'src/app/api/barangays/all/route.ts',
  'src/app/api/barangays/[id]/route.ts',
  'src/app/api/assignments/route.ts'
];

console.log('🚀 Starting API route fixes...');

apiRoutes.forEach(fixApiRoute);

console.log('🎉 All API routes have been processed!');
console.log('\n⚠️ Note: Some routes may need manual review for complex queries.');
console.log('Please test each endpoint to ensure they work correctly.');