# CPAP Service Layer Implementation

## Overview

The CPAP (Citizen Priority Action Plan) service layer has been successfully implemented to provide comprehensive business logic for managing action plans within the PULSE system.

## Files Created

### 1. Type Definitions (`src/types/cpap.ts`)

Defines all TypeScript interfaces and types for the CPAP module:

- **CPAPStatus**: Enum type for CPAP statuses (Draft, Submitted, Approved, Revision_Requested)
- **CPAP**: Main CPAP interface with all fields and relations
- **CPAPItem**: Individual action item interface
- **CPAPItemInput**: Input type for creating/updating items
- **ProgressUpdate**: Type for updating progress on approved items
- **CPAPFilters**: Filtering options for listing CPAPs
- **ValidationResult**: Validation result structure
- **CPAPListItem**: Simplified CPAP data for list views
- **AISuggestion**: AI-generated suggestion structure
- **AISuggestionsResponse**: Grouped AI suggestions (short/medium/long-term)
- **AISuggestionsMetadata**: Metadata about AI suggestion generation

### 2. CPAP Service (`src/lib/services/cpap.service.ts`)

Comprehensive service class with the following methods:

#### Core CRUD Operations (Subtask 3.1)

1. **getOrCreateCPAP(barangayId, cycleId?)**
   - Retrieves existing CPAP or creates new one with Draft status
   - Automatically uses active cycle if not specified
   - Returns CPAP with all items and relations

2. **listCPAPs(userId, userRole, userBarangayId, filters?)**
   - Lists CPAPs with role-based filtering
   - ADMIN users see all CPAPs
   - OFFICER users see only their barangay's CPAPs
   - Supports filtering by status, cycle, barangay, and search

3. **updateCPAPItems(cpapId, items, deletedItemIds?)**
   - Adds new items, updates existing items, and deletes items
   - Only works in Draft or Revision_Requested status
   - Returns updated CPAP with all items

4. **calculateProgress(cpapId)**
   - Calculates completion percentage based on items with progress updates
   - Returns percentage (0-100)

5. **getCPAPById(cpapId)**
   - Retrieves a specific CPAP with all details
   - Includes barangay and cycle information

#### Workflow Methods (Subtask 3.2)

1. **submitCPAP(cpapId)**
   - Validates CPAP has items with complete required fields
   - Transitions status from Draft/Revision_Requested to Submitted
   - Records submission timestamp

2. **approveCPAP(cpapId, comments?)**
   - Transitions status from Submitted to Approved
   - Records approval timestamp
   - Stores optional admin comments

3. **requestRevision(cpapId, comments)**
   - Transitions status from Submitted to Revision_Requested
   - Requires admin comments explaining needed changes
   - Stores comments for OFFICER to view

4. **updateProgress(cpapId, progressUpdates)**
   - Updates progress fields on approved CPAP items
   - Only updates actual_output, accomplishment_status, and remarks
   - Only works in Approved status
   - Returns updated CPAP

#### AI Suggestion Generation (Subtask 3.3)

1. **generateAISuggestions(barangayId, cycleId)**
   - Fetches funnel analysis data from ML API
   - Extracts recommendations from all service areas
   - Groups suggestions by timeline (short/medium/long-term)
   - Generates contextual success indicators
   - Returns structured suggestions with metadata

2. **fetchFunnelAnalysis(barangayId, cycleId)** (private)
   - Calls ML funnel analysis API endpoint
   - Retrieves service-specific recommendations
   - Handles API errors gracefully

3. **generateSuccessIndicator(recommendation, serviceArea)** (private)
   - Generates contextual success indicators based on recommendation text
   - Provides measurable outcomes for each action

## Integration Points

### Database Integration
- Uses Supabase Admin client for all database operations
- Leverages existing Prisma schema for CPAP and CPAPItem models
- Maintains referential integrity with Barangay and SurveyCycle tables

### ML Integration
- Integrates with existing ML funnel analysis API (`/api/ml/funnel-analysis`)
- Transforms ML recommendations into actionable CPAP items
- Provides timeline-based grouping (short/medium/long-term)

### Utility Integration
- Uses `getActiveCycleId()` from surveyCycleHelpers for default cycle selection
- Follows existing service patterns (similar to CycleAwardsService)

## Status Workflow

```
Draft → Submitted → Approved
  ↓         ↓
  ↓    Revision_Requested
  ↓         ↓
  └─────────┘
```

### Status Transitions

- **Draft**: Initial state, fully editable
- **Submitted**: Awaiting admin review, read-only for OFFICER
- **Approved**: Approved by admin, only progress fields editable
- **Revision_Requested**: Returned for changes, fully editable again

## Role-Based Access

### OFFICER Users
- Can create and edit CPAPs for their assigned barangay
- Can submit CPAPs for review
- Can update progress on approved CPAPs
- Can only see their own barangay's CPAPs

### ADMIN Users
- Can view all CPAPs across all barangays
- Can approve or request revisions on submitted CPAPs
- Can monitor progress across all barangays
- Cannot edit CPAP items directly

## Validation Rules

### Submission Validation
- Must have at least one item
- All items must have complete required fields:
  - priority_area
  - target_output
  - success_indicator
  - responsible_person
  - timeline_start
  - timeline_end

### Status-Based Validation
- Items can only be edited in Draft or Revision_Requested status
- Progress can only be updated in Approved status
- Submission only allowed from Draft or Revision_Requested
- Approval only allowed from Submitted
- Revision request only allowed from Submitted

## Error Handling

All methods include comprehensive error handling:
- Database errors are caught and logged
- Validation errors throw descriptive messages
- Status transition errors are prevented
- Missing data errors are handled gracefully

## Next Steps

The following components need to be implemented to complete the CPAP module:

1. **Validation Service** (Task 4) - Additional validation logic
2. **Permission Service** (Task 5) - Authorization checks
3. **Notification Service Extensions** (Task 6) - Status change notifications
4. **API Endpoints** (Task 7) - REST API routes
5. **UI Components** (Tasks 9-10) - OFFICER and ADMIN interfaces

## Testing

Unit tests should be created to verify:
- CRUD operations work correctly
- Status transitions follow rules
- Role-based filtering works
- Validation catches errors
- AI suggestions are properly formatted
- Progress calculations are accurate

## Usage Example

```typescript
import CPAPService from '@/lib/services/cpap.service';

// Get or create CPAP for a barangay
const cpap = await CPAPService.getOrCreateCPAP(17, 1);

// Add items to CPAP
const updatedCPAP = await CPAPService.updateCPAPItems(cpap.id, [
  {
    priority_area: 'Financial Administration',
    target_output: 'Launch information campaign',
    success_indicator: 'Increased awareness by 80%',
    responsible_person: 'Barangay Captain',
    timeline_start: '2024-01-01',
    timeline_end: '2024-03-31'
  }
]);

// Submit for review
await CPAPService.submitCPAP(cpap.id);

// Generate AI suggestions
const { suggestions, metadata } = await CPAPService.generateAISuggestions(17, 1);
```

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 1.3**: Get or create CPAP for barangay and cycle
- **Requirement 2.5**: Save CPAP changes within 2 seconds
- **Requirement 3.4**: Submit CPAP with validation
- **Requirement 5.3**: Approve CPAP with timestamp
- **Requirement 5.5**: Request revision with comments
- **Requirement 6.5**: Resubmit after revision
- **Requirement 7.4**: Update progress on approved CPAPs
- **Requirement 12.1**: Integration with survey cycles
- **Requirement 12.2**: Integration with barangays
- **Requirement 2A.1**: Generate AI suggestions from survey data
- **Requirement 2A.2**: Format AI suggestions as CPAP items
