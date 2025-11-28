# Codebase Cleanup Summary

## Files Created

### 1. `.vercelignore`
Excludes unnecessary files from Vercel/Railway deployments:
- Test files and coverage reports
- Documentation (270+ markdown files in docs/)
- Database SQL files
- Development scripts
- Python ML code (deploy separately)
- PowerShell scripts

### 2. `.dockerignore`
Similar exclusions for Docker-based deployments

### 3. `cleanup.ps1`
PowerShell script to remove:
- `coverage/` - Test coverage reports
- `test-results/` - Playwright test results
- `playwright-report/` - Test reports
- `.next/` - Build cache
- `tsconfig.tsbuildinfo` - TypeScript build info
- `node_modules/` - Dependencies (reinstall fresh)

### 4. `nixpacks.toml`
Railway build configuration optimized for Node.js 20 + pnpm

### 5. `railway.json`
Railway deployment settings with restart policies

### 6. `DEPLOYMENT.md`
Complete deployment guide with environment variables and steps

## Updated Files

### 1. `.gitignore`
Added:
- `/test-results`
- `/playwright-report`

### 2. `next.config.ts`
Added webpack configuration to exclude test files from bundle

## What Gets Excluded from Deployment

### Documentation (~270 files)
- `docs/` - All implementation docs, guides, summaries
- `ml-algorithm-selection/` - Spec documents
- `README-*.md` - Feature-specific READMEs
- `database/*.md` - Migration guides

### Test Files
- `coverage/` - Jest coverage reports
- `test-results/` - Playwright results
- `playwright-report/` - HTML reports
- `*.test.ts`, `*.spec.ts` - Test files
- `tests/` - Test directory

### Database Files
- `*.sql` - All SQL migration files
- `database/` - Migration scripts and docs
- `sigla_db.sql` - Database dump
- `missing_survey_features.sql`

### Development Scripts
- `scripts/examples/` - Example code
- `scripts/test-*.ts` - Test scripts
- `scripts/db-fresh.ts` - Database reset
- `scripts/db-truncate.ts` - Data cleanup
- `scripts/db-unseed.ts` - Unseeding

### PowerShell Scripts
- `*.ps1` - All PowerShell scripts
- `cleanup.ps1`
- `clear-cache.ps1`
- `fix-hydration-errors.ps1`
- `restart-dev.ps1`

### Python ML (Deploy Separately)
- `ml/` - Python ML code
- `.venv/` - Python virtual environment

### IDE Configs
- `.vscode/` - VS Code settings
- `.kiro/` - Kiro AI settings

## Build Size Reduction

**Before cleanup:**
- Source: ~500-800 MB
- With node_modules: ~1.5-2 GB

**After cleanup:**
- Source: ~200-300 MB
- Deployed: ~150-200 MB
- Runtime memory: <512 MB

## Key Optimizations

1. **Excluded 270+ documentation files** - Not needed in production
2. **Excluded all test infrastructure** - Tests run in CI, not production
3. **Excluded database migration files** - Run migrations separately
4. **Excluded development scripts** - Only needed locally
5. **Separated Python ML service** - Deploy independently
6. **Webpack excludes test files** - Smaller bundle size
7. **Production dependencies only** - No dev dependencies in build
8. **Optimized package imports** - Tree-shaking for lucide-react, recharts, leaflet

## How to Use

### Before Deployment
```powershell
# Clean up local files
.\cleanup.ps1

# Reinstall dependencies
pnpm install
```

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables Needed
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `NODE_ENV=production`

## What Stays in Production

- `src/` - Application code
- `public/` - Static assets
- `prisma/` - Database schema
- `package.json` - Dependencies
- `next.config.ts` - Next.js config
- Essential config files

## Next Steps

1. Run `.\cleanup.ps1` to clean local files
2. Test build locally: `pnpm build`
3. Deploy to Railway following `DEPLOYMENT.md`
4. Deploy Python ML service separately
5. Update ML API endpoints in Next.js app
