/**
 * IndexedDB utilities for offline survey data storage
 * Implements the CSIS workflow offline-first architecture
 * 
 * IMPORTANT: Two-ID System Architecture
 * =====================================
 * This module uses the hierarchical full_id (questionnaire_id) as the primary identifier
 * for all IndexedDB operations. The full_id format is YYYY-BB-SS-QQQ where:
 * - YYYY: Year
 * - BB: Barangay ID
 * - SS: Spot number
 * - QQQ: Questionnaire number within spot
 * 
 * The display_id (1-150) is calculated dynamically for UI display purposes only
 * and is NOT stored in IndexedDB. All internal operations (put/get/delete/query)
 * use the full_id to maintain data integrity and traceability.
 * 
 * Key Design Decisions:
 * - Primary Key: Composite key `${questionnaireId}_${cycleId}` where questionnaireId is the full_id
 * - Index: 'by-questionnaire' index uses full_id (questionnaireId) for efficient lookups
 * - All CRUD operations accept questionnaireId parameter which is the full_id
 * - No display_id is stored or used in any IndexedDB operations
 * 
 * @see Requirements 4.2, 4.4 - Internal operations must use full_id
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database configuration
const DB_NAME = 'pulse-survey-db';
const DB_VERSION = 2; // Incremented for GPS verification schema update
const STORE_NAME = 'survey-records';

// Type definitions matching the design document
export type SurveyRecordStatus = 
  | 'Pending' 
  | 'In Progress' 
  | 'Completed' 
  | 'Completed (Pending Sync)';

export type VisitOutcome = 
  | 'Callback Needed' 
  | 'Interview Started' 
  | 'Interview Completed'
  | 'Refused'
  | 'Household Moved';

export interface GPSCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface Visit {
  visitNumber: number;
  timestamp: Date;
  outcome: VisitOutcome;
  notes: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SurveyData {
  selectedMember?: string;
  respondentDemographics?: any;
  sections?: Record<string, any>;
  verificationLocation?: GPSCoordinates; // GPS captured at household for quality control
  [key: string]: any;
}

export interface SurveyRecord {
  id: string; // Composite key: `${questionnaireId}_${cycleId}` where questionnaireId is the full_id (YYYY-BB-SS-QQQ)
  questionnaireId: string; // IMPORTANT: This is the full_id (YYYY-BB-SS-QQQ), NOT the display_id. Used as primary identifier for all operations.
  cycleId: number;
  spotId: number;
  status: SurveyRecordStatus;
  visits: Visit[];
  surveyData: SurveyData;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

// IndexedDB Schema definition
// IMPORTANT: All keys and indexes use full_id (questionnaire_id), not display_id
interface SurveyDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string; // Composite key: `${questionnaireId}_${cycleId}` where questionnaireId is full_id
    value: SurveyRecord;
    indexes: {
      'by-status': SurveyRecordStatus;
      'by-questionnaire': string; // Index on full_id (questionnaireId) for efficient lookups
      'by-cycle': number;
      'by-spot': number;
    };
  };
}

// Database instance cache
let dbInstance: IDBPDatabase<SurveyDBSchema> | null = null;

/**
 * Initialize and open the IndexedDB database
 */
export async function initDB(): Promise<IDBPDatabase<SurveyDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<SurveyDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`📦 Upgrading IndexedDB from version ${oldVersion} to ${newVersion || DB_VERSION}`);
      
      // Create object store if it doesn't exist (initial setup)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Create indexes for efficient querying
        store.createIndex('by-status', 'status');
        store.createIndex('by-questionnaire', 'questionnaireId');
        store.createIndex('by-cycle', 'cycleId');
        store.createIndex('by-spot', 'spotId');
        
        console.log('✅ Created survey-records object store with indexes');
      }
      
      // Handle migration from version 1 to version 2 (GPS verification)
      if (oldVersion < 2 && (newVersion === null || newVersion >= 2)) {
        console.log('🔄 Migrating to version 2: Adding GPS verification support');
        
        // The verificationLocation field is added to the SurveyData interface
        // Existing records will automatically have undefined for this field
        // No data migration needed as the field is optional
        
        // Log existing records count for monitoring
        const store = transaction.objectStore(STORE_NAME);
        store.count().then(count => {
          console.log(`✅ Migration complete. ${count} existing records will have verificationLocation as undefined (backward compatible)`);
        });
      }
    },
  });

  return dbInstance;
}

/**
 * Create a new survey record in IndexedDB
 * Does NOT automatically log a visit - visits should be logged explicitly when meaningful progress is made
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @param spotId - The spot ID
 * @param initialData - Optional initial survey data
 * @param verificationLocation - Optional GPS coordinates for verification
 * @returns The created survey record
 * 
 * IMPORTANT: Uses full_id as primary identifier (Requirement 4.2)
 */
export async function createSurveyRecord(
  questionnaireId: string,
  cycleId: number,
  spotId: number,
  initialData?: Partial<SurveyData>,
  verificationLocation?: GPSCoordinates
): Promise<SurveyRecord> {
  const db = await initDB();
  
  const id = `${questionnaireId}_${cycleId}`;
  const now = new Date();
  
  // Merge initial data with verification location if provided
  const surveyData: SurveyData = {
    ...initialData,
  };
  
  // Add verification location if provided
  if (verificationLocation) {
    surveyData.verificationLocation = verificationLocation;
  }
  
  const record: SurveyRecord = {
    id,
    questionnaireId,
    cycleId,
    spotId,
    status: 'In Progress',
    visits: [], // Start with no visits - will be logged when respondent demographics is completed
    surveyData,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.add(STORE_NAME, record);
  console.log(`✅ Created survey record for ${questionnaireId}${verificationLocation ? ' (with GPS verification)' : ''} - visit will be logged when respondent demographics is completed`);
  return record;
}

/**
 * Get a survey record by ID
 * Returns complete record including verificationLocation if present
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @returns The survey record or undefined if not found
 * 
 * IMPORTANT: Uses full_id for lookup (Requirement 4.4)
 */
export async function getSurveyRecord(
  questionnaireId: string,
  cycleId: number
): Promise<SurveyRecord | undefined> {
  const db = await initDB();
  const id = `${questionnaireId}_${cycleId}`; // Composite key using full_id
  return await db.get(STORE_NAME, id);
}

/**
 * Get a survey record by questionnaire ID (searches across all cycles)
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @returns The survey record or undefined if not found
 * 
 * IMPORTANT: Uses full_id with 'by-questionnaire' index (Requirement 4.4)
 */
export async function getSurveyRecordByQuestionnaire(
  questionnaireId: string
): Promise<SurveyRecord | undefined> {
  const db = await initDB();
  const index = db.transaction(STORE_NAME).store.index('by-questionnaire');
  return await index.get(questionnaireId); // Query using full_id
}

/**
 * Update an existing survey record
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @param updates - Partial updates to apply to the record
 * @returns The updated survey record
 * 
 * IMPORTANT: Uses full_id for get and put operations (Requirement 4.4)
 */
export async function updateSurveyRecord(
  questionnaireId: string,
  cycleId: number,
  updates: Partial<Omit<SurveyRecord, 'id' | 'questionnaireId' | 'cycleId' | 'createdAt'>>
): Promise<SurveyRecord> {
  const db = await initDB();
  const id = `${questionnaireId}_${cycleId}`; // Composite key using full_id
  
  const existing = await db.get(STORE_NAME, id); // Get using full_id
  if (!existing) {
    throw new Error(`Survey record not found: ${id}`);
  }
  
  const updated: SurveyRecord = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  
  await db.put(STORE_NAME, updated); // Put using full_id
  return updated;
}

/**
 * Update survey data (partial update of surveyData field)
 * Supports updating verificationLocation and all other survey data fields
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @param dataUpdates - Partial updates to apply to the survey data
 * @returns The updated survey record
 * 
 * IMPORTANT: Uses full_id for get and put operations (Requirement 4.4)
 */
export async function updateSurveyData(
  questionnaireId: string,
  cycleId: number,
  dataUpdates: Partial<SurveyData>
): Promise<SurveyRecord> {
  const db = await initDB();
  const id = `${questionnaireId}_${cycleId}`; // Composite key using full_id
  
  const existing = await db.get(STORE_NAME, id); // Get using full_id
  if (!existing) {
    throw new Error(`Survey record not found: ${id}`);
  }
  
  // Merge updates with existing data, including verificationLocation if provided
  const updated: SurveyRecord = {
    ...existing,
    surveyData: {
      ...existing.surveyData,
      ...dataUpdates,
    },
    updatedAt: new Date(),
  };
  
  await db.put(STORE_NAME, updated); // Put using full_id
  
  // Log if GPS verification data was updated
  if (dataUpdates.verificationLocation) {
    console.log(`📍 Updated GPS verification location for ${questionnaireId}`);
  }
  
  return updated;
}

/**
 * Add a visit to a survey record
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @param outcome - The visit outcome
 * @param notes - Visit notes
 * @param location - Optional GPS location of the visit
 * @returns The updated survey record
 * 
 * IMPORTANT: Uses full_id for get and put operations (Requirement 4.4)
 */
export async function addVisit(
  questionnaireId: string,
  cycleId: number,
  outcome: VisitOutcome,
  notes: string,
  location?: { lat: number; lng: number }
): Promise<SurveyRecord> {
  const db = await initDB();
  const id = `${questionnaireId}_${cycleId}`; // Composite key using full_id
  
  const existing = await db.get(STORE_NAME, id); // Get using full_id
  if (!existing) {
    throw new Error(`Survey record not found: ${id}`);
  }
  
  const visit: Visit = {
    visitNumber: existing.visits.length + 1,
    timestamp: new Date(),
    outcome,
    notes,
    location,
  };
  
  const updated: SurveyRecord = {
    ...existing,
    visits: [...existing.visits, visit],
    updatedAt: new Date(),
  };
  
  await db.put(STORE_NAME, updated); // Put using full_id
  return updated;
}

/**
 * Update the status of a survey record
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @param status - The new status
 * @returns The updated survey record
 * 
 * IMPORTANT: Uses full_id via updateSurveyRecord (Requirement 4.4)
 */
export async function updateStatus(
  questionnaireId: string,
  cycleId: number,
  status: SurveyRecordStatus
): Promise<SurveyRecord> {
  return await updateSurveyRecord(questionnaireId, cycleId, { status });
}

/**
 * Mark a survey record as completed and pending sync
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @returns The updated survey record
 * 
 * IMPORTANT: Uses full_id via updateSurveyRecord (Requirement 4.4)
 */
export async function markCompletedPendingSync(
  questionnaireId: string,
  cycleId: number
): Promise<SurveyRecord> {
  return await updateSurveyRecord(questionnaireId, cycleId, {
    status: 'Completed (Pending Sync)',
  });
}

/**
 * Mark a survey record as synced
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @returns The updated survey record
 * 
 * IMPORTANT: Uses full_id via updateSurveyRecord (Requirement 4.4)
 */
export async function markSynced(
  questionnaireId: string,
  cycleId: number
): Promise<SurveyRecord> {
  return await updateSurveyRecord(questionnaireId, cycleId, {
    status: 'Completed',
    syncedAt: new Date(),
  });
}

/**
 * Get all survey records
 */
export async function getAllSurveyRecords(): Promise<SurveyRecord[]> {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

/**
 * Get survey records by status
 */
export async function getSurveyRecordsByStatus(
  status: SurveyRecordStatus
): Promise<SurveyRecord[]> {
  const db = await initDB();
  const index = db.transaction(STORE_NAME).store.index('by-status');
  return await index.getAll(status);
}

/**
 * Get survey records by cycle
 */
export async function getSurveyRecordsByCycle(
  cycleId: number
): Promise<SurveyRecord[]> {
  const db = await initDB();
  const index = db.transaction(STORE_NAME).store.index('by-cycle');
  return await index.getAll(cycleId);
}

/**
 * Get survey records by spot
 */
export async function getSurveyRecordsBySpot(
  spotId: number
): Promise<SurveyRecord[]> {
  const db = await initDB();
  const index = db.transaction(STORE_NAME).store.index('by-spot');
  return await index.getAll(spotId);
}

/**
 * Get all records pending sync
 */
export async function getPendingSyncRecords(): Promise<SurveyRecord[]> {
  return await getSurveyRecordsByStatus('Completed (Pending Sync)');
}

/**
 * Delete a survey record
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * 
 * IMPORTANT: Uses full_id for delete operation (Requirement 4.4)
 */
export async function deleteSurveyRecord(
  questionnaireId: string,
  cycleId: number
): Promise<void> {
  const db = await initDB();
  const id = `${questionnaireId}_${cycleId}`; // Composite key using full_id
  await db.delete(STORE_NAME, id); // Delete using full_id
}

/**
 * Clear all survey records (use with caution)
 */
export async function clearAllRecords(): Promise<void> {
  const db = await initDB();
  await db.clear(STORE_NAME);
}

/**
 * Get database statistics
 */
export async function getDBStats(): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  pendingSync: number;
}> {
  const allRecords = await getAllSurveyRecords();
  
  return {
    total: allRecords.length,
    pending: allRecords.filter(r => r.status === 'Pending').length,
    inProgress: allRecords.filter(r => r.status === 'In Progress').length,
    completed: allRecords.filter(r => r.status === 'Completed').length,
    pendingSync: allRecords.filter(r => r.status === 'Completed (Pending Sync)').length,
  };
}

/**
 * Check if a record exists
 * 
 * @param questionnaireId - The full_id (YYYY-BB-SS-QQQ format), NOT the display_id
 * @param cycleId - The survey cycle ID
 * @returns True if the record exists, false otherwise
 * 
 * IMPORTANT: Uses full_id via getSurveyRecord (Requirement 4.4)
 */
export async function recordExists(
  questionnaireId: string,
  cycleId: number
): Promise<boolean> {
  const record = await getSurveyRecord(questionnaireId, cycleId);
  return record !== undefined;
}
