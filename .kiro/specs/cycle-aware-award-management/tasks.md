# Cycle-Aware Award Management - Implementation Tasks

## Overview
Implement cycle-aware SGLGB award management system where award status is tied to specific survey cycles, allowing independent award management per cycle while maintaining historical data.

## Current Status Analysis
- ✅ Database schema: cycle_awards table exists with migration scripts
- ✅ Map coloring: 2-color system already implemented (green/gray)
- ✅ Settings UI: Framework exists with sidebar navigation
- ✅ Survey cycle system: Comprehensive APIs and helpers available
- ❌ Cycle awards service layer: Needs implementation
- ❌ Award management APIs: Need to be created
- ❌ Award management UI: Need to add to settings
- ❌ Integration: Map and survey systems need cycle-aware award integration

## Implementation Tasks

- [x] 1. Service Layer & Data Migration
  - [x] 1.1 Create cycle_awards table schema
    - Database table created with proper foreign keys and constraints
    - Migration scripts available in database/cycle-awards-migration.sql
    - _Requirements: Cycle-specific award tracking_
  - [x] 1.2 Create cycle awards service layer






    - Create src/lib/services/cycleAwardsService.ts with CRUD operations
    - Implement getCycleAwards, setCycleAward, bulkUpdateAwards functions
    - Add award history and transition management functions
    - _Requirements: Database abstraction layer, Award CRUD operations_
  - [x] 1.3 Migrate existing seal data to cycle awards






    - Create migration script to copy current barangay.seal data to cycle_awards
    - Associate existing seals with active survey cycle
    - Preserve historical seal information
    - _Requirements: Data migration and integrity_

- [x] 2. Award Management API





  - [x] 2.1 Create cycle awards API endpoints



    - Create src/app/api/cycle-awards/route.ts for GET and POST operations
    - Create src/app/api/cycle-awards/[id]/route.ts for PUT and DELETE
    - Implement cycle-specific award retrieval and management
    - _Requirements: Award CRUD operations_
  - [x] 2.2 Add bulk award management endpoints



    - Create src/app/api/cycle-awards/bulk/route.ts for bulk operations
    - Implement bulk assign/remove awards functionality
    - Add import/export capabilities for award lists
    - _Requirements: Efficient award management_


  - [x] 2.3 Update barangay APIs for cycle-aware awards






    - Modify existing barangay endpoints to include cycle-specific award status
    - Update src/app/api/barangays/route.ts to use cycle awards instead of global seals
    - Ensure backward compatibility during transition
    - _Requirements: Cycle-aware barangay data_

- [x] 3. Award Management UI





  - [x] 3.1 Add award management section to settings



    - Create src/app/settings/ui/sections/award-management.tsx component
    - Add "Award Management" to settings sidebar navigation
    - Display barangay list with current award status for active cycle
    - _Requirements: User-friendly award management_
  - [x] 3.2 Implement award management controls



    - Create award status dropdown components (Awardee/Non-Awardee)
    - Add bulk selection checkboxes for multiple barangay operations
    - Implement award change confirmation dialogs
    - _Requirements: Flexible award assignment_
  - [x] 3.3 Add award status indicators and history



    - Display award count summary (X out of Y barangays are awardees)
    - Show award history timeline per barangay
    - Add visual indicators for award status changes
    - _Requirements: Clear award status visibility, Award audit trail_

- [x] 4. Map Integration





  - [x] 4.1 Update map to use cycle-aware awards



    - Modify src/components/dashboard/InteractiveSVGMap.tsx to use cycle awards
    - Update getPathFill function to check cycle-specific award status
    - Ensure map reflects awards for currently selected cycle
    - _Requirements: Simple visual distinction, Cycle-aware barangay data_
  - [x] 4.2 Update barangayUtils for cycle awards



    - Modify src/utils/barangayUtils.ts isBarangayAwardee function
    - Add cycle parameter to award checking functions
    - Update ApiBarangayData interface to include cycle award information
    - _Requirements: Cycle-aware barangay data_

- [x] 5. Survey System Integration





  - [x] 5.1 Update survey target creation for awardees only



    - Modify survey target APIs to filter by cycle-specific award status
    - Update src/app/api/survey-targets/route.ts to only include awardees
    - Ensure assignment creation respects awardee-only scope
    - _Requirements: Awardee-only survey targeting_
  - [x] 5.2 Update dashboard filtering for awardees



    - Modify dashboard data fetching to focus on awardee performance
    - Update analytics calculations to exclude non-awardees
    - Filter survey lists and reports by awardee status
    - _Requirements: Awardee-focused dashboard_

- [x] 6. Cycle Transition Management





  - [x] 6.1 Implement award copying between cycles



    - Add functionality to copy awards from previous cycle to new cycle
    - Create award transition management tools in settings
    - Handle award status when creating new survey cycles
    - _Requirements: Smooth cycle transitions_
  - [x] 6.2 Add historical award viewing



    - Enable viewing awards for non-active cycles in settings
    - Preserve award changes when switching between cycles
    - Show award timeline and changes across cycles
    - _Requirements: Historical award preservation_

## Testing Requirements

### Unit Tests
- [x] Test cycle awards service layer operations







- [x] Test award API endpoints with various scenarios  







- [x] Test award management UI components







- [x] Test survey filtering with cycle-aware award status








### Integration Tests
- [x] Test complete award assignment workflow







- [x] Test cycle transitions with award data preservation







- [x] Test map coloring with cycle-specific awards







- [x] Test survey target creation with awardee filtering








### End-to-End Tests
- [x] Test full award management cycle (assign → survey → evaluate)








- [x] Test switching between cycles with different award configurations





- [ ] 7. Import/Export Functionality
  - [ ] 7.1 Implement award data export functionality
    - Add CSV/Excel export for award data with cycle information
    - Include barangay details, award status, and historical data
    - Support filtered exports (awardees only, specific cycles)
    - _Requirements: Efficient award management_
  - [ ] 7.2 Implement award data import functionality
    - Add CSV/Excel import for bulk award assignments
    - Validate imported data against existing barangays and cycles
    - Support batch processing with error reporting
    - _Requirements: Efficient award management_
  - [ ] 7.3 Add import/export UI controls
    - Connect existing Import/Export buttons to actual functionality
    - Add file upload dialog with validation feedback
    - Implement download triggers for export files
    - _Requirements: User-friendly award management_

- [x] Test bulk award operations and data integrity













## Success Criteria
- Admins can easily assign/remove awardee status per cycle through settings UI
- Only awardees are included in survey operations (targets, assignments, analytics)
- Map clearly distinguishes awardees (green) from non-awardees (gray) based on active cycle
- Award data is preserved when switching between cycles
- System maintains data integrity across cycle transitions
- Historical award information is accessible and modifiable

## Notes
- Database schema is ready - focus on service layer and API implementation first
- Existing map coloring system can be leveraged - just needs cycle-aware data source
- Settings UI framework exists - new award management section can be added easily
- Survey cycle system is mature - integration should be straightforward
- Maintain backward compatibility during transition from global seals to cycle awards