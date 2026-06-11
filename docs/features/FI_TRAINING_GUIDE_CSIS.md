# Field Interviewer Training Guide - CSIS Methodology

## Overview

This guide explains the updated SIGLA survey workflow that implements the official DILG Citizen Satisfaction Index System (CSIS) Digital Methodology (v4.0). The new workflow ensures standardized data collection across all field interviewers.

## What's New in CSIS Methodology

### Key Changes

1. **Six Service Sections**: You will now complete all 6 service sections in every survey (previously 3)
2. **Kish Grid Selection**: Respondent selection now uses a standardized statistical table
3. **GPS Verification**: GPS is captured at the household (not during initialization)
4. **Automatic Randomization**: The system automatically determines section order based on your questionnaire number

### Why These Changes Matter

- **Standardization**: All FIs follow the exact same DILG-approved methodology
- **Data Quality**: Kish Grid ensures unbiased respondent selection
- **Fraud Prevention**: GPS verification helps supervisors ensure interviews are conducted at assigned locations
- **Complete Coverage**: All 6 service areas are evaluated in every survey

---

## Survey Workflow Overview

```
1. Survey Initialization
   ↓
2. Household Enumeration & GPS Capture
   ↓
3. Respondent Selection (Kish Grid)
   ↓
4. Respondent Demographics
   ↓
5. Six Service Sections (in randomized order)
   ↓
6. Summary & Submission
```

---

## Step-by-Step Instructions

### Step 1: Survey Initialization

**What You'll Do:**
- Select the barangay where you're conducting the survey
- The system generates a unique questionnaire number (e.g., BB-2024-0042)

**Important Notes:**
- Your questionnaire number determines the order of service sections
- This number is unique and cannot be changed
- No GPS capture is required at this step

**Screenshot Reference:**
```
┌─────────────────────────────────────┐
│  Survey Initialization              │
│                                     │
│  Barangay: [Select Barangay ▼]     │
│                                     │
│  Questionnaire Number:              │
│  BB-2024-0042                       │
│                                     │
│  [Continue to Survey]               │
└─────────────────────────────────────┘
```

---

### Step 2: Household Enumeration & GPS Capture

**What You'll Do:**
1. **Capture GPS Location** (NEW!)
   - Click "Capture GPS Location" button
   - Wait for GPS to acquire (usually 5-10 seconds)
   - Verify accuracy is acceptable (< 20 meters preferred)

2. **Enumerate Household Members**
   - Enter the number of household members
   - For each member, provide:
     - Full name
     - Birthdate
     - Gender

**GPS Capture Instructions:**

✅ **DO:**
- Capture GPS while standing at or near the household entrance
- Wait for "GPS Captured Successfully" message
- Ensure GPS accuracy is below 20 meters if possible
- Capture GPS before starting household enumeration

❌ **DON'T:**
- Skip GPS capture (interviews without GPS will be flagged)
- Capture GPS from a different location
- Continue if GPS accuracy is very poor (> 50 meters)

**Troubleshooting GPS Issues:**

| Problem | Solution |
|---------|----------|
| "GPS Permission Denied" | Enable location permissions in browser settings |
| "GPS Timeout" | Move to an area with better sky visibility, retry |
| "Low Accuracy" | Wait a few more seconds for GPS to improve |
| "GPS Not Available" | Check if device has GPS capability, try different browser |

**Screenshot Reference:**
```
┌─────────────────────────────────────┐
│  Household Enumeration              │
│                                     │
│  📍 GPS Location                    │
│  [Capture GPS Location]             │
│  ✓ GPS Captured Successfully        │
│  Accuracy: 8 meters                 │
│                                     │
│  Number of Members: [3]             │
│                                     │
│  Member 1:                          │
│  Name: [John Doe]                   │
│  Birthdate: [1980-01-15]            │
│  Gender: [Male ▼]                   │
│                                     │
│  [+ Add Member]                     │
│  [Select Respondent]                │
└─────────────────────────────────────┘
```

---

### Step 3: Respondent Selection (Kish Grid)

**What You'll Do:**
- Click "Select Respondent" after enumerating all household members
- The system automatically selects the respondent using the Kish Grid
- Review the selected respondent and confirm

**Understanding the Kish Grid:**

The Kish Grid is a standardized statistical table that ensures random, unbiased respondent selection. The system:

1. **Calculates Column**: Based on your questionnaire number (last digit)
2. **Calculates Row**: Based on number of eligible household members (18+ years old)
3. **Looks Up Selection**: Finds the intersection in the Kish Grid table
4. **Selects Respondent**: Chooses the household member at that position

**Example:**

```
Questionnaire Number: BB-2024-0042 (ends in 2)
Eligible Members: 3 adults

Kish Grid Lookup:
- Column: 2 (from questionnaire number)
- Row: 3 (number of eligible members)
- Grid Value: 2 (from Kish Grid table)
- Selected: 2nd eligible member
```

**Kish Grid Visualization:**

```
        Column (from questionnaire number)
        1   2   3   4   5   6   7   8   9   10
Row  1  1   1   1   1   1   1   1   1   1   1
(#)  2  1   2   1   1   2   2   1   1   2   2
     3  1   2   3   1   2   3   1   2   3   1  ← Row 3, Col 2 = 2
     4  1   2   3   4   1   2   3   4   1   2
     5  1   2   3   4   5   1   2   3   4   5
     ...
```

**Gender Requirements:**

The system automatically determines required gender based on your questionnaire number:
- **Odd numbers** (1, 3, 5, ...): Male respondent required
- **Even numbers** (2, 4, 6, ...): Female respondent required

**What If No Qualified Respondent?**

If the Kish Grid selects a member who doesn't meet the gender requirement:

1. System shows: "No qualified respondent available"
2. You must verify household enumeration is correct
3. If correct, this household cannot be surveyed (mark as "No Qualified Respondent")
4. Move to the next assigned household

**Screenshot Reference:**
```
┌─────────────────────────────────────┐
│  Respondent Selection               │
│                                     │
│  Kish Grid Selection:               │
│  Questionnaire: 42                  │
│  Column: 2                          │
│  Row: 3                             │
│  Selected: Member #2                │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Selected Respondent           │ │
│  │                               │ │
│  │ Name: Jane Doe                │ │
│  │ Age: 35                       │ │
│  │ Gender: Female                │ │
│  │                               │ │
│  │ [Confirm & Continue]          │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### Step 4: Respondent Demographics

**What You'll Do:**
- Collect additional demographic information about the selected respondent
- All fields are required

**Information to Collect:**
- Educational Attainment
- Household Income Range
- Purok/Sitio

**Tips:**
- Use the exact categories provided in the dropdown menus
- For income, respondents can provide a range (they don't need exact amounts)
- Purok/Sitio should match the barangay's official subdivisions

---

### Step 5: Six Service Sections

**What You'll Do:**
- Complete all 6 service sections in the order shown by the system
- Each section contains questions about a specific government service area

**The Six Service Areas:**

1. **Financial Administration** 💰
   - Budget transparency
   - Financial management
   - Revenue collection

2. **Disaster Preparedness** 🚨
   - Emergency response
   - Disaster risk reduction
   - Community preparedness

3. **Social Protection** 🤝
   - Social welfare programs
   - Assistance to vulnerable groups
   - Community support services

4. **Safety & Peace & Order** 👮
   - Public safety
   - Crime prevention
   - Peace and order maintenance

5. **Business-Friendly Environment** 💼
   - Business permits
   - Economic development
   - Support for entrepreneurs

6. **Environmental Management** 🌳
   - Waste management
   - Environmental protection
   - Sanitation services

**Section Order:**

The order of sections is **randomized** based on your questionnaire number. This ensures:
- No section is consistently asked first or last
- Reduces response bias
- Standardizes data collection across all surveys

**Example Section Orders:**

| Questionnaire | 1st Section | 2nd Section | 3rd Section | ... |
|---------------|-------------|-------------|-------------|-----|
| #1 | Financial | Disaster | Social | ... |
| #2 | Disaster | Social | Safety | ... |
| #42 | Safety | Business | Environmental | ... |

**Progress Tracking:**

The system shows your progress:
- "Section 1 of 6" → "Section 2 of 6" → ... → "Section 6 of 6"
- Completed sections show a checkmark ✓
- Current section is highlighted
- You can navigate back to review previous sections

**Screenshot Reference:**
```
┌─────────────────────────────────────┐
│  Section 2 of 6                     │
│  Disaster Preparedness              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│  Question 1 of 8                    │
│                                     │
│  How satisfied are you with the     │
│  barangay's disaster preparedness?  │
│                                     │
│  ○ Very Satisfied                   │
│  ○ Satisfied                        │
│  ○ Neutral                          │
│  ○ Dissatisfied                     │
│  ○ Very Dissatisfied                │
│                                     │
│  [← Back]  [Next →]                 │
│                                     │
│  Sections:                          │
│  ✓ Financial                        │
│  ▶ Disaster (current)               │
│  ○ Social                           │
│  ○ Safety                           │
│  ○ Business                         │
│  ○ Environmental                    │
└─────────────────────────────────────┘
```

---

### Step 6: Summary & Submission

**What You'll Do:**
- Review all collected data
- Make any necessary corrections
- Submit the completed survey

**Before Submitting:**

✅ **Checklist:**
- [ ] GPS location was captured at the household
- [ ] All household members are enumerated correctly
- [ ] Respondent was selected using Kish Grid
- [ ] All 6 service sections are completed
- [ ] All required questions are answered
- [ ] Respondent demographics are complete

**After Submission:**

- Survey is saved to local storage (works offline)
- When online, survey automatically syncs to server
- You receive a confirmation message
- You can start a new survey

---

## Common Questions & Answers

### Q: Why do I need to complete all 6 sections now?

**A:** The CSIS methodology requires comprehensive evaluation of all government service areas. This provides a complete picture of citizen satisfaction and ensures standardized data collection.

### Q: Can I choose which respondent to interview?

**A:** No. The Kish Grid automatically selects the respondent to ensure unbiased, random selection. This is a requirement of the CSIS methodology.

### Q: What if the Kish Grid selects someone who isn't home?

**A:** You must schedule a callback to interview the selected respondent. Do not substitute with another household member. Use the callback feature in the system.

### Q: Why is GPS capture important?

**A:** GPS verification helps supervisors ensure data quality and detect potential fraud. It confirms that interviews are conducted at assigned locations.

### Q: What if GPS capture fails?

**A:** Try the troubleshooting steps in Step 2. If GPS still fails, you can continue, but the interview will be flagged for supervisor review. Document the reason for GPS failure.

### Q: Can I skip a service section?

**A:** No. All 6 sections must be completed for the survey to be valid. The system will not allow submission until all sections are complete.

### Q: What if I lose internet connection during the survey?

**A:** The system works offline. Your survey data is saved locally and will automatically sync when you reconnect to the internet.

### Q: How long does a complete survey take?

**A:** With 6 sections, expect 25-35 minutes per survey (previously 15-20 minutes with 3 sections). Plan your daily schedule accordingly.

---

## Best Practices

### Before Starting Your Day

1. ✅ Ensure device is fully charged
2. ✅ Enable GPS/location services
3. ✅ Test internet connection
4. ✅ Review assigned spots for the day
5. ✅ Bring backup power bank

### During Interviews

1. ✅ Introduce yourself and explain the survey purpose
2. ✅ Capture GPS immediately upon arrival
3. ✅ Enumerate all household members accurately
4. ✅ Accept the Kish Grid selection (don't try to change it)
5. ✅ Read questions exactly as written
6. ✅ Complete all 6 sections without skipping
7. ✅ Review data before submitting

### After Interviews

1. ✅ Verify survey submitted successfully
2. ✅ Check for any flagged issues
3. ✅ Schedule callbacks if needed
4. ✅ Sync data when online
5. ✅ Report any technical issues to supervisor

---

## Troubleshooting Guide

### Issue: "No Qualified Respondent" Error

**Cause:** Kish Grid selected a member who doesn't meet gender requirements

**Solution:**
1. Verify household enumeration is correct
2. Check birthdates are accurate (must be 18+)
3. Confirm gender entries are correct
4. If all correct, mark household as "No Qualified Respondent"
5. Move to next assigned household

### Issue: GPS Capture Fails Repeatedly

**Cause:** Poor GPS signal, permissions issue, or device limitation

**Solution:**
1. Check location permissions in browser settings
2. Move to area with clear sky visibility
3. Wait 30-60 seconds for GPS to acquire
4. Try refreshing the page
5. If persistent, document issue and continue (will be flagged)

### Issue: Section Order Seems Wrong

**Cause:** This is not an error - section order is randomized

**Solution:**
- Follow the order shown by the system
- Do not try to change the order
- Complete all 6 sections as presented

### Issue: Survey Won't Submit

**Cause:** Missing required fields or incomplete sections

**Solution:**
1. Check summary page for red indicators
2. Navigate back to incomplete sections
3. Ensure all required questions are answered
4. Verify all 6 sections show as complete
5. Try submitting again

### Issue: Offline Mode Not Working

**Cause:** Browser storage disabled or full

**Solution:**
1. Check browser settings allow local storage
2. Clear old survey data that has been synced
3. Try a different browser (Chrome recommended)
4. Contact supervisor if issue persists

---

## Quick Reference Card

### Survey Steps
1. Initialize → 2. GPS + Enumerate → 3. Kish Grid → 4. Demographics → 5. Six Sections → 6. Submit

### GPS Capture
- **When:** At household, before enumeration
- **Accuracy:** < 20 meters preferred
- **Troubleshoot:** Enable permissions, clear sky view, wait 30-60 sec

### Kish Grid
- **Automatic:** System selects based on questionnaire number
- **Cannot Change:** Accept the selected respondent
- **Gender:** Odd # = Male, Even # = Female

### Six Sections
- **Order:** Randomized per questionnaire number
- **All Required:** Must complete all 6 sections
- **Time:** 25-35 minutes per survey

### Emergency Contacts
- **Technical Support:** [Contact Info]
- **Field Supervisor:** [Contact Info]
- **System Issues:** [Contact Info]

---

## Training Exercises

### Exercise 1: Kish Grid Practice

**Scenario:** Questionnaire #47, Household with 5 eligible members

**Questions:**
1. What column do you use? (Answer: 7)
2. What row do you use? (Answer: 5)
3. Which member is selected? (Answer: Check Kish Grid table)
4. What gender is required? (Answer: Male - odd number)

### Exercise 2: GPS Troubleshooting

**Scenario:** GPS shows "Low Accuracy: 45 meters"

**Questions:**
1. Should you proceed or retry? (Answer: Retry - wait for better accuracy)
2. What can improve accuracy? (Answer: Move to open area, wait longer)
3. Can you skip GPS? (Answer: Yes, but will be flagged for review)

### Exercise 3: Section Navigation

**Scenario:** Questionnaire #23 starts with "Social Protection"

**Questions:**
1. Is this an error? (Answer: No - randomized order)
2. How many sections total? (Answer: 6)
3. Can you change the order? (Answer: No - follow system order)

---

## Certification Checklist

Before conducting surveys independently, you must demonstrate:

- [ ] Successful GPS capture with good accuracy
- [ ] Correct household enumeration (all required fields)
- [ ] Understanding of Kish Grid selection process
- [ ] Ability to complete all 6 service sections
- [ ] Proper data review before submission
- [ ] Troubleshooting common issues
- [ ] Offline mode operation
- [ ] Callback scheduling for unavailable respondents

**Trainer Signature:** _________________ **Date:** _________

**FI Signature:** _________________ **Date:** _________

---

## Additional Resources

- **CSIS Methodology Manual:** [Link to official DILG documentation]
- **Video Tutorials:** [Link to training videos]
- **Practice System:** [Link to test environment]
- **FAQ Database:** [Link to comprehensive FAQ]

---

*Last Updated: [Date]*
*Version: 1.0 - CSIS Methodology Implementation*
