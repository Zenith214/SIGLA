# Backup System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                  (Settings → Data Backup)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Click Export Button
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND HANDLER                             │
│              (src/app/settings/ui/sections/backup.tsx)          │
│                                                                 │
│  • Shows privacy notice                                         │
│  • Adds anonymized=true parameter                              │
│  • Includes auth credentials                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ GET /api/backups?export=survey-data&anonymized=true
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION CHECK                         │
│                  (getUserFromSession)                           │
│                                                                 │
│  ✓ Valid session token?                                        │
│  ✓ User exists in database?                                    │
│                                                                 │
│  ❌ No → Return 401 Unauthorized                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ User authenticated
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION CHECK                          │
│                    (canExportData)                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Role: super_admin                                │          │
│  │ ✓ Can export everything (anonymized or full)    │          │
│  └──────────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Role: admin                                      │          │
│  │ ✓ Can export anonymized data only               │          │
│  │ ❌ Cannot export full data                       │          │
│  └──────────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │ Role: viewer                                     │          │
│  │ ✓ Can export reports only                       │          │
│  │ ❌ Cannot export sensitive data                  │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ❌ Insufficient permissions → Return 403 Forbidden            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ User authorized
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA RETRIEVAL                               │
│                  (Query Supabase)                               │
│                                                                 │
│  SELECT response_id, barangay_id, interviewer_id,              │
│         respondent_name, respondent_age, respondent_gender     │
│  FROM survey_response                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Raw data retrieved
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANONYMIZATION LAYER                          │
│              (if anonymized=true, default)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │ respondent_name: "Juan Dela Cruz"                │          │
│  │ ↓ anonymizeName()                                │          │
│  │ ✓ "J***8f4e2a1c"                                 │          │
│  └──────────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │ respondent_age: 34                               │          │
│  │ ↓ Age grouping                                   │          │
│  │ ✓ "30-39"                                        │          │
│  └──────────────────────────────────────────────────┘          │
│  ┌──────────────────────────────────────────────────┐          │
│  │ email: "juan@example.com"                        │          │
│  │ ↓ anonymizeEmail()                               │          │
│  │ ✓ "user_a1b2c3d4@example.com"                    │          │
│  └──────────────────────────────────────────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Anonymized data
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CSV CONVERSION                               │
│                  (convertToCSV)                                 │
│                                                                 │
│  • Convert to CSV format                                       │
│  • Escape special characters                                   │
│  • Add headers                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ CSV file ready
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIT LOGGING                                │
│                  (logDataExport)                                │
│                                                                 │
│  INSERT INTO data_export_log (                                 │
│    user_id: 123,                                               │
│    export_type: "survey-data",                                 │
│    anonymized: true,                                           │
│    record_count: 1234,                                         │
│    exported_at: NOW()                                          │
│  )                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Audit logged
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE WITH METADATA                       │
│                                                                 │
│  Headers:                                                      │
│  • Content-Type: text/csv                                     │
│  • Content-Disposition: attachment; filename="..."            │
│  • X-Data-Privacy: anonymized                                 │
│  • X-Record-Count: 1234                                       │
│                                                                 │
│  Body: CSV file content                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Download starts
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER RECEIVES FILE                           │
│                                                                 │
│  • File downloaded to user's computer                          │
│  • Toast notification shows success                            │
│  • Privacy level displayed                                     │
│  • Record count shown                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Anonymization Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAW DATABASE DATA                            │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │  respondent_name: "Juan Dela Cruz"     │
        │  respondent_age: 34                    │
        │  email: "juan.delacruz@example.com"    │
        └────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANONYMIZATION FUNCTIONS                      │
└─────────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ anonymizeName│    │ Age Grouping │    │anonymizeEmail│
│              │    │              │    │              │
│ 1. Get first │    │ 1. Divide by │    │ 1. Split @   │
│    letter    │    │    10        │    │    domain    │
│ 2. Hash full │    │ 2. Multiply  │    │ 2. Hash user │
│    name      │    │    by 10     │    │ 3. Keep      │
│ 3. Take 8    │    │ 3. Create    │    │    domain    │
│    chars     │    │    range     │    │              │
│ 4. Combine   │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
  "J***8f4e2a1c"       "30-39"      "user_a1b2c3d4@example.com"
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
        ┌────────────────────────────────────────┐
        │  respondent_name: "J***8f4e2a1c"       │
        │  respondent_age: "30-39"               │
        │  email: "user_a1b2c3d4@example.com"    │
        └────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANONYMIZED CSV EXPORT                        │
└─────────────────────────────────────────────────────────────────┘
```

## Role-Based Access Control Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPORT PERMISSIONS MATRIX                    │
└─────────────────────────────────────────────────────────────────┘

Export Type: SURVEY DATA
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ super_admin  │    admin     │    viewer    │    officer   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ✅ Full      │ ✅ Anonymized│ ❌ Denied    │ ❌ Denied    │
│ ✅ Anonymized│              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘

Export Type: USER DATA
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ super_admin  │    admin     │    viewer    │    officer   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ✅ Full      │ ✅ Anonymized│ ❌ Denied    │ ❌ Denied    │
│ ✅ Anonymized│              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘

Export Type: BARANGAY DATA (Public)
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ super_admin  │    admin     │    viewer    │    officer   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ✅ Allowed   │ ✅ Allowed   │ ❌ Denied    │ ❌ Denied    │
└──────────────┴──────────────┴──────────────┴──────────────┘

Export Type: REPORTS (Aggregated)
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ super_admin  │    admin     │    viewer    │    officer   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ ✅ Allowed   │ ✅ Allowed   │ ✅ Allowed   │ ❌ Denied    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Audit Log Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    data_export_log TABLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  id              SERIAL PRIMARY KEY                             │
│  user_id         INTEGER NOT NULL  ──────┐                     │
│  export_type     VARCHAR(50)             │                     │
│  anonymized      BOOLEAN DEFAULT true    │                     │
│  record_count    INTEGER DEFAULT 0       │                     │
│  exported_at     TIMESTAMP DEFAULT NOW() │                     │
│  ip_address      VARCHAR(45)             │                     │
│  user_agent      TEXT                    │                     │
│                                           │                     │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                                            │ Foreign Key
                                            ▼
                                  ┌──────────────────┐
                                  │   user TABLE     │
                                  ├──────────────────┤
                                  │ id (PRIMARY KEY) │
                                  │ email            │
                                  │ role             │
                                  │ ...              │
                                  └──────────────────┘

Example Audit Log Entry:
┌─────────────────────────────────────────────────────────────────┐
│ id: 1                                                           │
│ user_id: 123                                                    │
│ export_type: "survey-data"                                      │
│ anonymized: true                                                │
│ record_count: 1234                                              │
│ exported_at: "2024-12-02 14:30:00"                             │
│ ip_address: "192.168.1.100"                                    │
│ user_agent: "Mozilla/5.0..."                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

Layer 1: AUTHENTICATION
┌─────────────────────────────────────────────────────────────────┐
│ • Session token validation                                      │
│ • User existence check                                          │
│ • Returns 401 if not authenticated                              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
Layer 2: AUTHORIZATION
┌─────────────────────────────────────────────────────────────────┐
│ • Role-based permission check                                   │
│ • Export type validation                                        │
│ • Anonymization requirement enforcement                         │
│ • Returns 403 if insufficient permissions                       │
└─────────────────────────────────────────────────────────────────┘
                             ↓
Layer 3: DATA ANONYMIZATION
┌─────────────────────────────────────────────────────────────────┐
│ • Automatic by default (anonymized=true)                        │
│ • Hash personal identifiers                                     │
│ • Group sensitive data (ages)                                   │
│ • Preserve utility while protecting privacy                     │
└─────────────────────────────────────────────────────────────────┘
                             ↓
Layer 4: AUDIT LOGGING
┌─────────────────────────────────────────────────────────────────┐
│ • Log every export attempt                                      │
│ • Track user, type, anonymization status                        │
│ • Immutable audit trail                                         │
│ • Compliance and security monitoring                            │
└─────────────────────────────────────────────────────────────────┘
                             ↓
Layer 5: SECURE TRANSMISSION
┌─────────────────────────────────────────────────────────────────┐
│ • HTTPS required                                                │
│ • Privacy metadata in headers                                   │
│ • No temporary files                                            │
│ • In-memory processing only                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Backup.tsx Component                                  │     │
│  │  • handleExportData()                                  │     │
│  │  • Privacy notice display                              │     │
│  │  • Toast notifications                                 │     │
│  └────────────────────┬───────────────────────────────────┘     │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ HTTP Request
                        │ GET /api/backups?export=...&anonymized=true
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│                         BACKEND API                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  route.ts - Main Handler                              │     │
│  │  • GET() - Main export handler                        │     │
│  │  • POST() - Backup creation                           │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐     │
│  │  Authentication & Authorization                        │     │
│  │  • getUserFromSession()                               │     │
│  │  • canExportData()                                    │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐     │
│  │  Export Functions                                      │     │
│  │  • exportSurveyData()                                 │     │
│  │  • exportUserData()                                   │     │
│  │  • exportBarangayData()                               │     │
│  │  • exportReports()                                    │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐     │
│  │  Privacy Functions                                     │     │
│  │  • anonymizeName()                                    │     │
│  │  • anonymizeEmail()                                   │     │
│  │  • hashPersonalData()                                 │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐     │
│  │  Utility Functions                                     │     │
│  │  • convertToCSV()                                     │     │
│  │  • generateFilename()                                 │     │
│  │  • logDataExport()                                    │     │
│  └────────────────────┬───────────────────────────────────┘     │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        │ Database Queries
                        │
┌───────────────────────▼──────────────────────────────────────────┐
│                         DATABASE                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  survey_response                                       │     │
│  │  • response_id, respondent_name, respondent_age, ...  │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  user                                                  │     │
│  │  • id, email, firstName, lastName, role, ...          │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  barangay                                              │     │
│  │  • barangay_id, barangay_name, population, ...        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  data_export_log (NEW)                                │     │
│  │  • id, user_id, export_type, anonymized, ...         │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

## Summary

This architecture provides:

1. **Multi-layer security** - Authentication, authorization, anonymization, audit logging
2. **Privacy by default** - Automatic anonymization unless explicitly disabled
3. **Role-based access** - Different permissions for different user types
4. **Complete audit trail** - Every export logged for compliance
5. **Secure data handling** - In-memory processing, no temporary files
6. **Clear separation of concerns** - Each layer has a specific responsibility

The system is designed to be **secure, compliant, and maintainable** while providing necessary functionality for data backup and export operations.
