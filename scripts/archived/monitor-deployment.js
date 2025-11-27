#!/usr/bin/env node

/**
 * Monitor CSIS Deployment Health
 * 
 * This script monitors:
 * 1. Error logs for issues
 * 2. GPS capture success rate
 * 3. Survey completion rates
 * 4. API performance metrics
 * 
 * Usage:
 *   node scripts/monitor-deployment.js [--interval=60] [--duration=900]
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const MONITOR_CONFIG = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  interval: 60, // Check every 60 seconds
  duration: 900, // Monitor for 15 minutes (900 seconds)
};

// Parse command line arguments
const args = process.argv.slice(2);
const intervalArg = args.find(arg => arg.startsWith('--interval='));
const durationArg = args.find(arg => arg.startsWith('--duration='));

if (intervalArg) {
  MONITOR_CONFIG.interval = parseInt(intervalArg.split('=')[1], 10);
}
if (durationArg) {
  MONITOR_CONFIG.duration = parseInt(durationArg.split('=')[1], 10);
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logMetric(label, value, unit = '', status = 'info') {
  const statusColors = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue'
  };
  const color = statusColors[status] || 'blue';
  log(`  ${label}: ${value}${unit}`, color);
}

/**
 * Get GPS capture success rate
 */
async function getGPSCaptureRate(supabase, timeWindow = 3600) {
  try {
    const cutoffTime = new Date(Date.now() - timeWindow * 1000).toISOString();

    // Get total surveys created in time window
    const { data: totalSurveys, error: totalError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime);

    if (totalError) throw totalError;

    // Get surveys with GPS verification location
    const { data: surveysWithGPS, error: gpsError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)
      .not('verification_location', 'is', null);

    if (gpsError) throw gpsError;

    const total = totalSurveys?.length || 0;
    const withGPS = surveysWithGPS?.length || 0;
    const rate = total > 0 ? (withGPS / total) * 100 : 0;

    return {
      total,
      withGPS,
      rate: rate.toFixed(2),
      status: rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'error'
    };
  } catch (error) {
    console.error('Error getting GPS capture rate:', error.message);
    return { total: 0, withGPS: 0, rate: 0, status: 'error' };
  }
}

/**
 * Get GPS verification statistics
 */
async function getGPSVerificationStats(supabase, timeWindow = 3600) {
  try {
    const cutoffTime = new Date(Date.now() - timeWindow * 1000).toISOString();

    // Get surveys by verification status
    const { data: pending, error: pendingError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)
      .eq('gps_verification_status', 'pending');

    const { data: verified, error: verifiedError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)
      .eq('gps_verification_status', 'verified');

    const { data: flagged, error: flaggedError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)
      .eq('gps_verification_status', 'flagged');

    if (pendingError || verifiedError || flaggedError) {
      throw new Error('Error querying verification status');
    }

    const pendingCount = pending?.length || 0;
    const verifiedCount = verified?.length || 0;
    const flaggedCount = flagged?.length || 0;
    const total = pendingCount + verifiedCount + flaggedCount;

    const flaggedRate = total > 0 ? (flaggedCount / total) * 100 : 0;

    return {
      pending: pendingCount,
      verified: verifiedCount,
      flagged: flaggedCount,
      total,
      flaggedRate: flaggedRate.toFixed(2),
      status: flaggedRate <= 5 ? 'success' : flaggedRate <= 15 ? 'warning' : 'error'
    };
  } catch (error) {
    console.error('Error getting GPS verification stats:', error.message);
    return { pending: 0, verified: 0, flagged: 0, total: 0, flaggedRate: 0, status: 'error' };
  }
}

/**
 * Get survey completion rate
 */
async function getSurveyCompletionRate(supabase, timeWindow = 3600) {
  try {
    const cutoffTime = new Date(Date.now() - timeWindow * 1000).toISOString();

    // Get completed surveys
    const { data: completed, error: completedError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime)
      .eq('status', 'completed');

    // Get all surveys (including incomplete)
    const { data: total, error: totalError } = await supabase
      .from('survey_response')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', cutoffTime);

    if (completedError || totalError) {
      throw new Error('Error querying survey completion');
    }

    const completedCount = completed?.length || 0;
    const totalCount = total?.length || 0;
    const rate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return {
      completed: completedCount,
      total: totalCount,
      rate: rate.toFixed(2),
      status: rate >= 85 ? 'success' : rate >= 70 ? 'warning' : 'error'
    };
  } catch (error) {
    console.error('Error getting survey completion rate:', error.message);
    return { completed: 0, total: 0, rate: 0, status: 'error' };
  }
}

/**
 * Get average GPS distance
 */
async function getAverageGPSDistance(supabase, timeWindow = 3600) {
  try {
    const cutoffTime = new Date(Date.now() - timeWindow * 1000).toISOString();

    const { data, error } = await supabase
      .from('survey_response')
      .select('gps_distance_meters')
      .gte('created_at', cutoffTime)
      .not('gps_distance_meters', 'is', null);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0, status: 'info' };
    }

    const distances = data.map(d => d.gps_distance_meters);
    const average = distances.reduce((sum, d) => sum + d, 0) / distances.length;

    return {
      average: average.toFixed(2),
      count: distances.length,
      status: average <= 100 ? 'success' : average <= 200 ? 'warning' : 'error'
    };
  } catch (error) {
    console.error('Error getting average GPS distance:', error.message);
    return { average: 0, count: 0, status: 'error' };
  }
}

/**
 * Get recent errors
 */
async function getRecentErrors(supabase, timeWindow = 3600) {
  try {
    const cutoffTime = new Date(Date.now() - timeWindow * 1000).toISOString();

    // This would typically query an error logging table
    // For now, we'll check for surveys with issues
    const { data: errors, error } = await supabase
      .from('survey_response')
      .select('id, error_message')
      .gte('created_at', cutoffTime)
      .not('error_message', 'is', null);

    if (error) throw error;

    const errorCount = errors?.length || 0;

    return {
      count: errorCount,
      status: errorCount === 0 ? 'success' : errorCount <= 5 ? 'warning' : 'error'
    };
  } catch (error) {
    console.error('Error getting recent errors:', error.message);
    return { count: 0, status: 'error' };
  }
}

/**
 * Perform health check
 */
async function performHealthCheck(supabase, iteration, totalIterations) {
  const timestamp = new Date().toISOString();
  
  log('\n' + '='.repeat(60), 'cyan');
  log(`Health Check #${iteration}/${totalIterations} - ${timestamp}`, 'cyan');
  log('='.repeat(60), 'cyan');

  // Get metrics
  const gpsCapture = await getGPSCaptureRate(supabase, 3600);
  const gpsVerification = await getGPSVerificationStats(supabase, 3600);
  const surveyCompletion = await getSurveyCompletionRate(supabase, 3600);
  const gpsDistance = await getAverageGPSDistance(supabase, 3600);
  const errors = await getRecentErrors(supabase, 3600);

  // Display metrics
  log('\n📊 GPS Capture Metrics (Last Hour):', 'blue');
  logMetric('Total Surveys', gpsCapture.total, '', 'info');
  logMetric('With GPS Location', gpsCapture.withGPS, '', 'info');
  logMetric('Capture Success Rate', gpsCapture.rate, '%', gpsCapture.status);

  log('\n📍 GPS Verification Status (Last Hour):', 'blue');
  logMetric('Pending Verification', gpsVerification.pending, '', 'info');
  logMetric('Verified (Within Threshold)', gpsVerification.verified, '', 'success');
  logMetric('Flagged (Exceeds Threshold)', gpsVerification.flagged, '', gpsVerification.status);
  logMetric('Flagged Rate', gpsVerification.flaggedRate, '%', gpsVerification.status);

  log('\n📋 Survey Completion (Last Hour):', 'blue');
  logMetric('Completed Surveys', surveyCompletion.completed, '', 'info');
  logMetric('Total Surveys', surveyCompletion.total, '', 'info');
  logMetric('Completion Rate', surveyCompletion.rate, '%', surveyCompletion.status);

  log('\n📏 GPS Distance Metrics (Last Hour):', 'blue');
  logMetric('Average Distance', gpsDistance.average, 'm', gpsDistance.status);
  logMetric('Samples', gpsDistance.count, '', 'info');

  log('\n⚠️  Error Monitoring (Last Hour):', 'blue');
  logMetric('Error Count', errors.count, '', errors.status);

  // Overall health assessment
  const healthStatuses = [
    gpsCapture.status,
    gpsVerification.status,
    surveyCompletion.status,
    gpsDistance.status,
    errors.status
  ];

  const hasError = healthStatuses.includes('error');
  const hasWarning = healthStatuses.includes('warning');

  log('\n🏥 Overall Health:', 'blue');
  if (hasError) {
    log('  Status: CRITICAL - Immediate attention required', 'red');
  } else if (hasWarning) {
    log('  Status: WARNING - Monitor closely', 'yellow');
  } else {
    log('  Status: HEALTHY - All systems operational', 'green');
  }

  log('='.repeat(60) + '\n', 'cyan');

  return {
    healthy: !hasError,
    warning: hasWarning,
    metrics: {
      gpsCapture,
      gpsVerification,
      surveyCompletion,
      gpsDistance,
      errors
    }
  };
}

/**
 * Main monitoring function
 */
async function monitor() {
  log('\n' + '='.repeat(60), 'magenta');
  log('CSIS DEPLOYMENT MONITORING', 'magenta');
  log('='.repeat(60), 'magenta');
  log(`Interval: ${MONITOR_CONFIG.interval} seconds`, 'blue');
  log(`Duration: ${MONITOR_CONFIG.duration} seconds (${Math.floor(MONITOR_CONFIG.duration / 60)} minutes)`, 'blue');
  log('='.repeat(60) + '\n', 'magenta');

  const supabase = createClient(
    MONITOR_CONFIG.supabaseUrl,
    MONITOR_CONFIG.supabaseKey
  );

  const totalIterations = Math.floor(MONITOR_CONFIG.duration / MONITOR_CONFIG.interval);
  let iteration = 0;
  const results = [];

  const monitorInterval = setInterval(async () => {
    iteration++;
    
    try {
      const result = await performHealthCheck(supabase, iteration, totalIterations);
      results.push(result);

      if (iteration >= totalIterations) {
        clearInterval(monitorInterval);
        printFinalSummary(results);
        process.exit(0);
      }
    } catch (error) {
      log(`Error during health check: ${error.message}`, 'red');
    }
  }, MONITOR_CONFIG.interval * 1000);

  // Perform first check immediately
  try {
    const result = await performHealthCheck(supabase, 1, totalIterations);
    results.push(result);
  } catch (error) {
    log(`Error during initial health check: ${error.message}`, 'red');
  }
}

/**
 * Print final monitoring summary
 */
function printFinalSummary(results) {
  log('\n' + '='.repeat(60), 'magenta');
  log('MONITORING SUMMARY', 'magenta');
  log('='.repeat(60), 'magenta');

  const healthyCount = results.filter(r => r.healthy).length;
  const warningCount = results.filter(r => !r.healthy && r.warning).length;
  const criticalCount = results.filter(r => !r.healthy && !r.warning).length;

  log(`\nTotal Checks: ${results.length}`, 'blue');
  logMetric('Healthy', healthyCount, '', 'success');
  logMetric('Warning', warningCount, '', 'warning');
  logMetric('Critical', criticalCount, '', 'error');

  // Calculate average metrics
  if (results.length > 0) {
    const avgGPSRate = results.reduce((sum, r) => sum + parseFloat(r.metrics.gpsCapture.rate), 0) / results.length;
    const avgCompletionRate = results.reduce((sum, r) => sum + parseFloat(r.metrics.surveyCompletion.rate), 0) / results.length;
    const avgFlaggedRate = results.reduce((sum, r) => sum + parseFloat(r.metrics.gpsVerification.flaggedRate), 0) / results.length;

    log('\n📊 Average Metrics:', 'blue');
    logMetric('GPS Capture Rate', avgGPSRate.toFixed(2), '%', avgGPSRate >= 90 ? 'success' : 'warning');
    logMetric('Survey Completion Rate', avgCompletionRate.toFixed(2), '%', avgCompletionRate >= 85 ? 'success' : 'warning');
    logMetric('GPS Flagged Rate', avgFlaggedRate.toFixed(2), '%', avgFlaggedRate <= 5 ? 'success' : 'warning');
  }

  log('\n' + '='.repeat(60), 'magenta');

  if (criticalCount > 0) {
    log('\n⚠️  CRITICAL ISSUES DETECTED', 'red');
    log('Consider rolling back the deployment', 'red');
    log('Run: node scripts/rollback-production.js', 'red');
  } else if (warningCount > results.length / 2) {
    log('\n⚠️  MULTIPLE WARNINGS DETECTED', 'yellow');
    log('Monitor closely before increasing canary percentage', 'yellow');
  } else {
    log('\n✨ Deployment appears stable', 'green');
    log('Consider increasing canary percentage', 'green');
    log('Run: node scripts/increase-canary.js --percentage=25', 'green');
  }
}

// Run monitoring
monitor().catch(error => {
  log(`Monitoring failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
