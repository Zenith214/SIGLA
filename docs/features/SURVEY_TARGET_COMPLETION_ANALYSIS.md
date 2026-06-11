# Survey Target Completion Analysis Process

## Overview

This document explains how the SIGLA-2 system automatically triggers the ML analysis process when survey targets are fully met. The system includes several components that work together to ensure accurate and timely analysis of survey data.

## Components

### 1. Survey Target Tracking

The system tracks survey targets for each barangay in the `survey_target` table, which includes:

- `target`: The total number of survey responses needed
- `achieved`: The current number of completed responses
- `percentage`: The completion percentage (achieved/target × 100)
- `analyzed`: Boolean flag indicating whether ML analysis has been performed
- `analysis_date`: Timestamp of when the analysis was performed

### 2. Survey Response Submission

When a new survey response is submitted via the `/api/survey-responses` endpoint, the system:

1. Saves the survey response with status "completed" and progress 100%
2. Updates the corresponding barangay's survey target by incrementing the `achieved` count
3. Recalculates the `percentage` field based on the new achievement count

### 3. Automated Analysis Trigger

The system includes an automated process that checks for completed survey targets and triggers the ML analysis:

- **API Endpoint**: `/api/ml/analyze-target-completion`
- **Scheduled Task**: `check-survey-targets.js` runs every 15 minutes via Windows Task Scheduler

This process:
1. Identifies survey targets that have reached 100% completion but haven't been analyzed yet
2. For each completed target, triggers the ML analysis process
3. Updates the `analyzed` flag and `analysis_date` timestamp

### 4. ML Analysis Process

The ML analysis is performed by the `analyze_barangay.py` script, which:

1. Uses the `SiglaMLAPI` class to analyze the barangay's survey data
2. Extracts and processes survey responses
3. Calculates service scores and action grid classifications
4. Generates insights and recommendations
5. Saves the analysis results to the database

## Data Flow

```
Survey Response Submission
        ↓
Update Survey Target Progress
        ↓
Scheduled Check (Every 15 minutes)
        ↓
Identify Completed Targets
        ↓
Trigger ML Analysis
        ↓
Generate Insights & Recommendations
        ↓
Save Results to Database
        ↓
Mark Target as Analyzed
```

## Implementation Details

### Database Changes

The `survey_target` table has been extended with:

```sql
ALTER TABLE survey_target
ADD COLUMN analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN analysis_date TIMESTAMP;
```

### API Endpoint

The `/api/ml/analyze-target-completion` endpoint:

- Queries for targets with `percentage >= 100 AND analyzed = false`
- Executes the Python analysis script for each target
- Updates the database to mark targets as analyzed

### Scheduled Task

The Windows scheduled task:

- Runs every 15 minutes
- Calls the API endpoint to check for completed targets
- Logs the results of the analysis process

## Verification

To verify that the analysis process is working correctly:

1. Submit survey responses until a barangay's target is met (100%)
2. Wait for the next scheduled check (or run the script manually)
3. Check the logs for successful analysis messages
4. Verify that the `analyzed` flag is set to `true` in the database
5. Confirm that insights and recommendations have been generated

## Troubleshooting

If the analysis process is not working as expected:

1. Check the `analysis.log` file in the `ml` directory for error messages
2. Verify that the scheduled task is running correctly
3. Ensure that the Python environment is properly set up
4. Check that the database connection is working
5. Verify that the survey data is complete and valid

## Manual Trigger

To manually trigger the analysis process:

```bash
node scripts/check-survey-targets.js
```

Or for a specific barangay:

```bash
python ml/analyze_barangay.py --barangay_id <barangay_id>
```