const fs = require('fs');

const filesToFix = [
  'src/app/api/barangays/all/route.ts',
  'src/app/api/barangays/[id]/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/assignments/route.ts',
  'src/app/api/survey-cycles/route.ts',
  'src/app/api/survey-targets/route.ts'
];

function addPrismaDisconnect(filePath) {
  console.log(`🔧 Adding prisma.$disconnect() to ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the last catch block and add finally block if not present
  if (content.includes('} catch') && !content.includes('finally')) {
    // Replace the last } catch block with } catch block + finally
    content = content.replace(
      /(}\s*catch\s*\([^)]*\)\s*{[^}]*})\s*$/,
      '$1 finally {\n    await prisma.$disconnect();\n  }\n}'
    );
  }
  
  // If there's no catch block, add finally to the end of the function
  if (!content.includes('} catch') && !content.includes('finally')) {
    // Find the last return statement and add finally after it
    content = content.replace(
      /(return\s+NextResponse\.json\([^;]*;\s*})\s*$/,
      '$1 finally {\n    await prisma.$disconnect();\n  }\n}'
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath}`);
}

console.log('🔧 Adding prisma.$disconnect() to API routes...');

filesToFix.forEach(addPrismaDisconnect);

console.log('🎉 Prisma disconnect calls added!');