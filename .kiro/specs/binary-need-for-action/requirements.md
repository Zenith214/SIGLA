# Requirements Document

## Introduction

This document specifies the requirements for implementing a two-part "Need for Action" component across all service indicators in the PULSE survey system. The feature introduces a binary question that controls the validation of an existing open-ended suggestion field, with corresponding updates to data storage, analytics calculations, and mock data generation.

## Glossary

- **PULSE System**: Public Understanding and Local Service Evaluation system - the survey and analytics platform
- **Service Indicator**: A specific service being evaluated (e.g., tanod_services, health_services)
- **Need for Action (NFA)**: A metric indicating whether a service requires improvement from the barangay
- **Binary Question**: A yes/no question that determines if improvement is needed
- **Suggestion Field**: An open-ended text field for specific comments or suggestions
- **NFA Rate**: The percentage of respondents who indicated a service needs improvement
- **Survey Section**: A JSONB data structure storing responses for a service indicator
- **Mock Data Generator**: A synthetic data generation tool for testing and development

## Requirements

### Requirement 1

**User Story:** As a survey respondent, I want to first indicate whether a service needs improvement before providing suggestions, so that I can skip detailed feedback when I believe no action is needed.

#### Acceptance Criteria

1. WHEN a respondent reaches the "Need for Action" section for any service indicator, THEN the system SHALL display a binary question asking "Based on your experience, do you believe this service needs improvement from the barangay?"
2. WHEN the binary question is displayed, THEN the system SHALL provide exactly two options: "Yes" and "No"
3. WHEN a respondent attempts to proceed without answering the binary question, THEN the system SHALL prevent progression and display a validation error
4. WHEN a respondent selects "Yes" to the binary question, THEN the system SHALL make the suggestion text field required
5. WHEN a respondent selects "No" to the binary question, THEN the system SHALL make the suggestion text field optional

### Requirement 2

**User Story:** As a survey administrator, I want the binary question to be consistently implemented across all service indicators, so that data collection is standardized throughout the system.

#### Acceptance Criteria

1. WHEN the binary question is implemented, THEN the system SHALL apply it to all six service areas
2. WHEN generating the question ID, THEN the system SHALL follow the naming convention [service_id]_nfa_binary
3. WHEN storing the binary response, THEN the system SHALL use the field name "need_for_action_binary"
4. WHEN storing the suggestion text, THEN the system SHALL use the field name "need_for_action_suggestion"
5. WHERE a service indicator exists, the system SHALL ensure both binary and text fields are present in the data structure

### Requirement 3

**User Story:** As a data analyst, I want survey responses to store both the binary decision and the suggestion text, so that I can analyze both quantitative and qualitative feedback.

#### Acceptance Criteria

1. WHEN a survey response is submitted, THEN the system SHALL store the binary answer in the "need_for_action_binary" field
2. WHEN a survey response is submitted, THEN the system SHALL store the suggestion text in the "need_for_action_suggestion" field
3. WHEN storing data in the survey_section table, THEN the system SHALL maintain both fields within the service indicator's JSONB structure
4. WHEN a respondent selects "Yes" and provides a suggestion, THEN the system SHALL store both values as non-null
5. WHEN a respondent selects "No" and leaves the suggestion blank, THEN the system SHALL store "No" for binary and null or empty string for suggestion

### Requirement 4

**User Story:** As a data analyst, I want the "Need for Action Rate" to be calculated from the binary responses, so that I can accurately measure the percentage of respondents who believe improvement is needed.

#### Acceptance Criteria

1. WHEN calculating the NFA Rate for a service indicator, THEN the system SHALL count responses where need_for_action_binary equals "Yes"
2. WHEN calculating the NFA Rate denominator, THEN the system SHALL count all responses for that service indicator
3. WHEN computing the final percentage, THEN the system SHALL divide the "Yes" count by the total count and multiply by 100
4. WHEN no responses exist for a service indicator, THEN the system SHALL return 0 or null for the NFA Rate
5. WHEN the analytics API is called, THEN the system SHALL use only the need_for_action_binary field for NFA Rate calculations

### Requirement 5

**User Story:** As a developer, I want the mock data generator to produce realistic test data that reflects the conditional logic, so that I can test the system with representative data.

#### Acceptance Criteria

1. WHEN generating mock data for a service indicator, THEN the system SHALL first randomly determine the need_for_action_binary value
2. WHEN the generated binary value is "Yes", THEN the system SHALL create a non-empty string for need_for_action_suggestion
3. WHEN the generated binary value is "No", THEN the system SHALL populate need_for_action_suggestion only 10-15% of the time
4. WHEN populating suggestions for "No" responses, THEN the system SHALL generate neutral or positive comments
5. WHEN generating a complete mock survey response, THEN the system SHALL ensure all service indicators follow the conditional logic pattern

### Requirement 6

**User Story:** As a quality assurance tester, I want the conditional validation to work correctly in all scenarios, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN a respondent changes their binary answer from "Yes" to "No", THEN the system SHALL remove the required validation from the suggestion field
2. WHEN a respondent changes their binary answer from "No" to "Yes", THEN the system SHALL apply required validation to the suggestion field
3. WHEN a respondent has entered text in the suggestion field and changes the binary answer to "No", THEN the system SHALL preserve the entered text but not require it
4. WHEN form validation runs, THEN the system SHALL check the current state of the binary answer before validating the suggestion field
5. IF the binary answer is "Yes" and the suggestion field is empty, THEN the system SHALL display an appropriate error message
