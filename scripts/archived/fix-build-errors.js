#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with their specific issues
const fixes = [
  // Remove unused imports and variables
  {
    file: 'src/app/analytics/page.tsx',
    replacements: [
      {
        search: /const\s+{\s*user\s*}\s*=\s*[^;]+;/,
        replace: '// const { user } = useAuth(); // Removed unused variable'
      }
    ]
  },
  {
    file: 'src/app/api/logout/route.ts',
    replacements: [
      {
        search: /import\s*{\s*NextRequest[^}]*}\s*from\s*["'][^"']+["'];?/,
        replace: 'import { NextResponse } from "next/server";'
      }
    ]
  },
  {
    file: 'src/app/page.tsx',
    replacements: [
      {
        search: /Shield,?\s*/,
        replace: ''
      },
      {
        search: /LinkIcon,?\s*/,
        replace: ''
      }
    ]
  },
  {
    file: 'src/app/settings/page.tsx',
    replacements: [
      {
        search: /Badge,?\s*/,
        replace: ''
      }
    ]
  },
  // Fix any types
  {
    file: 'src/app/api/assignments/route.ts',
    replacements: [
      {
        search: /:\s*any\b/g,
        replace: ': unknown'
      }
    ]
  }
];

function applyFixes() {
  console.log('🔧 Applying build error fixes...\n');
  
  fixes.forEach(({ file, replacements }) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ search, replace }) => {
      if (content.match(search)) {
        content = content.replace(search, replace);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`ℹ️  No changes needed: ${file}`);
    }
  });
  
  console.log('\n🎉 Build error fixes completed!');
}

applyFixes();