# Requirements Document

## Introduction

This specification addresses a fundamental flaw in the current analytics calculation system. The system currently treats awareness, availment, and satisfaction as independent metrics using total respondents as the denominator for all calculations. This produces incorrect results that don't reflect the true funnel progression of service delivery. The system must be overhauled to implement cascading funnel calculations where each stage filters the population and uses the previous stage's output as its denominator.

## Glossary

- **Analytics System**: The combined Python ML scripts and TypeScript API endpoints that calculate service delivery metrics
- **Funnel Stage**: A sequential step in the service delivery journey (awareness → availment → satisfaction)
- **Cascading Denominator**: Using the output count from one funnel stage as the denominator for the next stage
- **Respondent Pool**: The set of survey respondents being analyzed at each funnel stage
- **Service Area**: A category of government services (e.g., financial services, disaster response, safety)
- **ML Cache**: Stored pre-calculated analytics results to improve performance
- **Executive Summary API**: TypeScript endpoint that generates AI-powered summaries of service metrics
- **Funnel Analysis API**: TypeScript endpoint that calculates funnel progression metrics
- **Feature Engineering Module**: Python module that processes survey data and calculates metrics

## Requirements

### Requirement 1

**User Story:** As a data analyst, I want the system to calculate availment percentages based on aware respondents only, so that the metrics accurately reflect service uptake among those who know about the service.

#### Acceptance Criteria

1. WHEN calculating availment scores, THE Analytics System SHALL use the count of aware respondents as the denominator
2. THE Analytics System SHALL track which specific respondents indicated awareness in Stage 1
3. THE Analytics System SHALL filter availment calculations to only include respondents who indicated awareness
4. THE Analytics System SHALL return both the availment count and the aware respondent count used as denominator
5. WHERE a service area has zero aware respondents, THE Analytics System SHALL return null for availment percentage

### Requirement 2

**User Story:** As a data analyst, I want satisfaction scores calculated only from respondents who availed services, so that satisfaction metrics reflect actual service users' experiences.

#### Acceptance Criteria

1. WHEN calculating satisfaction scores, THE Analytics System SHALL use the count of respondents who availed services as the denominator
2. THE Analytics System SHALL track which specific respondents indicated service availment in Stage 2
3. THE Analytics System SHALL filter satisfaction calculations to only include respondents who indicated availment
4. THE Analytics System SHALL exclude satisfaction responses from respondents who did not avail services
5. WHERE a service area has zero respondents who availed services, THE Analytics System SHALL return null for satisfaction percentage

### Requirement 3

**User Story:** As a system administrator, I want all three calculation systems (Python ML, Executive Summary API, Funnel Analysis API) to use identical funnel logic, so that metrics are consistent across all system outputs.

#### Acceptance Criteria

1. THE Feature Engineering Module SHALL implement cascading funnel calculations with identical logic to the TypeScript APIs
2. THE Executive Summary API SHALL implement cascading funnel calculations with identical logic to the Python module
3. THE Funnel Analysis API SHALL implement cascading funnel calculations with identical logic to the Python module
4. WHEN given identical input data, THE Analytics System SHALL produce identical metric outputs across all three calculation systems
5. THE Analytics System SHALL validate calculation consistency through automated tests comparing outputs from all three systems

### Requirement 4

**User Story:** As a developer, I want the system to return structured funnel data including counts and denominators for each stage, so that I can display detailed funnel visualizations and debug calculation issues.

#### Acceptance Criteria

1. THE Analytics System SHALL return awareness count, total respondent count, and awareness percentage
2. THE Analytics System SHALL return availment count, aware respondent count as denominator, and availment percentage
3. THE Analytics System SHALL return satisfaction count, availed respondent count as denominator, and satisfaction percentage
4. THE Analytics System SHALL structure funnel data with explicit count, total, and percentage fields for each stage
5. THE Analytics System SHALL maintain backward compatibility by supporting both old percentage-only format and new structured format during transition

### Requirement 5

**User Story:** As a system administrator, I want all existing cached analytics data invalidated and regenerated, so that the system displays only correctly calculated metrics after the methodology change.

#### Acceptance Criteria

1. WHEN the new funnel calculation logic is deployed, THE Analytics System SHALL clear all existing ML cache entries
2. THE Analytics System SHALL provide a migration script that regenerates analytics for all historical survey cycles
3. THE Analytics System SHALL log which survey cycles have been recalculated with the new methodology
4. THE Analytics System SHALL prevent serving cached data calculated with the old methodology
5. THE Analytics System SHALL complete cache regeneration within 300 seconds for datasets containing up to 10000 respondents

### Requirement 6

**User Story:** As a data analyst, I want the system to handle edge cases where funnel stages have incomplete data, so that partial survey data still produces meaningful metrics.

#### Acceptance Criteria

1. WHERE a service area has no awareness questions, THE Analytics System SHALL return null for all funnel stages
2. WHERE a service area has awareness but no availment questions, THE Analytics System SHALL return awareness metrics and null for availment and satisfaction
3. WHERE respondents skip funnel stage questions, THE Analytics System SHALL exclude those respondents from subsequent stage calculations
4. THE Analytics System SHALL document which respondents were excluded at each funnel stage and the reason for exclusion
5. THE Analytics System SHALL calculate funnel metrics when at least one respondent completes all stages for a service area

### Requirement 7

**User Story:** As a quality assurance tester, I want comprehensive unit tests validating funnel calculations, so that I can verify the system produces correct results for various data scenarios.

#### Acceptance Criteria

1. THE Analytics System SHALL include unit tests validating three-stage funnel calculations with sample data
2. THE Analytics System SHALL include unit tests validating edge cases including zero awareness, zero availment, and missing data
3. THE Analytics System SHALL include integration tests comparing Python and TypeScript calculation outputs
4. THE Analytics System SHALL include tests validating that satisfaction calculations exclude non-availed respondents
5. WHEN unit tests execute, THE Analytics System SHALL achieve at least 90 percent code coverage for all funnel calculation functions

### Requirement 8

**User Story:** As a product manager, I want documentation explaining the funnel methodology change, so that stakeholders understand why historical metrics will differ from newly calculated metrics.

#### Acceptance Criteria

1. THE Analytics System SHALL provide documentation explaining the difference between old independent calculations and new funnel calculations
2. THE Analytics System SHALL provide example calculations showing how the same data produces different results under each methodology
3. THE Analytics System SHALL document the expected impact on satisfaction scores (increase due to smaller denominator)
4. THE Analytics System SHALL document the expected impact on availment scores (change due to using aware count as denominator)
5. THE Analytics System SHALL provide migration notes explaining that historical comparisons may show discontinuities at the methodology change point
