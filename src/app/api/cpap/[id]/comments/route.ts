import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { CPAPNotificationSimpleService } from '@/lib/services/cpap-notification-simple.service';

/**
 * GET /api/cpap/[id]/comments
 * Fetch all comments for a specific CPAP
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const cpapId = parseInt(id);

    if (isNaN(cpapId)) {
      return NextResponse.json(
        { error: 'Invalid CPAP ID' },
        { status: 400 }
      );
    }

    // Fetch comments with user information
    const { data: comments, error } = await supabaseAdmin
      .from('cpap_comments')
      .select(`
        id,
        cpap_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        user:user_id (
          id,
          firstName,
          lastName,
          role
        )
      `)
      .eq('cpap_id', cpapId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      
      // Check if table doesn't exist
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Comments feature not yet set up. Please run the database migration.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error in GET /api/cpap/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cpap/[id]/comments
 * Add a new comment to a CPAP
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Comments API] POST request received');
    const authResult = await verifyAuth(request);
    
    console.log('[Comments API] Auth result:', { success: authResult.success, userId: authResult.user?.id, role: authResult.user?.role });
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const cpapId = parseInt(id);

    console.log('[Comments API] CPAP ID:', cpapId);

    if (isNaN(cpapId)) {
      return NextResponse.json(
        { error: 'Invalid CPAP ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { comment_text } = body;

    console.log('[Comments API] Comment text length:', comment_text?.length);

    if (!comment_text || comment_text.trim() === '') {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Verify CPAP exists
    const { data: cpap, error: cpapError } = await supabaseAdmin
      .from('cpaps')
      .select('id')
      .eq('id', cpapId)
      .single();

    if (cpapError || !cpap) {
      return NextResponse.json(
        { error: 'CPAP not found' },
        { status: 404 }
      );
    }

    // Insert comment
    const { data: comment, error: insertError } = await supabaseAdmin
      .from('cpap_comments')
      .insert({
        cpap_id: cpapId,
        user_id: authResult.user.id,
        comment_text: comment_text.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        cpap_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        user:user_id (
          id,
          firstName,
          lastName,
          role
        )
      `)
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      
      // Check if table doesn't exist
      if (insertError.message?.includes('relation') && insertError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Comments feature not yet set up. Please run the database migration.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    // Notify relevant users about the new comment
    try {
      await CPAPNotificationSimpleService.notifyCommentAdded(
        cpapId,
        authResult.user.id,
        authResult.user.role
      );
    } catch (notifError) {
      console.error('Error sending comment notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/cpap/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
