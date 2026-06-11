<style>
/* PDF-Optimized Styles */
.no-break {
  page-break-inside: avoid;
  break-inside: avoid;
}

.page-break-before {
  page-break-before: always;
  break-before: always;
}

.card {
  page-break-inside: avoid;
  break-inside: avoid;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  background: #ffffff;
}

.card-header {
  background: #667eea;
  color: white;
  padding: 12px;
  margin: -15px -15px 15px -15px;
  border-radius: 6px 6px 0 0;
  font-weight: bold;
}

.info-box {
  page-break-inside: avoid;
  break-inside: avoid;
  border-left: 4px solid #3498db;
  background: #f0f7ff;
  padding: 12px;
  margin: 10px 0;
}

.warning-box {
  page-break-inside: avoid;
  break-inside: avoid;
  border-left: 4px solid #ffc107;
  background: #fff3cd;
  padding: 12px;
  margin: 10px 0;
}

.success-box {
  page-break-inside: avoid;
  break-inside: avoid;
  border-left: 4px solid #27ae60;
  background: #d5f4e6;
  padding: 12px;
  margin: 10px 0;
}

table {
  page-break-inside: avoid;
  break-inside: avoid;
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}
</style>

<p align="center">
  <img src="https://img.shields.io/badge/PULSE-System-0066cc?style=for-the-badge" alt="PULSE">
  <img src="https://img.shields.io/badge/Version-2.0-00cc66?style=for-the-badge" alt="Version 2.0">
  <img src="https://img.shields.io/badge/Updated-January_2026-0099ff?style=for-the-badge" alt="Updated">
</p>

<h1 align="center">PULSE System</h1>
<h3 align="center">Complete User Manual</h3>

<p align="center">
  <strong>Public Understanding and Local Service Evaluation</strong><br>
  Empowering Local Governance Through Data-Driven Insights
</p>

---

## 📖 Table of Contents

- [🎯 Introduction](#-introduction)
- [🚀 Getting Started](#-getting-started)
- [👥 User Roles Overview](#-user-roles-overview)
- [🔧 Admin Guide](#-admin-guide)
- [👷 Field Supervisor Guide](#-field-supervisor-guide)
- [📝 Interviewer Guide](#-interviewer-guide)
- [🏛️ Officer Guide](#-officer-guide)
- [👁️ Viewer Guide](#-viewer-guide)
- [📊 Dashboard Features](#-dashboard-features)
- [📋 CPAP System Guide](#-cpap-system-guide)
- [📈 Analytics & Reporting](#-analytics--reporting)
- [🔧 Troubleshooting](#-troubleshooting)
- [❓ FAQs](#-faqs)

---


## 🎯 Introduction

### What is PULSE?

<div class="info-box no-break">

**PULSE** (Public Understanding and Local Service Evaluation) is a comprehensive digital platform designed to help **Municipal Local Governance Resource Centers (MLGRC)** in the Philippines systematically improve barangay governance through data-driven insights.

</div>

<div class="card no-break">
<div class="card-header">Core Functions</div>

**📊 Collect** — Gather citizen feedback on local government services through structured surveys

**📈 Evaluate** — Assess service delivery effectiveness across 6 key service areas

**🏛️ Improve** — Enhance barangay-level governance performance with actionable insights

**🤖 Track** — Monitor implementation progress with ML-powered analytics

</div>

### Key Benefits

<div class="card no-break">
<div class="card-header">Why Use PULSE?</div>

| Benefit | Description |
|---------|-------------|
| **📊 Evidence-Based Decision Making** | Use real survey data to prioritize governance actions |
| **🔍 Transparent Governance** | Track progress and accountability across all barangays |
| **👥 Community Engagement** | Involve citizens directly in governance improvement |
| **⚡ Efficient Monitoring** | Real-time dashboards with interactive maps |
| **🤖 AI-Powered Insights** | Get intelligent recommendations and automated scoring |
| **🎨 Interactive Visualizations** | Hover and click to explore barangay data instantly |

</div>

### System Architecture

<div class="card no-break">
<div class="card-header">Technology Stack</div>

```javascript
const pulseArchitecture = {
  frontend: "Next.js 16, React 19, TypeScript, Tailwind CSS",
  backend: "PostgreSQL with Prisma ORM",
  authentication: "JWT with role-based access control",
  maps: "Interactive SVG + Leaflet.js",
  analytics: "Python ML Service",
  deployment: "Railway Cloud"
};
```

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python" alt="Python">
</p>

---

## 🚀 Getting Started

### System Requirements

<div class="card no-break">

| Requirement | Specification |
|-------------|---------------|
| **🌐 Web Browser** | Chrome, Firefox, Safari, or Edge (latest versions) |
| **📡 Internet Connection** | Required for online features and data synchronization |
| **📱 Offline Support** | Available for survey data collection (interviewers only) |
| **📱 Mobile Devices** | Fully responsive design works on tablets and smartphones |
| **🖥️ Screen Resolution** | Minimum 1024x768 recommended for optimal experience |

</div>

### Accessing the System

<div class="info-box no-break">

**🔐 Login Steps:**

1. **Open your web browser**
2. **Navigate to**: Your organization's PULSE URL (e.g., `https://mlgrc-pulse.up.railway.app/`)
3. **Login** with your assigned credentials (email and password)
4. **Dashboard** loads automatically based on your role

</div>

### First-Time Login

<div class="success-box no-break">

> 💡 **Pro Tip**: Change your password immediately after first login for security

**Checklist for New Users:**

- [ ] Enter your **email address** and **password** provided by your administrator
- [ ] You may be prompted to **change your password** for security
- [ ] Review the **welcome guide** if displayed
- [ ] Familiarize yourself with the **navigation menu** and available features
- [ ] Check the **active survey cycle** displayed in the header

</div>

### Navigation Overview

<div class="card no-break">
<div class="card-header">Main Navigation Elements</div>

- **📊 Header Bar** — Shows current time, active survey cycle, and user menu
- **🗺️ Main Dashboard** — Interactive map or list view of barangays
- **⚙️ Settings** — System configuration and management (Admin only)
- **👤 Profile** — View and update your personal information
- **📈 Analytics** — Reports and data visualizations
- **🚪 Logout** — Securely end your session

</div>

---


## 👥 User Roles Overview

<div class="info-box no-break">

PULSE has **six distinct user roles**, each with specific permissions and responsibilities designed for optimal workflow efficiency.

</div>

### The Six Roles

<div class="card no-break">
<div class="card-header" style="background: #e74c3c;">🔑 Admin</div>

**Access Level:** Full system access

**Primary Function:** System setup, cycle management, overall monitoring

**Key Capabilities:**
- Create cycles
- Manage users
- Assign supervisors
- Review CPAPs
- View all data

</div>

<div class="card no-break">
<div class="card-header" style="background: #9b59b6;">💻 Developer</div>

**Access Level:** Full system access

**Primary Function:** System development and testing

**Key Capabilities:**
- Same as Admin
- Testing features
- Development access
- Debug mode

</div>

<div class="card no-break">
<div class="card-header" style="background: #3498db;">👷 Field Supervisor</div>

**Access Level:** Assigned barangays

**Primary Function:** Survey coordination, interviewer management

**Key Capabilities:**
- Create spots
- Assign interviewers
- Monitor progress
- View dashboard

</div>

<div class="card no-break">
<div class="card-header" style="background: #f39c12;">📝 Interviewer</div>

**Access Level:** Assigned spots

**Primary Function:** Data collection, survey submission

**Key Capabilities:**
- Conduct surveys
- Submit responses
- Offline mode
- Geotagging

</div>

<div class="card no-break">
<div class="card-header" style="background: #27ae60;">🏛️ Officer</div>

**Access Level:** Own barangay

**Primary Function:** CPAP creation, action planning, implementation

**Key Capabilities:**
- View survey results
- Create/edit CPAP
- Submit CPAP
- Track implementation

</div>

<div class="card no-break">
<div class="card-header" style="background: #95a5a6;">👁️ Viewer</div>

**Access Level:** Read-only access

**Primary Function:** View-only access to dashboards and analytics

**Key Capabilities:**
- View dashboard
- View analytics
- View report cards
- Export data

</div>

### Permission Matrix

<div class="no-break">

<table>
<thead style="background: #667eea; color: white;">
<tr>
<th style="padding: 10px; text-align: left;">Feature</th>
<th style="padding: 10px; text-align: center;">Admin</th>
<th style="padding: 10px; text-align: center;">Developer</th>
<th style="padding: 10px; text-align: center;">FS</th>
<th style="padding: 10px; text-align: center;">Interviewer</th>
<th style="padding: 10px; text-align: center;">Officer</th>
<th style="padding: 10px; text-align: center;">Viewer</th>
</tr>
</thead>
<tbody>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">View Dashboard</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">Create Survey Cycles</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Manage Barangays</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">Create Spots</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Conduct Surveys</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">Create CPAP</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Review/Approve CPAP</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">View Analytics</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Manage Users</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">✅</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px; text-align: center;">❌</td>
</tr>
</tbody>
</table>

</div>

---


## 🔧 Admin Guide

<div class="info-box no-break">

**👑 Administrator Overview**

Administrators have **full system access** and are the backbone of PULSE operations.

</div>

### Core Responsibilities

<div class="card no-break">
<div class="card-header">What Admins Do</div>

- ⚙️ **System Setup** — Configure cycles and barangays
- 👥 **User Management** — Create and assign roles
- ✅ **CPAP Review** — Approve action plans
- 🎯 **Set Targets** — Define survey goals
- 📊 **Monitor Progress** — Track system performance
- 💾 **Data Backup** — Export and secure data

</div>

### Accessing Admin Settings

<div class="info-box no-break">

**Quick Access Path:**

1. Click your **user menu** in the top-right corner
2. Select **Settings** from the dropdown
3. The Admin Settings panel opens with a sidebar menu

</div>

### Admin Settings Sections

#### 1️⃣ Survey Cycles Management

<div class="card no-break">
<div class="card-header">Purpose</div>

Create and manage survey campaigns with specific timeframes.

**How to Create a Survey Cycle:**

1. Navigate to **Settings** → **Survey Cycles**
2. Click **Create New Cycle** button
3. Fill in the form:
   - **Cycle Name**: e.g., "2026 Citizen Satisfaction Survey"
   - **Year**: Select the year (e.g., 2026)
   - **Start Date**: When data collection begins
   - **End Date**: When data collection ends
4. Click **Save** to create the cycle
5. Click **Set as Active** to make it the current cycle

</div>

<div class="warning-box no-break">

⚠️ **Important Notes:**
- Only **one cycle can be active** at a time
- All survey responses are linked to the active cycle
- Historical data remains accessible by selecting previous cycles
- Deleting a cycle will cascade delete all related data (use with caution)

</div>

#### 2️⃣ Barangay Management

<div class="card no-break">
<div class="card-header">Purpose</div>

Manage barangay information, demographics, and status.

**How to Add a Barangay:**

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

**Managing SGLGB Awardee Status:**
- Use the **Award Management** section to mark barangays as SGLGB awardees per cycle
- Award indicators appear on the dashboard map

</div>

#### 3️⃣ Award Management

<div class="card no-break">
<div class="card-header">Purpose</div>

Track SGLGB (Seal of Good Local Governance for Barangays) awardees per cycle.

**How to Mark a Barangay as Awardee:**

1. Navigate to **Settings** → **Award Management**
2. Select the **Survey Cycle**
3. Click **Add Award** button
4. Select the **Barangay**
5. Enter **Award Date** (optional)
6. Add **Notes** (optional)
7. Click **Save**

**Viewing Award History:**
- Awards are cycle-specific
- Historical awards remain visible when viewing past cycles
- Award badges appear on the dashboard map

</div>

#### 4️⃣ Survey Targets

<div class="card no-break">
<div class="card-header">Purpose</div>

Set target number of respondents per barangay for each cycle.

**How to Set Survey Targets:**

1. Navigate to **Settings** → **Survey Targets**
2. Click **Bulk Create Targets** for all barangays
3. Or click **Add Target** for individual barangays
4. Fill in:
   - **Barangay**: Select from dropdown
   - **Survey Cycle**: Select active or specific cycle
   - **Target**: Number of respondents needed
5. Click **Save**

**Monitoring Target Achievement:**
- The system automatically calculates **Margin of Error (MOE)**
- **Achievement percentage** updates in real-time as surveys are submitted
- View progress on the dashboard

</div>

#### 5️⃣ Users & Roles Management

<div class="card no-break">
<div class="card-header">Purpose</div>

Create and manage user accounts with role assignments.

**How to Create a User:**

1. Navigate to **Settings** → **Users & Roles**
2. Click **Add User** button
3. Fill in the form:
   - 👤 **First Name** and **Last Name**
   - 📧 **Email**: Used for login
   - 🔒 **Password**: Initial password (user can change later)
   - 📱 **Phone**: Contact number
   - 🏢 **Organization**: User's organization
   - 💼 **Job Title**: User's position
   - 🎭 **Role**: Select from dropdown (Admin, FS, Interviewer, Officer, Viewer, Developer)
   - 🏘️ **Barangay Designation** (for Officers only): Assign their barangay
4. Click **Save**

**User Roles:**
- **Admin** — Full system access
- **Developer** — Full access for testing
- **Field Supervisor (FS)** — Manages survey spots and interviewers
- **Interviewer** — Conducts surveys in the field
- **Officer** — Creates and manages CPAP for their barangay
- **Viewer** — Read-only access to dashboards

</div>

#### 6️⃣ Supervisor Assignments

<div class="card no-break">
<div class="card-header">Purpose</div>

Assign Field Supervisors to specific barangays for survey coordination.

**How to Assign a Supervisor:**

1. Navigate to **Settings** → **Supervisor Assignments**
2. Click **Create Assignment** button
3. Select:
   - **Field Supervisor**: Choose from users with FS role
   - **Barangay**: Select barangay to assign
   - **Survey Cycle**: Select active or specific cycle
4. Click **Save**

</div>

<div class="info-box no-break">

📌 **Important Notes:**
- One FS can manage **multiple barangays**
- One barangay can have **multiple FSs** assigned
- FSs can only see and manage their assigned barangays
- FSs gain ability to create spots and assign interviewers

</div>

#### 7️⃣ Backup & Data Export

<div class="card no-break">
<div class="card-header">Purpose</div>

Export data for backup, analysis, or reporting.

**How to Export Data:**

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

**Backup Best Practices:**
- ✅ Export data regularly (weekly recommended)
- ✅ Store backups in secure location
- ✅ Test restore procedures periodically
- ✅ Export before major system changes

</div>

### CPAP Review & Approval (Admin)

<div class="card no-break">
<div class="card-header">Purpose</div>

Review and approve Citizen Priority Action Plans submitted by Officers.

**How to Access CPAP Review:**

1. Navigate to **Admin** → **CPAP Review** (or `/admin/cpap`)
2. View list of all CPAPs across all barangays

**CPAP Status Workflow:**

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

</div>

<div class="card no-break">

**How to Review a CPAP:**

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

</div>

---


## 👷 Field Supervisor Guide

<div class="info-box no-break">

**👷 Field Supervisor Overview**

Coordinate survey data collection in assigned barangays with precision and efficiency.

</div>

### Core Responsibilities

<div class="card no-break">
<div class="card-header">What Field Supervisors Do</div>

- 📍 **Create Spots** — Define specific geographic locations within barangays for targeted data collection
- 👥 **Assign Interviewers** — Match interviewers to spots based on capacity and geographic coverage
- 📊 **Monitor Progress** — Track survey completion rates and identify bottlenecks in real-time
- ✅ **Ensure Quality** — Review submitted surveys for completeness and accuracy

</div>

### Creating Survey Spots

<div class="card no-break">
<div class="card-header">What is a Spot?</div>

A spot is a specific geographic location within a barangay where survey data collection occurs.

**Each spot has:**
- 🏷️ A unique name/identifier
- 📍 GPS coordinates (optional)
- 🎯 Target number of respondents
- 👤 Assigned interviewer(s)

**How to Create a Spot:**

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

</div>

<div class="success-box no-break">

**Best Practices for Spot Creation:**

- ✅ Create spots that cover the entire barangay geographically
- ✅ Distribute targets evenly across spots
- ✅ Use clear, descriptive spot names
- ✅ Consider population density when setting targets

</div>

### Assigning Interviewers to Spots

<div class="card no-break">
<div class="card-header">How to Assign an Interviewer</div>

1. Navigate to the **Spots** section
2. Find the spot you want to assign
3. Click **Assign Interviewer** button
4. Select:
   - **Interviewer**: Choose from users with Interviewer role
   - **Quota**: Number of surveys they should complete
5. Click **Save**

</div>

<div class="info-box no-break">

💡 **Important Notes:**
- One spot can have **multiple interviewers** assigned
- One interviewer can work on **multiple spots**
- Interviewers can only see their assigned spots
- Quotas help distribute workload evenly

</div>

### Monitoring Survey Progress

<div class="card no-break">
<div class="card-header">Viewing Progress</div>

**Dashboard View:**

1. Access your **FS Dashboard**
2. View progress for each assigned barangay:
   - **Total Target**: Number of surveys needed
   - **Completed**: Number of surveys submitted
   - **Percentage**: Completion rate
   - **Remaining**: Surveys still needed

**Spot-Level Monitoring:**

1. Navigate to **Spots** section
2. View each spot's progress:
   - Assigned interviewers
   - Surveys completed per interviewer
   - Spot completion percentage
3. Identify spots falling behind schedule

**Interviewer Performance:**
- Track individual interviewer productivity
- View surveys submitted per day
- Identify interviewers needing support

</div>

### Data Quality Checks

<div class="card no-break">
<div class="card-header">Reviewing Submitted Surveys</div>

1. Access survey responses for your barangays
2. Check for:
   - ✅ Complete responses (all required fields filled)
   - ✅ Consistent answers (no contradictions)
   - ✅ Valid GPS coordinates
   - ✅ Reasonable completion times
3. Flag suspicious responses for review

**Handling Issues:**
- Contact interviewers about incomplete surveys
- Request re-surveys if data quality is poor
- Report systematic issues to Admin

</div>

---

## 📝 Interviewer Guide

<div class="info-box no-break">

**📝 Interviewer Overview**

Conduct face-to-face surveys with citizens and collect accurate, complete data.

</div>

### The 6 Service Areas

<div class="card no-break">
<div class="card-header">Survey Coverage</div>

**1. 💰 Financial Administration**
- Projects, transparency, social assistance

**2. 🌪️ Disaster Preparedness**
- Information, evacuation, response

**3. 🏥 Social Protection**
- Health, protection, participation

**4. 🛡️ Safety and Peace**
- Peace, crime prevention, resolution

**5. 💼 Business-Friendly**
- Permits, support, market facilities

**6. 🌱 Environmental Management**
- Waste, programs, green spaces

</div>

### Survey Process (5 Steps)

<div class="card no-break">
<div class="card-header">Step 1: Select Spot & Start Survey</div>

1. Click on your assigned **Spot**
2. Click **Start New Survey** button
3. Survey form opens

</div>

<div class="card no-break">
<div class="card-header">Step 2: Household Selection (Kish Grid)</div>

**What is Kish Grid?**

The Kish Grid is a statistical method for randomly selecting one respondent from a household to ensure unbiased sampling.

**How to Use Kish Grid:**

1. Ask: *"How many people aged 18 and above live in this household?"*
2. Enter the number in the system
3. List all eligible household members by age (oldest to youngest)
4. The system will automatically select one person using the Kish Grid algorithm
5. Interview **only the selected person**

</div>

<div class="warning-box no-break">

⚠️ **Important**: Do not substitute the selected respondent. If they're unavailable, schedule a callback.

</div>

<div class="card no-break">
<div class="card-header">Step 3: Complete Survey Sections</div>

Go through all 6 service areas with respondent.

**Survey Question Types:**

| Type | Question | Response |
|------|----------|----------|
| **Awareness** | "Are you aware of [service]?" | Yes/No |
| **Availment** | "Have you used/accessed [service]?" | Yes/No |
| **Satisfaction** | "How satisfied are you?" | 1-5 scale |
| **Need for Action** | "Does this need improvement?" | Yes/No |
| **Suggestions** | Open-ended feedback | Text |

**Conditional Logic:**
- If respondent is **not aware** of a service, skip availment and satisfaction questions
- If respondent **has not used** a service, skip satisfaction questions
- Follow the system's automatic skip patterns

</div>

<div class="card no-break">
<div class="card-header">Step 4: Geotagging</div>

**Why Geotagging?**

GPS coordinates verify that surveys were conducted in the correct location and help with spatial analysis.

**How to Geotag:**

1. When prompted, click **Get Current Location**
2. Allow browser to access your location
3. System captures:
   - Latitude and Longitude
   - Accuracy (in meters)
   - Address (reverse geocoded)
4. Verify the location is correct
5. If GPS is unavailable, you can manually enter coordinates

**Best Practices:**
- ✅ Ensure GPS is enabled on your device
- ✅ Conduct surveys outdoors when possible for better GPS signal
- ✅ Wait for accuracy to be under 20 meters if possible
- ✅ Note any location issues in survey remarks

</div>

<div class="card no-break">
<div class="card-header">Step 5: Review & Submit</div>

1. Review all answers for completeness
2. Check for any missing required fields (marked with *)
3. Add any **Remarks** or notes about the survey
4. Choose submission option:
   - **Save as Draft**: Save progress and continue later
   - **Submit**: Complete and submit the survey

</div>

### Offline Mode

<div class="success-box no-break">

**📱 Work Without Internet**

Conduct surveys in remote areas with automatic sync when online.

**How Offline Mode Works:**

1. Surveys are saved locally in your browser
2. An **Offline Indicator** appears when disconnected
3. Continue conducting surveys normally
4. When connection is restored, surveys **auto-sync** to the server
5. You'll see a notification when sync is complete

</div>

<div class="warning-box no-break">

⚠️ **Important Notes:**
- Do not clear browser cache while offline (you'll lose data)
- Sync as soon as possible when connection is available
- Check for successful sync before closing browser
- Offline surveys show a "pending sync" indicator

</div>

### Managing Your Workload

<div class="card no-break">
<div class="card-header">Time Management Tips</div>

- 🎯 Aim for 8-12 surveys per day (depending on complexity)
- ⏱️ Each survey takes approximately 20-30 minutes
- 📅 Schedule callbacks for unavailable respondents
- 🕐 Work during hours when residents are home (evenings/weekends)

</div>

---


## 🏛️ Officer Guide

<div class="info-box no-break">

**🏛️ Officer Overview**

Create data-driven action plans to improve barangay governance based on citizen feedback.

</div>

### Satisfaction Index Interpretation

<div class="no-break">

<table>
<thead style="background: #667eea; color: white;">
<tr>
<th style="padding: 10px;">Score Range</th>
<th style="padding: 10px;">Rating</th>
<th style="padding: 10px;">Description</th>
</tr>
</thead>
<tbody>
<tr style="background: #d5f4e6;">
<td style="padding: 8px;"><strong>80-100</strong></td>
<td style="padding: 8px;">🟢 Excellent</td>
<td style="padding: 8px;">Citizens are highly satisfied</td>
</tr>
<tr style="background: #fef5e7;">
<td style="padding: 8px;"><strong>60-79</strong></td>
<td style="padding: 8px;">🟡 Good</td>
<td style="padding: 8px;">Generally positive feedback</td>
</tr>
<tr style="background: #ebf5fb;">
<td style="padding: 8px;"><strong>40-59</strong></td>
<td style="padding: 8px;">🟠 Fair</td>
<td style="padding: 8px;">Room for improvement</td>
</tr>
<tr style="background: #fadbd8;">
<td style="padding: 8px;"><strong>20-39</strong></td>
<td style="padding: 8px;">🔴 Poor</td>
<td style="padding: 8px;">Significant issues identified</td>
</tr>
<tr style="background: #ecf0f1;">
<td style="padding: 8px;"><strong>0-19</strong></td>
<td style="padding: 8px;">⚫ Critical</td>
<td style="padding: 8px;">Urgent action needed</td>
</tr>
</tbody>
</table>

</div>

### Viewing the Report Card

<div class="card no-break">
<div class="card-header">How to Access Report Card</div>

1. From Dashboard, click on your barangay
2. Click **View Report Card** button
3. Comprehensive report opens

**Report Card Sections:**

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

</div>

### Creating a CPAP (Citizen Priority Action Plan)

<div class="card no-break">
<div class="card-header">What is a CPAP?</div>

A **Citizen Priority Action Plan** is a data-driven action plan that addresses citizen priorities identified through survey results. It's a structured spreadsheet with **13 columns** tracking actions from planning to implementation.

**When to Create a CPAP:**
- ✅ After survey data collection is complete (100% progress)
- ✅ When executive summary and report card are available
- ✅ Before the DILG review deadline

**How to Access CPAP:**

1. Navigate to **CPAP** page (or `/cpap`)
2. System automatically loads your barangay's CPAP
3. If no CPAP exists, one is created automatically

</div>

### CPAP Spreadsheet Structure

<div class="no-break">

<table>
<thead style="background: #9b59b6; color: white;">
<tr>
<th style="padding: 10px; text-align: center;">#</th>
<th style="padding: 10px;">Column Name</th>
<th style="padding: 10px; text-align: center;">Required</th>
<th style="padding: 10px;">When to Fill</th>
</tr>
</thead>
<tbody>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">1</td>
<td style="padding: 8px;">Results/Observations</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px; text-align: center;">2</td>
<td style="padding: 8px;">Plan of Action</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">3</td>
<td style="padding: 8px;">Activity</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #fff3cd;">
<td style="padding: 8px; text-align: center;"><strong>4</strong></td>
<td style="padding: 8px;"><strong>Output</strong></td>
<td style="padding: 8px; text-align: center;"><strong>✅ YES</strong></td>
<td style="padding: 8px;"><strong>Planning</strong></td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">5</td>
<td style="padding: 8px;">Actual Output</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Implementation</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px; text-align: center;">6</td>
<td style="padding: 8px;">Status of Accomplishment</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Implementation</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">7</td>
<td style="padding: 8px;">Implementation Schedule</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px; text-align: center;">8</td>
<td style="padding: 8px;">Actual Date</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Implementation</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">9</td>
<td style="padding: 8px;">Financial Requirements</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px; text-align: center;">10</td>
<td style="padding: 8px;">Responsible Person/Office</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">11</td>
<td style="padding: 8px;">Committed/To be Committed</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px; text-align: center;">12</td>
<td style="padding: 8px;">Means of Verification</td>
<td style="padding: 8px; text-align: center;">❌</td>
<td style="padding: 8px;">Planning</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px; text-align: center;">13</td>
<td style="padding: 8px;">Actions</td>
<td style="padding: 8px; text-align: center;">N/A</td>
<td style="padding: 8px;">Always</td>
</tr>
</tbody>
</table>

</div>

### AI-Powered CPAP Suggestions

<div class="card no-break">
<div class="card-header">🤖 Intelligent Recommendations</div>

Let AI analyze your survey data and generate actionable suggestions.

**How AI Suggestions Work:**

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

**Benefits:**
- ⏱️ Saves time in planning
- 📊 Ensures data-driven priorities
- 🎯 Provides specific, measurable outputs
- 📅 Suggests realistic timelines

</div>

### CPAP Status Workflow

<div class="card no-break">
<div class="card-header">Status Progression</div>

```
Draft → Submitted → Approved
           ↓
    Revision Requested → Draft
```

**1. Draft Status:**
- Initial state when CPAP is created
- You can add, edit, and delete items freely
- Auto-saves as you work
- Not visible to admin yet

**2. Submitting for Review:**
- Click **Submit for Review** button
- Confirm submission in modal dialog
- Status changes to **Submitted**
- Admin receives notification
- You can no longer edit items

**3. Under Admin Review:**
- Admin reviews your CPAP
- Admin may add comments or questions
- You'll receive notifications for new comments

**4. Approved Status:**
- Admin approves your CPAP
- You can now update implementation progress
- Fill in "Actual Output" and "Status of Accomplishment"
- Track completion

**5. Revision Requested:**
- Admin requests changes
- Status returns to **Draft**
- Review admin comments
- Make necessary revisions
- Resubmit when ready

</div>

### CPAP Best Practices

<div class="success-box no-break">

**Planning Phase:**
- [ ] Review report card thoroughly before creating CPAP
- [ ] Prioritize critical issues first
- [ ] Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- [ ] Involve stakeholders in planning
- [ ] Ensure budget alignment

**Implementation Phase:**
- [ ] Update progress regularly (monthly)
- [ ] Document actual outputs with evidence
- [ ] Report delays promptly with reasons
- [ ] Adjust timelines if needed (with admin approval)
- [ ] Maintain means of verification

**Reporting Phase:**
- [ ] Provide clear, concise updates
- [ ] Use photos/documents as evidence
- [ ] Respond to admin comments promptly
- [ ] Be transparent about challenges
- [ ] Celebrate successes

</div>

---


## 👁️ Viewer Guide

<div class="info-box no-break">

**👁️ Viewer Overview**

Read-only access to dashboards, analytics, and reports for monitoring and oversight.

</div>

<div class="card no-break">
<div class="card-header" style="background: #27ae60;">✅ What You CAN Do</div>

- 🗺️ View interactive dashboard
- 📊 Access analytics and reports
- 📄 Read report cards
- 📥 Export data to CSV
- 👀 Monitor all barangays

</div>

<div class="card no-break">
<div class="card-header" style="background: #e74c3c;">❌ What You CANNOT Do</div>

- ✏️ Create or edit any data
- 📝 Submit surveys
- 📋 Create CPAPs
- ✅ Approve or modify anything
- ⚙️ Access admin settings

</div>

### Using the Interactive Map

<div class="card no-break">
<div class="card-header">Map Features</div>

**Hover Preview:**
1. Hover your mouse over any barangay on the map
2. Instant preview shows:
   - Barangay name
   - Satisfaction index
   - Survey progress
   - Award status (if SGLGB awardee)

**Click to Lock:**
1. Click on a barangay to "lock" the selection
2. Detailed side panel opens showing:
   - Full barangay information
   - Service area scores
   - Survey targets and achievement
   - Historical performance (if available)
3. Click **View Report Card** to see full report
4. Click elsewhere or close button to unlock

**View Toggle:**
- Switch between **Map View** and **List View**
- List View is mobile-optimized
- Both views show the same data

</div>

### Exporting Data

<div class="card no-break">
<div class="card-header">How to Export</div>

1. Navigate to the analytics or report you want to export
2. Click **Export to CSV** button
3. File downloads automatically
4. Open in Excel or other spreadsheet software

**Available Exports:**
- Survey responses (detailed)
- Barangay performance summary
- Service area scores
- Demographics data

</div>

---

## 📊 Dashboard Features

<div class="info-box no-break">

**📊 Interactive Dashboard**

Explore barangay data with hover previews, click-to-lock details, and real-time updates.

</div>

### Interactive SVG Map Features

<div class="card no-break">
<div class="card-header">Map Capabilities</div>

**Color-Coded Barangays by Satisfaction Index:**
- 🟢 Green: High satisfaction (80-100)
- 🟡 Yellow: Medium satisfaction (60-79)
- 🟠 Orange: Low satisfaction (40-59)
- 🔴 Red: Critical (0-39)

**Additional Features:**
- 🏆 Award badges for SGLGB awardees
- 👆 Hover preview for quick data
- 🔒 Click-to-lock for detailed view
- 🔍 Zoom and pan capabilities

</div>

### Barangay Details Panel

<div class="card no-break">
<div class="card-header">Information Displayed</div>

- Barangay name and logo
- Population and households
- Barangay captain
- Overall satisfaction index
- Service area scores (6 areas)
- Survey progress and targets
- Award status
- Historical data (if available)

</div>

---

## 📋 CPAP System Guide

<div class="info-box no-break">

**Purpose**: Create data-driven action plans based on citizen feedback to improve barangay governance.

</div>

### CPAP Overview

<div class="card no-break">
<div class="card-header">Key Components</div>

1. **13-Column Spreadsheet** — Structured planning and tracking
2. **6 Service Areas** — Categorized action items
3. **AI Suggestions** — ML-powered recommendations
4. **Comments System** — Admin-officer communication
5. **Status Workflow** — Draft → Submitted → Approved
6. **Progress Tracking** — Implementation monitoring

</div>

### Service Areas for Action Items

<div class="card no-break">
<div class="card-header">The 6 Service Areas</div>

Each action item must be categorized under one of these areas:

- 💰 **Financial Administration**
- 🌪️ **Disaster Preparedness**
- 🏥 **Social Protection**
- 🛡️ **Safety and Peace**
- 💼 **Business-Friendly**
- 🌱 **Environmental Management**

</div>

---

## 📈 Analytics & Reporting

<div class="info-box no-break">

**📈 Analytics & Reporting**

Transform data into actionable insights with comprehensive analytics and visualizations.

</div>

### Key Performance Indicators

<div class="no-break">

<table>
<thead style="background: #667eea; color: white;">
<tr>
<th style="padding: 10px;">KPI</th>
<th style="padding: 10px;">Description</th>
</tr>
</thead>
<tbody>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">📊 <strong>Overall Satisfaction Index</strong></td>
<td style="padding: 8px;">Average across all barangays</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">📝 <strong>Total Responses</strong></td>
<td style="padding: 8px;">Number of surveys completed</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">🎯 <strong>Target Achievement</strong></td>
<td style="padding: 8px;">Percentage of targets met</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">📈 <strong>Survey Progress</strong></td>
<td style="padding: 8px;">Overall completion rate</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">🏘️ <strong>Active Barangays</strong></td>
<td style="padding: 8px;">Number with ongoing surveys</td>
</tr>
</tbody>
</table>

</div>

### Funnel Analysis

<div class="card no-break">
<div class="card-header">Understanding the Citizen Journey</div>

**The Three Stages:**

1. **👁️ Awareness** — Citizens know about the service
2. **✋ Availment** — Citizens used the service
3. **😊 Satisfaction** — Citizens are happy with the service

**Interpreting Patterns:**

| Pattern | Interpretation | Action Needed |
|---------|----------------|---------------|
| High Awareness, Low Availment | Services exist but not accessible | Improve accessibility |
| High Availment, Low Satisfaction | Services used but poor quality | Enhance service quality |
| Low Awareness | Citizens don't know about services | Better information dissemination |

</div>

### Demographics Analytics

<div class="card no-break">
<div class="card-header">Available Breakdowns</div>

**Age Distribution:**
- 18-30 years
- 31-45 years
- 46-60 years
- 61+ years

**Gender Distribution:**
- Male
- Female
- Other/Prefer not to say

**Occupation Categories:**
- Employed
- Self-employed
- Unemployed
- Student
- Retired
- Homemaker

**Insights Available:**
- Satisfaction by demographic group
- Service usage patterns by age/gender
- Priority issues by occupation
- Response distribution

</div>

---


## 🔧 Troubleshooting

<div class="info-box no-break">

**🔧 Troubleshooting Guide**

Quick solutions to common issues and problems.

</div>

### Login Issues

<div class="card no-break">
<div class="card-header">🔐 Cannot Log In / "Invalid Credentials" Error</div>

**Solutions:**

1. ✅ Verify email address is correct (case-sensitive)
2. ✅ Check password (case-sensitive)
3. ✅ Ensure Caps Lock is off
4. ✅ Clear browser cache and cookies
5. ✅ Try a different browser
6. ✅ Contact administrator to verify account status

**Problem: "Account inactive" message**

**Solution:** Contact administrator to reactivate your account

</div>

### Dashboard Issues

<div class="card no-break">
<div class="card-header">📊 Dashboard Not Loading / Blank Screen</div>

**Solutions:**

1. Refresh the page <kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd>
2. Clear browser cache
3. Check internet connection
4. Try a different browser
5. Disable browser extensions temporarily
6. Check if active survey cycle is set (Admin)

**Problem: Map not displaying correctly**

**Solutions:**
1. Refresh the page
2. Try zooming in/out
3. Switch to List View temporarily
4. Clear browser cache
5. Update browser to latest version

</div>

### Survey Issues (Interviewers)

<div class="card no-break">
<div class="card-header">📝 Cannot Start New Survey</div>

**Solutions:**

1. Verify you're assigned to the spot
2. Check if active survey cycle exists
3. Ensure you haven't exceeded quota
4. Refresh the page
5. Contact Field Supervisor

**Problem: Survey not saving**

**Solutions:**
1. Check internet connection
2. Try saving as draft first
3. Don't close browser until save confirms
4. Use offline mode if connection is unstable
5. Contact Field Supervisor

</div>

<div class="card no-break">
<div class="card-header">📍 GPS/Geotagging Not Working</div>

**Solutions:**

1. Enable location services in browser
2. Allow location permission when prompted
3. Move to outdoor location for better signal
4. Wait for GPS to acquire signal (30-60 seconds)
5. Manually enter coordinates if GPS unavailable
6. Check device GPS settings

**Problem: Offline surveys not syncing**

**Solutions:**
1. Ensure internet connection is stable
2. Don't close browser during sync
3. Check for sync notification
4. Manually trigger sync by refreshing page
5. Check browser storage isn't full
6. Contact administrator if sync fails repeatedly

</div>

### CPAP Issues (Officers)

<div class="card no-break">
<div class="card-header">📋 Cannot Create CPAP</div>

**Solutions:**

1. Verify you're assigned to a barangay
2. Check if active survey cycle exists
3. Ensure survey data is complete (100%)
4. Refresh the page
5. Contact administrator

**Problem: Cannot submit CPAP**

**Solutions:**
1. Verify all required fields are filled (Output column)
2. Check CPAP status (must be Draft)
3. Ensure at least one action item exists
4. Try refreshing the page
5. Contact administrator

**Problem: AI suggestions not generating**

**Solutions:**
1. Verify survey data is complete
2. Check if executive summary is available
3. Wait a few moments and try again
4. Refresh the page
5. Contact administrator if issue persists

</div>

### Performance Issues

<div class="card no-break">
<div class="card-header">⚡ System is Slow / Pages Loading Slowly</div>

**Solutions:**

1. Check internet connection speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Disable browser extensions
5. Try during off-peak hours
6. Use a faster internet connection
7. Contact administrator if issue persists

**Problem: Browser freezing or crashing**

**Solutions:**
1. Close and restart browser
2. Update browser to latest version
3. Clear browser cache and cookies
4. Disable browser extensions
5. Check device memory/RAM
6. Try a different browser
7. Restart your device

</div>

---

## ❓ FAQs

<div class="info-box no-break">

**❓ Frequently Asked Questions**

Quick answers to common questions about PULSE.

</div>

### General Questions

<div class="card no-break">

**Q: What browsers are supported?**

**A:** Chrome, Firefox, Safari, and Edge (latest versions). Chrome is recommended for best performance.

---

**Q: Can I use PULSE on mobile devices?**

**A:** Yes! PULSE is fully responsive. Interviewers can conduct surveys on tablets or smartphones. List View is optimized for mobile.

---

**Q: Is my data secure?**

**A:** Yes! PULSE uses industry-standard security including JWT authentication, encrypted connections (HTTPS), and role-based access control.

---

**Q: Can I access PULSE offline?**

**A:** Interviewers can conduct surveys offline. The data syncs automatically when connection is restored. Other features require internet connection.

---

**Q: How often is data updated?**

**A:** Real-time! Survey submissions, CPAP updates, and dashboard data update immediately.

</div>

### Survey Questions

<div class="card no-break">

**Q: How long does each survey take?**

**A:** Approximately 20-30 minutes depending on respondent's familiarity with services.

---

**Q: What if the selected respondent (Kish Grid) is unavailable?**

**A:** Schedule a callback. Do not substitute with another household member as this violates sampling methodology.

---

**Q: Can I edit a submitted survey?**

**A:** No, submitted surveys cannot be edited. Save as draft if you need to make changes before final submission.

---

**Q: What if GPS is not available?**

**A:** You can manually enter coordinates or note the location in remarks. However, GPS verification is preferred.

---

**Q: How many surveys should I complete per day?**

**A:** Aim for 8-12 surveys per day, depending on travel time and survey complexity.

</div>

### CPAP Questions

<div class="card no-break">

**Q: When should I create a CPAP?**

**A:** After survey data collection is 100% complete and the executive summary is available.

---

**Q: How many action items should a CPAP have?**

**A:** No fixed number. Focus on quality over quantity. Typically 10-20 high-priority items covering all service areas.

---

**Q: Can I edit CPAP after submission?**

**A:** No, but if admin requests revision, status returns to Draft and you can edit.

---

**Q: What happens after CPAP is approved?**

**A:** You can update implementation progress (Actual Output, Status, Actual Date) but cannot add/delete items.

---

**Q: How often should I update CPAP progress?**

**A:** Monthly updates recommended, or whenever significant milestones are achieved.

</div>

### Dashboard & Analytics Questions

<div class="card no-break">

**Q: What does the satisfaction index mean?**

**A:** A composite score (0-100) representing overall citizen satisfaction, calculated using ML algorithms analyzing all survey responses.

---

**Q: Why is my barangay's score low?**

**A:** Low scores indicate areas needing improvement. Review the report card to identify specific issues and create targeted CPAP actions.

---

**Q: Can I compare my barangay to others?**

**A:** Yes, use the Analytics section to view barangay rankings and comparisons.

---

**Q: What is funnel analysis?**

**A:** It shows the progression: Awareness (know about service) → Availment (used service) → Satisfaction (happy with service). Helps identify where improvements are needed.

---

**Q: How is "Need for Action" calculated?**

**A:** Percentage of respondents who said a service needs improvement or action.

</div>

---


## 📞 Support & Contact

<div class="info-box no-break">

**📞 Need Help?**

We're here to support you every step of the way.

</div>

### Getting Help

<div class="card no-break">
<div class="card-header">🛠️ Technical Issues</div>

- Check Troubleshooting section
- Review FAQs
- Contact your system administrator
- Email technical support (if available)

</div>

<div class="card no-break">
<div class="card-header">🎓 Training</div>

- Request training sessions from your administrator
- Review role-specific sections in this manual
- Practice in a test environment (if available)

</div>

<div class="card no-break">
<div class="card-header">📊 Data Issues</div>

- Contact your Field Supervisor (Interviewers)
- Contact Administrator (Officers, FS)
- Provide specific details: what, when, where

</div>

### Best Practices

<div class="card no-break">
<div class="card-header">🔒 Security</div>

- Never share your password
- Log out when finished
- Don't leave system unattended while logged in
- Report suspicious activity immediately

</div>

<div class="card no-break">
<div class="card-header">📊 Data Quality</div>

- Double-check all entries before submitting
- Be honest and accurate in data collection
- Report any data quality concerns
- Follow survey protocols strictly

</div>

<div class="card no-break">
<div class="card-header">💬 Communication</div>

- Respond to comments and notifications promptly
- Keep administrators informed of issues
- Provide clear, detailed reports
- Ask questions when unsure

</div>

---

## 📝 Appendix

### Glossary

<div class="no-break">

<table>
<thead style="background: #667eea; color: white;">
<tr>
<th style="padding: 10px; text-align: left;">Term</th>
<th style="padding: 10px; text-align: left;">Definition</th>
</tr>
</thead>
<tbody>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><strong>PULSE</strong></td>
<td style="padding: 8px;">Public Understanding and Local Service Evaluation</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><strong>CPAP</strong></td>
<td style="padding: 8px;">Citizen Priority Action Plan - data-driven action plan</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><strong>Barangay</strong></td>
<td style="padding: 8px;">Smallest administrative division in the Philippines</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><strong>Kish Grid</strong></td>
<td style="padding: 8px;">Statistical method for randomly selecting survey respondents</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><strong>SGLGB</strong></td>
<td style="padding: 8px;">Seal of Good Local Governance for Barangays - national award</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><strong>Satisfaction Index</strong></td>
<td style="padding: 8px;">Composite score (0-100) representing overall citizen satisfaction</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><strong>Funnel Analysis</strong></td>
<td style="padding: 8px;">Analysis showing Awareness → Availment → Satisfaction progression</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><strong>MOE</strong></td>
<td style="padding: 8px;">Margin of Error - statistical measure of survey accuracy</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><strong>Field Supervisor (FS)</strong></td>
<td style="padding: 8px;">User role responsible for coordinating survey data collection</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><strong>Spot</strong></td>
<td style="padding: 8px;">Specific geographic location within a barangay for survey collection</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><strong>Offline Mode</strong></td>
<td style="padding: 8px;">Ability to conduct surveys without internet connection</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><strong>Geotagging</strong></td>
<td style="padding: 8px;">Recording GPS coordinates of survey location</td>
</tr>
</tbody>
</table>

</div>

### Keyboard Shortcuts

<div class="no-break">

<table>
<thead style="background: #3498db; color: white;">
<tr>
<th style="padding: 10px;">Shortcut</th>
<th style="padding: 10px;">Action</th>
</tr>
</thead>
<tbody>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><kbd>Ctrl</kbd> + <kbd>R</kbd> or <kbd>F5</kbd></td>
<td style="padding: 8px;">Refresh page</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
<td style="padding: 8px;">Print current page</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><kbd>Ctrl</kbd> + <kbd>F</kbd></td>
<td style="padding: 8px;">Find on page</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><kbd>Esc</kbd></td>
<td style="padding: 8px;">Close modal/dialog</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;"><kbd>Tab</kbd></td>
<td style="padding: 8px;">Navigate between form fields</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;"><kbd>Enter</kbd></td>
<td style="padding: 8px;">Submit form (when in text field)</td>
</tr>
</tbody>
</table>

</div>

### System Limits

<div class="no-break">

<table>
<thead style="background: #2c3e50; color: white;">
<tr>
<th style="padding: 10px; text-align: left;">Limit</th>
<th style="padding: 10px; text-align: left;">Value</th>
</tr>
</thead>
<tbody>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Maximum file upload size</td>
<td style="padding: 8px;"><strong>10MB</strong> (for barangay logos)</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">Survey session timeout</td>
<td style="padding: 8px;"><strong>2 hours</strong> of inactivity</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Password minimum length</td>
<td style="padding: 8px;"><strong>8 characters</strong></td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">Maximum CPAP items</td>
<td style="padding: 8px;"><strong>No limit</strong> (recommended 10-20)</td>
</tr>
<tr style="background: #f8f9fa;">
<td style="padding: 8px;">Offline storage</td>
<td style="padding: 8px;"><strong>50-100 surveys</strong> (browser dependent)</td>
</tr>
<tr style="background: #ffffff;">
<td style="padding: 8px;">CSV export limit</td>
<td style="padding: 8px;"><strong>10,000 rows</strong> per export</td>
</tr>
</tbody>
</table>

</div>

---

## 📄 Document Information

<div class="card no-break">
<div class="card-header" style="background: #2c3e50;">Document Details</div>

<table style="width: 100%;">
<tr>
<td style="padding: 8px; width: 200px;"><strong>Document Title:</strong></td>
<td style="padding: 8px;">PULSE System - Complete User Manual</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Version:</strong></td>
<td style="padding: 8px;">2.0</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Date:</strong></td>
<td style="padding: 8px;">January 7, 2026</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Prepared By:</strong></td>
<td style="padding: 8px;">PULSE Development Team</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Approved By:</strong></td>
<td style="padding: 8px;">System Administrator</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Distribution:</strong></td>
<td style="padding: 8px;">All PULSE Users</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Classification:</strong></td>
<td style="padding: 8px;">Internal Use</td>
</tr>
<tr>
<td style="padding: 8px;"><strong>Review Cycle:</strong></td>
<td style="padding: 8px;">Quarterly or upon major system updates</td>
</tr>
</table>

</div>

<div class="warning-box no-break">

📢 **Feedback:** Please report errors or suggestions for improvement to your system administrator.

</div>

---

<div class="card no-break" style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px;">

<h2 style="margin: 0 0 15px 0;">🎉 Thank You for Using PULSE!</h2>

<p style="font-size: 1.1em; margin: 15px 0;">
Empowering local governance through data-driven insights and citizen engagement.
</p>

<p style="margin: 20px 0;">
<img src="https://img.shields.io/badge/PULSE-System-white?style=flat-square" alt="PULSE">
<img src="https://img.shields.io/badge/Version-2.0-white?style=flat-square" alt="Version 2.0">
<img src="https://img.shields.io/badge/2026-Active-white?style=flat-square" alt="2026">
</p>

<p style="font-size: 0.9em; margin: 20px 0 0 0;">
For the latest version of this manual and additional resources,<br>
contact your system administrator.
</p>

</div>

<p align="center" style="margin: 20px 0;">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind">
</p>

<div class="card no-break" style="text-align: center; background: #ecf0f1; padding: 20px;">

<p style="color: #7f8c8d; font-size: 1.1em; margin: 0;">
<em>"Data-driven governance for a better tomorrow."</em>
</p>

<p style="color: #95a5a6; margin: 15px 0 0 0;">
— PULSE Development Team
</p>

</div>

---

<p align="center" style="color: #95a5a6; font-size: 0.9em;">
<strong>End of Manual</strong><br>
This document was optimized for PDF conversion with page-break controls.<br>
© 2026 PULSE System. All rights reserved.
</p>
