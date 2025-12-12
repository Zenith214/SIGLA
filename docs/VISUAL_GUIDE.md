# Visual Guide - Language Selector

## What the User Sees

```
┌─────────────────────────────────────────────────────────┐
│  Survey Forms - Financial Administration                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┬──────────┬──────────┐                    │
│  │  Bisaya  │ Filipino │ English  │  ← Language Tabs   │
│  └──────────┴──────────┴──────────┘                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ A. Mga Proyekto sa Barangay                    │    │
│  │                                                 │    │
│  │ 1. KAHIBALO:                                   │    │
│  │ Nahibalo ka ba nga gigamit sa barangay ang    │    │
│  │ iyang pondo alang sa mga proyekto sa          │    │
│  │ konstruksyon karong tuiga?                     │    │
│  │                                                 │    │
│  │  ○ Oo                                          │    │
│  │  ○ Dili                                        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Back]  [Reset Section]  [Next Question]              │
└─────────────────────────────────────────────────────────┘
```

## When User Clicks "Filipino" Tab

```
┌─────────────────────────────────────────────────────────┐
│  Survey Forms - Financial Administration                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┬──────────┬──────────┐                    │
│  │  Bisaya  │ Filipino │ English  │  ← Filipino Active │
│  └──────────┴──────────┴──────────┘                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ A. Mga Proyekto ng Barangay                    │    │
│  │                                                 │    │
│  │ 1. KAALAMAN:                                   │    │
│  │ Alam mo ba na ginamit ng barangay ang pondo   │    │
│  │ nito para sa mga proyektong konstruksyon      │    │
│  │ ngayong taon?                                  │    │
│  │                                                 │    │
│  │  ○ Oo                                          │    │
│  │  ○ Hindi                                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Back]  [Reset Section]  [Next Question]              │
└─────────────────────────────────────────────────────────┘
```

## File Structure Visualization

```
Your Project
│
├── src/
│   ├── contexts/
│   │   └── LanguageContext.tsx
│   │       ↓
│   │       Provides: { language, setLanguage }
│   │       ↓
│   └── app/survey/forms/
│       ├── page.tsx
│       │   └── <LanguageProvider>
│       │       └── <SurveyAppContent />
│       │
│       ├── components/
│       │   └── LanguageSelector.tsx
│       │       └── [Bisaya] [Filipino] [English]
│       │
│       ├── sections/
│       │   └── question-flow.tsx
│       │       ├── useLanguage() ← Gets current language
│       │       ├── <LanguageSelector /> ← Shows tabs
│       │       └── getTranslatedQuestion() ← Gets text
│       │
│       └── utils/
│           └── translations.ts
│               └── { bisaya: "...", filipino: "...", english: "..." }
│
└── Documentation/
    ├── IMPLEMENTATION_COMPLETE.md ← Start here!
    ├── TRANSLATION_TEMPLATE.md ← Use this to fill translations
    ├── TRANSLATION_GUIDE.md ← Reference guide
    └── VISUAL_GUIDE.md ← This file
```

## Data Flow Diagram

```
User Action: Click "Filipino" Tab
        ↓
LanguageContext.setLanguage('filipino')
        ↓
localStorage.setItem('survey-language', 'filipino')
        ↓
QuestionFlow component re-renders
        ↓
useLanguage() returns { language: 'filipino' }
        ↓
getTranslatedQuestion('financial', 'awarenessProjects', 'filipino')
        ↓
translations.financial.awarenessProjects.filipino
        ↓
"Alam mo ba na ginamit ng barangay..."
        ↓
Question displays in Filipino
```

## Translation File Structure

```typescript
translations = {
  financial: {
    awarenessProjects: {
      bisaya: "Nahibalo ka ba...",    ← Add this
      filipino: "Alam mo ba...",       ← Already there
      english: "Are you aware..."      ← Already there
    },
    benefitedProjects: {
      bisaya: "Ikaw ba personal...",   ← Add this
      filipino: "Ikaw ba ay...",       ← Already there
      english: "Have you..."           ← Already there
    }
  },
  disaster: {
    awarenessDisasterInfo: {
      bisaya: "???",  ← YOU NEED TO ADD THESE
      filipino: "...",
      english: "..."
    }
  }
}
```

## How to Fill Translations - Step by Step

### Step 1: Open Files Side by Side

```
Left Window:                    Right Window:
┌─────────────────────┐        ┌─────────────────────┐
│ SURVEY-QUESTIONS-   │        │ translations.ts     │
│ 2-ELECTRIC-         │        │                     │
│ BOOGALOO.docx       │        │ disaster: {         │
│                     │        │   awarenessDisaster │
│ [Find Bisaya text]  │   →    │   Info: {           │
│                     │        │     bisaya: "PASTE" │
│ "Nahibalo ka ba..." │        │   }                 │
└─────────────────────┘        └─────────────────────┘
```

### Step 2: Copy and Paste

1. Find question in Word doc (Bisaya version)
2. Copy the entire question text
3. Paste into `bisaya: "HERE"`
4. Repeat for all questions

### Step 3: Save and Test

```bash
# Terminal
npm run dev

# Browser
http://localhost:3000/survey/forms
```

## Translation Progress Tracker

```
Financial Administration:  ████████████████████ 100% (23/23)
Overall Evaluation:        ████████████████████ 100% (2/2)
Disaster Preparedness:     ░░░░░░░░░░░░░░░░░░░░   0% (0/9)
Safety & Peace Order:      ░░░░░░░░░░░░░░░░░░░░   0% (0/13)
Social Protection:         ░░░░░░░░░░░░░░░░░░░░   0% (0/13)
Business Friendliness:     ░░░░░░░░░░░░░░░░░░░░   0% (0/5)
Environmental Management:  ░░░░░░░░░░░░░░░░░░░░   0% (0/5)
                           ─────────────────────
Total Progress:            ████████░░░░░░░░░░░░  36% (25/70)
```

## Quick Reference - Common Translations

| English | Filipino | Bisaya |
|---------|----------|--------|
| Awareness | Kaalaman | Kahibalo |
| Satisfaction | Kasiyahan | Katagbawan |
| Need for Action | Pangangailangan para sa Aksyon | Panginahanglan alang sa Aksyon |
| Suggestion | Mungkahi | Sugyot |
| Yes | Oo | Oo |
| No | Hindi | Dili |
| Very Satisfied | Lubos na Nasiyahan | Hilabihan ka Tagbaw |
| Satisfied | Nasiyahan | Tagbaw |
| Neutral | Neutral | Neutral |
| Dissatisfied | Hindi Nasiyahan | Dili Tagbaw |
| Very Dissatisfied | Lubos na Hindi Nasiyahan | Hilabihan ka Dili Tagbaw |

## Testing Checklist Visual

```
Before Testing:
[ ] All translations added to translations.ts
[ ] File saved
[ ] No syntax errors

During Testing:
[ ] npm run dev running
[ ] Browser open to /survey/forms
[ ] Click Bisaya tab → Questions show
[ ] Click Filipino tab → Questions show
[ ] Click English tab → Questions show
[ ] Answer question → Answer saves
[ ] Switch language → Answer still there
[ ] Reload page → Language preference saved

After Testing:
[ ] All sections work
[ ] No console errors
[ ] Mobile responsive
[ ] Ready for production
```

## Troubleshooting Visual

```
Problem: Translation not showing
        ↓
Check Console
        ↓
Warning: "No translation found for question: awarenessDisasterInfo"
        ↓
Solution: Add translation to translations.ts
        ↓
disaster: {
  awarenessDisasterInfo: {
    bisaya: "Add text here",
    filipino: "...",
    english: "..."
  }
}
```

## Success Indicators

✅ You'll know it's working when:
- Tabs switch smoothly
- Questions change language instantly
- No console errors
- Answers save correctly
- Language preference persists

❌ Something's wrong if:
- Tabs don't respond
- Questions show IDs instead of text
- Console shows errors
- Answers disappear when switching
- Language resets on reload

## Final Checklist

```
Implementation Phase:
✅ LanguageContext created
✅ LanguageSelector component created
✅ translations.ts created
✅ QuestionFlow updated
✅ page.tsx wrapped with provider
✅ No TypeScript errors

Your Task:
⏳ Extract Bisaya text from Word doc
⏳ Fill in translations.ts
⏳ Test all sections
⏳ Verify mobile responsive
⏳ Deploy to production
```

## Need Help?

1. Read `IMPLEMENTATION_COMPLETE.md` first
2. Use `TRANSLATION_TEMPLATE.md` for copy-paste
3. Reference `TRANSLATION_GUIDE.md` for details
4. Check browser console for errors
5. Test one section at a time

Good luck! 🚀
