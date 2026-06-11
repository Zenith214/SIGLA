# GPS Verification Supervisor Guide

## Quick Start Guide for Field Supervisors

### What is GPS Verification?

GPS Verification is a quality control feature that ensures field interviewers conduct surveys at the correct assigned locations. The system compares the actual GPS location captured during the interview with the pre-assigned spot location.

### How It Works

1. **Assigned Location** (Blue Pin): The spot where the interview should be conducted
2. **Actual Location** (Green Pin): The GPS coordinates captured by the field interviewer
3. **Distance Check**: The system calculates the distance between these two points
4. **Automatic Flagging**: If the distance exceeds the threshold (default: 200 meters), the interview is flagged for review

---

## Accessing GPS Verification

1. Log in to the SIGLA system as a Field Supervisor
2. Navigate to **Fieldwork Monitoring** from the main menu
3. Click the **GPS Verification** tab

---

## Understanding the Dashboard

### Summary Cards

At the top of the GPS Verification tab, you'll see four summary cards:

- **Total**: Total number of interviews with GPS data
- **Verified**: Interviews within the acceptable distance (green)
- **Flagged**: Interviews exceeding the distance threshold (red)
- **Pending**: Interviews awaiting GPS verification (yellow)

### Filter Options

Use the filter buttons to focus on specific interview types:

- **All**: Show all interviews
- **Flagged**: Show only interviews that need review
- **Verified**: Show only interviews within acceptable range
- **Pending**: Show only interviews without GPS verification

### Interview List

The table displays:

| Column | Description |
|--------|-------------|
| **Questionnaire** | Survey ID and number |
| **Interviewer** | Name of the field interviewer |
| **Barangay / Spot** | Location details |
| **Distance** | Distance between assigned and actual location |
| **Status** | Verification status badge |
| **Date** | When the interview was conducted |
| **Actions** | "View Details" button |

---

## Reviewing Flagged Interviews

### Step 1: Filter for Flagged Interviews

1. Click the **Flagged** filter button
2. The list will show only interviews that exceeded the distance threshold
3. Look for red distance values (e.g., "350m" in red)

### Step 2: View Interview Details

1. Click **View Details** on any flagged interview
2. A modal window will open with three tabs

### Step 3: Review GPS Verification Tab

1. Click the **GPS Verification** tab in the modal
2. You'll see an interactive map with:
   - **Blue pin**: Where the interview should have been conducted
   - **Green pin**: Where the interview was actually conducted
   - **Dashed line**: Connecting the two locations
   - **Red line**: Indicates the distance exceeds the threshold
   - **Green line**: Indicates the distance is within acceptable range

### Step 4: Check Verification Details

Below the map, you'll see:

- **Distance**: Exact distance in meters or kilometers
- **Threshold**: The current acceptable distance limit
- **Status**: Whether it's within range or flagged
- **Captured**: Date and time when GPS was captured
- **Accuracy**: GPS accuracy in meters (±)

### Step 5: Take Action

Based on your review, you can:

- **Contact the FI**: Ask for explanation if distance is significant
- **Approve**: If the distance is acceptable (e.g., difficult terrain)
- **Reject**: If the interview appears fraudulent
- **Request Re-interview**: If location is clearly wrong

---

## Adjusting the GPS Threshold

### When to Adjust

You may want to adjust the threshold if:

- Your area has difficult terrain (mountains, rivers)
- GPS accuracy is poor in certain barangays
- You're getting too many false flags
- You want stricter quality control

### How to Adjust

1. Go to **Fieldwork Monitoring** dashboard
2. Click the **Settings** tab
3. You'll see the GPS Threshold Settings panel

### Adjustment Options

**Option 1: Direct Input**
- Type the desired threshold in meters (10-5000)
- Example: Enter "300" for 300 meters

**Option 2: Slider**
- Drag the slider to adjust quickly
- Range: 10m to 1000m

**Option 3: Preset Buttons**
- Click a preset button for common values:
  - 50m (very strict)
  - 100m (strict)
  - 200m (default)
  - 300m (moderate)
  - 500m (lenient)

### Saving Changes

1. After adjusting, click **Save Changes**
2. A green success message will appear
3. The new threshold applies to all future verifications
4. Existing flagged interviews remain flagged

---

## Common Scenarios

### Scenario 1: High Number of Flagged Interviews

**Possible Causes**:
- GPS accuracy issues in the area
- Difficult terrain preventing exact spot access
- Threshold set too strict

**Actions**:
1. Review a sample of flagged interviews
2. Check if distances are consistently just over threshold
3. Consider increasing threshold if legitimate
4. Investigate if distances are very large (>500m)

### Scenario 2: No Flagged Interviews

**Possible Causes**:
- Excellent field interviewer performance
- Threshold set too lenient
- GPS not being captured properly

**Actions**:
1. Spot-check some "verified" interviews
2. Ensure GPS is being captured correctly
3. Consider tightening threshold if needed

### Scenario 3: Interview Far from Assigned Spot

**Possible Causes**:
- Wrong spot selected by FI
- Fraudulent interview
- GPS error
- Legitimate reason (e.g., household moved)

**Actions**:
1. View the map to see exact locations
2. Contact the FI for explanation
3. Check if pattern exists for this FI
4. Take appropriate disciplinary action if needed

---

## Best Practices

### Daily Monitoring

- Check GPS Verification tab daily
- Review flagged interviews promptly
- Contact FIs for explanations same day
- Document reasons for approving flagged interviews

### Threshold Management

- Start with default 200m threshold
- Adjust based on local conditions
- Document threshold changes
- Communicate changes to field team

### Quality Control

- Random spot-checks of verified interviews
- Look for patterns in flagged interviews
- Monitor individual FI performance
- Provide feedback and training

### Documentation

- Keep notes on flagged interview reviews
- Document legitimate reasons for distance
- Track FI performance over time
- Report systematic issues to management

---

## Troubleshooting

### Map Not Loading

**Solution**:
- Check internet connection
- Refresh the page
- Try a different browser
- Contact IT support if persists

### No GPS Data Showing

**Possible Causes**:
- FI didn't capture GPS
- GPS capture failed
- Data not synced yet

**Solution**:
- Check if interview is recent (may not be synced)
- Contact FI to verify GPS was captured
- Check FI's device GPS settings

### Distance Seems Wrong

**Possible Causes**:
- GPS accuracy issue
- Wrong assigned spot coordinates
- Map display error

**Solution**:
- Check GPS accuracy value
- Verify assigned spot location
- Compare with other interviews in same spot

---

## Tips for Training Field Interviewers

### Emphasize GPS Capture

- Explain that GPS is captured for quality control
- Show them how their interviews are monitored
- Demonstrate the supervisor view
- Explain consequences of fraudulent interviews

### GPS Best Practices

- Capture GPS outdoors when possible
- Wait for good GPS accuracy (<20m)
- Capture at the actual interview location
- Don't capture GPS from vehicle or office

### Handling Difficult Locations

- If exact spot inaccessible, get as close as possible
- Document reason in interview notes
- Inform supervisor immediately
- Don't fabricate GPS coordinates

---

## Frequently Asked Questions

**Q: What's an acceptable distance from the assigned spot?**
A: The default threshold is 200 meters, but this can be adjusted based on local conditions.

**Q: Should I reject all flagged interviews?**
A: No. Review each case individually. Some legitimate reasons may exist for distance variance.

**Q: Can I change the threshold for past interviews?**
A: No. Threshold changes only apply to future verifications. Past flags remain.

**Q: How accurate is GPS?**
A: GPS accuracy varies (typically 5-50m). Check the accuracy value shown for each interview.

**Q: What if an FI consistently has flagged interviews?**
A: This may indicate training needs or potential fraud. Investigate and take appropriate action.

**Q: Can I export GPS verification data?**
A: Currently, you can view and review in the system. Export functionality may be added in future updates.

---

## Support

For technical issues or questions:
- Contact IT Support: [support email]
- System Administrator: [admin contact]
- Training Resources: [training portal link]

---

## Version History

- **v1.0** (Current): Initial GPS Verification UI implementation
  - Dual-pin map display
  - Automatic flagging
  - Configurable threshold
  - Interview detail modal
  - Filter and search capabilities
