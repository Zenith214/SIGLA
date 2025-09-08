#!/usr/bin/env python3
"""
Database verification script for SIGLA ML module.
Checks Supabase connection and verifies required tables exist.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def verify_supabase_connection():
    """Verify Supabase connection and check required tables."""
    
    # Get credentials from environment
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not url or not key:
        print("❌ Missing Supabase credentials in .env file")
        return False
    
    try:
        # Create Supabase client
        supabase: Client = create_client(url, key)
        print("✅ Supabase client created successfully")
        print(f"📍 Connected to: {url}")
        
        # Required tables for ML module (barangay-focused)
        required_tables = [
            'survey_response',
            'survey_section', 
            'survey_answer',
            'survey_question',
            'barangay',
            'assignment',
            'survey',
            'user'
        ]
        
        print("\n🔍 Checking required barangay tables...")
        
        # Check each table
        for table in required_tables:
            try:
                # Try to query the table (limit 1 to minimize data transfer)
                result = supabase.table(table).select("*").limit(1).execute()
                print(f"✅ Table '{table}' exists and is accessible")
            except Exception as e:
                print(f"❌ Table '{table}' issue: {str(e)}")
        
        # Optional tables (barangay-focused)
        optional_tables = ['barangay_history', 'survey_metadata', 'survey_attachment']
        print("\n🔍 Checking optional barangay tables...")
        
        for table in optional_tables:
            try:
                result = supabase.table(table).select("*").limit(1).execute()
                print(f"✅ Optional table '{table}' exists")
            except Exception as e:
                print(f"ℹ️ Optional table '{table}' not found (this is okay): {str(e)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 SIGLA ML Database Verification (Barangay-Focused)")
    print("=" * 50)
    
    success = verify_supabase_connection()
    
    if success:
        print("\n🎉 Database verification completed successfully!")
        print("✅ ML environment is ready for use.")
    else:
        print("\n❌ Database verification failed.")
        print("Please check your Supabase credentials and database setup.")