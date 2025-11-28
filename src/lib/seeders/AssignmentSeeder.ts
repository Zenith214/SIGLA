/**
 * Assignment Seeder
 * Seeds spot assignments to field interviewers
 */

import { BaseSeeder } from './BaseSeeder';
import { assignmentFactory } from '../factories';
import { supabaseAdmin } from '@/lib/supabase';

interface AssignmentSeederOptions {
  count?: number;
  status?: 'Pending' | 'In_Progress' | 'Completed';
  cycleId?: number;
  barangayId?: number;
}

export class AssignmentSeeder extends BaseSeeder {
  private options: AssignmentSeederOptions;

  constructor(options: AssignmentSeederOptions = {}) {
    super();
    this.options = options;
  }

  public async run(): Promise<void> {
    this.log('Seeding Assignments...');

    try {
      // Get available spots
      const { data: spots, error: spotsError } = await supabaseAdmin
        .from('spots')
        .select('spot_id, spot_name, barangay_id, cycle_id')
        .is('assigned_fi_id', null)
        .limit(this.options.count || 20);

      if (spotsError || !spots || spots.length === 0) {
        this.warn('No unassigned spots found. Create spots first.');
        return;
      }

      // Get active interviewers
      const { data: interviewers, error: interviewersError } = await supabaseAdmin
        .from('user')
        .select('id, firstName, lastName')
        .eq('role', 'interviewer')
        .eq('status', 'Active');

      if (interviewersError || !interviewers || interviewers.length === 0) {
        this.warn('No active interviewers found. Create interviewers first.');
        return;
      }

      this.log(`Found ${spots.length} unassigned spots and ${interviewers.length} interviewers`);

      // Create assignments
      const factory = assignmentFactory()
        .forSpots(spots.map(s => s.spot_id))
        .forInterviewers(interviewers.map(i => i.id));

      // Apply status filter if provided
      if (this.options.status === 'Pending') {
        factory.pending();
      } else if (this.options.status === 'In_Progress') {
        factory.inProgress();
      } else if (this.options.status === 'Completed') {
        factory.completed();
      }

      const count = Math.min(this.options.count || spots.length, spots.length);
      await factory.times(count).create();

      this.success(`Created ${count} assignments`);
      this.success('Assignment seeding complete!');
    } catch (error) {
      this.error(`Assignment seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
