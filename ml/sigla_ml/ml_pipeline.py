#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import os
import logging
from datetime import datetime
from .data_extraction import DataExtractor
from .feature_engineering import FeatureEngineer
from .model_training import BarangayMLModel

class BarangayMLPipeline:
    """Complete ML pipeline for barangay service delivery analysis."""
    
    def __init__(self, supabase_url=None, supabase_key=None):
        """Initialize the ML pipeline.
        
        Args:
            supabase_url (str): Supabase URL
            supabase_key (str): Supabase service role key
        """
        # Initialize components
        supabase_config = {
            'url': supabase_url,
            'key': supabase_key
        } if supabase_url and supabase_key else None
        self.data_extractor = DataExtractor(supabase_config)
        self.feature_engineer = FeatureEngineer()
        self.model = None
        
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Pipeline state
        self.raw_data = {}
        self.processed_data = {}
        self.features = None
        self.predictions = None
    
    def extract_all_data(self):
        """Extract all required data from the database.
        
        Returns:
            dict: Dictionary containing all extracted data
        """
        self.logger.info("Starting data extraction...")
        
        try:
            # Extract survey responses
            self.logger.info("Extracting survey responses...")
            self.raw_data['survey_responses'] = self.data_extractor.extract_survey_responses()
            
            # Extract demographic data
            self.logger.info("Extracting demographic data...")
            self.raw_data['demographic_data'] = self.data_extractor.extract_demographic_data()
            
            # Extract historical performance (if available)
            self.logger.info("Extracting historical performance...")
            self.raw_data['historical_performance'] = self.data_extractor.extract_historical_performance()
            
            # Log data summary
            for key, data in self.raw_data.items():
                if isinstance(data, pd.DataFrame):
                    self.logger.info(f"{key}: {len(data)} records")
                else:
                    self.logger.info(f"{key}: {type(data)}")
            
            return self.raw_data
            
        except Exception as e:
            self.logger.error(f"Error during data extraction: {str(e)}")
            raise
    
    def process_survey_data(self):
        """Process raw survey data into structured format.
        
        Returns:
            pd.DataFrame: Processed survey data
        """
        if 'survey_responses' not in self.raw_data:
            raise ValueError("Survey responses not extracted. Run extract_all_data() first.")
        
        self.logger.info("Processing survey responses...")
        
        # Process survey responses
        processed_responses = self.data_extractor._process_survey_responses(
            self.raw_data['survey_responses']
        )
        
        self.processed_data['survey_responses'] = processed_responses
        
        self.logger.info(f"Processed {len(processed_responses)} survey response records")
        
        return processed_responses
    
    def engineer_features(self):
        """Engineer features for machine learning.
        
        Returns:
            pd.DataFrame: Feature matrix
        """
        if 'survey_responses' not in self.processed_data:
            raise ValueError("Survey data not processed. Run process_survey_data() first.")
        
        self.logger.info("Engineering features...")
        
        # Prepare features
        self.features = self.feature_engineer.prepare_features(
            self.processed_data['survey_responses'],
            self.raw_data.get('demographic_data')
        )
        
        self.logger.info(f"Generated feature matrix with {len(self.features)} records and {len(self.features.columns)} features")
        
        # Log feature summary
        self.logger.info("Feature columns:")
        for col in self.features.columns:
            self.logger.info(f"  - {col}")
        
        return self.features
    
    def train_priority_model(self, model_type='regression', target_type='service_priority'):
        """Train a model to predict service priorities.
        
        Args:
            model_type (str): 'regression' or 'classification'
            target_type (str): Type of target variable
        
        Returns:
            dict: Training metrics
        """
        if self.features is None:
            raise ValueError("Features not engineered. Run engineer_features() first.")
        
        self.logger.info(f"Training {model_type} model for {target_type}...")
        
        # Initialize model
        self.model = BarangayMLModel(model_type=model_type)
        
        # Train model
        metrics = self.model.train_model(self.features, target_type=target_type)
        
        self.logger.info("Model training completed")
        
        return metrics
    
    def predict_barangay_priorities(self, barangay_ids=None):
        """Predict service priorities for barangays.
        
        Args:
            barangay_ids (list, optional): Specific barangay IDs to predict for
        
        Returns:
            pd.DataFrame: Predictions for barangays
        """
        if self.model is None:
            raise ValueError("Model not trained. Run train_priority_model() first.")
        
        # Filter features if specific barangays requested
        prediction_features = self.features.copy()
        if barangay_ids is not None:
            prediction_features = prediction_features[
                prediction_features['barangay_id'].isin(barangay_ids)
            ]
        
        self.logger.info(f"Generating predictions for {len(prediction_features)} records...")
        
        # Generate predictions
        self.predictions = self.model.predict_barangay_priorities(prediction_features)
        
        self.logger.info(f"Generated {len(self.predictions)} predictions")
        
        return self.predictions
    
    def get_barangay_insights(self, barangay_id):
        """Get detailed insights for a specific barangay.
        
        Args:
            barangay_id (str): Barangay ID
        
        Returns:
            dict: Comprehensive barangay insights
        """
        insights = {
            'barangay_id': barangay_id,
            'demographic_info': {},
            'service_scores': {},
            'predictions': {},
            'recommendations': []
        }
        
        # Get demographic information
        if 'demographic_data' in self.raw_data:
            demo_data = self.raw_data['demographic_data']
            barangay_demo = demo_data[demo_data['barangay_id'] == barangay_id]
            if len(barangay_demo) > 0:
                insights['demographic_info'] = barangay_demo.iloc[0].to_dict()
        
        # Get service scores from features
        if self.features is not None:
            barangay_features = self.features[self.features['barangay_id'] == barangay_id]
            if len(barangay_features) > 0:
                # Extract service scores
                score_columns = ['awareness_score', 'availment_score', 'satisfaction_score', 'need_action_score']
                for col in score_columns:
                    if col in barangay_features.columns:
                        insights['service_scores'][col] = barangay_features[col].mean()
        
        # Get predictions
        if self.predictions is not None:
            barangay_predictions = self.predictions[self.predictions['barangay_id'] == barangay_id]
            if len(barangay_predictions) > 0:
                insights['predictions'] = barangay_predictions.to_dict('records')
        
        # Generate recommendations
        insights['recommendations'] = self._generate_recommendations(insights)
        
        return insights
    
    def _generate_recommendations(self, insights):
        """Generate actionable recommendations based on insights.
        
        Args:
            insights (dict): Barangay insights
        
        Returns:
            list: List of recommendations
        """
        recommendations = []
        
        service_scores = insights.get('service_scores', {})
        
        # Check satisfaction scores
        satisfaction = service_scores.get('satisfaction_score', 0)
        if satisfaction < 50:
            recommendations.append({
                'priority': 'High',
                'category': 'Service Quality',
                'recommendation': 'Focus on improving service quality and citizen satisfaction',
                'score': satisfaction
            })
        
        # Check need for action
        need_action = service_scores.get('need_action_score', 0)
        if need_action > 70:
            recommendations.append({
                'priority': 'High',
                'category': 'Urgent Action',
                'recommendation': 'Immediate intervention required based on citizen feedback',
                'score': need_action
            })
        
        # Check awareness levels
        awareness = service_scores.get('awareness_score', 0)
        if awareness < 60:
            recommendations.append({
                'priority': 'Medium',
                'category': 'Information Campaign',
                'recommendation': 'Increase awareness campaigns about available services',
                'score': awareness
            })
        
        # Check availment rates
        availment = service_scores.get('availment_score', 0)
        if availment < 40:
            recommendations.append({
                'priority': 'Medium',
                'category': 'Service Accessibility',
                'recommendation': 'Improve service accessibility and reduce barriers',
                'score': availment
            })
        
        return recommendations
    
    def save_pipeline_state(self, filepath):
        """Save the current pipeline state.
        
        Args:
            filepath (str): Path to save the pipeline state
        """
        pipeline_state = {
            'raw_data_summary': {key: len(data) if isinstance(data, pd.DataFrame) else str(type(data)) 
                               for key, data in self.raw_data.items()},
            'processed_data_summary': {key: len(data) if isinstance(data, pd.DataFrame) else str(type(data)) 
                                     for key, data in self.processed_data.items()},
            'features_shape': self.features.shape if self.features is not None else None,
            'predictions_shape': self.predictions.shape if self.predictions is not None else None,
            'model_metrics': self.model.model_metrics if self.model is not None else None,
            'timestamp': datetime.now().isoformat()
        }
        
        # Save model separately if it exists
        if self.model is not None:
            model_path = filepath.replace('.pkl', '_model.pkl')
            self.model.save_model(model_path)
            pipeline_state['model_path'] = model_path
        
        import joblib
        joblib.dump(pipeline_state, filepath)
        self.logger.info(f"Pipeline state saved to {filepath}")
    
    def run_full_pipeline(self, model_type='regression', target_type='service_priority'):
        """Run the complete ML pipeline.
        
        Args:
            model_type (str): 'regression' or 'classification'
            target_type (str): Type of target variable
        
        Returns:
            dict: Complete pipeline results
        """
        self.logger.info("Starting full ML pipeline...")
        
        try:
            # Step 1: Extract data
            self.extract_all_data()
            
            # Step 2: Process survey data
            self.process_survey_data()
            
            # Step 3: Engineer features
            self.engineer_features()
            
            # Step 4: Train model
            training_metrics = self.train_priority_model(model_type, target_type)
            
            # Step 5: Generate predictions
            predictions = self.predict_barangay_priorities()
            
            # Compile results
            results = {
                'data_summary': {
                    'survey_responses': len(self.raw_data.get('survey_responses', [])),
                    'demographic_records': len(self.raw_data.get('demographic_data', [])),
                    'historical_records': len(self.raw_data.get('historical_performance', [])),
                    'feature_matrix_shape': self.features.shape,
                    'predictions_count': len(predictions)
                },
                'model_performance': training_metrics,
                'predictions': predictions,
                'top_priority_barangays': predictions.head(10).to_dict('records'),
                'feature_importance': self.model.get_feature_importance()
            }
            
            self.logger.info("Full pipeline completed successfully")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Pipeline failed: {str(e)}")
            raise