# User Acceptance Testing (UAT) Plan
## CSIS Workflow Upgrade

**Version**: 1.0  
**Date**: November 17, 2025  
**Status**: Ready for Execution  
**Task**: 12.3 - Conduct user acceptance testing

---

## Executive Summary

This User Acceptance Testing (UAT) plan outlines the approach for validating the CSIS workflow upgrade with actual field staff. The UAT phase ensures that the new 6-section randomization, Kish Grid respondent selection, and GPS verification features meet the needs of Field Interviewers (FIs) and Field Supervisors (FSs) in real-world conditions.

### Objectives

1. **Validate Usability**: Ensure FIs can successfully complete surveys using the new CSIS methodology
2. **Verify Training Effectiveness**: Confirm training materials adequately prepare staff for the new workflow
3. **Identify Issues**: Discover any usability problems, confusion points, or bugs not found in testing
4. **Gather Feedback**: Collect suggestions for improvements before full deployment
5. **Build Confidence**: Ensure field staff are comfortable with the new system

### Success Criteria

- ✅ 90%+ of FIs successfully complete pilot surveys without assistance
- ✅ Average survey completion time within acceptable range (20-30 minutes)
- ✅ No critical bugs discovered during pilot testing
- ✅ 80%+ positive feedback on usability and clarity
- ✅ GPS capture success rate above 85%
- ✅ Kish Grid selection understood and correctly applied

---

## UAT Scope

### In Scope

**Features to Test**:
- ✅ 6-section randomization based on questionnaire number
- ✅ Kish Grid respondent selection (12x10 matrix)
- ✅ Dynamic gender requirement calculation
- ✅ GPS capture at household confirmation
- ✅ GPS verification and flagging
- ✅ Complete survey flow (initialization → 6 sections → submission)
- ✅ Offline mode and sync functionality
- ✅ Callback/multi-visit scenarios
- ✅ Supervisor GPS verification dashboard

**User Roles**:
- ✅ Field Interviewers (FIs) - Primary users
- ✅ Field Supervisors (FSs) - Secondary users
- ✅ System Administrators - Configuration and monitoring

### Out of Scope

- ❌ Backend infrastructure testing (covered in integration tests)
- ❌ Performance testing under load (covered in performance tests)
- ❌ Security penetration testing (separate security audit)
- ❌ Features not part of CSIS upgrade (existing functionality)

---

## UAT Participants

### Field Interviewers (FIs)

**Number**: 6-10 FIs  
**Selection Criteria**:
- Mix of experience levels (2-3 new, 3-4 experienced, 1-2 veteran)
- Comfortable with mobile devices
- Available for 2-day pilot period
- Willing to provide detailed feedback

**Responsibilities**:
- Attend training session (2 hours)
- Complete 3-5 pilot surveys in real barangays
- Document issues and feedback
- Participate in debrief session

### Field Supervisors (FSs)

**Number**: 2-3 FSs  
**Selection Criteria**:
- Experience supervising field operations
- Familiar with GPS verification concepts
- Available for pilot period

**Responsibilities**:
- Attend training session (1.5 hours)
- Monitor FI progress during pilot
- Review GPS verification dashboard
- Validate flagged interviews
- Provide feedback on supervisor features

### UAT Coordinators

**Number**: 2 coordinators  
**Responsibilities**:
- Organize training sessions
- Provide technical support during pilot
- Collect and document feedback
- Coordinate with development team
- Compile UAT report

---

## UAT Schedule

### Phase 1: Preparation (Week 1)

**Day 1-2: Setup**
- [ ] Finalize UAT environment (staging server)
- [ ] Create test user accounts for all participants
- [ ] Prepare test barangays with assigned spots
- [ ] Set up feedback collection tools
- [ ] Print training materials

**Day 3-4: Training Material Review**
- [ ] Review FI training guide with 1-2 FIs
- [ ] Gather feedback on training clarity
- [ ] Revise training materials if needed
- [ ] Prepare training session agenda

**Day 5: Final Preparation**
- [ ] Confirm participant availability
- [ ] Send pre-training materials
- [ ] Set up training venue
- [ ] Test all equipment and devices

### Phase 2: Training (Week 2, Day 1)

**Morning Session (9:00 AM - 12:00 PM): FI Training**

| Time | Activity | Duration |
|------|----------|----------|
| 9:00-9:15 | Welcome & Overview | 15 min |
| 9:15-9:45 | CSIS Methodology Introduction | 30 min |
| 9:45-10:15 | 6-Section Randomization Demo | 30 min |
| 10:15-10:30 | Break | 15 min |
| 10:30-11:00 | Kish Grid Selection Demo | 30 min |
| 11:00-11:30 | GPS Verification Demo | 30 min |
| 11:30-12:00 | Hands-on Practice | 30 min |

**Afternoon Session (1:00 PM - 3:00 PM): FS Training**

| Time | Activity | Duration |
|------|----------|----------|
| 1:00-1:15 | Welcome & Overview | 15 min |
| 1:15-1:45 | GPS Verification Dashboard | 30 min |
| 1:45-2:15 | Flagged Interview Review | 30 min |
| 2:15-2:30 | Break | 15 min |
| 2:30-3:00 | Hands-on Practice | 30 min |

### Phase 3: Pilot Testing (Week 2, Day 2-4)

**Day 2-3: Field Testing**
- FIs conduct 3-5 surveys each in assigned barangays
- UAT coordinators available for support
- Real-time issue logging
- Daily debrief sessions (end of day)

**Day 4: Supervisor Testing**
- FSs review completed surveys
- Test GPS verification dashboard
- Flag and review suspicious interviews
- Provide feedback on supervisor features

### Phase 4: Feedback & Analysis (Week 2, Day 5)

**Morning: Debrief Sessions**
- FI group debrief (2 hours)
- FS group debrief (1 hour)
- Collect detailed feedback

**Afternoon: Analysis**
- Compile feedback and issues
- Categorize by severity
- Identify patterns and trends
- Draft UAT report

### Phase 5: Remediation (Week 3)

**As Needed**:
- Fix critical issues discovered
- Update training materials
- Conduct re-testing if necessary
- Obtain final sign-off

---

## Training Approach

### FI Training Session

#### 1. CSIS Methodology Overview (30 min)

**Topics**:
- Why we're upgrading to CSIS methodology
- Key differences from old system
- Benefits of standardized approach

**Materials**:
- PowerPoint presentation
- CSIS methodology handout
- Quick reference card

#### 2. Six-Section Randomization (30 min)

**Topics**:
- How questionnaire numbers determine section order
- All 6 service sections explained
- Navigation through sections
- Progress tracking

**Activities**:
- Demo with sample questionnaire numbers
- Show different section orders
- Practice navigation

**Materials**:
- Live system demo
- Section order examples
- Navigation flowchart

#### 3. Kish Grid Respondent Selection (30 min)

**Topics**:
- What is the Kish Grid and why we use it
- How to enumerate household members
- How the system selects respondent
- Gender requirements (odd/even)
- Understanding the grid visualization

**Activities**:
- Demo with different household sizes
- Practice with sample households
- Review edge cases (1 member, 12+ members)

**Materials**:
- Kish Grid table handout
- Sample household scenarios
- Selection examples

#### 4. GPS Verification (30 min)

**Topics**:
- When to capture GPS (at household confirmation)
- How to ensure accurate GPS capture
- What happens if GPS fails
- Why GPS verification matters

**Activities**:
- Demo GPS capture process
- Practice capturing location
- Troubleshoot common GPS issues

**Materials**:
- GPS capture guide
- Troubleshooting checklist
- Best practices handout

#### 5. Hands-On Practice (30 min)

**Activities**:
- Complete practice survey start-to-finish
- Try different scenarios
- Ask questions
- Get comfortable with new workflow

**Support**:
- UAT coordinators available for help
- Peer learning encouraged
- No question too small

### FS Training Session

#### 1. GPS Verification Dashboard (30 min)

**Topics**:
- Accessing the verification dashboard
- Understanding the dual-pin map display
- Reading distance calculations
- Interpreting verification status

**Activities**:
- Demo dashboard features
- Review sample flagged interviews
- Practice navigation

#### 2. Flagged Interview Review (30 min)

**Topics**:
- What triggers flagging
- How to investigate flagged interviews
- When to accept vs. reject
- Documentation requirements

**Activities**:
- Review real examples
- Practice decision-making
- Discuss edge cases

#### 3. Hands-On Practice (30 min)

**Activities**:
- Review sample interviews
- Make flagging decisions
- Document findings
- Ask questions

---

## Pilot Testing Scenarios

### Scenario 1: Standard Survey (All FIs)

**Objective**: Complete a full survey with typical household

**Steps**:
1. Initialize survey and get questionnaire number
2. Navigate to assigned spot
3. Enumerate household (3-5 members)
4. Capture GPS at household
5. Select respondent using Kish Grid
6. Complete demographics
7. Complete all 6 service sections
8. Review and submit

**Expected Outcome**:
- Survey completed successfully
- GPS captured accurately
- Correct respondent selected
- All 6 sections completed in order

**Success Criteria**:
- Completion time: 20-30 minutes
- No critical errors
- FI confidence level: 7+/10

### Scenario 2: Large Household (2-3 FIs)

**Objective**: Test Kish Grid with 12+ household members

**Steps**:
1. Find household with 12+ members
2. Enumerate all members
3. Observe Kish Grid selection (should cap at row 12)
4. Complete survey

**Expected Outcome**:
- System correctly caps at row 12
- Selection still works properly
- FI understands the capping logic

### Scenario 3: Single-Member Household (2-3 FIs)

**Objective**: Test edge case with only 1 eligible member

**Steps**:
1. Find household with single adult
2. Enumerate household
3. Observe Kish Grid selection
4. Complete survey

**Expected Outcome**:
- System selects the only member
- No confusion about selection
- Survey proceeds normally

### Scenario 4: GPS Capture Failure (All FIs)

**Objective**: Test handling of GPS capture issues

**Steps**:
1. Start survey normally
2. Attempt GPS capture in poor signal area
3. Handle timeout or failure
4. Choose to continue or retry
5. Complete survey

**Expected Outcome**:
- Clear error messaging
- Options presented clearly
- FI understands implications
- Survey can still be completed

### Scenario 5: Offline Mode (2-3 FIs)

**Objective**: Test offline survey completion and sync

**Steps**:
1. Enable airplane mode
2. Complete full survey offline
3. Re-enable network
4. Observe automatic sync
5. Verify data in system

**Expected Outcome**:
- Survey works offline
- Data saved locally
- Sync occurs automatically
- No data loss

### Scenario 6: Callback Visit (2-3 FIs)

**Objective**: Test multi-visit scenario

**Steps**:
1. Start survey but don't complete
2. Save progress
3. Return later to continue
4. Complete remaining sections
5. Submit

**Expected Outcome**:
- Progress saved correctly
- Can resume where left off
- No data loss
- Smooth continuation

### Scenario 7: GPS Verification Review (All FSs)

**Objective**: Test supervisor GPS verification workflow

**Steps**:
1. Access supervisor dashboard
2. View completed surveys
3. Check GPS verification status
4. Review flagged interviews
5. Make accept/reject decisions
6. Document findings

**Expected Outcome**:
- Dashboard easy to navigate
- Flagged interviews clearly marked
- Distance calculations accurate
- Decision-making straightforward

---

## Feedback Collection

### Methods

#### 1. Real-Time Issue Logging

**Tool**: Shared Google Sheet or issue tracking system

**Fields**:
- Timestamp
- Reporter name
- Issue description
- Severity (Critical/Major/Minor)
- Steps to reproduce
- Screenshot (if applicable)
- Workaround (if found)

#### 2. Daily Debrief Sessions

**Format**: Group discussion (30-45 minutes)

**Topics**:
- What went well today?
- What was confusing or difficult?
- Any bugs or errors encountered?
- Suggestions for improvement
- Questions that arose

**Documentation**: Notes taken by UAT coordinator

#### 3. Post-Pilot Survey

**Format**: Online questionnaire (10-15 minutes)

**Questions**:

**Usability** (1-10 scale):
- How easy was the new workflow to learn?
- How clear were the Kish Grid instructions?
- How intuitive was GPS capture?
- How smooth was section navigation?

**Effectiveness** (1-10 scale):
- How confident are you using the new system?
- How well does it support your work?
- How reliable was the system?

**Open-Ended**:
- What did you like most about the new system?
- What was most challenging or confusing?
- What would you change or improve?
- Any other comments or suggestions?

#### 4. One-on-One Interviews

**Format**: 15-20 minute individual sessions

**Participants**: 2-3 FIs (mix of experience levels)

**Topics**:
- Detailed feedback on specific features
- Comparison to old system
- Suggestions for training improvements
- Concerns or questions

---

## Success Metrics

### Quantitative Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Survey Completion Rate | 95%+ | # completed / # started |
| GPS Capture Success Rate | 85%+ | # successful / # attempts |
| Average Completion Time | 20-30 min | Time tracking |
| Error Rate | <5% | # errors / # surveys |
| Training Satisfaction | 8+/10 | Post-training survey |
| System Usability | 8+/10 | Post-pilot survey |
| FI Confidence Level | 7+/10 | Post-pilot survey |

### Qualitative Metrics

- **Clarity**: FIs understand new workflow without confusion
- **Confidence**: FIs feel comfortable using new features
- **Efficiency**: New workflow doesn't slow down field operations
- **Reliability**: System works consistently without crashes
- **Support**: Training materials adequately prepare FIs

### Issue Severity Thresholds

**Critical Issues** (Block deployment):
- System crashes or data loss
- Cannot complete surveys
- GPS verification completely broken
- Kish Grid selection fails

**Major Issues** (Must fix before deployment):
- Confusing UI/UX causing errors
- GPS capture fails frequently
- Training gaps causing mistakes
- Performance problems

**Minor Issues** (Can fix post-deployment):
- Cosmetic issues
- Minor wording improvements
- Nice-to-have features
- Edge case handling

---

## Risk Management

### Identified Risks

#### Risk 1: Low FI Participation

**Probability**: Low  
**Impact**: High  
**Mitigation**:
- Recruit more FIs than needed (10-12 for 6-8 target)
- Offer incentives (compensation for time)
- Schedule flexibly to accommodate availability
- Emphasize importance and value of feedback

#### Risk 2: Technical Issues During Pilot

**Probability**: Medium  
**Impact**: High  
**Mitigation**:
- Thorough pre-pilot testing
- UAT coordinators with technical expertise on-site
- Backup devices available
- Direct line to development team
- Contingency plan for major issues

#### Risk 3: Poor GPS Signal in Test Areas

**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Test in multiple locations (indoor/outdoor)
- Document GPS limitations
- Train FIs on troubleshooting
- Have backup scenarios

#### Risk 4: Training Inadequate

**Probability**: Low  
**Impact**: High  
**Mitigation**:
- Pre-review training materials with sample FIs
- Multiple training methods (demo, hands-on, reference)
- Support available during pilot
- Quick reference cards provided

#### Risk 5: Negative Feedback on New Workflow

**Probability**: Low  
**Impact**: Medium  
**Mitigation**:
- Emphasize benefits and rationale
- Show how it improves data quality
- Be open to feedback and adjustments
- Involve FIs in solution design

---

## UAT Environment

### Technical Setup

**Server**: Staging environment (separate from production)

**URL**: `https://staging.sigla-system.com`

**Database**: Staging database with test data

**Features**:
- All CSIS upgrade features enabled
- GPS verification active
- Offline mode functional
- Sync working properly

### Test Data

**Barangays**: 3-5 test barangays with:
- Assigned spots with GPS coordinates
- Realistic household data
- Mix of urban/rural settings

**User Accounts**:
- 10 FI accounts (FI-UAT-01 through FI-UAT-10)
- 3 FS accounts (FS-UAT-01 through FS-UAT-03)
- 1 Admin account for coordinators

**Questionnaire Numbers**: Pre-generated range (1-50) for testing

### Devices

**FI Devices**:
- 6-10 mobile phones or tablets
- Android or iOS
- GPS enabled
- Adequate battery life
- Mobile data or WiFi

**FS Devices**:
- 2-3 laptops or tablets
- Modern browsers (Chrome, Firefox, Safari)
- Stable internet connection

### Support Resources

**On-Site**:
- 2 UAT coordinators with technical knowledge
- Printed quick reference guides
- Troubleshooting checklists
- Backup devices

**Remote**:
- Development team on standby
- Slack channel for real-time support
- Phone support line

---

## Deliverables

### During UAT

1. **Daily Status Reports**
   - Surveys completed
   - Issues logged
   - Feedback summary
   - Next day plan

2. **Issue Log**
   - All issues documented
   - Categorized by severity
   - Status tracked (open/resolved)

3. **Feedback Collection**
   - Survey responses
   - Interview notes
   - Debrief summaries

### Post-UAT

1. **UAT Report** (Primary deliverable)
   - Executive summary
   - Participant feedback
   - Issue summary
   - Recommendations
   - Go/No-Go decision

2. **Updated Training Materials**
   - Revisions based on feedback
   - Additional examples
   - FAQ section

3. **Issue Resolution Plan**
   - Critical issues fixed
   - Major issues scheduled
   - Minor issues backlogged

4. **Sign-Off Document**
   - Stakeholder approvals
   - Deployment readiness
   - Risk acknowledgment

---

## UAT Report Template

### Executive Summary

- UAT objectives and scope
- Participant summary
- Overall results
- Key findings
- Recommendations
- Go/No-Go decision

### Participation

- Number of FIs/FSs
- Training attendance
- Pilot completion rates
- Feedback response rates

### Test Results

#### Quantitative Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Survey Completion Rate | 95%+ | [X]% | ✅/❌ |
| GPS Capture Success | 85%+ | [X]% | ✅/❌ |
| Avg Completion Time | 20-30 min | [X] min | ✅/❌ |
| Error Rate | <5% | [X]% | ✅/❌ |
| Training Satisfaction | 8+/10 | [X]/10 | ✅/❌ |
| System Usability | 8+/10 | [X]/10 | ✅/❌ |
| FI Confidence | 7+/10 | [X]/10 | ✅/❌ |

#### Qualitative Results

- Usability feedback summary
- Training effectiveness
- Feature-specific feedback
- Comparison to old system

### Issues Discovered

#### Critical Issues

| ID | Description | Impact | Status | Resolution |
|----|-------------|--------|--------|------------|
| C-01 | [Description] | [Impact] | [Status] | [Resolution] |

#### Major Issues

| ID | Description | Impact | Status | Resolution |
|----|-------------|--------|--------|------------|
| M-01 | [Description] | [Impact] | [Status] | [Resolution] |

#### Minor Issues

| ID | Description | Impact | Status | Resolution |
|----|-------------|--------|--------|------------|
| N-01 | [Description] | [Impact] | [Status] | [Resolution] |

### Feedback Summary

#### Positive Feedback

- What users liked
- Improvements over old system
- Successful features

#### Areas for Improvement

- Confusion points
- Usability issues
- Training gaps
- Feature requests

#### Quotes from Participants

> "[Sample quote from FI]"

> "[Sample quote from FS]"

### Recommendations

1. **Training Improvements**
   - [Specific recommendations]

2. **System Enhancements**
   - [Specific recommendations]

3. **Documentation Updates**
   - [Specific recommendations]

4. **Deployment Considerations**
   - [Specific recommendations]

### Go/No-Go Decision

**Decision**: ✅ GO / ❌ NO-GO / ⚠️ CONDITIONAL GO

**Rationale**: [Explanation of decision]

**Conditions** (if conditional):
- [Condition 1]
- [Condition 2]

**Sign-Off**:
- UAT Coordinator: _________________ Date: _______
- Project Manager: _________________ Date: _______
- Technical Lead: _________________ Date: _______
- Stakeholder: _________________ Date: _______

---

## Next Steps After UAT

### If GO Decision

1. **Fix Critical Issues** (if any)
   - Address all critical bugs
   - Re-test fixes
   - Obtain confirmation

2. **Update Training Materials**
   - Incorporate feedback
   - Add FAQ section
   - Create video tutorials

3. **Plan Full Deployment**
   - Schedule deployment window
   - Prepare rollback plan
   - Communicate to all staff

4. **Conduct Full Training**
   - Train all FIs and FSs
   - Provide ongoing support
   - Monitor adoption

5. **Monitor Post-Deployment**
   - Track metrics
   - Gather feedback
   - Address issues quickly

### If NO-GO Decision

1. **Address Critical Issues**
   - Fix all blocking issues
   - Conduct thorough testing

2. **Schedule Re-UAT**
   - Plan second pilot
   - Same or different participants
   - Focus on problem areas

3. **Communicate Delay**
   - Inform stakeholders
   - Explain reasons
   - Provide new timeline

### If CONDITIONAL GO

1. **Meet Conditions**
   - Address specified issues
   - Implement required changes
   - Document resolutions

2. **Obtain Final Approval**
   - Demonstrate fixes
   - Get stakeholder sign-off
   - Proceed with deployment

---

## Appendices

### Appendix A: Training Materials Checklist

- [ ] FI Training Guide (printed)
- [ ] FS Training Guide (printed)
- [ ] Quick Reference Cards (laminated)
- [ ] Kish Grid Table (laminated)
- [ ] GPS Troubleshooting Guide
- [ ] Section Navigation Flowchart
- [ ] PowerPoint Presentations
- [ ] Sample Scenarios
- [ ] Practice Exercises

### Appendix B: Equipment Checklist

- [ ] 10 mobile devices (charged)
- [ ] 3 laptops (charged)
- [ ] Power banks
- [ ] Charging cables
- [ ] WiFi hotspot (backup)
- [ ] Projector for training
- [ ] Whiteboard/flip chart
- [ ] Markers
- [ ] Name tags
- [ ] Sign-in sheets

### Appendix C: Contact Information

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

### Appendix D: Feedback Forms

See separate files:
- `FI_FEEDBACK_FORM.md`
- `FS_FEEDBACK_FORM.md`
- `DAILY_DEBRIEF_TEMPLATE.md`
- `ISSUE_LOG_TEMPLATE.md`

---

## Document Control

**Version History**:

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-17 | Kiro AI | Initial UAT plan created |

**Approval**:

| Role | Name | Signature | Date |
|------|------|-----------|------|
| UAT Coordinator | | | |
| Project Manager | | | |
| Technical Lead | | | |

**Distribution**:
- UAT Coordinators
- Project Manager
- Technical Lead
- All UAT Participants (summary version)

---

*This UAT plan provides a comprehensive framework for validating the CSIS workflow upgrade with real users. Adjust timelines, participant numbers, and specific activities based on your organization's needs and resources.*
