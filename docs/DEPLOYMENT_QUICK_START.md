# CSIS Deployment Quick Start Guide

**Version**: 1.0.0  
**Status**: Production-Ready  
**Last Updated**: November 17, 2025

---

## Prerequisites

Before deploying, ensure:
- ✅ All tests passing
- ✅ Staging environment tested
- ✅ Team notified
- ✅ Backup plan ready
- ✅ Environment variables configured

---

## Deployment Commands

### 1. Deploy to Staging (Test First)
```bash
node scripts/deploy-to-staging.js
```

### 2. Deploy to Production (Canary 10%)
```bash
node scripts/deploy-to-production.js --canary-percentage=10
```

### 3. Monitor Deployment (15 minutes)
```bash
node scripts/monitor-deployment.js --duration=900
```

### 4. Increase Canary (if healthy)
```bash
# Increase to 25%
node scripts/deploy-to-production.js --canary-percentage=25

# Monitor again
node scripts/monitor-deployment.js --duration=900

# Continue: 50% → 75% → 100%
```

### 5. Rollback (if issues detected)
```bash
node scripts/rollback-production.js
```

---

## Monitoring Thresholds

### Healthy Deployment
- ✅ GPS capture rate: **≥ 90%**
- ✅ Survey completion rate: **≥ 85%**
- ✅ GPS flagged rate: **≤ 5%**
- ✅ Error count: **0**
- ✅ Average GPS distance: **≤ 100m**

### Warning Signs
- ⚠️ GPS capture rate: **70-89%**
- ⚠️ Survey completion rate: **70-84%**
- ⚠️ GPS flagged rate: **6-15%**
- ⚠️ Error count: **1-5 per hour**
- ⚠️ Average GPS distance: **101-200m**

### Critical Issues (Rollback)
- 🚨 GPS capture rate: **< 70%**
- 🚨 Survey completion rate: **< 70%**
- 🚨 GPS flagged rate: **> 15%**
- 🚨 Error count: **> 5 per hour**
- 🚨 Average GPS distance: **> 200m**

---

## Canary Deployment Strategy

### Phase 1: Initial (10%)
- **Duration**: 30-60 minutes
- **Action**: Monitor closely
- **Decision**: Proceed if healthy

### Phase 2: Expand (25%)
- **Duration**: 1-2 hours
- **Action**: Gather feedback
- **Decision**: Proceed if stable

### Phase 3: Majority (50%)
- **Duration**: 2-4 hours
- **Action**: Check scale
- **Decision**: Proceed if no issues

### Phase 4: Near Complete (75%)
- **Duration**: 2-4 hours
- **Action**: Final validation
- **Decision**: Proceed to 100%

### Phase 5: Full (100%)
- **Duration**: 24 hours
- **Action**: Monitor continuously
- **Decision**: Deployment complete

---

## Rollback Triggers

### Automatic Rollback
- Database migration failure
- Schema verification failure
- Critical health check failures

### Manual Rollback
- High error rates
- Poor GPS capture rates
- User complaints
- Performance degradation

---

## Environment Variables

### Required for Production
```bash
# Production Database
PRODUCTION_SUPABASE_URL=your_production_url
PRODUCTION_SUPABASE_SERVICE_KEY=your_service_key

# Feature Flag (optional)
NEXT_PUBLIC_USE_CSIS=true
NEXT_PUBLIC_CSIS_CANARY_PERCENTAGE=10
```

---

## Troubleshooting

### Deployment Fails
1. Check database connection
2. Verify environment variables
3. Review error logs
4. Test in staging first

### Monitoring Shows Warnings
1. Review specific metrics
2. Check field staff feedback
3. Investigate GPS issues
4. Consider pausing rollout

### Need to Rollback
1. Run rollback script
2. Verify rollback success
3. Investigate root cause
4. Fix issues before redeploying

---

## Support Contacts

### Technical Issues
- Check: `docs/CSIS_TROUBLESHOOTING_GUIDE.md`
- Review: `docs/CSIS_DOCUMENTATION_INDEX.md`

### Field Staff Issues
- Guide: `docs/FI_TRAINING_GUIDE_CSIS.md`
- Support: Contact field supervisor

### Supervisor Issues
- Guide: `docs/SUPERVISOR_GPS_VERIFICATION_GUIDE.md`
- Support: Contact technical team

---

## Post-Deployment Checklist

### Immediate (First Hour)
- [ ] Monitor error logs
- [ ] Check GPS capture rate
- [ ] Verify survey submissions
- [ ] Monitor API response times
- [ ] Check database performance

### Short-term (First Day)
- [ ] Gather field staff feedback
- [ ] Review GPS verification accuracy
- [ ] Analyze survey completion rates
- [ ] Check for edge cases
- [ ] Document any issues

### Medium-term (First Week)
- [ ] Analyze GPS flagging patterns
- [ ] Review supervisor feedback
- [ ] Optimize GPS threshold if needed
- [ ] Address reported issues
- [ ] Plan for 100% rollout

---

## Success Criteria

### Technical
- ✅ GPS capture rate > 90%
- ✅ Survey completion rate > 85%
- ✅ GPS flagged rate < 10%
- ✅ Zero critical errors
- ✅ API response times < 2s

### User Experience
- ✅ FIs can complete surveys
- ✅ GPS capture is reliable
- ✅ 6-section navigation is clear
- ✅ Kish Grid selection works
- ✅ Supervisors can review GPS

---

## Quick Reference

### Deploy
```bash
node scripts/deploy-to-production.js --canary-percentage=10
```

### Monitor
```bash
node scripts/monitor-deployment.js --duration=900
```

### Rollback
```bash
node scripts/rollback-production.js
```

### Documentation
- Implementation: `docs/CSIS_IMPLEMENTATION_COMPLETE.md`
- Deployment: `docs/TASK_13_DEPLOYMENT_COMPLETE.md`
- Index: `docs/CSIS_DOCUMENTATION_INDEX.md`

---

**Status**: ✅ Ready for Production Deployment  
**Next Action**: Deploy to production with 10% canary
