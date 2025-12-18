/**
 * Unit tests for Kish Grid Selection Module
 * Tests CSIS Algorithm B implementation
 */

import {
  selectRespondentKishGrid,
  getKishGridValue,
  getRequiredGender,
  KISH_GRID_TABLE,
  HouseholdMember
} from '../kishGrid';

describe('Kish Grid Selection', () => {
  // Helper function to create test household members
  const createMembers = (count: number): HouseholdMember[] => {
    return Array.from({ length: count }, (_, i) => ({
      name: `Member ${i + 1}`,
      birthdate: '1980-01-01',
      gender: i % 2 === 0 ? 'Male' : 'Female',
      age: 35
    }));
  };

  describe('selectRespondentKishGrid', () => {
    test('selects correct respondent for questionnaire #1 with 3 members', () => {
      const members: HouseholdMember[] = [
        { name: 'Alice', birthdate: '1980-01-01', gender: 'Female', age: 44 },
        { name: 'Bob', birthdate: '1975-05-15', gender: 'Male', age: 49 },
        { name: 'Charlie', birthdate: '1990-12-20', gender: 'Male', age: 34 }
      ];

      const result = selectRespondentKishGrid(1, members);

      expect(result.lookupColumn).toBe(1);
      expect(result.lookupRow).toBe(3);
      expect(result.gridValue).toBe(1);
      expect(result.selectedIndex).toBe(0);
      expect(result.selectedMember.name).toBe('Alice');
    });

    test('selects correct respondent for questionnaire #10 with 5 members', () => {
      const members = createMembers(5);

      const result = selectRespondentKishGrid(10, members);

      // Questionnaire 10: column = 10 (10 % 10 = 0 → 10)
      // 5 members: row = 5
      // KISH_GRID_TABLE[4][9] = 5
      expect(result.lookupColumn).toBe(10);
      expect(result.lookupRow).toBe(5);
      expect(result.gridValue).toBe(5);
      expect(result.selectedIndex).toBe(4);
    });

    test('handles 12+ members by capping at row 12', () => {
      const members = createMembers(15);

      const result = selectRespondentKishGrid(10, members);

      expect(result.lookupRow).toBe(12); // Capped at 12
      expect(result.lookupColumn).toBe(10);
      // KISH_GRID_TABLE[11][9] = 9
      expect(result.gridValue).toBe(9);
      expect(result.selectedIndex).toBe(8);
    });

    test('handles single member household', () => {
      const members = createMembers(1);

      const result = selectRespondentKishGrid(5, members);

      expect(result.lookupRow).toBe(1);
      expect(result.lookupColumn).toBe(5);
      expect(result.gridValue).toBe(1);
      expect(result.selectedIndex).toBe(0);
    });

    test('throws error for empty member list', () => {
      expect(() => {
        selectRespondentKishGrid(1, []);
      }).toThrow('NO_QUALIFIED_RESPONDENT');
    });

    test('throws error for invalid questionnaire number', () => {
      const members = createMembers(3);

      expect(() => {
        selectRespondentKishGrid(0, members);
      }).toThrow('INVALID_QUESTIONNAIRE_NUMBER');

      expect(() => {
        selectRespondentKishGrid(-5, members);
      }).toThrow('INVALID_QUESTIONNAIRE_NUMBER');
    });

    test('handles questionnaire numbers ending in 0 (column = 10)', () => {
      const members = createMembers(4);

      const result = selectRespondentKishGrid(20, members);

      expect(result.lookupColumn).toBe(10); // 20 % 10 = 0 → 10
      expect(result.lookupRow).toBe(4);
    });

    test('verifies grid values for various household sizes', () => {
      // Test a few specific cases from the Kish Grid
      const testCases = [
        { qNum: 1, members: 2, expectedValue: 1 },
        { qNum: 2, members: 2, expectedValue: 2 },
        { qNum: 3, members: 3, expectedValue: 3 },
        { qNum: 5, members: 5, expectedValue: 5 },
        { qNum: 7, members: 7, expectedValue: 7 },
      ];

      testCases.forEach(({ qNum, members: memberCount, expectedValue }) => {
        const members = createMembers(memberCount);
        const result = selectRespondentKishGrid(qNum, members);
        expect(result.gridValue).toBe(expectedValue);
      });
    });
  });

  describe('getKishGridValue', () => {
    test('returns correct value for valid coordinates', () => {
      expect(getKishGridValue(1, 1)).toBe(1);
      expect(getKishGridValue(3, 3)).toBe(3);
      expect(getKishGridValue(12, 10)).toBe(9);
    });

    test('returns null for invalid row', () => {
      expect(getKishGridValue(0, 5)).toBeNull();
      expect(getKishGridValue(13, 5)).toBeNull();
      expect(getKishGridValue(-1, 5)).toBeNull();
    });

    test('returns null for invalid column', () => {
      expect(getKishGridValue(5, 0)).toBeNull();
      expect(getKishGridValue(5, 11)).toBeNull();
      expect(getKishGridValue(5, -1)).toBeNull();
    });
  });

  describe('getRequiredGender', () => {
    test('returns Male for odd questionnaire numbers', () => {
      expect(getRequiredGender(1)).toBe('Male');
      expect(getRequiredGender(3)).toBe('Male');
      expect(getRequiredGender(99)).toBe('Male');
      expect(getRequiredGender(149)).toBe('Male');
    });

    test('returns Female for even questionnaire numbers', () => {
      expect(getRequiredGender(2)).toBe('Female');
      expect(getRequiredGender(4)).toBe('Female');
      expect(getRequiredGender(100)).toBe('Female');
      expect(getRequiredGender(150)).toBe('Female');
    });
  });

  describe('KISH_GRID_TABLE structure', () => {
    test('has correct dimensions (12 rows × 10 columns)', () => {
      expect(KISH_GRID_TABLE).toHaveLength(12);
      KISH_GRID_TABLE.forEach(row => {
        expect(row).toHaveLength(10);
      });
    });

    test('all values are within valid range', () => {
      KISH_GRID_TABLE.forEach((row, rowIndex) => {
        row.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(12);
        });
      });
    });

    test('first row contains all 1s (single member household)', () => {
      expect(KISH_GRID_TABLE[0]).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    });

    test('last row has specific pattern for 12+ members', () => {
      expect(KISH_GRID_TABLE[11]).toEqual([1, 3, 7, 5, 6, 4, 8, 10, 12, 9]);
    });
  });
});
