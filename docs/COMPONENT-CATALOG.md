# MuniFlow Component Catalog

## Overview
This catalog documents all reusable UI components with their variants, usage, and brand color integration.

All components use:
- **CVA** (class-variance-authority) for type-safe variants
- **Framer Motion** for GPU-accelerated animations
- **Brand colors** with clean glows and modern aesthetics
- **Accessibility** built-in (ARIA, keyboard nav, focus states)

---

## Button Component

**Location**: `components/ui/Button/Button.tsx`

### Variants

#### Primary (Default)
**Use for**: Main CTAs, primary actions
```tsx
<Button variant="primary" size="large">Get in Touch</Button>
```
**Styling**:
- Background: Purple-to-blue gradient (`#580067` → `#0095ff`)
- Text: White
- Glow: Purple shadow that intensifies on hover
- Hover: Scale 105%, stronger purple glow
- **Effect**: Premium, high-energy, unmissable

#### Secondary
**Use for**: Secondary CTAs, alternative actions
```tsx
<Button variant="secondary" size="large">Request a Demo</Button>
```
**Styling**:
- Background: Transparent
- Border: 2px solid mint (`#66ffcc`)
- Text: Mint
- Glow: Mint shadow that intensifies on hover
- Hover: Scale 105%, fill with mint/10%, stronger glow
- **Effect**: Modern, clean, doesn't compete with primary

#### Glass
**Use for**: Floating UI, overlay actions
```tsx
<Button variant="glass" size="medium">Learn More</Button>
```
**Styling**:
- Background: White/10% + backdrop-blur
- Border: White/20%
- Text: White
- Glow: Soft white shadow
- **Effect**: Sophisticated, layered, modern

### Sizes
- `small`: `px-4 py-2 text-sm`
- `medium`: `px-6 py-3 text-base` (default)
- `large`: `px-8 py-4 text-lg`

### States
- **Hover**: Scale 105%, enhanced glow
- **Active**: Scale 95%
- **Disabled**: 50% opacity, no hover effects
- **Focus**: 2px ring in variant color

### Performance
- GPU-accelerated transforms only
- All transitions: 200ms
- No layout shift on hover

---

## Card Component

**Location**: `components/ui/Card/Card.tsx`

### Variants

#### Solid (Default)
**Use for**: Light backgrounds, general content
```tsx
<Card variant="solid" size="medium">
  <h3>Title</h3>
  <p>Content</p>
</Card>
```
**Styling**:
- Background: Gray-900 (dark mode)
- Border: Gray-800 → Mint on hover
- Glow: Purple shadow on hover
- Animation: Lift on hover (useHoverLift hook)
- **Effect**: Clean, interactive, brand-accented

#### Feature
**Use for**: Feature cards, focus areas
```tsx
<Card variant="feature" size="large">
  <h3>Feature Title</h3>
  <p>Description</p>
</Card>
```
**Styling**:
- Background: Gray-900
- Border: Gray-800 → Mint on hover
- Glow: Purple/20% shadow on hover
- Animation: Lift on hover
- **Effect**: Modern, brand-consistent, clear hierarchy

#### Highlight
**Use for**: Special sections (e.g., Proof of Domain)
```tsx
<Card variant="highlight" size="large">
  <h2>Important Content</h2>
  <p>Details</p>
</Card>
```
**Styling**:
- Background: Gray-900 with subtle purple gradient overlay
- Border: 2px purple/30%
- Glow: Purple shadow (static + enhanced on hover)
- Animation: Lift on hover
- **Effect**: Premium, special, draws attention

#### Glass
**Use for**: Overlays, floating UI on colorful backgrounds
```tsx
<Card variant="glass" size="medium">
  <p>Floating content</p>
</Card>
```
**Styling**:
- Background: Black/30% + backdrop-blur-2xl
- Border: White/20%
- Glow: Strong shadow
- **Effect**: Sophisticated, modern, depth

### Sizes
- `medium`: `p-6` (default)
- `large`: `p-8 md:p-10`

### Animation
All cards use `useHoverLift()` hook:
- Spring physics for natural feel
- Lifts ~8px on hover
- Smooth return to rest
- GPU-accelerated (transform only)

---

## Navigation Component

**Location**: `components/layout/Navigation/Navigation.tsx`

### Structure
Fixed top bar with:
- **Logo**: "Muni" (white) + "Flow" (mint)
- **Desktop nav**: Horizontal links with mint underlines on hover
- **Mobile nav**: Hamburger menu with slide-down drawer

### Brand Integration

#### Logo
- Text: White
- Accent: "Flow" in mint (`#66ffcc`)
- Hover: Entire logo → mint

#### Nav Links
- Default: Gray-400
- Hover: Mint text + mint underline with subtle glow
- Active: (To be implemented with usePathname)
- Transition: 150ms (instant feel)

#### Mobile Menu
- Toggle icon: Gray-400 → mint on hover
- Drawer: Black background, gray-800 top border
- Links: Same hover states as desktop

### States
- **Default**: Transparent gray text
- **Hover**: Mint text + underline
- **Focus**: Keyboard-accessible with visible focus ring
- **Active page**: (Recommended: Bold + different color)

### Performance
- Pure CSS for desktop hover (no lag)
- Minimal JS for mobile toggle only
- Fixed positioning with backdrop-blur
- GPU-accelerated underline animation

---

## Color Usage Guide

### Brand Colors (from `tailwind.config.ts`)

```typescript
muni: {
  purple: "#580067",        // Deep purple - main brand
  mint: "#66ffcc",          // Bright mint/turquoise - accents
  blue: "#0095ff",          // Bright blue - auxiliary
  'purple-light': "#44228a", // Mid purple - gradients
}
```

### How Components Use Colors

**Buttons**:
- Primary: Purple-to-blue gradient background
- Secondary: Mint border + text
- Glass: White with blur

**Cards**:
- Borders: Gray-800 → mint on hover
- Glows: Purple shadows
- Highlights: Purple gradient overlays

**Navigation**:
- Links: Gray-400 → mint on hover
- Underlines: Mint with glow
- Logo: Mint accent

**Typography**:
- Headings: White
- Body: Gray-300
- Accents: Mint (use `<span className="text-muni-mint">`)
- Links: Mint

---

## Glow Effects Strategy

### What Creates "Shine" on Black Backgrounds

1. **Box Shadows** (not filter: blur)
   - Faster, GPU-friendly
   - Example: `shadow-lg shadow-muni-purple/30`

2. **Color + Opacity + Blur**
   - Use semi-transparent colors: `/20`, `/30`, `/50`
   - Combine with shadow blur radius

3. **Layered Shadows**
   - Base: `shadow-lg` (subtle presence)
   - Hover: `shadow-xl` or `shadow-2xl` (enhanced)
   - Color: Brand color with opacity

### Examples

**Purple glow** (primary buttons, card hover):
```tsx
className="shadow-lg shadow-muni-purple/30 hover:shadow-xl hover:shadow-muni-purple/60"
```

**Mint glow** (secondary buttons, accents):
```tsx
className="shadow-lg shadow-muni-mint/20 hover:shadow-xl hover:shadow-muni-mint/40"
```

**Subtle glow** (static elements):
```tsx
className="shadow-sm shadow-muni-mint/50"
```

### Performance Note
- Only use shadows on hover states when possible
- Keep blur radius reasonable (xl, 2xl max)
- Avoid filter: blur() and drop-shadow (slow)

---

## Usage Patterns

### Feature Grid (3-column)
```tsx
<div className="grid md:grid-cols-3 gap-8">
  <Card variant="feature" size="large">
    <h3>Title</h3>
    <p>Description</p>
  </Card>
  {/* Repeat */}
</div>
```

### CTA Section
```tsx
<div className="flex gap-4">
  <Link href="/contact">
    <Button variant="primary" size="large">
      Get in Touch
    </Button>
  </Link>
  <Link href="/demo">
    <Button variant="secondary" size="large">
      Request Demo
    </Button>
  </Link>
</div>
```

### Highlighted Content Block
```tsx
<Card variant="highlight" size="large" className="relative overflow-hidden">
  {/* Optional corner accent */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-muni-mint/5 blur-3xl pointer-events-none" />
  
  <div className="relative">
    <div className="h-1 w-16 bg-muni-mint mb-6 rounded-full" />
    <h2>Heading</h2>
    <p>Content</p>
  </div>
</Card>
```

---

## Accessibility Checklist

All components must have:

- [ ] **Keyboard navigation**: Tab, Enter, Space work
- [ ] **Focus states**: Visible focus ring (2px, variant color)
- [ ] **ARIA labels**: On buttons, links, interactive elements
- [ ] **Semantic HTML**: Use correct tags (button, nav, section, etc.)
- [ ] **Color contrast**: WCAG AA minimum (4.5:1 for text)
- [ ] **Reduced motion**: Respect `prefers-reduced-motion` (handled in globals.css)
- [ ] **Screen reader support**: Descriptive text, no icon-only buttons

---

## Testing Checklist

Before shipping a component:

- [ ] Visual: Looks stunning in isolation
- [ ] Hover: Responds <100ms, smooth animation
- [ ] Performance: 60fps, no jank
- [ ] Responsive: Works on mobile, tablet, desktop
- [ ] Dark mode: Looks good on black background
- [ ] Accessibility: All items above pass
- [ ] TypeScript: No type errors, proper prop types
- [ ] Linter: No ESLint errors

---

## Component File Structure

```
components/
├── ui/
│   ├── Button/
│   │   ├── Button.tsx      # Component with CVA variants
│   │   └── index.ts        # Export
│   ├── Card/
│   │   ├── Card.tsx        # Component with CVA variants
│   │   └── index.ts        # Export
│   └── Switch/
│       ├── Switch.tsx      # Radix UI based
│       └── index.ts        # Export
├── layout/
│   └── Navigation/
│       ├── Navigation.tsx  # Nav component
│       └── index.ts        # Export
└── animations/
    ├── useHoverLift.ts     # Spring-based hover hook
    └── transitions.ts      # Animation constants
```

---

## Adding New Components

When creating a new component:

1. **Plan variants** before coding
2. **Use CVA** for variant management
3. **Add brand colors** with glows
4. **Include hover states** with <100ms response
5. **Test accessibility** from the start
6. **GPU-accelerate** all animations
7. **Document** in this catalog

---

**Philosophy**: Every component should be beautiful enough to showcase on its own, performant enough to use hundreds of times, and accessible to everyone.
