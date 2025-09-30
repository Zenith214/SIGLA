const fs = require('fs');

function extractSVGPaths() {
  console.log('🗺️ Extracting all barangay paths from SVG file...');
  
  try {
    const svgContent = fs.readFileSync('public/sulopmap.svg', 'utf8');
    
    // Extract all path elements with IDs (id comes after d in this SVG)
    const pathRegex = /<path[^>]*d="([^"]*)"[^>]*id="([^"]*)"[^>]*\/>/g;
    const paths = {};
    let match;
    
    while ((match = pathRegex.exec(svgContent)) !== null) {
      const pathData = match[1];
      const id = match[2];
      
      // Only include paths that look like barangay IDs
      if (id.match(/^\d+[a-z-]+$/)) {
        paths[id] = pathData;
        console.log(`✅ Found path: ${id}`);
      }
    }
    
    console.log(`\n📊 Total paths extracted: ${Object.keys(paths).length}`);
    
    // Generate TypeScript code for the paths
    let tsCode = '// Barangay path data extracted from SVG\nconst barangayPaths: { [key: string]: string } = {\n';
    
    Object.entries(paths).forEach(([id, pathData]) => {
      tsCode += `  "${id}": "${pathData}",\n`;
    });
    
    tsCode += '};\n\nexport default barangayPaths;';
    
    // Write to file
    fs.writeFileSync('src/data/barangayPaths.ts', tsCode);
    console.log('\n✅ Path data written to src/data/barangayPaths.ts');
    
    return paths;
    
  } catch (error) {
    console.error('❌ Error extracting SVG paths:', error);
    return {};
  }
}

// Run the extraction
const paths = extractSVGPaths();
console.log('\n🎯 Extracted paths:', Object.keys(paths));