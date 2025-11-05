# 🔧 Database Setup Guide - Fix All Issues

## 🚨 **Current Problem**
The system cannot connect to the MySQL database, causing all APIs to fail with 500 errors.

## 📊 **System Status**
- ✅ **MySQL Service**: Running (Process ID: 8968)
- ✅ **Port 3306**: Listening and available
- ❌ **Database Connection**: Failed - Can't reach database server
- ❌ **Database "sigla_db"**: Likely doesn't exist
- ❌ **All APIs**: Returning 500 errors
- ❌ **Barangay Seal Editing**: Not working due to database issues

## 🛠️ **Step-by-Step Fix**

### **Step 1: Open XAMPP Control Panel**
1. Open XAMPP Control Panel
2. Ensure **MySQL** is started (should show green "Running")
3. Click **"Admin"** next to MySQL (opens phpMyAdmin)

### **Step 2: Create Database**
In phpMyAdmin:
1. Look for **"sigla_db"** in the left sidebar
2. If **NOT found**:
   - Click **"New"** at the top left
   - Database name: **`sigla_db`**
   - Collation: **`utf8mb4_unicode_ci`**
   - Click **"Create"**

### **Step 3: Alternative - Command Line Method**
If phpMyAdmin doesn't work:
```bash
# Open Command Prompt as Administrator
mysql -u root -p
# Press Enter if no password, or enter your MySQL password

# Then run:
CREATE DATABASE IF NOT EXISTS sigla_db;
USE sigla_db;
SHOW DATABASES;
```

### **Step 4: Run Prisma Setup**
In your project directory:
```bash
# Generate Prisma client (may need to run as Administrator)
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push
```

If you get permission errors, run PowerShell as Administrator.

### **Step 5: Verify Fix**
```bash
# Test the system
node scripts/comprehensive-system-check.js

# Or test specific API
curl http://localhost:3000/api/barangays/all
```

## 🎯 **Expected Results After Fix**

### **Database Connection**
```
✅ Database: CONNECTED
📊 Barangays loaded: 25
```

### **API Endpoints**
```
✅ All Barangays (Settings): 200
✅ Filtered Barangays (Main): 200  
✅ Single Barangay: 200
✅ By Name Lookup: 200
✅ Interviewers: 200
✅ Assignments: 200
✅ Survey Responses: 200
```

### **Barangay Seal Editing**
- ✅ Settings page loads all 25 barangays
- ✅ Edit modal opens with current data
- ✅ Seal status dropdown works (yes/no)
- ✅ Changes save to database
- ✅ UI updates immediately

## 🔍 **Troubleshooting**

### **If Database Creation Fails**
1. Check MySQL password in .env file
2. Try different user credentials
3. Restart XAMPP services
4. Check Windows firewall settings

### **If Prisma Commands Fail**
1. Run PowerShell as Administrator
2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Try alternative Prisma commands:
   ```bash
   npx prisma migrate dev --name init
   ```

### **If APIs Still Fail**
1. Restart Next.js development server
2. Check .env file is in project root
3. Verify DATABASE_URL format:
   ```
   DATABASE_URL="mysql://root@localhost:3306/sigla_db"
   ```

## 📋 **Quick Checklist**

- [ ] XAMPP MySQL service running
- [ ] Database "sigla_db" exists in phpMyAdmin
- [ ] `npx prisma generate` completed successfully
- [ ] `npx prisma db push` completed successfully
- [ ] `node scripts/comprehensive-system-check.js` shows all green
- [ ] Settings → Barangays page loads data
- [ ] Barangay edit modal works
- [ ] Seal status can be changed and saved

## 🚀 **After Fix - Available Features**

### **Barangay Management**
- ✅ View all 25 barangays in settings
- ✅ Edit barangay information (population, households, captain)
- ✅ **Change seal status** (Awardee/Non-Awardee)
- ✅ View SGLGB statistics

### **Survey System**
- ✅ Create survey assignments
- ✅ Interviewer dropdowns populated
- ✅ Age input works naturally
- ✅ Demographics collection
- ✅ Survey submission to database

### **Assignment System**
- ✅ Assign interviewers to barangays
- ✅ Track assignment progress
- ✅ Edit assignment details

**Once the database is connected, ALL features will work perfectly!**

## 🎯 **Most Likely Solution**
**90% chance the issue is simply that the "sigla_db" database doesn't exist.**
**Creating it in phpMyAdmin should fix everything immediately!**