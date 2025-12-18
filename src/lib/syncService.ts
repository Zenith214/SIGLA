/**
 * Offline data synchronization service
 * Handles syncing survey records from IndexedDB to the server
 */

import {
  getPendingSyncRecords,
  markSynced,
  SurveyRecord,
  updateSurveyRecord,
} from './indexedDB';

// Sync configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // Exponential backoff: 2s, 4s, 8s
const SYNC_ENDPOINT = '/api/sync';

export interface SyncResult {
  questionnaireId: string;
  surveyNumber?: string;
  responseId?: number;
  status: 'success' | 'error';
  message?: string;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  synced: number;
  failed: number;
  total: number;
  results: SyncResult[];
  message: string;
}

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  current: number;
  currentQuestionnaire?: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

/**
 * Convert a SurveyRecord to the format expected by the sync API
 */
function convertRecordToAPIFormat(record: SurveyRecord): any {
  const payload: any = {
    questionnaireId: record.questionnaireId,
    spotId: record.spotId,
    surveyNumber: record.questionnaireId, // Use questionnaire ID as survey number
    location: {
      lat: record.surveyData.location?.lat || 0,
      lng: record.surveyData.location?.lng || 0,
      address: record.surveyData.location?.address || '',
      accuracy: record.surveyData.location?.accuracy,
      timestamp: record.surveyData.location?.timestamp,
      barangay: record.surveyData.location?.barangay || '',
      municipality: record.surveyData.location?.municipality || '',
      province: record.surveyData.location?.province || '',
    },
    selectedMember: record.surveyData.selectedMember,
    interviewerId: record.surveyData.interviewerId,
    barangayId: record.surveyData.barangayId,
    respondentDemographics: record.surveyData.respondentDemographics,
    sections: record.surveyData.sections,
  };
  
  // Include GPS verification location if present
  if (record.surveyData.verificationLocation) {
    payload.verificationLocation = record.surveyData.verificationLocation;
    console.log(`📍 Including GPS verification data for ${record.questionnaireId}`);
  }
  
  return payload;
}

/**
 * Sync a single record with retry logic
 */
async function syncSingleRecord(
  record: SurveyRecord,
  retryCount = 0
): Promise<SyncResult> {
  try {
    const payload = convertRecordToAPIFormat(record);
    
    // Log GPS verification data if present
    if (payload.verificationLocation) {
      console.log(`🔄 Syncing record ${record.questionnaireId} with GPS verification data`);
    }
    
    const response = await fetch(SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses: [payload] }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: SyncResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      if (result.status === 'success') {
        // Mark as synced in IndexedDB
        await markSynced(record.questionnaireId, record.cycleId);
        
        // Log successful GPS verification sync
        if (payload.verificationLocation) {
          console.log(`✅ Successfully synced GPS verification data for ${record.questionnaireId}`);
        }
        
        return result;
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    }
    
    throw new Error('No result returned from sync endpoint');
    
  } catch (error) {
    // Log GPS verification sync failure
    if (record.surveyData.verificationLocation) {
      console.warn(`⚠️ Failed to sync GPS verification data for ${record.questionnaireId}:`, error);
    }
    
    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount];
      await new Promise(resolve => setTimeout(resolve, delay));
      return syncSingleRecord(record, retryCount + 1);
    }
    
    // Max retries reached
    return {
      questionnaireId: record.questionnaireId,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Sync all pending records to the server
 */
export async function syncPendingRecords(
  onProgress?: SyncProgressCallback
): Promise<SyncResponse> {
  try {
    // Get all records pending sync
    const pendingRecords = await getPendingSyncRecords();
    
    if (pendingRecords.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        total: 0,
        results: [],
        message: 'No records to sync',
      };
    }

    const results: SyncResult[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    // Process each record sequentially
    for (let i = 0; i < pendingRecords.length; i++) {
      const record = pendingRecords[i];
      
      // Report progress
      if (onProgress) {
        onProgress({
          total: pendingRecords.length,
          synced: syncedCount,
          failed: failedCount,
          current: i + 1,
          currentQuestionnaire: record.questionnaireId,
        });
      }

      // Sync the record
      const result = await syncSingleRecord(record);
      results.push(result);

      if (result.status === 'success') {
        syncedCount++;
      } else {
        failedCount++;
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        total: pendingRecords.length,
        synced: syncedCount,
        failed: failedCount,
        current: pendingRecords.length,
      });
    }

    return {
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      total: pendingRecords.length,
      results,
      message: `Synced ${syncedCount} of ${pendingRecords.length} records`,
    };
    
  } catch (error) {
    console.error('Error in syncPendingRecords:', error);
    throw error;
  }
}

/**
 * Sync specific records by questionnaire IDs
 */
export async function syncSpecificRecords(
  questionnaireIds: Array<{ questionnaireId: string; cycleId: number }>,
  onProgress?: SyncProgressCallback
): Promise<SyncResponse> {
  try {
    const { getSurveyRecord } = await import('./indexedDB');
    
    // Get the specific records
    const records: SurveyRecord[] = [];
    for (const { questionnaireId, cycleId } of questionnaireIds) {
      const record = await getSurveyRecord(questionnaireId, cycleId);
      if (record && record.status === 'Completed (Pending Sync)') {
        records.push(record);
      }
    }

    if (records.length === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        total: 0,
        results: [],
        message: 'No records to sync',
      };
    }

    const results: SyncResult[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // Report progress
      if (onProgress) {
        onProgress({
          total: records.length,
          synced: syncedCount,
          failed: failedCount,
          current: i + 1,
          currentQuestionnaire: record.questionnaireId,
        });
      }

      // Sync the record
      const result = await syncSingleRecord(record);
      results.push(result);

      if (result.status === 'success') {
        syncedCount++;
      } else {
        failedCount++;
      }
    }

    return {
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      total: records.length,
      results,
      message: `Synced ${syncedCount} of ${records.length} records`,
    };
    
  } catch (error) {
    console.error('Error in syncSpecificRecords:', error);
    throw error;
  }
}

/**
 * Check if there are any records pending sync
 */
export async function hasPendingSync(): Promise<boolean> {
  const pendingRecords = await getPendingSyncRecords();
  return pendingRecords.length > 0;
}

/**
 * Get count of pending sync records
 */
export async function getPendingSyncCount(): Promise<number> {
  const pendingRecords = await getPendingSyncRecords();
  return pendingRecords.length;
}

/**
 * Retry failed syncs
 * This function attempts to sync records that previously failed
 */
export async function retryFailedSyncs(
  onProgress?: SyncProgressCallback
): Promise<SyncResponse> {
  // For now, this is the same as syncing all pending records
  // In the future, we could track failed attempts separately
  return syncPendingRecords(onProgress);
}

/**
 * Auto-sync when connection is restored
 * This should be called when the app detects it's back online
 */
export async function autoSyncOnReconnect(): Promise<void> {
  try {
    const hasPending = await hasPendingSync();
    if (hasPending) {
      console.log('Auto-syncing pending records after reconnection...');
      const result = await syncPendingRecords();
      console.log('Auto-sync complete:', result.message);
      
      // You could dispatch an event or show a notification here
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync-complete', { detail: result }));
      }
    }
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}

/**
 * Queue management for pending sync records
 * Returns information about the sync queue
 */
export async function getSyncQueueInfo(): Promise<{
  count: number;
  records: Array<{
    questionnaireId: string;
    cycleId: number;
    spotId: number;
    updatedAt: Date;
    visitCount: number;
  }>;
}> {
  const pendingRecords = await getPendingSyncRecords();
  
  return {
    count: pendingRecords.length,
    records: pendingRecords.map(record => ({
      questionnaireId: record.questionnaireId,
      cycleId: record.cycleId,
      spotId: record.spotId,
      updatedAt: record.updatedAt,
      visitCount: record.visits.length,
    })),
  };
}
