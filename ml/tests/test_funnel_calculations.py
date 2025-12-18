#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Unit tests for funnel calculation methods in FeatureEngineer class.

Tests cover:
- Basic three-stage funnel calculation
- Zero awareness edge case
- Zero availment edge case
- Missing questions edge case
- Subset validation (availed ⊆ aware ⊆ all)
- Satisfaction exclusion of non-availed respondents
"""

import unittest
import sys
import os

# Add parent directory to path to import sigla_ml
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sigla_ml.feature_engineering import FeatureEngineer


class TestFunnelCalculations(unittest.TestCase):
    """Test cases for cascading funnel calculations."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.engineer = FeatureEngineer()
    
    def test_basic_three_stage_funnel(self):
        """Test basic three-stage funnel calculation with known input/output.
        
        Scenario: 50 respondents, 45 aware (90%), 30 availed (66.7% of aware), 25 satisfied (83.3% of availed)
        """
        responses = []
        
        # Create 50 respondents
        for i in range(1, 51):
            respondent_id = i
            
            # 45 respondents are aware (respondents 1-45)
            if i <= 45:
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Are you aware of financial services?',
                    'answer': 'Yes'
                })
                
                # 30 of the aware respondents availed (respondents 1-30)
                if i <= 30:
                    responses.append({
                        'respondent_id': respondent_id,
                        'question_text': 'Have you availed financial services?',
                        'answer': 'Yes'
                    })
                    
                    # 25 of the availed respondents are satisfied (respondents 1-25)
                    if i <= 25:
                        responses.append({
                            'respondent_id': respondent_id,
                            'question_text': 'How satisfied are you with the service quality?',
                            'answer': '5'  # Highly satisfied
                        })
                    else:
                        # Respondents 26-30 are not satisfied
                        responses.append({
                            'respondent_id': respondent_id,
                            'question_text': 'How satisfied are you with the service quality?',
                            'answer': '2'  # Not satisfied
                        })
                else:
                    # Respondents 31-45 did not avail
                    responses.append({
                        'respondent_id': respondent_id,
                        'question_text': 'Have you availed financial services?',
                        'answer': 'No'
                    })
            else:
                # Respondents 46-50 are not aware
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Are you aware of financial services?',
                    'answer': 'No'
                })
        
        # Calculate funnel metrics
        result = self.engineer._calculate_funnel_metrics(responses, 'financial')
        
        # Verify awareness stage
        self.assertEqual(result['awareness']['count'], 45)
        self.assertEqual(result['awareness']['total'], 50)
        self.assertEqual(result['awareness']['percentage'], 90.0)
        
        # Verify availment stage (30 out of 45 aware = 66.7%)
        self.assertEqual(result['availment']['count'], 30)
        self.assertEqual(result['availment']['total'], 45)
        self.assertAlmostEqual(result['availment']['percentage'], 66.7, places=1)
        
        # Verify satisfaction stage (25 satisfied out of 30 availed = 83.3%)
        self.assertEqual(result['satisfaction']['count'], 25)
        self.assertEqual(result['satisfaction']['total'], 30)
        # Satisfaction percentage is calculated from average rating converted to percentage
        self.assertIsNotNone(result['satisfaction']['percentage'])
    
    def test_zero_awareness_edge_case(self):
        """Test edge case where no respondents are aware.
        
        Expected: Awareness 0%, Availment null, Satisfaction null
        """
        responses = []
        
        # Create 50 respondents, none aware
        for i in range(1, 51):
            responses.append({
                'respondent_id': i,
                'question_text': 'Are you aware of financial services?',
                'answer': 'No'
            })
        
        result = self.engineer._calculate_funnel_metrics(responses, 'financial')
        
        # Verify awareness is 0%
        self.assertEqual(result['awareness']['count'], 0)
        self.assertEqual(result['awareness']['total'], 50)
        self.assertEqual(result['awareness']['percentage'], 0.0)
        
        # Verify availment is null (cannot calculate with 0 aware)
        self.assertEqual(result['availment']['count'], 0)
        self.assertEqual(result['availment']['total'], 0)
        self.assertIsNone(result['availment']['percentage'])
        
        # Verify satisfaction is null
        self.assertEqual(result['satisfaction']['count'], 0)
        self.assertEqual(result['satisfaction']['total'], 0)
        self.assertIsNone(result['satisfaction']['percentage'])
    
    def test_zero_availment_edge_case(self):
        """Test edge case where respondents are aware but none availed.
        
        Expected: Awareness 90%, Availment 0%, Satisfaction null
        """
        responses = []
        
        # Create 50 respondents, 45 aware, 0 availed
        for i in range(1, 51):
            respondent_id = i
            
            # 45 respondents are aware
            if i <= 45:
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Are you aware of financial services?',
                    'answer': 'Yes'
                })
                # All aware respondents did not avail
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Have you availed financial services?',
                    'answer': 'No'
                })
            else:
                # 5 respondents are not aware
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Are you aware of financial services?',
                    'answer': 'No'
                })
        
        result = self.engineer._calculate_funnel_metrics(responses, 'financial')
        
        # Verify awareness
        self.assertEqual(result['awareness']['count'], 45)
        self.assertEqual(result['awareness']['total'], 50)
        self.assertEqual(result['awareness']['percentage'], 90.0)
        
        # Verify availment is 0%
        self.assertEqual(result['availment']['count'], 0)
        self.assertEqual(result['availment']['total'], 45)
        self.assertEqual(result['availment']['percentage'], 0.0)
        
        # Verify satisfaction is null (cannot calculate with 0 availed)
        self.assertEqual(result['satisfaction']['count'], 0)
        self.assertEqual(result['satisfaction']['total'], 0)
        self.assertIsNone(result['satisfaction']['percentage'])
    
    def test_missing_questions_edge_case(self):
        """Test edge case where awareness questions are missing.
        
        Expected: All stages return null or 0
        """
        responses = []
        
        # Create responses without awareness questions
        for i in range(1, 51):
            # Only satisfaction questions, no awareness or availment
            responses.append({
                'respondent_id': i,
                'question_text': 'How satisfied are you with the service quality?',
                'answer': '4'
            })
        
        result = self.engineer._calculate_funnel_metrics(responses, 'financial')
        
        # Verify awareness is 0 (no awareness questions answered positively)
        self.assertEqual(result['awareness']['count'], 0)
        self.assertEqual(result['awareness']['total'], 50)
        self.assertEqual(result['awareness']['percentage'], 0.0)
        
        # Verify availment is null
        self.assertEqual(result['availment']['count'], 0)
        self.assertIsNone(result['availment']['percentage'])
        
        # Verify satisfaction is null
        self.assertEqual(result['satisfaction']['count'], 0)
        self.assertIsNone(result['satisfaction']['percentage'])
    
    def test_subset_validation(self):
        """Test that availed_ids ⊆ aware_ids ⊆ all_respondent_ids.
        
        This validates the cascading funnel logic.
        """
        responses = []
        
        # Create 30 respondents with proper funnel progression
        for i in range(1, 31):
            respondent_id = i
            
            # 20 respondents are aware
            if i <= 20:
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Are you aware of disaster response services?',
                    'answer': 'Yes'
                })
                
                # 10 of the aware respondents availed
                if i <= 10:
                    responses.append({
                        'respondent_id': respondent_id,
                        'question_text': 'Have you availed disaster response services?',
                        'answer': 'Yes'
                    })
            else:
                # 10 respondents are not aware
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Are you aware of disaster response services?',
                    'answer': 'No'
                })
        
        # Get the sets directly from helper methods
        all_respondent_ids = set(r['respondent_id'] for r in responses)
        aware_ids = self.engineer._identify_aware_respondents(responses, 'disaster')
        availed_ids = self.engineer._identify_availed_respondents(responses, 'disaster', aware_ids)
        
        # Verify subset relationships
        self.assertTrue(availed_ids.issubset(aware_ids), 
                       "Availed respondents must be a subset of aware respondents")
        self.assertTrue(aware_ids.issubset(all_respondent_ids),
                       "Aware respondents must be a subset of all respondents")
        
        # Verify counts
        self.assertEqual(len(all_respondent_ids), 30)
        self.assertEqual(len(aware_ids), 20)
        self.assertEqual(len(availed_ids), 10)
    
    def test_satisfaction_excludes_non_availed(self):
        """Test that satisfaction calculations exclude non-availed respondents.
        
        Scenario: Some aware respondents did not avail. Their satisfaction responses
        should not be included in the calculation.
        """
        responses = []
        
        # Create 20 respondents
        for i in range(1, 21):
            respondent_id = i
            
            # All 20 are aware
            responses.append({
                'respondent_id': respondent_id,
                'question_text': 'Are you aware of safety services?',
                'answer': 'Yes'
            })
            
            # Only 10 availed (respondents 1-10)
            if i <= 10:
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Have you availed safety services?',
                    'answer': 'Yes'
                })
                # These 10 give satisfaction ratings
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'How satisfied are you with safety services?',
                    'answer': '5'
                })
            else:
                # Respondents 11-20 did not avail
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'Have you availed safety services?',
                    'answer': 'No'
                })
                # But they still answered satisfaction questions (should be excluded)
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': 'How satisfied are you with safety services?',
                    'answer': '1'  # Low rating that should be ignored
                })
        
        # Get availed IDs
        aware_ids = self.engineer._identify_aware_respondents(responses, 'safety')
        availed_ids = self.engineer._identify_availed_respondents(responses, 'safety', aware_ids)
        
        # Calculate satisfaction
        satisfaction = self.engineer._calculate_satisfaction_from_availed(responses, 'safety', availed_ids)
        
        # Verify only 10 respondents are included in satisfaction calculation
        self.assertEqual(satisfaction['total'], 10, 
                        "Satisfaction should only include availed respondents")
        
        # Verify the satisfaction count reflects only availed respondents
        # All 10 availed respondents gave rating of 5 (satisfied)
        self.assertEqual(satisfaction['count'], 10)
        
        # Verify high satisfaction percentage (should be 100% since all availed gave 5/5)
        self.assertIsNotNone(satisfaction['percentage'])
        self.assertEqual(satisfaction['percentage'], 100.0)
    
    def test_answer_variations(self):
        """Test that different answer formats are recognized correctly.
        
        Tests: 'Yes', 'yes', 'Oo', 'oo', 'Oo (Yes)', 1, True, '1'
        """
        answer_variations = ['Yes', 'yes', 'Oo', 'oo', 'Oo (Yes)', 1, True, '1']
        
        for idx, answer in enumerate(answer_variations):
            responses = [{
                'respondent_id': idx + 1,
                'question_text': 'Are you aware of social services?',
                'answer': answer
            }]
            
            aware_ids = self.engineer._identify_aware_respondents(responses, 'social')
            
            self.assertEqual(len(aware_ids), 1, 
                           f"Answer '{answer}' should be recognized as positive")
            self.assertIn(idx + 1, aware_ids)
    
    def test_empty_responses(self):
        """Test handling of empty response list."""
        responses = []
        
        result = self.engineer._calculate_funnel_metrics(responses, 'financial')
        
        # Should handle gracefully with 0 respondents
        self.assertEqual(result['awareness']['count'], 0)
        self.assertEqual(result['awareness']['total'], 0)
        self.assertIsNone(result['awareness']['percentage'])


if __name__ == '__main__':
    unittest.main()
