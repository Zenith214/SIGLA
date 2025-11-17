/**
 * Unit tests for Section Assignment Module
 * Tests CSIS Algorithm A implementation
 */

import {
  getSectionOrder,
  CSIS_RANDOMIZATION_MAP,
  CANONICAL_SECTION_ORDER
} from '../sectionAssignment';

describe('CSIS Section Randomization', () => {
  describe('getSectionOrder', () => {
    test('returns all 6 sections in correct order for questionnaire #1', () => {
      const sections = getSectionOrder(1);

      expect(sections).toHaveLength(6);
      expect(sections[0]).toBe('financial'); // Starting section per CSIS table
      expect(sections).toEqual([
        'financial',
        'disaster',
        'social',
        'safety',
        'business',
        'environmental'
      ]);
    });

    test('rotates sections correctly for questionnaire #2', () => {
      const sections = getSectionOrder(2);

      expect(sections).toHaveLength(6);
      expect(sections[0]).toBe('disaster'); // Starting section per CSIS table
      expect(sections).toEqual([
        'disaster',
        'social',
        'safety',
        'business',
        'environmental',
        'financial'
      ]);
    });

    test('rotates sections correctly for questionnaire #3', () => {
      const sections = getSectionOrder(3);

      expect(sections).toHaveLength(6);
      expect(sections[0]).toBe('social');
      expect(sections).toEqual([
        'social',
        'safety',
        'business',
        'environmental',
        'financial',
        'disaster'
      ]);
    });

    test('handles mid-range questionnaire #50', () => {
      const sections = getSectionOrder(50);

      expect(sections).toHaveLength(6);
      expect(sections[0]).toBe(CSIS_RANDOMIZATION_MAP[50]);
      // Verify all 6 sections are present
      expect(sections).toContain('financial');
      expect(sections).toContain('disaster');
      expect(sections).toContain('social');
      expect(sections).toContain('safety');
      expect(sections).toContain('business');
      expect(sections).toContain('environmental');
    });

    test('handles edge case questionnaire #150', () => {
      const sections = getSectionOrder(150);

      expect(sections).toHaveLength(6);
      expect(sections[0]).toBe('safety');
      expect(sections).toEqual([
        'safety',
        'business',
        'environmental',
        'financial',
        'disaster',
        'social'
      ]);
    });

    test('returns default order for invalid questionnaire number (0)', () => {
      const sections = getSectionOrder(0);

      expect(sections).toHaveLength(6);
      expect(sections).toEqual([...CANONICAL_SECTION_ORDER]);
    });

    test('returns default order for invalid questionnaire number (151)', () => {
      const sections = getSectionOrder(151);

      expect(sections).toHaveLength(6);
      expect(sections).toEqual([...CANONICAL_SECTION_ORDER]);
    });

    test('returns default order for negative questionnaire number', () => {
      const sections = getSectionOrder(-5);

      expect(sections).toHaveLength(6);
      expect(sections).toEqual([...CANONICAL_SECTION_ORDER]);
    });

    test('verifies rotation logic for all starting sections', () => {
      // Test each possible starting section
      const startingSections = ['financial', 'disaster', 'social', 'safety', 'business', 'environmental'];

      startingSections.forEach(startSection => {
        // Find a questionnaire number that starts with this section
        const qNum = Object.entries(CSIS_RANDOMIZATION_MAP).find(
          ([_, section]) => section === startSection
        )?.[0];

        if (qNum) {
          const sections = getSectionOrder(parseInt(qNum));
          expect(sections[0]).toBe(startSection);
          expect(sections).toHaveLength(6);
        }
      });
    });

    test('ensures no duplicate sections in output', () => {
      for (let i = 1; i <= 150; i++) {
        const sections = getSectionOrder(i);
        const uniqueSections = new Set(sections);
        expect(uniqueSections.size).toBe(6);
      }
    });

    test('ensures all sections are present for every questionnaire', () => {
      for (let i = 1; i <= 150; i++) {
        const sections = getSectionOrder(i);
        expect(sections).toContain('financial');
        expect(sections).toContain('disaster');
        expect(sections).toContain('social');
        expect(sections).toContain('safety');
        expect(sections).toContain('business');
        expect(sections).toContain('environmental');
      }
    });
  });

  describe('CSIS_RANDOMIZATION_MAP', () => {
    test('contains all 150 entries', () => {
      const keys = Object.keys(CSIS_RANDOMIZATION_MAP).map(Number);
      expect(keys).toHaveLength(150);

      // Verify sequential from 1 to 150
      for (let i = 1; i <= 150; i++) {
        expect(keys).toContain(i);
      }
    });

    test('all values are valid section IDs', () => {
      const validSections = ['financial', 'disaster', 'social', 'safety', 'business', 'environmental'];

      Object.values(CSIS_RANDOMIZATION_MAP).forEach(section => {
        expect(validSections).toContain(section);
      });
    });

    test('has balanced distribution of starting sections', () => {
      const distribution: Record<string, number> = {};

      Object.values(CSIS_RANDOMIZATION_MAP).forEach(section => {
        distribution[section] = (distribution[section] || 0) + 1;
      });

      // Each section should appear approximately 25 times (150 / 6 = 25)
      Object.values(distribution).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(20);
        expect(count).toBeLessThanOrEqual(30);
      });
    });

    test('specific known mappings are correct', () => {
      // Test a few specific mappings to ensure accuracy
      expect(CSIS_RANDOMIZATION_MAP[1]).toBe('financial');
      expect(CSIS_RANDOMIZATION_MAP[2]).toBe('disaster');
      expect(CSIS_RANDOMIZATION_MAP[3]).toBe('social');
      expect(CSIS_RANDOMIZATION_MAP[4]).toBe('safety');
      expect(CSIS_RANDOMIZATION_MAP[5]).toBe('business');
      expect(CSIS_RANDOMIZATION_MAP[6]).toBe('environmental');
      expect(CSIS_RANDOMIZATION_MAP[150]).toBe('safety');
    });
  });

  describe('CANONICAL_SECTION_ORDER', () => {
    test('contains all 6 sections in correct order', () => {
      expect(CANONICAL_SECTION_ORDER).toEqual([
        'financial',
        'disaster',
        'social',
        'safety',
        'business',
        'environmental'
      ]);
    });

    test('has length of 6', () => {
      expect(CANONICAL_SECTION_ORDER).toHaveLength(6);
    });
  });
});
