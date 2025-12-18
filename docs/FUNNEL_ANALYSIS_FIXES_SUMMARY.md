# Funnel Analysis Issues Fixed

## Issues Identified

### 1. Same Citizen Concerns, Voice, and Roadmap for Different Barangays
**Problem**: Barangays with different satisfaction scores were showing identical citizen concerns, resident voice quotes, and AI-generated action roadmaps.

**Root Cause**: 
- The `generateRecommendations()` function used `Math.random()` for shuffling recommendations, which could produce the same results for barangays with similar score profiles
- The quote selection also used `Math.random()`, leading to inconsistent results
- The `generateRealisticTextareaResponse()` function in mock data generator used random selection

**Solution**:
- Changed recommendation generation to use **deterministic selection** based on actual scores
- Recommendations now use score-based indexing: `Math.floor((awareness + availment + satisfaction) / 100 * pool.length) % pool.length`
- Quote selection now uses score-based indexing instead of random selection
- Textarea responses in mock data now use score-based selection instead of random

**Impact**: Each barangay with different scores will now get unique, score-appropriate recommendations and quotes that are consistent across page refreshes.

---

### 2. Awareness and Availment Showing 0% for "Maintain Profile"
**Problem**: When generating mock data with "high-performer" (maintain) profile, the awareness and availment scores showed 0% even though the profile should have high scores (85-95%).

**Root Cause**:
- **Primary Issue**: The ML feature engineering (`ml/sigla_ml/feature_engineering.py`) was only looking for columns with 'avail' in the name, but the Financial section uses different field names:
  - `benefitedProjects` (contains 'benefited')
  - `usedFinancialInfo` (contains 'used')
  - `participatedSocialPrograms` (contains 'participated')
- The basic funnel analysis correctly checks for multiple keywords, but the ML version only checked for 'avail'
- Additionally, the ML script wasn't handling "Oo" (Filipino for "Yes") responses properly
- **Secondary Issue**: The mock data generator was using thresholds that were too high (0.5, 0.6, 0.7) to determine "Yes"/"Oo" responses
- For high-performer profile with awareness score of 0.85-0.95, the threshold of 0.5 should work, BUT:
  - The random component `Math.random() * (0.95 - 0.85)` could generate values like 0.86, 0.87, etc.
  - Some questions used higher thresholds (0.6, 0.7) which could fail even with high scores
- This resulted in inconsistent "Yes"/"Oo" responses, leading to low calculated percentages

**Solution**:
- **Primary Fix**: Updated ML feature engineering to match funnel analysis logic:
  - Changed availment question detection to check for multiple keywords: 'avail', 'experience', 'benefited', 'participated', 'used', 'accessed', 'utilized', 'received'
  - Updated `_calculate_binary_score()` to handle "Oo" (Filipino) and "Oo (Yes)" responses in addition to "Yes"
- **Secondary Fix**: Lowered all awareness/availment thresholds from 0.5/0.6/0.7 to **0.3** across all sections:
  - Financial Administration: `awarenessProjects`, `benefitedProjects`, `awarenessFinancial`, `usedFinancialInfo`, `awarenessSocialPrograms`, `participatedSocialPrograms`, `awarenessCorruption`
  - Disaster Preparedness: `awarenessDisasterInfo`, `availmentDisasterInfo`, `awarenessEvacuation`, `locationEvacuation`
  - Safety & Peace Order: `awarenessTanods`, `experienceTanods`, `awarenessLupon`, `experienceLupon`, `awarenessAntiDrug`, `experienceAntiDrug`
  - Social Protection: `awarenessHealthServices`, `availmentHealthServices`, `awarenessWomenChildrenProtection`, `availmentWomenChildrenProtection`, `awarenessCommunityParticipation`, `availmentCommunityParticipation`
  - Business Friendliness: `awarenessBusinessClearance`, `availmentBusinessClearance`
  - Environmental Management: `awarenessWasteManagement`, `availmentWasteManagement`

**Impact**: High-performer profiles will now consistently generate 85-95% awareness and availment scores as expected, matching the satisfaction scores.

---

## Files Modified

1. **src/app/api/funnel-analysis/route.ts**
   - Modified `generateRecommendations()` to use deterministic score-based selection
   - Modified quote selection to use deterministic score-based indexing
   - Ensures consistent recommendations and quotes based on actual performance scores

2. **src/app/api/tools/generate-mock-survey-data/route.ts**
   - Lowered awareness/availment thresholds from 0.5-0.7 to 0.3 in all section generators:
     - `generateFinancialSectionData()`
     - `generateDisasterSectionData()`
     - `generateSafetySectionData()`
     - `generateSocialSectionData()`
     - `generateBusinessSectionData()`
     - `generateEnvironmentalSectionData()`
   - Modified `generateRealisticTextareaResponse()` to use deterministic score-based selection
   - Ensures high-performer profiles generate appropriate "Yes"/"Oo" responses

3. **ml/sigla_ml/feature_engineering.py**
   - Updated availment question detection to match funnel analysis logic
   - Now checks for multiple keywords: 'avail', 'experience', 'benefited', 'participated', 'used', 'accessed', 'utilized', 'received'
   - Updated `_calculate_binary_score()` to handle both "Yes" and "Oo" (Filipino) responses
   - Also handles "Oo (Yes)" format used in some questions
   - This fixes the ML-enhanced funnel analysis to correctly calculate awareness and availment scores

4. **src/app/api/ml/funnel-analysis/route.ts** (NEW FIX)
   - Updated `extractQuotes()` to use score-based deterministic selection instead of hardcoded defaults
   - Updated `extractRecommendations()` to use score-based deterministic selection
   - Now different barangays with different scores get unique quotes and recommendations
   - Quotes and recommendations are consistent across page refreshes (no random changes)

---

## Testing Recommendations

1. **Delete existing mock data** for affected barangays (e.g., Barangay 17)
2. **Regenerate mock data** using the "high-performer" profile
3. **Verify funnel analysis** shows:
   - Awareness: 85-95% (should now work for ALL sections including Financial and Safety)
   - Availment: 85-95% (should now work for ALL sections including Financial and Safety)
   - Satisfaction: 80-90%
4. **Compare two barangays** with different scores to ensure:
   - Different citizen concerns
   - Different resident voice quotes
   - Different AI-generated roadmaps
5. **Refresh the page** multiple times to ensure consistency (no random changes)
6. **Check console logs** to verify ML-enhanced analysis is working:
   - Look for `ml_enhanced: true` in the funnel analysis data
   - Verify all service scores show correct awareness/availment percentages
   - No more `awareness: 0` or `availment: 0` for high-performer profiles

---

## Expected Behavior After Fix

### High-Performer Profile (Maintain)
- ✅ Awareness: 85-95%
- ✅ Availment: 85-95%
- ✅ Satisfaction: 80-90%
- ✅ Quadrant: MAINTAIN
- ✅ Unique recommendations based on scores

### Mixed Profile
- ✅ Awareness: Variable (0-100%)
- ✅ Availment: Variable (0-100%)
- ✅ Satisfaction: Variable (0-100%)
- ✅ Quadrant: Mixed (MONITOR/OPPORTUNITIES)
- ✅ Unique recommendations based on actual scores

### Different Barangays
- ✅ Each barangay gets unique concerns, quotes, and roadmaps based on their specific scores
- ✅ Consistent results across page refreshes (no random changes)
