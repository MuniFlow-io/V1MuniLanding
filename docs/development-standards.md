# Development Standards

**NOTE:** This document is now consolidated into more specific guides. For comprehensive standards, see:
- **`ELITE-STANDARDS.md`** - Code quality standards
- **`FRONTEND-ARCHITECTURE.md`** - Frontend development
- **`BACKEND-ARCHITECTURE.md`** - Backend development

---

## Core Philosophy
**Move fast. Build clean. No compromises.**

We prioritize speed of iteration while maintaining the highest code quality standards. Every component should be production-ready and maintainable.

### Minimal Code Philosophy
**Less code = Fewer errors.**

- **Write less, achieve more**: Every line of code is a potential point of failure. We aim for the minimal amount of code needed to accomplish the goal.
- **Simplicity over complexity**: If you can solve it with 20 lines instead of 100, do it. Complexity breeds bugs.
- **Delete more than you add**: The best code is no code. Refactor ruthlessly to eliminate redundancy.
- **Clear > Clever**: Readable, straightforward code beats clever, compact code every time.
- **Component-first thinking**: Build reusable components before building pages. Components are the building blocks.

## Tech Stack
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Testing Environment**: Production testing preferred for rapid iteration

## Architecture Principles

### Clean Architecture
- Follow clean architecture patterns
- Separation of concerns at all levels
- Each component has a single, clear responsibility

### Component Design
- **Simple & Clean**: Every component should be easy to understand
- **Separated**: Clear boundaries between components
- **Reusable**: Build for reuse from day one
- **Object-Oriented**: Follow OOP principles even in frontend code

### Modern Visual Approach
**We're here to show off a little - make it look futuristic.**

- **Floating Components**: Use modern layered design with floating widgets and cards
- **Subtle Animations**: Animations should enhance, not distract
  - Hover effects that feel responsive
  - Smooth transitions using CSS transforms (GPU accelerated)
  - Spring-based animations for natural feel
- **Minimal Motion**: Quality over quantity - one great animation beats ten mediocre ones
- **Component Beauty**: Each component should look stunning on its own
- **Modern Aesthetics**: Clean, spacious, contemporary design language

### Component-First Development
**Build components before building pages.**

- Start with isolated components (consider Storybook for component development)
- Test components independently before integrating
- Create a component library that can be reused across pages
- Focus on making each component perfect before moving to layouts

### Code Organization
- **Routing**: Flexible between Pages router and App router (evaluate per project needs)
- **Components**: Keep separated in logical directories
- **Utilities**: Extract shared logic into utility functions
- **Styles**: Use Tailwind utility classes, avoid custom CSS when possible

## Code Quality Standards

### ESLint
- **Strict rules** enforced
- No exceptions without documented justification
- Fix all linting errors before commit

### Best Practices
1. **Clean Code**: Readable, self-documenting code
2. **Consistency**: Follow established patterns throughout the codebase
3. **Performance**: Optimize for speed without sacrificing maintainability
4. **Accessibility**: Build inclusive, accessible interfaces
5. **Responsiveness**: Mobile-first, works perfectly on all devices

## Performance-First Animation Strategy

### GPU-Accelerated Animations
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, `top`, `left` (CPU intensive)
- Use `will-change` sparingly and only when needed
- Leverage Framer Motion or CSS transitions for smooth animations

### Floating Components & Layers
- Use CSS `backdrop-filter` for glassmorphism effects
- Implement `z-index` strategically for depth
- Use shadows and blur to create layered depth
- Keep animations at 60fps minimum

### Animation Performance Checklist
- [ ] No layout thrashing
- [ ] Animations use `transform` or `opacity` only
- [ ] No janky scrolling
- [ ] Hover states are instant (<100ms response)
- [ ] Animations complete in <300ms
- [ ] Test on mid-range devices, not just high-end

## Development Workflow
1. **Components First**: Build isolated components before pages
2. **Build features quickly**: Speed matters
3. **Test on production**: Live environment for rapid feedback
4. **Iterate based on real-world feedback**: Data-driven improvements
5. **Maintain code quality throughout**: Never compromise

## Tools & Setup

### Component Development
- **Storybook** (Optional but recommended): Develop components in isolation
- **Chromatic** (If using Storybook): Visual regression testing
- **ESLint + Prettier**: Enforce code standards automatically

### Performance Monitoring
- **Vercel Analytics**: Built-in performance tracking
- **Lighthouse CI**: Automated performance checks on deploy
- **Web Vitals**: Track Core Web Vitals in production

## Quality Bar
The app looks great. This landing page must match that standard. Every page, every component, every interaction should feel polished and professional.

