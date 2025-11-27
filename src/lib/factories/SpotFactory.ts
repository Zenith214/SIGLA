/**
 * Spot Factory
 * Generates realistic spot data for testing
 */

import { BaseFactory } from './BaseFactory';
import { supabaseAdmin } from '@/lib/supabase';

export interface Spot {
  cycle_id: number;
  barangay_id: number;
  spot_name: string;
  starting_point: { lat: number; lng: number };
  random_start: number;
  assigned_fi_id?: string | null;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export class SpotFactory extends BaseFactory<Spot> {
  private cycleId?: number;
  private barangayId?: number;
  private barangayName?: string;

  /**
   * Set the cycle for spots
   */
  public forCycle(cycleId: number): this {
    this.cycleId = cycleId;
    return this;
  }

  /**
   * Set the barangay for spots
   */
  public forBarangay(barangayId: number, barangayName?: string): this {
    this.barangayId = barangayId;
    this.barangayName = barangayName;
    return this;
  }

  /**
   * Create unassigned spots
   */
  public unassigned(): this {
    return this.with({ assigned_fi_id: null, status: 'Pending' });
  }

  /**
   * Assign to a specific interviewer
   */
  public assignedTo(fiId: string): this {
    return this.with({ assigned_fi_id: fiId });
  }

  protected definition(): Spot {
    if (!this.cycleId || !this.barangayId) {
      throw new Error('Must call forCycle() and forBarangay() before creating spots');
    }

    // Generate realistic Philippines coordinates (Mindanao region)
    const baseLocation = {
      lat: 7.0 + Math.random() * 3,  // 7-10°N
      lng: 123.0 + Math.random() * 3  // 123-126°E
    };

    const spotNumber = Math.floor(Math.random() * 999) + 1;
    const barangayName = this.barangayName || `Barangay ${this.barangayId}`;

    return {
      cycle_id: this.cycleId,
      barangay_id: this.barangayId,
      spot_name: `${barangayName} Spot ${spotNumber}`,
      starting_point: baseLocation,
      random_start: spotNumber,
      assigned_fi_id: null,
      status: 'Pending'
    };
  }

  public async create(): Promise<Spot | Spot[]> {
    const data = this.make();
    const spots = Array.isArray(data) ? data : [data];

    const { data: created, error } = await supabaseAdmin
      .from('spots')
      .insert(spots)
      .select();

    if (error) {
      throw new Error(`Failed to create spots: ${error.message}`);
    }

    this.reset();
    return Array.isArray(data) ? (created || []) : (created?.[0] || data);
  }
}

// Factory helper function
export function spotFactory(): SpotFactory {
  return new SpotFactory();
}
