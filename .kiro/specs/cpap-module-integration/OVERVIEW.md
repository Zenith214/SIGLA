# CPAP Module Integration - Overview

## What Changed from Original Spec

### Original Approach
- CPAP module would pre-populate items from survey data
- AI roadmap remained in report cards
- Separate systems for viewing insights vs. creating action plans

### Updated Approach (Current)
- **Remove AI roadmap from report cards** - No more AI recommendations displayed in service area drill-downs or executive summary
- **Move AI recommendations to CPAP module** - AI suggestions become an optional helper tool for OFFICER users
- **Centralized action planning** - All action planning happens in one place (CPAP module)

## Key Features

### For OFFICER Users

1. **Manual CPAP Creation** (Primary workflow)
   - Create action items from scratch
   - Full control over all fields
   - No AI involvement required

2. **AI Suggestions** (Optional helper)
   - Click "AI Suggestions" button in Draft mode
   - View AI-generated recommendations based on survey analytics
   - Recommendations grouped by timeline:
     - Short-term (0-3 months)
     - Medium-term (6-12 months)
     - Long-term (1+ year)
   - Click "Use These Suggestions" to pre-fill CPAP items
   - Edit or delete AI-generated items before saving
   - **Completely optional** - can be ignored entirely

3. **Workflow**
   - Create/Edit CPAP → (Optionally use AI suggestions) → Submit for Review
   - Revise if needed → Resubmit
   - Track progress after approval

### For ADMIN Users

1. **Review & Approve** submitted CPAPs
2. **Request Revisions** with comments
3. **Monitor Progress** across all barangays
4. No AI involvement - reviews official plans only

### For Report Cards

1. **Analytics Only** - Focus on data visualization and insights
2. **No Action Planning** - AI roadmap sections removed
3. **Cleaner Interface** - Less clutter, clearer purpose

## Technical Implementation

### New API Endpoint
- `GET /api/cpap/ai-suggestions?barangay_id=X&cycle_id=Y`
- Leverages existing ML funnel analysis
- Transforms recommendations into CPAP item format
- Returns structured suggestions

### Report Card Changes
- Remove AI roadmap display from service modals
- Remove recommendations from executive summary
- Update export functions (CSV, PDF)
- Keep all other analytics intact

### UI Components
- AI Suggestions button (Draft mode only)
- AI Suggestions modal with preview
- "Use These Suggestions" action
- Visual indicators for AI-generated items

## Benefits

1. **Centralized Planning** - One place for all action planning
2. **User Control** - AI is a helper, not a requirement
3. **Cleaner Separation** - Report cards = insights, CPAP = action
4. **Flexibility** - OFFICER can use AI, ignore it, or mix both approaches
5. **Official Records** - Only submitted CPAPs are official, not AI suggestions

## Migration Path

1. Remove AI roadmap from report cards
2. Implement CPAP module with AI suggestions
3. Train users on new workflow
4. Monitor adoption and gather feedback
