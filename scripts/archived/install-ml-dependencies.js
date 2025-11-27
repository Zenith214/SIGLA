#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🐍 Installing ML Python Dependencies...\n');

// Check if Python is available
function checkPython() {
  return new Promise((resolve) => {
    const pythonCheck = spawn('python', ['--version'], { stdio: 'pipe' });
    
    pythonCheck.on('close', (code) => {
      if (code === 0) {
        resolve('python');
      } else {
        // Try python3
        const python3Check = spawn('python3', ['--version'], { stdio: 'pipe' });
        python3Check.on('close', (code3) => {
          resolve(code3 === 0 ? 'python3' : null);
        });
      }
    });
  });
}

// Check if pip is available
function checkPip(pythonCmd) {
  return new Promise((resolve) => {
    const pipCheck = spawn(pythonCmd, ['-m', 'pip', '--version'], { stdio: 'pipe' });
    pipCheck.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

// Install requirements
function installRequirements(pythonCmd) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Installing Python dependencies using ${pythonCmd}...`);
    
    const mlDir = path.join(process.cwd(), 'ml');
    const requirementsPath = path.join(mlDir, 'requirements.txt');
    
    if (!fs.existsSync(requirementsPath)) {
      reject(new Error('requirements.txt not found in ml/ directory'));
      return;
    }
    
    console.log(`📄 Using requirements file: ${requirementsPath}`);
    
    const installProcess = spawn(pythonCmd, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
      cwd: mlDir,
      stdio: 'inherit'
    });
    
    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pip install failed with exit code ${code}`));
      }
    });
    
    installProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Test ML imports
function testMLImports(pythonCmd) {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 Testing ML imports...');
    
    const testScript = `
import sys
try:
    import pandas
    print("✅ pandas imported successfully")
    import numpy
    print("✅ numpy imported successfully")
    import sklearn
    print("✅ scikit-learn imported successfully")
    import psycopg2
    print("✅ psycopg2 imported successfully")
    import supabase
    print("✅ supabase imported successfully")
    print("\\n🎉 All ML dependencies are working!")
    sys.exit(0)
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
`;
    
    const testProcess = spawn(pythonCmd, ['-c', testScript], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('ML import test failed'));
      }
    });
  });
}

// Main installation process
async function main() {
  try {
    // Check Python availability
    console.log('🔍 Checking Python installation...');
    const pythonCmd = await checkPython();
    
    if (!pythonCmd) {
      console.error('❌ Python not found. Please install Python 3.7+ and try again.');
      console.log('\n📥 Installation options:');
      console.log('• Windows: Download from https://python.org');
      console.log('• macOS: brew install python3');
      console.log('• Linux: sudo apt install python3 python3-pip');
      process.exit(1);
    }
    
    console.log(`✅ Found Python: ${pythonCmd}`);
    
    // Check pip availability
    console.log('🔍 Checking pip installation...');
    const hasPip = await checkPip(pythonCmd);
    
    if (!hasPip) {
      console.error('❌ pip not found. Please install pip and try again.');
      process.exit(1);
    }
    
    console.log('✅ Found pip');
    
    // Install requirements
    await installRequirements(pythonCmd);
    console.log('✅ Python dependencies installed successfully');
    
    // Test imports
    await testMLImports(pythonCmd);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Test ML analysis: cd ml && python analyze_barangay.py --barangay-id 1');
    console.log('2. Test API endpoints: node scripts/test-ml-api-endpoints.js');
    console.log('3. Check database saves are working');
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('• Make sure Python 3.7+ is installed');
    console.log('• Try upgrading pip: python -m pip install --upgrade pip');
    console.log('• On Windows, you might need Visual C++ Build Tools for psycopg2');
    console.log('• Alternative: pip install psycopg2-binary instead of psycopg2');
    
    process.exit(1);
  }
}

main();