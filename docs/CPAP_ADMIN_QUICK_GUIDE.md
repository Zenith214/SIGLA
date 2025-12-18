# CPAP Admin Quick Guide

## Quick Start for DILG Administrators

This guide provides step-by-step instructions for DILG administrators to review, approve, and monitor Citizen Priority Action Plans (CPAPs) in the PULSE system.

---

## Accessing CPAP Management

1. Log in to PULSE with your Admin account
2. Click on your profile avatar in the top-right corner
3. Select **"CPAP Management"** from the dropdown menu
4. You'll be taken to the CPAP Management dashboard

---

## Dashboard Overview

The CPAP Management dashboard has two main tabs:

### 1. Review Tab
- View all submitted CPAPs
- Filter and search for specific plans
- Review and approve/reject submissions

### 2. Monitoring Tab
- Track implementation progress
- View approved CPAPs
- Monitor completion rates

---

## Reviewing CPAPs

### Step 1: Find the CPAP

**Using Filters:**
- **Status**: Filter by Draft, Submitted, Approved, or Revision Requested
- **Cycle**: Filter by specific survey cycle
- **Barangay**: Filter by specific barangay
- **Search**: Type barangay name to search

**Using Sort:**
- Click column headers to sort:
  - **Barangay**: Alphabetical order
  - **Status**: By status type
  - **Submitted**: By submission date (default)

### Step 2: Open the CPAP

1. Find the CPAP you want to review
2. Click the **"View"** button on the right
3. The review modal will open

### Step 3: Review the Details

The modal shows:
- **Barangay information**: Name and survey cycle
- **Submission date**: When it was submitted
- **Action items**: All planned activities with:
  - Priority area
  - Target output
  - Success indicators
  - Responsible person
  - Timeline (start and end dates)

### Step 4: Take Action

You have two options:

#### Option A: Approve the CPAP

1. Click the **"Approve"** button (green)
2. Review the confirmation message
3. Click **"Confirm Approval"**
4. The officer will be notified
5. The CPAP status changes to "Approved"
6. The officer can now track implementation progress

#### Option B: Request Revision

1. Click the **"Request Revision"** button (red)
2. A comment box will appear
3. Type your feedback explaining what needs to be changed
4. Click **"Request Revision"** to submit
5. The officer will be notified with your comments
6. The CPAP status changes to "Revision Requested"
7. The officer can edit and resubmit

---

## Monitoring Implementation

### Step 1: Switch to Monitoring Tab

1. Click the **"Monitoring"** tab at the top
2. You'll see summary cards showing:
   - Total approved CPAPs
   - Total action items
   - Average completion rate

### Step 2: View CPAP Progress

Each approved CPAP shows:
- **Barangay name** and survey cycle
- **Number of action items**
- **Approval date**
- **Time since approval**
- **Last update** from the officer

### Step 3: View Detailed Progress

1. Click **"View Details"** on any CPAP
2. The detail modal shows:
   - **Overall progress percentage**
   - **Item-by-item progress** with:
     - Actual output (what was accomplished)
     - Accomplishment status
     - Remarks from the officer
   - **Timeline information**
   - **Visual progress bars**

---

## Understanding Status Badges

CPAPs have different status indicators:

- **Draft** (Gray): Officer is still working on it
- **Submitted** (Blue): Ready for your review
- **Approved** (Green): You approved it, officer is implementing
- **Revision Requested** (Red): You requested changes

---

## Common Tasks

### Finding Submitted CPAPs Quickly

1. Go to Review tab
2. Set Status filter to **"Submitted"**
3. Sort by **"Submitted"** date (newest first)
4. Review and approve/reject each one

### Checking Progress on All Approved CPAPs

1. Go to Monitoring tab
2. Review the summary cards for overview
3. Scroll through the list to see individual progress
4. Click "View Details" for any CPAP needing attention

### Finding a Specific Barangay's CPAP

1. Use the **Search** box
2. Type the barangay name
3. Click "View" to open it

### Reviewing CPAPs by Survey Cycle

1. Use the **Cycle** filter dropdown
2. Select the survey cycle
3. All CPAPs for that cycle will be displayed

---

## Tips for Effective Review

### What to Check

1. **Completeness**: All fields filled out properly
2. **Relevance**: Actions address survey findings
3. **Feasibility**: Timelines and outputs are realistic
4. **Clarity**: Success indicators are measurable
5. **Responsibility**: Clear assignment of tasks

### When to Approve

Approve when:
- All action items are complete and clear
- Timelines are reasonable
- Success indicators are measurable
- Responsible persons are identified
- Plan addresses survey findings

### When to Request Revision

Request revision when:
- Information is incomplete or unclear
- Timelines are unrealistic
- Success indicators are vague
- Actions don't address survey findings
- More detail is needed

### Writing Good Revision Comments

Be specific and constructive:
- ✅ "Item 3 needs a more specific success indicator. Instead of 'improved service', specify a measurable target like '80% satisfaction rate'."
- ❌ "This needs work."

---

## Keyboard Shortcuts

- **Tab**: Switch between Review and Monitoring tabs
- **Esc**: Close modal
- **Enter**: Confirm action in dialogs

---

## Troubleshooting

### Can't See CPAP Management Menu

- Verify you're logged in as Admin
- Only Admin users can access CPAP Management
- Try logging out and back in

### CPAP List is Empty

- Check your filters - you may have filtered out all CPAPs
- Click "All Statuses" to see everything
- Verify that officers have submitted CPAPs

### Can't Approve a CPAP

- Verify the status is "Submitted"
- Draft and already-approved CPAPs can't be approved again
- Check that you have Admin role

### Progress Shows 0%

- Officers may not have updated progress yet
- Click "View Details" to see if any fields are filled
- Progress is calculated based on filled progress fields

---

## Need Help?

Contact your system administrator or refer to:
- Full documentation: `docs/CPAP_ADMIN_UI_IMPLEMENTATION.md`
- API documentation: `docs/CPAP_API_QUICK_REFERENCE.md`
- System overview: `docs/SYSTEM_OVERVIEW.md`

---

## Quick Reference Card

| Task | Steps |
|------|-------|
| **Review CPAP** | Review tab → Find CPAP → View → Approve/Request Revision |
| **Approve** | View CPAP → Approve → Confirm |
| **Request Changes** | View CPAP → Request Revision → Add comments → Submit |
| **Monitor Progress** | Monitoring tab → View Details |
| **Filter by Status** | Use Status dropdown → Select status |
| **Search Barangay** | Type in Search box |
| **Sort List** | Click column header |

---

**Last Updated**: November 19, 2025
