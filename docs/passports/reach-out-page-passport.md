# Passport: Reach Out / Contact Page

## Page Overview
The **Reach Out** page is where we convert interest into contact. It's a strategic funnel to collect emails and understand intent while staying open and welcoming.

**Status**: 🟡 In Progress (Dec 31, 2025)

---

## Business Goals

### Primary Objective
**Collect emails and start conversations** with anyone in the municipal bond space.

### Target Audience
- **Bond attorneys** (primary)
- **Issuers** (government entities issuing bonds)
- **Developers** (real estate, infrastructure)
- **Anyone in the bond world** interested in new tools

### What Success Looks Like
- People fill out the form (low friction)
- We get their email
- We understand their intent (feedback, pain points, connect)
- Conversation starts

### Strategic Approach
- **Open, not restrictive** - We're not gatekeeping
- **Filter intent** - Understand what people want to talk about
- **Conversational tone** - Feels like reaching out to a colleague, not filling out a corporate form
- **No pressure** - Optional fields where appropriate

---

## Form Strategy

### Form Philosophy
Mental model: **"Coffee chat signup"** - casual but professional, easy but meaningful.

### Required Fields (Minimal Friction)
1. **Name** (First + Last or just Name)
2. **Email** (primary goal)
3. **Intent/Interest** (radio buttons or select)

### Optional Fields (Enrichment)
4. **Company/Organization** (optional - helpful context)
5. **Role** (optional - bond attorney, issuer, developer, other)
6. **Message** (optional - open text area)

### Intent Categories
The key differentiator - let people self-select:

**Option 1: "I want to..."**
- [ ] **Share feedback** - "I've seen deals, I have thoughts"
- [ ] **Discuss pain points** - "Here's what's broken in my workflow"
- [ ] **Try the app** - "I want to test this"
- [ ] **Just connect** - "Interesting project, let's talk"

**OR Option 2: Dropdown**
```
What brings you here?
- I'd like to try the app
- I want to share feedback on bond workflows
- I'm experiencing workflow pain points
- Just want to connect and learn more
```

**Recommendation**: Radio buttons (more visual, easier to scan)

---

## Visual Design

### Layout
```
┌─────────────────────────────────────────┐
│           Navigation (sticky)           │
├─────────────────────────────────────────┤
│                                         │
│            Hero Section                 │
│   "Let's start a conversation."        │
│    (Cyan "conversation" accent)         │
│                                         │
│   Short, welcoming subtext              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│          Form Card (centered)           │
│   ┌───────────────────────────────┐   │
│   │  Name              [______]   │   │
│   │  Email             [______]   │   │
│   │  Company (opt)     [______]   │   │
│   │  Role (opt)        [______]   │   │
│   │                                │   │
│   │  I want to...                  │   │
│   │  ○ Share feedback             │   │
│   │  ○ Discuss pain points        │   │
│   │  ○ Try the app                │   │
│   │  ○ Just connect               │   │
│   │                                │   │
│   │  Message (optional)            │   │
│   │  [________________]           │   │
│   │  [________________]           │   │
│   │  [________________]           │   │
│   │                                │   │
│   │  [ Get in Touch ] (button)    │   │
│   └───────────────────────────────┘   │
│                                         │
│      Confirmation message area          │
│                                         │
└─────────────────────────────────────────┘
```

### Card Styling
- Use **Card component** with `highlight` variant
- Subtle purple gradient background
- Purple/cyan border
- Clean spacing, generous padding
- Centered, max-width ~600px

### Form Field Styling
- **Text inputs**: 
  - Gray-800 background
  - Gray-600 border → Cyan on focus
  - White text
  - Placeholder: Gray-400
  - Rounded-lg, consistent height

- **Radio buttons**:
  - Custom styled (not default browser)
  - Unchecked: Gray border
  - Checked: Cyan fill with purple glow
  - Label: White text, hover: Cyan

- **Textarea** (message):
  - Same as text inputs
  - Min 4 rows
  - Resize: vertical only

- **Submit button**:
  - Primary variant (purple gradient)
  - Full width on mobile, auto on desktop
  - Loading state (spinner + "Sending...")

### States
1. **Default** - Clean, ready to fill
2. **Focused** - Cyan borders, subtle glow
3. **Filled** - Visual feedback (checkmark icon?)
4. **Error** - Red border, error message below field
5. **Submitting** - Button disabled, loading spinner
6. **Success** - Form replaced with success message

---

## Copy/Messaging

### Hero
**Heading**: "Let's start a conversation."  
**Subheading**: "Whether you want to try the app, share feedback, or just connect—we'd like to hear from you."

### Form Labels
- **Name**: "Your name"
- **Email**: "Email address"
- **Company** (optional): "Company or organization (optional)"
- **Role** (optional): "What you do (optional)"
- **Intent**: "I want to..."
  - Share feedback on bond workflows
  - Discuss pain points I'm experiencing
  - Try the app and give it a test
  - Just connect and learn more
- **Message** (optional): "Anything else? (optional)"

### Button
- Default: "Get in Touch"
- Loading: "Sending..." (with spinner)
- Success: "Sent!" (brief, then show success message)

### Success Message
```
✅ Thanks for reaching out!

We'll get back to you soon. If you selected "Try the app," 
we'll send you access details within 24 hours.

- The MuniFlow team
```

### Error Message (if submit fails)
```
⚠️ Something went wrong.

Please try again or email us directly at [email]
```

---

## Technical Implementation

### Components Needed

1. **FormField** component
   - Reusable input wrapper
   - Label, input, error message
   - Focus states, validation

2. **RadioGroup** component
   - Custom styled radio buttons
   - Keyboard accessible
   - Visual feedback

3. **Form** component
   - Handles state management
   - Validation logic
   - Submit handling

### Form Handling Options

**Option A: Client-side → API route → Email/Database**
```typescript
// app/api/contact/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  
  // Validate
  // Send email (Resend, SendGrid, etc.)
  // Store in database (optional)
  
  return Response.json({ success: true });
}
```

**Option B: Form service (Formspree, Tally, etc.)**
- Quick setup
- No backend needed
- Email notifications built-in

**Recommendation**: Start with **Option A** for full control and branding.

### Validation Rules
- **Name**: Required, min 2 characters
- **Email**: Required, valid email format
- **Intent**: Required, one selection
- **Company, Role, Message**: Optional, no validation

### Data Structure
```typescript
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  intent: 'feedback' | 'pain-points' | 'try-app' | 'connect';
  message?: string;
  timestamp: string;
}
```

---

## Accessibility

- [ ] All form fields have proper labels
- [ ] Tab order is logical
- [ ] Radio buttons keyboard navigable (arrow keys)
- [ ] Error messages announced to screen readers
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Form can be completed with keyboard only

---

## Performance

- [ ] Form validation instant (client-side)
- [ ] Submit under 1 second
- [ ] No layout shift on error messages
- [ ] Optimistic UI (show success immediately)
- [ ] Loading states prevent double submission

---

## Email Handling Strategy

### What Happens After Submit?

1. **Immediate**: Confirmation message on screen
2. **Within 1 hour**: Automated "We got your message" email
3. **Within 24 hours**: Personal response from team

### Email Template (to us)
```
New Contact Form Submission

Name: [name]
Email: [email]
Company: [company]
Role: [role]

Intent: [intent]

Message:
[message]

---
Submitted: [timestamp]
```

### Auto-reply (to them)
```
Subject: Thanks for reaching out to MuniFlow

Hi [name],

We got your message. [If try-app: We'll send you access details soon.]

We'll be in touch within 24 hours.

Best,
The MuniFlow Team
```

---

## Success Metrics

### Primary
- **Form submissions** (quantity)
- **Email collection rate** (success rate)

### Secondary
- **Intent distribution** (which options are most popular?)
- **Completion time** (how long to fill out?)
- **Bounce rate** (% who leave without submitting)

### Quality
- **Valid emails** (% deliverable)
- **Response rate** (% who reply to our follow-up)
- **Conversion to app users** (% who actually try the app)

---

## Next Steps

1. ✅ Create this passport
2. ⏳ Build FormField component
3. ⏳ Build RadioGroup component
4. ⏳ Build contact form
5. ⏳ Set up API route for submissions
6. ⏳ Configure email service (Resend recommended)
7. ⏳ Test form end-to-end
8. ⏳ Deploy and monitor

---

## Mobile Considerations

- Full-width form on mobile (<768px)
- Larger tap targets (min 44x44px)
- Keyboard-friendly (proper input types)
- Auto-capitalize name
- Email keyboard for email field
- Vertical spacing for readability

---

## Copy Variations (A/B Test Ideas)

**Heading**:
- "Let's start a conversation."
- "Let's talk."
- "Get in touch."
- "Tell us what you're working on."

**Button**:
- "Get in Touch"
- "Send Message"
- "Start Conversation"
- "Reach Out"

---

*Last Updated: Dec 31, 2025*
*Status: In Development*

