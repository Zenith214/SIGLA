#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Python script to run funnel calculations for integration testing.

This script reads JSON input from stdin, runs the Python funnel calculation,
and outputs the result as JSON to stdout.
"""

import sys
import json
import os

# Add ml directory to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml'))
sys.path.insert(0, ml_path)

from sigla_ml.feature_engineering import FeatureEngineer


def main():
    """Main function to run Python funnel calculations."""
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        
        responses = input_data['responses']
        service_area = input_data['service_area']
        
        # Create feature engineer instance
        engineer = FeatureEngineer()
        
        # Calculate funnel metrics
        result = engineer._calculate_funnel_metrics(responses, service_area)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Output error to stderr
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.exit(1)


if __name__ == '__main__':
    main()
