# SIGLA Survey Forms - Complete Workflow Documentation

## Overview

The SIGLA (Survey Information for Governance and Local Administration) survey forms system is a comprehensive web-based application for conducting community assessment surveys. It implements the PULSE (Public Understanding and Local Service Evaluation) methodology with sophisticated features including GPS geotagging, Kish Grid respondent selection, service area randomization, and offline-first data management.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Survey Flow](#survey-flow)
3. [Core Components](#core-components)
4. [Data Management](#data-management)
5. [Key Features](#key-features)
6. [Technical Implementation](#technical-implementation)

---

## System Architecture

### Technology Stack
- **Framework**: Next.js 14 (React with App Router)
- **Language**: TypeScript
- **State Management**: React Hooks (useState, useEffect)
- **Storage**: 
  - IndexedDB (primary offline storage)
  - localStorage (fallback/legacy)
- **Authentication**: Custom AuthProvider with ProtectedRoute
- **Styling**: Tailwind CSS with custom components

### File Structure
```
src/app/survey/forms/
├── page.tsx                          # Main survey orchestrator
├── sections/                         # Section components
│   ├── survey-initialization.tsx     # Step 1: Location & setup
│   ├── respondent-selection.tsx      # Step 2: Kish Grid selection
│   ├── respondent-demographics.tsx   # Step 3: Demographics
│   ├── question-flow.tsx             # Step 4-9: Survey sections
│   ├── tabbed-summary.tsx            # Step 10: Review & submit
│   ├── header.tsx                    # Navigation header
│   ├── sidebar.tsx                   # Desktop section navigation
│   ├── floating-progress-button.tsx  # Mobile progress tracker
│   ├── QuestionRenderer.tsx          # Question type renderer
│   ├── QuestionFlowNavigation.tsx    # Question navigation
│   └── QuestionProgressBar.tsx       # Progress indicator
├── utils/                            # Utility functions
│   ├── sectionAssignment.ts          # Service area randomization
│   ├── validation.ts                 # Answer validation
│   ├── questions.ts                  # Question data loader
│   ├── geotagging.ts                 # GPS service
│   └── useGeotagging.ts              # Geotagging hook
└── components/
    └── submission-modal.tsx          # Submission feedback
```

---

## Survey Flow

### Complete Survey Journey


```
┌─────────────────────────────────────────────────────────────────┐
│                    SURVEY INITIALIZATION                         │
│  • Auto-capture GPS location                                     │
│  • Generate unique questionnaire number (BB-YYYY-NNNN)          │
│  • Determine odd/even assignment                                 │
│  • Pre-select barangay (if from dashboard)                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RESPONDENT SELECTION                            │
│  • List household members (max 10)                              │
│  • Collect: name, birthdate, gender                             │
│  • Apply Kish Grid algorithm                                    │
│  • Select respondent based on questionnaire number              │
│  • Log visit status (for callbacks)                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                RESPONDENT DEMOGRAPHICS                           │
│  • Auto-fill: age, birthdate, gender                            │
│  • Collect: education, income, purok                            │
│  • Validate required fields                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVICE AREA SECTIONS (3 of 6)                     │
│                                                                  │
│  ODD Questionnaires:          EVEN Questionnaires:              │
│  1. Financial Administration  1. Disaster Preparedness          │
│  2. Safety & Peace Order      2. Social Protection              │
│  3. Environmental Management  3. Business Friendliness          │
│                                                                  │
│  • Question-by-question flow                                    │
│  • Conditional logic & skip patterns                            │
│  • Real-time validation                                         │
│  • Auto-save to IndexedDB                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUMMARY & REVIEW                              │
│  • Tabbed view of all responses                                 │
│  • Show answered vs skipped questions                           │
│  • Survey statistics                                            │
│  • Final submission                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUBMISSION                                  │
│  • POST to /api/survey-responses                                │
│  • Mark as "Completed - Pending Sync" in IndexedDB             │
│  • Auto-sync when online                                        │
│  • Redirect to dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Main Orchestrator (`page.tsx`)

**Purpose**: Central controller managing the entire survey lifecycle.

**Key Responsibilities**:
- State management for survey data and section progress
- Section navigation and routing
- IndexedDB integration for offline support
- URL parameter handling for callback scenarios
- Survey submission coordination

**State Structure**:
```typescript
interface SurveyData {
  surveyNumber: string                    // BB-YYYY-NNNN format
  questionnaireType?: 'odd' | 'even'      // Determines sections
  assignedSections?: string[]             // Randomized section order
  barangayId?: number                     // Target barangay
  location: {                             // GPS coordinates
    lat: number
    lng: number
    address: string
    accuracy?: number
    timestamp?: number
    barangay?: string
    municipality?: string
    province?: string
  }
  selectedMember: string                  // Kish Grid result
  respondentDemographics: {               // Demographics data
    age: number
    birthdate: string
    gender: string
    educationalAttainment: string
    householdIncome: string
    purok: string
  }
  // Section-specific data
  financialAdmin: Record<string, any>
  disasterPrep: Record<string, any>
  safetyPeace: Record<string, any>
  businessFriendly: Record<string, any>
  environmental: Record<string, any>
  socialProtection: Record<string, any>
}
```

**Section Status Tracking**:
```typescript
interface SectionStatus {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
}
```


**Key Functions**:

1. **Data Loading & Persistence**:
   - Loads from IndexedDB on mount (for callbacks)
   - Falls back to localStorage for legacy surveys
   - Auto-saves on every data change
   - Pre-populates barangayId from URL parameters

2. **Section Management**:
   - Dynamically builds section list based on questionnaire type
   - Updates section statuses (pending → in-progress → completed)
   - Handles navigation between sections
   - Validates section completion

3. **Submission Handling**:
   - Validates all required data
   - Cleans data (removes undefined/null values)
   - Tracks skip reasons for unanswered questions
   - Submits to API endpoint
   - Marks as completed in IndexedDB
   - Shows success/error modal

---

### 2. Survey Initialization (`survey-initialization.tsx`)

**Purpose**: First step - capture location and generate questionnaire number.

**Features**:

1. **Automatic GPS Capture**:
   - Uses `useGeotagging` hook
   - High accuracy mode enabled
   - 10-second timeout for auto-capture
   - Reverse geocoding for address
   - Extracts barangay, municipality, province

2. **Location Services**:
   ```typescript
   interface LocationData {
     latitude: number
     longitude: number
     accuracy: number        // In meters
     timestamp: number
     address?: string        // From reverse geocoding
     barangay?: string
     municipality?: string
     province?: string
   }
   ```

3. **Interactive Map**:
   - Leaflet.js integration
   - Manual location selection fallback
   - Real-time marker placement
   - OpenStreetMap tiles

4. **Questionnaire Number Generation**:
   - Format: `BB-YYYY-NNNN`
   - BB = Barangay code (2 digits)
   - YYYY = Current year
   - NNNN = Sequential number (4 digits)
   - Generated via `/api/questionnaire-number` endpoint
   - Determines odd/even assignment

5. **Error Handling**:
   - Permission denied → Show manual selection
   - Timeout → Retry with longer timeout
   - Unavailable → Fallback to map selection

**Workflow**:
```
1. Component mounts
2. Auto-detect GPS (if supported)
3. Reverse geocode coordinates
4. Display location on map
5. User clicks "Continue"
6. Generate questionnaire number
7. Save to state & IndexedDB
8. Navigate to respondent selection
```

---

### 3. Respondent Selection (`respondent-selection.tsx`)

**Purpose**: Implement Kish Grid methodology for random respondent selection.

**Kish Grid Algorithm**:
```
1. Collect household members (age 18+)
2. Filter eligible members
3. Extract last digit of questionnaire number
4. Calculate: selectedIndex = lastDigit % eligibleCount
5. Select member at calculated index
```

**Features**:

1. **Household Member Collection**:
   - Dynamic form (1-10 members)
   - Required fields: name, birthdate, gender
   - Age validation (must be 18+)
   - Real-time age calculation

2. **Visit Status Tracking**:
   - Displays current visit count
   - Logs visit reasons (callback scenarios)
   - Integrates with IndexedDB
   - Shows visit history

3. **Kish Grid Display**:
   - Visual table showing all eligible members
   - Highlights selected respondent
   - Shows selection logic
   - Explains randomization

4. **Data Pre-population**:
   - Auto-fills demographics with selected member data
   - Passes age, birthdate, gender to next step
   - Reduces data entry errors

**Validation Rules**:
- Minimum 1 household member
- Maximum 10 household members
- All members must have name, birthdate, gender
- At least one member must be 18+ years old

---

### 4. Respondent Demographics (`respondent-demographics.tsx`)

**Purpose**: Collect additional demographic information about the selected respondent.

**Data Collected**:
```typescript
{
  age: number              // Auto-filled (read-only)
  birthdate: string        // Auto-filled (read-only)
  gender: string           // Auto-filled (read-only)
  educationalAttainment: string  // User input (required)
  householdIncome: string        // User input (required)
  purok: string                  // User input (optional)
}
```

**Educational Attainment Options**:
- No formal education
- Elementary (1-6)
- Elementary graduate
- High school (1-4)
- High school graduate
- Vocational/Technical
- College (1-4)
- College graduate
- Post-graduate

**Household Income Ranges**:
- ₱0 – No income
- Below ₱10,000
- ₱10,000 - ₱20,000
- ₱20,001 - ₱30,000
- ₱30,001 - ₱50,000
- ₱50,001 - ₱75,000
- ₱75,001 - ₱100,000
- Above ₱100,000
- Prefer not to say

**Validation**:
- Education and income are required
- Purok is optional but recommended
- Cannot proceed without completing required fields

---


### 5. Question Flow (`question-flow.tsx`)

**Purpose**: Core survey engine handling question-by-question navigation through service area sections.

**Architecture**:
- Single question display at a time
- Linear progression with conditional branching
- Real-time validation
- Auto-save on every answer
- Skip pattern implementation

**Question Types Supported**:

1. **Radio (Single Choice)**:
   ```typescript
   {
     id: "question_id",
     type: "radio",
     question: "Question text",
     options: ["Option 1", "Option 2", "Option 3"],
     required: true
   }
   ```

2. **Checkbox (Multiple Choice)**:
   ```typescript
   {
     id: "question_id",
     type: "checkbox",
     question: "Question text",
     options: ["Option 1", "Option 2", "Option 3"],
     required: true
   }
   ```

3. **Text Input**:
   ```typescript
   {
     id: "question_id",
     type: "text",
     question: "Question text",
     required: true
   }
   ```

4. **Textarea (Long Text)**:
   ```typescript
   {
     id: "question_id",
     type: "textarea",
     question: "Question text",
     required: true
   }
   ```

5. **Grouped Questions** (Main + Follow-ups):
   ```typescript
   {
     id: "question_id",
     type: "grouped",
     question: "Main question",
     mainOptions: ["Yes", "No"],
     followUpQuestions: [
       {
         id: "followup_1",
         type: "radio",
         question: "Follow-up question",
         options: ["Option 1", "Option 2"],
         dependsOn: "followup_0",
         dependsOnValue: "Yes"
       }
     ]
   }
   ```

**Conditional Logic**:

1. **Question Dependencies**:
   ```typescript
   {
     dependsOn: "previous_question_id",
     dependsOnValue: "Yes"
   }
   ```
   - Question only shows if dependency is met
   - Automatically skipped if condition not met
   - Skip reason tracked in data

2. **Conditional Jumps**:
   ```typescript
   {
     conditionalNext: [
       {
         value: "No",
         skipToId: "endOfSection"
       }
     ]
   }
   ```
   - Allows skipping multiple questions
   - Marks skipped questions as NULL with reason
   - Tracks skip patterns for analysis

**Skip Reason Tracking**:
```typescript
// Possible skip reasons
type SkipReason = 
  | 'not_aware_of_service'      // Answered "No" to awareness
  | 'service_not_used'          // Answered "No" to usage
  | 'incident_not_reported'     // Answered "No" to reporting
  | 'conditional_skip'          // Skipped due to logic
  | 'not_applicable'            // Question not relevant
```

**Progress Tracking**:
- Visual progress bar showing answered/total questions
- Color-coded status (answered, current, pending)
- Persistent part headers for section organization
- Real-time completion percentage

**Navigation**:
- "Back" button (goes to previous enabled question)
- "Next" button (validates before proceeding)
- "Reset Section" button (clears all answers)
- Dynamic button text based on context

**Validation**:
- Real-time validation on answer change
- Visual error indicators
- Prevents navigation if invalid
- Required field enforcement

---

### 6. Question Renderer (`QuestionRenderer.tsx`)

**Purpose**: Modular component for rendering different question types with validation.

**Features**:

1. **Type-Specific Rendering**:
   - Radio buttons with hover effects
   - Checkboxes with multi-select
   - Text inputs with character limits
   - Textareas with resize and counter
   - Grouped questions with nested logic

2. **Validation Integration**:
   - Uses `validation.ts` utilities
   - Shows inline error messages
   - Visual error states (red borders)
   - Touch-based validation (only after interaction)

3. **Accessibility**:
   - Proper label associations
   - Keyboard navigation support
   - ARIA attributes
   - Focus management

4. **Special Handling**:
   - Satisfaction scales (1-5 ratings)
   - Conditional follow-up questions
   - Disabled state styling
   - Placeholder text for guidance

---

### 7. Tabbed Summary (`tabbed-summary.tsx`)

**Purpose**: Final review screen before submission.

**Features**:

1. **Tabbed Interface**:
   - One tab per completed section
   - Demographics always included
   - Only shows assigned sections
   - Visual completion indicators

2. **Response Display**:
   - Formatted question-answer pairs
   - Handles arrays, objects, primitives
   - Shows answered questions count
   - Lists skipped questions with reasons

3. **Survey Statistics**:
   - Total assigned sections
   - Completed sections count
   - Survey date
   - Survey ID (questionnaire number)

4. **Data Validation**:
   - Checks all required sections completed
   - Validates data integrity
   - Shows warnings for incomplete sections

5. **Submission**:
   - Final data cleaning
   - NULL handling for skipped questions
   - Skip reason preservation
   - API submission with error handling

---


## Data Management

### IndexedDB Integration

**Purpose**: Offline-first data storage for survey responses.

**Database Structure**:
```typescript
interface SurveyRecord {
  questionnaireId: string        // Primary key (BB-YYYY-NNNN)
  cycleId: number                // Survey cycle reference
  spotId: number                 // Spot/location reference
  status: 'In Progress' | 'Completed - Pending Sync' | 'Synced'
  createdAt: Date
  updatedAt: Date
  surveyData: {
    barangayId: number
    location: LocationData
    selectedMember: string
    respondentDemographics: Demographics
    interviewerId: number
    questionnaireType: 'odd' | 'even'
    assignedSections: string[]
    currentSection: string       // For resume functionality
    sections: {
      [sectionId: string]: {
        data: Record<string, any>
        skipReasons: Record<string, string>
        completed: boolean
      }
    }
  }
  visits: Visit[]                // Visit history for callbacks
}

interface Visit {
  timestamp: Date
  status: string                 // e.g., "Interview Started", "Callback"
  notes: string
  interviewerId?: number
}
```

**Key Operations**:

1. **Create Record** (on initialization):
   ```typescript
   await createSurveyRecord(
     questionnaireId,
     cycleId,
     spotId,
     initialData
   )
   ```

2. **Update Data** (on section completion):
   ```typescript
   await updateSurveyData(
     questionnaireId,
     cycleId,
     updatedData
   )
   ```

3. **Add Visit** (for callback tracking):
   ```typescript
   await addVisit(
     questionnaireId,
     cycleId,
     status,
     notes,
     interviewerId
   )
   ```

4. **Mark Completed** (on submission):
   ```typescript
   await markCompletedPendingSync(
     questionnaireId,
     cycleId
   )
   ```

5. **Load Record** (for resume):
   ```typescript
   const record = await getSurveyRecordByQuestionnaire(
     questionnaireId
   )
   ```

**Sync Strategy**:
- Auto-sync when online (via `AutoSync` component)
- Manual sync trigger available
- Conflict resolution (server wins)
- Retry logic with exponential backoff

---

### localStorage Fallback

**Purpose**: Legacy support and simple key-value storage.

**Stored Data**:
```typescript
// Main survey data
localStorage.setItem(
  "barangay-survey-data",
  JSON.stringify(surveyData)
)

// Section statuses
localStorage.setItem(
  "barangay-survey-sections",
  JSON.stringify(sections)
)
```

**Usage**:
- Loaded on mount if no IndexedDB record found
- Cleared on successful submission
- Used for non-questionnaire-based surveys

---

## Key Features

### 1. Service Area Randomization

**Purpose**: Reduce respondent burden by assigning only 3 of 6 service areas.

**Implementation** (`sectionAssignment.ts`):

```typescript
// Odd questionnaires (last digit: 1, 3, 5, 7, 9)
const ODD_SECTIONS = [
  "financial",      // Financial Administration
  "safety",         // Safety & Peace Order
  "environmental"   // Environmental Management
]

// Even questionnaires (last digit: 0, 2, 4, 6, 8)
const EVEN_SECTIONS = [
  "disaster",       // Disaster Preparedness
  "social",         // Social Protection
  "business"        // Business Friendliness
]

function getServiceAreaOrder(questionnaireId: string): string[] {
  const lastDigit = parseInt(questionnaireId.slice(-1))
  return lastDigit % 2 === 1 ? ODD_SECTIONS : EVEN_SECTIONS
}
```

**Benefits**:
- Reduces survey time by 50%
- Maintains statistical validity
- Balanced coverage across population
- Prevents survey fatigue

---

### 2. Kish Grid Selection

**Purpose**: Ensure random, unbiased respondent selection within households.

**Algorithm**:
```typescript
function selectRespondent(
  eligibleMembers: Member[],
  questionnaireNumber: string
): Member {
  // Extract last digit from questionnaire number
  const lastDigit = parseInt(questionnaireNumber.slice(-1))
  
  // Calculate selection index
  const selectedIndex = lastDigit % eligibleMembers.length
  
  // Return selected member
  return eligibleMembers[selectedIndex]
}
```

**Visual Display**:
- Table showing all eligible members
- Highlighted selected respondent
- Explanation of selection logic
- Questionnaire number reference

**Advantages**:
- Eliminates interviewer bias
- Reproducible selection
- Statistically sound
- Easy to audit

---

### 3. GPS Geotagging

**Purpose**: Accurate location capture for spatial analysis.

**Implementation** (`geotagging.ts`):

```typescript
class GeotaggingService {
  // Singleton pattern
  private static instance: GeotaggingService
  
  // Cache for performance
  private cachedLocation: LocationData | null = null
  private cacheTimestamp: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  
  async getCurrentLocation(options: GeotaggingOptions): Promise<LocationData> {
    // Check cache validity
    if (this.isCacheValid()) {
      return this.cachedLocation!
    }
    
    // Get browser geolocation
    const position = await this.getBrowserLocation(options)
    
    // Reverse geocode if address required
    if (options.requireAddress) {
      const address = await this.reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      )
      
      // Extract administrative divisions
      const barangay = this.extractBarangay(address.addressParts)
      const municipality = this.extractMunicipality(address.addressParts)
      const province = this.extractProvince(address.addressParts)
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        address: address.displayName,
        barangay,
        municipality,
        province
      }
    }
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    }
  }
  
  async reverseGeocode(lat: number, lng: number): Promise<Address> {
    // Use Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    )
    return await response.json()
  }
}
```

**Features**:
- High accuracy mode
- Caching (5-minute validity)
- Reverse geocoding
- Administrative division extraction
- Distance calculation utilities
- Radius validation

---


### 4. Validation System

**Purpose**: Ensure data quality and completeness.

**Implementation** (`validation.ts`):

```typescript
interface ValidationError {
  questionId: string
  message: string
  type: 'required' | 'format' | 'range' | 'type'
}

function validateAnswer(question: Question, answer: any): ValidationError | null {
  // Required field check
  if (question.required && !answer) {
    return {
      questionId: question.id,
      message: 'This field is required',
      type: 'required'
    }
  }
  
  // Type-specific validation
  switch (question.type) {
    case 'text':
      return validateTextAnswer(question, answer)
    case 'textarea':
      return validateTextareaAnswer(question, answer)
    case 'radio':
      return validateRadioAnswer(question, answer)
    case 'checkbox':
      return validateCheckboxAnswer(question, answer)
    case 'grouped':
      return validateGroupedAnswer(question, answer)
  }
  
  return null
}
```

**Validation Rules**:

1. **Text Input**:
   - Minimum 2 characters
   - Maximum 500 characters
   - Trim whitespace

2. **Textarea**:
   - Minimum 5 characters
   - Maximum 2000 characters
   - Trim whitespace

3. **Radio**:
   - Must be one of valid options
   - Required if question is required

4. **Checkbox**:
   - At least one selection if required
   - All selections must be valid options

5. **Grouped**:
   - Main question required
   - Follow-ups required if main is "Yes"
   - Conditional validation based on dependencies

**Visual Feedback**:
- Red border on invalid fields
- Inline error messages
- Icon indicators
- Prevents navigation until valid

---

### 5. Offline Support

**Components**:

1. **OfflineIndicator**:
   - Shows connection status
   - Visual banner when offline
   - Auto-hides when online

2. **AutoSync**:
   - Monitors online/offline events
   - Triggers sync when reconnected
   - Shows sync progress
   - Handles sync errors

3. **IndexedDB Storage**:
   - Stores all survey data locally
   - Survives browser restarts
   - No data loss on connection issues

**Workflow**:
```
1. User fills survey (online or offline)
2. Data saved to IndexedDB immediately
3. On submission:
   - If online: Submit to API + mark synced
   - If offline: Mark "Pending Sync"
4. When reconnected:
   - AutoSync detects online status
   - Syncs all pending records
   - Updates status to "Synced"
```

---

### 6. Callback Support

**Purpose**: Handle incomplete surveys and follow-up visits.

**Features**:

1. **Visit Tracking**:
   - Records each visit attempt
   - Timestamps and interviewer ID
   - Visit status and notes
   - Cumulative visit count

2. **Resume Functionality**:
   - Loads existing survey data
   - Restores current section
   - Preserves all answers
   - Increments visit count

3. **URL Parameters**:
   ```
   /survey/forms?questionnaireId=BB-2024-0001&cycleId=1&spotId=123&barangayId=26
   ```
   - `questionnaireId`: Identifies survey
   - `cycleId`: Survey cycle
   - `spotId`: Location reference
   - `barangayId`: Pre-selects barangay

4. **Visit Status Button**:
   - Shows current visit count
   - Allows logging visit reasons
   - Options:
     - "Respondent not available"
     - "Respondent refused"
     - "Callback scheduled"
     - "Interview completed"

**Callback Workflow**:
```
1. Initial visit: Create survey record
2. Incomplete: Log visit status
3. Return visit: Load from URL parameters
4. Resume: Continue from last section
5. Complete: Mark as completed
6. Submission: Note callback in message
```

---

## Technical Implementation

### State Management

**React Hooks Used**:
- `useState`: Component state
- `useEffect`: Side effects and lifecycle
- `useRef`: DOM references and mutable values
- `useRouter`: Navigation
- `useSearchParams`: URL parameters
- `useAuth`: Authentication context

**State Flow**:
```
┌─────────────────┐
│   page.tsx      │  Main state container
│   (Parent)      │  - surveyData
│                 │  - sections
│                 │  - currentSection
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────┐              ┌─────────────────┐
│  Section        │              │  Utility        │
│  Components     │              │  Functions      │
│  (Children)     │              │                 │
│                 │              │  - validation   │
│  - Props down   │              │  - assignment   │
│  - Callbacks up │              │  - geotagging   │
└─────────────────┘              └─────────────────┘
```

---

### API Integration

**Endpoints Used**:

1. **Generate Questionnaire Number**:
   ```typescript
   POST /api/questionnaire-number
   Body: { barangayId: number }
   Response: {
     surveyNumber: string,      // BB-YYYY-NNNN
     questionnaireNumber: number,
     type: 'odd' | 'even'
   }
   ```

2. **Submit Survey**:
   ```typescript
   POST /api/survey-responses
   Body: {
     surveyNumber: string,
     location: LocationData,
     selectedMember: string,
     respondentDemographics: Demographics,
     interviewerId: number,
     barangayId: number,
     sections: {
       [sectionId: string]: {
         data: Record<string, any>,
         skipReasons: Record<string, string>,
         completed: boolean
       }
     }
   }
   Response: {
     responseId: number,
     message: string
   }
   ```

3. **Get Barangay Info**:
   ```typescript
   GET /api/barangays/{id}
   Response: {
     barangay_id: number,
     barangay_name: string,
     municipality: string,
     province: string
   }
   ```

4. **Reverse Geocode**:
   ```typescript
   // External API (Nominatim)
   GET https://nominatim.openstreetmap.org/reverse
   Params: {
     format: 'json',
     lat: number,
     lon: number,
     zoom: 18,
     addressdetails: 1
   }
   ```

---

### Error Handling

**Strategies**:

1. **User-Friendly Messages**:
   - Technical errors translated to plain language
   - Actionable guidance provided
   - Retry options offered

2. **Graceful Degradation**:
   - GPS fails → Manual map selection
   - API fails → Save locally, sync later
   - Validation fails → Show inline errors

3. **Error Boundaries**:
   - Component-level error catching
   - Fallback UI rendering
   - Error logging for debugging

4. **Submission Errors**:
   - Duplicate survey number → Specific modal
   - Network error → Retry option
   - Validation error → Highlight issues

**Modal Types**:
- Success: Green checkmark, redirect option
- Duplicate: Orange warning, retry option
- Error: Red alert, retry option

---


### Responsive Design

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizations**:

1. **Floating Progress Button**:
   - Circular button in bottom-right
   - Shows completion ratio (e.g., "3/6")
   - Opens drawer on tap
   - Swipe down to close

2. **Bottom Drawer**:
   - Slides up from bottom
   - Shows all sections
   - Touch-friendly navigation
   - Gesture support

3. **Sidebar**:
   - Hidden on mobile
   - Visible on desktop
   - Smooth transitions

4. **Header**:
   - Compact on mobile
   - Dropdown menu for user actions
   - Location status visible

**Desktop Features**:
- Persistent sidebar navigation
- Larger form inputs
- Multi-column layouts
- Hover effects

---

### Performance Optimizations

**Techniques**:

1. **Code Splitting**:
   - Dynamic imports for heavy components
   - Lazy loading of map libraries
   - Route-based splitting

2. **Memoization**:
   - React.memo for pure components
   - useMemo for expensive calculations
   - useCallback for stable functions

3. **Debouncing**:
   - Input validation debounced
   - Auto-save throttled
   - Search queries debounced

4. **Caching**:
   - GPS location cached (5 min)
   - API responses cached
   - Static assets cached

5. **Optimistic Updates**:
   - UI updates immediately
   - Background sync
   - Rollback on error

---

## Data Flow Diagrams

### Survey Initialization Flow

```
┌──────────────┐
│   User       │
│   Arrives    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Check URL Parameters                │
│  - questionnaireId?                  │
│  - cycleId?                          │
│  - barangayId?                       │
└──────┬───────────────────────────────┘
       │
       ├─── Has questionnaireId? ───┐
       │                            │
       ▼ No                         ▼ Yes
┌──────────────┐          ┌─────────────────────┐
│  New Survey  │          │  Load from IndexedDB│
│  Start fresh │          │  Resume existing    │
└──────┬───────┘          └─────────┬───────────┘
       │                            │
       ▼                            ▼
┌──────────────────────────────────────┐
│  Auto-capture GPS Location           │
│  - Request permission                │
│  - Get coordinates                   │
│  - Reverse geocode                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Generate Questionnaire Number       │
│  - Call API                          │
│  - Get BB-YYYY-NNNN                  │
│  - Determine odd/even                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Save to IndexedDB                   │
│  - Create record                     │
│  - Store initial data                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Navigate to Respondent Selection    │
└──────────────────────────────────────┘
```

---

### Question Navigation Flow

```
┌──────────────┐
│  Question N  │
│  Displayed   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  User Answers                        │
│  - Input value                       │
│  - Trigger onChange                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Validate Answer                     │
│  - Check required                    │
│  - Check format                      │
│  - Check dependencies                │
└──────┬───────────────────────────────┘
       │
       ├─── Valid? ───┐
       │              │
       ▼ No           ▼ Yes
┌──────────────┐  ┌──────────────────┐
│  Show Error  │  │  Save Answer     │
│  Block Next  │  │  Enable Next     │
└──────────────┘  └─────────┬────────┘
                            │
                            ▼
                  ┌──────────────────────┐
                  │  User Clicks Next    │
                  └─────────┬────────────┘
                            │
                            ▼
                  ┌──────────────────────────────┐
                  │  Check Conditional Logic     │
                  │  - Skip patterns?            │
                  │  - Jump to specific Q?       │
                  └─────────┬────────────────────┘
                            │
                            ├─── Has Skip? ───┐
                            │                 │
                            ▼ No              ▼ Yes
                  ┌──────────────┐  ┌─────────────────┐
                  │  Next Q      │  │  Mark Skipped   │
                  │  (N+1)       │  │  Jump to Target │
                  └──────────────┘  └─────────────────┘
                            │                 │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Save to State   │
                            │  & IndexedDB     │
                            └─────────┬────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  Update Progress │
                            │  Check Complete  │
                            └──────────────────┘
```

---

### Submission Flow

```
┌──────────────┐
│  User Clicks │
│  Submit      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Validate All Sections               │
│  - Check required fields             │
│  - Check section completion          │
└──────┬───────────────────────────────┘
       │
       ├─── Valid? ───┐
       │              │
       ▼ No           ▼ Yes
┌──────────────┐  ┌──────────────────────┐
│  Show Errors │  │  Clean Data          │
│  Highlight   │  │  - Remove undefined  │
│  Issues      │  │  - Add skip reasons  │
└──────────────┘  └─────────┬────────────┘
                            │
                            ▼
                  ┌──────────────────────────┐
                  │  POST to API             │
                  │  /api/survey-responses   │
                  └─────────┬────────────────┘
                            │
                            ├─── Success? ───┐
                            │                │
                            ▼ No             ▼ Yes
                  ┌──────────────┐  ┌────────────────┐
                  │  Show Error  │  │  Mark Synced   │
                  │  Modal       │  │  in IndexedDB  │
                  │  Retry?      │  └───────┬────────┘
                  └──────────────┘          │
                                            ▼
                                  ┌──────────────────┐
                                  │  Show Success    │
                                  │  Modal           │
                                  └─────────┬────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │  Clear Storage   │
                                  │  - localStorage  │
                                  └─────────┬────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │  Redirect to     │
                                  │  Dashboard       │
                                  └──────────────────┘
```

---

## Security Considerations

### Authentication
- Protected routes via `ProtectedRoute` wrapper
- JWT token validation
- Session management
- Auto-logout on token expiry

### Data Protection
- No sensitive data in localStorage keys
- IndexedDB encrypted at browser level
- HTTPS for all API calls
- No PII in URLs

### Input Validation
- Client-side validation (UX)
- Server-side validation (security)
- SQL injection prevention
- XSS protection via React escaping

### Authorization
- Interviewer role verification
- Barangay access control
- Survey ownership validation
- API endpoint protection

---

## Testing Considerations

### Unit Tests
- Validation functions
- Utility functions
- Data transformations
- Calculation logic

### Integration Tests
- Component interactions
- State management
- API calls
- IndexedDB operations

### E2E Tests
- Complete survey flow
- Callback scenarios
- Offline functionality
- Error handling

### Manual Testing Checklist
- [ ] GPS capture works
- [ ] Manual location selection works
- [ ] Kish Grid selects correctly
- [ ] All question types render
- [ ] Validation shows errors
- [ ] Skip logic works
- [ ] Progress tracking accurate
- [ ] Offline mode works
- [ ] Sync works when online
- [ ] Submission succeeds
- [ ] Callbacks work
- [ ] Mobile responsive
- [ ] Desktop layout correct

---


## Common Scenarios

### Scenario 1: New Survey (Happy Path)

```
1. Interviewer navigates to /survey/forms
2. GPS automatically captures location
3. System generates questionnaire number: BB-2024-0001
4. Determined as ODD (Financial, Safety, Environmental)
5. Interviewer lists 4 household members
6. Kish Grid selects member #2
7. Demographics auto-filled, interviewer adds education/income
8. Completes Financial Administration section (20 questions)
9. Completes Safety & Peace Order section (15 questions)
10. Completes Environmental Management section (18 questions)
11. Reviews summary
12. Submits successfully
13. Redirected to dashboard
```

**Time**: ~25-30 minutes

---

### Scenario 2: Callback Visit

```
1. Interviewer clicks "Resume" from dashboard
2. URL includes: ?questionnaireId=BB-2024-0001&cycleId=1&spotId=123
3. System loads existing data from IndexedDB
4. Shows visit count: "Visit #2"
5. Interviewer logs visit status: "Respondent now available"
6. Resumes from last section (Safety & Peace Order)
7. Completes remaining sections
8. Submits with callback note
9. System marks as "Completed after 2 visits"
```

**Time**: ~15-20 minutes (only remaining sections)

---

### Scenario 3: Offline Survey

```
1. Interviewer in area with no internet
2. GPS still works (device-level)
3. Cannot generate questionnaire number from API
   → Shows error, allows manual entry
4. Completes entire survey offline
5. Data saved to IndexedDB
6. Status: "Completed - Pending Sync"
7. Returns to area with internet
8. AutoSync detects connection
9. Syncs all pending surveys
10. Status updated to "Synced"
```

**Time**: Same as online, plus sync time

---

### Scenario 4: GPS Permission Denied

```
1. Browser blocks GPS permission
2. System shows error: "Location access denied"
3. Offers manual selection button
4. Interviewer clicks "Select on Map"
5. Interactive map modal opens
6. Interviewer clicks on map to set location
7. System reverse geocodes coordinates
8. Location confirmed
9. Continues with survey
```

**Time**: +2-3 minutes for manual selection

---

### Scenario 5: Respondent Refuses

```
1. Interviewer starts survey
2. Completes initialization and respondent selection
3. Selected respondent refuses to participate
4. Interviewer clicks "Log Visit Status"
5. Selects "Respondent refused"
6. Adds notes: "Respondent cited privacy concerns"
7. Survey saved as "In Progress"
8. Can be marked as "Abandoned" later
```

**Time**: ~5 minutes

---

## Troubleshooting Guide

### Issue: GPS Not Working

**Symptoms**:
- "Location access denied" error
- Timeout errors
- Inaccurate coordinates

**Solutions**:
1. Check browser permissions
2. Enable location services on device
3. Try different browser
4. Use manual map selection
5. Check GPS signal strength

---

### Issue: Questionnaire Number Not Generating

**Symptoms**:
- "Failed to generate" error
- Stuck on initialization

**Solutions**:
1. Check internet connection
2. Verify barangay is selected
3. Check API endpoint status
4. Try refreshing page
5. Contact system administrator

---

### Issue: Survey Not Saving

**Symptoms**:
- Data lost on refresh
- IndexedDB errors
- "Storage quota exceeded"

**Solutions**:
1. Check browser storage settings
2. Clear old survey data
3. Check available disk space
4. Try different browser
5. Export data before clearing

---

### Issue: Submission Fails

**Symptoms**:
- "Submission failed" modal
- Network errors
- Timeout errors

**Solutions**:
1. Check internet connection
2. Verify all required fields completed
3. Check for duplicate survey number
4. Try again later
5. Data saved locally, will sync when online

---

### Issue: Kish Grid Not Selecting

**Symptoms**:
- No respondent selected
- Error in selection modal

**Solutions**:
1. Verify at least one member is 18+
2. Check all required fields filled
3. Verify questionnaire number is valid
4. Try re-entering household members
5. Refresh page if needed

---

## Best Practices

### For Interviewers

1. **Before Starting**:
   - Ensure device is charged
   - Check internet connection
   - Enable GPS/location services
   - Have backup paper forms

2. **During Survey**:
   - Explain purpose to respondent
   - Read questions exactly as written
   - Don't influence answers
   - Respect skip patterns
   - Save frequently (auto-saves)

3. **After Survey**:
   - Review all answers
   - Check for missing data
   - Submit when complete
   - Verify submission success
   - Log any issues

### For Developers

1. **Code Quality**:
   - Follow TypeScript best practices
   - Write descriptive comments
   - Use meaningful variable names
   - Keep functions small and focused
   - Handle all error cases

2. **Performance**:
   - Minimize re-renders
   - Use memoization appropriately
   - Lazy load heavy components
   - Optimize images and assets
   - Monitor bundle size

3. **Testing**:
   - Write unit tests for utilities
   - Test edge cases
   - Verify offline functionality
   - Test on multiple devices
   - Check accessibility

4. **Maintenance**:
   - Keep dependencies updated
   - Monitor error logs
   - Review user feedback
   - Document changes
   - Version control properly

---

## Future Enhancements

### Planned Features

1. **Photo Capture**:
   - Take photos of location
   - Attach to survey responses
   - Verify GPS coordinates

2. **Voice Recording**:
   - Record audio responses
   - Transcribe automatically
   - Store with survey data

3. **Multi-language Support**:
   - Tagalog interface
   - Local dialect options
   - Dynamic translation

4. **Advanced Analytics**:
   - Real-time dashboards
   - Completion rates
   - Quality metrics
   - Interviewer performance

5. **Batch Operations**:
   - Bulk export
   - Batch sync
   - Mass updates
   - Data migration tools

6. **Enhanced Offline**:
   - Offline maps
   - Cached questions
   - Background sync
   - Conflict resolution

---

## Glossary

**Barangay**: Smallest administrative division in the Philippines (village/district)

**CSIS**: Community Satisfaction Index Survey

**GPS**: Global Positioning System - satellite-based navigation

**IndexedDB**: Browser-based database for storing large amounts of structured data

**Kish Grid**: Statistical method for random respondent selection within households

**Nominatim**: Open-source geocoding service using OpenStreetMap data

**Purok**: Sub-division of a barangay (neighborhood)

**PULSE**: Public Understanding and Local Service Evaluation

**Questionnaire Number**: Unique identifier for each survey (format: BB-YYYY-NNNN)

**Reverse Geocoding**: Converting GPS coordinates to human-readable addresses

**Service Area**: Category of local government services (e.g., Financial, Safety, Environmental)

**Skip Pattern**: Conditional logic that determines which questions to ask based on previous answers

**Spot**: Specific location/household where survey is conducted

---

## Appendix

### Question Type Examples

#### Radio Question
```typescript
{
  id: "awareness_financial",
  type: "radio",
  question: "Are you aware of the barangay's financial transparency initiatives?",
  options: ["Yes", "No"],
  required: true
}
```

#### Checkbox Question
```typescript
{
  id: "services_used",
  type: "checkbox",
  question: "Which of the following services have you used?",
  options: [
    "Health center",
    "Day care",
    "Sports facilities",
    "Community hall",
    "None"
  ],
  required: true
}
```

#### Text Question
```typescript
{
  id: "suggestions",
  type: "text",
  question: "What suggestions do you have for improvement?",
  required: false
}
```

#### Grouped Question
```typescript
{
  id: "disaster_training",
  type: "grouped",
  question: "Has your household participated in disaster preparedness training?",
  mainOptions: ["Yes", "No"],
  followUpQuestions: [
    {
      id: "training_type",
      type: "radio",
      question: "What type of training?",
      options: ["Earthquake drill", "Fire drill", "Flood response", "Other"],
      required: true
    },
    {
      id: "training_usefulness",
      type: "radio",
      question: "How useful was the training?",
      options: ["Very useful", "Somewhat useful", "Not useful"],
      required: true,
      dependsOn: "training_type",
      dependsOnValue: "Earthquake drill"
    }
  ]
}
```

---

### API Response Examples

#### Successful Submission
```json
{
  "success": true,
  "responseId": 12345,
  "message": "Survey submitted successfully",
  "questionnaireId": "BB-2024-0001",
  "timestamp": "2024-11-16T10:30:00Z"
}
```

#### Duplicate Error
```json
{
  "success": false,
  "error": "Duplicate survey number: BB-2024-0001 already exists",
  "code": "DUPLICATE_SURVEY"
}
```

#### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "respondentDemographics.educationalAttainment",
      "message": "Educational attainment is required"
    }
  ]
}
```

---

## Contact & Support

**Technical Issues**: Contact system administrator
**Survey Questions**: Refer to survey manual
**Feature Requests**: Submit via project management system
**Bug Reports**: Use issue tracking system

---

**Document Version**: 1.0  
**Last Updated**: November 16, 2024  
**Author**: System Documentation Team  
**Status**: Complete

