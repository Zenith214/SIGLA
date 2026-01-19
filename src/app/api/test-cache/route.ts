import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barangayId = searchParams.get('barangayId');
    const cycleId = searchParams.get('cycleId');

    // Query ml_cache table for this barangay/cycle
    const { data: cacheEntries, error } = await supabaseAdmin
      .from('ml_cache')
      .select('*')
      .eq('barangay_id', barangayId)
      .eq('cycle_id', cycleId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the results
    const results = cacheEntries?.map(entry => ({
      endpoint: entry.endpoint,
      barangay_id: entry.barangay_id,
      cycle_id: entry.cycle_id,
      hit_count: entry.hit_count,
      computed_at: entry.computed_at,
      expires_at: entry.expires_at,
      is_stale: entry.is_stale,
      is_expired: new Date(entry.expires_at) < new Date(),
      last_accessed_at: entry.last_accessed_at,
      cache_key: entry.cache_key
    }));

    return NextResponse.json({
      barangayId,
      cycleId,
      totalEntries: results?.length || 0,
      entries: results || []
    });

  } catch (error) {
    console.error('Error checking cache:', error);
    return NextResponse.json(
      { error: 'Failed to check cache' },
      { status: 500 }
    );
  }
}
