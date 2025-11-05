# Satisfaction Calculation Discrepancy Analysis

## Problem
Python ML script and TypeScript implementation are returning different satisfaction scores for the same barangay:

### Python Results (ml/analyze_barangay.py)
- Safety: 70.6% (avg rating: 3.53, distribution: {1: 10, 2: 8, 3: 9, 4: 81, 5: 3})
- Financial: 73.4% (avg rating: 3.67)
- Business: 66.9%

### TypeScript Results (/api/funnel-analysis)
- Safety: 51%
- Financial: ~35%
- Business: ~15%

### Gemini AI (uses TypeScript)
- Safety: 51.1%
- Financial: 55.4%
- Business: 42.9%

## Root Cause
The Python and TypeScript implementations are processing **different sets of respondents** or **different survey data**.

Possible causes:
1. **Different cycle filtering**: Python might be looking at all cycles, TypeScript at active cycle only
2. **Different respondent identification**: Different logic for identifying "availed" respondents
3. **Different data structure**: Python gets data from database differently than TypeScript
4. **Caching issues**: One is using cached data, the other fresh data

## Investigation Needed
1. Check if Python script filters by cycle_id
2. Compare the actual survey responses being processed
3. Verify the "availed" respondent identification logic matches
4. Check if there's a data transformation issue

## Next Steps
1. Add logging to both implementations to see which respondents they're processing
2. Compare the raw data being fed to each calculation
3. Ensure both use the same cycle filtering
4. Verify the cascading funnel logic is identical
