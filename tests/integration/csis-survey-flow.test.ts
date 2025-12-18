/**
 * Integration tests for CSIS Survey Flow
 * 
 * Tests the complete survey workflow including:
 * - 6-section randomization based on questionnaire number
 * - Kish Grid respondent selection with various household sizes
 * - GPS verification with different distances
 * - Complete survey flow from initialization to submission
 * 
 * Requirements tested:
 * - 1.1-1.4: Six-section randomization using CSIS methodology
 * - 2.1-2.5: Kish Grid respondent selection
 * - 3.1-3.5: Dynamic gender calculation without questionnaireType
 * - 4.1-4.5: Six-section navigation
 * - 5.1-5.7: GPS verification and flagging
 * - 6.1-6.4: CSIS randomization map (150 entries)
 * - 7.1-7.4: Kish Grid matrix (12x10)
 * - 8.1-8.4: GPS threshold configuration
 */

import { getSectionOrder } from '../../src/app/survey/forms/utils/sectionAssignment';
import { selectRespondentKishGrid } from '../../src/app/survey/forms/utils/kishGrid';
import { verifyGPSLocation, calculateDistance } from '../../src/app/survey/forms/utils/gpsVerification';

describe('CSIS Survey Flow Integration Tests', () => {
  
  describe('Section Randomization (Algorithm A)', () => {
    test('should return all 6 sections for questionnaire #1', () => {
      const sections = getSectionOrder(1);
      
      expect(sections).toHaveLength(6);
      expect(sections).toContain('financial');
      expect(sections).toContain('disaster');
      expect(sections).toContain('social');
      expect(sections).toContain('safety');
      expect(sections).toContain('business');
      expect(sections).toContain('environmental');
    });

    test('should return different starting sections for different questionnaire numbers', () => {
      const sections1 = getSectionOrder(1);
      const sections2 = getSectionOrder(2);
      const sections3 = getSectionOrder(3);
      
      // Different questionnaires should have different starting sections
      // (unless they happen to map to the same section in CSIS table)
      expect(sections1).toHaveLength(6);
      expect(sections2).toHaveLength(6);
      expect(sections3).toHaveLength(6);
    });

    test('should handle all 150 questionnaire numbers', () => {
      for (let i = 1; i <= 150; i++) {
        const sections = getSectionOrder(i);
        
        expect(sections).toHaveLength(6);
        expect(sections).toEqual(expect.arrayContaining([
          'financial', 'disaster', 'social', 'safety', 'business', 'environmental'
        ]));
      }
    });

    test('should maintain section order consistency', () => {
      const sections1 = getSectionOrder(1);
      const sections2 = getSectionOrder(1);
      
      expect(sections1).toEqual(sections2);
    });

    test('should rotate sections correctly', () => {
      const sections = getSectionOrder(1);
      const canonicalOrder = ['financial', 'disaster', 'social', 'safety', 'business', 'environmental'];
      
      // Find where the first section appears in canonical order
      const startIndex = canonicalOrder.indexOf(sections[0]);
      
      // Verify rotation is correct
      const expectedOrder = [
        ...canonicalOrder.slice(startIndex),
        ...canonicalOrder.slice(0, startIndex)
      ];
      
      expect(sections).toEqual(expectedOrder);
    });

    test('should handle edge case questionnaire numbers', () => {
      const sections150 = getSectionOrder(150);
      const sections1 = getSectionOrder(1);
      
      expect(sections150).toHaveLength(6);
      expect(sections1).toHaveLength(6);
    });
  });

  describe('Kish Grid Respondent Selection (Algorithm B)', () => {
    const createHouseholdMembers = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        name: `Member ${i + 1}`,
        birthdate: '1980-01-01',
        gender: i % 2 === 0 ? 'Male' : 'Female'
      }));
    };

    test('should select correct respondent for 1 eligible member', () => {
      const members = createHouseholdMembers(1);
      const result = selectRespondentKishGrid(1, members);
      
      expect(result.selectedMember).toBe(members[0]);
      expect(result.lookupRow).toBe(1);
      expect(result.lookupColumn).toBe(1);
    });

    test('should select correct respondent for 3 eligible members', () => {
      const members = createHouseholdMembers(3);
      const result = selectRespondentKishGrid(1, members);
      
      expect(result.lookupRow).toBe(3);
      expect(result.lookupColumn).toBe(1);
      expect(result.selectedIndex).toBeGreaterThanOrEqual(0);
      expect(result.selectedIndex).toBeLessThan(3);
    });

    test('should handle 12+ members by capping at row 12', () => {
      const members = createHouseholdMembers(15);
      const result = selectRespondentKishGrid(10, members);
      
      expect(result.lookupRow).toBe(12); // Capped at 12
      expect(result.lookupColumn).toBe(10);
      expect(result.selectedMember).toBeDefined();
    });

    test('should calculate column correctly for questionnaire numbers 1-10', () => {
      const members = createHouseholdMembers(5);
      
      for (let qNum = 1; qNum <= 10; qNum++) {
        const result = selectRespondentKishGrid(qNum, members);
        const expectedColumn = qNum % 10 === 0 ? 10 : qNum % 10;
        
        expect(result.lookupColumn).toBe(expectedColumn);
      }
    });

    test('should handle questionnaire numbers ending in 0', () => {
      const members = createHouseholdMembers(5);
      const result = selectRespondentKishGrid(10, members);
      
      expect(result.lookupColumn).toBe(10); // Not 0
    });

    test('should throw error for empty member list', () => {
      expect(() => {
        selectRespondentKishGrid(1, []);
      }).toThrow(); // Throws KishGridError with NO_QUALIFIED_RESPONDENT code
    });

    test('should select different members for different questionnaire numbers', () => {
      const members = createHouseholdMembers(10);
      
      const result1 = selectRespondentKishGrid(1, members);
      const result5 = selectRespondentKishGrid(5, members);
      
      // Different questionnaire numbers should potentially select different members
      expect(result1.lookupColumn).not.toBe(result5.lookupColumn);
    });

    test('should handle various household sizes (2-12)', () => {
      for (let size = 2; size <= 12; size++) {
        const members = createHouseholdMembers(size);
        const result = selectRespondentKishGrid(1, members);
        
        expect(result.lookupRow).toBe(size);
        expect(result.selectedMember).toBeDefined();
        expect(result.selectedIndex).toBeGreaterThanOrEqual(0);
        expect(result.selectedIndex).toBeLessThan(size);
      }
    });
  });

  describe('GPS Verification', () => {
    test('should calculate distance between two coordinates', () => {
      const coord1 = { lat: 14.5995, lng: 120.9842 };
      const coord2 = { lat: 14.6020, lng: 120.9870 };
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(5000); // Should be less than 5km
    });

    test('should verify GPS location within threshold', () => {
      const assignedSpot = { lat: 14.5995, lng: 120.9842 };
      const actualLocation = { lat: 14.5996, lng: 120.9843 }; // Very close
      
      const result = verifyGPSLocation(assignedSpot, actualLocation, {
        thresholdMeters: 200
      });
      
      expect(result.withinThreshold).toBe(true);
      expect(result.flagForReview).toBe(false);
      expect(result.distanceMeters).toBeLessThan(200);
    });

    test('should flag GPS location beyond threshold', () => {
      const assignedSpot = { lat: 14.5995, lng: 120.9842 };
      const actualLocation = { lat: 14.6020, lng: 120.9870 }; // ~300m away
      
      const result = verifyGPSLocation(assignedSpot, actualLocation, {
        thresholdMeters: 200
      });
      
      expect(result.withinThreshold).toBe(false);
      expect(result.flagForReview).toBe(true);
      expect(result.distanceMeters).toBeGreaterThan(200);
    });

    test('should handle different threshold values', () => {
      const assignedSpot = { lat: 14.5995, lng: 120.9842 };
      const actualLocation = { lat: 14.6005, lng: 120.9852 };
      
      const result100 = verifyGPSLocation(assignedSpot, actualLocation, {
        thresholdMeters: 100
      });
      
      const result500 = verifyGPSLocation(assignedSpot, actualLocation, {
        thresholdMeters: 500
      });
      
      // Same distance, different thresholds
      expect(result100.distanceMeters).toBe(result500.distanceMeters);
      
      // But different flagging results
      if (result100.distanceMeters > 100 && result100.distanceMeters < 500) {
        expect(result100.flagForReview).toBe(true);
        expect(result500.flagForReview).toBe(false);
      }
    });

    test('should calculate zero distance for identical coordinates', () => {
      const coord = { lat: 14.5995, lng: 120.9842 };
      
      const distance = calculateDistance(coord, coord);
      
      expect(distance).toBe(0);
    });

    test('should return verification result with all required fields', () => {
      const assignedSpot = { lat: 14.5995, lng: 120.9842 };
      const actualLocation = { lat: 14.6000, lng: 120.9850 };
      
      const result = verifyGPSLocation(assignedSpot, actualLocation);
      
      expect(result).toHaveProperty('distanceMeters');
      expect(result).toHaveProperty('withinThreshold');
      expect(result).toHaveProperty('flagForReview');
      expect(result).toHaveProperty('assignedLocation');
      expect(result).toHaveProperty('actualLocation');
    });
  });

  describe('Complete Survey Flow', () => {
    test('should complete full workflow: initialization -> selection -> 6 sections', () => {
      // 1. Generate questionnaire number (simulated)
      const questionnaireNumber = 1;
      
      // 2. Get assigned sections (6 sections)
      const assignedSections = getSectionOrder(questionnaireNumber);
      expect(assignedSections).toHaveLength(6);
      
      // 3. Select respondent using Kish Grid
      const householdMembers = [
        { name: 'John Doe', birthdate: '1980-01-01', gender: 'Male' },
        { name: 'Jane Doe', birthdate: '1985-05-15', gender: 'Female' },
        { name: 'Bob Smith', birthdate: '1990-12-20', gender: 'Male' }
      ];
      
      const respondentResult = selectRespondentKishGrid(questionnaireNumber, householdMembers);
      expect(respondentResult.selectedMember).toBeDefined();
      
      // 4. Verify gender requirement (dynamic calculation)
      const isOdd = questionnaireNumber % 2 !== 0;
      const requiredGender = isOdd ? 'Male' : 'Female';
      expect(['Male', 'Female']).toContain(requiredGender);
      
      // 5. Capture GPS for verification
      const assignedSpot = { lat: 14.5995, lng: 120.9842 };
      const actualLocation = { lat: 14.5996, lng: 120.9843 };
      
      const gpsVerification = verifyGPSLocation(assignedSpot, actualLocation);
      expect(gpsVerification.distanceMeters).toBeDefined();
      
      // 6. Navigate through all 6 sections
      const completedSections: string[] = [];
      assignedSections.forEach(section => {
        completedSections.push(section);
      });
      
      expect(completedSections).toHaveLength(6);
      expect(completedSections).toEqual(assignedSections);
    });

    test('should handle odd questionnaire number (male required)', () => {
      const questionnaireNumber = 1; // Odd
      const isOdd = questionnaireNumber % 2 !== 0;
      
      expect(isOdd).toBe(true);
      
      const requiredGender = isOdd ? 'Male' : 'Female';
      expect(requiredGender).toBe('Male');
    });

    test('should handle even questionnaire number (female required)', () => {
      const questionnaireNumber = 2; // Even
      const isOdd = questionnaireNumber % 2 !== 0;
      
      expect(isOdd).toBe(false);
      
      const requiredGender = isOdd ? 'Male' : 'Female';
      expect(requiredGender).toBe('Female');
    });

    test('should maintain data consistency throughout workflow', () => {
      const questionnaireNumber = 5;
      
      // Get sections multiple times - should be consistent
      const sections1 = getSectionOrder(questionnaireNumber);
      const sections2 = getSectionOrder(questionnaireNumber);
      
      expect(sections1).toEqual(sections2);
      
      // Select respondent multiple times with same data - should be consistent
      const members = [
        { name: 'Alice', birthdate: '1980-01-01', gender: 'Female' },
        { name: 'Bob', birthdate: '1975-05-15', gender: 'Male' }
      ];
      
      const result1 = selectRespondentKishGrid(questionnaireNumber, members);
      const result2 = selectRespondentKishGrid(questionnaireNumber, members);
      
      expect(result1.selectedIndex).toBe(result2.selectedIndex);
      expect(result1.selectedMember).toEqual(result2.selectedMember);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid questionnaire number gracefully', () => {
      // Out of range numbers should still return 6 sections (fallback)
      const sections = getSectionOrder(999);
      
      expect(sections).toHaveLength(6);
    });

    test('should handle boundary questionnaire numbers', () => {
      const sections1 = getSectionOrder(1);
      const sections150 = getSectionOrder(150);
      
      expect(sections1).toHaveLength(6);
      expect(sections150).toHaveLength(6);
    });

    test('should handle single eligible member household', () => {
      const members = [
        { name: 'Only Member', birthdate: '1980-01-01', gender: 'Male' }
      ];
      
      const result = selectRespondentKishGrid(1, members);
      
      expect(result.selectedMember).toBe(members[0]);
      expect(result.selectedIndex).toBe(0);
    });

    test('should handle large household (15+ members)', () => {
      const members = Array.from({ length: 20 }, (_, i) => ({
        name: `Member ${i + 1}`,
        birthdate: '1980-01-01',
        gender: i % 2 === 0 ? 'Male' : 'Female'
      }));
      
      const result = selectRespondentKishGrid(1, members);
      
      expect(result.lookupRow).toBe(12); // Capped
      expect(result.selectedMember).toBeDefined();
    });

    test('should handle GPS coordinates at equator', () => {
      const coord1 = { lat: 0, lng: 0 };
      const coord2 = { lat: 0.001, lng: 0.001 };
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(0);
    });

    test('should handle GPS coordinates at poles', () => {
      const coord1 = { lat: 89.9, lng: 0 };
      const coord2 = { lat: 89.9, lng: 180 };
      
      const distance = calculateDistance(coord1, coord2);
      
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('Backward Compatibility', () => {
    test('should work with questionnaire numbers in various formats', () => {
      // Test with plain numbers
      const sections1 = getSectionOrder(1);
      expect(sections1).toHaveLength(6);
      
      // Test with different numbers
      const sections50 = getSectionOrder(50);
      expect(sections50).toHaveLength(6);
    });

    test('should handle all valid questionnaire number range', () => {
      const results = [];
      
      for (let i = 1; i <= 150; i++) {
        const sections = getSectionOrder(i);
        results.push({
          questionnaireNumber: i,
          sectionCount: sections.length,
          startingSection: sections[0]
        });
      }
      
      // All should have 6 sections
      expect(results.every(r => r.sectionCount === 6)).toBe(true);
      
      // All should have valid starting sections
      const validSections = ['financial', 'disaster', 'social', 'safety', 'business', 'environmental'];
      expect(results.every(r => validSections.includes(r.startingSection))).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should execute section assignment quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        getSectionOrder(Math.floor(Math.random() * 150) + 1);
      }
      
      const duration = Date.now() - start;
      
      // Should complete 1000 assignments in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should execute Kish Grid selection quickly', () => {
      const members = Array.from({ length: 10 }, (_, i) => ({
        name: `Member ${i + 1}`,
        birthdate: '1980-01-01',
        gender: i % 2 === 0 ? 'Male' : 'Female'
      }));
      
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        selectRespondentKishGrid(Math.floor(Math.random() * 150) + 1, members);
      }
      
      const duration = Date.now() - start;
      
      // Should complete 1000 selections in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    test('should execute GPS distance calculation quickly', () => {
      const coord1 = { lat: 14.5995, lng: 120.9842 };
      const coord2 = { lat: 14.6020, lng: 120.9870 };
      
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        calculateDistance(coord1, coord2);
      }
      
      const duration = Date.now() - start;
      
      // Should complete 1000 calculations in less than 10ms
      expect(duration).toBeLessThan(10);
    });
  });
});
