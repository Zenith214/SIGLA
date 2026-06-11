# PULSE System - Complete User Manual

> **Version:** 2.0 | **Last Updated:** January 7, 2026  
> **System:** Public Understanding and Local Service Evaluation

![PULSE Logo](https://img.shields.io/badge/PULSE-System-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

---

## 📖 Table of Contents

- [Introduction](#-introduction)
- [Getting Started](#-getting-started)
- [User Roles Overview](#-user-roles-overview)
- [Admin Guide](#-admin-guide)
- [Field Supervisor Guide](#-field-supervisor-guide)
- [Interviewer Guide](#-interviewer-guide)
- [Officer Guide](#-officer-guide)
- [Viewer Guide](#-viewer-guide)
- [Dashboard Features](#-dashboard-features)
- [CPAP System Guide](#-cpap-system-guide)
- [Analytics & Reporting](#-analytics--reporting)
- [Troubleshooting](#-troubleshooting)
- [FAQs](#-faqs)

---

## 🎯 Introduction

### What is PULSE?

**PULSE** (Public Understanding and Local Service Evaluation) is a comprehensive digital platform designed to help **Municipal Local Governance Resource Centers (MLGRC)** in the Philippines systematically:

- 📊 **Collect citizen feedback** on local government services through structured surveys
- 📈 **Evaluate service delivery effectiveness** across 6 key service areas
- 🏛️ **Improve barangay-level governance performance** with data-driven insights
- 📋 **Create data-driven action plans** (CPAP - Citizen Priority Action Plan)
- 🤖 **Track implementation progress** with ML-powered analytics and real-time monitoring

### Key Benefits

<details>
<summary>Click to expand benefits</summary>

| Benefit | Description |
|---------|-------------|
| **Evidence-Based Decision Making** | Use real survey data to prioritize governance actions |
| **Transparent Governance** | Track progress and accountability across all barangays |
| **Community Engagement** | Involve citizens directly in governance improvement |
| **Efficient Monitoring** | Real-time dashboards with interactive maps and progress tracking |
| **AI-Powered Insights** | Get intelligent recommendations and automated satisfaction scoring |
| **Interactive Visualizations** | Hover and click to explore barangay data instantly |
| **Role-Based Access** | Customized experience for each user type with appropriate permissions |

</details>

### System Architecture

```javascript
// Technology Stack
const pulseStack = {
  frontend: "Next.js 16, React 19, TypeScript, Tailwind CSS",
  backend: "PostgreSQL with Prisma ORM",
  authentication: "JWT-based with role-based access control",
  maps: "Interactive SVG maps with Leaflet.js",
  mlAnalytics: "Python-based machine learning service",
  deployment: "Cloud-hosted with Railway PostgreSQL"
};
```

---

## 🚀 Getting Started

### System Requirements

| Requirement | Specification |
|-------------|---------------|
| **Web Browser** | Chrome, Firefox, Safari, or Edge (latest versions) |
| **Internet Connection** | Required for online features and data synchronization |
| **Offline Support** | Available for survey data collection (interviewers only) |
| **Mobile Devices** | Fully responsive design works on tablets and smartphones |
| **Screen Resolution** | Minimum 1024x768 recommended for optimal experience |

### Accessing the System

1. **Open your web browser**
2. **Navigate to**: Your organization's PULSE URL  
   Example: `https://mlgrc-pulse.up.railway.app/`
3. **Login** with your assigned credentials (email and password)
4. **Dashboard** loads automatically based on your role

### First-Time Login

> 💡 **Tip**: Change your password immediately after first login for security

- [ ] Enter your **email address** and **password** provided by your administrator
- [ ] You may be prompted to **change your password** for security
- [ ] Review the **welcome guide** if displayed
- [ ] Familiarize yourself with the **navigation menu** and available features
- [ ] Check the **active survey cycle** displayed in the header

### Navigation Overview


- **Header Bar**: Shows current time, active survey cycle, and user menu
- **Main Dashboard**: Interactive map or list view of barangays
- **Settings** (Admin only): System configuration and management
- **Profile**: View and update your personal information
- **Logout**: Securely end your session

---

## 👥 User Roles Overview

### Role Hierarchy

PULSE has **six distinct user roles**, each with specific permissions and responsibilities:

| Role | Primary Function | Access Level | Key Capabilities |
|------|-----------------|--------------|------------------|
| 🔑 **Admin** | System setup, cycle management, overall monitoring | Full system access | Create cycles, manage users, assign supervisors, review CPAPs, view all data |
| 💻 **Developer** | System development and testing | Full system access | Same as Admin for testing and development purposes |
| 👷 **Field Supervisor (FS)** | Survey coordination, interviewer management | Assigned barangays | Create spots, assign interviewers, monitor progress, view dashboard |
| 📝 **Interviewer** | Data collection, survey submission | Assigned spots | Conduct surveys, submit responses, offline mode support |
| 🏛️ **Officer** | CPAP creation, action planning, implementation | Own barangay | View survey results, create/edit/submit CPAP, track implementation |
| 👁️ **Viewer** | View-only access to dashboards and analytics | Read-only access | View dashboard, analytics, report cards (no editing) |

### Permission Matrix

| Feature | Admin | Developer | FS | Interviewer | Officer | Viewer |
|---------|:-----:|:---------:|:--:|:-----------:|:-------:|:------:| 
| View Dashboard | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Create Survey Cycles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Barangays | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Supervisors | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Spots | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Interviewers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Conduct Surveys | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Create CPAP | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Submit CPAP | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Review/Approve CPAP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔧 Admin Guide

### Overview

Administrators have **full system access** and are responsible for:

- ⚙️ Setting up and managing survey cycles
- 🏘️ Managing barangays and their information
- 👤 Creating and managing user accounts
- 📍 Assigning Field Supervisors to barangays
- 🎯 Setting survey targets
- ✅ Reviewing and approving CPAPs
- 📊 Monitoring overall system performance


### Accessing Admin Settings

1. Click your **user menu** in the top-right corner
2. Select **Settings** from the dropdown
3. The Admin Settings panel opens with a sidebar menu

### Admin Settings Sections

#### 1. Survey Cycles Management

**Purpose**: Create and manage survey campaigns with specific timeframes.

**How to Create a Survey Cycle**:

1. Navigate to **Settings** → **Survey Cycles**
2. Click **Create New Cycle** button
3. Fill in the form:
   - **Cycle Name**: e.g., "2026 Citizen Satisfaction Survey"
   - **Year**: Select the year (e.g., 2026)
   - **Start Date**: When data collection begins
   - **End Date**: When data collection ends
4. Click **Save** to create the cycle
5. Click **Set as Active** to make it the current cycle

> ⚠️ **Important Notes**:
> - Only **one cycle can be active** at a time
> - All survey responses are linked to the active cycle
> - Historical data remains accessible by selecting previous cycles
> - Deleting a cycle will cascade delete all related data (use with caution)

#### 2. Barangay Management

**Purpose**: Manage barangay information, demographics, and status.

**How to Add a Barangay**:

1. Navigate to **Settings** → **Barangays**
2. Click **Add Barangay** button
3. Fill in the form:
   - **Barangay Name**: Official name
   - **Population**: Total population count
   - **Households**: Number of households
   - **Barangay Captain**: Name of the captain
   - **Description**: Optional details
   - **Status**: Active/Inactive
4. Upload **Barangay Logo/Seal** (optional)
5. Click **Save**

**How to Edit Barangay Information**:

1. Find the barangay in the list
2. Click the **Edit** button
3. Update the information
4. Click **Save Changes**

**Managing SGLGB Awardee Status**:
- Use the **Award Management** section to mark barangays as SGLGB awardees per cycle
- Award indicators appear on the dashboard map


#### 3. Award Management

**Purpose**: Track SGLGB (Seal of Good Local Governance for Barangays) awardees per cycle.

**How to Mark a Barangay as Awardee**:

1. Navigate to **Settings** → **Award Management**
2. Select the **Survey Cycle**
3. Click **Add Award** button
4. Select the **Barangay**
5. Enter **Award Date** (optional)
6. Add **Notes** (optional)
7. Click **Save**

**Viewing Award History**:
- Awards are cycle-specific
- Historical awards remain visible when viewing past cycles
- Award badges appear on the dashboard map

#### 4. Survey Targets

**Purpose**: Set target number of respondents per barangay for each cycle.

**How to Set Survey Targets**:

1. Navigate to **Settings** → **Survey Targets**
2. Click **Bulk Create Targets** for all barangays
3. Or click **Add Target** for individual barangays
4. Fill in:
   - **Barangay**: Select from dropdown
   - **Survey Cycle**: Select active or specific cycle
   - **Target**: Number of respondents needed
5. Click **Save**

**Monitoring Target Achievement**:
- The system automatically calculates **Margin of Error (MOE)**
- **Achievement percentage** updates in real-time as surveys are submitted
- View progress on the dashboard

#### 5. Users & Roles Management

**Purpose**: Create and manage user accounts with role assignments.

**How to Create a User**:

1. Navigate to **Settings** → **Users & Roles**
2. Click **Add User** button
3. Fill in the form:
   - **First Name** and **Last Name**
   - **Email**: Used for login
   - **Password**: Initial password (user can change later)
   - **Phone**: Contact number
   - **Organization**: User's organization
   - **Job Title**: User's position
   - **Role**: Select from dropdown (Admin, FS, Interviewer, Officer, Viewer, Developer)
   - **Barangay Designation** (for Officers only): Assign their barangay
4. Click **Save**


**User Roles Explained**:

| Role | Description |
|------|-------------|
| **Admin** | Full system access |
| **Developer** | Full access for testing |
| **Field Supervisor (FS)** | Manages survey spots and interviewers |
| **Interviewer** | Conducts surveys in the field |
| **Officer** | Creates and manages CPAP for their barangay |
| **Viewer** | Read-only access to dashboards |

**How to Edit User Information**:

1. Find the user in the list
2. Click **Edit** button
3. Update information (cannot change email)
4. Click **Save Changes**

**How to Deactivate a User**:

1. Find the user in the list
2. Change **Status** to "Inactive"
3. User will no longer be able to log in

#### 6. Supervisor Assignments

**Purpose**: Assign Field Supervisors to specific barangays for survey coordination.

**How to Assign a Supervisor**:

1. Navigate to **Settings** → **Supervisor Assignments**
2. Click **Create Assignment** button
3. Select:
   - **Field Supervisor**: Choose from users with FS role
   - **Barangay**: Select barangay to assign
   - **Survey Cycle**: Select active or specific cycle
4. Click **Save**

> 📌 **Important Notes**:
> - One FS can manage **multiple barangays**
> - One barangay can have **multiple FSs** assigned
> - FSs can only see and manage their assigned barangays
> - FSs gain ability to create spots and assign interviewers

#### 7. Backup & Data Export

**Purpose**: Export data for backup, analysis, or reporting.

**How to Export Data**:

1. Navigate to **Settings** → **Backup**
2. Select **Data Type** to export:
   - Survey Responses
   - Barangays
   - Users
   - CPAPs
   - All Data
3. Select **Survey Cycle** (if applicable)
4. Click **Export to CSV**
5. File downloads automatically

**Backup Best Practices**:

- ✅ Export data regularly (weekly recommended)
- ✅ Store backups in secure location
- ✅ Test restore procedures periodically
- ✅ Export before major system changes


### CPAP Review & Approval (Admin)

**Purpose**: Review and approve Citizen Priority Action Plans submitted by Officers.

**How to Access CPAP Review**:

1. Navigate to **Admin** → **CPAP Review** (or `/admin/cpap`)
2. View list of all CPAPs across all barangays

**CPAP Status Workflow**:

```
Draft → Submitted → Approved
           ↓
    Revision Requested
```

| Status | Description |
|--------|-------------|
| **Draft** | Officer is still working on it |
| **Submitted** | Ready for admin review |
| **Approved** | Admin has approved the plan |
| **Revision Requested** | Admin requested changes |

**How to Review a CPAP**:

1. Click on a CPAP with **Submitted** status
2. Review all action items in the spreadsheet
3. Check for:
   - ✅ Clear and measurable target outputs
   - ✅ Realistic timelines
   - ✅ Appropriate responsible persons
   - ✅ Adequate financial requirements
4. Add **Admin Comments** if needed
5. Choose action:
   - **Approve**: Click "Approve CPAP" button
   - **Request Revision**: Click "Request Revision" and provide feedback

**Adding Comments**:

1. Scroll to the **Comments** section
2. Type your feedback or questions
3. Click **Add Comment**
4. Officer will receive notification

**Filtering CPAPs**:

- Filter by **Status**: All, Draft, Submitted, Approved, Revision Requested
- Filter by **Cycle**: Select specific survey cycle
- Filter by **Barangay**: Select specific barangay
- **Search**: Search by barangay name or keywords

### Admin Dashboard Monitoring

**Key Metrics to Monitor**:

1. 📊 **Survey Progress**: Overall completion percentage across all barangays
2. 📈 **Response Count**: Total surveys submitted
3. 🎯 **Target Achievement**: Percentage of targets met
4. 📋 **CPAP Status**: Number of CPAPs in each status
5. 👥 **User Activity**: Last login times and active users

**Accessing Dashboard**:

1. Click **Back to Dashboard** from Settings
2. View interactive map or list view
3. Click on barangays to see detailed information

---


## 👷 Field Supervisor Guide

### Overview

Field Supervisors (FS) coordinate survey data collection in assigned barangays by:

- 📍 Creating survey spots (specific collection locations)
- 👥 Assigning interviewers to spots
- 📊 Monitoring survey progress
- ✅ Ensuring data quality
- 📈 Managing interviewer performance

### Accessing Your Dashboard

1. Log in with your FS credentials
2. Dashboard loads showing **only your assigned barangays**
3. View survey progress and targets

### Creating Survey Spots

**What is a Spot?**

A spot is a specific geographic location within a barangay where survey data collection occurs. Each spot has:

- 🏷️ A unique name/identifier
- 📍 GPS coordinates (optional)
- 🎯 Target number of respondents
- 👤 Assigned interviewer(s)

**How to Create a Spot**:

1. Navigate to **Settings** → **Spots** (or use FS Dashboard)
2. Click **Create Spot** button
3. Fill in the form:
   - **Spot Name**: e.g., "Purok 1 - Main Road"
   - **Barangay**: Select from your assigned barangays
   - **Survey Cycle**: Select active cycle
   - **Starting Point**: GPS coordinates (optional)
   - **Random Start Number**: 1-999 (for systematic sampling)
   - **Target Respondents**: Number of surveys needed
4. Click **Save**

**Best Practices for Spot Creation**:

- ✅ Create spots that cover the entire barangay geographically
- ✅ Distribute targets evenly across spots
- ✅ Use clear, descriptive spot names
- ✅ Consider population density when setting targets

### Assigning Interviewers to Spots

**How to Assign an Interviewer**:

1. Navigate to the **Spots** section
2. Find the spot you want to assign
3. Click **Assign Interviewer** button
4. Select:
   - **Interviewer**: Choose from users with Interviewer role
   - **Quota**: Number of surveys they should complete
5. Click **Save**

> 💡 **Important Notes**:
> - One spot can have **multiple interviewers** assigned
> - One interviewer can work on **multiple spots**
> - Interviewers can only see their assigned spots
> - Quotas help distribute workload evenly


### Monitoring Survey Progress

**Viewing Progress**:

1. Access your **FS Dashboard**
2. View progress for each assigned barangay:
   - **Total Target**: Number of surveys needed
   - **Completed**: Number of surveys submitted
   - **Percentage**: Completion rate
   - **Remaining**: Surveys still needed

**Spot-Level Monitoring**:

1. Navigate to **Spots** section
2. View each spot's progress:
   - Assigned interviewers
   - Surveys completed per interviewer
   - Spot completion percentage
3. Identify spots falling behind schedule

**Interviewer Performance**:

- Track individual interviewer productivity
- View surveys submitted per day
- Identify interviewers needing support

### Data Quality Checks

**Reviewing Submitted Surveys**:

1. Access survey responses for your barangays
2. Check for:
   - ✅ Complete responses (all required fields filled)
   - ✅ Consistent answers (no contradictions)
   - ✅ Valid GPS coordinates
   - ✅ Reasonable completion times
3. Flag suspicious responses for review

**Handling Issues**:

- Contact interviewers about incomplete surveys
- Request re-surveys if data quality is poor
- Report systematic issues to Admin

---

## 📝 Interviewer Guide

### Overview

Interviewers are responsible for:

- 🗣️ Conducting face-to-face surveys with citizens
- 🎲 Using the Kish Grid method for respondent selection
- ✍️ Collecting accurate and complete data
- 📍 Geotagging survey locations
- 📤 Submitting surveys (online or offline)

### Accessing Your Assignments

1. Log in with your Interviewer credentials
2. Navigate to **Survey** page (or `/survey`)
3. View your assigned spots in the **My Spots** tab
4. Click on a spot to start surveying

### Understanding the Survey Interface

**Survey Dashboard Tabs**:

- **Overall Progress**: View all barangay targets (read-only)
- **My Spots**: Your assigned survey locations
- **My Assignments** (Legacy): Old assignment system (if applicable)

**Spot Information**:

- **Spot Name**: Location identifier
- **Barangay**: Which barangay this spot is in
- **Target**: Number of surveys you need to complete
- **Completed**: Number you've already submitted
- **Progress**: Percentage complete


### Conducting a Survey

#### Step 1: Select Spot and Start Survey

1. Click on your assigned **Spot**
2. Click **Start New Survey** button
3. Survey form opens

#### Step 2: Household Selection (Kish Grid)

**What is Kish Grid?**

The Kish Grid is a statistical method for randomly selecting one respondent from a household to ensure unbiased sampling.

**How to Use Kish Grid**:

1. Ask: *"How many people aged 18 and above live in this household?"*
2. Enter the number in the system
3. List all eligible household members by age (oldest to youngest)
4. The system will automatically select one person using the Kish Grid algorithm
5. Interview **only the selected person**

> ⚠️ **Important**: Do not substitute the selected respondent. If they're unavailable, schedule a callback.

#### Step 3: Complete Survey Sections

The survey has **6 main service areas**:

1. **💰 Financial Administration**
   - Barangay projects and programs
   - Financial transparency
   - Social assistance programs
   - Anti-corruption measures

2. **🌪️ Disaster Preparedness**
   - Disaster information dissemination
   - Evacuation centers
   - Emergency response

3. **🏥 Social Protection**
   - Health services
   - Women and children protection
   - Community participation
   - Senior citizen programs

4. **🛡️ Safety and Peace**
   - Peace and order programs
   - Crime prevention
   - Conflict resolution

5. **💼 Business-Friendly**
   - Business permits and licensing
   - Business support programs
   - Market facilities

6. **🌱 Environmental Management**
   - Waste management
   - Environmental programs
   - Green spaces

**Survey Question Types**:

| Type | Question | Response |
|------|----------|----------|
| **Awareness** | "Are you aware of [service]?" | Yes/No |
| **Availment** | "Have you used/accessed [service]?" | Yes/No |
| **Satisfaction** | "How satisfied are you?" | 1-5 scale |
| **Need for Action** | "Does this need improvement?" | Yes/No |
| **Suggestions** | Open-ended feedback | Text |


**Conditional Logic**:

- If respondent is **not aware** of a service, skip availment and satisfaction questions
- If respondent **has not used** a service, skip satisfaction questions
- Follow the system's automatic skip patterns

#### Step 4: Geotagging

**Why Geotagging?**

GPS coordinates verify that surveys were conducted in the correct location and help with spatial analysis.

**How to Geotag**:

1. When prompted, click **Get Current Location**
2. Allow browser to access your location
3. System captures:
   - Latitude and Longitude
   - Accuracy (in meters)
   - Address (reverse geocoded)
4. Verify the location is correct
5. If GPS is unavailable, you can manually enter coordinates

**Best Practices**:

- ✅ Ensure GPS is enabled on your device
- ✅ Conduct surveys outdoors when possible for better GPS signal
- ✅ Wait for accuracy to be under 20 meters if possible
- ✅ Note any location issues in survey remarks

#### Step 5: Review and Submit

1. Review all answers for completeness
2. Check for any missing required fields (marked with *)
3. Add any **Remarks** or notes about the survey
4. Choose submission option:
   - **Save as Draft**: Save progress and continue later
   - **Submit**: Complete and submit the survey

### Offline Mode

**When to Use Offline Mode**:

- 📶 Poor or no internet connection
- 🏔️ Remote areas with limited connectivity
- 💾 To save mobile data

**How Offline Mode Works**:

1. Surveys are saved locally in your browser
2. An **Offline Indicator** appears when disconnected
3. Continue conducting surveys normally
4. When connection is restored, surveys **auto-sync** to the server
5. You'll see a notification when sync is complete

> ⚠️ **Important Notes**:
> - Do not clear browser cache while offline (you'll lose data)
> - Sync as soon as possible when connection is available
> - Check for successful sync before closing browser
> - Offline surveys show a "pending sync" indicator

### Managing Your Workload

**Tracking Your Progress**:

1. View your **My Spots** tab regularly
2. Monitor completion percentage for each spot
3. Prioritize spots with lower completion rates
4. Plan daily targets to meet deadlines

**Time Management Tips**:

- 🎯 Aim for 8-12 surveys per day (depending on complexity)
- ⏱️ Each survey takes approximately 20-30 minutes
- 📅 Schedule callbacks for unavailable respondents
- 🕐 Work during hours when residents are home (evenings/weekends)

---


## 🏛️ Officer Guide

### Overview

Officers (typically Barangay Officials or LGU staff) are responsible for:

- 📊 Viewing survey results for their designated barangay
- 📈 Analyzing citizen feedback and satisfaction scores
- 📋 Creating Citizen Priority Action Plans (CPAP)
- 📍 Tracking implementation progress
- 💬 Responding to admin feedback

### Accessing Your Dashboard

1. Log in with your Officer credentials
2. Dashboard automatically loads with **your designated barangay selected**
3. View survey results and satisfaction index

**Dashboard Views**:

- **Map View**: Interactive map showing your barangay highlighted
- **List View**: Mobile-optimized list of barangays (yours at top)

### Understanding Survey Results

#### Satisfaction Index

**What is the Satisfaction Index?**

A composite score (0-100) representing overall citizen satisfaction with barangay services, calculated using ML algorithms.

**Score Interpretation**:

| Score Range | Rating | Description |
|-------------|--------|-------------|
| 80-100 | 🟢 **Excellent** | Citizens are highly satisfied |
| 60-79 | 🟡 **Good** | Generally positive feedback |
| 40-59 | 🟠 **Fair** | Room for improvement |
| 20-39 | 🔴 **Poor** | Significant issues identified |
| 0-19 | ⚫ **Critical** | Urgent action needed |

#### Service Area Ratings

View detailed ratings for each of the 6 service areas:

<details>
<summary>1. Financial Administration (Score: 0-100)</summary>

- Projects and programs effectiveness
- Financial transparency
- Social assistance programs
- Anti-corruption measures

</details>

<details>
<summary>2. Disaster Preparedness (Score: 0-100)</summary>

- Information dissemination
- Evacuation center quality
- Emergency response

</details>

<details>
<summary>3. Social Protection (Score: 0-100)</summary>

- Health services accessibility
- Protection services
- Community participation
- Senior citizen support

</details>

<details>
<summary>4. Safety and Peace (Score: 0-100)</summary>

- Peace and order programs
- Crime prevention
- Conflict resolution

</details>

<details>
<summary>5. Business-Friendly (Score: 0-100)</summary>

- Business permit processing
- Business support programs
- Market facilities

</details>

<details>
<summary>6. Environmental Management (Score: 0-100)</summary>

- Waste management
- Environmental programs
- Green spaces maintenance

</details>


### Viewing the Report Card

**How to Access Report Card**:

1. From Dashboard, click on your barangay
2. Click **View Report Card** button
3. Comprehensive report opens

**Report Card Sections**:

1. **📄 Executive Summary** (AI-Generated)
   - Overall assessment of barangay performance
   - Key findings and insights
   - Critical issues identified
   - Available in 3 languages: **Bisaya**, **Filipino**, **English**

2. **📊 Service Area Performance**
   - Detailed scores for each service area
   - Funnel analysis (Awareness → Availment → Satisfaction)
   - Need for Action percentages

3. **👥 Demographics Breakdown**
   - Response distribution by age, gender, occupation
   - Population-based insights

4. **💬 Community Voice**
   - Top citizen suggestions and feedback
   - Common concerns and requests
   - Verbatim quotes from respondents

5. **🏛️ Governance Integrity Snapshot**
   - Transparency metrics
   - Accountability indicators
   - Citizen trust levels

### Creating a CPAP (Citizen Priority Action Plan)

**What is a CPAP?**

A CPAP is a data-driven action plan that addresses citizen priorities identified through survey results. It's a structured spreadsheet with **13 columns** tracking actions from planning to implementation.

**When to Create a CPAP**:

- ✅ After survey data collection is complete (100% progress)
- ✅ When executive summary and report card are available
- ✅ Before the DILG review deadline

**How to Access CPAP**:

1. Navigate to **CPAP** page (or `/cpap`)
2. System automatically loads your barangay's CPAP
3. If no CPAP exists, one is created automatically

#### CPAP Spreadsheet Structure

The CPAP has **13 columns**:

| # | Column Name | Description | Required |
|---|-------------|-------------|----------|
| 1 | **Results/Observations** | What the survey data shows | No |
| 2 | **Plan of Action** | High-level strategy to address the issue | No |
| 3 | **Activity** | Specific activities to implement | No |
| 4 | **Output** | Expected deliverable or outcome | **Yes** ⭐ |
| 5 | **Actual Output** | What was actually achieved (filled during implementation) | No |
| 6 | **Status of Accomplishment** | Current status (Ongoing/Delayed/Completed) | No |
| 7 | **Implementation Schedule** | Timeline for completion | No |
| 8 | **Actual Date** | When actually completed | No |
| 9 | **Financial Requirements** | Budget needed | No |
| 10 | **Responsible Person/Office** | Who will implement | No |
| 11 | **Committed/To be Committed** | Funding status | No |
| 12 | **Means of Verification** | How to verify completion | No |
| 13 | **Actions** | Edit/Delete buttons | N/A |


**Service Areas for Action Items**:

Each action item must be categorized under one of the 6 service areas:

- 💰 Financial Administration
- 🌪️ Disaster Preparedness
- 🏥 Social Protection
- 🛡️ Safety and Peace
- 💼 Business-Friendly
- 🌱 Environmental Management

#### How to Add Action Items

**Method 1: Manual Entry**

1. Click **Add Item** button
2. Select **Service Area** from dropdown
3. Fill in all required fields (marked with *)
4. Click **Save**

**Method 2: AI-Powered Suggestions** 🤖

1. Click **Get AI Suggestions** button
2. System analyzes your survey data
3. AI generates suggested action items based on:
   - Low satisfaction scores
   - High need-for-action percentages
   - Common citizen complaints
   - Critical issues identified
4. Review suggestions organized by timeframe:
   - **Short-term** (0-6 months)
   - **Medium-term** (6-12 months)
   - **Long-term** (12+ months)
5. Click **Add to CPAP** on suggestions you want to include
6. Edit as needed before saving

**Best Practices for Action Items**:

- ✅ Be specific and measurable in outputs
- ✅ Set realistic timelines
- ✅ Assign clear responsibility
- ✅ Include budget estimates
- ✅ Prioritize high-impact, low-cost actions
- ✅ Address critical issues first

#### CPAP Status Workflow

```
Draft → Submitted → Approved
           ↓
    Revision Requested → Draft
```

**1. Draft Status**:
- Initial state when CPAP is created
- You can add, edit, and delete items freely
- Auto-saves as you work
- Not visible to admin yet

**2. Submitting for Review**:
- Click **Submit for Review** button
- Confirm submission in modal dialog
- Status changes to **Submitted**
- Admin receives notification
- You can no longer edit items

**3. Under Admin Review**:
- Admin reviews your CPAP
- Admin may add comments or questions
- You'll receive notifications for new comments

**4. Approved Status**:
- Admin approves your CPAP
- You can now update implementation progress
- Fill in "Actual Output" and "Status of Accomplishment"
- Track completion

**5. Revision Requested**:
- Admin requests changes
- Status returns to **Draft**
- Review admin comments
- Make necessary revisions
- Resubmit when ready


#### Using the Comments System

**Viewing Comments**:

1. Click **Comments** button (shows notification badge if unread)
2. Comments sidebar opens
3. View all comments with timestamps

**Adding Comments**:

1. Type your comment in the text box
2. Click **Add Comment**
3. Admin receives notification

**Responding to Admin Feedback**:

1. Read admin comments carefully
2. Make requested changes to action items
3. Reply to comments explaining changes
4. Resubmit CPAP when revisions are complete

### Tracking Implementation Progress

**After CPAP Approval**:

1. CPAP status changes to **Approved**
2. You can now update progress fields:
   - **Actual Output**: What was actually delivered
   - **Status of Accomplishment**: Ongoing/Delayed/Completed
   - **Actual Date**: When completed
3. Update regularly (monthly recommended)
4. Admin can monitor your progress

**Progress Indicators**:

| Status | Description |
|--------|-------------|
| 🟢 **Ongoing** | Work is in progress on schedule |
| 🟡 **Delayed** | Behind schedule, needs attention |
| ✅ **Completed** | Finished and verified |

---

## 👁️ Viewer Guide

### Overview

Viewers have **read-only access** to:

- 🗺️ Dashboard (map and list views)
- 📊 Analytics and reports
- 📄 Report cards
- 📋 Survey data (no editing)

**What Viewers CANNOT Do**:

- ❌ Create or edit any data
- ❌ Submit surveys
- ❌ Create CPAPs
- ❌ Approve or modify anything
- ❌ Access admin settings

### Accessing the Dashboard

1. Log in with your Viewer credentials
2. Dashboard loads with interactive map
3. View all barangays and their data

### Using the Interactive Map

**Hover Preview**:

1. Hover your mouse over any barangay on the map
2. Instant preview shows:
   - Barangay name
   - Satisfaction index
   - Survey progress
   - Award status (if SGLGB awardee)

**Click to Lock**:

1. Click on a barangay to "lock" the selection
2. Detailed side panel opens showing:
   - Full barangay information
   - Service area scores
   - Survey targets and achievement
   - Historical performance (if available)
3. Click **View Report Card** to see full report
4. Click elsewhere or close button to unlock

**View Toggle**:

- Switch between **Map View** and **List View**
- List View is mobile-optimized
- Both views show the same data


### Viewing Analytics

**Accessing Analytics**:

1. Click **Analytics** tab on dashboard
2. Or navigate to `/analytics`

**Available Analytics**:

1. **📊 Dashboard Summary**
   - Overall KPIs
   - Leaderboards (top/bottom performers)
   - Trend analysis

2. **🔍 Service Area Deep Dive**
   - Detailed analysis per service area
   - Barangay rankings
   - Funnel metrics (Awareness → Availment → Satisfaction)

3. **👥 Demographics Analytics**
   - Response distribution by age, gender, occupation
   - Population-based insights
   - Demographic patterns

4. **🏆 Award Leaderboard**
   - SGLGB awardee tracking
   - Historical award data

### Exporting Data

**How to Export**:

1. Navigate to the analytics or report you want to export
2. Click **Export to CSV** button
3. File downloads automatically
4. Open in Excel or other spreadsheet software

**Available Exports**:

- Survey responses (detailed)
- Barangay performance summary
- Service area scores
- Demographics data

---

## 📊 Dashboard Features

### Interactive SVG Map

**Features**:

- **Color-coded barangays** by satisfaction index:
  - 🟢 Green: High satisfaction (80-100)
  - 🟡 Yellow: Medium satisfaction (60-79)
  - 🟠 Orange: Low satisfaction (40-59)
  - 🔴 Red: Critical (0-39)
- **Award badges** for SGLGB awardees
- **Hover preview** for quick data
- **Click-to-lock** for detailed view
- **Zoom and pan** capabilities

### Barangay Details Panel

**Information Displayed**:

- Barangay name and logo
- Population and households
- Barangay captain
- Overall satisfaction index
- Service area scores (6 areas)
- Survey progress and targets
- Award status
- Historical data (if available)

### Cycle Selector

**Viewing Historical Data**:

1. Click on the **Cycle Selector** in the header
2. Select a previous survey cycle
3. Dashboard updates to show historical data
4. Compare performance across cycles

### List View (Mobile-Optimized)

**Features**:

- Card-based layout for each barangay
- Shows key metrics at a glance
- Sortable and filterable
- Touch-friendly for mobile devices
- Click card to view details

**Filtering Options**:

- By satisfaction score range
- By survey progress
- By award status
- By service area performance

---


## 📋 CPAP System Guide

### CPAP Overview

**Purpose**: Create data-driven action plans based on citizen feedback to improve barangay governance.

**Key Components**:

1. **13-Column Spreadsheet**: Structured planning and tracking
2. **6 Service Areas**: Categorized action items
3. **AI Suggestions**: ML-powered recommendations
4. **Comments System**: Admin-officer communication
5. **Status Workflow**: Draft → Submitted → Approved
6. **Progress Tracking**: Implementation monitoring

### CPAP Spreadsheet Columns Explained

| Column | Purpose | When to Fill | Required |
|--------|---------|--------------|----------|
| Results/Observations | What survey data shows | Planning | No |
| Plan of Action | Strategy to address issue | Planning | No |
| Activity | Specific activities | Planning | No |
| **Output** | **Expected deliverable** | **Planning** | **Yes** ⭐ |
| Actual Output | What was achieved | Implementation | No |
| Status of Accomplishment | Current status | Implementation | No |
| Implementation Schedule | Timeline | Planning | No |
| Actual Date | Completion date | Implementation | No |
| Financial Requirements | Budget needed | Planning | No |
| Responsible Person/Office | Who implements | Planning | No |
| Committed/To be Committed | Funding status | Planning | No |
| Means of Verification | How to verify | Planning | No |
| Actions | Edit/Delete | Always | N/A |

### AI-Powered Suggestions

**How AI Suggestions Work**:

```python
def generate_cpap_suggestions(survey_data):
    # System analyzes your barangay's survey data
    analysis = {
        "low_satisfaction": identify_low_scores(survey_data),
        "high_need_for_action": calculate_nfa_percentages(survey_data),
        "common_complaints": extract_citizen_feedback(survey_data),
        "critical_issues": prioritize_urgent_matters(survey_data)
    }
    
    # Generates specific, actionable recommendations
    suggestions = create_recommendations(analysis)
    
    # Organizes by timeframe
    return categorize_by_timeline(suggestions)
```

**Using AI Suggestions**:

1. Click **Get AI Suggestions** button
2. Review generated suggestions
3. Select relevant items
4. Click **Add to CPAP**
5. Customize as needed
6. Save to your CPAP

**Benefits**:

- ⏱️ Saves time in planning
- 📊 Ensures data-driven priorities
- 🎯 Provides specific, measurable outputs
- 📅 Suggests realistic timelines


### CPAP Best Practices

**Planning Phase**:

- [ ] Review report card thoroughly before creating CPAP
- [ ] Prioritize critical issues first
- [ ] Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- [ ] Involve stakeholders in planning
- [ ] Ensure budget alignment

**Implementation Phase**:

- [ ] Update progress regularly (monthly)
- [ ] Document actual outputs with evidence
- [ ] Report delays promptly with reasons
- [ ] Adjust timelines if needed (with admin approval)
- [ ] Maintain means of verification

**Reporting Phase**:

- [ ] Provide clear, concise updates
- [ ] Use photos/documents as evidence
- [ ] Respond to admin comments promptly
- [ ] Be transparent about challenges
- [ ] Celebrate successes

---

## 📈 Analytics & Reporting

### Dashboard Summary

**Key Performance Indicators (KPIs)**:

| KPI | Description |
|-----|-------------|
| 📊 **Overall Satisfaction Index** | Average across all barangays |
| 📝 **Total Responses** | Number of surveys completed |
| 🎯 **Target Achievement** | Percentage of targets met |
| 📈 **Survey Progress** | Overall completion rate |
| 🏘️ **Active Barangays** | Number with ongoing surveys |

**Leaderboards**:

- 🥇 **Top Performers**: Barangays with highest satisfaction
- 📈 **Most Improved**: Biggest increase from previous cycle
- ⚠️ **Needs Attention**: Lowest satisfaction scores

**Trend Analysis**:

- Satisfaction trends over time
- Service area performance trends
- Response rate trends

### Service Area Deep Dive

**Available for Each Service Area**:

1. **Overall Score**: Average satisfaction (0-100)
2. **Barangay Rankings**: Sorted by performance
3. **Funnel Analysis**:
   - **Awareness**: % of citizens aware of services
   - **Availment**: % who used services (of those aware)
   - **Satisfaction**: % satisfied (of those who used)
4. **Need for Action**: % saying improvement needed
5. **Common Issues**: Top citizen complaints
6. **Recommendations**: Suggested improvements

**Interpreting Funnel Metrics**:

| Pattern | Interpretation | Action Needed |
|---------|----------------|---------------|
| High Awareness, Low Availment | Services exist but not accessible | Improve accessibility |
| High Availment, Low Satisfaction | Services used but poor quality | Enhance service quality |
| Low Awareness | Citizens don't know about services | Better information dissemination |


### Demographics Analytics

**Available Breakdowns**:

**1. Age Distribution**:
- 18-30 years
- 31-45 years
- 46-60 years
- 61+ years

**2. Gender Distribution**:
- Male
- Female
- Other/Prefer not to say

**3. Occupation Categories**:
- Employed
- Self-employed
- Unemployed
- Student
- Retired
- Homemaker

**Insights Available**:

- Satisfaction by demographic group
- Service usage patterns by age/gender
- Priority issues by occupation
- Response distribution

### Report Card

**Comprehensive Barangay Report Including**:

**1. 📄 Executive Summary** (AI-Generated)
- Overall assessment
- Key findings (top 5)
- Critical issues (top 3)
- Strategic recommendations
- Available in 3 languages: **Bisaya** | **Filipino** | **English**

**2. 📊 Satisfaction Index**
- Overall score with interpretation
- Comparison to municipal average
- Trend from previous cycle

**3. 🎯 Service Area Scores**
- Detailed scores for all 6 areas
- Funnel metrics per area
- Need for action percentages

**4. 💬 Community Voice**
- Top citizen suggestions
- Common concerns
- Verbatim quotes
- Sentiment analysis

**5. 👥 Demographics**
- Response distribution
- Population representation
- Demographic patterns

**6. 🏛️ Governance Integrity**
- Transparency score
- Accountability metrics
- Citizen trust level
- Anti-corruption perception

**Printing Report Cards**:

1. Click **Print** button
2. System generates print-optimized version
3. Use browser print function <kbd>Ctrl</kbd> + <kbd>P</kbd>
4. Save as PDF or print to paper

---

## 🔧 Troubleshooting

### Login Issues

**Problem**: Cannot log in / "Invalid credentials" error

**Solutions**:

1. ✅ Verify email address is correct (case-sensitive)
2. ✅ Check password (case-sensitive)
3. ✅ Ensure Caps Lock is off
4. ✅ Try resetting password (if available)
5. ✅ Contact administrator to verify account status
6. ✅ Clear browser cache and cookies
7. ✅ Try a different browser

**Problem**: "Account inactive" message

**Solution**: Contact administrator to reactivate your account


### Dashboard Issues

**Problem**: Dashboard not loading / blank screen

**Solutions**:

1. Refresh the page <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd>
2. Clear browser cache
3. Check internet connection
4. Try a different browser
5. Disable browser extensions temporarily
6. Check if active survey cycle is set (Admin)

**Problem**: Map not displaying correctly

**Solutions**:

1. Refresh the page
2. Try zooming in/out
3. Switch to List View temporarily
4. Clear browser cache
5. Update browser to latest version

**Problem**: Barangay data not showing

**Solutions**:

1. Verify survey cycle is selected
2. Check if barangay has survey data
3. Refresh the page
4. Contact administrator

### Survey Issues (Interviewers)

**Problem**: Cannot start new survey

**Solutions**:

1. Verify you're assigned to the spot
2. Check if active survey cycle exists
3. Ensure you haven't exceeded quota
4. Refresh the page
5. Contact Field Supervisor

**Problem**: Survey not saving

**Solutions**:

1. Check internet connection
2. Try saving as draft first
3. Check browser console for errors
4. Don't close browser until save confirms
5. Use offline mode if connection is unstable

**Problem**: GPS/Geotagging not working

**Solutions**:

1. Enable location services in browser
2. Allow location permission when prompted
3. Move to outdoor location for better signal
4. Wait for GPS to acquire signal (may take 30-60 seconds)
5. Manually enter coordinates if GPS unavailable
6. Check device GPS settings

**Problem**: Offline surveys not syncing

**Solutions**:

1. Ensure internet connection is stable
2. Don't close browser during sync
3. Check for sync notification
4. Manually trigger sync by refreshing page
5. Check browser storage isn't full
6. Contact administrator if sync fails repeatedly

### CPAP Issues (Officers)

**Problem**: Cannot create CPAP

**Solutions**:

1. Verify you're assigned to a barangay
2. Check if active survey cycle exists
3. Ensure survey data is complete (100%)
4. Refresh the page
5. Contact administrator

**Problem**: Cannot submit CPAP

**Solutions**:

1. Verify all required fields are filled (Output column)
2. Check CPAP status (must be Draft)
3. Ensure at least one action item exists
4. Try refreshing the page
5. Contact administrator

**Problem**: AI suggestions not generating

**Solutions**:

1. Verify survey data is complete
2. Check if executive summary is available
3. Wait a few moments and try again
4. Refresh the page
5. Contact administrator if issue persists


### Performance Issues

**Problem**: System is slow / pages loading slowly

**Solutions**:

1. Check internet connection speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Disable browser extensions
5. Try during off-peak hours
6. Use a faster internet connection
7. Contact administrator if issue persists

**Problem**: Browser freezing or crashing

**Solutions**:

1. Close and restart browser
2. Update browser to latest version
3. Clear browser cache and cookies
4. Disable browser extensions
5. Check device memory/RAM
6. Try a different browser
7. Restart your device

### Data Issues

**Problem**: Data not updating / showing old data

**Solutions**:

1. Refresh the page <kbd>F5</kbd>
2. Clear browser cache
3. Check if viewing correct survey cycle
4. Wait a few minutes (data may be processing)
5. Contact administrator

**Problem**: Missing barangays or data

**Solutions**:

1. Verify survey cycle is selected
2. Check your role permissions
3. Confirm barangays are active
4. Contact administrator

---

## ❓ FAQs

### General Questions

**Q: What browsers are supported?**

A: Chrome, Firefox, Safari, and Edge (latest versions). Chrome is recommended for best performance.

**Q: Can I use PULSE on mobile devices?**

A: Yes, PULSE is fully responsive. Interviewers can conduct surveys on tablets or smartphones. List View is optimized for mobile.

**Q: Is my data secure?**

A: Yes, PULSE uses industry-standard security including JWT authentication, encrypted connections (HTTPS), and role-based access control.

**Q: Can I access PULSE offline?**

A: Interviewers can conduct surveys offline. The data syncs automatically when connection is restored. Other features require internet connection.

**Q: How often is data updated?**

A: Real-time. Survey submissions, CPAP updates, and dashboard data update immediately.

### Survey Questions

**Q: How long does each survey take?**

A: Approximately 20-30 minutes depending on respondent's familiarity with services.

**Q: What if the selected respondent (Kish Grid) is unavailable?**

A: Schedule a callback. Do not substitute with another household member as this violates sampling methodology.

**Q: Can I edit a submitted survey?**

A: No, submitted surveys cannot be edited. Save as draft if you need to make changes before final submission.

**Q: What if GPS is not available?**

A: You can manually enter coordinates or note the location in remarks. However, GPS verification is preferred.

**Q: How many surveys should I complete per day?**

A: Aim for 8-12 surveys per day, depending on travel time and survey complexity.


### CPAP Questions

**Q: When should I create a CPAP?**

A: After survey data collection is 100% complete and the executive summary is available.

**Q: How many action items should a CPAP have?**

A: No fixed number. Focus on quality over quantity. Typically 10-20 high-priority items covering all service areas.

**Q: Can I edit CPAP after submission?**

A: No, but if admin requests revision, status returns to Draft and you can edit.

**Q: What happens after CPAP is approved?**

A: You can update implementation progress (Actual Output, Status, Actual Date) but cannot add/delete items.

**Q: How often should I update CPAP progress?**

A: Monthly updates recommended, or whenever significant milestones are achieved.

### Dashboard & Analytics Questions

**Q: What does the satisfaction index mean?**

A: A composite score (0-100) representing overall citizen satisfaction, calculated using ML algorithms analyzing all survey responses.

**Q: Why is my barangay's score low?**

A: Low scores indicate areas needing improvement. Review the report card to identify specific issues and create targeted CPAP actions.

**Q: Can I compare my barangay to others?**

A: Yes, use the Analytics section to view barangay rankings and comparisons.

**Q: What is funnel analysis?**

A: It shows the progression: Awareness (know about service) → Availment (used service) → Satisfaction (happy with service). Helps identify where improvements are needed.

**Q: How is "Need for Action" calculated?**

A: Percentage of respondents who said a service needs improvement or action.

### Technical Questions

**Q: Why do I see "No active cycle" warning?**

A: Administrator needs to create and activate a survey cycle. Contact your admin.

**Q: What does "Survey incomplete" mean on report card?**

A: Survey data collection hasn't reached 100%. Executive summary and some analytics require complete data.

**Q: Can I export data to Excel?**

A: Yes, use the "Export to CSV" button. CSV files open in Excel and other spreadsheet software.

**Q: How do I print a report card?**

A: Click the Print button on the report card page, then use your browser's print function <kbd>Ctrl</kbd> + <kbd>P</kbd>.

**Q: What if I accidentally delete something?**

A: Contact administrator immediately. Some deletions can be recovered from backups.

### Role-Specific Questions

**Q: (Admin) How do I assign an Officer to a barangay?**

A: In Users & Roles section, edit the user and select their Barangay Designation.

**Q: (FS) Can I see other supervisors' barangays?**

A: No, you can only see and manage barangays assigned to you.

**Q: (Interviewer) Why can't I see the dashboard?**

A: Interviewers don't have dashboard access. Use the Survey page to view your assignments and progress.

**Q: (Officer) Can I create CPAP for multiple barangays?**

A: No, officers are designated to one barangay and can only create CPAP for that barangay.

**Q: (Viewer) Why can't I edit anything?**

A: Viewers have read-only access for monitoring and reporting purposes only.

---


## 📞 Support & Contact

### Getting Help

**For Technical Issues**:

1. Check this manual's Troubleshooting section
2. Review FAQs
3. Contact your system administrator
4. Email technical support (if available)

**For Training**:

- Request training sessions from your administrator
- Review role-specific sections in this manual
- Practice in a test environment (if available)

**For Data Issues**:

- Contact your Field Supervisor (Interviewers)
- Contact Administrator (Officers, FS)
- Provide specific details: what, when, where

### Best Practices

**Security**:

- 🔒 Never share your password
- 🚪 Log out when finished
- 👀 Don't leave system unattended while logged in
- ⚠️ Report suspicious activity immediately

**Data Quality**:

- ✅ Double-check all entries before submitting
- 📊 Be honest and accurate in data collection
- 🚨 Report any data quality concerns
- 📋 Follow survey protocols strictly

**Communication**:

- 💬 Respond to comments and notifications promptly
- 📢 Keep administrators informed of issues
- 📝 Provide clear, detailed reports
- ❓ Ask questions when unsure

---

## 📝 Appendix

### Service Area Definitions

**1. 💰 Financial Administration**
- Barangay projects and programs
- Financial transparency and reporting
- Social assistance programs
- Anti-corruption measures

**2. 🌪️ Disaster Preparedness**
- Disaster information dissemination
- Evacuation centers and facilities
- Emergency response systems
- Disaster risk reduction programs

**3. 🏥 Social Protection**
- Health services and facilities
- Women and children protection
- Community participation programs
- Senior citizen and PWD support

**4. 🛡️ Safety and Peace**
- Peace and order programs
- Crime prevention initiatives
- Conflict resolution mechanisms
- Community safety measures

**5. 💼 Business-Friendly**
- Business permits and licensing
- Business support programs
- Market facilities and services
- Economic development initiatives

**6. 🌱 Environmental Management**
- Waste management systems
- Environmental protection programs
- Green spaces and parks
- Pollution control measures


### Glossary

| Term | Definition |
|------|------------|
| **Active Cycle** | The current survey cycle where data collection is ongoing |
| **Availment** | The act of using or accessing a service (survey metric) |
| **Awareness** | Knowledge about the existence of a service (survey metric) |
| **Barangay** | The smallest administrative division in the Philippines |
| **CPAP** | Citizen Priority Action Plan - a data-driven action plan based on survey results |
| **Cycle** | A survey campaign with specific start and end dates |
| **DILG** | Department of the Interior and Local Government |
| **Field Supervisor (FS)** | User role responsible for coordinating survey data collection |
| **Funnel Analysis** | Analysis showing progression from Awareness → Availment → Satisfaction |
| **Geotagging** | Recording GPS coordinates of survey location |
| **Interviewer** | User role responsible for conducting surveys |
| **Kish Grid** | Statistical method for randomly selecting survey respondents from households |
| **LGU** | Local Government Unit |
| **MLGRC** | Municipal Local Governance Resource Center |
| **MOE** | Margin of Error - statistical measure of survey accuracy |
| **Need for Action (NFA)** | Percentage of respondents indicating a service needs improvement |
| **Officer** | User role (typically barangay official) responsible for creating CPAPs |
| **Offline Mode** | Ability to conduct surveys without internet connection |
| **PULSE** | Public Understanding and Local Service Evaluation |
| **Report Card** | Comprehensive performance report for a barangay |
| **Respondent** | Person being interviewed in a survey |
| **Satisfaction Index** | Composite score (0-100) representing overall citizen satisfaction |
| **SGLGB** | Seal of Good Local Governance for Barangays - national award |
| **Spot** | Specific geographic location within a barangay for survey data collection |
| **Survey Cycle** | See "Cycle" |
| **Target** | Number of survey respondents needed per barangay |
| **Viewer** | User role with read-only access to dashboards and reports |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| <kbd>Ctrl</kbd> + <kbd>R</kbd> or <kbd>F5</kbd> | Refresh page |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Print current page |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> | Find on page |
| <kbd>Esc</kbd> | Close modal/dialog |
| <kbd>Tab</kbd> | Navigate between form fields |
| <kbd>Enter</kbd> | Submit form (when in text field) |

### System Limits

| Limit | Value |
|-------|-------|
| Maximum file upload size | 10MB (for barangay logos) |
| Survey session timeout | 2 hours of inactivity |
| Password minimum length | 8 characters |
| Maximum CPAP items | No limit (recommended 10-20) |
| Offline storage | Depends on browser (typically 50-100 surveys) |
| CSV export limit | 10,000 rows per export |


### Version History

**Version 2.0** (January 2026)

- ✨ Complete system redesign with Next.js 16
- 🗺️ Interactive SVG map with hover and click features
- 🤖 AI-powered CPAP suggestions
- 📊 ML-based satisfaction scoring
- 📱 Offline mode for surveys
- 📋 Enhanced CPAP spreadsheet (13 columns)
- 🌐 Multi-language executive summaries
- 📱 Improved mobile responsiveness

**Version 1.0** (2024)

- 🚀 Initial release
- 📝 Basic survey functionality
- 📊 Simple dashboard
- ✍️ Manual CPAP creation

---

## 🎓 Training Resources

### Recommended Training Sequence

**For Administrators** (7.5 hours total):

1. System overview and architecture (2 hours)
2. Survey cycle management (1 hour)
3. User and role management (1 hour)
4. Barangay and target setup (1 hour)
5. CPAP review and approval (1 hour)
6. Analytics and reporting (1 hour)
7. Backup and data export (30 minutes)

**For Field Supervisors** (5 hours total):

1. System overview (1 hour)
2. Dashboard navigation (30 minutes)
3. Spot creation and management (1 hour)
4. Interviewer assignment (30 minutes)
5. Progress monitoring (1 hour)
6. Data quality checks (1 hour)

**For Interviewers** (8.5 hours total):

1. System overview (30 minutes)
2. Survey interface navigation (1 hour)
3. Kish Grid methodology (1 hour)
4. Survey question types and skip patterns (1 hour)
5. Geotagging procedures (30 minutes)
6. Offline mode usage (30 minutes)
7. Data submission and sync (30 minutes)
8. Field practice (4 hours)

**For Officers** (7.5 hours total):

1. System overview (1 hour)
2. Dashboard and report card navigation (1 hour)
3. Understanding survey results (1 hour)
4. CPAP creation fundamentals (2 hours)
5. Using AI suggestions (30 minutes)
6. CPAP submission and revision (1 hour)
7. Progress tracking (30 minutes)

**For Viewers** (3.5 hours total):

1. System overview (30 minutes)
2. Dashboard navigation (1 hour)
3. Analytics interpretation (1 hour)
4. Report card reading (30 minutes)
5. Data export (30 minutes)

### Training Tips

**For Trainers**:

- 🎥 Use live demonstrations with real data
- 🖐️ Provide hands-on practice time
- 📖 Create role-specific scenarios
- 🧪 Use test accounts for practice
- 📹 Record training sessions for reference
- 📄 Provide quick reference guides
- 📅 Schedule follow-up sessions

**For Learners**:

- 📝 Take notes during training
- 🏃 Practice immediately after training
- ❓ Ask questions when unsure
- 📖 Review this manual regularly
- 🎯 Start with simple tasks
- 🆘 Request additional support if needed

---


## 📄 Document Information

| Field | Value |
|-------|-------|
| **Document Title** | PULSE System - Complete User Manual |
| **Version** | 2.0 |
| **Date** | January 7, 2026 |
| **Prepared By** | PULSE Development Team |
| **Approved By** | System Administrator |
| **Distribution** | All PULSE Users |
| **Classification** | Internal Use |
| **Review Cycle** | Quarterly or upon major system updates |

**Feedback**: Please report errors or suggestions for improvement to your system administrator.

---

<p align="center">
  <img src="https://img.shields.io/badge/PULSE-System-blue?style=for-the-badge" alt="PULSE System">
  <img src="https://img.shields.io/badge/Version-2.0-green?style=for-the-badge" alt="Version 2.0">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Active">
</p>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
</p>

---

> "Empowering local governance through data-driven insights and citizen engagement."
>
> — PULSE Development Team

---

**End of Manual**

For the latest version of this manual and additional resources, contact your system administrator.

*This document was formatted for optimal PDF conversion using RenderMark styling principles.*
