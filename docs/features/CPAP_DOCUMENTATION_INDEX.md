# CPAP Module Documentation Index

## Overview

This document provides a comprehensive index of all CPAP module documentation. Use this as your starting point to find the information you need.

## Quick Start Guides

### For OFFICER Users
- **[CPAP Officer User Guide](./CPAP_OFFICER_USER_GUIDE.md)** - Complete guide for creating and managing CPAPs
- **[CPAP Officer Quick Guide](./CPAP_OFFICER_QUICK_GUIDE.md)** - Quick reference for common tasks
- **[AI Suggestions Guide](./CPAP_AI_SUGGESTIONS_GUIDE.md)** - How to use AI-powered recommendations

### For ADMIN Users
- **[CPAP Admin User Guide](./CPAP_ADMIN_USER_GUIDE.md)** - Complete guide for reviewing and monitoring CPAPs
- **[CPAP Admin Quick Guide](./CPAP_ADMIN_QUICK_GUIDE.md)** - Quick reference for review and monitoring

## Technical Documentation

### Architecture & Design
- **[System Architecture](./CPAP_SYSTEM_ARCHITECTURE.md)** - Technical architecture and design decisions
- **[Design Document](../.kiro/specs/cpap-module-integration/design.md)** - Detailed design specifications
- **[Requirements Document](../.kiro/specs/cpap-module-integration/requirements.md)** - Functional requirements

### API Documentation
- **[API Documentation](./CPAP_API_DOCUMENTATION.md)** - Complete API reference
- **[API Quick Reference](./CPAP_API_QUICK_REFERENCE.md)** - Quick API endpoint reference
- **[API Endpoints Implementation](./CPAP_API_ENDPOINTS_IMPLEMENTATION.md)** - Implementation details

### Service Layer Documentation
- **[CPAP Service](../src/lib/services/README-CPAP-SERVICE.md)** - Core CPAP service documentation
- **[Validation Service](../src/lib/services/README-CPAP-VALIDATION-SERVICE.md)** - Validation service documentation
- **[Permission Service](../src/lib/services/README-CPAP-PERMISSION-SERVICE.md)** - Permission service documentation
- **[Notification Service](../src/lib/services/README-CPAP-NOTIFICATION-SERVICE.md)** - Notification service documentation

### UI Implementation
- **[Officer UI Implementation](./CPAP_OFFICER_UI_IMPLEMENTATION.md)** - OFFICER interface implementation
- **[Admin UI Implementation](./CPAP_ADMIN_UI_IMPLEMENTATION.md)** - ADMIN interface implementation
- **[Access Control Implementation](./CPAP_ACCESS_CONTROL_IMPLEMENTATION.md)** - Role-based access control

## Database Documentation

### Schema & Migrations
- **[Database Migration Guide](../database/README-CPAP-MODULE-MIGRATION.md)** - Migration instructions
- **[Migration Summary](../database/CPAP-MIGRATION-SUMMARY.md)** - Migration overview
- **[Migration Complete](../database/CPAP-MIGRATION-COMPLETE.md)** - Post-migration verification
- **[Production Migration Guide](../database/CPAP-MIGRATION-PRODUCTION-GUIDE.md)** - Production deployment guide
- **[Quick Start](../database/CPAP-QUICK-START.md)** - Quick database setup

### Role Migration
- **[Role Migration Guide](../database/README-ROLE-MIGRATION.md)** - VIEWER to OFFICER migration
- **[Role Migration Complete](../database/ROLE-MIGRATION-COMPLETE.md)** - Migration verification
- **[Role Migration Corrected](../database/ROLE-MIGRATION-CORRECTED.md)** - Corrections and fixes

## Deployment Documentation

### Deployment Procedures
- **[Deployment Checklist](./CPAP_DEPLOYMENT_CHECKLIST.md)** - Complete deployment checklist
- **[Rollback Procedures](./CPAP_ROLLBACK_PROCEDURES.md)** - Emergency rollback guide

### Testing Documentation
- **[Unit Tests](../src/lib/services/__tests__/)** - Service layer unit tests
- **[Integration Tests](../tests/integration/CPAP-API-INTEGRATION-TESTS.md)** - API integration tests
- **[E2E Tests](../tests/e2e/CPAP-E2E-TESTS-IMPLEMENTATION.md)** - End-to-end test documentation

## Implementation Summaries

### Task Completion Summaries
- **[Task 11: Access Control](./TASK_11_COMPLETION_SUMMARY.md)** - FS/INTERVIEWER access restriction
- **[Task 13: Database Migration](./TASK_13_COMPLETION_SUMMARY.md)** - Database setup completion
- **[Task 16: E2E Tests](./TASK_16_COMPLETION_SUMMARY.md)** - E2E testing completion
- **[Task 17: Report Card Cleanup](./TASK_17_COMPLETION_SUMMARY.md)** - AI roadmap removal

## Quick Reference Cards

### For Users
- **[CPAP Workflow Quick Reference](./CPAP_OFFICER_QUICK_GUIDE.md#quick-reference-card)** - Workflow overview
- **[Status-Based Actions](./CPAP_OFFICER_QUICK_GUIDE.md#status-based-actions)** - What you can do in each status

### For Developers
- **[API Quick Reference](./CPAP_API_QUICK_REFERENCE.md)** - API endpoints at a glance
- **[Service Quick Reference](../src/lib/services/CPAP-VALIDATION-QUICK-REFERENCE.md)** - Service methods overview
- **[Permission Quick Reference](../src/lib/services/CPAP-PERMISSION-QUICK-REFERENCE.md)** - Permission checks

## Scripts & Tools

### Migration Scripts
- **[Apply CPAP Migration](../scripts/apply-cpap-migration.js)** - Run database migration
- **[Verify CPAP Schema](../scripts/verify-cpap-schema.js)** - Verify migration success
- **[Check CPAP Tables](../scripts/check-cpap-tables.js)** - Check table structure
- **[Migrate Viewer to Officer](../scripts/migrate-viewer-to-officer.js)** - Role migration script

### Testing Scripts
- **[Test CPAP Middleware](../scripts/test-cpap-middleware.js)** - Test access control
- **[Test CPAP Access Control](../scripts/test-cpap-access-control.js)** - Test permissions
- **[Test CPAP Rollback](../scripts/test-cpap-rollback.js)** - Test rollback procedure

## Documentation by Role

### I'm an OFFICER User
Start here:
1. [CPAP Officer User Guide](./CPAP_OFFICER_USER_GUIDE.md)
2. [AI Suggestions Guide](./CPAP_AI_SUGGESTIONS_GUIDE.md)
3. [Officer Quick Guide](./CPAP_OFFICER_QUICK_GUIDE.md)

### I'm an ADMIN User
Start here:
1. [CPAP Admin User Guide](./CPAP_ADMIN_USER_GUIDE.md)
2. [Admin Quick Guide](./CPAP_ADMIN_QUICK_GUIDE.md)

### I'm a Developer
Start here:
1. [System Architecture](./CPAP_SYSTEM_ARCHITECTURE.md)
2. [API Documentation](./CPAP_API_DOCUMENTATION.md)
3. [Design Document](../.kiro/specs/cpap-module-integration/design.md)
4. [Service Documentation](../src/lib/services/README-CPAP-SERVICE.md)

### I'm a Database Administrator
Start here:
1. [Database Migration Guide](../database/README-CPAP-MODULE-MIGRATION.md)
2. [Production Migration Guide](../database/CPAP-MIGRATION-PRODUCTION-GUIDE.md)
3. [Rollback Procedures](./CPAP_ROLLBACK_PROCEDURES.md)

### I'm a DevOps Engineer
Start here:
1. [Deployment Checklist](./CPAP_DEPLOYMENT_CHECKLIST.md)
2. [Rollback Procedures](./CPAP_ROLLBACK_PROCEDURES.md)
3. [System Architecture](./CPAP_SYSTEM_ARCHITECTURE.md)

### I'm a QA Tester
Start here:
1. [Integration Tests](../tests/integration/CPAP-API-INTEGRATION-TESTS.md)
2. [E2E Tests](../tests/e2e/CPAP-E2E-TESTS-IMPLEMENTATION.md)
3. [Testing Guide](../tests/e2e/README.md)

## Documentation by Task

### Creating a CPAP
- [Officer User Guide - Creating a CPAP](./CPAP_OFFICER_USER_GUIDE.md#creating-a-cpap)
- [Using AI Suggestions](./CPAP_AI_SUGGESTIONS_GUIDE.md#using-ai-suggestions)

### Submitting a CPAP
- [Officer User Guide - Submitting for Review](./CPAP_OFFICER_USER_GUIDE.md#submitting-for-review)
- [Validation Requirements](./CPAP_OFFICER_USER_GUIDE.md#before-you-submit)

### Reviewing a CPAP
- [Admin User Guide - Reviewing CPAPs](./CPAP_ADMIN_USER_GUIDE.md#reviewing-submitted-cpaps)
- [Quality Criteria](./CPAP_ADMIN_USER_GUIDE.md#quality-criteria)

### Approving a CPAP
- [Admin User Guide - Approving CPAPs](./CPAP_ADMIN_USER_GUIDE.md#approving-cpaps)

### Requesting Revisions
- [Admin User Guide - Requesting Revisions](./CPAP_ADMIN_USER_GUIDE.md#requesting-revisions)
- [Writing Effective Comments](./CPAP_ADMIN_USER_GUIDE.md#writing-effective-revision-comments)

### Tracking Progress
- [Officer User Guide - Tracking Progress](./CPAP_OFFICER_USER_GUIDE.md#tracking-progress)
- [Admin User Guide - Monitoring Progress](./CPAP_ADMIN_USER_GUIDE.md#monitoring-progress)

### Deploying CPAP Module
- [Deployment Checklist](./CPAP_DEPLOYMENT_CHECKLIST.md)
- [Database Migration](../database/CPAP-MIGRATION-PRODUCTION-GUIDE.md)

### Rolling Back Deployment
- [Rollback Procedures](./CPAP_ROLLBACK_PROCEDURES.md)
- [Rollback Script](../scripts/test-cpap-rollback.js)

### Developing CPAP Features
- [System Architecture](./CPAP_SYSTEM_ARCHITECTURE.md)
- [API Documentation](./CPAP_API_DOCUMENTATION.md)
- [Service Layer Docs](../src/lib/services/README-CPAP-SERVICE.md)

### Testing CPAP Features
- [Unit Tests](../src/lib/services/__tests__/)
- [Integration Tests](../tests/integration/cpap-api.test.ts)
- [E2E Tests](../tests/e2e/cpap-workflows.spec.ts)

## Troubleshooting Guides

### User Issues
- [Officer Troubleshooting](./CPAP_OFFICER_USER_GUIDE.md#troubleshooting)
- [Admin Troubleshooting](./CPAP_ADMIN_USER_GUIDE.md#troubleshooting)

### Technical Issues
- [Deployment Troubleshooting](./CPAP_DEPLOYMENT_CHECKLIST.md#troubleshooting)
- [Rollback Troubleshooting](./CPAP_ROLLBACK_PROCEDURES.md#troubleshooting)

## FAQs

### User FAQs
- [Officer FAQs](./CPAP_OFFICER_USER_GUIDE.md#tips-for-success)
- [AI Suggestions FAQs](./CPAP_AI_SUGGESTIONS_GUIDE.md#frequently-asked-questions)

### Technical FAQs
- [API FAQs](./CPAP_API_DOCUMENTATION.md#error-handling)
- [Deployment FAQs](./CPAP_DEPLOYMENT_CHECKLIST.md#troubleshooting)

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Nov 2025 | Initial release | Development Team |

## Contributing to Documentation

### Documentation Standards
- Use Markdown format
- Include table of contents for long documents
- Provide code examples where applicable
- Keep language clear and concise
- Update index when adding new documents

### Requesting Documentation Updates
- Submit issues for unclear documentation
- Suggest improvements via pull requests
- Report broken links or outdated information

## Support

### Getting Help
- **Technical Support:** support@pulse.gov.ph
- **User Support:** help@pulse.gov.ph
- **Documentation Issues:** docs@pulse.gov.ph

### Training Resources
- User training sessions (scheduled quarterly)
- Video tutorials (coming soon)
- Webinars (on request)

---

**Last Updated:** November 2025  
**Maintained By:** PULSE Documentation Team  
**Review Frequency:** Monthly
