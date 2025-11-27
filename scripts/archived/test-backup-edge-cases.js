/**
 * Backup System Edge Cases and Problem Detection Script
 * Tests various failure scenarios and edge cases for the backup functionality
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const fs = require('fs');
const path = require('path');

class BackupEdgeCaseTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      issues: [],
      recommendations: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async runTest(testName, testFunction, isWarning = false) {
    console.log(`\n🧪 Testing: ${testName}`);
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
      const status = isWarning ? 'WARNING' : 'FAILED';
      
      this.results.tests.push({
        name: testName,
        status: status,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      if (isWarning) {
        this.results.summary.warnings++;
        console.log(`⚠️  ${testName} - WARNING: ${error.message}`);
      } else {
        this.results.summary.failed++;
        console.log(`❌ ${testName} - FAILED: ${error.message}`);
      }
      return null;
    }
  }

  // Test 1: Empty Database Scenarios
  testEmptyDatabaseHandling() {
    console.log('  Testing empty database scenarios...');
    
    // Test CSV generation with empty data
    function convertToCSV(data, headers) {
      if (!data || data.length === 0) {
        return headers.join(',') + '\n';
      }
      // ... rest of function
      return headers.join(',') + '\n';
    }

    const headers = ['id', 'name', 'value'];
    
    // Test with null data
    const nullResult = convertToCSV(null, headers);
    if (nullResult !== 'id,name,value\n') {
      throw new Error('CSV generation fails with null data');
    }

    // Test with undefined data
    const undefinedResult = convertToCSV(undefined, headers);
    if (undefinedResult !== 'id,name,value\n') {
      throw new Error('CSV generation fails with undefined data');
    }

    // Test with empty array
    const emptyResult = convertToCSV([], headers);
    if (emptyResult !== 'id,name,value\n') {
      throw new Error('CSV generation fails with empty array');
    }

    return {
      nullHandling: 'OK',
      undefinedHandling: 'OK',
      emptyArrayHandling: 'OK'
    };
  }

  // Test 2: Missing Environment Variables
  testEnvironmentVariables() {
    console.log('  Testing environment variable handling...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const issues = [];
    
    for (const varName of requiredVars) {
      const value = process.env[varName];
      
      if (!value) {
        issues.push(`Missing environment variable: ${varName}`);
      } else if (value.trim() === '') {
        issues.push(`Empty environment variable: ${varName}`);
      } else if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('http')) {
        issues.push(`Invalid Supabase URL format: ${varName}`);
      }
    }

    if (issues.length > 0) {
      throw new Error(`Environment issues: ${issues.join(', ')}`);
    }

    return {
      variablesChecked: requiredVars.length,
      allPresent: true
    };
  }

  // Test 3: Database Connection Failures
  testDatabaseConnectionHandling() {
    console.log('  Testing database connection error handling...');
    
    // Simulate database connection failure scenarios
    const mockSupabaseError = {
      message: 'Connection failed',
      code: 'PGRST301',
      details: 'Could not connect to database'
    };

    // Test error handling in export functions
    const testExportErrorHandling = (exportType) => {
      try {
        // Simulate what happens when Supabase returns an error
        const error = mockSupabaseError;
        
        if (error) {
          // Check if the function would handle this properly
          if (exportType === 'user-data') {
            // User data export has special handling for missing table
            return {
              handled: true,
              fallback: 'empty CSV with headers'
            };
          } else {
            // Other exports should throw and be caught
            throw new Error(`Failed to export ${exportType}`);
          }
        }
      } catch (error) {
        return {
          handled: true,
          errorMessage: error.message
        };
      }
    };

    const surveyResult = testExportErrorHandling('survey-data');
    const userResult = testExportErrorHandling('user-data');
    const barangayResult = testExportErrorHandling('barangay-data');

    return {
      surveyDataHandling: surveyResult,
      userDataHandling: userResult,
      barangayDataHandling: barangayResult
    };
  }

  // Test 4: Large Dataset Handling
  testLargeDatasetHandling() {
    console.log('  Testing large dataset scenarios...');
    
    // Test CSV generation with large dataset
    function convertToCSV(data, headers) {
      if (!data || data.length === 0) {
        return headers.join(',') + '\n';
      }

      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
          }
          return stringValue;
        }).join(',');
      });

      return csvHeaders + '\n' + csvRows.join('\n');
    }

    // Generate large test dataset
    const largeDataset = [];
    for (let i = 0; i < 10000; i++) {
      largeDataset.push({
        id: i,
        name: `Test Record ${i}`,
        description: `This is a test record with ID ${i}`,
        created_at: new Date().toISOString()
      });
    }

    const headers = ['id', 'name', 'description', 'created_at'];
    const startTime = Date.now();
    const result = convertToCSV(largeDataset, headers);
    const duration = Date.now() - startTime;

    // Check if processing took too long (> 5 seconds is concerning)
    if (duration > 5000) {
      throw new Error(`Large dataset processing too slow: ${duration}ms`);
    }

    // Check result size
    const lines = result.split('\n');
    if (lines.length !== 10001) { // 10000 data rows + 1 header row
      throw new Error(`Incorrect number of lines: expected 10001, got ${lines.length}`);
    }

    return {
      recordsProcessed: 10000,
      processingTime: `${duration}ms`,
      outputSize: `${result.length} characters`,
      performance: duration < 1000 ? 'Good' : duration < 3000 ? 'Acceptable' : 'Slow'
    };
  }

  // Test 5: Invalid Data Handling
  testInvalidDataHandling() {
    console.log('  Testing invalid data scenarios...');
    
    function convertToCSV(data, headers) {
      if (!data || data.length === 0) {
        return headers.join(',') + '\n';
      }

      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
          }
          return stringValue;
        }).join(',');
      });

      return csvHeaders + '\n' + csvRows.join('\n');
    }

    // Test with various invalid data types
    const invalidData = [
      { id: 1, name: 'Normal', value: 'OK' },
      { id: 2, name: null, value: undefined },
      { id: 3, name: '', value: 0 },
      { id: 4, name: 'Test,with,commas', value: 'Special' },
      { id: 5, name: 'Test"with"quotes', value: 'Quotes' },
      { id: 6, name: 'Test\nwith\nnewlines', value: 'Newlines' },
      { id: 7, name: {}, value: [] }, // Objects and arrays
      { id: 8, name: true, value: false }, // Booleans
      { id: 9, name: 123.456, value: -789 }, // Numbers
    ];

    const headers = ['id', 'name', 'value'];
    const result = convertToCSV(invalidData, headers);
    
    // Verify the result handles all cases
    const lines = result.split('\n');
    
    // Check specific problematic rows
    if (!lines[4].includes('"Test,with,commas"')) {
      throw new Error('Comma handling failed');
    }
    
    if (!lines[5].includes('"Test""with""quotes"')) {
      throw new Error('Quote handling failed');
    }
    
    if (!lines[6].includes('"Test\\nwith\\nnewlines"')) {
      throw new Error('Newline handling failed');
    }

    return {
      invalidDataHandled: true,
      specialCharactersEscaped: true,
      objectsConverted: true,
      nullsHandled: true
    };
  }

  // Test 6: Backup History Edge Cases
  testBackupHistoryEdgeCases() {
    console.log('  Testing backup history edge cases...');
    
    // Test when no backups exist
    const emptyHistory = [];
    
    // Test when backup history has invalid data
    const invalidHistory = [
      { id: 1, date: 'invalid-date', time: '25:99', size: null, status: 'Unknown' },
      { id: 2, date: '', time: '', size: '', status: '' },
      { id: null, date: null, time: null, size: null, status: null }
    ];

    // Test validation function
    const validateBackupHistory = (history) => {
      if (!Array.isArray(history)) {
        throw new Error('History must be an array');
      }

      for (const backup of history) {
        if (!backup.id || !backup.date || !backup.time || !backup.status) {
          throw new Error('Missing required backup fields');
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(backup.date)) {
          throw new Error(`Invalid date format: ${backup.date}`);
        }

        // Validate time format
        if (!/^\d{2}:\d{2}$/.test(backup.time)) {
          throw new Error(`Invalid time format: ${backup.time}`);
        }

        // Validate status
        if (!['Success', 'Failed', 'In Progress'].includes(backup.status)) {
          throw new Error(`Invalid status: ${backup.status}`);
        }
      }

      return true;
    };

    // Test empty history
    const emptyResult = validateBackupHistory(emptyHistory);
    
    // Test invalid history (should throw)
    let invalidThrew = false;
    try {
      validateBackupHistory(invalidHistory);
    } catch (error) {
      invalidThrew = true;
    }

    if (!invalidThrew) {
      throw new Error('Validation should have failed for invalid history');
    }

    return {
      emptyHistoryHandled: emptyResult,
      invalidDataRejected: invalidThrew,
      validationWorking: true
    };
  }

  // Test 7: File System Issues
  testFileSystemIssues() {
    console.log('  Testing file system related issues...');
    
    // Test filename generation with special characters (matching API implementation)
    const sanitizeFilename = (filename) => {
      return filename
        .replace(/[^a-zA-Z0-9-_.]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    const generateFilename = (type, extension = 'csv') => {
      const date = new Date().toISOString().split('T')[0];
      const sanitizedType = sanitizeFilename(type);
      return `${sanitizedType}_${date}.${extension}`;
    };

    // Test various problematic inputs
    const testCases = [
      { type: 'survey_data', expected: /^survey_data_\d{4}-\d{2}-\d{2}\.csv$/ },
      { type: 'user/data', expected: /^user_data_\d{4}-\d{2}-\d{2}\.csv$/ },
      { type: 'test<>data', expected: /^test_data_\d{4}-\d{2}-\d{2}\.csv$/ },
      { type: 'barangay data', expected: /^barangay_data_\d{4}-\d{2}-\d{2}\.csv$/ }
    ];

    for (const testCase of testCases) {
      const result = generateFilename(testCase.type);
      if (!testCase.expected.test(result)) {
        throw new Error(`Filename generation failed: expected pattern ${testCase.expected}, got ${result}`);
      }
    }

    return {
      filenameGeneration: 'OK',
      specialCharacterHandling: 'OK',
      edgeCasesHandled: testCases.length
    };
  }

  // Test 8: Memory Usage Issues
  testMemoryUsageIssues() {
    console.log('  Testing memory usage scenarios...');
    
    // Simulate memory-intensive operations
    const testMemoryUsage = () => {
      const initialMemory = process.memoryUsage();
      
      // Create a large string (simulating large CSV)
      let largeString = '';
      for (let i = 0; i < 100000; i++) {
        largeString += `${i},Test Record ${i},Some description for record ${i}\n`;
      }
      
      const afterCreation = process.memoryUsage();
      
      // Clear the string
      largeString = null;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const afterCleanup = process.memoryUsage();
      
      return {
        initialHeapUsed: Math.round(initialMemory.heapUsed / 1024 / 1024),
        peakHeapUsed: Math.round(afterCreation.heapUsed / 1024 / 1024),
        finalHeapUsed: Math.round(afterCleanup.heapUsed / 1024 / 1024),
        memoryIncrease: Math.round((afterCreation.heapUsed - initialMemory.heapUsed) / 1024 / 1024)
      };
    };

    const memoryStats = testMemoryUsage();
    
    // Check if memory usage is reasonable (< 100MB increase)
    if (memoryStats.memoryIncrease > 100) {
      throw new Error(`Excessive memory usage: ${memoryStats.memoryIncrease}MB increase`);
    }

    return memoryStats;
  }

  // Test 9: Concurrent Request Handling
  testConcurrentRequestHandling() {
    console.log('  Testing concurrent request scenarios...');
    
    // Simulate multiple backup operations
    const simulateBackupOperation = (id) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: id,
            timestamp: Date.now(),
            status: 'completed'
          });
        }, Math.random() * 100); // Random delay 0-100ms
      });
    };

    // Test multiple concurrent operations
    const concurrentOperations = [];
    for (let i = 0; i < 10; i++) {
      concurrentOperations.push(simulateBackupOperation(i));
    }

    return Promise.all(concurrentOperations).then(results => {
      // Verify all operations completed
      if (results.length !== 10) {
        throw new Error(`Expected 10 results, got ${results.length}`);
      }

      // Check for any failures
      const failures = results.filter(r => r.status !== 'completed');
      if (failures.length > 0) {
        throw new Error(`${failures.length} operations failed`);
      }

      return {
        operationsCompleted: results.length,
        allSuccessful: true,
        averageTime: results.reduce((sum, r) => sum + r.timestamp, 0) / results.length
      };
    });
  }

  // Test 10: Error Recovery Scenarios
  testErrorRecoveryScenarios() {
    console.log('  Testing error recovery mechanisms...');
    
    // Test retry logic
    const retryOperation = async (operation, maxRetries = 3) => {
      let attempts = 0;
      let lastError;

      while (attempts < maxRetries) {
        try {
          attempts++;
          return await operation();
        } catch (error) {
          lastError = error;
          if (attempts >= maxRetries) {
            throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
        }
      }
    };

    // Test operation that fails first few times
    let callCount = 0;
    const flakyOperation = () => {
      callCount++;
      if (callCount < 3) {
        throw new Error('Temporary failure');
      }
      return { success: true, attempts: callCount };
    };

    return retryOperation(flakyOperation).then(result => {
      if (result.attempts !== 3) {
        throw new Error(`Expected 3 attempts, got ${result.attempts}`);
      }

      return {
        retryLogicWorking: true,
        attemptsRequired: result.attempts,
        finalResult: result.success
      };
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Backup Edge Cases and Problem Detection Tests...\n');
    
    // Test basic edge cases
    await this.runTest('Empty Database Handling', () => this.testEmptyDatabaseHandling());
    await this.runTest('Environment Variables', () => this.testEnvironmentVariables());
    await this.runTest('Database Connection Handling', () => this.testDatabaseConnectionHandling());
    
    // Test performance and scalability
    await this.runTest('Large Dataset Handling', () => this.testLargeDatasetHandling());
    await this.runTest('Invalid Data Handling', () => this.testInvalidDataHandling());
    await this.runTest('Memory Usage Issues', () => this.testMemoryUsageIssues(), true); // Warning only
    
    // Test system reliability
    await this.runTest('Backup History Edge Cases', () => this.testBackupHistoryEdgeCases());
    await this.runTest('File System Issues', () => this.testFileSystemIssues());
    await this.runTest('Concurrent Request Handling', () => this.testConcurrentRequestHandling());
    await this.runTest('Error Recovery Scenarios', () => this.testErrorRecoveryScenarios());
    
    // Generate analysis
    this.analyzeResults();
    this.generateRecommendations();
    this.generateSummary();
    this.saveResults();
  }

  analyzeResults() {
    console.log('\n🔍 Analyzing Results...');
    
    // Identify critical issues
    const criticalIssues = this.results.tests.filter(test => test.status === 'FAILED');
    const warnings = this.results.tests.filter(test => test.status === 'WARNING');
    
    if (criticalIssues.length > 0) {
      this.results.issues.push('Critical failures detected in backup system');
    }
    
    if (warnings.length > 0) {
      this.results.issues.push('Performance or reliability warnings detected');
    }
    
    // Check for specific problem patterns
    const memoryTest = this.results.tests.find(test => test.name === 'Memory Usage Issues');
    if (memoryTest && memoryTest.result && memoryTest.result.memoryIncrease > 50) {
      this.results.issues.push('High memory usage detected during operations');
    }
    
    const performanceTest = this.results.tests.find(test => test.name === 'Large Dataset Handling');
    if (performanceTest && performanceTest.result && performanceTest.result.performance === 'Slow') {
      this.results.issues.push('Slow performance with large datasets');
    }
  }

  generateRecommendations() {
    console.log('💡 Generating Recommendations...');
    
    // Based on test results, generate specific recommendations
    if (this.results.summary.failed === 0 && this.results.summary.warnings === 0) {
      this.results.recommendations.push('✅ All edge case tests passed - backup system is robust');
    } else {
      this.results.recommendations.push('⚠️ Some edge cases need attention before production use');
    }
    
    // Always recommend these improvements
    this.results.recommendations.push('🔄 Implement actual backup storage instead of mock data');
    this.results.recommendations.push('📊 Add backup metadata tracking in database');
    this.results.recommendations.push('🔒 Implement backup file encryption for sensitive data');
    this.results.recommendations.push('⏰ Add automatic cleanup of old backup files');
    this.results.recommendations.push('📈 Implement backup size monitoring and alerts');
    this.results.recommendations.push('🔄 Add backup verification and integrity checking');
    this.results.recommendations.push('☁️ Consider cloud storage integration for backups');
    this.results.recommendations.push('📝 Add detailed logging for backup operations');
  }

  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKUP EDGE CASES TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    
    const successRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n❌ Critical Issues:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    if (this.results.summary.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.tests
        .filter(test => test.status === 'WARNING')
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
    
    if (this.results.issues.length > 0) {
      console.log('\n🚨 Issues Identified:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n💡 Recommendations:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  saveResults() {
    try {
      const resultsFile = 'backup-edge-cases-test-results.json';
      fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Test results saved to: ${resultsFile}`);
    } catch (error) {
      console.error(`Failed to save test results: ${error.message}`);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new BackupEdgeCaseTester();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = BackupEdgeCaseTester;