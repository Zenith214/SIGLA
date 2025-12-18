# Requirements Document

## Introduction

The Two-ID Questionnaire System introduces a dual-identifier approach for managing survey questionnaires in the PULSE application. This system maintains the hierarchical full_id (e.g., YYYY-BB-SS-QQQ) as the authoritative database identifier while presenting users with a simplified, sequential display_id (1-150) for improved usability. The system ensures methodological integrity by using the display_id for CSIS algorithms (Kish Grid selection and Service Area Order Randomization) while preserving data integrity through the full_id in all backend operations.

## Glossary

- **Full ID**: The hierarchical questionnaire identifier stored in the database, formatted as YYYY-BB-SS-QQQ (Year-Barangay-Spot-Questionnaire), serving as the primary key
- **Display ID**: A simple sequential number (1-150) calculated dynamically and shown to users, derived from spot number and questionnaire position
- **Spot**: A geographic sampling location containing exactly 5 questionnaires
- **Questionnaire**: An individual survey interview assignment within a spot
- **CSIS**: Complex Surveys Implementation System, the methodological framework requiring specific randomization algorithms
- **Kish Grid**: A 2D table lookup algorithm for respondent selection that requires a questionnaire number as input
- **Service Area Order Randomization**: An algorithm that randomizes the order of survey sections based on questionnaire number
- **Field Interviewer (FI)**: The user role that conducts surveys and views questionnaire assignments
- **IndexedDB**: The browser-based local storage system used for offline survey data persistence
- **PWA**: Progressive Web Application, the frontend application architecture

## Requirements

### Requirement 1

**User Story:** As a Field Interviewer, I want to see simple sequential numbers for my interview assignments, so that I can quickly identify and reference specific interviews without dealing with complex hierarchical codes.

#### Acceptance Criteria

1. WHEN a Field Interviewer views their assignment list THEN the system SHALL display each questionnaire with a simple sequential display_id (1-150) instead of the hierarchical full_id
2. WHEN a Field Interviewer opens a survey form THEN the system SHALL show the display_id in the header (e.g., "Interview #6")
3. WHEN displaying questionnaires in any user-facing component THEN the system SHALL use the display_id as the primary visible identifier
4. WHEN a Field Interviewer references an interview verbally or in documentation THEN the display_id SHALL provide an unambiguous, memorable identifier
5. WHILE the display_id is shown to users THEN the system SHALL maintain the full_id internally for all data operations

### Requirement 2

**User Story:** As a backend system, I want to maintain the hierarchical full_id as the primary key, so that data integrity and traceability are preserved across the database.

#### Acceptance Criteria

1. WHEN a questionnaire record is created THEN the system SHALL use the full_id as the primary key in the database
2. WHEN storing survey responses THEN the system SHALL reference questionnaires using the full_id
3. WHEN performing database queries THEN the system SHALL use the full_id for joins and relationships
4. THE system SHALL NOT store the display_id as a database column
5. WHEN data is synchronized between offline and online storage THEN the system SHALL use the full_id as the unique identifier

### Requirement 3

**User Story:** As an API consumer, I want the GET /api/assignments endpoint to return both full_id and display_id, so that the frontend can display user-friendly identifiers while maintaining data integrity.

#### Acceptance Criteria

1. WHEN the GET /api/assignments endpoint is called THEN the system SHALL calculate the display_id dynamically using the formula: display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number
2. WHEN returning questionnaire data THEN the system SHALL include both full_id and display_id in the response payload
3. WHEN parsing the full_id THEN the system SHALL extract spot_number and questionnaire_within_spot_number correctly from the YYYY-BB-SS-QQQ format
4. WHEN calculating display_id for spot 1, questionnaire 1 THEN the system SHALL return display_id = 1
5. WHEN calculating display_id for spot 30, questionnaire 5 THEN the system SHALL return display_id = 150

### Requirement 4

**User Story:** As a frontend application, I want to use full_id for all internal operations, so that data consistency is maintained across API calls, URL routing, and local storage.

#### Acceptance Criteria

1. WHEN constructing API request URLs THEN the system SHALL use the full_id as the identifier parameter
2. WHEN storing questionnaire data in IndexedDB THEN the system SHALL use the full_id as the primary key
3. WHEN generating callback URLs for survey navigation THEN the system SHALL include the full_id in URL parameters
4. WHEN retrieving data from IndexedDB THEN the system SHALL query using the full_id
5. WHILE using full_id internally THEN the system SHALL continue displaying display_id to users in all UI components

### Requirement 5

**User Story:** As a CSIS methodology implementation, I want to use the display_id as the questionnaireNumber input for algorithms, so that the Kish Grid and Service Area Order Randomization produce methodologically correct results.

#### Acceptance Criteria

1. WHEN executing the Kish Grid algorithm THEN the system SHALL use the display_id as the questionnaireNumber parameter for the 2D table lookup
2. WHEN executing the Service Area Order Randomization algorithm THEN the system SHALL use the display_id as the questionnaireNumber parameter
3. WHEN the display_id is 6 THEN the Kish Grid SHALL perform the lookup using row/column indices derived from 6
4. WHEN the display_id is 6 THEN the Service Area Order SHALL be randomized using 6 as the seed input
5. THE system SHALL NOT use the full_id for any CSIS algorithm calculations

### Requirement 6

**User Story:** As a system administrator, I want the display_id calculation to be deterministic and consistent, so that the same questionnaire always shows the same display_id across sessions and devices.

#### Acceptance Criteria

1. WHEN a questionnaire has a specific full_id THEN the calculated display_id SHALL always be identical regardless of when or where it is calculated
2. WHEN the same questionnaire is viewed on different devices THEN the system SHALL display the same display_id
3. WHEN the API is called multiple times for the same questionnaire THEN the system SHALL return the same display_id each time
4. THE display_id calculation SHALL be a pure function depending only on the full_id input
5. WHEN questionnaires are created in any order THEN the display_id SHALL reflect the spot and position, not the creation sequence

### Requirement 7

**User Story:** As a developer, I want a centralized utility function for display_id calculation, so that the logic is consistent across all API endpoints and components.

#### Acceptance Criteria

1. THE system SHALL provide a utility function calculateDisplayId(full_id) that implements the display_id formula
2. WHEN any API endpoint needs to include display_id THEN the system SHALL use the centralized utility function
3. WHEN the utility function receives an invalid full_id format THEN the system SHALL handle the error gracefully and return null or throw a descriptive error
4. THE utility function SHALL parse the full_id format YYYY-BB-SS-QQQ correctly
5. THE utility function SHALL be testable in isolation with unit tests

### Requirement 8

**User Story:** As a quality assurance tester, I want to verify that the two-ID system works correctly end-to-end, so that I can confirm users see display_id while data operations use full_id.

#### Acceptance Criteria

1. WHEN creating 3 spots with 5 questionnaires each THEN the system SHALL generate display_ids from 1 to 15
2. WHEN a user clicks on "Interview #6" THEN the URL SHALL contain the full_id (e.g., 2025-10-02-001)
3. WHEN a survey is submitted THEN the database record SHALL have the full_id as the primary key
4. WHEN viewing the same questionnaire in different UI components THEN the system SHALL consistently show the same display_id
5. WHEN offline data is synchronized THEN the system SHALL match records using full_id while displaying display_id to users
