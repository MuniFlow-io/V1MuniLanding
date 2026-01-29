# 🤖 AI Agent Quick Start Guide

**Purpose:** 5-minute orientation for new AI agents  
**Read this FIRST, then dive into detailed docs**

---

## ⚡ The 5-Minute Brief

### What is MuniFlow?

A conversation-first platform for municipal bond financing teams. Not a document generator - a workflow tool.

**Read:** `company-context.md` for full context.

---

### The Architecture (5 Layers)

```
Component (Dumb)     ← Render UI only
    ↓
Hook (Smart)         ← State + business logic
    ↓
Frontend API (HTTP)  ← fetch() wrappers
    ↓
Backend API (Auth)   ← Security + validation
    ↓
Service (DB)         ← Database queries
```

**Read:** `FRONTEND-ARCHITECTURE.md` or `BACKEND-ARCHITECTURE.md` depending on your task.

---

### The Rules (Non-Negotiable)

**Size Limits:**
- Components: <150 lines
- Hooks: <200 lines
- Services: <200 lines

**Forbidden:**
- ❌ `console.log` → Use `logger`
- ❌ `any` types → Use specific types
- ❌ Multiple booleans → Use status enum
- ❌ Logic in components → Move to hooks
- ❌ DB queries in APIs → Move to services

**Required:**
- ✅ Status enum pattern in hooks
- ✅ ServiceResult<T> in services
- ✅ ZOD validation in backend APIs
- ✅ `withRequestId(withApiAuth(...))` on APIs

**Read:** `ELITE-STANDARDS.md` for complete list.

---

## 🎯 Your First Task Checklist

### Building a Component?

1. ✅ Read `FRONTEND-ARCHITECTURE.md` (Layer 1 section)
2. ✅ Check `COMPONENT-CATALOG.md` - Does it already exist?
3. ✅ Check `COLOR-STRATEGY.md` - Use brand colors
4. ✅ Follow template: Props interface, no logic, <150 lines
5. ✅ Test: No glitches, responsive, accessible

### Building a Hook?

1. ✅ Read `FRONTEND-ARCHITECTURE.md` (Layer 2 section)
2. ✅ Use status enum (not multiple booleans)
3. ✅ Call Frontend API (not `lib/` directly)
4. ✅ Add explicit return type interface
5. ✅ <200 lines total

### Building a Backend API?

1. ✅ Read `BACKEND-ARCHITECTURE.md` (The 11 Steps)
2. ✅ Copy the template
3. ✅ Add `withRequestId(withApiAuth(handler))`
4. ✅ Add ZOD validation
5. ✅ Call service (no direct DB queries)
6. ✅ <150 lines total

### Building a Service?

1. ✅ Read `BACKEND-ARCHITECTURE.md` (Layer 5 section)
2. ✅ Return `ServiceResult<T>`
3. ✅ Accept `userId` as parameter (no auth checks)
4. ✅ Try-catch with error handling
5. ✅ <200 lines total

---

## 🚨 Common Mistakes (Avoid These)

### 1. Putting Business Logic in Components

```tsx
// ❌ WRONG
export function MyComponent() {
  const { user } = useAuth(); // ❌ Component knows about auth
  if (!user) { ... } // ❌ Business logic
}

// ✅ RIGHT
export function MyComponent() {
  const { handleClick } = useMyFeature(); // ✅ Hook has logic
  return <Button onClick={handleClick} />; // ✅ Just render
}
```

### 2. Using Multiple Booleans Instead of Status

```tsx
// ❌ WRONG - Race conditions
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);

// ✅ RIGHT - Single source of truth
const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
```

### 3. Direct DB Queries in APIs

```tsx
// ❌ WRONG
async function handler(req, res) {
  const { data } = await supabase.from('deals').select('*');
  return res.json(data);
}

// ✅ RIGHT
async function handler(req, res) {
  const result = await getDealsService(req.user.id);
  return res.status(200).json({ success: true, data: result.data });
}
```

### 4. Using console.log

```tsx
// ❌ WRONG
console.log('Something happened');

// ✅ RIGHT
import { logger } from '@/lib/logger';
logger.info('Something happened', { context });
```

---

## 📚 The Reading Order

### Day 1: Core Understanding (15 minutes)
1. `company-context.md` - Product vision
2. `ELITE-STANDARDS.md` - Quality rules
3. `FRONTEND-ARCHITECTURE.md` OR `BACKEND-ARCHITECTURE.md`

### Day 1: Start Building
- Use templates from architecture docs
- Reference other docs as needed

### Ongoing: Deep Dives
- `AUTHENTICATION-GUIDE.md` when touching auth
- `DATABASE-SCHEMA.md` when querying database
- `COMPONENT-CATALOG.md` before building new UI

---

## ✅ Success Indicators

**You understand the architecture when you can answer:**

- Where does auth checking belong? → **Hook (UX) + Middleware (security)**
- Where do database queries go? → **Services only**
- What's the size limit for hooks? → **200 lines**
- Should I use `console.log`? → **NO - use logger**
- Can components import from `lib/`? → **NO**
- What's the status pattern? → **Enum, not multiple booleans**

**If you can answer all 6 → You're ready to code!**

---

## 🎯 Your Mission

Build production-grade code that:
- ✅ Wouldn't embarrass a senior developer
- ✅ Follows ELITE standards
- ✅ Has clear separation of concerns
- ✅ Is maintainable long-term

**Remember:** The best code comes from the least code.

---

**Now go read the Essential 4 docs and start building!** 🚀
