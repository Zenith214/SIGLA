# CSIS Methodology Documentation Index

## Overview

This index provides quick access to all documentation related to the SIGLA Survey System's implementation of the DILG Citizen Satisfaction Index System (CSIS) Digital Methodology (v4.0).

## Documentation Structure

### 1. Field Interviewer Documentation

#### [FI Training Guide - CSIS Methodology](./FI_TRAINING_GUIDE_CSIS.md)
**Audience:** Field Interviewers (FIs)

**Contents:**
- Complete survey workflow overview
- Step-by-step instructions for each survey phase
- GPS capture procedures and troubleshooting
- Kish Grid respondent selection explanation
- Six-section navigation guide
- Best practices and common questions
- Training exercises and certification checklist

**When to Use:**
- Initial FI training
- Refresher training
- Reference during fieldwork
- Onboarding new FIs

---

### 2. Supervisor Documentation

#### [Supervisor GPS Verification Guide](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md)
**Audience:** Field Supervisors, Quality Control Staff

**Contents:**
- GPS verification dashboard usage
- Reading GPS verification displays
- Flagging criteria and thresholds
- Review process and decision-making
- Taking action on flagged interviews
- Configuring GPS thresholds
- Best practices for quality assurance
- Troubleshooting GPS verification issues

**When to Use:**
- Daily interview review
- Quality control monitoring
- Investigating flagged interviews
- Training supervisors
- Setting up GPS verification parameters

---

### 3. Technical Documentation

#### [API Documentation - CSIS](./API_DOCUMENTATION_CSIS.md)
**Audience:** Developers, System Administrators, Technical Staff

**Contents:**
- API endpoint specifications
- Request/response formats
- GPS verification endpoints
- Data structures and interfaces
- Database schema changes
- Error codes and handling
- Migration guide from previous version
- Testing examples

**When to Use:**
- API integration
- System development
- Database maintenance
- Troubleshooting technical issues
- Planning system updates

---

### 4. Troubleshooting Documentation

#### [CSIS Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md)
**Audience:** All Users (FIs, Supervisors, Technical Staff)

**Contents:**
- GPS capture issues and solutions
- Kish Grid selection problems
- Section navigation issues
- Data submission errors
- Offline mode problems
- Performance issues
- Browser compatibility
- Common error messages

**When to Use:**
- Resolving field issues
- Technical support
- Self-service troubleshooting
- Training on common problems
- Bug reporting

---

## Quick Reference by Role

### Field Interviewers

**Primary Documents:**
1. [FI Training Guide](./FI_TRAINING_GUIDE_CSIS.md) - Complete workflow
2. [Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md) - Problem solving

**Key Topics:**
- GPS capture at household
- Kish Grid respondent selection
- Six-section survey workflow
- Offline mode usage
- Common error resolution

---

### Field Supervisors

**Primary Documents:**
1. [Supervisor GPS Verification Guide](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md) - Quality control
2. [FI Training Guide](./FI_TRAINING_GUIDE_CSIS.md) - Understanding FI workflow
3. [Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md) - Supporting FIs

**Key Topics:**
- GPS verification dashboard
- Reviewing flagged interviews
- Configuring thresholds
- FI performance monitoring
- Quality assurance procedures

---

### Technical Staff

**Primary Documents:**
1. [API Documentation](./API_DOCUMENTATION_CSIS.md) - Technical specifications
2. [Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md) - Technical issues
3. [Supervisor GPS Verification Guide](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md) - System behavior

**Key Topics:**
- API endpoints and data structures
- Database schema
- GPS verification calculations
- Error handling
- System integration

---

## Key CSIS Methodology Changes

### 1. Six-Section Survey Workflow
- **Previous:** 3 sections (odd/even split)
- **CSIS:** All 6 service sections in every survey
- **Impact:** Longer surveys (25-35 minutes vs 15-20 minutes)
- **Documentation:** [FI Training Guide - Step 5](./FI_TRAINING_GUIDE_CSIS.md#step-5-six-service-sections)

### 2. Kish Grid Respondent Selection
- **Previous:** Simple modulo-based selection
- **CSIS:** Standardized 12x10 Kish Grid matrix
- **Impact:** Unbiased statistical selection
- **Documentation:** [FI Training Guide - Step 3](./FI_TRAINING_GUIDE_CSIS.md#step-3-respondent-selection-kish-grid)

### 3. GPS Verification for Quality Control
- **Previous:** GPS captured at initialization (optional)
- **CSIS:** GPS captured at household (required for verification)
- **Impact:** Quality control and fraud detection
- **Documentation:** 
  - [FI Training Guide - Step 2](./FI_TRAINING_GUIDE_CSIS.md#step-2-household-enumeration--gps-capture)
  - [Supervisor GPS Verification Guide](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md)

### 4. Dynamic Gender Requirements
- **Previous:** Stored questionnaire type (odd/even)
- **CSIS:** Calculated dynamically from questionnaire number
- **Impact:** Simplified data structure
- **Documentation:** [API Documentation - Migration Guide](./API_DOCUMENTATION_CSIS.md#migration-guide)

### 5. Section Randomization
- **Previous:** Fixed odd/even section assignment
- **CSIS:** 150-entry randomization map
- **Impact:** Standardized DILG methodology
- **Documentation:** [FI Training Guide - Step 5](./FI_TRAINING_GUIDE_CSIS.md#section-order)

---

## Training Resources

### For Field Interviewers

**Required Reading:**
1. [FI Training Guide](./FI_TRAINING_GUIDE_CSIS.md) - Complete guide
2. [Troubleshooting Guide - GPS Issues](./CSIS_TROUBLESHOOTING_GUIDE.md#gps-capture-issues)
3. [Troubleshooting Guide - Kish Grid](./CSIS_TROUBLESHOOTING_GUIDE.md#kish-grid-selection-problems)

**Training Exercises:**
- [Kish Grid Practice](./FI_TRAINING_GUIDE_CSIS.md#exercise-1-kish-grid-practice)
- [GPS Troubleshooting](./FI_TRAINING_GUIDE_CSIS.md#exercise-2-gps-troubleshooting)
- [Section Navigation](./FI_TRAINING_GUIDE_CSIS.md#exercise-3-section-navigation)

**Certification:**
- [Certification Checklist](./FI_TRAINING_GUIDE_CSIS.md#certification-checklist)

---

### For Supervisors

**Required Reading:**
1. [Supervisor GPS Verification Guide](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md) - Complete guide
2. [FI Training Guide](./FI_TRAINING_GUIDE_CSIS.md) - Understanding FI workflow
3. [Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md) - Supporting FIs

**Key Skills:**
- [Reading GPS Verification Display](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#reading-the-gps-verification-display)
- [Reviewing Flagged Interviews](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#reviewing-flagged-interviews)
- [Configuring Thresholds](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#configuring-gps-thresholds)

**Best Practices:**
- [Daily Review Routine](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#daily-review-routine)
- [Quality Assurance Tips](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#quality-assurance-tips)

---

### For Technical Staff

**Required Reading:**
1. [API Documentation](./API_DOCUMENTATION_CSIS.md) - Complete technical specs
2. [Troubleshooting Guide - Technical Issues](./CSIS_TROUBLESHOOTING_GUIDE.md#performance-issues)

**Key Topics:**
- [GPS Verification Endpoints](./API_DOCUMENTATION_CSIS.md#gps-verification-endpoints)
- [Database Schema Changes](./API_DOCUMENTATION_CSIS.md#database-schema)
- [Migration Guide](./API_DOCUMENTATION_CSIS.md#migration-guide)
- [Error Codes](./API_DOCUMENTATION_CSIS.md#error-codes)

---

## Common Scenarios

### Scenario 1: FI Cannot Capture GPS

**Relevant Documentation:**
1. [Troubleshooting Guide - GPS Capture Issues](./CSIS_TROUBLESHOOTING_GUIDE.md#gps-capture-issues)
2. [FI Training Guide - GPS Capture](./FI_TRAINING_GUIDE_CSIS.md#gps-capture-instructions)

**Quick Solution:**
- Check permissions
- Move outdoors
- Wait 30-60 seconds
- Document if persistent

---

### Scenario 2: Kish Grid Selects Unavailable Respondent

**Relevant Documentation:**
1. [Troubleshooting Guide - Kish Grid Issues](./CSIS_TROUBLESHOOTING_GUIDE.md#issue-kish-grid-selects-unavailable-member)
2. [FI Training Guide - Kish Grid](./FI_TRAINING_GUIDE_CSIS.md#what-if-the-kish-grid-selects-someone-who-isnt-home)

**Quick Solution:**
- Schedule callback
- Do NOT substitute respondent
- Document in system

---

### Scenario 3: Interview Flagged for GPS Verification

**Relevant Documentation:**
1. [Supervisor GPS Verification Guide - Reviewing Flagged Interviews](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#reviewing-flagged-interviews)
2. [Supervisor GPS Verification Guide - Taking Action](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md#taking-action-on-flagged-interviews)

**Quick Solution:**
- Review map display
- Check GPS accuracy
- Consider context
- Make decision (approve/request/reject)

---

### Scenario 4: Survey Won't Submit

**Relevant Documentation:**
1. [Troubleshooting Guide - Data Submission Errors](./CSIS_TROUBLESHOOTING_GUIDE.md#data-submission-errors)
2. [FI Training Guide - Summary & Submission](./FI_TRAINING_GUIDE_CSIS.md#step-6-summary--submission)

**Quick Solution:**
- Check GPS captured
- Verify all 6 sections complete
- Check internet connection
- Review error message

---

## System Requirements

### Browser Requirements
- **Recommended:** Chrome 90+
- **Supported:** Firefox 88+, Edge 90+
- **Limited:** Safari 14+ (iOS GPS issues)

**Details:** [Troubleshooting Guide - Browser Compatibility](./CSIS_TROUBLESHOOTING_GUIDE.md#browser-compatibility)

### Device Requirements
- GPS capability required
- Internet connection (with offline mode support)
- Minimum 2GB RAM
- Modern browser support

### Network Requirements
- Internet for sync (offline mode available)
- Stable connection for GPS verification
- API access for submission

---

## Support Contacts

### Technical Support
- **Email:** [support@example.com]
- **Phone:** [Support phone number]
- **Hours:** Monday-Friday, 8 AM - 5 PM

### Field Supervisor
- Contact your assigned supervisor
- Report issues immediately
- Request training if needed

### Emergency Support
- Critical system issues
- Data loss concerns
- Security incidents

---

## Version History

### Version 1.0 - CSIS Methodology Implementation
**Release Date:** [Date]

**Major Changes:**
- Implemented 6-section survey workflow
- Added Kish Grid respondent selection
- Introduced GPS verification for quality control
- Removed questionnaire type field
- Added CSIS randomization (150-entry map)

**Documentation Created:**
- FI Training Guide - CSIS Methodology
- Supervisor GPS Verification Guide
- API Documentation - CSIS
- CSIS Troubleshooting Guide

**Migration Notes:**
- See [API Documentation - Migration Guide](./API_DOCUMENTATION_CSIS.md#migration-guide)
- Backward compatible with existing data
- New surveys must follow CSIS methodology

---

## Additional Resources

### Official DILG Documentation
- CSIS Digital Methodology Manual (v4.0)
- CSIS Annex I - Randomization Table
- CSIS Annex II - Kish Grid Matrix

### Video Tutorials
- GPS Capture Tutorial
- Kish Grid Explanation
- 6-Section Workflow Walkthrough
- Supervisor Dashboard Overview

### Practice Environment
- Test system for training
- Sample surveys
- GPS verification examples

### FAQ Database
- Comprehensive Q&A
- Searchable knowledge base
- Community contributions

---

## Document Maintenance

**Last Updated:** [Date]

**Maintained By:** SIGLA Development Team

**Review Schedule:** Quarterly

**Feedback:** Submit documentation feedback to [email]

**Updates:** Check for updates regularly, especially after system releases

---

## Quick Links

| Document | Audience | Purpose |
|----------|----------|---------|
| [FI Training Guide](./FI_TRAINING_GUIDE_CSIS.md) | Field Interviewers | Complete workflow training |
| [Supervisor GPS Verification Guide](./SUPERVISOR_GPS_VERIFICATION_GUIDE.md) | Supervisors | Quality control and GPS verification |
| [API Documentation](./API_DOCUMENTATION_CSIS.md) | Developers | Technical specifications |
| [Troubleshooting Guide](./CSIS_TROUBLESHOOTING_GUIDE.md) | All Users | Problem resolution |

---

*SIGLA Survey System - CSIS Methodology Implementation*
*Version 1.0*
