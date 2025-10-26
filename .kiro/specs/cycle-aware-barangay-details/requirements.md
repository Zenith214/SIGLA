# Requirements Document

## Introduction

This feature enhances the Map Dashboard's BarangayDetailsCard to display cycle-specific satisfaction data, allowing users to view historical performance metrics for any barangay across different survey cycles. The existing HistoricalCycleSelector in the MapCard will be leveraged to control which cycle's data is displayed.

## Glossary

- **BarangayDetailsCard**: The component displayed at the bottom of the map dashboard showing details about a selected barangay
- **HistoricalCycleSelector**: The existing dropdown component in MapCard that allows users to select different survey cycles
- **Survey Cycle**: A time period during which survey data is collected (e.g., "Survey Cycle 2025", "Survey Cycle 2026")
- **Satisfaction Data**: Performance metrics including overall satisfaction score and service area scores (Financial, Disaster, Safety, Social, Business, Environmental)
- **Active Cycle**: The currently ongoing survey cycle
- **Historical Cycle**: Any previous (completed) survey cycle

## Requirements

### Requirement 1: Display Cycle-Specific Satisfaction Data

**User Story:** As a barangay official or administrator, I want to view satisfaction scores for a selected barangay from different survey cycles, so that I can track performance trends over time.

#### Acceptance Criteria

1. WHEN a user selects a barangay on the map, THE BarangayDetailsCard SHALL display satisfaction data for the currently selected cycle from the HistoricalCycleSelector
2. WHEN the user changes the cycle using the HistoricalCycleSelector dropdown, THE BarangayDetailsCard SHALL update to show satisfaction data from the newly selected cycle
3. WHEN no specific cycle is selected in the dropdown (showing current/active cycle), THE BarangayDetailsCard SHALL display data from the active survey cycle
4. WHEN a barangay has no data for the selected cycle, THE BarangayDetailsCard SHALL display a message indicating "No data available for this cycle"
5. THE BarangayDetailsCard SHALL display the overall satisfaction score as a percentage with appropriate color coding (green for ≥70%, yellow for 50-69%, red for <50%)

### Requirement 2: Display Service Area Breakdown

**User Story:** As a user viewing historical data, I want to see the breakdown of satisfaction scores by service area for the selected cycle, so that I can identify which services performed well or poorly in that period.

#### Acceptance Criteria

1. THE BarangayDetailsCard SHALL display satisfaction scores for all six service areas (Financial, Disaster, Safety, Social, Business, Environmental) for the selected cycle
2. WHEN displaying service area scores, THE BarangayDetailsCard SHALL use visual indicators (color coding or icons) to show performance levels
3. THE BarangayDetailsCard SHALL display service area scores in a compact, scannable format suitable for the card's limited space
4. WHEN a service area has no data for the selected cycle, THE BarangayDetailsCard SHALL indicate "N/A" or hide that service area

### Requirement 3: Show Cycle Context Information

**User Story:** As a user, I want to clearly see which survey cycle's data I'm viewing in the BarangayDetailsCard, so that I don't confuse historical data with current data.

#### Acceptance Criteria

1. THE BarangayDetailsCard SHALL display the name and year of the currently selected cycle prominently in the card header
2. WHEN viewing historical cycle data, THE BarangayDetailsCard SHALL include a visual indicator (such as a badge or icon) distinguishing it from active cycle data
3. THE BarangayDetailsCard SHALL display the survey status for the selected barangay in the selected cycle (Completed, In Progress, Not Started)
4. WHEN the selected cycle is the active cycle, THE BarangayDetailsCard SHALL indicate this with appropriate styling or labeling

### Requirement 4: Maintain Existing Functionality

**User Story:** As a user, I want the existing barangay information (population, households, area) to remain visible, so that I have context alongside the satisfaction data.

#### Acceptance Criteria

1. THE BarangayDetailsCard SHALL continue to display static barangay information (population, households, area) regardless of selected cycle
2. THE BarangayDetailsCard SHALL maintain its current responsive layout and styling
3. WHEN no barangay is selected, THE BarangayDetailsCard SHALL display the existing placeholder message
4. THE BarangayDetailsCard SHALL maintain smooth transitions when updating data between cycle selections

### Requirement 5: Handle Loading and Error States

**User Story:** As a user, I want clear feedback when data is loading or if there's an error, so that I understand the system's state.

#### Acceptance Criteria

1. WHEN satisfaction data is being fetched for a selected cycle, THE BarangayDetailsCard SHALL display a loading indicator
2. WHEN an error occurs fetching satisfaction data, THE BarangayDetailsCard SHALL display an error message with option to retry
3. THE BarangayDetailsCard SHALL not block the display of static barangay information while satisfaction data is loading
4. WHEN switching between cycles, THE BarangayDetailsCard SHALL provide visual feedback that data is updating
5. THE BarangayDetailsCard SHALL handle network timeouts gracefully with appropriate error messages

### Requirement 6: Performance and Caching

**User Story:** As a user, I want the interface to respond quickly when switching between cycles, so that I can efficiently compare historical data.

#### Acceptance Criteria

1. THE System SHALL cache satisfaction data for previously viewed cycle-barangay combinations to improve response time
2. WHEN a user switches back to a previously viewed cycle for the same barangay, THE System SHALL display cached data immediately
3. THE System SHALL fetch fresh data in the background and update the display if the cached data has changed
4. THE BarangayDetailsCard SHALL respond to cycle changes within 500ms when using cached data
5. THE System SHALL limit cache size to prevent excessive memory usage
