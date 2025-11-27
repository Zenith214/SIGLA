#!/usr/bin/env node

/**
 * Test script for funnel analysis API
 * Tests the new funnel analysis endpoint with real survey data
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFunnelAnalysis() {
  console.log('🧪 Testing Funnel Analysis API...\n');

  try {
    // Test with a barangay that has survey data
    const barangayId = 17; // Buguis barangay
    console.log(`📊 Testing funnel analysis for Barangay ID: ${barangayId}`);

    const response = await fetch(`${BASE_URL}/api/funnel-analysis?barangayId=${barangayId}`);
    const data = await response.json();

    if (!response.ok) {
      console.log('❌ API Error:', response.status, data.error);
      return;
    }

    console.log('✅ Funnel Analysis API Response:');
    console.log('=====================================');
    console.log(`Barangay ID: ${data.barangay_id}`);
    console.log(`Total Responses: ${data.total_responses}`);
    console.log(`Overall Satisfaction: ${data.overall_satisfaction}%`);
    console.log(`Services with Data: ${data.data_quality?.services_with_data || 0}`);
    console.log('');

    // Display service scores
    console.log('📈 Service Scores:');
    console.log('==================');

    if (data.service_scores && Object.keys(data.service_scores).length > 0) {
      Object.entries(data.service_scores).forEach(([service, scores]) => {
        console.log(`\n${service.toUpperCase()}:`);
        console.log(`  Awareness: ${scores.awareness_score}%`);
        console.log(`  Availment: ${scores.availment_score}%`);
        console.log(`  Satisfaction: ${scores.satisfaction_score}%`);
        console.log(`  Need Action: ${scores.need_action_score}%`);
        console.log(`  Sample Size: ${scores.sample_size} responses`);
      });
    } else {
      console.log('  No service scores available (no survey data)');
    }

    console.log('');

    // Display Action Grid
    console.log('🎯 Action Grid Classifications:');
    console.log('==============================');

    if (data.action_grid && Object.keys(data.action_grid).length > 0) {
      Object.entries(data.action_grid).forEach(([service, grid]) => {
        console.log(`${service}: ${grid.quadrant} (${grid.satisfaction_score}% satisfaction, ${grid.need_action_score}% need action)`);
      });
    } else {
      console.log('  No action grid classifications available');
    }

    console.log('');

    // Test with a barangay that has no survey data
    console.log('🧪 Testing with barangay that has no survey data...');
    const emptyBarangayId = 1; // Test with a different barangay
    const emptyResponse = await fetch(`${BASE_URL}/api/funnel-analysis?barangayId=${emptyBarangayId}`);
    const emptyData = await emptyResponse.json();

    if (emptyResponse.ok) {
      console.log(`✅ Empty barangay response: ${emptyData.message || 'No data available'}`);
    }

    console.log('\n🎉 Funnel Analysis API Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running on port 3000');
  }
}

// Run the test
testFunnelAnalysis();