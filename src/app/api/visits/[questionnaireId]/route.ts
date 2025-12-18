import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from '@/lib/supabase';
import {
  createErrorResponse,
  createNotFoundError,
  handleDatabaseError
} from '@/lib/api-error-handler';

/**
 * GET /api/visits/[questionnaireId]
 * Fetch visit history for a specific questionnaire
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionnaireId: string }> }
) {
  try {
    const { questionnaireId } = await params;

    if (!questionnaireId || questionnaireId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Questionnaire ID is required' },
        { status: 400 }
      );
    }

    // Verify questionnaire exists
    const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('questionnaire_id, visit_count, status')
      .eq('questionnaire_id', questionnaireId.trim())
      .single();

    if (questionnaireError) {
      if (questionnaireError.code === 'PGRST116') {
        throw createNotFoundError('Questionnaire');
      }
      throw handleDatabaseError(questionnaireError, 'fetch questionnaire');
    }

    if (!questionnaire) {
      throw createNotFoundError('Questionnaire');
    }

    // Fetch all visits for this questionnaire
    const { data: visits, error: visitsError } = await supabaseAdmin
      .from('visits')
      .select('*')
      .eq('questionnaire_id', questionnaireId)
      .order('visit_number', { ascending: true });

    if (visitsError) {
      throw handleDatabaseError(visitsError, 'fetch visits');
    }

    return NextResponse.json({
      questionnaireId,
      status: questionnaire.status,
      visitCount: questionnaire.visit_count || 0,
      visits: visits || []
    });

  } catch (error: any) {
    return createErrorResponse(error, `GET /api/visits/${(await params).questionnaireId}`);
  }
}
