Final Technical Specification: PULSE System Internal CPAP Module (v4.3)

### 1. OVERALL OBJECTIVE ###

This document details the required upgrades to the PULSE system to integrate a digital Citizen Priority Action Plan (CPAP) module for internal government use. The system will be modified to support a clear workflow for LGU action planning and DILG monitoring. Public-facing components are explicitly excluded. The VIEWER role will be repurposed and renamed to OFFICER.

### 2. ROLE MODIFICATIONS & CAPABILITIES (CRITICAL UPDATE) ###

The user roles and their capabilities are now strictly defined for internal operations:

# 2.1. ADMIN (System Owner / DILG)

    Status: Unchanged, with an explicit new UI element for CPAP management.

    UI Change: A new button or menu item labeled "CPAP Management" must be added to the main account menu or navigation bar within the Admin dashboard.

    CPAP Capabilities:

        Access: Clicking the "CPAP Management" button navigates to the CPAP review and monitoring dashboard.

        Review & Approve: Receives and reviews all submitted CPAPs. Can [Approve] a plan or [Request Revision] with comments.

        Monitoring: Tracks progress updates submitted by OFFICER users on their approved CPAPs.

        Full Oversight: Can view all CPAPs in any status across all barangays and cycles.

# 2.2. FIELD SUPERVISOR (FS) (LRI Team Lead)

    Status: This role is strictly for fieldwork management and has no governance function.

    CPAP Capabilities: None. (The capabilities for this role are the same as the INTERVIEWER role regarding the CPAP module – they have no access and no visibility into it. Their work concludes after data submission.)

# 2.3. INTERVIEWER (Enumerator)

    Status: Unchanged.

    CPAP Capabilities: None.

# 2.4. OFFICER (LGU Official - Formerly VIEWER)

    Role Definition: The VIEWER role is hereby renamed to OFFICER. This role represents the authorized LGU official responsible for action planning.

    UI Change: A new button or menu item labeled "CPAP Submission" must be added to the main account menu or navigation bar within the Officer dashboard.

    CPAP Capabilities:

        Access: Clicking the "CPAP Submission" button navigates to the CPAP creation/editing interface for their assigned barangay.

        Create/Edit: Can create and edit their CPAP while it is in "Draft" status. The form will be pre-populated based on survey results.

        Submit: Can submit the final CPAP for review, which notifies the ADMIN.

        Update Progress: After ADMIN approval, can update the progress-related fields (actual_output, accomplishment_status, etc.) on an ongoing basis.

# 2.5. PUBLIC Role (REMOVED)

    Action: All development related to a public-facing portal or an unauthenticated "Public Viewer" role is to be excluded. The system is for internal use only.

### 3. CPAP MODULE: TECHNICAL IMPLEMENTATION (Internal Workflow) ###

# 3.1. Database Schema

    The cpaps and cpap_items table structures remain the same as specified in v4.1.

# 3.2. OFFICER Dashboard: The CPAP Creator/Editor

    Access Point: The user must access this interface via the new "CPAP Submission" button in their account menu.

    Workflow:

        The interface loads the CPAP for the Officer's barangay and the active cycle.

        If the CPAP status is "Draft", all fields are editable. The primary action button is [Submit to DILG for Review].

        If the CPAP status is "Submitted", the form is read-only.

        If the CPAP status is "Approved", the form is mostly read-only, but the specific progress-tracking fields are enabled for editing. The primary action button is [Save Progress Update].

# 3.3. ADMIN Dashboard: The CPAP Review & Monitoring Workflow

    Access Point: The user must access this interface via the new "CPAP Management" button in their account menu.

    Workflow:

        The dashboard displays a list of all CPAPs, filterable by status (e.g., show all "Submitted" plans).

        Clicking a submitted plan opens the review interface with the [Approve] and [Request Revision] action buttons.

        The dashboard must also have a "Monitoring" view to see a high-level summary of progress updates from all approved CPAPs.

# 3.4. API and Security

    All API endpoints related to the CPAP module must be protected and require authentication.

    Role-Based Access Control (RBAC) must be strictly enforced on the backend:

        GET /api/cpap/:id: An OFFICER can only access this if the :id belongs to their assigned barangay. An ADMIN can access any :id. An FS or INTERVIEWER must receive a 403 Forbidden error.

        POST /api/cpap/:id/submit: Can only be triggered by the assigned OFFICER.

        POST /api/cpap/:id/approve: Can only be triggered by an ADMIN.