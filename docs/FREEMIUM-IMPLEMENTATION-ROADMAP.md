# 🎯 Freemium Model Implementation Roadmap

**Created:** January 26, 2026  
**Status:** Phase 1 Complete ✅  
**Next:** Phase 2 - Authentication Integration

---

## ✅ Phase 1: Preview Limiting (COMPLETE)

### **Implemented Components**

**1. Preview Limiter Utility** ✅
- **File:** `lib/previewLimiter.ts`
- **Lines:** 60 (under limit)
- **Purpose:** localStorage-based preview tracking
- **Functions:**
  - `getPreviewCount()` - Read counter
  - `incrementPreviewCount()` - Increment counter
  - `getPreviewsRemaining()` - Calculate remaining
  - `hasPreviewsRemaining()` - Boolean check
  - `resetPreviewCount()` - Clear after signup

**2. Preview Limit Banner** ✅
- **File:** `components/bond-generator/PreviewLimitBanner.tsx`
- **Lines:** 60 (under 100 limit)
- **Props:** `previewsRemaining`, `show`
- **Behavior:** Shows warning on last preview, error on exhausted

**3. Account Gate Modal** ✅
- **File:** `components/bond-generator/AccountGateModal.tsx`
- **Lines:** 140 (under 150 limit)
- **Props:** `isOpen`, `reason`, `bondCount`, `previewsUsed`, `onClose`
- **Displays:**
  - Headline based on reason (preview_limit vs download)
  - Value props (5 benefits)
  - CTA buttons (Sign Up, Request Walkthrough)

**4. Assembly Generation Integration** ✅
- **File:** `components/bond-generator/AssemblyGeneration.tsx`
- **Changes:**
  - Added preview limit checking
  - Added account gate for download
  - Integrated PreviewLimitBanner
  - Integrated AccountGateModal
  - Uses `logger` instead of console.log
  - Tracks preview count in localStorage

### **User Flow (Current)**

```
1. User generates bonds
2. Clicks "👁️ Preview Sample"
   → IF previews remaining: Show preview, increment counter
   → IF no previews: Show AccountGateModal (reason: preview_limit)
3. After 3 previews: Preview blocked, gate shown
4. Clicks "Generate X Bonds"
   → Always shows AccountGateModal (reason: download)
5. User clicks "Create Free Account" or "Request Walkthrough"
```

### **localStorage Structure**

```
Key: muniflow_preview_count
Value: "0" | "1" | "2" | "3"
```

---

## 🔜 Phase 2: Authentication Integration (NEXT)

### **Timeline:** Week 2 (6-8 hours)

### **Components to Build**

#### **1. Supabase Auth Setup**
**Time:** 1 hour

```bash
# Already have Supabase configured
# Need to enable Auth in Supabase dashboard
```

**Tasks:**
- [ ] Enable Email/Password auth in Supabase
- [ ] Configure email templates
- [ ] Set up OAuth providers (optional: Google, GitHub)
- [ ] Test auth flow in Supabase dashboard

---

#### **2. Auth Provider Context**
**File:** `app/providers/AuthProvider.tsx`  
**Time:** 2 hours  
**Lines:** ~150

**Implementation:**

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resetPreviewCount } from '@/lib/previewLimiter';
import { logger } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
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
        
        // Reset preview count when user signs in
        if (session?.user) {
          resetPreviewCount();
          logger.info('User authenticated, preview count reset');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      logger.info('Sign up attempt', { email });
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      logger.info('Sign up successful', { email });
    } catch (error) {
      logger.error('Sign up failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      logger.info('Sign in attempt', { email });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      logger.info('Sign in successful', { email });
    } catch (error) {
      logger.error('Sign in failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      logger.info('Sign out attempt');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Sign out failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
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

**Tasks:**
- [ ] Create `app/providers/AuthProvider.tsx`
- [ ] Wrap `app/layout.tsx` with `<AuthProvider>`
- [ ] Test `useAuth()` hook in components

---

#### **3. Sign Up Page**
**File:** `app/signup/page.tsx`  
**Time:** 2 hours  
**Lines:** ~200

**Features:**
- Email/password form
- Validation (Zod schema)
- Loading states
- Error handling
- Redirect after signup
- Link to sign in page

**Tasks:**
- [ ] Create sign up page
- [ ] Add form validation
- [ ] Wire to `useAuth().signUp()`
- [ ] Add success/error states
- [ ] Test full signup flow

---

#### **4. Sign In Page**
**File:** `app/signin/page.tsx`  
**Time:** 1 hour  
**Lines:** ~150

**Features:**
- Email/password form
- Validation
- "Forgot password" link
- Link to sign up
- Redirect after signin

**Tasks:**
- [ ] Create sign in page
- [ ] Wire to `useAuth().signIn()`
- [ ] Add error handling
- [ ] Test signin flow

---

#### **5. Update Account Gate Modal**
**File:** `components/bond-generator/AccountGateModal.tsx`  
**Time:** 30 minutes

**Changes:**
- Replace "Create Free Account" link with actual signup form
- OR keep link but redirect to `/signup?redirect=/bond-generator/workbench`

**Tasks:**
- [ ] Add redirect query param support
- [ ] Update link to include redirect
- [ ] Test redirect flow

---

#### **6. Update Assembly Generation**
**File:** `components/bond-generator/AssemblyGeneration.tsx`  
**Time:** 1 hour

**Changes:**

```typescript
import { useAuth } from '@/app/providers/AuthProvider';

export function AssemblyGeneration({ ... }) {
  const { user } = useAuth();
  
  // ... existing state ...
  
  const handleGenerateClick = () => {
    // Check if user is authenticated
    if (!user) {
      logger.info('Generate clicked without auth, showing gate');
      setAccountGateReason('download');
      setShowAccountGate(true);
      return;
    }
    
    // User is authenticated, proceed with generation
    logger.info('Generate clicked with auth, proceeding', { userId: user.id });
    onGenerate();
  };
  
  const handlePreviewFirst = async () => {
    // ... existing logic ...
    
    // Skip preview limit check if user is authenticated
    if (!user && !hasPreviewsRemaining()) {
      logger.info('Preview limit reached, showing account gate');
      setAccountGateReason('preview_limit');
      setShowAccountGate(true);
      return;
    }
    
    // If user is authenticated, don't increment counter
    if (!user) {
      incrementPreviewCount();
      setPreviewsRemaining(getPreviewsRemaining());
    }
    
    // ... rest of preview logic ...
  };
}
```

**Tasks:**
- [ ] Import `useAuth` hook
- [ ] Add user check in `handleGenerateClick`
- [ ] Skip preview limit for authenticated users
- [ ] Test with/without auth

---

### **Updated User Flow (After Auth)**

```
UNAUTHENTICATED USER:
1. Generate bonds
2. Preview (up to 3 times) → counter increments
3. After 3 previews → Account gate blocks
4. Click "Generate" → Account gate blocks
5. Sign up → Preview counter resets

AUTHENTICATED USER:
1. Generate bonds
2. Preview (unlimited) → no counter
3. Click "Generate" → Downloads immediately
4. Can save drafts
```

---

## 🚀 Phase 3: Post-Generation UX (LATER)

### **Timeline:** Week 3-4 (8-10 hours)

### **Components to Build**

#### **1. Generation Results Component**
**File:** `components/bond-generator/GenerationResults.tsx`  
**Replaces:** `GenerationComplete.tsx`  
**Time:** 4 hours

**Features:**
- Success message
- List of generated bonds
- Preview button for each bond
- Edit button for each bond (future)
- Re-download ZIP button
- Generate more bonds button

---

#### **2. Bond Edit Modal**
**File:** `components/bond-generator/BondEditModal.tsx`  
**Time:** 3 hours

**Features:**
- Form with all editable fields
- Validation
- Save/cancel actions
- Triggers regeneration

---

#### **3. Bond Editing Hook**
**File:** `modules/bond-generator/hooks/useBondEditing.ts`  
**Time:** 2 hours

**Features:**
- Manages edited bonds state
- Tracks which bonds changed
- Provides `editBond()` function
- Provides `resetEdits()` function

---

## 📋 Testing Checklist

### **Phase 1 (Current)**
- [ ] Preview counter increments correctly
- [ ] Banner shows at 1 remaining
- [ ] Banner shows "exhausted" at 0
- [ ] Preview blocks at 0 remaining
- [ ] Account gate shows for preview_limit
- [ ] Account gate shows for download
- [ ] Modal can be closed
- [ ] Links work (signup, walkthrough)
- [ ] localStorage persists across refreshes
- [ ] Incognito mode resets counter (expected)

### **Phase 2 (Auth)**
- [ ] Sign up creates account
- [ ] Email verification works
- [ ] Sign in authenticates user
- [ ] Sign out clears session
- [ ] Preview counter resets on signup
- [ ] Authenticated users bypass preview limit
- [ ] Authenticated users can download
- [ ] Redirect after signup works
- [ ] Auth state persists across refreshes

### **Phase 3 (Post-Gen)**
- [ ] Generation results shows all bonds
- [ ] Preview works for each bond
- [ ] Edit modal opens
- [ ] Edit saves correctly
- [ ] Regeneration works after edit
- [ ] Re-download works

---

## 🎯 Success Metrics

### **Phase 1 (Complete)**
- ✅ Preview limiting implemented
- ✅ Account gate functional
- ✅ No console.log (using logger)
- ✅ ELITE standards followed
- ✅ All components <150 lines
- ✅ Fully typed with TypeScript
- ✅ No linter errors

### **Phase 2 (Target)**
- [ ] Auth flow working end-to-end
- [ ] Preview → Signup → Download flow works
- [ ] >50% of preview-limited users sign up
- [ ] Auth state properly managed
- [ ] Session persists correctly

### **Phase 3 (Target)**
- [ ] Users can edit generated bonds
- [ ] Regeneration works smoothly
- [ ] 80% of users preview before download
- [ ] <5% support requests about editing

---

## 🔧 Technical Debt

### **Current (Acceptable)**
- localStorage can be bypassed (OK for MVP)
- No server-side preview tracking (add later if needed)
- No analytics on preview usage (add in Phase 3)

### **Future Improvements**
- Add browser fingerprinting (if abuse becomes issue)
- Track preview usage in database (for analytics)
- Add rate limiting on preview API
- Add Stripe integration for paid tiers

---

## 📝 Notes

### **Why localStorage Only?**
- 90% effective for honest users
- Extremely simple to implement
- No backend work needed
- Can add server tracking later
- Focus on VALUE, not walls

### **Why Account Gate on Download?**
- Builds trust (preview first)
- Shows value before asking
- Higher conversion than upfront gate
- Professional user experience

### **Next Steps**
1. Test Phase 1 implementation thoroughly
2. Set up Supabase Auth
3. Build AuthProvider
4. Create signup/signin pages
5. Integrate auth into AssemblyGeneration

---

**Last Updated:** January 26, 2026  
**Status:** Phase 1 Complete, Ready for Phase 2
