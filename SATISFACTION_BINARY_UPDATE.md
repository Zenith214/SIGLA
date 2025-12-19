# Satisfaction Binary Format Update

## Overview
Updated the M1 Overall Satisfaction question from a 5-point scale to a binary Yes/No format, and ensured all satisfaction questions use proper translation instead of hardcoded bilingual text.

## Changes Made

### 1. Question Format Updates (`src/app/survey/forms/utils/questions.ts`)

#### Overall Satisfaction (M1)
- **Old Format**: 5-point scale (1-5: Very Dissatisfied to Very Satisfied)
- **New Format**: Binary (Yes/No)
- **Question Updated**:
  - Filipino: "Sa pangkalahatan, kung iisipin ang lahat ng serbisyong ibinigay ng barangay sa nakalipas na 12 buwan, nasisiyahan ka ba?"
  - English: "Overall, thinking about all the services provided by the barangay in the past 12 months, are you satisfied?"

#### All Satisfaction Questions
Changed from hardcoded bilingual format to translatable format:
- **Old**: `options: ["Oo / Yes", "Hindi / No"]`
- **New**: `options: ["Yes", "No"]`

This allows the translation system to properly convert:
- English: "Yes" / "No"
- Filipino: "Oo" / "Hindi"
- Bisaya: "Oo" / "Dili"

**Affected Questions**:
- satisfactionProjects
- satisfactionFinancial
- satisfactionSocialPrograms
- satisfactionDisasterInfo
- satisfactionEvacuation
- satisfactionTanods
- satisfactionLupon
- satisfactionAntiDrug
- satisfactionHealthServices
- satisfactionWomenChildrenProtection
- satisfactionCommunityParticipation
- satisfactionBusinessClearance
- satisfactionWasteManagement
- overallSatisfaction
- overallNeedForAction

### 2. Translation Updates (`src/app/survey/forms/utils/translations.ts`)

Updated the M1 question translations to match the new binary format:
- **Bisaya**: "Sa kinatibuk-an, kung hunahunaon ang tanan nga serbisyo nga gihatag sa barangay sa miaging 12 ka bulan, tagbaw ka ba?"
- **Filipino**: "Sa pangkalahatan, kung iisipin ang lahat ng serbisyong ibinigay ng barangay sa nakalipas na 12 buwan, nasisiyahan ka ba?"
- **English**: "Overall, thinking about all the services provided by the barangay in the past 12 months, are you satisfied?"

### 3. Calculation Logic Updates

Updated all satisfaction calculation endpoints to handle both old (5-point scale) and new (binary) formats:

#### Files Updated:

**`src/app/api/analytics/dashboard-summary/route.ts`**
- Detects binary format (Yes/Oo = 100%, No/Hindi = 0%)
- Falls back to old 5-point scale calculation for historical data

**`src/app/api/analytics/service-area-deep-dive/route.ts`**
- Updated satisfaction aggregation to handle binary format
- Maintains backward compatibility with 5-point scale

**`src/app/api/analytics/demographics/route.ts`**
- Updated demographic satisfaction calculations
- Handles both binary and 5-point scale formats

**`src/app/api/ml/funnel-analysis/route.ts`**
- Updated ML funnel analysis satisfaction calculation
- Binary Yes = 5 (equivalent to 100%), No = 0 (equivalent to 0%)
- Maintains compatibility with existing percentage calculations

**`src/app/api/funnel-analysis/route.ts`**
- Updated overall satisfaction processing
- Handles both binary and 5-point scale formats
- Binary Yes = 5, No = 0 for internal calculations

**`src/app/api/tools/generate-synthetic-data/route.ts`**
- Updated synthetic data generation to use new binary format
- Generates "Yes" or "No" based on satisfaction score threshold

### 4. Calculation Logic

#### Binary Format Conversion:
```typescript
// New binary format
if (satisfactionValue.includes('yes') || satisfactionValue.includes('oo')) {
  satisfaction = 100  // Satisfied
} else if (satisfactionValue.includes('no') || satisfactionValue.includes('hindi')) {
  satisfaction = 0    // Not satisfied
}

// Old 5-point scale (backward compatibility)
else {
  const numericValue = parseInt(satisfactionValue.charAt(0))
  if (numericValue >= 1 && numericValue <= 5) {
    satisfaction = (numericValue / 5) * 100
  }
}
```

#### For ML Calculations:
```typescript
// Binary format mapped to 5-point scale equivalent
if (satisfactionValue.includes('yes') || satisfactionValue.includes('oo')) {
  satisfactionSum += 5  // Equivalent to "Very Satisfied"
} else if (satisfactionValue.includes('no') || satisfactionValue.includes('hindi')) {
  satisfactionSum += 0  // Equivalent to "Very Dissatisfied"
}
```

## Backward Compatibility

All calculation endpoints maintain backward compatibility:
1. First check for new binary format (Yes/No, Oo/Hindi)
2. If not found, fall back to old 5-point scale format
3. This ensures historical data continues to work correctly

## Impact

### User Experience
- Simpler, clearer satisfaction questions
- Consistent translation across all languages
- Easier for respondents to answer

### Data Analysis
- Binary satisfaction data is converted to 0% or 100%
- Maintains compatibility with existing dashboards and reports
- Historical 5-point scale data continues to work

### Database
- No schema changes required
- Data stored as "Yes"/"No" strings
- Calculations handle conversion to percentages

### 6. NFA Field Transformation Fix

**Issue**: Survey responses were failing validation because NFA (Need for Action) field names weren't being transformed from the internal format to the database format.

**Files Updated**:
- `src/app/api/survey-responses/route.ts`
- `src/app/api/sync/route.ts`

**Changes**:
- Added import for `transformNFAFields` function
- Transform section data before validation
- Use transformed sections when inserting into database

**Transformation**:
```typescript
// Internal format (from questions)
nfaBinaryFinancial → need_for_action_binary_financial
suggestionsFinancial → need_for_action_suggestion_financial

// This transformation happens for all 14 service indicators
```

## Testing Recommendations

1. Test language switching on satisfaction questions
2. Verify calculations work with new binary format
3. Confirm historical data (5-point scale) still displays correctly
4. Check all dashboards and reports for proper satisfaction display
5. Validate synthetic data generation produces correct format
6. Test survey submission with NFA fields to ensure validation passes
7. Verify transformed field names are stored correctly in database

## ML/Python Calculations

The Python ML code in `ml/sigla_ml/feature_engineering.py` has already been updated to handle both formats:

### `_calculate_satisfaction_from_availed()` method:
- **Binary format**: Yes/Oo = satisfied (True), No/Hindi = not satisfied (False)
- **Legacy format**: Likert scale 1-5, where 4-5 = satisfied
- Calculates: (satisfied_count / total_count) * 100

### `_calculate_satisfaction_score()` method:
- **Binary format**: (satisfied_count / total_count) * 100
- **Legacy format**: (avg_rating / 5) * 100
- Handles both formats seamlessly

## Complete List of Updated Files

### Backend API Routes (6 files):
1. `src/app/api/analytics/dashboard-summary/route.ts`
2. `src/app/api/analytics/service-area-deep-dive/route.ts`
3. `src/app/api/analytics/demographics/route.ts`
4. `src/app/api/ml/funnel-analysis/route.ts`
5. `src/app/api/funnel-analysis/route.ts`
6. `src/app/api/tools/generate-synthetic-data/route.ts`

### Survey & Validation (4 files):
7. `src/app/survey/forms/utils/questions.ts` - All satisfaction questions
8. `src/app/survey/forms/utils/translations.ts` - M1 question translation
9. `src/app/api/survey-responses/route.ts` - NFA transformation
10. `src/app/api/sync/route.ts` - NFA transformation
11. `src/lib/validation/nfa-storage-validation.ts` - Validation logic

### ML/Python (1 file):
12. `ml/sigla_ml/feature_engineering.py` - Already handles both formats

## Notes

- Community voice analysis is not affected (only extracts text comments)
- Backup/export functionality works with both formats
- All aggregation endpoints handle mixed data (old and new formats)
- NFA field transformation is now applied before validation and storage
- Python ML calculations already support both binary and legacy formats
- All calculations maintain backward compatibility with historical data
