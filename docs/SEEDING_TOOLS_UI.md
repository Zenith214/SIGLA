# 🛠️ Seeding Tools in UI

The Laravel-style seeding system is now integrated into the Tools page UI!

## 📍 Location

Navigate to: **Tools → Database Tab → Laravel-Style Seeding System**

## 🎯 Available Actions

### 1. Run All Seeders
- **Button**: "Run All Seeders"
- **Action**: Executes `DatabaseSeeder` which runs all seeders in order
- **Creates**:
  - 5 interviewers
  - 2 viewers
  - 1 admin
  - 10 spots (distributed across barangays)
  - 20 assignments (spots assigned to interviewers)

### 2. Seed Users
- **Button**: "👥 Seed Users"
- **Action**: Executes `UserSeeder` only
- **Creates**:
  - 5 field interviewers
  - 2 data viewers/analysts
  - 1 system administrator

### 3. Seed Spots (10)
- **Button**: "📍 Seed Spots (10)"
- **Action**: Executes `SpotSeeder` with count=10
- **Creates**: 10 unassigned survey spots for the active cycle
- **Note**: Requires active survey cycle

### 4. Seed Assignments (20)
- **Button**: "📋 Seed Assignments (20)"
- **Action**: Executes `AssignmentSeeder` with count=20, status='Pending'
- **Creates**: 20 pending assignments linking spots to interviewers
- **Note**: Requires existing unassigned spots and active interviewers

## 🔄 Workflow

### Recommended Order:
1. **First**: Run "Seed Users" to create interviewers
2. **Second**: Run "Seed Spots" to create survey spots
3. **Third**: Run "Seed Assignments" to assign spots to interviewers

**OR** simply click "Run All Seeders" to do everything at once!

## 📊 Terminal Output

All seeding operations display real-time progress in the terminal at the bottom of the Tools page:

```
> [SUCCESS] ✅ DatabaseSeeder completed successfully
> 📝 Seeding Users...
> ✅ Created 5 interviewers
> ✅ Created 2 viewers
> ✅ Created 1 admin
> ✅ User seeding complete!
> 📝 Seeding Spots...
> ✅ Created 2 spots for Barangay A
> ✅ Created 2 spots for Barangay B
> ...
```

## 🎨 UI Features

- **Disabled State**: Buttons are disabled during generation/deletion operations
- **Real-time Feedback**: Terminal shows progress and results
- **Auto-refresh**: Barangay list refreshes after spot/assignment seeding
- **Error Handling**: Displays errors in terminal with red [ERROR] prefix

## 🔧 Customization

Want different options? You can modify the button onClick handlers:

```typescript
// Change spot count
onClick={() => runSeeder('SpotSeeder', { count: 20 })}

// Change assignment status
onClick={() => runSeeder('AssignmentSeeder', { 
  count: 50, 
  status: 'In Progress' 
})}

// Seed for specific cycle
onClick={() => runSeeder('SpotSeeder', { 
  count: 10, 
  cycleId: 1 
})}
```

## 📝 Behind the Scenes

### API Endpoint
- **Route**: `/api/tools/run-seeder`
- **Method**: POST
- **Body**: `{ seederName: string, options: object }`

### Seeder Classes
- Located in: `src/lib/seeders/`
- Uses factories from: `src/lib/factories/`

### Factory Pattern
Each seeder uses factories to generate realistic data:
- `UserFactory` - Generates users with Filipino names
- `SpotFactory` - Generates spots with GPS coordinates
- `AssignmentFactory` - Links spots to interviewers

## 🚀 Benefits

1. **One-Click Seeding**: No need to run CLI commands
2. **Visual Feedback**: See progress in real-time
3. **Integrated**: Works seamlessly with existing tools
4. **Safe**: Respects active cycle and existing data
5. **Fast**: Generates data in seconds

## 💡 Use Cases

### Development
- Quickly populate database with test data
- Test assignment workflows
- Verify spot creation logic

### Testing
- Generate consistent test datasets
- Test with different user roles
- Validate assignment distribution

### Demos
- Populate demo environment
- Show realistic data to stakeholders
- Test full survey workflow

## ⚠️ Notes

- Seeders respect the active survey cycle
- Spots are created as "Pending" by default
- Assignments link to active interviewers only
- All generated data is realistic and follows CSIS protocols

## 🎉 Quick Start

1. Open Tools page
2. Go to "Database" tab
3. Click "Run All Seeders"
4. Watch the terminal for progress
5. Done! Your database now has test data

---

**Happy Seeding! 🌱**
