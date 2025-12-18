# Supabase Configuration Guide for ML System

## 🎯 **Issue**: Missing Supabase Configuration

The ML system database permission warnings are caused by missing Supabase environment variables. Here's how to fix it:

## 🔧 **Step-by-Step Fix**

### **Step 1: Get Your Supabase Credentials**

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/projects
   - Log in to your account
   - Select your SIGLA project

2. **Navigate to API Settings**:
   - Click on **Settings** (gear icon in sidebar)
   - Click on **API** in the settings menu

3. **Copy Required Values**:
   You'll see a page with these sections:

   **📋 Project URL**:
   ```
   https://your-project-id.supabase.co
   ```
   
   **🔑 Project API Keys**:
   - **anon public**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` (shorter)
   - **service_role**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` (much longer)

### **Step 2: Update Your .env.local File**

Add these lines to your `.env.local` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...(your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...(your service role key)

# Keep your existing DATABASE_URL
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
```

### **Step 3: Verify Configuration**

Run this command to verify your configuration:
```bash
node scripts/verify-supabase-service-key.js
```

You should see:
- ✅ SUPABASE_URL: Set
- ✅ SUPABASE_SERVICE_ROLE_KEY: Set  
- ✅ SUPABASE_ANON_KEY: Set
- ✅ Correct role: service_role

### **Step 4: Fix Supabase Permissions**

Once your environment variables are correct, run:
```bash
node scripts/fix-supabase-ml-permissions.js
```

This will:
- ✅ Fix ML table schemas
- ✅ Update Row Level Security policies
- ✅ Grant proper permissions
- ✅ Test API access

### **Step 5: Test ML System**

Test the ML system again:
```bash
python ml/analyze_barangay.py --barangay_id 17
```

You should see **no more database permission errors**.

## 🔍 **Common Issues & Solutions**

### **Issue 1: Wrong Service Key**
**Problem**: Using anon key instead of service_role key
**Solution**: Make sure you copy the **service_role** key, not the anon key

### **Issue 2: Missing URL**
**Problem**: SUPABASE_URL not set
**Solution**: Copy the Project URL from Supabase dashboard

### **Issue 3: RLS Policies**
**Problem**: Row Level Security blocking ML operations
**Solution**: Run the fix-supabase-ml-permissions.js script

### **Issue 4: Schema Cache**
**Problem**: "Could not find column in schema cache"
**Solution**: The fix script will refresh the schema

## 📋 **Verification Checklist**

After completing the steps above, verify:

- [ ] **Environment Variables**: All 3 Supabase variables set in .env.local
- [ ] **Service Key**: Correct service_role key (not anon key)
- [ ] **URL Format**: Correct Supabase project URL
- [ ] **Permissions**: RLS policies updated
- [ ] **ML Test**: `python ml/analyze_barangay.py --barangay_id 17` works without errors
- [ ] **Database Saves**: No more "permission denied" errors

## 🎯 **Expected Result**

After fixing the configuration, your ML analysis should output:
```json
{
  "barangay_id": 17,
  "service_scores": {...},
  "action_grid": {
    "business": {
      "quadrant": "MONITOR",
      "confidence": 85.0
      // NO MORE "db_error" field!
    }
  },
  "insights": [...],
  "recommendations": [...]
}
```

**No more database permission warnings!** ✅

## 🚀 **Next Steps**

1. **Complete the Supabase configuration** using the steps above
2. **Run the permission fix script**
3. **Test the ML system** to verify no more errors
4. **Deploy with confidence** knowing ML database saves work properly

The ML system will then be **100% operational** with full database persistence! 🎉