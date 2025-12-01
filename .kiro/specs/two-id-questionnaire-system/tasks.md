# Implementation Plan: Two-ID Questionnaire System

- [x] 1. Create display ID calculation utility





  - Create `src/utils/displayIdCalculator.ts` with `calculateDisplayId()` and `parseFullId()` functions
  - Reuse existing `parseQuestionnaireId()` from `src/utils/questionnaireIdParser.ts`
  - Implement formula: `display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number`
  - Handle invalid inputs gracefully (return null for malformed full_id)
  - Handle on-the-fly questionnaires (spot_number = 0) by returning null
  - _Requirements: 3.1, 3.3, 6.1, 7.1, 7.3_

- [ ]* 1.1 Write unit tests for display ID calculator
  - Test valid full_id parsing and calculation
  - Test boundary cases (spot 1 questionnaire 1 = display_id 1, spot 30 questionnaire 5 = display_id 150)
  - Test mid-range cases (spot 2 questionnaire 1 = display_id 6)
  - Test invalid input handling (malformed strings, null, empty)
  - Test on-the-fly questionnaires (spot_number = 0)
  - _Requirements: 3.4, 3.5, 7.3_

- [ ]* 1.2 Write property test for display ID formula correctness
  - **Property 1: Display ID Formula Correctness**
  - **Validates: Requirements 3.1, 3.3**

- [ ]* 1.3 Write property test for display ID determinism
  - **Property 2: Display ID Determinism**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ]* 1.4 Write property test for error handling
  - **Property 9: Error Handling Graceful Degradation**
  - **Validates: Requirements 7.3**

- [ ]* 1.5 Write property test for creation order independence
  - **Property 10: Creation Order Independence**
  - **Validates: Requirements 6.5**

- [x] 2. Update GET /api/assignments endpoint





  - Fetch questionnaires from database using existing query
  - Import `calculateDisplayId()` utility
  - Map over questionnaires array to add `display_id` field to each record
  - Ensure response includes both `questionnaire_id` (full_id) and `display_id`
  - Handle cases where `calculateDisplayId()` returns null (log warning, include null in response)
  - _Requirements: 3.1, 3.2_

- [x] 3. Update GET /api/spots endpoint





  - Fetch spots with nested questionnaires
  - Import `calculateDisplayId()` utility
  - Map over nested questionnaires to add `display_id` field
  - Ensure response includes both `questionnaire_id` and `display_id` for each questionnaire
  - _Requirements: 3.1, 3.2_

- [x] 4. Update GET /api/fi/my-interviews endpoint




  - Fetch FI's assigned questionnaires
  - Import `calculateDisplayId()` utility
  - Add `display_id` field to each questionnaire in response
  - Ensure response includes both identifiers
  - _Requirements: 3.1, 3.2_

- [ ]* 4.1 Write integration tests for API endpoints
  - Test GET /api/assignments returns both full_id and display_id
  - Test GET /api/spots returns display_id for nested questionnaires
  - Test GET /api/fi/my-interviews returns display_id
  - Verify display_id matches expected formula for known full_ids
  - _Requirements: 3.2, 8.1_

- [x] 5. Update FI Dashboard - InterviewSlotCard component





  - Locate `src/components/fi-dashboard/InterviewSlotCard.tsx`
  - Update display logic to show `Interview #{display_id}` instead of full_id
  - Add fallback: if `display_id` is null, calculate it using `calculateDisplayId(questionnaire_id)`
  - Ultimate fallback: if calculation fails, show full_id
  - Ensure internal logic (onClick handlers, URL construction) still uses `questionnaire_id` (full_id)
  - _Requirements: 1.1, 1.3, 4.1, 4.3_

- [x] 6. Update Spot Assignment Panel component





  - Locate `src/components/fs-dashboard/SpotAssignmentPanel.tsx`
  - Update questionnaire display to show `Interview #{display_id}`
  - Add fallback logic for null display_id
  - Ensure internal operations (assignment, API calls) use full_id
  - _Requirements: 1.3, 4.1_

- [x] 7. Update Questionnaire Assignment Modal component





  - Locate `src/components/fs-dashboard/QuestionnaireAssignmentModal.tsx` (or similar)
  - Update questionnaire list display to show `Interview #{display_id}`
  - Add fallback logic for null display_id
  - Ensure assignment operations use full_id
  - _Requirements: 1.3, 4.1_

- [x] 8. Update Survey Form Header component





  - Locate `src/app/survey/forms/sections/header.tsx` or survey form header component
  - Update header to display `Interview #{display_id}` instead of full_id
  - Fetch questionnaire data from API or IndexedDB to get display_id
  - Add fallback: calculate display_id from questionnaireId (full_id) if not in data
  - Ultimate fallback: show full_id if calculation fails
  - _Requirements: 1.2, 1.3_

- [ ]* 8.1 Write property test for UI display consistency
  - **Property 3: UI Display Consistency**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [x] 9. Update CSIS Kish Grid integration






  - Locate survey initialization code that calls `selectRespondentKishGrid()`
  - Update to pass `display_id` instead of parsed `questionnaire_number` from full_id
  - Calculate display_id from full_id using `calculateDisplayId()`
  - Add fallback: if display_id is null or out of range (1-150), use parsed questionnaire_number from full_id
  - Log warning if fallback is used
  - _Requirements: 5.1, 5.3, 5.5_

- [x] 10. Update CSIS Section Order Randomization integration




  - Locate survey initialization code that calls `getSectionOrder()`
  - Update to pass `display_id` instead of parsed `questionnaire_number` from full_id
  - Calculate display_id from full_id using `calculateDisplayId()`
  - Add fallback: if display_id is null or out of range (1-150), use parsed questionnaire_number from full_id
  - Log warning if fallback is used
  - _Requirements: 5.2, 5.4, 5.5_

- [ ]* 10.1 Write property test for CSIS algorithm input
  - **Property 8: CSIS Algorithm Input**
  - **Validates: Requirements 5.1, 5.2, 5.5**

- [ ]* 10.2 Write unit tests for CSIS integration
  - Test Kish Grid receives display_id=6 and uses correct column
  - Test Section Order receives display_id=6 and returns correct rotation
  - Test fallback behavior when display_id is null
  - Test fallback behavior when display_id is out of range
  - _Requirements: 5.3, 5.4_

- [x] 11. Verify IndexedDB operations use full_id





  - Review `src/lib/indexedDB.ts` to confirm keyPath is `questionnaire_id` (full_id)
  - Verify all IndexedDB put/get/delete operations use full_id as key
  - Ensure no changes are needed (full_id should already be used)
  - Add comments documenting that full_id is the primary key
  - _Requirements: 4.2, 4.4_

- [ ]* 11.1 Write property test for internal operations
  - **Property 4: Internal Operations Use Full ID**
  - **Validates: Requirements 1.5, 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 12. Verify database schema uses full_id




  - Review database schema to confirm `questionnaire_id` is primary key
  - Verify foreign key references use `questionnaire_id` (full_id)
  - Confirm no `display_id` column exists in database
  - Document that display_id is calculated dynamically, not stored
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 13. Verify sync operations use full_id





  - Review `src/app/api/sync/route.ts` to confirm sync matching uses `questionnaire_id` (full_id)
  - Ensure offline-to-online sync uses full_id for record matching
  - Verify no changes are needed (full_id should already be used)
  - _Requirements: 2.5_

- [ ]* 13.1 Write property test for sync operations
  - **Property 7: Sync Operation Identifier**
  - **Validates: Requirements 2.5**

- [x] 14. Add accessibility improvements





  - Update UI components to include `aria-label` attributes
  - Example: `<div aria-label="Interview number 6">Interview #6</div>`
  - Ensure screen readers announce "Interview number 6" instead of complex full_id
  - Test with screen reader to verify improved experience
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 16. End-to-end integration testing
  - Create 3 spots with 5 questionnaires each (display_ids 1-15)
  - Verify FI assignment list shows "Interview #1" through "Interview #15"
  - Click "Interview #6" and verify URL contains full_id "2025-10-02-001"
  - Verify survey form header shows "Interview #6"
  - Verify Kish Grid uses display_id=6 for selection
  - Verify section order uses display_id=6 for randomization
  - Submit survey and verify database record has full_id as primary key
  - Test offline sync and verify records match using full_id
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

