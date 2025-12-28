# PULSE System - Complete User Manual

**Version:** 1.0.0  
**Last Updated:** December 28, 2025  
**System:** Public Understanding and Local Service Evaluation

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Admin Guide](#admin-guide)
5. [Field Supervisor Guide](#field-supervisor-guide)
6. [Interviewer Guide](#interviewer-guide)
7. [Barangay Official Guide](#barangay-official-guide)
8. [CPAP System Guide](#cpap-system-guide)
9. [Analytics & Reporting](#analytics-reporting)
10. [Troubleshooting](#troubleshooting)
11. [FAQs](#faqs)

---

## 🎯 Introduction

### What is PULSE?

PULSE (Public Understanding and Local Service Evaluation) is a comprehensive digital platform designed to help Municipal Local Governance Resource Centers (MLGRC) systematically:

- Collect citizen feedback on local government services
- Evaluate service delivery effectiveness
- Improve barangay-level governance performance
- Create data-driven action plans (CPAP)
- Track implementation progress

### Key Benefits

- **Evidence-Based Decision Making**: Use real survey data to prioritize actions
- **Transparent Governance**: Track progress and accountability
- **Community Engagement**: Involve citizens in governance improvement
- **Efficient Monitoring**: Real-time dashboards and progress tracking
- **AI-Powered Insights**: Get intelligent recommendations based on data


---

## 🚀 Getting Started

### System Requirements

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet Connection**: Required for online features
- **Offline Support**: Available for survey data collection
- **Mobile Devices**: Responsive design works on tablets and phones

### Accessing the System

1. **Open your web browser**
2. **Navigate to**: `https://your-pulse-domain.com`
3. **Login** with your credentials
4. **Dashboard** loads automatically based on your role

### First-Time Login

1. Enter your **username** and **password**
2. You may be prompted to **change your password**
3. Review the **welcome guide** (if shown)
4. Familiarize yourself with the **navigation menu**


---

## 👥 User Roles

### Role Overview

| Role | Primary Function | Access Level |
|------|-----------------|--------------|
| **Admin** | System setup, cycle management, overall monitoring | Full system access |
| **Field Supervisor (FS)** | Survey coordination, interviewer management | Assigned barangays |
| **Interviewer** | Data collection, survey submission | Assigned spots |
| **Barangay Official** | CPAP creation, action planning, implementation | Own barangay |
| **LGU Reviewer** | CPAP review and approval | All barangays in jurisdiction |

### Permission Matrix

| Feature | Admin | FS | Interviewer | Barangay | Reviewer |
|---------|-------|----|-----------|---------|---------| 
| Create Survey Cycles | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Supervisors | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Spots | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Interviewers | ✅ | ✅ | ❌ | ❌ | ❌ |
| Conduct Surveys | ❌ | ❌ | ✅ | ❌ | ❌ |
| Create CPAP | ❌ | ❌ | ❌ | ✅ | ❌ |
| Review CPAP | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Analytics | ✅ | ✅ | ❌ | ✅ | ✅ |


---

## 🔧 Admin Guide

### Overview

As an Admin, you are responsible for setting up survey cycles, managing barangays, assigning supervisors, and monitoring the entire system.

### 1. Creating a Survey Cycle

**Purpose**: Define a new data collection period

**Steps**:
1. Navigate to **Settings** → **Survey Cycles**
2. Click **"Create New Cycle"**
3. Fill in the details:
   - **Cycle Name**: e.g., "2025 Q1 Survey"
   - **Start Date**: When data collection begins
   - **End Date**: When data collection ends
   - **Status**: Set to "Active" to enable
4. Click **"Save Cycle"**

**Best Practices**:
- Use clear, descriptive names (include year and quarter)
- Set realistic timelines (typically 2-3 months)
- Only one cycle should be "Active" at a time

### 2. Awarding Barangays to Cycle

**Purpose**: Select which barangays participate in this cycle

**Steps**:
1. Go to **Settings** → **Barangay Awards**
2. Select the **Survey Cycle**
3. Check the barangays to include
4. Set any barangay-specific parameters
5. Click **"Save Awards"**

**Tips**:
- You can award all barangays or select specific ones
- Previously awarded barangays can be re-awarded to new cycles
- Awards determine which barangays can access CPAP later


### 3. Setting Survey Targets

**Purpose**: Define how many responses are needed per barangay

**Steps**:
1. Navigate to **Settings** → **Survey Targets**
2. Select a **Barangay**
3. Enter the **Target Number of Respondents** (n)
4. Enter the **Population Size**
5. System automatically calculates **Margin of Error (MOE)**
6. Click **"Save Target"**

**Understanding MOE**:
- Lower MOE = More accurate results (requires more respondents)
- Typical MOE: 5-10%
- Formula considers population size and confidence level

**Example**:
- Population: 5,000
- Target: 357 respondents
- MOE: ±5% at 95% confidence

### 4. Assigning Field Supervisors

**Purpose**: Designate who manages data collection for each barangay

**Steps**:
1. Go to **Settings** → **Supervisor Assignments**
2. Select a **Barangay**
3. Choose a **Field Supervisor** from the dropdown
4. Click **"Assign"**
5. System sends notification to the FS

**Important**:
- One FS can manage multiple barangays
- FS must have "Field Supervisor" role in the system
- FS gains access to create spots and assign interviewers


### 5. Monitoring System Progress

**Purpose**: Track data collection and CPAP progress across all barangays

**Dashboard Features**:
- **Survey Progress**: See completion rates per barangay
- **CPAP Status**: Monitor action plan submissions and approvals
- **Interviewer Performance**: Track individual productivity
- **Data Quality**: Review flagged or anomalous responses

**Navigation**:
1. Click **"Dashboard"** in the main menu
2. Use filters to view specific:
   - Survey cycles
   - Barangays
   - Date ranges
3. Click on any barangay for detailed view

### 6. User Management

**Purpose**: Create and manage user accounts

**Steps**:
1. Navigate to **Settings** → **User Management**
2. Click **"Add New User"**
3. Fill in user details:
   - First Name, Last Name
   - Email
   - Role (Admin, FS, Interviewer, Officer)
   - Assigned Barangay (if applicable)
4. Click **"Create User"**
5. System generates temporary password
6. Share credentials with the user

**Role Assignment**:
- **Admin**: Full system access
- **Field Supervisor**: Manages assigned barangays
- **Interviewer**: Conducts surveys in assigned spots
- **Officer**: Creates and manages CPAP for their barangay


---

## 📋 Field Supervisor Guide

### Overview

As a Field Supervisor, you coordinate data collection activities, create survey spots, and assign interviewers.

### 1. Viewing Assigned Barangays

**Steps**:
1. Login to the system
2. Dashboard shows your **assigned barangays**
3. Click on a barangay to see:
   - Survey targets
   - Current progress
   - Assigned interviewers
   - Spot locations

### 2. Creating Survey Spots

**Purpose**: Define specific locations where surveys will be conducted

**Steps**:
1. Navigate to **Spots** → **Create New Spot**
2. Select the **Barangay**
3. Fill in spot details:
   - **Spot Name**: e.g., "Purok 1", "Market Area"
   - **Location Description**: Detailed address or landmark
   - **Target Respondents**: How many surveys for this spot
   - **Coordinates** (optional): GPS location
4. Click **"Save Spot"**

**Best Practices**:
- Create spots that cover different areas of the barangay
- Distribute targets evenly across spots
- Use clear, recognizable location names
- Consider accessibility and safety

**Example Spot Setup**:
```
Barangay: San Jose
Total Target: 100 respondents

Spot 1: Purok 1 (25 respondents)
Spot 2: Market Area (25 respondents)
Spot 3: School Zone (25 respondents)
Spot 4: Barangay Hall (25 respondents)
```


### 3. Assigning Interviewers

**Purpose**: Designate who will conduct surveys at each spot

**Steps**:
1. Go to **Spots** → Select a spot
2. Click **"Assign Interviewer"**
3. Choose an **Interviewer** from the list
4. Set their **quota** (how many surveys they should complete)
5. Click **"Assign"**
6. System notifies the interviewer

**Tips**:
- One interviewer can be assigned to multiple spots
- Set realistic quotas (typically 10-20 surveys per day)
- Monitor interviewer progress regularly
- Reassign if someone is unavailable

### 4. Monitoring Progress

**Dashboard View**:
- **Overall Progress**: Percentage of target achieved
- **Spot-Level Progress**: Completion per location
- **Interviewer Performance**: Individual productivity
- **Daily Trends**: Submissions over time

**Actions You Can Take**:
- Reassign interviewers if needed
- Adjust spot targets
- Flag problematic responses
- Communicate with interviewers

### 5. Data Quality Checks

**Review Submitted Surveys**:
1. Navigate to **Responses** → **Review**
2. Filter by spot or interviewer
3. Check for:
   - Incomplete responses
   - Suspicious patterns
   - Outliers or anomalies
4. Approve or flag for review


---

## 📱 Interviewer Guide

### Overview

As an Interviewer, you conduct surveys with community members and submit responses to the system.

### 1. Viewing Your Assignments

**Steps**:
1. Login to the system
2. Dashboard shows your **assigned spots**
3. Click on a spot to see:
   - Location details
   - Your quota
   - Progress so far
   - Remaining surveys needed

### 2. Conducting a Survey

**Preparation**:
- Review the survey questions beforehand
- Bring a mobile device or tablet
- Have a backup power source
- Know the spot location

**Steps**:
1. Navigate to **Surveys** → **Start New Survey**
2. Select your **Spot**
3. **Respondent Selection** (Kish Grid):
   - Count household members
   - System selects respondent randomly
   - Interview the selected person only
4. **Collect Basic Information**:
   - Name (optional)
   - Age
   - Gender
   - Contact information
5. **Ask Survey Questions**:
   - Read questions clearly
   - Record responses accurately
   - Use the rating scales provided
6. **Geotagging** (if enabled):
   - Allow location access
   - System captures GPS coordinates
7. **Review Responses**:
   - Check for completeness
   - Verify accuracy
8. **Submit** or **Save as Draft**


### 3. Survey Best Practices

**Do's**:
- ✅ Introduce yourself and explain the purpose
- ✅ Ensure privacy during the interview
- ✅ Read questions exactly as written
- ✅ Be patient and respectful
- ✅ Record responses immediately
- ✅ Thank the respondent

**Don'ts**:
- ❌ Don't rush the respondent
- ❌ Don't suggest answers
- ❌ Don't skip questions
- ❌ Don't interview the same person twice
- ❌ Don't fabricate responses

### 4. Offline Mode

**When Internet is Unavailable**:
1. System automatically switches to **offline mode**
2. Continue conducting surveys normally
3. Responses are **saved locally** on your device
4. When internet returns:
   - System automatically syncs
   - Saved responses are uploaded
   - You receive confirmation

**Important**:
- Don't clear browser data while offline
- Keep device charged
- Sync as soon as possible

### 5. Managing Drafts

**Save Draft**:
- Use when you need to pause a survey
- Draft is saved on your device
- Resume anytime from **Drafts** section

**Resume Draft**:
1. Go to **Surveys** → **Drafts**
2. Click on the draft to resume
3. Complete remaining questions
4. Submit when done


---

## 🏛️ Barangay Official Guide

### Overview

As a Barangay Official, you view survey results for your barangay and create Citizen Priority Action Plans (CPAP) based on community feedback.

### 1. Accessing Your Dashboard

**Steps**:
1. Login to the system
2. Dashboard shows:
   - Your barangay's survey progress
   - Satisfaction scores
   - CPAP status
   - Recent notifications

### 2. Viewing Survey Results

**When Available**:
- After survey target is met
- Report card is automatically generated
- You receive a notification

**Steps**:
1. Navigate to **Dashboard** → **Report Card**
2. Review:
   - **Overall Satisfaction Index**
   - **Service Area Ratings** (6 categories)
   - **Top Issues** identified by citizens
   - **Demographics** breakdown
   - **Comparison** with other barangays (optional)

**Service Areas**:
1. Financial Administration
2. Disaster Preparedness
3. Social Protection
4. Safety and Peace
5. Business-Friendly
6. Environmental Management


### 3. Understanding Your Report Card

**Satisfaction Index**:
- Scale: 0-100
- 80-100: Excellent
- 60-79: Good
- 40-59: Fair
- Below 40: Needs Improvement

**Service Area Scores**:
- Each service area has its own rating
- Identifies strengths and weaknesses
- Helps prioritize action items

**Priority Issues**:
- Top concerns raised by citizens
- Frequency of mentions
- Severity ratings
- Suggested focus areas

### 4. Starting Your CPAP

**Eligibility**:
- Survey target must be met
- Report card must be generated
- You must be assigned as barangay officer

**Steps**:
1. Navigate to **CPAP** → **CPAP Submission**
2. If no CPAP exists, click **"Create a Plan"**
3. System redirects to **Spreadsheet Editor**
4. Begin creating action items


---

## 📊 CPAP System Guide

### What is CPAP?

**Citizen Priority Action Plan (CPAP)** is a structured document that:
- Addresses issues identified in survey results
- Defines specific actions to improve services
- Sets timelines and responsibilities
- Tracks implementation progress

### CPAP Spreadsheet Interface

**13 Columns**:
1. **Results/Observations** - Survey findings or community needs
2. **Plan of Action** - Proposed solution
3. **Activity** - Specific activity to perform
4. **Output** - Expected deliverable (REQUIRED)
5. **Actual Output** - What was actually delivered
6. **Status of Accomplishment** - Current status
7. **Implementation Schedule** - Timeline
8. **Actual Date** - When completed
9. **Financial Requirements** - Budget needed
10. **Responsible Person/Office** - Who is accountable
11. **Committed/To be Committed** - Budget allocation status
12. **Means of Verification** - How to verify completion
13. **Actions** - Delete row button

**6 Service Areas**:
1. Financial Administration
2. Disaster Preparedness
3. Social Protection
4. Safety and Peace
5. Business-Friendly
6. Environmental Management


### Creating Action Items

**Step-by-Step**:

1. **Select Service Area**
   - Choose the area that needs improvement
   - Based on your survey results

2. **Click "Add row for [Service Area]"**
   - Opens a new row in the spreadsheet

3. **Fill in the Columns**:

   **Results/Observations**:
   ```
   Example: "Low satisfaction with health services - 
   citizens report long wait times at health center"
   ```

   **Plan of Action**:
   ```
   Example: "Improve health center efficiency and 
   reduce patient wait times"
   ```

   **Activity**:
   ```
   Example: "Implement appointment scheduling system 
   and hire additional staff"
   ```

   **Output** (REQUIRED):
   ```
   Example: "Functional appointment system and 2 new 
   health workers hired"
   ```

   **Status of Accomplishment**:
   - Options: "Not Started", "In Progress", "Completed", "Delayed"

   **Implementation Schedule**:
   ```
   Example: "January - June 2025"
   ```

   **Financial Requirements**:
   ```
   Example: "₱150,000.00"
   ```

   **Responsible Person/Office**:
   ```
   Example: "Barangay Health Officer"
   ```

   **Means of Verification**:
   ```
   Example: "Appointment logs, employment contracts, 
   patient satisfaction survey"
   ```

4. **Add More Rows**
   - Click "Add another row" to add more items
   - Recommended: 3-5 action items per service area

5. **Save Your Work**
   - Click **"Save Plan"** (top right)
   - Or **"Save All Changes"** (bottom)


### Using AI Suggestions

**What is it?**
- AI analyzes your survey results
- Generates recommended action items
- Saves time in creating your CPAP

**How to Use**:

1. **Click "Get AI Suggestions"**
   - Button appears above the spreadsheet

2. **Review the Modal**
   - AI generates suggestions based on your data
   - Shows how many suggestions were created

3. **AI Suggestions Appear**
   - Rows with **purple background** are AI-generated
   - Warning banner appears at the top

4. **⚠️ Important Warnings**:
   - AI suggestions may contain inaccuracies
   - Review and edit each suggestion carefully
   - Verify all information before saving
   - Add or remove rows as needed
   - These are recommendations only - you have full control

5. **Edit AI Suggestions**:
   - Click on any cell to edit
   - Modify text to match your actual needs
   - Delete rows you don't want (trash icon)
   - Add your own rows alongside AI suggestions

6. **Clear All AI Suggestions**:
   - Click "Clear All Suggestions" in warning banner
   - Removes all purple-highlighted rows
   - Start fresh if needed

**Best Practice**:
- Use AI suggestions as a starting point
- Customize based on local context
- Verify budget estimates
- Confirm responsible persons
- Ensure timelines are realistic


### Spreadsheet Tips & Tricks

**Keyboard Navigation**:
- **Tab**: Move to next cell
- **Shift + Tab**: Move to previous cell
- **Enter**: New line in textarea
- **Esc**: Cancel edit (future feature)

**Editing**:
- Click any cell to edit
- Textarea fields auto-expand
- Changes are highlighted
- Must click Save to persist

**Managing Rows**:
- **Add**: Click "+ Add row for [Area]"
- **Delete**: Click trash icon in Actions column
- **Reorder**: Not available (add in desired order)

**Saving**:
- Save button in header (top right)
- Save button in footer (bottom)
- Both do the same thing
- Changes are not saved automatically

**Visual Cues**:
- **White rows**: Manual entries
- **Purple rows**: AI suggestions
- **Blue headers**: Service area sections
- **Red trash icon**: Delete action

### CPAP Status Flow

```
NOT STARTED → IN PROGRESS → SUBMITTED → APPROVED
                                ↓
                        REVISION REQUESTED
                                ↓
                           SUBMITTED
```

**Status Meanings**:
- **Not Started**: No CPAP created yet
- **In Progress**: CPAP being drafted (can edit)
- **Submitted**: Sent for review (locked)
- **Revision Requested**: Admin wants changes (can edit)
- **Approved**: Accepted by admin (locked, track progress)


### Submitting Your CPAP

**Before Submitting**:
- [ ] All required fields filled (especially Output)
- [ ] At least 1 action item created
- [ ] Budget estimates are reasonable
- [ ] Timelines are realistic
- [ ] Responsible persons are confirmed
- [ ] Reviewed for accuracy

**Steps**:
1. Click **"Submit for Review"** button
2. Confirm submission in the dialog
3. Status changes to **"SUBMITTED"**
4. CPAP is locked (no more edits)
5. Admin/Reviewer is notified

**What Happens Next**:
- Admin reviews your CPAP
- You receive notification of decision:
  - **Approved**: Can start implementation
  - **Revision Requested**: Make changes and resubmit
  - **Rejected**: Start over (rare)

### Using the Comments System

**Purpose**: Communicate with admin/reviewer about your CPAP

**Opening Comments**:
1. Look for **"Comments"** button (right side)
2. Click to open the sidebar
3. Badge shows unread count

**Sending a Comment**:
1. Type your message in the text box
2. Press **Enter** or click **Send**
3. Message appears with your name and timestamp

**Use Cases**:
- Explain delays or challenges
- Ask questions about requirements
- Provide updates on progress
- Respond to admin feedback
- Share additional context

**Example Comments**:
```
"Item 3 is delayed because the contractor hasn't 
delivered materials yet. Expected completion by 
end of month."

"Can you clarify the budget requirements for Item 5? 
Should this include equipment costs?"

"Great news! Item 2 is now completed. All documentation 
has been submitted to the municipal office."
```


### Notifications

**What Triggers Notifications**:
- Admin approves your CPAP
- Admin requests revisions
- Admin comments on your CPAP
- System reminders

**Viewing Notifications**:
1. Click your **profile icon** (top right)
2. Look for **red badge** with count
3. Badge appears next to "CPAP Submission"
4. Visit CPAP page to mark as read

**Notification Badge**:
- Shows count (1-9 or "9+")
- Red circle with white text
- Updates every 30 seconds
- Disappears when all read

### Tracking Implementation Progress

**After Approval**:
1. Navigate to **CPAP** → **CPAP Submission**
2. Click **"Edit in Spreadsheet View"**
3. Update the following columns:
   - **Actual Output**: What was delivered
   - **Status of Accomplishment**: Current status
   - **Actual Date**: When completed
4. Click **"Save All Changes"**
5. Admin is notified of updates

**Progress Column**:
- Shows completion percentage (0-100%)
- Based on status of all action items
- Updates automatically
- Visible to admin in monitoring dashboard

**Status Options**:
- **Not Started**: No work begun
- **In Progress**: Currently working on it
- **Completed**: Finished
- **Delayed**: Behind schedule


---

## 🔍 Admin CPAP Review Guide

### Overview

As an Admin or LGU Reviewer, you review submitted CPAPs, provide feedback, and approve or request revisions.

### 1. Accessing CPAP Monitoring

**Steps**:
1. Navigate to **Admin** → **CPAP Management**
2. Dashboard shows:
   - All submitted CPAPs
   - Status of each CPAP
   - Barangay names
   - Submission dates

**Filters**:
- By status (Submitted, Approved, Revision Requested)
- By barangay
- By date range
- By survey cycle

### 2. Reviewing a CPAP

**Steps**:
1. Click on a CPAP to open **Review Page**
2. Review each action item:
   - Is the output clearly defined?
   - Is the budget reasonable?
   - Is the timeline realistic?
   - Is the responsible person appropriate?
   - Does it address survey findings?

**Evaluation Criteria**:
- **Relevance**: Does it address community needs?
- **Feasibility**: Can it realistically be accomplished?
- **Clarity**: Are objectives and outputs clear?
- **Budget**: Are financial requirements justified?
- **Timeline**: Is the schedule achievable?
- **Accountability**: Are responsibilities clearly assigned?


### 3. Providing Feedback

**Using Comments**:
1. Open **Comments** sidebar (right side)
2. Type your feedback or questions
3. Be specific and constructive
4. Press Enter to send

**Example Feedback**:
```
"Item 3: Please provide more details on the budget 
breakdown. The ₱150,000 seems high for this activity."

"Item 5: The timeline is too ambitious. Consider 
extending to 6 months instead of 3."

"Overall: Good plan! Just need clarification on 
Items 3 and 5 before approval."
```

### 4. Making a Decision

**Option A: Approve**
1. Click **"Approve CPAP"** button
2. Add approval comments (optional)
3. Confirm approval
4. Status changes to **"APPROVED"**
5. Barangay is notified

**Option B: Request Revisions**
1. Click **"Request Revisions"** button
2. Add detailed feedback (required)
3. Specify what needs to change
4. Confirm request
5. Status changes to **"REVISION_REQUESTED"**
6. CPAP is unlocked for editing
7. Barangay is notified

**Option C: Reject** (rare)
1. Click **"Reject CPAP"** button
2. Provide clear rejection reasons
3. Confirm rejection
4. Status changes to **"REJECTED"**
5. Barangay must start over


### 5. Monitoring Implementation

**After Approval**:
1. Track progress updates from barangay
2. Review actual outputs vs. planned outputs
3. Monitor completion percentages
4. Provide support as needed

**Progress Dashboard**:
- Shows all approved CPAPs
- Displays completion percentage
- Highlights delayed items
- Tracks overall implementation rate

**Notifications**:
- Barangay updates their CPAP
- Comments are added
- Milestones are reached

---

## 📈 Analytics & Reporting

### Dashboard Overview

**Key Metrics**:
- Total surveys collected
- Completion rate per barangay
- Average satisfaction scores
- Top performing barangays
- Areas needing improvement

### Interactive Map

**Features**:
- Click barangays to view details
- Color-coded by satisfaction level
- Award indicators for SGLGB awardees
- Cycle-aware data display

**Color Coding**:
- 🟢 Green: High satisfaction (80-100)
- 🟡 Yellow: Moderate satisfaction (60-79)
- 🟠 Orange: Low satisfaction (40-59)
- 🔴 Red: Very low satisfaction (0-39)


### Service Area Analysis

**Deep Dive Features**:
1. Navigate to **Analytics** → **Service Area Deep Dive**
2. Select a service area
3. View:
   - Average ratings across barangays
   - Top issues in this area
   - Trends over time
   - Comparison charts

**6 Service Areas**:
1. **Financial Administration**: Budget transparency, financial management
2. **Disaster Preparedness**: Emergency response, risk reduction
3. **Social Protection**: Health, education, social services
4. **Safety and Peace**: Crime prevention, conflict resolution
5. **Business-Friendly**: Permits, business support
6. **Environmental Management**: Waste management, environmental protection

### Demographics Analytics

**Insights Available**:
- Satisfaction by age group
- Satisfaction by gender
- Geographic patterns
- Population-based trends

### Exporting Data

**CSV Export**:
1. Navigate to desired report
2. Click **"Export to CSV"**
3. File downloads automatically
4. Open in Excel or Google Sheets

**Report Generation**:
1. Go to **Reports** → **Generate Report**
2. Select:
   - Report type
   - Date range
   - Barangays to include
3. Click **"Generate"**
4. Download PDF or Excel


---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Issue: Can't Login

**Symptoms**: Login fails, error message appears

**Solutions**:
1. Check username and password (case-sensitive)
2. Clear browser cache and cookies
3. Try a different browser
4. Contact admin to reset password
5. Verify account is active

#### Issue: Can't See CPAP Page

**Symptoms**: CPAP menu item missing or page shows error

**Solutions**:
1. Verify you have "Officer" or "Admin" role
2. Check that you're assigned to a barangay
3. Confirm survey target has been met
4. Ensure active survey cycle exists
5. Contact admin if issue persists

#### Issue: Changes Not Saving

**Symptoms**: Click save but data doesn't persist

**Solutions**:
1. Check internet connection
2. Look for error messages at top of page
3. Verify all required fields are filled
4. Try refreshing the page
5. Clear browser cache
6. Try a different browser

#### Issue: AI Suggestions Not Working

**Symptoms**: Button doesn't respond or no suggestions appear

**Solutions**:
1. Ensure survey data exists for your barangay
2. Check that report card has been generated
3. Refresh the page and try again
4. Clear browser cache
5. Contact admin if ML service is down


#### Issue: Notifications Not Showing

**Symptoms**: No badge appears despite new activity

**Solutions**:
1. Refresh the page
2. Check notification settings
3. Verify you have the correct role
4. Visit the CPAP page to mark as read
5. Clear browser cache

#### Issue: Offline Mode Not Working

**Symptoms**: Can't conduct surveys without internet

**Solutions**:
1. Ensure browser supports offline mode (Chrome, Firefox)
2. Allow storage permissions
3. Don't clear browser data
4. Sync when internet is available
5. Use latest browser version

#### Issue: Spreadsheet Slow or Laggy

**Symptoms**: Typing is delayed, scrolling is choppy

**Solutions**:
1. Close other browser tabs
2. Reduce number of rows (save and continue)
3. Clear browser cache
4. Use a faster device
5. Check internet speed

#### Issue: Deleted Row by Accident

**Symptoms**: Clicked trash icon and row disappeared

**Solutions**:
1. If not saved yet: Refresh page to restore
2. If already saved: Re-enter the data manually
3. Check if you have a backup or draft
4. Contact admin for database recovery (last resort)


### Browser Compatibility

**Recommended Browsers**:
- ✅ Google Chrome (latest)
- ✅ Mozilla Firefox (latest)
- ✅ Microsoft Edge (latest)
- ✅ Safari (latest)

**Not Recommended**:
- ❌ Internet Explorer (any version)
- ❌ Outdated browser versions

### Performance Tips

**For Best Experience**:
1. Use a modern browser (updated within last 6 months)
2. Clear cache regularly
3. Close unnecessary tabs
4. Ensure stable internet connection
5. Use desktop/laptop for CPAP creation (mobile for surveys)

### Getting Help

**Support Channels**:
1. **In-App Help**: Click "?" icon in navigation
2. **Documentation**: Review user guides in docs folder
3. **Admin Contact**: Reach out to your system administrator
4. **Technical Support**: Email support team
5. **Training**: Request training session

**When Reporting Issues**:
- Describe what you were trying to do
- Include error messages (screenshot if possible)
- Mention your browser and device
- Note when the issue started
- Provide your username (not password!)


---

## ❓ FAQs

### General Questions

**Q: What is PULSE?**
A: PULSE (Public Understanding and Local Service Evaluation) is a digital platform for collecting citizen feedback, evaluating service delivery, and creating data-driven action plans to improve local governance.

**Q: Who can use the system?**
A: Admins, Field Supervisors, Interviewers, Barangay Officials, and LGU Reviewers. Each role has specific permissions and access levels.

**Q: Is training required?**
A: Basic training is recommended. This user manual and in-app guides provide comprehensive instructions.

**Q: Can I use it on my phone?**
A: Yes! The system is responsive. Surveys work great on mobile. CPAP creation is better on desktop/laptop.

### Survey Questions

**Q: How many surveys do we need to collect?**
A: The target is set by the admin based on population size and desired margin of error. Typically 300-400 per barangay.

**Q: What if we can't reach the target?**
A: Contact your Field Supervisor or Admin. They may adjust the target or extend the deadline.

**Q: Can I edit a submitted survey?**
A: No, once submitted, surveys are locked. Review carefully before submitting.

**Q: What happens to offline surveys?**
A: They're saved on your device and automatically sync when internet is available.


### CPAP Questions

**Q: When can I start creating my CPAP?**
A: After your barangay's survey target is met and the report card is generated. You'll receive a notification.

**Q: How many action items should I include?**
A: Recommended 3-5 items per service area that needs improvement. Focus on priority issues from survey results.

**Q: Can I edit my CPAP after submission?**
A: No, it's locked after submission. If admin requests revisions, it will be unlocked for editing.

**Q: What if I need more time?**
A: Save your work as a draft. You can continue anytime. Just don't submit until ready.

**Q: Are AI suggestions mandatory?**
A: No, they're optional. You can create your CPAP entirely manually or use AI as a starting point.

**Q: How accurate are AI suggestions?**
A: AI provides recommendations based on your survey data, but you must review and verify all information. Edit as needed.

**Q: Can I delete AI suggestions?**
A: Yes, click the trash icon on any row or use "Clear All Suggestions" to remove all AI-generated rows.

**Q: What happens after my CPAP is approved?**
A: You can start implementation and track progress by updating the status and actual output columns.


### Technical Questions

**Q: Do I need to install anything?**
A: No, it's a web application. Just use your browser.

**Q: What if I lose internet connection?**
A: Interviewers can continue surveys in offline mode. CPAP editing requires internet.

**Q: Is my data secure?**
A: Yes, the system uses encryption and secure authentication. Only authorized users can access data.

**Q: Can I export my data?**
A: Yes, admins and authorized users can export reports to CSV or PDF.

**Q: How often is data backed up?**
A: Automatically backed up daily. Contact admin for specific backup policies.

### Comments & Notifications

**Q: Who can see my comments?**
A: Only users with access to that specific CPAP (barangay officer and admins/reviewers).

**Q: How do I know if I have new notifications?**
A: A red badge with a count appears next to your profile icon and relevant menu items.

**Q: Can I turn off notifications?**
A: Currently, notifications are system-wide. Contact admin for customization options.

**Q: How long do notifications stay?**
A: Until you visit the relevant page (e.g., CPAP page marks CPAP notifications as read).


---

## 📚 Additional Resources

### Documentation Files

Located in the `docs/` folder:

**For Users**:
- `CPAP_SPREADSHEET_USER_GUIDE.md` - Detailed CPAP guide
- `CPAP_VISUAL_GUIDE.md` - Visual design reference
- `CPAP_TESTING_CHECKLIST.md` - Testing guide
- `QUICK_REFERENCE.md` - Quick reference card

**For Developers**:
- `CPAP_SPREADSHEET_IMPLEMENTATION.md` - Technical details
- `CPAP_INTERFACE_REFERENCE.md` - Interface structure
- `ENTIRE SYSTEM WORKFLOW.md` - Complete system flow

**Feature Documentation**:
- `CPAP_COMMENTS_SYSTEM.md` - Comments feature
- `CPAP_NOTIFICATIONS_IMPLEMENTATION.md` - Notifications system
- `CPAP_AI_SUGGESTIONS_FEATURE.md` - AI features

### Quick Reference Card

See `QUICK_REFERENCE.md` for:
- Navigation map
- Keyboard shortcuts
- Common actions
- Status indicators
- File locations

### Video Tutorials

(To be added - contact admin for training materials)


---

## 📞 Contact & Support

### System Administrator

**For**:
- Account issues
- Permission problems
- System configuration
- Technical support

**Contact**: [Your Admin Contact Info]

### Training & Onboarding

**For**:
- New user training
- Refresher sessions
- Best practices
- Workflow guidance

**Contact**: [Training Coordinator Info]

### Technical Support

**For**:
- Bug reports
- Feature requests
- System errors
- Performance issues

**Email**: [Support Email]
**Hours**: [Support Hours]

### Feedback & Suggestions

We welcome your feedback to improve the system!

**Submit**:
- Feature requests
- Usability suggestions
- Documentation improvements
- General feedback

**Contact**: [Feedback Channel]

---

## 📝 Glossary

**CPAP**: Citizen Priority Action Plan - A structured document outlining actions to address community needs

**MOE**: Margin of Error - Statistical measure of survey accuracy

**SGLGB**: Seal of Good Local Governance for Barangays - Award for high-performing barangays

**Survey Cycle**: A defined period for data collection and analysis

**Spot**: A specific location within a barangay where surveys are conducted

**Kish Grid**: Statistical method for randomly selecting survey respondents

**Field Supervisor (FS)**: Person who coordinates data collection activities

**Service Area**: Category of government services (6 total: Financial, Disaster, Social, Safety, Business, Environmental)

**Report Card**: Summary of survey results showing satisfaction scores and priority issues

**Action Item**: Specific activity in a CPAP with defined outputs, timelines, and responsibilities

---

## 📄 Document Information

**Document Title**: PULSE System - Complete User Manual

**Version**: 1.0.0

**Last Updated**: December 28, 2025

**Prepared By**: PULSE Development Team

**For**: Municipal Local Governance Resource Centers (MLGRC) and Partner LGUs

**Status**: Official Release

---

## 🎓 Training Checklist

Use this checklist to track your training progress:

### Admin Training
- [ ] Create survey cycles
- [ ] Award barangays
- [ ] Set survey targets
- [ ] Assign supervisors
- [ ] Monitor progress
- [ ] Review CPAPs
- [ ] Generate reports

### Field Supervisor Training
- [ ] View assignments
- [ ] Create spots
- [ ] Assign interviewers
- [ ] Monitor data collection
- [ ] Review responses

### Interviewer Training
- [ ] View assignments
- [ ] Conduct surveys
- [ ] Use Kish Grid
- [ ] Submit responses
- [ ] Use offline mode

### Barangay Official Training
- [ ] View survey results
- [ ] Create CPAP
- [ ] Use spreadsheet interface
- [ ] Use AI suggestions
- [ ] Submit for review
- [ ] Use comments
- [ ] Track implementation

---

**End of User Manual**

For the latest version of this manual, check the `docs/` folder in the system repository.

For questions or clarifications, contact your system administrator.

**Built with ❤️ for better local governance in the Philippines**
