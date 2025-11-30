import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-middleware';
import { supabaseAdmin } from '@/lib/supabase';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

interface BarangayWithAwards {
  id: number;
  name: string;
  households: number;
  population: number;
  area: number;
  status: string;
  seal: boolean;
  logo_url?: string;
  description: string;
  isActive: boolean;
  officers?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  }>;
  awardStatus?: {
    isAwardee: boolean;
    awardedDate: string | null;
    notes: string | null;
    awardId: number | null;
    cycleId: number;
  };
}

/**
 * GET /api/barangays
 * Retrieves barangays with optional cycle-aware award information
 * Query parameters:
 * - cycle_id (optional): The cycle ID to get award status for. Defaults to active cycle.
 * - include_awards (optional): Whether to include cycle-specific award status. Defaults to false.
 * - awardees_only (optional): Whether to return only awardees. Defaults to false (backward compatibility).
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
    const includeAwards = searchParams.get('include_awards') === 'true';
    const awardeesOnly = searchParams.get('awardees_only') === 'true';
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
          households,
          population,
          area,
          currentStatus,
          seal,
          logo_url,
          description,
          is_active
        `)
        .eq('is_active', true)
        .eq('seal', 'yes')
        .order('barangay_name', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedBarangays = (barangays || []).map(row => ({
        id: row.barangay_id,
        name: row.barangay_name,
        households: row.households || 0,
        population: row.population || 0,
        area: row.area || 0,
        status: row.currentStatus || 'Pending',
        seal: row.seal === 'yes',
        logo_url: row.logo_url,
        description: row.description || '',
        isActive: row.is_active === true
      }));

      return NextResponse.json(formattedBarangays);
    }

    // Modern cycle-aware mode
    const targetCycleId = parsedCycleId || await getActiveCycleId();

    if (!targetCycleId && (includeAwards || awardeesOnly)) {
      return NextResponse.json(
        { 
          error: 'No active cycle',
          message: 'No cycle specified and no active cycle found for award operations'
        },
        { status: 400 }
      );
    }

    // Base query for all barangays
    let query = supabaseAdmin
      .from('barangay')
      .select(`
        barangay_id,
        barangay_name,
        households,
        population,
        area,
        currentStatus,
        seal,
        logo_url,
        description,
        is_active
      `)
      .eq('is_active', true);

    // Get barangays
    const { data: barangays, error: barangayError } = await query.order('barangay_name', { ascending: true });

    if (barangayError) {
      throw barangayError;
    }

    if (!barangays || barangays.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch officers designated to each barangay
    const { data: officers, error: officersError } = await supabaseAdmin
      .from('user')
      .select('barangayDesignation, firstName, lastName, email')
      .eq('role', 'officer')
      .not('barangayDesignation', 'is', null)
      .ilike('status', 'active');

    // Group officers by barangay
    const officersByBarangay = new Map<number, any[]>();
    if (officers && !officersError) {
      officers.forEach(officer => {
        const barangayId = officer.barangayDesignation;
        if (!officersByBarangay.has(barangayId)) {
          officersByBarangay.set(barangayId, []);
        }
        officersByBarangay.get(barangayId)!.push({
          firstName: officer.firstName,
          lastName: officer.lastName,
          email: officer.email,
          fullName: `${officer.firstName} ${officer.lastName}`
        });
      });
    }

    // Get award information if needed
    let awardeeIds: number[] = [];
    let cycleAwards: any[] = [];

    if (includeAwards || awardeesOnly) {
      if (targetCycleId) {
        if (includeAwards) {
          // Get detailed award information
          cycleAwards = await CycleAwardsService.getCycleAwards(targetCycleId);
        } else {
          // Just get awardee IDs for filtering
          awardeeIds = await CycleAwardsService.getAwardeeBarangayIds(targetCycleId);
        }
      }
    }

    // Create award lookup map for efficient access
    const awardMap = new Map();
    if (includeAwards && cycleAwards.length > 0) {
      cycleAwards.forEach(award => {
        awardMap.set(award.barangay_id, {
          isAwardee: award.is_awardee,
          awardedDate: award.awarded_date,
          notes: award.notes,
          awardId: award.id
        });
      });
    }

    // Format barangays with award information
    let formattedBarangays: BarangayWithAwards[] = barangays.map(row => {
      const officers = officersByBarangay.get(row.barangay_id) || [];
      
      const baseBarangay: BarangayWithAwards = {
        id: row.barangay_id,
        name: row.barangay_name,
        households: row.households || 0,
        population: row.population || 0,
        area: row.area || 0,
        status: row.currentStatus || 'Pending',
        seal: row.seal === 'yes', // Keep for backward compatibility
        logo_url: row.logo_url,
        description: row.description || '',
        isActive: row.is_active === true,
        officers: officers as any // Add officers array
      };

      if (includeAwards && targetCycleId) {
        const awardInfo = awardMap.get(row.barangay_id);
        baseBarangay.awardStatus = awardInfo ? {
          isAwardee: awardInfo.isAwardee,
          awardedDate: awardInfo.awardedDate,
          notes: awardInfo.notes,
          awardId: awardInfo.awardId,
          cycleId: targetCycleId
        } : {
          isAwardee: false,
          awardedDate: null,
          notes: null,
          awardId: null,
          cycleId: targetCycleId
        };
      }

      return baseBarangay;
    });

    // Filter for awardees only if requested
    if (awardeesOnly && targetCycleId) {
      if (includeAwards) {
        // Filter based on award status in the formatted data
        formattedBarangays = formattedBarangays.filter(barangay => 
          barangay.awardStatus?.isAwardee === true
        );
      } else {
        // Filter based on awardee IDs
        formattedBarangays = formattedBarangays.filter(barangay => 
          awardeeIds.includes(barangay.id)
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedBarangays,
      meta: {
        cycle_id: targetCycleId,
        include_awards: includeAwards,
        awardees_only: awardeesOnly,
        legacy_mode: legacyMode,
        total_count: formattedBarangays.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch barangays:', error);
    return NextResponse.json(
      { 
        error: "Failed to fetch barangays",
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}