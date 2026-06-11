# Supervisor GPS Verification Guide

## Overview

This guide explains how to use the GPS verification dashboard to monitor field interviewer performance, ensure data quality, and detect potential fraud. The GPS verification system compares pre-assigned spot locations with actual interview locations captured by field interviewers.

## Table of Contents

1. [Understanding GPS Verification](#understanding-gps-verification)
2. [Accessing the GPS Verification Dashboard](#accessing-the-gps-verification-dashboard)
3. [Reading the GPS Verification Display](#reading-the-gps-verification-display)
4. [Flagging Criteria and Thresholds](#flagging-criteria-and-thresholds)
5. [Reviewing Flagged Interviews](#reviewing-flagged-interviews)
6. [Taking Action on Flagged Interviews](#taking-action-on-flagged-interviews)
7. [Configuring GPS Thresholds](#configuring-gps-thresholds)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Understanding GPS Verification

### What is GPS Verification?

GPS verification is a quality control mechanism that compares two GPS locations:

1. **Assigned Spot Location** (Blue Pin 📍): The pre-assigned location where the FI should conduct the interview
2. **Actual Interview Location** (Green Pin 📍): The GPS coordinates captured by the FI at the household

### Why GPS Verification Matters

GPS verification helps you:

- ✅ **Ensure Data Quality**: Confirm interviews are conducted at assigned locations
- ✅ **Detect Fraud**: Identify interviews conducted from incorrect locations
- ✅ **Monitor FI Performance**: Track FI compliance with protocols
- ✅ **Identify Training Needs**: Spot FIs who need additional guidance
- ✅ **Validate Survey Data**: Increase confidence in collected data

### How GPS Verification Works

```
1. FI arrives at assigned household
   ↓
2. FI captures GPS coordinates (before enumeration)
   ↓
3. GPS data is saved with survey response
   ↓
4. System calculates distance between assigned spot and actual location
   ↓
5. If distance > threshold → Interview is flagged for review
   ↓
6. Supervisor reviews flagged interviews in dashboard
```

---

## Accessing the GPS Verification Dashboard

### Navigation

1. Log in to the SIGLA system as a Supervisor
2. Navigate to **Supervisor Dashboard**
3. Select **Interview Management** tab
4. Click on any submitted interview to view details
5. Select **GPS Verification** tab

### Dashboard Overview

```
┌─────────────────────────────────────────────────────────┐
│  Supervisor Dashboard                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Interviews  │ GPS Verification │ Performance    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  GPS Verification Summary                               │
│  ┌──────────────┬──────────────┬──────────────┐       │
│  │ Total        │ Within       │ Flagged      │       │
│  │ Interviews   │ Threshold    │ for Review   │       │
│  │    150       │    142       │      8       │       │
│  └──────────────┴──────────────┴──────────────┘       │
│                                                         │
│  Filter: [All ▼] [Flagged Only] [Within Threshold]    │
│                                                         │
│  Interview List:                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🚩 BB-2024-0042 | FI: John Doe | 250m          │   │
│  │ ✓  BB-2024-0043 | FI: Jane Smith | 15m         │   │
│  │ 🚩 BB-2024-0044 | FI: John Doe | 320m          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Reading the GPS Verification Display

### Map View Components

When you open an interview's GPS verification tab, you'll see:

#### 1. Dual-Pin Map Display

```
┌─────────────────────────────────────────────────────────┐
│  GPS Verification Map                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         📍 Blue Pin                             │   │
│  │         (Assigned Spot)                         │   │
│  │              \                                  │   │
│  │               \  ← Dashed Line                  │   │
│  │                \   (Distance)                   │   │
│  │                 \                               │   │
│  │                  📍 Green Pin                   │   │
│  │                  (Actual Location)              │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Pin Colors:**
- **Blue Pin** 📍: Pre-assigned spot location
- **Green Pin** 📍: Actual GPS capture location

**Line Colors:**
- **Green Dashed Line**: Distance within threshold (acceptable)
- **Red Dashed Line**: Distance exceeds threshold (flagged)

#### 2. Verification Details Panel

```
┌─────────────────────────────────────────────────────────┐
│  GPS Verification Details                               │
│                                                         │
│  Distance: 250 meters                                   │
│  Status: ⚠️ Beyond Threshold                            │
│  Threshold: 200 meters                                  │
│                                                         │
│  Assigned Location:                                     │
│  Lat: 14.5995, Lng: 120.9842                           │
│  Barangay: Sample Barangay                             │
│                                                         │
│  Actual Location:                                       │
│  Lat: 14.6020, Lng: 120.9870                           │
│  Accuracy: 8 meters                                     │
│  Captured: 2024-11-15 10:30:45                         │
│                                                         │
│  🚩 FLAGGED FOR REVIEW                                  │
│                                                         │
│  [Mark as Reviewed] [Request Explanation] [Reject]     │
└─────────────────────────────────────────────────────────┘
```

### Understanding Distance Measurements

| Distance | Status | Interpretation |
|----------|--------|----------------|
| 0-50m | ✅ Excellent | FI at correct location, normal GPS variance |
| 51-100m | ✅ Good | Acceptable, may be nearby household |
| 101-200m | ⚠️ Acceptable | Within threshold, but monitor |
| 201-500m | 🚩 Flagged | Beyond threshold, requires review |
| 500m+ | 🚨 Critical | Significant deviation, likely error or fraud |

### GPS Accuracy Indicators

The actual location includes an accuracy measurement:

- **< 10 meters**: Excellent GPS signal
- **10-20 meters**: Good GPS signal (typical)
- **20-50 meters**: Fair GPS signal (acceptable)
- **> 50 meters**: Poor GPS signal (may explain larger distances)

---

## Flagging Criteria and Thresholds

### Default Threshold

**Default Distance Threshold: 200 meters**

Interviews are automatically flagged when the distance between assigned spot and actual location exceeds this threshold.

### Why 200 Meters?

The 200-meter threshold accounts for:

- Normal GPS accuracy variance (5-20 meters)
- Nearby households in the same cluster
- Terrain and building interference
- Mobile device GPS limitations
- Reasonable walking distance within a spot area

### Automatic Flagging Conditions

An interview is automatically flagged if:

1. ❌ Distance > configured threshold (default 200m)
2. ❌ GPS was not captured (missing verification location)
3. ❌ GPS accuracy is very poor (> 100 meters)
4. ❌ Assigned spot location is missing

### Manual Flagging

Supervisors can also manually flag interviews for:

- Suspicious patterns (multiple interviews from same location)
- Inconsistent timing (interviews too close together)
- FI behavior concerns
- Data quality issues

---

## Reviewing Flagged Interviews

### Review Process

When reviewing a flagged interview, follow these steps:

#### Step 1: Examine the Map

**Questions to Ask:**
- Are both pins visible on the map?
- What is the actual distance between locations?
- Is the actual location in a reasonable area (residential, not commercial/water)?
- Does the line cross any major obstacles (rivers, highways)?

#### Step 2: Check GPS Accuracy

**Questions to Ask:**
- What was the GPS accuracy when captured?
- If accuracy is poor (> 50m), could this explain the distance?
- Was GPS captured at the right time (during household visit)?

#### Step 3: Review Interview Details

**Questions to Ask:**
- Is the interview data complete and consistent?
- Does the timestamp make sense for the FI's schedule?
- Are there other interviews from this FI with similar issues?

#### Step 4: Consider Context

**Legitimate Reasons for Distance:**

✅ **Acceptable Explanations:**
- Spot area covers multiple households spread out
- GPS captured at household entrance vs. spot center point
- Terrain interference (hills, buildings) affecting GPS
- Poor GPS signal in the area
- Spot assignment was approximate, not exact address

❌ **Concerning Patterns:**
- Multiple interviews from exact same GPS coordinates
- GPS location is at FI's home or office
- GPS location is in impossible area (water, highway, commercial)
- Pattern of flagged interviews from same FI
- Distance is extreme (> 1km)

### Review Decision Matrix

| Distance | GPS Accuracy | Context | Decision |
|----------|--------------|---------|----------|
| 201-300m | Good (< 20m) | Residential area | ✅ Approve with note |
| 201-300m | Poor (> 50m) | Residential area | ⚠️ Request explanation |
| 301-500m | Good | Residential area | ⚠️ Request explanation |
| 301-500m | Poor | Any area | 🚩 Investigate further |
| 500m+ | Any | Any area | 🚨 Reject or investigate |
| Any | Any | Non-residential | 🚨 Reject or investigate |

---

## Taking Action on Flagged Interviews

### Available Actions

#### 1. Mark as Reviewed (Approve)

**When to Use:**
- Distance is slightly over threshold but explainable
- GPS accuracy was poor, accounting for variance
- Spot area is large and household is within it
- All other data quality indicators are good

**How to Do It:**
1. Click **"Mark as Reviewed"** button
2. Add a note explaining your decision
3. Interview is removed from flagged list
4. Data is retained and considered valid

**Example Note:**
```
"GPS accuracy was 45m, explaining the 220m distance. 
Interview data is complete and consistent. Approved."
```

#### 2. Request Explanation

**When to Use:**
- Distance is concerning but not conclusive
- Need more information from FI
- Want to verify FI's account of the situation
- Pattern needs clarification

**How to Do It:**
1. Click **"Request Explanation"** button
2. Write specific questions for the FI
3. System notifies FI to provide explanation
4. Review FI's response before making final decision

**Example Request:**
```
"The GPS location is 280m from the assigned spot. 
Please explain:
1. Why was the interview conducted at this location?
2. Was this household part of the assigned spot area?
3. Were there any GPS signal issues?"
```

#### 3. Reject Interview

**When to Use:**
- Distance is extreme (> 500m) with no valid explanation
- GPS location is clearly wrong (water, highway, etc.)
- Evidence of fraud or data fabrication
- FI cannot provide satisfactory explanation
- Pattern of violations from same FI

**How to Do It:**
1. Click **"Reject"** button
2. Provide detailed reason for rejection
3. Interview is marked as invalid
4. FI is notified and may need to redo interview
5. Consider disciplinary action if fraud is suspected

**Example Rejection:**
```
"GPS location is 850m from assigned spot and appears 
to be at FI's residence. Interview data shows 
inconsistencies. Rejected for quality concerns. 
FI must redo interview at correct location."
```

#### 4. Escalate for Investigation

**When to Use:**
- Suspected fraud or systematic violations
- Multiple flagged interviews from same FI
- Serious data quality concerns
- Need higher-level review

**How to Do It:**
1. Document all concerns and evidence
2. Escalate to Field Supervisor or Program Manager
3. May trigger formal investigation
4. May result in FI suspension or termination

---

## Configuring GPS Thresholds

### Accessing Threshold Settings

1. Navigate to **Supervisor Dashboard**
2. Click **Settings** icon
3. Select **GPS Verification Settings**
4. Adjust threshold value

### Threshold Configuration

```
┌─────────────────────────────────────────────────────────┐
│  GPS Verification Settings                              │
│                                                         │
│  Distance Threshold (meters):                           │
│  [200] meters                                           │
│                                                         │
│  Recommended: 150-250 meters                            │
│                                                         │
│  Current Setting: 200 meters                            │
│  - Urban areas: 150-200m recommended                    │
│  - Rural areas: 200-300m recommended                    │
│  - Mountainous: 250-350m recommended                    │
│                                                         │
│  [Save Changes] [Reset to Default]                      │
└─────────────────────────────────────────────────────────┘
```

### Choosing the Right Threshold

**Factors to Consider:**

1. **Geographic Context**
   - Urban: Tighter threshold (150-200m)
   - Rural: Moderate threshold (200-250m)
   - Mountainous: Looser threshold (250-350m)

2. **Spot Assignment Precision**
   - Exact addresses: Tighter threshold
   - Area-based spots: Looser threshold
   - Cluster sampling: Moderate threshold

3. **GPS Signal Quality**
   - Good infrastructure: Tighter threshold
   - Poor signal areas: Looser threshold
   - Mixed conditions: Moderate threshold

4. **FI Experience Level**
   - Experienced FIs: Tighter threshold
   - New FIs: Moderate threshold (with training)
   - Mixed team: Moderate threshold

### Threshold Recommendations by Area Type

| Area Type | Recommended Threshold | Rationale |
|-----------|----------------------|-----------|
| Dense Urban | 150m | Precise addresses, good GPS |
| Suburban | 200m | Standard setting, balanced |
| Rural | 250m | Spread out households |
| Mountainous | 300m | GPS interference, terrain |
| Island/Coastal | 200m | Standard, watch for water |

### Adjusting Thresholds

**When to Tighten (Lower Threshold):**
- High fraud risk areas
- Experienced FI team
- Urban areas with good GPS
- Precise spot assignments

**When to Loosen (Raise Threshold):**
- Poor GPS signal areas
- Large spot areas
- Mountainous terrain
- New FI team (temporarily)

**Warning:** Don't set threshold too low (< 100m) as normal GPS variance may cause excessive false flags.

---

## Best Practices

### Daily Review Routine

**Morning:**
1. ✅ Check overnight sync for new submissions
2. ✅ Review flagged interviews from previous day
3. ✅ Prioritize critical flags (> 500m distance)
4. ✅ Send explanation requests to FIs

**Midday:**
1. ✅ Monitor real-time submissions
2. ✅ Check for patterns or repeated issues
3. ✅ Respond to FI explanations
4. ✅ Provide feedback to FIs in the field

**End of Day:**
1. ✅ Complete all pending reviews
2. ✅ Document decisions and notes
3. ✅ Generate daily GPS verification report
4. ✅ Plan follow-up actions for next day

### Quality Assurance Tips

1. **Review Systematically**
   - Don't just focus on flagged interviews
   - Spot-check approved interviews randomly
   - Look for patterns across FIs

2. **Document Everything**
   - Add notes to all review decisions
   - Keep records of FI explanations
   - Track patterns over time

3. **Communicate Clearly**
   - Provide specific feedback to FIs
   - Explain why interviews were flagged
   - Offer guidance for improvement

4. **Be Fair and Consistent**
   - Apply same standards to all FIs
   - Consider context and explanations
   - Don't assume fraud without evidence

5. **Use Data to Improve**
   - Track GPS verification metrics
   - Identify training needs
   - Adjust thresholds based on experience

### Red Flags to Watch For

🚨 **Critical Warning Signs:**

1. **Same GPS Coordinates**
   - Multiple interviews from exact same location
   - Suggests interviews not conducted at households

2. **FI Home/Office Location**
   - GPS coordinates match FI's known locations
   - Strong indicator of fraud

3. **Impossible Locations**
   - GPS in water, highways, commercial areas
   - Clearly not residential households

4. **Timing Anomalies**
   - Multiple interviews with same timestamp
   - Interviews too close together geographically
   - Interviews outside working hours

5. **Consistent Pattern**
   - Same FI repeatedly flagged
   - Always just over threshold
   - Systematic deviation

---

## Troubleshooting

### Issue: No GPS Data Available

**Symptoms:**
- Interview shows "GPS Not Captured"
- Verification location is missing
- Cannot display map view

**Possible Causes:**
1. FI skipped GPS capture
2. GPS capture failed due to technical issue
3. Offline survey not synced properly
4. Data corruption during sync

**Resolution Steps:**
1. Check if interview was conducted offline
2. Verify sync completed successfully
3. Contact FI to explain why GPS was not captured
4. If technical issue, may approve with documentation
5. If FI error, require GPS capture training

**Prevention:**
- Train FIs on importance of GPS capture
- Test GPS functionality before fieldwork
- Monitor GPS capture rates daily

---

### Issue: GPS Accuracy is Very Poor

**Symptoms:**
- Accuracy > 50 meters
- Distance flagged but may be GPS error
- Inconsistent GPS readings

**Possible Causes:**
1. Poor GPS signal in the area
2. Indoor GPS capture
3. Device GPS malfunction
4. Atmospheric interference

**Resolution Steps:**
1. Check GPS accuracy value in details
2. If accuracy > 50m, consider as explanation for distance
3. Review other interviews from same area
4. If pattern, may be area-specific issue
5. Approve with note if other data is good

**Prevention:**
- Train FIs to capture GPS outdoors
- Wait for GPS accuracy to improve before capturing
- Use devices with better GPS capabilities

---

### Issue: Assigned Spot Location Missing

**Symptoms:**
- Blue pin not displayed
- Cannot calculate distance
- Verification shows "No Assigned Spot"

**Possible Causes:**
1. Spot assignment data incomplete
2. Database error
3. Spot not properly geocoded
4. Data migration issue

**Resolution Steps:**
1. Check spot assignment records
2. Verify spot has GPS coordinates
3. Update spot location if missing
4. Recalculate verification for affected interviews
5. May need to approve without GPS verification

**Prevention:**
- Ensure all spots are geocoded before assignment
- Validate spot data during assignment process
- Regular spot data quality checks

---

### Issue: Map Not Loading

**Symptoms:**
- Blank map area
- Pins not displayed
- "Map failed to load" error

**Possible Causes:**
1. Internet connection issue
2. Map service (OpenStreetMap) unavailable
3. Browser compatibility issue
4. JavaScript error

**Resolution Steps:**
1. Refresh the page
2. Check internet connection
3. Try different browser
4. Clear browser cache
5. Check browser console for errors
6. Contact technical support if persistent

**Prevention:**
- Use supported browsers (Chrome, Firefox, Edge)
- Ensure stable internet connection
- Keep browser updated

---

### Issue: Distance Calculation Seems Wrong

**Symptoms:**
- Distance doesn't match visual map distance
- Inconsistent distance values
- Distance is negative or zero when pins are apart

**Possible Causes:**
1. Coordinate system mismatch
2. Calculation error
3. Data corruption
4. Display bug

**Resolution Steps:**
1. Verify coordinates are in correct format (decimal degrees)
2. Check both coordinates are valid (not 0,0)
3. Manually calculate distance using online tool
4. Report bug if calculation is consistently wrong
5. Use manual judgment based on map visual

**Prevention:**
- Regular system testing
- Validate coordinate data on entry
- Monitor for calculation anomalies

---

## Reporting and Analytics

### GPS Verification Reports

**Available Reports:**

1. **Daily GPS Verification Summary**
   - Total interviews submitted
   - Number within threshold
   - Number flagged
   - Average distance
   - By FI breakdown

2. **FI Performance Report**
   - GPS capture success rate
   - Average distance from assigned spots
   - Number of flagged interviews
   - Trend over time

3. **Geographic Analysis**
   - GPS verification by barangay
   - Problem areas identification
   - Signal quality by location

4. **Quality Assurance Report**
   - Review completion rate
   - Approval/rejection rates
   - Common issues identified
   - Training needs assessment

### Key Metrics to Monitor

| Metric | Target | Action if Below Target |
|--------|--------|----------------------|
| GPS Capture Rate | > 95% | FI training on GPS capture |
| Within Threshold | > 90% | Review threshold setting |
| Review Completion | 100% daily | Increase supervisor capacity |
| Average Distance | < 100m | Investigate spot assignment accuracy |

---

## Training and Support

### Training FIs on GPS Verification

**Key Messages:**
1. GPS verification is for quality assurance, not punishment
2. Accurate GPS capture protects FI credibility
3. Explain legitimate reasons for distance variance
4. Report technical issues immediately
5. Follow protocols to avoid flags

### Supporting FIs

**When FI is Flagged:**
1. Explain the flagging reason clearly
2. Ask for FI's explanation
3. Provide guidance for improvement
4. Offer additional training if needed
5. Monitor subsequent interviews

**Building Trust:**
- Be transparent about verification process
- Recognize FIs with good GPS compliance
- Address technical issues promptly
- Provide constructive feedback

---

## Quick Reference

### GPS Verification Checklist

**For Each Flagged Interview:**
- [ ] Check distance and GPS accuracy
- [ ] Review map visual (pins and line)
- [ ] Verify assigned spot is correct
- [ ] Check interview data quality
- [ ] Consider context and explanations
- [ ] Make decision (approve/request/reject)
- [ ] Document decision with notes
- [ ] Communicate with FI if needed

### Decision Quick Guide

| Situation | Action |
|-----------|--------|
| 201-300m, good accuracy, residential | Approve with note |
| 201-300m, poor accuracy | Request explanation |
| 301-500m, any accuracy | Request explanation |
| 500m+, any accuracy | Reject or investigate |
| Same GPS multiple times | Investigate for fraud |
| GPS at FI home/office | Reject and investigate |
| No GPS captured | Request explanation |

### Contact Information

- **Technical Support:** [Contact Info]
- **Program Manager:** [Contact Info]
- **GPS Issues:** [Contact Info]
- **System Bugs:** [Contact Info]

---

*Last Updated: [Date]*
*Version: 1.0 - CSIS GPS Verification Implementation*
