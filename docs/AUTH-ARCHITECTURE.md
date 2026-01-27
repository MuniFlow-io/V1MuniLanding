# 🔐 Authentication Architecture for Landing Page + Tool

**Date:** January 26, 2026  
**Purpose:** Explain how auth works across public landing page + bond generator tool

---

## 🎯 **The Challenge**

We have a **public landing page** with an **embedded tool**:
- Landing page is 100% public (no auth)
- Bond generator tool has **freemium model** (some features public, some require auth)
- Need seamless auth that works across entire site

---

## 💡 **The Solution: Cookie-Based Auth with Hybrid Access**

### **How Supabase Auth Works**

```
1. User signs up → Supabase creates session
2. Session stored in HTTP-only cookie
3. Cookie automatically sent with ALL requests
4. Backend reads cookie to check auth
5. Cookie persists across entire domain
```

**Key Benefit:** Once authenticated, user is authenticated EVERYWHERE on the site automatically.

---

## 🏗️ **Site Structure**

```
FULLY PUBLIC (No Auth)
├── / (Homepage)
├── /features
├── /pricing
├── /contact
├── /bond-generator (Info page)
└── /bond-generator/guide

HYBRID (Some features public, some require auth)
└── /bond-generator/workbench
    ├── Upload template → PUBLIC
    ├── Tag template → PUBLIC
    ├── Upload schedules → PUBLIC
    ├── Preview bonds → PUBLIC (with 3 preview limit)
    └── Download ZIP → REQUIRES AUTH ❌

PROTECTED (Full auth required)
├── /signup (creates auth)
├── /signin (creates auth)
└── Future: /dashboard, /settings, etc.
```

---

## 🔄 **User Flow: Freemium Model**

### **First-Time User (No Account)**

```
1. Lands on /bond-generator/workbench
   → No auth cookie
   → Can use tool freely

2. Uploads files, generates bonds
   → All works without auth
   → Using "guest mode" in backend

3. Clicks "Preview Sample" (1st time)
   → Public API endpoint (no auth required)
   → Preview generated successfully
   → localStorage: preview_count = 1

4. Clicks "Preview Sample" (2nd time)
   → Preview works
   → localStorage: preview_count = 2
   → Warning banner appears

5. Clicks "Preview Sample" (3rd time)
   → Preview works
   → localStorage: preview_count = 3
   → Warning banner: "Last preview"

6. Clicks "Preview Sample" (4th time)
   → Preview BLOCKED
   → AccountGateModal appears
   → Message: "You've used all 3 free previews"

7. Clicks "Generate X Bonds" button
   → AccountGateModal appears
   → Message: "Sign up to download X bonds"

8. Clicks "Create Free Account"
   → Redirects to /signup?redirect=/bond-generator/workbench
   → User fills form, submits
   → Supabase creates account
   → Sets auth cookie
   → Redirects back to /bond-generator/workbench
   → localStorage preview count RESET
```

### **Returning User (Has Account)**

```
1. User returns to site days later
   → Auth cookie still valid (persists 30 days)
   → Automatically authenticated

2. Navigates to /bond-generator/workbench
   → Cookie sent automatically
   → Backend recognizes user
   → No preview limits
   → Can download immediately
```

---

## 🔧 **Technical Implementation**

### **1. Auth Provider (Client-Side)**

**File:** `app/providers/AuthProvider.tsx`

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
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // Reset preview count when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          resetPreviewCount();
          logger.info('User signed in, preview count reset', { 
            userId: session.user.id 
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
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
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

**Usage in `app/layout.tsx`:**

```typescript
import { AuthProvider } from './providers/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### **2. Backend Auth Checking**

**Current `withApiAuth` (requires auth):**

```typescript
// pages/api/bond-generator/generate.ts
export default withRequestId(withApiAuth(handler));
// ✅ User MUST be authenticated to generate/download
```

**New Public Endpoints (no auth):**

```typescript
// pages/api/bond-generator/preview-filled-bond-public.ts
export default withRequestId(handler);
// ✅ Anyone can preview (rate limited by frontend localStorage)
```

---

### **3. Component Auth Logic**

**Update `AssemblyGeneration.tsx`:**

```typescript
import { useAuth } from '@/app/providers/AuthProvider';

export function AssemblyGeneration({ ... }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // ... existing state ...
  
  const handlePreviewFirst = async () => {
    // Skip preview limit if user is authenticated
    if (!user && !hasPreviewsRemaining()) {
      logger.info('Preview limit reached for guest user');
      setAccountGateReason('preview_limit');
      setShowAccountGate(true);
      return;
    }
    
    // ... existing preview logic ...
    
    // Only increment counter for guest users
    if (!user) {
      incrementPreviewCount();
      setPreviewsRemaining(getPreviewsRemaining());
    }
  };
  
  const handleGenerateClick = () => {
    // Check if user is authenticated
    if (!user) {
      logger.info('Generate clicked without auth, showing gate');
      setAccountGateReason('download');
      setShowAccountGate(true);
      return;
    }
    
    // User is authenticated, proceed with generation
    logger.info('Generate clicked with auth, proceeding', { 
      userId: user.id 
    });
    onGenerate(); // Actually generate and download
  };
}
```

---

## 📊 **Auth State Matrix**

| User State | Preview | Download | Preview Count |
|------------|---------|----------|---------------|
| **No Account (Guest)** | ✅ Yes (3 max) | ❌ Shows gate | Increments |
| **Has Account (Authenticated)** | ✅ Unlimited | ✅ Yes | Doesn't increment |
| **Signed Out** | ✅ Yes (3 max) | ❌ Shows gate | Increments |

---

## 🔐 **Session Persistence**

### **How Long Does Auth Last?**

```typescript
// Supabase default settings:
- Access token: 1 hour (refreshes automatically)
- Refresh token: 30 days
- Cookie: HTTP-only, secure, same-site
```

**What This Means:**
- User signs up → Authenticated for 30 days
- User closes browser → Still authenticated when returns
- After 30 days → Must sign in again
- Can configure this in Supabase dashboard

---

## 🚀 **Implementation Checklist**

### **Phase 2A: Auth Infrastructure** (2-3 hours)

- [ ] Enable Email/Password auth in Supabase dashboard
- [ ] Create `app/providers/AuthProvider.tsx`
- [ ] Wrap `app/layout.tsx` with `<AuthProvider>`
- [ ] Test `useAuth()` hook

### **Phase 2B: Sign Up/In Pages** (3-4 hours)

- [ ] Create `/app/signup/page.tsx`
- [ ] Create `/app/signin/page.tsx`
- [ ] Add form validation (Zod)
- [ ] Add error handling
- [ ] Test full auth flow

### **Phase 2C: Integration** (2-3 hours)

- [ ] Update `AssemblyGeneration.tsx` with `useAuth()`
- [ ] Skip preview limits for authenticated users
- [ ] Call `onGenerate()` for authenticated users
- [ ] Test guest vs authenticated flows

---

## 🎯 **Success Criteria**

**Guest Users:**
- ✅ Can use tool without account
- ✅ Can preview 3 times
- ✅ See account gate after 3 previews
- ✅ See account gate on download
- ✅ Can sign up from gate

**Authenticated Users:**
- ✅ Unlimited previews
- ✅ Can download immediately
- ✅ Session persists across visits
- ✅ Preview count doesn't increment
- ✅ Can sign out and become guest again

---

## 💡 **Key Insights**

### **Why Cookie-Based Auth?**
- ✅ Works automatically across entire domain
- ✅ HTTP-only = secure (JavaScript can't access)
- ✅ Same-site = CSRF protection
- ✅ No manual token management needed
- ✅ Supabase handles all complexity

### **Why Hybrid Access Model?**
- ✅ Lower barrier to entry (try before signup)
- ✅ Builds trust (see tool works first)
- ✅ Higher conversion (proven value)
- ✅ Better UX (frictionless start)

### **Why localStorage for Preview Limit?**
- ✅ Works without backend
- ✅ Immediate implementation
- ✅ Good enough for honest users
- ✅ Can add server tracking later
- ✅ Not trying to be Fort Knox

---

## 🔜 **Next Steps**

1. **Implement AuthProvider** (30 min)
2. **Create sign up page** (1-2 hours)
3. **Create sign in page** (1 hour)
4. **Update AssemblyGeneration** (1 hour)
5. **Test full flow** (1 hour)

**Total:** ~5-7 hours for complete auth integration

---

**Last Updated:** January 26, 2026  
**Status:** Architecture defined, ready to implement
