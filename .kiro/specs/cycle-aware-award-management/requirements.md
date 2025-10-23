# Cycle-Aware Award Management - Requirements Document

## Introduction

The Cycle-Aware Award Management system enables administrators to manage SGLGB (Seal of Good Local Governance for Barangays) awards on a per-cycle basis. This system ensures that award status is tied to specific survey cycles, allowing independent award management across different evaluation periods while maintaining historical data integrity. The system focuses on surveying only awardee barangays and provides a simplified visual representation on maps.

## Glossary

- **Award Management System**: The subsystem responsible for tracking and managing SGLGB award status per barangay per cycle
- **Survey Cycle**: A specific time period during which surveys are conducted and awards are evaluated
- **Awardee**: A barangay that has been granted SGLGB award status for a specific cycle
- **Non-Awardee**: A barangay that has not been granted SGLGB award status for a specific cycle
- **Cycle Awards Table**: Database table storing the relationship between barangays, cycles, and award status
- **Survey Target**: A barangay that is included in survey operations for a specific cycle
- **Map Coloring System**: Visual representation showing award status through color coding

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to assign award status to barangays on a per-cycle basis, so that I can manage awards independently for different evaluation periods.

#### Acceptance Criteria

1. WHEN an administrator accesses award management, THE Award Management System SHALL display barangays with cycle-specific award status
2. WHEN an administrator assigns award status to a barangay, THE Award Management System SHALL store the award linked to the current active cycle
3. WHEN an administrator switches between cycles, THE Award Management System SHALL preserve award assignments for each cycle independently
4. WHEN an administrator views award history, THE Award Management System SHALL display award status for all previous cycles
5. WHERE bulk award assignment is selected, THE Award Management System SHALL allow assignment of multiple barangays simultaneously

### Requirement 2

**User Story:** As a system administrator, I want only awardee barangays to be included in survey operations, so that survey efforts focus on evaluating current award recipients.

#### Acceptance Criteria

1. WHEN survey targets are created, THE Survey Target System SHALL include only barangays with awardee status for the active cycle
2. WHEN survey assignments are generated, THE Survey Assignment System SHALL create assignments only for awardee barangays
3. WHEN dashboard data is displayed, THE Dashboard System SHALL filter survey data to show only awardee barangays
4. IF a barangay loses award status, THEN THE Survey Target System SHALL exclude it from new survey operations
5. WHILE a survey cycle is active, THE Survey Target System SHALL maintain consistent awardee filtering

### Requirement 3

**User Story:** As a system user, I want to see a clear visual distinction between awardees and non-awardees on the map, so that I can quickly identify award status across barangays.

#### Acceptance Criteria

1. WHEN the map is displayed, THE Map Display System SHALL show awardee barangays in green color
2. WHEN the map is displayed, THE Map Display System SHALL show non-awardee barangays in gray color
3. WHEN the map legend is shown, THE Map Display System SHALL indicate the two-color system clearly
4. WHILE viewing different cycles, THE Map Display System SHALL update colors based on cycle-specific award status
5. WHERE map data is loaded, THE Map Display System SHALL apply consistent coloring across all map views

### Requirement 4

**User Story:** As a system administrator, I want to access award management through the settings interface, so that I can efficiently manage awards without navigating complex menus.

#### Acceptance Criteria

1. WHEN accessing system settings, THE Settings Interface SHALL provide an "Award Management" section
2. WHEN award management is opened, THE Award Management Interface SHALL display all barangays with current award status
3. WHEN making award changes, THE Award Management Interface SHALL provide immediate visual feedback
4. WHEN bulk operations are performed, THE Award Management Interface SHALL show progress and confirmation
5. WHERE award import/export is needed, THE Award Management Interface SHALL provide file handling capabilities

### Requirement 5

**User Story:** As a system administrator, I want historical award data to be preserved when switching between cycles, so that I can maintain accurate records and make informed decisions.

#### Acceptance Criteria

1. WHEN switching to a different cycle, THE Award Management System SHALL preserve current cycle award data
2. WHEN viewing historical cycles, THE Award Management System SHALL display accurate award status for that period
3. WHEN creating new cycles, THE Award Management System SHALL maintain referential integrity with existing award data
4. IF award data is modified for past cycles, THEN THE Award Management System SHALL track changes with timestamps
5. WHILE managing awards across cycles, THE Award Management System SHALL prevent data corruption or loss

### Requirement 6

**User Story:** As a system administrator, I want to perform bulk award operations, so that I can efficiently manage awards for multiple barangays simultaneously.

#### Acceptance Criteria

1. WHEN selecting multiple barangays, THE Award Management System SHALL provide bulk assignment options
2. WHEN importing award lists, THE Award Management System SHALL validate and process external award data
3. WHEN exporting award data, THE Award Management System SHALL generate downloadable award reports
4. IF bulk operations encounter errors, THEN THE Award Management System SHALL provide detailed error reporting
5. WHERE bulk changes are applied, THE Award Management System SHALL require confirmation before execution

### Requirement 7

**User Story:** As a system user, I want the system to maintain data integrity across cycle transitions, so that award information remains accurate and reliable.

#### Acceptance Criteria

1. WHEN new cycles are created, THE Database System SHALL maintain foreign key relationships with award data
2. WHEN award data is migrated, THE Database System SHALL preserve all existing award relationships
3. WHEN database operations are performed, THE Database System SHALL enforce referential integrity constraints
4. IF data corruption is detected, THEN THE Database System SHALL prevent further operations and alert administrators
5. WHILE performing database migrations, THE Database System SHALL backup existing data before changes