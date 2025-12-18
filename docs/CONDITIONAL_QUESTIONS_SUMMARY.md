# Conditional Questions Implementation - Summary

## 🎯 What Was Implemented

Two new conditional question modules have been added to the SIGLA survey system:

### Module 1: Unawareness Reason
**Trigger:** When respondent answers "No" to any awareness question  
**Purpose:** Understand WHY residents are unaware of services  
**Action:** Automatically skips remaining questions for that service and moves to next indicator

### Module 2: Non-Availment Reason
**Trigger:** When respondent is aware (Yes) but didn't use the service (No)  
**Purpose:** Identify BARRIERS preventing service utilization  
**Action:** Skips satisfaction questions and moves to next indicator

## 📁 Files Created/Modified

### Core Implementation
- ✅ `src/types/survey.ts` - Updated TypeScript types
- ✅ `src/app/survey/forms/utils/conditionalQuestions.ts` - Conditional question logic
- ✅ `src/app/survey/forms/utils/conditionalFlow.ts` - Flow control handler
- ✅ `src/app/survey/forms/utils/questionsWithConditionals.ts` - Updated questions
- ✅ `src/app/survey/forms/utils/questions.ts` - Modified to use conditional questions

### Database
- ✅ `prisma/schema.prisma` - Added new JSONB fields
- ✅ `prisma/migrations/20251218090840_add_conditional_questions/migration.sql` - Migration file

### API Endpoints
- ✅ `src/app/api/survey/conditional-responses/route.ts` - CRUD operations
- ✅ `src/app/api/analytics/conditional-insights/route.ts` - Analytics queries

### Analytics
- ✅ `src/components/analytics/ConditionalInsightsChart.tsx` - Dashboard component

### Documentation
- ✅ `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md` - Complete guide
- ✅ `docs/MIGRATION_GUIDE.md` - Migration instructions
- ✅ `docs/CONDITIONAL_QUESTIONS_SUMMARY.md` - This file

## 🗄️ Database Changes

Two new JSONB columns added to `survey_response` table:

```sql
unawareness_reasons    JSONB DEFAULT '{}'
non_availment_reasons  JSONB DEFAULT '{}'
```

**Data Structure Example:**
```json
{
  "unawareness_reasons": {
    "projects": "The barangay doesn't do enough to announce or promote their programs.",
    "financial": "I get my info from other sources, not directly from the barangay."
  },
  "non_availment_reasons": {
    "healthServices": "The location was too far or service hours were inconvenient.",
    "disasterInfo": "I/We did not need the service during that time."
  }
}
```

## 🌐 Multilingual Support

All conditional questions support 3 languages:
- **English** - For disaster, safety, social, business, environmental sections
- **Filipino/Tagalog** - For financial administration section
- **Bisaya/Cebuano** - Ready for future implementation

## 📊 Service Indicators Covered

### Financial Administration (Filipino)
- projects, financial, socialPrograms, corruption

### Disaster Preparedness (English)
- disasterInfo, evacuation

### Safety & Peace Order (English)
- tanods, lupon, antiDrug

### Social Protection (English)
- healthServices, womenChildrenProtection, communityParticipation

### Business Friendliness (English)
- businessClearance

### Environmental Management (English)
- wasteManagement

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
npx prisma migrate deploy
npx prisma generate
```

### 2. Restart Application
```bash
npm run dev
```

### 3. Test the Features
- Navigate to survey form
- Answer "No" to awareness → See unawareness module
- Answer "Yes" then "No" to availment → See non-availment module

### 4. View Analytics
```tsx
import { ConditionalInsightsChart } from '@/components/analytics/ConditionalInsightsChart';

<ConditionalInsightsChart 
  barangayId={1} 
  cycleId={2} 
  serviceArea="financial" 
/>
```

## 📈 Analytics Features

The analytics dashboard provides:

1. **Summary Statistics**
   - Total responses
   - Unawareness cases count & percentage
   - Non-availment cases count & percentage
   - Services analyzed

2. **Top Reasons Analysis**
   - Most common unawareness reasons
   - Most common non-availment barriers
   - Visual percentage bars

3. **Service-Specific Breakdown**
   - Detailed reasons per service indicator
   - Comparison across services
   - Filterable by barangay, cycle, service area

## 🎨 Reason Categories

### Unawareness Reasons (5 options)
1. Information Source Mismatch
2. Lack of Outreach
3. Low Personal Relevance
4. Information Not Accessible/Clear
5. Other (with text field)

### Non-Availment Reasons (7 options)
1. No Immediate Need
2. Process-Related Barriers
3. Location/Access Barriers
4. Financial Barriers
5. Quality/Trust-Related Barriers
6. Eligibility/Gatekeeping Barriers
7. Other (with text field)

## 🔧 API Endpoints

### Save Conditional Responses
```
POST /api/survey/conditional-responses
Body: { responseId, formData }
```

### Get Conditional Responses
```
GET /api/survey/conditional-responses?responseId={id}
```

### Analytics Insights
```
GET /api/analytics/conditional-insights?barangayId={id}&cycleId={id}&serviceArea={area}
```

## ✅ Benefits

1. **Deeper Insights** - Understand root causes of low awareness/usage
2. **Targeted Interventions** - Address specific barriers identified
3. **Data-Driven Decisions** - Make informed policy choices
4. **Service Improvement** - Prioritize improvements based on feedback
5. **Resource Allocation** - Focus resources on critical issues

## 🔄 Integration with Existing System

The implementation:
- ✅ Maintains backward compatibility
- ✅ Preserves existing question flow
- ✅ Adds conditional branches seamlessly
- ✅ Stores data in flexible JSONB format
- ✅ Provides analytics without breaking existing reports

## 📝 Next Steps

1. **Apply Migration** - Follow `docs/MIGRATION_GUIDE.md`
2. **Test Thoroughly** - Verify all sections work correctly
3. **Train Users** - Educate field interviewers on new questions
4. **Monitor Data** - Check data quality and completeness
5. **Analyze Results** - Use insights to improve services

## 🆘 Need Help?

- **Implementation Details**: `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md`
- **Migration Issues**: `docs/MIGRATION_GUIDE.md`
- **Code Reference**: Check the created files listed above

## 📊 Expected Impact

With this implementation, you can now:
- Identify the #1 reason residents don't know about services
- Pinpoint specific barriers preventing service usage
- Compare barriers across different services
- Track changes in awareness/usage patterns over time
- Make evidence-based decisions to improve service delivery

---

**Status:** ✅ Implementation Complete  
**Version:** 1.0  
**Date:** December 18, 2025  
**Ready for:** Testing & Deployment