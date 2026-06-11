# Complete Survey Workflow Documentation

## Overview

This document provides a comprehensive explanation of how the SIGLA survey system works from start to finish, covering all roles and processes from survey setup to data storage.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Role Definitions](#role-definitions)
3. [Phase 1: Survey Cycle Setup (Admin)](#phase-1-survey-cycle-setup-admin)
4. [Phase 2: Spot Creation & Assignment (Supervisor)](#phase-2-spot-creation--assignment-supervisor)
5. [Phase 3: Field Interview Process (Field Interviewer)](#phase-3-field-interview-process-field-interviewer)
6. [Phase 4: Data Storage & Validation](#phase-4-data-storage--validation)
7. [Questionnaire ID Format](#questionnaire-id-format)
8. [CSIS Protocol Implementation](#csis-protocol-implementation)
9. [Database Schema](#database-schema)

---

## System Architecture

The SIGLA system follows a hierarchical workflow:

```
Admin → Supervisor → Field Interviewer → Database → ML Analysis
```

**Key Components:**
- **Survey Cycles**: Time-bound survey periods (e.g., 2026 cycle)
- **Barangays**: Geographic administrative divisions
- **Spots**: Physical locations within barangays where interviews occur
- **Questionnaires**: Individual interview slots with unique IDs
- **Responses**: Completed survey data from respondents

---

## Role Definitions

### 1. Admin
- Creates and manages survey cycles
- Manages barangay data
- Oversees system-wide settings
- Has full access to all data

### 2. Supervisor
- Creates spots within assigned barangays
- Assigns spots to field interviewers
- Monitors interview progress
- Reviews flagged interviews

### 3. Field Interviewer (FI)
- Conducts face-to-face interviews
- Uses mobile/tablet devices
- Follows CSIS protocol for callbacks and replacements
- Works offline with IndexedDB sync

---

## Phase 1: Survey Cycle Setup (Admin)

### Step 1.1: Create Survey Cycle

**Action:** Admin creates a new survey cycle

**Process:**
1. Navigate to Admin Dashboard → Survey Cycles
2. Click "Create New Cycle"
3. Enter cycle details:
   - Year (e.g., 2026)
   - Start Date
   - End Date
   - Status: Active

**Database Impact:**
```sql
INSERT INTO survey_cycle (year, status, start_date, end_date)
VALUES ('2026', 'Active', '2026-01-01', '2026-12-31');
```

**Result:** 
- Cycle ID generated (e.g., `cycle_id: 5`)
- Cycle becomes available for spot creation
- All new questionnaires will reference this cycle

### Step 1.2: Verify Barangay Data

**Action:** Admin ensures all barangays are configured

**Process:**
1. Navigate to Barangays section
2. Verify each barangay has:
   - Barangay ID (e.g., McKinley = 18)
   - Barangay Name
   - Active status
   - Population data (optional)

**Database State:**
```sql
SELECT barangay_id, barangay_name, is_active 
FROM barangay 
WHERE is_active = true;
```

---

## Phase 2: Spot Creation & Assignment (Supervisor)


### Step 2.1: Create Spot

**Action:** Supervisor creates a spot in their assigned barangay

**Process:**
1. Navigate to Supervisor Dashboard → Create Spot
2. Select barangay (e.g., McKinley, ID: 18)
3. Enter spot details:
   - Spot Name (e.g., "McKinley Elementary School")
   - Starting Point (GPS coordinates: lat, lng)
   - Random Start Number (1-999)
   - Number of Questionnaires (default: 5)

**API Call:**
```javascript
POST /api/spots
{
  "cycleId": 5,
  "barangayId": 18,
  "spotName": "McKinley Elementary School",
  "startingPoint": { "lat": 7.1234, "lng": 125.5678 },
  "randomStart": 42,
  "numberOfQuestionnaires": 5
}
```

**Backend Process:**
1. Get spot number for this barangay in this cycle
   - Query: Count existing spots for barangay 18 in cycle 5
   - Result: 0 spots exist → This is spot #1

2. Generate questionnaire IDs using format: `YYYY-BBSS-QQQ`
   - Year: 2026
   - Barangay ID: 18
   - Spot Number: 01 (padded to 2 digits)
   - Questionnaire Number: 001-005 (padded to 3 digits)

3. Create questionnaires:
   - `2026-18-01-001` (Odd → Male respondent)
   - `2026-18-01-002` (Even → Female respondent)
   - `2026-18-01-003` (Odd → Male respondent)
   - `2026-18-01-004` (Even → Female respondent)
   - `2026-18-01-005` (Odd → Male respondent)

**Database Impact:**
```sql
-- Insert spot
INSERT INTO spots (cycle_id, barangay_id, spot_name, starting_point, random_start, status)
VALUES (5, 18, 'McKinley Elementary School', '{"lat":7.1234,"lng":125.5678}', 42, 'Pending');

-- Insert questionnaires
INSERT INTO questionnaires (questionnaire_id, spot_id, cycle_id, sequence_number, status, visit_count)
VALUES 
  ('2026-18-01-001', 1, 5, 1, 'Pending', 0),
  ('2026-18-01-002', 1, 5, 2, 'Pending', 0),
  ('2026-18-01-003', 1, 5, 3, 'Pending', 0),
  ('2026-18-01-004', 1, 5, 4, 'Pending', 0),
  ('2026-18-01-005', 1, 5, 5, 'Pending', 0);
```


### Step 2.2: Assign Spot to Field Interviewer

**Action:** Supervisor assigns the spot to a field interviewer

**Process:**
1. Navigate to Assignments section
2. Select spot: "McKinley Elementary School"
3. Select field interviewer from dropdown
4. Click "Assign"

**API Call:**
```javascript
POST /api/assignments
{
  "spotId": 1,
  "userId": 42,  // Field Interviewer's user ID
  "barangayId": 18,
  "cycleId": 5
}
```

**Database Impact:**
```sql
INSERT INTO assignment (barangay_id, user_id, status, progress)
VALUES (18, 42, 'Active', 0);

-- Update spot with assigned FI
UPDATE spots 
SET assigned_fi_id = 42 
WHERE spot_id = 1;
```

**Result:**
- Field Interviewer can now see this spot in their "My Spots" dashboard
- Spot status remains "Pending" until first interview starts

---

## Phase 3: Field Interview Process (Field Interviewer)

### Step 3.1: View Assigned Spots

**Action:** FI logs in and views their assigned spots

**Process:**
1. FI logs into mobile app/web interface
2. Navigate to "My Spots" tab
3. See list of assigned spots with:
   - Spot name
   - Barangay name
   - Progress (0/5 Completed)
   - Status badge (Pending/In Progress/Completed)
   - 5 interview slots with questionnaire IDs

**UI Display:**
```
┌─────────────────────────────────────────┐
│ McKinley Elementary School       Pending│
│ 📍 McKinley                             │
│                                         │
│ Progress              0/5 Completed     │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%  │
│                                         │
│ Interview Slots:                        │
│ ⚪ 2026-18-01-001          Pending      │
│ ⚪ 2026-18-01-002          Pending      │
│ ⚪ 2026-18-01-003          Pending      │
│ ⚪ 2026-18-01-004          Pending      │
│ ⚪ 2026-18-01-005          Pending      │
└─────────────────────────────────────────┘
```


### Step 3.2: Start Interview (First Visit)

**Action:** FI clicks on first interview slot `2026-18-01-001`

**Process:**
1. Click on interview slot
2. Survey form opens with questionnaire ID pre-filled
3. System checks IndexedDB for existing data (none found - new interview)

**Navigation:**
```
/survey/forms?questionnaireId=2026-18-01-001&cycleId=5
```

### Step 3.3: Survey Initialization Section

**Action:** FI begins the survey initialization

**Process:**

#### 3.3.1: Visit Logging (For Callbacks Only)
- **First Visit:** No visit logging shown (this is the initial attempt)
- **Callback Visits:** Visit logging form appears (explained in Step 3.8)

#### 3.3.2: GPS Verification
**Automatic GPS Capture:**
1. System automatically attempts to capture GPS location
2. Shows "Capturing location automatically..." spinner
3. On success:
   - ✅ "Location Captured Successfully"
   - Displays: Latitude, Longitude, Accuracy
   - Saves to `verificationLocation` field

4. On failure:
   - ⚠️ "Automatic GPS Capture Failed"
   - Options:
     - "Retry Automatic GPS"
     - "Pin Location on Map" (manual selection)
     - "Continue Without GPS" (flags interview for review)

**Database Field:**
```javascript
verificationLocation: {
  lat: 7.1234,
  lng: 125.5678,
  accuracy: 15,  // meters
  timestamp: 1234567890
}
```

#### 3.3.3: Questionnaire Number Display
- Shows: `2026-18-01-001`
- Indicates: "Required Respondent Sex: Male"
- Explains: "Odd questionnaire numbers interview male respondents only"

**Action:** FI clicks "Continue to Survey →"


### Step 3.4: Respondent Selection (Kish Grid)

**Action:** FI collects household information and selects respondent

**Process:**

#### 3.4.1: Enter Number of Household Members
- FI asks: "How many people live in this household who are 18 or older?"
- Enters number (1-10)
- System validates input

#### 3.4.2: Collect Member Details
For each household member, FI enters:
- **Name:** Full name
- **Birthdate:** Date of birth (system calculates age)
- **Sex:** Auto-filled based on questionnaire number
  - Questionnaire `2026-18-01-001` (odd) → Male only
  - System filters out members who don't match required sex

**Example Input:**
```
Member 1:
  Name: Juan Dela Cruz
  Birthdate: 1985-03-15
  Age: 41 years
  Sex: Male ✓ (matches requirement)

Member 2:
  Name: Pedro Santos
  Birthdate: 2000-07-22
  Age: 26 years
  Sex: Male ✓ (matches requirement)

Member 3:
  Name: Carlos Reyes
  Birthdate: 1978-11-30
  Age: 47 years
  Sex: Male ✓ (matches requirement)
```

#### 3.4.3: Kish Grid Selection
**Action:** FI clicks "Select Respondent"

**Backend Process:**
1. Filter eligible members:
   - Age ≥ 18
   - Sex matches questionnaire requirement (Male for odd numbers)
   - Complete information

2. Apply Kish Grid algorithm:
   ```javascript
   // Extract questionnaire number from ID
   // 2026-18-01-001 → questionnaireNumber = 1
   
   // Calculate selection index
   selectedIndex = (questionnaireNumber - 1) % eligibleMembers.length
   // (1 - 1) % 3 = 0 → Select first member
   ```

3. Display Kish Grid table with selection highlighted

**Kish Grid Display:**
```
┌─────────────────────────────────────────────────────┐
│ Kish Grid Selection                                 │
│ Questionnaire: 2026-18-01-001 (Odd → Male)          │
├─────────────────────────────────────────────────────┤
│ #  Name              Age  Sex    Selected           │
├─────────────────────────────────────────────────────┤
│ 1  Juan Dela Cruz   41   Male   ✓ SELECTED         │
│ 2  Pedro Santos     26   Male                       │
│ 3  Carlos Reyes     47   Male                       │
└─────────────────────────────────────────────────────┘
```

**Action:** FI clicks "Confirm & Continue"

**Data Saved:**
```javascript
selectedMember: "Juan Dela Cruz"
respondentDemographics: {
  age: 41,
  birthdate: "1985-03-15",
  sex: "Male",
  genderIdentity: "Male"  // Pre-filled, editable later
}
```


### Step 3.5: Question Flow (Survey Sections)

**Action:** FI conducts the interview, asking questions section by section

**Survey Structure:**
1. **Respondent Demographics** (Pre-filled from Kish Grid)
2. **Household Information**
3. **Service Area Questions** (Multiple sections)
4. **Community Voice** (Open-ended feedback)

#### Question Types:

**1. Multiple Choice (Single Select)**
```javascript
{
  type: "multiple-choice",
  question: "What is your educational attainment?",
  options: [
    "Elementary",
    "High School",
    "College",
    "Post-Graduate"
  ]
}
```

**2. Multiple Choice (Multi-Select)**
```javascript
{
  type: "checkbox",
  question: "Which services have you used? (Select all that apply)",
  options: [
    "Health Services",
    "Education",
    "Infrastructure",
    "Social Services"
  ]
}
```

**3. Rating Scale**
```javascript
{
  type: "rating",
  question: "How satisfied are you with health services?",
  scale: 1-5,
  labels: {
    1: "Very Dissatisfied",
    5: "Very Satisfied"
  }
}
```

**4. Text Input**
```javascript
{
  type: "text",
  question: "What improvements would you suggest?"
}
```

**Data Storage (LocalStorage):**
As FI answers each question, data is automatically saved to browser's localStorage:

```javascript
localStorage.setItem('survey_2026-18-01-001', JSON.stringify({
  surveyNumber: "2026-18-01-001",
  barangayId: 18,
  cycleId: 5,
  selectedMember: "Juan Dela Cruz",
  respondentDemographics: { /* ... */ },
  verificationLocation: { /* ... */ },
  answers: {
    q1: "College",
    q2: ["Health Services", "Education"],
    q3: 4,
    q4: "More health centers needed"
  },
  lastUpdated: "2026-01-15T10:30:00Z"
}));
```

**Offline Support:**
- All data saved locally first
- FI can continue even without internet
- Data syncs when connection restored


### Step 3.6: Survey Submission

**Action:** FI completes all questions and clicks "Submit Survey"

**Process:**

#### 3.6.1: Validation
System checks:
- ✓ All required questions answered
- ✓ GPS location captured (or flagged)
- ✓ Respondent selected via Kish Grid
- ✓ Demographics complete

#### 3.6.2: IndexedDB Storage (Offline-First)
Data saved to browser's IndexedDB:

```javascript
{
  questionnaireId: "2026-18-01-001",
  cycleId: 5,
  barangayId: 18,
  spotId: 1,
  status: "Completed",
  surveyData: {
    surveyNumber: "2026-18-01-001",
    selectedMember: "Juan Dela Cruz",
    respondentDemographics: { /* ... */ },
    verificationLocation: { /* ... */ },
    answers: { /* all answers */ }
  },
  visits: [
    {
      visitNumber: 1,
      outcome: "Interview_Started",
      timestamp: "2026-01-15T10:00:00Z",
      location: { lat: 7.1234, lng: 125.5678 }
    }
  ],
  submittedAt: "2026-01-15T11:30:00Z",
  syncStatus: "pending"
}
```

#### 3.6.3: API Submission
System attempts to sync to server:

**API Call:**
```javascript
POST /api/survey-responses
{
  questionnaireId: "2026-18-01-001",
  cycleId: 5,
  barangayId: 18,
  respondentName: "Juan Dela Cruz",
  respondentAge: 41,
  respondentSex: "Male",
  gpsLocation: { lat: 7.1234, lng: 125.5678 },
  gpsAccuracy: 15,
  gpsVerified: true,
  answers: { /* all answers */ },
  submittedAt: "2026-01-15T11:30:00Z",
  interviewerId: 42
}
```

**Backend Process:**
1. Validate questionnaire exists and is not already completed
2. Create survey_response record
3. Create survey_section records for each section
4. Create survey_answer records for each question
5. Update questionnaire status to "Completed"
6. Update spot progress (1/5 completed)

**Database Impact:**
```sql
-- Insert main response
INSERT INTO survey_response (
  questionnaire_id, cycle_id, barangay_id, 
  respondent_name, respondent_age, respondent_sex,
  gps_location, gps_accuracy, gps_verified,
  submitted_at, interviewer_id, status
)
VALUES (
  '2026-18-01-001', 5, 18,
  'Juan Dela Cruz', 41, 'Male',
  '{"lat":7.1234,"lng":125.5678}', 15, true,
  '2026-01-15 11:30:00', 42, 'Completed'
);
-- Returns response_id: 1001

-- Insert section data
INSERT INTO survey_section (response_id, section_name, section_data)
VALUES 
  (1001, 'demographics', '{"age":41,"sex":"Male",...}'),
  (1001, 'household', '{"members":3,...}'),
  (1001, 'health_services', '{"satisfaction":4,...}');

-- Insert individual answers
INSERT INTO survey_answer (question_id, response_id, answer_value)
VALUES 
  (1, 1001, 'College'),
  (2, 1001, '["Health Services","Education"]'),
  (3, 1001, '4'),
  (4, 1001, 'More health centers needed');

-- Update questionnaire status
UPDATE questionnaires 
SET status = 'Completed', 
    completed_at = '2026-01-15 11:30:00'
WHERE questionnaire_id = '2026-18-01-001';
```


#### 3.6.4: Success Confirmation
**UI Display:**
```
✅ Survey Submitted Successfully!

Questionnaire: 2026-18-01-001
Respondent: Juan Dela Cruz
Submitted: Jan 15, 2026 11:30 AM

[Return to Spots Dashboard]
```

**IndexedDB Update:**
```javascript
{
  syncStatus: "synced",
  syncedAt: "2026-01-15T11:30:05Z"
}
```

**Spot Dashboard Update:**
```
┌─────────────────────────────────────────┐
│ McKinley Elementary School  In Progress │
│ 📍 McKinley                             │
│                                         │
│ Progress              1/5 Completed     │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░ 20% │
│                                         │
│ Interview Slots:                        │
│ ✅ 2026-18-01-001          Completed     │
│ ⚪ 2026-18-01-002          Pending       │
│ ⚪ 2026-18-01-003          Pending       │
│ ⚪ 2026-18-01-004          Pending       │
│ ⚪ 2026-18-01-005          Pending       │
└─────────────────────────────────────────┘
```

---

### Step 3.7: Continue with Remaining Interviews

**Action:** FI proceeds to complete remaining interview slots

**Process:**
- Click on `2026-18-01-002` (Female respondent required)
- Repeat Steps 3.3-3.6
- Continue until all 5 interviews completed

**Final Spot Status:**
```
┌─────────────────────────────────────────┐
│ McKinley Elementary School    Completed │
│ 📍 McKinley                             │
│                                         │
│ Progress              5/5 Completed     │
│ ████████████████████████████████████100%│
│                                         │
│ Interview Slots:                        │
│ ✅ 2026-18-01-001          Completed     │
│ ✅ 2026-18-01-002          Completed     │
│ ✅ 2026-18-01-003          Completed     │
│ ✅ 2026-18-01-004          Completed     │
│ ✅ 2026-18-01-005          Completed     │
└─────────────────────────────────────────┘
```


### Step 3.8: Callback Scenario (Respondent Unavailable)

**Situation:** FI arrives at household but selected respondent is not home

**Process:**

#### Visit 1 (First Attempt)
1. FI clicks on interview slot `2026-18-01-002`
2. Survey form opens
3. **Visit Logging Section Appears:**

```
┌─────────────────────────────────────────────────┐
│ Log Visit Status                                │
├─────────────────────────────────────────────────┤
│ Which Visit Is This? *                          │
│ ⚪ First Visit (Initial attempt)                │
│ ⚪ Second Visit (First callback)                │
│ ⚪ Last Visit (3rd Attempt - Final callback)    │
│                                                 │
│ Visit Outcome *                                 │
│ Callback (Same Household - Up to 3 Visits):    │
│ ⚪ Callback Needed (Respondent unavailable)     │
│ ⚪ Interview Started (Respondent available)     │
│                                                 │
│ Replacement (Move to Next Household):           │
│ ⚪ No Qualified Respondent (NQR)                │
│ ⚪ Outright Refusal (OR)                        │
│ ⚪ Household Moved                               │
│                                                 │
│ Callback Reason *                               │
│ [Dropdown: No one home ▼]                       │
│                                                 │
│ Digital Fieldwork Diary Notes                   │
│ [Textarea: Optional notes...]                   │
└─────────────────────────────────────────────────┘
```

4. FI selects:
   - Visit Type: "First Visit"
   - Outcome: "Callback Needed"
   - Reason: "No one home"
   - Notes: "Neighbor said family went to market"

5. FI clicks "Log Visit & Continue"

**Backend Process:**
```javascript
POST /api/visits
{
  questionnaireId: "2026-18-01-002",
  outcome: "Callback_Needed",
  notes: "Visit Type: First Visit\nCallback Reason: No one home\n\nNotes: Neighbor said family went to market",
  location: { lat: 7.1234, lng: 125.5678 }
}
```

**Database Impact:**
```sql
INSERT INTO visits (
  questionnaire_id, visit_number, outcome, 
  notes, location, timestamp
)
VALUES (
  '2026-18-01-002', 1, 'Callback_Needed',
  'Visit Type: First Visit\nCallback Reason: No one home\n\nNotes: Neighbor said family went to market',
  '{"lat":7.1234,"lng":125.5678}',
  '2026-01-15 14:00:00'
);

UPDATE questionnaires
SET status = 'In_Progress',
    visit_count = 1
WHERE questionnaire_id = '2026-18-01-002';
```

**UI Response:**
```
Alert: "Visit logged successfully. You can return later to 
complete the interview. Remember: up to 3 total visits 
allowed for callbacks."

→ Redirects to Spots Dashboard
```

**Spot Dashboard Update:**
```
┌─────────────────────────────────────────┐
│ McKinley Elementary School  In Progress │
│                                         │
│ Interview Slots:                        │
│ ✅ 2026-18-01-001          Completed     │
│ 🔄 2026-18-01-002          Callback 1    │
│ ⚪ 2026-18-01-003          Pending       │
└─────────────────────────────────────────┘
```


#### Visit 2 (First Callback)
**Action:** FI returns to the same household

1. FI clicks on `2026-18-01-002` again
2. System detects existing visit history
3. Visit logging form appears with visit count: 1

4. FI selects:
   - Visit Type: "Second Visit"
   - Outcome: "Interview Started" (respondent is now home!)

5. FI clicks "Log Visit & Continue"

**Backend Process:**
```sql
INSERT INTO visits (
  questionnaire_id, visit_number, outcome, 
  notes, location, timestamp
)
VALUES (
  '2026-18-01-002', 2, 'Interview_Started',
  'Visit Type: Second Visit',
  '{"lat":7.1234,"lng":125.5678}',
  '2026-01-16 09:00:00'
);
```

6. **Survey continues normally** (Steps 3.4-3.6)
7. Interview completed and submitted

**Final Database State:**
```sql
-- Questionnaire updated
UPDATE questionnaires
SET status = 'Completed',
    visit_count = 2,
    completed_at = '2026-01-16 10:30:00'
WHERE questionnaire_id = '2026-18-01-002';

-- Survey response created
INSERT INTO survey_response (...)
VALUES (...);
```

---

### Step 3.9: Replacement Scenario (Invalid Household)

**Situation:** FI arrives at household but no qualified respondent exists

**Example:** Questionnaire `2026-18-01-003` requires Male respondent, but only females live in the household

**Process:**

1. FI clicks on `2026-18-01-003`
2. Visit logging form appears
3. FI selects:
   - Visit Type: "First Visit"
   - Outcome: "No Qualified Respondent (NQR)"
   - Notes: "Only female household members present"

4. **Warning appears:**
```
⚠️ Replacement Required

This household is invalid. After logging, move to the 
next household following the interval rule (skip one house).
```

5. FI clicks "Log Visit & Continue"

**Backend Process:**
```sql
INSERT INTO visits (
  questionnaire_id, visit_number, outcome, 
  notes, location, timestamp
)
VALUES (
  '2026-18-01-003', 1, 'No_Qualified_Respondent',
  'Visit Type: First Visit\n\nNotes: Only female household members present',
  '{"lat":7.1234,"lng":125.5678}',
  '2026-01-15 15:00:00'
);

UPDATE questionnaires
SET status = 'Flagged_For_Substitution',
    visit_count = 1
WHERE questionnaire_id = '2026-18-01-003';
```

**UI Response:**
```
Alert: "Visit logged successfully. No Qualified Respondent (NQR). 
Move to the next household following the interval rule 
(skip one house)."

→ Redirects to Spots Dashboard
```

**Spot Dashboard Update:**
```
┌─────────────────────────────────────────┐
│ McKinley Elementary School  In Progress │
│                                         │
│ Interview Slots:                        │
│ ✅ 2026-18-01-001          Completed     │
│ ✅ 2026-18-01-002          Completed     │
│ ⚠️  2026-18-01-003          Flagged      │
│ ⚪ 2026-18-01-004          Pending       │
│                                         │
│ ⚠️ 1 slot flagged for substitution      │
└─────────────────────────────────────────┘
```

**Next Steps:**
- FI moves to next household (following interval rule)
- Supervisor reviews flagged questionnaire
- Supervisor arranges substitution (matching demographics)


---

## Phase 4: Data Storage & Validation

### Step 4.1: Database Structure

**Complete data flow for one completed interview:**

```sql
-- 1. Survey Response (Main Record)
survey_response
├─ response_id: 1001
├─ questionnaire_id: "2026-18-01-001"
├─ cycle_id: 5
├─ barangay_id: 18
├─ respondent_name: "Juan Dela Cruz"
├─ respondent_age: 41
├─ respondent_sex: "Male"
├─ gps_location: {"lat":7.1234,"lng":125.5678}
├─ gps_accuracy: 15
├─ gps_verified: true
├─ submitted_at: "2026-01-15 11:30:00"
├─ interviewer_id: 42
└─ status: "Completed"

-- 2. Survey Sections (Grouped Data)
survey_section
├─ section_id: 5001
├─ response_id: 1001
├─ section_name: "demographics"
└─ section_data: {"age":41,"sex":"Male","education":"College",...}

survey_section
├─ section_id: 5002
├─ response_id: 1001
├─ section_name: "health_services"
└─ section_data: {"satisfaction":4,"used_services":["Clinic","Hospital"],...}

-- 3. Survey Answers (Individual Questions)
survey_answer
├─ answer_id: 10001
├─ question_id: 1
├─ response_id: 1001
├─ answer_value: "College"
└─ created_at: "2026-01-15 11:30:00"

survey_answer
├─ answer_id: 10002
├─ question_id: 2
├─ response_id: 1001
├─ answer_value: '["Health Services","Education"]'
└─ created_at: "2026-01-15 11:30:00"

-- 4. Visit History
visits
├─ visit_id: 2001
├─ questionnaire_id: "2026-18-01-001"
├─ visit_number: 1
├─ outcome: "Interview_Started"
├─ notes: "Visit Type: First Visit"
├─ location: {"lat":7.1234,"lng":125.5678}
└─ timestamp: "2026-01-15 10:00:00"

-- 5. Questionnaire Status
questionnaires
├─ questionnaire_id: "2026-18-01-001"
├─ spot_id: 1
├─ cycle_id: 5
├─ sequence_number: 1
├─ status: "Completed"
├─ visit_count: 1
└─ completed_at: "2026-01-15 11:30:00"

-- 6. Spot Progress
spots
├─ spot_id: 1
├─ spot_name: "McKinley Elementary School"
├─ barangay_id: 18
├─ cycle_id: 5
├─ status: "In_Progress"
└─ (calculated: 1/5 completed)
```

### Step 4.2: Data Validation & Quality Checks

**Automatic Validations:**

1. **GPS Verification:**
   - If `gps_verified = false` → Interview flagged for review
   - Supervisor can review and approve/reject

2. **Visit Count Validation:**
   - Callbacks: Max 3 visits allowed
   - Replacements: Only 1 visit allowed

3. **Gender Matching:**
   - Odd questionnaires must have male respondents
   - Even questionnaires must have female respondents

4. **Completeness Check:**
   - All required questions answered
   - Demographics complete
   - Respondent selected via Kish Grid

5. **Duplicate Prevention:**
   - One response per questionnaire ID
   - Cannot submit same questionnaire twice


### Step 4.3: Data Ready for Analysis

**Final Database State (After All Interviews Completed):**

```sql
-- Survey Cycle
survey_cycle: 1 active cycle (2026)

-- Barangays
barangay: 25 barangays

-- Spots
spots: Multiple spots per barangay
  Example: McKinley has 3 spots
  - McKinley Elementary School (5 questionnaires)
  - McKinley Market Area (5 questionnaires)
  - McKinley Residential Zone (5 questionnaires)

-- Questionnaires
questionnaires: 375 total (25 barangays × 3 spots × 5 questionnaires)
  Status breakdown:
  - Completed: 350
  - In_Progress: 15 (callbacks pending)
  - Flagged_For_Substitution: 10

-- Survey Responses
survey_response: 350 completed interviews
  - All with GPS verification
  - All with Kish Grid selection
  - All with complete demographics

-- Survey Answers
survey_answer: ~35,000 individual answers (350 responses × ~100 questions)

-- Visits
visits: ~400 visit records
  - 350 successful interviews (1 visit each)
  - 30 callback visits (15 questionnaires × 2 visits)
  - 20 failed visits (10 NQR + 10 OR)
```

**Data Quality Metrics:**
```javascript
{
  totalQuestionnaires: 375,
  completed: 350,
  completionRate: "93.3%",
  
  gpsVerified: 345,
  gpsVerificationRate: "98.6%",
  
  callbacksNeeded: 15,
  callbackSuccessRate: "100%",
  
  replacementsNeeded: 10,
  replacementRate: "2.7%",
  
  averageInterviewTime: "45 minutes",
  
  genderBalance: {
    male: 175,
    female: 175,
    ratio: "50/50"
  }
}
```

---

## Questionnaire ID Format

### Format: `YYYY-BB-SS-QQQ`

**Components:**
- `YYYY`: 4-digit year (e.g., 2026)
- `BB`: Barangay ID, no padding (e.g., 18 for McKinley, 1 for first barangay)
- `SS`: 2-digit spot number within barangay (01, 02, 03...)
- `QQQ`: 3-digit questionnaire number within spot (001, 002, 003...)

**Examples:**

```
2026-18-01-001
└─┬─┘└┬┘└┬┘└─┬─┘
  │   │  │   └─ Questionnaire 1 (Odd → Male)
  │   │  └───── Spot 1 in barangay
  │   └──────── Barangay 18 (McKinley)
  └──────────── Year 2026

2026-18-02-005
└─┬─┘└┬┘└┬┘└─┬─┘
  │   │  │   └─ Questionnaire 5 (Odd → Male)
  │   │  └───── Spot 2 in barangay
  │   └──────── Barangay 18 (McKinley)
  └──────────── Year 2026

2026-26-01-002
└─┬─┘└┬┘└┬┘└─┬─┘
  │   │  │   └─ Questionnaire 2 (Even → Female)
  │   │  └───── Spot 1 in barangay
  │   └──────── Barangay 26 (Katipunan)
  └──────────── Year 2026

2026-1-03-001
└─┬─┘└┘└┬┘└─┬─┘
  │   │ │   └─ Questionnaire 1 (Odd → Male)
  │   │ └───── Spot 3 in barangay
  │   └──────── Barangay 1
  └──────────── Year 2026
```

**Parsing Example:**
```javascript
const id = "2026-18-01-001";
const [year, barangayId, spotNumber, questionnaireNumber] = id.split('-');
// year = "2026"
// barangayId = "18"
// spotNumber = "01"
// questionnaireNumber = "001"
```

**Gender Assignment:**
- **Odd** questionnaire numbers (001, 003, 005) → **Male** respondents
- **Even** questionnaire numbers (002, 004) → **Female** respondents

**Benefits:**
1. **Unambiguous:** Hyphens clearly separate each component
2. **Easy to parse:** Simple `split('-')` operation
3. **Human-readable:** Clear visual separation of parts
4. **Prevents confusion:** No ambiguity between barangay 1 spot 80 (1-80) vs barangay 18 spot 0 (18-0)
5. **Unique identification:** Across all cycles, barangays, and spots
6. **Automatic gender balance:** Odd/even pattern ensures 50/50 split
7. **Sequential numbering:** Easy to track within spots

**Special Cases:**
- **Non-spot questionnaires:** Use spot number `00` (e.g., `2026-18-00-001`)
  - Generated on-the-fly via `/api/questionnaire-number`
  - Not tied to a specific spot location


---

## CSIS Protocol Implementation

### Callback Protocol (3-Visit Rule)

**Scenario:** Selected respondent is unavailable

**Process:**
1. **Visit 1:** Respondent not home → Log "Callback Needed"
2. **Visit 2:** Return to same household → Try again
3. **Visit 3:** Final attempt → If still unavailable, mark for substitution

**Key Rules:**
- ✅ Same household, same selected respondent
- ✅ Up to 3 total visits allowed
- ✅ After 3 failed visits → Substitution (not replacement)
- ✅ Substitution = Find person with matching demographics

**Database Tracking:**
```sql
questionnaires
├─ status: "In_Progress"
├─ visit_count: 1, 2, or 3
└─ If visit_count = 3 and still incomplete:
   └─ status: "Flagged_For_Substitution"
```

### Replacement Protocol (1-Visit Rule)

**Scenario:** Entire household is invalid

**Triggers:**
1. **No Qualified Respondent (NQR):**
   - Wrong sex for questionnaire
   - All household members under 18
   
2. **Outright Refusal (OR):**
   - Household refuses before Kish Grid
   
3. **Household Moved:**
   - No longer at location

**Process:**
1. **Visit 1:** Identify invalid household → Log outcome
2. **Immediate Action:** Move to next household
3. **Interval Rule:** Skip one house, then try next

**Key Rules:**
- ✅ Only 1 visit allowed
- ✅ Cannot use on 2nd or 3rd visit (validation enforced)
- ✅ Move to next household immediately
- ✅ Follow interval rule (skip one house)

**Database Tracking:**
```sql
questionnaires
├─ status: "Flagged_For_Substitution"
├─ visit_count: 1
└─ Last visit outcome: "No_Qualified_Respondent" | "Outright_Refusal" | "Household_Moved"
```

### Validation Rules

**System Enforcements:**

1. **Visit Type Validation:**
   ```javascript
   if (outcome === "No_Qualified_Respondent" && visitType !== "First Visit") {
     error: "Replacement outcomes can only be used on First Visit"
   }
   ```

2. **Callback Limit:**
   ```javascript
   if (visitCount >= 3 && outcome === "Callback_Needed") {
     warning: "This is the final callback attempt"
     action: "Mark for substitution if still unavailable"
   }
   ```

3. **Outcome-Based Redirect:**
   ```javascript
   if (outcome !== "Interview_Started") {
     action: "Redirect to spots dashboard"
     message: "Visit logged. Cannot continue to survey."
   }
   ```


---

## Database Schema

### Core Tables

#### 1. survey_cycle
```sql
CREATE TABLE survey_cycle (
  cycle_id SERIAL PRIMARY KEY,
  year VARCHAR(10) NOT NULL,
  status ENUM('Active', 'Completed', 'Archived') DEFAULT 'Active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  responses INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 2. barangay
```sql
CREATE TABLE barangay (
  barangay_id SERIAL PRIMARY KEY,
  barangay_name VARCHAR(191) NOT NULL,
  seal ENUM('yes', 'no') DEFAULT 'no',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  households INT DEFAULT 0,
  population INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 3. spots
```sql
CREATE TABLE spots (
  spot_id SERIAL PRIMARY KEY,
  cycle_id INT NOT NULL REFERENCES survey_cycle(cycle_id),
  barangay_id INT NOT NULL REFERENCES barangay(barangay_id),
  spot_name VARCHAR(255) NOT NULL,
  starting_point JSONB NOT NULL,  -- {lat, lng}
  random_start INT NOT NULL,      -- 1-999
  assigned_fi_id INT REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 4. questionnaires
```sql
CREATE TABLE questionnaires (
  questionnaire_id VARCHAR(50) PRIMARY KEY,  -- Format: YYYY-BBSS-QQQ
  spot_id INT NOT NULL REFERENCES spots(spot_id),
  cycle_id INT NOT NULL REFERENCES survey_cycle(cycle_id),
  sequence_number INT NOT NULL,  -- 1-5 within spot
  status VARCHAR(50) DEFAULT 'Pending',
  -- Status values: Pending, In_Progress, Completed, Flagged_For_Substitution
  visit_count INT DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. visits
```sql
CREATE TABLE visits (
  visit_id SERIAL PRIMARY KEY,
  questionnaire_id VARCHAR(50) NOT NULL REFERENCES questionnaires(questionnaire_id),
  visit_number INT NOT NULL,  -- 1, 2, or 3
  outcome VARCHAR(50) NOT NULL,
  -- Outcomes: Interview_Started, Callback_Needed, No_Qualified_Respondent, 
  --           Outright_Refusal, Household_Moved
  notes TEXT,
  location JSONB,  -- {lat, lng}
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. survey_response
```sql
CREATE TABLE survey_response (
  response_id SERIAL PRIMARY KEY,
  questionnaire_id VARCHAR(50) NOT NULL REFERENCES questionnaires(questionnaire_id),
  cycle_id INT NOT NULL REFERENCES survey_cycle(cycle_id),
  barangay_id INT NOT NULL REFERENCES barangay(barangay_id),
  respondent_name VARCHAR(255) NOT NULL,
  respondent_age INT NOT NULL,
  respondent_sex VARCHAR(20) NOT NULL,
  gps_location JSONB,  -- {lat, lng}
  gps_accuracy DECIMAL(10,2),
  gps_verified BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP NOT NULL,
  interviewer_id INT REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. survey_section
```sql
CREATE TABLE survey_section (
  section_id SERIAL PRIMARY KEY,
  response_id INT NOT NULL REFERENCES survey_response(response_id),
  section_name VARCHAR(100) NOT NULL,
  section_data JSONB NOT NULL,  -- All answers for this section
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. survey_answer
```sql
CREATE TABLE survey_answer (
  answer_id SERIAL PRIMARY KEY,
  question_id INT NOT NULL,
  response_id INT NOT NULL REFERENCES survey_response(response_id),
  answer_value TEXT,
  answer_options JSONB,  -- For multi-select
  answer_text TEXT,
  answer_number DECIMAL(10,2),
  answer_rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. assignment
```sql
CREATE TABLE assignment (
  assignment_id SERIAL PRIMARY KEY,
  barangay_id INT NOT NULL REFERENCES barangay(barangay_id),
  user_id INT NOT NULL REFERENCES users(id),
  status ENUM('Active', 'Pending', 'Completed') DEFAULT 'Pending',
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Relationships

```
survey_cycle (1) ──→ (many) spots
survey_cycle (1) ──→ (many) questionnaires
survey_cycle (1) ──→ (many) survey_response

barangay (1) ──→ (many) spots
barangay (1) ──→ (many) survey_response

spots (1) ──→ (many) questionnaires

questionnaires (1) ──→ (many) visits
questionnaires (1) ──→ (1) survey_response

survey_response (1) ──→ (many) survey_section
survey_response (1) ──→ (many) survey_answer

users (1) ──→ (many) spots (as assigned_fi_id)
users (1) ──→ (many) survey_response (as interviewer_id)
users (1) ──→ (many) assignment
```

---

## Summary

This workflow ensures:

1. ✅ **Structured Data Collection:** Admin → Supervisor → FI hierarchy
2. ✅ **Unique Identification:** YYYY-BBSS-QQQ format for all questionnaires
3. ✅ **Gender Balance:** Automatic odd/even assignment
4. ✅ **CSIS Protocol Compliance:** Proper callback and replacement handling
5. ✅ **Offline Support:** IndexedDB for field work without internet
6. ✅ **GPS Verification:** Location tracking for data quality
7. ✅ **Kish Grid Selection:** Scientific respondent selection
8. ✅ **Complete Audit Trail:** All visits and outcomes logged
9. ✅ **Data Quality:** Validation at every step
10. ✅ **Ready for ML Analysis:** Clean, structured data in database

**Final Output:** Survey responses stored in database, ready for machine learning analysis and reporting.

