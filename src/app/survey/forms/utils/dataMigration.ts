/**
 * Data Migration Utility
 * Fixes any data mapping issues where section data was saved to wrong fields
 */

import type { SurveyData } from "../page";

/**
 * Detects if a section's data contains questions from a different section
 * by checking question IDs
 */
function detectSectionMismatch(data: Record<string, any>, expectedSection: string): string | null {
  const questionIds = Object.keys(data).filter(key => !key.endsWith('_skipReason'));
  
  if (questionIds.length === 0) return null;
  
  // Define question ID patterns for each section
  const sectionPatterns: Record<string, RegExp[]> = {
    financial: [
      /awareness(Projects|Financial|SocialPrograms|Corruption)/i,
      /benefited|satisfaction|suggestions.*Projects/i,
      /used.*Financial|satisfaction.*Financial/i,
      /participated.*Social|satisfaction.*Social/i,
      /experienced.*Corruption|reported.*Corruption|details.*Corruption/i,
    ],
    disaster: [
      /awareness.*Disaster|availment.*Disaster/i,
      /awareness.*Evacuation|location.*Evacuation/i,
    ],
    safety: [
      /awareness.*Tanods|experience.*Tanods/i,
      /awareness.*Lupon|experience.*Lupon/i,
      /awareness.*AntiDrug|experience.*AntiDrug/i,
    ],
    social: [
      /awareness.*Health|availment.*Health/i,
      /awareness.*Women.*Children|availment.*Women.*Children/i,
      /awareness.*Community.*Participation|availment.*Community.*Participation/i,
    ],
    business: [
      /awareness.*Business.*Clearance|availment.*Business.*Clearance/i,
    ],
    environmental: [
      /awareness.*Waste|availment.*Waste/i,
    ],
  };
  
  // Check which section these questions actually belong to
  for (const [section, patterns] of Object.entries(sectionPatterns)) {
    if (section === expectedSection) continue;
    
    const matchCount = questionIds.filter(id => 
      patterns.some(pattern => pattern.test(id))
    ).length;
    
    // If more than 50% of questions match another section, it's a mismatch
    if (matchCount > questionIds.length * 0.5) {
      return section;
    }
  }
  
  return null;
}

/**
 * Migrates survey data to fix any section mapping issues
 */
export function migrateSurveyData(surveyData: SurveyData): SurveyData {
  const migratedData = { ...surveyData };
  let hasMigrations = false;
  
  // Check each section for mismatches
  const sectionsToCheck: Array<{ key: keyof SurveyData; expectedSection: string }> = [
    { key: 'financialAdmin', expectedSection: 'financial' },
    { key: 'disasterPrep', expectedSection: 'disaster' },
    { key: 'safetyPeace', expectedSection: 'safety' },
    { key: 'socialProtection', expectedSection: 'social' },
    { key: 'businessFriendly', expectedSection: 'business' },
    { key: 'environmental', expectedSection: 'environmental' },
  ];
  
  const dataSwaps: Array<{ from: keyof SurveyData; to: keyof SurveyData }> = [];
  
  for (const { key, expectedSection } of sectionsToCheck) {
    const sectionData = migratedData[key] as Record<string, any>;
    if (!sectionData || Object.keys(sectionData).length === 0) continue;
    
    const actualSection = detectSectionMismatch(sectionData, expectedSection);
    if (actualSection) {
      console.warn(`⚠️ Data mismatch detected: ${key} contains ${actualSection} data`);
      hasMigrations = true;
      
      // Find the correct key for this data
      const correctKey = sectionsToCheck.find(s => s.expectedSection === actualSection)?.key;
      if (correctKey) {
        dataSwaps.push({ from: key, to: correctKey });
      }
    }
  }
  
  // Perform data swaps
  if (dataSwaps.length > 0) {
    console.log('🔄 Performing data migrations:', dataSwaps);
    
    // Create a temporary copy to avoid overwriting during swaps
    const tempData: Partial<Record<keyof SurveyData, any>> = {};
    
    dataSwaps.forEach(({ from, to }) => {
      tempData[to] = migratedData[from];
      (migratedData[from] as any) = {};
    });
    
    // Apply the swapped data
    Object.entries(tempData).forEach(([key, value]) => {
      (migratedData[key as keyof SurveyData] as any) = value;
    });
    
    console.log('✅ Data migration completed');
  }
  
  return hasMigrations ? migratedData : surveyData;
}
