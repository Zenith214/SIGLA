#!/usr/bin/env python3
"""
Check what tables actually exist in the Supabase database.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def check_existing_tables():
    """Check what tables exist in the database."""
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Use service role for better permissions
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    try:
        supabase: Client = create_client(url, key)
        print("✅ Connected to Supabase with service role")
        
        # Check common table names
        print("\n🔍 Checking common table names...")
        # Based on actual Prisma schema
        common_tables = [
            'barangay',
            'survey_response', 
            'survey_answer',
            'survey_question',
            'survey_section',
            'survey_validation',
            'user',
            'survey',
            'assignment',
            'survey_cycle',
            'barangay_history'
        ]
        
        existing_tables = []
        for table in common_tables:
            try:
                result = supabase.table(table).select("*").limit(1).execute()
                existing_tables.append(table)
                print(f"✅ Found table: {table}")
            except Exception as e:
                # Only show error for debugging if needed
                pass
        
        if existing_tables:
            print(f"\n📋 Found {len(existing_tables)} tables:")
            for table in existing_tables:
                print(f"• {table}")
        else:
            print("\n❌ No tables found with common names")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🔍 Checking Database Tables")
    print("=" * 30)
    check_existing_tables()