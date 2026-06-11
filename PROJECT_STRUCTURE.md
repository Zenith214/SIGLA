# PULSE Project Structure

This document provides an overview of the PULSE project directory structure and organization.

## Root Directory

```
PULSE/
├── src/                    # Application source code
├── public/                 # Static assets
├── prisma/                 # Database schema and migrations
├── database/               # Database scripts and utilities
├── docs/                   # Project documentation
├── scripts/                # Utility scripts
├── tests/                  # Test files
├── ml/                     # Machine learning service
├── android-config/         # Android TWA configuration
├── android-builds/         # Android build outputs
├── user-manual/            # User documentation
├── user-guide-html/        # HTML user guide
├── config/                 # Alternative configuration files
├── supabase/               # Supabase configuration
├── dev-scripts/            # Development utility scripts
└── [config files]          # Various configuration files
```

## Source Code (`/src/`)

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── analytics/         # Analytics pages
│   ├── survey/            # Survey pages
│   ├── settings/          # Settings pages
│   ├── login/             # Authentication pages
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── analytics/        # Analytics components
│   ├── survey-cycle/     # Survey cycle components
│   └── ...               # Other components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── utils/                # Helper utilities
├── data/                 # Static data
└── types/                # TypeScript type definitions
```

## Database (`/database/`)

```
database/
├── migrations/            # Prisma migrations (auto-generated)
├── migrations-archive/    # Historical migration scripts
├── sql-scripts/          # Utility SQL scripts
├── testing/              # Test and verification scripts
└── README.md             # Database documentation
```

## Documentation (`/docs/`)

```
docs/
├── features/             # Feature-specific documentation
├── testing/              # Testing documentation
├── deployment/           # Deployment guides
├── migrations/           # Migration documentation
├── api-docs/             # API documentation
├── root-docs/            # Moved from root directory
├── railway/              # Railway-specific docs
├── archived-ml-algorithm-selection/  # Historical ML docs
├── AI_RULES.md          # Development guidelines
├── SYSTEM_OVERVIEW.md   # Architecture overview
├── PROJECT_STRUCTURE.md # Project structure (this file)
└── README.md            # Documentation index
```

## Configuration Files

### Root Level
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright E2E testing
- `components.json` - shadcn/ui configuration
- `middleware.ts` - Next.js middleware
- `.env.example` - Environment variables template
- `.gitignore` - Git ignore rules
- `.dockerignore` - Docker ignore rules
- `railway.json` - Railway deployment config
- `nixpacks.toml` - Nixpacks build config

### Config Directory (`/config/`)
- `next.config.railway.ts` - Railway-specific Next.js config

## Scripts (`/scripts/`)

Utility scripts for database operations, seeding, and maintenance:
- Database seeding scripts
- Migration scripts
- Data generation scripts
- Maintenance utilities

## Tests (`/tests/`)

Test files for the application:
- Unit tests
- Integration tests
- E2E tests (Playwright)

## Machine Learning (`/ml/`)

Python-based ML service for satisfaction analysis:
- ML models
- Analysis scripts
- Service endpoints

## Android (`/android-config/` & `/android-builds/`)

Android Trusted Web Activity (TWA) configuration and builds:
- `android-config/` - Bubblewrap configuration
- `android-builds/` - APK/AAB build outputs (gitignored)

## User Documentation

- `/user-manual/` - User manual files
- `/user-guide-html/` - HTML-based user guide
- `/docs/root-docs/` - Additional user guides

## Development Workflow

### Starting Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server
```

### Database Operations
```bash
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:fresh     # Fresh database with seed data
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run linter
```

### Building
```bash
npm run build        # Build for production
npm run start        # Start production server
```

## Key Directories to Know

### For Frontend Development
- `/src/app/` - Pages and routing
- `/src/components/` - Reusable components
- `/src/hooks/` - Custom hooks
- `/public/` - Static assets

### For Backend Development
- `/src/app/api/` - API routes
- `/prisma/` - Database schema
- `/database/` - SQL scripts
- `/ml/` - ML service

### For Documentation
- `/docs/` - All documentation
- `/docs/features/` - Feature docs
- `/docs/api-docs/` - API docs

### For Testing
- `/tests/` - Test files
- `/docs/testing/` - Testing guides

### For Deployment
- `/docs/deployment/` - Deployment guides
- `railway.json` - Railway config
- `nixpacks.toml` - Build config

## File Naming Conventions

- **Components**: PascalCase (e.g., `DashboardCard.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Pages**: kebab-case (e.g., `survey-form/page.tsx`)
- **Documentation**: SCREAMING_SNAKE_CASE (e.g., `FEATURE_GUIDE.md`)
- **SQL Scripts**: kebab-case (e.g., `add-column.sql`)

## Important Notes

1. **Never commit** `.env` files with secrets
2. **Always test** database migrations before production
3. **Document** new features in `/docs/features/`
4. **Follow** coding standards in `/docs/AI_RULES.md`
5. **Keep** dependencies up to date
6. **Organize** files in appropriate directories
7. **Use** TypeScript for type safety
8. **Write** tests for new features

## Getting Help

- Check `/docs/README.md` for documentation index
- Review feature-specific docs in `/docs/features/`
- Read troubleshooting guides in feature docs
- Check `/docs/SYSTEM_OVERVIEW.md` for architecture
