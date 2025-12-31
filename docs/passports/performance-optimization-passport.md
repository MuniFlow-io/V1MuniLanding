# Passport: Performance & Optimization

## Overview
Performance is non-negotiable. This site serves as credibility backup to our production app - if it's slow or janky, we lose trust instantly.

## Performance Philosophy
**Fast by default. Optimized always.**

Every decision should consider performance impact. Use Next.js optimizations, lazy loading, and modern web performance techniques throughout.

## Core Web Vitals Targets

### Largest Contentful Paint (LCP)
- **Target**: < 2.5 seconds
- **Strategy**: 
  - Optimize images (next/image)
  - Minimize render-blocking resources
  - Use CDN (Vercel Edge)

### First Input Delay (FID)
- **Target**: < 100ms
- **Strategy**:
  - Minimize JavaScript execution
  - Use code splitting
  - Defer non-critical scripts

### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- **Strategy**:
  - Reserve space for images/dynamic content
  - Avoid injecting content above existing content
  - Use CSS containment

## Optimization Strategies

### Images
- Use Next.js Image component exclusively
- Proper sizing and responsive images
- WebP/AVIF formats with fallbacks
- Lazy loading below the fold
- Blur placeholder for smooth loading experience

### Fonts
- Subset fonts to essential characters
- Use font-display: swap
- Preload critical fonts
- Consider variable fonts for flexibility with minimal weight
- System fonts as fallback for instant render

### JavaScript
- Code splitting by route
- Lazy load components when appropriate
- Tree shake unused code
- Minimize third-party scripts
- Dynamic imports for heavy components
- Bundle size budget: < 200KB gzipped

### CSS
- Tailwind JIT mode for minimal CSS
- Purge unused styles in production
- Critical CSS inline for above-fold content
- CSS bundle budget: < 50KB gzipped

### Caching
- Leverage Vercel's edge caching
- Proper cache headers
- Static generation where possible
- Aggressive caching for static assets

## Modern Component Optimization

### Floating Components & Layers
**Challenge**: Floating components with blur effects can be expensive.

**Solutions**:
- Use `backdrop-filter` sparingly (GPU intensive)
- Limit blur areas to small regions
- Use `will-change` only during active animations
- Prefer subtle shadows over heavy blur for depth
- Test performance impact of each layer

### Animation Performance
**60fps is non-negotiable.**

**GPU-Accelerated Properties Only**:
- ✅ `transform` (translate, scale, rotate)
- ✅ `opacity`
- ❌ `width`, `height`, `top`, `left`, `margin`, `padding`

**Best Practices**:
- Use `transform: translateY()` not `top`
- Use `transform: scale()` not `width/height`
- Keep animations under 300ms duration
- Use `ease-out` or spring curves for natural feel
- Implement `prefers-reduced-motion` media query

**Animation Checklist**:
- [ ] Uses only `transform` and `opacity`
- [ ] Runs at 60fps on mid-range devices
- [ ] Respects `prefers-reduced-motion`
- [ ] No layout thrashing
- [ ] Completes in < 300ms

### Glassmorphism & Backdrop Blur
**Use strategically, not everywhere.**

```css
/* Good: Small targeted area */
.floating-nav {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}

/* Bad: Full page blur */
.entire-page {
  backdrop-filter: blur(20px); /* Too expensive */
}
```

**Performance Tips**:
- Limit `backdrop-filter` to navigation/small cards
- Use static blur on images instead of live blur
- Fallback to solid colors on slower devices
- Test on iPhone SE / Android mid-range

### Hover Effects Optimization
**Instant feedback, no jank.**

- Hover states should respond in < 100ms
- Use CSS transitions for simple hovers
- Framer Motion for complex state changes
- Pre-warm hover states (use `will-change` on parent hover)
- Avoid re-rendering on hover when possible

### Component Lazy Loading
**Load what's needed, when it's needed.**

```javascript
// Heavy components below the fold
const FeatureSection = dynamic(() => import('./FeatureSection'))
const Footer = dynamic(() => import('./Footer'))

// Above the fold: load immediately
import Hero from './Hero'
import Navigation from './Navigation'
```

## Monitoring

### Tools
- Lighthouse CI in deployment pipeline
- Vercel Analytics
- Real User Monitoring (RUM) if needed

### Benchmarks
- Test on throttled 4G connection
- Test on mid-range mobile devices
- Regular performance audits

## Current State
**Status**: 🟡 Foundation phase

### Implemented
- Next.js framework (performance optimized by default)
- Vercel deployment (edge network)

### To Implement
- Image optimization strategy
- Font optimization
- Performance monitoring
- Lighthouse CI integration

## Performance Budget
- **Total Page Weight**: < 1MB (initial load)
- **JavaScript Bundle**: < 200KB (gzipped)
- **CSS Bundle**: < 50KB (gzipped)
- **Images**: Optimized, lazy loaded, WebP/AVIF
- **Time to Interactive**: < 3.5s
- **Animation Frame Rate**: 60fps minimum
- **Hover Response**: < 100ms

## Advanced Optimization Techniques

### Code Splitting Strategy
- Route-based splitting (automatic with Next.js)
- Component-based splitting for heavy components
- Vendor bundle optimization
- Common chunks for shared code

### Preloading & Prefetching
- Preload critical resources (`<link rel="preload">`)
- Prefetch next likely pages on hover
- DNS prefetch for external resources
- Resource hints for faster navigation

### Modern Web APIs
- **Intersection Observer**: Lazy load components on scroll
- **Web Animations API**: Hardware-accelerated animations
- **Paint Holding API**: Smooth page transitions
- **Priority Hints**: Control resource loading priority

### Rendering Strategy
- **Static Generation** (SSG) for all pages when possible
- **ISR** (Incremental Static Regeneration) if content updates
- Client-side rendering only for dynamic user data
- No unnecessary hydration

## Performance Testing Protocol

### Test Environments
1. **Desktop**: Chrome DevTools throttled to "Fast 3G"
2. **Mobile**: Real device testing on iPhone SE / Android mid-range
3. **Slow Network**: Throttle to "Slow 4G" periodically
4. **Low-End Device**: Test on older devices (3-4 years old)

### Automated Testing
- Lighthouse CI on every PR
- Bundle size monitoring (fail if > budget)
- Core Web Vitals tracking in production
- Regression testing for performance

### Manual Testing
- Test all animations for smoothness
- Check hover states for instant response
- Verify no layout shifts during load
- Test scroll performance with dev tools profiler

## Quality Checks
Before any page goes live:
- [ ] Lighthouse score 90+ (all categories)
- [ ] Core Web Vitals pass
- [ ] Mobile performance tested
- [ ] 4G throttle tested
- [ ] No console errors
- [ ] No accessibility violations

---
*Last Updated: Dec 31, 2025*

