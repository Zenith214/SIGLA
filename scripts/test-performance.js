/**
 * Performance Testing Script
 * Tests key performance metrics for the CSIS workflow
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const PAGES_TO_TEST = [
  { name: 'FS Dashboard', url: '/fs-dashboard' },
  { name: 'FI Assignments', url: '/survey' },
  { name: 'Spot Workflow', url: '/survey/spot/1' },
];

// Performance thresholds
const THRESHOLDS = {
  performance: 70,
  accessibility: 90,
  'best-practices': 80,
  seo: 80,
  pwa: 70,
  fcp: 1800, // First Contentful Paint (ms)
  lcp: 2500, // Largest Contentful Paint (ms)
  tti: 3800, // Time to Interactive (ms)
  cls: 0.1,  // Cumulative Layout Shift
};

async function launchChromeAndRunLighthouse(url, opts = {}) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  opts.port = chrome.port;

  const config = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    },
  };

  const runnerResult = await lighthouse(url, opts, config);

  await chrome.kill();

  return runnerResult;
}

function checkThresholds(results) {
  const failures = [];

  // Check category scores
  Object.entries(results.categories).forEach(([category, data]) => {
    const score = data.score * 100;
    const threshold = THRESHOLDS[category];
    
    if (threshold && score < threshold) {
      failures.push({
        type: 'category',
        name: category,
        score,
        threshold,
        message: `${category} score (${score.toFixed(1)}) is below threshold (${threshold})`,
      });
    }
  });

  // Check Web Vitals
  const audits = results.audits;
  
  if (audits['first-contentful-paint']) {
    const fcp = audits['first-contentful-paint'].numericValue;
    if (fcp > THRESHOLDS.fcp) {
      failures.push({
        type: 'metric',
        name: 'FCP',
        value: fcp,
        threshold: THRESHOLDS.fcp,
        message: `First Contentful Paint (${fcp.toFixed(0)}ms) exceeds threshold (${THRESHOLDS.fcp}ms)`,
      });
    }
  }

  if (audits['largest-contentful-paint']) {
    const lcp = audits['largest-contentful-paint'].numericValue;
    if (lcp > THRESHOLDS.lcp) {
      failures.push({
        type: 'metric',
        name: 'LCP',
        value: lcp,
        threshold: THRESHOLDS.lcp,
        message: `Largest Contentful Paint (${lcp.toFixed(0)}ms) exceeds threshold (${THRESHOLDS.lcp}ms)`,
      });
    }
  }

  if (audits['interactive']) {
    const tti = audits['interactive'].numericValue;
    if (tti > THRESHOLDS.tti) {
      failures.push({
        type: 'metric',
        name: 'TTI',
        value: tti,
        threshold: THRESHOLDS.tti,
        message: `Time to Interactive (${tti.toFixed(0)}ms) exceeds threshold (${THRESHOLDS.tti}ms)`,
      });
    }
  }

  if (audits['cumulative-layout-shift']) {
    const cls = audits['cumulative-layout-shift'].numericValue;
    if (cls > THRESHOLDS.cls) {
      failures.push({
        type: 'metric',
        name: 'CLS',
        value: cls,
        threshold: THRESHOLDS.cls,
        message: `Cumulative Layout Shift (${cls.toFixed(3)}) exceeds threshold (${THRESHOLDS.cls})`,
      });
    }
  }

  return failures;
}

async function runPerformanceTests() {
  console.log('🚀 Starting Performance Tests\n');
  console.log(`Testing URL: ${BASE_URL}\n`);

  const results = [];
  let totalFailures = 0;

  for (const page of PAGES_TO_TEST) {
    const url = `${BASE_URL}${page.url}`;
    console.log(`📊 Testing: ${page.name}`);
    console.log(`   URL: ${url}`);

    try {
      const runnerResult = await launchChromeAndRunLighthouse(url);
      const lhr = runnerResult.lhr;

      // Extract key metrics
      const metrics = {
        performance: (lhr.categories.performance?.score || 0) * 100,
        accessibility: (lhr.categories.accessibility?.score || 0) * 100,
        bestPractices: (lhr.categories['best-practices']?.score || 0) * 100,
        seo: (lhr.categories.seo?.score || 0) * 100,
        pwa: (lhr.categories.pwa?.score || 0) * 100,
        fcp: lhr.audits['first-contentful-paint']?.numericValue || 0,
        lcp: lhr.audits['largest-contentful-paint']?.numericValue || 0,
        tti: lhr.audits['interactive']?.numericValue || 0,
        cls: lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      };

      console.log(`   ✅ Performance: ${metrics.performance.toFixed(1)}`);
      console.log(`   ✅ Accessibility: ${metrics.accessibility.toFixed(1)}`);
      console.log(`   ✅ Best Practices: ${metrics.bestPractices.toFixed(1)}`);
      console.log(`   📈 FCP: ${metrics.fcp.toFixed(0)}ms`);
      console.log(`   📈 LCP: ${metrics.lcp.toFixed(0)}ms`);
      console.log(`   📈 TTI: ${metrics.tti.toFixed(0)}ms`);
      console.log(`   📈 CLS: ${metrics.cls.toFixed(3)}`);

      // Check thresholds
      const failures = checkThresholds(lhr);
      
      if (failures.length > 0) {
        console.log(`\n   ⚠️  ${failures.length} threshold(s) not met:`);
        failures.forEach((failure) => {
          console.log(`      - ${failure.message}`);
        });
        totalFailures += failures.length;
      } else {
        console.log(`   ✅ All thresholds met!`);
      }

      results.push({
        page: page.name,
        url: page.url,
        metrics,
        failures,
      });

    } catch (error) {
      console.error(`   ❌ Error testing ${page.name}:`, error.message);
      results.push({
        page: page.name,
        url: page.url,
        error: error.message,
      });
    }

    console.log('');
  }

  // Save results to file
  const resultsDir = path.join(__dirname, '..', 'docs');
  const resultsFile = path.join(resultsDir, 'PERFORMANCE_TEST_RESULTS.json');
  
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved to: ${resultsFile}\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   Total pages tested: ${PAGES_TO_TEST.length}`);
  console.log(`   Total failures: ${totalFailures}`);
  
  if (totalFailures === 0) {
    console.log('\n✨ All performance tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some performance tests failed. Review the results above.');
    process.exit(1);
  }
}

// Check if lighthouse is installed
try {
  require.resolve('lighthouse');
  require.resolve('chrome-launcher');
} catch (e) {
  console.error('❌ Missing dependencies. Please install:');
  console.error('   npm install --save-dev lighthouse chrome-launcher');
  process.exit(1);
}

// Run tests
runPerformanceTests().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
