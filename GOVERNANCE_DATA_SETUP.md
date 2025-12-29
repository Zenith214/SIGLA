# Governance Integrity Snapshot - Data Setup Guide

## Issue: No Corruption Data Detected

The Governance Integrity Snapshot is showing 0% corruption because the Financial Administration section of your survey responses doesn't contain corruption-related fields.

## Understanding the Problem

The API looks for these fields in the Financial section (`section_key: 'financial'`):

### Required Fields (at least one variation):
```typescript
// Did resident experience corruption?
awarenessCorruption
corruptionAwareness
experiencedCorruption
corruption_awareness
corruption_experience

// Did they report it?
reportedCorruption
corruptionReported
corruption_reported

// Were they satisfied with the response?
satisfactionCorruptionResponse
corruptionResponseSatisfaction
corruption_response_satisfaction

// Why didn't they report?
reasonNotReporting
whyNotReported
reason_not_reporting
notReportingReason

// What type of corruption?
corruptionType
typeOfCorruption
corruption_type
corruptionTypeWitnessed

// Prevention suggestions
corruptionPreventionSuggestion
preventionSuggestion
corruption_prevention
preventCorruptionSuggestion
```

## Solution Options

### Option 1: Add Corruption Questions to Your Survey

If you're creating real surveys, add these questions to the Financial Administration section:

1. **Corruption Awareness/Experience**
   - Question: "Have you experienced or witnessed corruption in barangay services?"
   - Field name: `awarenessCorruption` or `experiencedCorruption`
   - Type: Yes/No

2. **Reporting**
   - Question: "Did you report this corruption to authorities?"
   - Field name: `reportedCorruption`
   - Type: Yes/No
   - Conditional: Only show if answered "Yes" to question 1

3. **Satisfaction with Response**
   - Question: "Were you satisfied with how authorities handled your report?"
   - Field name: `satisfactionCorruptionResponse`
   - Type: Multiple choice (Satisfied, Very Satisfied, Neutral, Dissatisfied, Very Dissatisfied)
   - Conditional: Only show if answered "Yes" to question 2

4. **Reason for Not Reporting**
   - Question: "Why didn't you report the corruption?"
   - Field name: `reasonNotReporting`
   - Type: Multiple choice or text
   - Options: "Fear of retaliation", "Don't know where to report", "Believe nothing will be done", "Too complicated", "Other"
   - Conditional: Only show if answered "No" to question 2

5. **Type of Corruption**
   - Question: "What type of corruption did you experience/witness?"
   - Field name: `corruptionType`
   - Type: Multiple choice
   - Options: "Bribery", "Extortion", "Nepotism", "Embezzlement", "Favoritism", "Other"
   - Conditional: Only show if answered "Yes" to question 1

6. **Prevention Suggestions**
   - Question: "What do you think would help prevent corruption in the barangay?"
   - Field name: `corruptionPreventionSuggestion`
   - Type: Text (open-ended)

### Option 2: Add Mock Corruption Data to Existing Responses

If you're testing with mock data, you can manually add corruption fields to the Financial section data:

```sql
-- Example: Update a survey response to include corruption data
UPDATE survey_section
SET data = jsonb_set(
  data,
  '{awarenessCorruption}',
  '"yes"'
)
WHERE section_key = 'financial'
AND response_id IN (
  SELECT response_id 
  FROM survey_response 
  WHERE barangay_id = 8 
  AND survey_cycle_id = 17
  LIMIT 10  -- Add to 10 responses
);

-- Add reported corruption
UPDATE survey_section
SET data = jsonb_set(
  data,
  '{reportedCorruption}',
  '"no"'
)
WHERE section_key = 'financial'
AND data->>'awarenessCorruption' = 'yes'
LIMIT 7;  -- 7 out of 10 didn't report

-- Add reason for not reporting
UPDATE survey_section
SET data = jsonb_set(
  data,
  '{reasonNotReporting}',
  '"Fear of retaliation"'
)
WHERE section_key = 'financial'
AND data->>'reportedCorruption' = 'no'
LIMIT 3;

UPDATE survey_section
SET data = jsonb_set(
  data,
  '{reasonNotReporting}',
  '"Don''t know where to report"'
)
WHERE section_key = 'financial'
AND data->>'reportedCorruption' = 'no'
AND data->>'reasonNotReporting' IS NULL
LIMIT 2;

-- Add corruption types
UPDATE survey_section
SET data = jsonb_set(
  data,
  '{corruptionType}',
  '"Bribery"'
)
WHERE section_key = 'financial'
AND data->>'awarenessCorruption' = 'yes'
LIMIT 5;

UPDATE survey_section
SET data = jsonb_set(
  data,
  '{corruptionType}',
  '"Favoritism"'
)
WHERE section_key = 'financial'
AND data->>'awarenessCorruption' = 'yes'
AND data->>'corruptionType' IS NULL
LIMIT 3;

-- Add prevention suggestions
UPDATE survey_section
SET data = jsonb_set(
  data,
  '{corruptionPreventionSuggestion}',
  '"Increase transparency in barangay transactions"'
)
WHERE section_key = 'financial'
LIMIT 5;

UPDATE survey_section
SET data = jsonb_set(
  data,
  '{corruptionPreventionSuggestion}',
  '"Establish anonymous reporting hotline"'
)
WHERE section_key = 'financial'
AND data->>'corruptionPreventionSuggestion' IS NULL
LIMIT 5;
```

### Option 3: Use a Script to Generate Mock Data

Create a script to add realistic mock corruption data:

```typescript
// scripts/add-mock-corruption-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMockCorruptionData() {
  const barangayId = 8;
  const cycleId = 17;
  
  // Get all responses for this barangay/cycle
  const responses = await prisma.surveyResponse.findMany({
    where: {
      barangay_id: barangayId,
      survey_cycle_id: cycleId,
      progress: 100
    },
    include: {
      sections: {
        where: { section_key: 'financial' }
      }
    }
  });
  
  console.log(`Found ${responses.length} responses`);
  
  // Add corruption data to 10% of responses (realistic rate)
  const corruptionCount = Math.ceil(responses.length * 0.1);
  const responsesWithCorruption = responses.slice(0, corruptionCount);
  
  for (const response of responsesWithCorruption) {
    const financialSection = response.sections[0];
    if (!financialSection) continue;
    
    const currentData = financialSection.data as any || {};
    
    // Add corruption experience
    currentData.awarenessCorruption = 'yes';
    
    // 70% don't report
    const reported = Math.random() > 0.7;
    currentData.reportedCorruption = reported ? 'yes' : 'no';
    
    if (!reported) {
      // Add reason for not reporting
      const reasons = [
        'Fear of retaliation',
        "Don't know where to report",
        'Believe nothing will be done',
        'Too complicated',
        'Want to avoid trouble'
      ];
      currentData.reasonNotReporting = reasons[Math.floor(Math.random() * reasons.length)];
    } else {
      // Add satisfaction (50% satisfied)
      currentData.satisfactionCorruptionResponse = Math.random() > 0.5 ? 'satisfied' : 'dissatisfied';
    }
    
    // Add corruption type
    const types = ['Bribery', 'Extortion', 'Favoritism', 'Nepotism', 'Embezzlement'];
    currentData.corruptionType = types[Math.floor(Math.random() * types.length)];
    
    // Update the section
    await prisma.surveySection.update({
      where: { section_id: financialSection.section_id },
      data: { data: currentData }
    });
  }
  
  // Add prevention suggestions to 30% of all responses
  const suggestionCount = Math.ceil(responses.length * 0.3);
  const responsesWithSuggestions = responses.slice(0, suggestionCount);
  
  const suggestions = [
    'Increase transparency in barangay transactions',
    'Establish anonymous reporting hotline',
    'Regular audits of barangay funds',
    'Public posting of budgets and expenses',
    'Stronger penalties for corrupt officials',
    'Better training for barangay officials',
    'Community oversight committees'
  ];
  
  for (const response of responsesWithSuggestions) {
    const financialSection = response.sections[0];
    if (!financialSection) continue;
    
    const currentData = financialSection.data as any || {};
    currentData.corruptionPreventionSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    await prisma.surveySection.update({
      where: { section_id: financialSection.section_id },
      data: { data: currentData }
    });
  }
  
  console.log(`✅ Added corruption data to ${corruptionCount} responses`);
  console.log(`✅ Added prevention suggestions to ${suggestionCount} responses`);
}

addMockCorruptionData()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
  });
```

Run the script:
```bash
npx ts-node scripts/add-mock-corruption-data.ts
```

## Verifying the Data

After adding corruption data, check the API logs when you expand the Governance Integrity Snapshot:

```
[GOVERNANCE] Financial section data keys: ['awarenessCorruption', 'reportedCorruption', ...]
[GOVERNANCE] Summary: {
  totalRespondents: 150,
  experiencedCount: 15,
  reportedCount: 4,
  satisfiedCount: 2,
  corruptionExperienceRate: '10.0%'
}
```

## Expected Results

With proper corruption data, you should see:

- **Corruption Experience Rate:** 5-15% (realistic for most barangays)
- **Reporting Funnel:** Drop-off from experienced → reported → satisfied
- **Top Reasons:** List of why people don't report
- **Resident Voice:** Types of corruption and prevention ideas

## Troubleshooting

### Still showing 0%?

1. Check the browser console for API logs showing what fields were found
2. Verify the Financial section exists: `section_key = 'financial'`
3. Ensure responses are completed: `progress = 100`
4. Check the barangay_id and cycle_id match your report card

### API returns "No corruption data available"?

This means the Financial section doesn't have any of the expected corruption fields. Follow Option 2 or 3 above to add them.

---

**Note:** For production use, corruption questions should be carefully designed with input from governance experts and should follow ethical research guidelines, including informed consent and data protection measures.
