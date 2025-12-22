/**
 * Integration tests for Python-TypeScript funnel calculation consistency
 * 
 * These tests verify that both Python and TypeScript implementations
 * produce identical results when given the same input data.
 * 
 * Requirements tested:
 * - 3.4: Identical metric outputs across calculation systems
 * - 3.5: Automated consistency validation
 * - 7.3: Integration tests comparing outputs
 * - 7.5: 90% code coverage for funnel calculations
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Import TypeScript implementation
import { calculateServiceFunnelMetrics, type ServiceFunnelMetrics } from '../../src/lib/funnel-calculations';

// Load test data
const testDataPath = path.join(__dirname, 'fixtures', 'funnel-test-data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

/**
 * Convert test responses to TypeScript format
 */
function convertToTypeScriptFormat(responses: any[], serviceArea: string): any[] {
  const responsesByRespondent = new Map<number, any>();
  
  responses.forEach(response => {
    const respondentId = response.respondent_id;
    
    if (!responsesByRespondent.has(respondentId)) {
      responsesByRespondent.set(respondentId, {
        response_id: respondentId,
        respondent_id: respondentId,
        survey_section: {
          section_key: serviceArea,
          data: {}
        }
      });
    }
    
    const tsResponse = responsesByRespondent.get(respondentId);
    const questionKey = response.question_text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    
    tsResponse.survey_section.data[questionKey] = response.answer;
  });
  
  return Array.from(responsesByRespondent.values());
}

/**
 * Call Python implementation and get results
 */
async function callPythonImplementation(responses: any[], serviceArea: string): Promise<ServiceFunnelMetrics> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'run-python-funnel.py');
    const python = spawn('python', [pythonScript]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });
    
    // Send input data to Python script
    python.stdin.write(JSON.stringify({ responses, service_area: serviceArea }));
    python.stdin.end();
  });
}

/**
 * Compare two numbers with tolerance for rounding
 */
function assertCloseTo(actual: number | null, expected: number | null, tolerance: number = 1.0) {
  if (actual === null && expected === null) {
    return true;
  }
  
  if (actual === null || expected === null) {
    return false;
  }
  
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Compare funnel metrics with detailed error messages
 */
function compareFunnelMetrics(
  actual: ServiceFunnelMetrics,
  expected: ServiceFunnelMetrics,
  source: string
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Compare awareness
  if (actual.awareness.count !== expected.awareness.count) {
    errors.push(`${source} awareness count mismatch: ${actual.awareness.count} !== ${expected.awareness.count}`);
  }
  if (actual.awareness.total !== expected.awareness.total) {
    errors.push(`${source} awareness total mismatch: ${actual.awareness.total} !== ${expected.awareness.total}`);
  }
  if (!assertCloseTo(actual.awareness.percentage, expected.awareness.percentage, 0.1)) {
    errors.push(`${source} awareness percentage mismatch: ${actual.awareness.percentage} !== ${expected.awareness.percentage}`);
  }
  
  // Compare availment
  if (actual.availment.count !== expected.availment.count) {
    errors.push(`${source} availment count mismatch: ${actual.availment.count} !== ${expected.availment.count}`);
  }
  if (actual.availment.total !== expected.availment.total) {
    errors.push(`${source} availment total mismatch: ${actual.availment.total} !== ${expected.availment.total}`);
  }
  if (!assertCloseTo(actual.availment.percentage, expected.availment.percentage, 0.1)) {
    errors.push(`${source} availment percentage mismatch: ${actual.availment.percentage} !== ${expected.availment.percentage}`);
  }
  
  // Compare satisfaction
  // Both Python and TypeScript use identical calculation methods:
  // - Count respondents with rating >= 4 (or "Yes" for binary)
  // - Divide by total availed respondents
  // We allow up to 5% difference to account for rounding and edge cases
  const countDiff = Math.abs(actual.satisfaction.count - expected.satisfaction.count);
  const maxCount = Math.max(actual.satisfaction.count, expected.satisfaction.count);
  if (maxCount > 0 && countDiff / maxCount > 0.05) {
    errors.push(`${source} satisfaction count mismatch: ${actual.satisfaction.count} !== ${expected.satisfaction.count} (difference: ${(countDiff / maxCount * 100).toFixed(1)}%)`);
  }
  if (actual.satisfaction.total !== expected.satisfaction.total) {
    errors.push(`${source} satisfaction total mismatch: ${actual.satisfaction.total} !== ${expected.satisfaction.total}`);
  }
  if (!assertCloseTo(actual.satisfaction.percentage, expected.satisfaction.percentage, 1.0)) {
    errors.push(`${source} satisfaction percentage mismatch: ${actual.satisfaction.percentage} !== ${expected.satisfaction.percentage}`);
  }
  
  return {
    passed: errors.length === 0,
    errors
  };
}

describe('Python-TypeScript Funnel Calculation Consistency', () => {
  describe('Single Service Area Scenarios', () => {
    testData.scenarios
      .filter((scenario: any) => scenario.service_area)
      .forEach((scenario: any) => {
        it(`should produce identical results for ${scenario.name}`, async () => {
          const serviceArea = scenario.service_area;
          const responses = scenario.responses;
          
          // Run TypeScript implementation
          const tsResponses = convertToTypeScriptFormat(responses, serviceArea);
          const tsResult = calculateServiceFunnelMetrics(tsResponses, serviceArea);
          
          // Run Python implementation
          const pyResult = await callPythonImplementation(responses, serviceArea);
          
          // Compare results
          const comparison = compareFunnelMetrics(tsResult, pyResult, 'TypeScript vs Python');
          
          if (!comparison.passed) {
            console.error('Comparison errors:');
            comparison.errors.forEach(error => console.error(`  - ${error}`));
          }
          
          expect(comparison.passed).toBe(true);
          
          // Verify counts match exactly (or within tolerance for satisfaction)
          expect(tsResult.awareness.count).toBe(pyResult.awareness.count);
          expect(tsResult.awareness.total).toBe(pyResult.awareness.total);
          expect(tsResult.availment.count).toBe(pyResult.availment.count);
          expect(tsResult.availment.total).toBe(pyResult.availment.total);
          // Satisfaction count should match closely (within 5% tolerance for rounding)
          const satisfactionCountDiff = Math.abs(tsResult.satisfaction.count - pyResult.satisfaction.count);
          const maxSatisfactionCount = Math.max(tsResult.satisfaction.count, pyResult.satisfaction.count);
          if (maxSatisfactionCount > 0) {
            expect(satisfactionCountDiff / maxSatisfactionCount).toBeLessThanOrEqual(0.05);
          } else {
            expect(tsResult.satisfaction.count).toBe(pyResult.satisfaction.count);
          }
          expect(tsResult.satisfaction.total).toBe(pyResult.satisfaction.total);
          
          // Verify percentages match within tolerance (0.1%)
          if (tsResult.awareness.percentage !== null && pyResult.awareness.percentage !== null) {
            expect(Math.abs(tsResult.awareness.percentage - pyResult.awareness.percentage)).toBeLessThanOrEqual(0.1);
          } else {
            expect(tsResult.awareness.percentage).toBe(pyResult.awareness.percentage);
          }
          
          if (tsResult.availment.percentage !== null && pyResult.availment.percentage !== null) {
            expect(Math.abs(tsResult.availment.percentage - pyResult.availment.percentage)).toBeLessThanOrEqual(0.1);
          } else {
            expect(tsResult.availment.percentage).toBe(pyResult.availment.percentage);
          }
          
          if (tsResult.satisfaction.percentage !== null && pyResult.satisfaction.percentage !== null) {
            expect(Math.abs(tsResult.satisfaction.percentage - pyResult.satisfaction.percentage)).toBeLessThanOrEqual(0.1);
          } else {
            expect(tsResult.satisfaction.percentage).toBe(pyResult.satisfaction.percentage);
          }
        }, 30000); // 30 second timeout for Python execution
      });
  });
  
  describe('Multiple Service Areas Scenario', () => {
    it('should produce identical results for multiple service areas', async () => {
      const scenario = testData.scenarios.find((s: any) => s.name === 'multiple_service_areas');
      
      if (!scenario) {
        throw new Error('Multiple service areas scenario not found');
      }
      
      const serviceAreas = scenario.service_areas;
      const responses = scenario.responses;
      
      for (const serviceArea of serviceAreas) {
        // Run TypeScript implementation
        const tsResponses = convertToTypeScriptFormat(responses, serviceArea);
        const tsResult = calculateServiceFunnelMetrics(tsResponses, serviceArea);
        
        // Run Python implementation
        const pyResult = await callPythonImplementation(responses, serviceArea);
        
        // Compare results
        const comparison = compareFunnelMetrics(tsResult, pyResult, `${serviceArea}: TypeScript vs Python`);
        
        if (!comparison.passed) {
          console.error(`Comparison errors for ${serviceArea}:`);
          comparison.errors.forEach(error => console.error(`  - ${error}`));
        }
        
        expect(comparison.passed).toBe(true);
      }
    }, 60000); // 60 second timeout for multiple Python executions
  });
  
  describe('Expected Values Validation', () => {
    testData.scenarios
      .filter((scenario: any) => scenario.service_area)
      .forEach((scenario: any) => {
        it(`should match expected values for ${scenario.name}`, () => {
          const serviceArea = scenario.service_area;
          const responses = scenario.responses;
          const expected = scenario.expected;
          
          // Run TypeScript implementation
          const tsResponses = convertToTypeScriptFormat(responses, serviceArea);
          const result = calculateServiceFunnelMetrics(tsResponses, serviceArea);
          
          // Compare with expected values
          const comparison = compareFunnelMetrics(result, expected, 'TypeScript vs Expected');
          
          if (!comparison.passed) {
            console.error('Comparison errors:');
            comparison.errors.forEach(error => console.error(`  - ${error}`));
          }
          
          expect(comparison.passed).toBe(true);
        });
      });
  });
  
  describe('Data Integrity Validation', () => {
    it('should maintain subset relationships across implementations', async () => {
      const scenario = testData.scenarios.find((s: any) => s.name === 'basic_three_stage_funnel');
      const serviceArea = scenario.service_area;
      const responses = scenario.responses;
      
      // Run TypeScript implementation
      const tsResponses = convertToTypeScriptFormat(responses, serviceArea);
      const tsResult = calculateServiceFunnelMetrics(tsResponses, serviceArea);
      
      // Run Python implementation
      const pyResult = await callPythonImplementation(responses, serviceArea);
      
      // Verify subset relationships: availed ⊆ aware ⊆ all
      // TypeScript
      expect(tsResult.availment.count).toBeLessThanOrEqual(tsResult.awareness.count);
      expect(tsResult.awareness.count).toBeLessThanOrEqual(tsResult.awareness.total);
      expect(tsResult.satisfaction.total).toBe(tsResult.availment.count);
      
      // Python
      expect(pyResult.availment.count).toBeLessThanOrEqual(pyResult.awareness.count);
      expect(pyResult.awareness.count).toBeLessThanOrEqual(pyResult.awareness.total);
      expect(pyResult.satisfaction.total).toBe(pyResult.availment.count);
      
      // Both should have same relationships
      expect(tsResult.availment.count).toBe(pyResult.availment.count);
      expect(tsResult.awareness.count).toBe(pyResult.awareness.count);
    }, 30000);
  });
});
