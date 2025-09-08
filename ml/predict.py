#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import argparse
from sigla_ml.api import SiglaMLAPI

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='SIGLA ML Prediction Script')
    parser.add_argument('--input', required=True, help='Path to input JSON file')
    parser.add_argument('--output', required=True, help='Path to output JSON file')
    parser.add_argument('--model', help='Path to pre-trained model file')
    args = parser.parse_args()
    
    try:
        # Load input data
        with open(args.input, 'r') as f:
            input_data = json.load(f)
        
        # Initialize API with model if provided
        api = SiglaMLAPI(model_path=args.model if args.model else None)
        
        # Process based on action type
        action = input_data.get('action', 'predict')
        result = {}
        
        if action == 'predict':
            # Make prediction
            features = input_data.get('features', {})
            result = api.predict(features)
        elif action == 'analyze':
            # Analyze barangay
            barangay_id = input_data.get('barangay_id')
            if not barangay_id:
                raise ValueError("barangay_id is required for analysis")
            result = api.analyze_barangay(barangay_id)
        elif action == 'train':
            # Train model
            barangay_id = input_data.get('barangay_id')
            date_range = input_data.get('date_range')
            target_type = input_data.get('target_type', 'satisfaction')
            optimize = input_data.get('optimize', False)
            
            result = api.train_model(
                barangay_id=barangay_id,
                date_range=date_range,
                target_type=target_type,
                optimize=optimize
            )
            
            # Save model if path provided
            if 'model_output_path' in input_data:
                api.model.save_model(input_data['model_output_path'])
                result['model_saved'] = input_data['model_output_path']
        else:
            raise ValueError(f"Unknown action: {action}")
        
        # Write output
        with open(args.output, 'w') as f:
            json.dump(result, f)
        
        print(f"Successfully processed {action} request")
        sys.exit(0)
    
    except Exception as e:
        # Write error to output file
        error_result = {
            'error': str(e),
            'success': False
        }
        
        with open(args.output, 'w') as f:
            json.dump(error_result, f)
        
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()