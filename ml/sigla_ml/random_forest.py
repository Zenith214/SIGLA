#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
from typing import Dict, List, Optional, Tuple, Union

class RandomForestModel:
    """Random Forest model for SIGLA survey data analysis."""
    
    def __init__(self, model_type: str = 'regressor'):
        """Initialize the Random Forest model.
        
        Args:
            model_type: Type of model ('regressor' or 'classifier')
        """
        self.model_type = model_type
        self.model = None
        self.feature_importance = None
        self.feature_names = None
    
    def train(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, 
              random_state: int = 42, optimize: bool = False) -> Dict:
        """Train the Random Forest model.
        
        Args:
            X: Feature matrix
            y: Target variable
            test_size: Proportion of data to use for testing
            random_state: Random seed for reproducibility
            optimize: Whether to optimize hyperparameters
            
        Returns:
            Dictionary with model performance metrics
        """
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        # Initialize model based on type
        if self.model_type == 'regressor':
            if optimize:
                # Hyperparameter optimization for regressor
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [None, 10, 20, 30],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
                
                base_model = RandomForestRegressor(random_state=random_state)
                grid_search = GridSearchCV(
                    base_model, param_grid, cv=5, scoring='neg_mean_squared_error',
                    n_jobs=-1, verbose=1
                )
                grid_search.fit(X_train, y_train)
                self.model = grid_search.best_estimator_
            else:
                # Use default parameters
                self.model = RandomForestRegressor(
                    n_estimators=100, random_state=random_state
                )
                self.model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test)
            
            # Calculate metrics
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_pred)
            
            metrics = {
                'mse': mse,
                'rmse': rmse,
                'r2': r2,
                'model_type': 'regressor'
            }
            
        elif self.model_type == 'classifier':
            if optimize:
                # Hyperparameter optimization for classifier
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [None, 10, 20, 30],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
                
                base_model = RandomForestClassifier(random_state=random_state)
                grid_search = GridSearchCV(
                    base_model, param_grid, cv=5, scoring='accuracy',
                    n_jobs=-1, verbose=1
                )
                grid_search.fit(X_train, y_train)
                self.model = grid_search.best_estimator_
            else:
                # Use default parameters
                self.model = RandomForestClassifier(
                    n_estimators=100, random_state=random_state
                )
                self.model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(y_test, y_pred, output_dict=True)
            
            metrics = {
                'accuracy': accuracy,
                'classification_report': report,
                'model_type': 'classifier'
            }
        
        else:
            raise ValueError("model_type must be 'regressor' or 'classifier'")
        
        # Store feature importance
        self.feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return metrics
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions using the trained model.
        
        Args:
            X: Feature matrix for prediction
            
        Returns:
            Array of predictions
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet. Call train() first.")
        
        return self.model.predict(X)
    
    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Get prediction probabilities (for classifiers only).
        
        Args:
            X: Feature matrix for prediction
            
        Returns:
            Array of prediction probabilities
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet. Call train() first.")
        
        if self.model_type != 'classifier':
            raise ValueError("predict_proba is only available for classifiers")
        
        return self.model.predict_proba(X)
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature importance scores.
        
        Returns:
            DataFrame with feature names and importance scores
        """
        if self.feature_importance is None:
            raise ValueError("Model has not been trained yet. Call train() first.")
        
        return self.feature_importance
    
    def save_model(self, filepath: str) -> None:
        """Save the trained model to disk.
        
        Args:
            filepath: Path to save the model
        """
        if self.model is None:
            raise ValueError("Model has not been trained yet. Call train() first.")
        
        model_data = {
            'model': self.model,
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance
        }
        
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath: str) -> None:
        """Load a trained model from disk.
        
        Args:
            filepath: Path to the saved model
        """
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.model_type = model_data['model_type']
        self.feature_names = model_data['feature_names']
        self.feature_importance = model_data['feature_importance']