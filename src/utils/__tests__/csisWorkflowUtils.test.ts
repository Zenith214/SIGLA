/**
 * Unit tests for CSIS Workflow Utility Functions
 * Tests questionnaire ID generation, Kish Grid algorithm,
 * service area randomization, and skip pattern logic
 */

import {
  generateQuestionnaireId,
  selectRespondentKishGrid,
  getServiceAreaOrder,
  shouldShowQuestion,
  filterQuestionsBySkipPattern,
  HouseholdMember,
  Question,
} from '../csisWorkflowUtils';

describe('generateQuestionnaireId', () => {
  it('should generate correct questionnaire ID format', () => {
    const result = generateQuestionnaireId(2024, 1, 1);
    expect(result).toBe('2024-001-001');
  });

  it('should pad spot number with leading zeros', () => {
    expect(generateQuestionnaireId(2024, 1, 1)).toBe('2024-001-001');
    expect(generateQuestionnaireId(2024, 15, 3)).toBe('2024-015-003');
    expect(generateQuestionnaireId(2024, 999, 5)).toBe('2024-999-005');
  });

  it('should handle all valid sequence numbers (1-5)', () => {
    expect(generateQuestionnaireId(2024, 1, 1)).toBe('2024-001-001');
    expect(generateQuestionnaireId(2024, 1, 2)).toBe('2024-001-002');
    expect(generateQuestionnaireId(2024, 1, 3)).toBe('2024-001-003');
    expect(generateQuestionnaireId(2024, 1, 4)).toBe('2024-001-004');
    expect(generateQuestionnaireId(2024, 1, 5)).toBe('2024-001-005');
  });

  it('should throw error for invalid year', () => {
    expect(() => generateQuestionnaireId(1999, 1, 1)).toThrow('Year must be an integer between 2000 and 2100');
    expect(() => generateQuestionnaireId(2101, 1, 1)).toThrow('Year must be an integer between 2000 and 2100');
    expect(() => generateQuestionnaireId(2024.5, 1, 1)).toThrow('Year must be an integer between 2000 and 2100');
  });

  it('should throw error for invalid spot number', () => {
    expect(() => generateQuestionnaireId(2024, 0, 1)).toThrow('Spot number must be an integer between 1 and 999');
    expect(() => generateQuestionnaireId(2024, 1000, 1)).toThrow('Spot number must be an integer between 1 and 999');
    expect(() => generateQuestionnaireId(2024, 1.5, 1)).toThrow('Spot number must be an integer between 1 and 999');
  });

  it('should throw error for invalid sequence', () => {
    expect(() => generateQuestionnaireId(2024, 1, 0)).toThrow('Sequence must be an integer between 1 and 5');
    expect(() => generateQuestionnaireId(2024, 1, 6)).toThrow('Sequence must be an integer between 1 and 5');
    expect(() => generateQuestionnaireId(2024, 1, 2.5)).toThrow('Sequence must be an integer between 1 and 5');
  });
});

describe('selectRespondentKishGrid', () => {
  const createMember = (name: string, age: number, gender: 'Male' | 'Female'): HouseholdMember => ({
    name,
    age,
    gender,
  });

  describe('basic functionality', () => {
    it('should select the only member in a single-member household', () => {
      const members = [createMember('John', 45, 'Male')];
      const selected = selectRespondentKishGrid(members, '2024-001-001');
      expect(selected.name).toBe('John');
    });

    it('should select from two-member household based on last digit', () => {
      const members = [
        createMember('John', 45, 'Male'),
        createMember('Jane', 42, 'Female'),
      ];
      
      // Last digit 0 (even) -> index 0
      expect(selectRespondentKishGrid(members, '2024-001-000').name).toBe('John');
      
      // Last digit 1 (odd) -> index 1
      expect(selectRespondentKishGrid(members, '2024-001-001').name).toBe('Jane');
    });

    it('should select from three-member household using Kish Grid', () => {
      const members = [
        createMember('John', 45, 'Male'),
        createMember('Jane', 42, 'Female'),
        createMember('Jack', 20, 'Male'),
      ];
      
      // Test different last digits
      expect(selectRespondentKishGrid(members, '2024-001-000').name).toBe('John'); // 0 -> index 0
      expect(selectRespondentKishGrid(members, '2024-001-001').name).toBe('Jane'); // 1 -> index 1
      expect(selectRespondentKishGrid(members, '2024-001-002').name).toBe('Jack'); // 2 -> index 2
      expect(selectRespondentKishGrid(members, '2024-001-003').name).toBe('John'); // 3 -> index 0
    });

    it('should handle households with 6+ members', () => {
      const members = [
        createMember('Member1', 50, 'Male'),
        createMember('Member2', 48, 'Female'),
        createMember('Member3', 25, 'Male'),
        createMember('Member4', 23, 'Female'),
        createMember('Member5', 21, 'Male'),
        createMember('Member6', 19, 'Female'),
        createMember('Member7', 18, 'Male'),
      ];
      
      // Should still work with 7 members (treated as 6+ category)
      const selected = selectRespondentKishGrid(members, '2024-001-005');
      expect(members).toContain(selected);
    });
  });

  describe('age filtering', () => {
    it('should only select from members aged 18 or older', () => {
      const members = [
        createMember('Child', 10, 'Male'),
        createMember('Teen', 17, 'Female'),
        createMember('Adult', 25, 'Male'),
      ];
      
      const selected = selectRespondentKishGrid(members, '2024-001-001');
      expect(selected.name).toBe('Adult');
      expect(selected.age).toBeGreaterThanOrEqual(18);
    });

    it('should throw error if no members are 18 or older', () => {
      const members = [
        createMember('Child1', 10, 'Male'),
        createMember('Child2', 15, 'Female'),
      ];
      
      expect(() => selectRespondentKishGrid(members, '2024-001-001'))
        .toThrow('Household must have at least one member aged 18 or older');
    });
  });

  describe('error handling', () => {
    it('should throw error for empty household', () => {
      expect(() => selectRespondentKishGrid([], '2024-001-001'))
        .toThrow('Household must have at least one member');
    });

    it('should throw error for invalid questionnaire ID', () => {
      const members = [createMember('John', 45, 'Male')];
      expect(() => selectRespondentKishGrid(members, '2024-001-ABC'))
        .toThrow('Questionnaire ID must end with a numeric digit');
    });
  });

  describe('Kish Grid consistency', () => {
    it('should always select the same member for the same questionnaire ID', () => {
      const members = [
        createMember('John', 45, 'Male'),
        createMember('Jane', 42, 'Female'),
        createMember('Jack', 20, 'Male'),
      ];
      
      const questionnaireId = '2024-001-003';
      const selected1 = selectRespondentKishGrid(members, questionnaireId);
      const selected2 = selectRespondentKishGrid(members, questionnaireId);
      
      expect(selected1).toEqual(selected2);
    });
  });
});

describe('getServiceAreaOrder', () => {
  describe('odd last digit', () => {
    it('should return financial, safety, environmental for odd last digits', () => {
      const oddIds = ['2024-001-001', '2024-001-003', '2024-001-005'];
      
      oddIds.forEach(id => {
        const order = getServiceAreaOrder(id);
        expect(order).toEqual(['financialAdmin', 'safetyPeace', 'environmental']);
      });
    });
  });

  describe('even last digit', () => {
    it('should return disaster, social, business for even last digits', () => {
      const evenIds = ['2024-001-000', '2024-001-002', '2024-001-004'];
      
      evenIds.forEach(id => {
        const order = getServiceAreaOrder(id);
        expect(order).toEqual(['disasterPrep', 'socialProtection', 'businessFriendly']);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle questionnaire IDs ending in 0', () => {
      const order = getServiceAreaOrder('2024-010-000');
      expect(order).toEqual(['disasterPrep', 'socialProtection', 'businessFriendly']);
    });

    it('should handle questionnaire IDs ending in 9', () => {
      const order = getServiceAreaOrder('2024-999-009');
      expect(order).toEqual(['financialAdmin', 'safetyPeace', 'environmental']);
    });

    it('should throw error for non-numeric last character', () => {
      expect(() => getServiceAreaOrder('2024-001-ABC'))
        .toThrow('Questionnaire ID must end with a numeric digit');
    });
  });

  describe('consistency', () => {
    it('should return the same order for the same questionnaire ID', () => {
      const id = '2024-001-003';
      const order1 = getServiceAreaOrder(id);
      const order2 = getServiceAreaOrder(id);
      
      expect(order1).toEqual(order2);
    });
  });
});

describe('shouldShowQuestion', () => {
  describe('questions without dependencies', () => {
    it('should always show questions without dependsOn', () => {
      const question: Question = { id: 'q1' };
      const answers = {};
      
      expect(shouldShowQuestion(question, answers)).toBe(true);
    });
  });

  describe('questions with dependencies', () => {
    it('should show question when dependency is met', () => {
      const question: Question = {
        id: 'q2',
        dependsOn: 'q1',
        dependsOnValue: 'Yes',
      };
      const answers = { q1: 'Yes' };
      
      expect(shouldShowQuestion(question, answers)).toBe(true);
    });

    it('should hide question when dependency is not met', () => {
      const question: Question = {
        id: 'q2',
        dependsOn: 'q1',
        dependsOnValue: 'Yes',
      };
      const answers = { q1: 'No' };
      
      expect(shouldShowQuestion(question, answers)).toBe(false);
    });

    it('should hide question when dependent answer is undefined', () => {
      const question: Question = {
        id: 'q2',
        dependsOn: 'q1',
        dependsOnValue: 'Yes',
      };
      const answers = {};
      
      expect(shouldShowQuestion(question, answers)).toBe(false);
    });

    it('should hide question when dependent answer is null', () => {
      const question: Question = {
        id: 'q2',
        dependsOn: 'q1',
        dependsOnValue: 'Yes',
      };
      const answers = { q1: null };
      
      expect(shouldShowQuestion(question, answers)).toBe(false);
    });
  });

  describe('questions with multiple valid values', () => {
    it('should show question when answer matches any value in array', () => {
      const question: Question = {
        id: 'q2',
        dependsOn: 'q1',
        dependsOnValue: ['Yes', 'Maybe'],
      };
      
      expect(shouldShowQuestion(question, { q1: 'Yes' })).toBe(true);
      expect(shouldShowQuestion(question, { q1: 'Maybe' })).toBe(true);
      expect(shouldShowQuestion(question, { q1: 'No' })).toBe(false);
    });
  });
});

describe('filterQuestionsBySkipPattern', () => {
  it('should return all questions without dependencies', () => {
    const questions: Question[] = [
      { id: 'q1' },
      { id: 'q2' },
      { id: 'q3' },
    ];
    const answers = {};
    
    const filtered = filterQuestionsBySkipPattern(questions, answers);
    expect(filtered).toHaveLength(3);
    expect(filtered).toEqual(questions);
  });

  it('should filter out questions with unmet dependencies', () => {
    const questions: Question[] = [
      { id: 'q1' },
      { id: 'q2', dependsOn: 'q1', dependsOnValue: 'Yes' },
      { id: 'q3', dependsOn: 'q1', dependsOnValue: 'No' },
    ];
    const answers = { q1: 'Yes' };
    
    const filtered = filterQuestionsBySkipPattern(questions, answers);
    expect(filtered).toHaveLength(2);
    expect(filtered.map(q => q.id)).toEqual(['q1', 'q2']);
  });

  it('should handle complex skip patterns', () => {
    const questions: Question[] = [
      { id: 'q1' },
      { id: 'q2', dependsOn: 'q1', dependsOnValue: 'Yes' },
      { id: 'q3', dependsOn: 'q2', dependsOnValue: 'Agree' },
      { id: 'q4', dependsOn: 'q1', dependsOnValue: 'No' },
    ];
    
    // When q1 = Yes and q2 = Agree
    const answers1 = { q1: 'Yes', q2: 'Agree' };
    const filtered1 = filterQuestionsBySkipPattern(questions, answers1);
    expect(filtered1.map(q => q.id)).toEqual(['q1', 'q2', 'q3']);
    
    // When q1 = No
    const answers2 = { q1: 'No' };
    const filtered2 = filterQuestionsBySkipPattern(questions, answers2);
    expect(filtered2.map(q => q.id)).toEqual(['q1', 'q4']);
  });

  it('should return empty array for empty questions array', () => {
    const filtered = filterQuestionsBySkipPattern([], {});
    expect(filtered).toEqual([]);
  });
});
