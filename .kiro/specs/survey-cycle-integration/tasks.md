# Implementation Plan

- [x] 1. Set up database schema and core cycle management




  - Add survey_cycle_id columns to survey_response, survey_target, and assignment tables
  - Create foreign key constraints linking to survey_cycle table
  - Add unique constraint ensuring only one active cycle exists
  - Create database migration scripts for schema updates
  - _Requirements: 1.4, 2.4_

- [x] 1.1 Create survey cycle helper utilities



  - Implement getActiveCycle() function for retrieving current active cycle
  - Create setActiveCycle() function with validation logic
  - Add validateSingleActiveCycle() constraint checking
  - Write utility functions for cycle-aware database queries
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.2 Write unit tests for cycle utilities






  - Create tests for active cycle retrieval and setting
  - Test constraint validation and error handling
  - Mock database interactions for isolated testing
  - _Requirements: 2.4_

- [x] 2. Implement survey cycle management API





  - Create GET /api/survey-cycles/active endpoint for retrieving active cycle
  - Implement POST /api/survey-cycles/active endpoint for setting active cycle
  - Add GET /api/survey-cycles endpoint for listing all cycles
  - Include proper error handling for constraint violations and missing cycles
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.1 Add cycle management authorization


  - Implement admin-only access control for cycle activation endpoints
  - Add role-based permissions checking middleware
  - Create audit logging for cycle management operations
  - _Requirements: 2.2, 2.3_

- [x] 2.2 Write API endpoint tests






  - Test all CRUD operations for survey cycles
  - Test error conditions and authorization requirements
  - Validate response formats and status codes
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Update survey response creation to be cycle-aware




  - Modify survey response creation to automatically link to active cycle
  - Update survey number format to use cycle year (BB-CYCLEYEAR-NNNN)
  - Update mock data generator to use active cycle instead of calendar year
  - Modify survey form submission logic to include cycle context
  - _Requirements: 1.1, 1.4, 3.4_

- [x] 3.1 Update survey response API endpoints


  - Add cycle filtering to survey response queries
  - Update survey response creation with cycle_id validation
  - Modify survey response retrieval to be cycle-scoped
  - _Requirements: 1.1, 3.2_

- [x] 3.2 Write survey response integration tests



















  - Test survey creation with active cycle linkage
  - Verify survey number format includes cycle year
  - Test data isolation between different cycles
  - _Requirements: 1.1, 3.4_

- [x] 4. Implement cycle-aware dashboard data filtering




  - Update barangays-with-assignments API to filter by active cycle
  - Modify progress calculation logic to be cycle-scoped
  - Update funnel analysis to use only active cycle data
  - Ensure dashboard shows zero progress for new cycles
  - _Requirements: 1.5, 3.1, 3.2, 3.3_

- [x] 4.1 Update dashboard analytics components


  - Modify progress indicators to display cycle-specific data
  - Update completion percentage calculations for active cycle
  - Add cycle context to all dashboard data queries
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.2 Write dashboard integration tests









  - Test progress calculations with cycle-scoped data
  - Verify zero progress display for new cycles
  - Test data filtering accuracy across cycles
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Update survey targets to be cycle-aware














  - Link survey target creation to active cycle
  - Update target progress calculations to be cycle-scoped
  - Modify target retrieval queries to filter by active cycle
  - Allow target reset functionality when starting new cycles
  - _Requirements: 1.2, 3.2_

- [x] 5.1 Update survey target API endpoints




  - Add cycle_id to survey target creation requests
  - Filter target queries by active cycle
  - Update achievement calculation logic to be cycle-scoped
  - _Requirements: 1.2, 3.2_

- [x] 5.2 Write survey target tests


  - Test target creation with cycle linkage
  - Verify progress calculations within cycle scope
  - Test target reset functionality for new cycles
  - _Requirements: 1.2, 3.2_

- [x] 6. Create survey cycle context provider for UI





  - Implement React context for managing active cycle state
  - Create hooks for accessing and updating cycle context
  - Add automatic data refresh when cycle changes
  - Provide loading and error states for cycle operations
  - _Requirements: 6.3, 6.4_

- [x] 6.1 Add cycle information display to navigation














  - Display current active cycle name and year in header/navigation
  - Add cycle context indicators throughout the application
  - Show "No Active Cycle" message when none is set
  - _Requirements: 6.1, 6.4_

- [x] 6.2 Build cycle selector dropdown component





  - Create dropdown component for cycle selection in navigation/header
  - Implement cycle switching functionality for authorized users
  - Add visual indicators for current active cycle in UI
  - Include proper loading and error handling states
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 6.3 Write UI component tests









  - Test cycle context provider functionality
  - Test cycle selector component behavior
  - Verify automatic data refresh on cycle changes
  - _Requirements: 6.3, 6.4_

- [x] 7. Update assignment management to be cycle-aware





  - Link assignment creation to active cycle
  - Filter assignment views to show only active cycle assignments
  - Update assignment auto-completion logic to be cycle-scoped
  - Modify assignment progress tracking for cycle context
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7.1 Update assignment API endpoints


  - Add cycle_id to assignment creation and queries
  - Filter assignment retrieval by active cycle
  - Update assignment status tracking to be cycle-scoped
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 7.2 Write assignment integration tests





  - Test assignment creation with cycle linkage
  - Verify assignment filtering by active cycle
  - Test auto-completion logic within cycle scope
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Integrate cycle context throughout the application
  - Add cycle context provider to main application wrapper
  - Update navigation components to display current cycle
  - Ensure all data-fetching components use cycle context
  - Add cycle indicators to relevant UI sections
  - _Requirements: 6.1, 6.4_

- [x] 8.1 Update existing components to use cycle context





  - Modify survey dashboard to consume cycle context and show cycle info
  - Update settings pages to be cycle-aware where applicable
  - Add cycle information to data export functionality
  - Ensure all data displays show which cycle they represent
  - _Requirements: 6.4, 3.2_

- [x] 8.2 Create admin cycle management interface



  - Build admin page for creating new survey cycles
  - Add interface for setting active cycle (admin only)
  - Display list of all cycles with their status
  - Include cycle creation form with validation
  - _Requirements: 2.1, 2.2, 2.3, 6.2_

- [x] 8.3 Write end-to-end integration tests





  - Test complete cycle workflow from creation to data isolation
  - Verify cross-component cycle context propagation
  - Test user experience flows with cycle switching
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 9. Implement historical cycle data access





  - Create API endpoints for accessing previous cycle data
  - Add functionality to view historical cycle dashboards
  - Implement cycle comparison features for analytics
  - Ensure data integrity when switching between cycles
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 9.1 Build historical cycle viewer components


  - Create components for viewing previous cycle data
  - Implement cycle comparison dashboard interface
  - Add historical trend analysis visualization
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 9.2 Write historical data access tests





  - Test historical cycle data retrieval accuracy
  - Verify data isolation between current and historical cycles
  - Test cycle comparison functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.5_