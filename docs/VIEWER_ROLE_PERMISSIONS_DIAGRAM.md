# Viewer Role Permissions - Visual Diagram

## System Access Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      PULSE System                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Authentication Layer                   │    │
│  │  (All users must authenticate)                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Role-Based Access Control              │    │
│  │                                                      │    │
│  │  Admin/Developer → Full Access                      │    │
│  │  Officer        → CPAP Management + Operations      │    │
│  │  Viewer         → Read-Only Access                  │    │
│  │  FS/Interviewer → Field Operations                  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Viewer Access Map

```
┌─────────────────────────────────────────────────────────────┐
│                    Viewer Role Access                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✅ ALLOWED ACCESS (Read-Only)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Main Dashboard                                          │
│     ├── 🗺️  Map Tab                                         │
│     │    ├── View barangay locations                        │
│     │    ├── View survey markers                            │
│     │    └── View statistics                                │
│     │                                                        │
│     └── 📈 Analytics Tab                                    │
│          ├── View survey analytics                          │
│          ├── View demographics                              │
│          ├── View service area data                         │
│          └── View dashboard summary                         │
│                                                              │
│  📋 CPAP Management Dashboard                               │
│     ├── View CPAP submissions                               │
│     ├── View action items                                   │
│     ├── View progress tracking                              │
│     ├── View status (Draft, Submitted, Approved)            │
│     └── View admin comments                                 │
│                                                              │
│  💾 Backup Settings                                         │
│     ├── View backup history                                 │
│     ├── Create backups                                      │
│     └── Download backups                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ❌ RESTRICTED ACCESS (No Write Operations)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🚫 CPAP Operations                                         │
│     ├── ❌ Create new CPAP                                  │
│     ├── ❌ Add action items                                 │
│     ├── ❌ Edit action items                                │
│     ├── ❌ Delete action items                              │
│     ├── ❌ Submit CPAP to DILG                              │
│     ├── ❌ Update progress                                  │
│     └── ❌ Use AI suggestions                               │
│                                                              │
│  🚫 Admin Settings                                          │
│     ├── ❌ Survey Cycles management                         │
│     ├── ❌ Barangays management                             │
│     ├── ❌ Award Management                                 │
│     ├── ❌ Survey Targets                                   │
│     ├── ❌ Supervisor Assignments                           │
│     └── ❌ Users & Roles management                         │
│                                                              │
│  🚫 Survey Operations                                       │
│     ├── ❌ Conduct surveys                                  │
│     ├── ❌ Submit responses                                 │
│     ├── ❌ Manage assignments                               │
│     └── ❌ Create spots                                     │
│                                                              │
│  🚫 General CRUD Operations                                 │
│     ├── ❌ Create any records                               │
│     ├── ❌ Update any records                               │
│     └── ❌ Delete any records                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Permission Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Action Flow                          │
└─────────────────────────────────────────────────────────────┘

User Attempts Action
        ↓
┌───────────────────┐
│ Is Authenticated? │
└───────────────────┘
        ↓ Yes
┌───────────────────┐
│   Check Role      │
└───────────────────┘
        ↓
┌───────────────────────────────────────┐
│ Is Viewer?                            │
├───────────────────────────────────────┤
│ Yes ↓                    No ↓         │
│                                       │
│ Read Operation?    Check specific     │
│ ├─ Yes → ✅ Allow  role permissions   │
│ └─ No  → ❌ Deny                      │
│                                       │
│ Show "Read-Only"   Process normally   │
│ message                               │
└───────────────────────────────────────┘
```

## UI Component Behavior

```
┌─────────────────────────────────────────────────────────────┐
│              CPAP Dashboard - Viewer View                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 👁️ Viewing Mode                                    │    │
│  │ You are viewing this CPAP in read-only mode.       │    │
│  │ You cannot make changes or submit action plans.    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Barangay: Katipunan                                        │
│  Status: Draft                                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Action Item #1                                      │    │
│  │ Priority Area: Infrastructure Development           │    │
│  │ Target Output: Build 2 new roads                    │    │
│  │ Success Indicator: Roads completed by Q4            │    │
│  │                                                      │    │
│  │ [Edit] [Delete] ← Hidden for Viewer                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [+ Add Item] ← Hidden for Viewer                          │
│  [✨ AI Suggestions] ← Hidden for Viewer                   │
│  [Submit to DILG] ← Hidden for Viewer                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│              Settings Page - Viewer View                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Sidebar:                                                    │
│  ┌──────────────────┐                                       │
│  │ Settings         │                                       │
│  │ Backup Access    │                                       │
│  ├──────────────────┤                                       │
│  │ 💾 Backup        │ ← Only option visible                │
│  └──────────────────┘                                       │
│                                                              │
│  Main Content:                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Backup Management                                   │    │
│  │                                                      │    │
│  │ [Create Backup] ← Allowed                          │    │
│  │                                                      │    │
│  │ Backup History:                                     │    │
│  │ - 2024-12-01 10:30 AM (5.2 MB) [Download]         │    │
│  │ - 2024-11-30 10:30 AM (5.1 MB) [Download]         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## API Protection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    API Request Flow                          │
└─────────────────────────────────────────────────────────────┘

Client Request
     ↓
┌─────────────────┐
│ Middleware      │
│ - Check Auth    │
│ - Extract Role  │
└─────────────────┘
     ↓
┌─────────────────────────────────────┐
│ API Route Handler                   │
├─────────────────────────────────────┤
│                                     │
│ GET Request?                        │
│ ├─ Yes → verifyAuth()              │
│ │         ↓                         │
│ │         ✅ Allow (Read)           │
│ │                                   │
│ └─ No (POST/PUT/DELETE)            │
│           ↓                         │
│    requireWritePermission()         │
│           ↓                         │
│    Is Viewer?                       │
│    ├─ Yes → ❌ 403 Forbidden       │
│    │         "Read-only access"    │
│    │                                │
│    └─ No → ✅ Continue              │
│                                     │
└─────────────────────────────────────┘
```

## Role Comparison Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                    Feature Access Matrix                          │
├──────────────┬───────┬───────────┬─────────┬────────┬────────────┤
│ Feature      │ Admin │ Developer │ Officer │ Viewer │ FS/Inter.  │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ View         │       │           │         │        │            │
│ Dashboards   │  ✅   │    ✅     │   ✅    │   ✅   │    ✅      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ View         │       │           │         │        │            │
│ Analytics    │  ✅   │    ✅     │   ✅    │   ✅   │    ✅      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ View CPAP    │  ✅   │    ✅     │   ✅    │   ✅   │    ❌      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ Edit CPAP    │  ✅   │    ✅     │   ✅    │   ❌   │    ❌      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ Submit CPAP  │  ✅   │    ✅     │   ✅    │   ❌   │    ❌      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ Admin        │       │           │         │        │            │
│ Settings     │  ✅   │    ✅     │   ❌    │   ❌   │    ❌      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ Backup       │       │           │         │        │            │
│ Settings     │  ✅   │    ✅     │   ✅    │   ✅   │    ✅      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ Conduct      │       │           │         │        │            │
│ Surveys      │  ❌   │    ❌     │   ❌    │   ❌   │    ✅      │
├──────────────┼───────┼───────────┼─────────┼────────┼────────────┤
│ Manage       │       │           │         │        │            │
│ Assignments  │  ✅   │    ✅     │   ❌    │   ❌   │    ✅      │
└──────────────┴───────┴───────────┴─────────┴────────┴────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Architecture                     │
└─────────────────────────────────────────────────────────────┘

Layer 1: Client-Side (UI)
┌────────────────────────────────────┐
│ - Hide action buttons              │
│ - Show read-only messages          │
│ - Disable form inputs              │
│ - Conditional rendering            │
└────────────────────────────────────┘
         ↓ (Can be bypassed)

Layer 2: API Middleware
┌────────────────────────────────────┐
│ - Verify JWT token                 │
│ - Extract user role                │
│ - Check authentication             │
└────────────────────────────────────┘
         ↓

Layer 3: Route Handler
┌────────────────────────────────────┐
│ - requireWritePermission()         │
│ - Role-specific checks             │
│ - Return 403 for violations        │
└────────────────────────────────────┘
         ↓

Layer 4: Service Layer
┌────────────────────────────────────┐
│ - CPAPPermissionService            │
│ - Business logic validation        │
│ - Resource-level permissions       │
└────────────────────────────────────┘
         ↓

Layer 5: Database
┌────────────────────────────────────┐
│ - Row-level security (if enabled)  │
│ - Audit logging                    │
│ - Transaction integrity            │
└────────────────────────────────────┘
```

## Implementation Summary

```
┌─────────────────────────────────────────────────────────────┐
│              Viewer Role Implementation                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Core Files:                                                │
│  ├── src/lib/permissions.ts         (Permission logic)     │
│  ├── src/hooks/usePermissions.ts    (React hook)           │
│  └── src/lib/auth-middleware.ts     (API protection)       │
│                                                              │
│  UI Updates:                                                │
│  ├── src/app/cpap/page.tsx          (CPAP dashboard)       │
│  ├── src/components/cpap/           (CPAP components)      │
│  └── src/app/settings/              (Settings page)        │
│                                                              │
│  API Protection:                                            │
│  ├── src/app/api/cpap/route.ts      (Create CPAP)          │
│  ├── src/app/api/cpap/[id]/route.ts (Update CPAP)          │
│  ├── .../[id]/submit/route.ts       (Submit CPAP)          │
│  └── .../[id]/progress/route.ts     (Update progress)      │
│                                                              │
│  Database:                                                  │
│  └── database/reinstate-viewer-role.sql                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- ✅ = Allowed/Enabled
- ❌ = Denied/Disabled
- 👁️ = Viewer-specific feature
- 🚫 = Restricted access
- 📊 = Dashboard
- 📋 = CPAP Management
- 💾 = Backup
