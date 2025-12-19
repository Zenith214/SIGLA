# Conditional Questions Implementation Checklist

## 🎉 Latest Session Updates (Dec 18, 2024)

### ✅ Issues Fixed - Round 1
1. **Syntax Errors in translations.ts** - Fixed apostrophe issues in option strings (changed single quotes to double quotes)
2. **Missing Textarea Support** - Added textarea rendering for "Other reason" followUpQuestions in QuestionRenderer.tsx
3. **Language Switching for Questions** - Fixed translation lookup for question titles

### ✅ Issues Fixed - Round 2
4. **Language Switching for Options** - Fixed conditional question options not translating:
   - Modified `createUnawarenessReasonQuestion()` to always use English option keys
   - Modified `createNonAvailmentReasonQuestion()` to always use English option keys
   - Updated QuestionRenderer to use `translatedOptions` for followUpQuestions
   - Updated question-flow.tsx to translate followUpQuestions options
   - Added "Please specify:" translation for text field labels

### ✅ Issues Fixed - Round 3
5. **Corruption Section Custom Logic** - Removed unawareness module from corruption section and implemented custom skip logic:
   - Q13 (awarenessCorruption) - Always shown, no dependencies
   - Q14 (experiencedCorruption) - Always shown after Q13, if "No" → skip to Q19
   - Q15 (detailsCorruption) - Only if Q14 = "Yes"
   - Q16 (reportedCorruption) - Only if Q14 = "Yes"
   - Q17 (reasonsNotReporting) - Only if Q16 = "No"
   - Q18 (satisfactionReportResponse) - Only if Q16 = "Yes"
   - Q19 (suggestionsCorruption) - Always shown to everyone

### 🎯 Ready for Testing
- ✅ Language switching between English/Filipino/Bisaya tabs (questions AND options)
- ✅ "Other reason" text field appears when that option is selected
- ✅ Text field is required when "Other reason" is selected
- ✅ Text field label translates correctly
- ✅ All conditional questions display with proper formatting
- ✅ Conditional questions trigger correctly (Module 1 on awareness="No", Module 2 on awareness="Yes" + availment="No")
- ✅ All option choices translate when language changes
- ✅ Corruption section uses custom skip logic (NOT standard modules)
- ✅ Q13 and Q19 always shown to all respondents
- ✅ Q14 "No" skips directly to Q19
- ✅ Q16 controls whether Q17 or Q18 is shown

## ✅ Implementation Status

### Core Files Created
- [x] `src/types/survey.ts` - TypeScript types updated
- [x] `src/app/survey/forms/utils/conditionalQuestions.ts` - Question logic
- [x] `src/app/survey/forms/utils/conditionalFlow.ts` - Flow control
- [x] `src/app/survey/forms/utils/questionsWithConditionals.ts` - Updated questions
- [x] `src/app/survey/forms/utils/questionsUpdater.ts` - Helper utilities
- [x] `src/app/survey/forms/utils/questions.ts` - Modified main file

### Database
- [x] `prisma/schema.prisma` - Schema updated with new fields
- [x] `prisma/migrations/20251218090840_add_conditional_questions/migration.sql` - Migration created
- [ ] **ACTION REQUIRED:** Run migration (`npx prisma migrate deploy`)
- [ ] **ACTION REQUIRED:** Generate Prisma client (`npx prisma generate`)

### API Endpoints
- [x] `src/app/api/survey/conditional-responses/route.ts` - CRUD operations
- [x] `src/app/api/analytics/conditional-insights/route.ts` - Analytics

### Analytics Dashboard
- [x] `src/components/analytics/ConditionalInsightsChart.tsx` - Chart component

### Documentation
- [x] `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md` - Complete guide
- [x] `docs/MIGRATION_GUIDE.md` - Migration instructions
- [x] `docs/CONDITIONAL_QUESTIONS_SUMMARY.md` - Quick summary
- [x] `CONDITIONAL_QUESTIONS_CHECKLIST.md` - This checklist

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Apply the migration
npx prisma migrate deploy

# Regenerate Prisma client
npx prisma generate
```
- [ ] Migration applied successfully
- [ ] Prisma client regenerated
- [ ] No errors in console

### 2. Application Restart
```bash
# Restart development server
npm run dev
```
- [ ] Server started without errors
- [ ] No TypeScript compilation errors
- [ ] No runtime errors in console

### 3. Testing - Unawareness Module

Test in Financial Section (Filipino):
- [ ] Navigate to survey form
- [ ] Answer "Hindi" to "awarenessProjects"
- [ ] Verify unawareness reason question appears
- [ ] Select a reason and submit
- [ ] Check database: `unawareness_reasons` field populated

Test in Disaster Section (English):
- [ ] Answer "No" to "awarenessDisasterInfo"
- [ ] Verify unawareness reason question appears
- [ ] Select a reason and submit
- [ ] Check database: data stored correctly

### 4. Testing - Non-Availment Module

Test in Financial Section:
- [ ] Answer "Oo" to "awarenessProjects"
- [ ] Answer "Hindi" to "benefitedProjects"
- [ ] Verify non-availment reason question appears
- [ ] Select a reason and submit
- [ ] Check database: `non_availment_reasons` field populated

Test in Social Section:
- [ ] Answer "Yes" to "awarenessHealthServices"
- [ ] Answer "No" to "availmentHealthServices"
- [ ] Verify non-availment reason question appears
- [ ] Select a reason and submit
- [ ] Check database: data stored correctly

### 5. Testing - Skip Logic

Verify automatic skipping works:
- [ ] After unawareness question, skips to next service indicator
- [ ] After non-availment question, skips satisfaction questions
- [ ] No broken navigation or stuck states
- [ ] Progress bar updates correctly

### 6. Testing - Analytics Dashboard

```tsx
// Add to your analytics page
import { ConditionalInsightsChart } from '@/components/analytics/ConditionalInsightsChart';

<ConditionalInsightsChart 
  barangayId={1} 
  cycleId={2} 
  serviceArea="financial" 
/>
```

- [ ] Component renders without errors
- [ ] Summary statistics display correctly
- [ ] Top reasons show with percentages
- [ ] Service-specific breakdown works
- [ ] Tabs switch between unawareness/non-availment
- [ ] Filters work (barangay, cycle, service area)

### 7. Data Verification

Run these SQL queries to verify:

```sql
-- Check if columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'survey_response' 
AND column_name IN ('unawareness_reasons', 'non_availment_reasons');

-- Check sample data
SELECT 
  response_id,
  survey_number,
  unawareness_reasons,
  non_availment_reasons
FROM survey_response
WHERE unawareness_reasons != '{}'::jsonb 
   OR non_availment_reasons != '{}'::jsonb
LIMIT 5;

-- Count responses with conditional data
SELECT 
  COUNT(*) FILTER (WHERE unawareness_reasons != '{}'::jsonb) as unawareness_count,
  COUNT(*) FILTER (WHERE non_availment_reasons != '{}'::jsonb) as non_availment_count,
  COUNT(*) as total_responses
FROM survey_response;
```

- [ ] Columns exist with correct data types
- [ ] Sample data shows correct JSON structure
- [ ] Counts match expected values

### 8. API Testing

Test the API endpoints:

```bash
# Save conditional responses
curl -X POST http://localhost:3000/api/survey/conditional-responses \
  -H "Content-Type: application/json" \
  -d '{"responseId": 1, "formData": {...}}'

# Get conditional responses
curl http://localhost:3000/api/survey/conditional-responses?responseId=1

# Get analytics insights
curl http://localhost:3000/api/analytics/conditional-insights?barangayId=1&cycleId=2
```

- [ ] POST endpoint saves data correctly
- [ ] GET endpoint retrieves data correctly
- [ ] Analytics endpoint returns proper JSON
- [ ] No 500 errors or crashes

## 📋 Service Indicators Coverage

### Financial Administration (Filipino) ✅
- [x] projects - Mga Proyekto ng Barangay
- [x] financial - Pananalaping Kaalaman at Transparency
- [x] socialPrograms - Mga Programang Panlipunan
- [x] corruption - Perception of Corruption

### Disaster Preparedness (English) ✅
- [x] disasterInfo - Disaster Information and Early Warning
- [x] evacuation - Evacuation and Emergency Response

### Safety & Peace Order (English) ⚠️
- [ ] tanods - Barangay Tanod Services (needs conditional questions added)
- [ ] lupon - Community Dispute Resolution (needs conditional questions added)
- [ ] antiDrug - Anti-Illegal Drug Programs (needs conditional questions added)

### Social Protection (English) ⚠️
- [ ] healthServices - Health Services (needs conditional questions added)
- [ ] womenChildrenProtection - Protection Services (needs conditional questions added)
- [ ] communityParticipation - Community Participation (needs conditional questions added)

### Business Friendliness (English) ⚠️
- [ ] businessClearance - Business Clearance (needs conditional questions added)

### Environmental Management (English) ⚠️
- [ ] wasteManagement - Waste Management (needs conditional questions added)

**Note:** Financial and Disaster sections are fully implemented. Other sections need to be updated in `questionsWithConditionals.ts` following the same pattern.

## 🔧 Troubleshooting

### Issue: Migration fails with "prepared statement already exists"
**Solution:**
1. Close all database connections
2. Restart PostgreSQL service
3. Try migration again

### Issue: TypeScript errors about missing properties
**Solution:**
```bash
npx prisma generate
npm run dev
```

### Issue: Conditional questions not appearing
**Solution:**
1. Check browser console for errors
2. Verify question IDs match in conditionalQuestions.ts
3. Check formData values in React DevTools

### Issue: Data not saving to database
**Solution:**
1. Check API endpoint logs
2. Verify Prisma client is updated
3. Check database connection
4. Review API route implementation

## 📚 Documentation Reference

- **Full Implementation Guide:** `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md`
- **Migration Instructions:** `docs/MIGRATION_GUIDE.md`
- **Quick Summary:** `docs/CONDITIONAL_QUESTIONS_SUMMARY.md`

## ✨ Success Criteria

The implementation is successful when:
- [x] All files created without errors
- [ ] Database migration applied successfully
- [ ] Unawareness module triggers correctly
- [ ] Non-availment module triggers correctly
- [ ] Data saves to database in correct format
- [ ] Analytics dashboard displays insights
- [ ] No console errors or warnings
- [ ] Skip logic works as expected
- [ ] All service indicators covered

## 🎯 Next Actions

1. **Immediate:**
   - [ ] Run database migration
   - [ ] Test unawareness module
   - [ ] Test non-availment module
   - [ ] Verify data storage

2. **Short-term:**
   - [ ] Complete remaining service indicators (safety, social, business, environmental)
   - [ ] Add analytics to main dashboard
   - [ ] Train field interviewers
   - [ ] Create user documentation

3. **Long-term:**
   - [ ] Analyze collected data
   - [ ] Generate insights reports
   - [ ] Implement recommendations
   - [ ] Track improvements over time

---

**Last Updated:** December 18, 2025  
**Status:** Ready for Testing  
**Priority:** High