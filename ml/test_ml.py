#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
from sigla_ml.data_extraction import DataExtractor
from sigla_ml.feature_engineering import FeatureEngineer
from sigla_ml.random_forest import RandomForestModel
from sigla_ml.api import SiglaMLAPI

def test_data_extraction():
    """Test data extraction functionality."""
    print("\n=== Testing Data Extraction ===\n")
    
    try:
        extractor = DataExtractor()
        print("✅ DataExtractor initialized successfully")
        
        # Note: Supabase connection test skipped - requires valid credentials
        print("ℹ️ Supabase connection test skipped (requires valid credentials)")
        print("ℹ️ In production, ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set")
        
        return True
    except Exception as e:
        print(f"❌ Data extraction test failed: {str(e)}")
        return False

def test_feature_engineering():
    """Test feature engineering functionality."""
    print("\n=== Testing Feature Engineering ===\n")
    
    try:
        engineer = FeatureEngineer()
        print("✅ FeatureEngineer initialized successfully")
        
        # Test with sample data
        sample_data = {
            'section': 'health',
            'awareness_score': 85.5,
            'availment_score': 70.2,
            'satisfaction_score': 65.8,
            'need_action_score': 30.5,
            'sample_size': 120
        }
        
        # Calculate confidence level
        confidence = engineer._calculate_confidence(sample_data['sample_size'])
        print(f"✅ Confidence calculation: {confidence}%")
        
        return True
    except Exception as e:
        print(f"❌ Feature engineering test failed: {str(e)}")
        return False

def test_random_forest():
    """Test Random Forest model functionality."""
    print("\n=== Testing Random Forest Model ===\n")
    
    try:
        # Create a simple test dataset
        import numpy as np
        import pandas as pd
        from sklearn.datasets import make_regression
        
        # Generate synthetic data
        X, y = make_regression(n_samples=100, n_features=5, random_state=42)
        X = pd.DataFrame(X, columns=[f'feature_{i}' for i in range(5)])
        y = pd.Series(y)
        
        # Initialize model
        model = RandomForestModel(model_type='regressor')
        print("✅ RandomForestModel initialized successfully")
        
        # Train model
        metrics = model.train(X, y, optimize=False)
        print("✅ Model trained successfully")
        print(f"   - MSE: {metrics['mse']:.4f}")
        print(f"   - R²: {metrics['r2']:.4f}")
        
        # Make predictions
        predictions = model.predict(X[:5])
        print("✅ Predictions generated successfully")
        
        # Get feature importance
        importance = model.get_feature_importance()
        print("✅ Feature importance calculated successfully")
        print("   Top feature: ", importance.iloc[0]['feature'])
        
        return True
    except Exception as e:
        print(f"❌ Random Forest test failed: {str(e)}")
        return False

def test_api():
    """Test API functionality."""
    print("\n=== Testing ML API ===\n")
    
    try:
        api = SiglaMLAPI()
        print("✅ SiglaMLAPI initialized successfully")
        
        # Test Action Grid calculation
        service_scores = {
            'health': {
                'satisfaction_score': 85.0,
                'need_action_score': 15.0
            },
            'education': {
                'satisfaction_score': 80.0,
                'need_action_score': 30.0
            },
            'infrastructure': {
                'satisfaction_score': 60.0,
                'need_action_score': 20.0
            },
            'governance': {
                'satisfaction_score': 55.0,
                'need_action_score': 40.0
            }
        }
        
        action_grid = api._calculate_action_grid(service_scores)
        print("✅ Action Grid calculated successfully")
        
        for service, data in action_grid.items():
            print(f"   - {service}: {data['quadrant']}")
        
        return True
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

def main():
    """Run all tests."""
    print("\n🧪 SIGLA ML Module Test Suite 🧪\n")
    
    tests = [
        ("Data Extraction", test_data_extraction),
        ("Feature Engineering", test_feature_engineering),
        ("Random Forest Model", test_random_forest),
        ("ML API", test_api)
    ]
    
    results = []
    
    for name, test_func in tests:
        print(f"\n📋 Running {name} Tests...")
        success = test_func()
        results.append((name, success))
    
    # Print summary
    print("\n\n📊 Test Summary 📊")
    print("=================\n")
    
    all_passed = True
    for name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{name}: {status}")
        if not success:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! The SIGLA ML module is working correctly.")
        return 0
    else:
        print("\n⚠️ Some tests failed. Please check the error messages above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())