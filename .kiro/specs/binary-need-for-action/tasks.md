# Implementation Plan

- [x] 1. Identify and analyze current survey form structure





  - Locate survey form components in the codebase
  - Document current "Need for Action" implementation
  - Identify all 13 service indicators across 6 service areas
  - Map current field names and data structures
  - _Requirements: 1.1, 2.1_

- [x] 2. Update survey form data models and TypeScript interfaces





  - Create or update interfaces for conditional validation support
  - Add `NeedForActionBinaryQuestion` and `NeedForActionSuggestionQuestion` types
  - Update service indicator data interfaces to include both binary and suggestion fields
  - Implement field naming convention helpers for generating `{service_id}_nfa_binary` IDs
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 3. Implement conditional validation logic





  - Create `validateSuggestionField()` function that checks binary answer before validating suggestion
  - Implement dynamic `required` attribute logic based on binary answer
  - Add validation for binary question (always required)
  - Handle whitespace-only suggestions as invalid when binary is "Yes"
  - _Requirements: 1.3, 1.4, 1.5, 6.4, 6.5_

- [ ]* 3.1 Write property test for conditional validation - Yes case
  - **Property 2: Conditional validation - Yes requires suggestion**
  - **Validates: Requirements 1.4**

- [ ]* 3.2 Write property test for conditional validation - No case
  - **Property 3: Conditional validation - No allows empty suggestion**
  - **Validates: Requirements 1.5**

- [ ]* 3.3 Write property test for binary question requirement
  - **Property 4: Binary question is always required**
  - **Validates: Requirements 1.3**

- [ ]* 3.4 Write unit tests for validation logic
  - Test `validateSuggestionField()` with all combinations
  - Test whitespace-only rejection
  - Test validation state changes
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 4. Add binary question to survey form UI for all service indicators




  - Insert binary radio question before existing suggestion field for each of 13 indicators
  - Set question text: "Based on your experience, do you believe this service needs improvement from the barangay?"
  - Configure options as ["Yes", "No"] or ["Oo", "Hindi"] based on locale
  - Set binary question as required: true
  - Apply consistent styling and layout
  - _Requirements: 1.1, 1.2, 2.1_

- [ ]* 4.1 Write property test for binary question structure
  - **Property 1: Binary question structure consistency**
  - **Validates: Requirements 1.2**

- [x] 5. Implement dynamic validation updates in form




  - Add event handlers to detect binary answer changes
  - Update suggestion field's required status when binary answer changes
  - Preserve existing suggestion text when validation rules change
  - Ensure validation updates happen without page refresh
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 5.1 Write property test for dynamic validation updates
  - **Property 11: Dynamic validation updates**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 5.2 Write property test for text preservation
  - **Property 12: Text preservation during validation changes**
  - **Validates: Requirements 6.3**

- [x] 6. Update survey form submission logic





  - Modify form data collection to capture both binary and suggestion fields
  - Ensure field names follow convention: `need_for_action_binary_{indicator}` and `need_for_action_suggestion_{indicator}`
  - Validate data structure before submission
  - Handle both English and Tagalog binary values
  - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.2_

- [ ]* 6.1 Write property test for field naming convention
  - **Property 5: Field naming convention consistency**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ]* 6.2 Write unit tests for form submission
  - Test data structure creation
  - Test field naming for all indicators
  - Test localization handling
  - _Requirements: 3.1, 3.2_

- [x] 7. Update database schema and data storage





  - Add new binary fields to survey_section JSONB structure for all service indicators
  - Rename existing suggestion fields to follow new naming convention
  - Ensure both fields are stored in JSONB for each service indicator
  - Update any database constraints or validation rules
  - _Requirements: 2.5, 3.3_

- [ ]* 7.1 Write property test for data structure completeness
  - **Property 6: Data structure completeness**
  - **Validates: Requirements 2.5, 3.3**

- [x] 8. Create database migration script





  - Write migration to add binary fields to existing data
  - Implement field renaming logic (e.g., `suggestionsProjects` → `need_for_action_suggestion_projects`)
  - Add backfill logic: set binary to "Yes" if suggestion exists and is non-empty, otherwise "No"
  - Include rollback capability
  - Test migration on sample data
  - _Requirements: 3.3, 3.4, 3.5_

- [ ]* 8.1 Write integration test for migration
  - Test migration on sample data
  - Verify field renaming
  - Verify data integrity
  - _Requirements: 3.3_

- [x] 9. Update analytics API calculation logic




  - Locate NFA Rate calculation code in `/api/survey-analytics`
  - Replace calculation to use only `need_for_action_binary` field
  - Implement: NFA Rate = (COUNT where binary = "Yes") / (TOTAL COUNT) × 100
  - Handle edge case: return 0 when no responses exist
  - Ensure calculation works with both "Yes"/"No" and "Oo"/"Hindi"
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 9.1 Write property test for NFA Rate calculation accuracy
  - **Property 7: NFA Rate calculation accuracy**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ]* 9.2 Write property test for NFA Rate independence from suggestions
  - **Property 8: NFA Rate uses only binary field**
  - **Validates: Requirements 4.5**

- [ ]* 9.3 Write unit tests for analytics calculations
  - Test with various response distributions
  - Test edge case: zero responses
  - Test edge case: all "Yes" responses
  - Test edge case: all "No" responses
  - Test localization handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Update SQL queries for analytics





  - Update JSONB field access to use new field names
  - Implement COUNT FILTER for "Yes" responses
  - Optimize queries with appropriate indexes if needed
  - Test query performance with large datasets
  - _Requirements: 4.1, 4.2, 4.5_

- [x] 11. Update mock data generator




  - Locate mock data generation code in `/api/tools/generate-mock-survey-data`
  - Implement two-step generation: first determine binary value, then conditionally generate suggestion
  - For "Yes" responses: always generate non-empty suggestion
  - For "No" responses: generate suggestion only 10-15% of the time
  - Ensure generated suggestions for "No" are neutral/positive
  - Apply logic to all 13 service indicators
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 11.1 Write property test for mock data Yes case
  - **Property 9: Mock data conditional generation - Yes case**
  - **Validates: Requirements 5.2**

- [ ]* 11.2 Write property test for mock data No case probability
  - **Property 10: Mock data conditional generation - No case probability**
  - **Validates: Requirements 5.3**

- [ ]* 11.3 Write unit tests for mock data generator
  - Test "Yes" always has suggestion
  - Test "No" has suggestion 10-15% of time (statistical test)
  - Test field naming consistency
  - Test all service indicators follow pattern
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 12. Add error handling for survey form




  - Implement error messages for missing binary answer
  - Implement error messages for "Yes" with empty suggestion
  - Handle form state inconsistencies gracefully
  - Add user-friendly error message display
  - _Requirements: 1.3, 6.5_

- [x] 13. Add error handling for data storage





  - Validate data structure completeness before storage
  - Validate binary values are only "Yes"/"No" or "Oo"/"Hindi"
  - Return appropriate HTTP status codes and error messages
  - Implement retry logic for database connection failures
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 14. Add error handling for analytics API



  - Handle zero responses case gracefully
  - Log and skip malformed JSONB data
  - Validate query parameters
  - Return appropriate error responses
  - _Requirements: 4.4_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 16. Create end-to-end integration tests
  - Test complete survey flow through all service indicators
  - Test binary question interaction and conditional validation
  - Test survey submission and data storage
  - Test analytics dashboard displays correct NFA Rates
  - Test data migration on sample data
  - _Requirements: All_

- [ ]* 17. Perform manual testing
  - Verify binary question appears for all 13 service indicators
  - Test validation when changing binary answer
  - Verify text preservation when switching from "Yes" to "No"
  - Test survey submission stores both fields correctly
  - Verify analytics dashboard shows correct NFA Rates
  - Test mock data generator produces realistic distributions
  - Test localization (English vs Tagalog)
  - Test mobile responsive design
  - Test accessibility (keyboard navigation, screen readers)
  - _Requirements: All_

- [ ] 18. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
