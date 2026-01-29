# 🏆 ELITE Code Quality Standards

**Purpose:** Non-negotiable code quality standards for MuniFlow  
**Audience:** Every AI agent and developer  
**Philosophy:** The best code comes from the least code  
**Last Updated:** January 2026

---

## 🎯 The Core Philosophy

### Less Code = Fewer Errors

- **Write less, achieve more** - Every line of code is a potential bug
- **Simplicity over complexity** - 20 lines beats 100 lines
- **Delete more than you add** - Refactor ruthlessly
- **Clear > Clever** - Readable code beats clever code

### The Embarrassment Test

> **"Would a senior developer at Google/Netflix/Airbnb be embarrassed to ship this?"**

If YES → Fix it. No exceptions.

---

## 📏 Size Limits (MANDATORY)

| File Type | Max Lines | Reason |
|-----------|-----------|--------|
| **Component** | 150 | Should be atomic, composable |
| **Hook** | 200 | Single responsibility principle |
| **Frontend API file** | 300 | One resource per file |
| **Frontend API function** | 30 | Simple HTTP wrapper |
| **Backend API** | 150 | Thin validation layer |
| **Service (atomic)** | 80 | One database operation |
| **Service (complex)** | 200 | Orchestration only |

**If file exceeds limit → Split it. No exceptions.**

---

## 🚫 Forbidden Practices

### 1. console.log (FORBIDDEN)

```typescript
// ❌ FORBIDDEN - Lost in production
console.log('User action');
console.error('Error:', error);
console.warn('Warning');

// ✅ REQUIRED - Structured logging
import { logger } from '@/lib/logger';

logger.info('User action', { userId, action: 'click' });
logger.error('Operation failed', { userId, error: error.message });
logger.warn('Deprecated endpoint called', { endpoint: req.url });
```

**Why:** Console logs don't reach monitoring tools. Must use `logger`.

**Current codebase:** 400+ console.log violations  
**Target:** 0 violations

---

### 2. any Types (TARGET: 0)

```typescript
// ❌ FORBIDDEN
function processData(data: any) { ... }
const result: any = await fetch();

// ✅ REQUIRED
function processData(data: UserData) { ... }
const result: UserResponse = await fetch();

// ✅ ACCEPTABLE (if truly dynamic)
function processJSON(data: unknown): UserData {
  if (isUserData(data)) {
    return data;
  }
  throw new Error('Invalid data shape');
}
```

**Why:** TypeScript without types = JavaScript with extra steps.

**Current codebase:** 1,000+ `any` violations  
**Target:** <10 per module

---

### 3. Multiple Boolean States (RACE CONDITIONS)

```typescript
// ❌ FORBIDDEN - Race conditions
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState(false);

// What if loading=true AND success=true?
// What if loading=false AND error exists?

// ✅ REQUIRED - Single status enum
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [data, setData] = useState<Data | null>(null);
const [error, setError] = useState<string | null>(null);

// Only ONE state can be active
```

**Why:** Multiple booleans create impossible states and race conditions.

---

### 4. Business Logic in Components (FORBIDDEN)

```typescript
// ❌ FORBIDDEN - Component has business logic
import { useAuth } from '@/app/providers/AuthProvider';
import { logger } from '@/lib/logger';

export function MyComponent() {
  const { user } = useAuth();  // ❌ Component knows about auth
  
  const handleClick = () => {
    logger.info('Clicked');  // ❌ Logging in component
    if (!user) {  // ❌ Business logic in component
      setShowModal(true);
    }
  };
}

// ✅ REQUIRED - Component is dumb
import { useMyFeature } from '@/modules/my-feature/hooks/useMyFeature';

export function MyComponent() {
  const { handleClick } = useMyFeature();  // ✅ Hook has logic
  
  return <Button onClick={handleClick}>Click</Button>;  // ✅ Just render
}
```

**Why:** Components should be pure presentation. Logic belongs in hooks.

---

### 5. Direct Database Queries in APIs (FORBIDDEN)

```typescript
// ❌ FORBIDDEN - Database query in API
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { data } = await supabase
    .from('deals')
    .select('*');
  
  return res.json(data);
}

// ✅ REQUIRED - Call service
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id;
  
  const result = await getDealsService(userId);
  
  return res.status(200).json({ success: true, data: result.data });
}
```

**Why:** APIs are for auth/validation. Services handle database logic.

---

## ✅ Required Patterns

### 1. Status Enum Pattern (MANDATORY for Hooks)

```typescript
// ✅ REQUIRED
type Status = 'idle' | 'loading' | 'success' | 'error';

const [status, setStatus] = useState<Status>('idle');
const [data, setData] = useState<Data | null>(null);
const [error, setError] = useState<string | null>(null);

// Usage:
{status === 'loading' && <Spinner />}
{status === 'success' && <Data data={data} />}
{status === 'error' && <ErrorMessage error={error} />}
```

---

### 2. ServiceResult Pattern (MANDATORY for Services)

```typescript
// ✅ REQUIRED
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function myService(
  userId: string
): Promise<ServiceResult<MyData>> {
  try {
    const { data, error } = await supabaseAdmin
      .from('table')
      .select('*');
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

---

### 3. Explicit Type Interfaces (MANDATORY)

**Hooks:**
```typescript
// ✅ REQUIRED
interface UseMyFeatureResult {
  data: MyData | null;
  status: Status;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyFeature(): UseMyFeatureResult {
  // ...
  return { data, status, error, refetch };
}
```

**Components:**
```typescript
// ✅ REQUIRED
interface MyComponentProps {
  data: MyData;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export function MyComponent({ data, onAction, isLoading }: MyComponentProps) {
  // ...
}
```

---

### 4. Middleware Wrapping (MANDATORY for Backend APIs)

```typescript
// ✅ REQUIRED
export default withRequestId(withApiAuth(handler));

// OR for deal-scoped
export default withRequestId(withDealAuth(handler));

// NEVER skip middleware
```

**Why:** 
- `withRequestId` - Audit trail (SOC 2 requirement)
- `withApiAuth` - Security (authentication check)

---

### 5. ZOD Validation (MANDATORY for Backend APIs)

```typescript
// ✅ REQUIRED
import { z } from 'zod';

const querySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

const bodySchema = z.object({
  name: z.string().min(3, 'Name too short'),
  email: z.string().email('Invalid email'),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const validation = querySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: validation.error.flatten(),
    });
  }
  
  const { id } = validation.data; // ✅ Validated
}
```

**Why:** Never trust user input. Always validate.

---

## 📋 Layer-Specific Standards

### Components (Layer 1)

**✅ ALLOWED:**
- Render JSX
- Local UI state (`useState` for open/closed, hover)
- Call hook functions
- Import other components
- Import types

**❌ FORBIDDEN:**
- Import from `lib/`
- Import `useAuth`
- Import `logger`
- Business logic
- API calls
- >150 lines

---

### Hooks (Layer 2)

**✅ ALLOWED:**
- State management
- Call Frontend APIs
- Call other hooks
- Use effects
- Import `logger`
- Import `useAuth`

**❌ FORBIDDEN:**
- Import from `lib/supabase`
- Direct database queries
- Render JSX
- >200 lines
- Multiple responsibilities

---

### Frontend APIs (Layer 3)

**✅ ALLOWED:**
- Import `getAuthHeaders` from `lib/auth`
- `fetch()` calls
- Throw errors

**❌ FORBIDDEN:**
- Business logic
- State management
- Import from `lib/db`
- >30 lines per function

---

### Backend APIs (Layer 4)

**✅ REQUIRED:**
- `withRequestId` wrapper
- `withApiAuth` wrapper
- ZOD validation
- Logger calls
- Service calls

**❌ FORBIDDEN:**
- Direct database queries
- `console.log`
- >150 lines
- No validation

---

### Services (Layer 5)

**✅ REQUIRED:**
- `ServiceResult<T>` return type
- userId as parameter
- Try-catch
- Supabase queries

**❌ FORBIDDEN:**
- Auth checks (that's middleware's job)
- HTTP requests
- Import from `modules/`
- >200 lines
- Throwing errors

---

## 🎓 TypeScript Standards

### Centralized Types (MANDATORY)

Every module MUST have:
```
modules/[module]/
  └── types/
      └── [module]Data.ts  ← ALL types here
```

**Example:**
```typescript
// modules/deals/types/dealData.ts
export interface Deal {
  id: string;
  name: string;
  created_at: string;
}

export interface CreateDealInput {
  name: string;
  description: string;
}

export type DealStatus = 'active' | 'closed' | 'archived';
```

---

### Type Guards for Unknown Data

```typescript
// When parsing JSON or third-party data
export function isDeal(data: unknown): data is Deal {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    typeof (data as Deal).id === 'string'
  );
}

// Usage
const data: unknown = JSON.parse(jsonString);
if (isDeal(data)) {
  // TypeScript now knows data is Deal
  console.log(data.name);
}
```

---

### Utility Types (USE THESE)

```typescript
// Create input type (omit auto-generated fields)
type CreateInput = Omit<Deal, 'id' | 'created_at'>;

// Create update type (partial + no ID change)
type UpdateInput = Partial<Omit<Deal, 'id'>>;

// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  total: number;
  hasMore: boolean;
}
```

---

## 🔍 Code Review Checklist

### Universal (Every File)

- [ ] No `console.log` (use `logger`)
- [ ] No `any` types (use specific types or `unknown`)
- [ ] File under size limit
- [ ] Proper imports (ordered correctly)
- [ ] JSDoc comments on exports
- [ ] Named exports (not default)

### Components

- [ ] Props interface defined
- [ ] No business logic
- [ ] No `lib/` imports
- [ ] No auth checking
- [ ] <150 lines

### Hooks

- [ ] Explicit return type interface
- [ ] Uses status enum (not multiple booleans)
- [ ] Calls Frontend API (not `lib/`)
- [ ] Try-catch on async
- [ ] <200 lines

### Frontend APIs

- [ ] Uses `getAuthHeaders()`
- [ ] `credentials: 'same-origin'`
- [ ] Checks `!response.ok`
- [ ] Typed return values
- [ ] <30 lines per function

### Backend APIs

- [ ] `withRequestId` wrapper
- [ ] `withApiAuth` wrapper
- [ ] ZOD validation schema
- [ ] Method check
- [ ] Calls service (no direct DB)
- [ ] <150 lines

### Services

- [ ] `ServiceResult<T>` return type
- [ ] userId as parameter
- [ ] Try-catch
- [ ] <200 lines
- [ ] No auth checks

---

## 🚨 Common Violations Found

Based on codebase analysis:

| Violation | Count | Target | Priority |
|-----------|-------|--------|----------|
| `console.log` statements | 400+ | 0 | HIGH |
| `any` types | 1,000+ | <10/module | HIGH |
| Components >150 lines | 20+ | 0 | MEDIUM |
| Hooks >200 lines | 10+ | 0 | MEDIUM |
| APIs without `withRequestId` | 14 | 0 | CRITICAL |
| Direct DB queries in APIs | 8 | 0 | CRITICAL |

---

## ✅ Production-Ready Definition

Code is "production-ready" when:

- ✅ No linter errors
- ✅ All size limits met
- ✅ All forbidden patterns removed
- ✅ All required patterns implemented
- ✅ TypeScript strict mode passing
- ✅ Would pass senior developer review

**If ANY item fails → Not production-ready**

---

## 🎯 Migration Strategy

### High Priority (This Month)

1. **Replace all `console.log` with `logger`**
   - Find: `grep -r "console.log" .`
   - Replace: Import `logger` from `@/lib/logger`
   - Time: 2 hours

2. **Add missing middleware to backend APIs**
   - Find: APIs without `withRequestId`
   - Fix: Wrap with `withRequestId(withApiAuth(...))`
   - Time: 30 minutes

3. **Move direct DB queries to services**
   - Find: `grep -r "supabase.from" pages/api/`
   - Fix: Extract to service in `lib/services/`
   - Time: 2 hours

### Medium Priority (This Quarter)

4. **Split large hooks >200 lines**
   - Find files with `wc -l`
   - Split into focused hooks
   - Time: 1 hour per hook

5. **Split large components >150 lines**
   - Find files with `wc -l`
   - Break into atomic components
   - Time: 1 hour per component

6. **Add centralized types per module**
   - Create `types/[module]Data.ts`
   - Define all interfaces
   - Time: 2 hours per module

### Ongoing

7. **Reduce `any` types**
   - Target: <10 per module
   - Use specific types or `unknown`
   - Add type guards

---

## 📖 Quick Reference

### File Structure
```
modules/[module]/
├── types/
│   └── [module]Data.ts     ← All types
├── hooks/
│   └── use[Feature].ts      ← <200 lines, status enum
├── components/
│   └── [Component].tsx      ← <150 lines, dumb UI
└── api/
    └── [resource]Api.ts     ← <30 lines/function
```

### Import Order
```typescript
// 1. React
import React, { useState } from 'react';

// 2. External libraries
import { z } from 'zod';

// 3. Internal absolute
import { Button } from '@/components/ui/Button';

// 4. Relative
import { useMyHook } from '../hooks/useMyHook';

// 5. Types
import type { MyType } from '../types';
```

### Naming Conventions
```
Components:    PascalCase     (DealCard.tsx)
Hooks:         camelCase      (useDeal.ts)
Services:      camelCase      (getDealService.ts)
APIs:          camelCase      (dealApi.ts)
Types:         PascalCase     (DealData.ts)
```

---

## 🎯 The Professional Standard

Ask yourself:

> "If I was interviewing at a top tech company and they reviewed this code, would they hire me?"

If NO because:
- ❌ Hook has 500 lines (should be <200)
- ❌ Component has business logic (should be dumb)
- ❌ Using `console.log` (should use `logger`)
- ❌ Using `any` types (should be specific)
- ❌ Multiple boolean states (should be status enum)

**Then FIX IT. That's the job.**

---

**Remember:** ELITE standards aren't about perfection. They're about **professional-grade code that won't embarrass you in a code review**.
