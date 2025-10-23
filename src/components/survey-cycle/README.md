# Survey Cycle Context and Components

This directory contains the React context provider and components for managing survey cycle state throughout the application.

## Components

### SurveyCycleProvider
The main context provider that manages survey cycle state. It should be wrapped around your application (already added to the main layout).

### CycleSelectorDropdown
A full-featured dropdown component for selecting and changing the active survey cycle.

**Props:**
- `className?: string` - Additional CSS classes
- `showLabel?: boolean` - Whether to show the "Survey Cycle" label (default: true)
- `compact?: boolean` - Use compact styling (default: false)

**Features:**
- Shows all available cycles
- Displays active cycle indicator
- Admin-only cycle switching
- Loading and error states
- Permission notices for non-admin users

### CompactCycleSelector
A compact version of the cycle selector, ideal for navigation bars.

### CycleDisplay
A read-only component that displays the current active cycle information.

## Hooks

### useSurveyCycle
The main hook for accessing survey cycle context.

```typescript
const { 
  activeCycle,      // Current active cycle or null
  allCycles,        // Array of all cycles
  loading,          // Loading state
  error,            // Error message or null
  refreshActiveCycle,    // Function to refresh active cycle
  refreshAllCycles,      // Function to refresh all cycles
  setActiveCycle         // Function to set active cycle (admin only)
} = useSurveyCycle();
```

### useActiveCycle
A convenience hook for accessing active cycle information.

```typescript
const {
  activeCycle,      // Current active cycle or null
  hasActiveCycle,   // Boolean indicating if there's an active cycle
  loading,          // Loading state
  error,            // Error message or null
  cycleId,          // Active cycle ID or null
  cycleName,        // Active cycle name or null
  cycleYear         // Active cycle year or null
} = useActiveCycle();
```

### useCycleManagement
A hook with additional utilities for cycle management.

```typescript
const {
  ...useSurveyCycle(),  // All properties from useSurveyCycle
  canActivateCycle,     // Function to check if a cycle can be activated
  getCycleById          // Function to get cycle by ID
} = useCycleManagement();
```

## Usage Examples

### Basic Cycle Display
```tsx
import { CycleDisplay } from '@/components/survey-cycle';

function MyComponent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <CycleDisplay />
    </div>
  );
}
```

### Cycle-Aware Data Fetching
```tsx
import { useActiveCycle } from '@/hooks/useSurveyCycle';

function DataComponent() {
  const { activeCycle, hasActiveCycle, loading } = useActiveCycle();
  
  useEffect(() => {
    if (hasActiveCycle && activeCycle) {
      // Fetch data for the active cycle
      fetchDataForCycle(activeCycle.cycle_id);
    }
  }, [activeCycle, hasActiveCycle]);
  
  if (loading) return <div>Loading...</div>;
  if (!hasActiveCycle) return <div>No active cycle</div>;
  
  return <div>Data for {activeCycle.name}</div>;
}
```

### Admin Cycle Management
```tsx
import { CycleSelectorDropdown } from '@/components/survey-cycle';

function AdminPanel() {
  return (
    <div>
      <h2>Cycle Management</h2>
      <CycleSelectorDropdown />
    </div>
  );
}
```

### Navigation Integration
```tsx
import { CompactCycleSelector } from '@/components/survey-cycle';

function Navbar() {
  return (
    <nav>
      <div>App Name</div>
      <CompactCycleSelector />
      <UserMenu />
    </nav>
  );
}
```

## Automatic Data Refresh

The context automatically refreshes data when:
- The component mounts
- The active cycle changes
- Manual refresh functions are called

Components using the context will automatically re-render when the cycle state changes, ensuring the UI stays in sync with the current active cycle.

## Error Handling

The context handles various error scenarios:
- Network failures
- Missing active cycles
- Permission errors
- Invalid cycle IDs

Error states are exposed through the `error` property and displayed in the UI components.

## Testing

A test page is available at `/cycle-test` to verify the context and components are working correctly. This page shows:
- Current context state
- All available cycles
- Component functionality
- Hook values

## Integration Notes

- The context is already integrated into the main application layout
- The navbar has been updated to include the compact cycle selector
- The analytics dashboard shows an example of cycle-aware components
- All components handle loading and error states gracefully
- Only admin users can change the active cycle