# User Guide Corrections Made

## Date: January 7, 2026

### Corrections Applied:

1. **Create a User** - CORRECTED ✅
   - **Removed**: Phone, Organization, Job Title (these fields don't exist)
   - **Correct fields**: First Name, Last Name, Email, Password, Role, Barangay Designation (for Officers only), Status

2. **Create a Survey Cycle** - CORRECTED ✅
   - **Clarified**: Form is already visible on the page (not a separate modal)
   - **Correct fields**: Cycle Name, Survey Year (dropdown), Start Date, End Date

3. **Add a Barangay** - REMOVED ✅
   - **Reason**: Barangays cannot be added through the UI - they are pre-loaded in the database
   - **Replaced with**: "Edit Barangay Information" instruction

4. **Manage Barangays** - CORRECTED ✅
   - **Changed**: "add, edit" → "edit information"
   - **Added note**: Barangays are pre-loaded and cannot be added

### Verified as Correct:

- ✅ Assign Field Supervisor
- ✅ Set Survey Targets  
- ✅ Review CPAP
- ✅ Create a Spot (Field Supervisor)
- ✅ Assign Interviewer to Spot
- ✅ All Interviewer instructions
- ✅ All Officer instructions
- ✅ All Viewer instructions

### Structure Changes:

- Separated instruction cards from role cards for better print control
- Each instruction is now in its own `.instruction-card` div
- Better page break control for printing

### Next Steps:

- User will add images to the `album` folder
- Images will be named: `{Instruction Title} - {Step Number}.png`
- Only instructions that need visual guidance will have images
