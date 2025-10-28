import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { apiCache, invalidateCache } from '@/lib/cache';

/**
 * POST /api/analytics/cache
 * Invalidate analytics cache
 * 
 * Body options:
 * - { action: 'clear_all' } - Clear all caches
 * - { action: 'clear_pattern', pattern: 'barangay-comparison' } - Clear specific pattern
 * - { action: 'clear_cycle', cycle_id: 18 } - Clear caches for specific cycle
 * - { action: 'clear_barangay', barangay_id: 1 } - Clear caches for specific barangay
 * - { action: 'stats' } - Get cache statistics
 */
export async function POST(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, pattern, cycle_id, barangay_id } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    let result: any = {};

    switch (action) {
      case 'clear_all':
        invalidateCache.all();
        result = { message: 'All caches cleared', cleared: true };
        break;

      case 'clear_pattern':
        if (!pattern) {
          return NextResponse.json(
            { error: 'pattern is required for clear_pattern action' },
            { status: 400 }
          );
        }
        const count = apiCache.clearPattern(pattern);
        result = { message: `Cleared ${count} cache entries matching pattern: ${pattern}`, count };
        break;

      case 'clear_cycle':
        if (!cycle_id) {
          return NextResponse.json(
            { error: 'cycle_id is required for clear_cycle action' },
            { status: 400 }
          );
        }
        const cycleCount = invalidateCache.cycle(cycle_id);
        result = { message: `Cleared ${cycleCount} cache entries for cycle ${cycle_id}`, count: cycleCount };
        break;

      case 'clear_barangay':
        if (!barangay_id) {
          return NextResponse.json(
            { error: 'barangay_id is required for clear_barangay action' },
            { status: 400 }
          );
        }
        const barangayCount = invalidateCache.barangay(barangay_id);
        result = { message: `Cleared ${barangayCount} cache entries for barangay ${barangay_id}`, count: barangayCount };
        break;

      case 'stats':
        result = apiCache.getStats();
        break;

      case 'cleanup':
        const cleanedCount = apiCache.cleanup();
        result = { message: `Cleaned up ${cleanedCount} expired cache entries`, count: cleanedCount };
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Must be one of: clear_all, clear_pattern, clear_cycle, clear_barangay, stats, cleanup` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      ...result
    });

  } catch (error) {
    console.error('[CACHE API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform cache operation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/cache
 * Get cache statistics
 */
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: 401 });
  }

  try {
    const stats = apiCache.getStats();
    
    return NextResponse.json({
      success: true,
      ...stats
    });

  } catch (error) {
    console.error('[CACHE API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}
