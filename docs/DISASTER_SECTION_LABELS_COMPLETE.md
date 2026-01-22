# Disaster Preparedness Section - Complete Question Labels

## Overview
Added comprehensive labels for ALL Disaster Preparedness section fields, including base questions, conditional modules, skip reasons, and new NFA format fields.

## Complete Disaster Section Coverage

### Part A: Disaster Information & Early Warning (6 base + 8 extended)
✅ `disaster_awarenessDisasterInfo` → "Awareness: Disaster Information"
✅ `disaster_availmentDisasterInfo` → "Availment: Received Disaster Information"
✅ `disaster_receivedDisasterInfo` → "Availment: Received Disaster Information" (alternate)
✅ `disaster_satisfactionDisasterInfo` → "Satisfaction: Disaster Information"
✅ `disaster_nfaBinaryDisasterInfo` → "Need for Action: Disaster Information"
✅ `disaster_suggestionsDisasterInfo` → "Suggestions: Disaster Information"
✅ `disasterInfo_unawareness_reason` → "Unawareness Reason: Disaster Information"
✅ `disasterInfo_non_availment_reason` → "Non-Availment Reason: Disaster Information"
✅ `disaster_availmentDisasterInfo_skipReason` → "Skip Reason: Disaster Info Availment"
✅ `disaster_receivedDisasterInfo_skipReason` → "Skip Reason: Disaster Info Availment"
✅ `disaster_satisfactionDisasterInfo_skipReason` → "Skip Reason: Disaster Info Satisfaction"
✅ `disaster_nfaBinaryDisasterInfo_skipReason` → "Skip Reason: Disaster Info NFA"
✅ `disaster_suggestionsDisasterInfo_skipReason` → "Skip Reason: Disaster Info Suggestions"
✅ `disaster_need_for_action_binary_disaster_info` → "Need for Action: Disaster Information (Yes/No)"
✅ `disaster_need_for_action_suggestion_disaster_info` → "Need for Action: Disaster Info Suggestions"

### Part B: Evacuation & Emergency Response (6 base + 8 extended)
✅ `disaster_awarenessEvacuation` → "Awareness: Evacuation Centers"
✅ `disaster_locationEvacuation` → "Availment: Know Evacuation Location"
✅ `disaster_usedEvacuation` → "Availment: Used Evacuation Centers"
✅ `disaster_satisfactionEvacuation` → "Satisfaction: Evacuation Centers"
✅ `disaster_nfaBinaryEvacuation` → "Need for Action: Evacuation Centers"
✅ `disaster_suggestionsEvacuation` → "Suggestions: Evacuation Centers"
✅ `evacuation_unawareness_reason` → "Unawareness Reason: Evacuation Centers"
✅ `evacuation_non_availment_reason` → "Non-Availment Reason: Evacuation Centers"
✅ `disaster_locationEvacuation_skipReason` → "Skip Reason: Evacuation Location"
✅ `disaster_usedEvacuation_skipReason` → "Skip Reason: Evacuation Availment"
✅ `disaster_satisfactionEvacuation_skipReason` → "Skip Reason: Evacuation Satisfaction"
✅ `disaster_nfaBinaryEvacuation_skipReason` → "Skip Reason: Evacuation NFA"
✅ `disaster_suggestionsEvacuation_skipReason` → "Skip Reason: Evacuation Suggestions"
✅ `disaster_need_for_action_binary_evacuation` → "Need for Action: Evacuation Centers (Yes/No)"
✅ `disaster_need_for_action_suggestion_evacuation` → "Need for Action: Evacuation Suggestions"

## Total Disaster Section Labels
- **Base questions:** 12 labels
- **Skip reasons:** 10 labels
- **Conditional modules:** 4 labels
- **New NFA format:** 4 labels
- **Total:** 30 labels for Disaster Preparedness section

## Field Naming Patterns

### Base Questions
- `disaster_awarenessDisasterInfo` - Awareness of disaster information systems
- `disaster_availmentDisasterInfo` / `disaster_receivedDisasterInfo` - Received disaster info
- `disaster_awarenessEvacuation` - Awareness of evacuation centers
- `disaster_locationEvacuation` - Know evacuation center location
- `disaster_usedEvacuation` - Used evacuation centers

### Conditional Modules
- `disasterInfo_unawareness_reason` - Why unaware of disaster info
- `disasterInfo_non_availment_reason` - Why didn't receive disaster info
- `evacuation_unawareness_reason` - Why unaware of evacuation centers
- `evacuation_non_availment_reason` - Why don't know evacuation location

### Skip Reasons
- `disaster_[field]_skipReason` - Why a question was skipped
- Applied to: availment, satisfaction, NFA, suggestions

### New NFA Format
- `disaster_need_for_action_binary_disaster_info` - Yes/No for disaster info
- `disaster_need_for_action_suggestion_disaster_info` - Suggestions for disaster info
- `disaster_need_for_action_binary_evacuation` - Yes/No for evacuation
- `disaster_need_for_action_suggestion_evacuation` - Suggestions for evacuation

## Key Features

### Dual Availment Fields
The disaster section has two different availment field names for the same concept:
- `disaster_availmentDisasterInfo` (newer format)
- `disaster_receivedDisasterInfo` (older format)

Both are mapped to the same label for consistency.

### Location-Specific Field
- `disaster_locationEvacuation` - Unique field asking if respondent knows the evacuation center location (not just awareness)

## Files Modified
1. ✅ `src/utils/questionLabels.ts` - Added all Disaster section labels

## Testing Checklist

### Test in Detailed Analytics
- [ ] Navigate to Analytics → Detailed Analytics
- [ ] Expand a response with Disaster Preparedness section data
- [ ] Verify ALL fields show proper labels (no raw field names)
- [ ] Check Disaster Information subsection
- [ ] Check Evacuation Centers subsection
- [ ] Verify conditional module labels (unawareness/non-availment)
- [ ] Verify skip reason labels

### Expected Results
- ✅ All awareness questions show "Awareness: [Topic]"
- ✅ All availment questions show "Availment: [Action]"
- ✅ Location question shows "Availment: Know Evacuation Location"
- ✅ All satisfaction questions show "Satisfaction: [Topic]"
- ✅ All NFA questions show "Need for Action: [Topic]"
- ✅ All skip reasons show "Skip Reason: [Context]"
- ✅ All conditional modules show proper reason labels
- ✅ No raw field names like `disaster_locationEvacuation` or `disasterInfo_unawareness_reason`

## Progress Summary

### ✅ Completed Sections
1. **Financial Administration** - 59 labels
2. **Disaster Preparedness** - 30 labels

### 🔄 Remaining Sections
3. Safety & Peace Order
4. Social Protection
5. Business Friendliness
6. Environmental Management

## Status
✅ **COMPLETE** - All Disaster Preparedness fields have proper labels.
