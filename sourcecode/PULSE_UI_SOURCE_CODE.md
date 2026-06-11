# PULSE System - User Interface Source Code

Complete source code for all user-facing pages in the PULSE (Public Understanding and Local Service Evaluation) system.

---

## Landing Page (Home)

**File:** `src/app/page.tsx`

Landing page with navigation, hero section, features, workflow, security info, and app download section.

Key sections:
- Navigation bar with login button
- Hero section with animated background blobs
- Stats section (Ready, Modern, Secure, 24/7)
- Core Features (Survey Management, Assignment Tracking, Real-time Analytics, Data Security)
- How PULSE Works (7-step workflow)
- About & Benefits
- Security & Privacy
- Download App (Android APK + iOS PWA)
- Footer

---

## Login Page

**File:** `src/app/login/page.tsx`

Split-screen login with animated logo on right, form on left.

Features:
- Email/password authentication
- Show/hide password toggle
- Redirect messages (session expired, no permission, etc.)
- Role-based redirect after login (developer → /tools, interviewer → /survey, fs → /fs-dashboard, others → /dashboard)
- Loading skeleton
- DILG/MLGRC logos at bottom

---

## Register Page

**File:** `src/app/register/page.tsx`

Two-column registration form with password validation.

Fields:
- First Name, Last Name
- Email
- Password (with real-time validation: 8+ chars, uppercase, lowercase, number, special char)
- Confirm Password
- Phone Number (11 digits max)
- Organization/Company Name
- Job Title/Role

Features:
- Real-time password strength indicator
- Form validation
- Success redirect to login

---

## Dashboard

**File:** `src/app/dashboard/page.tsx`

Main dashboard with map and analytics views.

Features:
- Toggle between Map View and Analytics View
- Protected route (admin, developer, fs, officer, viewer roles)
- Error boundary
- Uses DashboardLayout component

---

## Profile Page

**File:** `src/app/profile/page.tsx`

User profile management with tabs.

Tabs:
1. **Profile Tab:**
   - Profile picture upload (max 5MB)
   - First Name, Last Name
   - Email (read-only)
   - Role (read-only)
   - Barangay Logo upload (officers only)

2. **Security Tab:**
   - Change password
   - Current password
   - New password (with validation)
   - Confirm new password

Features:
- Image upload with base64 conversion
- Password validation (8+ chars, uppercase, lowercase, number, special char)
- Barangay logo management for officers

---

## Settings Page (Admin)

**File:** `src/app/settings/page.tsx`

Admin settings panel with sidebar navigation.

Sections:
- Survey Cycles
- Barangays
- Award Management
- Survey Targets
- Supervisor Assignments
- Users & Roles
- Backup

Features:
- Dynamic section loading
- Active cycle display
- Date/time display
- Role-based access (admin/developer for most sections, backup accessible by more roles)
- Sidebar toggle

---

## Survey Dashboard

**File:** `src/app/survey/page.tsx`

Field interviewer dashboard with assignments and spots.

Tabs:
1. **Overall Progress:**
   - Survey progress overview
   - Stats (targets, assignments, completed, in progress)
   - All barangay cards with progress bars

2. **My Spots** (interviewer/admin/developer):
   - Spot-based assignments
   - MySpotAssignments component

3. **Legacy Assignments** (interviewer only):
   - Old barangay-based assignments

Features:
- Offline indicator
- Auto-sync on reconnection
- User menu with profile/settings/logout
- Active cycle display
- Real-time progress tracking
- Refresh on page visibility change

---

## CPAP Overview Page

**File:** `src/app/cpap/page.tsx`

Citizen Priority Action Plan submission and tracking.

Features:
- Create new CPAP button (if none exists)
- CPAP info card with stats
- Status badges (Draft, Submitted, Approved, Revision Requested)
- Admin comments display
- Edit in spreadsheet view button
- Submit to DILG button
- Implementation progress tracker (for approved CPAPs)
- Read-only spreadsheet view
- Comments sidebar
- Notifications menu

Roles:
- Officer: Create/edit/submit
- Admin: Review/approve
- Viewer: Read-only

---

## CPAP Editor Page

**File:** `src/app/cpap/editor/page.tsx`

Spreadsheet-style CPAP editor.

Features:
- AI-powered suggestions button
- Tips card (dismissible)
- Spreadsheet component with:
  - Add/delete rows
  - Tab navigation
  - Auto-save
  - Validation
- AI suggestions modal
- Warning banner for AI-generated content

Fields per row:
- Priority Area
- Observation
- Target Output
- Success Indicator
- Responsible Person
- Timeline (Start/End)
- Actual Output
- Status of Accomplishment
- Actual Date

---

## Admin CPAP Management

**File:** `src/app/admin/cpap/page.tsx`

Admin view for reviewing all CPAPs.

Features:
- List of all CPAPs across barangays
- Status filtering
- Review/approve/request revision
- Notifications menu
- Cache-busting for fresh data

---

## Report Card Page

**File:** `src/app/reportcard/page.tsx`

Comprehensive barangay performance report.

Sections:
1. **Executive Summary:**
   - AI-generated summary
   - Key findings
   - Critical issues
   - Language toggle (Bisaya/Filipino/English)
   - Regenerate button

2. **Service Area Performance:**
   - Financial Assistance
   - Disaster Preparedness
   - Safety & Security
   - Social Services
   - Business & Livelihood
   - Environmental Management

3. **Governance & Integrity Snapshot:**
   - Transparency metrics
   - Accountability scores
   - Responsiveness ratings

4. **Community Voice:**
   - Sentiment analysis
   - Common themes
   - Verbatim comments

Features:
- Print view
- Force refresh button
- Cache management
- Survey completion progress indicator
- Funnel analysis integration

---

## FS Dashboard

**File:** `src/app/fs-dashboard/page.tsx`

Field Supervisor dashboard for managing interviewers and spots.

Tabs:
1. **Overview:**
   - Quick stats
   - Recent activity
   - Quick actions

2. **Assignments:**
   - Manage interviewer assignments
   - Assignment status tracking

3. **Spots:**
   - Spot allocation
   - Spot-based assignment management

4. **Spot Management:**
   - Create/edit/delete spots
   - Spot details

5. **Monitoring:**
   - Fieldwork progress monitoring
   - GPS verification
   - Interview tracking

Features:
- Lazy loading for performance
- Tab change events
- Protected route (admin, developer, fs roles)

---

## Developer Tools Page

**File:** `src/app/tools/page.tsx`

Developer-only tools for testing and data management.

Features:
1. **Data Generation:**
   - Generate synthetic survey data
   - Select barangay, response count, profile
   - Spot-based generation

2. **Data Deletion:**
   - Delete mock data for barangay
   - Delete all responses in cycle
   - Double confirmation

3. **Testing Tools:**
   - Test funnel analysis
   - Check database status
   - Check survey targets
   - Check barangay IDs
   - Check cycle data
   - Check assignment status
   - Analyze community voice

4. **Cache Management:**
   - View cache stats
   - Invalidate all cache
   - Invalidate barangay cache

5. **Debug Tools:**
   - Debug trends calculation
   - Run seeders

6. **Settings:**
   - Gemini API configuration

Features:
- Real-time progress tracking
- Result log (last 10 operations)
- Active cycle integration
- Role-based access (developer only)

---

## Common UI Patterns

### Authentication
- All pages use `ProtectedRoute` component
- Role-based access control
- Redirect to /forbidden for unauthorized access

### Navigation
- Header with logo, user menu, active cycle display
- Back buttons to dashboard
- Breadcrumbs in admin sections

### Loading States
- Skeleton loaders
- Spinner animations
- Progress bars

### Data Display
- Cards with stats
- Tables with sorting/filtering
- Charts and graphs
- Badge status indicators

### Forms
- Input validation
- Error messages
- Success toasts
- Confirmation dialogs

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Collapsible sidebars
- Stacked layouts on mobile

---

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State Management:** React hooks
- **Authentication:** Custom auth with JWT
- **API:** Next.js API routes
- **Database:** PostgreSQL (via API)

---

## Key Features Across All Pages

1. **Offline Support:**
   - Offline indicator
   - Auto-sync on reconnection
   - Local storage caching

2. **Real-time Updates:**
   - Live progress tracking
   - Auto-refresh on visibility change
   - WebSocket-ready architecture

3. **Accessibility:**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Color contrast compliance

4. **Performance:**
   - Lazy loading
   - Code splitting
   - Image optimization
   - Cache management

5. **Security:**
   - Role-based access control
   - Input validation
   - XSS protection
   - CSRF tokens

---

## File Structure

```
src/app/
├── page.tsx                    # Landing page
├── login/page.tsx              # Login
├── register/page.tsx           # Registration
├── dashboard/page.tsx          # Main dashboard
├── profile/page.tsx            # User profile
├── settings/page.tsx           # Admin settings
├── survey/page.tsx             # Survey dashboard
├── cpap/
│   ├── page.tsx                # CPAP overview
│   └── editor/page.tsx         # CPAP editor
├── admin/cpap/page.tsx         # Admin CPAP management
├── reportcard/page.tsx         # Report card
├── fs-dashboard/page.tsx       # FS dashboard
└── tools/page.tsx              # Developer tools
```

---

*This document contains the complete source code for all user-facing pages in the PULSE system. Each page is designed to be responsive, accessible, and performant.*
