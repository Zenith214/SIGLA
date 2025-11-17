# Error Handling and User Feedback Implementation

This document describes the comprehensive error handling and user feedback system implemented for the CSIS workflow upgrade.

## Overview

The system provides:
1. **Comprehensive API error handling** with proper HTTP status codes and user-friendly messages
2. **Toast notifications** for success and error feedback
3. **Loading states** with spinners and overlays
4. **Confirmation dialogs** for destructive actions
5. **Validation feedback** with inline error messages

## API Error Handling

### Error Handler Utilities (`src/lib/api-error-handler.ts`)

All API endpoints now use standardized error handling utilities:

```typescript
import {
  createErrorResponse,
  createValidationError,
  createNotFoundError,
  createAuthError,
  createAuthorizationError,
  handleDatabaseError,
  logError
} from '@/lib/api-error-handler';
```

#### Error Types

- `VALIDATION_ERROR` (400) - Invalid input data
- `AUTHENTICATION_ERROR` (401) - Not authenticated
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `DATABASE_ERROR` (500) - Database operation failed
- `EXTERNAL_API_ERROR` (503) - External service failed
- `TIMEOUT_ERROR` (408) - Request timed out
- `RATE_LIMIT_ERROR` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Unexpected error

#### Example API Endpoint with Error Handling

```typescript
export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw createValidationError('Invalid JSON in request body');
    }

    const { cycleId, barangayId, spotName } = body;

    // Validate required fields
    if (!cycleId || !barangayId || !spotName) {
      throw createValidationError(
        "Missing required fields: cycleId, barangayId, spotName"
      );
    }

    // Validate field types
    if (typeof cycleId !== 'number' || cycleId <= 0) {
      throw createValidationError(
        'cycleId must be a positive integer',
        'cycleId',
        cycleId
      );
    }

    // Database operations with error handling
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('survey_cycle')
      .select('cycle_id')
      .eq('cycle_id', cycleId)
      .single();

    if (cycleError) {
      if (cycleError.code === 'PGRST116') {
        throw createNotFoundError('Survey cycle');
      }
      throw handleDatabaseError(cycleError, 'fetch survey cycle');
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: "Operation completed successfully"
    }, { status: 201 });

  } catch (error: any) {
    return createErrorResponse(error, 'POST /api/spots', {
      body: { cycleId, barangayId }
    });
  }
}
```

### Error Response Format

All errors return a consistent JSON format:

```json
{
  "error": "User-friendly error message",
  "type": "VALIDATION_ERROR",
  "context": {
    "field": "cycleId",
    "value": "invalid"
  }
}
```

## User Feedback Components

### Toast Notifications (`src/hooks/use-toast.tsx`)

Display temporary notifications for success, error, warning, or info messages.

```typescript
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const handleAction = async () => {
    try {
      const response = await fetch('/api/spots', { method: 'POST', ... });
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'Operation failed',
          type: 'error',
          duration: 5000
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Spot created successfully',
        type: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        type: 'error'
      });
    }
  };
}
```

### Confirmation Dialog (`src/components/ui/confirmation-dialog.tsx`)

Show confirmation dialogs for destructive actions.

```typescript
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/spots/${spotId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast({
        title: 'Success',
        description: 'Spot deleted successfully',
        type: 'success'
      });
      setShowConfirm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete spot',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete Spot</button>
      
      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Spot"
        description="Are you sure you want to delete this spot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### Loading Spinners (`src/components/ui/loading-spinner.tsx`)

Display loading states during async operations.

```typescript
import { LoadingSpinner, LoadingOverlay, InlineLoader } from '@/components/ui/loading-spinner';

// Inline spinner
<LoadingSpinner size="md" text="Loading..." />

// Full-page overlay
{isLoading && <LoadingOverlay text="Processing..." />}

// Inline loader for sections
<InlineLoader text="Fetching data..." />
```

### API Call Hook with Feedback (`src/hooks/useApiWithFeedback.ts`)

Simplified API calls with automatic error handling and feedback.

```typescript
import { useApiWithFeedback } from '@/hooks/useApiWithFeedback';

function MyComponent() {
  const { execute, isLoading, error } = useApiWithFeedback();

  const handleCreateSpot = async () => {
    const result = await execute(
      () => fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId, barangayId, spotName })
      }),
      {
        successMessage: 'Spot created successfully',
        errorMessage: 'Failed to create spot',
        onSuccess: (data) => {
          console.log('Created spot:', data);
          refreshSpots();
        },
        showSuccessToast: true,
        showErrorToast: true
      }
    );

    if (result) {
      // Handle success
      console.log('Spot ID:', result.spotId);
    }
  };

  return (
    <button onClick={handleCreateSpot} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Spot'}
    </button>
  );
}
```

## Validation Feedback

### Inline Validation Errors

Display validation errors next to form fields:

```typescript
const [errors, setErrors] = useState<{
  spotName?: string;
  randomStart?: string;
}>({});

const validateForm = (): boolean => {
  const newErrors: typeof errors = {};

  if (!spotName.trim()) {
    newErrors.spotName = "Spot name is required";
  }

  if (!randomStart || parseInt(randomStart) < 1 || parseInt(randomStart) > 999) {
    newErrors.randomStart = "Must be a number between 1 and 999";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

return (
  <div>
    <Input
      value={spotName}
      onChange={(e) => setSpotName(e.target.value)}
      className={errors.spotName ? "border-red-500" : ""}
    />
    {errors.spotName && (
      <p className="text-sm text-red-500">{errors.spotName}</p>
    )}
  </div>
);
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const response = await fetch('/api/spots');
const data = await response.json();

// ✅ Good
try {
  const response = await fetch('/api/spots');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  // Handle success
} catch (error) {
  // Handle error
  toast({ title: 'Error', description: error.message, type: 'error' });
}
```

### 2. Provide User Feedback

```typescript
// ❌ Bad - Silent failure
const handleDelete = async () => {
  await fetch(`/api/spots/${id}`, { method: 'DELETE' });
};

// ✅ Good - Clear feedback
const handleDelete = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`/api/spots/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');
    
    toast({
      title: 'Success',
      description: 'Spot deleted successfully',
      type: 'success'
    });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete spot',
      type: 'error'
    });
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Confirm Destructive Actions

```typescript
// ❌ Bad - No confirmation
<button onClick={handleDelete}>Delete</button>

// ✅ Good - Confirmation dialog
<button onClick={() => setShowConfirm(true)}>Delete</button>
<ConfirmationDialog
  isOpen={showConfirm}
  onConfirm={handleDelete}
  variant="destructive"
  title="Delete Spot"
  description="This action cannot be undone."
/>
```

### 4. Show Loading States

```typescript
// ❌ Bad - No loading indicator
<button onClick={handleSubmit}>Submit</button>

// ✅ Good - Loading state
<button onClick={handleSubmit} disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### 5. Validate Input

```typescript
// ❌ Bad - No validation
const handleSubmit = async () => {
  await fetch('/api/spots', {
    method: 'POST',
    body: JSON.stringify({ spotName, randomStart })
  });
};

// ✅ Good - Validate before submit
const handleSubmit = async () => {
  if (!validateForm()) {
    toast({
      title: 'Validation Error',
      description: 'Please fix the errors before submitting',
      type: 'error'
    });
    return;
  }
  
  // Proceed with submission
};
```

## Testing Error Handling

### Test API Endpoints

```bash
# Test validation error
curl -X POST http://localhost:3000/api/spots \
  -H "Content-Type: application/json" \
  -d '{"cycleId": "invalid"}'

# Expected: 400 Bad Request with validation error

# Test not found error
curl http://localhost:3000/api/spots/99999

# Expected: 404 Not Found

# Test authentication error
curl http://localhost:3000/api/fi/assignments

# Expected: 401 Unauthorized
```

### Test UI Feedback

1. **Success Toast**: Create a spot successfully
2. **Error Toast**: Try to create a spot with invalid data
3. **Loading State**: Observe spinner during API calls
4. **Confirmation Dialog**: Try to delete a spot
5. **Validation Errors**: Submit form with empty fields

## Summary

The error handling and user feedback system provides:

✅ **Comprehensive API error handling** with proper status codes
✅ **User-friendly error messages** instead of technical jargon
✅ **Toast notifications** for all operations
✅ **Loading indicators** during async operations
✅ **Confirmation dialogs** for destructive actions
✅ **Inline validation** with helpful error messages
✅ **Consistent error logging** for debugging
✅ **Retry logic** for transient failures

This ensures a professional, user-friendly experience throughout the CSIS workflow application.
