# Governance Integrity Snapshot Implementation

## Overview
Implemented a new "Governance Integrity Snapshot" section in the report card that displays corruption-related data from the Financial Administration section of surveys. This feature is **Admin-only** and provides sensitive governance metrics.

## Implementation Details

### 1. Component: `GovernanceIntegritySnapshot.tsx`
**Location:** `src/components/reportcard/GovernanceIntegritySnapshot.tsx`

**Features:**
- Collapsed by default with expand/collapse button
- Admin-only badge and confidentiality notice
- Lazy loading: data fetches only when expanded for the first time
- Four main sections:
  1. **Corruption Experience Rate KPI** - Shows percentage of residents who experienced corruption
  2. **Reporting Funnel** - Visualizes: Experienced → Reported → Satisfied with Response
  3. **Top Reasons for Not Reporting** - Ranked list with percentages
  4. **Resident Voice on Corruption** - Types witnessed + prevention suggestions

**Design:**
- Red/orange color scheme to indicate sensitivity
- Confidentiality notice at the bottom
- Responsive layout with progress bars and badges

### 2. API Endpoint: `/api/governance-integrity`
**Location:** `src/app/api/governance-integrity/route.ts`

**Security:**
- Requires authentication (JWT token)
- Requires admin role (checked via `isAdmin()` middleware)
- Returns 401 for unauthenticated, 403 for non-admin users

**Data Source:**
- Extracts data from Financial Administration section (`section_key: 'financial'`)
- Only processes completed surveys (`progress: 100`)
- Filters by `barangay_id` and `survey_cycle_id`

**Corruption Questions Mapped:**
- `awarenessCorruption` - Did resident experience corruption?
- `reportedCorruption` - Did they report it?
- `satisfactionCorruptionResponse` - Were they satisfied with response?
- `reasonNotReporting` / `whyNotReported` - Why didn't they report?
- `corruptionType` / `typeOfCorruption` - What type of corruption?
- `corruptionPreventionSuggestion` / `preventionSuggestion` - Prevention ideas

**Calculations:**
- Corruption Experience Rate = (experiencedCount / totalRespondents) × 100
- Reporting Funnel percentages based on total respondents
- Top 5 reasons for not reporting (sorted by frequency)
- Top 10 corruption types (sorted by frequency)
- Up to 10 unique prevention suggestions

### 3. Integration: Report Card Page
**Location:** `src/app/reportcard/page.tsx`

**Changes:**
1. Added import: `import { GovernanceIntegritySnapshot } from '@/components/reportcard/GovernanceIntegritySnapshot';`
2. Added component after Community Voice section, before Action Grid
3. Conditional rendering: `{currentUser?.role === 'admin' && ...}`
4. Passes required props: `barangayId`, `cycleId`, `barangayName`

**Placement:**
```
Executive Summary
  ↓
Community Voice
  ↓
Governance Integrity Snapshot ← NEW (Admin Only)
  ↓
Action Grid
```

## Role-Based Access Control

**Admin Check:**
- Frontend: `currentUser?.role === 'admin'`
- Backend: `isAdmin(request)` from `@/lib/auth-middleware`
- Roles that can access: `'admin'` or `'developer'`

**Non-Admin Users:**
- Component is not rendered at all (no placeholder)
- API returns 403 Forbidden if accessed directly

## Data Privacy & Security

**Confidentiality Measures:**
1. Admin-only access at both frontend and backend
2. Confidentiality notice displayed prominently
3. No individual response identification
4. Aggregated data only
5. Sensitive field names (e.g., `awarenessCorruption`) not exposed to non-admins

**Best Practices:**
- Data is fetched on-demand (not preloaded)
- Clear visual indicators (red theme, badges, warnings)
- Collapsed by default to prevent accidental exposure
- Print-friendly (included in print view for admins)

## Testing Checklist

### Functional Testing
- [ ] Component renders for admin users
- [ ] Component hidden for non-admin users (officer, viewer)
- [ ] Expand/collapse functionality works
- [ ] Data loads correctly when expanded
- [ ] Loading state displays during fetch
- [ ] Error state displays on API failure
- [ ] All four sections render with correct data
- [ ] Percentages calculate correctly
- [ ] Progress bars display proportionally

### Security Testing
- [ ] Non-admin users get 403 when accessing API directly
- [ ] Unauthenticated requests get 401
- [ ] No data leaks in network responses for non-admins
- [ ] Component not visible in DOM for non-admins

### Data Validation Testing
- [ ] Handles zero corruption cases gracefully
- [ ] Handles missing data fields (conditional_skip)
- [ ] Calculates funnel percentages correctly
- [ ] Sorts reasons and types by frequency
- [ ] Filters out duplicate suggestions
- [ ] Handles empty survey responses

### UI/UX Testing
- [ ] Responsive on mobile, tablet, desktop
- [ ] Color scheme appropriate for sensitive data
- [ ] Badges and icons display correctly
- [ ] Confidentiality notice is prominent
- [ ] Print view includes section (for admins)

## Future Enhancements

1. **Trend Analysis:** Compare corruption rates across cycles
2. **Geographic Breakdown:** Show corruption hotspots within barangay
3. **Action Recommendations:** AI-generated anti-corruption strategies
4. **Export Options:** Secure PDF export for admin reports
5. **Anonymization:** Additional data masking for extra-sensitive cases
6. **Audit Logging:** Track who accesses governance data and when

## Files Modified/Created

### Created:
- `src/components/reportcard/GovernanceIntegritySnapshot.tsx` (320 lines)
- `src/app/api/governance-integrity/route.ts` (170 lines)
- `GOVERNANCE_INTEGRITY_IMPLEMENTATION.md` (this file)

### Modified:
- `src/app/reportcard/page.tsx` (added import + component rendering)

## Dependencies
- Existing UI components: `Card`, `Badge`, `Button` from `@/components/ui`
- Icons: `lucide-react` (Shield, AlertTriangle, MessageSquare, ChevronDown, ChevronUp)
- Auth: `@/lib/auth-middleware` (verifyAuth, isAdmin)
- Database: Prisma Client (SurveyResponse, SurveySection models)

## Notes
- Component follows existing report card patterns (caching, loading states, error handling)
- API endpoint follows existing security patterns (JWT verification, role checking)
- Data extraction is flexible to handle variations in field names
- All calculations are based on CSIS methodology (consistent with other metrics)
