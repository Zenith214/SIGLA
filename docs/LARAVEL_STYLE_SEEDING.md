# Laravel-Style Database Seeding System

This project now includes a Laravel-inspired seeding and factory system for automated data generation.

## 🏗️ Architecture

### Factories (`src/lib/factories/`)
Reusable data generators with customizable attributes:
- `BaseFactory.ts` - Abstract factory class
- `UserFactory.ts` - Generate users with different roles
- `SpotFactory.ts` - Generate survey spots
- `AssignmentFactory.ts` - Generate spot assignments

### Seeders (`src/lib/seeders/`)
Organized seeding classes with dependency management:
- `BaseSeeder.ts` - Abstract seeder class
- `DatabaseSeeder.ts` - Main seeder orchestrator
- `UserSeeder.ts` - Seed users
- `SpotSeeder.ts` - Seed spots
- `AssignmentSeeder.ts` - Seed assignments

### Migration Runner (`scripts/migrate.ts`)
Tracks and executes SQL migrations from the `database/` folder.

## 📦 Installation

Install tsx for TypeScript execution:
```bash
npm install -D tsx
```

## 🚀 Usage

### Run All Seeders
```bash
npm run db:seed
```

### Run Specific Seeder
```bash
npm run seed:users
npm run seed:spots
npm run seed:assignments
```

### Run Seeder with Options
```bash
# Seed 50 assignments with "pending" status
npm run seed:assignments -- --count 50 --status pending

# Seed 10 spots for specific cycle
npm run seed:spots -- --count 10 --cycleId 1
```

### Run Migrations
```bash
npm run db:migrate
```

### Fresh Database (Drop + Migrate + Seed)
```bash
npm run db:fresh -- --seed
```

## 🔧 Factory Examples

### Create Users
```typescript
import { userFactory } from '@/lib/factories';

// Create single interviewer
await userFactory()
  .interviewer()
  .create();

// Create 5 interviewers
await userFactory()
  .interviewer()
  .times(5)
  .create();

// Create custom user
await userFactory()
  .admin()
  .with({ 
    firstName: 'John',
    email: 'john@example.com'
  })
  .create();
```

### Create Spots
```typescript
import { spotFactory } from '@/lib/factories';

// Create spots for a barangay
await spotFactory()
  .forCycle(1)
  .forBarangay(101, 'Barangay Name')
  .unassigned()
  .times(10)
  .create();

// Create assigned spot
await spotFactory()
  .forCycle(1)
  .forBarangay(101)
  .assignedTo('interviewer-id')
  .create();
```

### Create Assignments
```typescript
import { assignmentFactory } from '@/lib/factories';

// Create pending assignments
await assignmentFactory()
  .forSpots([1, 2, 3])
  .forInterviewers(['id1', 'id2'])
  .pending()
  .times(3)
  .create();

// Create completed assignments
await assignmentFactory()
  .completed()
  .times(5)
  .create();
```

## 📝 Creating Custom Seeders

```typescript
import { BaseSeeder } from './BaseSeeder';
import { myFactory } from '../factories';

export class MySeeder extends BaseSeeder {
  public async run(): Promise<void> {
    this.log('Seeding my data...');

    try {
      await myFactory()
        .times(10)
        .create();

      this.success('Seeding complete!');
    } catch (error) {
      this.error(`Seeding failed: ${error.message}`);
      throw error;
    }
  }
}
```

## 📝 Creating Custom Factories

```typescript
import { BaseFactory } from './BaseFactory';
import { supabaseAdmin } from '@/lib/supabase';

export interface MyModel {
  name: string;
  value: number;
}

export class MyFactory extends BaseFactory<MyModel> {
  protected definition(): MyModel {
    return {
      name: `Item ${Math.random()}`,
      value: Math.floor(Math.random() * 100)
    };
  }

  public async create(): Promise<MyModel | MyModel[]> {
    const data = this.make();
    const items = Array.isArray(data) ? data : [data];

    const { data: created, error } = await supabaseAdmin
      .from('my_table')
      .insert(items)
      .select();

    if (error) throw new Error(`Failed: ${error.message}`);

    this.reset();
    return Array.isArray(data) ? (created || []) : (created?.[0] || data);
  }
}

export function myFactory(): MyFactory {
  return new MyFactory();
}
```

## 🎯 Benefits

1. **Reusable**: Factories can be used in tests, seeders, and development
2. **Customizable**: Override any attribute with `.with()`
3. **Chainable**: Fluent API for readable code
4. **Organized**: Seeders manage dependencies and execution order
5. **Tracked**: Migrations are tracked to prevent re-running

## 🔄 Migration System

The migration runner:
- Tracks executed migrations in a `migrations` table
- Runs pending SQL files from `database/` folder
- Skips already-executed migrations
- Stops on first error

### Migration File Naming
Use descriptive names with dates:
```
2024-01-15-create-users-table.sql
2024-01-16-add-status-column.sql
```

## 📊 Comparison with Laravel

| Feature | Laravel | This System |
|---------|---------|-------------|
| Factories | ✅ | ✅ |
| Seeders | ✅ | ✅ |
| Migrations | ✅ | ✅ (SQL-based) |
| Rollback | ✅ | ⚠️ (Manual) |
| Model Integration | ✅ | N/A (Supabase) |

## 🛠️ Future Enhancements

- [ ] Automatic rollback support
- [ ] Migration status command
- [ ] Seeder progress bars
- [ ] Factory states (like Laravel's `trashed()`, `suspended()`)
- [ ] Relationship handling in factories
- [ ] Faker integration for realistic data

## 📚 Related Files

- Factories: `src/lib/factories/`
- Seeders: `src/lib/seeders/`
- Scripts: `scripts/seed.ts`, `scripts/migrate.ts`
- Migrations: `database/*.sql`
