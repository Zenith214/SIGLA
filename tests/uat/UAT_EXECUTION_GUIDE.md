# UAT Execution Guide
## CSIS Workflow Upgrade - Step-by-Step Instructions

**Version**: 1.0  
**Date**: November 17, 2025  
**Status**: Ready for Execution  
**Task**: 12.3 - Conduct user acceptance testing

---

## Executive Summary

This guide provides step-by-step instructions for executing the User Acceptance Testing (UAT) for the CSIS workflow upgrade. All preparation work has been completed - this document guides you through the actual execution with real field staff.

### What's Ready

✅ **UAT Plan** - Complete framework (`UAT_PLAN.md`)  
✅ **Feedback Forms** - FI and FS questionnaires ready  
✅ **Templates** - Daily debrief and issue log prepared  
✅ **Training Materials** - Referenced in training guides  
✅ **Documentation** - All support materials available  

### What You'll Do

1. **Week 1**: Set up environment and recruit participants
2. **Week 2, Day 1**: Conduct training sessions
3. **Week 2, Days 2-4**: Execute pilot testing
4. **Week 2, Day 5**: Analyze feedback and make decision
5. **Week 3**: Remediate issues if needed

---

## Pre-Execution Checklist

### Technical Setup

- [ ] Staging environment configured and tested
- [ ] Test user accounts created (10 FIs, 3 FSs, 1 Admin)
- [ ] Test barangays prepared with assigned spots
- [ ] GPS verification enabled and configured
- [ ] Offline mode tested and working
- [ ] All CSIS features enabled and verified

### Participant Recruitment

- [ ] 6-10 Field Interviewers recruited
- [ ] 2-3 Field Supervisors recruited
- [ ] Availability confirmed for pilot dates
- [ ] Pre-training materials sent
- [ ] Logistics arranged (venue, meals, transport)


### Materials Preparation

- [ ] FI Training Guide printed (10 copies)
- [ ] FS Training Guide printed (3 copies)
- [ ] Quick Reference Cards printed and laminated (10 copies)
- [ ] Kish Grid Tables printed and laminated (10 copies)
- [ ] GPS Troubleshooting Guide printed (10 copies)
- [ ] FI Feedback Forms printed (10 copies)
- [ ] FS Feedback Forms printed (3 copies)
- [ ] Daily Debrief Templates printed (5 copies)
- [ ] Issue Log Template printed (1 copy)
- [ ] PowerPoint presentations prepared
- [ ] Sample scenarios ready

### Equipment Preparation

- [ ] 6-10 mobile devices charged and configured
- [ ] 2-3 laptops charged and configured
- [ ] Power banks available
- [ ] Charging cables packed
- [ ] WiFi hotspot ready (backup)
- [ ] Projector tested
- [ ] Whiteboard/flip chart available
- [ ] Markers available
- [ ] Name tags prepared
- [ ] Sign-in sheets printed

### Venue Setup

- [ ] Training venue booked
- [ ] Tables and chairs arranged
- [ ] Projector and screen set up
- [ ] WiFi tested
- [ ] Power outlets accessible
- [ ] Refreshments arranged
- [ ] Restroom locations noted

---

## Week 1: Preparation Phase

### Day 1-2: Technical Setup

**Objective**: Ensure staging environment is ready for UAT

#### Morning Tasks

1. **Access Staging Environment**
   - URL: `https://staging.sigla-system.com`
   - Verify all services running
   - Check database connectivity

2. **Create Test Accounts**
   ```
   FI Accounts:
   - FI-UAT-01 through FI-UAT-10
   - Password: [Set secure password]
   - Role: Field Interviewer
   
   FS Accounts:
   - FS-UAT-01 through FS-UAT-03
   - Password: [Set secure password]
   - Role: Field Supervisor
   
   Admin Account:
   - ADMIN-UAT
   - Password: [Set secure password]
   - Role: Administrator
   ```

3. **Prepare Test Barangays**
   - Create 3-5 test barangays
   - Assign spots with GPS coordinates
   - Ensure realistic household data
   - Mix urban and rural settings


#### Afternoon Tasks

4. **Test All CSIS Features**
   - [ ] 6-section randomization working
   - [ ] Kish Grid selection functioning
   - [ ] GPS capture operational
   - [ ] GPS verification dashboard accessible
   - [ ] Offline mode working
   - [ ] Sync functioning properly

5. **Configure GPS Verification**
   - Set threshold to 200 meters (default)
   - Test flagging logic
   - Verify dual-pin map display
   - Check distance calculations

6. **Prepare Test Data**
   - Generate questionnaire numbers (1-50)
   - Create sample household data
   - Set up assigned spots
   - Verify data integrity

#### End of Day

- [ ] Document any issues found
- [ ] Fix critical issues
- [ ] Confirm environment ready
- [ ] Update UAT coordinator

### Day 3-4: Participant Recruitment

**Objective**: Recruit and prepare participants for UAT

#### Recruitment Criteria

**Field Interviewers (6-10)**:
- 2-3 new FIs (less than 6 months experience)
- 3-4 experienced FIs (6 months - 2 years)
- 1-2 veteran FIs (2+ years)
- Comfortable with mobile devices
- Available for 2-day pilot (Days 2-4)
- Willing to provide detailed feedback

**Field Supervisors (2-3)**:
- Experience supervising field operations
- Familiar with quality control concepts
- Available for pilot period
- Comfortable with web dashboards

#### Recruitment Process

1. **Identify Candidates**
   - Review FI/FS roster
   - Select mix of experience levels
   - Check availability
   - Confirm interest

2. **Send Invitations**
   - Email invitation with:
     - UAT purpose and importance
     - Time commitment (2-3 days)
     - Training schedule
     - Pilot testing dates
     - Compensation/incentives
     - Contact information

3. **Confirm Participation**
   - Follow up within 24 hours
   - Confirm availability
   - Send pre-training materials
   - Provide logistics details


#### Pre-Training Materials

Send to participants 2-3 days before training:

**For FIs**:
- Overview of CSIS methodology
- What to expect during training
- Pilot testing schedule
- Quick reference card (PDF)
- Contact information

**For FSs**:
- Overview of GPS verification
- What to expect during training
- Review schedule
- Dashboard access instructions
- Contact information

### Day 5: Final Preparation

**Objective**: Ensure everything is ready for training day

#### Morning Tasks

1. **Print All Materials**
   - [ ] Training guides (13 copies total)
   - [ ] Quick reference cards (10 copies, laminated)
   - [ ] Kish Grid tables (10 copies, laminated)
   - [ ] GPS troubleshooting guides (10 copies)
   - [ ] Feedback forms (13 copies)
   - [ ] Daily debrief templates (5 copies)
   - [ ] Issue log template (1 copy)
   - [ ] Sign-in sheets (2 copies)
   - [ ] Name tags (13 tags)

2. **Prepare Devices**
   - [ ] Charge all mobile devices (100%)
   - [ ] Install/update SIGLA app
   - [ ] Configure staging environment URL
   - [ ] Test GPS functionality
   - [ ] Test offline mode
   - [ ] Label devices (FI-01 through FI-10)
   - [ ] Prepare power banks
   - [ ] Pack charging cables

3. **Prepare Laptops**
   - [ ] Charge all laptops (100%)
   - [ ] Test browser access to staging
   - [ ] Bookmark GPS verification dashboard
   - [ ] Test map display
   - [ ] Label laptops (FS-01 through FS-03)

#### Afternoon Tasks

4. **Set Up Training Venue**
   - [ ] Arrange tables and chairs
   - [ ] Set up projector and screen
   - [ ] Test projector with laptop
   - [ ] Test WiFi connectivity
   - [ ] Test power outlets
   - [ ] Set up whiteboard/flip chart
   - [ ] Place markers and erasers
   - [ ] Arrange refreshments area
   - [ ] Post directional signs

5. **Test Equipment**
   - [ ] Projector displays correctly
   - [ ] Audio working (if needed)
   - [ ] WiFi reaches all areas
   - [ ] Mobile devices connect to WiFi
   - [ ] Laptops connect to WiFi
   - [ ] Backup hotspot tested

6. **Final Confirmations**
   - [ ] Send reminder emails to participants
   - [ ] Confirm venue booking
   - [ ] Confirm refreshments delivery
   - [ ] Confirm UAT coordinator availability
   - [ ] Confirm technical support availability
   - [ ] Review training agenda


---

## Week 2, Day 1: Training Day

### Morning Session: FI Training (9:00 AM - 12:00 PM)

#### Pre-Session Setup (8:00 AM - 9:00 AM)

- [ ] Arrive early to set up
- [ ] Test all equipment one final time
- [ ] Lay out training materials on tables
- [ ] Set up sign-in sheet at entrance
- [ ] Prepare name tags
- [ ] Set up refreshments
- [ ] Display welcome slide on projector

#### Welcome & Overview (9:00 AM - 9:15 AM)

**Facilitator Script**:

"Good morning everyone! Welcome to the CSIS Workflow Upgrade training. Thank you for participating in this important pilot test.

Today we'll learn about the new features:
- 6-section randomization
- Kish Grid respondent selection
- GPS verification

After training, you'll conduct 3-5 pilot surveys over the next 2-3 days. Your feedback will help us improve the system before full deployment.

Let's start with introductions..."

**Activities**:
- [ ] Welcome participants
- [ ] Have everyone sign in
- [ ] Distribute name tags
- [ ] Brief introductions (name, experience)
- [ ] Overview of agenda
- [ ] Set expectations
- [ ] Answer initial questions

#### CSIS Methodology Introduction (9:15 AM - 9:45 AM)

**Topics to Cover**:
1. Why we're upgrading to CSIS methodology
2. Key differences from old system
3. Benefits of standardized approach
4. Overview of new features

**Activities**:
- [ ] Present PowerPoint slides
- [ ] Explain CSIS background
- [ ] Show comparison: old vs. new
- [ ] Discuss benefits
- [ ] Answer questions

**Key Points**:
- CSIS is the official DILG methodology
- Ensures standardization across all LGUs
- Improves data quality and comparability
- Based on statistical best practices

#### 6-Section Randomization Demo (9:45 AM - 10:15 AM)

**Topics to Cover**:
1. How questionnaire numbers determine section order
2. All 6 service sections explained
3. Navigation through sections
4. Progress tracking

**Activities**:
- [ ] Demo with sample questionnaire numbers
- [ ] Show different section orders
- [ ] Practice navigation
- [ ] Show progress indicators

**Demo Steps**:
1. Initialize survey, get questionnaire number
2. Show how number determines section order
3. Navigate through all 6 sections
4. Show progress tracking
5. Complete survey

**Key Points**:
- Every questionnaire number has specific section order
- All 6 sections must be completed
- Order is randomized but consistent
- Progress is tracked throughout


#### Break (10:15 AM - 10:30 AM)

- [ ] Announce 15-minute break
- [ ] Direct participants to refreshments
- [ ] Be available for questions
- [ ] Prepare for next session

#### Kish Grid Selection Demo (10:30 AM - 11:00 AM)

**Topics to Cover**:
1. What is the Kish Grid and why we use it
2. How to enumerate household members
3. How the system selects respondent
4. Gender requirements (odd/even)
5. Understanding the grid visualization

**Activities**:
- [ ] Explain Kish Grid concept
- [ ] Show the 12x10 matrix
- [ ] Demo with different household sizes
- [ ] Practice with sample households
- [ ] Review edge cases

**Demo Steps**:
1. Show household enumeration screen
2. Enter sample household (5 members)
3. Show Kish Grid selection process
4. Explain row and column calculation
5. Show selected respondent
6. Display grid visualization

**Practice Scenarios**:
- Household with 3 members, questionnaire #1
- Household with 8 members, questionnaire #15
- Household with 12+ members, questionnaire #30
- Household with 1 member, questionnaire #7

**Key Points**:
- Kish Grid ensures random selection
- Based on questionnaire number and household size
- System does the calculation automatically
- Gender requirement based on odd/even number
- Visualization helps understand selection

#### GPS Verification Demo (11:00 AM - 11:30 AM)

**Topics to Cover**:
1. When to capture GPS (at household confirmation)
2. How to ensure accurate GPS capture
3. What happens if GPS fails
4. Why GPS verification matters

**Activities**:
- [ ] Explain GPS verification purpose
- [ ] Demo GPS capture process
- [ ] Practice capturing location
- [ ] Troubleshoot common issues
- [ ] Show what supervisors see

**Demo Steps**:
1. Navigate to respondent selection
2. Click "Capture GPS Location"
3. Wait for GPS lock
4. Show accuracy indicator
5. Confirm location
6. Continue with survey

**Troubleshooting Tips**:
- Ensure location services enabled
- Move to area with clear sky view
- Wait 30-60 seconds for GPS lock
- Check accuracy (should be <20m)
- Retry if accuracy poor
- Manual skip option available

**Key Points**:
- GPS captured at household, not initialization
- Helps verify interviews conducted at assigned spots
- Supervisors can review GPS verification
- Interviews beyond threshold flagged for review
- Quality control measure, not punitive


#### Hands-On Practice (11:30 AM - 12:00 PM)

**Objective**: Let FIs practice with the system

**Activities**:
- [ ] Distribute mobile devices to FIs
- [ ] Provide login credentials
- [ ] Guide through practice survey
- [ ] Circulate to provide help
- [ ] Answer questions
- [ ] Encourage peer learning

**Practice Tasks**:
1. Log in to staging environment
2. Initialize a practice survey
3. Enumerate a sample household
4. Capture GPS location
5. Select respondent using Kish Grid
6. Complete demographics
7. Navigate through 2-3 service sections
8. Review progress
9. Submit or save survey

**Support**:
- UAT coordinators circulate to help
- Encourage FIs to help each other
- No question is too small
- Take time to get comfortable

**Wrap-Up**:
- [ ] Answer remaining questions
- [ ] Distribute quick reference cards
- [ ] Distribute GPS troubleshooting guides
- [ ] Explain pilot testing schedule
- [ ] Provide contact information
- [ ] Thank participants
- [ ] Break for lunch

---

### Afternoon Session: FS Training (1:00 PM - 3:00 PM)

#### Pre-Session Setup (12:30 PM - 1:00 PM)

- [ ] Set up laptops for FSs
- [ ] Test GPS verification dashboard
- [ ] Prepare sample flagged interviews
- [ ] Lay out FS training materials
- [ ] Update sign-in sheet

#### Welcome & Overview (1:00 PM - 1:15 PM)

**Facilitator Script**:

"Good afternoon! Welcome to the GPS Verification training for Field Supervisors.

Today we'll learn about:
- GPS verification dashboard
- Reviewing flagged interviews
- Making accept/reject decisions

This new feature helps ensure data quality by verifying that interviews were conducted at assigned locations."

**Activities**:
- [ ] Welcome FSs
- [ ] Have everyone sign in
- [ ] Brief introductions
- [ ] Overview of agenda
- [ ] Set expectations

#### GPS Verification Dashboard (1:15 PM - 1:45 PM)

**Topics to Cover**:
1. Accessing the verification dashboard
2. Understanding the dual-pin map display
3. Reading distance calculations
4. Interpreting verification status

**Activities**:
- [ ] Demo dashboard navigation
- [ ] Show dual-pin map display
- [ ] Explain color coding
- [ ] Show distance calculations
- [ ] Review verification status

**Demo Steps**:
1. Log in to supervisor dashboard
2. Navigate to GPS verification section
3. View list of completed interviews
4. Click on an interview to view details
5. Show dual-pin map (blue = assigned, green = actual)
6. Show distance calculation
7. Show verification status
8. Explain flagging criteria

**Key Points**:
- Blue pin = assigned spot location
- Green pin = actual interview location
- Line color indicates threshold status (green = within, red = beyond)
- Distance shown in meters
- Flagged interviews require review
- Default threshold is 200 meters


#### Flagged Interview Review (1:45 PM - 2:15 PM)

**Topics to Cover**:
1. What triggers flagging
2. How to investigate flagged interviews
3. When to accept vs. reject
4. Documentation requirements

**Activities**:
- [ ] Review sample flagged interviews
- [ ] Discuss decision-making criteria
- [ ] Practice making decisions
- [ ] Document findings

**Review Process**:
1. Identify flagged interviews
2. Review GPS verification map
3. Check distance from assigned spot
4. Consider legitimate reasons for distance:
   - GPS accuracy issues
   - Household moved nearby
   - Spot assignment error
   - Terrain/building interference
5. Review interview data for consistency
6. Make accept/reject decision
7. Document rationale

**Decision Criteria**:

**Accept if**:
- Distance slightly over threshold but reasonable
- GPS accuracy was poor
- Legitimate reason for location difference
- Interview data appears valid

**Reject if**:
- Distance significantly over threshold
- No legitimate explanation
- Interview data suspicious
- Pattern of violations

**Flag for Follow-Up if**:
- Unclear situation
- Need more information
- First-time occurrence
- Borderline case

#### Break (2:15 PM - 2:30 PM)

- [ ] Announce 15-minute break
- [ ] Be available for questions
- [ ] Prepare for hands-on practice

#### Hands-On Practice (2:30 PM - 3:00 PM)

**Objective**: Let FSs practice with the dashboard

**Activities**:
- [ ] Provide laptop access to FSs
- [ ] Provide login credentials
- [ ] Guide through dashboard
- [ ] Review sample interviews
- [ ] Practice making decisions
- [ ] Answer questions

**Practice Tasks**:
1. Log in to supervisor dashboard
2. Navigate to GPS verification
3. Review 3-5 sample interviews
4. Examine GPS verification maps
5. Make accept/reject decisions
6. Document findings
7. Explore dashboard features

**Wrap-Up**:
- [ ] Answer remaining questions
- [ ] Explain review schedule for pilot
- [ ] Provide contact information
- [ ] Thank participants
- [ ] Adjourn training

---

## Week 2, Days 2-4: Pilot Testing

### Day 2-3: Field Testing with FIs

#### Morning Briefing (8:00 AM - 8:30 AM)

**Objectives**:
- Review today's goals
- Assign barangays/spots
- Distribute devices
- Answer questions
- Provide support contact info

**Briefing Agenda**:
1. Welcome and overview
2. Today's objectives (3-5 surveys per FI)
3. Barangay/spot assignments
4. Device distribution
5. Support availability
6. Issue reporting process
7. End-of-day debrief time
8. Questions

**Assignments**:
- Assign each FI to specific barangays
- Provide spot assignments
- Ensure geographic distribution
- Mix of scenarios (urban/rural, different household sizes)


#### Field Testing (8:30 AM - 4:00 PM)

**FI Activities**:
- Conduct 3-5 surveys in assigned barangays
- Test all CSIS features
- Document issues encountered
- Contact support if needed
- Complete surveys start-to-finish

**UAT Coordinator Activities**:
- Be available for support (phone/Slack)
- Monitor progress remotely
- Log issues as reported
- Provide troubleshooting help
- Visit field sites if needed
- Track completion rates

**Support Protocol**:
1. FI encounters issue
2. FI contacts UAT coordinator (phone/Slack)
3. Coordinator provides troubleshooting
4. If unresolved, escalate to technical team
5. Document issue in issue log
6. Provide workaround if available
7. Follow up to confirm resolution

**Issue Logging**:
- Use issue log template
- Record in real-time
- Categorize by severity
- Assign to appropriate person
- Track status
- Document workarounds

#### End-of-Day Debrief (4:30 PM - 5:30 PM)

**Objective**: Gather daily feedback and address issues

**Debrief Agenda**:
1. Welcome and thank participants
2. Review today's progress (surveys completed, GPS success rate)
3. What went well?
4. What was challenging?
5. Bugs or errors encountered?
6. Questions that arose?
7. Suggestions for improvement?
8. Feature-specific feedback
9. Action items for tomorrow
10. Tomorrow's plan

**Use Daily Debrief Template**:
- Fill out attendance
- Record progress metrics
- Document discussion points
- Log issues
- Capture feedback
- Identify action items
- Plan next day

**Key Questions to Ask**:
- How did the 6-section navigation feel?
- Was the Kish Grid selection clear?
- Did GPS capture work smoothly?
- Any confusion or difficulties?
- How was the overall experience?
- What would make it better?

### Day 4: Supervisor Testing

#### Morning: FS Review Session (9:00 AM - 12:00 PM)

**Objective**: FSs review completed surveys and test GPS verification

**Activities**:
- [ ] FSs log in to supervisor dashboard
- [ ] Review all completed surveys from Days 2-3
- [ ] Check GPS verification for each interview
- [ ] Identify flagged interviews
- [ ] Review GPS verification maps
- [ ] Make accept/reject decisions
- [ ] Document findings
- [ ] Test threshold configuration
- [ ] Explore dashboard features

**UAT Coordinator Support**:
- Be available for questions
- Help with dashboard navigation
- Explain features as needed
- Document feedback
- Log any issues


#### Afternoon: FS Feedback Session (1:00 PM - 3:00 PM)

**Objective**: Gather detailed FS feedback

**Activities**:
- [ ] FSs complete FS feedback forms
- [ ] One-on-one discussions with each FS
- [ ] Review GPS verification effectiveness
- [ ] Discuss data quality assessment
- [ ] Gather suggestions for improvements
- [ ] Document concerns and recommendations

**Discussion Topics**:
- Dashboard usability
- Flagged interview review process
- Decision-making clarity
- Data quality confidence
- Feature requests
- Training effectiveness
- Support needs

#### Final Debrief (3:00 PM - 4:00 PM)

**Objective**: Wrap up pilot testing and gather final feedback

**Debrief Agenda**:
1. Thank all participants
2. Review overall pilot results
3. Celebrate successes
4. Discuss challenges
5. Gather final feedback
6. Explain next steps
7. Distribute feedback forms
8. Set expectations for follow-up

**Feedback Form Distribution**:
- [ ] Distribute FI feedback forms to all FIs
- [ ] Distribute FS feedback forms to all FSs
- [ ] Explain how to complete forms
- [ ] Set deadline for submission (24-48 hours)
- [ ] Provide submission method (email, hand-deliver)

**Next Steps Communication**:
- Feedback will be analyzed
- Issues will be addressed
- UAT report will be prepared
- Go/no-go decision will be made
- Participants will be informed of decision
- Thank you for participation

---

## Week 2, Day 5: Feedback Analysis

### Morning: Debrief Sessions (9:00 AM - 12:00 PM)

#### FI Group Debrief (9:00 AM - 11:00 AM)

**Objective**: Deep dive into FI experience

**Agenda**:
1. Welcome and thank you
2. Overall experience discussion
3. Feature-by-feature feedback
4. Training effectiveness review
5. Suggestions for improvement
6. Concerns and questions
7. Deployment readiness assessment

**Discussion Format**:
- Open discussion
- Go around the room
- Encourage honest feedback
- Probe for details
- Document everything
- No judgment

**Key Topics**:
- 6-section navigation experience
- Kish Grid selection clarity
- GPS capture reliability
- Offline mode functionality
- Overall usability
- Confidence level
- Training adequacy
- Support needs


#### FS Group Debrief (11:00 AM - 12:00 PM)

**Objective**: Deep dive into FS experience

**Agenda**:
1. Welcome and thank you
2. GPS verification dashboard feedback
3. Flagged interview review process
4. Data quality assessment
5. FI monitoring observations
6. Suggestions for improvement
7. Deployment readiness assessment

**Key Topics**:
- Dashboard usability
- Map display clarity
- Decision-making process
- Data quality confidence
- FI support needs
- Training effectiveness
- Feature requests

### Afternoon: Analysis and Report Drafting (1:00 PM - 5:00 PM)

#### Compile All Feedback (1:00 PM - 2:00 PM)

**Tasks**:
- [ ] Collect all completed feedback forms
- [ ] Review daily debrief notes
- [ ] Review issue log
- [ ] Compile debrief session notes
- [ ] Organize by category

**Organization**:
- Create spreadsheet or document
- Categorize feedback by:
  - Feature (6-section, Kish Grid, GPS, etc.)
  - Type (positive, negative, suggestion)
  - Severity (critical, major, minor)
  - Source (FI, FS, coordinator)

#### Calculate Success Metrics (2:00 PM - 3:00 PM)

**Metrics to Calculate**:

1. **Survey Completion Rate**
   - Formula: (Surveys completed / Surveys started) × 100
   - Target: 95%+
   - Actual: _____% 

2. **GPS Capture Success Rate**
   - Formula: (Successful captures / Total attempts) × 100
   - Target: 85%+
   - Actual: _____%

3. **Average Completion Time**
   - Formula: Sum of completion times / Number of surveys
   - Target: 20-30 minutes
   - Actual: _____ minutes

4. **Error Rate**
   - Formula: (Number of errors / Total surveys) × 100
   - Target: <5%
   - Actual: _____%

5. **Training Satisfaction**
   - Formula: Average of training satisfaction ratings
   - Target: 8+/10
   - Actual: _____/10

6. **System Usability**
   - Formula: Average of usability ratings
   - Target: 8+/10
   - Actual: _____/10

7. **FI Confidence Level**
   - Formula: Average of confidence ratings
   - Target: 7+/10
   - Actual: _____/10

**Status Assessment**:
- ✅ Met target
- ⚠️ Close to target (within 5%)
- ❌ Below target


#### Analyze Issues (3:00 PM - 4:00 PM)

**Issue Analysis**:

1. **Review Issue Log**
   - Count issues by severity
   - Identify patterns
   - Determine root causes
   - Assess impact on deployment

2. **Categorize Issues**
   
   **Critical Issues** (Block deployment):
   - System crashes
   - Data loss
   - Cannot complete surveys
   - GPS verification broken
   - Kish Grid selection fails
   
   **Major Issues** (Must fix before deployment):
   - Confusing UI/UX
   - GPS capture fails frequently
   - Training gaps
   - Performance problems
   
   **Minor Issues** (Can fix post-deployment):
   - Cosmetic issues
   - Minor wording
   - Edge cases
   - Enhancements

3. **Assess Deployment Blockers**
   - List all critical issues
   - Determine if any are unresolved
   - Assess impact on go/no-go decision

#### Draft UAT Report (4:00 PM - 5:00 PM)

**Use UAT Report Template** (from UAT_PLAN.md)

**Report Sections**:

1. **Executive Summary**
   - UAT objectives
   - Participant summary
   - Overall results
   - Key findings
   - Recommendations
   - Go/no-go decision

2. **Participation**
   - Number of FIs/FSs
   - Training attendance
   - Pilot completion rates
   - Feedback response rates

3. **Test Results**
   - Quantitative results (metrics table)
   - Qualitative results (feedback summary)

4. **Issues Discovered**
   - Critical issues table
   - Major issues table
   - Minor issues table

5. **Feedback Summary**
   - Positive feedback
   - Areas for improvement
   - Participant quotes

6. **Recommendations**
   - Training improvements
   - System enhancements
   - Documentation updates
   - Deployment considerations

7. **Go/No-Go Decision**
   - Decision (GO / NO-GO / CONDITIONAL GO)
   - Rationale
   - Conditions (if conditional)
   - Sign-off section

---

## Go/No-Go Decision Framework

### GO Decision Criteria

**Make GO decision if**:
- ✅ All critical issues resolved
- ✅ 90%+ of success metrics achieved
- ✅ Positive feedback from majority of participants
- ✅ No deployment blockers remaining
- ✅ FIs feel confident using the system
- ✅ FSs can effectively use GPS verification
- ✅ Training materials adequate

**Action**: Proceed to deployment (Task 13)


### CONDITIONAL GO Decision Criteria

**Make CONDITIONAL GO decision if**:
- ⚠️ Minor issues remain but have workarounds
- ⚠️ 80-89% of success metrics achieved
- ⚠️ Some concerns but manageable
- ⚠️ Specific conditions can be met before deployment
- ⚠️ FIs mostly confident with additional support
- ⚠️ Training materials need minor updates

**Conditions might include**:
- Fix specific major issues
- Update training materials
- Provide additional support during rollout
- Conduct refresher training
- Monitor closely post-deployment

**Action**: Meet conditions, then proceed to deployment

### NO-GO Decision Criteria

**Make NO-GO decision if**:
- ❌ Critical issues unresolved
- ❌ <80% of success metrics achieved
- ❌ Significant negative feedback
- ❌ Major usability problems
- ❌ FIs lack confidence
- ❌ System unreliable
- ❌ Training inadequate

**Action**: Address issues, conduct re-UAT

---

## Week 3: Remediation (If Needed)

### If GO Decision

**Immediate Actions**:
1. **Finalize UAT Report**
   - Complete all sections
   - Get stakeholder sign-off
   - Distribute to project team

2. **Update Training Materials**
   - Incorporate feedback
   - Add FAQ section
   - Create video tutorials (if needed)
   - Update quick reference cards

3. **Plan Full Deployment**
   - Schedule deployment window
   - Prepare rollback plan
   - Communicate to all staff
   - Arrange full training sessions

4. **Proceed to Task 13**
   - Deploy to staging
   - Deploy to production
   - Monitor and validate

### If CONDITIONAL GO Decision

**Immediate Actions**:
1. **Address Specified Conditions**
   - Fix identified issues
   - Update materials
   - Implement improvements
   - Document resolutions

2. **Verify Conditions Met**
   - Test fixes
   - Confirm improvements
   - Get stakeholder approval
   - Update UAT report

3. **Obtain Final Sign-Off**
   - Demonstrate fixes
   - Show condition compliance
   - Get approval to proceed

4. **Proceed to Deployment**
   - Follow deployment plan
   - Monitor closely
   - Provide extra support


### If NO-GO Decision

**Immediate Actions**:
1. **Analyze Root Causes**
   - Review all critical issues
   - Identify patterns
   - Determine root causes
   - Assess scope of fixes needed

2. **Create Remediation Plan**
   - List all issues to fix
   - Prioritize by severity
   - Estimate effort
   - Assign owners
   - Set timeline

3. **Fix Critical Issues**
   - Address all blocking issues
   - Test thoroughly
   - Verify fixes
   - Document changes

4. **Update Training Materials**
   - Address training gaps
   - Improve clarity
   - Add examples
   - Create additional resources

5. **Schedule Re-UAT**
   - Plan second pilot
   - Same or different participants
   - Focus on problem areas
   - Shorter timeline (1 week)

6. **Communicate Delay**
   - Inform stakeholders
   - Explain reasons
   - Provide new timeline
   - Maintain transparency

---

## Post-UAT Activities

### Immediate (Within 1 Week)

1. **Distribute UAT Report**
   - Send to all stakeholders
   - Present findings in meeting
   - Answer questions
   - Get sign-off

2. **Thank Participants**
   - Send thank you emails
   - Acknowledge contributions
   - Share outcomes
   - Provide incentives/compensation

3. **Update Documentation**
   - Incorporate feedback
   - Fix identified issues
   - Update training materials
   - Create FAQ

4. **Communicate Decision**
   - Announce go/no-go decision
   - Explain rationale
   - Share next steps
   - Set expectations

### Short-Term (Within 2-4 Weeks)

5. **Implement Improvements**
   - Fix identified issues
   - Update features
   - Enhance usability
   - Test changes

6. **Prepare for Deployment**
   - Finalize deployment plan
   - Prepare rollback procedures
   - Schedule training sessions
   - Arrange support resources

7. **Conduct Full Training**
   - Train all FIs and FSs
   - Use updated materials
   - Provide hands-on practice
   - Distribute resources

### Ongoing

8. **Monitor Adoption**
   - Track usage metrics
   - Gather feedback
   - Address issues quickly
   - Provide ongoing support

9. **Continuous Improvement**
   - Regular feedback collection
   - Iterative improvements
   - Feature enhancements
   - Training updates

---

## Tips for Success

### For UAT Coordinators

✅ **Be Prepared**: Know the system inside and out  
✅ **Be Organized**: Use templates and checklists  
✅ **Be Supportive**: Create safe space for feedback  
✅ **Be Responsive**: Address issues quickly  
✅ **Be Thorough**: Document everything  
✅ **Be Flexible**: Adapt to unexpected situations  
✅ **Be Patient**: Learning takes time  
✅ **Be Positive**: Maintain enthusiasm  


### For Facilitators

✅ **Set the Tone**: Create welcoming environment  
✅ **Encourage Participation**: Everyone's voice matters  
✅ **Listen Actively**: Really hear what participants say  
✅ **Probe for Details**: Ask follow-up questions  
✅ **Stay Neutral**: Don't defend the system  
✅ **Manage Time**: Keep sessions on track  
✅ **Document Well**: Capture key points  
✅ **Follow Up**: Address action items  

### For Technical Support

✅ **Be Available**: Respond quickly to issues  
✅ **Be Patient**: Explain clearly  
✅ **Be Resourceful**: Find solutions  
✅ **Be Proactive**: Anticipate problems  
✅ **Be Collaborative**: Work with coordinators  
✅ **Be Thorough**: Test fixes completely  
✅ **Be Communicative**: Keep everyone informed  

---

## Common Challenges and Solutions

### Challenge 1: Low Participation

**Symptoms**:
- FIs/FSs not showing up
- Low engagement during training
- Minimal feedback provided

**Solutions**:
- Emphasize importance and value
- Offer incentives
- Make it convenient (time, location)
- Show how feedback will be used
- Create safe, non-judgmental environment

### Challenge 2: Technical Issues During Pilot

**Symptoms**:
- System crashes
- GPS not working
- Sync failures
- Performance problems

**Solutions**:
- Have technical support on standby
- Provide backup devices
- Document issues thoroughly
- Implement quick fixes if possible
- Have contingency plans

### Challenge 3: Negative Feedback

**Symptoms**:
- Participants frustrated
- Many complaints
- Low satisfaction scores
- Resistance to change

**Solutions**:
- Listen without defensiveness
- Acknowledge concerns
- Explain rationale for changes
- Show how feedback will improve system
- Be transparent about limitations
- Focus on benefits

### Challenge 4: Insufficient Feedback

**Symptoms**:
- Vague responses
- "Everything is fine" answers
- Minimal detail
- No suggestions

**Solutions**:
- Ask specific questions
- Probe for details
- Use examples
- Encourage honesty
- Explain importance of candid feedback
- Create safe environment

### Challenge 5: Time Constraints

**Symptoms**:
- Running behind schedule
- Not enough time for practice
- Rushed sessions
- Incomplete testing

**Solutions**:
- Prioritize critical activities
- Extend sessions if possible
- Focus on most important features
- Schedule additional time
- Be flexible with agenda

---

## Quality Checklist

### Before Training

- [ ] All materials printed and organized
- [ ] All devices charged and configured
- [ ] Venue set up and tested
- [ ] Participants confirmed
- [ ] Agenda finalized
- [ ] Support team briefed
- [ ] Backup plans ready

### During Training

- [ ] All participants signed in
- [ ] All topics covered
- [ ] Hands-on practice completed
- [ ] Questions answered
- [ ] Materials distributed
- [ ] Next steps explained
- [ ] Contact info provided

### During Pilot

- [ ] All FIs conducting surveys
- [ ] Support available and responsive
- [ ] Issues logged in real-time
- [ ] Progress tracked
- [ ] Daily debriefs conducted
- [ ] Feedback collected
- [ ] Action items addressed

### After Pilot

- [ ] All feedback forms collected
- [ ] All issues documented
- [ ] Metrics calculated
- [ ] Analysis completed
- [ ] Report drafted
- [ ] Decision made
- [ ] Stakeholders informed
- [ ] Next steps planned

---

## Contact Information Template

**UAT Coordinators**:
- Coordinator 1: [Name], [Phone], [Email]
- Coordinator 2: [Name], [Phone], [Email]

**Technical Support**:
- Developer 1: [Name], [Phone], [Email]
- Developer 2: [Name], [Phone], [Email]

**Project Management**:
- Project Manager: [Name], [Phone], [Email]

**Emergency Contact**:
- [Name], [Phone] (24/7)

**Slack Channel**: #uat-csis-upgrade

---

## Final Checklist

### UAT Preparation Complete

- [x] UAT plan created
- [x] Feedback forms prepared
- [x] Templates ready
- [x] Documentation complete
- [x] Execution guide created

### Ready to Execute

- [ ] Stakeholder approval obtained
- [ ] Budget approved
- [ ] Resources allocated
- [ ] Timeline confirmed
- [ ] Participants recruited
- [ ] Environment prepared
- [ ] Materials printed
- [ ] Devices ready
- [ ] Support team briefed

### Post-UAT

- [ ] Feedback collected
- [ ] Issues documented
- [ ] Metrics calculated
- [ ] Report completed
- [ ] Decision made
- [ ] Stakeholders informed
- [ ] Next steps planned

---

## Conclusion

This execution guide provides step-by-step instructions for conducting the UAT for the CSIS workflow upgrade. All preparation work has been completed - you now have everything needed to execute a successful UAT with real field staff.

**Key Success Factors**:
1. Thorough preparation
2. Clear communication
3. Strong support
4. Comprehensive documentation
5. Objective analysis
6. Data-driven decisions

**Remember**: The goal of UAT is to validate that the system meets user needs and is ready for deployment. Be open to feedback, address issues promptly, and make data-driven decisions.

**Good luck with your UAT!**

---

**Document Version**: 1.0  
**Last Updated**: November 17, 2025  
**Status**: Ready for Use  
**Next Action**: Begin Week 1 preparation activities

---

*For questions or support, contact the UAT coordinators or project manager.*

