/**
 * Assignment Factory
 * Generates realistic assignment data for testing
 */

import { BaseFactory } from './BaseFactory';
import { supabaseAdmin } from '@/lib/supabase';

export interface Assignment {
  spot_id: number;
  assigned_fi_id: string;
  status: 'Pending' | 'In_Progress' | 'Completed';
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
}

export class AssignmentFactory extends BaseFactory<Assignment> {
  private availableSpots: number[] = [];
  private availableInterviewers: string[] = [];

  /**
   * Set available spots for assignment
   */
  public forSpots(spotIds: number[]): this {
    this.availableSpots = spotIds;
    return this;
  }

  /**
   * Set available interviewers
   */
  public forInterviewers(interviewerIds: string[]): this {
    this.availableInterviewers = interviewerIds;
    return this;
  }

  /**
   * Create pending assignments
   */
  public pending(): this {
    return this.with({ status: 'Pending' });
  }

  /**
   * Create in-progress assignments
   */
  public inProgress(): this {
    return this.with({ 
      status: 'In_Progress',
      started_at: new Date().toISOString()
    });
  }

  /**
   * Create completed assignments
   */
  public completed(): this {
    return this.with({ 
      status: 'Completed',
      started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date().toISOString()
    });
  }

  protected definition(): Assignment {
    const status = this.attributes.status || this.randomStatus();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      spot_id: this.randomSpot(),
      assigned_fi_id: this.randomInterviewer(),
      status,
      assigned_at: weekAgo.toISOString(),
      started_at: status !== 'Pending' ? weekAgo.toISOString() : undefined,
      completed_at: status === 'Completed' ? now.toISOString() : undefined
    };
  }

  public async create(): Promise<Assignment | Assignment[]> {
    // Load available spots and interviewers if not provided
    if (this.availableSpots.length === 0) {
      await this.loadAvailableSpots();
    }
    if (this.availableInterviewers.length === 0) {
      await this.loadAvailableInterviewers();
    }

    const data = this.make();
    const assignments = Array.isArray(data) ? data : [data];

    // Update each spot individually to assign it
    const created: Assignment[] = [];
    for (const assignment of assignments) {
      const { data: updatedSpot, error } = await supabaseAdmin
        .from('spots')
        .update({
          assigned_fi_id: assignment.assigned_fi_id,
          status: assignment.status
        })
        .eq('spot_id', assignment.spot_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create assignment for spot ${assignment.spot_id}: ${error.message}`);
      }

      if (updatedSpot) {
        created.push(assignment);
      }
    }

    this.reset();
    return Array.isArray(data) ? created : created[0];
  }

  private async loadAvailableSpots(): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('spots')
      .select('spot_id')
      .is('assigned_fi_id', null)
      .limit(100);

    if (error) throw new Error(`Failed to load spots: ${error.message}`);
    this.availableSpots = data?.map(s => s.spot_id) || [];
  }

  private async loadAvailableInterviewers(): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('user')
      .select('id')
      .eq('role', 'interviewer')
      .eq('status', 'active');

    if (error) throw new Error(`Failed to load interviewers: ${error.message}`);
    this.availableInterviewers = data?.map(u => u.id) || [];
  }

  private randomSpot(): number {
    if (this.availableSpots.length === 0) {
      throw new Error('No available spots. Call forSpots() or ensure unassigned spots exist.');
    }
    return this.availableSpots[Math.floor(Math.random() * this.availableSpots.length)];
  }

  private randomInterviewer(): string {
    if (this.availableInterviewers.length === 0) {
      throw new Error('No available interviewers. Call forInterviewers() or ensure active interviewers exist.');
    }
    return this.availableInterviewers[Math.floor(Math.random() * this.availableInterviewers.length)];
  }

  private randomStatus(): 'Pending' | 'In_Progress' | 'Completed' {
    const statuses: Array<'Pending' | 'In_Progress' | 'Completed'> = ['Pending', 'In_Progress', 'Completed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}

// Factory helper function
export function assignmentFactory(): AssignmentFactory {
  return new AssignmentFactory();
}
