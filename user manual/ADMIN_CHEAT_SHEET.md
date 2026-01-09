# Admin Cheat Sheet - PULSE System

**Quick Reference for Administrators**

---

## 🎯 Your Responsibilities

✅ Create and manage survey cycles  
✅ Manage barangays and demographics  
✅ Create and manage user accounts  
✅ Assign Field Supervisors to barangays  
✅ Set survey targets  
✅ Review and approve CPAPs  
✅ Monitor overall system performance  
✅ Export data and backups  

---

## 🚀 Getting Started Checklist

### Initial Setup (One-time)
- [ ] Create survey cycle
- [ ] Set cycle as active
- [ ] Add all barangays
- [ ] Upload barangay logos
- [ ] Set survey targets for all barangays
- [ ] Create user accounts (FS, Interviewers, Officers)
- [ ] Assign officers to their barangays
- [ ] Assign Field Supervisors to barangays
- [ ] Mark SGLGB awardees (if applicable)

### Ongoing Tasks (Regular)
- [ ] Monitor survey progress daily
- [ ] Review submitted CPAPs within 3 days
- [ ] Export data weekly for backup
- [ ] Check data quality reports
- [ ] Respond to user support requests
- [ ] Update barangay information as needed

---

## 📋 Common Tasks - Step by Step

### 1. Create Survey Cycle
```
Settings → Survey Cycles → Create New Cycle
├─ Cycle Name: "2026 Citizen Satisfaction Survey"
├─ Year: 2026
├─ Start Date: Select date
├─ End Date: Select date
└─ Save → Set as Active
```

### 2. Add Barangay
```
Settings → Barangays → Add Barangay
├─ Barangay Name: Official name
├─ Population: Total count
├─ Households: Number of households
├─ Captain: Name
├─ Upload Logo (optional)
└─ Save
```

### 3. Create User Account
```
Settings → Users & Roles → Add User
├─ First Name & Last Name
├─ Email (login username)
├─ Password (initial)
├─ Phone & Organization
├─ Role: Select (Admin/FS/Interviewer/Officer/Viewer)
├─ Barangay Designation (Officers only)
└─ Save
```

### 4. Assign Field Supervisor
```
Settings → Supervisor Assignments → Create Assignment
├─ Field Supervisor: Select FS user
├─ Barangay: Select barangay
├─ Survey Cycle: Select active cycle
└─ Save
```

### 5. Set Survey Targets
```
Settings → Survey Targets → Bulk Create Targets
├─ Survey Cycle: Select active cycle
├─ Target: Number per barangay (system calculates MOE)
└─ Save All
```

### 6. Review CPAP
```
Admin → CPAP Review → Select CPAP
├─ Review all action items
├─ Check for completeness and feasibility
├─ Add comments if needed
└─ Approve OR Request Revision
```

---

## 🔍 Monitoring Dashboard

### Key Metrics to Watch
- **Overall Progress**: Should increase steadily
- **Target Achievement**: Aim for 100% by end date
- **Response Quality**: Check for completeness
- **CPAP Status**: Review submitted CPAPs promptly
- **User Activity**: Monitor last login times

### Red Flags
⚠️ Survey progress stalled for 3+ days  
⚠️ Multiple incomplete surveys from same interviewer  
⚠️ GPS coordinates outside barangay boundaries  
⚠️ Suspiciously fast survey completion times  
⚠️ CPAPs with vague or unmeasurable outputs  

---

## ✅ CPAP Review Checklist

When reviewing a submitted CPAP:

- [ ] All action items have clear, measurable outputs
- [ ] Timelines are realistic
- [ ] Responsible persons are identified
- [ ] Financial requirements are reasonable
- [ ] Actions address survey findings
- [ ] All 6 service areas are covered (if applicable)
- [ ] Means of verification are specified
- [ ] No duplicate or redundant items

**Approval Criteria**:
✅ Addresses critical issues from survey  
✅ SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)  
✅ Realistic budget and timeline  
✅ Clear accountability  

**Request Revision If**:
❌ Vague or unmeasurable outputs  
❌ Unrealistic timelines or budgets  
❌ Missing critical issues  
❌ Unclear responsibility  

---

## 📊 Data Export Guide

### Weekly Backup Routine
```
Settings → Backup
├─ Select: All Data
├─ Survey Cycle: Active cycle
├─ Export to CSV
└─ Store in secure location with date stamp
```

### Export Types
- **Survey Responses**: All survey data
- **Barangays**: Barangay information
- **Users**: User accounts (passwords excluded)
- **CPAPs**: All action plans
- **All Data**: Complete system backup

---

## 🔧 Common Admin Tasks

| Task | Location | Frequency |
|------|----------|-----------|
| Monitor progress | Dashboard | Daily |
| Review CPAPs | Admin → CPAP Review | As submitted |
| Export backup | Settings → Backup | Weekly |
| Update targets | Settings → Survey Targets | As needed |
| Manage users | Settings → Users & Roles | As needed |
| Check data quality | Analytics | Weekly |
| Update barangay info | Settings → Barangays | As needed |

---

## 🚨 Emergency Procedures

### User Locked Out
1. Settings → Users & Roles
2. Find user → Edit
3. Reset password
4. Communicate new password securely

### Data Loss Suspected
1. Check last backup date
2. Verify data in database
3. Contact technical support
4. Restore from backup if necessary

### System Performance Issues
1. Check server status
2. Review recent changes
3. Clear cache and refresh
4. Contact technical support

---

## 💡 Best Practices

### Survey Cycle Management
- Create cycle at least 2 weeks before data collection
- Set realistic end dates with buffer time
- Don't delete cycles (historical data)
- Only one active cycle at a time

### User Management
- Use descriptive job titles
- Verify email addresses before creating accounts
- Assign roles carefully (can't be changed easily)
- Deactivate users instead of deleting

### CPAP Review
- Review within 3 business days
- Provide constructive feedback
- Be specific in revision requests
- Acknowledge good work

### Data Quality
- Spot-check 10% of surveys weekly
- Look for patterns in incomplete data
- Address issues with FSs promptly
- Document quality issues

---

## 📞 When to Escalate

Contact Technical Support for:
- System errors or crashes
- Data corruption or loss
- Performance issues persisting > 24 hours
- Security concerns
- Database issues
- Integration problems

---

## 🔐 Security Responsibilities

As Admin, you must:
- ✅ Protect your admin credentials
- ✅ Create strong passwords for new users
- ✅ Deactivate accounts promptly when users leave
- ✅ Monitor for suspicious activity
- ✅ Review user access logs regularly
- ✅ Report security incidents immediately
- ✅ Keep backup data secure

---

## 📈 Success Metrics

Track these KPIs:
- **Survey Completion Rate**: Target 100%
- **Data Quality Score**: Target > 95%
- **CPAP Submission Rate**: Target 100% of barangays
- **CPAP Approval Rate**: Target > 80% first submission
- **User Satisfaction**: Gather feedback regularly

---

**Need Help?** Refer to Complete User Manual or contact Technical Support.
