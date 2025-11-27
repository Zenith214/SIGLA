# How to Fix the Current Survey Data

## Quick Fix for Your Current Survey

Your Social Protection section is showing Financial Administration questions. Here's the easiest way to fix it:

### Option 1: Use the Browser Console Fix (Recommended)

1. **Stay on the survey page** (the one showing the incorrect data)

2. **Open the browser console:**
   - Press `F12` on your keyboard, OR
   - Right-click anywhere on the page and select "Inspect", then click the "Console" tab

3. **First, list all surveys to find the correct IDs:**
   ```javascript
   await window.listSurveys()
   ```
   This will show all surveys in your IndexedDB with their IDs.

4. **Copy and paste this command** into the console:
   ```javascript
   await window.fixCurrentSurvey()
   ```
   This will automatically detect the questionnaire ID from the URL and use cycleId 1 (default).
   
   **Alternative:** If you need to fix a specific survey with a different cycle ID:
   ```javascript
   await window.fixSurveyData('2026-001-1', 1)
   ```
   Replace with your actual values from the listSurveys() output:
   - First parameter: `questionnaireId` (e.g., '2026-001-1')
   - Second parameter: `cycleId` (e.g., 1)

4. **Press Enter** to run the command

5. **Reload the page** (press F5 or Ctrl+R)

6. **Check the Social Protection tab** - it should now show the correct questions

### Option 2: Let the Auto-Migration Fix It

The code now includes an automatic migration that runs when you load the survey. To trigger it:

1. **Close the survey page**
2. **Reopen the survey** using the same URL
3. **Check the browser console** for migration messages
4. **Verify the Social Protection tab** shows correct data

### What the Fix Does

The fix utility:
1. Opens your browser's IndexedDB database
2. Finds your survey record
3. Detects that Social Protection has Financial Admin questions
4. Swaps the data between the two sections
5. Saves the corrected data

### Verification

After the fix, your sections should show:

**Social Protection** should have:
- awarenessHealthServices
- availmentHealthServices
- satisfactionHealthServices
- awarenessWomenChildrenProtection
- availmentWomenChildrenProtection
- awarenessCommunityParticipation
- etc.

**Financial Administration** should have:
- awarenessProjects
- benefitedProjects
- awarenessFinancial
- awarenessSocialPrograms
- awarenessCorruption
- experiencedCorruption
- etc.

### If the Fix Doesn't Work

If the automatic fix doesn't work, you may need to:
1. Clear the survey data and start fresh, OR
2. Manually edit the data in IndexedDB using browser dev tools

### Need Help?

Check the browser console for error messages. The fix utility logs detailed information about what it's doing.
