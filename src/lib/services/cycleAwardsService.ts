import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycleId, getSurveyCycleById } from '@/utils/surveyCycleHelpers';

// Types and interfaces
export interface CycleAward {
  id: number;
  barangay_id: number;
  cycle_id: number;
  is_awardee: boolean;
  awarded_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date | null;
  created_by: number | null;
}

export interface CycleAwardWithBarangay extends CycleAward {
  barangay: {
    barangay_id: number;
    barangay_name: string;
    households: number | null;
    population: number | null;
  };
}

export interface BulkAwardUpdate {
  barangayId: number;
  isAwardee: boolean;
  notes?: string;
}

export interface AwardHistory {
  cycleId: number;
  cycleName: string;
  year: number;
  isAwardee: boolean;
  awardedDate: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface CycleAwardsSummary {
  totalBarangays: number;
  awardeeCount: number;
  nonAwardeeCount: number;
  percentage: number;
}

/**
 * Cycle Awards Service
 * Provides CRUD operations and business logic for cycle-aware award management
 */
export class CycleAwardsService {
  /**
   * Get all awards for a specific cycle
   * @param cycleId - The cycle ID to retrieve awards for (optional, defaults to active cycle)
   * @returns Promise<CycleAward[]> - Array of cycle awards
   */
  static async getCycleAwards(cycleId?: number): Promise<CycleAward[]> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      const { data: awards, error } = await supabaseAdmin
        .from('cycle_awards')
        .select('*')
        .eq('cycle_id', targetCycleId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return awards || [];
    } catch (error) {
      console.error('Error retrieving cycle awards:', error);
      throw new Error('Failed to retrieve cycle awards');
    }
  }

  /**
   * Get awards for a cycle with barangay information
   * @param cycleId - The cycle ID to retrieve awards for (optional, defaults to active cycle)
   * @returns Promise<CycleAwardWithBarangay[]> - Array of cycle awards with barangay details
   */
  static async getCycleAwardsWithBarangays(cycleId?: number): Promise<CycleAwardWithBarangay[]> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      const { data: awards, error } = await supabaseAdmin
        .from('cycle_awards')
        .select(`
          *,
          barangay:barangay_id (
            barangay_id,
            barangay_name,
            households,
            population
          )
        `)
        .eq('cycle_id', targetCycleId)
        .order('barangay(barangay_name)', { ascending: true });

      if (error) {
        throw error;
      }

      return awards || [];
    } catch (error) {
      console.error('Error retrieving cycle awards with barangays:', error);
      throw new Error('Failed to retrieve cycle awards with barangay information');
    }
  }

  /**
   * Set award status for a specific barangay and cycle
   * @param barangayId - The barangay ID
   * @param isAwardee - Whether the barangay is an awardee
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @param notes - Optional notes about the award
   * @param createdBy - User ID who created/updated the award
   * @returns Promise<CycleAward> - The created or updated award
   */
  static async setAwardStatus(
    barangayId: number,
    isAwardee: boolean,
    cycleId?: number,
    notes?: string,
    createdBy?: number
  ): Promise<CycleAward> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      // Check if award already exists
      const { data: existingAward } = await supabaseAdmin
        .from('cycle_awards')
        .select('*')
        .eq('barangay_id', barangayId)
        .eq('cycle_id', targetCycleId)
        .single();

      const awardData = {
        barangay_id: barangayId,
        cycle_id: targetCycleId,
        is_awardee: isAwardee,
        awarded_date: isAwardee ? new Date().toISOString() : null,
        notes: notes || null,
        created_by: createdBy || null,
        updated_at: new Date().toISOString()
      };

      if (existingAward) {
        // Update existing award
        const { data: updatedAward, error } = await supabaseAdmin
          .from('cycle_awards')
          .update(awardData)
          .eq('id', existingAward.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return updatedAward;
      } else {
        // Create new award
        const { data: newAward, error } = await supabaseAdmin
          .from('cycle_awards')
          .insert({
            ...awardData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return newAward;
      }
    } catch (error) {
      console.error('Error setting award status:', error);
      throw new Error('Failed to set award status');
    }
  }

  /**
   * Bulk update award statuses for multiple barangays
   * @param awards - Array of bulk award updates
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @param createdBy - User ID who created/updated the awards
   * @returns Promise<CycleAward[]> - Array of updated awards
   */
  static async bulkUpdateAwards(
    awards: BulkAwardUpdate[],
    cycleId?: number,
    createdBy?: number
  ): Promise<CycleAward[]> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      const updatedAwards: CycleAward[] = [];

      // Process awards in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < awards.length; i += batchSize) {
        const batch = awards.slice(i, i + batchSize);
        
        const batchPromises = batch.map(award =>
          this.setAwardStatus(
            award.barangayId,
            award.isAwardee,
            targetCycleId,
            award.notes,
            createdBy
          )
        );

        const batchResults = await Promise.all(batchPromises);
        updatedAwards.push(...batchResults);
      }

      return updatedAwards;
    } catch (error) {
      console.error('Error bulk updating awards:', error);
      throw new Error('Failed to bulk update awards');
    }
  }

  /**
   * Get award history for a specific barangay across all cycles
   * @param barangayId - The barangay ID
   * @returns Promise<AwardHistory[]> - Array of award history entries
   */
  static async getAwardHistory(barangayId: number): Promise<AwardHistory[]> {
    try {
      const { data: history, error } = await supabaseAdmin
        .from('cycle_awards')
        .select(`
          *,
          survey_cycle:cycle_id (
            cycle_id,
            name,
            year
          )
        `)
        .eq('barangay_id', barangayId)
        .order('cycle_id', { ascending: false });

      if (error) {
        throw error;
      }

      return (history || []).map(entry => ({
        cycleId: entry.cycle_id,
        cycleName: entry.survey_cycle.name,
        year: entry.survey_cycle.year,
        isAwardee: entry.is_awardee,
        awardedDate: entry.awarded_date ? new Date(entry.awarded_date) : null,
        notes: entry.notes,
        createdAt: new Date(entry.created_at)
      }));
    } catch (error) {
      console.error('Error retrieving award history:', error);
      throw new Error('Failed to retrieve award history');
    }
  }

  /**
   * Get award summary statistics for a cycle
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @returns Promise<CycleAwardsSummary> - Summary statistics
   */
  static async getCycleAwardsSummary(cycleId?: number): Promise<CycleAwardsSummary> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      // Get total barangays count
      const { count: totalBarangays, error: totalError } = await supabaseAdmin
        .from('barangay')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (totalError) {
        throw totalError;
      }

      // Get awardee count for the cycle
      const { count: awardeeCount, error: awardeeError } = await supabaseAdmin
        .from('cycle_awards')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', targetCycleId)
        .eq('is_awardee', true);

      if (awardeeError) {
        throw awardeeError;
      }

      const total = totalBarangays || 0;
      const awardees = awardeeCount || 0;
      const nonAwardees = total - awardees;
      const percentage = total > 0 ? Math.round((awardees / total) * 100) : 0;

      return {
        totalBarangays: total,
        awardeeCount: awardees,
        nonAwardeeCount: nonAwardees,
        percentage
      };
    } catch (error) {
      console.error('Error retrieving cycle awards summary:', error);
      throw new Error('Failed to retrieve cycle awards summary');
    }
  }

  /**
   * Check if a barangay is an awardee in a specific cycle
   * @param barangayId - The barangay ID
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @returns Promise<boolean> - True if the barangay is an awardee
   */
  static async isBarangayAwardee(barangayId: number, cycleId?: number): Promise<boolean> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        return false; // No active cycle, so no awardees
      }

      const { data: award, error } = await supabaseAdmin
        .from('cycle_awards')
        .select('is_awardee')
        .eq('barangay_id', barangayId)
        .eq('cycle_id', targetCycleId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return award?.is_awardee || false;
    } catch (error) {
      console.error('Error checking barangay awardee status:', error);
      throw new Error('Failed to check barangay awardee status');
    }
  }

  /**
   * Get awards for a specific barangay across all cycles
   * @param barangayId - The barangay ID
   * @returns Promise<CycleAward[]> - Array of awards for the barangay
   */
  static async getBarangayAwards(barangayId: number): Promise<CycleAward[]> {
    try {
      const { data: awards, error } = await supabaseAdmin
        .from('cycle_awards')
        .select('*')
        .eq('barangay_id', barangayId)
        .order('cycle_id', { ascending: false });

      if (error) {
        throw error;
      }

      return awards || [];
    } catch (error) {
      console.error('Error retrieving barangay awards:', error);
      throw new Error('Failed to retrieve barangay awards');
    }
  }

  /**
   * Get all awardee barangays for a specific cycle
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @returns Promise<number[]> - Array of awardee barangay IDs
   */
  static async getAwardeeBarangayIds(cycleId?: number): Promise<number[]> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        return []; // No active cycle, so no awardees
      }

      const { data: awards, error } = await supabaseAdmin
        .from('cycle_awards')
        .select('barangay_id')
        .eq('cycle_id', targetCycleId)
        .eq('is_awardee', true);

      if (error) {
        throw error;
      }

      return (awards || []).map(award => award.barangay_id);
    } catch (error) {
      console.error('Error retrieving awardee barangay IDs:', error);
      throw new Error('Failed to retrieve awardee barangay IDs');
    }
  }

  /**
   * Copy awards from one cycle to another
   * @param sourceCycleId - The source cycle ID to copy from
   * @param targetCycleId - The target cycle ID to copy to (optional, defaults to active cycle)
   * @param createdBy - User ID who is performing the copy operation
   * @returns Promise<CycleAward[]> - Array of copied awards
   */
  static async copyAwardsBetweenCycles(
    sourceCycleId: number,
    targetCycleId?: number,
    createdBy?: number
  ): Promise<CycleAward[]> {
    try {
      const targetId = targetCycleId || await getActiveCycleId();
      
      if (!targetId) {
        throw new Error('No target cycle specified and no active cycle found');
      }

      if (sourceCycleId === targetId) {
        throw new Error('Source and target cycles cannot be the same');
      }

      // Verify both cycles exist
      const [sourceCycle, targetCycle] = await Promise.all([
        getSurveyCycleById(sourceCycleId),
        getSurveyCycleById(targetId)
      ]);

      if (!sourceCycle) {
        throw new Error(`Source cycle ${sourceCycleId} not found`);
      }

      if (!targetCycle) {
        throw new Error(`Target cycle ${targetId} not found`);
      }

      // Get awards from source cycle
      const sourceAwards = await this.getCycleAwards(sourceCycleId);

      if (sourceAwards.length === 0) {
        return []; // No awards to copy
      }

      // Convert to bulk update format
      const bulkUpdates: BulkAwardUpdate[] = sourceAwards.map(award => ({
        barangayId: award.barangay_id,
        isAwardee: award.is_awardee,
        notes: `Copied from ${sourceCycle.name} (${sourceCycle.year})`
      }));

      // Apply bulk updates to target cycle
      return await this.bulkUpdateAwards(bulkUpdates, targetId, createdBy);
    } catch (error) {
      console.error('Error copying awards between cycles:', error);
      throw new Error('Failed to copy awards between cycles');
    }
  }

  /**
   * Remove all awards for a specific cycle
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @returns Promise<number> - Number of awards removed
   */
  static async removeAllCycleAwards(cycleId?: number): Promise<number> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      const { count, error } = await supabaseAdmin
        .from('cycle_awards')
        .delete({ count: 'exact' })
        .eq('cycle_id', targetCycleId);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error removing cycle awards:', error);
      throw new Error('Failed to remove cycle awards');
    }
  }

  /**
   * Migrate existing barangay seal data to cycle awards
   * This is a one-time migration function to move from global seals to cycle-specific awards
   * @param targetCycleId - The cycle ID to migrate data to (optional, defaults to active cycle)
   * @param createdBy - User ID who is performing the migration
   * @returns Promise<{ migrated: number; skipped: number }> - Migration results
   */
  static async migrateExistingSealsToAwards(
    targetCycleId?: number,
    createdBy?: number
  ): Promise<{ migrated: number; skipped: number }> {
    try {
      const targetId = targetCycleId || await getActiveCycleId();
      
      if (!targetId) {
        throw new Error('No target cycle specified and no active cycle found');
      }

      // Get all barangays with their current seal status
      const { data: barangays, error: barangayError } = await supabaseAdmin
        .from('barangay')
        .select('barangay_id, seal')
        .eq('is_active', true);

      if (barangayError) {
        throw barangayError;
      }

      if (!barangays || barangays.length === 0) {
        return { migrated: 0, skipped: 0 };
      }

      let migrated = 0;
      let skipped = 0;

      // Process each barangay
      for (const barangay of barangays) {
        try {
          // Check if award already exists for this barangay and cycle
          const { data: existingAward } = await supabaseAdmin
            .from('cycle_awards')
            .select('id')
            .eq('barangay_id', barangay.barangay_id)
            .eq('cycle_id', targetId)
            .single();

          if (existingAward) {
            skipped++;
            continue; // Skip if award already exists
          }

          // Create award based on current seal status
          const isAwardee = barangay.seal === 'yes';
          await this.setAwardStatus(
            barangay.barangay_id,
            isAwardee,
            targetId,
            'Migrated from legacy seal system',
            createdBy
          );

          migrated++;
        } catch (error) {
          console.error(`Error migrating barangay ${barangay.barangay_id}:`, error);
          skipped++;
        }
      }

      return { migrated, skipped };
    } catch (error) {
      console.error('Error migrating existing seals to awards:', error);
      throw new Error('Failed to migrate existing seals to awards');
    }
  }
}

// Export default instance for convenience
export default CycleAwardsService;