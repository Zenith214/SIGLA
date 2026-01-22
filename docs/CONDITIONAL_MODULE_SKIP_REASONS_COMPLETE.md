# Conditional Module Skip Reasons - Complete Labels

## Overview
Added comprehensive labels for all conditional module skip reason fields across all 6 service areas. These fields track why unawareness/non-availment reason questions were skipped.

## Problem
Skip reason fields for conditional modules were showing raw technical names:
- `financial_projects_unawareness_reason_skipReason` → showing as-is
- `disasterInfo_non_availment_reason_skipReason` → showing as-is
- `tanods_unawareness_reason_skipReason` → showing as-is

## Solution
Added 20 new skip reason labels for conditional module fields across all service areas.

## Labels Added

### Financial Administration (6 labels)
✅ `financial_projects_unawareness_reason_skipReason` → "Skip Reason: Projects Unawareness"
✅ `financial_projects_non_availment_reason_skipReason` → "Skip Reason: Projects Non-Availment"
✅ `financial_financial_unawareness_reason_skipReason` → "Skip Reason: Financial Transparency Unawareness"
✅ `financial_financial_non_availment_reason_skipReason` → "Skip Reason: Financial Transparency Non-Availment"
✅ `financial_socialPrograms_unawareness_reason_skipReason` → "Skip Reason: Social Programs Unawareness"
✅ `financial_socialPrograms_non_availment_reason_skipReason` → "Skip Reason: Social Programs Non-Availment"

### Disaster Preparedness (4 labels)
✅ `disasterInfo_unawareness_reason_skipReason` → "Skip Reason: Disaster Info Unawareness"
✅ `disasterInfo_non_availment_reason_skipReason` → "Skip Reason: Disaster Info Non-Availment"
✅ `evacuation_unawareness_reason_skipReason` → "Skip Reason: Evacuation Unawareness"
✅ `evacuation_non_availment_reason_skipReason` → "Skip Reason: Evacuation Non-Availment"

### Safety & Peace Order (6 labels)
✅ `tanods_unawareness_reason_skipReason` → "Skip Reason: Tanods Unawareness"
✅ `tanods_non_availment_reason_skipReason` → "Skip Reason: Tanods Non-Availment"
✅ `lupon_unawareness_reason_skipReason` → "Skip Reason: Lupon Unawareness"
✅ `lupon_non_availment_reason_skipReason` → "Skip Reason: Lupon Non-Availment"
✅ `antiDrug_unawareness_reason_skipReason` → "Skip Reason: Anti-Drug Unawareness"
✅ `antiDrug_non_availment_reason_skipReason` → "Skip Reason: Anti-Drug Non-Availment"

### Social Protection (6 labels)
✅ `healthServices_unawareness_reason_skipReason` → "Skip Reason: Health Services Unawareness"
✅ `healthServices_non_availment_reason_skipReason` → "Skip Reason: Health Services Non-Availment"
✅ `womenChildrenProtection_unawareness_reason_skipReason` → "Skip Reason: Protection Services Unawareness"
✅ `womenChildrenProtection_non_availment_reason_skipReason` → "Skip Reason: Protection Services Non-Availment"
✅ `communityParticipation_unawareness_reason_skipReason` → "Skip Reason: Community Participation Unawareness"
✅ `communityParticipation_non_availment_reason_skipReason` → "Skip Reason: Community Participation Non-Availment"

### Business Friendliness (2 labels)
✅ `businessClearance_unawareness_reason_skipReason` → "Skip Reason: Business Clearance Unawareness"
✅ `businessClearance_non_availment_reason_skipReason` → "Skip Reason: Business Clearance Non-Availment"

### Environmental Management (2 labels)
✅ `wasteManagement_unawareness_reason_skipReason` → "Skip Reason: Waste Management Unawareness"
✅ `wasteManagement_non_availment_reason_skipReason` → "Skip Reason: Waste Management Non-Availment"

## Total: 26 New Labels

## Field Naming Pattern
`[topic]_[unawareness|non_availment]_reason_skipReason`

Examples:
- `financial_projects_unawareness_reason_skipReason`
- `disasterInfo_non_availment_reason_skipReason`
- `tanods_unawareness_reason_skipReason`

## Display Format
All skip reasons display as: **"Skip Reason: [Topic] [Type]"**

Where:
- **Topic** = The service/topic (e.g., "Projects", "Disaster Info", "Tanods")
- **Type** = Either "Unawareness" or "Non-Availment"

## Combined with Answer Formatting

### Before
```
financial_projects_unawareness_reason_skipReason: conditional_skip
disasterInfo_non_availment_reason_skipReason: conditional_skip
tanods_unawareness_reason_skipReason: conditional_skip
```

### After
```
Skip Reason: Projects Unawareness: Skipped (conditional logic)
Skip Reason: Disaster Info Non-Availment: Skipped (conditional logic)
Skip Reason: Tanods Unawareness: Skipped (conditional logic)
```

## Files Modified
1. ✅ `src/utils/questionLabels.ts` - Added 26 conditional module skip reason labels

## Testing Checklist

### Financial Administration
- [ ] Projects unawareness/non-availment skip reasons formatted
- [ ] Financial Transparency unawareness/non-availment skip reasons formatted
- [ ] Social Programs unawareness/non-availment skip reasons formatted

### Disaster Preparedness
- [ ] Disaster Info unawareness/non-availment skip reasons formatted
- [ ] Evacuation unawareness/non-availment skip reasons formatted

### Safety & Peace Order
- [ ] Tanods unawareness/non-availment skip reasons formatted
- [ ] Lupon unawareness/non-availment skip reasons formatted
- [ ] Anti-Drug unawareness/non-availment skip reasons formatted

### Social Protection
- [ ] Health Services unawareness/non-availment skip reasons formatted
- [ ] Protection Services unawareness/non-availment skip reasons formatted
- [ ] Community Participation unawareness/non-availment skip reasons formatted

### Business & Environmental
- [ ] Business Clearance unawareness/non-availment skip reasons formatted
- [ ] Waste Management unawareness/non-availment skip reasons formatted

## Complete Label Count Update

### Previous Total: 214 labels
### New Total: 240 labels

Breakdown:
- Base questions: ~72 labels
- Regular skip reasons: ~54 labels
- Conditional modules: ~24 labels
- **Conditional module skip reasons: ~26 labels** (NEW)
- New NFA format: ~48 labels
- Legacy/dual naming: ~16 labels

## Status
✅ **COMPLETE** - All conditional module skip reason fields now have proper labels across all 6 service areas.

## Related Documentation
- `docs/ALL_SECTIONS_LABELS_COMPLETE.md` - Main label coverage
- `docs/ANSWER_VALUE_FORMATTING_COMPLETE.md` - Answer value formatting
- `docs/TASK_COMPLETE_ALL_QUESTION_LABELS.md` - Overall task summary
