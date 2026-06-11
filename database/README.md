# Database Directory

This directory contains all database-related files for the PULSE application.

## Directory Structure

```
database/
├── migrations/              # Prisma migrations (managed by Prisma)
├── migrations-archive/      # Historical migration and rollback SQL scripts
├── sql-scripts/            # Utility SQL scripts for database operations
├── testing/                # SQL scripts for testing and verification
└── README.md               # This file
```

## Subdirectories

### `migrations/`
Contains Prisma migration files. These are automatically generated and managed by Prisma CLI.
- **Do not manually edit** these files
- Use `npx prisma migrate dev` to create new migrations
- Use `npx prisma migrate deploy` for production deployments

### `migrations-archive/`
Contains historical migration and rollback SQL scripts that were used before Prisma or for manual database operations.
- Migration scripts: `*-migration*.sql`
- Rollback scripts: `*-rollback*.sql`
- These are kept for reference and emergency rollback procedures

### `sql-scripts/`
Contains utility SQL scripts for various database operations:
- Schema modifications: `add-*.sql`
- Performance optimizations: `performance-*.sql`
- Data population: `populate-*.sql`
- Function definitions: `*-function.sql`
- Table creation: `*-table.sql`

### `testing/`
Contains SQL scripts for testing and verification:
- Check scripts: `check-*.sql`
- Test scripts: `test-*.sql`
- Verification scripts: `verify-*.sql`

## Common Operations

### Running Migrations
```bash
# Development
npm run db:push

# Generate Prisma client
npm run db:generate

# Run custom migration script
npm run db:migrate
```

### Database Seeding
```bash
# Seed all data
npm run db:seed

# Seed specific data
npm run seed:users
npm run seed:spots
npm run seed:assignments
```

### Database Utilities
```bash
# Fresh database (drop all data and reseed)
npm run db:fresh

# Truncate all tables
npm run db:truncate

# Unseed data
npm run db:unseed
```

## Documentation

For detailed migration documentation, see:
- `/docs/migrations/` - Migration guides and summaries
- `/docs/deployment/` - Deployment procedures
- `prisma/schema.prisma` - Current database schema

## Important Notes

1. **Always backup** before running migration scripts
2. **Test migrations** in development before production
3. **Use Prisma** for schema changes when possible
4. **Document** any manual SQL operations
5. **Keep scripts** organized in appropriate subdirectories
