/**
 * API Route: Conditional Insights Analytics
 * 
 * Provides analytics for unawareness and non-availment reasons
 * to help understand barriers to service awareness and usage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET: Retrieve conditional insights analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const cycleId = searchParams.get('cycleId');
    const serviceArea = searchParams.get('serviceArea');

    // Build where clause
    const whereClause: any = {};
    if (barangayId) whereClause.barangay_id = parseInt(barangayId);
    if (cycleId) whereClause.survey_cycle_id = parseInt(cycleId);

    // Get all survey responses with conditional data
    const responses = await prisma.surveyResponse.findMany({
      where: whereClause,
      select: {
        response_id: true,
        barangay_id: true,
        survey_cycle_id: true,
        unawareness_reasons: true,
        non_availment_reasons: true,
        barangay: {
          select: {
            barangay_name: true
          }
        },
        survey_cycle: {
          select: {
            name: true,
            year: true
          }
        }
      }
    });

    // Process unawareness reasons
    const unawarenessAnalytics = processUnawarenessReasons(responses, serviceArea);
    
    // Process non-availment reasons
    const nonAvailmentAnalytics = processNonAvailmentReasons(responses, serviceArea);

    // Calculate summary statistics
    const summary = calculateSummaryStats(responses, serviceArea);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        unawarenessAnalytics,
        nonAvailmentAnalytics,
        totalResponses: responses.length,
        filters: {
          barangayId,
          cycleId,
          serviceArea
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving conditional insights:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conditional insights' },
      { status: 500 }
    );
  }
}

/**
 * Process unawareness reasons data
 */
function processUnawarenessReasons(responses: any[], serviceArea?: string | null) {
  const reasonCounts: Record<string, Record<string, number>> = {};
  const serviceReasonCounts: Record<string, Record<string, number>> = {};

  responses.forEach(response => {
    const unawarenessReasons = response.unawareness_reasons || {};
    
    Object.entries(unawarenessReasons).forEach(([serviceId, reason]) => {
      // Filter by service area if specified
      if (serviceArea && !isServiceInArea(serviceId, serviceArea)) {
        return;
      }

      // Count by service
      if (!serviceReasonCounts[serviceId]) {
        serviceReasonCounts[serviceId] = {};
      }
      serviceReasonCounts[serviceId][reason as string] = 
        (serviceReasonCounts[serviceId][reason as string] || 0) + 1;

      // Count overall
      reasonCounts[reason as string] = (reasonCounts[reason as string] || 0) + 1;
    });
  });

  return {
    overallReasons: reasonCounts,
    byService: serviceReasonCounts,
    topReasons: getTopReasons(reasonCounts, 5)
  };
}

/**
 * Process non-availment reasons data
 */
function processNonAvailmentReasons(responses: any[], serviceArea?: string | null) {
  const reasonCounts: Record<string, number> = {};
  const serviceReasonCounts: Record<string, Record<string, number>> = {};

  responses.forEach(response => {
    const nonAvailmentReasons = response.non_availment_reasons || {};
    
    Object.entries(nonAvailmentReasons).forEach(([serviceId, reason]) => {
      // Filter by service area if specified
      if (serviceArea && !isServiceInArea(serviceId, serviceArea)) {
        return;
      }

      // Count by service
      if (!serviceReasonCounts[serviceId]) {
        serviceReasonCounts[serviceId] = {};
      }
      serviceReasonCounts[serviceId][reason as string] = 
        (serviceReasonCounts[serviceId][reason as string] || 0) + 1;

      // Count overall
      reasonCounts[reason as string] = (reasonCounts[reason as string] || 0) + 1;
    });
  });

  return {
    overallReasons: reasonCounts,
    byService: serviceReasonCounts,
    topReasons: getTopReasons(reasonCounts, 5)
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummaryStats(responses: any[], serviceArea?: string | null) {
  let totalUnawarenessResponses = 0;
  let totalNonAvailmentResponses = 0;
  const serviceStats: Record<string, { unawareness: number; nonAvailment: number }> = {};

  responses.forEach(response => {
    const unawarenessReasons = response.unawareness_reasons || {};
    const nonAvailmentReasons = response.non_availment_reasons || {};

    Object.keys(unawarenessReasons).forEach(serviceId => {
      if (!serviceArea || isServiceInArea(serviceId, serviceArea)) {
        totalUnawarenessResponses++;
        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = { unawareness: 0, nonAvailment: 0 };
        }
        serviceStats[serviceId].unawareness++;
      }
    });

    Object.keys(nonAvailmentReasons).forEach(serviceId => {
      if (!serviceArea || isServiceInArea(serviceId, serviceArea)) {
        totalNonAvailmentResponses++;
        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = { unawareness: 0, nonAvailment: 0 };
        }
        serviceStats[serviceId].nonAvailment++;
      }
    });
  });

  return {
    totalUnawarenessResponses,
    totalNonAvailmentResponses,
    serviceStats,
    responseRate: {
      unawareness: responses.length > 0 ? (totalUnawarenessResponses / responses.length) * 100 : 0,
      nonAvailment: responses.length > 0 ? (totalNonAvailmentResponses / responses.length) * 100 : 0
    }
  };
}

/**
 * Get top N reasons by count
 */
function getTopReasons(reasonCounts: Record<string, number>, limit: number) {
  return Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([reason, count]) => ({ reason, count }));
}

/**
 * Check if a service belongs to a specific service area
 */
function isServiceInArea(serviceId: string, serviceArea: string): boolean {
  const serviceAreaMapping: Record<string, string[]> = {
    'financial': ['projects', 'financial', 'socialPrograms', 'corruption'],
    'disaster': ['disasterInfo', 'evacuation'],
    'safety': ['tanods', 'lupon', 'antiDrug'],
    'social': ['healthServices', 'womenChildrenProtection', 'communityParticipation'],
    'business': ['businessClearance'],
    'environmental': ['wasteManagement']
  };

  return serviceAreaMapping[serviceArea]?.includes(serviceId) || false;
}