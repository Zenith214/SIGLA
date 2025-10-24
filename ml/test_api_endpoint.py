#!/usr/bin/env python3
"""
Test the FastAPI endpoint directly
"""

import requests
import json
import time
import subprocess
import sys
import os
from threading import Thread

def start_server_background():
    """Start the FastAPI server in background"""
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    subprocess.run([sys.executable, "start_server.py"], cwd=ml_dir)

def test_api_endpoint():
    """Test the community voice API endpoint"""
    print("🧪 Testing FastAPI Community Voice Endpoint")
    print("=" * 50)
    
    # Sample test data
    test_data = {
        "comments": [
            "The service is excellent and staff are helpful",
            "Location is too far and hard to access",
            "Process is complicated and takes long time",
            "Good facilities but need more information",
            "Staff friendly but building needs improvement"
        ],
        "barangay_id": 1
    }
    
    # Test the endpoint
    try:
        print("📡 Sending request to ML API...")
        response = requests.post(
            "http://localhost:8000/analyze-community-voice",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! API Response:")
            print(f"   📊 Total comments: {result.get('total_comments', 0)}")
            print(f"   🔄 Processed: {result.get('processed_comments', 0)}")
            
            if 'themes' in result:
                print(f"   🎯 Top themes:")
                for theme, percentage in result['themes']['top_themes'][:3]:
                    print(f"      - {theme.replace('_', ' ').title()}: {percentage}%")
            
            if 'categories' in result:
                print(f"   😊 Sentiment:")
                cats = result['categories']['percentages']
                print(f"      - Positive: {cats.get('positive', 0)}%")
                print(f"      - Negative: {cats.get('negative', 0)}%")
                print(f"      - Neutral: {cats.get('neutral', 0)}%")
            
            print(f"   💡 Insights: {len(result.get('insights', []))} generated")
            
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML API server")
        print("   Make sure to start the server first: python ml/start_server.py")
        return False
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def main():
    """Main test function"""
    # Check if server is already running
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code == 200:
            print("✅ ML server is already running")
            test_api_endpoint()
        else:
            print("❌ ML server responded with error")
    except requests.exceptions.ConnectionError:
        print("⚠️  ML server not running")
        print("   Please start it manually: python ml/start_server.py")
        print("   Then run this test again")

if __name__ == "__main__":
    main()