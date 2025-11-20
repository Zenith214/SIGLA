# CPAP Module System Architecture

## Overview

The Citizen Priority Action Plan (CPAP) module is an internal governance feature integrated into the PULSE system. This document describes the technical architecture, component interactions, and system design decisions.

## System Context

### PULSE System Integration

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

### Data Flow

```
Survey Data → Analytics → AI Suggestions → CPAP Creation → Review → Approval → Progress Tracking
```

## Architecture Layers

### 1. Presentation Layer

**Technology:** React, Next.js 15, TypeScript, Tailwind CSS

**Components:**


**OFFICER UI (`/cpap`)**
- CPAPEditor: Main editing interface
- CPAPItemForm: Individual item entry
- CPAPItemList: Item display and management
- AISuggestionsModal: AI-powered recommendations
- ProgressTracker: Progress update interface
- StatusBadge: Visual status indicator

**ADMIN UI (`/admin/cpap`)**
- CPAPDashboard: Main management interface
- CPAPList: Filterable CPAP list
- CPAPReviewModal: Review and decision interface
- CPAPMonitoringView: Progress monitoring dashboard

**Shared Components**
- UserDropdown: Navigation menu integration
- Toast notifications: User feedback
- Loading states: Async operation indicators
- Error boundaries: Error handling

### 2. API Layer

**Technology:** Next.js API Routes, REST

**Endpoints:**

```
GET    /api/cpap                      # List CPAPs
GET    /api/cpap/[id]                 # Get CPAP details
GET    /api/cpap/ai-suggestions       # Generate AI suggestions
POST   /api/cpap                      # Create CPAP
PUT    /api/cpap/[id]                 # Update CPAP items
POST   /api/cpap/[id]/submit          # Submit for review
POST   /api/cpap/[id]/approve         # Approve CPAP
POST   /api/cpap/[id]/request-revision # Request revisions
PUT    /api/cpap/[id]/progress        # Update progress
```

**Middleware:**
- Authentication: JWT token validation
- Authorization: Role-based access control
- Rate limiting: Request throttling
- Error handling: Consistent error responses


### 3. Business Logic Layer

**Technology:** TypeScript, Service-oriented architecture

**Services:**

**CPAPService** (`src/lib/services/cpap.service.ts`)
- CRUD operations for CPAPs and items
- Status transition management
- Progress calculation
- Data validation

**CPAPValidationService** (`src/lib/services/cpap-validation.service.ts`)
- Submission validation
- Status transition validation
- Field requirement validation
- Business rule enforcement

**CPAPPermissionService** (`src/lib/services/cpap-permission.service.ts`)
- Access control checks
- Role-based authorization
- Barangay assignment verification
- Action permission validation

**CPAPNotificationService** (`src/lib/services/cpap-notification.service.ts`)
- Submission notifications
- Approval notifications
- Revision request notifications
- Email/in-app notification delivery

### 4. Data Access Layer

**Technology:** Prisma ORM, PostgreSQL

**Models:**

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
  
  barangay        Barangay     @relation(...)
  cycle           SurveyCycle  @relation(...)
  items           CPAPItem[]
  
  @@unique([barangay_id, cycle_id])
  @@index([status, barangay_id, cycle_id])
}

model CPAPItem {
  id                    Int       @id @default(autoincrement())
  cpap_id               Int
  priority_area         String
  target_output         String    @db.Text
  success_indicator     String    @db.Text
  responsible_person    String
  timeline_start        DateTime  @db.Date
  timeline_end          DateTime  @db.Date
  actual_output         String?   @db.Text
  accomplishment_status String?
  remarks               String?   @db.Text
  
  cpap                  CPAP      @relation(...)
  
  @@index([cpap_id])
}

enum CPAPStatus {
  Draft
  Submitted
  Approved
  Revision_Requested
}
```


### 5. Database Layer

**Technology:** PostgreSQL 14+

**Schema Design:**

- **cpaps table**: Main CPAP records
- **cpap_items table**: Individual action items
- **Foreign keys**: Referential integrity to Barangay and SurveyCycle
- **Indexes**: Optimized for common queries
- **Constraints**: Data integrity enforcement

**Performance Optimizations:**
- Composite indexes on (status, barangay_id, cycle_id)
- Index on cpap_id in cpap_items
- Unique constraint on (barangay_id, cycle_id)
- Cascade deletes for data consistency

## Component Interactions

### CPAP Creation Flow

```
1. OFFICER clicks "CPAP Submission"
2. UI calls GET /api/cpap?barangay_id=X&cycle_id=Y
3. API checks if CPAP exists
4. If not, creates new CPAP with Draft status
5. Returns CPAP to UI
6. UI renders editor interface
```

### AI Suggestions Flow

```
1. OFFICER clicks "AI Suggestions"
2. UI calls GET /api/cpap/ai-suggestions?barangay_id=X&cycle_id=Y
3. API queries survey responses for barangay/cycle
4. Calls ML funnel analysis API
5. Analyzes satisfaction, awareness, availment data
6. Generates recommendations by timeline
7. Returns structured suggestions
8. UI displays in modal
9. OFFICER can use suggestions to pre-fill items
```

### Submission Flow

```
1. OFFICER clicks "Submit to DILG"
2. UI calls POST /api/cpap/[id]/submit
3. API validates all items have required fields
4. Updates status to Submitted
5. Records submission timestamp
6. Triggers notification to all ADMIN users
7. Returns success response
8. UI updates to read-only mode
```

### Review Flow

```
1. ADMIN opens CPAP Management
2. UI calls GET /api/cpap?status=Submitted
3. API returns submitted CPAPs
4. ADMIN clicks on CPAP to review
5. UI calls GET /api/cpap/[id]
6. API returns full CPAP with items
7. ADMIN makes decision:
   
   Option A: Approve
   - UI calls POST /api/cpap/[id]/approve
   - API updates status to Approved
   - Records approval timestamp
   - Triggers notification to OFFICER
   
   Option B: Request Revision
   - UI calls POST /api/cpap/[id]/request-revision
   - API updates status to Revision_Requested
   - Stores admin comments
   - Triggers notification to OFFICER with comments
```


### Progress Tracking Flow

```
1. OFFICER opens approved CPAP
2. UI renders ProgressTracker component
3. OFFICER updates progress fields
4. UI calls PUT /api/cpap/[id]/progress
5. API validates CPAP is Approved
6. Updates only progress fields (actual_output, accomplishment_status, remarks)
7. Records update timestamp
8. Returns updated CPAP
9. UI displays success message
```

## Security Architecture

### Authentication

**Mechanism:** JWT tokens stored in HttpOnly cookies

**Flow:**
```
1. User logs in via /api/auth/login
2. Server validates credentials
3. Generates JWT token with user info and role
4. Sets HttpOnly cookie with token
5. Client includes cookie in all requests
6. Middleware validates token on each request
```

### Authorization

**Role-Based Access Control (RBAC):**

| Role | CPAP Access |
|------|-------------|
| ADMIN | Full access to all CPAPs |
| OFFICER | Access only to their barangay's CPAP |
| FS | No access (403 Forbidden) |
| INTERVIEWER | No access (403 Forbidden) |

**Enforcement Points:**
1. Middleware: Route-level protection
2. API handlers: Request-level validation
3. Service layer: Business logic authorization
4. Database: Row-level security (future enhancement)

### Data Protection

**In Transit:**
- HTTPS/TLS encryption
- Secure cookie flags (HttpOnly, Secure, SameSite)
- CORS policy enforcement

**At Rest:**
- Database encryption
- Backup encryption
- Secure credential storage

**Access Control:**
- Principle of least privilege
- Role-based permissions
- Audit logging

## Integration Points

### Survey Module Integration

**Data Flow:** Survey responses → Analytics → CPAP AI Suggestions

**Integration:**
- CPAP reads survey data for AI suggestions
- No write operations to survey tables
- Read-only access via Prisma queries

### Analytics Module Integration

**Data Flow:** Analytics results → AI recommendations → CPAP suggestions

**Integration:**
- CPAP calls ML funnel analysis API
- Receives service-specific recommendations
- Transforms into CPAP item format

### Notification System Integration

**Events:**
- CPAP submitted → Notify all ADMIN users
- CPAP approved → Notify OFFICER user
- Revision requested → Notify OFFICER with comments

**Integration:**
- CPAPNotificationService extends existing NotificationService
- Uses existing notification infrastructure
- Supports email and in-app notifications


## State Management

### CPAP Status State Machine

```
┌─────────┐
│  Draft  │◄─────────────────┐
└────┬────┘                  │
     │ submit()              │
     ▼                       │
┌───────────┐                │
│ Submitted │                │
└─────┬─────┘                │
      │                      │
      ├─────approve()────────┤
      │                      │
      │                      │
      └──requestRevision()───┤
                             │
                    ┌────────┴────────┐
                    │ Revision_       │
                    │ Requested       │
                    └────────┬────────┘
                             │
                             │ resubmit()
                             │
                    ┌────────▼────────┐
                    │   Submitted     │
                    └─────────────────┘
                             │
                             │ approve()
                             ▼
                    ┌─────────────────┐
                    │    Approved     │
                    └─────────────────┘
```

**Valid Transitions:**
- Draft → Submitted (via submit)
- Submitted → Approved (via approve)
- Submitted → Revision_Requested (via requestRevision)
- Revision_Requested → Submitted (via resubmit)
- Approved → (terminal state, only progress updates allowed)

**Invalid Transitions:**
- Draft → Approved (must go through Submitted)
- Approved → Draft (cannot revert)
- Approved → Revision_Requested (cannot un-approve)

### UI State Management

**Client-Side State:**
- React hooks (useState, useEffect)
- Form state management
- Loading/error states
- Optimistic updates

**Server State:**
- API responses cached briefly
- Refetch on mutations
- Invalidate on status changes

## Performance Considerations

### Database Optimization

**Indexes:**
```sql
CREATE INDEX idx_cpaps_status ON cpaps(status);
CREATE INDEX idx_cpaps_barangay_cycle ON cpaps(barangay_id, cycle_id);
CREATE INDEX idx_cpap_items_cpap_id ON cpap_items(cpap_id);
```

**Query Optimization:**
- Use Prisma's `select` to fetch only needed fields
- Use `include` judiciously for relations
- Implement pagination for large lists
- Cache frequently accessed data

### API Performance

**Response Times:**
- List CPAPs: < 2 seconds
- Get CPAP details: < 1 second
- AI suggestions: < 5 seconds
- Save operations: < 2 seconds

**Optimization Strategies:**
- Database query optimization
- Response caching (where appropriate)
- Lazy loading of items
- Pagination for large datasets

### Frontend Performance

**Optimization:**
- Code splitting by route
- Lazy loading of components
- Memoization of expensive computations
- Debounced auto-save
- Virtual scrolling for large lists


## Scalability

### Horizontal Scaling

**Application Tier:**
- Stateless API design
- Load balancer distribution
- Multiple application instances
- Session stored in database

**Database Tier:**
- Read replicas for queries
- Connection pooling
- Query optimization
- Partitioning (future)

### Vertical Scaling

**Current Capacity:**
- 100 concurrent users
- 1000 CPAPs per cycle
- 10,000 CPAP items total

**Growth Path:**
- Increase server resources
- Optimize database queries
- Implement caching layer
- Add CDN for static assets

## Monitoring and Observability

### Application Monitoring

**Metrics:**
- Request rate
- Response time
- Error rate
- Success rate by endpoint

**Tools:**
- PM2 for process monitoring
- Application logs
- Error tracking (Sentry recommended)
- Performance monitoring (New Relic recommended)

### Database Monitoring

**Metrics:**
- Query execution time
- Connection pool usage
- Table sizes
- Index usage

**Tools:**
- PostgreSQL logs
- pg_stat_statements
- Database monitoring tools

### Business Metrics

**Key Metrics:**
- CPAPs created per cycle
- Submission rate
- Approval rate
- Average review time
- Progress update frequency

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- Daily full backups
- Hourly incremental backups
- 30-day retention
- Off-site storage

**Application Backups:**
- Code in Git repository
- Configuration in version control
- Environment variables documented

### Recovery Procedures

**Database Recovery:**
- Point-in-time recovery available
- Restore from backup
- Verify data integrity
- Test recovery regularly

**Application Recovery:**
- Rollback to previous version
- Restore from Git
- Redeploy application
- Verify functionality

## Future Enhancements

### Phase 2 Features

**Planned Enhancements:**
1. Bulk operations for ADMIN
2. CPAP templates
3. File attachments
4. Comment threads
5. Version history
6. Export to PDF
7. Analytics dashboard
8. Email notifications
9. Automated reminders
10. Multi-user collaboration

### Technical Improvements

**Planned Improvements:**
1. GraphQL API (alternative to REST)
2. Real-time updates (WebSockets)
3. Optimistic locking
4. Advanced caching
5. Database partitioning
6. Microservices architecture (if needed)
7. Event-driven architecture
8. Message queue integration


## Technology Stack Summary

### Frontend
- **Framework:** Next.js 15 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components + shadcn/ui
- **State Management:** React hooks
- **Forms:** React Hook Form (recommended)
- **HTTP Client:** Fetch API

### Backend
- **Framework:** Next.js API Routes
- **Language:** TypeScript
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Validation:** Zod (recommended)
- **Testing:** Jest, Supertest

### Database
- **RDBMS:** PostgreSQL 14+
- **Migration Tool:** Prisma Migrate
- **Backup:** pg_dump
- **Monitoring:** pg_stat_statements

### Infrastructure
- **Process Manager:** PM2
- **Web Server:** Nginx (reverse proxy)
- **SSL/TLS:** Let's Encrypt
- **Hosting:** [Your hosting provider]

### Development Tools
- **Version Control:** Git
- **Package Manager:** npm
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Jest, Playwright

## Architecture Decisions

### ADR-001: REST API over GraphQL

**Decision:** Use REST API for CPAP endpoints

**Rationale:**
- Consistency with existing PULSE APIs
- Simpler implementation
- Adequate for current requirements
- Team familiarity

**Consequences:**
- Multiple endpoints for related operations
- Potential over-fetching
- Can migrate to GraphQL in Phase 2 if needed

### ADR-002: Service Layer Pattern

**Decision:** Implement business logic in service classes

**Rationale:**
- Separation of concerns
- Testability
- Reusability
- Maintainability

**Consequences:**
- Additional abstraction layer
- More files to maintain
- Clearer code organization

### ADR-003: Status-Based Access Control

**Decision:** Control edit permissions based on CPAP status

**Rationale:**
- Clear workflow enforcement
- Prevents unauthorized modifications
- Aligns with business process
- Simple to implement and understand

**Consequences:**
- Status transitions must be carefully managed
- UI must adapt to status
- Clear state machine required

### ADR-004: AI Suggestions as Optional Feature

**Decision:** Make AI suggestions completely optional

**Rationale:**
- Respects user autonomy
- Allows manual expertise
- Reduces dependency on ML service
- Provides flexibility

**Consequences:**
- Users may ignore AI suggestions
- Need clear UI to indicate optionality
- Must support fully manual workflow

### ADR-005: Single CPAP per Barangay per Cycle

**Decision:** Enforce unique constraint on (barangay_id, cycle_id)

**Rationale:**
- Simplifies data model
- Prevents duplicate plans
- Clear ownership
- Easier to track

**Consequences:**
- Cannot have multiple plans per cycle
- Must version within single CPAP
- Revisions handled via status changes

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                     (Nginx)                              │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │  App    │            │  App    │
    │ Server  │            │ Server  │
    │  (PM2)  │            │  (PM2)  │
    └────┬────┘            └────┬────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  PostgreSQL │
              │   Primary   │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  PostgreSQL │
              │   Replica   │
              │  (Read-only)│
              └─────────────┘
```

### Development Environment

```
┌─────────────────┐
│  Developer      │
│  Workstation    │
│                 │
│  - Next.js Dev  │
│  - Local DB     │
│  - Hot Reload   │
└─────────────────┘
```

### Staging Environment

```
┌─────────────────┐
│  Staging Server │
│                 │
│  - App Server   │
│  - Test DB      │
│  - Same config  │
│    as prod      │
└─────────────────┘
```

## Conclusion

The CPAP module is designed as a well-integrated, secure, and scalable addition to the PULSE system. It follows established patterns, maintains consistency with existing architecture, and provides a solid foundation for future enhancements.

**Key Strengths:**
- Clean separation of concerns
- Role-based security
- Scalable architecture
- Comprehensive testing
- Clear documentation

**Areas for Future Improvement:**
- Real-time collaboration
- Advanced analytics
- Mobile optimization
- Offline support
- Enhanced AI capabilities

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Maintained By:** PULSE Development Team  
**Review Frequency:** Quarterly or after major changes
