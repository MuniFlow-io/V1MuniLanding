# MuniFlow Color Strategy & Usage Guide

## Brand Color Palette

### Primary Colors (Main Brand Identity)

**Deep Purple - `#580067`**
- **Use for**: Primary CTAs, main headings, brand accents
- **Why it works**: Rich, professional, authoritative. Shines beautifully on black.
- **Tailwind**: `muni-purple`

**Bright Mint/Turquoise - `#66ffcc`**
- **Use for**: Accent highlights, hover states, secondary CTAs, visual breaks
- **Why it works**: High contrast, modern, energetic. Pops against dark backgrounds.
- **Tailwind**: `muni-mint`

### Auxiliary Colors (Supporting Palette)

**Bright Blue - `#0095ff`**
- **Use for**: Interactive elements, links, info highlights
- **Why it works**: Trust, clarity, tech-forward. Strong visibility.
- **Tailwind**: `muni-blue`

**Mid Purple - `#44228a`**
- **Use for**: Gradient transitions, hover states, subtle accents
- **Why it works**: Bridges deep purple and blue. Adds depth.
- **Tailwind**: `muni-purple-light`

---

## Color Usage by Component

### Buttons

**Primary CTA** ("Get in Touch", "Request Demo")
- Background: Purple-to-blue gradient (`#580067` → `#0095ff`)
- Text: White
- Hover: Scale + glow shadow in purple
- **Effect**: Premium, high-energy, unmissable

**Secondary CTA** (Less critical actions)
- Background: Transparent
- Border: 2px solid mint (`#66ffcc`)
- Text: Mint (`#66ffcc`)
- Hover: Fill with mint/10% opacity, scale
- **Effect**: Clean, modern, doesn't compete with primary

**Tertiary/Ghost** (Minimal actions)
- Background: Transparent
- Text: Gray-300
- Hover: Text → Mint, subtle underline
- **Effect**: Subtle, doesn't distract

### Typography Hierarchy

**H1 (Main Hero)**
- Color: White with mint accent words (use `<span>` for key terms)
- Size: 5xl-7xl
- **Effect**: Clean with strategic pops of color

**H2 (Section Headers)**
- Color: White
- Accent: Thin mint underline or mint divider below
- Size: 4xl-5xl
- **Effect**: Clear hierarchy, brand-consistent

**H3 (Card Titles)**
- Color: White
- Hover: Mint shift
- Size: 2xl
- **Effect**: Interactive, modern

**Body Text**
- Primary: Gray-300 (readable, calm)
- Secondary: Gray-400 (supporting text)
- Links: Mint with purple hover
- **Effect**: Professional, easy to scan

### Cards & Containers

**Feature Cards**
- Background: `gray-900` with `gray-800` border
- Hover: Border → Mint glow, subtle lift
- **Effect**: Depth, interactive

**Highlighted Cards** (Proof of Domain, Key Sections)
- Background: Very subtle purple gradient overlay on gray-900
- Border: Purple/20% opacity
- Accent: Mint divider or corner accent
- **Effect**: Special, premium

**Glass Elements** (Navigation, Floating UI)
- Background: Black/40% + backdrop-blur-xl
- Border: White/10%
- **Effect**: Modern, layered, sophisticated

### Accents & Decorative Elements

**Dividers/Separators**
- Horizontal: Gradient from transparent → mint → transparent
- Vertical: Solid mint/30%
- **Effect**: Visual breaks without heaviness

**Glow Effects**
- Behind cards on hover: Purple/20% blur
- Button shadows: Purple/50% for primary, mint/30% for secondary
- **Effect**: Depth, premium feel

**Background Gradients**
- Hero: Subtle radial gradient from purple/5% → transparent
- Sections: Alternating `black` and `gray-950/50`
- Footer: Black with subtle purple tint
- **Effect**: Visual rhythm, not flat

---

## Color Combinations That Shine on Black

### ✅ DO Use These Combinations

1. **Purple + Mint** (Primary combo)
   - Example: Purple gradient button with mint accent text nearby
   - Why: High contrast, brand-forward, modern

2. **White + Mint Accents** (Typography)
   - Example: White heading with mint-highlighted key word
   - Why: Readable + pops of energy

3. **Blue + Purple Gradients** (CTAs, backgrounds)
   - Example: Button gradient, section backgrounds
   - Why: Smooth, premium, tech-forward

4. **Gray-300 + Mint Links** (Body text)
   - Example: Paragraph text with mint-colored links
   - Why: Professional + clear interaction cues

### ❌ AVOID These Combinations

1. **Gray + Gray** (Low contrast, boring)
   - Instead: Gray + mint/purple accent

2. **All Mint** (Too intense)
   - Instead: White with mint highlights

3. **Purple text on black** (Low readability)
   - Instead: Purple in gradients/backgrounds, white text

4. **Matte/flat colors without glow** (Dull on black)
   - Instead: Add subtle shadows, glows, gradients

---

## Implementation in Tailwind

### Update `tailwind.config.ts`

```typescript
colors: {
  muni: {
    purple: "#580067",        // Main brand purple
    mint: "#66ffcc",          // Bright turquoise/mint
    blue: "#0095ff",          // Bright blue
    'purple-light': "#44228a", // Mid-tone purple
  },
}

backgroundImage: {
  'muni-gradient': 'linear-gradient(135deg, #580067 0%, #44228a 50%, #0095ff 100%)',
  'muni-gradient-horizontal': 'linear-gradient(90deg, #580067 0%, #0095ff 100%)',
  'muni-gradient-radial': 'radial-gradient(circle at center, #58006710 0%, transparent 70%)',
  'muni-accent-line': 'linear-gradient(90deg, transparent 0%, #66ffcc 50%, transparent 100%)',
}
```

### Quick Reference Classes

**Buttons:**
- Primary: `bg-muni-gradient text-white hover:shadow-purple-lg`
- Secondary: `border-2 border-muni-mint text-muni-mint hover:bg-muni-mint/10`

**Text:**
- Accent words: `text-muni-mint`
- Links: `text-muni-mint hover:text-muni-purple`

**Borders:**
- Subtle: `border-gray-800 hover:border-muni-mint`
- Accent: `border-muni-mint/30`

**Backgrounds:**
- Cards: `bg-gray-900 border border-gray-800`
- Highlighted: `bg-gradient-to-br from-gray-900 to-muni-purple/5`

---

## Visual Hierarchy Strategy

### Page Flow (Top to Bottom)

1. **Hero**: Maximum impact - white text, mint accents, purple gradient CTA
2. **Section 1**: Gray cards, mint borders on hover
3. **Section 2**: Purple-tinted card with mint divider
4. **Section 3**: Back to gray with blue accents
5. **CTA Section**: Purple gradient background, mint secondary button
6. **Footer**: Minimal, gray with mint logo accent

**Principle**: Alternate energy levels. Don't let every section compete.

---

## Accessibility & Performance

### Contrast Ratios (WCAG AA Minimum)
- White on Black: ✅ 21:1 (Excellent)
- Mint on Black: ✅ 12.3:1 (Excellent)
- Gray-300 on Black: ✅ 9.8:1 (Excellent)
- Purple on Black: ⚠️ 3.2:1 (Use for backgrounds/accents only, not text)

### Performance Considerations
- Gradients: Use `bg-gradient-to-*` classes (CSS-based, GPU-accelerated)
- Glows: Use `box-shadow` sparingly (GPU-friendly), not `filter: blur()`
- Animations: Only on `transform` and `opacity`
- Reduced motion: All color transitions respect `prefers-reduced-motion`

---

## Testing Checklist

- [ ] All CTAs use purple gradient or mint border
- [ ] No black-on-black or gray-on-gray buttons
- [ ] At least one mint accent per section
- [ ] Hero has clear visual hierarchy with color
- [ ] Cards have hover states with color shifts
- [ ] Links are clearly mint-colored
- [ ] Background gradients are subtle (not overpowering)
- [ ] Footer has minimal color (calm ending)

---

**Philosophy**: Colors should guide the eye, create rhythm, and reinforce brand—but never overwhelm. On a dark background, we shine through strategic pops of mint and purple, not by flooding the page with color.

