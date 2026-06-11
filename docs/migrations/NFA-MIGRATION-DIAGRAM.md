# NFA Binary Field Migration - Visual Guide

## Data Structure Transformation

### Before Migration

```json
{
  "section_key": "financial",
  "data": {
    "awarenessProjects": "Oo",
    "benefitedProjects": "Oo",
    "satisfactionProjects": "4",
    "suggestionsProjects": "Need more community projects",
    
    "awarenessFinancial": "Oo",
    "usedFinancialInfo": "Hindi",
    "satisfactionFinancial": "3",
    "suggestionsFinancial": "",
    
    "awarenessSocialPrograms": "Oo",
    "benefitedSocialPrograms": "Oo",
    "satisfactionSocialPrograms": "5",
    "suggestionsSocialPrograms": "Great programs!",
    
    "awarenessCorruption": "Oo",
    "corruptionPerception": "Hindi",
    "suggestionsCorruption": null
  }
}
```

### After Migration

```json
{
  "section_key": "financial",
  "data": {
    "awarenessProjects": "Oo",
    "benefitedProjects": "Oo",
    "satisfactionProjects": "4",
    "need_for_action_binary_projects": "Yes",
    "need_for_action_suggestion_projects": "Need more community projects",
    
    "awarenessFinancial": "Oo",
    "usedFinancialInfo": "Hindi",
    "satisfactionFinancial": "3",
    "need_for_action_binary_financial": "No",
    "need_for_action_suggestion_financial": "",
    
    "awarenessSocialPrograms": "Oo",
    "benefitedSocialPrograms": "Oo",
    "satisfactionSocialPrograms": "5",
    "need_for_action_binary_social_programs": "Yes",
    "need_for_action_suggestion_social_programs": "Great programs!",
    
    "awarenessCorruption": "Oo",
    "corruptionPerception": "Hindi",
    "need_for_action_binary_corruption": "No",
    "need_for_action_suggestion_corruption": null
  }
}
```

## Migration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     MIGRATION PROCESS                            │
└─────────────────────────────────────────────────────────────────┘

For each service indicator:

┌──────────────────────┐
│  Old Field Name      │
│  suggestionsProjects │
└──────────┬───────────┘
           │
           ├─────────────────────────────────────┐
           │                                     │
           ▼                                     ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│  Check if suggestion     │      │  Create binary field         │
│  exists and non-empty    │      │  need_for_action_binary_*    │
└──────────┬───────────────┘      └──────────┬───────────────────┘
           │                                  │
           ├──────────┬──────────┐           │
           │          │          │           │
      Non-empty    Empty      NULL          │
           │          │          │           │
           ▼          ▼          ▼           ▼
        ┌─────┐   ┌─────┐   ┌─────┐   ┌──────────┐
        │"Yes"│   │"No" │   │"No" │   │ Set value│
        └──┬──┘   └──┬──┘   └──┬──┘   └────┬─────┘
           │         │         │            │
           └─────────┴─────────┴────────────┘
                     │
                     ▼
           ┌──────────────────────────┐
           │  Rename suggestion field │
           │  need_for_action_        │
           │  suggestion_*            │
           └──────────┬───────────────┘
                      │
                      ▼
           ┌──────────────────────────┐
           │  Remove old field name   │
           │  suggestionsProjects     │
           └──────────────────────────┘
```

## Field Mapping Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIELD NAME MAPPING                            │
└─────────────────────────────────────────────────────────────────┘

OLD FORMAT                          NEW FORMAT
─────────────────────────────────────────────────────────────────

suggestionsProjects          ──►    need_for_action_suggestion_projects
                                    need_for_action_binary_projects (NEW)

suggestionsFinancial         ──►    need_for_action_suggestion_financial
                                    need_for_action_binary_financial (NEW)

suggestionsSocialPrograms    ──►    need_for_action_suggestion_social_programs
                                    need_for_action_binary_social_programs (NEW)

suggestionsCorruption        ──►    need_for_action_suggestion_corruption
                                    need_for_action_binary_corruption (NEW)

suggestionsDisasterInfo      ──►    need_for_action_suggestion_disaster_info
                                    need_for_action_binary_disaster_info (NEW)

suggestionsEvacuation        ──►    need_for_action_suggestion_evacuation
                                    need_for_action_binary_evacuation (NEW)

suggestionsTanods            ──►    need_for_action_suggestion_tanods
                                    need_for_action_binary_tanods (NEW)

suggestionsLupon             ──►    need_for_action_suggestion_lupon
                                    need_for_action_binary_lupon (NEW)

suggestionsAntiDrug          ──►    need_for_action_suggestion_anti_drug
                                    need_for_action_binary_anti_drug (NEW)

suggestionsHealthServices    ──►    need_for_action_suggestion_health_services
                                    need_for_action_binary_health_services (NEW)

suggestionsWomenChildren     ──►    need_for_action_suggestion_women_children_protection
Protection                          need_for_action_binary_women_children_protection (NEW)

suggestionsCommunity         ──►    need_for_action_suggestion_community_participation
Participation                       need_for_action_binary_community_participation (NEW)

suggestionsBusinessClearance ──►    need_for_action_suggestion_business_clearance
                                    need_for_action_binary_business_clearance (NEW)

suggestionsWasteManagement   ──►    need_for_action_suggestion_waste_management
                                    need_for_action_binary_waste_management (NEW)
```

## Service Area Coverage

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE AREAS & INDICATORS                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Financial Administration (section_key: 'financial')          │
├──────────────────────────────────────────────────────────────┤
│ ✓ Projects                                                   │
│ ✓ Financial Transparency                                     │
│ ✓ Social Programs                                            │
│ ✓ Corruption Perception                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Disaster Preparedness (section_key: 'disaster')              │
├──────────────────────────────────────────────────────────────┤
│ ✓ Disaster Information                                       │
│ ✓ Evacuation Resources                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Safety & Peace Order (section_key: 'safety')                 │
├──────────────────────────────────────────────────────────────┤
│ ✓ Barangay Tanods                                            │
│ ✓ Lupon/Dispute Resolution                                   │
│ ✓ Anti-Drug Programs                                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Social Protection (section_key: 'social')                    │
├──────────────────────────────────────────────────────────────┤
│ ✓ Health Services                                            │
│ ✓ Women & Children Protection                                │
│ ✓ Community Participation                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Business Friendliness (section_key: 'business')              │
├──────────────────────────────────────────────────────────────┤
│ ✓ Business Clearance                                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Environmental Management (section_key: 'environmental')      │
├──────────────────────────────────────────────────────────────┤
│ ✓ Waste Management                                           │
└──────────────────────────────────────────────────────────────┘

Total: 14 indicators across 6 service areas
```

## Binary Value Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    BINARY VALUE BACKFILL LOGIC                   │
└─────────────────────────────────────────────────────────────────┘

Input: suggestion field value

┌──────────────────────┐
│ Check suggestion     │
│ field value          │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────┐
    │ Is NULL?     │
    └──┬────────┬──┘
       │        │
      YES      NO
       │        │
       ▼        ▼
    ┌─────┐  ┌──────────────┐
    │"No" │  │ Is empty or  │
    └─────┘  │ whitespace?  │
             └──┬────────┬──┘
                │        │
               YES      NO
                │        │
                ▼        ▼
             ┌─────┐  ┌──────┐
             │"No" │  │"Yes" │
             └─────┘  └──────┘

Examples:
─────────────────────────────────────────────────────────────────
suggestion = "Need more projects"     → binary = "Yes"
suggestion = ""                       → binary = "No"
suggestion = "   "                    → binary = "No"
suggestion = null                     → binary = "No"
suggestion = "Good service"           → binary = "Yes"
```

## Database Operations

```
┌─────────────────────────────────────────────────────────────────┐
│                    SQL OPERATIONS PERFORMED                      │
└─────────────────────────────────────────────────────────────────┘

For each indicator:

1. UPDATE survey_section
   SET data = jsonb_set(
     jsonb_set(
       data,
       '{need_for_action_binary_*}',
       CASE WHEN ... THEN '"Yes"' ELSE '"No"' END
     ),
     '{need_for_action_suggestion_*}',
     COALESCE(data->'suggestions*', 'null'::jsonb)
   ) - 'suggestions*'
   WHERE section_key = '...'
     AND data ? 'suggestions*';

2. CREATE INDEX idx_survey_section_data_nfa_binary
   ON survey_section USING GIN (data jsonb_path_ops);

3. CREATE INDEX idx_survey_section_key
   ON survey_section(section_key);
```

## Rollback Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLLBACK PROCESS                              │
└─────────────────────────────────────────────────────────────────┘

For each indicator:

┌──────────────────────────────┐
│  New Field Names             │
│  need_for_action_binary_*    │
│  need_for_action_suggestion_*│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Restore old field name      │
│  suggestions*                │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Remove binary field         │
│  need_for_action_binary_*    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Remove new suggestion field │
│  need_for_action_suggestion_*│
└──────────────────────────────┘

⚠️  WARNING: Binary field data will be lost!
```

## Index Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    INDEXING STRATEGY                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ GIN Index on JSONB data                                      │
├──────────────────────────────────────────────────────────────┤
│ Purpose: Fast queries on NFA binary fields                   │
│ Type: jsonb_path_ops (optimized for containment queries)     │
│ Benefit: Efficient filtering on binary values               │
│                                                              │
│ Example Query:                                               │
│ SELECT * FROM survey_section                                 │
│ WHERE data @> '{"need_for_action_binary_projects": "Yes"}'  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ B-tree Index on section_key                                  │
├──────────────────────────────────────────────────────────────┤
│ Purpose: Fast filtering by service area                      │
│ Type: B-tree (standard index)                                │
│ Benefit: Efficient section-specific queries                 │
│                                                              │
│ Example Query:                                               │
│ SELECT * FROM survey_section                                 │
│ WHERE section_key = 'financial'                              │
└──────────────────────────────────────────────────────────────┘
```

## Performance Impact

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE CHARACTERISTICS                   │
└─────────────────────────────────────────────────────────────────┘

Migration Time:
───────────────────────────────────────────────────────────────
< 1,000 records     │████░░░░░░░░░░░░░░░░│ < 1 second
1,000-10,000        │████████░░░░░░░░░░░░│ 1-5 seconds
> 10,000 records    │████████████████░░░░│ 5-30 seconds

Query Performance (with indexes):
───────────────────────────────────────────────────────────────
Before Migration    │████████████████████│ Baseline
After Migration     │████████████████████│ Same (with indexes)

Storage Impact:
───────────────────────────────────────────────────────────────
Per Record          │ +50-100 bytes (binary fields)
Index Overhead      │ +10-20% of table size
```
