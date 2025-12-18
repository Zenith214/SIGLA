# Design Document

## Overview

This design document outlines the technical architecture for upgrading the SIGLA Survey System to implement the official DILG CSIS Digital Methodology (v4.0). The upgrade replaces custom survey logic with standardized CSIS algorithms while maintaining backward compatibility with existing features including Field Supervisor roles, Spot-Based Workflows, and Multi-Visit/Callback functionality.

### Key Changes

1. **Algorithm A**: Replace 3-section odd/even logic with 6-section CSIS randomization using a 150-entry lookup table
2. **Algorithm B**: Replace modulo-based respondent selection with official 12x10 Kish Grid matrix
3. **Questionnaire Type Deprecation**: Remove stored `questionnaireType` field and calculate gender requirements dynamically
4. **Six-Section Navigation**: Extend question flow to handle all six service areas in randomized order
5. **GPS Verification**: Move GPS capture from initialization to household confirmation for quality control

## Architecture

### System Context

The SIGLA system operates as a Progressive Web Application (PWA) with offline-first capabilities. Survey data flows through three primary layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     Field Interviewer UI                     │
│  (React Components + IndexedDB for Offline Storage)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Survey Logic Layer                         │
│  • CSIS Randomization (Algorithm A)                         │
│  • Kish Grid Selection (Algorithm B)                        │
│  • Section Navigation                                        │
│  • GPS Verification                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Persistence Layer                     │
│  • IndexedDB (Offline)                                       │
│  • Supabase PostgreSQL (Online Sync)                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture


The upgrade affects the following components:

```
src/app/survey/forms/
├── utils/
│   ├── sectionAssignment.ts          [MAJOR REFACTOR]
│   ├── kishGrid.ts                   [NEW FILE]
│   └── gpsVerification.ts            [NEW FILE]
├── sections/
│   ├── respondent-selection.tsx      [MAJOR REFACTOR]
│   ├── survey-initialization.tsx     [REFACTOR]
│   └── question-flow.tsx             [MINOR UPDATE]
├── components/
│   └── QuestionProgressBar.tsx       [UPDATE]
└── page.tsx                          [REFACTOR]
```

## Components and Interfaces

### 1. CSIS Randomization Module

**File**: `src/app/survey/forms/utils/sectionAssignment.ts`

**Purpose**: Implements Algorithm A for service area order randomization

**Data Structures**:

```typescript
// Complete 150-entry randomization map (CSIS Annex I)
const CSIS_RANDOMIZATION_MAP: Record<number, string> = {
  1: 'financial',
  2: 'disaster',
  3: 'social',
  4: 'safety',
  5: 'business',
  6: 'environmental',
  // ... entries 7-150 following official CSIS table
}

// Canonical section order for rotation
const CANONICAL_SECTION_ORDER = [
  "financial",
  "disaster", 
  "social",
  "safety",
  "business",
  "environmental"
] as const
```

**Key Functions**:

```typescript
/**
 * Get randomized section order based on questionnaire number
 * Replaces getServiceAreaOrder() which only returned 3 sections
 */
function getSectionOrder(questionnaireNumber: number): string[] {
  // 1. Look up starting section from randomization map
  const startingSection = CSIS_RANDOMIZATION_MAP[questionnaireNumber]
  
  // 2. Find index in canonical order
  const startIndex = CANONICAL_SECTION_ORDER.indexOf(startingSection)
  
  // 3. Rotate array to start from that section
  return [
    ...CANONICAL_SECTION_ORDER.slice(startIndex),
    ...CANONICAL_SECTION_ORDER.slice(0, startIndex)
  ]
}
```


**Migration Strategy**:

- Deprecate `ODD_SECTIONS` and `EVEN_SECTIONS` constants
- Update `getAssignedSections()` to call `getSectionOrder()` internally
- Maintain backward compatibility for existing utility functions
- Update all call sites to expect 6 sections instead of 3

### 2. Kish Grid Selection Module

**File**: `src/app/survey/forms/utils/kishGrid.ts` (NEW)

**Purpose**: Implements Algorithm B for standardized respondent selection

**Data Structures**:

```typescript
// Official CSIS Kish Grid (12 rows × 10 columns)
const KISH_GRID_TABLE: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],           // 1 eligible member
  [1, 2, 1, 1, 2, 2, 1, 1, 2, 2],           // 2 eligible members
  [1, 2, 3, 1, 2, 3, 1, 2, 3, 1],           // 3 eligible members
  [1, 2, 3, 4, 1, 2, 3, 4, 1, 2],           // 4 eligible members
  [1, 2, 3, 4, 5, 1, 2, 3, 4, 5],           // 5 eligible members
  [1, 2, 3, 4, 5, 6, 1, 2, 3, 4],           // 6 eligible members
  [1, 2, 3, 4, 5, 6, 7, 1, 2, 3],           // 7 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 1, 2],           // 8 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 1],           // 9 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],          // 10 eligible members
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],          // 11 eligible members (capped at 10)
  [1, 3, 7, 5, 6, 4, 8, 10, 12, 9]          // 12+ eligible members
]

interface HouseholdMember {
  name: string
  birthdate: string
  gender: string
  age?: number
}

interface KishGridResult {
  selectedMember: HouseholdMember
  selectedIndex: number
  lookupRow: number
  lookupColumn: number
  gridValue: number
}
```

**Key Functions**:

```typescript
/**
 * Select respondent using CSIS Kish Grid methodology
 * Replaces simple modulo logic in respondent-selection.tsx
 */
function selectRespondentKishGrid(
  questionnaireNumber: number,
  eligibleMembers: HouseholdMember[]
): KishGridResult {
  // Validate inputs
  if (eligibleMembers.length === 0) {
    throw new Error('NO_QUALIFIED_RESPONDENT')
  }
  
  // 1. Calculate lookup column (1-10)
  let col = questionnaireNumber % 10
  if (col === 0) col = 10
  
  // 2. Calculate lookup row (1-12, capped)
  let row = eligibleMembers.length
  if (row > 12) row = 12
  
  // 3. Retrieve selection index from grid (1-based)
  const gridValue = KISH_GRID_TABLE[row - 1][col - 1]
  
  // 4. Select member (convert to 0-based array index)
  const selectedMember = eligibleMembers[gridValue - 1]
  
  return {
    selectedMember,
    selectedIndex: gridValue - 1,
    lookupRow: row,
    lookupColumn: col,
    gridValue
  }
}
```


**Integration Points**:

- Update `RespondentSelection` component to use `selectRespondentKishGrid()`
- Remove existing modulo-based selection logic
- Update `KishGridDisplay` component to show the full 12x10 matrix
- Maintain existing household member enumeration UI

### 3. GPS Verification Module

**File**: `src/app/survey/forms/utils/gpsVerification.ts` (NEW)

**Purpose**: Calculate distance between assigned spot and actual interview location

**Data Structures**:

```typescript
interface GPSCoordinates {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

interface GPSVerificationResult {
  distanceMeters: number
  withinThreshold: boolean
  flagForReview: boolean
  assignedLocation: GPSCoordinates
  actualLocation: GPSCoordinates
}

interface GPSVerificationConfig {
  thresholdMeters: number  // Default: 200
}
```

**Key Functions**:

```typescript
/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
function calculateDistance(
  coord1: GPSCoordinates,
  coord2: GPSCoordinates
): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = coord1.lat * Math.PI / 180
  const φ2 = coord2.lat * Math.PI / 180
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

/**
 * Verify GPS location against assigned spot
 */
function verifyGPSLocation(
  assignedSpot: GPSCoordinates,
  actualLocation: GPSCoordinates,
  config: GPSVerificationConfig = { thresholdMeters: 200 }
): GPSVerificationResult {
  const distanceMeters = calculateDistance(assignedSpot, actualLocation)
  const withinThreshold = distanceMeters <= config.thresholdMeters
  
  return {
    distanceMeters: Math.round(distanceMeters),
    withinThreshold,
    flagForReview: !withinThreshold,
    assignedLocation: assignedSpot,
    actualLocation
  }
}
```


### 4. Respondent Selection Component Updates

**File**: `src/app/survey/forms/sections/respondent-selection.tsx`

**Changes Required**:

1. **Import Kish Grid Module**:
```typescript
import { selectRespondentKishGrid } from '../utils/kishGrid'
```

2. **Remove Questionnaire Type Logic**:
```typescript
// REMOVE: const isOdd = lastDigit % 2 !== 0
// REMOVE: const selectedIndex = lastDigit % eligibleMembers.length

// REPLACE WITH: Dynamic gender calculation
const questionnaireNumber = extractQuestionnaireNumber(surveyNumber)
const isOdd = questionnaireNumber % 2 !== 0
const requiredGender = isOdd ? "Male" : "Female"
```

3. **Update Respondent Selection**:
```typescript
const selectRespondent = () => {
  // Filter eligible members (age 18+)
  const eligibleMembers = householdMembers.filter(member => {
    const age = calculateAge(member.birthdate)
    return age >= 18 && member.name.trim() && member.gender && member.birthdate
  })

  if (eligibleMembers.length === 0) {
    alert("No eligible household members found...")
    return
  }

  // Extract questionnaire number
  const questionnaireNumber = extractQuestionnaireNumber(surveyNumber)
  
  // Use Kish Grid selection
  try {
    const result = selectRespondentKishGrid(questionnaireNumber, eligibleMembers)
    
    setEligibleMembers(eligibleMembers)
    setSelectedIndex(result.selectedIndex)
    setSelectedRespondent({
      number: result.selectedIndex + 1,
      name: result.selectedMember.name,
      birthdate: result.selectedMember.birthdate,
      age: calculateAge(result.selectedMember.birthdate),
      gender: result.selectedMember.gender
    })
    setShowModal(true)
  } catch (error) {
    if (error.message === 'NO_QUALIFIED_RESPONDENT') {
      alert("No qualified respondent available")
    } else {
      throw error
    }
  }
}
```

4. **Helper Function**:
```typescript
/**
 * Extract numeric questionnaire number from full survey number
 * Handles formats: "BB-2024-0001" → 1, "123" → 123
 */
function extractQuestionnaireNumber(surveyNumber: string): number {
  if (surveyNumber.includes('-')) {
    const parts = surveyNumber.split('-')
    if (parts.length === 3) {
      return parseInt(parts[2], 10)
    }
  }
  return parseInt(surveyNumber, 10)
}
```


### 5. Survey Initialization Component Updates

**File**: `src/app/survey/forms/sections/survey-initialization.tsx`

**Changes Required**:

1. **Remove GPS Capture from Initialization**:
```typescript
// REMOVE: Auto-capture location on mount
// REMOVE: useEffect for automatic location capture
// REMOVE: handleLocationCapture() calls

// KEEP: Location input UI for manual entry (optional)
// KEEP: Map selection functionality (optional)
```

2. **Simplify Initialization Flow**:
```typescript
const handleNext = async () => {
  // Generate questionnaire number
  const result = await generateQuestionnaireNumber()
  if (!result) return

  // Store the number (no location required here)
  onUpdate("surveyNumber", result.surveyNumber)
  onNext()
}
```

3. **Update API Call**:
```typescript
// Remove 'type' field from response handling
const response = await fetch('/api/questionnaire-number', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ barangayId: barangayIdToUse })
})

const responseData = await response.json()
const surveyNumber = responseData.surveyNumber // BB-YYYY-NNNN
// No longer need: const type = responseData.type
```

### 6. GPS Capture in Respondent Selection

**File**: `src/app/survey/forms/sections/respondent-selection.tsx`

**New Feature**: Add GPS capture before Kish Grid

**Implementation**:

```typescript
const [gpsLocation, setGpsLocation] = useState<GPSCoordinates | null>(null)
const [gpsStatus, setGpsStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle')
const { getLocation } = useGeotagging(false)

// Add GPS capture button before household enumeration
const captureGPSLocation = async () => {
  setGpsStatus('capturing')
  try {
    const locationData = await getLocation({
      enableHighAccuracy: true,
      timeout: 15000,
      requireAddress: false // Don't need address, just coordinates
    })
    
    const gpsCoords = {
      lat: locationData.latitude,
      lng: locationData.longitude,
      accuracy: locationData.accuracy,
      timestamp: locationData.timestamp
    }
    
    setGpsLocation(gpsCoords)
    setGpsStatus('success')
    
    // Save to survey data
    onUpdate("verificationLocation", gpsCoords)
  } catch (error) {
    setGpsStatus('error')
    console.error('GPS capture failed:', error)
  }
}
```


### 7. Question Flow Component Updates

**File**: `src/app/survey/forms/sections/question-flow.tsx`

**Changes Required**:

1. **Accept Full Section List**:
```typescript
interface QuestionFlowProps {
  sectionId: string
  data: SurveyData
  onUpdate: (section: keyof SurveyData, data: any) => void
  onComplete: () => void
  onBack: () => void
  onResetSectionStatus: (sectionId: string, status: string) => void
  assignedSections?: string[] // NEW: Full list of 6 sections
}
```

2. **Update Progress Calculation**:
```typescript
// Calculate progress based on all 6 assigned sections
const totalSections = assignedSections?.length || 6
const currentSectionIndex = assignedSections?.indexOf(sectionId) || 0
const progressPercentage = ((currentSectionIndex + 1) / totalSections) * 100
```

### 8. Main Survey Page Updates

**File**: `src/app/survey/forms/page.tsx`

**Changes Required**:

1. **Remove questionnaireType from SurveyData Interface**:
```typescript
export interface SurveyData {
  surveyNumber: string
  // REMOVE: questionnaireType?: 'odd' | 'even'
  assignedSections?: string[] // Keep this for tracking
  barangayId?: number
  location: { /* ... */ }
  verificationLocation?: GPSCoordinates // NEW: GPS captured at household
  // ... rest of fields
}
```

2. **Update Section Assignment Logic**:
```typescript
useEffect(() => {
  if (surveyData.surveyNumber && surveyData.surveyNumber !== "PENDING") {
    // Extract questionnaire number
    const questionnaireNumber = extractQuestionnaireNumber(surveyData.surveyNumber)
    
    // Get all 6 sections in randomized order
    const assignedSectionIds = getSectionOrder(questionnaireNumber)
    
    // Update survey data
    setSurveyData(prev => ({ 
      ...prev, 
      assignedSections: assignedSectionIds
    }))
    
    // Build sections array with all 6 sections
    const newSections: SectionStatus[] = [
      { id: "initialization", name: "Survey Initialization", status: "completed" },
      { id: "respondent-selection", name: "Respondent Selection", status: "pending" },
      { id: "respondent-demographics", name: "Respondent Demographics", status: "pending" },
      ...assignedSectionIds.map(id => ({
        id,
        name: getSectionName(id),
        status: "pending" as const
      })),
      { id: "summary", name: "Summary & Review", status: "pending" }
    ]
    
    setSections(newSections)
  }
}, [surveyData.surveyNumber])
```


3. **Update Navigation Logic**:
```typescript
// Navigate through all 6 assigned sections
case "respondent-demographics":
  return (
    <RespondentDemographics
      data={surveyData}
      onUpdate={updateSurveyData}
      onNext={() => {
        // Go to first assigned section
        const firstSection = surveyData.assignedSections?.[0] || "summary"
        handleSectionComplete("respondent-demographics", firstSection)
      }}
      onBack={() => setCurrentSection("respondent-selection")}
    />
  )

// Service section cases
case "financial":
case "disaster":
case "safety":
case "social":
case "business":
case "environmental":
  return (
    <QuestionFlow
      sectionId={currentSection}
      data={surveyData}
      onUpdate={updateSurveyData}
      onComplete={() => {
        // Find next section in assigned order
        const currentIndex = surveyData.assignedSections?.indexOf(currentSection) || 0
        const nextSection = surveyData.assignedSections?.[currentIndex + 1] || "summary"
        handleSectionComplete(currentSection, nextSection)
      }}
      onBack={() => {
        // Go to previous section in assigned order
        const currentIndex = surveyData.assignedSections?.indexOf(currentSection) || 0
        const prevSection = currentIndex > 0 
          ? surveyData.assignedSections?.[currentIndex - 1]
          : "respondent-demographics"
        setCurrentSection(prevSection || "respondent-demographics")
      }}
      assignedSections={surveyData.assignedSections}
    />
  )
```

### 9. Progress Bar Component Updates

**File**: `src/app/survey/forms/components/QuestionProgressBar.tsx`

**Changes Required**:

```typescript
interface QuestionProgressBarProps {
  currentQuestionIndex: number
  totalQuestions: number
  currentSectionIndex: number
  totalSections: number // Update to reflect 6 sections
  sectionName: string
}

// Update display to show "Section X of 6"
<div className="text-sm text-gray-600">
  Section {currentSectionIndex + 1} of {totalSections}
</div>
```


### 10. Supervisor Dashboard GPS Verification

**File**: `src/components/supervisor/InterviewMapView.tsx` (NEW)

**Purpose**: Display GPS verification for submitted interviews

**Implementation**:

```typescript
interface InterviewMapViewProps {
  surveyResponse: {
    id: number
    questionnaireId: string
    assignedSpot: GPSCoordinates
    verificationLocation: GPSCoordinates
  }
  verificationThreshold?: number
}

export function InterviewMapView({ 
  surveyResponse, 
  verificationThreshold = 200 
}: InterviewMapViewProps) {
  const [map, setMap] = useState<any>(null)
  const [verification, setVerification] = useState<GPSVerificationResult | null>(null)

  useEffect(() => {
    if (!surveyResponse.assignedSpot || !surveyResponse.verificationLocation) return

    // Calculate verification
    const result = verifyGPSLocation(
      surveyResponse.assignedSpot,
      surveyResponse.verificationLocation,
      { thresholdMeters: verificationThreshold }
    )
    setVerification(result)

    // Initialize map with both pins
    const L = window.L
    const mapInstance = L.map('interview-map').setView([
      surveyResponse.assignedSpot.lat,
      surveyResponse.assignedSpot.lng
    ], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)

    // Blue pin: Assigned spot
    const blueIcon = L.icon({
      iconUrl: '/icons/pin-blue.png',
      iconSize: [32, 32]
    })
    L.marker([surveyResponse.assignedSpot.lat, surveyResponse.assignedSpot.lng], {
      icon: blueIcon
    }).addTo(mapInstance).bindPopup('Assigned Spot')

    // Green pin: Actual location
    const greenIcon = L.icon({
      iconUrl: '/icons/pin-green.png',
      iconSize: [32, 32]
    })
    L.marker([surveyResponse.verificationLocation.lat, surveyResponse.verificationLocation.lng], {
      icon: greenIcon
    }).addTo(mapInstance).bindPopup('Interview Location')

    // Draw line between points
    L.polyline([
      [surveyResponse.assignedSpot.lat, surveyResponse.assignedSpot.lng],
      [surveyResponse.verificationLocation.lat, surveyResponse.verificationLocation.lng]
    ], {
      color: result.withinThreshold ? 'green' : 'red',
      weight: 2,
      dashArray: '5, 10'
    }).addTo(mapInstance)

    setMap(mapInstance)
  }, [surveyResponse])

  return (
    <div className="space-y-4">
      <div id="interview-map" className="w-full h-96 rounded-lg border" />
      
      {verification && (
        <div className={`p-4 rounded-lg ${
          verification.withinThreshold ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        } border`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">GPS Verification</h4>
              <p className="text-sm text-gray-600">
                Distance: {verification.distanceMeters}m
              </p>
            </div>
            {verification.flagForReview && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Flagged for Review
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```


## Data Models

### Updated SurveyData Interface

```typescript
export interface SurveyData {
  surveyNumber: string                    // Format: BB-YYYY-NNNN
  assignedSections: string[]              // All 6 sections in randomized order
  barangayId?: number
  
  // REMOVED: questionnaireType?: 'odd' | 'even'
  
  location: {                             // Initial location (optional now)
    lat: number
    lng: number
    address: string
    accuracy?: number
    timestamp?: number
    barangay?: string
    municipality?: string
    province?: string
  }
  
  verificationLocation?: {                // NEW: GPS captured at household
    lat: number
    lng: number
    accuracy?: number
    timestamp?: number
  }
  
  selectedMember: string
  respondentDemographics: {
    age: number
    birthdate: string
    gender: string
    educationalAttainment: string
    householdIncome: string
    purok: string
  }
  
  // All 6 service sections
  financialAdmin: Record<string, any>
  disasterPrep: Record<string, any>
  safetyPeace: Record<string, any>
  businessFriendly: Record<string, any>
  environmental: Record<string, any>
  socialProtection: Record<string, any>
}
```

### Database Schema Updates

**Table**: `survey_responses`

```sql
-- Add new column for verification location
ALTER TABLE survey_responses 
ADD COLUMN verification_location JSONB;

-- Add column for GPS verification status
ALTER TABLE survey_responses
ADD COLUMN gps_verification_status VARCHAR(20) DEFAULT 'pending';

-- Add column for distance from assigned spot
ALTER TABLE survey_responses
ADD COLUMN gps_distance_meters INTEGER;

-- Add index for flagged interviews
CREATE INDEX idx_survey_responses_gps_flagged 
ON survey_responses(gps_verification_status) 
WHERE gps_verification_status = 'flagged';
```

**Migration Script**: `database/add-gps-verification-fields.sql`


## Error Handling

### 1. Kish Grid Errors

**Scenario**: No eligible household members

```typescript
try {
  const result = selectRespondentKishGrid(questionnaireNumber, eligibleMembers)
} catch (error) {
  if (error.message === 'NO_QUALIFIED_RESPONDENT') {
    // Show user-friendly message
    showAlert({
      type: 'warning',
      title: 'No Qualified Respondent',
      message: 'All household members must be 18 years or older. Please verify ages and try again.'
    })
  }
}
```

**Scenario**: Invalid questionnaire number

```typescript
if (questionnaireNumber < 1 || questionnaireNumber > 150) {
  throw new Error('INVALID_QUESTIONNAIRE_NUMBER')
}
```

### 2. GPS Verification Errors

**Scenario**: GPS capture fails

```typescript
try {
  const location = await getLocation({ timeout: 15000 })
} catch (error) {
  // Allow manual skip with warning
  showAlert({
    type: 'warning',
    title: 'GPS Capture Failed',
    message: 'Unable to capture GPS location. Interview will be flagged for manual review.',
    actions: [
      { label: 'Retry', onClick: () => captureGPSLocation() },
      { label: 'Continue Without GPS', onClick: () => proceedWithoutGPS() }
    ]
  })
}
```

**Scenario**: Missing assigned spot data

```typescript
if (!assignedSpot || !assignedSpot.lat || !assignedSpot.lng) {
  console.warn('No assigned spot data available for GPS verification')
  // Skip verification but log warning
  return {
    distanceMeters: null,
    withinThreshold: null,
    flagForReview: true,
    reason: 'MISSING_ASSIGNED_SPOT'
  }
}
```

### 3. Section Navigation Errors

**Scenario**: Invalid section in assigned list

```typescript
const validSections = ['financial', 'disaster', 'social', 'safety', 'business', 'environmental']

if (!validSections.includes(sectionId)) {
  console.error(`Invalid section ID: ${sectionId}`)
  // Redirect to summary
  setCurrentSection('summary')
  return
}
```

### 4. Randomization Map Errors

**Scenario**: Questionnaire number not in map

```typescript
function getSectionOrder(questionnaireNumber: number): string[] {
  if (questionnaireNumber < 1 || questionnaireNumber > 150) {
    console.error(`Questionnaire number ${questionnaireNumber} out of range`)
    // Fallback to default order
    return CANONICAL_SECTION_ORDER
  }
  
  const startingSection = CSIS_RANDOMIZATION_MAP[questionnaireNumber]
  
  if (!startingSection) {
    console.error(`No mapping found for questionnaire ${questionnaireNumber}`)
    // Fallback to default order
    return CANONICAL_SECTION_ORDER
  }
  
  // ... rest of logic
}
```


## Testing Strategy

### 1. Unit Tests

**File**: `src/app/survey/forms/utils/__tests__/kishGrid.test.ts`

```typescript
describe('Kish Grid Selection', () => {
  test('selects correct respondent for questionnaire #1 with 3 members', () => {
    const members = [
      { name: 'Alice', birthdate: '1980-01-01', gender: 'Female' },
      { name: 'Bob', birthdate: '1975-05-15', gender: 'Male' },
      { name: 'Charlie', birthdate: '1990-12-20', gender: 'Male' }
    ]
    
    const result = selectRespondentKishGrid(1, members)
    
    expect(result.lookupColumn).toBe(1)
    expect(result.lookupRow).toBe(3)
    expect(result.gridValue).toBe(1)
    expect(result.selectedMember.name).toBe('Alice')
  })
  
  test('handles 12+ members by capping at row 12', () => {
    const members = Array.from({ length: 15 }, (_, i) => ({
      name: `Member ${i + 1}`,
      birthdate: '1980-01-01',
      gender: i % 2 === 0 ? 'Male' : 'Female'
    }))
    
    const result = selectRespondentKishGrid(10, members)
    
    expect(result.lookupRow).toBe(12) // Capped
    expect(result.lookupColumn).toBe(10)
  })
  
  test('throws error for empty member list', () => {
    expect(() => {
      selectRespondentKishGrid(1, [])
    }).toThrow('NO_QUALIFIED_RESPONDENT')
  })
})
```

**File**: `src/app/survey/forms/utils/__tests__/sectionAssignment.test.ts`

```typescript
describe('CSIS Section Randomization', () => {
  test('returns all 6 sections in correct order for questionnaire #1', () => {
    const sections = getSectionOrder(1)
    
    expect(sections).toHaveLength(6)
    expect(sections[0]).toBe('financial') // Starting section per CSIS table
  })
  
  test('rotates sections correctly for questionnaire #2', () => {
    const sections = getSectionOrder(2)
    
    expect(sections).toHaveLength(6)
    expect(sections[0]).toBe('disaster') // Starting section per CSIS table
  })
  
  test('handles edge case questionnaire #150', () => {
    const sections = getSectionOrder(150)
    
    expect(sections).toHaveLength(6)
    expect(sections[0]).toBe('environmental')
  })
  
  test('returns default order for invalid questionnaire number', () => {
    const sections = getSectionOrder(999)
    
    expect(sections).toEqual(CANONICAL_SECTION_ORDER)
  })
})
```


### 2. Integration Tests

**File**: `tests/integration/survey-flow.test.ts`

```typescript
describe('Complete Survey Flow with CSIS Methodology', () => {
  test('completes full survey with 6 sections', async () => {
    // 1. Initialize survey
    const { surveyNumber } = await initializeSurvey({ barangayId: 1 })
    expect(surveyNumber).toMatch(/BB-\d{4}-\d{4}/)
    
    // 2. Select respondent using Kish Grid
    const members = createTestHouseholdMembers(5)
    const { selectedMember } = await selectRespondent(surveyNumber, members)
    expect(selectedMember).toBeDefined()
    
    // 3. Complete demographics
    await completeDemographics(surveyNumber, { age: 35, gender: 'Male' })
    
    // 4. Get assigned sections (should be 6)
    const sections = await getAssignedSections(surveyNumber)
    expect(sections).toHaveLength(6)
    
    // 5. Complete all 6 sections
    for (const section of sections) {
      await completeSection(surveyNumber, section.id, createTestAnswers())
    }
    
    // 6. Submit survey
    const response = await submitSurvey(surveyNumber)
    expect(response.status).toBe('success')
  })
  
  test('GPS verification flags interview beyond threshold', async () => {
    const assignedSpot = { lat: 14.5995, lng: 120.9842 }
    const actualLocation = { lat: 14.6020, lng: 120.9870 } // ~300m away
    
    const verification = verifyGPSLocation(assignedSpot, actualLocation, {
      thresholdMeters: 200
    })
    
    expect(verification.distanceMeters).toBeGreaterThan(200)
    expect(verification.flagForReview).toBe(true)
  })
})
```

### 3. End-to-End Tests

**File**: `tests/e2e/survey-workflow.spec.ts`

```typescript
describe('Survey Workflow E2E', () => {
  test('FI completes survey with all 6 sections', async ({ page }) => {
    // Login as FI
    await page.goto('/login')
    await page.fill('[name="email"]', 'fi@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Start survey
    await page.goto('/survey/forms?barangayId=1')
    
    // Wait for questionnaire number generation
    await page.click('button:has-text("Continue to Survey")')
    await page.waitForSelector('text=/BB-\\d{4}-\\d{4}/')
    
    // Enumerate household
    await page.fill('[name="numberOfMembers"]', '3')
    await page.fill('[name="member-0-name"]', 'John Doe')
    await page.fill('[name="member-0-birthdate"]', '1980-01-01')
    await page.selectOption('[name="member-0-gender"]', 'Male')
    
    // Select respondent
    await page.click('button:has-text("Select Respondent")')
    await page.waitForSelector('text=Selected Respondent')
    await page.click('button:has-text("Confirm & Continue")')
    
    // Complete demographics
    await page.fill('[name="educationalAttainment"]', 'College Graduate')
    await page.click('button:has-text("Next")')
    
    // Verify 6 sections appear in sidebar
    const sections = await page.locator('.section-card .section-item').count()
    expect(sections).toBe(6)
    
    // Complete all sections
    for (let i = 0; i < 6; i++) {
      await completeSection(page)
      await page.click('button:has-text("Next Section")')
    }
    
    // Submit
    await page.click('button:has-text("Submit Survey")')
    await page.waitForSelector('text=Survey submitted successfully')
  })
})
```


### 4. Manual Testing Checklist

**Kish Grid Validation**:
- [ ] Test with 1 eligible member (should always select that member)
- [ ] Test with 2-12 eligible members (verify correct grid lookup)
- [ ] Test with 12+ eligible members (verify row capping at 12)
- [ ] Test with questionnaire numbers 1-10 (verify column calculation)
- [ ] Test with questionnaire numbers ending in 0 (verify column = 10)
- [ ] Verify selected member matches expected grid value

**Section Randomization Validation**:
- [ ] Test questionnaire #1 (verify starting section per CSIS table)
- [ ] Test questionnaire #50 (verify mid-range randomization)
- [ ] Test questionnaire #150 (verify end-range randomization)
- [ ] Verify all 6 sections appear in correct rotated order
- [ ] Verify section order persists across page refreshes
- [ ] Verify progress bar shows "Section X of 6"

**GPS Verification Validation**:
- [ ] Capture GPS at household (verify coordinates saved)
- [ ] Submit interview (verify verification calculation)
- [ ] View in supervisor dashboard (verify two pins displayed)
- [ ] Test within threshold (verify green indicator)
- [ ] Test beyond threshold (verify red indicator and flag)
- [ ] Test with missing assigned spot (verify graceful handling)

**Backward Compatibility**:
- [ ] Test with existing localStorage data (verify migration)
- [ ] Test with existing IndexedDB records (verify compatibility)
- [ ] Test callback scenarios (verify multi-visit support)
- [ ] Test offline mode (verify sync after reconnection)

## Performance Considerations

### 1. Randomization Map Loading

The 150-entry randomization map is small (~2KB) and should be:
- Defined as a constant at module level (no runtime generation)
- Tree-shaken if not used (ES modules)
- Cached by browser (static import)

### 2. Kish Grid Matrix Loading

The 12x10 matrix is tiny (~500 bytes) and should be:
- Defined as a constant array
- No performance impact on selection logic (O(1) lookup)

### 3. GPS Distance Calculation

Haversine formula is computationally inexpensive:
- Executes in <1ms on modern devices
- Can be memoized if called multiple times for same coordinates
- No external API calls required

### 4. Section Navigation

With 6 sections instead of 3:
- Slightly more DOM elements in sidebar (negligible impact)
- Progress calculations remain O(1)
- No impact on question rendering (lazy loaded per section)


## Migration Strategy

### Phase 1: Data Structure Updates (Non-Breaking)

1. Add new fields to SurveyData interface
2. Add database columns for GPS verification
3. Deploy database migrations
4. Ensure backward compatibility with existing data

### Phase 2: Algorithm Implementation (Isolated)

1. Create new utility modules (kishGrid.ts, gpsVerification.ts)
2. Update sectionAssignment.ts with new functions
3. Keep old functions for backward compatibility
4. Add comprehensive unit tests

### Phase 3: Component Updates (Gradual)

1. Update respondent-selection.tsx to use Kish Grid
2. Update survey-initialization.tsx to remove GPS capture
3. Add GPS capture to respondent-selection.tsx
4. Update question-flow.tsx for 6 sections
5. Update page.tsx navigation logic

### Phase 4: UI Updates

1. Update progress bars to show 6 sections
2. Update section cards to display all sections
3. Add GPS verification UI to supervisor dashboard
4. Update help text and instructions

### Phase 5: Testing & Validation

1. Run unit tests for all algorithms
2. Run integration tests for complete flow
3. Perform manual testing with checklist
4. Conduct user acceptance testing with FIs

### Phase 6: Deployment

1. Deploy to staging environment
2. Test with real data (non-production)
3. Train field staff on new workflow
4. Deploy to production
5. Monitor for issues

### Rollback Plan

If critical issues are discovered:

1. **Database**: Rollback migration (GPS fields are nullable, safe to remove)
2. **Code**: Revert to previous commit (feature flag can disable new logic)
3. **Data**: Existing surveys continue to work (backward compatible)

Feature flag implementation:

```typescript
const USE_CSIS_METHODOLOGY = process.env.NEXT_PUBLIC_USE_CSIS === 'true'

function getSectionOrder(questionnaireNumber: number): string[] {
  if (USE_CSIS_METHODOLOGY) {
    return getCSISSectionOrder(questionnaireNumber)
  } else {
    return getLegacySectionOrder(questionnaireNumber)
  }
}
```


## Security Considerations

### 1. GPS Data Privacy

- GPS coordinates are sensitive location data
- Store with appropriate access controls
- Only supervisors should view verification data
- Consider data retention policies

**Implementation**:
```typescript
// Row-level security in Supabase
CREATE POLICY "Supervisors can view GPS verification"
ON survey_responses
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM users WHERE role IN ('supervisor', 'admin')
  )
);
```

### 2. Questionnaire Number Validation

- Validate questionnaire numbers server-side
- Prevent manipulation of assigned sections
- Ensure sequential number generation

**Implementation**:
```typescript
// API endpoint validation
if (questionnaireNumber < 1 || questionnaireNumber > 150) {
  return res.status(400).json({ error: 'Invalid questionnaire number' })
}

// Verify number hasn't been used
const existing = await checkQuestionnaireExists(questionnaireNumber)
if (existing) {
  return res.status(409).json({ error: 'Questionnaire number already used' })
}
```

### 3. Data Integrity

- Ensure Kish Grid selection cannot be manipulated
- Validate all household member data
- Prevent skipping required sections

**Implementation**:
```typescript
// Server-side validation
const expectedSections = getSectionOrder(questionnaireNumber)
const submittedSections = Object.keys(surveyData.sections)

if (!expectedSections.every(s => submittedSections.includes(s))) {
  return res.status(400).json({ error: 'Missing required sections' })
}
```

## Accessibility Considerations

### 1. Screen Reader Support

- Ensure Kish Grid display is accessible
- Provide text alternatives for map pins
- Announce section progress changes

### 2. Keyboard Navigation

- All GPS capture controls keyboard accessible
- Section navigation works with keyboard
- Modal dialogs trap focus appropriately

### 3. Mobile Responsiveness

- GPS capture works on mobile devices
- 6-section sidebar adapts to small screens
- Touch targets meet minimum size requirements

## Documentation Updates Required

1. **User Guide**: Update FI training materials for new workflow
2. **API Documentation**: Document new GPS verification endpoints
3. **Database Schema**: Document new columns and their purpose
4. **Algorithm Documentation**: Explain CSIS methodology implementation
5. **Troubleshooting Guide**: Add common issues and solutions

## Success Metrics

### Functional Metrics

- [ ] 100% of surveys use 6-section randomization
- [ ] 100% of respondent selections use Kish Grid
- [ ] 95%+ GPS capture success rate
- [ ] <5% interviews flagged for GPS verification issues

### Performance Metrics

- [ ] Section assignment: <10ms
- [ ] Kish Grid selection: <5ms
- [ ] GPS distance calculation: <1ms
- [ ] No increase in page load time

### Quality Metrics

- [ ] Zero data loss during migration
- [ ] Zero breaking changes for existing surveys
- [ ] 100% unit test coverage for new algorithms
- [ ] 90%+ integration test coverage

