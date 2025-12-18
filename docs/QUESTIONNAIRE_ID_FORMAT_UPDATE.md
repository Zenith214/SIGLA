# Questionnaire ID Format Update

## Summary

Updated questionnaire ID format from `YYYY-BBSS-QQQ` to `YYYY-BB-SS-QQQ` for improved clarity and parseability.

## Old Format: `YYYY-BBSS-QQQ`

**Example:** `2026-1801-001`

**Problems:**
- Ambiguous: Is `1801` barangay 18 spot 01, or barangay 1 spot 80, or barangay 180 spot 1?
- Harder to parse: Need to know barangay ID length to split correctly
- Less human-readable: Components blend together

## New Format: `YYYY-BB-SS-QQQ`

**Example:** `2026-18-01-001`

**Components:**
- `YYYY`: 4-digit year (e.g., 2026)
- `BB`: Barangay ID, no padding (e.g., 18, 1, 126)
- `SS`: 2-digit spot number within barangay (01, 02, 03...)
- `QQQ`: 3-digit questionnaire number within spot (001, 002, 003...)

**Benefits:**
1. ✅ **Unambiguous:** Clear separation between all components
2. ✅ **Easy to parse:** Simple `id.split('-')` operation
3. ✅ **Human-readable:** Visual clarity with hyphens
4. ✅ **Prevents confusion:** No ambiguity in component boundaries
5. ✅ **Standard format:** Follows common ID formatting conventions

## Examples

### McKinley (Barangay 18)
```
Spot 1:
  2026-18-01-001  (Male)
  2026-18-01-002  (Female)
  2026-18-01-003  (Male)
  2026-18-01-004  (Female)
  2026-18-01-005  (Male)

Spot 2:
  2026-18-02-001  (Male)
  2026-18-02-002  (Female)
  ...
```

### Barangay 1
```
Spot 1:
  2026-1-01-001   (Male)
  2026-1-01-002   (Female)
  ...

Spot 80:
  2026-1-80-001   (Male)
  2026-1-80-002   (Female)
  ...
```

### Barangay 126
```
Spot 1:
  2026-126-01-001 (Male)
  2026-126-01-002 (Female)
  ...
```

## Parsing Example

```javascript
const id = "2026-18-01-001";
const [year, barangayId, spotNumber, questionnaireNumber] = id.split('-');

console.log({
  year: year,                    // "2026"
  barangayId: barangayId,        // "18"
  spotNumber: spotNumber,        // "01"
  questionnaireNumber: questionnaireNumber  // "001"
});
```

## Using the Parser Utility

```javascript
import { parseQuestionnaireId, getRequiredGender } from '@/utils/questionnaireIdParser';

const id = "2026-18-01-001";
const parsed = parseQuestionnaireId(id);

console.log(parsed);
// {
//   year: 2026,
//   barangayId: 18,
//   spotNumber: 1,
//   questionnaireNumber: 1,
//   isValid: true,
//   raw: "2026-18-01-001"
// }

const gender = getRequiredGender(id);
console.log(gender); // "Male" (odd questionnaire number)
```

## Special Cases

### On-the-Fly Questionnaires (Not Tied to Spots)

For questionnaires generated via `/api/questionnaire-number` (not pre-assigned to spots), use spot number `00`:

```
2026-18-00-001  (Barangay 18, no spot, questionnaire 1)
2026-18-00-002  (Barangay 18, no spot, questionnaire 2)
```

## Files Updated

1. ✅ `src/app/api/spots/route.ts` - Spot creation and questionnaire generation
2. ✅ `src/app/api/questionnaire-number/route.ts` - On-the-fly questionnaire generation
3. ✅ `src/utils/questionnaireIdParser.ts` - New parser utility (created)
4. ✅ `docs/COMPLETE_SURVEY_WORKFLOW.md` - Updated all examples

## Migration Notes

**Database Impact:**
- Existing questionnaires with old format will continue to work
- New questionnaires will use new format
- No data migration needed if starting fresh (database was reset)

**Code Compatibility:**
- Old parsing code that splits on `-` will need adjustment
- Use the new `parseQuestionnaireId()` utility for consistent parsing
- Gender determination logic remains the same (odd/even)

## Testing Checklist

- [ ] Create new spot → Verify questionnaire IDs use new format
- [ ] Parse questionnaire ID → Verify all components extracted correctly
- [ ] Gender assignment → Verify odd=Male, even=Female still works
- [ ] Survey form → Verify questionnaire ID displays correctly
- [ ] Spot dashboard → Verify interview slots show new format
- [ ] Database queries → Verify questionnaire lookups work

## Rollback Plan

If issues arise, revert these files:
1. `src/app/api/spots/route.ts`
2. `src/app/api/questionnaire-number/route.ts`

The old format can be restored by changing the `generateQuestionnaireId()` function back to concatenating barangay ID and spot number without a hyphen.
