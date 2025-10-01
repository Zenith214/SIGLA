#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
from math import sqrt

class FeatureEngineer:
    """Class for engineering features from survey data for machine learning."""
    
    def __init__(self):
        """Initialize the FeatureEngineer."""
        # Define service sections - updated to match actual survey sections
        self.service_sections = [
            'financial', 'disaster', 'safety', 'social',
            'business', 'environmental'
        ]
        
        # Define confidence level thresholds
        self.confidence_thresholds = {
            'high': 95,  # 95% confidence
            'medium': 85,  # 85% confidence
            'low': 70    # 70% confidence
        }
    
    def calculate_service_scores(self, survey_data):
        """Calculate service scores from survey responses.
        
        Args:
            survey_data (pd.DataFrame): DataFrame containing processed survey responses.
        
        Returns:
            dict: Dictionary containing service scores for each section.
        """
        if survey_data.empty:
            return {}
        
        # Group by section_key (more reliable than section_name)
        grouped = survey_data.groupby('section_key')
        
        service_scores = {}
        
        for section_key, group in grouped:
            # Count responses
            total_responses = len(group)
            
            # Calculate awareness score (Yes/No questions)
            awareness_questions = [col for col in group.columns if 'aware' in col.lower() and col != 'section_key']
            awareness_score = self._calculate_binary_score(group, awareness_questions, 'Yes')
            
            # Calculate availment score (Yes/No questions)
            availment_questions = [col for col in group.columns if 'avail' in col.lower() and col != 'section_key']
            availment_score = self._calculate_binary_score(group, availment_questions, 'Yes')
            
            # Calculate satisfaction score (1-5 scale, convert to percentage)
            satisfaction_questions = [col for col in group.columns if 'satisf' in col.lower() and col != 'section_key']
            satisfaction_score = self._calculate_satisfaction_score(group, satisfaction_questions)
            
            # Calculate need action score (look for suggestions/comments as proxy)
            suggestion_questions = [col for col in group.columns if 'suggest' in col.lower() or 'comment' in col.lower()]
            need_action_score = self._calculate_need_action_score(group, suggestion_questions)
            
            # Calculate confidence level
            confidence = self._calculate_confidence(total_responses)
            
            # Store scores
            service_scores[section_key] = {
                'awareness_score': awareness_score,
                'availment_score': availment_score,
                'satisfaction_score': satisfaction_score,
                'need_action_score': need_action_score,
                'sample_size': total_responses,
                'confidence': confidence
            }
        
        return service_scores
    
    def _calculate_binary_score(self, group, questions, positive_value):
        """Calculate score for binary Yes/No questions - matches dashboard calculation."""
        if not questions:
            return 0
        
        total_positive = 0
        total_questions = 0
        
        for question in questions:
            if question in group.columns:
                for _, value in group[question].items():
                    if pd.notna(value):
                        total_questions += 1
                        # Match dashboard logic: treat "Yes", 1, true, "1" as positive
                        if (value == positive_value or value == 1 or value == True or value == '1'):
                            total_positive += 1
        
        return round((total_positive / total_questions) * 100) if total_questions > 0 else 0
    
    def _calculate_satisfaction_score(self, group, questions):
        """Calculate satisfaction score from 1-5 scale questions - matches dashboard calculation."""
        if not questions:
            return 0
        
        satisfaction_sum = 0
        total_satisfaction_questions = 0
        
        for question in questions:
            if question in group.columns:
                for _, value in group[question].items():
                    if pd.notna(value):
                        total_satisfaction_questions += 1
                        # Convert to numeric like dashboard does
                        num_value = int(value) if isinstance(value, str) and value.isdigit() else value
                        if isinstance(num_value, (int, float)) and 1 <= num_value <= 5:
                            satisfaction_sum += num_value
        
        # Match dashboard calculation exactly: ((sum / total_questions) / 5) * 100
        return round(((satisfaction_sum / total_satisfaction_questions) / 5) * 100) if total_satisfaction_questions > 0 else 0
    
    def _calculate_need_action_score(self, group, suggestion_questions):
        """Calculate need for action score based on suggestions/comments."""
        if not suggestion_questions:
            return 50  # Default moderate need if no suggestion data
        
        total_suggestions = 0
        total_responses = 0
        
        for question in suggestion_questions:
            if question in group.columns:
                # Count non-empty suggestions as indication of need for action
                non_empty = group[question].notna() & (group[question] != '') & (group[question] != 'nan')
                total_suggestions += non_empty.sum()
                total_responses += len(group)
        
        # Higher percentage of suggestions = higher need for action
        if total_responses > 0:
            suggestion_rate = (total_suggestions / total_responses) * 100
            # Scale suggestion rate to need action score (more suggestions = more need)
            return min(suggestion_rate * 1.5, 100)  # Cap at 100%
        
        return 50  # Default moderate need
    
    def _calculate_confidence(self, sample_size):
        """Calculate confidence level based on sample size.
        
        Args:
            sample_size (int): Number of survey responses.
        
        Returns:
            float: Confidence level percentage.
        """
        # Simple confidence calculation based on sample size
        # In a real implementation, this would use statistical methods
        if sample_size >= 100:
            return 95.0  # 95% confidence
        elif sample_size >= 50:
            return 85.0  # 85% confidence
        elif sample_size >= 30:
            return 75.0  # 75% confidence
        else:
            return 60.0  # 60% confidence
    
    def prepare_features(self, survey_data, demographic_data=None):
        """Prepare feature matrix for machine learning.
        
        Args:
            survey_data (pd.DataFrame): DataFrame containing processed survey responses.
            demographic_data (pd.DataFrame, optional): DataFrame containing demographic data.
        
        Returns:
            pd.DataFrame: Feature matrix ready for machine learning.
        """
        # Calculate service scores
        service_scores = self.calculate_service_scores(survey_data)
        
        # Create feature records
        feature_records = []
        
        for section_name, scores in service_scores.items():
            # Get demographic data for the barangay
            barangay_ids = survey_data[survey_data['section_name'] == section_name]['barangay_id'].unique()
            
            for barangay_id in barangay_ids:
                # Get demographic features
                if demographic_data is not None:
                    barangay_demo = demographic_data[demographic_data['barangay_id'] == barangay_id]
                    if len(barangay_demo) > 0:
                        demo_features = barangay_demo.iloc[0].to_dict()
                    else:
                        demo_features = {}
                else:
                    # Use demographic data from survey responses
                    barangay_survey = survey_data[
                        (survey_data['section_name'] == section_name) & 
                        (survey_data['barangay_id'] == barangay_id)
                    ]
                    
                    if len(barangay_survey) > 0:
                        demo_features = {
                            'barangay_id': barangay_id,
                            'barangay_name': barangay_survey['barangay_name'].iloc[0],
                            'population': barangay_survey['population'].iloc[0],
                            'households': barangay_survey['households'].iloc[0],
                            'area_sqkm': barangay_survey['area_sqkm'].iloc[0]
                        }
                    else:
                        demo_features = {'barangay_id': barangay_id}
                
                # Combine demographic and service score features
                feature_record = {
                    **demo_features,
                    'section_name': section_name,
                    'awareness_score': scores['awareness_score'],
                    'availment_score': scores['availment_score'],
                    'satisfaction_score': scores['satisfaction_score'],
                    'need_action_score': scores['need_action_score'],
                    'sample_size': scores['sample_size'],
                    'confidence': scores['confidence']
                }
                
                feature_records.append(feature_record)
        
        # Convert to DataFrame
        features_df = pd.DataFrame(feature_records)
        
        # Handle missing values
        numeric_cols = features_df.select_dtypes(include=[np.number]).columns
        features_df[numeric_cols] = features_df[numeric_cols].fillna(features_df[numeric_cols].mean())
        
        # One-hot encode categorical variables
        categorical_cols = ['section_name', 'barangay_name']
        for col in categorical_cols:
            if col in features_df.columns:
                dummies = pd.get_dummies(features_df[col], prefix=col)
                features_df = pd.concat([features_df, dummies], axis=1)
                features_df.drop(col, axis=1, inplace=True)
        
        return features_df