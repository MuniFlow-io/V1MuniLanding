# Authentication Guide

**Purpose:** How authentication works in MuniFlow and where auth logic belongs  
**Last Updated:** January 2026

---

## 🎯 Authentication Strategy

### Cookie-Based Authentication with Supabase

MuniFlow uses **Supabase Auth** with **cookie-based sessions** for authentication across the entire application.

**Key Benefits:**
- ✅ Works automatically across entire domain
- ✅ HTTP-only cookies (secure, JavaScript can't access)
- ✅ Same-site CSRF protection
- ✅ No manual token management
- ✅ Supabase handles all complexity

---

## 🏗️ Where Auth Logic Belongs

Auth logic appears in **exactly 3 places**, each serving a different purpose:

### 1. Backend Middleware (`withApiAuth`)

**Purpose:** Security - Protect API endpoints  
**When:** User MUST be authenticated to use this endpoint

**File:** `lib/auth/withApiAuth.ts`

```typescript
export function withApiAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // 1. Read session cookie from request
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // 2. Check if valid
    if (error || !session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 3. Attach user to request
    req.user = { id: session.user.id, email: session.user.email };
    
    // 4. Call handler
    return handler(req, res);
  };
}
```

**Usage:**
```typescript
// pages/api/bond-generator/generate.ts
export default withApiAuth(handler);
// If user is NOT authenticated → Returns 401 before handler runs
// If user IS authenticated → Handler receives req.user with real data
```

---

### 2. Frontend Hook (UX Layer)

**Purpose:** Better UX - Show appropriate UI before API call  
**When:** Need to check auth before calling API

```typescript
// modules/bond-generator/hooks/useAssemblyGeneration.ts
export function useAssemblyGeneration() {
  const { user } = useAuth();  // ✅ Hook CAN import auth
  
  const handleGenerate = () => {
    // ✅ Hook checks auth for better UX
    if (!user) {
      logger.info('Generate clicked without auth');
      setShowAccountGate(true);  // Show modal instead of API error
      return;
    }
    
    // User is authenticated, call API
    onGenerate();
  };
  
  return { handleGenerate };
}
```

**Why check in both frontend AND backend?**
- **Frontend check:** Better UX (show modal instead of error)
- **Backend check:** Security (can't bypass with browser dev tools)

---

### 3. Frontend Component (❌ NEVER)

**Components should NOT check auth directly.**

```typescript
// ❌ WRONG - Component checks auth
import { useAuth } from '@/app/providers/AuthProvider';

export function AssemblyGeneration() {
  const { user } = useAuth();  // ❌ Component shouldn't know about auth
  
  const handleGenerate = () => {
    if (!user) {  // ❌ Business logic in component
      setShowModal(true);
      return;
    }
    onGenerate();
  };
}

// ✅ CORRECT - Component is dumb
import { useAssemblyGeneration } from '@/modules/.../useAssemblyGeneration';

export function AssemblyGeneration() {
  const { handleGenerate } = useAssemblyGeneration();  // ✅ Hook has logic
  
  return <Button onClick={handleGenerate}>Generate</Button>;  // ✅ Just render
}
```

---

## 🔄 Complete Auth Flow

### User Signup → Bond Generation

```
1. USER CLICKS "GENERATE BONDS" (not authenticated)
   Component: <Button onClick={handleGenerate}>
   
2. HOOK CHECKS AUTH (Frontend)
   Hook: if (!user) { setShowAccountGate(true); return; }
   → Shows nice modal instead of error
   
3. USER CLICKS "SIGN UP"
   → Redirects to /signup
   
4. USER SUBMITS SIGNUP FORM
   → Frontend: await authApi.signUp(email, password)
   → Backend: POST /api/auth/signup
   → Supabase: Creates user + sets cookie
   → Redirects back to bond generator
   
5. USER CLICKS "GENERATE BONDS" (now authenticated)
   Hook: user exists → Proceeds
   → Calls onGenerate()
   
6. API REQUEST SENT
   Browser: POST /api/bond-generator/generate
   Browser: Cookie: sb-xxx-auth-token (automatic)
   
7. BACKEND MIDDLEWARE CHECKS AUTH
   Middleware: Validate session with Supabase
   Middleware: If invalid → 401
   Middleware: If valid → Attach req.user
   
8. HANDLER EXECUTES
   Handler: Uses req.user.id for database queries
   Handler: Generates bonds
   Handler: Returns ZIP file
```

---

## 📁 Auth File Structure

```
lib/auth/
├── supabaseServer.ts        - Server-side Supabase client
├── withApiAuth.ts            - Backend middleware (protect APIs)
└── getAuthHeaders.ts         - Get auth headers for fetch calls

app/providers/
└── AuthProvider.tsx          - Frontend auth context (state only)

modules/auth/
├── hooks/
│   ├── useSignUp.ts         - Sign up logic
│   └── useSignIn.ts         - Sign in logic
└── api/
    └── authApi.ts            - Frontend API (HTTP wrapper)

pages/api/auth/
├── signup.ts                 - Backend: Create user
├── signin.ts                 - Backend: Authenticate user
├── signout.ts                - Backend: Clear session
└── session.ts                - Backend: Get current session
```

---

## 🔐 Implementation Patterns

### Frontend: Auth Provider (State Only)

```typescript
// app/providers/AuthProvider.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Listen to Supabase session changes
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Note:** AuthProvider is NOT middleware - it's a state synchronization layer that exposes current user state to components.

---

### Backend: Protect API Endpoints

```typescript
// pages/api/bond-generator/generate.ts
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  logger.info('Generate request', { userId: req.user.id });
  
  const result = await generateBondsService(req.user.id, files);
  
  return res.json(result);
}

export default withApiAuth(handler);  // ← Wraps with auth check
```

---

### Frontend: Get Auth Headers for API Calls

```typescript
// lib/auth/getAuthHeaders.ts
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return {};  // No session, return empty (backend will reject)
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
  };
}

// modules/bond-generator/api/bondGeneratorApi.ts
export async function generateBondsApi(files: Files) {
  const headers = await getAuthHeaders();  // ← Get auth headers
  
  const response = await fetch('/api/bond-generator/generate', {
    method: 'POST',
    headers,
    body: formData,
  });
  
  return response.json();
}
```

---

## ⚠️ Common Pitfalls

### 1. Wrong Supabase Client in Backend

```typescript
// ❌ WRONG - Using client-side Supabase in backend API
import { supabase } from '@/lib/supabase';  // Client-side

const { session } = await supabase.auth.getSession();
// This won't work - no window.localStorage on server!

// ✅ CORRECT - Use server-side client
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const supabaseServer = createServerSupabaseClient({ req, res });
const { session } = await supabaseServer.auth.getSession();
```

### 2. Auth Logic in Components

```typescript
// ❌ WRONG
export function MyComponent() {
  const { user } = useAuth();
  if (!user) return <LoginPrompt />;
  // ...
}

// ✅ CORRECT - Move to hook or use route protection
```

### 3. Forgetting to Reset Preview Count After Signup

```typescript
// ✅ CORRECT
import { resetPreviewCount } from '@/lib/previewLimiter';

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    resetPreviewCount();  // ← Don't forget this!
  }
});
```

---

## 🎯 Quick Reference

| Task | Location | Use |
|------|----------|-----|
| Protect API endpoint | Backend middleware | `withApiAuth()` |
| Check auth for UX | Frontend hook | `useAuth()` |
| Get current user | Component | `useAuth()` (display only) |
| Sign up user | Frontend | `authApi.signUp()` |
| Sign in user | Frontend | `authApi.signIn()` |
| Add auth headers | Frontend API | `getAuthHeaders()` |

---

## 📚 Session Management

### Cookie Details

- **Access token:** 1 hour (refreshes automatically)
- **Refresh token:** 30 days
- **Cookie:** HTTP-only, secure, same-site
- **Domain:** Entire site (all routes)

### What This Means

- User signs up → Authenticated for 30 days
- User closes browser → Still authenticated when returns
- After 30 days → Must sign in again
- Can configure in Supabase dashboard

---

**Remember:** Auth should be checked in **TWO places** (frontend hook for UX + backend middleware for security), but **NEVER in components** (they should be dumb and just render).
