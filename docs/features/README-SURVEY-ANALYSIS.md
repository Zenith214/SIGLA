# SIGLA-2 Survey Target Completion Analysis

## Overview

This system automatically triggers ML analysis when survey targets are fully met (100% completion). The analysis process generates insights and recommendations based on the survey data collected for each barangay.

## Components

1. **Database Extensions**: Added tracking fields to the `survey_target` table
2. **API Endpoint**: Created `/api/ml/analyze-target-completion` to check and process completed targets
3. **Python Script**: Added `analyze_barangay.py` to perform ML analysis for a specific barangay
4. **Scheduled Task**: Created a Windows scheduled task to periodically check for completed targets
5. **Test Script**: Added a test script to verify the analysis process

## Setup Instructions

### 1. Apply Database Migrations

Run the SQL migration script to add the necessary tracking fields to the `survey_target` table:

```bash
psql -U your_username -d your_database -f ml/migrations/add_analysis_tracking_fields.sql
```

Or execute the SQL statements directly in your database management tool.

### 2. Set Up the Scheduled Task

Run the PowerShell script as an administrator to create a scheduled task that checks for completed survey targets every 15 minutes:

```powershell
PowerShell -ExecutionPolicy Bypass -File scripts/setup-scheduled-task.ps1
```

### 3. Configure Environment Variables

Ensure your `.env.local` file contains the following variables:

```
NEXT_PUBLIC_SUPABASE_POSTGRES_URL=postgresql://username:password@localhost:5432/database
NEXT_PUBLIC_APP_URL=http://localhost:3000
PYTHON_PATH=/path/to/python
```

## Testing the System

### Manual Testing

You can manually test the system by running the test script:

```bash
node scripts/test-survey-target-analysis.js
```

This script will:
1. Select a test barangay
2. Update its survey target to 100% completion
3. Trigger the analysis process
4. Verify that the analysis was performed correctly

### Troubleshooting

If the test fails with a database connection error:

1. Verify that your PostgreSQL server is running
2. Check that the connection string in `.env.local` is correct
3. Ensure that the database user has the necessary permissions

If the analysis process fails:

1. Check the logs in `ml/analysis.log`
2. Verify that the Python environment is set up correctly
3. Ensure that the ML models are properly trained

## Manual Trigger

You can manually trigger the analysis process for all completed targets:

```bash
node scripts/check-survey-targets.js
```

Or for a specific barangay:

```bash
python ml/analyze_barangay.py --barangay_id <barangay_id>
```

## System Flow

1. Survey responses are submitted via the `/api/survey-responses` endpoint
2. The survey target progress is updated in the database
3. The scheduled task runs every 15 minutes to check for completed targets
4. When a target reaches 100% completion, the ML analysis is triggered
5. The analysis results are saved to the database and the target is marked as analyzed

## Documentation

For more detailed information about the survey target completion analysis process, see:

- [Survey Target Completion Analysis Process](docs/SURVEY_TARGET_COMPLETION_ANALYSIS.md)
- [ML Module README](ml/README.md)

## Files Added

- `src/app/api/ml/analyze-target-completion/route.ts`: API endpoint to check and process completed targets
- `ml/analyze_barangay.py`: Python script to analyze survey data for a specific barangay
- `ml/migrations/add_analysis_tracking_fields.sql`: SQL migration to add tracking fields to the survey_target table
- `scripts/check-survey-targets.js`: Script to periodically check for completed targets
- `scripts/setup-scheduled-task.ps1`: PowerShell script to set up the Windows scheduled task
- `scripts/test-survey-target-analysis.js`: Test script to verify the analysis process
- `docs/SURVEY_TARGET_COMPLETION_ANALYSIS.md`: Detailed documentation of the process