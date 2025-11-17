# Performance Optimization Quick Reference

## 🚀 Quick Setup

```bash
# 1. Apply database indexes
node scripts/apply-performance-indexes.js

# 2. Add to src/app/globals.css
@import '../styles/animations.css';
@import '../styles/responsive.css';

# 3. Test performance
npm install --save-dev lighthouse chrome-launcher
node scripts/test-performance.js
```

## 📊 Database

### Use Pagination
```typescript
fetch('/api/spots?cycleId=1&page=1&limit=50')
```

### Filter by Cycle
```typescript
.eq('cycle_id', activeCycleId) // Always use indexed fields
```

### Avoid N+1 Queries
```typescript
// ✅ Good: Single query with relations
.select('*, questionnaires(*)')

// ❌ Bad: Multiple queries in loop
```

## 🎨 Frontend

### Code Splitting
```typescript
const Heavy = lazy(() => import('./Heavy'));
<Suspense fallback={<Loading />}>
  <Heavy />
</Suspense>
```

### Optimized Images
```typescript
<OptimizedImage src="/img.png" width={800} height={600} />
```

### Performance Utils
```typescript
import { debounce, throttle } from '@/utils/performance';
const search = debounce(fn, 300);
const scroll = throttle(fn, 100);
```

## 💅 UI Polish

### Animations
```tsx
<div className="animate-fade-in card-hover">Content</div>
<div className="skeleton h-20 w-full" /> {/* Loading */}
```

### Tooltips
```tsx
<Tooltip content="Help text"><button>?</button></Tooltip>
<InfoTooltip content="Info" />
```

### Responsive
```tsx
<div className="grid-responsive">Items</div>
<button className="btn-mobile">Touch-friendly</button>
<div className="hide-mobile">Desktop only</div>
```

## 📱 Mobile

### Touch Targets
```css
min-height: 44px; /* iOS guideline */
min-width: 44px;
```

### Safe Areas
```tsx
<div className="safe-area-inset-bottom">Content</div>
```

## 🎯 Performance Targets

| Metric | Target |
|--------|--------|
| FCP | < 1.8s |
| LCP | < 2.5s |
| TTI | < 3.8s |
| CLS | < 0.1 |
| Bundle | < 200KB |

## 🔍 Testing

```bash
# Lighthouse
node scripts/test-performance.js

# Manual
# 1. Chrome DevTools > Lighthouse
# 2. Network tab (throttle to 3G)
# 3. Performance tab (record)
```

## ✅ Checklist

- [ ] Database indexes applied
- [ ] Pagination implemented
- [ ] Images optimized
- [ ] Code splitting added
- [ ] Animations smooth (60fps)
- [ ] Mobile tested (real device)
- [ ] Touch targets ≥ 44px
- [ ] Web Vitals passing
- [ ] No console errors
- [ ] Accessibility score ≥ 90

## 📚 Files

- `database/performance-optimization-indexes.sql` - DB indexes
- `src/utils/pagination.ts` - Pagination helpers
- `src/utils/performance.ts` - Performance utils
- `src/components/ui/optimized-image.tsx` - Image component
- `src/components/ui/tooltip.tsx` - Tooltip component
- `src/styles/animations.css` - Animation classes
- `src/styles/responsive.css` - Responsive utilities
- `scripts/apply-performance-indexes.js` - Apply indexes
- `scripts/test-performance.js` - Run tests

## 🆘 Troubleshooting

**Slow queries?**
```sql
EXPLAIN ANALYZE SELECT ...
```

**Large bundle?**
```bash
npm run build # Check output
```

**Poor mobile?**
- Test on real device
- Reduce network requests
- Optimize images
- Use code splitting

**Layout shift?**
- Set image dimensions
- Reserve space for dynamic content
- Use CSS aspect-ratio

---

📖 Full guide: `docs/PERFORMANCE_OPTIMIZATION_GUIDE.md`
📋 Summary: `docs/TASK_22_COMPLETION_SUMMARY.md`
