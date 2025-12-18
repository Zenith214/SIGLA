# Conditional Questions Implementation Guide

## Overview

This document describes the implementation of two new conditional question modules for the SIGLA survey system:

1. **Unawareness Reason Module** - Triggered when a respondent answers "No" to an awareness question
2. **Non-Availment Reason Module** - Triggered when a respondent answers "Yes" to awareness but "No" to availment/experience

## Architecture

### Database Schema

Two new JSONB columns have been added to the `survey_response` table:

```sql
ALTER TABLE survey_response 
ADD COLUMN unawareness_reasons JSONB DEFAULT '{}',
ADD COLUMN non_availment_reasons JSONB DEFAULT '{}';
```

**Data Structure:**
```json
{
  "unawareness_reasons": {
    "projects": "The barangay doesn't do enough to announce or promote their programs.",
    "financial": "I get my info from other sources (e.g., neighbors, social media), not directly from the barangay."
  },
  "non_availment_reasons": {
    "disasterInfo": "I/We did not need the service during that time.",
    "healthServices": "The location was too far, hard to get to, or the service hours were inconvenient."
  }
}
```

### TypeScript Types

Updated types in `src/types/survey.ts`:

```typescript
export interface ServiceIndicatorData {
  satisfaction_rating?: number;
  need_for_action_binary: 'Yes' | 'No' | 'Oo' | 'Hindi';
  need_for_action_suggestion: string | null;
  unawareness_reason?: string | null;
  non_availment_reason?: string | null;
}

export interface UnawarenessReasonQuestion extends BaseQuestion {
  id: `${string}_unawareness_reason`;
  type: 'radio';
  options: string[];
  required: (formData: any) => boolean;
  dependsOn: string;
}

export interface NonAvailmentReasonQuestion extends BaseQuestion {
  id: `${string}_non_availment_reason`;
  type: 'radio';
  options: string[];
  required: (formData: any) => boolean;
  dependsOn: string;
}
```

## Question Flow Logic

### Module 1: Unawareness Reason

**Trigger Condition:**
- Respondent answers "No" / "Hindi" / "Hindi (No)" to ANY awareness question

**Question Text (Multilingual):**

**English:**
"There are many reasons why a resident might not hear about a service. From this list, what do you think is the main reason you were not aware of this one?"

**Filipino:**
"Maraming dahilan kung bakit hindi nababalitaan ng isang residente ang isang serbisyo. Mula sa listahang ito, ano sa tingin mo ang pangunahing dahilan kung bakit hindi mo ito nalaman?"

**Bisaya:**
"Adunay daghang rason nganong ang usa ka residente dili makadungog bahin sa usa ka serbisyo. Gikan niining listahan, unsa sa imong hunahuna ang nag-unang rason nga wala ka makahibalo niini?"

**Response Options:**

1. Information Source Mismatch
   - EN: "I get my info from other sources (e.g., neighbors, social media), not directly from the barangay."
   - FIL: "Nakukuha ko ang aking impormasyon mula sa ibang paraan (hal., mga kapitbahay, social media), hindi direkta mula sa barangay."
   - BIS: "Gakuha ko sa akong impormasyon gikan sa laing mga tinubdan (sama sa mga silingan, social media), dili direkta gikan sa barangay."

2. Lack of Outreach
   - EN: "The barangay doesn't do enough to announce or promote their programs."
   - FIL: "Kulang ang ginagawa ng barangay para i-anunsyo o i-promote ang kanilang mga programa."
   - BIS: "Kulang ang gihimo sa barangay aron ipahibalo o i-promote ang ilang mga programa."

3. Low Personal Relevance
   - EN: "It's not a service I was actively looking for, so I might have missed the information."
   - FIL: "Hindi ito serbisyong aktibo kong hinahanap, kaya maaaring nalampasan ko ang impormasyon."
   - BIS: "Dili kini serbisyo nga aktibo nakong gipangita, mao nga tingali wala nako makita ang impormasyon."

4. Information is Not Accessible/Clear
   - EN: "Even if information is posted, it's hard to find or understand."
   - FIL: "Kahit na naka-paskil ang impormasyon, mahirap itong hanapin o intindihin."
   - BIS: "Bisan kung gipaskil ang impormasyon, lisud kini pangitaon o sabton."

5. Other Reason (with text field)
   - EN: "Other Reason (Please specify):"
   - FIL: "Iba pang dahilan (Pakisabi):"
   - BIS: "Laing rason (Palihug isulti):"

**Behavior After Answer:**
- System automatically skips all remaining questions for that service indicator
- Proceeds to the next service indicator

### Module 2: Non-Availment Reason

**Trigger Condition:**
- Respondent answers "Yes" / "Oo" / "Oo (Yes)" to awareness question
- AND answers "No" / "Hindi" / "Hindi (No)" to availment/experience question

**Question Text (Multilingual):**

**English:**
"You mentioned you were aware of this service but didn't use it. From this list, what was the main reason you or your household did not avail of it?"

**Filipino:**
"Nabanggit ninyo na alam ninyo ang tungkol sa serbisyong ito ngunit hindi ninyo ito ginamit. Mula sa listahang ito, ano ang pangunahing dahilan kung bakit hindi ninyo o ng inyong sambahayan ito ginamit?"

**Bisaya:**
"Imong gihisgotan nga nahibal-an nimo kini nga serbisyo apan wala nimo kini gigamit. Gikan niining listahan, unsa ang nag-unang rason nga wala nimo o sa imong panimalay kini gipahimuslan?"

**Response Options:**

1. No Immediate Need
   - EN: "I/We did not need the service during that time."
   - FIL: "Hindi ko/namin kailangan ang serbisyo sa mga panahong iyon."
   - BIS: "Wala nako/namo kinahanglana ang serbisyo niadtong panahona."

2. Process-Related Barriers
   - EN: "The process seemed too difficult, complicated, or took too much time."
   - FIL: "Ang proseso ay tila napakahirap, kumplikado, o masyadong matagal."
   - BIS: "Ang proseso morag lisud kaayo, komplikado, o dugay kaayo."

3. Location/Access Barriers
   - EN: "The location was too far, hard to get to, or the service hours were inconvenient."
   - FIL: "Masyadong malayo ang lokasyon, mahirap puntahan, o hindi angkop ang oras ng serbisyo."
   - BIS: "Layo kaayo ang lokasyon, lisud adtoon, o dili kombenyente ang oras sa serbisyo."

4. Financial Barriers
   - EN: "I was concerned about the cost, fees, or other expenses involved."
   - FIL: "Nag-aalala ako sa gastos, bayarin, o iba pang gastusin na kasama dito."
   - BIS: "Nabalaka ko sa gasto, bayronon, o uban pang mga galastuhan."

5. Quality/Trust-Related Barriers
   - EN: "I was not confident in the quality of the service or the staff providing it."
   - FIL: "Wala akong tiwala sa kalidad ng serbisyo o sa mga tauhan na nagbibigay nito."
   - BIS: "Wala koy pagsalig sa kalidad sa serbisyo o sa mga kawani nga naghatag niini."

6. Eligibility/Gatekeeping Barriers
   - EN: "I thought I was not qualified, or I was told I was not eligible."
   - FIL: "Inakala kong hindi ako kwalipikado, o sinabihan akong hindi ako pwede."
   - BIS: "Abi nako dili ko kwalipikado, o giingnan ko nga dili ko pwede."

7. Other Reason (with text field)
   - EN: "Other Reason (Please specify):"
   - FIL: "Iba pang dahilan (Pakisabi):"
   - BIS: "Laing rason (Palihug isulti):"

**Behavior After Answer:**
- System automatically skips satisfaction questions for that service indicator
- Proceeds to the next service indicator

## Service Indicators Covered

### Financial Administration Section (Filipino)
- **projects** - Mga Proyekto ng Barangay
- **financial** - Pananalaping Kaalaman at Transparency
- **socialPrograms** - Mga Programang Panlipunan
- **corruption** - Perception of Corruption

### Disaster Preparedness Section (English)
- **disasterInfo** - Disaster Information and Early Warning
- **evacuation** - Evacuation and Emergency Response Resources

### Safety & Peace Order Section (English)
- **tanods** - General Safety and Barangay Tanod Services
- **lupon** - Community Dispute Resolution (Lupon)
- **antiDrug** - Anti-Illegal Drug Programs

### Social Protection Section (English)
- **healthServices** - Barangay Health Services
- **womenChildrenProtection** - Protection Services for Women and Children
- **communityParticipation** - Community Participation and Development

### Business Friendliness Section (English)
- **businessClearance** - Issuance of Barangay Clearance for Business

### Environmental Management Section (English)
- **wasteManagement** - Solid Waste Management

## API Endpoints

### Save Conditional Responses
```
POST /api/survey/conditional-responses
Body: {
  responseId: number,
  formData: Record<string, any>
}
```

### Retrieve Conditional Responses
```
GET /api/survey/conditional-responses?responseId={id}
```

### Update Conditional Responses
```
PUT /api/survey/conditional-responses
Body: {
  responseId: number,
  unawarenessReasons: Record<string, string>,
  nonAvailmentReasons: Record<string, string>
}
```

### Analytics - Conditional Insights
```
GET /api/analytics/conditional-insights?barangayId={id}&cycleId={id}&serviceArea={area}
```

## Analytics Dashboard

The analytics dashboard provides:

1. **Summary Statistics**
   - Total responses
   - Total unawareness cases
   - Total non-availment cases
   - Number of services analyzed

2. **Unawareness Analytics**
   - Top reasons for unawareness (overall)
   - Breakdown by service indicator
   - Percentage distribution

3. **Non-Availment Analytics**
   - Top reasons for non-availment (overall)
   - Breakdown by service indicator
   - Percentage distribution

4. **Service-Specific Insights**
   - Detailed breakdown per service
   - Comparison across services
   - Trend analysis

## Usage Example

```typescript
import { ConditionalInsightsChart } from '@/components/analytics/ConditionalInsightsChart';

// In your analytics page
<ConditionalInsightsChart 
  barangayId={1} 
  cycleId={2} 
  serviceArea="financial" 
/>
```

## Migration Steps

1. **Run Database Migration**
   ```bash
   psql -U your_user -d your_database -f prisma/migrations/add_unawareness_nonavailment_fields.sql
   ```

2. **Update Prisma Schema**
   ```bash
   npx prisma generate
   ```

3. **Test Conditional Flow**
   - Test unawareness module triggers
   - Test non-availment module triggers
   - Verify skip logic works correctly

4. **Verify Data Storage**
   - Check JSONB fields are populated correctly
   - Verify analytics queries return expected results

## Benefits

1. **Deeper Insights**: Understand WHY residents are unaware or not using services
2. **Targeted Interventions**: Identify specific barriers to address
3. **Data-Driven Decisions**: Make informed policy decisions based on actual resident feedback
4. **Service Improvement**: Prioritize improvements based on most common barriers
5. **Resource Allocation**: Allocate resources to address the most critical issues

## Future Enhancements

1. Add text analysis for "Other Reason" responses
2. Implement trend analysis over multiple cycles
3. Add comparative analysis across barangays
4. Create automated recommendations based on patterns
5. Integrate with CPAP (Citizen Priority Action Plan) module