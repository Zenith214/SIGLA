PULSE User Guide

About PULSE

PULSE (Public Understanding and Local Service Evaluation) is a digital platform for collecting citizen feedback on local barangay government services in the Philippines. The system helps Municipal Local Governance Resource Centers (MLGRC) evaluate barangay performance, create data-driven action plans, and track governance improvements through surveys and analytics.

Key Features: Interactive dashboards, ML-powered analytics, survey management, CPAP (Citizen Priority Action Plan) creation, and role-based access control.

---

User Roles & Capabilities

1. ADMIN

What You Can Do:
- Manage survey cycles (create, activate, view historical data)
- Manage barangays (add, edit, demographics, logos)
- Create and manage user accounts with role assignments
- Assign Field Supervisors to barangays
- Set survey targets per barangay
- Review and approve CPAPs submitted by Officers
- Track SGLGB awardee status
- Export data and backups
- View all dashboards and analytics

How to Do It:

Create a Survey Cycle:
1. Go to Settings → Survey Cycles
2. Click "Create New Cycle"
3. Enter cycle name, year, start date, end date
4. Click "Save" then "Set as Active"

Add a Barangay:
1. Go to Settings → Barangays
2. Click "Add Barangay"
3. Fill in name, population, households, captain, description
4. Upload logo (optional)
5. Click "Save"

Create a User:
1. Go to Settings → Users & Roles
2. Click "Add User"
3. Enter name, email, password, phone, organization, job title
4. Select role (Admin, Developer, FS, Interviewer, Officer, Viewer)
5. For Officers: assign their barangay designation
6. Click "Save"

Assign Field Supervisor:
1. Go to Settings → Supervisor Assignments
2. Click "Create Assignment"
3. Select Field Supervisor, Barangay, and Survey Cycle
4. Click "Save"

Set Survey Targets:
1. Go to Settings → Survey Targets
2. Click "Add Target" or "Bulk Create Targets"
3. Select barangay, cycle, and target number
4. Click "Save"

Review CPAP:
1. Go to Admin → CPAP Review
2. Filter by status (Submitted)
3. Click on a CPAP to review
4. Check action items for clarity and feasibility
5. Add comments if needed
6. Click "Approve CPAP" or "Request Revision"

---

2. FIELD SUPERVISOR (FS)

What You Can Do:
- View dashboard for your assigned barangays only
- Create survey spots (collection locations)
- Assign interviewers to spots with quotas
- Monitor survey progress and interviewer performance
- View analytics for your barangays

How to Do It:

Create a Spot:
1. Go to Settings → Spots
2. Click "Create Spot"
3. Enter spot name (e.g., "Purok 1 - Main Road")
4. Select barangay and survey cycle
5. Enter GPS coordinates (optional)
6. Set random start number (1-999)
7. Set target respondents
8. Click "Save"

Assign Interviewer to Spot:
1. Go to Spots section
2. Find your spot
3. Click "Assign Interviewer"
4. Select interviewer from dropdown
5. Set quota (number of surveys)
6. Click "Save"

Monitor Progress:
1. Access your FS Dashboard
2. View completion percentage per barangay
3. Check spot-level progress
4. Track individual interviewer productivity
5. Identify spots falling behind schedule

---

3. INTERVIEWER

What You Can Do:
- View your assigned spots
- Conduct face-to-face surveys with citizens
- Use Kish Grid method for respondent selection
- Geotag survey locations
- Submit surveys online or offline
- Track your quota completion

How to Do It:

Start a Survey:
1. Log in and go to Survey page
2. Click "My Spots" tab
3. Select your assigned spot
4. Click "Start New Survey"

Use Kish Grid (Respondent Selection):
1. Ask: "How many people aged 18+ live here?"
2. Enter the number
3. List all eligible members by age (oldest to youngest)
4. System automatically selects one person
5. Interview only that person (no substitutions)

Complete the Survey:
1. Fill in all 6 service areas:
   - Financial Administration
   - Disaster Preparedness
   - Social Protection
   - Safety and Peace
   - Business-Friendly
   - Environmental Management
2. Answer awareness, availment, satisfaction, and need-for-action questions
3. System automatically skips irrelevant questions

Geotag Location:
1. When prompted, click "Get Current Location"
2. Allow browser to access your location
3. Wait for GPS accuracy under 20 meters
4. Verify coordinates are correct
5. If GPS unavailable, manually enter coordinates

Submit Survey:
1. Review all answers for completeness
2. Add remarks if needed
3. Click "Submit" (or "Save as Draft" to continue later)

Work Offline:
1. Surveys automatically save locally when offline
2. Continue surveying normally
3. When connection returns, surveys auto-sync
4. Check for sync notification before closing browser

---

4. OFFICER

What You Can Do:
- View survey results for your designated barangay
- View satisfaction index and service area scores
- Access detailed report card with AI-generated insights
- Create Citizen Priority Action Plans (CPAP)
- Use AI suggestions for action items
- Submit CPAP for admin review
- Track implementation progress
- Respond to admin feedback

How to Do It:

View Your Dashboard:
1. Log in (dashboard loads automatically)
2. Your barangay is highlighted on the map
3. View satisfaction index and service area scores
4. Click "View Report Card" for detailed analysis

Create a CPAP:
1. Go to CPAP page
2. System creates CPAP automatically if none exists
3. Click "Add Item" to manually add action items
4. Or click "Get AI Suggestions" for ML-powered recommendations

Add Action Item Manually:
1. Click "Add Item"
2. Select service area
3. Fill in required fields:
   - Results/Observations (what survey shows)
   - Plan of Action (strategy)
   - Activity (specific actions)
   - Output (required) - expected deliverable
   - Implementation Schedule
   - Financial Requirements
   - Responsible Person/Office
   - Means of Verification
4. Click "Save"

Use AI Suggestions:
1. Click "Get AI Suggestions"
2. Review suggestions organized by timeframe (short/medium/long-term)
3. Click "Add to CPAP" on relevant suggestions
4. Edit as needed
5. Click "Save"

Submit CPAP for Review:
1. Ensure all action items have required "Output" field filled
2. Click "Submit for Review"
3. Confirm submission
4. Status changes to "Submitted"
5. Wait for admin review

Respond to Admin Feedback:
1. Check Comments section for admin feedback
2. Make requested changes
3. Reply to comments explaining revisions
4. Click "Submit for Review" again

Track Implementation (After Approval):
1. Update "Actual Output" field with what was achieved
2. Update "Status of Accomplishment" (Ongoing/Delayed/Completed)
3. Enter "Actual Date" when completed
4. Update regularly (monthly recommended)

---

5. VIEWER

What You Can Do:
- View interactive dashboard (map and list views)
- View all barangay data and satisfaction scores
- Access analytics and reports
- View report cards
- Export data to CSV
- Cannot edit, create, or submit anything

How to Do It:

Navigate Dashboard:
1. Log in (dashboard loads automatically)
2. Hover over barangays on map for quick preview
3. Click barangay to lock selection and view details
4. Switch between Map View and List View

View Analytics:
1. Click Analytics tab
2. Explore:
   - Dashboard Summary (KPIs, leaderboards, trends)
   - Service Area Deep Dive (detailed performance)
   - Demographics Analytics (age, gender, occupation)
   - Award Leaderboard (SGLGB awardees)

View Report Card:
1. Click on a barangay
2. Click "View Report Card"
3. Review:
   - AI-generated executive summary
   - Service area scores
   - Community feedback
   - Demographics breakdown
   - Governance integrity metrics

Export Data:
1. Navigate to desired report or analytics
2. Click "Export to CSV"
3. File downloads automatically
4. Open in Excel or other spreadsheet software

---

6. DEVELOPER

What You Can Do:
- Same as Admin (full system access for testing and development)

---

Quick Reference

Login: Use your assigned email and password  
First-Time Login: You may be prompted to change your password  
Dashboard: Interactive map or list view of barangays  
Settings: Admin-only system configuration  
Logout: Click user menu → Logout  

Survey Cycle: All data is tied to the active survey cycle  
Offline Mode: Interviewers can survey without internet (auto-syncs later)  
CPAP Workflow: Draft → Submitted → Approved (or Revision Requested)  
Satisfaction Index: 0-100 score (80-100 Excellent, 60-79 Good, 40-59 Fair, 20-39 Poor, 0-19 Critical)

Support: Contact your system administrator for technical issues or training

---

Version 1.0 | January 7, 2026 | PULSE Development Team