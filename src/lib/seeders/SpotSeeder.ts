/**
 * Spot Seeder
 * Seeds spots for survey cycles
 */

import { BaseSeeder } from './BaseSeeder';
import { spotFactory } from '../factories';
import { supabaseAdmin } from '@/lib/supabase';

interface SpotSeederOptions {
  count?: number;
  cycleId?: number;
  barangayId?: number;
}

export class SpotSeeder extends BaseSeeder {
  private options: SpotSeederOptions;

  constructor(options: SpotSeederOptions = {}) {
    super();
    this.options = options;
  }

  public async run(): Promise<void> {
    this.log('Seeding Spots...');

    try {
      // Get cycle
      let cycleId = this.options.cycleId;
      if (!cycleId) {
        const { data: cycles, error: cycleError } = await supabaseAdmin
          .from('survey_cycle')
          .select('cycle_id, year, name')
          .eq('is_active', true)
          .limit(1);
        
        if (cycleError) {
          this.error(`Error fetching active cycle: ${cycleError.message}`);
          throw cycleError;
        }
        
        if (!cycles || cycles.length === 0) {
          this.warn('No active survey cycle found. Create and activate a cycle first.');
          return;
        }
        cycleId = cycles[0].cycle_id;
        this.log(`Using active cycle: ${cycles[0].name} (${cycles[0].year})`);
      }

      // Get barangays
      let barangays;
      if (this.options.barangayId) {
        const { data } = await supabaseAdmin
          .from('barangay')
          .select('barangay_id, barangay_name')
          .eq('barangay_id', this.options.barangayId);
        barangays = data;
      } else {
        const { data } = await supabaseAdmin
          .from('barangay')
          .select('barangay_id, barangay_name')
          .limit(5);
        barangays = data;
      }

      if (!barangays || barangays.length === 0) {
        this.warn('No barangays found.');
        return;
      }

      // Ensure we have a valid cycle ID
      if (!cycleId) {
        this.error('No cycle ID available. Cannot create spots.');
        return;
      }

      this.log(`Creating spots for ${barangays.length} barangay(s)`);

      const spotsPerBarangay = Math.ceil((this.options.count || 10) / barangays.length);

      for (const barangay of barangays) {
        await spotFactory()
          .forCycle(cycleId)
          .forBarangay(barangay.barangay_id, barangay.barangay_name)
          .unassigned()
          .times(spotsPerBarangay)
          .create();

        this.success(`Created ${spotsPerBarangay} spots for ${barangay.barangay_name}`);
      }

      this.success('Spot seeding complete!');
    } catch (error) {
      this.error(`Spot seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
