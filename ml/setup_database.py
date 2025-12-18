#!/usr/bin/env python3
"""
Database Setup Script for SIGLA Survey System
This script creates all necessary tables in Supabase PostgreSQL database.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

def setup_database():
    """Create all necessary tables in Supabase database"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: Missing Supabase credentials in .env file")
        return False
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase successfully")
        
        # SQL commands to create tables
        sql_commands = [
            # Create enums first
            "CREATE TYPE IF NOT EXISTS barangay_seal AS ENUM ('yes', 'no');",
            "CREATE TYPE IF NOT EXISTS survey_status AS ENUM ('draft', 'ongoing', 'completed', 'archived');",
            "CREATE TYPE IF NOT EXISTS survey_cycle_status AS ENUM ('Active', 'Completed', 'Archived');",
            "CREATE TYPE IF NOT EXISTS assignment_status AS ENUM ('Active', 'Pending', 'Completed');",
            "CREATE TYPE IF NOT EXISTS backup_status AS ENUM ('Success', 'Failed');",
            "CREATE TYPE IF NOT EXISTS survey_question_question_type AS ENUM ('radio', 'checkbox', 'text', 'textarea', 'number', 'rating');",
            "CREATE TYPE IF NOT EXISTS survey_section_status AS ENUM ('pending', 'in_progress', 'completed');",
            "CREATE TYPE IF NOT EXISTS survey_response_respondent_gender AS ENUM ('Male', 'Female', 'Other');",
            "CREATE TYPE IF NOT EXISTS survey_response_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');",
            "CREATE TYPE IF NOT EXISTS survey_validation_validation_type AS ENUM ('location', 'completeness', 'consistency', 'quality');",
            "CREATE TYPE IF NOT EXISTS survey_validation_validation_status AS ENUM ('passed', 'failed', 'warning');",
            
            # Create tables
            """
            CREATE TABLE IF NOT EXISTS barangay (
                barangay_id SERIAL PRIMARY KEY,
                barangay_name TEXT UNIQUE NOT NULL,
                seal barangay_seal DEFAULT 'no',
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP,
                households INTEGER DEFAULT 0,
                population INTEGER DEFAULT 0,
                area DECIMAL,
                captain TEXT,
                currentStatus TEXT,
                history TEXT
            );
            """,
            
            """
            CREATE TABLE IF NOT EXISTS "user" (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "firstName" TEXT NOT NULL,
                "jobTitle" TEXT,
                "lastName" TEXT NOT NULL,
                organization TEXT,
                phone TEXT,
                "lastLogin" TIMESTAMP,
                role TEXT DEFAULT 'Viewer',
                status TEXT DEFAULT 'Active'
            );
            """,
            
            """
            CREATE TABLE IF NOT EXISTS assignment (
                assignment_id SERIAL PRIMARY KEY,
                barangay_id INTEGER REFERENCES barangay(barangay_id),
                user_id INTEGER REFERENCES "user"(id),
                status assignment_status DEFAULT 'Pending',
                progress INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            );
            """,
            
            """
            CREATE TABLE IF NOT EXISTS survey_target (
                target_id SERIAL PRIMARY KEY,
                barangay_id INTEGER REFERENCES barangay(barangay_id),
                target INTEGER NOT NULL,
                achieved INTEGER DEFAULT 0,
                percentage INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            );
            """,
            
            """
            CREATE TABLE IF NOT EXISTS survey (
                survey_id SERIAL PRIMARY KEY,
                barangay_id INTEGER REFERENCES barangay(barangay_id),
                status survey_status DEFAULT 'draft',
                analyzed_data TEXT,
                raw_data TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            );
            """,
            
            """
            CREATE TABLE IF NOT EXISTS survey_response (
                response_id SERIAL PRIMARY KEY,
                survey_number TEXT UNIQUE NOT NULL,
                barangay_id INTEGER REFERENCES barangay(barangay_id),
                interviewer_id INTEGER REFERENCES "user"(id),
                respondent_name TEXT,
                respondent_age INTEGER,
                respondent_gender survey_response_respondent_gender,
                location_lat DECIMAL NOT NULL,
                location_lng DECIMAL NOT NULL,
                location_address TEXT,
                location_accuracy DECIMAL,
                location_timestamp TIMESTAMP,
                location_barangay TEXT,
                location_municipality TEXT,
                location_province TEXT,
                status survey_response_status DEFAULT 'draft',
                progress INTEGER DEFAULT 0,
                started_at TIMESTAMP DEFAULT NOW(),
                completed_at TIMESTAMP,
                submitted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP
            );
            """
        ]
        
        # Execute each SQL command
        for i, sql in enumerate(sql_commands, 1):
            try:
                result = supabase.rpc('exec_sql', {'sql': sql.strip()})
                print(f"✅ Command {i}/{len(sql_commands)} executed successfully")
            except Exception as e:
                print(f"⚠️  Command {i} failed (might already exist): {str(e)[:100]}...")
                continue
        
        print("\n🎉 Database setup completed!")
        print("\n📋 Next steps:")
        print("1. Run 'python verify_database.py' to verify tables")
        print("2. Test the ML environment with 'python test_ml.py'")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False

if __name__ == "__main__":
    setup_database()