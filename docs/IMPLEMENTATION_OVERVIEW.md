# Conditional Questions - Implementation Overview

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SURVEY QUESTIONNAIRE FLOW                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Awareness Question  │
│  "Are you aware of   │
│   this service?"     │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
    YES         NO
     │           │
     │           ▼
     │     ┌─────────────────────────┐
     │     │ MODULE 1: UNAWARENESS   │
     │     │ "Why were you unaware?" │
     │     │                         │
     │     │ □ Info from other       │
     │     │   sources               │
     │     │ □ Lack of outreach      │
     │     │ □ Not relevant to me    │
     │     │ □ Hard to find/         │
     │     │   understand            │
     │     │ □ Other reason          │
     │     └────────┬────────────────┘
     │              │
     │              ▼
     │     ┌────────────────┐
     │     │ SKIP TO NEXT   │
     │     │ SERVICE        │
     │     └────────────────┘
     │
     ▼
┌──────────────────────┐
│ Availment Question   │
│ "Did you use this    │
│  service?"           │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
    YES         NO
     │           │
     │           ▼
     │     ┌─────────────────────────┐
     │     │ MODULE 2: NON-AVAILMENT │
     │     │ "Why didn't you use it?"│
     │     │                         │
     │     │ □ Didn't need it        │
     │     │ □ Process too difficult │
     │     │ □ Location/access       │
     │     │ □ Cost concerns         │
     │     │ □ Quality/trust issues  │
     │     │ □ Eligibility issues    │
     │     │ □ Other reason          │
     │     └────────┬────────────────┘
     │              │
     │              ▼
     │     ┌────────────────┐
     │     │ SKIP           │
     │     │ SATISFACTION   │
     │     └────────────────┘
     │
     ▼
┌──────────────────────┐
│ Satisfaction Rating  │
│ (1-5 scale)          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Need for Action      │
│ (Yes/No)             │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Suggestions          │
│ (if needed)          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ NEXT SERVICE         │
│ INDICATOR            │
└──────────────────────┘
```

## 🗄️ Database Structure

```
survey_response table
├── response_id (PK)
├── survey_number
├── barangay_id
├── ... (existing fields)
├── unawareness_reasons (JSONB) ← NEW
│   └── {
│       "projects": "Lack of outreach",
│       "financial": "Info from other sources",
│       "disasterInfo": "Not relevant to me"
│   }
└── non_availment_reasons (JSONB) ← NEW
    └── {
        "healthServices": "Location too far",
        "wasteManagement": "Didn't need it",
        "businessClearance": "Process too difficult"
    }
```

## 📁 File Structure

```
SIGLA/
├── src/
│   ├── types/
│   │   └── survey.ts ✏️ (updated)
│   ├── app/
│   │   ├── survey/forms/utils/
│   │   │   ├── conditionalQuestions.ts ✨ (new)
│   │   │   ├── conditionalFlow.ts ✨ (new)
│   │   │   ├── questionsWithConditionals.ts ✨ (new)
│   │   │   └── questions.ts ✏️ (updated)
│   │   └── api/
│   │       ├── survey/conditional-responses/route.ts ✨
│   │       └── analytics/conditional-insights/route.ts ✨
│   └── components/
│       └── analytics/
│           └── ConditionalInsightsChart.tsx ✨
├── prisma/
│   ├── schema.prisma ✏️ (updated)
│   └── migrations/
│       └── 20251218090840_add_conditional_questions/
│           └── migration.sql ✨
└── docs/
    ├── CONDITIONAL_QUESTIONS_IMPLEMENTATION.md ✨
    ├── MIGRATION_GUIDE.md ✨
    ├── MIGRATION_TROUBLESHOOTING.md ✨
    └── CONDITIONAL_QUESTIONS_SUMMARY.md ✨

Legend: ✨ New file  ✏️ Modified file
```

## 🌍 Language Support

```
┌─────────────────────┬──────────────┬──────────────┬──────────────┐
│ Section             │ English      │ Filipino     │ Bisaya       │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ Financial Admin     │      -       │      ✅      │      ✅      │
│ Disaster Prep       │      ✅      │      -       │      -       │
│ Safety & Order      │      ✅      │      -       │      -       │
│ Social Protection   │      ✅      │      -       │      -       │
│ Business            │      ✅      │      -       │      -       │
│ Environmental       │      ✅      │      -       │      -       │
└─────────────────────┴──────────────┴──────────────┴──────────────┘
```

## 📊 Analytics Dashboard

```
┌────────────────────────────────────────────────────────────┐
│                  CONDITIONAL INSIGHTS                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Total Responses: 150                                   │
│  ❌ Unawareness Cases: 45 (30%)                            │
│  ⚠️  Non-Availment Cases: 32 (21%)                         │
│  📈 Services Analyzed: 14                                   │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  TOP UNAWARENESS REASONS                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  1. Lack of outreach (40%) ████████████████████░░░░░░░░░   │
│  2. Info from other sources (25%) ████████████░░░░░░░░░░   │
│  3. Not relevant (20%) ██████████░░░░░░░░░░░░░░░░░░░░░░   │
│  4. Hard to find (10%) █████░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│  5. Other (5%) ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  TOP NON-AVAILMENT BARRIERS                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  1. Didn't need it (35%) ██████████████████░░░░░░░░░░░░░   │
│  2. Location too far (25%) ████████████░░░░░░░░░░░░░░░░   │
│  3. Process difficult (20%) ██████████░░░░░░░░░░░░░░░░░   │
│  4. Cost concerns (12%) ██████░░░░░░░░░░░░░░░░░░░░░░░░   │
│  5. Quality issues (8%) ████░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## 🔄 API Endpoints

```
POST   /api/survey/conditional-responses
       Save conditional question responses
       Body: { responseId, formData }

GET    /api/survey/conditional-responses?responseId={id}
       Retrieve conditional responses for a survey

PUT    /api/survey/conditional-responses
       Update conditional responses
       Body: { responseId, unawarenessReasons, nonAvailmentReasons }

GET    /api/analytics/conditional-insights
       Get analytics and insights
       Params: ?barangayId={id}&cycleId={id}&serviceArea={area}
```

## ⚡ Quick Commands

```bash
# 1. Apply Migration (Choose one method)
# Method A: Supabase SQL Editor (Recommended)
#   → Copy SQL from docs/MIGRATION_TROUBLESHOOTING.md
#   → Run in Supabase Dashboard
#   → Then run:
npx prisma migrate resolve --applied 20251218090840_add_conditional_questions

# Method B: Prisma CLI (if no connection issues)
npx prisma migrate deploy

# 2. Generate Client
npx prisma generate

# 3. Start App
npm run dev

# 4. Test
# → Navigate to survey form
# → Answer "No" to awareness → See unawareness module
# → Answer "Yes" then "No" → See non-availment module

# 5. View Data
psql "your_connection_string" -c "
  SELECT response_id, unawareness_reasons, non_availment_reasons 
  FROM survey_response 
  WHERE unawareness_reasons != '{}'::jsonb 
  LIMIT 3;
"
```

## 📚 Documentation Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| `QUICK_START.md` | Get started in 5 minutes | First time setup |
| `docs/CONDITIONAL_QUESTIONS_SUMMARY.md` | Overview and features | Understanding the system |
| `docs/MIGRATION_GUIDE.md` | Detailed migration steps | Deployment |
| `docs/MIGRATION_TROUBLESHOOTING.md` | Fix connection errors | When migration fails |
| `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md` | Complete technical guide | Development reference |
| `CONDITIONAL_QUESTIONS_CHECKLIST.md` | Testing checklist | Quality assurance |

## ✅ Success Indicators

Your implementation is working when:

- ✅ No errors in terminal or browser console
- ✅ Unawareness question appears after "No" to awareness
- ✅ Non-availment question appears after "Yes" then "No"
- ✅ Questions skip correctly to next service
- ✅ Data saves to database in JSONB format
- ✅ Analytics dashboard displays insights
- ✅ All 14 service indicators covered

## 🎯 Impact

This feature enables you to:

1. **Understand** why residents don't know about services
2. **Identify** specific barriers preventing usage
3. **Prioritize** improvements based on data
4. **Track** changes over time
5. **Improve** service delivery systematically

---

**Status:** ✅ Ready for Deployment  
**Version:** 1.0  
**Last Updated:** December 18, 2025