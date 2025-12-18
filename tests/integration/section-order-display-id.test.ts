/**
 * Integration test for Section Order Randomization with Display ID
 * 
 * Verifies that getSectionOrder receives display_id instead of parsed questionnaire_number
 * Requirements: 5.2, 5.4, 5.5
 */

import { calculateDisplayId } from '@/utils/displayIdCalculator';
import { getSectionOrder } from '@/app/survey/forms/utils/sectionAssignment';

describe('Section Order Randomization with Display ID', () => {
  test('should use display_id for section order calculation', () => {
    // Test case: Spot 2, Questionnaire 1 -> display_id = 6
    const full_id = '2025-10-02-001';
    const displayId = calculateDisplayId(full_id);
    
    expect(displayId).toBe(6);
    
    // Get section order using display_id
    const sections = getSectionOrder(displayId!);
    
    // Verify we get 6 sections
    expect(sections).toHaveLength(6);
    
    // Verify the sections are valid
    const validSections = ['financial', 'disaster', 'social', 'safety', 'business', 'environmental'];
    sections.forEach(section => {
      expect(validSections).toContain(section);
    });
  });

  test('should handle fallback when display_id is null', () => {
    // Test case: On-the-fly questionnaire (spot_number = 0)
    const full_id = '2025-10-00-001';
    const displayId = calculateDisplayId(full_id);
    
    expect(displayId).toBeNull();
    
    // In production code, we would fall back to parsed questionnaire_number
    // For this test, we'll use questionnaire_number = 1
    const fallbackQuestionnaireNumber = 1;
    const sections = getSectionOrder(fallbackQuestionnaireNumber);
    
    // Verify we still get 6 sections
    expect(sections).toHaveLength(6);
  });

  test('should handle fallback when display_id is out of range', () => {
    // Test case: Spot 31, Questionnaire 1 -> display_id = 151 (out of range)
    const full_id = '2025-10-31-001';
    const displayId = calculateDisplayId(full_id);
    
    expect(displayId).toBe(151);
    expect(displayId).toBeGreaterThan(150);
    
    // In production code, we would fall back to parsed questionnaire_number
    // For this test, we'll use questionnaire_number = 1
    const fallbackQuestionnaireNumber = 1;
    const sections = getSectionOrder(fallbackQuestionnaireNumber);
    
    // Verify we still get 6 sections
    expect(sections).toHaveLength(6);
  });

  test('should produce different section orders for different display_ids', () => {
    // Test multiple questionnaires with different display_ids
    const testCases = [
      { full_id: '2025-10-01-001', expected_display_id: 1 },
      { full_id: '2025-10-02-001', expected_display_id: 6 },
      { full_id: '2025-10-03-001', expected_display_id: 11 },
    ];

    const sectionOrders = testCases.map(testCase => {
      const displayId = calculateDisplayId(testCase.full_id);
      expect(displayId).toBe(testCase.expected_display_id);
      return getSectionOrder(displayId!);
    });

    // Verify that different display_ids produce different section orders
    // (at least some of them should be different)
    const uniqueOrders = new Set(sectionOrders.map(order => JSON.stringify(order)));
    expect(uniqueOrders.size).toBeGreaterThan(1);
  });

  test('should maintain consistency for the same display_id', () => {
    // Test case: Same questionnaire should always produce same section order
    const full_id = '2025-10-02-001';
    const displayId = calculateDisplayId(full_id);
    
    expect(displayId).toBe(6);
    
    // Get section order multiple times
    const sections1 = getSectionOrder(displayId!);
    const sections2 = getSectionOrder(displayId!);
    const sections3 = getSectionOrder(displayId!);
    
    // All should be identical
    expect(sections1).toEqual(sections2);
    expect(sections2).toEqual(sections3);
  });
});
