#!/usr/bin/env python3
"""
Test script for community voice analysis
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sigla_ml.api import SiglaMLAPI

def test_community_voice_analysis():
    """Test the community voice analysis functionality"""
    
    # Sample comments for testing
    test_comments = [
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
    ]
    
    print("Testing Community Voice Analysis...")
    print(f"Sample comments: {len(test_comments)}")
    print("-" * 50)
    
    # Initialize ML API
    ml_api = SiglaMLAPI()
    
    # Test analysis
    result = ml_api.analyze_community_voice(
        comments=test_comments,
        barangay_id=1
    )
    
    print("Analysis Results:")
    print(f"Total comments: {result.get('total_comments', 0)}")
    print(f"Processed comments: {result.get('processed_comments', 0)}")
    
    if 'themes' in result:
        print("\nTop Themes:")
        for theme, percentage in result['themes']['top_themes'][:3]:
            print(f"  - {theme.replace('_', ' ').title()}: {percentage}%")
    
    if 'categories' in result:
        print("\nSentiment Distribution:")
        categories = result['categories']['percentages']
        print(f"  - Positive: {categories.get('positive', 0)}%")
        print(f"  - Negative: {categories.get('negative', 0)}%")
        print(f"  - Neutral: {categories.get('neutral', 0)}%")
    
    if 'insights' in result:
        print(f"\nInsights Generated: {len(result['insights'])}")
        for insight in result['insights']:
            priority = insight.get('priority', 'medium')
            print(f"  - {insight['title']} ({priority} priority)")
    
    print("\nSample Comments:")
    for i, comment in enumerate(result.get('sample_comments', [])[:3], 1):
        print(f"  {i}. \"{comment}\"")
    
    print("\n" + "="*50)
    print("Community Voice Analysis Test Completed Successfully!")

if __name__ == "__main__":
    test_community_voice_analysis()