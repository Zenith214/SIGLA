#!/usr/bin/env python
"""
Barangay Analysis Script

This script analyzes survey data for a specific barangay and generates insights
and recommendations based on the analysis results.

Usage:
    python analyze_barangay.py --barangay_id <barangay_id>
"""

import argparse
import json
import os
import sys
import logging
import warnings
from dotenv import load_dotenv

# Suppress all warnings to ensure clean JSON output
warnings.filterwarnings('ignore')
os.environ['PYTHONWARNINGS'] = 'ignore'

# Add the parent directory to the path so we can import the sigla_ml package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sigla_ml.api import SiglaMLAPI

# Configure logging - only to file to avoid mixing with JSON output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'analysis.log'))
    ]
)
logger = logging.getLogger('analyze_barangay')

def main():
    # Load environment variables
    load_dotenv()
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Analyze survey data for a specific barangay')
    parser.add_argument('--barangay_id', type=int, required=True, help='ID of the barangay to analyze')
    args = parser.parse_args()
    
    try:
        # Initialize the ML API
        api = SiglaMLAPI()
        logger.info(f"Analyzing barangay ID: {args.barangay_id}")
        
        # Analyze the barangay (disable DB saves for now to avoid permission errors)
        result = api.analyze_barangay(barangay_id=args.barangay_id, save_to_db=True)
        
        # Output the result as JSON
        print(json.dumps(result))
        
        logger.info(f"Analysis completed successfully for barangay ID: {args.barangay_id}")
        return 0
    except Exception as e:
        logger.error(f"Error analyzing barangay ID {args.barangay_id}: {str(e)}")
        print(json.dumps({
            'error': str(e),
            'barangay_id': args.barangay_id
        }))
        return 1

if __name__ == '__main__':
    sys.exit(main())