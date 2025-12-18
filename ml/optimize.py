#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import argparse
import pandas as pd
import numpy as np
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score
from sigla_ml.api import SiglaMLAPI
from sigla_ml.data_extraction import DataExtractor
from sigla_ml.feature_engineering import FeatureEngineer
from sigla_ml.random_forest import RandomForestModel

def optimize_model(target_type='satisfaction', n_iter=20, cv=5):
    """Optimize Random Forest model hyperparameters.
    
    Args:
        target_type: Target variable type ('satisfaction', 'awareness', etc.)
        n_iter: Number of parameter settings sampled in RandomizedSearchCV
        cv: Number of cross-validation folds
        
    Returns:
        Dictionary with optimization results
    """
    print(f"Optimizing Random Forest model for {target_type}...")
    
    # Extract data
    data_extractor = DataExtractor()
    feature_engineer = FeatureEngineer()
    
    # Get survey data
    survey_data = data_extractor.extract_survey_data()
    processed_data = data_extractor.process_survey_responses(survey_data)
    
    # Get demographic data
    demographic_data = data_extractor.extract_demographic_data()
    
    # Prepare features
    features = feature_engineer.prepare_features(processed_data, demographic_data)
    
    # Prepare target variable based on target_type
    if target_type == 'satisfaction':
        target_col = 'health_satisfaction'
    elif target_type == 'awareness':
        target_col = 'health_aware'
    else:
        raise ValueError(f"Unsupported target type: {target_type}")
    
    if target_col not in features.columns:
        raise ValueError(f"Target column {target_col} not found in features")
    
    target = features[target_col]
    
    # Remove target and non-feature columns from features
    feature_cols = [col for col in features.columns if col not in 
                   ['response_id', 'barangay_id', target_col]]
    X = features[feature_cols]
    y = target
    
    # Define parameter grid for RandomizedSearchCV
    param_grid = {
        'n_estimators': [50, 100, 200, 300, 500],
        'max_depth': [None, 10, 20, 30, 40, 50],
        'min_samples_split': [2, 5, 10, 15, 20],
        'min_samples_leaf': [1, 2, 4, 6, 8],
        'max_features': ['auto', 'sqrt', 'log2', None],
        'bootstrap': [True, False]
    }
    
    # Initialize model based on target type
    model_type = 'regressor' if target_type == 'satisfaction' else 'classifier'
    rf_model = RandomForestModel(model_type=model_type)
    
    if model_type == 'regressor':
        from sklearn.ensemble import RandomForestRegressor
        base_model = RandomForestRegressor(random_state=42)
    else:
        from sklearn.ensemble import RandomForestClassifier
        base_model = RandomForestClassifier(random_state=42)
    
    # Run RandomizedSearchCV
    random_search = RandomizedSearchCV(
        base_model, 
        param_distributions=param_grid, 
        n_iter=n_iter,
        cv=cv, 
        verbose=2, 
        random_state=42, 
        n_jobs=-1,
        scoring='neg_mean_squared_error' if model_type == 'regressor' else 'accuracy'
    )
    
    random_search.fit(X, y)
    
    # Get best parameters and model
    best_params = random_search.best_params_
    best_model = random_search.best_estimator_
    
    # Evaluate best model
    y_pred = best_model.predict(X)
    
    if model_type == 'regressor':
        mse = mean_squared_error(y, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y, y_pred)
        
        metrics = {
            'mse': mse,
            'rmse': rmse,
            'r2': r2
        }
    else:
        accuracy = accuracy_score(y, y_pred)
        
        metrics = {
            'accuracy': accuracy
        }
    
    # Save best model
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
    os.makedirs(output_dir, exist_ok=True)
    
    model_path = os.path.join(output_dir, f"optimized_{target_type}_model.joblib")
    
    # Set model and save
    rf_model.model = best_model
    rf_model.save_model(model_path)
    
    # Get feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': best_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    return {
        'best_params': best_params,
        'metrics': metrics,
        'model_path': model_path,
        'feature_importance': feature_importance.to_dict('records')
    }

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='SIGLA ML Model Optimization')
    parser.add_argument('--target', default='satisfaction', 
                        choices=['satisfaction', 'awareness', 'availment'],
                        help='Target variable type')
    parser.add_argument('--iterations', type=int, default=20,
                        help='Number of parameter combinations to try')
    parser.add_argument('--cv', type=int, default=5,
                        help='Number of cross-validation folds')
    parser.add_argument('--output', default='optimization_results.json',
                        help='Path to output JSON file')
    args = parser.parse_args()
    
    try:
        # Run optimization
        results = optimize_model(
            target_type=args.target,
            n_iter=args.iterations,
            cv=args.cv
        )
        
        # Write results to file
        with open(args.output, 'w') as f:
            # Convert numpy types to Python native types for JSON serialization
            json_results = json.dumps(results, default=lambda x: float(x) if isinstance(x, (np.float32, np.float64)) else x)
            f.write(json_results)
        
        print(f"Optimization complete. Results saved to {args.output}")
        print(f"Best model saved to {results['model_path']}")
        print(f"Best parameters: {results['best_params']}")
        print(f"Performance metrics: {results['metrics']}")
        
        # Print top 10 features by importance
        print("\nTop 10 features by importance:")
        for i, feature in enumerate(results['feature_importance'][:10]):
            print(f"{i+1}. {feature['feature']}: {feature['importance']:.4f}")
        
        sys.exit(0)
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()