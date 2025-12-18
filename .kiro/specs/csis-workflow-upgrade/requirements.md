# Requirements Document

## Introduction

The SIGLA Survey System requires an upgrade to fully implement the official DILG Citizen Satisfaction Index System (CSIS) Digital Methodology (v4.0). This upgrade replaces custom survey logic with standardized CSIS algorithms for service area randomization and respondent selection, while repurposing existing GPS features for quality control verification. The system must maintain compatibility with existing Field Supervisor roles, Spot-Based Workflows, and Multi-Visit/Callback features.

## Glossary

- **SIGLA System**: The Survey Information and Geographic Location Analytics system being upgraded
- **CSIS**: Citizen Satisfaction Index System - the official DILG methodology framework
- **Kish Grid**: A standardized statistical table (12x10 matrix) used for random respondent selection within households
- **Service Area**: One of six government service categories (financial, disaster, social, safety, business, environmental)
- **Questionnaire Number**: A unique sequential identifier (1-150) assigned to each survey instance
- **FI**: Field Interviewer - the role conducting household surveys
- **Spot**: A pre-assigned geographic location where surveys are conducted
- **IndexedDB**: Browser-based local storage system for offline survey data
- **GPS Verification**: The process of comparing pre-assigned spot locations with actual interview locations

## Requirements

### Requirement 1

**User Story:** As a Field Interviewer, I want the system to automatically determine the correct order of service sections based on my questionnaire number, so that I follow the standardized CSIS randomization methodology.

#### Acceptance Criteria

1. WHEN the Survey System generates a questionnaire number, THE SIGLA System SHALL retrieve the starting service area from a randomization map containing all 150 questionnaire-to-section mappings
2. THE SIGLA System SHALL create an ordered array of all six service sections starting from the retrieved section and wrapping around in canonical order
3. THE SIGLA System SHALL return the complete ordered array containing exactly six service section keys
4. THE SIGLA System SHALL use the canonical section order ["financial", "disaster", "social", "safety", "business", "environmental"] as the base sequence for rotation

### Requirement 2

**User Story:** As a Field Interviewer, I want the system to select the correct household respondent using the official CSIS Kish Grid, so that respondent selection follows standardized statistical methodology.

#### Acceptance Criteria

1. WHEN the FI completes household enumeration, THE SIGLA System SHALL calculate the lookup column as (questionnaire number modulo 10), treating zero results as column 10
2. WHEN the FI completes household enumeration, THE SIGLA System SHALL determine the lookup row as the count of eligible household members, capping at 12 for households exceeding this size
3. THE SIGLA System SHALL retrieve the selection index from a hardcoded 12x10 Kish Grid matrix using the calculated row and column coordinates
4. THE SIGLA System SHALL return the household member at the position indicated by the retrieved selection index
5. IF no eligible household members exist, THEN THE SIGLA System SHALL raise an error indicating no qualified respondent is available

### Requirement 3

**User Story:** As a Field Interviewer, I want the system to determine required respondent gender based on questionnaire number parity, so that I don't need to track questionnaire types manually.

#### Acceptance Criteria

1. THE SIGLA System SHALL calculate required gender dynamically by evaluating questionnaire number parity at the point of respondent selection
2. WHEN the questionnaire number is odd, THE SIGLA System SHALL require a male respondent
3. WHEN the questionnaire number is even, THE SIGLA System SHALL require a female respondent
4. THE SIGLA System SHALL remove the questionnaireType field from all survey data structures
5. THE SIGLA System SHALL remove the type field from questionnaire number generation API responses

### Requirement 4

**User Story:** As a Field Interviewer, I want to navigate through all six service sections in the randomized order, so that I complete the full CSIS survey protocol.

#### Acceptance Criteria

1. WHEN the Question Flow component initializes, THE SIGLA System SHALL receive the complete ordered list of six service section keys
2. THE SIGLA System SHALL display progress tracking that reflects all six service sections
3. WHEN the FI completes a service section, THE SIGLA System SHALL navigate to the next section in the randomized sequence
4. WHEN the FI completes the sixth service section, THE SIGLA System SHALL proceed to survey completion
5. THE SIGLA System SHALL maintain section order consistency throughout the entire survey session

### Requirement 5

**User Story:** As a Field Supervisor, I want to verify that interviews were conducted at assigned locations, so that I can ensure data quality and detect potential fraud.

#### Acceptance Criteria

1. WHEN the FI confirms arrival at the household, THE SIGLA System SHALL capture GPS coordinates including latitude, longitude, timestamp, and accuracy
2. THE SIGLA System SHALL store the captured GPS data as part of the survey response record
3. THE SIGLA System SHALL remove GPS capture from the survey initialization step
4. WHEN a supervisor views a submitted interview, THE SIGLA System SHALL display the pre-assigned spot location as a blue pin on the map
5. WHEN a supervisor views a submitted interview, THE SIGLA System SHALL display the actual GPS capture location as a green pin on the map
6. THE SIGLA System SHALL calculate the distance in meters between the pre-assigned spot and actual GPS location
7. WHEN the distance exceeds a configurable threshold, THE SIGLA System SHALL automatically flag the interview for supervisor review

### Requirement 6

**User Story:** As a system administrator, I want the CSIS randomization map to contain all 150 questionnaire-to-section mappings, so that the system supports the full range of questionnaire numbers.

#### Acceptance Criteria

1. THE SIGLA System SHALL maintain a complete randomization map with entries for questionnaire numbers 1 through 150
2. THE SIGLA System SHALL implement the randomization map as a hardcoded data structure accessible to the section ordering function
3. WHEN queried with any questionnaire number from 1 to 150, THE SIGLA System SHALL return a valid service section key
4. THE SIGLA System SHALL replicate the official CSIS Annex I randomization table exactly

### Requirement 7

**User Story:** As a system administrator, I want the Kish Grid to be implemented as a complete 12x10 matrix, so that respondent selection follows the official CSIS statistical methodology.

#### Acceptance Criteria

1. THE SIGLA System SHALL maintain a complete Kish Grid matrix with 12 rows and 10 columns
2. THE SIGLA System SHALL implement the Kish Grid as a hardcoded two-dimensional array accessible to the respondent selection function
3. WHEN queried with valid row and column coordinates, THE SIGLA System SHALL return an integer selection index between 1 and 12
4. THE SIGLA System SHALL replicate the official CSIS Kish Grid table exactly

### Requirement 8

**User Story:** As a Field Supervisor, I want to configure the GPS verification distance threshold, so that I can adjust sensitivity based on local geographic conditions.

#### Acceptance Criteria

1. THE SIGLA System SHALL provide a configuration setting for the GPS verification distance threshold
2. THE SIGLA System SHALL express the threshold value in meters
3. THE SIGLA System SHALL apply the configured threshold when determining whether to flag interviews for review
4. THE SIGLA System SHALL allow threshold values to be modified without code changes
