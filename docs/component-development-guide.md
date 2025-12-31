# Component Development Guide

## Philosophy
**Build components first. Assemble pages second.**

Don't rush into building the full website. Focus on creating beautiful, performant, reusable components in isolation. Each component should be a work of art on its own.

## Component-First Workflow

### 1. Identify Components
Before writing any page code, identify all components needed:
- Navigation (floating/sticky with backdrop blur)
- Button (primary, secondary, with all states)
- Card (floating design with hover effects)
- Hero (large typography, animated backgrounds)
- Animation utilities (reusable transitions)

### 2. Build in Isolation
Build each component independently:
- No page context required
- All props clearly defined
- All states handled (default, hover, active, disabled, loading)
- Fully responsive
- Accessibility built-in

### 3. Test Each Component
Before integrating:
- Test all interactive states
- Verify animations are smooth (60fps)
- Check accessibility
- Test on mobile and desktop
- Measure performance impact

### 4. Assemble into Pages
Only after components are solid:
- Import and compose components
- Minimal page-specific code
- Focus on layout and composition

## Storybook Setup (Optional but Recommended)

### Why Storybook?
- **Component Isolation**: Build without page context
- **Visual Testing**: See all component states at a glance
- **Documentation**: Components self-document
- **Consistency**: Ensure design system coherence
- **Speed**: Faster iteration without full page reloads

### Quick Setup
```bash
npx storybook@latest init
```

### Basic Story Example
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Reach Out',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Learn More',
  },
}

export const WithHover: Story = {
  args: {
    variant: 'primary',
    children: 'Hover Me',
  },
  parameters: {
    pseudo: { hover: true },
  },
}
```

### When to Skip Storybook
- Very simple project (< 5 components)
- Extremely tight timeline
- Solo developer who prefers other workflows

For this project: **Recommended** - We have 5+ distinct components and want to show off component quality.

## Component Design Checklist

### Visual Design
- [ ] Follows modern, futuristic aesthetic
- [ ] Uses floating/layered design where appropriate
- [ ] Implements glassmorphism effects strategically
- [ ] Has generous spacing and clean typography
- [ ] Looks stunning on its own

### Animations
- [ ] Uses only `transform` and `opacity`
- [ ] Runs at 60fps on mid-range devices
- [ ] Hover states respond in < 100ms
- [ ] Animation duration < 300ms
- [ ] Respects `prefers-reduced-motion`
- [ ] Spring-based or ease-out curves

### Performance
- [ ] No unnecessary re-renders
- [ ] Lazy loads if below the fold
- [ ] Images optimized (next/image)
- [ ] Bundle impact measured
- [ ] No console warnings

### Code Quality
- [ ] TypeScript with proper types
- [ ] Props interface clearly defined
- [ ] Minimal code (no redundancy)
- [ ] Clean, readable, self-documenting
- [ ] ESLint passing
- [ ] Reusable across pages

### Accessibility
- [ ] Keyboard navigable
- [ ] Proper ARIA labels
- [ ] Color contrast WCAG AA
- [ ] Screen reader tested
- [ ] Focus states visible

## Example: Building a Button Component

### 1. Define Interface
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}
```

### 2. Build Component
```typescript
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200',
        'transform hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        size === 'small' && 'px-4 py-2 text-sm',
        size === 'medium' && 'px-6 py-3 text-base',
        size === 'large' && 'px-8 py-4 text-lg',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
      )}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
```

### 3. Test All States
- Default
- Hover
- Active (clicking)
- Disabled
- Loading
- Focus (keyboard)

### 4. Measure Performance
- Check animation frame rate
- Verify no layout shift
- Test on mobile device

## Component Library Structure

```
components/
├── ui/                  # Core reusable components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx  (if using Storybook)
│   │   └── index.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.stories.tsx
│   │   └── index.ts
│   └── Navigation/
│       ├── Navigation.tsx
│       ├── Navigation.stories.tsx
│       └── index.ts
├── animations/          # Reusable animation utilities
│   ├── useHoverLift.ts
│   ├── springConfig.ts
│   └── transitions.ts
└── layout/             # Layout components
    ├── Hero/
    ├── Section/
    └── Container/
```

## Animation Utilities

### Reusable Hook: Hover Lift
```typescript
import { useSpring } from 'framer-motion'

export const useHoverLift = () => {
  const [isHovered, setIsHovered] = useState(false)
  
  const y = useSpring(0, {
    stiffness: 300,
    damping: 20,
  })
  
  useEffect(() => {
    y.set(isHovered ? -4 : 0)
  }, [isHovered, y])
  
  return {
    y,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }
}
```

### Usage
```typescript
const Card = () => {
  const { y, onMouseEnter, onMouseLeave } = useHoverLift()
  
  return (
    <motion.div
      style={{ y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="card"
    >
      {/* content */}
    </motion.div>
  )
}
```

## Best Practices Summary

1. **Build small**: Each component does one thing well
2. **Build isolated**: Components work without page context
3. **Build beautiful**: Each component looks stunning alone
4. **Build fast**: Performance is part of the design
5. **Build accessible**: Keyboard, screen readers, motion preferences
6. **Build minimal**: Least code necessary, maximum impact

## Next Steps

1. **Choose workflow**: Decide on Storybook or not
2. **Set up environment**: Initialize project structure
3. **Build core components**: Start with Button, Card, Navigation
4. **Build animation utilities**: Reusable hooks and transitions
5. **Test each component**: Ensure quality before integration
6. **Assemble pages**: Compose components into layouts

---
*Last Updated: Dec 31, 2025*

