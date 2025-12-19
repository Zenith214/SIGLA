# Executive Summary API - Translation Implementation TODO

**Date:** December 20, 2024  
**Status:** ⚠️ Backend Update Required  
**Priority:** High

---

## Current Issue

The Report Card Executive Summary now has a language toggle feature (Bisaya, Filipino, English), but the AI API currently only generates content in **English** and stores it in the default fields. This causes the content to appear in English regardless of which language is selected.

---

## Required Backend Changes

### API Endpoint
**File:** `src/app/api/ai/executive-summary/route.ts`

### Current Behavior
```typescript
{
  executiveSummary: "English content...",  // Currently in English
  keyFindings: ["English finding 1", "English finding 2"],
  criticalIssues: [
    {
      issue: "English issue",
      impact: "English impact",
      affectedArea: "English area"
    }
  ]
}
```

### Required Behavior
```typescript
{
  // Bisaya (default/primary language)
  executiveSummary_bisaya: "Bisaya content...",
  keyFindings_bisaya: ["Bisaya finding 1", "Bisaya finding 2"],
  criticalIssues_bisaya: [
    {
      issue: "Bisaya issue",
      impact: "Bisaya impact",
      affectedArea: "Bisaya area"
    }
  ],
  
  // Filipino translation
  executiveSummary_filipino: "Filipino content...",
  keyFindings_filipino: ["Filipino finding 1", "Filipino finding 2"],
  criticalIssues_filipino: [
    {
      issue: "Filipino issue",
      impact: "Filipino impact",
      affectedArea: "Filipino area"
    }
  ],
  
  // English translation
  executiveSummary_english: "English content...",
  keyFindings_english: ["English finding 1", "English finding 2"],
  criticalIssues_english: [
    {
      issue: "English issue",
      impact: "English impact",
      affectedArea: "English area"
    }
  ],
  
  // Keep default fields for backward compatibility (use Bisaya or English)
  executiveSummary: "Bisaya content...",  // Fallback
  keyFindings: ["Bisaya finding 1", "Bisaya finding 2"],
  criticalIssues: [...]
}
```

---

## Implementation Options

### Option 1: Generate All Languages at Once (Recommended)

**Pros:**
- All translations available immediately
- Consistent quality across languages
- Better user experience

**Cons:**
- Higher API costs (3x the tokens)
- Slower generation time
- More complex prompt engineering

**Implementation:**
```typescript
// Modify the AI prompt to request all three languages
const prompt = `
Generate an executive summary for Barangay ${barangayName} in THREE languages:
1. Bisaya (Cebuano) - Primary language
2. Filipino (Tagalog)
3. English

For each language, provide:
- Executive Summary (2-3 paragraphs)
- Key Findings (4-5 bullet points)
- Critical Issues (top 3 with impact and affected area)

Return as JSON with language-specific fields:
{
  "executiveSummary_bisaya": "...",
  "executiveSummary_filipino": "...",
  "executiveSummary_english": "...",
  "keyFindings_bisaya": [...],
  "keyFindings_filipino": [...],
  "keyFindings_english": [...],
  "criticalIssues_bisaya": [...],
  "criticalIssues_filipino": [...],
  "criticalIssues_english": [...]
}
`;
```

### Option 2: Generate on Demand

**Pros:**
- Lower initial cost
- Faster initial load
- Only generate what's needed

**Cons:**
- Delay when switching languages
- Need to cache translations
- More complex state management

**Implementation:**
```typescript
// Generate Bisaya by default
// When user switches language, check if translation exists
// If not, make API call to translate
async function getTranslation(content: string, targetLanguage: 'filipino' | 'english') {
  // Call translation API or AI to translate
  // Cache the result
  // Return translated content
}
```

### Option 3: Hybrid Approach

**Pros:**
- Balance between cost and UX
- Generate Bisaya + English initially
- Filipino on demand

**Cons:**
- Still complex
- Inconsistent experience

---

## Recommended Prompt Structure

### For OpenAI/Anthropic

```typescript
const systemPrompt = `You are a local government analyst specializing in Philippine barangay governance. 
You provide executive summaries in three languages: Bisaya (Cebuano), Filipino (Tagalog), and English.
Ensure cultural appropriateness and use proper terminology for each language.`;

const userPrompt = `
Analyze the survey data for Barangay ${barangayName} and create an executive summary.

Survey Data:
${JSON.stringify(surveyData, null, 2)}

Generate the summary in THREE languages with the following structure:

**BISAYA (Cebuano):**
- Executive Summary: 2-3 paragraphs covering overall performance, strengths, and areas for attention
- Key Findings: 4-5 most important discoveries
- Critical Issues: Top 3 issues with impact level and affected service area

**FILIPINO (Tagalog):**
[Same structure as Bisaya]

**ENGLISH:**
[Same structure as Bisaya]

Return as JSON with this exact structure:
{
  "executiveSummary_bisaya": "string",
  "executiveSummary_filipino": "string",
  "executiveSummary_english": "string",
  "keyFindings_bisaya": ["string", "string", ...],
  "keyFindings_filipino": ["string", "string", ...],
  "keyFindings_english": ["string", "string", ...],
  "criticalIssues_bisaya": [
    {"issue": "string", "impact": "High|Medium|Low", "affectedArea": "string"}
  ],
  "criticalIssues_filipino": [...],
  "criticalIssues_english": [...]
}
`;
```

---

## Database Schema Update

### Current Schema
```sql
CREATE TABLE executive_summaries (
  id SERIAL PRIMARY KEY,
  barangay_id INTEGER,
  cycle_id INTEGER,
  executive_summary TEXT,
  key_findings JSONB,
  critical_issues JSONB,
  generated_at TIMESTAMP
);
```

### Recommended Schema
```sql
CREATE TABLE executive_summaries (
  id SERIAL PRIMARY KEY,
  barangay_id INTEGER,
  cycle_id INTEGER,
  
  -- Bisaya (primary)
  executive_summary_bisaya TEXT,
  key_findings_bisaya JSONB,
  critical_issues_bisaya JSONB,
  
  -- Filipino
  executive_summary_filipino TEXT,
  key_findings_filipino JSONB,
  critical_issues_filipino JSONB,
  
  -- English
  executive_summary_english TEXT,
  key_findings_english JSONB,
  critical_issues_english JSONB,
  
  -- Legacy fields (for backward compatibility)
  executive_summary TEXT,
  key_findings JSONB,
  critical_issues JSONB,
  
  generated_at TIMESTAMP,
  language_version VARCHAR(10) DEFAULT 'multi' -- 'single', 'multi'
);
```

---

## Migration Strategy

### Phase 1: Add New Fields (Non-Breaking)
1. Add new language-specific columns to database
2. Update API to generate all three languages
3. Populate both old and new fields
4. Frontend already supports new fields with fallback

### Phase 2: Transition Period
1. Monitor usage and costs
2. Verify translation quality
3. Gather user feedback
4. Fix any issues

### Phase 3: Deprecate Old Fields (Optional)
1. Stop populating old fields
2. Update any remaining code using old fields
3. Eventually remove old columns

---

## Testing Checklist

### Backend
- [ ] AI generates content in all three languages
- [ ] JSON structure matches expected format
- [ ] Database stores all language variants
- [ ] API returns all language fields
- [ ] Caching works for multi-language content
- [ ] Regenerate function updates all languages

### Frontend
- [ ] Bisaya content displays when Bisaya selected
- [ ] Filipino content displays when Filipino selected
- [ ] English content displays when English selected
- [ ] Fallback works if translation missing
- [ ] All sections translate (summary, findings, issues)
- [ ] Labels translate (Impact, Area, etc.)

### Quality Assurance
- [ ] Bisaya translation is culturally appropriate
- [ ] Filipino translation uses proper terminology
- [ ] English translation is professional
- [ ] Consistency across languages
- [ ] No mixed language content
- [ ] Proper grammar and spelling in all languages

---

## Cost Estimation

### Current Cost (English only)
- ~1,500 tokens per summary
- $0.03 per 1K tokens (GPT-4)
- **Cost per summary: ~$0.045**

### Estimated Cost (All 3 languages)
- ~4,500 tokens per summary (3x)
- $0.03 per 1K tokens (GPT-4)
- **Cost per summary: ~$0.135**

### Annual Cost (Example)
- 50 barangays
- 2 cycles per year
- 100 summaries per year
- **Current: $4.50/year**
- **Multi-language: $13.50/year**
- **Increase: $9/year**

*Note: Costs are minimal and worth the improved accessibility*

---

## Alternative: Translation Service

Instead of generating all languages with AI, could use a translation service:

### Option A: Google Translate API
- Generate in English
- Translate to Bisaya and Filipino
- Cheaper but lower quality
- May miss cultural nuances

### Option B: DeepL API
- Better quality than Google
- Supports Filipino
- Limited Bisaya support
- Still cheaper than AI generation

### Option C: Hybrid
- Generate Bisaya with AI (primary audience)
- Translate to Filipino and English
- Balance of quality and cost

---

## Recommended Next Steps

1. **Immediate:** Update AI prompt to generate all three languages
2. **Short-term:** Add database fields for language variants
3. **Medium-term:** Implement caching for translations
4. **Long-term:** Add translation quality monitoring

---

## Related Files

- `src/app/api/ai/executive-summary/route.ts` - API endpoint to update
- `src/app/reportcard/page.tsx` - Frontend (already updated)
- `docs/REPORT_CARD_LANGUAGE_TOGGLE_FEATURE.md` - Frontend documentation
- `docs/EXECUTIVE_SUMMARY_API_TRANSLATION_TODO.md` - This file

---

**Status:** ⚠️ Waiting for Backend Implementation  
**Assigned To:** Backend Developer  
**Estimated Effort:** 4-6 hours  
**Priority:** High - Feature is visible but not fully functional
