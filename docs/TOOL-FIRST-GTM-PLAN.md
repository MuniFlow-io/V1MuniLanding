# Tool-First Go-to-Market Strategy - Execution Plan

## Strategic Context

**Primary Goal**: Build trust & adoption in municipal bond industry → enterprise sale or VC raise  
**Secondary Goal**: Revenue is nice, but not current focus  
**Timeline**: 2-3 more tools shipping in next 1-2 months  
**Approach**: Patient, credibility-first, quality over hype

---

## Three-Stage Rollout

### **STAGE 1: Infrastructure & Surface Area** ⏳ This Week
*Build the structure for a multi-tool ecosystem*

#### What We're Building:
1. **`/tools` Landing Page** - App launcher pattern
   - Bond Generator (✓ Available Now)
   - Tool 2 placeholder (Coming Soon - Q1 2026)
   - Tool 3 placeholder (Coming Soon - Q1 2026)
   - Clean grid layout, professional tool cards
   - Waitlist capture for upcoming tools

2. **Tool Card Component System**
   - Reusable `<ToolCard>` component
   - States: Available, Coming Soon, Beta, Enterprise
   - Easy to add new tools (config-driven)
   - Consistent visual language

3. **Navigation Update**
   - Change "Bond Generator" → "Tools ▾" dropdown
   - Shows all tools (available + coming soon)
   - Scales gracefully as we add tools

#### Deliverables:
- [ ] `/app/tools/page.tsx` - Tools launcher page
- [ ] `/components/tools/ToolCard.tsx` - Reusable tool card
- [ ] `/lib/config/tools.ts` - Tool configuration (easy to update)
- [ ] Update `Navigation.tsx` - Add Tools dropdown
- [ ] Basic styling consistent with existing design system

---

### **STAGE 2: Language & Positioning** ⏳ This Week
*Update copy to reflect tool-first reality*

#### Homepage Updates (`/app/page.tsx`):
1. **Hero Section**
   - Current: "We turn email threads... into a living record"
   - New: More assertive, tool-focused
   - Suggest platform as future vision, not current promise

2. **Tools Section** (already exists, lines 65-98)
   - Expand to show ecosystem (not just Bond Generator)
   - Add "More tools coming soon" messaging
   - Link to `/tools` page

3. **CTA Priority**
   - Primary: "Explore Tools" or "Try Bond Generator"
   - Secondary: "See Platform Vision"

#### "What We're Building" Page Updates (`/app/building/page.tsx`):
1. **Rename**: "What We're Building" → "Platform Vision" or "Roadmap"
2. **Add Section**: Show what's already shipped
   - Bond Generator ✓ (Shipped Jan 2026)
   - Link to live tool
3. **Reframe Existing Content**: 
   - Deal Setup, Deal Overview, Term Sheet = "Platform Features (Coming 2026)"
   - These become the comprehensive platform, tools are the entry point
4. **Add Platform Waitlist CTA**

#### Bond Generator Page (`/app/bond-generator/page.tsx`):
1. **Add Ecosystem Messaging**
   - "Part of MuniFlow Tools" badge or section
   - "More tools coming soon - join waitlist"
2. **Optional**: Add small credibility indicators
   - "Used by X firms" (if you have data)
   - "X bonds generated" (if you want to show usage)

#### Navigation Labels:
- Keep clean, professional
- "Tools" (not "Products" - too corporate)
- "Platform Vision" or "Roadmap" (not "What We're Building")

#### Deliverables:
- [ ] Update `/app/page.tsx` - Hero, tools section, CTAs
- [ ] Update `/app/building/page.tsx` - Rename, add shipped section, reframe
- [ ] Update `/app/bond-generator/page.tsx` - Add ecosystem messaging
- [ ] Review all copy for consistency (tool-first, credibility-focused)

---

### **STAGE 3: Feedback & Tracking** ⏳ Next 1-2 Weeks
*Add analytics and user engagement loops*

#### Usage Analytics:
1. **Database Schema** (Supabase)
   - Track: user_id, tool_name, action_type, timestamp
   - Track: generations_count per user per tool
   - Track: user_tier (free, paid, enterprise)

2. **Analytics Implementation**
   - Track tool opens
   - Track generations/completions
   - Track drop-off points in flow
   - Simple dashboard for internal use

#### User Feedback Loops:
1. **Post-Generation Feedback**
   - Simple: "How was this? 👍 👎"
   - Optional: "What would make this better?" (text input)
   - Stored in database for review

2. **Email Capture Points**
   - Save templates → requires account
   - Download results → encourages account
   - Waitlist for new tools

3. **Soft Usage Limits**
   - Track generations in Supabase
   - After 3 generations: Soft gate modal
   - Message: "You're hitting the free tier limit. Want unlimited access?"
   - CTA: "Join Waitlist" (not payment yet)
   - Track interest for future pricing decisions

#### Deliverables:
- [ ] Supabase schema for usage tracking
- [ ] Analytics tracking utilities
- [ ] Feedback widgets (post-generation)
- [ ] Usage limit system (soft gate, no payment)
- [ ] Waitlist capture flow
- [ ] Email list integration (if needed)

---

### **STAGE 4: When Tools 2-3 Ship** ⏳ 1-2 Months
*Seamless addition of new tools*

#### Process for Each New Tool:
1. Update `/lib/config/tools.ts` - Change status to "Available"
2. Create `/app/[tool-name]/page.tsx` - Dedicated landing page
3. Add tool logic/components in `/components/[tool-name]/`
4. Update navigation automatically (pulls from config)
5. Announce to email list

#### Example for Tool 2:
```typescript
// lib/config/tools.ts
{
  id: 'tool-2',
  name: 'Tool Name',
  description: 'One sentence description',
  status: 'available', // Changed from 'coming-soon'
  href: '/tool-2',
  icon: 'CheckCircle', // or custom
  targetUsers: ['paralegals', 'counsel'],
  launchedDate: '2026-02-15'
}
```

That's it. Infrastructure handles the rest.

---

## Design Principles

### Visual Language:
- **Consistent with existing**: Use current Card, Button, GlassHeading components
- **Professional, not flashy**: Municipal bonds = conservative industry
- **Clear hierarchy**: Available tools prominent, coming soon tools subtle
- **Trust signals**: "Shipped", "In Use", dates, not hype

### Copy Tone:
- **Assertive, not aggressive**: "We build X" not "We're the best at X"
- **Specific, not vague**: "Deterministic assembly" not "AI-powered magic"
- **Honest about stage**: "Available now" vs "Coming soon" vs "Platform vision"
- **Domain fluency**: Use industry terms correctly (builds credibility)

### Tool Card Design (Proposed):
```
┌─────────────────────────────────┐
│  [Icon]                         │
│                                 │
│  Tool Name               [✓]    │
│  One-sentence description       │
│                                 │
│  For: paralegals, counsel       │
│                                 │
│  [Open Tool] or [Join Waitlist] │
└─────────────────────────────────┘
```

---

## Future Considerations (Not Now)

### Payment Integration (Stage 5 - TBD):
- Stripe or similar
- Pricing tiers: Free (3/mo), Pro ($X/mo), Enterprise (custom)
- "Early users get grandfathered pricing" messaging
- Unified billing across all tools

### Enterprise Features (Stage 6 - TBD):
- SSO (Google Workspace, Microsoft)
- Team management
- Usage analytics for admins
- Custom SLAs
- White-label options?

### Platform Launch (Stage 7 - Future):
- Tool users get early access
- Pricing: Tools à la carte vs Platform bundle
- Migration path: "Your tool data moves to platform"

---

## Success Metrics

### Stage 1-2 Success:
- Site looks intentional, professional, established
- Clear path from homepage → tools → individual tool
- "Coming soon" tools create FOMO, not confusion
- Messaging is consistent and credible

### Stage 3 Success:
- Track X tool opens per week
- Track Y generations per week
- Collect Z waitlist signups
- Understand where users drop off

### Stage 4 Success:
- Ship tools 2-3 without major refactor
- Each tool launch = email to growing list
- Momentum builds: "They ship consistently"

### Overall Success (3-6 months):
- 3+ tools live and used
- 100+ active users (free tier)
- 10+ firms have used at least one tool
- 1 case study/testimonial
- Strong foundation for enterprise/VC conversations

---

## Implementation Notes

### Tech Stack (Already in Place):
- Next.js 15, TypeScript, Tailwind CSS
- Supabase (auth, database, storage)
- Existing component library (Card, Button, etc.)

### File Structure (Proposed):
```
app/
  tools/
    page.tsx                    # Tools launcher
  [tool-name]/
    page.tsx                    # Each tool landing page
components/
  tools/
    ToolCard.tsx               # Reusable tool card
    ToolGrid.tsx               # Grid layout for tools
lib/
  config/
    tools.ts                   # Single source of truth for all tools
  analytics/
    trackToolUsage.ts          # Usage tracking utilities
```

### Configuration-Driven Tools:
All tool metadata lives in one file. Easy to update, consistent everywhere.

```typescript
// lib/config/tools.ts
export const tools = [
  {
    id: 'bond-generator',
    name: 'Bond Generator',
    description: 'Deterministic assembly of executed bond certificates',
    status: 'available',
    href: '/bond-generator',
    // ... more config
  },
  // Add more tools here
]
```

---

## Next Actions

### Immediate (Today):
1. ✅ Review this plan
2. ⏳ Execute Stage 1: Build `/tools` page infrastructure
3. ⏳ Execute Stage 2: Update copy and positioning

### This Week:
4. Review and iterate on Stage 1-2 deliverables
5. Plan Stage 3 implementation details
6. Gather info for tools 2-3 (names, descriptions, placeholders)

### Next 1-2 Weeks:
7. Execute Stage 3: Feedback & tracking
8. Test with small group if possible
9. Prepare for tools 2-3 launch

---

## Open Questions

1. **Tool 2-3 Names/Descriptions**: Do you have these? Or use placeholders?
2. **Icons**: Custom icons or use Lucide icon library?
3. **Waitlist Tool**: Mailchimp, ConvertKit, custom Supabase table?
4. **Analytics**: Just Supabase queries or also Google Analytics?
5. **Soft Launch vs Public**: Quiet launch or announce on LinkedIn/Twitter?

---

*This is a living document. Update as we learn and iterate.*

**Last Updated**: Jan 29, 2026
