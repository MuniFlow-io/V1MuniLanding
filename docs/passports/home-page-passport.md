# Passport: Home Page

## Page Overview
The **Home Page** is the entry point to the Muniflow landing experience. It sets the tone for the entire site and immediately communicates our credibility and value proposition.

## Purpose
- First impression for visitors
- Quick understanding of what Muniflow does
- Clear navigation to other key pages
- Establishes trust and professionalism

## Visual State
**Status**: ✅ COMPLETE - Best state achieved (Dec 31, 2025)

### Design Goals
- **Modern & Futuristic**: Show off a little - we've built a great app, this landing page needs to flex
- **Clean Minimal Art**: Less is more, every element should be intentional
- **Component Beauty**: Each component should look stunning on its own
- **Subtle Motion**: Animations enhance, don't distract
- **Fast & Smooth**: Performance never compromised for aesthetics

### Visual Approach
**Floating Components & Layered Design**
- Modern layered UI with depth and dimension
- Floating widgets with subtle shadows and glassmorphism
- Strategic use of backdrop blur and transparency
- z-index hierarchy creating visual depth

**Animation Philosophy**
- **Quality over Quantity**: One perfect animation > ten mediocre ones
- **Hover States**: Responsive, immediate feedback (<100ms)
- **Smooth Transitions**: Spring-based animations for natural feel
- **GPU Accelerated**: All animations use `transform` and `opacity` only
- **60fps Minimum**: No janky animations, ever

### Key Elements (Planned)

1. **Hero Section**
   - Floating card design with subtle hover effects
   - Clear, bold value proposition
   - Animated background elements (subtle, minimal motion)
   - Visual metaphor for workflow/flow/efficiency
   - Modern typography with generous spacing

2. **Floating Navigation**
   - Clean, minimal nav bar (possibly floating/sticky)
   - Links to: Credibility, What We're Building, Reach Out
   - Smooth hover states
   - Mobile-responsive with elegant mobile menu
   - Backdrop blur effect for modern feel

3. **Feature Cards** (Optional)
   - Floating component design
   - Hover effects with subtle lift/shadow
   - Clean icons or micro-animations
   - Grid layout with proper spacing

4. **Call to Action**
   - Primary: Reach out / Contact (prominent button with hover animation)
   - Secondary: Learn more (subtle link)
   - Modern button design with state transitions

## Performance Requirements
- **Load Time**: < 2 seconds on 4G
- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Pass all thresholds
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

## Security Considerations
- No sensitive data on this page
- Standard HTTPS
- Vercel security defaults

## Current State - ✅ SHIPPED
- **Hero Section**: Clean, punchy headline with cyan "structured" accent
- **Navigation**: Floating nav with cyan "Flow" logo, mint hover states
- **Buttons**: Purple-to-blue gradient primary, cyan border secondary with glows
- **Feature Cards**: Card component with mint borders and purple glows on hover
- **Typography**: Clean hierarchy with strategic cyan accents
- **Colors**: All components using standard Tailwind (purple-700, cyan-400, blue-500)
- **Performance**: 60fps animations, GPU-accelerated, <100ms hover response

### What Works Beautifully
- Buttons are visible with clean glows on black background ✅
- Brand colors (purple + cyan) shine throughout ✅
- Components are reusable and properly abstracted ✅
- Minimal, modern, professional aesthetic ✅
- Responsive and accessible ✅

## Component Strategy
**Build components first, assemble page second.**

### Components to Build (In Order)
1. **Navigation Component**
   - Floating/sticky nav with backdrop blur
   - Mobile menu component
   - Nav link hover states

2. **Button Component**
   - Primary button (CTA style)
   - Secondary button (subtle)
   - Hover/active/disabled states
   - Loading state

3. **Card Component**
   - Floating card with shadows
   - Hover lift effect
   - Flexible content areas

4. **Hero Component**
   - Large format heading
   - Subheading
   - Background animation elements

5. **Animation Utilities**
   - Reusable animation hooks/classes
   - Hover effect utilities
   - Transition configurations

### Consider Storybook
For component-first development, we may implement Storybook to:
- Develop components in isolation
- Test different component states visually
- Build a component library before touching page layouts
- Ensure consistency across components

## Technical Implementation Notes

### Animation Performance
- Use Framer Motion for complex animations
- Fallback to CSS transitions for simple hover states
- All animations must pass 60fps threshold
- Test on mid-range devices

### Styling Approach
- Tailwind utility classes for base styles
- Custom CSS only when absolutely necessary
- Backdrop blur: `backdrop-filter: blur()`
- Glassmorphism: subtle transparency + blur

### Accessibility
- All animations respect `prefers-reduced-motion`
- Keyboard navigation for all interactive elements
- Proper ARIA labels
- Color contrast meets WCAG AA standards

## Next Steps
1. **Set up component environment** (Storybook optional)
2. **Build core components** in isolation
3. **Design/wireframe** overall page layout
4. **Assemble components** into page structure
5. **Performance optimization** and testing
6. **Production deployment** and monitoring

---
*Last Updated: Dec 31, 2025*

