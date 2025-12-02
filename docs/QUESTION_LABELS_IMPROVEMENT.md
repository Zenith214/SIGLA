# Question Labels Improvement

## Problem

The aggregated analytics view showed technical field names that were hard to understand:

```
business_receivedBusinessSupport
business_awarenessBusinessSupport
business_nfaBinaryBusinessSupport
```

Users couldn't easily tell what these questions meant without referring to the survey form.

---

## Solution

Created a comprehensive question label mapping system that converts technical field names into human-readable labels with additional metadata.

**File:** `src/utils/questionLabels.ts`

---

## Before vs After

### Before (Technical Names)
```json
{
  "business_receivedBusinessSupport": {
    "section": "business",
    "question": "receivedBusinessSupport",
    "responses": ["Yes", "Yes", "No", ...],
    "valueCount": {
      "Yes": 119,
      "No": 32
    }
  }
}
```

**Problem:** What does "receivedBusinessSupport" mean?

### After (Human-Readable Labels)
```json
{
  "business_receivedBusinessSupport": {
    "section": "business",
    "question": "receivedBusinessSupport",
    "questionLabel": "Availment: Received Business Support",
    "questionType": "availment",
    "sectionName": "Business Friendliness",
    "description": "Have you received business support from the barangay?",
    "responses": ["Yes", "Yes", "No", ...],
    "valueCount": {
      "Yes": 119,
      "No": 32
    }
  }
}
```

**Solution:** Clear label, type, and description!

---

## Complete Example

### Financial Administration Section

#### Before
```
financial_awarenessProjects
financial_benefitedProjects
financial_satisfactionProjects
financial_nfaBinaryProjects
financial_suggestionsProjects
```

#### After
```
Awareness: Barangay Projects & Programs
Availment: Benefited from Projects
Satisfaction: Projects & Programs
Need for Action: Projects
Suggestions: Projects
```

---

## Question Types

Each question is categorized by type:

1. **Awareness** - "Are you aware of...?"
   - Example: "Awareness: Business Support Programs"

2. **Availment** - "Have you used/benefited from...?"
   - Example: "Availment: Received Business Support"

3. **Satisfaction** - "How satisfied are you...?" (1-5 scale)
   - Example: "Satisfaction: Business Support Programs"

4. **NFA (Need for Action)** - "Does this need improvement?"
   - Example: "Need for Action: Business Support"

5. **Suggestion** - Open-ended feedback
   - Example: "Suggestions: Business Support"

6. **Other** - Miscellaneous questions
   - Example: "Overall Satisfaction"

---

## All Service Areas Covered

### 1. Financial Administration
- Projects & Programs
- Financial Information
- Social Programs
- Anti-Corruption Measures

### 2. Disaster Preparedness
- Disaster Information
- Evacuation Centers

### 3. Safety & Peace Order
- Barangay Tanods
- Lupon Tagapamayapa
- Anti-Drug Programs

### 4. Business Friendliness
- Business Clearance Process
- Business Support Programs

### 5. Social Protection
- Health Services
- Women & Children Protection
- Community Participation

### 6. Environmental Management
- Waste Management
- Environmental Programs

### 7. Overall Evaluation
- Overall Satisfaction
- Overall Need for Action

---

## API Response Structure

### Question Aggregation Object

```typescript
{
  "business_receivedBusinessSupport": {
    // Original fields
    "section": "business",
    "question": "receivedBusinessSupport",
    "responses": ["Yes", "Yes", "No", ...],
    "valueCount": { "Yes": 119, "No": 32 },
    "statistics": null,  // Only for numeric questions
    
    // NEW: Human-readable fields
    "questionLabel": "Availment: Received Business Support",
    "questionType": "availment",
    "sectionName": "Business Friendliness",
    "description": "Have you received business support from the barangay?"
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `section` | string | Technical section key (e.g., "business") |
| `question` | string | Technical question key (e.g., "receivedBusinessSupport") |
| `questionLabel` | string | **Human-readable label** |
| `questionType` | string | Question category (awareness, availment, satisfaction, nfa, suggestion, other) |
| `sectionName` | string | **Human-readable section name** |
| `description` | string | Full question text (if available) |
| `responses` | array | All individual responses |
| `valueCount` | object | Count of each unique answer |
| `statistics` | object | Stats for numeric questions (mean, median, min, max) |

---

## Usage Examples

### Display Question Label
```typescript
import { getQuestionLabel } from '@/utils/questionLabels'

const label = getQuestionLabel('business_receivedBusinessSupport')
// Returns: "Availment: Received Business Support"
```

### Get Question Metadata
```typescript
import { getQuestionMetadata } from '@/utils/questionLabels'

const metadata = getQuestionMetadata('business_receivedBusinessSupport')
// Returns:
// {
//   label: "Availment: Received Business Support",
//   section: "Business Friendliness",
//   type: "availment",
//   description: "Have you received business support from the barangay?"
// }
```

### Get All Questions for a Section
```typescript
import { getQuestionsBySection } from '@/utils/questionLabels'

const questions = getQuestionsBySection('business')
// Returns all business-related questions with metadata
```

### Get Questions by Type
```typescript
import { getQuestionsByType } from '@/utils/questionLabels'

const satisfactionQuestions = getQuestionsByType('satisfaction')
// Returns all satisfaction questions across all sections
```

---

## UI Display Recommendations

### Option 1: Simple Label
```tsx
<div className="question-header">
  <h3>{questionData.questionLabel}</h3>
</div>
```

**Output:**
```
Availment: Received Business Support
```

### Option 2: Label with Section
```tsx
<div className="question-header">
  <span className="section-badge">{questionData.sectionName}</span>
  <h3>{questionData.questionLabel}</h3>
</div>
```

**Output:**
```
[Business Friendliness] Availment: Received Business Support
```

### Option 3: Full Details
```tsx
<div className="question-card">
  <div className="question-meta">
    <span className="section">{questionData.sectionName}</span>
    <span className="type">{questionData.questionType}</span>
  </div>
  <h3>{questionData.questionLabel}</h3>
  {questionData.description && (
    <p className="description">{questionData.description}</p>
  )}
</div>
```

**Output:**
```
Business Friendliness | availment
Availment: Received Business Support
Have you received business support from the barangay?
```

---

## Benefits

### 1. Better User Experience
- ✅ Instantly understand what each question means
- ✅ No need to reference survey form
- ✅ Clear categorization by type

### 2. Easier Analysis
- ✅ Group questions by type (all satisfaction questions)
- ✅ Filter by section
- ✅ Search by label

### 3. Better Reporting
- ✅ Export with readable column names
- ✅ Generate reports with proper labels
- ✅ Share data with stakeholders

### 4. Maintainability
- ✅ Single source of truth for labels
- ✅ Easy to update labels
- ✅ Consistent across application

---

## Fallback Behavior

If a question key is not in the mapping, the system automatically formats it:

```typescript
// Input: "business_receivedBusinessSupport"
// Output: "business: Received Business Support"

// Input: "custom_newQuestion"
// Output: "custom: New Question"
```

This ensures the system never breaks even with new questions.

---

## Adding New Questions

To add a new question label:

1. Open `src/utils/questionLabels.ts`
2. Add entry to `questionLabels` object:

```typescript
'section_questionKey': {
  label: 'Human-Readable Label',
  section: 'Section Name',
  type: 'awareness' | 'availment' | 'satisfaction' | 'nfa' | 'suggestion' | 'other',
  description: 'Full question text (optional)'
}
```

3. Save and the label will be available immediately

---

## Testing

### Test the Mapping
```typescript
import { getQuestionLabel } from '@/utils/questionLabels'

// Test known question
console.log(getQuestionLabel('business_receivedBusinessSupport'))
// Expected: "Availment: Received Business Support"

// Test unknown question (fallback)
console.log(getQuestionLabel('custom_newQuestion'))
// Expected: "custom: New Question"
```

### Test API Response
```bash
# Get aggregated analytics
GET /api/survey-analytics?format=aggregated

# Check response includes new fields
{
  "questions": {
    "business_receivedBusinessSupport": {
      "questionLabel": "Availment: Received Business Support",
      "questionType": "availment",
      "sectionName": "Business Friendliness",
      "description": "Have you received business support from the barangay?"
    }
  }
}
```

---

## Impact

### Before
- Users confused by technical names
- Had to reference survey form constantly
- Difficult to understand aggregated data
- Poor user experience

### After
- Clear, descriptive labels
- Self-explanatory data
- Easy to analyze and report
- Professional presentation

---

## Related Documentation

- **Question Labels Utility:** `src/utils/questionLabels.ts`
- **Aggregated View Explanation:** `docs/AGGREGATED_VIEW_EXPLANATION.md`
- **Technical Documentation:** `docs/ANALYTICS_TAB_TECHNICAL_DOCUMENTATION.md`

---

**Document Version:** 1.0  
**Last Updated:** December 2, 2024  
**Status:** ✅ Implemented
