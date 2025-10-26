/**
 * ML Cache Management API
 * Provides endpoints to manage, monitor, and invalidate ML cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats, invalidateCache, invalidateCachePattern, cleanupOldCache } from '@/lib/ml-cache';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get cache statistics
      const stats = await getCacheStats();
      return NextResponse.json({ success: true, data: stats });
    }

    // Default: return all cache entries
    const { data: cacheEntries, error } = await supabase
      .from('ml_cache')
      .select('*')
      .order('computed_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data: cacheEntries });

  } catch (error) {
    console.error('Error fetching cache data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const cacheKey = searchParams.get('cacheKey');
    const endpoint = searchParams.get('endpoint');
    const cycleId = searchParams.get('cycleId');
    const barangayId = searchParams.get('barangayId');

    if (action === 'cleanup') {
      // Clean up old cache entries
      const daysOld = parseInt(searchParams.get('daysOld') || '30');
      const deletedCount = await cleanupOldCache(daysOld);
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount} old cache entries`,
        deletedCount
      });
    }

    if (cacheKey) {
      // Invalidate specific cache entry
      await invalidateCache(cacheKey);
      return NextResponse.json({
        success: true,
        message: 'Cache entry invalidated'
      });
    }

    // Invalidate by pattern
    await invalidateCachePattern(
      endpoint || undefined,
      cycleId ? parseInt(cycleId) : undefined,
      barangayId ? parseInt(barangayId) : undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated'
    });

  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'invalidate-all') {
      // Invalidate all cache entries
      const { error } = await supabase
        .from('ml_cache')
        .delete()
        .neq('id', 0); // Delete all

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'All cache entries invalidated'
      });
    }

    if (action === 'mark-stale') {
      // Mark all cache as stale (will trigger recomputation on next access)
      const { error } = await supabase
        .from('ml_cache')
        .update({ is_stale: true })
        .neq('id', 0);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'All cache entries marked as stale'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    );
  }
}
