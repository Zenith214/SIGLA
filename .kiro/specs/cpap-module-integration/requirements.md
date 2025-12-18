# Requirements Document

## Introduction

The PULSE system requires integration of a digital Citizen Priority Action Plan (CPAP) module for internal government use. This module enables LGU officials to create action plans based on survey results, submit them for DILG review and approval, and track implementation progress. The system will support a clear workflow: OFFICER users (LGU officials) create and submit CPAPs, ADMIN users (DILG) review and approve them, and OFFICER users update progress on approved plans. The VIEWER role will be repurposed and renamed to OFFICER. All public-facing components are explicitly excluded from this internal-only system.

## Glossary

- **PULSE_System**: The Public Understanding and Local Service Evaluation system that collects and analyzes citizen feedback
- **CPAP_Module**: The Citizen Priority Action Plan digital module within PULSE for action planning and monitoring
- **OFFICER_User**: An authenticated LGU official user (formerly VIEWER role) responsible for creating and updating CPAPs for their assigned barangay
- **ADMIN_User**: An authenticated DILG user with system administration privileges who reviews and approves CPAPs
- **FS_User**: A Field Supervisor user who manages fieldwork but has no CPAP access
- **INTERVIEWER_User**: An enumerator user who collects survey data but has no CPAP access
- **CPAP_Record**: A complete action plan document containing multiple action items for a specific barangay and survey cycle
- **CPAP_Item**: An individual action entry within a CPAP record with target outputs, timelines, and progress tracking
- **Draft_Status**: A CPAP state where the OFFICER_User can edit all fields before submission
- **Submitted_Status**: A CPAP state where the plan awaits ADMIN_User review and is read-only to OFFICER_User
- **Approved_Status**: A CPAP state where the plan is accepted and OFFICER_User can update progress fields
- **Revision_Requested_Status**: A CPAP state where ADMIN_User has requested changes and OFFICER_User must revise
- **Survey_Cycle**: A specific time period during which survey data is collected and analyzed
- **Barangay**: The smallest administrative division in the Philippines, equivalent to a village or district
- **RBAC**: Role-Based Access Control mechanism that restricts system access based on user roles

## Requirements

### Requirement 1

**User Story:** As an OFFICER user, I want to access a CPAP creation interface from my dashboard, so that I can develop an action plan for my barangay based on survey results.

#### Acceptance Criteria

1. WHEN the OFFICER_User logs into the PULSE_System, THE PULSE_System SHALL display a "CPAP Submission" button in the main account menu or navigation bar
2. WHEN the OFFICER_User clicks the "CPAP Submission" button, THE PULSE_System SHALL navigate to the CPAP creation interface for the OFFICER_User's assigned barangay and active Survey_Cycle
3. WHERE the CPAP_Record does not exist for the barangay and Survey_Cycle, THE PULSE_System SHALL create a new CPAP_Record with Draft_Status
4. WHERE the CPAP_Record exists with Draft_Status, THE PULSE_System SHALL display all fields as editable
5. WHERE the CPAP_Record exists with Submitted_Status, THE PULSE_System SHALL display all fields as read-only

### Requirement 2

**User Story:** As an OFFICER user, I want to create and edit CPAP items while in draft status, so that I can develop a comprehensive action plan before submitting it for review.

#### Acceptance Criteria

1. WHILE the CPAP_Record has Draft_Status, THE PULSE_System SHALL allow the OFFICER_User to add new CPAP_Item entries
2. WHILE the CPAP_Record has Draft_Status, THE PULSE_System SHALL allow the OFFICER_User to edit existing CPAP_Item entries
3. WHILE the CPAP_Record has Draft_Status, THE PULSE_System SHALL allow the OFFICER_User to delete CPAP_Item entries
4. WHILE the CPAP_Record has Draft_Status, THE PULSE_System SHALL display an "AI Suggestions" button that generates recommended action items
5. WHEN the OFFICER_User saves changes to a CPAP_Record with Draft_Status, THE PULSE_System SHALL persist the changes to the database within 2 seconds

### Requirement 2A

**User Story:** As an OFFICER user, I want to optionally use AI-generated suggestions to help create my CPAP, so that I can leverage data-driven insights while maintaining full control over the final plan.

#### Acceptance Criteria

1. WHEN the OFFICER_User clicks the "AI Suggestions" button, THE PULSE_System SHALL generate action recommendations based on survey analytics for the barangay and cycle
2. THE PULSE_System SHALL display AI-generated suggestions in a preview modal with short-term, medium-term, and long-term recommendations
3. THE PULSE_System SHALL provide an "Use These Suggestions" button that pre-fills CPAP_Item entries with AI recommendations
4. WHEN the OFFICER_User clicks "Use These Suggestions", THE PULSE_System SHALL create CPAP_Item entries from AI recommendations without automatically saving
5. THE PULSE_System SHALL allow the OFFICER_User to edit or delete AI-generated items before saving the CPAP_Record

### Requirement 3

**User Story:** As an OFFICER user, I want to submit my completed CPAP for DILG review, so that I can obtain approval to proceed with implementation.

#### Acceptance Criteria

1. WHILE the CPAP_Record has Draft_Status, THE PULSE_System SHALL display a "Submit to DILG for Review" button
2. WHEN the OFFICER_User clicks the "Submit to DILG for Review" button, THE PULSE_System SHALL validate that all required CPAP_Item fields are completed
3. IF validation fails, THEN THE PULSE_System SHALL display specific error messages indicating which fields require completion
4. WHEN validation succeeds and the OFFICER_User confirms submission, THE PULSE_System SHALL change the CPAP_Record status to Submitted_Status
5. WHEN the CPAP_Record status changes to Submitted_Status, THE PULSE_System SHALL send a notification to all ADMIN_User accounts

### Requirement 4

**User Story:** As an ADMIN user, I want to access a CPAP management dashboard from my account menu, so that I can review and monitor all submitted action plans.

#### Acceptance Criteria

1. WHEN the ADMIN_User logs into the PULSE_System, THE PULSE_System SHALL display a "CPAP Management" button in the main account menu or navigation bar
2. WHEN the ADMIN_User clicks the "CPAP Management" button, THE PULSE_System SHALL navigate to the CPAP review and monitoring dashboard
3. THE PULSE_System SHALL display a list of all CPAP_Record entries with their current status, barangay name, and submission date
4. THE PULSE_System SHALL provide filter controls to display CPAP_Record entries by status (Draft_Status, Submitted_Status, Approved_Status, Revision_Requested_Status)
5. THE PULSE_System SHALL provide search functionality to locate CPAP_Record entries by barangay name or Survey_Cycle

### Requirement 5

**User Story:** As an ADMIN user, I want to review submitted CPAPs and either approve them or request revisions, so that I can ensure action plans meet quality standards before implementation.

#### Acceptance Criteria

1. WHEN the ADMIN_User clicks on a CPAP_Record with Submitted_Status, THE PULSE_System SHALL display the complete CPAP_Record in a review interface
2. THE PULSE_System SHALL display an "Approve" button and a "Request Revision" button in the review interface
3. WHEN the ADMIN_User clicks the "Approve" button, THE PULSE_System SHALL change the CPAP_Record status to Approved_Status and notify the OFFICER_User
4. WHEN the ADMIN_User clicks the "Request Revision" button, THE PULSE_System SHALL display a comment field for revision instructions
5. WHEN the ADMIN_User submits revision comments, THE PULSE_System SHALL change the CPAP_Record status to Revision_Requested_Status and notify the OFFICER_User with the comments

### Requirement 6

**User Story:** As an OFFICER user, I want to revise my CPAP when changes are requested, so that I can address DILG feedback and resubmit for approval.

#### Acceptance Criteria

1. WHEN the CPAP_Record status changes to Revision_Requested_Status, THE PULSE_System SHALL send a notification to the OFFICER_User with ADMIN_User comments
2. WHILE the CPAP_Record has Revision_Requested_Status, THE PULSE_System SHALL display all fields as editable to the OFFICER_User
3. WHILE the CPAP_Record has Revision_Requested_Status, THE PULSE_System SHALL display the ADMIN_User revision comments prominently in the interface
4. WHILE the CPAP_Record has Revision_Requested_Status, THE PULSE_System SHALL display a "Resubmit to DILG" button
5. WHEN the OFFICER_User clicks the "Resubmit to DILG" button after making revisions, THE PULSE_System SHALL change the CPAP_Record status to Submitted_Status

### Requirement 7

**User Story:** As an OFFICER user, I want to update progress on approved CPAP items, so that I can track implementation status and keep DILG informed of accomplishments.

#### Acceptance Criteria

1. WHILE the CPAP_Record has Approved_Status, THE PULSE_System SHALL display progress-tracking fields (actual_output, accomplishment_status, remarks) as editable
2. WHILE the CPAP_Record has Approved_Status, THE PULSE_System SHALL display all other CPAP_Item fields as read-only
3. WHILE the CPAP_Record has Approved_Status, THE PULSE_System SHALL display a "Save Progress Update" button
4. WHEN the OFFICER_User clicks the "Save Progress Update" button, THE PULSE_System SHALL persist the progress updates to the database within 2 seconds
5. WHEN progress updates are saved, THE PULSE_System SHALL record the update timestamp and make it visible to ADMIN_User

### Requirement 8

**User Story:** As an ADMIN user, I want to monitor progress updates on approved CPAPs, so that I can track implementation across all barangays.

#### Acceptance Criteria

1. THE PULSE_System SHALL provide a "Monitoring" view within the CPAP management dashboard
2. THE PULSE_System SHALL display a summary of all CPAP_Record entries with Approved_Status in the monitoring view
3. THE PULSE_System SHALL display progress indicators showing completion percentage for each CPAP_Record
4. WHEN the ADMIN_User clicks on a CPAP_Record in the monitoring view, THE PULSE_System SHALL display detailed progress information for all CPAP_Item entries
5. THE PULSE_System SHALL display the last update timestamp for each CPAP_Record in the monitoring view

### Requirement 9

**User Story:** As a system administrator, I want the VIEWER role renamed to OFFICER throughout the system, so that the role name accurately reflects its governance responsibilities.

#### Acceptance Criteria

1. THE PULSE_System SHALL rename the VIEWER role to OFFICER in the database schema
2. THE PULSE_System SHALL display "OFFICER" instead of "VIEWER" in all user interface elements
3. THE PULSE_System SHALL update all API endpoints to use "OFFICER" role designation
4. THE PULSE_System SHALL migrate existing VIEWER_User accounts to OFFICER_User accounts without data loss
5. THE PULSE_System SHALL update all documentation and help text to reference OFFICER instead of VIEWER

### Requirement 10

**User Story:** As a security administrator, I want strict role-based access control on all CPAP endpoints, so that users can only access data appropriate to their role and assigned barangay.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access any CPAP API endpoint, THE PULSE_System SHALL return HTTP 401 Unauthorized error
2. WHEN an OFFICER_User attempts to access a CPAP_Record not assigned to their barangay, THE PULSE_System SHALL return HTTP 403 Forbidden error
3. WHEN an FS_User or INTERVIEWER_User attempts to access any CPAP API endpoint, THE PULSE_System SHALL return HTTP 403 Forbidden error
4. THE PULSE_System SHALL allow ADMIN_User to access any CPAP_Record regardless of barangay assignment
5. THE PULSE_System SHALL log all access attempts to CPAP endpoints with user identification, timestamp, and result

### Requirement 11

**User Story:** As an FS user or INTERVIEWER user, I want no visibility into the CPAP module, so that I can focus on my fieldwork responsibilities without distraction.

#### Acceptance Criteria

1. WHEN an FS_User logs into the PULSE_System, THE PULSE_System SHALL not display any CPAP-related buttons or menu items
2. WHEN an INTERVIEWER_User logs into the PULSE_System, THE PULSE_System SHALL not display any CPAP-related buttons or menu items
3. THE PULSE_System SHALL exclude CPAP_Module functionality from the FS_User dashboard
4. THE PULSE_System SHALL exclude CPAP_Module functionality from the INTERVIEWER_User dashboard
5. IF an FS_User or INTERVIEWER_User attempts direct URL access to CPAP pages, THEN THE PULSE_System SHALL redirect to their role-appropriate dashboard

### Requirement 12

**User Story:** As a system architect, I want the CPAP module to integrate with existing survey cycle and barangay data structures, so that action plans are properly scoped and contextualized.

#### Acceptance Criteria

1. THE PULSE_System SHALL create CPAP_Record entries with foreign key references to existing Survey_Cycle records
2. THE PULSE_System SHALL create CPAP_Record entries with foreign key references to existing Barangay records
3. THE PULSE_System SHALL enforce referential integrity between CPAP_Record and Survey_Cycle tables
4. THE PULSE_System SHALL enforce referential integrity between CPAP_Record and Barangay tables
5. THE PULSE_System SHALL prevent deletion of Survey_Cycle or Barangay records that have associated CPAP_Record entries

### Requirement 13

**User Story:** As a system architect, I want proper database schema for CPAP storage, so that action plan data is structured, queryable, and maintainable.

#### Acceptance Criteria

1. THE PULSE_System SHALL create a cpaps table with fields for id, barangay_id, cycle_id, status, created_at, updated_at, submitted_at, approved_at, and admin_comments
2. THE PULSE_System SHALL create a cpap_items table with fields for id, cpap_id, priority_area, target_output, success_indicator, responsible_person, timeline_start, timeline_end, actual_output, accomplishment_status, and remarks
3. THE PULSE_System SHALL enforce a one-to-many relationship between cpaps and cpap_items tables
4. THE PULSE_System SHALL create appropriate indexes on barangay_id, cycle_id, and status fields in the cpaps table
5. THE PULSE_System SHALL implement database constraints to ensure status field contains only valid values (Draft, Submitted, Approved, Revision_Requested)

### Requirement 14

**User Story:** As a system architect, I want to remove AI roadmap display from report cards, so that action planning is centralized in the CPAP module.

#### Acceptance Criteria

1. THE PULSE_System SHALL remove the "AI-Generated Action Roadmap" section from service area drill-down modals in report cards
2. THE PULSE_System SHALL remove AI recommendation display from the executive summary section in report cards
3. THE PULSE_System SHALL retain AI recommendation generation capability for use by the CPAP module
4. THE PULSE_System SHALL maintain all other report card analytics and visualizations unchanged
5. THE PULSE_System SHALL update report card export functionality to exclude AI recommendations
