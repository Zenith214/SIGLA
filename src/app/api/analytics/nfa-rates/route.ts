/**
 * NFA Rates Analytics API
 * 
 * This endpoint provides NFA (Need for Action) rate calculations with comprehensive error handling.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Error Handling:
 * - Scenario 7: Handle zero responses case gracefully (Requirement 4.4)
 * - Scenario 8: Log and skip malformed JSONB data
 * - Scenario 9: Validate query parameters
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  calculateNFARateForIndicator,
  calculateNFARatesForServiceArea,
  calculateNFARatesAcrossAllServiceAreas,
  compareNFARatesAcrossBarangays,
  calculateNFARateTrend,
  isValidServiceArea,
  isValidBinaryFieldName,
  isValidCycleId,
  isValidBarangayId,
  getValidServiceAreas,
  getValidBinaryFieldNames,
} from '@/lib/nfa-analytics-queries';
import {
  badRequestResponse,
  internalServerErrorResponse,
  handleDatabaseError,
} from '@/lib/api/error-responses';

/**
 * GET /api/analytics/nfa-rates
 * 
 * Query Parameters:
 * - mode: 'indicator' | 'service-area' | 'all-areas' | 'barangay-comparison' | 'trend'
 * - serviceArea: Service area key (required for most modes)
 * - binaryFieldName: Binary field name (required for 'indicator' mode)
 * - cycleId: Survey cycle ID (required)
 * - barangayId: Barangay ID (required for some modes)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const mode = searchParams.get('mode') || 'indicator';
    const serviceArea = searchParams.get('serviceArea');
    const binaryFieldName = searchParams.get('binaryFieldName');
    const cycleIdParam = searchParams.get('cycleId');
    const barangayIdParam = searchParams.get('barangayId');

    // Scenario 9: Validate query parameters
    
    // Validate mode
    const validModes = ['indicator', 'service-area', 'all-areas', 'barangay-comparison', 'trend'];
    if (!validModes.includes(mode)) {
      return badRequestResponse(
        'Invalid mode parameter',
        `Mode must be one of: ${validModes.join(', ')}`
      );
    }

    // Validate cycleId (required for all modes)
    if (!cycleIdParam) {
      return badRequestResponse(
        'Missing required parameter',
        'cycleId is required'
      );
    }

    if (!isValidCycleId(cycleIdParam)) {
      return badRequestResponse(
        'Invalid cycleId parameter',
        'cycleId must be a positive integer'
      );
    }

    const cycleId = Number(cycleIdParam);

    // Mode-specific validation
    if (mode === 'indicator') {
      // Validate serviceArea
      if (!serviceArea) {
        return badRequestResponse(
          'Missing required parameter',
          'serviceArea is required for indicator mode'
        );
      }

      if (!isValidServiceArea(serviceArea)) {
        return badRequestResponse(
          'Invalid serviceArea parameter',
          `serviceArea must be one of: ${getValidServiceAreas().join(', ')}`
        );
      }

      // Validate binaryFieldName
      if (!binaryFieldName) {
        return badRequestResponse(
          'Missing required parameter',
          'binaryFieldName is required for indicator mode'
        );
      }

      if (!isValidBinaryFieldName(serviceArea, binaryFieldName)) {
        return badRequestResponse(
          'Invalid binaryFieldName parameter',
          `binaryFieldName must be one of: ${getValidBinaryFieldNames(serviceArea).join(', ')}`
        );
      }

      // Validate barangayId
      if (!barangayIdParam) {
        return badRequestResponse(
          'Missing required parameter',
          'barangayId is required for indicator mode'
        );
      }

      if (!isValidBarangayId(barangayIdParam)) {
        return badRequestResponse(
          'Invalid barangayId parameter',
          'barangayId must be a positive integer'
        );
      }

      const barangayId = Number(barangayIdParam);

      // Calculate NFA rate for specific indicator
      const result = await calculateNFARateForIndicator(
        supabase,
        serviceArea,
        binaryFieldName,
        cycleId,
        barangayId
      );

      // Scenario 7: Include metadata about data availability
      return NextResponse.json({
        mode: 'indicator',
        serviceArea,
        binaryFieldName,
        cycleId,
        barangayId,
        result,
        hasData: result.totalResponses > 0,
        message: result.totalResponses === 0 ? 'No responses available for this indicator' : undefined,
      });
    }

    if (mode === 'service-area') {
      // Validate serviceArea
      if (!serviceArea) {
        return badRequestResponse(
          'Missing required parameter',
          'serviceArea is required for service-area mode'
        );
      }

      if (!isValidServiceArea(serviceArea)) {
        return badRequestResponse(
          'Invalid serviceArea parameter',
          `serviceArea must be one of: ${getValidServiceAreas().join(', ')}`
        );
      }

      // Validate barangayId
      if (!barangayIdParam) {
        return badRequestResponse(
          'Missing required parameter',
          'barangayId is required for service-area mode'
        );
      }

      if (!isValidBarangayId(barangayIdParam)) {
        return badRequestResponse(
          'Invalid barangayId parameter',
          'barangayId must be a positive integer'
        );
      }

      const barangayId = Number(barangayIdParam);

      // Calculate NFA rates for all indicators in service area
      const results = await calculateNFARatesForServiceArea(
        supabase,
        serviceArea as any,
        cycleId,
        barangayId
      );

      const totalResponses = results.reduce((sum, r) => sum + r.totalResponses, 0);

      return NextResponse.json({
        mode: 'service-area',
        serviceArea,
        cycleId,
        barangayId,
        results,
        hasData: totalResponses > 0,
        message: totalResponses === 0 ? 'No responses available for this service area' : undefined,
      });
    }

    if (mode === 'all-areas') {
      // Validate barangayId
      if (!barangayIdParam) {
        return badRequestResponse(
          'Missing required parameter',
          'barangayId is required for all-areas mode'
        );
      }

      if (!isValidBarangayId(barangayIdParam)) {
        return badRequestResponse(
          'Invalid barangayId parameter',
          'barangayId must be a positive integer'
        );
      }

      const barangayId = Number(barangayIdParam);

      // Calculate NFA rates across all service areas
      const results = await calculateNFARatesAcrossAllServiceAreas(
        supabase,
        cycleId,
        barangayId
      );

      const totalResponses = results.reduce((sum, r) => sum + r.totalResponses, 0);

      return NextResponse.json({
        mode: 'all-areas',
        cycleId,
        barangayId,
        results,
        hasData: totalResponses > 0,
        message: totalResponses === 0 ? 'No responses available for any service area' : undefined,
      });
    }

    if (mode === 'barangay-comparison') {
      // Validate serviceArea
      if (!serviceArea) {
        return badRequestResponse(
          'Missing required parameter',
          'serviceArea is required for barangay-comparison mode'
        );
      }

      if (!isValidServiceArea(serviceArea)) {
        return badRequestResponse(
          'Invalid serviceArea parameter',
          `serviceArea must be one of: ${getValidServiceAreas().join(', ')}`
        );
      }

      // Validate binaryFieldName
      if (!binaryFieldName) {
        return badRequestResponse(
          'Missing required parameter',
          'binaryFieldName is required for barangay-comparison mode'
        );
      }

      if (!isValidBinaryFieldName(serviceArea, binaryFieldName)) {
        return badRequestResponse(
          'Invalid binaryFieldName parameter',
          `binaryFieldName must be one of: ${getValidBinaryFieldNames(serviceArea).join(', ')}`
        );
      }

      // Compare NFA rates across barangays
      const results = await compareNFARatesAcrossBarangays(
        supabase,
        serviceArea,
        binaryFieldName,
        cycleId
      );

      return NextResponse.json({
        mode: 'barangay-comparison',
        serviceArea,
        binaryFieldName,
        cycleId,
        results,
        hasData: results.length > 0,
        message: results.length === 0 ? 'No barangays with responses for this indicator' : undefined,
      });
    }

    if (mode === 'trend') {
      // Validate serviceArea
      if (!serviceArea) {
        return badRequestResponse(
          'Missing required parameter',
          'serviceArea is required for trend mode'
        );
      }

      if (!isValidServiceArea(serviceArea)) {
        return badRequestResponse(
          'Invalid serviceArea parameter',
          `serviceArea must be one of: ${getValidServiceAreas().join(', ')}`
        );
      }

      // Validate binaryFieldName
      if (!binaryFieldName) {
        return badRequestResponse(
          'Missing required parameter',
          'binaryFieldName is required for trend mode'
        );
      }

      if (!isValidBinaryFieldName(serviceArea, binaryFieldName)) {
        return badRequestResponse(
          'Invalid binaryFieldName parameter',
          `binaryFieldName must be one of: ${getValidBinaryFieldNames(serviceArea).join(', ')}`
        );
      }

      // Validate barangayId
      if (!barangayIdParam) {
        return badRequestResponse(
          'Missing required parameter',
          'barangayId is required for trend mode'
        );
      }

      if (!isValidBarangayId(barangayIdParam)) {
        return badRequestResponse(
          'Invalid barangayId parameter',
          'barangayId must be a positive integer'
        );
      }

      const barangayId = Number(barangayIdParam);

      // Calculate NFA rate trend across cycles
      const results = await calculateNFARateTrend(
        supabase,
        serviceArea,
        binaryFieldName,
        barangayId
      );

      return NextResponse.json({
        mode: 'trend',
        serviceArea,
        binaryFieldName,
        barangayId,
        results,
        hasData: results.length > 0,
        message: results.length === 0 ? 'No historical data available for this indicator' : undefined,
      });
    }

    // Should never reach here due to mode validation above
    return badRequestResponse('Invalid mode parameter');

  } catch (error: any) {
    console.error('Error in NFA rates analytics:', error);

    // Check if it's a database error
    if (error.code) {
      return handleDatabaseError(error, 'calculate NFA rates');
    }

    // Generic error response
    return internalServerErrorResponse(
      'Failed to calculate NFA rates',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}
