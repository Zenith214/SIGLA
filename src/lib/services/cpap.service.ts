import { supabaseAdmin } from '@/lib/supabase';
import { getActiveCycleId } from '@/utils/surveyCycleHelpers';
import {
  CPAP,
  CPAPItem,
  CPAPItemInput,
  CPAPFilters,
  CPAPListItem,
  CPAPWithDetails,
  ProgressUpdate,
  CPAPStatus,
  AISuggestion,
  AISuggestionsResponse,
  AISuggestionsMetadata
} from '@/types/cpap';
import { CPAPNotificationService } from './cpap-notification.service';
import { CPAPNotificationSimpleService } from './cpap-notification-simple.service';

/**
 * CPAP Service
 * Provides CRUD operations and business logic for Citizen Priority Action Plan management
 */
export class CPAPService {
  /**
   * Get or create CPAP for a specific barangay and cycle
   * If CPAP doesn't exist, creates a new one with Draft status
   * @param barangayId - The barangay ID
   * @param cycleId - The cycle ID (optional, defaults to active cycle)
   * @returns Promise<CPAP> - The CPAP record with items
   */
  static async getOrCreateCPAP(barangayId: number, cycleId?: number): Promise<CPAP> {
    try {
      const targetCycleId = cycleId || await getActiveCycleId();
      
      if (!targetCycleId) {
        throw new Error('No cycle specified and no active cycle found');
      }

      // Check if CPAP already exists
      const { data: existingCPAP, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          *,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          ),
          items:cpap_items (*)
        `)
        .eq('barangay_id', barangayId)
        .eq('cycle_id', targetCycleId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's expected if CPAP doesn't exist
        throw fetchError;
      }

      if (existingCPAP) {
        return this.transformCPAPResponse(existingCPAP);
      }

      // Create new CPAP with Draft status
      const { data: newCPAP, error: createError } = await supabaseAdmin
        .from('cpaps')
        .insert({
          barangay_id: barangayId,
          cycle_id: targetCycleId,
          status: 'Draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          ),
          items:cpap_items (*)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      return this.transformCPAPResponse(newCPAP);
    } catch (error) {
      console.error('Error in getOrCreateCPAP:', error);
      throw new Error('Failed to get or create CPAP');
    }
  }

  /**
   * List all CPAPs with role-based filtering
   * @param userId - The user ID for role-based filtering
   * @param userRole - The user's role (Admin, Officer, etc.)
   * @param userBarangayId - The user's assigned barangay ID (for Officer role)
   * @param filters - Optional filters for status, cycle, barangay, search
   * @returns Promise<CPAPListItem[]> - Array of CPAP list items
   */
  static async listCPAPs(
    userId: number,
    userRole: string,
    userBarangayId: number | null,
    filters?: CPAPFilters
  ): Promise<CPAPListItem[]> {
    try {
      let query = supabaseAdmin
        .from('cpaps')
        .select(`
          id,
          barangay_id,
          cycle_id,
          status,
          created_at,
          submitted_at,
          approved_at,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          ),
          items:cpap_items (id)
        `);

      // Role-based filtering
      if (userRole === 'officer' || userRole === 'Officer') {
        if (!userBarangayId) {
          throw new Error('Officer user must have an assigned barangay');
        }
        query = query.eq('barangay_id', userBarangayId);
      }
      // Admin can see all CPAPs - no additional filter needed

      // Apply optional filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.cycle_id) {
        query = query.eq('cycle_id', filters.cycle_id);
      }

      if (filters?.barangay_id) {
        query = query.eq('barangay_id', filters.barangay_id);
      }

      // Execute query
      const { data: cpaps, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform to list items
      const listItems: CPAPListItem[] = (cpaps || []).map((cpap: any) => ({
        id: cpap.id,
        barangay_id: cpap.barangay_id,
        barangay_name: cpap.barangay?.barangay_name || 'Unknown',
        cycle_id: cpap.cycle_id,
        cycle_name: cpap.cycle?.name || 'Unknown',
        status: cpap.status,
        created_at: cpap.created_at,
        submitted_at: cpap.submitted_at,
        approved_at: cpap.approved_at,
        item_count: cpap.items?.length || 0
      }));

      // Apply search filter if provided (client-side filtering for barangay name)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        return listItems.filter(item =>
          item.barangay_name.toLowerCase().includes(searchLower)
        );
      }

      return listItems;
    } catch (error) {
      console.error('Error in listCPAPs:', error);
      throw new Error('Failed to list CPAPs');
    }
  }

  /**
   * Update CPAP items (add, edit, delete)
   * @param cpapId - The CPAP ID
   * @param items - Array of items to add or update
   * @param deletedItemIds - Array of item IDs to delete
   * @returns Promise<CPAP> - The updated CPAP with all items
   */
  static async updateCPAPItems(
    cpapId: number,
    items: CPAPItemInput[],
    deletedItemIds?: number[]
  ): Promise<CPAP> {
    try {
      // Verify CPAP exists and is in editable status
      const { data: cpap, error: cpapError } = await supabaseAdmin
        .from('cpaps')
        .select('id, status')
        .eq('id', cpapId)
        .single();

      if (cpapError || !cpap) {
        throw new Error('CPAP not found');
      }

      if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested' && cpap.status !== 'Approved') {
        throw new Error(`Cannot edit CPAP in ${cpap.status} status`);
      }

      // Delete items if specified
      if (deletedItemIds && deletedItemIds.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('cpap_items')
          .delete()
          .in('id', deletedItemIds)
          .eq('cpap_id', cpapId);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Process items (update existing or insert new)
      for (const item of items) {
        if (item.id) {
          // Update existing item
          const { error: updateError } = await supabaseAdmin
            .from('cpap_items')
            .update({
              priority_area: item.priority_area,
              target_output: item.target_output,
              success_indicator: item.success_indicator,
              responsible_person: item.responsible_person,
              timeline_start: item.timeline_start,
              timeline_end: item.timeline_end,
              actual_output: item.actual_output || null,
              accomplishment_status: item.accomplishment_status || null,
              remarks: item.remarks || null,
              // New spreadsheet fields
              observation: item.observation || null,
              plan_of_action: item.plan_of_action || null,
              activity: item.activity || null,
              financial_requirements: item.financial_requirements || null,
              committed_to_be_committed: item.committed_to_be_committed || null,
              actual_date: item.actual_date || null,
              progress: item.progress || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id)
            .eq('cpap_id', cpapId);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Insert new item
          const { error: insertError } = await supabaseAdmin
            .from('cpap_items')
            .insert({
              cpap_id: cpapId,
              priority_area: item.priority_area,
              target_output: item.target_output,
              success_indicator: item.success_indicator,
              responsible_person: item.responsible_person,
              timeline_start: item.timeline_start,
              timeline_end: item.timeline_end,
              actual_output: item.actual_output || null,
              accomplishment_status: item.accomplishment_status || null,
              remarks: item.remarks || null,
              // New spreadsheet fields
              observation: item.observation || null,
              plan_of_action: item.plan_of_action || null,
              activity: item.activity || null,
              financial_requirements: item.financial_requirements || null,
              committed_to_be_committed: item.committed_to_be_committed || null,
              actual_date: item.actual_date || null,
              progress: item.progress || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            throw insertError;
          }
        }
      }

      // Update CPAP updated_at timestamp
      await supabaseAdmin
        .from('cpaps')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', cpapId);

      // Fetch and return updated CPAP
      const { data: updatedCPAP, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          *,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          ),
          items:cpap_items (*)
        `)
        .eq('id', cpapId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return this.transformCPAPResponse(updatedCPAP);
    } catch (error) {
      console.error('Error in updateCPAPItems:', error);
      throw new Error('Failed to update CPAP items');
    }
  }

  /**
   * Calculate progress/completion percentage for a CPAP
   * Based on how many items have progress updates (actual_output filled)
   * @param cpapId - The CPAP ID
   * @returns Promise<number> - Completion percentage (0-100)
   */
  static async calculateProgress(cpapId: number): Promise<number> {
    try {
      const { data: items, error } = await supabaseAdmin
        .from('cpap_items')
        .select('id, actual_output, accomplishment_status')
        .eq('cpap_id', cpapId);

      if (error) {
        throw error;
      }

      if (!items || items.length === 0) {
        return 0;
      }

      // Count items with progress updates
      const itemsWithProgress = items.filter(
        item => item.actual_output && item.actual_output.trim() !== ''
      ).length;

      const percentage = Math.round((itemsWithProgress / items.length) * 100);
      return percentage;
    } catch (error) {
      console.error('Error in calculateProgress:', error);
      throw new Error('Failed to calculate progress');
    }
  }

  /**
   * Get a specific CPAP by ID with all details
   * @param cpapId - The CPAP ID
   * @returns Promise<CPAP> - The CPAP with all items and relations
   */
  static async getCPAPById(cpapId: number): Promise<CPAP> {
    try {
      const { data: cpap, error } = await supabaseAdmin
        .from('cpaps')
        .select(`
          *,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          ),
          items:cpap_items (
            id, cpap_id, priority_area, target_output, success_indicator,
            responsible_person, timeline_start, timeline_end, actual_output,
            accomplishment_status, remarks, observation, plan_of_action,
            activity, financial_requirements, committed_to_be_committed,
            actual_date, progress, created_at, updated_at
          )
        `)
        .eq('id', cpapId)
        .single();

      if (error) {
        throw error;
      }

      if (!cpap) {
        throw new Error('CPAP not found');
      }

      return this.transformCPAPResponse(cpap);
    } catch (error) {
      console.error('Error in getCPAPById:', error);
      throw new Error('Failed to get CPAP');
    }
  }

  /**
   * Submit CPAP for review
   * Validates that CPAP has items and transitions status to Submitted
   * @param cpapId - The CPAP ID
   * @returns Promise<void>
   */
  static async submitCPAP(cpapId: number): Promise<void> {
    try {
      // Get CPAP with items
      const { data: cpap, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          id,
          status,
          items:cpap_items (*)
        `)
        .eq('id', cpapId)
        .single();

      if (fetchError || !cpap) {
        throw new Error('CPAP not found');
      }

      // Validate status
      if (cpap.status !== 'Draft' && cpap.status !== 'Revision_Requested') {
        throw new Error(`Cannot submit CPAP in ${cpap.status} status`);
      }

      // Validate has at least one item
      if (!cpap.items || cpap.items.length === 0) {
        throw new Error('CPAP must have at least one item before submission');
      }

      // Validate all items have required fields
      for (const item of cpap.items) {
        if (!item.priority_area || !item.target_output || !item.success_indicator ||
            !item.responsible_person || !item.timeline_start || !item.timeline_end) {
          throw new Error('All CPAP items must have complete required fields');
        }
      }

      // Update status to Submitted
      const { error: updateError } = await supabaseAdmin
        .from('cpaps')
        .update({
          status: 'Submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', cpapId);

      if (updateError) {
        throw updateError;
      }

      // Send notification to all ADMIN users
      await CPAPNotificationService.notifyCPAPSubmitted(cpapId);
    } catch (error) {
      console.error('Error in submitCPAP:', error);
      throw error;
    }
  }

  /**
   * Approve CPAP
   * Transitions status to Approved and records approval timestamp
   * @param cpapId - The CPAP ID
   * @param comments - Optional admin comments
   * @returns Promise<void>
   */
  static async approveCPAP(cpapId: number, comments?: string): Promise<void> {
    try {
      // Verify CPAP exists and is in Submitted status
      const { data: cpap, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select('id, status')
        .eq('id', cpapId)
        .single();

      if (fetchError || !cpap) {
        throw new Error('CPAP not found');
      }

      if (cpap.status !== 'Submitted') {
        throw new Error(`Cannot approve CPAP in ${cpap.status} status`);
      }

      // Update status to Approved
      const { error: updateError } = await supabaseAdmin
        .from('cpaps')
        .update({
          status: 'Approved',
          approved_at: new Date().toISOString(),
          admin_comments: comments || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', cpapId);

      if (updateError) {
        throw updateError;
      }

      // Send notification to OFFICER user
      await CPAPNotificationService.notifyCPAPApproved(cpapId);
    } catch (error) {
      console.error('Error in approveCPAP:', error);
      throw error;
    }
  }

  /**
   * Request revision for CPAP
   * Transitions status to Revision_Requested and stores admin comments
   * @param cpapId - The CPAP ID
   * @param comments - Required admin comments explaining what needs revision
   * @returns Promise<void>
   */
  static async requestRevision(cpapId: number, comments: string): Promise<void> {
    try {
      if (!comments || comments.trim() === '') {
        throw new Error('Comments are required when requesting revision');
      }

      // Verify CPAP exists and is in Submitted status
      const { data: cpap, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select('id, status')
        .eq('id', cpapId)
        .single();

      if (fetchError || !cpap) {
        throw new Error('CPAP not found');
      }

      if (cpap.status !== 'Submitted') {
        throw new Error(`Cannot request revision for CPAP in ${cpap.status} status`);
      }

      // Update status to Revision_Requested
      const { error: updateError } = await supabaseAdmin
        .from('cpaps')
        .update({
          status: 'Revision_Requested',
          admin_comments: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', cpapId);

      if (updateError) {
        throw updateError;
      }

      // Send notification to OFFICER user with admin comments
      await CPAPNotificationService.notifyCPAPRevisionRequested(cpapId, comments);
    } catch (error) {
      console.error('Error in requestRevision:', error);
      throw error;
    }
  }

  /**
   * Delete a CPAP and all its items
   * @param cpapId - The CPAP ID to delete
   * @returns Promise<void>
   */
  static async deleteCPAP(cpapId: number): Promise<void> {
    try {
      // Verify CPAP exists
      const { data: cpap, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select('id')
        .eq('id', cpapId)
        .single();

      if (fetchError || !cpap) {
        throw new Error('CPAP not found');
      }

      // Delete CPAP items first (cascade should handle this, but being explicit)
      const { error: deleteItemsError } = await supabaseAdmin
        .from('cpap_items')
        .delete()
        .eq('cpap_id', cpapId);

      if (deleteItemsError) {
        throw deleteItemsError;
      }

      // Delete CPAP
      const { error: deleteCPAPError } = await supabaseAdmin
        .from('cpaps')
        .delete()
        .eq('id', cpapId);

      if (deleteCPAPError) {
        throw deleteCPAPError;
      }
    } catch (error) {
      console.error('Error in deleteCPAP:', error);
      throw error;
    }
  }

  /**
   * Mark CPAP as done (completed)
   * Updates status to a completed state
   * @param cpapId - The CPAP ID
   * @returns Promise<void>
   */
  static async markAsDone(cpapId: number): Promise<void> {
    try {
      // Verify CPAP exists and is in Approved status
      const { data: cpap, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select('id, status')
        .eq('id', cpapId)
        .single();

      if (fetchError || !cpap) {
        throw new Error('CPAP not found');
      }

      if (cpap.status !== 'Approved') {
        throw new Error(`Cannot mark CPAP as done. Current status: ${cpap.status}`);
      }

      // Update status to Done (we'll need to add this status to the enum)
      const { error: updateError } = await supabaseAdmin
        .from('cpaps')
        .update({
          accomplishment_status: 'Completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', cpapId);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      console.error('Error in markAsDone:', error);
      throw error;
    }
  }

  /**
   * Update progress on approved CPAP items
   * Only updates progress-related fields (actual_output, accomplishment_status, remarks)
   * @param cpapId - The CPAP ID
   * @param progressUpdates - Array of progress updates for items
   * @returns Promise<CPAP> - The updated CPAP
   */
  static async updateProgress(
    cpapId: number,
    progressUpdates: ProgressUpdate[]
  ): Promise<CPAP> {
    try {
      // Verify CPAP exists and is in Approved status
      const { data: cpap, error: fetchError } = await supabaseAdmin
        .from('cpaps')
        .select('id, status')
        .eq('id', cpapId)
        .single();

      if (fetchError || !cpap) {
        throw new Error('CPAP not found');
      }

      if (cpap.status !== 'Approved') {
        throw new Error(`Cannot update progress for CPAP in ${cpap.status} status`);
      }

      // Update each item's progress
      for (const update of progressUpdates) {
        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (update.actual_output !== undefined) {
          updateData.actual_output = update.actual_output;
        }
        if (update.accomplishment_status !== undefined) {
          updateData.accomplishment_status = update.accomplishment_status;
        }
        if (update.remarks !== undefined) {
          updateData.remarks = update.remarks;
        }

        const { error: updateError } = await supabaseAdmin
          .from('cpap_items')
          .update(updateData)
          .eq('id', update.id)
          .eq('cpap_id', cpapId);

        if (updateError) {
          throw updateError;
        }
      }

      // Update CPAP updated_at timestamp
      await supabaseAdmin
        .from('cpaps')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', cpapId);

      // Fetch and return updated CPAP
      const { data: updatedCPAP, error: fetchUpdatedError } = await supabaseAdmin
        .from('cpaps')
        .select(`
          *,
          barangay:barangay_id (
            barangay_id,
            barangay_name
          ),
          cycle:cycle_id (
            cycle_id,
            name,
            year
          ),
          items:cpap_items (*)
        `)
        .eq('id', cpapId)
        .single();

      if (fetchUpdatedError) {
        throw fetchUpdatedError;
      }

      return this.transformCPAPResponse(updatedCPAP);
    } catch (error) {
      console.error('Error in updateProgress:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered action suggestions for CPAP creation
   * Analyzes survey results and funnel data to provide recommendations
   * @param barangayId - The barangay ID
   * @param cycleId - The cycle ID
   * @returns Promise<{ suggestions: AISuggestionsResponse; metadata: AISuggestionsMetadata }>
   */
  static async generateAISuggestions(
    barangayId: number,
    cycleId: number
  ): Promise<{ suggestions: AISuggestionsResponse; metadata: AISuggestionsMetadata }> {
    try {
      // Fetch funnel analysis data from ML API
      // This would typically be an internal API call, but we'll simulate it here
      const funnelData = await this.fetchFunnelAnalysis(barangayId, cycleId);

      // Check if we have any data at all
      if (!funnelData) {
        throw new Error('No funnel analysis data available for this barangay and cycle. Please ensure survey responses have been collected and analyzed.');
      }

      // Check if we have service scores
      if (!funnelData.service_scores || Object.keys(funnelData.service_scores).length === 0) {
        throw new Error('No survey data available for this barangay and cycle. Survey responses must be collected before AI suggestions can be generated.');
      }

      // Check if we have enough responses
      const totalResponses = funnelData.total_responses || 0;
      if (totalResponses === 0) {
        throw new Error('No survey responses found for this barangay and cycle. Please complete survey interviews before generating AI suggestions.');
      }

      const suggestions: AISuggestionsResponse = {
        shortTerm: [],
        mediumTerm: [],
        longTerm: []
      };

      const serviceAreas = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
      const serviceAreaNames: { [key: string]: string } = {
        financial: 'Financial Administration',
        disaster: 'Disaster Preparedness',
        safety: 'Safety, Peace & Order',
        social: 'Social Protection',
        business: 'Business Friendliness',
        environmental: 'Environmental Management'
      };

      // Process each service area
      for (const serviceArea of serviceAreas) {
        const serviceData = funnelData.service_scores[serviceArea];
        if (!serviceData) continue;

        const recommendations = serviceData.recommendations;
        if (!recommendations) continue;

        // Extract short-term recommendations
        if (recommendations.shortTerm && Array.isArray(recommendations.shortTerm)) {
          for (const rec of recommendations.shortTerm.slice(0, 2)) {
            suggestions.shortTerm.push({
              priority_area: serviceAreaNames[serviceArea] || serviceArea,
              target_output: rec,
              success_indicator: this.generateSuccessIndicator(rec, serviceArea),
              timeline_months: '0-3 months',
              source: serviceArea
            });
          }
        }

        // Extract medium-term recommendations
        if (recommendations.mediumTerm && Array.isArray(recommendations.mediumTerm)) {
          for (const rec of recommendations.mediumTerm.slice(0, 1)) {
            suggestions.mediumTerm.push({
              priority_area: serviceAreaNames[serviceArea] || serviceArea,
              target_output: rec,
              success_indicator: this.generateSuccessIndicator(rec, serviceArea),
              timeline_months: '6-12 months',
              source: serviceArea
            });
          }
        }

        // Extract long-term recommendations
        if (recommendations.longTerm && Array.isArray(recommendations.longTerm)) {
          for (const rec of recommendations.longTerm.slice(0, 1)) {
            suggestions.longTerm.push({
              priority_area: serviceAreaNames[serviceArea] || serviceArea,
              target_output: rec,
              success_indicator: this.generateSuccessIndicator(rec, serviceArea),
              timeline_months: '1+ year',
              source: serviceArea
            });
          }
        }
      }

      // Check if we generated any suggestions
      const totalSuggestions = suggestions.shortTerm.length + suggestions.mediumTerm.length + suggestions.longTerm.length;
      if (totalSuggestions === 0) {
        throw new Error('Unable to generate AI suggestions from the available survey data. The data may be insufficient or incomplete.');
      }

      const serviceAreasAnalyzed = Object.keys(funnelData.service_scores || {});

      const metadata: AISuggestionsMetadata = {
        generated_at: new Date().toISOString(),
        based_on_responses: totalResponses,
        service_areas_analyzed: serviceAreasAnalyzed
      };

      return { suggestions, metadata };
    } catch (error) {
      console.error('Error in generateAISuggestions:', error);
      
      // Re-throw with more specific error messages
      if (error instanceof Error) {
        // If it's already a descriptive error, re-throw it
        if (error.message.includes('No survey') || 
            error.message.includes('No funnel') || 
            error.message.includes('Unable to generate')) {
          throw error;
        }
        
        // If it's a fetch error, provide better context
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to retrieve survey analysis data. The barangay may not have any completed surveys yet.');
        }
      }
      
      // Generic fallback
      throw new Error('Failed to generate AI suggestions. Please ensure survey data is available for this barangay and cycle.');
    }
  }

  /**
   * Fetch funnel analysis data from ML API
   * @param barangayId - The barangay ID
   * @param cycleId - The cycle ID
   * @returns Promise<any> - Funnel analysis data
   */
  private static async fetchFunnelAnalysis(barangayId: number, cycleId: number): Promise<any> {
    try {
      console.log(`🔍 [CPAP AI] Fetching funnel analysis for barangay ${barangayId}, cycle ${cycleId}`);
      
      // Check if survey is complete
      const { data: surveyTarget, error: targetError } = await supabaseAdmin
        .from('survey_target')
        .select('percentage')
        .eq('barangay_id', barangayId)
        .eq('survey_cycle_id', cycleId)
        .single();

      if (targetError && targetError.code !== 'PGRST116') {
        console.error('Error checking survey progress:', targetError);
      }

      const progress = surveyTarget?.percentage || 0;

      if (progress < 100) {
        throw new Error(`Survey is only ${progress}% complete. Please complete the survey before generating AI suggestions.`);
      }

      // Fetch survey responses for this barangay and cycle
      // First, get the response IDs
      const { data: responseIds, error: responseError } = await supabaseAdmin
        .from('survey_response')
        .select('response_id, barangay_id, survey_cycle_id')
        .eq('barangay_id', barangayId)
        .eq('survey_cycle_id', cycleId);

      if (responseError) {
        console.error('❌ [CPAP AI] Error fetching responses:', responseError);
        throw new Error(`Failed to fetch survey responses: ${responseError.message}`);
      }

      console.log(`📊 [CPAP AI] Fetched ${responseIds?.length || 0} response IDs`);

      if (!responseIds || responseIds.length === 0) {
        throw new Error('No survey data found for this barangay and cycle. Please complete survey interviews first.');
      }

      // Now fetch sections for these responses
      const { data: sections, error: sectionsError } = await supabaseAdmin
        .from('survey_section')
        .select('section_id, response_id, section_key, data')
        .in('response_id', responseIds.map(r => r.response_id));

      if (sectionsError) {
        console.error('❌ [CPAP AI] Error fetching sections:', sectionsError);
        throw new Error(`Failed to fetch survey sections: ${sectionsError.message}`);
      }

      console.log(`📊 [CPAP AI] Fetched ${sections?.length || 0} sections`);

      // Combine responses with their sections
      const responses = responseIds.map(response => ({
        ...response,
        sections: sections?.filter(s => s.response_id === response.response_id) || []
      }));

      // Log sample response structure for debugging
      if (responses.length > 0) {
        console.log(`📊 [CPAP AI] Sample response structure:`, {
          response_id: responses[0].response_id,
          sections_count: responses[0].sections?.length || 0,
          has_sections: !!responses[0].sections
        });
      }

      // Build funnel data structure
      const serviceAreas = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
      const funnelData: any = {
        barangay_id: barangayId,
        cycle_id: cycleId,
        total_responses: responses.length,
        service_scores: {}
      };

      // For each service area, extract recommendations from survey data
      for (const serviceArea of serviceAreas) {
        const serviceData = this.extractServiceRecommendations(responses, serviceArea);
        // Store the complete service data (includes scores and recommendations)
        funnelData.service_scores[serviceArea] = serviceData;
      }
      
      console.log(`✅ [CPAP AI] Successfully fetched funnel analysis with ${responses.length} responses`);
      console.log(`📊 [CPAP AI] Service areas processed:`, Object.keys(funnelData.service_scores));
      
      return funnelData;
    } catch (error) {
      console.error('Error fetching funnel analysis:', error);
      
      // Re-throw with appropriate error message
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to fetch funnel analysis data. Please try again later.');
    }
  }

  /**
   * Extract service recommendations from survey responses
   * @param responses - Survey responses
   * @param serviceArea - Service area key
   * @returns Service scores and recommendations
   */
  private static extractServiceRecommendations(responses: any[], serviceArea: string): any {
    const serviceKeyMap: { [key: string]: string } = {
      financial: 'financialAdministration',
      disaster: 'disasterPreparedness',
      safety: 'safetyPeaceOrder',
      social: 'socialProtection',
      business: 'businessFriendliness',
      environmental: 'environmentalManagement'
    };

    const sectionKey = serviceKeyMap[serviceArea];
    if (!sectionKey) {
      console.log(`⚠️ [CPAP AI] Unknown service area: ${serviceArea}`);
      return { 
        awareness_score: 70,
        availment_score: 60,
        satisfaction_score: 65,
        need_action_score: 50,
        recommendations: { shortTerm: [], mediumTerm: [], longTerm: [] } 
      };
    }

    // Extract suggestions/comments from the service area sections
    const suggestions: string[] = [];
    
    responses.forEach((response: any) => {
      const sections = response.sections || [];
      const serviceSection = sections.find((s: any) => s.section_key === sectionKey);
      
      if (serviceSection && serviceSection.data) {
        const data = serviceSection.data;
        
        // Look for suggestion fields
        Object.keys(data).forEach(key => {
          if (key.toLowerCase().includes('suggestion') || key.toLowerCase().includes('comment')) {
            const value = data[key];
            if (value && typeof value === 'string' && value.trim().length > 10) {
              suggestions.push(value.trim());
            }
          }
        });
      }
    });

    console.log(`📝 [CPAP AI] ${serviceArea}: Found ${suggestions.length} suggestions from survey data`);

    // Generate recommendations based on collected suggestions
    const recommendations = {
      shortTerm: suggestions.slice(0, 3).map(s => s.substring(0, 200)),
      mediumTerm: suggestions.slice(3, 5).map(s => s.substring(0, 200)),
      longTerm: suggestions.slice(5, 7).map(s => s.substring(0, 200))
    };

    // If no suggestions found, provide service-specific generic ones
    if (recommendations.shortTerm.length === 0) {
      console.log(`💡 [CPAP AI] ${serviceArea}: Using generic recommendations`);
      const genericRecommendations = this.getGenericRecommendations(serviceArea);
      recommendations.shortTerm = genericRecommendations.shortTerm;
      recommendations.mediumTerm = genericRecommendations.mediumTerm;
      recommendations.longTerm = genericRecommendations.longTerm;
    } else {
      // Fill in missing medium/long term with generic ones if needed
      if (recommendations.mediumTerm.length === 0) {
        const generic = this.getGenericRecommendations(serviceArea);
        recommendations.mediumTerm = generic.mediumTerm;
      }
      if (recommendations.longTerm.length === 0) {
        const generic = this.getGenericRecommendations(serviceArea);
        recommendations.longTerm = generic.longTerm;
      }
    }

    return {
      awareness_score: 70,
      availment_score: 60,
      satisfaction_score: 65,
      need_action_score: 50,
      recommendations
    };
  }

  /**
   * Get generic recommendations for a service area
   * @param serviceArea - Service area key
   * @returns Generic recommendations
   */
  private static getGenericRecommendations(serviceArea: string): any {
    const genericByArea: { [key: string]: any } = {
      financial: {
        shortTerm: [
          'Improve transparency in budget allocation and spending',
          'Conduct information campaigns on available financial assistance programs',
          'Simplify application processes for financial aid'
        ],
        mediumTerm: [
          'Establish regular financial literacy programs for residents',
          'Develop online platforms for financial assistance applications'
        ],
        longTerm: [
          'Create sustainable funding mechanisms for community development',
          'Implement comprehensive financial management system'
        ]
      },
      disaster: {
        shortTerm: [
          'Conduct disaster preparedness training for residents',
          'Update and distribute evacuation maps and procedures',
          'Inspect and upgrade early warning systems'
        ],
        mediumTerm: [
          'Establish additional evacuation centers with proper facilities',
          'Develop partnerships with emergency response agencies'
        ],
        longTerm: [
          'Build climate-resilient infrastructure',
          'Implement comprehensive disaster risk reduction program'
        ]
      },
      safety: {
        shortTerm: [
          'Increase police visibility through regular patrols',
          'Install additional street lighting in dark areas',
          'Strengthen barangay tanod programs'
        ],
        mediumTerm: [
          'Install CCTV cameras in strategic locations',
          'Develop community-based crime prevention programs'
        ],
        longTerm: [
          'Establish integrated security monitoring system',
          'Build permanent police outpost in the barangay'
        ]
      },
      social: {
        shortTerm: [
          'Expand health services and extend clinic hours',
          'Provide additional support for senior citizens and PWDs',
          'Conduct regular medical missions and health screenings'
        ],
        mediumTerm: [
          'Establish daycare centers and youth development programs',
          'Develop partnerships with healthcare providers'
        ],
        longTerm: [
          'Build comprehensive health and wellness center',
          'Implement integrated social protection program'
        ]
      },
      business: {
        shortTerm: [
          'Simplify business permit and licensing procedures',
          'Reduce processing time for business applications',
          'Provide business advisory services for entrepreneurs'
        ],
        mediumTerm: [
          'Establish business one-stop-shop for permits',
          'Develop livelihood and skills training programs'
        ],
        longTerm: [
          'Create business incubation center',
          'Implement digital business registration system'
        ]
      },
      environmental: {
        shortTerm: [
          'Improve waste collection schedule and coverage',
          'Conduct environmental awareness campaigns',
          'Establish proper waste segregation at source'
        ],
        mediumTerm: [
          'Develop materials recovery facility',
          'Implement tree planting and greening programs'
        ],
        longTerm: [
          'Build comprehensive waste management system',
          'Establish environmental sustainability program'
        ]
      }
    };

    return genericByArea[serviceArea] || {
      shortTerm: [
        `Improve information dissemination about ${serviceArea} services`,
        `Conduct community consultations to identify ${serviceArea} priorities`
      ],
      mediumTerm: [
        `Develop comprehensive ${serviceArea} improvement plan`,
        `Establish partnerships for ${serviceArea} programs`
      ],
      longTerm: [
        `Implement sustainable ${serviceArea} management system`,
        `Build capacity for long-term ${serviceArea} development`
      ]
    };
  }

  /**
   * Generate a success indicator based on the recommendation
   * @param recommendation - The recommendation text
   * @param serviceArea - The service area
   * @returns string - Success indicator
   */
  private static generateSuccessIndicator(recommendation: string, serviceArea: string): string {
    // Generate contextual success indicators based on the recommendation
    const lowerRec = recommendation.toLowerCase();

    if (lowerRec.includes('campaign') || lowerRec.includes('information') || lowerRec.includes('awareness')) {
      return 'Increased awareness measured through surveys; at least 80% of residents informed';
    } else if (lowerRec.includes('simplify') || lowerRec.includes('process') || lowerRec.includes('application')) {
      return 'Reduced processing time by 50%; increased service utilization by 30%';
    } else if (lowerRec.includes('training') || lowerRec.includes('staff') || lowerRec.includes('capacity')) {
      return 'All staff trained; improved service quality ratings by 25%';
    } else if (lowerRec.includes('facility') || lowerRec.includes('equipment') || lowerRec.includes('upgrade')) {
      return 'Facilities upgraded and operational; increased service capacity by 40%';
    } else if (lowerRec.includes('partnership') || lowerRec.includes('coordination') || lowerRec.includes('collaboration')) {
      return 'Partnerships established; joint programs implemented and operational';
    } else if (lowerRec.includes('digital') || lowerRec.includes('online') || lowerRec.includes('system')) {
      return 'Digital system implemented; 60% of transactions processed online';
    } else if (lowerRec.includes('budget') || lowerRec.includes('funding') || lowerRec.includes('allocate')) {
      return 'Budget allocated and utilized; program sustainability ensured';
    } else {
      return 'Measurable improvement in service delivery; positive feedback from residents';
    }
  }

  /**
   * Transform Supabase response to CPAP type
   * @param data - Raw data from Supabase
   * @returns CPAP - Transformed CPAP object
   */
  private static transformCPAPResponse(data: any): CPAP {
    return {
      id: data.id,
      barangay_id: data.barangay_id,
      cycle_id: data.cycle_id,
      status: data.status as CPAPStatus,
      created_at: data.created_at,
      updated_at: data.updated_at,
      submitted_at: data.submitted_at,
      approved_at: data.approved_at,
      admin_comments: data.admin_comments,
      barangay: data.barangay ? {
        barangay_id: data.barangay.barangay_id,
        barangay_name: data.barangay.barangay_name
      } : undefined,
      cycle: data.cycle ? {
        cycle_id: data.cycle.cycle_id,
        name: data.cycle.name,
        year: data.cycle.year
      } : undefined,
      items: (data.items || []).map((item: any) => ({
        id: item.id,
        cpap_id: item.cpap_id,
        priority_area: item.priority_area,
        target_output: item.target_output,
        success_indicator: item.success_indicator,
        responsible_person: item.responsible_person,
        timeline_start: item.timeline_start,
        timeline_end: item.timeline_end,
        actual_output: item.actual_output,
        accomplishment_status: item.accomplishment_status,
        remarks: item.remarks,
        // New spreadsheet fields
        observation: item.observation,
        plan_of_action: item.plan_of_action,
        activity: item.activity,
        financial_requirements: item.financial_requirements,
        committed_to_be_committed: item.committed_to_be_committed,
        actual_date: item.actual_date,
        progress: item.progress,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
    };
  }
}

export default CPAPService;
