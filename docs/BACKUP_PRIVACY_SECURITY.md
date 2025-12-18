# Backup System Privacy & Security Documentation

## Overview

The SIGLA backup system has been enhanced with comprehensive privacy protection, audit logging, and role-based access controls to ensure compliance with data protection regulations and best practices.

## Privacy Features

### 1. Automatic Data Anonymization

By default, all exports containing personal data are **automatically anonymized**:

#### Survey Data Anonymization
- **Respondent Names**: Converted to format `F***a1b2c3d4` (first letter + hash)
  - Example: "Juan Dela Cruz" → "J***8f4e2a1c"
- **Ages**: Grouped into 10-year ranges for privacy
  - Example: Age 34 → "30-39"
- **Gender**: Kept as-is (categorical data, not identifying)

#### User Data Anonymization
- **Email Addresses**: Username hashed, domain preserved
  - Example: "john.doe@example.com" → "user_a1b2c3d4@example.com"
- **First Names**: Converted to format `J***8f4e2a1c`
- **Last Names**: Converted to format `D***9e3f1b2a`

#### What's NOT Anonymized
- Barangay data (public administrative information)
- Reports (aggregated statistics only)
- IDs and timestamps (non-identifying metadata)

### 2. Role-Based Access Control

Different user roles have different export permissions:

| Role | Survey Data | User Data | Barangay Data | Reports | Full Data Access |
|------|-------------|-----------|---------------|---------|------------------|
| **Super Admin** | ✅ Full | ✅ Full | ✅ | ✅ | ✅ Yes |
| **Admin** | ✅ Anonymized | ✅ Anonymized | ✅ | ✅ | ❌ No |
| **Viewer** | ❌ | ❌ | ❌ | ✅ | ❌ No |
| **Officer/FI/FS** | ❌ | ❌ | ❌ | ❌ | ❌ No |

### 3. Audit Logging

Every data export is logged with:
- **User ID**: Who performed the export
- **Export Type**: What data was exported
- **Anonymization Status**: Whether data was anonymized
- **Record Count**: How many records were exported
- **Timestamp**: When the export occurred
- **IP Address**: Where the request came from (future enhancement)

#### Viewing Audit Logs

Audit logs are stored in the `data_export_log` table:

```sql
SELECT 
  del.id,
  u.email as user_email,
  u.role as user_role,
  del.export_type,
  del.anonymized,
  del.record_count,
  del.exported_at
FROM data_export_log del
JOIN "user" u ON del.user_id = u.id
ORDER BY del.exported_at DESC
LIMIT 100;
```

## Security Features

### 1. Authentication Required

All export endpoints require valid authentication:
- User must be logged in
- Session token must be valid
- Returns 401 Unauthorized if not authenticated

### 2. Authorization Checks

Before any export:
1. User role is verified
2. Export type is validated
3. Anonymization requirement is enforced
4. Returns 403 Forbidden if insufficient permissions

### 3. Data Minimization

The system only exports necessary fields:
- **Survey responses**: Metadata only, NOT detailed answers
- **User data**: No passwords, no sensitive personal info
- **GPS coordinates**: NOT included in exports

### 4. Secure File Handling

- Files are generated in-memory (not stored on disk)
- Downloads use secure headers
- No temporary files left behind
- Automatic cleanup after download

## API Usage

### Export with Anonymization (Default)

```javascript
// Anonymized export (default)
fetch('/api/backups?export=survey-data', {
  credentials: 'include'
});

// Explicitly anonymized
fetch('/api/backups?export=survey-data&anonymized=true', {
  credentials: 'include'
});
```

### Export Full Data (Super Admin Only)

```javascript
// Full data export (requires super_admin role)
fetch('/api/backups?export=survey-data&anonymized=false', {
  credentials: 'include'
});
```

### Response Headers

Successful exports include privacy metadata:

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="survey_data_anonymized_2024-12-02.csv"
X-Data-Privacy: anonymized
X-Record-Count: 1234
```

## Database Schema

### Data Export Log Table

```sql
CREATE TABLE data_export_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  export_type VARCHAR(50) NOT NULL,
  anonymized BOOLEAN DEFAULT true,
  record_count INTEGER DEFAULT 0,
  exported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  CONSTRAINT fk_export_user FOREIGN KEY (user_id) 
    REFERENCES "user"(id) ON DELETE CASCADE
);
```

## Compliance Considerations

### GDPR Compliance

✅ **Right to Access**: Users can export their data
✅ **Data Minimization**: Only necessary fields exported
✅ **Purpose Limitation**: Exports logged with purpose
✅ **Security**: Anonymization and access controls
✅ **Accountability**: Audit trail of all exports

### Data Protection Best Practices

✅ **Pseudonymization**: Personal identifiers hashed
✅ **Access Control**: Role-based permissions
✅ **Audit Logging**: Complete export history
✅ **Secure Transmission**: HTTPS required
✅ **No Plaintext Storage**: Passwords never exported

## Migration Guide

### Step 1: Run Database Migration

```bash
# Apply the audit log table migration
psql $DATABASE_URL -f database/migrations/add_data_export_audit_log.sql
```

### Step 2: Update Prisma Schema

```bash
# Generate Prisma client with new model
npx prisma generate
```

### Step 3: Test Exports

1. Log in as different user roles
2. Try exporting each data type
3. Verify anonymization is working
4. Check audit logs are being created

### Step 4: Review Audit Logs

```sql
-- Check recent exports
SELECT * FROM data_export_log 
ORDER BY exported_at DESC 
LIMIT 10;
```

## Troubleshooting

### "Unauthorized" Error

**Problem**: Getting 401 error when exporting
**Solution**: Ensure user is logged in and session is valid

### "Forbidden" Error

**Problem**: Getting 403 error when exporting
**Solution**: Check user role has permission for that export type

### Anonymization Not Working

**Problem**: Seeing full names in exports
**Solution**: Verify `anonymized=true` parameter is set (default)

### Audit Logs Not Created

**Problem**: No entries in `data_export_log` table
**Solution**: 
1. Check table exists: `\dt data_export_log`
2. Check user_id is valid
3. Review server logs for errors

## Future Enhancements

### Planned Features

- [ ] IP address capture for audit logs
- [ ] User agent logging
- [ ] Export rate limiting
- [ ] Encrypted backup storage
- [ ] Scheduled automatic backups
- [ ] Backup retention policies
- [ ] Data export approval workflow
- [ ] Email notifications for exports
- [ ] Export size limits
- [ ] Differential backups

### Security Roadmap

- [ ] Two-factor authentication for exports
- [ ] Export approval for sensitive data
- [ ] Automatic data retention enforcement
- [ ] PII detection and masking
- [ ] Encryption at rest for backups
- [ ] Secure backup storage (S3, etc.)

## Support

For questions or issues with the backup system:
1. Check this documentation
2. Review audit logs for errors
3. Check server logs for detailed error messages
4. Contact system administrator

## Change Log

### Version 2.0 (2024-12-02)
- ✅ Added automatic data anonymization
- ✅ Implemented role-based access control
- ✅ Added comprehensive audit logging
- ✅ Enhanced security with authentication checks
- ✅ Added privacy metadata to exports
- ✅ Created data export log table
- ✅ Updated UI with privacy notices

### Version 1.0 (Previous)
- Basic export functionality
- No anonymization
- No access controls
- No audit logging
