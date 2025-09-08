#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
from math import sqrt

class FeatureEngineer:
    """Class for engineering features from survey data for machine learning."""
    
    def __init__(self):
        """Initialize the FeatureEngineer."""
        # Define service sections
        self.service_sections = [
            'health', 'education', 'infrastructure', 'social_welfare',
            'agriculture', 'disaster', 'governance', 'tourism'
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
        # Group by section_name
        grouped = survey_data.groupby('section_name')
        
        service_scores = {}
        
        for section_name, group in grouped:
            if section_name not in self.service_sections:
                continue
            
            # Count responses
            total_responses = len(group)
            
            # Calculate awareness score
            awareness_questions = [col for col in group.columns if 'aware' in col.lower()]
            if awareness_questions:
                aware_count = group[awareness_questions].eq(1).sum().sum()
                total_awareness_questions = len(awareness_questions) * total_responses
                awareness_score = (aware_count / total_awareness_questions) * 100 if total_awareness_questions > 0 else 0
            else:
                awareness_score = None
            
            # Calculate availment score
            availment_questions = [col for col in group.columns if 'avail' in col.lower()]
            if availment_questions:
                availed_count = group[availment_questions].eq(1).sum().sum()
                total_availment_questions = len(availment_questions) * total_responses
                availment_score = (availed_count / total_availment_questions) * 100 if total_availment_questions > 0 else 0
            else:
                availment_score = None
            
            # Calculate satisfaction score
            satisfaction_questions = [col for col in group.columns if 'satisf' in col.lower()]
            if satisfaction_questions:
                satisfied_count = group[satisfaction_questions].eq(1).sum().sum()
                total_satisfaction_questions = len(satisfaction_questions) * total_responses
                satisfaction_score = (satisfied_count / total_satisfaction_questions) * 100 if total_satisfaction_questions > 0 else 0
            else:
                satisfaction_score = None
            
            # Calculate need action score
            need_action_questions = [col for col in group.columns if 'need' in col.lower() or 'action' in col.lower()]
            if need_action_questions:
                need_action_count = group[need_action_questions].eq(1).sum().sum()
                total_need_action_questions = len(need_action_questions) * total_responses
                need_action_score = (need_action_count / total_need_action_questions) * 100 if total_need_action_questions > 0 else 0
            else:
                need_action_score = None
            
            # Calculate confidence level
            confidence = self._calculate_confidence(total_responses)
            
            # Store scores
            service_scores[section_name] = {
                'awareness_score': awareness_score,
                'availment_score': availment_score,
                'satisfaction_score': satisfaction_score,
                'need_action_score': need_action_score,
                'sample_size': total_responses,
                'confidence': confidence
            }
        
        return service_scores
    
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