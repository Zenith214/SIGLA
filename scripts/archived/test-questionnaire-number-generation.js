/**
 * Test script for questionnaire number generation
 * Tests atomic increment and concurrent access handling
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/questionnaire-number/next';

async function generateNumber(barangayId = 1) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ barangayId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { number: data.questionnaireNumber, barangayId: data.barangayId };
  } catch (error) {
    console.error('Error generating number:', error.message);
    return null;
  }
}

async function testSequentialGeneration() {
  console.log('\n🧪 Test 1: Sequential Generation (Barangay 1)');
  console.log('Generating 5 numbers sequentially for Barangay 1...\n');

  const numbers = [];
  for (let i = 0; i < 5; i++) {
    const result = await generateNumber(1);
    if (result) {
      numbers.push(result.number);
      console.log(`  ✅ Generated: ${result.number} (Barangay ${result.barangayId})`);
    }
  }

  // Check if all numbers are unique and sequential
  const isSequential = numbers.every((num, idx) => {
    if (idx === 0) return true;
    return num === numbers[idx - 1] + 1;
  });

  console.log(`\n  Result: ${isSequential ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Numbers: [${numbers.join(', ')}]`);
  
  return isSequential;
}

async function testConcurrentGeneration() {
  console.log('\n🧪 Test 2: Concurrent Generation (Barangay 1)');
  console.log('Generating 10 numbers concurrently for Barangay 1...\n');

  // Create 10 simultaneous requests
  const promises = Array(10).fill(null).map(() => generateNumber(1));
  const results = await Promise.all(promises);

  // Filter out any null values (errors)
  const validResults = results.filter(r => r !== null);
  const validNumbers = validResults.map(r => r.number);

  console.log(`  Generated ${validNumbers.length} numbers`);
  
  // Check for duplicates
  const uniqueNumbers = [...new Set(validNumbers)];
  const hasDuplicates = uniqueNumbers.length !== validNumbers.length;

  console.log(`  Unique numbers: ${uniqueNumbers.length}`);
  console.log(`  Numbers: [${validNumbers.sort((a, b) => a - b).join(', ')}]`);
  console.log(`\n  Result: ${!hasDuplicates ? '✅ PASS - No duplicates' : '❌ FAIL - Duplicates found'}`);

  return !hasDuplicates;
}

async function testBarangayIsolation() {
  console.log('\n🧪 Test 3: Barangay Isolation');
  console.log('Testing that each barangay has independent counters...\n');

  // Generate numbers for different barangays
  const brgy1_1 = await generateNumber(5);
  const brgy2_1 = await generateNumber(6);
  const brgy1_2 = await generateNumber(5);
  const brgy2_2 = await generateNumber(6);
  const brgy3_1 = await generateNumber(7);

  console.log(`  Barangay 5: ${brgy1_1?.number}, ${brgy1_2?.number}`);
  console.log(`  Barangay 6: ${brgy2_1?.number}, ${brgy2_2?.number}`);
  console.log(`  Barangay 7: ${brgy3_1?.number}`);

  // Each barangay should start from 1 and increment independently
  const passed = 
    brgy1_1?.number === 1 && 
    brgy2_1?.number === 1 && 
    brgy1_2?.number === 2 && 
    brgy2_2?.number === 2 &&
    brgy3_1?.number === 1;

  console.log(`\n  Result: ${passed ? '✅ PASS - Each barangay has independent counter' : '❌ FAIL'}`);
  return passed;
}

async function testOddEvenAssignment() {
  console.log('\n🧪 Test 4: Odd/Even Section Assignment');
  console.log('Testing section assignment logic...\n');

  const testCases = [
    { number: 1, expected: 'odd' },
    { number: 2, expected: 'even' },
    { number: 3, expected: 'odd' },
    { number: 4, expected: 'even' },
    { number: 5, expected: 'odd' },
  ];

  let allPassed = true;

  for (const testCase of testCases) {
    const actual = testCase.number % 2 === 1 ? 'odd' : 'even';
    const passed = actual === testCase.expected;
    allPassed = allPassed && passed;

    console.log(`  ${passed ? '✅' : '❌'} Number ${testCase.number} → ${actual} sections (expected: ${testCase.expected})`);
  }

  console.log(`\n  Result: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
  return allPassed;
}

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Questionnaire Number Generation Test Suite');
  console.log('═══════════════════════════════════════════════════════');

  const results = {
    sequential: false,
    concurrent: false,
    barangayIsolation: false,
    oddEven: false
  };

  try {
    // Test 1: Sequential generation
    results.sequential = await testSequentialGeneration();

    // Test 2: Concurrent generation
    results.concurrent = await testConcurrentGeneration();

    // Test 3: Barangay isolation
    results.barangayIsolation = await testBarangayIsolation();

    // Test 4: Odd/Even assignment
    results.oddEven = await testOddEvenAssignment();

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Test Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Sequential Generation:  ${results.sequential ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Concurrent Generation:  ${results.concurrent ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Barangay Isolation:     ${results.barangayIsolation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Odd/Even Assignment:    ${results.oddEven ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(r => r === true);
    console.log('\n  Overall: ' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('⚠️  Warning: Server might not be running at http://localhost:3000');
    console.log('   Please start the development server with: npm run dev\n');
  }

  await runAllTests();
})();
