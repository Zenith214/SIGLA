#!/usr/bin/env python3
"""
Test script to check database connectivity and survey data availability
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sigla_ml.data_extraction import DataExtractor
    print("✅ Successfully imported DataExtractor")
except ImportError as e:
    print(f"❌ Failed to import DataExtractor: {e}")
    sys.exit(1)

def test_database_connection():
    """Test basic database connectivity"""
    try:
        extractor = DataExtractor()
        print("✅ DataExtractor initialized successfully")
        return extractor
    except Exception as e:
        print(f"❌ Failed to initialize DataExtractor: {e}")
        return None

def test_survey_data_for_barangay(extractor, barangay_id=17):
    """Test if survey data exists for specific barangay"""
    try:
        # Try to extract survey responses
        responses = extractor.extract_survey_responses()
        print(f"✅ Successfully extracted survey responses")
        print(f"📊 Total responses found: {len(responses) if responses is not None else 0}")
        
        if responses is not None and len(responses) > 0:
            # Filter for specific barangay
            barangay_responses = responses[responses['barangay_id'] == barangay_id] if 'barangay_id' in responses.columns else []
            print(f"📊 Responses for barangay {barangay_id}: {len(barangay_responses)}")
            
            if len(barangay_responses) > 0:
                print("✅ Found survey data for barangay 17")
                print("📋 Sample response columns:", list(responses.columns))
                return True
            else:
                print(f"⚠️  No survey data found for barangay {barangay_id}")
                print("📋 Available barangay IDs:", sorted(responses['barangay_id'].unique()) if 'barangay_id' in responses.columns else "No barangay_id column")
                return False
        else:
            print("⚠️  No survey responses found in database")
            return False
            
    except Exception as e:
        print(f"❌ Error extracting survey data: {e}")
        return False

def test_database_tables():
    """Test database table structure"""
    try:
        extractor = DataExtractor()
        
        # Try to get some basic info about available data
        print("\n🔍 Testing database table access...")
        
        # Test demographic data
        try:
            demo_data = extractor.extract_demographic_data()
            print(f"✅ Demographic data: {len(demo_data) if demo_data is not None else 0} records")
        except Exception as e:
            print(f"⚠️  Demographic data error: {e}")
        
        # Test historical performance
        try:
            hist_data = extractor.extract_historical_performance()
            print(f"✅ Historical data: {len(hist_data) if hist_data is not None else 0} records")
        except Exception as e:
            print(f"⚠️  Historical data error: {e}")
            
    except Exception as e:
        print(f"❌ Database table test failed: {e}")

def main():
    print("🧪 Testing ML Data Access for Barangay 17")
    print("=" * 50)
    
    # Test 1: Database connection
    print("\n1️⃣ Testing database connection...")
    extractor = test_database_connection()
    if not extractor:
        print("❌ Cannot proceed without database connection")
        return
    
    # Test 2: Survey data availability
    print("\n2️⃣ Testing survey data availability...")
    has_data = test_survey_data_for_barangay(extractor, 17)
    
    # Test 3: Database table structure
    print("\n3️⃣ Testing database table structure...")
    test_database_tables()
    
    # Summary
    print("\n📋 Summary:")
    print("=" * 30)
    if has_data:
        print("✅ Survey data is available for barangay 17")
        print("✅ ML analysis should work")
    else:
        print("⚠️  No survey data found for barangay 17")
        print("💡 Check if:")
        print("   - Survey responses exist in the database")
        print("   - Barangay ID 17 has completed surveys")
        print("   - Database schema matches ML script expectations")

if __name__ == "__main__":
    main()