# Muniflow Landing Page - Component Library

Modern floating components with glassmorphism effects, built following clean code principles and minimal code philosophy.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the component library in action.

## 📦 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations (GPU-accelerated)
- **React 18** - Latest React features

## 🎨 Component Library

### Card Component
Modern floating cards with hover lift effects.

**Variants:**
- `solid` - Clean white/dark card (default)
- `glass` - Glassmorphism with backdrop blur

**Sizes:**
- `medium` - Standard card (default)
- `large` - Hero/featured content

**Usage:**
```tsx
import { Card } from "@/components/ui/Card";

<Card size="medium" variant="glass">
  <h3>Title</h3>
  <p>Content goes here</p>
</Card>
```

### Button Component
Interactive buttons with smooth scale animations.

**Variants:**
- `primary` - Blue gradient (default)
- `secondary` - Gray with border
- `glass` - Glassmorphism effect

**Sizes:**
- `small`, `medium`, `large`

**States:**
- Hover (scale 1.05)
- Active (scale 0.95)
- Disabled (50% opacity)
- Focus (ring indicator)

**Usage:**
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="medium">
  Get Started
</Button>
```

### Switch Component
Glass-style toggle switches with spring animations.

**Variants:**
- `solid` - Standard switch (default)
- `glass` - Glassmorphism with backdrop blur

**Features:**
- Smooth spring animation
- Controlled/uncontrolled modes
- Disabled state
- ARIA compliant

**Usage:**
```tsx
import { Switch } from "@/components/ui/Switch";

<Switch 
  variant="glass" 
  defaultChecked 
  onChange={(checked) => console.log(checked)}
/>
```

## 🎯 Animation Philosophy

All animations follow our strict performance guidelines:

- ✅ **GPU-Accelerated Only**: Uses `transform` and `opacity`
- ✅ **60fps Minimum**: Smooth on mid-range devices
- ✅ **<100ms Hover Response**: Instant feedback
- ✅ **<300ms Duration**: Quick, not sluggish
- ✅ **Respects `prefers-reduced-motion`**: Accessibility first

### Animation Utilities

Located in `components/animations/`:

**`useHoverLift`** - Spring-based hover lift effect
```tsx
const { y, onMouseEnter, onMouseLeave } = useHoverLift();
```

**`transitions`** - Pre-configured transitions
```tsx
import { transitions } from "@/components/animations/transitions";
// transitions.fast, transitions.medium, transitions.slow
```

**`springs`** - Spring configurations
```tsx
import { springs } from "@/components/animations/transitions";
// springs.gentle, springs.snappy, springs.bouncy
```

## 📁 Project Structure

```
components/
├── ui/                     # Core UI components
│   ├── Card/
│   │   ├── Card.tsx       # Card component
│   │   └── index.ts       # Export
│   ├── Button/
│   │   ├── Button.tsx     # Button component
│   │   └── index.ts       # Export
│   └── Switch/
│       ├── Switch.tsx     # Switch component
│       └── index.ts       # Export
├── animations/            # Reusable animation utilities
│   ├── useHoverLift.ts   # Hover lift hook
│   └── transitions.ts    # Animation configs
lib/
└── utils.ts              # Utility functions (cn)
app/
├── globals.css           # Global styles + glassmorphism
├── layout.tsx            # Root layout
└── page.tsx              # Demo page
docs/                     # Full documentation system
```

## 💅 Styling Approach

- **Tailwind Utility Classes**: Primary styling method
- **Custom CSS**: Only when absolutely necessary
- **Glassmorphism**: Strategic use of `backdrop-filter`
- **Dark Mode**: Full support with `dark:` variants

### Utility Function

The `cn()` utility merges Tailwind classes intelligently:

```tsx
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  variant === "glass" && "glass-classes",
  className // User overrides
)}
```

## 🎨 Design Tokens

### Colors
- **Primary**: Blue to Indigo gradient
- **Background**: Light/Dark mode support
- **Glass**: White/Black with 80% opacity + blur

### Shadows
- `shadow-lg` - Default floating card
- `shadow-xl` - Hover state
- `shadow-2xl` - Glass variant hover

### Border Radius
- Cards: `rounded-2xl` (1rem)
- Buttons: `rounded-lg` (0.5rem)
- Switches: `rounded-full`

## ⚡ Performance

### Budgets
- Total Page: < 1MB initial load
- JavaScript: < 200KB gzipped
- CSS: < 50KB gzipped

### Core Web Vitals Targets
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Optimization Techniques
- Static generation (SSG)
- Code splitting by route
- GPU-accelerated animations only
- Strategic lazy loading
- Minimal backdrop-filter usage

## 🧪 Code Quality

### ESLint Rules
```json
{
  "no-console": "warn",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/no-explicit-any": "warn"
}
```

Run linting:
```bash
npm run lint
```

## 🏗 Building Components

Follow our component-first development approach:

1. **Build in isolation** - Component works standalone
2. **All states** - Default, hover, active, disabled, loading
3. **Fully typed** - TypeScript interfaces
4. **Accessible** - ARIA labels, keyboard nav
5. **Performant** - 60fps animations
6. **Minimal code** - Less code = fewer bugs

## 📚 Documentation

See `/docs` for comprehensive documentation:
- Company context
- Development standards
- Component development guide
- Page passports (state tracking)
- Performance optimization guide

## 🔜 Next Steps

1. Add more components (Navigation, Hero, Footer)
2. Set up Storybook for component isolation
3. Implement Lighthouse CI
4. Build out landing pages using components
5. Performance testing on real devices

---

**Built with ❤️ following clean code principles and minimal code philosophy.**

*Less code. Fewer errors. Beautiful results.*

