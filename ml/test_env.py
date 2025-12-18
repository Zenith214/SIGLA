#!/usr/bin/env python3
"""
Test script to check environment variables
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔍 Checking Environment Variables")
print("=" * 40)

# Check Supabase variables
supabase_vars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_POSTGRES_URL'
]

for var in supabase_vars:
    value = os.getenv(var)
    if value:
        # Mask sensitive keys
        if 'key' in var.lower() or 'url' in var.lower():
            masked_value = value[:10] + "..." + value[-10:] if len(value) > 20 else value[:5] + "..."
            print(f"✅ {var}: {masked_value}")
        else:
            print(f"✅ {var}: {value}")
    else:
        print(f"❌ {var}: Not found")

print("\n💡 For ML to work, you need:")
print("   - NEXT_PUBLIC_SUPABASE_URL")
print("   - SUPABASE_SERVICE_ROLE_KEY (for full database access)")
print("   - Or DATABASE_URL for direct PostgreSQL connection")