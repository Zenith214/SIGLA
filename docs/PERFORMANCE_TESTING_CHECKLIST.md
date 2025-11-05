# Performance Testing Quick Checklist

## Pre-Testing Setup
- [ ] Build production bundle
- [ ] Clear browser cache
- [ ] Close unnecessary browser tabs
- [ ] Disable browser extensions
- [ ] Use incognito/private mode

## Quick Performance Tests (10 minutes)

### Page Load
- [ ] Measure initial page load time (target: < 2s)
- [ ] Check First Contentful Paint (target: < 1.8s)
- [ ] Check Largest Contentful Paint (target: < 2.5s)
- [ ] Verify no layout shifts (CLS < 0.1)

### Chart Rendering
- [ ] Test radar chart with 5 barangays (target: < 1s)
- [ ] Test leaderboard with 25+ entries (target: < 1s)
- [ ] Verify smooth scrolling (60 FPS)
- [ ] Check for rendering lag

### Interactions
- [ ] Test tab switching (target: < 500ms)
- [ ] Test dropdown selections (target: < 200ms)
- [ ] Test sorting (target: < 300ms)
- [ ] Verify no UI freezing

### API Performance
- [ ] Check API response times (target: < 1s)
- [ ] Verify caching is working
- [ ] Test with slow network (3G)
- [ ] Check error handling

### Memory
- [ ] Monitor memory usage (target: < 100MB)
- [ ] Check for memory leaks
- [ ] Verify garbage collection
- [ ] Test after extended use

### Lighthouse Audit
- [ ] Run Lighthouse performance audit
- [ ] Check performance score (target: > 90)
- [ ] Review Core Web Vitals
- [ ] Address critical issues

## Critical Issues to Watch For
- [ ] Slow page load (> 3 seconds)
- [ ] Chart rendering lag
- [ ] Memory leaks
- [ ] Large bundle size (> 1MB)
- [ ] Slow API responses (> 2 seconds)
- [ ] Poor mobile performance

## Tools to Use
- [ ] Chrome DevTools Performance tab
- [ ] Chrome DevTools Network tab
- [ ] Chrome DevTools Memory tab
- [ ] Lighthouse
- [ ] webpack-bundle-analyzer

## Sign-off
- [ ] All performance targets met
- [ ] No critical issues found
- [ ] Optimizations applied
- [ ] Ready for production
