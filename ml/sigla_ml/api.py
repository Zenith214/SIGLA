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
    
    def predict(self, input_data: Dict, barangay_id: Optional[int] = None, save_to_db: bool = True) -> Dict:
        """Make predictions using the trained model and optionally save to database.
        
        Args:
            input_data: Dictionary with input features
            barangay_id: ID of the barangay for which prediction is made (optional)
            save_to_db: Whether to save prediction to database (default: True)
            
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
            'model_type': self.model.model_type,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Add probability if classifier
        if self.model.model_type == 'classifier':
            probabilities = self.model.predict_proba(input_df)
            result['probabilities'] = probabilities[0].tolist()
        
        # Save prediction to database if requested
        if save_to_db and barangay_id is not None:
            try:
                # Get model ID if available
                model_id = getattr(self.model, 'model_id', None)
                if model_id is None:
                    # Try to get latest active model from database
                    supabase = self.data_extractor._get_connection()
                    response = supabase.table('ml_model')\
                        .select('model_id')\
                        .eq('is_active', True)\
                        .eq('model_type', self.model.model_type.upper())\
                        .order('created_at', desc=True)\
                        .limit(1)\
                        .execute()
                    
                    if response.data and len(response.data) > 0:
                        model_id = response.data[0]['model_id']
                
                # Prepare prediction data
                prediction_data = {
                    'barangay_id': barangay_id,
                    'model_id': model_id,
                    'prediction_value': float(prediction[0]),
                    'prediction_data': json.dumps(input_data),
                    'confidence': float(np.max(self.model.predict_proba(input_df)[0])) if self.model.model_type == 'classifier' else None,
                    'created_at': result['timestamp'],
                    'updated_at': result['timestamp']
                }
                
                # Insert prediction into database
                supabase = self.data_extractor._get_connection()
                response = supabase.table('ml_prediction').insert(prediction_data).execute()
                
                if response.data and len(response.data) > 0:
                    result['prediction_id'] = response.data[0]['prediction_id']
                
            except Exception as e:
                print(f"Warning: Failed to save prediction to database: {str(e)}")
                result['db_error'] = str(e)
        
        return result
    
    def analyze_barangay(self, barangay_id: int, save_to_db: bool = True) -> Dict:
        """Analyze survey data for a specific barangay and optionally save results to database.
        
        Args:
            barangay_id: ID of the barangay to analyze
            save_to_db: Whether to save analysis results to database (default: True)
            
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
        action_grid = self._calculate_action_grid(service_scores, barangay_id, save_to_db)
        
        # Get demographic data
        demographic_data = self.data_extractor.extract_demographic_data(barangay_id)
        demographic_dict = demographic_data.to_dict('records')[0] if len(demographic_data) > 0 else {}
        
        # Generate insights and recommendations
        insights, recommendations = self._generate_insights_and_recommendations(barangay_id, action_grid, service_scores, demographic_dict, save_to_db)
        
        result = {
            'barangay_id': barangay_id,
            'service_scores': service_scores,
            'action_grid': action_grid,
            'demographic_data': demographic_dict,
            'total_responses': len(processed_data),
            'insights': insights,
            'recommendations': recommendations
        }
        
        return result
        
    def _generate_insights_and_recommendations(self, barangay_id: int, action_grid: Dict, service_scores: Dict, demographic_data: Dict, save_to_db: bool = True) -> Tuple[List[Dict], List[Dict]]:
        """Generate insights and recommendations based on analysis results.
        
        Args:
            barangay_id: ID of the barangay
            action_grid: Action grid classifications
            service_scores: Service scores
            demographic_data: Demographic data
            save_to_db: Whether to save insights and recommendations to database
            
        Returns:
            Tuple of (insights, recommendations) lists
        """
        insights = []
        recommendations = []
        timestamp = pd.Timestamp.now().isoformat()
        
        # Generate insights based on action grid
        fix_now_services = [service for service, data in action_grid.items() if data['quadrant'] == 'FIX_NOW']
        if fix_now_services:
            insight_text = f"Critical attention needed for {len(fix_now_services)} services: {', '.join(fix_now_services)}"
            insights.append({
                'insight_text': insight_text,
                'insight_type': 'CRITICAL',
                'source': 'ACTION_GRID',
                'confidence': 0.9
            })
            
            # Generate recommendations for each Fix Now service
            for service in fix_now_services:
                recommendations.append({
                    'recommendation_text': f"Develop immediate improvement plan for {service}",
                    'priority': 'HIGH',
                    'recommendation_type': 'SERVICE_IMPROVEMENT',
                    'source': 'ACTION_GRID',
                    'related_insight': insight_text
                })
        
        # Generate insights based on service scores
        low_satisfaction_services = [service for service, scores in service_scores.items() 
                                   if scores.get('satisfaction_score', 0) < 50]
        if low_satisfaction_services:
            insight_text = f"Very low satisfaction for services: {', '.join(low_satisfaction_services)}"
            insights.append({
                'insight_text': insight_text,
                'insight_type': 'CONCERN',
                'source': 'SERVICE_SCORES',
                'confidence': 0.85
            })
            
            recommendations.append({
                'recommendation_text': f"Conduct focused community consultation on {', '.join(low_satisfaction_services)}",
                'priority': 'MEDIUM',
                'recommendation_type': 'COMMUNITY_ENGAGEMENT',
                'source': 'SERVICE_SCORES',
                'related_insight': insight_text
            })
        
        # Generate demographic-based insights
        if demographic_data.get('population', 0) > 0 and demographic_data.get('households', 0) > 0:
            avg_household_size = demographic_data['population'] / demographic_data['households']
            if avg_household_size > 5:
                insight_text = f"Larger than average household size ({avg_household_size:.1f} persons)"
                insights.append({
                    'insight_text': insight_text,
                    'insight_type': 'DEMOGRAPHIC',
                    'source': 'DEMOGRAPHIC_DATA',
                    'confidence': 0.8
                })
                
                recommendations.append({
                    'recommendation_text': "Consider family planning programs and larger housing support",
                    'priority': 'MEDIUM',
                    'recommendation_type': 'SOCIAL_PROGRAM',
                    'source': 'DEMOGRAPHIC_DATA',
                    'related_insight': insight_text
                })
        
        # Save insights to database if requested
        if save_to_db and barangay_id is not None:
            try:
                supabase = self.data_extractor._get_connection()
                
                # Save insights
                for i, insight in enumerate(insights):
                    insight_data = {
                        'barangay_id': barangay_id,
                        'insight_text': insight['insight_text'],
                        'insight_type': insight['insight_type'],
                        'source': insight['source'],
                        'confidence': float(insight['confidence']),
                        'created_at': timestamp,
                        'updated_at': timestamp
                    }
                    
                    response = supabase.table('ai_insight').insert(insight_data).execute()
                    
                    if response.data and len(response.data) > 0:
                        insight_id = response.data[0]['insight_id']
                        insights[i]['insight_id'] = insight_id
                        
                        # Save related recommendations
                        for j, recommendation in enumerate(recommendations):
                            if recommendation.get('related_insight') == insight['insight_text']:
                                recommendation_data = {
                                    'barangay_id': barangay_id,
                                    'insight_id': insight_id,
                                    'recommendation_text': recommendation['recommendation_text'],
                                    'priority': recommendation['priority'],
                                    'recommendation_type': recommendation['recommendation_type'],
                                    'source': recommendation['source'],
                                    'created_at': timestamp,
                                    'updated_at': timestamp
                                }
                                
                                rec_response = supabase.table('ai_recommendation').insert(recommendation_data).execute()
                                
                                if rec_response.data and len(rec_response.data) > 0:
                                    recommendations[j]['recommendation_id'] = rec_response.data[0]['recommendation_id']
            
            except Exception as e:
                print(f"Warning: Failed to save insights and recommendations to database: {str(e)}")
                for insight in insights:
                    insight['db_error'] = str(e)
        
        return insights, recommendations
    
    def _calculate_action_grid(self, service_scores: Dict, barangay_id: Optional[int] = None, save_to_db: bool = True) -> Dict:
        """Calculate Action Grid classification for services and optionally save to database.
        
        Args:
            service_scores: Dictionary with service scores
            barangay_id: ID of the barangay for which classification is made (optional)
            save_to_db: Whether to save classification to database (default: True)
            
        Returns:
            Dictionary with Action Grid classifications
        """
        action_grid = {}
        timestamp = pd.Timestamp.now().isoformat()
        
        for service, scores in service_scores.items():
            satisfaction = scores.get('satisfaction_score', 0)
            need_action = scores.get('need_action_score', 0)
            
            # Determine quadrant based on satisfaction and need for action
            if satisfaction >= 70 and need_action <= 30:
                quadrant = 'MAINTAIN'  # High satisfaction, low need for action
            elif satisfaction >= 70 and need_action > 30:
                quadrant = 'OPPORTUNITIES'  # High satisfaction, high need for action
            elif satisfaction < 70 and need_action <= 30:
                quadrant = 'MONITOR'  # Low satisfaction, low need for action
            else:
                quadrant = 'FIX_NOW'  # Low satisfaction, high need for action
            
            action_grid[service] = {
                'quadrant': quadrant,
                'satisfaction_score': satisfaction,
                'need_action_score': need_action,
                'confidence': scores.get('confidence', 0)
            }
            
            # Save classification to database if requested
            if save_to_db and barangay_id is not None:
                try:
                    # Prepare classification data
                    classification_data = {
                        'barangay_id': barangay_id,
                        'service_name': service,
                        'quadrant': quadrant,
                        'satisfaction_score': float(satisfaction),
                        'need_action_score': float(need_action),
                        'confidence': float(scores.get('confidence', 0)),
                        'created_at': timestamp,
                        'updated_at': timestamp
                    }
                    
                    # Insert classification into database
                    supabase = self.data_extractor._get_connection()
                    
                    # Check if classification already exists for this barangay and service
                    response = supabase.table('action_grid_classification')\
                        .select('classification_id')\
                        .eq('barangay_id', barangay_id)\
                        .eq('service_name', service)\
                        .execute()
                    
                    if response.data and len(response.data) > 0:
                        # Update existing classification
                        classification_id = response.data[0]['classification_id']
                        supabase.table('action_grid_classification')\
                            .update(classification_data)\
                            .eq('classification_id', classification_id)\
                            .execute()
                        action_grid[service]['classification_id'] = classification_id
                    else:
                        # Insert new classification
                        response = supabase.table('action_grid_classification')\
                            .insert(classification_data)\
                            .execute()
                        
                        if response.data and len(response.data) > 0:
                            action_grid[service]['classification_id'] = response.data[0]['classification_id']
                    
                except Exception as e:
                    print(f"Warning: Failed to save action grid classification to database: {str(e)}")
                    action_grid[service]['db_error'] = str(e)
        
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
    
    def save_model(self, filepath: str, model_name: str = None, description: str = None) -> Dict:
        """Save the trained model to disk and database.
        
        Args:
            filepath: Path to save the model
            model_name: Name of the model (optional)
            description: Description of the model (optional)
            
        Returns:
            Dictionary with model metadata
        """
        if self.model is None:
            raise ValueError("Model has not been trained. Call train_model() first.")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save model to disk
        self.model.save_model(filepath)
        
        # Save model metadata to database
        try:
            supabase = self.data_extractor._get_connection()
            
            # Prepare model metadata
            model_data = {
                'model_name': model_name or f"model_{os.path.basename(filepath)}",
                'model_type': self.model.model_type.upper(),
                'file_path': filepath,
                'description': description or f"Model trained on {pd.Timestamp.now().strftime('%Y-%m-%d')}",
                'metrics': json.dumps(self.model.metrics),
                'feature_importance': json.dumps(self.model.get_feature_importance().to_dict('records')),
                'created_at': pd.Timestamp.now().isoformat(),
                'updated_at': pd.Timestamp.now().isoformat(),
                'is_active': True
            }
            
            # Insert model metadata into database
            response = supabase.table('ml_model').insert(model_data).execute()
            
            if response.data and len(response.data) > 0:
                model_data['model_id'] = response.data[0]['model_id']
            
            return model_data
            
        except Exception as e:
            print(f"Warning: Failed to save model metadata to database: {str(e)}")
            return {'filepath': filepath, 'error': str(e)}