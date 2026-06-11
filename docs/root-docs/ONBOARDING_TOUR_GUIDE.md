# Onboarding Tour Implementation

## What Was Built

A **guided interactive tour** that highlights actual UI elements on the dashboard using spotlights and tooltips. This replaces the modal-based welcome guide with a more engaging onboarding experience.

## Features

✅ **Interactive Spotlights** - Highlights specific UI elements with a dark overlay  
✅ **Step-by-Step Navigation** - Previous/Next buttons to control the tour  
✅ **Progress Indicator** - Shows current step (e.g., "Step 2 of 7")  
✅ **Smart Positioning** - Tooltips automatically position themselves around highlighted elements  
✅ **Keyboard Navigation** - Use arrow keys to navigate, ESC to close  
✅ **Auto-triggers** - Starts automatically after first login password change  
✅ **One-time Only** - Stored in localStorage, won't show again after completion  

## Tour Steps

1. **Welcome** - Center screen introduction
2. **Navigation Menu** - Highlights the top navbar
3. **Survey Cycle Selector** - Shows the active cycle display
4. **User Menu** - Points to profile/logout dropdown
5. **Dashboard Content** - Highlights the main map/analytics area
6. **Help Button** - Shows the floating (?) button
7. **Completion** - Final congratulations message

## How It Works

### Flow
```
User logs in (first time)
    ↓
Password change modal
    ↓
User changes password
    ↓
Redirected to dashboard
    ↓
Tour starts automatically (1 second delay)
    ↓
User completes tour
    ↓
localStorage: onboardingTourCompleted = true
    ↓
Tour won't show again
```

### Technical Implementation

**Library Used:** `driver.js` - Lightweight, no dependencies  
**Storage:** `localStorage.getItem('onboardingTourCompleted')`  
**Trigger:** Only on `/dashboard` route after first login  

## Files Created/Modified

### New Files
- `src/components/auth/OnboardingTour.tsx` - Tour component
- `src/styles/driver-custom.css` - Custom styling for tour
- `ONBOARDING_TOUR_GUIDE.md` - This documentation

### Modified Files
- `src/components/auth/FirstTimeLoginWrapper.tsx` - Replaced modal with tour
- `src/components/dashboard/Navbar.tsx` - Added `data-tour` attributes
- `src/components/dashboard/DashboardLayout.tsx` - Added `data-tour` attributes
- `src/components/dashboard/FloatingHelpButton.tsx` - Added `data-tour` attribute
- `src/app/layout.tsx` - Imported custom CSS

## Testing

### Test the Tour
1. Clear localStorage: `localStorage.removeItem('onboardingTourCompleted')`
2. Refresh the dashboard page
3. Tour should start automatically

### Test First-Time Login Flow
1. Set user's `firstLogin` to `true` in database
2. Login with that user
3. Change password
4. Should redirect to dashboard
5. Tour should start automatically

## Customization

### Add More Steps
Edit `src/components/auth/OnboardingTour.tsx`:

```typescript
steps: [
  // ... existing steps
  {
    element: '[data-tour="your-element"]',
    popover: {
      title: 'Your Title',
      description: 'Your description',
      side: "bottom", // top, bottom, left, right
      align: 'center' // start, center, end
    }
  }
]
```

Then add the attribute to your element:
```tsx
<div data-tour="your-element">...</div>
```

### Change Tour Trigger
Edit `src/components/auth/FirstTimeLoginWrapper.tsx`:

```typescript
// Current: Only on dashboard
if (!tourCompleted && window.location.pathname === '/dashboard') {
  setTimeout(() => setStartTour(true), 1000);
}

// Change to: Any page
if (!tourCompleted) {
  setTimeout(() => setStartTour(true), 1000);
}
```

### Customize Styling
Edit `src/styles/driver-custom.css` to change:
- Colors
- Border radius
- Button styles
- Overlay opacity
- Font sizes

## Manual Tour Trigger

To allow users to restart the tour manually, add a button:

```tsx
<Button onClick={() => {
  localStorage.removeItem('onboardingTourCompleted');
  window.location.reload();
}}>
  Restart Tour
</Button>
```

## Disable Tour

To temporarily disable the tour:

```typescript
// In FirstTimeLoginWrapper.tsx, comment out:
// const tourCompleted = localStorage.getItem('onboardingTourCompleted');
// if (!tourCompleted && window.location.pathname === '/dashboard') {
//   setTimeout(() => setStartTour(true), 1000);
// }
```

## Browser Compatibility

✅ Chrome/Edge (Chromium)  
✅ Firefox  
✅ Safari  
✅ Mobile browsers  

## Performance

- **Bundle size:** ~15KB (driver.js)
- **Load time:** Negligible
- **Memory:** Minimal impact
- **No external dependencies**

## Comparison: Modal vs Tour

| Feature | Old Modal | New Tour |
|---------|-----------|----------|
| Engagement | Low | High |
| Context | Generic | Specific |
| Navigation | Linear | Interactive |
| Learning | Passive | Active |
| Retention | Lower | Higher |
| UX | Blocking | Guiding |

## Future Enhancements

- [ ] Add tour for other pages (Reports, Settings, etc.)
- [ ] Role-specific tours (Admin vs Officer vs Viewer)
- [ ] Video tutorials in tour steps
- [ ] Analytics tracking (which steps users skip)
- [ ] Multi-language support
- [ ] Tour completion badge/achievement
