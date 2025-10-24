#!/usr/bin/env python3
"""
Standalone script for community voice analysis
Can be called directly from Node.js without running a persistent server
Uses file I/O to avoid command line length limits
"""
import sys
import json
from sigla_ml.api import SiglaMLAPI

# Initialize ML API
ml_api = SiglaMLAPI()

def main():
    try:
        # Read input and output file paths from command line
        if len(sys.argv) < 3:
            result = {
                "error": "Usage: python analyze_community_voice_standalone.py <input_file> <output_file>",
                "success": False
            }
            print(json.dumps(result))
            sys.exit(1)
        
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        
        # Read input from file
        with open(input_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        
        comments = input_data.get('comments', [])
        barangay_id = input_data.get('barangay_id')
        
        if not comments:
            result = {
                "total_comments": 0,
                "processed_comments": 0,
                "message": "No comments provided",
                "insights": [],
                "themes": {"counts": {}, "percentages": {}, "top_themes": []},
                "categories": {
                    "counts": {"positive": 0, "negative": 0, "neutral": 0},
                    "percentages": {"positive": 0, "negative": 0, "neutral": 0}
                },
                "success": True
            }
        else:
            # Perform analysis using ML API
            result = ml_api.analyze_community_voice(comments, barangay_id)
            result["success"] = True
        
        # Write result to output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        sys.exit(0)
        
    except Exception as e:
        result = {
            "error": str(e),
            "success": False
        }
        # Try to write error to output file if possible
        try:
            if len(sys.argv) >= 3:
                with open(sys.argv[2], 'w', encoding='utf-8') as f:
                    json.dump(result, f)
        except:
            pass
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()
