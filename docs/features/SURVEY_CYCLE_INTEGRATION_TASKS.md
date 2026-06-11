# Survey Cycle Integration Tasks

## Overview
Transform the system from cycle-unaware to fully cycle-integrated, where all survey operations are scoped to the active survey cycle.

## Current State
- ❌ Survey cycles exist but aren't enforced
- ❌ Survey operations use calendar year instead of active cycle
- ❌ Dashboard shows aggregated data across all years
- ❌ No data isolation between cycles

## Target State
- ✅ All operations scoped to active survey cycle
- ✅ Data isolation between cycles
- ✅ Dashboard resets for new cycles
- ✅ Historical cycle comparison available

---

## Phase 1: Foundation (Critical - Do First)

### Task 1: Database Schema Updates
**Priority: HIGHEST** | **Status: ⏳ Pending**

**Objective:** Add survey cycle foreign keys to all relevant tables

**Changes Required:**
- [ ] Add `survey_cycle_id` column to `survey_response` table
- [ ] Add `survey_cycle_id` column to `survey_target` table
- [ ] Add `survey_cycle_id` column to `assignment` table
- [ ] Create foreign key constraints to `survey_cycle` table
- [ ] Ensure `survey_cycle` table has `is_active` boolean field
- [ ] Add unique constraint on `is_active = true` (only one active cycle)

**Files to Update:**
- Database migration scripts
- Prisma schema (if used)
- SQL schema files

**Testing:**
- [ ] Verify foreign key constraints work
- [ ] Test that only one cycle can be active
- [ ] Confirm existing data doesn't break

---

### Task 2: Active Survey Cycle API
**Priority: HIGHEST** | **Status: ⏳ Pending**

**Objective:** Create core API for managing active survey cycles

**API Endpoints to Create:**
- [ ] `GET /api/survey-cycles/active` - Get currently active cycle
- [ ] `POST /api/survey-cycles/active` - Set a cycle as active
- [ ] Helper function: `getActiveSurveyCycle()` for use in other APIs

**Files to Create:**
- [ ] `src/app/api/survey-cycles/active/route.ts`
- [ ] `src/utils/surveyCycleHelpers.ts`

**Business Logic:**
- [ ] Ensure only one cycle can be active at a time
- [ ] When setting new active cycle, deactivate previous one
- [ ] Return cycle year, name, and ID

**Testing:**
- [ ] Test setting active cycle
- [ ] Test getting active cycle
- [ ] Test that previous cycle gets deactivated

---

## Phase 2: Core Survey Operations (High Priority)

### Task 3: Fix Survey Response Creation
**Priority: HIGH** | **Status: ⏳ Pending**

**Objective:** Link all new survey responses to active cycle

**Changes Required:**
- [ ] Update mock data generator to use active cycle year
- [ ] Link survey responses to active `survey_cycle_id`
- [ ] Update survey number format: `BB-CYCLEYEAR-NNNN`
- [ ] Update survey forms to use active cycle

**Files to Update:**
- [ ] `src/app/api/tools/generate-mock-survey-data/route.ts`
- [ ] `src/app/api/survey-responses/route.ts`
- [ ] Survey form submission logic

**Key Changes:**
- [ ] Replace `new Date().getFullYear()` with active cycle year
- [ ] Add `survey_cycle_id` to all survey response inserts
- [ ] Update survey number generation logic

**Testing:**
- [ ] Generate mock data and verify cycle linkage
- [ ] Submit real survey and verify cycle linkage
- [ ] Test survey number format uses cycle year

---

### Task 4: Update Survey Dashboard Data
**Priority: HIGH** | **Status: ⏳ Pending**

**Objective:** Filter all dashboard data by active cycle

**Changes Required:**
- [ ] Filter barangays-with-assignments by active cycle
- [ ] Update progress calculations to be cycle-scoped
- [ ] Reset progress display for new cycles
- [ ] Update funnel analysis to use active cycle data

**Files to Update:**
- [ ] `src/app/api/barangays-with-assignments/route.ts`
- [ ] `src/app/api/funnel-analysis/route.ts`
- [ ] `src/app/survey/page.tsx`

**Key Changes:**
- [ ] Add `WHERE survey_cycle_id = ?` to all queries
- [ ] Update progress calculations to scope by cycle
- [ ] Show 0% progress for new cycles

**Testing:**
- [ ] Switch to new cycle and verify 0% progress
- [ ] Generate data and verify progress updates
- [ ] Test that old cycle data doesn't affect new cycle

---

### Task 5: Fix Survey Targets
**Priority: HIGH** | **Status: ⏳ Pending**

**Objective:** Link survey targets to active cycle

**Changes Required:**
- [ ] Link survey targets to active cycle on creation
- [ ] Update target progress calculations to be cycle-scoped
- [ ] Allow target reset when starting new cycle

**Files to Update:**
- [ ] `src/app/api/survey-targets/route.ts`
- [ ] Survey target creation/editing components
- [ ] Progress calculation logic

**Key Changes:**
- [ ] Add `survey_cycle_id` to target creation
- [ ] Filter target queries by active cycle
- [ ] Update achievement calculations

**Testing:**
- [ ] Create targets and verify cycle linkage
- [ ] Test progress calculations within cycle
- [ ] Verify targets reset for new cycles

---

## Phase 3: User Interface (Medium Priority)

### Task 6: Add Cycle Context & Selector
**Priority: MEDIUM** | **Status: ⏳ Pending**

**Objective:** Add cycle awareness to the UI

**Components to Create:**
- [ ] Survey cycle context provider
- [ ] Cycle selector dropdown component
- [ ] Cycle indicator in navigation

**Files to Create:**
- [ ] `src/contexts/SurveyCycleContext.tsx`
- [ ] `src/components/CycleSelectorDropdown.tsx`
- [ ] Update navigation components

**Features:**
- [ ] Global state for active cycle
- [ ] Cycle switching functionality
- [ ] Auto-refresh when cycle changes
- [ ] Visual indicator of current cycle

**Testing:**
- [ ] Test cycle switching updates all data
- [ ] Verify context provides correct cycle info
- [ ] Test UI updates when cycle changes

---

### Task 7: Update Assignment Management
**Priority: MEDIUM** | **Status: ⏳ Pending**

**Objective:** Make assignments cycle-aware

**Changes Required:**
- [ ] Link assignments to active cycle
- [ ] Filter assignment views by active cycle
- [ ] Update auto-completion logic to be cycle-scoped
- [ ] Allow assignment reset for new cycles

**Files to Update:**
- [ ] `src/app/api/assignments/route.ts`
- [ ] `src/app/settings/ui/sections/assignments.tsx`
- [ ] Assignment auto-completion logic

**Key Changes:**
- [ ] Add `survey_cycle_id` to assignment creation
- [ ] Filter assignment queries by active cycle
- [ ] Update progress tracking to be cycle-scoped

**Testing:**
- [ ] Create assignments and verify cycle linkage
- [ ] Test auto-completion within cycle scope
- [ ] Verify assignments reset for new cycles

---

## Phase 4: Advanced Features (Lower Priority)

### Task 8: Historical Data & Cycle Switching
**Priority: LOW** | **Status: ⏳ Pending**

**Objective:** Add ability to view and compare historical cycles

**Features to Add:**
- [ ] View previous cycle data
- [ ] Cycle comparison dashboard
- [ ] Historical trend analysis
- [ ] Cycle performance reports

**Files to Create:**
- [ ] Historical cycle viewer components
- [ ] Cycle comparison APIs
- [ ] Trend analysis utilities

**Testing:**
- [ ] Test viewing historical cycles
- [ ] Verify data isolation between cycles
- [ ] Test comparison features

---

### Task 9: ML Integration
**Priority: LOW** | **Status: ⏳ Pending**

**Objective:** Make ML models cycle-aware

**Changes Required:**
- [ ] Update ML training to use completed cycles
- [ ] Implement cycle-aware predictions
- [ ] Add trend analysis across cycles
- [ ] Historical pattern recognition

**Files to Update:**
- [ ] ML model training scripts
- [ ] Prediction APIs
- [ ] Analytics components

**Testing:**
- [ ] Test ML training with cycle data
- [ ] Verify predictions use correct cycle context
- [ ] Test trend analysis accuracy

---

## Implementation Guidelines

### Development Order
1. **Phase 1 (Tasks 1-2)**: Foundation - Database and Core API
2. **Phase 2 (Tasks 3-5)**: Core Operations - Survey Creation and Dashboard
3. **Phase 3 (Tasks 6-7)**: User Interface - UI and Assignment Management
4. **Phase 4 (Tasks 8-9)**: Advanced Features - Historical Data and ML

### Testing Strategy
- [ ] Test each task independently
- [ ] Integration testing between phases
- [ ] End-to-end testing of complete cycle workflow
- [ ] Performance testing with multiple cycles

### Rollback Plan
- [ ] Database backup before schema changes
- [ ] Feature flags for new cycle-aware functionality
- [ ] Ability to revert to non-cycle-aware mode if needed

---

## Success Criteria

### Functional Requirements
- [ ] New surveys automatically use active cycle
- [ ] Dashboard shows only active cycle data
- [ ] Progress resets to 0% for new cycles
- [ ] Historical cycles remain accessible
- [ ] Data isolation between cycles works perfectly

### User Experience
- [ ] Clear indication of current active cycle
- [ ] Smooth cycle switching experience
- [ ] No data loss during cycle transitions
- [ ] Intuitive cycle management interface

### Technical Requirements
- [ ] All database queries properly scoped by cycle
- [ ] No performance degradation
- [ ] Proper error handling for cycle operations
- [ ] Clean separation of cycle-specific data

---

## Notes
- **Data Migration**: Existing data will need to be assigned to appropriate cycles
- **Backward Compatibility**: Ensure system works during transition period
- **Performance**: Monitor query performance with cycle filtering
- **Documentation**: Update API documentation to reflect cycle requirements

---

**Last Updated:** December 2024  
**Status:** Planning Phase  
**Next Action:** Begin Task 1 - Database Schema Updates