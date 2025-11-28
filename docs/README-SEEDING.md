# 🌱 Laravel-Style Seeding System

Your SIGLA project now has a Laravel-inspired database seeding system!

## Quick Start

### 1. Run All Seeders
```bash
npm run db:seed
```

### 2. Run Specific Seeders
```bash
npm run seed:users
npm run seed:spots
npm run seed:assignments
```

### 3. Run with Options
```bash
# Create 50 pending assignments
npm run seed:assignments -- --count 50 --status pending

# Create 20 spots for cycle 1
npm run seed:spots -- --count 20 --cycleId 1
```

## 🏭 Factories

Factories generate realistic test data with customizable attributes.

### User Factory
```typescript
import { userFactory } from '@/lib/factories';

// Single interviewer
await userFactory().interviewer().create();

// 5 interviewers
await userFactory().interviewer().times(5).create();

// Custom admin
await userFactory()
  .admin()
  .with({ firstName: 'John', email: 'john@sigla.com' })
  .create();
```

### Spot Factory
```typescript
import { spotFactory } from '@/lib/factories';

// Create unassigned spots
await spotFactory()
  .forCycle(1)
  .forBarangay(101, 'Barangay Name')
  .unassigned()
  .times(10)
  .create();
```

### Assignment Factory
```typescript
import { assignmentFactory } from '@/lib/factories';

// Create pending assignments
await assignmentFactory()
  .pending()
  .times(5)
  .create();

// Create completed assignments
await assignmentFactory()
  .completed()
  .times(3)
  .create();
```

## 🌱 Seeders

Seeders organize and execute data seeding with dependency management.

### Available Seeders
- `DatabaseSeeder` - Runs all seeders in order
- `UserSeeder` - Creates users (interviewers, viewers, admins)
- `SpotSeeder` - Creates survey spots
- `AssignmentSeeder` - Assigns spots to interviewers

### Custom Seeder Example
```typescript
import { BaseSeeder } from '@/lib/seeders';
import { myFactory } from '@/lib/factories';

export class MySeeder extends BaseSeeder {
  public async run(): Promise<void> {
    this.log('Seeding my data...');
    
    await myFactory().times(10).create();
    
    this.success('Complete!');
  }
}
```

## 🔄 Migrations

Run SQL migrations from the `database/` folder:

```bash
npm run db:migrate
```

The migration runner:
- Tracks executed migrations
- Runs only pending migrations
- Stops on errors

## 🆕 Fresh Database

Drop everything and start fresh:

```bash
npm run db:fresh -- --seed
```

## 📁 File Structure

```
src/lib/
├── factories/
│   ├── BaseFactory.ts
│   ├── UserFactory.ts
│   ├── SpotFactory.ts
│   ├── AssignmentFactory.ts
│   └── index.ts
└── seeders/
    ├── BaseSeeder.ts
    ├── DatabaseSeeder.ts
    ├── UserSeeder.ts
    ├── SpotSeeder.ts
    ├── AssignmentSeeder.ts
    └── index.ts

scripts/
├── seed.ts
├── migrate.ts
├── db-fresh.ts
└── examples/
    ├── factory-examples.ts
    └── seeder-examples.ts
```

## 🎯 Use Cases

### Testing
```typescript
// In your tests
import { userFactory, spotFactory } from '@/lib/factories';

test('assignment creation', async () => {
  const user = await userFactory().interviewer().create();
  const spot = await spotFactory()
    .forCycle(1)
    .forBarangay(101)
    .create();
  
  // Test assignment logic...
});
```

### Development
```bash
# Reset and seed fresh data
npm run db:fresh -- --seed

# Add more test assignments
npm run seed:assignments -- --count 20
```

### CI/CD
```bash
# In your CI pipeline
npm run db:migrate
npm run db:seed
```

## 📚 Full Documentation

See `docs/LARAVEL_STYLE_SEEDING.md` for complete documentation.

## 🎉 Benefits

✅ **Reusable** - Use factories in tests, seeders, and scripts
✅ **Customizable** - Override any attribute with `.with()`
✅ **Chainable** - Fluent API for readable code
✅ **Organized** - Seeders manage dependencies
✅ **Tracked** - Migrations prevent re-running

---

**Happy Seeding! 🌱**
