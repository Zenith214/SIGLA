import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createAuditLog } from '@/lib/auth-middleware';
import { CycleAwardsService } from '@/lib/services/cycleAwardsService';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';

interface MigrationDetail {
  barangayId: number;
  barangayName: string;
  action: 'create' | 'update' | 'skip';
  isAwardee: boolean;
  currentStatus?: boolean;
}

interface MigrationAnalysis {
  totalBarangays: number;
  sealedBarangays: number;
  unsealedBarangays: number;
  existingAwards: number;
  toCreate: number;
  toUpdate: number;
  toSkip: number;
  details: MigrationDetail[];
}

/**
 * POST /api/admin/migrate-seals
 * 
 * Migrates existing barangay seal data to cycle awards.
 * This is a one-time migration endpoint.
 * 
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  try {
    const body = await request.json();
    const { cycleId, dryRun = false } = body;

    // Get target cycle ID
    const targetCycleId = cycleId || await getActiveCycleId();
    
    if (!targetCycleId) {
      return NextResponse.json(
        { error: 'No cycle specified and no active cycle found' },
        { status: 400 }
      );
    }

    if (dryRun) {
      // Perform dry run analysis
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      // Get barangays with seal data
      const { data: barangays, error: barangayError } = await supabaseAdmin
        .from('barangay')
        .select('barangay_id, barangay_name, seal')
        .eq('is_active', true);

      if (barangayError) {
        throw barangayError;
      }

      // Get existing awards
      const { data: existingAwards, error: awardsError } = await supabaseAdmin
        .from('cycle_awards')
        .select('barangay_id, is_awardee')
        .eq('cycle_id', targetCycleId);

      if (awardsError) {
        throw awardsError;
      }

      const existingAwardMap = new Map(existingAwards?.map(a => [a.barangay_id, a.is_awardee]) || []);
      
      const analysis: MigrationAnalysis = {
        totalBarangays: barangays?.length || 0,
        sealedBarangays: barangays?.filter(b => b.seal === 'yes').length || 0,
        unsealedBarangays: barangays?.filter(b => b.seal === 'no').length || 0,
        existingAwards: existingAwards?.length || 0,
        toCreate: 0,
        toUpdate: 0,
        toSkip: 0,
        details: []
      };

      if (barangays) {
        for (const barangay of barangays) {
          const isAwardee = barangay.seal === 'yes';
          const existingStatus = existingAwardMap.get(barangay.barangay_id);

          if (existingStatus === undefined) {
            analysis.toCreate++;
            analysis.details.push({
              barangayId: barangay.barangay_id,
              barangayName: barangay.barangay_name,
              action: 'create',
              isAwardee
            });
          } else if (existingStatus !== isAwardee) {
            analysis.toUpdate++;
            analysis.details.push({
              barangayId: barangay.barangay_id,
              barangayName: barangay.barangay_name,
              action: 'update',
              isAwardee,
              currentStatus: existingStatus
            });
          } else {
            analysis.toSkip++;
            analysis.details.push({
              barangayId: barangay.barangay_id,
              barangayName: barangay.barangay_name,
              action: 'skip',
              isAwardee
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        dryRun: true,
        targetCycleId,
        analysis
      });
    }

    // Get user info for audit logging
    const authResult = requireAdmin(request);
    const userId = authResult?.success ? undefined : authResult?.user?.id;

    // Perform actual migration
    const result = await CycleAwardsService.migrateExistingSealsToAwards(
      targetCycleId,
      userId || 1 // Default admin user ID if not available
    );

    // Create audit log
    if (authResult?.success && authResult.user) {
      createAuditLog(authResult.user, 'MIGRATE_SEALS_TO_AWARDS', {
        target_cycle_id: targetCycleId,
        migrated: result.migrated,
        skipped: result.skipped
      });
    }

    return NextResponse.json({
      success: true,
      targetCycleId,
      migrated: result.migrated,
      skipped: result.skipped,
      message: `Migration completed: ${result.migrated} migrated, ${result.skipped} skipped`
    });

  } catch (error) {
    console.error('Migration error:', error);
    
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/migrate-seals
 * 
 * Get migration status and analysis
 * 
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authError = requireAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError.error },
      { status: authError.error === 'No authentication token provided' || authError.error === 'Invalid authentication token' ? 401 : 403 }
    );
  }

  try {
    const activeCycleId = await getActiveCycleId();
    
    if (!activeCycleId) {
      return NextResponse.json(
        { error: 'No active cycle found' },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Get barangays count
    const { count: totalBarangays } = await supabaseAdmin
      .from('barangay')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get sealed barangays count
    const { count: sealedBarangays } = await supabaseAdmin
      .from('barangay')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('seal', 'yes');

    // Get existing awards count
    const { count: existingAwards } = await supabaseAdmin
      .from('cycle_awards')
      .select('*', { count: 'exact', head: true })
      .eq('cycle_id', activeCycleId);

    return NextResponse.json({
      success: true,
      activeCycleId,
      totalBarangays: totalBarangays || 0,
      sealedBarangays: sealedBarangays || 0,
      unsealedBarangays: (totalBarangays || 0) - (sealedBarangays || 0),
      existingAwards: existingAwards || 0,
      migrationNeeded: (existingAwards || 0) < (totalBarangays || 0)
    });

  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json(
      { 
        error: 'Status check failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}