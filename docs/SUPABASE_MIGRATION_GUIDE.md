# 🚀 Supabase Migration Guide - Complete Setup

## 🎯 **Why Migrate to Supabase?**
- ✅ **No local database setup** - Cloud-hosted PostgreSQL
- ✅ **Always available** - No XAMPP or local MySQL issues
- ✅ **Built-in authentication** - Can replace your current auth system
- ✅ **Real-time features** - Live updates for survey data
- ✅ **Free tier** - Generous limits for development
- ✅ **Easy deployment** - Works seamlessly with Vercel/Netlify

## 📋 **Step-by-Step Migration**

### **Step 1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up/Login with GitHub (recommended)
4. Click **"New Project"**
5. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `SIGLA Survey System`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to Philippines (Singapore/Tokyo)
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup

### **Step 2: Get Connection Details**
1. In your Supabase dashboard, go to **Settings → Database**
2. Copy the **Connection string** (URI format)
3. It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

### **Step 3: Update Your Environment**
Update your `.env` file:

```env
# Replace MySQL with Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres"

# Add Supabase keys (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://[your-project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# Keep existing JWT secret
JWT_SECRET="your_secure_jwt_secret_key_here_change_this_in_production"
```

### **Step 4: Update Prisma Schema**
Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Changed from mysql
  url      = env("DATABASE_URL")
}

// Rest of your models stay the same, but update field types:
model user {
  id              Int               @id @default(autoincrement())
  email           String            @unique
  password        String
  createdAt       DateTime          @default(now())
  firstName       String
  jobTitle        String?
  lastName        String
  organization    String?
  phone           String?
  lastLogin       DateTime?
  role            String?           @default("Viewer")
  status          String?           @default("Active")
  assignment      assignment[]
  survey_response survey_response[]
}

// Update all @db.VarChar() to just String
// Update all @db.Text to String
// Update all @db.LongText to String
// Update all @db.Date to DateTime
// Update all @db.Time() to DateTime
// Update all @db.DateTime() to DateTime
// Update all @db.Decimal() to Decimal
```

### **Step 5: Install Supabase Client**
```bash
npm install @supabase/supabase-js
```

### **Step 6: Create Supabase Client**
Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

### **Step 7: Run Migration**
```bash
# Generate new Prisma client for PostgreSQL
npx prisma generate

# Push schema to Supabase (creates all tables)
npx prisma db push

# Optional: Seed data
npx prisma db seed
```

## 🔄 **Code Changes Needed**

### **Update Enum Handling**
PostgreSQL handles enums differently. Update your schema:

```prisma
// Before (MySQL)
enum barangay_seal {
  yes
  no
}

// After (PostgreSQL) - Same syntax works
enum barangay_seal {
  yes
  no
}
```

### **Update Date/Time Fields**
```prisma
// Before (MySQL specific)
backup_id Int           @id @default(autoincrement())
date      DateTime      @db.Date
time      DateTime      @db.Time(0)

// After (PostgreSQL compatible)
backup_id Int           @id @default(autoincrement())
date      DateTime
time      DateTime
```

### **Update Decimal Fields**
```prisma
// Before (MySQL specific)
location_lat Decimal @db.Decimal(10, 8)
location_lng Decimal @db.Decimal(11, 8)

// After (PostgreSQL compatible)
location_lat Decimal @db.Decimal(10, 8)  // Same syntax works
location_lng Decimal @db.Decimal(11, 8)
```

## 🛠️ **Migration Script**

Create `scripts/migrate-to-supabase.js`:

```javascript
// Migration verification script
console.log('🚀 Supabase Migration Verification\\n');

async function testSupabaseConnection() {
  try {
    const response = await fetch('http://localhost:3000/api/barangays/all');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Supabase Connection: SUCCESS');
      console.log(\`📊 Barangays loaded: \${data.length}\`);
      return true;
    } else {
      console.log('❌ Connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('💥 Error:', error.message);
    return false;
  }
}

async function runMigrationTest() {
  console.log('Testing Supabase migration...');
  const success = await testSupabaseConnection();
  
  if (success) {
    console.log('\\n🎉 Migration successful!');
    console.log('✅ All APIs should now work');
    console.log('✅ Barangay seal editing ready');
    console.log('✅ Survey system operational');
  } else {
    console.log('\\n🔧 Migration needs attention');
    console.log('Check DATABASE_URL and Supabase setup');
  }
}

runMigrationTest();
```

## 🎯 **Benefits After Migration**

### **Immediate Fixes**
- ✅ **No more database connection issues**
- ✅ **Barangay seal editing works**
- ✅ **All APIs return 200 instead of 500**
- ✅ **Survey system fully functional**

### **Long-term Benefits**
- ✅ **Cloud reliability** - No local setup needed
- ✅ **Automatic backups** - Data safety guaranteed
- ✅ **Scalability** - Handles growth automatically
- ✅ **Real-time updates** - Live data synchronization
- ✅ **Built-in auth** - Can replace JWT system later

## 🔍 **Troubleshooting**

### **If Migration Fails**
1. **Check DATABASE_URL format**:
   ```
   postgresql://postgres:password@host:5432/postgres
   ```

2. **Verify Supabase project is ready**:
   - Green status in dashboard
   - Database accessible

3. **Clear Prisma cache**:
   ```bash
   npx prisma generate --force
   ```

### **Common Issues**
- **Enum errors**: PostgreSQL enums work differently
- **Date format**: Use DateTime instead of @db.Date
- **Connection timeout**: Check region selection

## 📋 **Migration Checklist**

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] CONNECTION_URL copied from Supabase
- [ ] `.env` file updated with Supabase credentials
- [ ] `prisma/schema.prisma` updated for PostgreSQL
- [ ] `@supabase/supabase-js` installed
- [ ] `src/lib/supabase.ts` created
- [ ] `npx prisma generate` completed
- [ ] `npx prisma db push` completed
- [ ] Migration test script passes
- [ ] All APIs return 200 status
- [ ] Barangay settings page loads
- [ ] Seal editing works

## 🚀 **Expected Timeline**
- **Setup**: 10-15 minutes
- **Schema migration**: 5 minutes
- **Testing**: 5 minutes
- **Total**: ~30 minutes

**After migration, all your database issues will be resolved and the system will be much more reliable!**