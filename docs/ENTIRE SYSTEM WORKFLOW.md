# Complete System Workflow Diagram

This document provides a comprehensive end-to-end workflow of the entire system from admin setup through CPAP completion.

---

## 🎯 Complete System Flow Overview

```
PHASE 1: Admin Setup
    ↓
PHASE 2: Field Supervisor Operations
    ↓
PHASE 3: Interviewer Operations
    ↓
PHASE 4: Data Collection Monitoring
    ↓
PHASE 5: Survey Results & Analysis
    ↓
PHASE 6: CPAP Initiation (Barangay)
    ↓
PHASE 7: CPAP Development (Barangay)
    ↓
PHASE 8: CPAP Submission (Barangay)
    ↓
PHASE 9: CPAP Review (Admin/LGU)
    ↓
PHASE 10: CPAP Revision (If Needed)
    ↓
PHASE 11: CPAP Approval & Implementation
    ↓
PHASE 12: Cycle Completion & Reporting
```

---

## 📋 Detailed Workflow by Phase

### PHASE 1: ADMIN SETUP

```
[ADMIN LOGIN]
     │
     ├──► 1. CREATE SURVEY CYCLE
     │         │
     │         ├─ Set cycle name (e.g., "2025 Q1")
     │         ├─ Set start/end dates
     │         ├─ Set status (active/inactive)
     │         └─ Save cycle
     │
     ├──► 2. AWARD BARANGAYS TO CYCLE
     │         │
     │         ├─ Select survey cycle
     │         ├─ Choose barangays to include
     │         ├─ Set barangay-specific parameters
     │         └─ Confirm awards
     │
     ├──► 3. CREATE SURVEY TARGETS
     │         │
     │         ├─ Select barangay
     │         ├─ Set target respondents (n)
     │         ├─ Calculate Margin of Error (MOE)
     │         ├─ Set population size
     │         └─ Save targets
     │
     └──► 4. ASSIGN SUPERVISORS
               │
               ├─ Select barangay
               ├─ Choose Field Supervisor (FS)
               ├─ Grant FS permissions
               └─ Notify FS
```

### PHASE 2: FIELD SUPERVISOR OPERATIONS

```
[FIELD SUPERVISOR LOGIN]
     │
     ├──► 5. VIEW ASSIGNED BARANGAYS
     │         │
     │         ├─ See survey targets
     │         ├─ View deadlines
     │         └─ Check progress
     │
     ├──► 6. CREATE SPOTS (Survey Locations)
     │         │
     │         ├─ Define spot name/location
     │         ├─ Set spot coordinates (optional)
     │         ├─ Assign target per spot
     │         ├─ Add spot notes
     │         └─ Save spots
     │
     └──► 7. ASSIGN INTERVIEWERS
               │
               ├─ Select spot
               ├─ Choose Interviewer(s)
               ├─ Set interviewer quotas
               ├─ Grant interviewer access
               └─ Notify interviewers
```

### PHASE 3: INTERVIEWER OPERATIONS

```
[INTERVIEWER LOGIN]
     │
     ├──► 8. VIEW ASSIGNED SPOTS
     │         │
     │         ├─ See spot details
     │         ├─ View quotas
     │         └─ Check progress
     │
     ├──► 9. CONDUCT SURVEYS
     │         │
     │         ├─ Select spot
     │         ├─ Start new survey
     │         ├─ Collect respondent info
     │         ├─ Ask survey questions
     │         ├─ Record responses
     │         └─ Save draft (optional)
     │
     └──► 10. SUBMIT RESPONSES
               │
               ├─ Review completed survey
               ├─ Validate all fields
               ├─ Submit to system
               ├─ Confirm submission
               └─ Continue to next survey
```

### PHASE 4: DATA COLLECTION MONITORING

```
[FIELD SUPERVISOR / ADMIN]
     │
     ├──► 11. MONITOR PROGRESS
     │         │
     │         ├─ View completion rates
     │         ├─ Check spot-level progress
     │         ├─ Track interviewer performance
     │         └─ Identify bottlenecks
     │
     └──► 12. DATA VALIDATION
               │
               ├─ Review submitted surveys
               ├─ Check data quality
               ├─ Flag anomalies
               └─ Approve/reject submissions
```

### PHASE 5: SURVEY RESULTS & ANALYSIS

```
[SYSTEM AUTO-PROCESSING]
     │
     ├──► 13. AGGREGATE SURVEY DATA
     │         │
     │         ├─ Calculate satisfaction scores
     │         ├─ Compute barangay rankings
     │         ├─ Generate statistics
     │         └─ Identify priority issues
     │
     ├──► 14. GENERATE REPORT CARDS
     │         │
     │         ├─ Create barangay report cards
     │         ├─ Show satisfaction index
     │         ├─ Display service ratings
     │         ├─ Highlight top issues
     │         └─ Generate visualizations
     │
     └──► 15. UNLOCK CPAP ACCESS
               │
               ├─ Check survey completion (≥ target)
               ├─ Validate data quality
               ├─ Enable CPAP for barangay
               └─ Notify stakeholders
```

### PHASE 6: CPAP INITIATION (BARANGAY)

```
[BARANGAY OFFICIAL LOGIN]
     │
     ├──► 16. VIEW SURVEY RESULTS
     │         │
     │         ├─ Access report card
     │         ├─ Review satisfaction scores
     │         ├─ Analyze priority issues
     │         └─ Understand community needs
     │
     ├──► 17. START CPAP PROCESS
     │         │
     │         ├─ Click "Start CPAP"
     │         ├─ Review CPAP guidelines
     │         ├─ Understand requirements
     │         └─ Begin action planning
     │
     └──► 18. CREATE ACTION PLAN ITEMS
               │
               ├─ Identify priority issue
               ├─ Define action item title
               ├─ Write detailed description
               ├─ Set objectives/goals
               ├─ Define activities/strategies
               ├─ Assign responsible person
               ├─ Set timeline (start/end dates)
               ├─ Estimate budget
               ├─ Add supporting documents
               └─ Save item (draft)
```

### PHASE 7: CPAP DEVELOPMENT (BARANGAY)

```
[BARANGAY OFFICIAL]
     │
     ├──► 19. MANAGE ACTION ITEMS
     │         │
     │         ├─ Add multiple items (3-5 recommended)
     │         ├─ Edit existing items
     │         ├─ Delete items if needed
     │         ├─ Prioritize items
     │         └─ Track progress (0-100%)
     │
     ├──► 20. COLLABORATE WITH TEAM
     │         │
     │         ├─ Share draft with colleagues
     │         ├─ Gather feedback
     │         ├─ Refine action items
     │         └─ Ensure alignment
     │
     └──► 21. FINALIZE ACTION PLAN
               │
               ├─ Review all items
               ├─ Verify completeness
               ├─ Check budget totals
               ├─ Validate timelines
               └─ Prepare for submission
```

### PHASE 8: CPAP SUBMISSION (BARANGAY)

```
[BARANGAY OFFICIAL]
     │
     └──► 22. SUBMIT CPAP FOR REVIEW
               │
               ├─ Click "Submit for Review"
               ├─ Confirm submission
               ├─ Lock action plan (no more edits)
               ├─ Status changes to "SUBMITTED"
               └─ Notify admin/reviewers
```

### PHASE 9: CPAP REVIEW (ADMIN/LGU)

```
[ADMIN / LGU REVIEWER LOGIN]
     │
     ├──► 23. VIEW SUBMITTED CPAPs
     │         │
     │         ├─ Access CPAP monitoring dashboard
     │         ├─ See all submitted plans
     │         ├─ Filter by barangay/status
     │         └─ Prioritize reviews
     │
     ├──► 24. REVIEW ACTION PLAN
     │         │
     │         ├─ Open CPAP details
     │         ├─ Review each action item
     │         ├─ Check feasibility
     │         ├─ Validate budget estimates
     │         ├─ Assess timelines
     │         └─ Evaluate alignment with priorities
     │
     └──► 25. PROVIDE FEEDBACK
               │
               ├─ OPTION A: APPROVE
               │      │
               │      ├─ Add approval comments
               │      ├─ Click "Approve"
               │      ├─ Status → "APPROVED"
               │      └─ Notify barangay
               │
               ├─ OPTION B: REQUEST REVISIONS
               │      │
               │      ├─ Add detailed feedback
               │      ├─ Specify required changes
               │      ├─ Click "Request Revisions"
               │      ├─ Status → "REVISION_REQUESTED"
               │      └─ Notify barangay
               │
               └─ OPTION C: REJECT
                      │
                      ├─ Provide rejection reasons
                      ├─ Click "Reject"
                      ├─ Status → "REJECTED"
                      └─ Notify barangay
```

### PHASE 10: CPAP REVISION (IF NEEDED)

```
[BARANGAY OFFICIAL - If revisions requested]
     │
     ├──► 26. RECEIVE FEEDBACK
     │         │
     │         ├─ View reviewer comments
     │         ├─ Understand required changes
     │         └─ Plan revisions
     │
     ├──► 27. REVISE ACTION PLAN
     │         │
     │         ├─ Status → "IN_PROGRESS"
     │         ├─ Edit action items
     │         ├─ Address feedback points
     │         ├─ Update details as needed
     │         └─ Save changes
     │
     └──► 28. RESUBMIT CPAP
               │
               ├─ Click "Resubmit for Review"
               ├─ Status → "SUBMITTED"
               └─ Return to Phase 9 (Review)
```

### PHASE 11: CPAP APPROVAL & IMPLEMENTATION

```
[AFTER APPROVAL]
     │
     ├──► 29. CPAP APPROVED
     │         │
     │         ├─ Status: "APPROVED"
     │         ├─ Barangay receives notification
     │         ├─ Action plan is locked
     │         └─ Implementation can begin
     │
     ├──► 30. IMPLEMENT ACTION ITEMS
     │         │
     │         ├─ Execute planned activities
     │         ├─ Track progress (0-100%)
     │         ├─ Update item status
     │         ├─ Document milestones
     │         └─ Report challenges
     │
     └──► 31. MONITOR IMPLEMENTATION
               │
               ├─ Admin/LGU tracks progress
               ├─ Review progress updates
               ├─ Provide support as needed
               ├─ Verify completion
               └─ Measure impact
```

### PHASE 12: CYCLE COMPLETION & REPORTING

```
[SYSTEM / ADMIN]
     │
     ├──► 32. GENERATE FINAL REPORTS
     │         │
     │         ├─ Compile all CPAP data
     │         ├─ Analyze implementation rates
     │         ├─ Measure outcomes
     │         ├─ Create executive summaries
     │         └─ Generate insights
     │
     ├──► 33. EVALUATE CYCLE SUCCESS
     │         │
     │         ├─ Review barangay participation
     │         ├─ Assess action plan quality
     │         ├─ Measure community impact
     │         └─ Identify lessons learned
     │
     └──► 34. PREPARE NEXT CYCLE
               │
               ├─ Archive current cycle data
               ├─ Plan improvements
               ├─ Update survey questions
               └─ Return to Phase 1 (Admin Setup)
```

---

## 👥 User Roles & Permissions

| Role | Key Responsibilities | Access Level |
|------|---------------------|--------------|
| **Admin** | Survey cycle setup, barangay awards, supervisor assignment, system monitoring | Full system access |
| **Field Supervisor (FS)** | Spot creation, interviewer assignment, progress monitoring | Assigned barangays only |
| **Interviewer** | Survey data collection, response submission | Assigned spots only |
| **Barangay Official** | CPAP creation, action planning, implementation tracking | Own barangay only |
| **LGU Reviewer** | CPAP review, approval/rejection, feedback provision | All barangays in jurisdiction |

---

## 🔄 Status Flow Diagrams

### Survey Cycle Status
```
DRAFT → ACTIVE → COMPLETED → ARCHIVED
```

### CPAP Status Flow
```
NOT_STARTED → IN_PROGRESS → SUBMITTED → REVISION_REQUESTED → SUBMITTED → APPROVED
                                    ↓
                                REJECTED
```

### Action Item Status
```
DRAFT → PLANNED → IN_PROGRESS → COMPLETED → VERIFIED
```

---

## 🎯 Key Decision Points

### 1. Survey Target Achievement
- **Condition**: Responses ≥ Target
- **Action**: Unlock CPAP access for barangay
- **Fallback**: Continue data collection

### 2. CPAP Submission Readiness
- **Condition**: At least 1 action item created
- **Action**: Allow submission
- **Fallback**: Prompt to add items

### 3. CPAP Review Decision
- **Options**: Approve / Request Revisions / Reject
- **Factors**: Feasibility, budget, alignment, completeness
- **Outcome**: Status change + notification

### 4. Revision Cycle
- **Trigger**: Revision requested
- **Action**: Unlock for editing
- **Limit**: No hard limit on revision cycles

---

## ✅ Testing Workflow Checklist

Use this checklist to test the complete system workflow:

**Phase 1: Admin Setup**
- [ ] Admin creates survey cycle
- [ ] Admin awards barangays to cycle
- [ ] Admin sets survey targets with MOE calculation
- [ ] Admin assigns field supervisors

**Phase 2: Field Supervisor Operations**
- [ ] FS logs in and views assigned barangays
- [ ] FS creates spots for survey locations
- [ ] FS assigns interviewers to spots

**Phase 3: Interviewer Operations**
- [ ] Interviewer logs in and views assigned spots
- [ ] Interviewer conducts surveys and submits responses

**Phase 4: Data Collection Monitoring**
- [ ] FS/Admin monitors progress dashboard
- [ ] Data validation and quality checks

**Phase 5: Survey Results & Analysis**
- [ ] System generates report cards after target met
- [ ] CPAP access unlocked for barangay

**Phase 6: CPAP Initiation**
- [ ] Barangay official views survey results
- [ ] Barangay official starts CPAP process

**Phase 7: CPAP Development**
- [ ] Barangay official creates action plan items
- [ ] Barangay official edits and manages items

**Phase 8: CPAP Submission**
- [ ] Barangay official submits CPAP for review

**Phase 9: CPAP Review**
- [ ] Admin/LGU reviewer accesses monitoring dashboard
- [ ] Reviewer reviews submitted CPAP
- [ ] Reviewer approves/requests revisions/rejects

**Phase 10: CPAP Revision (if needed)**
- [ ] Barangay revises and resubmits

**Phase 11: CPAP Implementation**
- [ ] Approved CPAP tracked for implementation

**Phase 12: Cycle Completion**
- [ ] Final reports generated

---

## 🔗 Integration Points

### Database Tables Involved
- `survey_cycles` - Survey cycle management
- `barangay_awards` - Barangay-cycle relationships
- `survey_targets` - Target respondents per barangay
- `spots` - Survey locations
- `spot_assignments` - Interviewer-spot relationships
- `survey_responses` - Collected survey data
- `cpap_action_plans` - CPAP master records
- `cpap_action_items` - Individual action items
- `cpap_reviews` - Review history and feedback

### API Endpoints
- `/api/admin/survey-cycles` - Cycle CRUD
- `/api/admin/barangay-awards` - Award management
- `/api/admin/survey-targets` - Target management
- `/api/fs/spots` - Spot management
- `/api/fs/assignments` - Interviewer assignments
- `/api/interviewer/surveys` - Survey submission
- `/api/cpap/action-plans` - CPAP CRUD
- `/api/cpap/action-items` - Action item CRUD
- `/api/cpap/submit` - CPAP submission
- `/api/cpap/review` - CPAP review actions

---

## 📊 Visual Flow Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE SYSTEM FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ADMIN                    FIELD SUPERVISOR           INTERVIEWER
      │                            │                         │
      ├─ Create Cycle              │                         │
      ├─ Award Barangays           │                         │
      ├─ Set Targets               │                         │
      ├─ Assign Supervisors ──────►│                         │
      │                            │                         │
      │                            ├─ Create Spots           │
      │                            ├─ Assign Interviewers ──►│
      │                            │                         │
      │                            │                         ├─ Conduct Surveys
      │                            │                         ├─ Submit Responses
      │                            │                         │
      │◄───────────────────────────┴─────────────────────────┘
      │                     (Data Collection Complete)
      │
      ├─ Generate Report Cards
      ├─ Unlock CPAP Access
      │
      ▼

    BARANGAY OFFICIAL              ADMIN/LGU REVIEWER
      │                                   │
      ├─ View Survey Results              │
      ├─ Start CPAP                       │
      ├─ Create Action Items              │
      ├─ Submit CPAP ────────────────────►│
      │                                   │
      │                                   ├─ Review CPAP
      │                                   ├─ Approve/Revise/Reject
      │◄──────────────────────────────────┤
      │         (If Revision Needed)      │
      │                                   │
      ├─ Revise & Resubmit ──────────────►│
      │                                   │
      │◄──────────────────────────────────┤
      │            (Approved)             │
      │                                   │
      ├─ Implement Action Items           │
      ├─ Track Progress                   │
      │                                   ├─ Monitor Implementation
      │                                   ├─ Generate Reports
      │                                   │
      ▼                                   ▼
   (Cycle Complete)              (Evaluation & Next Cycle)
```

---

## 📝 Notes

- This workflow represents the complete end-to-end system flow
- Each phase builds on the previous phase
- User permissions are enforced at each step
- Status transitions are tracked and auditable
- Notifications keep stakeholders informed
- The system supports multiple concurrent survey cycles
- CPAP can be revised multiple times before approval
- Implementation tracking continues post-approval
- All data is stored in the database for reporting and analysis

---

## 🚀 Quick Start Testing Path

For rapid system testing, follow this minimal path:

1. **Admin**: Create cycle → Award 1 barangay → Set target (n=5) → Assign FS
2. **FS**: Create 1 spot → Assign 1 interviewer
3. **Interviewer**: Submit 5 surveys
4. **System**: Auto-generate report card → Unlock CPAP
5. **Barangay**: View results → Create 2 action items → Submit CPAP
6. **Admin**: Review → Approve
7. **Barangay**: Track progress

This minimal path tests all major system components in under 30 minutes.
