/**
 * Backup System Diagnostic Script
 * Checks the current state and configuration of the backup system
 */

const fs = require('fs');
const path = require('path');

class BackupSystemDiagnostic {
  constructor() {
    this.issues = [];
    this.recommendations = [];
    this.status = {
      apiRoute: false,
      uiComponent: false,
      dependencies: false,
      environment: false
    };
  }

  checkFileExists(filePath, description) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}: Found`);
        return true;
      } else {
        console.log(`❌ ${description}: Missing`);
        this.issues.push(`Missing file: ${filePath}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${description}: Error checking - ${error.message}`);
      this.issues.push(`Error checking ${filePath}: ${error.message}`);
      return false;
    }
  }

  checkAPIRoute() {
    console.log('\n🔍 Checking API Route...');
    const apiPath = 'src/app/api/backups/route.ts';
    
    if (this.checkFileExists(apiPath, 'Backup API Route')) {
      try {
        const content = fs.readFileSync(apiPath, 'utf8');
        
        // Check for required functions
        const requiredFunctions = [
          'convertToCSV',
          'exportSurveyData',
          'exportUserData', 
          'exportBarangayData',
          'exportReports'
        ];
        
        let functionsFound = 0;
        for (const func of requiredFunctions) {
          if (content.includes(func)) {
            functionsFound++;
            console.log(`  ✅ Function ${func}: Found`);
          } else {
            console.log(`  ❌ Function ${func}: Missing`);
            this.issues.push(`Missing function: ${func}`);
          }
        }
        
        // Check for HTTP methods
        const hasGET = content.includes('export async function GET');
        const hasPOST = content.includes('export async function POST');
        
        if (hasGET) {
          console.log('  ✅ GET method: Implemented');
        } else {
          console.log('  ❌ GET method: Missing');
          this.issues.push('Missing GET method implementation');
        }
        
        if (hasPOST) {
          console.log('  ✅ POST method: Implemented');
        } else {
          console.log('  ❌ POST method: Missing');
          this.issues.push('Missing POST method implementation');
        }
        
        this.status.apiRoute = functionsFound === requiredFunctions.length && hasGET && hasPOST;
        
      } catch (error) {
        console.log(`  ❌ Error reading API route: ${error.message}`);
        this.issues.push(`Error reading API route: ${error.message}`);
      }
    }
  }

  checkUIComponent() {
    console.log('\n🔍 Checking UI Component...');
    const uiPath = 'src/app/settings/ui/sections/backup.tsx';
    
    if (this.checkFileExists(uiPath, 'Backup UI Component')) {
      try {
        const content = fs.readFileSync(uiPath, 'utf8');
        
        // Check for required UI elements
        const requiredElements = [
          'handleExportData',
          'handleCreateBackup',
          'handleDownloadBackup',
          'Export All Survey Data',
          'Export User Data',
          'Export Barangay Data',
          'Export Reports',
          'Create Backup Now'
        ];
        
        let elementsFound = 0;
        for (const element of requiredElements) {
          if (content.includes(element)) {
            elementsFound++;
            console.log(`  ✅ Element ${element}: Found`);
          } else {
            console.log(`  ❌ Element ${element}: Missing`);
            this.issues.push(`Missing UI element: ${element}`);
          }
        }
        
        // Check for toast notifications
        const hasToast = content.includes('useToast') && content.includes('addToast');
        if (hasToast) {
          console.log('  ✅ Toast notifications: Implemented');
        } else {
          console.log('  ❌ Toast notifications: Missing');
          this.issues.push('Missing toast notification implementation');
        }
        
        this.status.uiComponent = elementsFound === requiredElements.length && hasToast;
        
      } catch (error) {
        console.log(`  ❌ Error reading UI component: ${error.message}`);
        this.issues.push(`Error reading UI component: ${error.message}`);
      }
    }
  }

  checkDependencies() {
    console.log('\n🔍 Checking Dependencies...');
    const packagePath = 'package.json';
    
    if (this.checkFileExists(packagePath, 'Package.json')) {
      try {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        const requiredDeps = [
          '@supabase/supabase-js',
          'next',
          'react',
          'lucide-react'
        ];
        
        let depsFound = 0;
        for (const dep of requiredDeps) {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            depsFound++;
            console.log(`  ✅ Dependency ${dep}: ${packageJson.dependencies[dep]}`);
          } else {
            console.log(`  ❌ Dependency ${dep}: Missing`);
            this.issues.push(`Missing dependency: ${dep}`);
          }
        }
        
        this.status.dependencies = depsFound === requiredDeps.length;
        
      } catch (error) {
        console.log(`  ❌ Error reading package.json: ${error.message}`);
        this.issues.push(`Error reading package.json: ${error.message}`);
      }
    }
  }

  checkEnvironment() {
    console.log('\n🔍 Checking Environment Configuration...');
    
    const envFiles = ['.env', '.env.local'];
    let envFound = false;
    
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        console.log(`✅ Environment file: ${envFile} found`);
        envFound = true;
        
        try {
          const envContent = fs.readFileSync(envFile, 'utf8');
          
          const requiredVars = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY'
          ];
          
          for (const envVar of requiredVars) {
            if (envContent.includes(envVar)) {
              console.log(`  ✅ Environment variable ${envVar}: Found`);
            } else {
              console.log(`  ❌ Environment variable ${envVar}: Missing`);
              this.issues.push(`Missing environment variable: ${envVar}`);
            }
          }
          
        } catch (error) {
          console.log(`  ❌ Error reading ${envFile}: ${error.message}`);
          this.issues.push(`Error reading ${envFile}: ${error.message}`);
        }
      }
    }
    
    if (!envFound) {
      console.log('❌ No environment files found');
      this.issues.push('No environment configuration files found');
    }
    
    this.status.environment = envFound;
  }

  checkRelatedFiles() {
    console.log('\n🔍 Checking Related Files...');
    
    const relatedFiles = [
      { path: 'src/components/ui/button.tsx', desc: 'Button Component' },
      { path: 'src/components/ui/card.tsx', desc: 'Card Component' },
      { path: 'src/components/ui/switch.tsx', desc: 'Switch Component' },
      { path: 'src/components/ui/badge.tsx', desc: 'Badge Component' },
      { path: 'src/components/ui/progress.tsx', desc: 'Progress Component' },
      { path: 'src/hooks/use-toast.tsx', desc: 'Toast Hook' },
      { path: 'src/app/settings/page.tsx', desc: 'Settings Page' }
    ];
    
    let relatedFilesFound = 0;
    for (const file of relatedFiles) {
      if (this.checkFileExists(file.path, file.desc)) {
        relatedFilesFound++;
      }
    }
    
    console.log(`\n📊 Related files found: ${relatedFilesFound}/${relatedFiles.length}`);
  }

  generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');
    
    if (this.status.apiRoute && this.status.uiComponent && this.status.dependencies && this.status.environment) {
      this.recommendations.push('✅ Backup system appears to be fully configured and ready for testing');
      this.recommendations.push('🚀 Run manual tests using the test guide: BACKUP_FUNCTIONALITY_TEST_GUIDE.md');
    } else {
      if (!this.status.apiRoute) {
        this.recommendations.push('🔧 Fix API route issues before testing');
      }
      if (!this.status.uiComponent) {
        this.recommendations.push('🔧 Fix UI component issues before testing');
      }
      if (!this.status.dependencies) {
        this.recommendations.push('📦 Install missing dependencies: npm install');
      }
      if (!this.status.environment) {
        this.recommendations.push('⚙️ Configure environment variables for Supabase');
      }
    }
    
    this.recommendations.push('🧪 Run automated logic tests: node scripts/test-backup-logic.js');
    this.recommendations.push('🌐 Start development server: npm run dev');
    this.recommendations.push('🔍 Navigate to http://localhost:3000/settings to test manually');
  }

  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKUP SYSTEM DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n🔧 Component Status:');
    console.log(`API Route: ${this.status.apiRoute ? '✅ OK' : '❌ Issues Found'}`);
    console.log(`UI Component: ${this.status.uiComponent ? '✅ OK' : '❌ Issues Found'}`);
    console.log(`Dependencies: ${this.status.dependencies ? '✅ OK' : '❌ Issues Found'}`);
    console.log(`Environment: ${this.status.environment ? '✅ OK' : '❌ Issues Found'}`);
    
    const overallStatus = Object.values(this.status).every(status => status);
    console.log(`\n🎯 Overall Status: ${overallStatus ? '✅ READY' : '⚠️ NEEDS ATTENTION'}`);
    
    if (this.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  async runDiagnostic() {
    console.log('🔍 Starting Backup System Diagnostic...\n');
    
    this.checkAPIRoute();
    this.checkUIComponent();
    this.checkDependencies();
    this.checkEnvironment();
    this.checkRelatedFiles();
    this.generateRecommendations();
    this.generateSummary();
    
    // Save diagnostic results
    const results = {
      timestamp: new Date().toISOString(),
      status: this.status,
      issues: this.issues,
      recommendations: this.recommendations,
      overallStatus: Object.values(this.status).every(status => status) ? 'READY' : 'NEEDS_ATTENTION'
    };
    
    try {
      fs.writeFileSync('backup-diagnostic-results.json', JSON.stringify(results, null, 2));
      console.log('\n💾 Diagnostic results saved to: backup-diagnostic-results.json');
    } catch (error) {
      console.error(`Failed to save diagnostic results: ${error.message}`);
    }
  }
}

// Run diagnostic if this script is executed directly
if (require.main === module) {
  const diagnostic = new BackupSystemDiagnostic();
  diagnostic.runDiagnostic().catch(error => {
    console.error('Diagnostic execution failed:', error);
    process.exit(1);
  });
}

module.exports = BackupSystemDiagnostic;