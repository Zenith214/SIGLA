# Scripts Directory

This directory contains utility scripts for managing the SIGLA system.

## Active Scripts (Currently Useful)

### Database Management
- **`comprehensive-database-seeding.js`** - Seeds the database with comprehensive test data
- **`seed-barangays.js`** - Seeds barangay data from external source
- **`seed-static-barangays.js`** - Seeds static barangay data
- **`populate-all-barangays.js`** - Populates all barangays in the system
- **`list-barangays.js`** - Lists all barangays in the database
- **`update-database.js`** - Updates database schema/data
- **`update-real-barangays.js`** - Updates real barangay data
- **`safe-create-year-data-table.js`** - Safely creates year_data table

### User Management
- **`update-admin-email.js`** - Updates admin user email
- **`update-admin-password.js`** - Updates admin user password

### Cache Management
- **`clear-ml-cache.js`** - Clears ML prediction cache
- **`clear-executive-summary-cache.js`** - Clears executive summary cache
- **`clean-ml-cache-duplicates.js`** - Removes duplicate ML cache entries
- **`invalidate-ml-cache.js`** - Invalidates specific ML cache entries

### Analytics & Data
- **`regenerate-analytics.js`** - Regenerates analytics data
- **`create-mock-survey-data.js`** - Creates mock survey data for testing

### Survey Management
- **`reset-questionnaire-counter.js`** - Resets questionnaire number counter

### System Maintenance
- **`comprehensive-system-check.js`** - Runs comprehensive system health check
- **`backup-improvements.js`** - Backup system improvements

## Archived Scripts

Old test, debug, and one-time migration scripts have been moved to `scripts/archived/` folder.

### Categories in Archived:
- **Test Scripts** (`test-*.js`) - Old testing scripts
- **Check Scripts** (`check-*.js`) - Database/system check scripts
- **Debug Scripts** (`debug-*.js`) - Debugging utilities
- **Verify Scripts** (`verify-*.js`) - Verification scripts
- **Fix Scripts** (`fix-*.js`) - One-time fix scripts
- **Migration Scripts** (`migrate-*.js`, `apply-*.js`) - Already applied migrations
- **Deployment Scripts** (`deploy-*.js`, `rollback-*.js`) - Old deployment scripts

## Usage

### Running a Script

```bash
# Using Node.js
node scripts/script-name.js

# Using npm (if defined in package.json)
npm run script-name
```

### Common Tasks

#### Seed Database
```bash
node scripts/comprehensive-database-seeding.js
```

#### Clear ML Cache
```bash
node scripts/clear-ml-cache.js
```

#### Reset Questionnaire Counter
```bash
npm run questionnaire:reset
```

#### Update Admin Password
```bash
node scripts/update-admin-password.js
```

## Package.json Scripts

Some scripts are also available via npm commands:

```json
{
  "scripts": {
    "seed-barangays": "node scripts/seed-barangays.js",
    "seed-static": "node scripts/seed-static-barangays.js",
    "db:update": "node scripts/update-database.js",
    "create-year-data": "node scripts/safe-create-year-data-table.js",
    "questionnaire:reset": "node scripts/reset-questionnaire-counter.js"
  }
}
```

## Maintenance

### When to Archive a Script

Move a script to `archived/` if:
- It was a one-time migration (already applied)
- It's a test script no longer used
- It's a debug script for a fixed issue
- It's outdated or superseded by newer scripts

### When to Keep a Script

Keep a script active if:
- It's used regularly for maintenance
- It's part of the deployment process
- It's needed for troubleshooting
- It manages ongoing system operations

## Notes

- Always backup your database before running scripts that modify data
- Test scripts in development environment first
- Check script documentation/comments before running
- Some scripts require environment variables to be set

## Need Help?

If you're unsure about a script:
1. Check the script's comments/documentation
2. Review the git history to see when/why it was created
3. Ask the development team
4. Test in development environment first
