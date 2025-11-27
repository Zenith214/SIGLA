# Quick Reference: Sex-Based Filtering

## The Rule (CSIS Methodology)

```
Questionnaire Number → Required Sex
─────────────────────────────────────
Odd (1, 3, 5, 7, ...)  → MALE
Even (2, 4, 6, 8, ...) → FEMALE
```

## Examples

| Questionnaire ID | Last Digit | Parity | Required Sex |
|-----------------|------------|--------|--------------|
| 2026-001-1      | 1          | Odd    | **Male**     |
| 2026-001-2      | 2          | Even   | **Female**   |
| 2026-001-3      | 3          | Odd    | **Male**     |
| 2026-001-4      | 4          | Even   | **Female**   |
| 2026-001-5      | 5          | Odd    | **Male**     |

## What Changed

### Before ❌
- User manually selected sex for each household member
- Kish Grid selected from ALL eligible members regardless of sex
- No enforcement of sex-based sampling

### After ✅
- Sex is **automatically set** based on questionnaire number (no dropdown!)
- User only enters name and birthdate
- System automatically filters to ONLY the required sex
- Visual indicators show which members are eligible
- Kish Grid only selects from correct-sex members
- Error message if no eligible members of required sex

## Visual Indicators

### Questionnaire Display
```
┌─────────────────────────────────────────┐
│ Survey Questionnaire Number             │
│ 2026-001-1                              │
│ ─────────────────────────────────────── │
│ Required Respondent Sex: Male           │
│ Odd questionnaire numbers interview     │
│ male respondents only                   │
└─────────────────────────────────────────┘
```

### Member Cards
```
┌─────────────────────────────────────────┐ GREEN BORDER
│ Member 1                    ✓ Eligible  │
│ Name: John Doe                          │
│ Birthdate: 1990-01-01 (Age: 34)        │
│ Sex: Male (auto-set based on quest.)   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Member 2                                │
│ Name: Jane Doe                          │
│ Birthdate: 1985-05-15 (Age: 39)        │
│ Sex: Male (auto-set based on quest.)   │
└─────────────────────────────────────────┘

Note: All members automatically have the same sex
based on the questionnaire number.
```

## Error Handling

If no eligible members of required sex:
```
Alert: No eligible male household members found.

Questionnaire #2026-001-1 requires interviewing male respondents only.

Please ensure:
- At least one male member is 18 years or older
- All required information is complete
```

## Code Location

- **Utility Function:** `src/app/survey/forms/utils/kishGrid.ts` → `getRequiredGender()`
- **Implementation:** `src/app/survey/forms/sections/respondent-selection.tsx`
- **Filtering Logic:** Line ~200 in `selectRespondent()` function
