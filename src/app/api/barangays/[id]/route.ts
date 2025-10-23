import { NextRequest, NextResponse } from "next/server";
import { Pool } from 'pg';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

// Initialize PostgreSQL connection pool
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    client = await pool.connect();
    const { id } = await params;
    const barangayId = parseInt(id);
    
    if (isNaN(barangayId)) {
      return NextResponse.json({ error: "Invalid barangay ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycle_id');
    const includeAwards = searchParams.get('include_awards') === 'true';
    const legacyMode = searchParams.get('legacy_mode') === 'true';
    const awardeesOnly = searchParams.get('awardees_only') === 'true';

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

    let barangayQuery;
    let queryParams;

    if (legacyMode) {
      // Legacy mode: Use the old seal-based filtering for backward compatibility
      barangayQuery = `
        SELECT 
          b.barangay_id,
          b.barangay_name,
          b."currentStatus",
          b.description,
          b.population,
          b.households,
          b.captain,
          b.seal
        FROM barangay b
        WHERE b.barangay_id = $1 AND b.seal = 'yes' AND b.is_active = true
      `;
      queryParams = [barangayId];
    } else {
      // Modern cycle-aware mode - get barangay regardless of award status
      barangayQuery = `
        SELECT 
          b.barangay_id,
          b.barangay_name,
          b."currentStatus",
          b.description,
          b.population,
          b.households,
          b.captain,
          b.seal
        FROM barangay b
        WHERE b.barangay_id = $1 AND b.is_active = true
      `;
      queryParams = [barangayId];
    }
    
    const barangayResult = await client.query(barangayQuery, queryParams);
    
    if (barangayResult.rows.length === 0) {
      return NextResponse.json({ error: "Barangay not found" }, { status: 404 });
    }

    const barangay = barangayResult.rows[0];

    // Check award status for cycle-aware mode
    if (!legacyMode && awardeesOnly) {
      const targetCycleId = parsedCycleId || await getActiveCycleId();
      
      if (targetCycleId) {
        const awardeeIds = await CycleAwardsService.getAwardeeBarangayIds(targetCycleId);
        
        if (!awardeeIds.includes(barangayId)) {
          return NextResponse.json({ error: "Barangay is not an awardee for the specified cycle" }, { status: 404 });
        }
      }
    }

    // Get survey targets for this barangay (cycle-aware)
    const targetCycleId = parsedCycleId || await getActiveCycleId();
    
    let targetsQuery;
    let targetsParams;
    
    if (targetCycleId) {
      targetsQuery = `SELECT * FROM survey_target WHERE barangay_id = $1 AND survey_cycle_id = $2`;
      targetsParams = [barangayId, targetCycleId];
    } else {
      targetsQuery = `SELECT * FROM survey_target WHERE barangay_id = $1`;
      targetsParams = [barangayId];
    }
    
    const targetsResult = await client.query(targetsQuery, targetsParams);
    const surveyTargets = targetsResult.rows;

    // Transform the data to match the expected format
    const surveyTarget = surveyTargets[0];
    const progress = surveyTarget?.percentage || 0;
    
    let status = "Pending";
    if (progress === 100) {
      status = "Completed";
    } else if (progress > 0) {
      status = "In Progress";
    }

    const transformedBarangay: any = {
      barangay_id: barangay.barangay_id,
      barangay_name: barangay.barangay_name,
      currentStatus: barangay.currentStatus || status,
      description: barangay.description,
      population: barangay.population || 0,
      households: barangay.households || 0,
      area: null, // Not in current schema
      captain: barangay.captain,
      surveyTargets: surveyTargets || [],
      survey_response: [], // Would need separate query for responses
      seal: barangay.seal // Keep for backward compatibility
    };

    // Add cycle-aware award information if requested
    if (includeAwards && targetCycleId) {
      try {
        const cycleAwards = await CycleAwardsService.getCycleAwards(targetCycleId);
        const awardInfo = cycleAwards.find(award => award.barangay_id === barangayId);
        
        transformedBarangay.awardStatus = awardInfo ? {
          isAwardee: awardInfo.is_awardee,
          awardedDate: awardInfo.awarded_date,
          notes: awardInfo.notes,
          awardId: awardInfo.id,
          cycleId: targetCycleId
        } : {
          isAwardee: false,
          awardedDate: null,
          notes: null,
          awardId: null,
          cycleId: targetCycleId
        };
      } catch (error) {
        console.warn('Failed to fetch award information:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedBarangay,
      meta: {
        cycle_id: targetCycleId,
        include_awards: includeAwards,
        legacy_mode: legacyMode,
        awardees_only: awardeesOnly
      }
    });
  } catch (error: any) {
    console.error("Error fetching barangay:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}