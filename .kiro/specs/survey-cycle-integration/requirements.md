# Requirements Document

## Introduction

The Survey Cycle Integration feature transforms the existing survey system from a cycle-unaware system to a fully cycle-integrated system where all survey operations are properly scoped to the active survey cycle. This ensures data isolation between different survey cycles and provides proper historical tracking capabilities.

## Glossary

- **Survey_System**: The web application that manages survey data collection and analysis
- **Survey_Cycle**: A defined period (typically annual) during which surveys are conducted and data is collected
- **Active_Survey_Cycle**: The currently operational survey cycle that new data should be associated with
- **Survey_Response**: Individual survey submissions from respondents
- **Survey_Target**: Goals or quotas set for survey collection within a cycle
- **Assignment**: Tasks assigned to interviewers for data collection
- **Dashboard**: The main interface displaying survey progress and analytics
- **Barangay**: Administrative division where surveys are conducted

## Requirements

### Requirement 1

**User Story:** As a survey administrator, I want all survey operations to be automatically scoped to the active survey cycle, so that data from different cycles remains properly isolated.

#### Acceptance Criteria

1. WHEN a new survey response is created, THE Survey_System SHALL link the response to the Active_Survey_Cycle
2. WHEN survey targets are established, THE Survey_System SHALL associate targets with the Active_Survey_Cycle
3. WHEN assignments are created, THE Survey_System SHALL link assignments to the Active_Survey_Cycle
4. WHERE multiple survey cycles exist, THE Survey_System SHALL ensure only one cycle can be active at any time
5. WHILE the Active_Survey_Cycle is set, THE Survey_System SHALL filter all dashboard data to show only active cycle information

### Requirement 2

**User Story:** As a survey administrator, I want to manage survey cycles through a dedicated API, so that I can control which cycle is currently active.

#### Acceptance Criteria

1. THE Survey_System SHALL provide an endpoint to retrieve the Active_Survey_Cycle
2. THE Survey_System SHALL provide an endpoint to set a survey cycle as active
3. WHEN a new cycle is set as active, THE Survey_System SHALL deactivate the previously active cycle
4. THE Survey_System SHALL ensure database constraints prevent multiple active cycles
5. THE Survey_System SHALL return cycle identification information including year, name, and unique identifier

### Requirement 3

**User Story:** As a survey administrator, I want the dashboard to reset and show zero progress when starting a new survey cycle, so that I can track progress independently for each cycle.

#### Acceptance Criteria

1. WHEN a new survey cycle becomes active, THE Survey_System SHALL display zero percent completion for all progress indicators
2. WHILE viewing the dashboard, THE Survey_System SHALL show only data from the Active_Survey_Cycle
3. THE Survey_System SHALL calculate progress metrics based solely on Active_Survey_Cycle data
4. THE Survey_System SHALL update survey number formats to include the active cycle year
5. THE Survey_System SHALL filter barangay assignment progress by Active_Survey_Cycle

### Requirement 4

**User Story:** As a survey administrator, I want to access historical survey cycle data, so that I can compare performance across different cycles.

#### Acceptance Criteria

1. THE Survey_System SHALL maintain data from previous survey cycles
2. THE Survey_System SHALL provide access to historical cycle information
3. WHERE historical data exists, THE Survey_System SHALL allow viewing previous cycle dashboards
4. THE Survey_System SHALL enable comparison between different survey cycles
5. THE Survey_System SHALL preserve data integrity when switching between cycles

### Requirement 5

**User Story:** As a survey interviewer, I want my assignments to be automatically scoped to the current survey cycle, so that I only see relevant work for the active period.

#### Acceptance Criteria

1. WHEN assignments are displayed, THE Survey_System SHALL show only assignments from the Active_Survey_Cycle
2. THE Survey_System SHALL link new assignments to the Active_Survey_Cycle
3. WHEN assignment progress is calculated, THE Survey_System SHALL use only Active_Survey_Cycle data
4. THE Survey_System SHALL allow assignment reset when starting a new survey cycle
5. THE Survey_System SHALL update auto-completion logic to be cycle-scoped

### Requirement 6

**User Story:** As a system user, I want clear visual indication of the current active survey cycle, so that I understand which cycle context I am working in.

#### Acceptance Criteria

1. THE Survey_System SHALL display the Active_Survey_Cycle information in the user interface
2. THE Survey_System SHALL provide a cycle selector component for authorized users
3. WHEN the active cycle changes, THE Survey_System SHALL refresh all displayed data automatically
4. THE Survey_System SHALL maintain cycle context across all application pages
5. THE Survey_System SHALL provide visual indicators when viewing historical cycle data