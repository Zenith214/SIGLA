# Backup System Quick Reference

## 🚀 Quick Start

```bash
# 1. Run migration
psql $DATABASE_URL -f database/migrations/add_data_export_audit_log.sql

# 2. Update Prisma
npx prisma generate

# 3. Restart app
npm run dev
```

## 🔒 Privacy Features

### Anonymization Examples

| Original | Anonymized |
|----------|------------|
| "Juan Dela Cruz" | "J***8f4e2a1c" |
| Age: 34 | "30-39" |
| "john@example.com" | "user_a1b2c3d4@example.com" |

### Default Behavior
- ✅ **All exports anonymized by default**
- ✅ **Personal data automatically protected**
- ✅ **No configuration needed**

## 👥 Role Permissions

| Role | Survey Data | User Data | Barangay | Reports | Full Data |
|------|-------------|-----------|----------|---------|-----------|
| Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ Anon | ✅ Anon | ✅ | ✅ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ✅ | ❌ |
| Others | ❌ | ❌ | ❌ | ❌ | ❌ |

## 📝 Audit Logs

### View Recent Exports
```sql
SELECT 
  u.email,
  del.export_type,
  del.anonymized,
  del.record_count,
  del.exported_at
FROM data_export_log del
JOIN "user" u ON del.user_id = u.id
ORDER BY del.exported_at DESC
LIMIT 10;
```

### Check Specific User
```sql
SELECT * FROM data_export_log 
WHERE user_id = 123 
ORDER BY exported_at DESC;
```

## 🔧 API Usage

### Anonymized Export (Default)
```javascript
fetch('/api/backups?export=survey-data', {
  credentials: 'include'
});
```

### Full Export (Super Admin Only)
```javascript
fetch('/api/backups?export=survey-data&anonymized=false', {
  credentials: 'include'
});
```

## ⚠️ Common Issues

### 401 Unauthorized
**Fix**: Log out and log back in

### 403 Forbidden
**Fix**: Check user role
```sql
SELECT role FROM "user" WHERE email = 'your@email.com';
UPDATE "user" SET role = 'admin' WHERE email = 'your@email.com';
```

### Names Not Anonymized
**Fix**: Ensure `anonymized=true` (default)

### Audit Logs Empty
**Fix**: Check table exists
```sql
SELECT * FROM data_export_log LIMIT 1;
```

## 📊 What's Exported

### Survey Data
- ✅ Response metadata
- ✅ Respondent demographics (anonymized)
- ❌ Detailed answers (not included)
- ❌ GPS coordinates (not included)

### User Data
- ✅ User accounts (anonymized)
- ✅ Roles and status
- ❌ Passwords (never exported)

### Barangay Data
- ✅ Public administrative data
- ✅ Population, households
- ✅ Seal status

### Reports
- ✅ Aggregated statistics
- ✅ Analytics insights
- ✅ No personal data

## 🎯 Key Changes

### Removed ❌
- Fake 75% progress bar
- Misleading "2 minutes remaining"
- Unprotected personal data exports

### Added ✅
- Automatic anonymization
- Role-based access control
- Comprehensive audit logging
- Privacy notices in UI
- Security checks

## 📚 Documentation

- **Complete Guide**: `docs/BACKUP_PRIVACY_SECURITY.md`
- **Migration Steps**: `BACKUP_MIGRATION_GUIDE.md`
- **Architecture**: `docs/BACKUP_SYSTEM_ARCHITECTURE.md`
- **Summary**: `BACKUP_SYSTEM_FIXES_SUMMARY.md`

## 🆘 Support

1. Check documentation files
2. Review audit logs
3. Check server logs
4. Contact system admin

## ✅ Testing Checklist

- [ ] Migration completed
- [ ] Prisma client updated
- [ ] App restarted
- [ ] Can export data
- [ ] Names anonymized
- [ ] Audit log created
- [ ] Permissions enforced
- [ ] Progress bar removed

## 🎉 Result

**Enterprise-grade backup system with:**
- 🔒 Privacy protection
- 👥 Access control
- 📝 Audit trail
- ✅ GDPR compliance
