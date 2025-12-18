# CPAP Module Integration - Design Document

## Overview

The CPAP (Citizen Priority Action Plan) Module is a new internal governance feature for the PULSE system that enables LGU officials to create action plans based on survey results and allows DILG administrators to review, approve, and monitor these plans. The module implements a structured workflow: OFFICER users create and submit CPAPs, ADMIN users review and approve them, and OFFICER users track implementation progress.

This design integrates seamlessly with the existing PULSE architecture, leveraging the current authentication system, role-based access control, database infrastructure, and Next.js application structure. The VIEWER role will be renamed to OFFICER to reflect governance responsibilities.

### Key Design Principles

1. **Internal-Only Access**: No public-facing components; all features require authentication
2. **Role-Based Workflow**: Clear separation of responsibilities between OFFICER and ADMIN users
3. **Cycle-Aware**: CPAPs are scoped to specific survey cycles and barangays
4. **Progressive Enhancement**: Build on existing PULSE patterns and components
5. **Data Integrity**: Enforce referential integrity and status-based validation

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                      PULSE System                            │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Survey     │    │   Analytics  │    │     CPAP     │ │
│  │   Module     │───▶│   Module     │───▶│    Module    │ │
│  │              │    │              │    │   (NEW)      │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                              │                              │
│                    ┌─────────▼─────────┐                   │
│                    │   Shared Services  │                   │
│                    │  - Auth/RBAC       │                   │
│                    │  - Database        │                   │
│                    │  - API Layer       │                   │
│                    └────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CPAP Module Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Presentation Layer                       │  │
│  │  ┌──────────────────┐    ┌──────────────────┐       │  │
│  │  │  OFFICER UI      │    │   ADMIN UI       │       │  │
│  │  │  - CPAP Editor   │    │   - Review       │       │  │
│  │  │  - Progress      │    │   - Monitoring   │       │  │
│  │  │    Tracker       │    │   - Dashboard    │       │  │
│  │  └──────────────────┘    └──────────────────┘       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │              API Layer (Next.js Routes)             │  │
│  │  - /api/cpap                                        │  │
│  │  - /api/cpap/[id]                                   │  │
│  │  - /api/cpap/[id]/submit                            │  │
│  │  - /api/cpap/[id]/approve                           │  │
│  │  - /api/cpap/[id]/request-revision                  │  │
│  │  - /api/cpap/[id]/progress                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │              Business Logic Layer                    │  │
│  │  - CPAPService                                       │  │
│  │  - ValidationService                                 │  │
│  │  - NotificationService                               │  │
│  │  - PermissionService                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │              Data Access Layer                       │  │
│  │  - Prisma ORM                                        │  │
│  │  - CPAP Repository                                   │  │
│  │  - CPAPItem Repository                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │              Database (PostgreSQL)                   │  │
│  │  - cpaps table                                       │  │
│  │  - cpap_items table                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema

#### CPAP Table

```prisma
model CPAP {
  id              Int       @id @default(autoincrement())
  barangay_id     Int
  cycle_id        Int
  status          CPAPStatus @default(Draft)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  submitted_at    DateTime?
  approved_at     DateTime?
  admin_comments  String?   @db.Text
  
  // Relations
  barangay        Barangay     @relation(fields: [barangay_id], references: [barangay_id], onDelete: Cascade)
  cycle           SurveyCycle  @relation(fields: [cycle_id], references: [cycle_id], onDelete: Cascade)
  items           CPAPItem[]
  
  @@unique([barangay_id, cycle_id])
  @@index([status])
  @@index([barangay_id])
  @@index([cycle_id])
  @@map("cpaps")
}

model CPAPItem {
  id                    Int       @id @default(autoincrement())
  cpap_id               Int
  priority_area         String    @db.VarChar(255)
  target_output         String    @db.Text
  success_indicator     String    @db.Text
  responsible_person    String    @db.VarChar(255)
  timeline_start        DateTime  @db.Date
  timeline_end          DateTime  @db.Date
  actual_output         String?   @db.Text
  accomplishment_status String?   @db.VarChar(50)
  remarks               String?   @db.Text
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  // Relations
  cpap                  CPAP      @relation(fields: [cpap_id], references: [id], onDelete: Cascade)
  
  @@index([cpap_id])
  @@map("cpap_items")
}

enum CPAPStatus {
  Draft
  Submitted
  Approved
  Revision_Requested
}
```

#### Role Migration

The existing User model will be updated to rename "Viewer" to "Officer":

```prisma
model User {
  // ... existing fields
  role  String?  @default("Officer") @db.VarChar(32)
  // ... rest of model
}
```

### 2. API Endpoints

#### GET /api/cpap

**Purpose**: List all CPAPs (filtered by role)

**Authentication**: Required

**Authorization**:
- ADMIN: Returns all CPAPs
- OFFICER: Returns only CPAPs for their assigned barangay
- FS/INTERVIEWER: 403 Forbidden

**Query Parameters**:
- `status` (optional): Filter by status
- `cycle_id` (optional): Filter by survey cycle
- `barangay_id` (optional): Filter by barangay

**Response**:
```typescript
{
  success: boolean;
  cpaps: Array<{
    id: number;
    barangay_id: number;
    barangay_name: string;
    cycle_id: number;
    cycle_name: string;
    status: CPAPStatus;
    created_at: string;
    submitted_at: string | null;
    approved_at: string | null;
    item_count: number;
  }>;
}
```

#### GET /api/cpap/[id]

**Purpose**: Get a specific CPAP with all items

**Authentication**: Required

**Authorization**:
- ADMIN: Can access any CPAP
- OFFICER: Can only access CPAPs for their assigned barangay
- FS/INTERVIEWER: 403 Forbidden

**Response**:
```typescript
{
  success: boolean;
  cpap: {
    id: number;
    barangay_id: number;
    barangay_name: string;
    cycle_id: number;
    cycle_name: string;
    status: CPAPStatus;
    created_at: string;
    updated_at: string;
    submitted_at: string | null;
    approved_at: string | null;
    admin_comments: string | null;
    items: Array<{
      id: number;
      priority_area: string;
      target_output: string;
      success_indicator: string;
      responsible_person: string;
      timeline_start: string;
      timeline_end: string;
      actual_output: string | null;
      accomplishment_status: string | null;
      remarks: string | null;
    }>;
  };
}
```

#### GET /api/cpap/ai-suggestions

**Purpose**: Generate AI-powered action recommendations for CPAP creation

**Authentication**: Required

**Authorization**: OFFICER only (for their assigned barangay)

**Query Parameters**:
- `barangay_id` (required): Barangay ID
- `cycle_id` (required): Survey cycle ID

**Response**:
```typescript
{
  success: boolean;
  suggestions: {
    shortTerm: Array<{
      priority_area: string;
      target_output: string;
      success_indicator: string;
      timeline_months: string; // "0-3 months"
      source: string; // Which service area this came from
    }>;
    mediumTerm: Array<{
      priority_area: string;
      target_output: string;
      success_indicator: string;
      timeline_months: string; // "6-12 months"
      source: string;
    }>;
    longTerm: Array<{
      priority_area: string;
      target_output: string;
      success_indicator: string;
      timeline_months: string; // "1+ year"
      source: string;
    }>;
  };
  metadata: {
    generated_at: string;
    based_on_responses: number;
    service_areas_analyzed: string[];
  };
}
```

#### POST /api/cpap

**Purpose**: Create a new CPAP (auto-created on first access)

**Authentication**: Required

**Authorization**: OFFICER only (for their barangay)

**Request Body**:
```typescript
{
  barangay_id: number;
  cycle_id: number;
}
```

**Response**:
```typescript
{
  success: boolean;
  cpap: {
    id: number;
    barangay_id: number;
    cycle_id: number;
    status: "Draft";
  };
}
```

#### PUT /api/cpap/[id]

**Purpose**: Update CPAP items

**Authentication**: Required

**Authorization**: OFFICER (only for their barangay, only in Draft or Revision_Requested status)

**Request Body**:
```typescript
{
  items: Array<{
    id?: number; // omit for new items
    priority_area: string;
    target_output: string;
    success_indicator: string;
    responsible_person: string;
    timeline_start: string;
    timeline_end: string;
  }>;
  deleted_item_ids?: number[]; // IDs of items to delete
}
```

**Response**:
```typescript
{
  success: boolean;
  cpap: { /* full CPAP object */ };
}
```

#### POST /api/cpap/[id]/submit

**Purpose**: Submit CPAP for review

**Authentication**: Required

**Authorization**: OFFICER (only for their barangay, only in Draft or Revision_Requested status)

**Validation**:
- All items must have required fields filled
- At least one item must exist

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

#### POST /api/cpap/[id]/approve

**Purpose**: Approve a submitted CPAP

**Authentication**: Required

**Authorization**: ADMIN only

**Request Body**:
```typescript
{
  comments?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

#### POST /api/cpap/[id]/request-revision

**Purpose**: Request revisions to a submitted CPAP

**Authentication**: Required

**Authorization**: ADMIN only

**Request Body**:
```typescript
{
  comments: string; // required
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

#### PUT /api/cpap/[id]/progress

**Purpose**: Update progress on approved CPAP items

**Authentication**: Required

**Authorization**: OFFICER (only for their barangay, only in Approved status)

**Request Body**:
```typescript
{
  items: Array<{
    id: number;
    actual_output?: string;
    accomplishment_status?: string;
    remarks?: string;
  }>;
}
```

**Response**:
```typescript
{
  success: boolean;
  cpap: { /* full CPAP object */ };
}
```

### 3. Business Logic Services

#### CPAPService

**Location**: `src/services/cpap.service.ts`

**Responsibilities**:
- CRUD operations for CPAPs and CPAP items
- Status transitions and validation
- Pre-population of CPAP items from survey data
- Progress calculation

**Key Methods**:
```typescript
class CPAPService {
  // Get CPAP for barangay and cycle (create if doesn't exist)
  async getOrCreateCPAP(barangayId: number, cycleId: number): Promise<CPAP>;
  
  // Get all CPAPs (filtered by user role)
  async listCPAPs(userId: number, filters: CPAPFilters): Promise<CPAP[]>;
  
  // Update CPAP items
  async updateCPAPItems(cpapId: number, items: CPAPItemInput[], deletedIds: number[]): Promise<CPAP>;
  
  // Submit CPAP for review
  async submitCPAP(cpapId: number): Promise<void>;
  
  // Approve CPAP
  async approveCPAP(cpapId: number, comments?: string): Promise<void>;
  
  // Request revision
  async requestRevision(cpapId: number, comments: string): Promise<void>;
  
  // Update progress
  async updateProgress(cpapId: number, progressUpdates: ProgressUpdate[]): Promise<CPAP>;
  
  // Pre-populate items from survey data
  async generateItemsFromSurveyData(barangayId: number, cycleId: number): Promise<CPAPItemInput[]>;
  
  // Calculate completion percentage
  async calculateProgress(cpapId: number): Promise<number>;
}
```

#### ValidationService

**Location**: `src/services/cpap-validation.service.ts`

**Responsibilities**:
- Validate CPAP data before submission
- Validate status transitions
- Validate field requirements based on status

**Key Methods**:
```typescript
class CPAPValidationService {
  // Validate CPAP can be submitted
  validateForSubmission(cpap: CPAP): ValidationResult;
  
  // Validate status transition is allowed
  validateStatusTransition(currentStatus: CPAPStatus, newStatus: CPAPStatus): boolean;
  
  // Validate item data
  validateItem(item: CPAPItemInput): ValidationResult;
  
  // Validate user can perform action
  validateUserPermission(user: User, cpap: CPAP, action: string): boolean;
}
```

#### PermissionService

**Location**: `src/services/cpap-permission.service.ts`

**Responsibilities**:
- Check if user can access a CPAP
- Check if user can perform specific actions
- Get user's assigned barangay

**Key Methods**:
```typescript
class CPAPPermissionService {
  // Check if user can access CPAP
  async canAccessCPAP(userId: number, cpapId: number): Promise<boolean>;
  
  // Check if user can edit CPAP
  async canEditCPAP(userId: number, cpapId: number): Promise<boolean>;
  
  // Check if user can submit CPAP
  async canSubmitCPAP(userId: number, cpapId: number): Promise<boolean>;
  
  // Check if user can approve/reject CPAP
  async canReviewCPAP(userId: number): Promise<boolean>;
  
  // Get user's assigned barangay
  async getUserBarangay(userId: number): Promise<number | null>;
}
```

#### NotificationService

**Location**: `src/services/notification.service.ts` (extend existing)

**Responsibilities**:
- Send notifications on CPAP status changes
- Notify admins of new submissions
- Notify officers of review decisions

**Key Methods**:
```typescript
class NotificationService {
  // Notify admins of new CPAP submission
  async notifyCPAPSubmitted(cpapId: number): Promise<void>;
  
  // Notify officer of approval
  async notifyCPAPApproved(cpapId: number): Promise<void>;
  
  // Notify officer of revision request
  async notifyCPAPRevisionRequested(cpapId: number, comments: string): Promise<void>;
}
```

### 4. UI Components

#### OFFICER Dashboard Components

**Location**: `src/app/cpap/page.tsx`

**Components**:
- `CPAPEditor`: Main form for creating/editing CPAP items
- `CPAPItemForm`: Individual item entry form
- `CPAPItemList`: Display list of items with edit/delete actions
- `ProgressTracker`: Update progress on approved items
- `StatusBadge`: Display current CPAP status

**State Management**:
```typescript
interface CPAPEditorState {
  cpap: CPAP | null;
  items: CPAPItem[];
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  mode: 'edit' | 'progress' | 'readonly';
}
```

**Key Features**:
- Auto-save draft changes
- Validation feedback
- Status-based UI rendering
- AI-powered suggestions (optional)
- Manual item creation and editing

**AI Suggestions Feature**:
- "AI Suggestions" button visible only in Draft status
- Fetches recommendations from `/api/cpap/ai-suggestions`
- Displays suggestions in modal grouped by timeline (short/medium/long-term)
- "Use These Suggestions" button pre-fills CPAP items (unsaved)
- OFFICER can review, edit, or delete AI-generated items
- Clear visual indication of AI-generated vs manually created items
- Completely optional - OFFICER can create CPAP entirely manually

#### ADMIN Dashboard Components

**Location**: `src/app/admin/cpap/page.tsx`

**Components**:
- `CPAPDashboard`: Main dashboard with list and filters
- `CPAPReviewModal`: Review interface with approve/reject actions
- `CPAPMonitoringView`: Progress monitoring dashboard
- `CPAPList`: Filterable list of all CPAPs
- `CPAPDetailView`: Read-only view of CPAP details

**State Management**:
```typescript
interface CPAPDashboardState {
  cpaps: CPAP[];
  filters: {
    status: CPAPStatus | 'all';
    cycle_id: number | null;
    barangay_id: number | null;
    search: string;
  };
  selectedCPAP: CPAP | null;
  isLoading: boolean;
  view: 'list' | 'review' | 'monitoring';
}
```

**Key Features**:
- Filter by status, cycle, barangay
- Search by barangay name
- Quick review actions
- Progress monitoring dashboard
- Bulk operations (future enhancement)

### 5. Navigation Integration

#### OFFICER User Navigation

Add to existing navigation menu:
```typescript
{
  label: "CPAP Submission",
  href: "/cpap",
  icon: ClipboardListIcon,
  roles: ["Officer"]
}
```

#### ADMIN User Navigation

Add to existing admin navigation:
```typescript
{
  label: "CPAP Management",
  href: "/admin/cpap",
  icon: CheckSquareIcon,
  roles: ["Admin"]
}
```

### 6. Middleware Updates

**Location**: `middleware.ts`

Add CPAP routes to protected routes:
```typescript
const OFFICER_ROUTES = [
  '/cpap',
  '/api/cpap',
];

const ADMIN_ROUTES = [
  // ... existing routes
  '/admin/cpap',
  '/api/cpap/*/approve',
  '/api/cpap/*/request-revision',
];
```

Update role checking logic to use "Officer" instead of "Viewer".

## Data Models

### TypeScript Interfaces

```typescript
// Core CPAP types
export type CPAPStatus = 'Draft' | 'Submitted' | 'Approved' | 'Revision_Requested';

export interface CPAP {
  id: number;
  barangay_id: number;
  cycle_id: number;
  status: CPAPStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  admin_comments: string | null;
  barangay?: {
    barangay_id: number;
    barangay_name: string;
  };
  cycle?: {
    cycle_id: number;
    name: string;
    year: number;
  };
  items: CPAPItem[];
}

export interface CPAPItem {
  id: number;
  cpap_id: number;
  priority_area: string;
  target_output: string;
  success_indicator: string;
  responsible_person: string;
  timeline_start: string;
  timeline_end: string;
  actual_output: string | null;
  accomplishment_status: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

// Input types for API
export interface CPAPItemInput {
  id?: number;
  priority_area: string;
  target_output: string;
  success_indicator: string;
  responsible_person: string;
  timeline_start: string;
  timeline_end: string;
}

export interface ProgressUpdate {
  id: number;
  actual_output?: string;
  accomplishment_status?: string;
  remarks?: string;
}

export interface CPAPFilters {
  status?: CPAPStatus | 'all';
  cycle_id?: number;
  barangay_id?: number;
  search?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

## Error Handling

### API Error Responses

All API endpoints will return consistent error responses:

```typescript
{
  success: false;
  error: string;
  message: string;
  details?: any;
}
```

### HTTP Status Codes

- `200 OK`: Successful operation
- `201 Created`: CPAP created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: CPAP not found
- `409 Conflict`: Invalid status transition
- `500 Internal Server Error`: Server error

### Client-Side Error Handling

```typescript
// Error handling pattern
try {
  const response = await fetch('/api/cpap/123/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 403) {
      // Handle permission error
      showError('You do not have permission to perform this action');
    } else if (response.status === 400) {
      // Handle validation error
      showValidationErrors(data.details);
    } else {
      // Handle generic error
      showError(data.message || 'An error occurred');
    }
    return;
  }
  
  // Success handling
  showSuccess('CPAP submitted successfully');
} catch (error) {
  // Handle network error
  showError('Network error. Please check your connection.');
}
```

## Testing Strategy

### Unit Tests

**Location**: `tests/unit/cpap/`

**Coverage**:
- CPAPService methods
- ValidationService logic
- PermissionService authorization checks
- Status transition logic
- Data transformation functions

**Tools**: Jest, Prisma mock

**Example**:
```typescript
describe('CPAPService', () => {
  describe('submitCPAP', () => {
    it('should transition status from Draft to Submitted', async () => {
      // Test implementation
    });
    
    it('should throw error if CPAP has no items', async () => {
      // Test implementation
    });
    
    it('should send notification to admins', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

**Location**: `tests/integration/cpap/`

**Coverage**:
- API endpoint functionality
- Database operations
- Role-based access control
- Status workflow end-to-end

**Tools**: Jest, Supertest, Test database

**Example**:
```typescript
describe('CPAP API Integration', () => {
  describe('POST /api/cpap/:id/submit', () => {
    it('should allow OFFICER to submit their CPAP', async () => {
      // Test implementation
    });
    
    it('should reject submission from different barangay OFFICER', async () => {
      // Test implementation
    });
    
    it('should reject submission with incomplete items', async () => {
      // Test implementation
    });
  });
});
```

### E2E Tests

**Location**: `tests/e2e/cpap/`

**Coverage**:
- Complete CPAP workflow (create → submit → review → approve → progress)
- UI interactions
- Navigation flows
- Error scenarios

**Tools**: Playwright or Cypress

**Scenarios**:
1. OFFICER creates and submits CPAP
2. ADMIN reviews and approves CPAP
3. ADMIN requests revision
4. OFFICER updates progress on approved CPAP
5. Permission denied scenarios

## Security Considerations

### Authentication

- All CPAP endpoints require valid JWT token
- Token validation via middleware
- Session management via HttpOnly cookies

### Authorization

- Role-based access control enforced at API level
- OFFICER users can only access their assigned barangay's CPAP
- ADMIN users have full access
- FS and INTERVIEWER users have no access

### Data Validation

- Server-side validation for all inputs
- SQL injection prevention via Prisma ORM
- XSS prevention via React's built-in escaping
- CSRF protection via SameSite cookies

### Audit Trail

- Track all status changes with timestamps
- Log all access attempts
- Record who approved/rejected CPAPs
- Maintain update history

## Performance Considerations

### Database Optimization

- Indexes on frequently queried fields (status, barangay_id, cycle_id)
- Efficient joins using Prisma's include/select
- Pagination for CPAP lists
- Caching of survey data used for pre-population

### API Optimization

- Lazy loading of CPAP items
- Debounced auto-save for draft changes
- Optimistic UI updates
- Request batching for bulk operations

### Frontend Optimization

- Code splitting for CPAP module
- Lazy loading of components
- Memoization of expensive computations
- Virtual scrolling for large item lists

## Report Card Changes

### Removing AI Roadmap Display

As part of this integration, AI-generated action recommendations will be removed from the report card interface and moved to the CPAP module:

**Changes to Report Card (`src/app/reportcard/page.tsx`)**:
1. Remove "AI-Generated Action Roadmap" section from service area drill-down modal
2. Remove AI recommendations from executive summary display
3. Remove AI recommendations from CSV export
4. Remove AI recommendations from PDF/print output
5. Keep all analytics, funnel data, trends, and other visualizations

**Rationale**:
- Centralizes action planning in one place (CPAP module)
- Prevents confusion between AI suggestions and official action plans
- AI recommendations still generated but accessed through CPAP interface
- Report cards focus on analytics and insights, CPAP focuses on action planning

## Migration Strategy

### Phase 1: Database Migration

1. Create migration file for cpaps and cpap_items tables
2. Add CPAPStatus enum
3. Run migration on development database
4. Verify schema changes

### Phase 2: Role Renaming

1. Create migration to rename "Viewer" to "Officer" in User table
2. Update default role value
3. Run data migration script to update existing users
4. Verify no data loss

### Phase 3: Report Card Cleanup

1. Remove AI roadmap sections from report card UI
2. Update export functions to exclude AI recommendations
3. Test report card functionality remains intact
4. Verify no broken references

### Phase 4: Backend Implementation

1. Implement service layer (CPAPService, ValidationService, PermissionService)
2. Implement API endpoints including AI suggestions endpoint
3. Add middleware route protection
4. Write unit tests

### Phase 5: Frontend Implementation

1. Create OFFICER UI components with AI suggestions feature
2. Create ADMIN UI components
3. Add navigation menu items
4. Implement client-side validation

### Phase 6: Integration & Testing

1. Integration testing
2. E2E testing including AI suggestions workflow
3. Security testing
4. Performance testing

### Phase 7: Deployment

1. Deploy to staging environment
2. User acceptance testing
3. Deploy to production
4. Monitor for issues

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Bulk Operations**: Allow ADMIN to approve/reject multiple CPAPs at once
2. **Templates**: Pre-defined CPAP templates for common priority areas
3. **Attachments**: Allow file uploads for supporting documents
4. **Comments**: Discussion thread between OFFICER and ADMIN
5. **Version History**: Track all changes to CPAP items
6. **Export**: Generate PDF reports of CPAPs
7. **Analytics**: Dashboard showing CPAP completion rates and trends
8. **Notifications**: Email/SMS notifications for status changes
9. **Reminders**: Automated reminders for pending reviews or overdue progress updates
10. **Collaboration**: Multiple OFFICER users per barangay with role delegation

### Technical Debt Considerations

- Consider moving to a more robust state machine library for status management
- Evaluate need for real-time updates using WebSockets
- Consider implementing optimistic locking for concurrent edits
- Evaluate caching strategy for frequently accessed CPAPs
