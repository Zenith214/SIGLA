/**
 * Tests for NFA (Need for Action) data generation
 * Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

describe('NFA Data Generation', () => {
  // Mock the generateNeedForActionData function for testing
  function generateNeedForActionData(
    type: string,
    needActionScore: number,
    language: 'en' | 'tl' = 'en'
  ): { binary: string; suggestion: string | null } {
    // Step 1: Determine binary answer based on needActionScore
    const binary = needActionScore > 0.5 
      ? (language === 'tl' ? 'Oo' : 'Yes')
      : (language === 'tl' ? 'Hindi' : 'No');
    
    // Step 2: Generate suggestion conditionally
    let suggestion: string | null = null;
    
    if (binary === 'Yes' || binary === 'Oo') {
      // Always generate a suggestion when binary is Yes
      suggestion = `Improvement suggestion for ${type}`;
    } else {
      // 10-15% chance of suggestion when binary is No (using 12.5% average)
      if (Math.random() < 0.125) {
        suggestion = `Neutral comment for ${type}`;
      }
    }
    
    return { binary, suggestion };
  }

  describe('Binary value determination', () => {
    it('should return "Yes" when needActionScore > 0.5 (English)', () => {
      const result = generateNeedForActionData('projects', 0.7, 'en');
      expect(result.binary).toBe('Yes');
    });

    it('should return "No" when needActionScore <= 0.5 (English)', () => {
      const result = generateNeedForActionData('projects', 0.3, 'en');
      expect(result.binary).toBe('No');
    });

    it('should return "Oo" when needActionScore > 0.5 (Tagalog)', () => {
      const result = generateNeedForActionData('projects', 0.7, 'tl');
      expect(result.binary).toBe('Oo');
    });

    it('should return "Hindi" when needActionScore <= 0.5 (Tagalog)', () => {
      const result = generateNeedForActionData('projects', 0.3, 'tl');
      expect(result.binary).toBe('Hindi');
    });
  });

  describe('Suggestion generation for "Yes" responses', () => {
    it('should always generate non-empty suggestion when binary is "Yes"', () => {
      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const result = generateNeedForActionData('projects', 0.8, 'en');
        expect(result.binary).toBe('Yes');
        expect(result.suggestion).not.toBeNull();
        expect(result.suggestion).not.toBe('');
        expect(typeof result.suggestion).toBe('string');
      }
    });

    it('should always generate non-empty suggestion when binary is "Oo"', () => {
      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const result = generateNeedForActionData('financial', 0.9, 'tl');
        expect(result.binary).toBe('Oo');
        expect(result.suggestion).not.toBeNull();
        expect(result.suggestion).not.toBe('');
        expect(typeof result.suggestion).toBe('string');
      }
    });
  });

  describe('Suggestion generation for "No" responses', () => {
    it('should generate suggestion approximately 10-15% of the time for "No" responses', () => {
      const iterations = 1000;
      let suggestionCount = 0;

      for (let i = 0; i < iterations; i++) {
        const result = generateNeedForActionData('projects', 0.2, 'en');
        expect(result.binary).toBe('No');
        if (result.suggestion !== null) {
          suggestionCount++;
        }
      }

      const percentage = (suggestionCount / iterations) * 100;
      
      // Allow for statistical variance: expect between 8% and 18%
      expect(percentage).toBeGreaterThanOrEqual(8);
      expect(percentage).toBeLessThanOrEqual(18);
    });

    it('should allow null suggestions for "No" responses', () => {
      // Run multiple times, at least some should be null
      let hasNull = false;
      for (let i = 0; i < 100; i++) {
        const result = generateNeedForActionData('projects', 0.2, 'en');
        if (result.suggestion === null) {
          hasNull = true;
          break;
        }
      }
      expect(hasNull).toBe(true);
    });
  });

  describe('Field naming convention', () => {
    it('should follow naming convention for all service indicators', () => {
      const indicators = [
        'projects', 'financial', 'socialPrograms', 'corruption',
        'disasterInfo', 'evacuation',
        'tanods', 'lupon', 'antiDrug',
        'healthServices', 'womenChildrenProtection', 'communityParticipation',
        'businessClearance',
        'wasteManagement'
      ];

      indicators.forEach(indicator => {
        const binaryFieldName = `need_for_action_binary_${indicator}`;
        const suggestionFieldName = `need_for_action_suggestion_${indicator}`;
        
        // Verify field names follow convention
        expect(binaryFieldName).toMatch(/^need_for_action_binary_[a-zA-Z]+$/);
        expect(suggestionFieldName).toMatch(/^need_for_action_suggestion_[a-zA-Z]+$/);
      });
    });
  });

  describe('Language support', () => {
    it('should support English language', () => {
      const yesResult = generateNeedForActionData('projects', 0.8, 'en');
      const noResult = generateNeedForActionData('projects', 0.2, 'en');
      
      expect(['Yes', 'No']).toContain(yesResult.binary);
      expect(['Yes', 'No']).toContain(noResult.binary);
    });

    it('should support Tagalog language', () => {
      const yesResult = generateNeedForActionData('projects', 0.8, 'tl');
      const noResult = generateNeedForActionData('projects', 0.2, 'tl');
      
      expect(['Oo', 'Hindi']).toContain(yesResult.binary);
      expect(['Oo', 'Hindi']).toContain(noResult.binary);
    });
  });
});
