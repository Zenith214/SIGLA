/**
 * Hook for managing survey records in IndexedDB
 * Integrates offline storage with the survey workflow
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSurveyRecord,
  createSurveyRecord,
  updateSurveyData,
  addVisit,
  markCompletedPendingSync,
  SurveyRecord,
  VisitOutcome,
  recordExists,
} from '@/lib/indexedDB';

interface UseSurveyRecordOptions {
  questionnaireId?: string;
  cycleId?: number;
  spotId?: number;
  autoLoad?: boolean;
}

interface UseSurveyRecordReturn {
  record: SurveyRecord | null;
  loading: boolean;
  error: Error | null;
  exists: boolean;
  loadRecord: () => Promise<void>;
  createRecord: (initialData?: any) => Promise<SurveyRecord>;
  updateData: (data: any) => Promise<void>;
  logVisit: (outcome: VisitOutcome, notes: string, location?: { lat: number; lng: number }) => Promise<void>;
  markCompleted: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage survey records in IndexedDB
 * Handles loading, creating, and updating survey records for offline workflow
 */
export function useSurveyRecord(options: UseSurveyRecordOptions): UseSurveyRecordReturn {
  const { questionnaireId, cycleId, spotId, autoLoad = true } = options;
  
  const [record, setRecord] = useState<SurveyRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exists, setExists] = useState(false);

  /**
   * Load an existing record from IndexedDB
   */
  const loadRecord = useCallback(async () => {
    if (!questionnaireId || !cycleId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const existingRecord = await getSurveyRecord(questionnaireId, cycleId);
      
      if (existingRecord) {
        setRecord(existingRecord);
        setExists(true);
        console.log(`📖 Loaded existing record for ${questionnaireId}:`, existingRecord);
      } else {
        setRecord(null);
        setExists(false);
        console.log(`📭 No existing record found for ${questionnaireId}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load record');
      setError(error);
      console.error('Error loading survey record:', error);
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, cycleId]);

  /**
   * Create a new record in IndexedDB
   */
  const createRecord = useCallback(async (initialData?: any): Promise<SurveyRecord> => {
    if (!questionnaireId || !cycleId || !spotId) {
      throw new Error('Missing required parameters: questionnaireId, cycleId, or spotId');
    }

    setLoading(true);
    setError(null);

    try {
      // Check if record already exists
      const existingRecord = await getSurveyRecord(questionnaireId, cycleId);
      
      if (existingRecord) {
        console.log(`📝 Record already exists for ${questionnaireId}, returning existing record`);
        setRecord(existingRecord);
        setExists(true);
        return existingRecord;
      }

      // Create new record
      const newRecord = await createSurveyRecord(
        questionnaireId,
        cycleId,
        spotId,
        initialData
      );

      setRecord(newRecord);
      setExists(true);
      console.log(`✨ Created new record for ${questionnaireId}:`, newRecord);

      return newRecord;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create record');
      setError(error);
      console.error('Error creating survey record:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, cycleId, spotId]);

  /**
   * Update survey data in the record
   */
  const updateData = useCallback(async (data: any) => {
    if (!questionnaireId || !cycleId) {
      throw new Error('Missing required parameters: questionnaireId or cycleId');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRecord = await updateSurveyData(questionnaireId, cycleId, data);
      setRecord(updatedRecord);
      console.log(`💾 Updated survey data for ${questionnaireId}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update data');
      setError(error);
      console.error('Error updating survey data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, cycleId]);

  /**
   * Log a visit to the record
   */
  const logVisit = useCallback(async (
    outcome: VisitOutcome,
    notes: string,
    location?: { lat: number; lng: number }
  ) => {
    if (!questionnaireId || !cycleId) {
      throw new Error('Missing required parameters: questionnaireId or cycleId');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRecord = await addVisit(questionnaireId, cycleId, outcome, notes, location);
      setRecord(updatedRecord);
      console.log(`📝 Logged visit for ${questionnaireId}:`, outcome);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to log visit');
      setError(error);
      console.error('Error logging visit:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, cycleId]);

  /**
   * Mark the record as completed and pending sync
   */
  const markCompleted = useCallback(async () => {
    if (!questionnaireId || !cycleId) {
      throw new Error('Missing required parameters: questionnaireId or cycleId');
    }

    setLoading(true);
    setError(null);

    try {
      const updatedRecord = await markCompletedPendingSync(questionnaireId, cycleId);
      setRecord(updatedRecord);
      console.log(`✅ Marked ${questionnaireId} as completed (pending sync)`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark as completed');
      setError(error);
      console.error('Error marking as completed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [questionnaireId, cycleId]);

  /**
   * Refresh the record from IndexedDB
   */
  const refresh = useCallback(async () => {
    await loadRecord();
  }, [loadRecord]);

  // Auto-load record on mount if enabled
  useEffect(() => {
    if (autoLoad && questionnaireId && cycleId) {
      loadRecord();
    }
  }, [autoLoad, questionnaireId, cycleId, loadRecord]);

  // Check if record exists when parameters change
  useEffect(() => {
    const checkExists = async () => {
      if (questionnaireId && cycleId) {
        const doesExist = await recordExists(questionnaireId, cycleId);
        setExists(doesExist);
      }
    };

    checkExists();
  }, [questionnaireId, cycleId]);

  return {
    record,
    loading,
    error,
    exists,
    loadRecord,
    createRecord,
    updateData,
    logVisit,
    markCompleted,
    refresh,
  };
}

