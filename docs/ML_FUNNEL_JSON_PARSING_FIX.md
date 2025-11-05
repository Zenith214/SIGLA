# ML Funnel Analysis JSON Parsing Fix

## Problem
The ML funnel analysis API was failing with the error:
```
Failed to parse ML results: SyntaxError: Unexpected token 'W', "Warning: V"... is not valid JSON
```

## Root Cause
The Python ML script (`ml/analyze_barangay.py`) was outputting validation warnings to stdout before the JSON output:
```
Warning: Validation failed for business - aware respondents not subset of all
```

This contaminated the JSON output, causing the Node.js API route to fail when trying to parse the stdout as JSON.

## Solution
Modified `ml/sigla_ml/feature_engineering.py` to redirect validation warnings from stdout to stderr:

**Before:**
```python
print(f"Warning: Validation failed for {service_area} - availed respondents not subset of aware")
```

**After:**
```python
print(f"Warning: Validation failed for {service_area} - availed respondents not subset of aware", file=sys.stderr)
```

## Changes Made
1. Added `import sys` to `ml/sigla_ml/feature_engineering.py`
2. Modified two print statements to output to stderr instead of stdout (lines 183 and 185)

## Result
- The Python script now outputs clean JSON to stdout
- Warnings are properly logged to stderr and don't interfere with JSON parsing
- The ML funnel analysis API can now successfully parse the results
- The new funnel calculation methodology works correctly with the ML system

## Testing
Verified the fix by running:
```bash
python ml/analyze_barangay.py --barangay_id 17
```

Output is now valid JSON that can be parsed successfully by the Node.js API.
