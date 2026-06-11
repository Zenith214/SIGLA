# CSIS Methodology Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered when using the SIGLA Survey System with CSIS (Citizen Satisfaction Index System) methodology. It covers problems related to GPS verification, Kish Grid selection, 6-section navigation, and data submission.

## Table of Contents

1. [GPS Capture Issues](#gps-capture-issues)
2. [Kish Grid Selection Problems](#kish-grid-selection-problems)
3. [Section Navigation Issues](#section-navigation-issues)
4. [Data Submission Errors](#data-submission-errors)
5. [Offline Mode Problems](#offline-mode-problems)
6. [Performance Issues](#performance-issues)
7. [Browser Compatibility](#browser-compatibility)
8. [Common Error Messages](#common-error-messages)

---

## GPS Capture Issues

### Issue: "GPS Permission Denied"

**Symptoms:**
- GPS capture button shows error
- Browser blocks location access
- Cannot proceed with GPS capture

**Causes:**
- Location permissions not granted
- Browser settings block location
- Device location services disabled

**Solutions:**

1. **Enable Browser Permissions:**
   - **Chrome:** Click lock icon in address bar → Site settings → Location → Allow
   - **Firefox:** Click lock icon → Permissions → Location → Allow
   - **Edge:** Click lock icon → Permissions for this site → Location → Allow

2. **Enable Device Location:**
   - **Windows:** Settings → Privacy → Location → On
   - **Android:** Settings → Location → On
   - **iOS:** Settings → Privacy → Location Services → On

3. **Clear and Re-grant Permissions:**
   - Clear browser cache and cookies
   - Reload page
   - Grant permissions when prompted

**Prevention:**
- Always allow location access when prompted
- Check device location settings before fieldwork
- Test GPS functionality before leaving office

---

### Issue: "GPS Timeout" or "Unable to Acquire GPS"

**Symptoms:**
- GPS capture takes too long (> 30 seconds)
- "GPS timeout" error message
- GPS never completes acquisition

**Causes:**
- Poor GPS signal (indoors, urban canyon)
- Device GPS hardware issue
- Atmospheric interference
- Cold start (GPS not used recently)

**Solutions:**

1. **Improve GPS Signal:**
   - Move outdoors or near windows
   - Move away from tall buildings
   - Ensure clear view of sky
   - Wait 30-60 seconds for GPS to acquire

2. **Restart GPS:**
   - Close and reopen browser
   - Toggle device location off and on
   - Restart device if persistent

3. **Use Different Device:**
   - Try tablet instead of phone
   - Use device with better GPS antenna
   - Ensure device GPS is functional

**Prevention:**
- Capture GPS outdoors whenever possible
- Allow extra time for GPS acquisition
- Test GPS before starting interviews
- Bring backup device with GPS

---

### Issue: "Low GPS Accuracy" (> 50 meters)

**Symptoms:**
- GPS accuracy shows high value (> 50m)
- Warning about poor accuracy
- Interview may be flagged for review

**Causes:**
- Poor GPS signal quality
- Indoor GPS capture
- Atmospheric conditions
- Device GPS limitations

**Solutions:**

1. **Wait for Better Accuracy:**
   - Don't capture immediately
   - Wait 30-60 seconds for accuracy to improve
   - GPS accuracy typically improves over time

2. **Improve Signal:**
   - Move to open area
   - Ensure clear sky visibility
   - Move away from interference sources

3. **Document and Proceed:**
   - If accuracy doesn't improve, document reason
   - Capture GPS with available accuracy
   - Add note in survey about GPS conditions
   - Interview will be flagged but can be approved by supervisor

**Acceptable Accuracy Levels:**
- **< 10m:** Excellent
- **10-20m:** Good (typical)
- **20-50m:** Fair (acceptable)
- **> 50m:** Poor (will be flagged)

---

### Issue: GPS Captured at Wrong Location

**Symptoms:**
- GPS shows incorrect address
- Coordinates don't match household location
- Large distance from assigned spot

**Causes:**
- GPS captured before arriving at household
- GPS captured at wrong location
- GPS drift or error

**Solutions:**

1. **Recapture GPS:**
   - Navigate back to household enumeration
   - Click "Recapture GPS" button
   - Ensure you're at the correct household
   - Wait for good accuracy before capturing

2. **Verify Location:**
   - Check GPS coordinates on map
   - Confirm address matches household
   - Ensure you're at assigned spot

**Prevention:**
- Only capture GPS when physically at household
- Verify location before capturing
- Don't capture GPS while traveling
- Check GPS coordinates after capture

---

## Kish Grid Selection Problems

### Issue: "No Qualified Respondent"

**Symptoms:**
- System shows "No qualified respondent available"
- Cannot proceed with survey
- Kish Grid selected member doesn't meet requirements

**Causes:**
- Selected member doesn't match required gender
- All eligible members are wrong gender
- Household enumeration error

**Solutions:**

1. **Verify Household Enumeration:**
   - Check all members are entered correctly
   - Verify birthdates are accurate (must be 18+)
   - Confirm gender entries are correct
   - Ensure no eligible members were missed

2. **If Enumeration is Correct:**
   - This household cannot be surveyed
   - Mark as "No Qualified Respondent"
   - Move to next assigned household
   - Document in field notes

3. **Common Mistakes:**
   - Birthdate entered incorrectly (check age calculation)
   - Gender entered incorrectly
   - Eligible member not included in enumeration

**Prevention:**
- Carefully enumerate all household members
- Double-check birthdates and ages
- Verify gender entries
- Include all eligible members (18+)

---

### Issue: Kish Grid Selects Unavailable Member

**Symptoms:**
- Selected respondent is not home
- Selected respondent refuses to participate
- Selected respondent is unavailable

**Causes:**
- Random selection chose unavailable member
- Timing issue (member at work, school, etc.)

**Solutions:**

1. **Schedule Callback:**
   - Use callback feature in system
   - Schedule return visit when member is available
   - Do NOT substitute with another household member
   - Document callback in notes

2. **Best Times for Callbacks:**
   - Early morning (before work)
   - Evening (after work)
   - Weekends
   - Coordinate with household

3. **If Member Permanently Unavailable:**
   - Document reason (moved away, deceased, etc.)
   - Mark household as "Respondent Unavailable"
   - Move to next assigned household

**Important:** You CANNOT substitute the selected respondent with another household member. The Kish Grid selection must be followed.

---

### Issue: Kish Grid Display Not Showing

**Symptoms:**
- Kish Grid visualization doesn't appear
- Cannot see which member was selected
- Selection seems random

**Causes:**
- UI rendering issue
- JavaScript error
- Browser compatibility

**Solutions:**

1. **Refresh Page:**
   - Save current progress
   - Refresh browser
   - Resume from last saved point

2. **Check Browser Console:**
   - Press F12 to open developer tools
   - Check for JavaScript errors
   - Report errors to technical support

3. **Try Different Browser:**
   - Use Chrome (recommended)
   - Ensure browser is up to date

**Note:** The Kish Grid selection still works even if visualization doesn't display. The correct respondent is selected based on the algorithm.

---

## Section Navigation Issues

### Issue: "Wrong Number of Sections" (Not 6)

**Symptoms:**
- Fewer than 6 sections appear
- More than 6 sections appear
- Section list seems incorrect

**Causes:**
- Data migration issue
- Cache problem
- System error

**Solutions:**

1. **Clear Browser Cache:**
   - Clear cache and cookies
   - Reload page
   - Start new survey

2. **Verify Questionnaire Number:**
   - Check questionnaire number is valid (1-150)
   - Verify number was generated correctly
   - Try generating new questionnaire number

3. **Check System Status:**
   - Verify system is up to date
   - Check for maintenance notifications
   - Contact technical support if persistent

**Expected Behavior:** All surveys should have exactly 6 service sections in randomized order.

---

### Issue: Cannot Navigate to Next Section

**Symptoms:**
- "Next" button is disabled
- Cannot proceed to next section
- Stuck on current section

**Causes:**
- Required questions not answered
- Validation errors
- Data not saved

**Solutions:**

1. **Check for Missing Answers:**
   - Scroll through all questions
   - Look for red indicators or error messages
   - Ensure all required questions are answered

2. **Verify Data is Saved:**
   - Check for save confirmation
   - Wait for auto-save to complete
   - Manually save if option available

3. **Check Validation Errors:**
   - Look for error messages
   - Fix any validation issues
   - Ensure data is in correct format

**Prevention:**
- Answer all questions before proceeding
- Watch for validation messages
- Save frequently

---

### Issue: Section Order Seems Wrong

**Symptoms:**
- Sections appear in unexpected order
- Order doesn't match expectations
- Different from other surveys

**Causes:**
- This is NOT an error - section order is randomized per questionnaire number

**Explanation:**

The CSIS methodology requires randomized section order to prevent response bias. Each questionnaire number (1-150) has a specific section order determined by the CSIS randomization table.

**Examples:**
- Questionnaire #1 might start with "Financial"
- Questionnaire #2 might start with "Disaster"
- Questionnaire #42 might start with "Safety"

**Solution:**
- Follow the order shown by the system
- Do NOT try to change the order
- Complete all 6 sections as presented

**This is correct behavior, not a bug.**

---

## Data Submission Errors

### Issue: "Missing Verification Location" Error

**Symptoms:**
- Cannot submit survey
- Error: "GPS verification location is required"
- Submission fails

**Causes:**
- GPS was not captured at household
- GPS data was lost
- Data corruption

**Solutions:**

1. **Capture GPS:**
   - Navigate back to household enumeration
   - Click "Capture GPS Location"
   - Wait for successful capture
   - Proceed with survey

2. **If GPS Cannot Be Captured:**
   - Document reason (technical issue, no signal, etc.)
   - Contact supervisor for guidance
   - May need to submit without GPS (will be flagged)

3. **Check Data Integrity:**
   - Verify GPS data is saved
   - Check browser console for errors
   - Try refreshing page (data should be saved)

**Prevention:**
- Always capture GPS at household before enumeration
- Verify GPS capture was successful
- Don't skip GPS capture step

---

### Issue: "Missing Sections" Error

**Symptoms:**
- Cannot submit survey
- Error: "All 6 sections are required"
- Submission blocked

**Causes:**
- One or more sections not completed
- Section data not saved
- Navigation error

**Solutions:**

1. **Check Section Completion:**
   - Review section list in sidebar
   - Look for incomplete sections (no checkmark)
   - Navigate to incomplete sections
   - Complete all questions

2. **Verify All 6 Sections:**
   - Financial Administration
   - Disaster Preparedness
   - Social Protection
   - Safety & Peace & Order
   - Business-Friendly Environment
   - Environmental Management

3. **Check Data Saved:**
   - Ensure each section shows as "completed"
   - Verify data is saved (check local storage)
   - Re-answer questions if needed

**Prevention:**
- Complete all sections before submitting
- Check section status indicators
- Don't skip sections

---

### Issue: Submission Fails with "Network Error"

**Symptoms:**
- Submission fails
- "Network error" or "Connection failed"
- Survey not uploaded

**Causes:**
- No internet connection
- Server unavailable
- Network timeout

**Solutions:**

1. **Check Internet Connection:**
   - Verify device is online
   - Test connection (open other website)
   - Switch to different network if available

2. **Retry Submission:**
   - Wait a few minutes
   - Try submitting again
   - System will retry automatically

3. **Use Offline Mode:**
   - Survey is saved locally
   - Will auto-sync when connection restored
   - Check sync status in system

**Prevention:**
- Test internet connection before submitting
- Use offline mode in areas with poor connectivity
- Submit surveys when back in office if needed

---

## Offline Mode Problems

### Issue: Offline Data Not Syncing

**Symptoms:**
- Surveys remain in "pending sync" status
- Data not uploading to server
- Sync indicator shows error

**Causes:**
- No internet connection
- Server unavailable
- Sync conflict
- Browser storage full

**Solutions:**

1. **Check Internet Connection:**
   - Verify device is online
   - Test connection stability
   - Connect to reliable network

2. **Manual Sync:**
   - Click "Sync Now" button
   - Wait for sync to complete
   - Check for error messages

3. **Clear Old Data:**
   - Delete successfully synced surveys
   - Free up browser storage
   - Retry sync

4. **Check for Conflicts:**
   - Review sync errors
   - Resolve any data conflicts
   - Contact support if needed

**Prevention:**
- Sync regularly when online
- Don't accumulate too many offline surveys
- Monitor sync status

---

### Issue: "Storage Quota Exceeded"

**Symptoms:**
- Cannot save survey data
- "Storage quota exceeded" error
- Browser storage full

**Causes:**
- Too many offline surveys stored
- Browser storage limit reached
- Large survey data

**Solutions:**

1. **Sync and Clear:**
   - Connect to internet
   - Sync all pending surveys
   - Delete synced surveys from local storage

2. **Clear Browser Data:**
   - Clear old cached data
   - Keep only current surveys
   - Free up storage space

3. **Reduce Offline Surveys:**
   - Sync more frequently
   - Don't accumulate many offline surveys
   - Submit surveys daily

**Prevention:**
- Sync surveys daily
- Clear synced data regularly
- Monitor storage usage

---

## Performance Issues

### Issue: System is Slow or Laggy

**Symptoms:**
- Pages load slowly
- UI is unresponsive
- Delays when navigating

**Causes:**
- Too much cached data
- Browser performance
- Device limitations
- Network issues

**Solutions:**

1. **Clear Browser Cache:**
   - Clear cache and cookies
   - Restart browser
   - Reload application

2. **Close Other Tabs:**
   - Close unnecessary browser tabs
   - Free up device memory
   - Restart device if needed

3. **Check Network:**
   - Test internet speed
   - Switch to better network
   - Use offline mode if network is slow

4. **Update Browser:**
   - Ensure browser is up to date
   - Use recommended browser (Chrome)
   - Clear browser extensions

**Prevention:**
- Clear cache regularly
- Use modern devices
- Keep browser updated
- Close unused tabs

---

### Issue: GPS Capture is Very Slow

**Symptoms:**
- GPS takes > 60 seconds to acquire
- "Acquiring GPS..." message persists
- Timeout errors

**Causes:**
- Cold start (GPS not used recently)
- Poor GPS signal
- Device GPS performance
- Atmospheric conditions

**Solutions:**

1. **Pre-warm GPS:**
   - Open maps app before starting surveys
   - Let GPS acquire before fieldwork
   - Keep location services active

2. **Improve Signal:**
   - Move to open area
   - Ensure clear sky view
   - Wait patiently (can take 60+ seconds)

3. **Device Settings:**
   - Enable "High Accuracy" mode
   - Disable battery saver for location
   - Restart device

**Prevention:**
- Pre-warm GPS before fieldwork
- Use devices with good GPS
- Plan for GPS acquisition time

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 90+ | ✅ Fully Supported (Recommended) |
| Firefox | 88+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Safari | 14+ | ⚠️ Limited (GPS issues on iOS) |
| Opera | 76+ | ✅ Supported |

### Browser-Specific Issues

#### Chrome
- **Best Performance:** Recommended browser
- **GPS:** Works reliably
- **Offline:** Excellent support
- **Known Issues:** None

#### Firefox
- **Performance:** Good
- **GPS:** Works well
- **Offline:** Good support
- **Known Issues:** Occasional IndexedDB issues

#### Edge
- **Performance:** Good
- **GPS:** Works well
- **Offline:** Good support
- **Known Issues:** None

#### Safari (iOS)
- **Performance:** Fair
- **GPS:** Can be unreliable
- **Offline:** Limited support
- **Known Issues:** GPS permission issues, storage limitations

**Recommendation:** Use Chrome for best experience.

---

## Common Error Messages

### "NO_QUALIFIED_RESPONDENT"

**Meaning:** Kish Grid selected a member who doesn't meet gender requirements.

**Solution:** Verify household enumeration is correct. If correct, mark household as "No Qualified Respondent" and move to next household.

**See:** [Kish Grid Selection Problems](#kish-grid-selection-problems)

---

### "MISSING_VERIFICATION_LOCATION"

**Meaning:** GPS was not captured at the household.

**Solution:** Navigate back to household enumeration and capture GPS location.

**See:** [GPS Capture Issues](#gps-capture-issues)

---

### "INVALID_GPS_COORDINATES"

**Meaning:** GPS coordinates are out of valid range or corrupted.

**Solution:** Recapture GPS location. Ensure device GPS is functioning correctly.

**See:** [GPS Capture Issues](#gps-capture-issues)

---

### "MISSING_SECTIONS"

**Meaning:** Not all 6 service sections are completed.

**Solution:** Complete all sections before submitting. Check section status indicators.

**See:** [Data Submission Errors](#data-submission-errors)

---

### "INVALID_SECTION_ORDER"

**Meaning:** Section order doesn't match CSIS randomization for questionnaire number.

**Solution:** This usually indicates a system error. Contact technical support.

---

### "QUESTIONNAIRE_EXISTS"

**Meaning:** Questionnaire number has already been used.

**Solution:** Generate a new questionnaire number. Do not reuse numbers.

---

### "STORAGE_QUOTA_EXCEEDED"

**Meaning:** Browser storage is full.

**Solution:** Sync pending surveys and clear synced data from local storage.

**See:** [Offline Mode Problems](#offline-mode-problems)

---

## Getting Help

### Self-Service Resources

1. **Documentation:**
   - FI Training Guide
   - Supervisor GPS Verification Guide
   - API Documentation

2. **Video Tutorials:**
   - GPS Capture Tutorial
   - Kish Grid Explanation
   - 6-Section Workflow

3. **FAQ Database:**
   - Common questions and answers
   - Step-by-step guides

### Contact Support

**Technical Support:**
- Email: [support@example.com]
- Phone: [Support phone number]
- Hours: Monday-Friday, 8 AM - 5 PM

**Field Supervisor:**
- Contact your assigned supervisor
- Report issues immediately
- Request training if needed

**Emergency Support:**
- Critical system issues
- Data loss concerns
- Security incidents

### Reporting Bugs

When reporting bugs, include:

1. **Error Message:** Exact text of error
2. **Steps to Reproduce:** What you were doing
3. **Browser/Device:** Browser version, device type
4. **Screenshots:** If applicable
5. **Survey Number:** If related to specific survey
6. **Timestamp:** When issue occurred

**Bug Report Template:**

```
Subject: [Brief description of issue]

Error Message: [Exact error text]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [etc.]

Browser: Chrome 120.0
Device: Samsung Galaxy Tab
Survey Number: BB-2024-0042
Timestamp: 2024-11-15 10:30 AM

Additional Details:
[Any other relevant information]

Screenshots: [Attached]
```

---

## Quick Reference

### Pre-Fieldwork Checklist

- [ ] Device fully charged
- [ ] GPS/location services enabled
- [ ] Browser updated
- [ ] Internet connection tested
- [ ] Offline mode tested
- [ ] GPS functionality tested
- [ ] Training materials reviewed

### During Interview Checklist

- [ ] GPS captured at household
- [ ] GPS accuracy acceptable (< 50m)
- [ ] All household members enumerated
- [ ] Kish Grid selection accepted
- [ ] All 6 sections completed
- [ ] Data reviewed before submission
- [ ] Survey submitted successfully

### Troubleshooting Quick Steps

1. **GPS Issues:** Move outdoors, wait 60 seconds, check permissions
2. **Kish Grid Issues:** Verify enumeration, accept selection, schedule callback if needed
3. **Navigation Issues:** Check all questions answered, verify section completion
4. **Submission Issues:** Check GPS captured, all sections complete, internet connected
5. **Performance Issues:** Clear cache, close tabs, restart browser

---

*Last Updated: [Date]*
*Version: 1.0 - CSIS Methodology Implementation*
