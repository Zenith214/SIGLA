#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os
from datetime import datetime
import logging

class BarangayMLModel:
    """Machine Learning model for barangay service delivery predictions."""
    
    def __init__(self, model_type='regression'):
        """Initialize the ML model.
        
        Args:
            model_type (str): Type of model - 'regression' or 'classification'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = None
        self.target_column = None
        self.model_metrics = {}
        
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Initialize model based on type
        if model_type == 'regression':
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
        else:
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
    
    def prepare_target_variable(self, features_df, target_type='service_priority'):
        """Prepare target variable for training.
        
        Args:
            features_df (pd.DataFrame): Feature matrix
            target_type (str): Type of target variable to create
        
        Returns:
            pd.Series: Target variable
        """
        if target_type == 'service_priority':
            # Create service priority score based on need_action_score and satisfaction_score
            priority_score = (
                features_df['need_action_score'].fillna(0) * 0.6 +
                (100 - features_df['satisfaction_score'].fillna(50)) * 0.4
            )
            
            if self.model_type == 'classification':
                # Convert to categorical: High (>70), Medium (40-70), Low (<40)
                target = pd.cut(priority_score, 
                              bins=[0, 40, 70, 100], 
                              labels=['Low', 'Medium', 'High'])
                return target
            else:
                return priority_score
                
        elif target_type == 'satisfaction_level':
            satisfaction = features_df['satisfaction_score'].fillna(50)
            
            if self.model_type == 'classification':
                # Convert to categorical: High (>80), Medium (50-80), Low (<50)
                target = pd.cut(satisfaction,
                              bins=[0, 50, 80, 100],
                              labels=['Low', 'Medium', 'High'])
                return target
            else:
                return satisfaction
        
        else:
            raise ValueError(f"Unknown target_type: {target_type}")
    
    def train_model(self, features_df, target_type='service_priority', test_size=0.2):
        """Train the Random Forest model.
        
        Args:
            features_df (pd.DataFrame): Feature matrix
            target_type (str): Type of target variable
            test_size (float): Proportion of data for testing
        
        Returns:
            dict: Training results and metrics
        """
        self.logger.info(f"Starting model training with {len(features_df)} samples")
        
        # Prepare target variable
        y = self.prepare_target_variable(features_df, target_type)
        self.target_column = target_type
        
        # Remove target-related columns from features
        feature_cols = [col for col in features_df.columns 
                       if not any(target_col in col.lower() 
                                for target_col in ['satisfaction', 'need_action', 'priority'])]
        
        X = features_df[feature_cols].copy()
        
        # Handle missing values
        X = X.fillna(X.mean() if X.select_dtypes(include=[np.number]).shape[1] > 0 else 0)
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        # Encode categorical target if classification
        if self.model_type == 'classification':
            y = self.label_encoder.fit_transform(y.astype(str))
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y if self.model_type == 'classification' else None
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.logger.info("Training Random Forest model...")
        self.model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred_train = self.model.predict(X_train_scaled)
        y_pred_test = self.model.predict(X_test_scaled)
        
        # Calculate metrics
        if self.model_type == 'regression':
            train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
            test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
            train_r2 = r2_score(y_train, y_pred_train)
            test_r2 = r2_score(y_test, y_pred_test)
            
            self.model_metrics = {
                'train_rmse': train_rmse,
                'test_rmse': test_rmse,
                'train_r2': train_r2,
                'test_r2': test_r2,
                'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_))
            }
            
            self.logger.info(f"Training RMSE: {train_rmse:.4f}, R²: {train_r2:.4f}")
            self.logger.info(f"Testing RMSE: {test_rmse:.4f}, R²: {test_r2:.4f}")
            
        else:
            train_accuracy = self.model.score(X_train_scaled, y_train)
            test_accuracy = self.model.score(X_test_scaled, y_test)
            
            self.model_metrics = {
                'train_accuracy': train_accuracy,
                'test_accuracy': test_accuracy,
                'classification_report': classification_report(y_test, y_pred_test),
                'confusion_matrix': confusion_matrix(y_test, y_pred_test).tolist(),
                'feature_importance': dict(zip(self.feature_names, self.model.feature_importances_))
            }
            
            self.logger.info(f"Training Accuracy: {train_accuracy:.4f}")
            self.logger.info(f"Testing Accuracy: {test_accuracy:.4f}")
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
        self.model_metrics['cv_mean'] = cv_scores.mean()
        self.model_metrics['cv_std'] = cv_scores.std()
        
        self.logger.info(f"Cross-validation: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        return self.model_metrics
    
    def predict_barangay_priorities(self, features_df):
        """Predict service priorities for barangays.
        
        Args:
            features_df (pd.DataFrame): Feature matrix for prediction
        
        Returns:
            pd.DataFrame: Predictions with barangay information
        """
        if self.model is None:
            raise ValueError("Model not trained yet. Call train_model() first.")
        
        # Prepare features
        feature_cols = [col for col in features_df.columns if col in self.feature_names]
        X = features_df[feature_cols].copy()
        X = X.fillna(X.mean() if X.select_dtypes(include=[np.number]).shape[1] > 0 else 0)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        
        # Get prediction probabilities for classification
        if self.model_type == 'classification':
            probabilities = self.model.predict_proba(X_scaled)
            # Decode labels
            predictions = self.label_encoder.inverse_transform(predictions)
        
        # Create results DataFrame
        results = features_df[['barangay_id', 'barangay_name', 'section_name']].copy()
        results['predicted_priority'] = predictions
        
        if self.model_type == 'classification':
            # Add probability columns
            for i, class_name in enumerate(self.label_encoder.classes_):
                results[f'prob_{class_name}'] = probabilities[:, i]
        
        # Add confidence based on model certainty
        if self.model_type == 'classification':
            results['confidence'] = np.max(probabilities, axis=1)
        else:
            # For regression, use prediction interval as confidence proxy
            results['confidence'] = 1.0  # Simplified for now
        
        return results.sort_values('predicted_priority', ascending=False)
    
    def save_model(self, filepath):
        """Save the trained model to disk.
        
        Args:
            filepath (str): Path to save the model
        """
        if self.model is None:
            raise ValueError("No model to save. Train a model first.")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder if self.model_type == 'classification' else None,
            'feature_names': self.feature_names,
            'target_column': self.target_column,
            'model_type': self.model_type,
            'model_metrics': self.model_metrics,
            'timestamp': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, filepath)
        self.logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load a trained model from disk.
        
        Args:
            filepath (str): Path to the saved model
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoder = model_data.get('label_encoder')
        self.feature_names = model_data['feature_names']
        self.target_column = model_data['target_column']
        self.model_type = model_data['model_type']
        self.model_metrics = model_data['model_metrics']
        
        self.logger.info(f"Model loaded from {filepath}")
        self.logger.info(f"Model trained on: {model_data.get('timestamp', 'Unknown')}")
    
    def get_feature_importance(self, top_n=10):
        """Get top feature importances.
        
        Args:
            top_n (int): Number of top features to return
        
        Returns:
            dict: Top feature importances
        """
        if 'feature_importance' not in self.model_metrics:
            raise ValueError("Model not trained or feature importance not available")
        
        importance = self.model_metrics['feature_importance']
        sorted_importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
        
        return dict(list(sorted_importance.items())[:top_n])