#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Union

from .data_extraction import DataExtractor
from .feature_engineering import FeatureEngineer
from .random_forest import RandomForestModel

class SiglaMLAPI:
    """API for SIGLA Machine Learning functionality."""
    
    def __init__(self, model_path: Optional[str] = None):
        """Initialize the SIGLA ML API.
        
        Args:
            model_path: Path to pre-trained model file (optional)
        """
        self.data_extractor = DataExtractor()
        self.feature_engineer = FeatureEngineer()
        self.model = None
        
        if model_path and os.path.exists(model_path):
            self.model = RandomForestModel()
            self.model.load_model(model_path)
    
    def train_model(self, barangay_id: Optional[int] = None, 
                   date_range: Optional[Tuple[str, str]] = None,
                   target_type: str = 'satisfaction',
                   optimize: bool = False) -> Dict:
        """Train a Random Forest model on survey data.
        
        Args:
            barangay_id: Optional filter for specific barangay
            date_range: Optional tuple of (start_date, end_date)
            target_type: Target variable type ('satisfaction', 'awareness', etc.)
            optimize: Whether to optimize hyperparameters
            
        Returns:
            Dictionary with model performance metrics
        """
        # Prepare filters
        filters = {}
        if barangay_id:
            filters['barangay_id'] = barangay_id
        if date_range:
            filters['date_from'] = date_range[0]
            filters['date_to'] = date_range[1]
        
        # Extract survey data
        survey_data = self.data_extractor.extract_survey_responses(filters)
        processed_data = self.data_extractor.process_survey_responses(survey_data)
        
        # Extract demographic data
        demographic_data = self.data_extractor.extract_demographic_data()
        
        # Prepare features
        features_df = self.feature_engineer.prepare_features(processed_data, demographic_data)
        
        if len(features_df) == 0:
            raise ValueError("No data available for training")
        
        # Prepare target variable
        target_column = f'{target_type}_score'
        if target_column not in features_df.columns:
            raise ValueError(f"Target column '{target_column}' not found in features")
        
        # Separate features and target
        X = features_df.drop([target_column, 'barangay_id'], axis=1, errors='ignore')
        y = features_df[target_column]
        
        # Remove rows with missing target values
        mask = ~y.isna()
        X = X[mask]
        y = y[mask]
        
        if len(X) == 0:
            raise ValueError("No valid training data after removing missing values")
        
        # Initialize and train model
        model_type = 'regressor' if target_type in ['satisfaction', 'awareness'] else 'classifier'
        self.model = RandomForestModel(model_type=model_type)
        
        metrics = self.model.train(X, y, optimize=optimize)
        
        return metrics
    
    def predict(self, input_data: Dict) -> Dict:
        """Make predictions using the trained model.
        
        Args:
            input_data: Dictionary with input features
            
        Returns:
            Dictionary with prediction results
        """
        if self.model is None:
            raise ValueError("Model has not been trained. Call train_model() first.")
        
        # Convert input to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Make prediction
        prediction = self.model.predict(input_df)
        
        result = {
            'prediction': float(prediction[0]),
            'model_type': self.model.model_type
        }
        
        # Add probability if classifier
        if self.model.model_type == 'classifier':
            probabilities = self.model.predict_proba(input_df)
            result['probabilities'] = probabilities[0].tolist()
        
        return result
    
    def analyze_barangay(self, barangay_id: int) -> Dict:
        """Analyze survey data for a specific barangay.
        
        Args:
            barangay_id: ID of the barangay to analyze
            
        Returns:
            Dictionary with analysis results
        """
        # Extract survey data for the barangay
        filters = {'barangay_id': barangay_id}
        survey_data = self.data_extractor.extract_survey_responses(filters)
        
        if len(survey_data) == 0:
            return {
                'barangay_id': barangay_id,
                'error': 'No survey data found for this barangay'
            }
        
        # Process survey responses
        processed_data = self.data_extractor.process_survey_responses(survey_data)
        
        # Calculate service scores
        service_scores = self.feature_engineer.calculate_service_scores(processed_data)
        
        # Calculate Action Grid classification
        action_grid = self._calculate_action_grid(service_scores)
        
        # Get demographic data
        demographic_data = self.data_extractor.extract_demographic_data(barangay_id)
        
        result = {
            'barangay_id': barangay_id,
            'service_scores': service_scores,
            'action_grid': action_grid,
            'demographic_data': demographic_data.to_dict('records')[0] if len(demographic_data) > 0 else {},
            'total_responses': len(processed_data)
        }
        
        return result
    
    def _calculate_action_grid(self, service_scores: Dict) -> Dict:
        """Calculate Action Grid classification for services.
        
        Args:
            service_scores: Dictionary with service scores
            
        Returns:
            Dictionary with Action Grid classifications
        """
        action_grid = {}
        
        for service, scores in service_scores.items():
            satisfaction = scores.get('satisfaction_score', 0)
            need_action = scores.get('need_action_score', 0)
            
            # Determine quadrant based on satisfaction and need for action
            if satisfaction >= 70 and need_action <= 30:
                quadrant = 'Maintain'  # High satisfaction, low need for action
            elif satisfaction >= 70 and need_action > 30:
                quadrant = 'Opportunities'  # High satisfaction, high need for action
            elif satisfaction < 70 and need_action <= 30:
                quadrant = 'Monitor'  # Low satisfaction, low need for action
            else:
                quadrant = 'Fix Now'  # Low satisfaction, high need for action
            
            action_grid[service] = {
                'quadrant': quadrant,
                'satisfaction_score': satisfaction,
                'need_action_score': need_action,
                'confidence': scores.get('confidence', 0)
            }
        
        return action_grid
    
    def get_feature_importance(self) -> Dict:
        """Get feature importance from the trained model.
        
        Returns:
            Dictionary with feature importance data
        """
        if self.model is None:
            raise ValueError("Model has not been trained. Call train_model() first.")
        
        importance_df = self.model.get_feature_importance()
        
        return {
            'feature_importance': importance_df.to_dict('records'),
            'top_features': importance_df.head(10).to_dict('records')
        }
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model to disk.
        
        Args:
            filepath: Path to save the model
        """
        if self.model is None:
            raise ValueError("Model has not been trained. Call train_model() first.")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        self.model.save_model(filepath)