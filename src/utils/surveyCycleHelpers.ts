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

/**
 * Updates an existing survey cycle
 * @param cycleId - The ID of the cycle to update
 * @param updates - The fields to update
 * @returns Promise<SurveyCycle> - The updated cycle
 */
export async function updateSurveyCycle(
  cycleId: number,
  updates: Partial<Omit<SurveyCycle, 'cycle_id' | 'created_at'>>
): Promise<SurveyCycle> {
  try {
    const { data: cycle, error } = await supabaseAdmin
      .from('survey_cycle')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('cycle_id', cycleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return cycle;
  } catch (error) {
    console.error('Error updating survey cycle:', error);
    throw new Error('Failed to update survey cycle');
  }
}

/**
 * Deletes a survey cycle
 * Prevents deletion if the cycle has associated data (spots, survey responses, etc.)
 * @param cycleId - The ID of the cycle to delete
 * @param force - If true, cascade delete all associated data (admin only)
 * @returns Promise<{ success: boolean; message: string; deletedData?: any }>
 */
export async function deleteSurveyCycle(
  cycleId: number,
  force: boolean = false
): Promise<{ success: boolean; message: string; deletedData?: any }> {
  console.log(`🗑️ deleteSurveyCycle - Starting deletion for cycle ${cycleId} (force: ${force})`);
  
  try {
    // Check if cycle exists
    console.log(`🔍 deleteSurveyCycle - Checking if cycle ${cycleId} exists`);
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id, name, year, is_active')
      .eq('cycle_id', cycleId)
      .single();

    if (cycleError) {
      console.error(`❌ deleteSurveyCycle - Error fetching cycle:`, cycleError);
      throw new Error(`Survey cycle not found: ${cycleError.message}`);
    }

    if (!cycle) {
      console.error(`❌ deleteSurveyCycle - Cycle ${cycleId} not found in database`);
      throw new Error('Survey cycle not found');
    }

    console.log(`✅ deleteSurveyCycle - Found cycle:`, JSON.stringify(cycle, null, 2));

    // Prevent deletion of active cycle
    if (cycle.is_active) {
      console.log(`⚠️ deleteSurveyCycle - Cannot delete active cycle ${cycleId}`);
      return {
        success: false,
        message: 'Cannot delete the active survey cycle. Please deactivate it first.'
      };
    }

    // Check for associated spots
    console.log(`🔍 deleteSurveyCycle - Checking for associated spots`);
    const { count: spotsCount, error: spotsError } = await supabaseAdmin
      .from('spots')
      .select('spot_id', { count: 'exact', head: true })
      .eq('cycle_id', cycleId);

    if (spotsError) {
      console.error(`❌ deleteSurveyCycle - Error checking spots:`, spotsError);
      throw spotsError;
    }
    console.log(`📊 deleteSurveyCycle - Found ${spotsCount || 0} spots`);

    // Check for associated survey responses
    console.log(`🔍 deleteSurveyCycle - Checking for associated survey responses`);
    const { count: responsesCount, error: responsesError } = await supabaseAdmin
      .from('survey_response')
      .select('response_id', { count: 'exact', head: true })
      .eq('survey_cycle_id', cycleId);

    if (responsesError) {
      console.error(`❌ deleteSurveyCycle - Error checking responses:`, responsesError);
      throw responsesError;
    }
    console.log(`📊 deleteSurveyCycle - Found ${responsesCount || 0} survey responses`);

    // Check for associated assignments
    console.log(`🔍 deleteSurveyCycle - Checking for associated assignments`);
    const { count: assignmentsCount, error: assignmentsError } = await supabaseAdmin
      .from('assignment')
      .select('assignment_id', { count: 'exact', head: true })
      .eq('cycle_id', cycleId);

    if (assignmentsError) {
      console.error(`❌ deleteSurveyCycle - Error checking assignments:`, assignmentsError);
      console.error(`❌ deleteSurveyCycle - Assignments error code:`, assignmentsError.code);
      console.error(`❌ deleteSurveyCycle - Assignments error message:`, assignmentsError.message);
      console.error(`❌ deleteSurveyCycle - Assignments error hint:`, assignmentsError.hint);
      console.error(`❌ deleteSurveyCycle - Assignments error details:`, assignmentsError.details);
      console.error(`❌ deleteSurveyCycle - Full error object:`, JSON.stringify(assignmentsError, null, 2));
      
      // If the table doesn't exist or there's a schema issue, assume 0 assignments
      console.log(`⚠️ deleteSurveyCycle - Assuming 0 assignments due to query error`);
      // Don't throw here, just log and continue with 0 count
    }
    console.log(`📊 deleteSurveyCycle - Found ${assignmentsCount || 0} assignments`);

    const hasAssociatedData = (spotsCount || 0) > 0 || (responsesCount || 0) > 0 || (assignmentsCount || 0) > 0;
    console.log(`📊 deleteSurveyCycle - Has associated data: ${hasAssociatedData} (spots: ${spotsCount || 0}, responses: ${responsesCount || 0}, assignments: ${assignmentsCount || 0})`);

    // If there's associated data and force is not enabled, prevent deletion
    if (hasAssociatedData && !force) {
      console.log(`⚠️ deleteSurveyCycle - Preventing deletion due to associated data (force not enabled)`);
      return {
        success: false,
        message: `Cannot delete survey cycle "${cycle.name}". It has ${spotsCount || 0} spots, ${responsesCount || 0} survey responses, and ${assignmentsCount || 0} assignments. Use force delete to remove all associated data.`,
        deletedData: {
          spotsCount: spotsCount || 0,
          responsesCount: responsesCount || 0,
          assignmentsCount: assignmentsCount || 0
        }
      };
    }

    // If force is enabled, delete all associated data
    if (force && hasAssociatedData) {
      console.log(`🔥 deleteSurveyCycle - Force delete enabled, removing all associated data`);
      // Delete in correct order to respect foreign key constraints
      
      // 1. First get all questionnaire IDs for this cycle
      console.log(`🔍 deleteSurveyCycle - Fetching questionnaires for cycle ${cycleId}`);
      const { data: questionnaires, error: questionnairesQueryError } = await supabaseAdmin
        .from('questionnaires')
        .select('questionnaire_id')
        .eq('cycle_id', cycleId);

      if (questionnairesQueryError) {
        console.error('❌ deleteSurveyCycle - Error querying questionnaires:', questionnairesQueryError);
      } else {
        console.log(`📊 deleteSurveyCycle - Found ${questionnaires?.length || 0} questionnaires`);
      }

      // 2. Delete visits (depends on questionnaires)
      if (questionnaires && questionnaires.length > 0) {
        console.log(`🗑️ deleteSurveyCycle - Deleting visits for ${questionnaires.length} questionnaires`);
        const questionnaireIds = questionnaires.map(q => q.questionnaire_id);
        const { error: visitsDeleteError } = await supabaseAdmin
          .from('visits')
          .delete()
          .in('questionnaire_id', questionnaireIds);

        if (visitsDeleteError) {
          console.error('❌ deleteSurveyCycle - Error deleting visits:', visitsDeleteError);
          console.error('❌ deleteSurveyCycle - Visits error details:', JSON.stringify(visitsDeleteError, null, 2));
          throw new Error(`Failed to delete visits: ${visitsDeleteError.message || visitsDeleteError.code}`);
        } else {
          console.log(`✅ deleteSurveyCycle - Visits deleted successfully`);
        }
      }

      // 3. Delete questionnaires (depends on spots)
      console.log(`🗑️ deleteSurveyCycle - Deleting questionnaires for cycle ${cycleId}`);
      const { error: questionnairesDeleteError } = await supabaseAdmin
        .from('questionnaires')
        .delete()
        .eq('cycle_id', cycleId);

      if (questionnairesDeleteError) {
        console.error('❌ deleteSurveyCycle - Error deleting questionnaires:', questionnairesDeleteError);
        console.error('❌ deleteSurveyCycle - Questionnaires error details:', JSON.stringify(questionnairesDeleteError, null, 2));
        throw new Error(`Failed to delete questionnaires: ${questionnairesDeleteError.message || questionnairesDeleteError.code}`);
      } else {
        console.log(`✅ deleteSurveyCycle - Questionnaires deleted successfully`);
      }

      // 4. Delete spots
      console.log(`🗑️ deleteSurveyCycle - Deleting spots for cycle ${cycleId}`);
      const { error: spotsDeleteError } = await supabaseAdmin
        .from('spots')
        .delete()
        .eq('cycle_id', cycleId);

      if (spotsDeleteError) {
        console.error('❌ deleteSurveyCycle - Error deleting spots:', spotsDeleteError);
        console.error('❌ deleteSurveyCycle - Spots error details:', JSON.stringify(spotsDeleteError, null, 2));
        throw new Error(`Failed to delete spots: ${spotsDeleteError.message || spotsDeleteError.code}`);
      } else {
        console.log(`✅ deleteSurveyCycle - Spots deleted successfully`);
      }

      // 5. Delete survey responses
      console.log(`🗑️ deleteSurveyCycle - Deleting survey responses for cycle ${cycleId}`);
      const { error: responsesDeleteError } = await supabaseAdmin
        .from('survey_response')
        .delete()
        .eq('survey_cycle_id', cycleId);

      if (responsesDeleteError) {
        console.error('❌ deleteSurveyCycle - Error deleting survey responses:', responsesDeleteError);
        console.error('❌ deleteSurveyCycle - Responses error details:', JSON.stringify(responsesDeleteError, null, 2));
        throw new Error(`Failed to delete survey responses: ${responsesDeleteError.message || responsesDeleteError.code}`);
      } else {
        console.log(`✅ deleteSurveyCycle - Survey responses deleted successfully`);
      }

      // 6. Delete assignments
      console.log(`🗑️ deleteSurveyCycle - Deleting assignments for cycle ${cycleId}`);
      const { error: assignmentsDeleteError } = await supabaseAdmin
        .from('assignment')
        .delete()
        .eq('cycle_id', cycleId);

      if (assignmentsDeleteError) {
        console.error('❌ deleteSurveyCycle - Error deleting assignments:', assignmentsDeleteError);
        console.error('❌ deleteSurveyCycle - Assignments error details:', JSON.stringify(assignmentsDeleteError, null, 2));
        throw new Error(`Failed to delete assignments: ${assignmentsDeleteError.message || assignmentsDeleteError.code}`);
      } else {
        console.log(`✅ deleteSurveyCycle - Assignments deleted successfully`);
      }
    }

    // Finally, delete the cycle itself
    console.log(`🗑️ deleteSurveyCycle - Deleting cycle ${cycleId} from survey_cycle table`);
    const { error: deleteError } = await supabaseAdmin
      .from('survey_cycle')
      .delete()
      .eq('cycle_id', cycleId);

    if (deleteError) {
      console.error(`❌ deleteSurveyCycle - Error deleting cycle:`, deleteError);
      console.error(`❌ deleteSurveyCycle - Error details:`, JSON.stringify(deleteError, null, 2));
      throw new Error(`Failed to delete cycle from database: ${deleteError.message || deleteError.code || 'Unknown database error'}`);
    }

    console.log(`✅ deleteSurveyCycle - Cycle ${cycleId} deleted successfully`);
    return {
      success: true,
      message: `Survey cycle "${cycle.name}" deleted successfully${force ? ' along with all associated data' : ''}.`,
      deletedData: force ? {
        spotsCount: spotsCount || 0,
        responsesCount: responsesCount || 0,
        assignmentsCount: assignmentsCount || 0
      } : undefined
    };
  } catch (error) {
    console.error('❌ deleteSurveyCycle - Fatal error:', error);
    console.error('❌ deleteSurveyCycle - Error type:', typeof error);
    console.error('❌ deleteSurveyCycle - Error details:', JSON.stringify(error, null, 2));
    console.error('❌ deleteSurveyCycle - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // If it's already an Error with a message, rethrow it
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise, create a new error with whatever info we have
    throw new Error(`Failed to delete survey cycle: ${JSON.stringify(error)}`);
  }
}

// Note: Supabase client doesn't require explicit connection cleanup