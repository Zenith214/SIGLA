# Inactivity Timeout Feature

## Overview
The PULSE system now includes an automatic inactivity timeout that logs users out after 10 minutes of no activity. This enhances security by ensuring unattended sessions are automatically terminated.

## How It Works

### Activity Detection
The system monitors the following user activities:
- Mouse movements
- Mouse clicks
- Keyboard input
- Touch events (for mobile devices)
- Scrolling

### Timeout Behavior
- **Timeout Duration**: 10 minutes (600 seconds)
- **Activity Reset**: Any detected activity resets the timer back to 10 minutes
- **Auto-Logout**: When the timer expires, the user is automatically logged out
- **Redirect**: After logout, users are redirected to the login page with a message explaining the timeout

### User Experience
1. User logs in and uses the system normally
2. If the user stops interacting for 10 minutes, they are automatically logged out
3. Upon logout, they see: "You were logged out due to inactivity. Please log in again."
4. User can log back in immediately

## Implementation Details

### Files Modified/Created
- `src/hooks/useInactivityTimeout.ts` - Core hook that manages the timeout logic
- `src/components/auth/AuthProvider.tsx` - Integrated the hook into the auth system
- `src/app/login/page.tsx` - Added timeout message handling
- `src/hooks/__tests__/useInactivityTimeout.test.ts` - Unit tests

### Configuration
The timeout is currently set to 10 minutes. To change this:

1. Open `src/components/auth/AuthProvider.tsx`
2. Find the `useInactivityTimeout` call
3. Modify the `timeoutMinutes` parameter:

```typescript
useInactivityTimeout({
  timeoutMinutes: 15, // Change to desired minutes
  enabled: !!user,
  onTimeout: () => {
    console.log('User logged out due to inactivity');
    setUser(null);
  },
});
```

### Disabling the Feature
To disable the inactivity timeout:

1. Open `src/components/auth/AuthProvider.tsx`
2. Set `enabled: false` in the `useInactivityTimeout` call:

```typescript
useInactivityTimeout({
  timeoutMinutes: 10,
  enabled: false, // Disable the timeout
  onTimeout: () => {
    console.log('User logged out due to inactivity');
    setUser(null);
  },
});
```

## Security Benefits
- Prevents unauthorized access to unattended sessions
- Reduces risk of data exposure in shared environments
- Complies with security best practices for web applications
- Automatic session cleanup

## Testing
Run the unit tests:
```bash
npm test useInactivityTimeout
```

## Future Enhancements
Possible improvements:
- Warning notification before logout (e.g., "You will be logged out in 1 minute")
- Configurable timeout per user role
- Activity logging for audit purposes
- "Remember me" option to extend timeout
