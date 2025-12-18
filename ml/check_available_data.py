#!/usr/bin/env python3
"""
Quick script to check what survey data is available in the database
"""

import os
import sys
from dotenv import load_dotenv
import psycopg2
import json

# Load environment variables
load_dotenv()

def get_database_url():
    """Get database URL from environment"""
    # Try different environment variable names
    db_url = (
        os.getenv('DATABASE_URL') or 
        os.getenv('NEXT_PUBLIC_SUPABASE_POSTGRES_URL') or
        os.getenv('SUPABASE_DB_URL')
    )
    
    if not db_url:
        print("❌ No database URL found in environment variables")
        print("💡 Expected variables: DATABASE_URL, NEXT_PUBLIC_SUPABASE_POSTGRES_URL, or SUPABASE_DB_URL")
        return None
    
    return db_url

def check_survey_data():
    """Check what survey data exists"""
    db_url = get_database_url()
    if not db_url:
        return
    
    try:
        # Connect to database
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        print("✅ Connected to database successfully")
        
        # Check survey_response table
        print("\n📊 Checking survey_response table...")
        cursor.execute("""
            SELECT 
                barangay_id, 
                COUNT(*) as response_count,
                MIN(created_at) as first_response,
                MAX(created_at) as last_response
            FROM survey_response 
            GROUP BY barangay_id 
            ORDER BY barangay_id
        """)
        
        responses = cursor.fetchall()
        
        if responses:
            print(f"✅ Found survey responses for {len(responses)} barangays:")
            print("Barangay ID | Responses | First Response | Last Response")
            print("-" * 60)
            for row in responses:
                print(f"{row[0]:10} | {row[1]:8} | {row[2]} | {row[3]}")
        else:
            print("⚠️  No survey responses found")
        
        # Check survey_section table
        print("\n📋 Checking survey_section table...")
        cursor.execute("""
            SELECT 
                sr.barangay_id,
                COUNT(ss.section_id) as section_count,
                COUNT(DISTINCT ss.section_key) as unique_sections
            FROM survey_response sr
            LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
            GROUP BY sr.barangay_id
            ORDER BY sr.barangay_id
        """)
        
        sections = cursor.fetchall()
        
        if sections:
            print("Barangay ID | Sections | Unique Section Types")
            print("-" * 45)
            for row in sections:
                print(f"{row[0]:10} | {row[1]:7} | {row[2]}")
        else:
            print("⚠️  No survey sections found")
        
        # Check specific barangay 17
        print(f"\n🔍 Detailed check for Barangay 17...")
        cursor.execute("""
            SELECT 
                sr.response_id,
                sr.survey_number,
                sr.status,
                sr.progress,
                COUNT(ss.section_id) as sections
            FROM survey_response sr
            LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
            WHERE sr.barangay_id = 17
            GROUP BY sr.response_id, sr.survey_number, sr.status, sr.progress
            ORDER BY sr.created_at DESC
            LIMIT 5
        """)
        
        barangay_17_data = cursor.fetchall()
        
        if barangay_17_data:
            print("✅ Found data for Barangay 17:")
            print("Response ID | Survey # | Status | Progress | Sections")
            print("-" * 55)
            for row in barangay_17_data:
                print(f"{row[0]:10} | {row[1]:7} | {row[2]:8} | {row[3]:7}% | {row[4]}")
        else:
            print("❌ No data found for Barangay 17")
        
        # Check section data for barangay 17
        print(f"\n📋 Section data for Barangay 17...")
        cursor.execute("""
            SELECT 
                ss.section_key,
                ss.section_name,
                COUNT(*) as count,
                ss.status
            FROM survey_response sr
            JOIN survey_section ss ON sr.response_id = ss.response_id
            WHERE sr.barangay_id = 17
            GROUP BY ss.section_key, ss.section_name, ss.status
            ORDER BY ss.section_key
        """)
        
        section_data = cursor.fetchall()
        
        if section_data:
            print("Section Key | Section Name | Count | Status")
            print("-" * 50)
            for row in section_data:
                print(f"{row[0]:10} | {row[1]:15} | {row[2]:4} | {row[3]}")
        else:
            print("❌ No section data found for Barangay 17")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")

def main():
    print("🔍 Checking Available Survey Data")
    print("=" * 40)
    check_survey_data()

if __name__ == "__main__":
    main()