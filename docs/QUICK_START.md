# Quick Start: Conditional Questions Feature

## 🚀 Get Started in 5 Minutes

### Step 1: Apply Database Migration (2 minutes)

**⚠️ If you get "prepared statement already exists" error:**
See `docs/MIGRATION_TROUBLESHOOTING.md` for solutions.

**Recommended: Use Supabase SQL Editor (Easiest)**

1. Open Supabase Dashboard → SQL Editor
2. Run this SQL:
```sql
ALTER TABLE "survey_response" 
ADD COLUMN IF NOT EXISTS "unawareness_reasons" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "non_availment_reasons" JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "idx_survey_response_unawareness_reasons" 
ON "survey_response" USING GIN ("unawareness_reasons");

CREATE INDEX IF NOT EXISTS "idx_survey_response_non_availment_reasons" 
ON "survey_response" USING GIN ("non_availment_reasons");
```

3. Mark migration as applied:
```bash
npx prisma migrate resolve --applied 20251218090840_add_conditional_questions
npx prisma generate
```

**Alternative: Use Prisma CLI (if no connection issues)**
```bash
# Apply migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Expected Output:**
```
✔ Applied migration 20251218090840_add_conditional_questions
✔ Generated Prisma Client
```

### Step 2: Restart Application (1 minute)

```bash
# Stop current server (Ctrl+C if running)
# Start development server
npm run dev
```

**Expected Output:**
```
✓ Ready in 3.2s
○ Local: http://localhost:3000
```

### Step 3: Test Unawareness Module (1 minute)

1. Open browser: `http://localhost:3000/survey/forms`
2. Navigate to Financial Administration section
3. Answer **"Hindi"** to first awareness question
4. **✅ You should see:** Unawareness reason question with 5 options
5. Select a reason and continue

### Step 4: Test Non-Availment Module (1 minute)

1. Start a new survey or continue
2. Answer **"Oo"** to awareness question
3. Answer **"Hindi"** to availment/experience question
4. **✅ You should see:** Non-availment reason question with 7 options
5. Select a reason and continue

### Step 5: View Analytics (Optional)

Add to your analytics page:

```tsx
import { ConditionalInsightsChart } from '@/components/analytics/ConditionalInsightsChart';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Conditional Insights</h1>
      <ConditionalInsightsChart 
        barangayId={1} 
        cycleId={2} 
      />
    </div>
  );
}
```

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] No errors in terminal
- [ ] No errors in browser console
- [ ] Unawareness question appears when answering "No" to awareness
- [ ] Non-availment question appears when answering "Yes" then "No"
- [ ] Questions skip correctly to next service indicator
- [ ] Data saves to database (check with SQL query below)

## 🔍 Quick Database Check

```sql
-- Check if migration applied
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'survey_response' 
AND column_name IN ('unawareness_reasons', 'non_availment_reasons');

-- View sample data (after testing)
SELECT 
  response_id,
  unawareness_reasons,
  non_availment_reasons
FROM survey_response
WHERE unawareness_reasons != '{}'::jsonb 
LIMIT 3;
```

## 📖 What You Get

### Unawareness Module
**Triggers when:** Respondent answers "No" to awareness question  
**Asks:** "Why were you not aware of this service?"  
**Options:**
1. I get info from other sources
2. Barangay doesn't promote enough
3. Not actively looking for it
4. Information hard to find/understand
5. Other reason

### Non-Availment Module
**Triggers when:** Aware but didn't use service  
**Asks:** "Why didn't you use this service?"  
**Options:**
1. Didn't need it
2. Process too difficult
3. Location/access issues
4. Cost concerns
5. Quality/trust concerns
6. Eligibility issues
7. Other reason

## 🎯 Supported Sections

Currently fully implemented:
- ✅ **Financial Administration** (Filipino) - 4 service indicators
- ✅ **Disaster Preparedness** (English) - 2 service indicators

Ready to implement (follow same pattern):
- ⏳ Safety & Peace Order - 3 service indicators
- ⏳ Social Protection - 3 service indicators
- ⏳ Business Friendliness - 1 service indicator
- ⏳ Environmental Management - 1 service indicator

## 🆘 Common Issues & Fixes

### Issue: "Cannot find module '@/types/survey'"
**Fix:**
```bash
npm run dev
# TypeScript will recompile
```

### Issue: "Column does not exist"
**Fix:**
```bash
npx prisma migrate deploy
npx prisma generate
```

### Issue: Conditional questions not showing
**Fix:**
1. Check browser console for errors
2. Verify you're answering with exact values: "No", "Hindi", "Yes", "Oo"
3. Clear browser cache and reload

### Issue: Data not saving
**Fix:**
1. Check API endpoint: `http://localhost:3000/api/survey/conditional-responses`
2. Verify Prisma client is updated: `npx prisma generate`
3. Check database connection in `.env`

## 📚 Full Documentation

For detailed information:
- **Implementation Guide:** `docs/CONDITIONAL_QUESTIONS_IMPLEMENTATION.md`
- **Migration Guide:** `docs/MIGRATION_GUIDE.md`
- **Summary:** `docs/CONDITIONAL_QUESTIONS_SUMMARY.md`
- **Checklist:** `CONDITIONAL_QUESTIONS_CHECKLIST.md`

## 💡 Pro Tips

1. **Test with real scenarios:** Use actual service names and realistic responses
2. **Check data quality:** Regularly review stored reasons for patterns
3. **Use analytics:** The insights dashboard helps identify trends
4. **Multilingual:** Financial section uses Filipino, others use English
5. **Extensible:** Easy to add more service indicators following the pattern

## 🎉 You're Ready!

The conditional questions feature is now active. Start collecting valuable insights about:
- Why residents don't know about services
- What barriers prevent service usage
- How to improve service delivery

**Happy surveying! 📊**

---

**Need Help?** Check the full documentation or review the implementation files.  
**Found a Bug?** Check the troubleshooting section in `docs/MIGRATION_GUIDE.md`