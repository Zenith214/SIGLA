# Implementation Plan

- [x] 1. Database schema and migrations





  - Create Prisma schema for cpaps and cpap_items tables with all required fields
  - Add CPAPStatus enum with Draft, Submitted, Approved, and Revision_Requested values
  - Create database migration files for new tables and enum
  - Add indexes on status, barangay_id, and cycle_id fields for query optimization
  - Create unique constraint on barangay_id and cycle_id combination in cpaps table
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Role migration from VIEWER to OFFICER








  - Create database migration to rename "Viewer" role to "Officer" in User table
  - Update default role value in User model from "Viewer" to "Officer"
  - Write data migration script to update existing VIEWER users to OFFICER role
  - Update Prisma schema to reflect new role name
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3. Implement CPAP service layer




- [x] 3.1 Create CPAPService with core CRUD operations


  - Implement getOrCreateCPAP method to retrieve or initialize CPAP for barangay and cycle
  - Implement listCPAPs method with role-based filtering
  - Implement updateCPAPItems method for adding, editing, and deleting items
  - Implement calculateProgress method to compute completion percentage
  - _Requirements: 1.3, 2.5, 12.1, 12.2_

- [x] 3.2 Implement CPAP workflow methods


  - Implement submitCPAP method with validation and status transition to Submitted
  - Implement approveCPAP method with status transition to Approved and timestamp recording
  - Implement requestRevision method with status transition to Revision_Requested and comment storage
  - Implement updateProgress method for updating progress fields on approved CPAPs
  - _Requirements: 3.4, 5.3, 5.5, 6.5, 7.4_

- [x] 3.3 Implement AI suggestion generation for CPAP


  - Create generateAISuggestions method to analyze survey results and funnel data
  - Integrate with existing ML funnel analysis API to get service-specific recommendations
  - Extract short-term, medium-term, and long-term action recommendations
  - Format AI suggestions as CPAP items with priority areas, target outputs, success indicators, and timelines
  - Return structured suggestions that can be optionally used by OFFICER users
  - _Requirements: 2A.1, 2A.2_

- [x] 4. Implement validation service




  - Create CPAPValidationService class with validation methods
  - Implement validateForSubmission to check all required fields are complete
  - Implement validateStatusTransition to enforce valid status changes
  - Implement validateItem to check individual item data integrity
  - Implement validateUserPermission to verify user can perform actions
  - _Requirements: 3.2, 3.3, 10.1, 10.2, 10.3_

- [x] 5. Implement permission service





  - Create CPAPPermissionService class for authorization checks
  - Implement canAccessCPAP to verify user can view specific CPAP
  - Implement canEditCPAP to check edit permissions based on status and role
  - Implement canSubmitCPAP to verify submission permissions
  - Implement canReviewCPAP to check admin review permissions
  - Implement getUserBarangay to retrieve user's assigned barangay
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6. Implement notification service extensions




  - Extend existing NotificationService with CPAP notification methods
  - Implement notifyCPAPSubmitted to alert all ADMIN users of new submissions
  - Implement notifyCPAPApproved to notify OFFICER of approval
  - Implement notifyCPAPRevisionRequested to notify OFFICER with admin comments
  - _Requirements: 3.5, 5.3, 5.5, 6.1_

- [x] 7. Implement CPAP API endpoints





- [x] 7.1 Create GET /api/cpap endpoint


  - Implement route handler with authentication check
  - Add role-based filtering (ADMIN sees all, OFFICER sees only their barangay)
  - Implement query parameter filtering by status, cycle_id, and barangay_id
  - Return CPAP list with barangay name, cycle name, and item count
  - Add proper error handling and 403 for FS/INTERVIEWER roles
  - _Requirements: 4.3, 10.1, 10.2, 10.3, 11.5_

- [x] 7.1A Create GET /api/cpap/ai-suggestions endpoint

  - Implement route handler for generating AI suggestions
  - Accept barangay_id and cycle_id as query parameters
  - Call ML funnel analysis API to get service-specific recommendations
  - Transform AI recommendations into CPAP item format
  - Return structured suggestions with short-term, medium-term, and long-term actions
  - Restrict access to OFFICER role for their assigned barangay
  - _Requirements: 2A.1, 2A.2_

- [x] 7.2 Create GET /api/cpap/[id] endpoint


  - Implement route handler with authentication and authorization checks
  - Verify user has permission to access the specific CPAP
  - Return full CPAP details including all items and related data
  - Return 403 Forbidden for unauthorized access attempts
  - _Requirements: 1.2, 10.1, 10.2, 10.3, 10.5_

- [x] 7.3 Create POST /api/cpap endpoint

  - Implement route handler for CPAP creation
  - Validate barangay_id and cycle_id exist in database
  - Check for existing CPAP and return it if found
  - Create new CPAP with Draft status if not exists
  - Restrict access to OFFICER role for their assigned barangay
  - _Requirements: 1.3, 10.2, 12.1, 12.2_

- [x] 7.4 Create PUT /api/cpap/[id] endpoint

  - Implement route handler for updating CPAP items
  - Verify CPAP is in Draft or Revision_Requested status
  - Validate user is OFFICER for the CPAP's barangay
  - Process item additions, updates, and deletions in transaction
  - Return updated CPAP with all items
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 6.2, 10.2_

- [x] 7.5 Create POST /api/cpap/[id]/submit endpoint


  - Implement route handler for CPAP submission
  - Validate CPAP has at least one item with all required fields
  - Verify user is OFFICER for the CPAP's barangay
  - Transition status from Draft or Revision_Requested to Submitted
  - Trigger notification to all ADMIN users
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.4, 6.5_

- [x] 7.6 Create POST /api/cpap/[id]/approve endpoint


  - Implement route handler for CPAP approval
  - Verify user has ADMIN role
  - Transition status to Approved and record approval timestamp
  - Store optional admin comments
  - Trigger notification to OFFICER user
  - _Requirements: 5.2, 5.3, 10.4_

- [x] 7.7 Create POST /api/cpap/[id]/request-revision endpoint


  - Implement route handler for requesting revisions
  - Verify user has ADMIN role
  - Validate comments field is provided
  - Transition status to Revision_Requested
  - Store admin comments for OFFICER to view
  - Trigger notification to OFFICER user with comments
  - _Requirements: 5.2, 5.4, 5.5, 6.1, 6.3_

- [x] 7.8 Create PUT /api/cpap/[id]/progress endpoint


  - Implement route handler for progress updates
  - Verify CPAP is in Approved status
  - Validate user is OFFICER for the CPAP's barangay
  - Update only progress-related fields (actual_output, accomplishment_status, remarks)
  - Record update timestamp for admin visibility
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.5_

- [x] 8. Update middleware for CPAP route protection




  - Add /cpap routes to OFFICER_ROUTES array in middleware
  - Add /admin/cpap routes to ADMIN_ROUTES array
  - Add /api/cpap routes with role-based access control
  - Update role checking logic to use "Officer" instead of "Viewer"
  - Ensure FS and INTERVIEWER roles receive 403 for CPAP endpoints
  - _Requirements: 10.1, 10.2, 10.3, 11.5_
-

- [x] 9. Implement OFFICER UI components




- [x] 9.1 Create CPAP editor page and layout


  - Create /cpap/page.tsx with main layout structure
  - Implement loading state while fetching CPAP data
  - Add status badge to display current CPAP status
  - Implement error boundary for error handling
  - Add navigation breadcrumbs
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 9.2 Create CPAP item form component


  - Build CPAPItemForm component for adding/editing individual items
  - Add form fields for priority_area, target_output, success_indicator, responsible_person, timeline_start, timeline_end
  - Implement client-side validation with error messages
  - Add save and cancel actions
  - Support both create and edit modes
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 9.3 Create CPAP item list component


  - Build CPAPItemList component to display all items
  - Add edit and delete actions for each item (when in Draft status)
  - Implement delete confirmation dialog
  - Show read-only view when status is Submitted
  - Display item count and validation status
  - _Requirements: 2.1, 2.2, 2.3, 1.5_

- [x] 9.4 Implement draft editing workflow


  - Enable all fields when CPAP status is Draft
  - Implement auto-save functionality with debouncing
  - Show "Submit to DILG for Review" button when in Draft status
  - Display validation errors before submission
  - Show success message after successful save
  - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.5, 3.1_

- [x] 9.4A Implement AI suggestions feature


  - Add "AI Suggestions" button in CPAP editor when status is Draft
  - Implement click handler to fetch AI suggestions from /api/cpap/ai-suggestions
  - Display AI suggestions in a modal with short-term, medium-term, and long-term recommendations
  - Add "Use These Suggestions" button in the modal
  - Implement handler to convert AI suggestions into CPAP item entries (unsaved)
  - Allow OFFICER to review, edit, or delete AI-generated items before saving
  - Show clear indication that items are AI-generated and not yet saved
  - _Requirements: 2.4, 2A.1, 2A.2, 2A.3, 2A.4, 2A.5_

- [x] 9.5 Implement submission workflow


  - Add submit button with confirmation dialog
  - Validate all items have required fields before submission
  - Display specific validation errors if submission fails
  - Show success message and update UI to read-only after submission
  - Disable submit button during submission process
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9.6 Implement revision workflow

  - Display admin comments prominently when status is Revision_Requested
  - Enable editing of all fields when in Revision_Requested status
  - Show "Resubmit to DILG" button instead of "Submit to DILG for Review"
  - Maintain revision history display
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9.7 Implement progress tracking interface


  - Create ProgressTracker component for approved CPAPs
  - Enable editing of actual_output, accomplishment_status, and remarks fields only
  - Keep all other fields read-only when status is Approved
  - Show "Save Progress Update" button
  - Display last update timestamp
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9.8 Add CPAP Submission button to OFFICER navigation


  - Add "CPAP Submission" menu item to OFFICER dashboard navigation
  - Link to /cpap page
  - Add appropriate icon (ClipboardList or similar)
  - Ensure button only visible to OFFICER role
  - _Requirements: 1.1, 11.1, 11.2_

- [x] 10. Implement ADMIN UI components




- [x] 10.1 Create CPAP management dashboard page


  - Create /admin/cpap/page.tsx with dashboard layout
  - Implement tabs or views for "Review" and "Monitoring" modes
  - Add loading states and error handling
  - Implement responsive design for mobile and desktop
  - _Requirements: 4.1, 4.2_

- [x] 10.2 Create CPAP list component with filters


  - Build CPAPList component to display all CPAPs in table format
  - Add filter controls for status, cycle, and barangay
  - Implement search functionality by barangay name
  - Add sorting by submission date, barangay name, status
  - Show CPAP count and pagination controls
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 10.3 Create CPAP review modal


  - Build CPAPReviewModal component for reviewing submitted CPAPs
  - Display full CPAP details in read-only format
  - Add "Approve" and "Request Revision" action buttons
  - Implement comment textarea for revision requests
  - Show confirmation dialogs for both actions
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 10.4 Implement approval workflow

  - Add approve button click handler with confirmation
  - Call /api/cpap/[id]/approve endpoint
  - Show success message and update CPAP list
  - Display error message if approval fails
  - Close modal after successful approval
  - _Requirements: 5.2, 5.3_

- [x] 10.5 Implement revision request workflow

  - Add request revision button with comment requirement
  - Validate comments field is not empty
  - Call /api/cpap/[id]/request-revision endpoint
  - Show success message and update CPAP list
  - Close modal after successful revision request
  - _Requirements: 5.2, 5.4, 5.5_

- [x] 10.6 Create monitoring dashboard view


  - Build CPAPMonitoringView component for tracking progress
  - Display summary cards with key metrics (total approved, completion rates)
  - Show list of approved CPAPs with progress indicators
  - Add progress bars or percentage displays for each CPAP
  - Display last update timestamp for each CPAP
  - Implement drill-down to view detailed progress
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10.7 Add CPAP Management button to ADMIN navigation


  - Add "CPAP Management" menu item to ADMIN dashboard navigation
  - Link to /admin/cpap page
  - Add appropriate icon (CheckSquare or similar)
  - Ensure button only visible to ADMIN role
  - _Requirements: 4.1, 4.2_

- [x] 11. Hide CPAP module from FS and INTERVIEWER users





  - Ensure no CPAP-related buttons appear in FS dashboard navigation
  - Ensure no CPAP-related buttons appear in INTERVIEWER dashboard navigation
  - Implement redirect to appropriate dashboard if direct URL access attempted
  - Add 403 error page for unauthorized access attempts
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 12. Implement TypeScript types and interfaces





  - Create types/cpap.ts with all CPAP-related TypeScript interfaces
  - Define CPAPStatus type with all valid status values
  - Define CPAP, CPAPItem, CPAPItemInput, and ProgressUpdate interfaces
  - Define CPAPFilters and ValidationResult interfaces
  - Export all types for use across the application
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 7.1, 8.1_

- [x] 13. Run database migrations





  - Execute Prisma migration to create cpaps and cpap_items tables
  - Execute role migration to rename VIEWER to OFFICER
  - Verify migrations completed successfully in development database
  - Test rollback procedures for both migrations
  - Document migration steps for production deployment
  - _Requirements: 9.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 14. Write unit tests for services





  - Write unit tests for CPAPService methods (getOrCreateCPAP, submitCPAP, approveCPAP, etc.)
  - Write unit tests for CPAPValidationService validation logic
  - Write unit tests for CPAPPermissionService authorization checks
  - Write unit tests for status transition logic
  - Mock Prisma client for isolated testing
  - Achieve minimum 80% code coverage for service layer
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15. Write integration tests for API endpoints





  - Write integration tests for GET /api/cpap with role-based filtering
  - Write integration tests for POST /api/cpap/[id]/submit with validation
  - Write integration tests for POST /api/cpap/[id]/approve
  - Write integration tests for POST /api/cpap/[id]/request-revision
  - Write integration tests for PUT /api/cpap/[id]/progress
  - Test authorization failures (403) for FS and INTERVIEWER roles
  - Use test database for integration tests
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 16. Write E2E tests for complete woorkflows





  - Write E2E test for OFFICER creating and submitting CPAP
  - Write E2E test for ADMIN reviewing and approving CPAP
  - Write E2E test for ADMIN requesting revision
  - Write E2E test for OFFICER updating progress on approved CPAP
  - Write E2E test for permission denied scenarios (FS/INTERVIEWER access)
  - Use Playwright or Cypress for browser automation
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1, 7.1, 11.5_

- [x] 17. Remove AI roadmap from report cards





  - Remove "AI-Generated Action Roadmap" section from service area drill-down modal in src/app/reportcard/page.tsx
  - Remove AI recommendation display from executive summary section
  - Remove AI recommendations from CSV export functionality
  - Remove AI recommendations from PDF/print export
  - Keep all other analytics, funnel data, and visualizations intact
  - Update report card UI to reflect that action planning is now in CPAP module
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 18. Documentation and deployment preparation





  - Create user guide for OFFICER users on CPAP creation and submission
  - Document AI suggestions feature and how to use it
  - Create user guide for ADMIN users on CPAP review and monitoring
  - Document API endpoints in API documentation
  - Create deployment checklist with migration steps
  - Document rollback procedures
  - Update system architecture documentation
  - _Requirements: 9.5, 13.1, 13.2, 13.3, 13.4, 13.5_
