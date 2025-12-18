import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

/**
 * GET /api/barangays-with-seals
 * Retrieves barangays with award status (awardees) for assignment creation
 * Query parameters:
 * - cycle_id (optional): The cycle ID to get awardees for. Defaults to active cycle.
 * - legacy_mode (optional): Whether to use legacy seal-based filtering. Defaults to false.
 * 
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const authError = requireAuth(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycle_id');
    const legacyMode = searchParams.get('legacy_mode') === 'true';

    const parsedCycleId = cycleId ? parseInt(cycleId, 10) : undefined;

    // Validate cycle_id if provided
    if (cycleId && (isNaN(parsedCycleId!) || parsedCycleId! <= 0)) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          message: 'cycle_id must be a positive integer'
        },
        { status: 400 }
      );
    }

    if (legacyMode) {
      // Legacy mode: Use the old seal-based filtering for backward compatibility
      const { data: barangays, error } = await supabaseAdmin
        .from('barangay')
        .select(`
          barangay_id,
          barangay_name,
          population,
          households,
          captain,
          description,
          currentStatus,
          seal
        `)
        .eq('is_active', true)
        .eq('seal', 'yes')
        .order('barangay_name', { ascending: true });

      if (error) {
        throw error;
      }

      // Transform the data to match frontend expectations
      const transformedBarangays = (barangays || []).map((barangay: any) => ({
        id: barangay.barangay_id, // Transform barangay_id to id
        barangay_id: barangay.barangay_id, // Keep original for updates
        name: barangay.barangay_name, // Transform barangay_name to name
        population: barangay.population || 0,
        households: barangay.households || 0,
        captain: barangay.captain,
        description: barangay.description,
        currentStatus: barangay.currentStatus,
        seal: barangay.seal
      }));

      return NextResponse.json(transformedBarangays);
    }

    // Modern cycle-aware mode
    const targetCycleId = parsedCycleId || await getActiveCycleId();

    if (!targetCycleId) {
      return NextResponse.json(
        { 
          error: 'No active cycle',
          message: 'No cycle specified and no active cycle found'
        },
        { status: 400 }
      );
    }

    // Get awardee barangay IDs for the target cycle
    const awardeeIds = await CycleAwardsService.getAwardeeBarangayIds(targetCycleId);

    if (awardeeIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch barangay details for awardees
    const { data: barangays, error } = await supabaseAdmin
      .from('barangay')
      .select(`
        barangay_id,
        barangay_name,
        population,
        households,
        captain,
        description,
        currentStatus,
        seal
      `)
      .eq('is_active', true)
      .in('barangay_id', awardeeIds)
      .order('barangay_name', { ascending: true });

    if (error) {
      throw error;
    }

    // Transform the data to match frontend expectations
    const transformedBarangays = (barangays || []).map((barangay: any) => ({
      id: barangay.barangay_id, // Transform barangay_id to id
      barangay_id: barangay.barangay_id, // Keep original for updates
      name: barangay.barangay_name, // Transform barangay_name to name
      population: barangay.population || 0,
      households: barangay.households || 0,
      captain: barangay.captain,
      description: barangay.description,
      currentStatus: barangay.currentStatus,
      seal: barangay.seal, // Keep for backward compatibility
      cycleId: targetCycleId, // Add cycle context
      isAwardee: true // All returned barangays are awardees in this context
    }));

    return NextResponse.json({
      success: true,
      data: transformedBarangays,
      meta: {
        cycle_id: targetCycleId,
        legacy_mode: legacyMode,
        awardee_count: transformedBarangays.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching barangays with seals:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch barangays with seals",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}