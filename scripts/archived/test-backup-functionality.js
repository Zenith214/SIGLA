/**
 * Comprehensive Backup Functionality Test Script
 * Tests all backup API endpoints and functionality
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS_FILE = 'backup-test-results.json';

class BackupTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    this.results.summary.total++;
    
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`,
        result: result,
        timestamp: new Date().toISOString()
      });
      
      this.results.summary.passed++;
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      return result;
    } catch (error) {
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      this.results.summary.failed++;
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      return null;
    }
  }

  async testBackupHistoryAPI() {
    const response = await fetch(`${BASE_URL}/api/backups`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!Array.isArray(data)) {
      throw new Error('Response should be an array of backup history');
    }
    
    // Validate backup entry structure
    if (data.length > 0) {
      const backup = data[0];
      const requiredFields = ['id', 'date', 'time', 'size', 'status', 'type'];
      
      for (const field of requiredFields) {
        if (!(field in backup)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
    }
    
    return {
      backupCount: data.length,
      sampleBackup: data[0] || null,
      allBackups: data
    };
  }

  async testCreateBackupAPI() {
    const response = await fetch(`${BASE_URL}/api/backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'create-backup' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    const requiredFields = ['success', 'backup', 'message'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!data.success) {
      throw new Error('Backup creation was not successful');
    }
    
    // Validate backup object
    const backup = data.backup;
    const backupFields = ['id', 'date', 'time', 'size', 'status', 'type'];
    for (const field of backupFields) {
      if (!(field in backup)) {
        throw new Error(`Missing backup field: ${field}`);
      }
    }
    
    return data;
  }

  async testSurveyDataExport() {
    const response = await fetch(`${BASE_URL}/api/backups?export=survey-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/csv')) {
      throw new Error(`Expected CSV content type, got: ${contentType}`);
    }
    
    // Check content disposition header
    const contentDisposition = response.headers.get('content-disposition');
    if (!contentDisposition || !contentDisposition.includes('attachment')) {
      throw new Error('Missing or invalid Content-Disposition header');
    }
    
    const csvData = await response.text();
    
    // Basic CSV validation
    const lines = csvData.split('\n');
    if (lines.length < 1) {
      throw new Error('CSV should have at least a header row');
    }
    
    const headers = lines[0].split(',');
    const expectedHeaders = [
      'response_id', 'barangay_id', 'interviewer_id', 'respondent_name',
      'respondent_age', 'respondent_gender', 'household_head', 'contact_number',
      'created_at', 'updated_at'
    ];
    
    for (const expectedHeader of expectedHeaders) {
      if (!headers.includes(expectedHeader)) {
        throw new Error(`Missing expected header: ${expectedHeader}`);
      }
    }
    
    return {
      rowCount: lines.length - 1, // Exclude header
      headers: headers,
      sampleData: lines.slice(0, 3), // First 3 lines including header
      fileSize: csvData.length
    };
  }

  async testUserDataExport() {
    const response = await fetch(`${BASE_URL}/api/backups?export=user-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/csv')) {
      throw new Error(`Expected CSV content type, got: ${contentType}`);
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const expectedHeaders = ['user_id', 'username', 'email', 'role', 'created_at', 'updated_at'];
    for (const expectedHeader of expectedHeaders) {
      if (!headers.includes(expectedHeader)) {
        throw new Error(`Missing expected header: ${expectedHeader}`);
      }
    }
    
    return {
      rowCount: lines.length - 1,
      headers: headers,
      fileSize: csvData.length
    };
  }

  async testBarangayDataExport() {
    const response = await fetch(`${BASE_URL}/api/backups?export=barangay-data`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/csv')) {
      throw new Error(`Expected CSV content type, got: ${contentType}`);
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    const expectedHeaders = [
      'barangay_id', 'barangay_name', 'population', 'households',
      'area', 'seal', 'created_at', 'updated_at'
    ];
    
    for (const expectedHeader of expectedHeaders) {
      if (!headers.includes(expectedHeader)) {
        throw new Error(`Missing expected header: ${expectedHeader}`);
      }
    }
    
    return {
      rowCount: lines.length - 1,
      headers: headers,
      fileSize: csvData.length
    };
  }

  async testReportsExport() {
    const response = await fetch(`${BASE_URL}/api/backups?export=reports`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/plain')) {
      throw new Error(`Expected text/plain content type, got: ${contentType}`);
    }
    
    const reportData = await response.text();
    
    // Check for expected report sections
    const expectedSections = [
      'SIGLA System Report',
      'BARANGAY SUMMARY',
      'SURVEY SUMMARY',
      'BARANGAY DETAILS'
    ];
    
    for (const section of expectedSections) {
      if (!reportData.includes(section)) {
        throw new Error(`Missing expected report section: ${section}`);
      }
    }
    
    return {
      reportLength: reportData.length,
      sections: expectedSections,
      generatedAt: reportData.match(/Generated: (.+)/)?.[1] || 'Not found'
    };
  }

  async testInvalidExportType() {
    const response = await fetch(`${BASE_URL}/api/backups?export=invalid-type`);
    
    if (response.ok) {
      throw new Error('Should have returned an error for invalid export type');
    }
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 status, got: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.error) {
      throw new Error('Response should contain error message');
    }
    
    return {
      status: response.status,
      error: data.error
    };
  }

  async testInvalidBackupAction() {
    const response = await fetch(`${BASE_URL}/api/backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'invalid-action' })
    });
    
    if (response.ok) {
      throw new Error('Should have returned an error for invalid action');
    }
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 status, got: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.error) {
      throw new Error('Response should contain error message');
    }
    
    return {
      status: response.status,
      error: data.error
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Backup Functionality Tests...\n');
    
    // Test backup history API
    await this.runTest('Backup History API', () => this.testBackupHistoryAPI());
    
    // Test backup creation API
    await this.runTest('Create Backup API', () => this.testCreateBackupAPI());
    
    // Test data export endpoints
    await this.runTest('Survey Data Export', () => this.testSurveyDataExport());
    await this.runTest('User Data Export', () => this.testUserDataExport());
    await this.runTest('Barangay Data Export', () => this.testBarangayDataExport());
    await this.runTest('Reports Export', () => this.testReportsExport());
    
    // Test error handling
    await this.runTest('Invalid Export Type Error', () => this.testInvalidExportType());
    await this.runTest('Invalid Backup Action Error', () => this.testInvalidBackupAction());
    
    // Generate summary
    this.generateSummary();
    
    // Save results
    this.saveResults();
  }

  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKUP FUNCTIONALITY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n✅ Passed Tests:');
    this.results.tests
      .filter(test => test.status === 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name} (${test.duration})`);
      });
  }

  saveResults() {
    try {
      fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Test results saved to: ${TEST_RESULTS_FILE}`);
    } catch (error) {
      console.error(`Failed to save test results: ${error.message}`);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new BackupTester();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = BackupTester;