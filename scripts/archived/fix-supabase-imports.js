const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/survey-targets/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/survey-cycles/route.ts',
  'src/app/api/barangays/all/route.ts',
  'src/app/api/barangays/route.ts',
  'src/app/api/barangays/[id]/route.ts',
  'src/app/api/assignments/route.ts'
];

function fixSupabaseImports() {
  console.log('🔧 Fixing Supabase imports in API routes...');

  filesToFix.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace Supabase import with Prisma
        content = content.replace(
          /import { createClient } from '@supabase\/supabase-js';/g,
          "import { PrismaClient } from '@prisma/client';"
        );
        
        // Replace Supabase client creation with Prisma
        content = content.replace(
          /const supabase = createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.SUPABASE_SERVICE_ROLE_KEY!\s*\);/g,
          'const prisma = new PrismaClient();'
        );
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${filePath}`);
      } else {
        console.log(`⚠️ File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });

  console.log('🎉 Supabase import fixes completed!');
}

fixSupabaseImports();