# CPAP Module - Testing Documentation

## 📖 Overview

The CPAP (Citizen Priority Action Plan) module allows barangay officers to submit action plans based on survey feedback, and DILG admins to review, approve, and monitor these plans.

---

## 🚀 Quick Start

**Total Time**: ~20 minutes

1. **Create test users** (2 min)
   ```bash
   node scripts/create-cpap-test-users.js
   ```

2. **Start development server** (1 min)
   ```bash
   npm run dev
   ```

3. **Follow testing guide** (15 min)
   - See: `CPAP_QUICK_START.md`

---

## 📚 Documentation Files

| File | Purpose | Time |
|------|---------|------|
| **CPAP_QUICK_START.md** | Fast 15-minute testing guide | 15 min |
| **CPAP_TESTING_GUIDE.md** | Comprehensive testing procedures | 45 min |
| **CPAP_WORKFLOW_DIAGRAM.md** | Visual workflow and architecture | Reference |
| **CPAP_TESTING_SUMMARY.md** | Complete overview and checklist | Reference |

---

## 🎯 Testing Flow

```
Officer Login → Create Items → Submit → Admin Review → Approve/Revise → Track Progress
```

---

## 👥 Test Users

Created by `scripts/create-cpap-test-users.js`:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Officer | officer.test@cpap.local | test123 | /cpap |
| Officer 2 | officer2.test@cpap.local | test123 | /cpap |
| Admin | admin.test@cpap.local | test123 | /admin/cpap |

---

## 🔗 Key URLs

- **Officer Dashboard**: http://localhost:3000/cpap
- **Admin Dashboard**: http://localhost:3000/admin/cpap
- **Login**: http://localhost:3000/login

---

## ✅ Testing Checklist

### Basic Flow (15 min)
- [ ] Officer creates CPAP items
- [ ] Officer submits CPAP
- [ ] Admin reviews CPAP
- [ ] Admin approves CPAP
- [ ] Officer tracks progress

### Advanced Flow (30 min)
- [ ] Admin requests revision
- [ ] Officer revises and resubmits
- [ ] Admin approves after revision
- [ ] Officer updates progress multiple times
- [ ] Admin monitors progress

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Not assigned to barangay" | Re-run test user script |
| "No survey cycle" | Create active cycle in settings |
| Cannot login | Clear cookies, verify password |
| 403 Forbidden | Logout and login again |

---

## 📊 Features to Test

### Officer Features
- ✅ Create action items
- ✅ Edit items (Draft/Revision status)
- ✅ Delete items
- ✅ AI suggestions
- ✅ Submit CPAP
- ✅ Resubmit after revision
- ✅ Track progress

### Admin Features
- ✅ View all CPAPs
- ✅ Filter by status
- ✅ Review submissions
- ✅ Approve CPAP
- ✅ Request revision
- ✅ Monitor progress
- ✅ View reports

---

## 🎓 Where to Start

**New to CPAP?** → Start with `CPAP_QUICK_START.md`

**Need details?** → Read `CPAP_TESTING_GUIDE.md`

**Want visuals?** → Check `CPAP_WORKFLOW_DIAGRAM.md`

**Need overview?** → See `CPAP_TESTING_SUMMARY.md`

---

## 🔍 API Endpoints

```
GET    /api/cpap                    - List CPAPs
GET    /api/cpap/[id]               - Get CPAP details
POST   /api/cpap                    - Create CPAP
PUT    /api/cpap/[id]               - Update items
POST   /api/cpap/[id]/submit        - Submit CPAP
POST   /api/cpap/[id]/approve       - Approve CPAP
POST   /api/cpap/[id]/request-revision - Request revision
PUT    /api/cpap/[id]/progress      - Update progress
```

---

## 🧪 Automated Tests

Run integration tests:
```bash
npm test -- tests/integration/cpap-api.test.ts
```

See: `tests/integration/CPAP-API-INTEGRATION-TESTS.md`

---

## 📈 Success Criteria

Your CPAP module works if:
1. Officer can submit CPAP
2. Admin can approve/reject
3. Revision workflow completes
4. Progress tracking updates
5. Permissions enforced correctly

---

## 💡 Tips

- Use realistic test data
- Test with multiple users
- Try edge cases
- Check mobile view
- Monitor performance

---

## 📞 Need Help?

1. Check documentation files
2. Review browser console
3. Check server logs
4. Verify database
5. Run integration tests

---

## 🎉 Ready to Test!

Start here: **`CPAP_QUICK_START.md`**

Estimated time: **15-20 minutes**

Good luck! 🚀
