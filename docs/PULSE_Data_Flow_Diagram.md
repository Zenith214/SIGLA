# PULSE System - Data Flow Diagram

## System Overview
PULSE (Public Understanding and Local Service Evaluation) is a comprehensive web application for measuring citizen satisfaction with local government services and evaluating barangay-level governance performance in the Philippines.

## High-Level Architecture Flow

```
[Web Browser/Mobile] 
    ↓
[Middleware - JWT Authentication] 
    ↓
[Next.js Application Layer]
    ├── Dashboard Views
    ├── Survey Forms  
    ├── Analytics Views
    └── Authentication
    ↓
[API Routes Layer]
    ├── Auth APIs
    ├── Survey APIs
    ├── Analytics APIs
    └── ML Integration APIs
    ↓
[Python ML Service] ← → [Prisma ORM] ← → [PostgreSQL Database]
```

## Detailed Data Flow Components

### 1. Authentication & Authorization Flow

```
User → Browser → POST /api/login → AuthAPI → Database (Validate Credentials)
                                      ↓
Database → AuthAPI → Browser (JWT Token + User Info) → Store JWT Cookie
                                      ↓
Subsequent Requests:
Browser (with JWT Cookie) → Middleware → Validate JWT → Allow/Redirect to Protected Routes
```

**Flow Steps:**
1. User submits login credentials
2. AuthAPI validates against database
3. JWT token generated and stored in secure cookie
4. Middleware validates JWT on each protected route request
5. User granted access based on role (Admin, Interviewer, Officer)

### 2. Survey Data Collection Flow

```
Field Interviewer → Survey Forms → Collect Data:
                                   ├── GPS Location (Geolocation)
                                   ├── Kish Grid Selection (Statistical Sampling)
                                   ├── Respondent Demographics
                                   └── Service Area Responses
                                   ↓
Survey API → Data Validation → Database Storage:
                               ├── survey_response (Main record)
                               ├── survey_section (6 service areas)
                               ├── survey_answer (Individual responses)
                               ├── barangay (Location data)
                               └── user (Interviewer info)
```

**Key Features:**
- **Offline Capability**: Surveys can be completed without internet
- **GPS Integration**: Automatic location tagging for responses
- **Kish Grid**: Statistical household member selection
- **Progress Tracking**: Real-time completion monitoring
- **Multi-language**: English and Filipino support

### 3. Analytics & ML Processing Flow

```
Data Sources:
├── Survey Responses (Individual citizen feedback)
├── Barangay Information (Demographics, officials)
└── Survey Cycles (Time-based campaigns)
    ↓
Analytics API → Data Aggregation → ML Service Integration
    ↓
Python ML Service (Port 8000):
├── Satisfaction Scoring (0-100% per service area)
├── Need for Action Analysis (Priority identification)
├── Trend Analysis (Historical comparisons)
└── Service Area Analysis (6 categories: Financial, Disaster, Safety, Social, Business, Environmental)
    ↓
Output Destinations:
├── Interactive Dashboard (Real-time visualizations)
├── Analytics Reports (Detailed breakdowns)
└── ML Insights (Actionable recommendations)
```

**ML Analysis Categories:**
- **Financial Administration**: Budget transparency, tax services
- **Disaster Preparedness**: Emergency response, risk reduction
- **Peace & Safety**: Crime prevention, conflict resolution
- **Social Services**: Health, education, welfare programs
- **Business & Livelihood**: Economic development, permits
- **Environmental Management**: Waste management, conservation

### 4. Dashboard Visualization Flow

```
User Interface Components:
├── Interactive SVG Map → Barangay Data API → Analytics Cache → Database
├── Analytics Dashboard → Analytics API → Real-time Aggregation → Database  
└── Barangay Details Panel → ML Insights API → ML Processing → Python ML Service
```

**Dashboard Features:**
- **Interactive Map**: Click-to-explore barangay territories with satisfaction color coding
- **Real-time Progress**: Live survey completion tracking per barangay
- **Historical Comparison**: Multi-cycle performance analysis
- **Award Indicators**: SGLGB (Seal of Good Local Governance for Barangays) status display
- **Role-based Views**: Customized dashboards for different user types

## Key Database Entities & Relationships

```
Core Entities:
├── User (Interviewers, Admins, Officers)
│   ├── Has many → Assignment (Barangay assignments)
│   ├── Creates many → SurveyResponse (Survey submissions)
│   └── Assigned to many → Spot (Geographic survey points)
│
├── Barangay (Municipal subdivisions)
│   ├── Receives many → Assignment (User assignments)
│   ├── Contains many → SurveyResponse (Citizen feedback)
│   ├── Has many → SurveyTarget (Response goals per cycle)
│   └── Contains many → Spot (Survey locations)
│
├── SurveyCycle (Time-based campaigns)
│   ├── Contains many → SurveyResponse (Responses during cycle)
│   ├── Defines many → SurveyTarget (Goals per barangay)
│   └── Creates many → Spot (Survey points for cycle)
│
└── SurveyResponse (Individual citizen feedback)
    ├── Contains many → SurveySection (6 service areas)
    └── SurveySection contains many → SurveyAnswer (Individual questions)
```

**Key Relationships:**
- **One User** can have **multiple Assignments** across different barangays
- **One Barangay** can have **multiple Survey Targets** across different cycles
- **One Survey Response** contains **exactly 6 Survey Sections** (service areas)
- **One Survey Cycle** defines the **active period** for data collection

## Data Flow Patterns

### 1. Real-time Survey Progress Tracking
```
Survey Form Submission → Progress Calculation → Dashboard Update
├── Source: Field interviewer completes survey sections
├── Processing: Automatic percentage calculation (completed/total sections)
└── Output: Live progress bars and completion status on dashboard
```

### 2. ML-Powered Satisfaction Analysis
```
Survey Responses → Data Aggregation → ML Service → Insights Generation
├── Source: Citizen feedback aggregated by barangay and service area
├── Processing: Python ML service analyzes satisfaction and need-for-action
└── Output: Color-coded map, satisfaction scores, priority recommendations
```

### 3. Cycle-Aware Historical Comparison
```
Multi-Cycle Data → Trend Analysis → Historical Visualization
├── Source: Survey data from multiple campaign periods
├── Processing: Cross-cycle comparison and trend identification
└── Output: Historical performance charts and improvement tracking
```

### 4. Role-Based Data Access
```
User Login → Role Verification → Customized Interface
├── Admin: Full system access, user management, settings
├── Interviewer: Survey forms, assigned barangays, progress tracking
└── Officer: Read-only dashboards, analytics, reports
```

## Security & Performance Considerations

### Authentication & Security Flow
```
Login Request → JWT Generation → Secure Cookie Storage → Middleware Validation
├── JWT tokens with 10-minute inactivity timeout
├── Role-based route protection (Admin, Interviewer, Officer)
├── Secure cookie storage with HttpOnly flags
└── Middleware validates every protected route request
```

### Data Caching & Performance
```
Expensive Operations → Cache Layer → TTL Management → Fresh Data Delivery
├── Analytics cache with 5-minute TTL for ML computations
├── Real-time updates for survey progress (no caching)
├── Optimized Prisma queries with proper indexing
└── Background data aggregation for dashboard KPIs
```

### Offline Capability Flow
```
Online Survey → Local Storage → Connection Lost → Offline Mode → Reconnection → Auto Sync
├── Service worker enables offline survey continuation
├── Draft responses stored locally in browser
├── Automatic sync when internet connection restored
└── Conflict resolution for concurrent edits
```

## System Integration Points

### External Services
- **Python ML Service**: Runs on port 8000, provides satisfaction analysis
- **Leaflet Maps**: Dynamic map loading for geolocation features
- **Chart.js**: Client-side data visualization rendering

### API Endpoints Structure
```
/api/
├── auth/ (Login, logout, user management)
├── survey/ (Form submission, progress tracking)
├── analytics/ (Dashboard data, ML insights)
├── barangays-with-assignments/ (Assignment management)
└── ml/ (ML service integration endpoints)
```

This simplified data flow diagram shows how the PULSE system efficiently processes citizen feedback from collection to actionable governance insights, emphasizing real-time capabilities and ML-powered analysis for evidence-based local government improvement.