# 🔧 Environment Variables Setup Guide

This guide will help you configure all the necessary environment variables for the SIGLA-2 system.

## 📋 Required Environment Variables

### 1. Supabase Configuration

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Choose your organization
5. Enter project name: `sigla-2` (or your preferred name)
6. Enter database password (save this!)
7. Select region closest to you
8. Click **"Create new project"**

#### Step 2: Get Supabase Credentials
1. In your Supabase dashboard, go to **Settings → API**
2. Copy the following values:

```env
NEXT_PUBLIC_SUPABASE_URL="https://[your-project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[copy from Project API keys → anon public]"
SUPABASE_SERVICE_ROLE_KEY="[copy from Project API keys → service_role]"
```

#### Step 3: Get Database Connection String
1. Go to **Settings → Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[your-project-id].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_POSTGRES_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[your-project-id].supabase.co:5432/postgres"
```

### 2. JWT Secret

Generate a secure JWT secret (minimum 32 characters):

```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32

# Option 3: Use online generator
# Visit: https://generate-secret.vercel.app/32
```

Add to your .env:
```env
JWT_SECRET="your_generated_secret_here"
```

### 3. NextAuth Configuration

Generate another secure secret for NextAuth:

```env
NEXTAUTH_SECRET="another_secure_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Application URLs

For development:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

For production:
```env
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### 5. Python Path (for ML features)

Find your Python path:

```bash
# On Windows
where python

# On macOS/Linux
which python3
```

Add to .env:
```env
PYTHON_PATH="/path/to/your/python"
```

## 🚀 Complete Setup Process

### Step 1: Create Environment File
```bash
# Copy the example file
cp .env.example .env.local

# Or create manually
touch .env.local
```

### Step 2: Fill in Your Values
Edit `.env.local` with your actual Supabase credentials and secrets.

### Step 3: Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Seed initial data (optional)
npm run seed-barangays
```

### Step 4: Test Connection
```bash
# Test Supabase connection
node scripts/test-supabase-connection.js

# Test complete system
npm run dev
```

## 🔍 Verification Checklist

- [ ] Supabase project created
- [ ] All environment variables set in `.env.local`
- [ ] Database connection working
- [ ] Prisma schema pushed to database
- [ ] Application starts without errors
- [ ] Can login with admin credentials

## 🚨 Security Notes

1. **Never commit `.env.local`** to version control
2. **Use strong, unique secrets** for JWT and NextAuth
3. **Rotate secrets regularly** in production
4. **Use environment-specific values** for different deployments

## 🆘 Troubleshooting

### Connection Issues
- Verify Supabase project is active
- Check database password is correct
- Ensure no typos in connection string

### Authentication Issues
- Verify JWT_SECRET is set and consistent
- Check cookie settings in production

### Missing Tables
- Run `npx prisma db push` to create tables
- Check Supabase dashboard → Table Editor

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Test database connection with the provided scripts
4. Check Supabase dashboard for any issues

---

**Next Steps:** After setting up your environment variables, run `npm run dev` to start the development server.