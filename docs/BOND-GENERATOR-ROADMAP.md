# 🗺️ Bond Generator Implementation Roadmap

**Created:** 2026-01-26  
**Status:** Environment setup phase  
**Goal:** Launch functional bond generator with clean, minimal code

---

## 📊 **Current State**

### ✅ **What's Working:**
- [x] Page structure (`/bond-generator`, `/guide`, `/workbench`)
- [x] Navigation integration
- [x] Homepage CTAs
- [x] Professional copy/tone
- [x] Component architecture (5 clean Tailwind components)
- [x] Backend services (bond assembly logic complete)
- [x] Backend APIs (11 endpoints functional)
- [x] Error handling infrastructure
- [x] Logging (Pino + Sentry)

### ⚠️ **What's Broken:**
- [ ] MUI components (25 files, need Tailwind conversion)
- [ ] Auth is stub (guest-user only)
- [ ] Database not configured yet
- [ ] File storage not set up
- [ ] Account gate not built

### ❌ **What's Bloated:**
- Material UI dependencies (~700KB)
- Emotion CSS-in-JS (~100KB)
- Too many component files (need consolidation)

---

## 🎯 **PHASE 1: Environment Setup** ⚡ **CURRENT**

### **Week 1: Database & Services**

**Tasks:**
1. Create Supabase project for MuniLanding
2. Run migration SQL (`docs/supabase-migrations.sql`)
3. Create storage bucket (`bond-generator-files`)
4. Update `.env.local` with real keys
5. Test database connection

**Success Criteria:**
- ✅ Can connect to Supabase from app
- ✅ Tables exist and are accessible
- ✅ Storage bucket accepts uploads
- ✅ No console errors about missing keys

**Files to Update:**
- `.env.local` (you create this, don't commit)
- Verify `lib/supabase.ts` connects properly

---

## 🔧 **PHASE 2: Remove MUI Bloat** 🎨 **NEXT**

### **Week 2: Component Migration**

**Strategy:** Replace MUI with minimal Tailwind components

**Current MUI Usage:**
- 25 component files use MUI
- Largest: `BlankSpaceTaggingPage.tsx` (400+ lines)
- Most complex: Form fields, date pickers, modals

**Migration Priority:**

**Priority 1: Core UI (Replace First)**
- [ ] `TextField` → `FormField` (already exists in landing page)
- [ ] `Button` → `Button` (already exists)
- [ ] `Box` → `div` with Tailwind classes
- [ ] `Typography` → HTML tags with Tailwind

**Priority 2: Date Picker (Custom or Library)**
- [ ] `@mui/x-date-pickers` → Options:
  - **Option A:** `react-day-picker` (20KB, headless, Tailwind-friendly)
  - **Option B:** Build custom with `date-fns` (already have it)
  - **Option C:** Skip for now, use text input

**Priority 3: Complex Components (Simplify)**
- [ ] `BlankSpaceTaggingPage` - Needs complete rewrite (simplify UI)
- [ ] `AssemblyCheckScreen` - Table component needed
- [ ] `MaturitySchedulePreview` - Editable table needed
- [ ] `CusipSchedulePreview` - Editable table needed

**Priority 4: Modals (Use Headless UI)**
- [ ] `LegalDisclaimerModal` → Headless UI Dialog
- [ ] `FinalityConfirmationModal` → Headless UI Dialog
- [ ] `TagValidationModal` → Headless UI Dialog

**Success Criteria:**
- ✅ Remove `@mui/*` from package.json
- ✅ Remove `@emotion/*` from package.json
- ✅ All components use Tailwind
- ✅ Bundle size reduced by ~700KB

---

## 🔐 **PHASE 3: Authentication** 🔒 **WEEK 3**

### **Implementation Plan:**

**Step 1: Supabase Auth Setup**
```typescript
// lib/auth/withApiAuth.ts (Real implementation)
import { supabaseAdmin } from '@/lib/supabase';

export function withApiAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get JWT from cookie or Authorization header
    const token = req.cookies['sb-access-token'] || 
                  req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify token with Supabase Admin (no RLS)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: user.id,
      email: user.email!,
    };
    
    return handler(authenticatedReq, res);
  };
}
```

**Step 2: Frontend Auth Context**
```typescript
// app/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Step 3: Update getAuthHeaders**
```typescript
// lib/auth/getAuthHeaders.ts (Real implementation)
import { supabase } from '@/lib/supabase';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
  };
}
```

**Step 4: Protected Routes**
- Free tier: Preview, validation (no auth)
- Paid tier: Download bonds (requires auth)

**Files to Update:**
- `lib/auth/withApiAuth.ts`
- `lib/auth/getAuthHeaders.ts`
- `app/providers/AuthProvider.tsx` (new)
- `app/layout.tsx` (wrap with AuthProvider)

---

## 🎨 **PHASE 4: Workbench UI** 🖥️ **WEEK 4**

### **Build Core Workbench Components**

**Step 1: File Upload**
```typescript
// components/bond-generator/FileUpload.tsx
// Drag-and-drop interface
// Validation (.docx only)
// Progress indicator
// Error states
```

**Step 2: Tag Assignment (Simplified)**
```typescript
// components/bond-generator/TagAssignment.tsx
// List of required tags (sidebar)
// Template preview (right panel)
// Click tag → Highlight mode → Assign
// Much simpler than current MUI version
```

**Step 3: Validation Table**
```typescript
// components/bond-generator/ValidationTable.tsx
// Clean Tailwind table
// Editable cells (inline)
// Status badges (green/red)
// Export to Excel (optional)
```

**Step 4: Account Gate Modal**
```typescript
// components/bond-generator/AccountGateModal.tsx
// Headless UI Dialog
// "Sign in to generate" messaging
// Two actions: Sign in | Request walkthrough
```

**Success Criteria:**
- ✅ Can upload files
- ✅ Can tag template
- ✅ Can validate schedules
- ✅ Account gate appears on "Generate"
- ✅ Clean, minimal code (<150 lines per component)

---

## 💰 **PHASE 5: Subscription Logic** 💳 **WEEK 5-6**

### **Stripe Integration**

**Free Tier:**
- Upload template
- Tag variables
- Upload schedules
- Validate data
- Preview assembled bonds

**Paid Tier ($X/month or $Y per generation):**
- Download bond ZIP file
- Save unlimited drafts
- Priority support

**Implementation:**
1. Stripe account setup
2. Create products/prices
3. Checkout flow
4. Webhook handlers
5. Usage tracking

---

## 📈 **Success Metrics**

### **Technical:**
- Bundle size < 1.5MB (currently ~2.5MB with MUI)
- Page load < 2s
- No console errors
- TypeScript strict mode passing
- Zero `any` types in new code

### **User Experience:**
- Can complete workflow in < 5 minutes
- Clear error messages
- Tooltips guide every step
- Mobile responsive
- Accessible (keyboard nav, ARIA)

### **Business:**
- Conversion: Preview → Account creation
- Time to first generation
- User feedback (NPS)

---

## 🚨 **Blockers & Risks**

### **Current Blockers:**
1. **No Supabase project** - Can't save drafts
2. **MUI dependency** - Bundle too large
3. **No real auth** - Can't gate features

### **Technical Debt:**
1. **BlankSpaceTaggingPage** - 400+ lines, needs rewrite
2. **Multiple preview tables** - Each 200+ lines, need consolidation
3. **`any` types** - 20+ violations in bond-generator code

### **Risks:**
1. **User confusion** - Complex tagging UI might be too hard
2. **Performance** - Excel parsing can be slow (>5s for large files)
3. **File storage costs** - Supabase has limits on free tier

---

## 🎯 **Immediate Next Steps (This Week)**

### **For You (Human):**
1. [ ] Create Supabase project
2. [ ] Run `docs/supabase-migrations.sql` in SQL Editor
3. [ ] Create storage bucket `bond-generator-files`
4. [ ] Copy `.env.local.example` → `.env.local`
5. [ ] Fill in Supabase keys in `.env.local`
6. [ ] (Optional) Set up Sentry project
7. [ ] (Optional) Set up Resend domain

### **For Me (AI Agent):**
1. [ ] Audit existing bond generator functionality
2. [ ] Create component consolidation plan
3. [ ] Build file upload component (Tailwind)
4. [ ] Build account gate modal
5. [ ] Remove MUI dependencies

**Estimated Timeline:**
- Environment setup: 1-2 hours (you)
- MUI removal: 2-3 days (me)
- Auth implementation: 1 day (me)
- Workbench polish: 2-3 days (me)

**Total:** ~1 week to fully functional bond generator

---

## 📝 **Notes**

### **Why We Use Supabase Admin (Not RLS):**
- Backend APIs handle auth (`withApiAuth`)
- Service functions receive `userId` as parameter
- Admin client bypasses RLS for performance
- Simpler than managing RLS policies

### **Why We're Removing MUI:**
- 700KB bundle size impact
- Conflicts with Tailwind aesthetic
- Over-engineered for our needs
- Landing page already has clean Tailwind components

### **Design Philosophy:**
- Less code = fewer bugs
- Atomic components = easier to polish
- Tooltips > documentation
- Show > tell

---

**Next:** Set up your Supabase project, then ping me to continue!
