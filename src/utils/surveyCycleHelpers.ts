import { supabaseAdmin } from '@/lib/supabase';

export interface SurveyCycle {
  cycle_id: number;
  name: string;
  year: number;
  is_active: boolean;
  start_date: Date | null;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date | null;
}

/**
 * Retrieves the currently active survey cycle
 * @returns Promise<SurveyCycle | null> - The active cycle or null if none exists
 */
export async function getActiveCycle(): Promise<SurveyCycle | null> {
  try {
    const { data: activeCycle, error } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    if (!activeCycle) {
      return null;
    }

    // Calculate actual response count for the active cycle
    const { count, error: countError } = await supabaseAdmin
      .from('survey_response')
      .select('response_id', { count: 'exact', head: true })
      .eq('survey_cycle_id', activeCycle.cycle_id);

    if (countError) {
      console.error(`Error counting responses for active cycle ${activeCycle.cycle_id}:`, countError);
      return { ...activeCycle, responses: 0 };
    }

    return { ...activeCycle, responses: count || 0 };
  } catch (error) {
    console.error('Error retrieving active cycle:', error);
    throw new Error('Failed to retrieve active survey cycle');
  }
}

/**
 * Sets a survey cycle as active, ensuring only one cycle can be active at a time
 * @param cycleId - The ID of the cycle to set as active
 * @returns Promise<void>
 * @throws Error if cycle doesn't exist or validation fails
 */
export async function setActiveCycle(cycleId: number): Promise<void> {
  try {
    // First, verify the cycle exists
    const { data: cycle, error: fetchError } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', cycleId)
      .single();

    if (fetchError || !cycle) {
      throw new Error(`Survey cycle with ID ${cycleId} not found`);
    }

    // Deactivate all currently active cycles
    const { error: deactivateError } = await supabaseAdmin
      .from('survey_cycle')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true);

    if (deactivateError) {
      throw deactivateError;
    }

    // Set the specified cycle as active
    const { error: activateError } = await supabaseAdmin
      .from('survey_cycle')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('cycle_id', cycleId);

    if (activateError) {
      throw activateError;
    }
  } catch (error) {
    console.error('Error setting active cycle:', error);
    throw error;
  }
}

/**
 * Validates that only one survey cycle is active at a time
 * @returns Promise<boolean> - True if constraint is satisfied, false otherwise
 */
export async function validateSingleActiveCycle(): Promise<boolean> {
  try {
    const { data: activeCycles, error } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return (activeCycles?.length || 0) <= 1;
  } catch (error) {
    console.error('Error validating single active cycle constraint:', error);
    throw new Error('Failed to validate active cycle constraint');
  }
}

/**
 * Creates a new survey cycle
 * @param name - The name of the survey cycle
 * @param year - The year of the survey cycle
 * @param startDate - Optional start date
 * @param endDate - Optional end date
 * @returns Promise<SurveyCycle> - The created cycle
 */
export async function createSurveyCycle(
  name: string,
  year: number,
  startDate?: Date,
  endDate?: Date
): Promise<SurveyCycle> {
  try {
    const { data: cycle, error } = await supabaseAdmin
      .from('survey_cycle')
      .insert({
        name,
        year,
        start_date: startDate?.toISOString().split('T')[0] || null,
        end_date: endDate?.toISOString().split('T')[0] || null,
        is_active: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return cycle;
  } catch (error) {
    console.error('Error creating survey cycle:', error);
    throw new Error('Failed to create survey cycle');
  }
}

/**
 * Gets all survey cycles, optionally filtered by active status
 * @param activeOnly - If true, returns only active cycles
 * @returns Promise<SurveyCycle[]> - Array of survey cycles
 */
export async function getSurveyCycles(activeOnly: boolean = false): Promise<SurveyCycle[]> {
  try {
    let query = supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .order('is_active', { ascending: false })
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: cycles, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate actual response counts for each cycle
    const cyclesWithCounts = await Promise.all(
      (cycles || []).map(async (cycle) => {
        // Count unique survey responses for this cycle
        const { count, error: countError } = await supabaseAdmin
          .from('survey_response')
          .select('response_id', { count: 'exact', head: true })
          .eq('survey_cycle_id', cycle.cycle_id);

        if (countError) {
          console.error(`Error counting responses for cycle ${cycle.cycle_id}:`, countError);
          return { ...cycle, responses: 0 };
        }

        return { ...cycle, responses: count || 0 };
      })
    );

    return cyclesWithCounts;
  } catch (error) {
    console.error('Error retrieving survey cycles:', error);
    throw new Error('Failed to retrieve survey cycles');
  }
}

/**
 * Utility function to get cycle-aware database queries
 * Returns the active cycle ID for use in database queries
 * @returns Promise<number | null> - The active cycle ID or null
 */
export async function getActiveCycleId(): Promise<number | null> {
  const activeCycle = await getActiveCycle();
  return activeCycle?.cycle_id || null;
}

/**
 * Utility function to create cycle-scoped where conditions
 * @param additionalConditions - Additional where conditions to merge
 * @returns Promise<object> - Where condition object including active cycle filter
 */
export async function createCycleScopedWhere(additionalConditions: any = {}): Promise<any> {
  const activeCycleId = await getActiveCycleId();
  
  return {
    ...additionalConditions,
    survey_cycle_id: activeCycleId
  };
}

/**
 * Generates a survey number in the format BB-CYCLEYEAR-NNNN
 * @param barangayId - The barangay ID
 * @param sequenceNumber - The sequence number for this cycle
 * @returns Promise<string> - The formatted survey number
 */
export async function generateSurveyNumber(barangayId: number, sequenceNumber: number): Promise<string> {
  const activeCycle = await getActiveCycle();
  
  if (!activeCycle) {
    throw new Error('No active survey cycle found. Cannot generate survey number.');
  }

  // Format: BB-CYCLEYEAR-NNNN
  const barangayPart = barangayId.toString().padStart(2, '0');
  const yearPart = activeCycle.year.toString();
  const sequencePart = sequenceNumber.toString().padStart(4, '0');
  
  return `${barangayPart}-${yearPart}-${sequencePart}`;
}

/**
 * Gets the next sequence number for survey responses in the active cycle
 * @param barangayId - Optional barangay ID to scope the sequence
 * @returns Promise<number> - The next sequence number
 */
export async function getNextSurveySequence(barangayId?: number): Promise<number> {
  const activeCycleId = await getActiveCycleId();
  
  if (!activeCycleId) {
    throw new Error('No active survey cycle found. Cannot generate sequence number.');
  }

  let query = supabaseAdmin
    .from('survey_response')
    .select('*', { count: 'exact', head: true })
    .eq('survey_cycle_id', activeCycleId);

  if (barangayId) {
    query = query.eq('barangay_id', barangayId);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return (count || 0) + 1;
}

/**
 * Gets a specific survey cycle by ID
 * @param cycleId - The ID of the cycle to retrieve
 * @returns Promise<SurveyCycle | null> - The cycle or null if not found
 */
export async function getSurveyCycleById(cycleId: number): Promise<SurveyCycle | null> {
  try {
    const { data: cycle, error } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('cycle_id', cycleId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    return cycle;
  } catch (error) {
    console.error('Error retrieving survey cycle:', error);
    throw new Error('Failed to retrieve survey cycle');
  }
}

/**
 * Gets historical (non-active) survey cycles
 * @returns Promise<SurveyCycle[]> - Array of historical survey cycles
 */
export async function getHistoricalCycles(): Promise<SurveyCycle[]> {
  try {
    const { data: cycles, error } = await supabaseAdmin
      .from('survey_cycle')
      .select('*')
      .eq('is_active', false)
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return cycles || [];
  } catch (error) {
    console.error('Error retrieving historical cycles:', error);
    throw new Error('Failed to retrieve historical cycles');
  }
}

/**
 * Utility function to create cycle-scoped where conditions for a specific cycle
 * @param cycleId - The cycle ID to scope to
 * @param additionalConditions - Additional where conditions to merge
 * @returns object - Where condition object including cycle filter
 */
export function createSpecificCycleScopedWhere(cycleId: number, additionalConditions: any = {}): any {
  return {
    ...additionalConditions,
    survey_cycle_id: cycleId
  };
}

// Note: Supabase client doesn't require explicit connection cleanup