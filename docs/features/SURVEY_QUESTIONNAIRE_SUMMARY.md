# PULSE Survey Questionnaire - Complete Reference

This document contains all survey questions in English, Filipino, and Bisaya.
Generated on: 2025-12-19 20:21

## Service Areas Covered:
1. Financial Administration
2. Disaster Preparedness & Response
3. Safety & Peace Order
4. Social Protection & Services
5. Business Friendliness
6. Environmental Management
7. Overall Satisfaction & Need for Action

---

For the complete detailed questionnaire with all translations, please refer to:
- src/app/survey/forms/utils/questions.ts (Question structure)
- src/app/survey/forms/utils/translations.ts (All three language translations)

## Question Structure

Each service area follows this pattern:
1. **AWARENESS** - Do you know about this service?
2. **CONDITIONAL: Unawareness Reason** (if not aware)
3. **AVAILMENT/EXPERIENCE** - Have you used this service?
4. **CONDITIONAL: Non-Availment Reason** (if aware but didn't use)
5. **SATISFACTION** - Are you satisfied? (Yes/No binary format)
6. **NEED FOR ACTION** - Does it need improvement?
7. **SUGGESTIONS** - What improvements do you suggest?

## Conditional Modules

### Unawareness Reasons (when resident is NOT aware):
- Not informed by barangay
- No access to information
- Not interested
- Other reason

### Non-Availment Reasons (when resident IS aware but did NOT use):
- Did not need it
- Too far or inconvenient
- Not eligible
- Other reason

---

## OVERALL SATISFACTION (Final Section)

### M1: Overall Satisfaction
**English:** Overall, thinking about all the services provided by the barangay in the past 12 months, are you satisfied?

**Filipino:** Sa pangkalahatan, kung iisipin ang lahat ng serbisyong ibinigay ng barangay sa nakalipas na 12 buwan, nasisiyahan ka ba?

**Bisaya:** Sa kinatibuk-an, kung hunahunaon ang tanan nga serbisyo nga gihatag sa barangay sa miaging 12 ka bulan, kontento ka ba?

**Options:** Yes/Oo | No/Hindi

### M2: Overall Need for Action
**English:** On the whole, would you say that the barangay's services, in general, need action for improvement?

**Filipino:** Sa iyong pangkalahatang pananaw, sa kabuuan, kailangan bang gumawa ng aksyon ang barangay para mapabuti ang mga serbisyo nito?

**Bisaya:** Sa imong kinatibuk-ang panglantaw, sa tibuok, kinahanglan ba nga mohimo og aksyon ang barangay aron mapauswag ang iyang mga serbisyo?

**Options:** Yes/Oo | No/Hindi

---

## Technical Notes

- **Satisfaction Format:** Changed from 1-5 scale to binary Yes/No format
- **Conditional Logic:** Unawareness and non-availment modules trigger based on previous answers
- **Skip Logic:** Implemented to avoid irrelevant questions
- **Languages:** All questions available in English, Filipino (Tagalog), and Bisaya (Cebuano)
- **Total Service Areas:** 6 main areas + 1 overall section
- **Corruption Section:** Uses custom skip logic (not standard conditional modules)

