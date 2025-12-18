# Landing Page Image Recommendations

## Overview
This document outlines the recommended images and visual assets for the PULSE landing page. All placeholders should be replaced with actual images before production deployment.

---

## 1. Hero Section (Main Visual)

**Location**: Top of landing page, right side of hero text

**Recommended Image Type**: Dashboard mockup or data visualization

**Dimensions**: 1200x600px (2:1 ratio)

**Options**:
- Dashboard mockup showing the actual PULSE interface
- Abstract data visualization with charts and graphs
- Survey illustration showing community engagement
- Philippine government/barangay community scene

**Placeholder**: `https://placehold.co/1200x600/3b82f6/ffffff?text=PULSE+Dashboard`

**Best Choice**: Screenshot of the actual PULSE dashboard or a professional mockup

---

## 2. Trust/Stats Section

**Location**: Below hero section, horizontal row

**Recommended Image Type**: Icon badges or government logos

**Dimensions**: 120x120px each (square icons)

**Options**:
- Philippine government seal
- Local Government Unit (LGU) logos
- Simple icon badges (security, reliability, efficiency)
- Certification/compliance badges

**Placeholder**: `https://placehold.co/120x120/e5e7eb/6b7280?text=Logo`

**Best Choice**: Actual government agency logos or simple icon badges

---

## 3. Features Section (4 Features)

**Location**: Mid-page, grid layout with 4 feature cards

**Recommended Image Type**: Line-art icons or isometric illustrations

**Dimensions**: 400x300px each (4:3 ratio)

### Feature 1: Survey Management
- **Visual**: Calendar/schedule icon or form illustration
- **Placeholder**: `https://placehold.co/400x300/dbeafe/1e40af?text=Survey+Management`
- **Suggested Icon**: Calendar, clipboard, or form icon

### Feature 2: Assignment Tracking
- **Visual**: Map with location pins or user assignment diagram
- **Placeholder**: `https://placehold.co/400x300/dbeafe/1e40af?text=Assignment+Tracking`
- **Suggested Icon**: Map, users, or assignment icon

### Feature 3: Real-time Analytics
- **Visual**: Dashboard with charts and graphs
- **Placeholder**: `https://placehold.co/400x300/dbeafe/1e40af?text=Real-time+Analytics`
- **Suggested Icon**: Bar chart, line graph, or analytics icon

### Feature 4: Data Security
- **Visual**: Shield/lock icon or security illustration
- **Placeholder**: `https://placehold.co/400x300/dbeafe/1e40af?text=Data+Security`
- **Suggested Icon**: Shield, lock, or security badge

**Best Choice**: Simple line-art illustrations or isometric graphics (not photos)

---

## 4. How It Works Section (Workflow)

**Location**: Mid-page, showing 5-step process

**Recommended Image Type**: Flowchart diagram or step icons

**Dimensions**: 800x400px (2:1 ratio) or 200x200px per step

**Options**:
- Flowchart diagram with arrows showing workflow
- 5 numbered step icons
- Interface screenshots of each step
- Infographic-style visual

**Placeholder**: `https://placehold.co/800x400/f3f4f6/374151?text=Workflow+Diagram`

**Step Icons** (if using individual icons):
1. Create Cycle: `https://placehold.co/200x200/dbeafe/1e40af?text=1.+Create`
2. Assign: `https://placehold.co/200x200/dbeafe/1e40af?text=2.+Assign`
3. Survey: `https://placehold.co/200x200/dbeafe/1e40af?text=3.+Survey`
4. Track: `https://placehold.co/200x200/dbeafe/1e40af?text=4.+Track`
5. Report: `https://placehold.co/200x200/dbeafe/1e40af?text=5.+Report`

**Best Choice**: Flowchart diagram or numbered step icons

---

## 5. Benefits Section

**Location**: Mid-page, grid or list layout

**Recommended Image Type**: Abstract illustrations or icon set

**Dimensions**: 300x300px each (square)

**Benefits to Illustrate**:
- **Centralized Management**: Database/server icon
- **Improved Accountability**: Checkmark/verification icon
- **Faster Collection**: Speed/clock icon
- **Better Decisions**: Lightbulb/insight icon

**Placeholder**: `https://placehold.co/300x300/f0fdf4/16a34a?text=Benefit`

**Best Choice**: Simple icon set or abstract illustrations

---

## 6. Security & Privacy Section

**Location**: Lower section of page

**Recommended Image Type**: Security illustration or abstract graphic

**Dimensions**: 600x400px (3:2 ratio)

**Options**:
- Security illustration (lock, shield, encrypted data)
- Government compliance badges
- Abstract security graphic (fingerprint, key, secure connection)
- Screenshot of login/security features

**Placeholder**: `https://placehold.co/600x400/fef2f2/dc2626?text=Security+%26+Privacy`

**Best Choice**: Professional security illustration with lock/shield imagery

---

## 7. Footer Section

**Location**: Bottom of page

**Recommended Image Type**: Government/agency logo

**Dimensions**: 150x150px (square) or 200x80px (horizontal logo)

**Options**:
- Philippine government seal
- Your specific LGU or department logo
- PULSE system logo
- Minimal (no images, text only)

**Placeholder**: `https://placehold.co/150x150/1f2937/ffffff?text=Agency+Logo`

**Best Choice**: Actual government/agency logo

---

## Color Scheme Recommendations

### Primary Colors
- **Blue**: `#3b82f6` (Professional, trustworthy)
- **Slate**: `#1e293b` (Government authority)
- **White**: `#ffffff` (Clean, modern)

### Accent Colors
- **Green**: `#16a34a` (Success, completion)
- **Amber**: `#f59e0b` (Warnings, attention)
- **Red**: `#dc2626` (Security, important)

### Background Colors
- **Light Blue**: `#dbeafe` (Soft, approachable)
- **Gray**: `#f3f4f6` (Neutral sections)
- **White**: `#ffffff` (Main background)

---

## Image Sources (When Ready to Replace)

### Free Resources
1. **Unsplash** (unsplash.com) - High-quality photos
2. **Pexels** (pexels.com) - Free stock photos
3. **unDraw** (undraw.co) - Customizable illustrations
4. **Lucide Icons** (lucide.dev) - Already in project
5. **Heroicons** (heroicons.com) - Free icon set

### Custom Options
1. **Screenshots**: Take actual screenshots from PULSE system
2. **Mockups**: Create mockups using Figma or similar tools
3. **Custom Illustrations**: Commission custom artwork
4. **Government Assets**: Use official government imagery

---

## Implementation Notes

### Placeholder Service
Using `placehold.co` for all placeholders:
- Format: `https://placehold.co/{width}x{height}/{bg-color}/{text-color}?text={text}`
- Example: `https://placehold.co/600x400/3b82f6/ffffff?text=Dashboard`

### Next.js Image Component
All images should use Next.js `<Image>` component:
```tsx
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Descriptive alt text"
  width={1200}
  height={600}
  priority // For hero image
/>
```

### Optimization
- Use WebP format for better compression
- Provide multiple sizes for responsive design
- Add proper alt text for accessibility
- Use lazy loading for below-fold images

---

## Checklist Before Production

- [ ] Replace all placeholder images with actual images
- [ ] Optimize all images (compress, convert to WebP)
- [ ] Add descriptive alt text for accessibility
- [ ] Test images on different screen sizes
- [ ] Verify government logo usage permissions
- [ ] Ensure all images are properly licensed
- [ ] Test loading performance
- [ ] Add fallback images for errors

---

## Priority Order for Replacement

1. **High Priority** (Replace first):
   - Hero section image
   - Government/agency logos
   - Security section image

2. **Medium Priority**:
   - Feature section images
   - Workflow diagram

3. **Low Priority** (Can use icons instead):
   - Benefits section
   - Trust/stats badges

---

## Contact

For questions about image requirements or to submit actual images, contact the development team or project administrator.

**Last Updated**: October 30, 2025
