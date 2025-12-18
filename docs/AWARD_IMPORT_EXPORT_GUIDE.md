# Award Management Import/Export Guide

## Overview
The Award Management system now supports importing and exporting award data for barangays, making it easy to backup, share, and bulk update award information.

## Export Awards

### How to Export
1. Navigate to **Settings** → **Award Management**
2. Click the **Export Awards** button
3. A CSV file will be downloaded with the current award data

### Export Format
The exported CSV file contains the following columns:
- **Barangay ID**: Unique identifier for the barangay
- **Barangay Name**: Name of the barangay
- **Households**: Number of households
- **Population**: Population count
- **Award Status**: "Awardee" or "Non-Awardee"
- **Awarded Date**: Date when award was granted (if applicable)
- **Notes**: Additional notes about the award

### File Naming
Exported files are automatically named: `awards_{cycle_name}_{date}.csv`

Example: `awards_2024_Survey_Cycle_2024-12-19.csv`

## Import Awards

### Supported Formats
- **CSV** (.csv)
- **JSON** (.json)

### CSV Import Format
Your CSV file must include these required columns:
- **Barangay ID**: The numeric ID of the barangay
- **Award Status**: Either "Awardee", "Non-Awardee", "true", "false", "1", or "0"

Optional columns:
- **Notes**: Additional information about the award

#### CSV Example
```csv
Barangay ID,Barangay Name,Award Status,Notes
1,Barangay A,Awardee,Excellent performance
2,Barangay B,Non-Awardee,
3,Barangay C,Awardee,Outstanding community service
```

### JSON Import Format
Your JSON file should be an array of award objects:

```json
[
  {
    "barangayId": 1,
    "isAwardee": true,
    "notes": "Excellent performance"
  },
  {
    "barangayId": 2,
    "isAwardee": false
  },
  {
    "barangayId": 3,
    "isAwardee": true,
    "notes": "Outstanding community service"
  }
]
```

### How to Import
1. Navigate to **Settings** → **Award Management**
2. Click the **Import Awards** button
3. Select your CSV or JSON file
4. The system will validate and import the data
5. A success message will show the number of records imported
6. The award list will automatically refresh

### Import Behavior
- **Updates existing awards**: If a barangay already has an award status for the current cycle, it will be updated
- **Creates new awards**: If a barangay doesn't have an award status, one will be created
- **Cycle-specific**: Imports only affect the currently active survey cycle
- **Validation**: The system validates barangay IDs and award status values before importing

## Bulk Operations

In addition to import/export, you can also:

### Select Multiple Barangays
- Use the checkbox in the table header to select all barangays
- Or click individual checkboxes to select specific barangays

### Bulk Grant Awards
1. Select one or more barangays
2. Click **Grant Award to Selected**
3. Confirm the action
4. All selected barangays will be marked as awardees

### Bulk Remove Awards
1. Select one or more barangays
2. Click **Remove Award from Selected**
3. Confirm the action
4. All selected barangays will be marked as non-awardees

## Best Practices

### Before Importing
1. **Export current data** as a backup before importing
2. **Verify barangay IDs** match your system
3. **Check file format** matches the required structure
4. **Test with small dataset** first

### Data Management
- Export regularly to maintain backups
- Use consistent naming conventions for exported files
- Store exports in a secure location
- Document any manual changes made via import

### Error Handling
If an import fails:
1. Check the error message for specific issues
2. Verify your file format matches the requirements
3. Ensure barangay IDs are valid
4. Check that award status values are correct
5. Try exporting current data to see the correct format

## Troubleshooting

### Import Errors

**"CSV must contain 'Barangay ID' and 'Award Status' columns"**
- Ensure your CSV has the required column headers
- Column names are case-insensitive but must include these keywords

**"No valid award data found in the file"**
- Check that your file has data rows (not just headers)
- Verify barangay IDs are numeric
- Ensure award status values are valid

**"Unsupported file format"**
- Only .csv and .json files are supported
- Check your file extension

**"Failed to import awards"**
- Check your network connection
- Verify you have admin permissions
- Ensure the active cycle is properly configured

### Export Issues

**Export button is disabled**
- Ensure there is an active survey cycle
- Check that barangay data has loaded
- Verify you have the necessary permissions

## Security Notes

- Only admin users can import/export award data
- All imports are logged for audit purposes
- Imports only affect the currently active cycle
- Previous cycle data is preserved and unaffected
