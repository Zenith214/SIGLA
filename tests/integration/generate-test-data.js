#!/usr/bin/env node

/**
 * Generate test data fixtures for integration tests
 * 
 * This script generates survey response data for various test scenarios
 * that can be used by both Python and TypeScript implementations.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate responses for basic three-stage funnel scenario
 * 50 respondents, 45 aware (90%), 30 availed (66.7% of aware), 25 satisfied
 */
function generateBasicThreeStageFunnel() {
  const responses = [];
  
  for (let i = 1; i <= 50; i++) {
    const respondentId = i;
    
    // 45 respondents are aware (1-45)
    if (i <= 45) {
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of financial services?',
        answer: 'Yes'
      });
      
      // 30 of the aware respondents availed (1-30)
      if (i <= 30) {
        responses.push({
          respondent_id: respondentId,
          question_text: 'Have you availed financial services?',
          answer: 'Yes'
        });
        
        // 25 of the availed respondents are satisfied (1-25)
        if (i <= 25) {
          responses.push({
            respondent_id: respondentId,
            question_text: 'How satisfied are you with the service quality?',
            answer: '5'
          });
        } else {
          // 5 are not satisfied (26-30)
          responses.push({
            respondent_id: respondentId,
            question_text: 'How satisfied are you with the service quality?',
            answer: '2'
          });
        }
      } else {
        // 15 aware but did not avail (31-45)
        responses.push({
          respondent_id: respondentId,
          question_text: 'Have you availed financial services?',
          answer: 'No'
        });
      }
    } else {
      // 5 respondents are not aware (46-50)
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of financial services?',
        answer: 'No'
      });
    }
  }
  
  return responses;
}

/**
 * Generate responses for zero awareness scenario
 */
function generateZeroAwareness() {
  const responses = [];
  
  for (let i = 1; i <= 50; i++) {
    responses.push({
      respondent_id: i,
      question_text: 'Are you aware of financial services?',
      answer: 'No'
    });
  }
  
  return responses;
}

/**
 * Generate responses for zero availment scenario
 */
function generateZeroAvailment() {
  const responses = [];
  
  for (let i = 1; i <= 50; i++) {
    const respondentId = i;
    
    // 45 respondents are aware
    if (i <= 45) {
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of financial services?',
        answer: 'Yes'
      });
      // All aware respondents did not avail
      responses.push({
        respondent_id: respondentId,
        question_text: 'Have you availed financial services?',
        answer: 'No'
      });
    } else {
      // 5 respondents are not aware
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of financial services?',
        answer: 'No'
      });
    }
  }
  
  return responses;
}

/**
 * Generate responses for multiple service areas scenario
 */
function generateMultipleServiceAreas() {
  const responses = [];
  
  for (let i = 1; i <= 20; i++) {
    const respondentId = i;
    
    // Financial service area - high awareness (90%)
    if (i <= 18) {
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of financial services?',
        answer: 'Yes'
      });
      
      if (i <= 12) {
        responses.push({
          respondent_id: respondentId,
          question_text: 'Have you availed financial services?',
          answer: 'Yes'
        });
        
        responses.push({
          respondent_id: respondentId,
          question_text: 'How satisfied are you with financial services?',
          answer: '5'
        });
      } else {
        responses.push({
          respondent_id: respondentId,
          question_text: 'Have you availed financial services?',
          answer: 'No'
        });
      }
    } else {
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of financial services?',
        answer: 'No'
      });
    }
    
    // Disaster service area - lower awareness (50%)
    if (i <= 10) {
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of disaster response services?',
        answer: 'Yes'
      });
      
      if (i <= 5) {
        responses.push({
          respondent_id: respondentId,
          question_text: 'Have you availed disaster response services?',
          answer: 'Yes'
        });
        
        responses.push({
          respondent_id: respondentId,
          question_text: 'How satisfied are you with disaster response services?',
          answer: '4'
        });
      } else {
        responses.push({
          respondent_id: respondentId,
          question_text: 'Have you availed disaster response services?',
          answer: 'No'
        });
      }
    } else {
      responses.push({
        respondent_id: respondentId,
        question_text: 'Are you aware of disaster response services?',
        answer: 'No'
      });
    }
  }
  
  return responses;
}

/**
 * Main function to generate all test data
 */
function generateAllTestData() {
  const testData = {
    scenarios: [
      {
        name: 'basic_three_stage_funnel',
        description: '50 respondents, 45 aware (90%), 30 availed (66.7% of aware), 25 satisfied',
        service_area: 'financial',
        responses: generateBasicThreeStageFunnel(),
        expected: {
          awareness: {
            count: 45,
            total: 50,
            percentage: 90.0
          },
          availment: {
            count: 30,
            total: 45,
            percentage: 66.7
          },
          satisfaction: {
            count: 25,
            total: 30,
            percentage: 90.0
          }
        }
      },
      {
        name: 'zero_awareness',
        description: '50 respondents, 0 aware',
        service_area: 'financial',
        responses: generateZeroAwareness(),
        expected: {
          awareness: {
            count: 0,
            total: 50,
            percentage: 0.0
          },
          availment: {
            count: 0,
            total: 0,
            percentage: null
          },
          satisfaction: {
            count: 0,
            total: 0,
            percentage: null
          }
        }
      },
      {
        name: 'zero_availment',
        description: '50 respondents, 45 aware (90%), 0 availed',
        service_area: 'financial',
        responses: generateZeroAvailment(),
        expected: {
          awareness: {
            count: 45,
            total: 50,
            percentage: 90.0
          },
          availment: {
            count: 0,
            total: 45,
            percentage: 0.0
          },
          satisfaction: {
            count: 0,
            total: 0,
            percentage: null
          }
        }
      },
      {
        name: 'multiple_service_areas',
        description: 'Test with financial and disaster service areas',
        service_areas: ['financial', 'disaster'],
        responses: generateMultipleServiceAreas(),
        expected: {
          financial: {
            awareness: {
              count: 18,
              total: 20,
              percentage: 90.0
            },
            availment: {
              count: 12,
              total: 18,
              percentage: 66.7
            },
            satisfaction: {
              count: 12,
              total: 12,
              percentage: 100.0
            }
          },
          disaster: {
            awareness: {
              count: 10,
              total: 20,
              percentage: 50.0
            },
            availment: {
              count: 5,
              total: 10,
              percentage: 50.0
            },
            satisfaction: {
              count: 5,
              total: 5,
              percentage: 80.0
            }
          }
        }
      }
    ]
  };
  
  // Write to file
  const outputPath = path.join(__dirname, 'fixtures', 'funnel-test-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));
  
  console.log(`✓ Generated test data: ${outputPath}`);
  console.log(`  - ${testData.scenarios.length} scenarios`);
  testData.scenarios.forEach(scenario => {
    console.log(`    - ${scenario.name}: ${scenario.responses.length} responses`);
  });
}

// Run if called directly
if (require.main === module) {
  generateAllTestData();
}

module.exports = { generateAllTestData };
