# Accessibility Testing Quick Checklist

## Pre-Testing Setup
- [ ] Install axe DevTools extension
- [ ] Install screen reader (NVDA/JAWS/VoiceOver)
- [ ] Install color contrast checker
- [ ] Prepare keyboard for testing

## Quick Accessibility Tests (15 minutes)

### Automated Scans
- [ ] Run axe DevTools scan (target: 0 critical issues)
- [ ] Run Lighthouse accessibility audit (target: > 90)
- [ ] Review and document all issues

### Keyboard Navigation
- [ ] Tab through entire page
- [ ] Verify all interactive elements reachable
- [ ] Check focus indicators visible
- [ ] Test dropdown with keyboard
- [ ] Test tab navigation with keyboard
- [ ] Verify no keyboard traps

### Screen Reader
- [ ] Navigate with screen reader
- [ ] Verify all content announced
- [ ] Check chart descriptions
- [ ] Test form labels
- [ ] Verify error messages announced

### Color Contrast
- [ ] Check text contrast (4.5:1)
- [ ] Check UI component contrast (3:1)
- [ ] Verify focus indicator contrast
- [ ] Test with color blindness simulator

### ARIA
- [ ] Check ARIA roles
- [ ] Verify ARIA labels
- [ ] Check aria-live regions
- [ ] Verify tab ARIA attributes

## Critical Issues to Watch For
- [ ] Missing alt text
- [ ] Insufficient color contrast
- [ ] Keyboard traps
- [ ] Missing focus indicators
- [ ] Missing form labels
- [ ] Incorrect ARIA usage
- [ ] Missing heading structure

## Tools to Use
- [ ] axe DevTools
- [ ] Lighthouse
- [ ] Screen reader (NVDA/JAWS/VoiceOver)
- [ ] WebAIM Contrast Checker
- [ ] Keyboard only

## Sign-off
- [ ] No critical accessibility issues
- [ ] Lighthouse score > 90
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Ready for production
