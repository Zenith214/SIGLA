#!/usr/bin/env python3
"""
Debug script to examine the actual survey data structure
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sigla_ml.data_extraction import DataExtractor

def debug_survey_data():
    """Debug the survey data structure"""
    try:
        extractor = DataExtractor()
        
        # Extract survey responses for barangay 17
        filters = {'barangay_id': 17}
        survey_data = extractor.extract_survey_responses(filters)
        
        print("🔍 Survey Data Debug")
        print("=" * 50)
        print(f"📊 Total records: {len(survey_data)}")
        print(f"📋 Columns: {list(survey_data.columns)}")
        
        if len(survey_data) > 0:
            print("\n📝 Sample record:")
            print("-" * 30)
            sample = survey_data.iloc[0]
            for col, value in sample.items():
                if col == 'section_data_parsed':
                    print(f"{col}: {type(value)} - {value}")
                else:
                    print(f"{col}: {value}")
            
            print("\n📊 Section breakdown:")
            print("-" * 30)
            section_counts = survey_data['section_name'].value_counts()
            for section, count in section_counts.items():
                print(f"{section}: {count} responses")
            
            print("\n🔍 Sample section data:")
            print("-" * 30)
            for section in survey_data['section_name'].unique()[:3]:
                section_data = survey_data[survey_data['section_name'] == section].iloc[0]
                print(f"\n{section}:")
                section_parsed = section_data.get('section_data_parsed', {})
                if isinstance(section_parsed, dict):
                    for key, value in list(section_parsed.items())[:5]:  # Show first 5 keys
                        print(f"  {key}: {value}")
                    if len(section_parsed) > 5:
                        print(f"  ... and {len(section_parsed) - 5} more keys")
                else:
                    print(f"  Data type: {type(section_parsed)}")
        
        # Now process the data
        print("\n🔄 Processing survey data...")
        processed_data = extractor.process_survey_responses(survey_data)
        
        print(f"📊 Processed records: {len(processed_data)}")
        print(f"📋 Processed columns: {list(processed_data.columns)}")
        
        if len(processed_data) > 0:
            print("\n📝 Sample processed record:")
            print("-" * 30)
            sample = processed_data.iloc[0]
            for col, value in sample.items():
                print(f"{col}: {value}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_survey_data()