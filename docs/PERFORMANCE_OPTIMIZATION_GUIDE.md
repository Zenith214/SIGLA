# Performance Optimization Guide

## Overview
This guide provides instructions for applying and maintaining the performance optimizations implemented in Task 22 of the CSIS workflow upgrade.

## Quick Start

### 1. Apply Database Indexes
```bash
# Apply all performance indexes to the database
node scripts/apply-performance-indexes.js
```

This will create:
- Composite indexes for frequently queried field combinations
- Partial indexes for active records
- BRIN indexes for time-series data
- GIN indexes for JSON fields

### 2. Import CSS Styles
Add to `src/app/globals.css`:
```css
@import '../styles/animations.css';
@import '../styles/responsive.css';
```

### 3. Test Performance
```bash
# Install testing dependencies
npm install --save-dev lighthouse chrome-launcher

# Run performance tests
node scripts/test-performance.js
```

## Database Optimization

### Index Strategy
The optimization adds indexes for:

1. **Spot Queries**
   - `idx_spots_cycle_barangay` - Filter by cycle and barangay
   - `idx_spots_cycle_fi` - Filter by cycle and assigned FI
   - `idx_spots_starting_point_gin` - JSON field queries

2. **Questionnaire Queries**
   - `idx_questionnaires_spot_status` - Progress calculations
   - Existing indexes on spot_id, cycle_id, status

3. **Visit Queries**
   - `idx_visits_questionnaire_timestamp` - Visit history with ordering
   - Existing index on questionnaire_id

4. **Survey Response Queries**
   - `idx_survey_responses_cycle_status` - Analytics queries
   - `idx_survey_responses_interviewer_cycle` - FI performance
   - `idx_survey_responses_created_at_brin` - Time-series queries

5. **Assignment Queries**
   - `idx_assignments_user_cycle` - User assignment lookups

### Query Optimization Tips

#### Use Pagination
```typescript
// Always paginate large result sets
const response = await fetch('/api/spots?cycleId=1&page=1&limit=50');
```

#### Filter by Cycle
```typescript
// Always filter by cycle_id for better performance
const spots = await supabase
  .from('spots')
  .select('*')
  .eq('cycle_id', activeCycleId); // Use indexed field
```

#### Use Composite Indexes
```typescript
// This query uses idx_spots_cycle_barangay
const spots = await supabase
  .from('spots')
  .select('*')
  .eq('cycle_id', 1)
  .eq('barangay_id', 26);
```

#### Avoid N+1 Queries
```typescript
// Bad: Multiple queries
const spots = await getSpots();
for (const spot of spots) {
  const questionnaires = await getQuestionnaires(spot.id); // N+1!
}

// Good: Single query with relations
const spots = await supabase
  .from('spots')
  .select(`
    *,
    questionnaires (*)
  `);
```

## Frontend Optimization

### Code Splitting

#### Lazy Load Heavy Components
```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### Dynamic Imports for Libraries
```typescript
// Lazy load heavy libraries
const loadLeaflet = async () => {
  const L = await import('leaflet');
  return L;
};
```

### Image Optimization

#### Use OptimizedImage Component
```typescript
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/images/map.png"
  alt="Map view"
  width={800}
  height={600}
  priority={false} // Lazy load
  quality={75} // Optimize quality
/>
```

#### Lazy Load Images
```typescript
import { lazyLoadImage } from '@/utils/performance';

useEffect(() => {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => lazyLoadImage(img as HTMLImageElement));
}, []);
```

### Performance Monitoring

#### Track Web Vitals
```typescript
// In _app.tsx or layout.tsx
import { reportWebVitals } from '@/utils/performance';

export function reportWebVitals(metric: any) {
  // Send to analytics
  console.log(metric);
}
```

#### Use Performance Utilities
```typescript
import { debounce, throttle } from '@/utils/performance';

// Debounce search input
const handleSearch = debounce((query: string) => {
  // Search logic
}, 300);

// Throttle scroll handler
const handleScroll = throttle(() => {
  // Scroll logic
}, 100);
```

### Bundle Optimization

#### Check Bundle Size
```bash
# Build and analyze
npm run build

# Check .next/analyze/ for bundle report
```

#### Optimize Imports
```typescript
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import only what you need
import debounce from 'lodash/debounce';

// Better: Use native or custom utilities
import { debounce } from '@/utils/performance';
```

## UI Polish

### Animations

#### Use Animation Classes
```tsx
// Fade in on mount
<div className="animate-fade-in">
  Content
</div>

// Slide in from bottom
<div className="animate-slide-in-up">
  Content
</div>

// Card with hover effect
<div className="card-hover">
  Content
</div>

// Loading skeleton
<div className="skeleton h-20 w-full" />
```

#### Custom Animations
```tsx
// Use Tailwind's animate utilities
<div className="animate-pulse">
  Loading...
</div>

// Combine with transitions
<div className="transition-smooth hover:scale-105">
  Hover me
</div>
```

### Tooltips

#### Basic Tooltip
```tsx
import { Tooltip } from '@/components/ui/tooltip';

<Tooltip content="Helpful information">
  <button>Hover me</button>
</Tooltip>
```

#### Info Icon Tooltip
```tsx
import { InfoTooltip } from '@/components/ui/tooltip';

<div className="flex items-center gap-2">
  <label>Field Name</label>
  <InfoTooltip content="This field is required for validation" />
</div>
```

### Responsive Design

#### Use Responsive Classes
```tsx
// Mobile-first responsive grid
<div className="grid-responsive">
  {items.map(item => (
    <div key={item.id} className="card-responsive">
      {item.content}
    </div>
  ))}
</div>

// Responsive text
<h1 className="text-responsive-2xl">
  Title
</h1>

// Hide on mobile
<div className="hide-mobile">
  Desktop only content
</div>

// Show only on mobile
<div className="show-mobile">
  Mobile only content
</div>
```

#### Touch-Friendly Components
```tsx
// Buttons with proper touch targets
<button className="btn-mobile">
  Click me
</button>

// Inputs with mobile optimization
<input className="input-mobile" />
```

## Performance Testing

### Lighthouse Testing
```bash
# Run automated Lighthouse tests
node scripts/test-performance.js

# Results saved to docs/PERFORMANCE_TEST_RESULTS.json
```

### Manual Testing Checklist

#### Desktop Testing
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Check Network tab for request count
- [ ] Verify no console errors
- [ ] Test with slow 3G throttling
- [ ] Check bundle size in build output

#### Mobile Testing
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Use Chrome DevTools device emulation
- [ ] Test with network throttling
- [ ] Verify touch targets (44x44px minimum)
- [ ] Test in portrait and landscape
- [ ] Check safe area insets on iOS

#### Performance Metrics
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 300ms

### Database Performance Testing

#### Monitor Query Performance
```sql
-- Enable slow query logging in PostgreSQL
ALTER DATABASE your_database SET log_min_duration_statement = 100;

-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### Test Index Usage
```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM spots
WHERE cycle_id = 1 AND barangay_id = 26;

-- Should show "Index Scan" not "Seq Scan"
```

## Monitoring in Production

### Set Up Monitoring

#### Web Vitals
```typescript
// Send to analytics service
export function reportWebVitals(metric: any) {
  // Google Analytics
  window.gtag?.('event', metric.name, {
    value: Math.round(metric.value),
    event_label: metric.id,
  });

  // Custom endpoint
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}
```

#### Error Tracking
```typescript
// Set up Sentry or similar
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### Performance Budgets

Set performance budgets in `next.config.ts`:
```typescript
experimental: {
  performanceBudgets: {
    maxInitialLoadSize: 200 * 1024, // 200KB
    maxAssetSize: 100 * 1024, // 100KB
  },
}
```

## Troubleshooting

### Slow Queries
1. Check if indexes are being used: `EXPLAIN ANALYZE`
2. Verify indexes exist: `\di` in psql
3. Run `ANALYZE` to update statistics
4. Consider adding missing indexes

### Large Bundle Size
1. Run `npm run build` and check output
2. Use `@next/bundle-analyzer`
3. Check for duplicate dependencies
4. Lazy load heavy components
5. Use dynamic imports for large libraries

### Poor Mobile Performance
1. Test on real devices, not just emulators
2. Check network requests (reduce count)
3. Optimize images (use WebP, lazy load)
4. Reduce JavaScript execution time
5. Use code splitting

### Layout Shift Issues
1. Set explicit width/height on images
2. Reserve space for dynamic content
3. Use CSS aspect-ratio
4. Avoid inserting content above existing content

## Best Practices

### Do's
✅ Always filter by cycle_id for better performance
✅ Use pagination for large lists
✅ Lazy load images and heavy components
✅ Use debounce/throttle for frequent events
✅ Test on real mobile devices
✅ Monitor Web Vitals in production
✅ Set explicit image dimensions
✅ Use proper semantic HTML

### Don'ts
❌ Don't load all data at once
❌ Don't use inline styles for animations
❌ Don't ignore accessibility
❌ Don't skip performance testing
❌ Don't use large images without optimization
❌ Don't block the main thread
❌ Don't ignore mobile users

## Resources

### Documentation
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [React Performance](https://react.dev/learn/render-and-commit)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

## Conclusion

Following this guide will help maintain optimal performance for the CSIS workflow. Regular monitoring and testing are essential to catch performance regressions early.

For questions or issues, refer to the Task 22 completion summary in `docs/TASK_22_COMPLETION_SUMMARY.md`.
