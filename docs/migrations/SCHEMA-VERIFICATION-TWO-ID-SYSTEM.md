# Database Schema Verification: Two-ID Questionnaire System

**Date**: 2025-12-01  
**Purpose**: Verify that the database schema correctly uses `full_id` (questionnaire_id) as the primary key and that no `display_id` column exists in the database.

## Executive Summary

✅ **VERIFIED**: The database schema correctly implements the Two-ID Questionnaire System design:
- `questionnaire_id` (full_id) is the primary key
- All foreign key references use `questionnaire_id` (full_id)
- No `display_id` column exists in the database
- `display_id` is calculated dynamically at the API layer

---

## 1. Questionnaires Table Schema

### Primary Key Verification

**Table**: `questionnaires`  
**Primary Key**: `questionnaire_id` (VARCHAR(50))

```sql
CREATE TABLE "questionnaires" (
    "questionnaire_id" VARCHAR(50) PRIMARY KEY,
    "spot_id" INTEGER NOT NULL,
    "cycle_id" INTEGER NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'Pending',
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    
    CONSTRAINT "questionnaires_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "spots"("spot_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "questionnaires_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "survey_cycle"("cycle_id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Source**: `database/csis-workflow-migration.sql` (lines 40-53)

### Prisma Schema Definition

```prisma
model Questionnaire {
  questionnaire_id String               @id @db.VarChar(50) // e.g., "2024-001-001"
  spot_id          Int
  cycle_id         Int
  sequence_number  Int                  // 1-5 within spot
  status           QuestionnaireStatus  @default(Pending)
  visit_count      Int                  @default(0)
  created_at       DateTime             @default(now())
  updated_at       DateTime?            @updatedAt

  // Relations
  spot            Spot             @relation(fields: [spot_id], references: [spot_id], onDelete: Cascade)
  cycle           SurveyCycle      @relation(fields: [cycle_id], references: [cycle_id], onDelete: Cascade)
  visits          Visit[]
  survey_response SurveyResponse?

  @@index([spot_id])
  @@index([cycle_id])
  @@index([status])
  @@map("questionnaires")
}
```

**Source**: `prisma/schema.prisma` (lines 442-462)

### Key Observations

✅ **Primary Key**: `questionnaire_id` is defined as the primary key  
✅ **Data Type**: VARCHAR(50) - sufficient for format YYYY-BB-SS-QQQ  
✅ **No display_id column**: Confirmed absent from schema  
✅ **Foreign Keys**: References to spots and survey_cycles use appropriate keys

---

## 2. Foreign Key References to Questionnaires

### 2.1 Survey Response Table

**Foreign Key**: `survey_response.questionnaire_id` → `questionnaires.questionnaire_id`

```sql
ALTER TABLE "survey_response"
ADD CONSTRAINT "survey_response_questionnaire_id_fkey" 
    FOREIGN KEY ("questionnaire_id") REFERENCES "questionnaires"("questionnaire_id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
```

**Source**: `database/csis-workflow-migration.sql` (lines 90-92)

**Prisma Schema**:
```prisma
model SurveyResponse {
  // ... other fields
  questionnaire_id       String?               @unique @db.VarChar(50)
  
  // Relations
  questionnaire Questionnaire?      @relation(fields: [questionnaire_id], references: [questionnaire_id], onDelete: SetNull)
  
  @@index([questionnaire_id])
  @@map("survey_response")
}
```

**Source**: `prisma/schema.prisma` (lines 148-149, 159)

**Unique Constraint**: 
```sql
ADD CONSTRAINT "survey_response_questionnaire_id_key" UNIQUE ("questionnaire_id");
```

This ensures one-to-one relationship between questionnaire and survey response.

### 2.2 Visits Table

**Foreign Key**: `visits.questionnaire_id` → `questionnaires.questionnaire_id`

```sql
CREATE TABLE "visits" (
    "visit_id" SERIAL PRIMARY KEY,
    "questionnaire_id" VARCHAR(50) NOT NULL,
    "visit_number" INTEGER NOT NULL,
    "visit_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outcome" "VisitOutcome" NOT NULL,
    "notes" TEXT,
    "location_lat" DECIMAL(10, 8),
    "location_lng" DECIMAL(11, 8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "visits_questionnaire_id_fkey" FOREIGN KEY ("questionnaire_id") 
        REFERENCES "questionnaires"("questionnaire_id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

**Source**: `database/csis-workflow-migration.sql` (lines 60-75)

**Prisma Schema**:
```prisma
model Visit {
  visit_id         Int          @id @default(autoincrement())
  questionnaire_id String
  // ... other fields
  
  // Relations
  questionnaire Questionnaire @relation(fields: [questionnaire_id], references: [questionnaire_id], onDelete: Cascade)

  @@index([questionnaire_id])
  @@map("visits")
}
```

**Source**: `prisma/schema.prisma` (lines 464-478)

---

## 3. Verification: No display_id Column

### Database Schema Search Results

**Search Query**: `display_id` in all `database/*.sql` files  
**Result**: **No matches found**

This confirms that:
- ✅ No `display_id` column exists in any database table
- ✅ No indexes on `display_id`
- ✅ No foreign keys referencing `display_id`
- ✅ No constraints involving `display_id`

### Prisma Schema Search Results

**Search Query**: `display_id` in `prisma/schema.prisma`  
**Result**: **No matches found**

This confirms that:
- ✅ No Prisma model includes a `display_id` field
- ✅ No relations use `display_id`
- ✅ No indexes on `display_id`

---

## 4. Data Integrity Verification

### 4.1 Cascade Behavior

**Questionnaire Deletion**:
- `visits` table: **CASCADE** - visits are deleted when questionnaire is deleted
- `survey_response` table: **SET NULL** - response remains but questionnaire_id is nullified

**Rationale**: 
- Visits are tightly coupled to questionnaires (no questionnaire = no visits)
- Survey responses may need to be preserved for audit purposes even if questionnaire is deleted

### 4.2 Update Behavior

**Questionnaire ID Update**:
- `visits` table: **CASCADE** - visit records are updated with new questionnaire_id
- `survey_response` table: **CASCADE** - response records are updated with new questionnaire_id

**Note**: In practice, questionnaire_id should be immutable (never updated), but CASCADE ensures consistency if updates occur.

### 4.3 Indexes for Performance

**Questionnaires Table**:
```sql
CREATE INDEX "questionnaires_spot_id_idx" ON "questionnaires"("spot_id");
CREATE INDEX "questionnaires_cycle_id_idx" ON "questionnaires"("cycle_id");
CREATE INDEX "questionnaires_status_idx" ON "questionnaires"("status");
```

**Survey Response Table**:
```sql
CREATE INDEX "survey_response_questionnaire_id_idx" ON "survey_response"("questionnaire_id");
```

**Visits Table**:
```sql
CREATE INDEX "visits_questionnaire_id_idx" ON "visits"("questionnaire_id");
```

These indexes optimize queries that:
- Fetch questionnaires by spot or cycle
- Filter questionnaires by status
- Join survey responses to questionnaires
- Retrieve visit history for a questionnaire

---

## 5. Display ID Implementation Strategy

### 5.1 Calculation Layer

**Location**: API Layer (Backend)  
**Implementation**: `src/utils/displayIdCalculator.ts`

```typescript
/**
 * Calculate display_id from full_id
 * Formula: display_id = ((spot_number - 1) * 5) + questionnaire_within_spot_number
 */
export function calculateDisplayId(full_id: string): number | null {
  const parsed = parseQuestionnaireId(full_id);
  
  if (!parsed.isValid) {
    return null;
  }
  
  return ((parsed.spotNumber - 1) * 5) + parsed.questionnaireNumber;
}
```

### 5.2 API Response Augmentation

**Endpoints Modified**:
- `GET /api/assignments` - Returns questionnaires with display_id
- `GET /api/spots` - Returns nested questionnaires with display_id
- `GET /api/fi/my-interviews` - Returns FI assignments with display_id

**Response Format**:
```json
{
  "questionnaire_id": "2025-10-02-001",
  "display_id": 6,
  "spot_id": 2,
  "cycle_id": 1,
  "status": "Pending",
  "visit_count": 0
}
```

### 5.3 Storage Strategy

**Database**: Stores only `questionnaire_id` (full_id)  
**API Response**: Includes both `questionnaire_id` and `display_id`  
**Frontend Display**: Shows `display_id` to users  
**Frontend Operations**: Uses `questionnaire_id` for all data operations

**Rationale**:
- Avoids data duplication in database
- Prevents synchronization issues between full_id and display_id
- Allows formula changes without database migration
- Maintains single source of truth (full_id)

---

## 6. Requirements Validation

### Requirement 2.1: Primary Key Usage

✅ **VERIFIED**: `questionnaire_id` (full_id) is the primary key in the questionnaires table

**Evidence**:
- SQL: `"questionnaire_id" VARCHAR(50) PRIMARY KEY`
- Prisma: `questionnaire_id String @id @db.VarChar(50)`

### Requirement 2.2: Foreign Key References

✅ **VERIFIED**: All foreign key references use `questionnaire_id` (full_id)

**Evidence**:
- `survey_response.questionnaire_id` → `questionnaires.questionnaire_id`
- `visits.questionnaire_id` → `questionnaires.questionnaire_id`

### Requirement 2.3: Database Queries

✅ **VERIFIED**: Database queries use `questionnaire_id` for joins and relationships

**Evidence**:
- Foreign key constraints enforce referential integrity
- Indexes on `questionnaire_id` optimize join performance
- Prisma relations use `questionnaire_id` as the linking field

### Requirement 2.4: No display_id Column

✅ **VERIFIED**: No `display_id` column exists in the database

**Evidence**:
- Search of all SQL migration files: 0 matches for "display_id"
- Search of Prisma schema: 0 matches for "display_id"
- Table definitions contain only `questionnaire_id`

---

## 7. Migration History

### Initial Schema Creation

**File**: `database/csis-workflow-migration.sql`  
**Date**: Original CSIS workflow implementation  
**Changes**:
- Created `questionnaires` table with `questionnaire_id` as primary key
- Created `visits` table with foreign key to `questionnaires`
- Updated `survey_response` table with foreign key to `questionnaires`

### Safe Migration

**File**: `database/csis-workflow-migration-safe.sql`  
**Purpose**: Idempotent version with IF NOT EXISTS checks  
**Changes**: Same as above, but safe for re-running

### Rollback Script

**File**: `database/csis-workflow-rollback.sql`  
**Purpose**: Revert CSIS workflow changes  
**Verification**: Rollback script drops constraints and tables correctly

---

## 8. Conclusion

The database schema correctly implements the Two-ID Questionnaire System design:

1. ✅ **Primary Key**: `questionnaire_id` (full_id) is the primary key
2. ✅ **Foreign Keys**: All references use `questionnaire_id` (full_id)
3. ✅ **No display_id Column**: Confirmed absent from all tables
4. ✅ **Dynamic Calculation**: `display_id` is calculated at API layer, not stored
5. ✅ **Data Integrity**: Proper cascade behavior and constraints
6. ✅ **Performance**: Appropriate indexes on `questionnaire_id`

**Requirements Satisfied**:
- Requirement 2.1: Primary key usage ✅
- Requirement 2.2: Foreign key references ✅
- Requirement 2.3: Database queries ✅
- Requirement 2.4: No display_id column ✅

**No Changes Required**: The database schema is correctly implemented and requires no modifications for the Two-ID Questionnaire System.

---

## 9. References

### Database Files
- `database/csis-workflow-migration.sql` - Initial schema creation
- `database/csis-workflow-migration-safe.sql` - Safe migration version
- `database/csis-workflow-rollback.sql` - Rollback script

### Schema Files
- `prisma/schema.prisma` - Prisma ORM schema definition

### Related Documentation
- `.kiro/specs/two-id-questionnaire-system/requirements.md` - System requirements
- `.kiro/specs/two-id-questionnaire-system/design.md` - System design
- `.kiro/specs/two-id-questionnaire-system/tasks.md` - Implementation tasks
