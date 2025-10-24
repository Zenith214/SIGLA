#!/usr/bin/env python3
"""
Demo script showing the complete Community Voice Analysis workflow
"""

import requests
import json
import time
import subprocess
import sys
import os

def start_ml_server():
    """Start the ML FastAPI server in the background"""
    print("🚀 Starting ML FastAPI server...")
    
    # Change to ml directory and start server
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Start server as background process
    process = subprocess.Popen([
        sys.executable, "start_server.py"
    ], cwd=ml_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait a moment for server to start
    time.sleep(3)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ ML server started successfully!")
            return process
        else:
            print("❌ ML server failed to start properly")
            return None
    except requests.exceptions.RequestException:
        print("❌ ML server is not responding")
        return None

def test_community_voice_api():
    """Test the community voice analysis API endpoint"""
    print("\n📊 Testing Community Voice Analysis API...")
    
    # Sample comments for testing
    test_data = {
        "comments": [
            "The service quality is excellent and the staff are very helpful",
            "It's too far from our location and hard to access",
            "The process is very complicated and takes too long",
            "Good facilities but need more information about the services",
            "Staff are friendly but the building needs improvement",
            "Very satisfied with the fast service",
            "The requirements are difficult to understand",
            "Great location and easy to reach",
            "Poor service quality, needs immediate attention",
            "The procedure is simple and staff explain everything well"
        ],
        "barangay_id": 1
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze-community-voice",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            
            print(f"\n📈 Analysis Results:")
            print(f"   Total comments: {result.get('total_comments', 0)}")
            print(f"   Processed: {result.get('processed_comments', 0)}")
            
            if 'themes' in result:
                print(f"\n🎯 Top Themes:")
                for theme, percentage in result['themes']['top_themes'][:3]:
                    print(f"   - {theme.replace('_', ' ').title()}: {percentage}%")
            
            if 'categories' in result:
                print(f"\n😊 Sentiment Distribution:")
                categories = result['categories']['percentages']
                print(f"   - Positive: {categories.get('positive', 0)}%")
                print(f"   - Negative: {categories.get('negative', 0)}%")
                print(f"   - Neutral: {categories.get('neutral', 0)}%")
            
            if 'insights' in result:
                print(f"\n💡 Key Insights ({len(result['insights'])} generated):")
                for insight in result['insights']:
                    priority = insight.get('priority', 'medium')
                    print(f"   - {insight['title']} ({priority} priority)")
            
            return True
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API call failed: {str(e)}")
        return False

def main():
    """Main demo function"""
    print("🎉 SIGLA Community Voice Analysis Demo")
    print("=" * 50)
    
    # Start ML server
    server_process = start_ml_server()
    
    if server_process is None:
        print("❌ Cannot proceed without ML server")
        return
    
    try:
        # Test the API
        success = test_community_voice_api()
        
        if success:
            print("\n🎊 Demo completed successfully!")
            print("\n📋 Next Steps:")
            print("   1. Start your Next.js frontend: npm run dev")
            print("   2. Go to /tools page")
            print("   3. Use the Community Voice Analysis section")
            print("   4. The frontend will call /api/community-voice")
            print("   5. Which connects to this ML service on port 8000")
        else:
            print("\n❌ Demo failed - check the logs above")
            
    finally:
        # Clean up - terminate server
        print(f"\n🛑 Stopping ML server...")
        server_process.terminate()
        server_process.wait()
        print("✅ Server stopped")

if __name__ == "__main__":
    main()