// Test that section assignment works with the new survey number format

function getAssignedSections(surveyNumber) {
  let num;
  
  if (typeof surveyNumber === 'string') {
    // Handle format BB-YYYY-NNNN (extract questionnaire number)
    if (surveyNumber.includes('-')) {
      const parts = surveyNumber.split('-');
      if (parts.length === 3) {
        num = parseInt(parts[2]); // Extract NNNN part
      } else {
        num = parseInt(surveyNumber);
      }
    } else {
      num = parseInt(surveyNumber);
    }
  } else {
    num = surveyNumber;
  }
  
  if (isNaN(num) || num < 1) {
    return [];
  }

  const isOdd = num % 2 === 1;
  const ODD_SECTIONS = ["financial", "safety", "environmental"];
  const EVEN_SECTIONS = ["disaster", "social", "business"];
  
  return isOdd ? ODD_SECTIONS : EVEN_SECTIONS;
}

console.log('Testing Section Assignment Logic\n');
console.log('═══════════════════════════════════════════════════════\n');

const testCases = [
  { surveyNumber: '06-2026-0001', expected: 'odd' },
  { surveyNumber: '06-2026-0002', expected: 'even' },
  { surveyNumber: '07-2026-0001', expected: 'odd' },
  { surveyNumber: '07-2026-0004', expected: 'even' },
  { surveyNumber: '06-2026-0006', expected: 'even' },
];

let allPassed = true;

testCases.forEach(test => {
  const sections = getAssignedSections(test.surveyNumber);
  const actual = sections.includes('financial') ? 'odd' : 'even';
  const passed = actual === test.expected;
  allPassed = allPassed && passed;
  
  console.log(`${passed ? '✅' : '❌'} ${test.surveyNumber} → ${actual} sections (expected: ${test.expected})`);
  console.log(`   Sections: ${sections.join(', ')}\n`);
});

console.log('═══════════════════════════════════════════════════════');
console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
console.log('═══════════════════════════════════════════════════════\n');
