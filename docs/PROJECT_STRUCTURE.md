# Project Structure

This document provides an overview of the PULSE project structure after cleanup.

## Root Directory Structure

```
SIGLA/
├── android-builds/       # Android APK builds and signing keys
├── android-config/       # Android TWA configuration and Gradle files
├── database/            # Database schemas and SQL scripts
├── dev-scripts/         # Development PowerShell scripts
├── docs/                # Project documentation
├── ml/                  # Machine learning service (Python/Flask)
├── prisma/              # Prisma ORM schema and migrations
├── public/              # Static assets (images, icons, etc.)
├── scripts/             # Node.js utility scripts (seeding, migration)
├── src/                 # Next.js application source code
├── supabase/            # Supabase configuration
├── tests/               # Test files
└── [config files]       # Various configuration files
```

## Key Folders

### `/src` - Application Source
- `/app` - Next.js App Router pages and API routes
- `/components` - React components
- `/lib` - Utility libraries and helpers
- `/utils` - Utility functions

### `/android-builds` - Android Builds
Contains compiled Android APK files and signing keys. See `android-builds/README.md`.

### `/android-config` - Android Configuration
All Android TWA configuration, Gradle files, and Bubblewrap setup. See `android-config/README.md`.

### `/dev-scripts` - Development Scripts
PowerShell scripts for common development tasks. See `dev-scripts/README.md`.

### `/docs` - Documentation
- Feature documentation
- Deployment guides
- Architecture decisions
- Archived specifications

### `/database` - Database Files
- SQL migration scripts
- Database schemas
- Backup SQL files

### `/ml` - Machine Learning Service
Python Flask service for ML analysis and CSIS calculations.

### `/scripts` - Node.js Scripts
- Database seeding scripts
- Migration utilities
- Data generation tools

## Configuration Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Node.js dependencies
- `eslint.config.mjs` - ESLint configuration
- `jest.config.js` - Jest testing configuration
- `playwright.config.ts` - Playwright E2E testing
- `components.json` - shadcn/ui components configuration
- `.env.example` - Environment variables template

## Environment Files

- `.env` - Local environment variables (not in git)
- `.env.local` - Local overrides (not in git)
- `.env.example` - Template for required environment variables

## Build Artifacts (Ignored by Git)

- `.next/` - Next.js build output
- `node_modules/` - Node.js dependencies
- `.venv/` - Python virtual environment
- `android-builds/*.apk` - Android builds
- `android-config/.gradle` - Gradle cache

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment: Copy `.env.example` to `.env` and configure
3. Run development server: `npm run dev`
4. Build Android app: `./dev-scripts/build-android-app.ps1`

For more details, see `README.md`.
