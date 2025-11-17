# CSIS Rollback - Quick Reference

## Quick Commands

### Test Rollback in Staging
```bash
node scripts/test-rollback-staging.js
```

### Rollback Production (Feature Flag Only)
```bash
node scripts/rollback-production.js
```

### Full Rollback (Including Database)
```bash
node scripts/rollback-production.js --rollback-db
```

### Verify Rollback Success
```bash
node scripts/verify-rollback.js
```

### Force Mode (Skip Confirmations)
```bash
node scripts/rollback-production.js --force
```

## Decision Tree

```
Is there a critical issue?
├─ YES → Rollback immediately
│   ├─ Need to preserve GPS data?
│   │   ├─ YES → node scripts/rollback-production.js
│   │   └─ NO → node scripts/rollback-production.js --rollback-db
│   └─ After rollback → node scripts/verify-rollback.js
└─ NO → Monitor and investigate
    └─ If issue persists → Consider rollback
```

## Rollback Modes Comparison

| Feature | Flag Only | Full Rollback |
|---------|-----------|---------------|
| Speed | Fast (minutes) | Slower (5-10 min) |
| GPS Data | Preserved | **DELETED** |
| Re-enable | Easy | Requires migration |
| Use Case | Temporary | Permanent |
| Command | `rollback-production.js` | `rollback-production.js --rollback-db` |

## Pre-Rollback Checklist

- [ ] Identify and document the issue
- [ ] Notify stakeholders
- [ ] Create database backup
- [ ] Test rollback in staging
- [ ] Prepare user communication

## Post-Rollback Checklist

- [ ] Run verification script
- [ ] Test survey submission
- [ ] Monitor for 15-30 minutes
- [ ] Notify field staff
- [ ] Document in issue tracker

## Common Issues

### Feature Flag Still Enabled
```bash
# Check .env.production
cat .env.production | grep NEXT_PUBLIC_USE_CSIS

# Should show: NEXT_PUBLIC_USE_CSIS=false
```

### Database Rollback Failed
```bash
# Run manual SQL
psql $DATABASE_URL -f database/rollback-gps-verification.sql
```

### Verification Failed
```bash
# Check database connection
node scripts/check-database-connection.js

# Check logs
tail -f logs/application.log
```

## Emergency Rollback

If you need to rollback immediately without confirmations:

```bash
# Feature flag only
node scripts/rollback-production.js --force

# Full rollback
node scripts/rollback-production.js --rollback-db --force
```

## Manual Rollback Steps

If automated script fails:

1. **Disable Feature Flag**
   ```bash
   # Edit .env.production
   NEXT_PUBLIC_USE_CSIS=false
   ```

2. **Redeploy Application**
   ```bash
   npm run build
   # Deploy to hosting platform
   ```

3. **Remove GPS Columns (Optional)**
   ```sql
   ALTER TABLE survey_response 
   DROP COLUMN IF EXISTS verification_location,
   DROP COLUMN IF EXISTS gps_verification_status,
   DROP COLUMN IF EXISTS gps_distance_meters;
   ```

## Support

- **Documentation**: [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)
- **Troubleshooting**: [CSIS_TROUBLESHOOTING_GUIDE.md](./CSIS_TROUBLESHOOTING_GUIDE.md)
- **Scripts**: `scripts/rollback-production.js`, `scripts/verify-rollback.js`

## Key Files

- `scripts/rollback-production.js` - Main rollback script
- `scripts/test-rollback-staging.js` - Test in staging
- `scripts/verify-rollback.js` - Verify success
- `database/rollback-gps-verification.sql` - Manual SQL
- `docs/ROLLBACK_GUIDE.md` - Full documentation

---

**Last Updated**: 2024-11-17  
**Version**: 1.0
