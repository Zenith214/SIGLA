/**
 * API Route: Conditional Responses Handler
 * 
 * Handles the storage and retrieval of conditional question responses
 * (unawareness and non-availment reasons) for survey responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractConditionalResponses } from '@/app/survey/forms/utils/conditionalFlow';

/**
 * POST: Save conditional responses for a survey
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseId, formData } = body;

    if (!responseId || !formData) {
      return NextResponse.json(
        { error: 'Response ID and form data are required' },
        { status: 400 }
      );
    }

    // Extract conditional responses from form data
    const { unawarenessReasons, nonAvailmentReasons } = extractConditionalResponses(formData);

    // Update the survey response with conditional data
    const updatedResponse = await prisma.surveyResponse.update({
      where: { response_id: responseId },
      data: {
        unawareness_reasons: unawarenessReasons,
        non_availment_reasons: nonAvailmentReasons,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Conditional responses saved successfully',
      data: {
        responseId: updatedResponse.response_id,
        unawarenessReasons,
        nonAvailmentReasons
      }
    });

  } catch (error) {
    console.error('Error saving conditional responses:', error);
    return NextResponse.json(
      { error: 'Failed to save conditional responses' },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve conditional responses for a survey
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get('responseId');

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    const response = await prisma.surveyResponse.findUnique({
      where: { response_id: parseInt(responseId) },
      select: {
        response_id: true,
        unawareness_reasons: true,
        non_availment_reasons: true
      }
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Survey response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        responseId: response.response_id,
        unawarenessReasons: response.unawareness_reasons || {},
        nonAvailmentReasons: response.non_availment_reasons || {}
      }
    });

  } catch (error) {
    console.error('Error retrieving conditional responses:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conditional responses' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update conditional responses for a survey
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseId, unawarenessReasons, nonAvailmentReasons } = body;

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    const updatedResponse = await prisma.surveyResponse.update({
      where: { response_id: responseId },
      data: {
        unawareness_reasons: unawarenessReasons || {},
        non_availment_reasons: nonAvailmentReasons || {},
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Conditional responses updated successfully',
      data: {
        responseId: updatedResponse.response_id,
        unawarenessReasons: updatedResponse.unawareness_reasons,
        nonAvailmentReasons: updatedResponse.non_availment_reasons
      }
    });

  } catch (error) {
    console.error('Error updating conditional responses:', error);
    return NextResponse.json(
      { error: 'Failed to update conditional responses' },
      { status: 500 }
    );
  }
}