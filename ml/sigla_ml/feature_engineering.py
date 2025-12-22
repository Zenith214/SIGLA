#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import pandas as pd
import numpy as np
import logging
from math import sqrt
from .csis_calculations import (
    calculate_margin_of_error,
    calculate_dynamic_cutoff,
    classify_score,
    determine_action_grid_quadrant,
    calculate_service_metrics_with_moe
)

logger = logging.getLogger(__name__)

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
    
    def _identify_aware_respondents(self, responses, service_area):
        """Identify respondents who answered 'Yes' to any awareness question.
        
        Args:
            responses (list): List of response dictionaries with keys: respondent_id, question_text, answer
            service_area (str): Service area to filter questions for
        
        Returns:
            set: Set of respondent IDs who are aware
        """
        aware_ids = set()
        
        for response in responses:
            # Check if this is an awareness question for the service area
            question_text = str(response.get('question_text', '')).lower()
            answer = str(response.get('answer', '')).lower()
            
            # Identify awareness questions
            if 'aware' in question_text or 'know about' in question_text:
                # Check for positive answer
                if (answer in ['yes', 'oo', 'oo (yes)', '1', 'true'] or 
                    response.get('answer') == 1 or 
                    response.get('answer') is True):
                    aware_ids.add(response.get('respondent_id'))
        
        return aware_ids
    
    def _identify_availed_respondents(self, responses, service_area, aware_ids):
        """Identify respondents who answered 'Yes' to any availment question.
        
        Only includes respondents who are already aware (subset of aware_ids).
        
        Args:
            responses (list): List of response dictionaries
            service_area (str): Service area to filter questions for
            aware_ids (set): Set of respondent IDs who are aware
        
        Returns:
            set: Set of respondent IDs who availed (subset of aware_ids)
        """
        availed_ids = set()
        
        # Keywords that indicate availment questions
        availment_keywords = ['avail', 'experience', 'benefited', 'participated', 
                             'used', 'accessed', 'utilized', 'received']
        
        for response in responses:
            respondent_id = response.get('respondent_id')
            
            # Only consider aware respondents
            if respondent_id not in aware_ids:
                continue
            
            question_text = str(response.get('question_text', '')).lower()
            answer = str(response.get('answer', '')).lower()
            
            # Check if this is an availment question
            if any(keyword in question_text for keyword in availment_keywords):
                # Check for positive answer
                if (answer in ['yes', 'oo', 'oo (yes)', '1', 'true'] or 
                    response.get('answer') == 1 or 
                    response.get('answer') is True):
                    availed_ids.add(respondent_id)
        
        return availed_ids
    
    def _calculate_satisfaction_from_availed(self, responses, service_area, availed_ids):
        """Calculate satisfaction metrics only from respondents who availed services.
        
        Now handles binary Yes/No responses (new format) and legacy Likert scale (1-5).
        
        Args:
            responses (list): List of response dictionaries
            service_area (str): Service area to filter questions for
            availed_ids (set): Set of respondent IDs who availed services
        
        Returns:
            dict: Dictionary with keys 'count', 'total', 'percentage'
        """
        if not availed_ids:
            return {'count': 0, 'total': 0, 'percentage': None}
        
        # Track satisfaction per respondent (True = satisfied, False = not satisfied)
        respondent_satisfaction = {}
        
        for response in responses:
            respondent_id = response.get('respondent_id')
            
            # Only consider respondents who availed
            if respondent_id not in availed_ids:
                continue
            
            question_text = str(response.get('question_text', '')).lower()
            
            # Check if this is a satisfaction question
            if 'satisf' in question_text or 'rate' in question_text or 'quality' in question_text:
                answer = response.get('answer')
                
                # Handle binary Yes/No responses (new format)
                answer_str = str(answer).lower()
                if 'yes' in answer_str or 'oo' in answer_str:
                    # "Yes" = satisfied
                    respondent_satisfaction[respondent_id] = True
                    continue
                elif 'no' in answer_str or 'hindi' in answer_str:
                    # "No" = not satisfied
                    if respondent_id not in respondent_satisfaction:
                        respondent_satisfaction[respondent_id] = False
                    continue
                
                # Handle legacy Likert scale (1-5) for backward compatibility
                try:
                    if isinstance(answer, str) and answer.isdigit():
                        rating = int(answer)
                    elif isinstance(answer, (int, float)):
                        rating = int(answer)
                    else:
                        continue
                    
                    # Validate rating is in range
                    if 1 <= rating <= 5:
                        # Convert Likert to binary: 4-5 = satisfied, 1-3 = not satisfied
                        is_satisfied = rating >= 4
                        # Only update if not already set or if this is more positive
                        if respondent_id not in respondent_satisfaction or (is_satisfied and not respondent_satisfaction[respondent_id]):
                            respondent_satisfaction[respondent_id] = is_satisfied
                except (ValueError, TypeError):
                    continue
        
        # CRITICAL: Denominator is ALL availed respondents (not just those who answered satisfaction questions)
        # This ensures satisfaction percentage reflects the proportion of ALL service users who were satisfied
        total_availed = len(availed_ids)
        
        if not respondent_satisfaction:
            return {'count': 0, 'total': total_availed, 'percentage': 0 if total_availed > 0 else None}
        
        # Count satisfied respondents (those who answered "Yes" or rating >= 4)
        satisfied_count = sum(1 for is_satisfied in respondent_satisfaction.values() if is_satisfied)
        
        # Calculate percentage: (satisfied_count / total_availed) * 100
        percentage = (satisfied_count / total_availed) * 100 if total_availed > 0 else 0
        
        return {
            'count': satisfied_count,
            'total': total_availed,
            'percentage': round(percentage, 1)
        }
    
    def _calculate_need_for_action_from_responses(self, responses, service_area):
        """Calculate need for action score from survey responses.
        
        Looks for questions with 'nfaBinary' in the ID (Need For Action Binary questions).
        
        Args:
            responses (list): List of response dictionaries
            service_area (str): Service area to calculate for
        
        Returns:
            dict: Dictionary with 'count', 'total', 'percentage'
        """
        respondents_with_nfa_yes = set()
        respondents_with_nfa_questions = set()
        
        # Debug: Sample first few question texts to see what we're working with
        sample_questions = set()
        
        for response in responses:
            respondent_id = response.get('respondent_id')
            question_text = str(response.get('question_text', ''))
            answer = response.get('answer')
            
            # Collect sample questions for debugging
            if len(sample_questions) < 10:
                sample_questions.add(question_text)
            
            # Check if this is a need for action question (nfaBinary questions)
            if 'nfaBinary' in question_text or 'nfa_binary' in question_text.lower():
                respondents_with_nfa_questions.add(respondent_id)
                
                # Check if answer indicates need for action (Yes/Oo)
                answer_str = str(answer).strip() if answer else ''
                if answer_str in ['Yes', 'Oo', 'yes', 'oo', 'Oo (Yes)', 'Yes / Oo']:
                    respondents_with_nfa_yes.add(respondent_id)
        
        need_action_count = len(respondents_with_nfa_yes)
        total = len(respondents_with_nfa_questions)
        percentage = (need_action_count / total * 100) if total > 0 else None
        
        # Debug output using logger
        if total == 0:
            logger.warning(f"No nfaBinary questions found for {service_area}")
            logger.warning(f"Sample questions: {list(sample_questions)[:5]}")
        else:
            logger.info(f"NFA for {service_area}: {need_action_count}/{total} = {percentage}%")
        
        return {
            'count': need_action_count,
            'total': total,
            'percentage': round(percentage, 1) if percentage is not None else None
        }
    
    def _calculate_funnel_metrics(self, responses, service_area):
        """Orchestrate three-stage funnel calculation with CSIS methodology.
        
        Args:
            responses (list): List of response dictionaries
            service_area (str): Service area to calculate metrics for
        
        Returns:
            dict: Dictionary with 'awareness', 'availment', 'satisfaction', 'need_for_action' keys,
                  each containing 'count', 'total', 'percentage', and CSIS metrics
        """
        # Get all unique respondent IDs
        all_respondent_ids = set(r.get('respondent_id') for r in responses if r.get('respondent_id'))
        total_respondents = len(all_respondent_ids)
        
        # Stage 1: Identify aware respondents
        aware_ids = self._identify_aware_respondents(responses, service_area)
        awareness_count = len(aware_ids)
        awareness_percentage = (awareness_count / total_respondents * 100) if total_respondents > 0 else None
        
        # Stage 2: Identify availed respondents (subset of aware)
        availed_ids = self._identify_availed_respondents(responses, service_area, aware_ids)
        availment_count = len(availed_ids)
        availment_percentage = (availment_count / awareness_count * 100) if awareness_count > 0 else None
        
        # Stage 3: Calculate satisfaction from availed respondents
        satisfaction_metrics = self._calculate_satisfaction_from_availed(responses, service_area, availed_ids)
        
        # Stage 4: Calculate need for action
        need_for_action_metrics = self._calculate_need_for_action_from_responses(responses, service_area)
        
        # Validation: Ensure subset relationships
        if not availed_ids.issubset(aware_ids):
            print(f"Warning: Validation failed for {service_area} - availed respondents not subset of aware", file=sys.stderr)
        if not aware_ids.issubset(all_respondent_ids):
            print(f"Warning: Validation failed for {service_area} - aware respondents not subset of all", file=sys.stderr)
        
        # Calculate CSIS metrics with MoE and Action Grid classification
        satisfaction_total = satisfaction_metrics.get('total', 0)
        satisfaction_count = satisfaction_metrics.get('count', 0)
        need_for_action_total = need_for_action_metrics.get('total', 0)
        need_for_action_count = need_for_action_metrics.get('count', 0)
        
        # Calculate MoE for satisfaction and need for action
        satisfaction_moe = calculate_margin_of_error(satisfaction_total) if satisfaction_total > 0 else 0.0
        need_for_action_moe = calculate_margin_of_error(need_for_action_total) if need_for_action_total > 0 else 0.0
        
        # Calculate scores as decimals (0-1)
        satisfaction_score = (satisfaction_count / satisfaction_total) if satisfaction_total > 0 else 0.0
        need_for_action_score = (need_for_action_count / need_for_action_total) if need_for_action_total > 0 else 0.0
        
        # Determine Action Grid Quadrant using CSIS methodology
        if satisfaction_total > 0 and need_for_action_total > 0:
            quadrant, priority, details = determine_action_grid_quadrant(
                satisfaction_score,
                satisfaction_moe,
                need_for_action_score,
                need_for_action_moe
            )
        else:
            quadrant = "Insufficient Data"
            priority = "N/A"
            details = {}
        
        return {
            'awareness': {
                'count': awareness_count,
                'total': total_respondents,
                'percentage': round(awareness_percentage, 1) if awareness_percentage is not None else None
            },
            'availment': {
                'count': availment_count,
                'total': awareness_count,
                'percentage': round(availment_percentage, 1) if availment_percentage is not None else None
            },
            'satisfaction': {
                **satisfaction_metrics,
                'moe': satisfaction_moe,
                'cutoff': calculate_dynamic_cutoff(satisfaction_moe),
                'rating': classify_score(satisfaction_score, satisfaction_moe) if satisfaction_total > 0 else "N/A"
            },
            'need_for_action': {
                **need_for_action_metrics,
                'moe': need_for_action_moe,
                'cutoff': calculate_dynamic_cutoff(need_for_action_moe),
                'rating': classify_score(need_for_action_score, need_for_action_moe) if need_for_action_total > 0 else "N/A"
            },
            'action_grid': {
                'quadrant': quadrant,
                'priority': priority,
                'details': details
            }
        }
    
    def calculate_service_scores(self, survey_data, use_funnel=True):
        """Calculate service scores from survey responses.
        
        Args:
            survey_data (pd.DataFrame): DataFrame containing processed survey responses.
            use_funnel (bool): If True, use cascading funnel calculations. If False, use legacy method.
        
        Returns:
            dict: Dictionary containing service scores for each section.
        """
        if survey_data.empty:
            return {}
        
        # Group by section_key (more reliable than section_name)
        grouped = survey_data.groupby('section_key')
        
        service_scores = {}
        
        for section_key, group in grouped:
            # Skip the "overall" section as it has different question structure
            # (overallSatisfaction and overallNeedForAction instead of awareness/availment/satisfaction/needAction)
            if section_key == 'overall':
                continue
            # Count responses
            total_responses = len(group)
            
            if use_funnel:
                # Convert DataFrame to list of response dictionaries for funnel calculation
                responses = self._dataframe_to_responses(group)
                
                # Use cascading funnel calculation with CSIS methodology
                funnel_metrics = self._calculate_funnel_metrics(responses, section_key)
                
                # Calculate confidence level
                confidence = self._calculate_confidence(total_responses)
                
                # Store scores with new structured format including CSIS metrics
                service_scores[section_key] = {
                    'awareness': funnel_metrics['awareness'],
                    'availment': funnel_metrics['availment'],
                    'satisfaction': funnel_metrics['satisfaction'],
                    'need_for_action': funnel_metrics['need_for_action'],
                    'action_grid': funnel_metrics['action_grid'],
                    # Legacy fields for backward compatibility
                    'awareness_score': funnel_metrics['awareness']['percentage'] or 0,
                    'availment_score': funnel_metrics['availment']['percentage'] or 0,
                    'satisfaction_score': funnel_metrics['satisfaction']['percentage'] or 0,
                    'need_action_score': funnel_metrics['need_for_action']['percentage'] or 0,
                    'sample_size': total_responses,
                    'confidence': confidence,
                    # CSIS-specific fields
                    'csis_quadrant': funnel_metrics['action_grid']['quadrant'],
                    'csis_priority': funnel_metrics['action_grid']['priority']
                }
            else:
                # Legacy calculation method
                # Calculate awareness score (Yes/No questions)
                awareness_questions = [col for col in group.columns if 'aware' in col.lower() and col != 'section_key']
                awareness_score = self._calculate_binary_score(group, awareness_questions, 'Yes')
                
                # Calculate availment score (Yes/No questions)
                # Match the funnel analysis logic - check for multiple keywords
                availment_keywords = ['avail', 'experience', 'benefited', 'participated', 'used', 'accessed', 'utilized', 'received']
                availment_questions = [col for col in group.columns 
                                     if any(keyword in col.lower() for keyword in availment_keywords) 
                                     and col != 'section_key']
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
    
    def _dataframe_to_responses(self, group_df):
        """Convert a DataFrame group to a list of response dictionaries.
        
        Args:
            group_df (pd.DataFrame): DataFrame group for a service area
        
        Returns:
            list: List of response dictionaries with keys: respondent_id, question_text, answer
        """
        responses = []
        
        # Iterate through each row (respondent)
        for idx, row in group_df.iterrows():
            respondent_id = row.get('respondent_id', idx)
            
            # Iterate through each column (question)
            for col in group_df.columns:
                if col in ['section_key', 'section_name', 'respondent_id', 'barangay_id', 
                          'barangay_name', 'population', 'households', 'area_sqkm']:
                    continue
                
                answer = row[col]
                
                # Skip null/empty answers
                if pd.isna(answer) or answer == '' or answer == 'nan':
                    continue
                
                responses.append({
                    'respondent_id': respondent_id,
                    'question_text': col,
                    'answer': answer
                })
        
        return responses
    
    def _calculate_binary_score(self, group, questions, positive_value):
        """Calculate score for binary Yes/No questions - matches dashboard calculation."""
        if not questions:
            return 0
        
        # Calculate percentage per question, then average across questions
        question_percentages = []
        
        for question in questions:
            if question in group.columns:
                positive_count = 0
                total_count = 0
                
                for _, value in group[question].items():
                    if pd.notna(value):
                        total_count += 1
                        # Match dashboard logic: treat "Yes", "Oo", 1, true, "1", "Oo (Yes)" as positive
                        string_value = str(value).lower() if value is not None else ''
                        if (value == positive_value or value == 1 or value == True or value == '1' or 
                            string_value == 'yes' or string_value == 'oo' or string_value == 'true' or
                            string_value == 'oo (yes)'):
                            positive_count += 1
                
                # Calculate percentage for this question
                if total_count > 0:
                    question_percentages.append((positive_count / total_count) * 100)
        
        # Return average percentage across all questions
        return round(sum(question_percentages) / len(question_percentages)) if question_percentages else 0
    
    def _calculate_satisfaction_score(self, group, questions):
        """Calculate satisfaction score from binary Yes/No or legacy 1-5 scale questions.
        
        New format: (satisfied_count / total_count) * 100
        Legacy format: (avg_rating / 5) * 100
        """
        if not questions:
            return 0
        
        # Calculate percentage per question
        question_percentages = []
        
        for question in questions:
            if question in group.columns:
                satisfied_count = 0
                total_count = 0
                
                for _, value in group[question].items():
                    if pd.notna(value):
                        # Handle binary Yes/No responses (new format)
                        value_str = str(value).lower()
                        if 'yes' in value_str or 'oo' in value_str:
                            satisfied_count += 1
                            total_count += 1
                            continue
                        elif 'no' in value_str or 'hindi' in value_str:
                            total_count += 1
                            continue
                        
                        # Handle legacy Likert scale (1-5) for backward compatibility
                        num_value = int(value) if isinstance(value, str) and value.isdigit() else value
                        if isinstance(num_value, (int, float)) and 1 <= num_value <= 5:
                            total_count += 1
                            # Convert Likert to binary: 4-5 = satisfied
                            if num_value >= 4:
                                satisfied_count += 1
                
                # Calculate percentage for this question: (satisfied / total) * 100
                if total_count > 0:
                    percentage = (satisfied_count / total_count) * 100
                    question_percentages.append(percentage)
        
        # Return average percentage across all questions
        return round(sum(question_percentages) / len(question_percentages)) if question_percentages else 0
    
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