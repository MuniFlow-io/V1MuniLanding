# Passport: Navigation Component

## Component Overview
Clean, professional navigation for the 5 main pages. Can be **top bar** or **sidebar** - will determine based on design testing.

## Purpose
- Clear wayfinding between all pages
- Professional, minimal aesthetic
- Smooth, subtle hover effects
- Works on mobile and desktop

## Pages to Navigate (5 Total)

1. **Home** - Main landing, conversation starter
2. **Credibility** - Domain understanding, Amira's experience
3. **What We're Building** - Focus areas, approach
4. **Reach Out** - Contact, demo request
5. **[TBD]** - Fifth page to be determined

## Design Requirements

### Visual
- **Clean spacing** - Generous gaps between nav items
- **Professional typography** - Clear, readable
- **Minimal** - No decorative elements
- **Calm colors** - Blues, grays, white - not playful

### Interaction
- **Subtle hover states** - Not flashy, professional
- **Clear active state** - Shows current page
- **Smooth transitions** - <200ms, GPU accelerated
- **No lag** - Instant response, < 100ms

### Layout Options

#### Option A: Top Bar
```
[Logo]                    Home  Credibility  Building  Reach Out
```
- Fixed or sticky on scroll
- Horizontal layout
- Works well on desktop
- Hamburger menu on mobile

#### Option B: Sidebar (Left)
```
┌─────────────┐
│ Logo        │
│             │
│ Home        │
│ Credibility │
│ Building    │
│ Reach Out   │
│             │
└─────────────┘
```
- Always visible on desktop
- Slides in on mobile
- More spacious feel
- Modern, app-like

### Recommendation: Start with Top Bar
- Simpler to implement
- More familiar pattern for landing pages
- Easy to make sticky
- Clean mobile hamburger menu

## Technical Specs

### Component Structure
```typescript
Navigation
├── NavLink (reusable link component)
├── MobileMenu (hamburger + drawer)
└── Logo
```

### Props
```typescript
interface NavigationProps {
  variant?: "transparent" | "solid" | "glass"
  sticky?: boolean
  className?: string
}
```

### Hover Effect Requirements
- **No lag** - Must be instant
- **Subtle** - Underline or color change, not scale/transform
- **Smooth** - 150-200ms transition
- **Professional** - Not playful or bouncy

### Animation Approach
```css
/* Good: Simple, fast */
transition: color 150ms ease-out;

/* Bad: Too complex, can lag */
transition: all 300ms cubic-bezier(...);
```

## States

### Link States
1. **Default** - Gray or muted color
2. **Hover** - Blue or darker, maybe underline
3. **Active** (current page) - Bold or different color
4. **Focus** - Outline for keyboard navigation

### Examples
```typescript
// Default
text-gray-600 dark:text-gray-400

// Hover
hover:text-blue-600 hover:underline

// Active
text-blue-600 font-semibold

// Focus
focus:outline-none focus:ring-2 focus:ring-blue-500
```

## Mobile Behavior

### Breakpoint: < 768px
- Show hamburger icon (top right)
- Hide navigation links
- Click opens drawer/menu
- Menu slides in from right or top
- Overlay behind menu
- Close on link click or outside click

### Hamburger Icon
- Simple 3-line icon (lucide-react has Menu icon)
- Animates to X when open (optional, can skip for v1)
- Fixed position top-right

## Component Usage

```typescript
import { Navigation } from "@/components/layout/Navigation";

// Simple
<Navigation />

// With options
<Navigation variant="glass" sticky />
```

## Accessibility Requirements

- [ ] Keyboard navigable (Tab, Enter)
- [ ] ARIA labels on mobile toggle
- [ ] Focus visible on all links
- [ ] Screen reader friendly
- [ ] Semantic HTML (nav, ul, li, a)

## Performance

- **No JavaScript** for desktop hover (pure CSS)
- **Minimal JS** for mobile menu toggle only
- **GPU-accelerated** - Use transform for menu slide
- **No re-renders** - Static links, no state changes

## Design Inspiration

### Calm, Professional Examples
- Linear (linear.app) - Clean top nav
- Stripe (stripe.com) - Minimal, professional
- Notion (notion.so) - Simple, effective

### NOT Like
- Flashy marketing sites with mega menus
- Animated, playful nav bars
- Cluttered with too many links

## Known Issues to Avoid

1. **Hover lag** - Use CSS only, not JS hover states
2. **Mobile menu jump** - Use transform, not display toggle
3. **Z-index conflicts** - Nav should be z-50 or higher
4. **Flash on load** - Ensure no FOUC with SSR

## Code Estimate

- **Navigation.tsx** - ~80 lines (top bar + mobile)
- **NavLink.tsx** - ~30 lines (reusable link)
- Total: ~110 lines (minimal, clean)

## Current State
**Status**: 🟡 Planning complete, ready to build

### Next Steps (When Executing)
1. Create `components/layout/Navigation/` directory
2. Build `Navigation.tsx` (top bar variant)
3. Build `NavLink.tsx` (reusable link component)
4. Test hover effects (must be instant, no lag)
5. Implement mobile menu
6. Test on real devices

### Testing Checklist
- [ ] Hover is instant (<100ms)
- [ ] Active state shows clearly
- [ ] Mobile menu works smoothly
- [ ] Keyboard navigation works
- [ ] No layout shift when hovering
- [ ] Works in dark mode
- [ ] Looks good on all screen sizes

---

*Last Updated: Dec 31, 2025*
*Status: Strategic planning complete, ready for execution when needed*

