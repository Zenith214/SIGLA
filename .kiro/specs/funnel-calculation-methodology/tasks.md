# Implementation Plan

## Current State Analysis
The codebase currently has:
- Python `FeatureEngineer` class in `ml/sigla_ml/feature_engineering.py` with `calculate_service_scores()` that calculates awareness, availment, and satisfaction independently using total respondents as denominator
- Executive Summary API in `src/app/api/ai/executive-summary/route.ts` with `calculateServiceScores()` function that uses the same flawed independent calculation approach
- Funnel Analysis API in `src/app/api/ml/funnel-analysis/route.ts` with `calculateScoresFromResponses()` helper that also uses independent calculations
- ML cache system in `src/lib/ml-cache.ts` with cache invalidation utilities already available
- No shared TypeScript utility module for funnel calculations
- No test infrastructure for funnel calculations
- No documentation about funnel methodology

## Implementation Tasks

- [x] 1. Implement Python funnel calculations with validation






  - [x] 1.1 Create core funnel calculation methods in `ml/sigla_ml/feature_engineering.py`

    - Add `_identify_aware_respondents()` method that returns a set of respondent IDs who answered "Yes" to any awareness question
    - Add `_identify_availed_respondents()` method that filters aware respondents and returns IDs of those who answered "Yes" to any availment question
    - Add `_calculate_satisfaction_from_availed()` method that calculates satisfaction only from availed respondents
    - Add `_calculate_funnel_metrics()` method that orchestrates the three-stage funnel calculation and returns structured data with counts, totals, and percentages
    - Add validation logic to ensure availed_ids ⊆ aware_ids ⊆ all_respondent_ids
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 6.4_

  - [x] 1.2 Refactor Python calculate_service_scores method to use cascading funnel

    - Modify `calculate_service_scores()` in `ml/sigla_ml/feature_engineering.py` to call the new `_calculate_funnel_metrics()` method
    - Replace current `_calculate_binary_score()` calls with funnel-based calculations
    - Update return structure to include awareness, availment, and satisfaction as nested objects with count, total, and percentage fields
    - Maintain backward compatibility by keeping the same method signature
    - Handle edge cases: zero awareness (return null for availment/satisfaction), zero availment (return null for satisfaction), missing questions
    - _Requirements: 1.4, 1.5, 2.4, 2.5, 6.1, 6.2, 6.3_
  - [x] 1.3 Write Python unit tests for funnel calculations






    - Create test directory `ml/tests/` if it doesn't exist
    - Create test file `ml/tests/test_funnel_calculations.py`
    - Write test for basic three-stage funnel calculation with known input/output
    - Write test for zero awareness edge case (should return null for availment and satisfaction)
    - Write test for zero availment edge case (should return null for satisfaction)
    - Write test for missing questions edge case
    - Write test validating that availed_ids ⊆ aware_ids ⊆ all_respondent_ids
    - Write test validating that satisfaction excludes non-availed respondents
    - _Requirements: 6.4, 7.1, 7.2, 7.5_

- [x] 2. Implement TypeScript shared utility module with validation



  - [x] 2.1 Create shared utility file `src/lib/funnel-calculations.ts`


    - Define TypeScript interfaces: `FunnelStageMetrics` (with count, total, percentage fields) and `ServiceFunnelMetrics` (with awareness, availment, satisfaction stages)
    - Implement `identifyAwareRespondents()` function that returns a Set of respondent IDs who are aware
    - Implement `identifyAvailedRespondents()` function that filters aware respondents and returns a Set of IDs who availed services
    - Implement `calculateSatisfactionFromAvailed()` function that calculates satisfaction metrics only from availed respondents
    - Implement `calculateServiceFunnelMetrics()` function that orchestrates the three-stage funnel (main entry point)
    - Implement helper functions: `findAwarenessQuestions()`, `findAvailmentQuestions()`, `findSatisfactionQuestions()`, `isYesAnswer()`, `parseRating()`
    - Add validation logic for respondent subset relationships (availed ⊆ aware ⊆ all)
    - Handle edge cases: zero awareness, zero availment, missing questions (return null for subsequent stages)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_
  - [x] 2.2 Write TypeScript unit tests for funnel calculations






    - Create test directory `src/lib/__tests__/` if it doesn't exist
    - Create test file `src/lib/__tests__/funnel-calculations.test.ts`
    - Configure Jest/Vitest for TypeScript testing if not already configured
    - Write test for basic three-stage funnel calculation matching Python test cases
    - Write test for zero awareness edge case
    - Write test for zero availment edge case
    - Write test for missing questions edge case
    - Write test for respondent filtering logic
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  - [x] 2.3 Write integration tests for Python-TypeScript consistency






    - Create integration test file that can run both Python and TypeScript calculations
    - Create shared test data fixtures in JSON format
    - Run identical input data through both Python and TypeScript calculations
    - Validate that awareness, availment, and satisfaction percentages match within rounding tolerance (1 decimal place)
    - Validate that counts and totals match exactly
    - Test with multiple service areas and various data scenarios
    - _Requirements: 3.4, 3.5, 7.3, 7.5_

- [x] 3. Update Executive Summary API to use funnel calculations





  - [x] 3.1 Refactor calculateServiceScores function in Executive Summary API


    - Import the shared `calculateServiceFunnelMetrics()` function from `src/lib/funnel-calculations.ts`
    - Replace the current `calculateServiceScores()` function logic in `src/app/api/ai/executive-summary/route.ts` to use the shared funnel calculation
    - Update the function to process survey responses and call `calculateServiceFunnelMetrics()` for each service area
    - Update the return structure to include the new funnel metrics format (count, total, percentage for each stage)
    - Ensure the executive summary generation logic in `generateAISummary()` consumes the new structured data correctly
    - Update the prompt to Gemini AI to handle the new structured format
    - _Requirements: 3.2, 4.4_

- [x] 4. Update Funnel Analysis API to use funnel calculations




  - [x] 4.1 Refactor calculateScoresFromResponses helper in Funnel Analysis API


    - Import the shared `calculateServiceFunnelMetrics()` function from `src/lib/funnel-calculations.ts`
    - Replace the current `calculateScoresFromResponses()` helper logic in `src/app/api/ml/funnel-analysis/route.ts` to use the shared funnel calculation
    - Remove the duplicate calculation logic (awareness/availment/satisfaction tracking)
    - Update the function to return structured funnel data with count, total, and percentage fields
    - Update the `calculateTrend()` function to work with the new structured format
    - Ensure the API response structure includes the new funnel metrics format
    - _Requirements: 3.3, 4.4_

- [x] 5. Create cache invalidation migration script




  - [x] 5.1 Create script `scripts/invalidate-ml-cache.js`


    - Import `invalidateCachePattern()` from `src/lib/ml-cache.ts`
    - Add logic to clear all existing ML cache entries (call `invalidateCachePattern()` with no parameters)
    - Add logging to track which cache entries are cleared (log count and endpoints)
    - Add safety confirmation prompt before clearing cache (ask user to confirm)
    - Ensure script can be run idempotently (safe to run multiple times)
    - Add error handling and success messages
    - _Requirements: 5.1, 5.4_

- [x] 6. Create analytics regeneration script




  - [x] 6.1 Create script `scripts/regenerate-analytics.js`


    - Query all survey cycles from the database
    - Query all barangays from the database
    - For each cycle-barangay combination, trigger cache recomputation by calling the ML endpoints with `forceRefresh=true`
    - Implement batch processing to handle large datasets efficiently (process in chunks of 10-20 combinations)
    - Add progress logging showing which cycles and barangays are being recalculated
    - Add timestamp logging for each recalculated combination
    - Add error handling to continue processing even if some combinations fail
    - Add summary statistics at the end (total processed, successful, failed)
    - Ensure script completes within 300 seconds for datasets up to 10,000 respondents
    - _Requirements: 5.2, 5.3, 5.5_

- [x] 7. Create methodology documentation




  - [x] 7.1 Create documentation file `docs/funnel-methodology.md`


    - Write introduction explaining the cascading funnel approach
    - Explain the problem with the old independent calculation methodology
    - Describe the three-stage funnel: awareness → availment → satisfaction
    - Include visual diagrams showing the funnel flow (use Mermaid or ASCII diagrams)
    - Provide example calculations comparing old vs new methodology with same sample data
    - Document expected impact: satisfaction scores will increase (smaller denominator), availment scores will change (different denominator)
    - Explain why historical comparisons may show discontinuities at the methodology change point
    - Add section on edge cases and how they're handled (zero awareness, zero availment, missing questions)
    - Include references to the requirements and design documents
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Update API documentation for new response format




  - [x] 8.1 Create or update API documentation file


    - Document the new structured funnel metrics format for both Executive Summary and Funnel Analysis APIs
    - Provide example API responses showing the new data structure with count, total, and percentage fields
    - Document field definitions for each funnel stage (awareness, availment, satisfaction)
    - Include examples of edge cases: null values when stages have no data
    - Document backward compatibility considerations
    - Add migration notes for frontend consumers
    - _Requirements: 8.1, 8.2_

- [x] 9. Execute migration and validation




  - [x] 9.1 Deploy and validate the funnel calculation changes


    - Deploy updated code to production or staging environment
    - Run cache invalidation script (`scripts/invalidate-ml-cache.js`) to clear old calculations
    - Run analytics regeneration script (`scripts/regenerate-analytics.js`) to recalculate all historical cycles
    - Monitor logs to ensure regeneration completes successfully
    - Validate that new metrics are being served correctly by checking sample API responses
    - Compare sample calculations before/after to verify expected changes (satisfaction scores increased, availment scores changed)
    - Check for any anomalies in historical data
    - Verify that frontend components display the new metrics correctly
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
