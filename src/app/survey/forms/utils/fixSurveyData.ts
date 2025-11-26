/**
 * Utility to fix survey data mapping issues in IndexedDB
 * Run this in the browser console to fix data for a specific survey
 */

export async function fixSurveyDataInIndexedDB(questionnaireId: string, cycleId: number) {
  // Open IndexedDB
  const dbName = 'pulse-survey-db';
  const storeName = 'survey-records';
  const recordId = `${questionnaireId}_${cycleId}`;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2); // Use version 2 to match the current schema
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Get the survey record using the composite key
      const getRequest = store.get(recordId);
      
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        
        if (!record) {
          console.error('Survey not found:', recordId);
          reject(new Error(`Survey not found: ${recordId}`));
          return;
        }
        
        console.log('Original record:', record);
        
        // Check if socialProtection has financial admin questions
        const socialData = record.surveyData.sections?.social?.data || {};
        const socialKeys = Object.keys(socialData);
        
        const hasFinancialQuestions = socialKeys.some(key => 
          key.includes('Corruption') || 
          key.includes('Projects') || 
          key.includes('Financial') ||
          key.includes('SocialPrograms')
        );
        
        if (hasFinancialQuestions) {
          console.warn('⚠️ Detected financial admin questions in social protection section');
          console.log('Social protection keys:', socialKeys);
          
          // The data is in the wrong place - we need to swap it
          // But we need to know where the correct social data is
          
          // Check if financial section has social questions
          const financialData = record.surveyData.sections?.financial?.data || {};
          const financialKeys = Object.keys(financialData);
          
          const hasSocialQuestions = financialKeys.some(key =>
            key.includes('Health') ||
            key.includes('Women') ||
            key.includes('Children') ||
            key.includes('Community')
          );
          
          if (hasSocialQuestions) {
            console.log('✅ Found social questions in financial section - swapping data');
            
            // Swap the data
            const temp = record.surveyData.sections.social.data;
            record.surveyData.sections.social.data = record.surveyData.sections.financial.data;
            record.surveyData.sections.financial.data = temp;
          } else {
            console.log('⚠️ Could not find social data to swap with financial');
          }
        }
        
        // Check if disaster section has financial admin questions
        const disasterData = record.surveyData.sections?.disaster?.data || {};
        const disasterKeys = Object.keys(disasterData);
        
        const disasterHasFinancialQuestions = disasterKeys.some(key =>
          key.includes('Corruption') ||
          key.includes('Projects') ||
          key.includes('Financial') ||
          key.includes('SocialPrograms')
        );
        
        if (disasterHasFinancialQuestions) {
          console.warn('⚠️ Detected financial admin questions in disaster prep section');
          console.log('Disaster prep keys:', disasterKeys);
          
          // Check if financial section has disaster questions
          const financialData = record.surveyData.sections?.financial?.data || {};
          const financialKeys = Object.keys(financialData);
          
          const hasDisasterQuestions = financialKeys.some(key =>
            key.includes('Disaster') ||
            key.includes('Evacuation')
          );
          
          if (hasDisasterQuestions) {
            console.log('✅ Found disaster questions in financial section - swapping data');
            
            // Swap the data
            const temp = record.surveyData.sections.disaster.data;
            record.surveyData.sections.disaster.data = record.surveyData.sections.financial.data;
            record.surveyData.sections.financial.data = temp;
          } else {
            console.log('⚠️ Could not find disaster data to swap with financial');
          }
        }
        
        // Save the updated record if any changes were made
        if (hasFinancialQuestions || disasterHasFinancialQuestions) {
          const putRequest = store.put(record);
          
          putRequest.onsuccess = () => {
            console.log('✅ Survey data fixed successfully!');
            console.log('Updated record:', record);
            resolve(record);
          };
          
          putRequest.onerror = () => {
            console.error('Failed to update record:', putRequest.error);
            reject(putRequest.error);
          };
        } else {
          console.log('✅ No data mapping issues detected');
          resolve(record);
        }
      };
      
      getRequest.onerror = () => {
        console.error('Failed to get record:', getRequest.error);
        reject(getRequest.error);
      };
    };
  });
}

/**
 * Convenience function that extracts parameters from current URL
 */
export async function fixCurrentSurveyData() {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be run in the browser');
  }
  
  const params = new URLSearchParams(window.location.search);
  const questionnaireId = params.get('questionnaireId');
  const cycleIdParam = params.get('cycleId');
  
  if (!questionnaireId) {
    console.error('❌ No questionnaireId found in URL');
    console.log('Available URL parameters:', Array.from(params.entries()));
    throw new Error('No questionnaireId found in URL. Please use: window.fixSurveyData(questionnaireId, cycleId)');
  }
  
  // Default to cycleId 1 if not provided (most common case)
  const cycleId = cycleIdParam ? parseInt(cycleIdParam) : 1;
  
  console.log(`🔧 Fixing survey data for: ${questionnaireId}, cycle: ${cycleId}`);
  return await fixSurveyDataInIndexedDB(questionnaireId, cycleId);
}

/**
 * Diagnose current survey from URL
 */
export async function diagnoseCurrentSurvey() {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be run in the browser');
  }
  
  const params = new URLSearchParams(window.location.search);
  const questionnaireId = params.get('questionnaireId');
  const cycleIdParam = params.get('cycleId');
  
  if (!questionnaireId) {
    console.error('❌ No questionnaireId found in URL');
    console.log('Available URL parameters:', Array.from(params.entries()));
    throw new Error('No questionnaireId found in URL');
  }
  
  const cycleId = cycleIdParam ? parseInt(cycleIdParam) : 1;
  
  console.log(`🔍 Diagnosing survey: ${questionnaireId}, cycle: ${cycleId}`);
  return await diagnoseSurveyData(questionnaireId, cycleId);
}

/**
 * Diagnose data mapping issues in a survey
 */
export async function diagnoseSurveyData(questionnaireId: string, cycleId: number) {
  const dbName = 'pulse-survey-db';
  const storeName = 'survey-records';
  const recordId = `${questionnaireId}_${cycleId}`;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const getRequest = store.get(recordId);
      
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        
        if (!record) {
          console.error('Survey not found:', recordId);
          reject(new Error(`Survey not found: ${recordId}`));
          return;
        }
        
        console.log('🔍 SURVEY DATA DIAGNOSIS');
        console.log('========================');
        
        const sections = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
        
        sections.forEach(sectionId => {
          const sectionData = record.surveyData.sections?.[sectionId]?.data || {};
          const keys = Object.keys(sectionData).filter(k => !k.endsWith('_skipReason'));
          
          console.log(`\n${sectionId.toUpperCase()}:`);
          console.log(`  Keys (${keys.length}):`, keys);
          
          // Detect what type of questions these are
          const patterns = {
            financial: /corruption|projects|financial|socialPrograms/i,
            disaster: /disaster|evacuation/i,
            safety: /tanods|lupon|antiDrug/i,
            social: /health|women|children|community/i,
            business: /business|clearance/i,
            environmental: /waste|garbage/i,
          };
          
          for (const [type, pattern] of Object.entries(patterns)) {
            const matches = keys.filter(k => pattern.test(k)).length;
            if (matches > 0) {
              console.log(`  ⚠️ Contains ${matches} ${type} questions`);
            }
          }
        });
        
        console.log('\n========================');
        resolve(record);
      };
      
      getRequest.onerror = () => {
        console.error('Failed to get record:', getRequest.error);
        reject(getRequest.error);
      };
    };
  });
}

/**
 * Clear all survey data (IndexedDB + localStorage)
 */
export async function clearAllSurveyData() {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be run in the browser');
  }
  
  // Clear localStorage
  localStorage.removeItem("barangay-survey-data");
  localStorage.removeItem("barangay-survey-sections");
  console.log('✅ Cleared localStorage survey data');
  
  // Clear all surveys from IndexedDB
  const surveys = await listAllSurveys();
  console.log(`🗑️ Clearing ${(surveys as any[]).length} surveys from IndexedDB...`);
  
  for (const survey of surveys as any[]) {
    await deleteSurveyFromIndexedDB(survey.questionnaireId, survey.cycleId);
  }
  
  console.log('✅ All survey data cleared!');
  console.log('💡 Reload the page to start fresh');
  
  return true;
}

/**
 * Delete a survey from IndexedDB
 */
export async function deleteSurveyFromIndexedDB(questionnaireId: string, cycleId: number) {
  const dbName = 'pulse-survey-db';
  const storeName = 'survey-records';
  const recordId = `${questionnaireId}_${cycleId}`;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const deleteRequest = store.delete(recordId);
      
      deleteRequest.onsuccess = () => {
        console.log(`✅ Deleted survey from IndexedDB: ${recordId}`);
        resolve(true);
      };
      
      deleteRequest.onerror = () => {
        console.error('Failed to delete record:', deleteRequest.error);
        reject(deleteRequest.error);
      };
    };
  });
}

/**
 * List all surveys in IndexedDB for debugging
 */
export async function listAllSurveys() {
  const dbName = 'pulse-survey-db';
  const storeName = 'survey-records';
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const records = getAllRequest.result;
        console.log(`📋 Found ${records.length} survey(s) in IndexedDB:`);
        records.forEach((record: any) => {
          console.log(`  - ID: ${record.id}, Questionnaire: ${record.questionnaireId}, Cycle: ${record.cycleId}, Status: ${record.status}`);
        });
        resolve(records);
      };
      
      getAllRequest.onerror = () => {
        console.error('Failed to get records:', getAllRequest.error);
        reject(getAllRequest.error);
      };
    };
  });
}

// Make it available in browser console
if (typeof window !== 'undefined') {
  (window as any).fixSurveyData = fixSurveyDataInIndexedDB;
  (window as any).fixCurrentSurvey = fixCurrentSurveyData;
  (window as any).listSurveys = listAllSurveys;
  (window as any).diagnoseSurvey = diagnoseSurveyData;
  (window as any).diagnoseCurrentSurvey = diagnoseCurrentSurvey;
  (window as any).deleteSurvey = deleteSurveyFromIndexedDB;
  (window as any).clearAllSurveys = clearAllSurveyData;
}
