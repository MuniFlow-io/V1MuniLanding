# 🎨 Frontend Architecture Guide

**Purpose:** Complete frontend development standards for MuniFlow  
**Audience:** AI agents and developers working on hooks, components, and frontend APIs  
**Last Updated:** January 2026

---

## 🧠 The Frontend Team Mindset

### You Are the Frontend Team

When working in `app/`, `components/`, or `modules/**/hooks/`:

**Your ONLY responsibilities:**
- ✅ Components render perfectly (no glitches)
- ✅ Hooks manage state correctly (no race conditions)
- ✅ UI responds smoothly (no blocking)
- ✅ Error states are clear (no confusion)
- ✅ Loading states work (no flickering)

**NOT your responsibilities:**
- ❌ Backend data being wrong (backend team's job)
- ❌ API errors (backend team's job)
- ❌ Database queries slow (backend team's job)
- ❌ Auth failing (security team's job)

---

## 🏗️ The 3-Layer Frontend Architecture

```
┌─────────────────────────────────────┐
│  LAYER 1: Components (Dumb UI)      │
│  - Pure presentation                │
│  - Props in, callbacks out          │
│  - No business logic                │
│  - Max 150 lines                    │
└─────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────┐
│  LAYER 2: Hooks (Smart Logic)       │
│  - State management                 │
│  - Business logic                   │
│  - Calls Frontend APIs              │
│  - Max 200 lines                    │
└─────────────────────────────────────┘
              ↓ calls
┌─────────────────────────────────────┐
│  LAYER 3: Frontend APIs (HTTP)      │
│  - fetch() wrappers                 │
│  - Auth headers                     │
│  - No business logic                │
│  - Max 30 lines per function        │
└─────────────────────────────────────┘
```

**Key Principle:** Each layer has ONE job. Don't mix concerns.

---

## 📏 Layer 1: Components (Dumb UI)

### Purpose
Pure presentation - render UI based on props, no logic.

### The Embarrassment Test

> "Would a professional frontend developer at Google/Netflix/Airbnb be embarrassed to ship this?"

**Embarrassing component issues:**
- ❌ Button changes color 3 times when clicked
- ❌ Component renders half off screen
- ❌ Form resets unexpectedly
- ❌ Modal flickers when opening
- ❌ Page blocks when saving

### Component Template

```tsx
/**
 * [Component Name]
 * [Brief description of what this displays]
 */

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import type { YourType } from '../types';

interface YourComponentProps {
  data: YourType;
  onAction: (id: string) => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export function YourComponent({ 
  data, 
  onAction, 
  isLoading = false,
  children 
}: YourComponentProps) {
  // Local UI state ONLY (accordion open/closed, hover, etc.)
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Event handlers
  const handleClick = () => onAction(data.id);
  
  // Render
  return (
    <div className="...">
      <h2>{data.title}</h2>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </Button>
      {children}
    </div>
  );
}
```

### Component Rules

**✅ Components CAN:**
- Render JSX based on props
- Have local UI state (`useState` for open/closed, hover, etc.)
- Call prop callbacks
- Import other components
- Import types
- Import constants

**❌ Components CANNOT:**
- Import hooks (except useState/useCallback for local UI)
- Import from `lib/`
- Fetch data
- Have business logic
- Be >150 lines
- Use `any` types

### Size Limits

```
Atoms (Button, Input):        5-30 lines
Molecules (FormField):        30-80 lines
Organisms (Card, Modal):      80-150 lines

If >150 lines → Split into smaller components
```

---

## 📏 Layer 2: Hooks (Smart Logic)

### Purpose
State management, business logic, API orchestration.

### The Status Enum Pattern (MANDATORY)

**❌ OLD WAY (Race conditions):**
```tsx
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState(null);

// ❌ Multiple booleans = race conditions
// What if loading=true AND success=true?
// What if loading=false AND error exists?
```

**✅ NEW WAY (Single source of truth):**
```tsx
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [data, setData] = useState<YourType | null>(null);
const [error, setError] = useState<string | null>(null);

// ✅ Only ONE state can be active
// status === 'loading' → Show spinner
// status === 'success' → Show data
// status === 'error' → Show error message
```

### Hook Template

```tsx
/**
 * Hook for managing [feature]
 * @param [paramName] - Description
 * @returns State and actions for [feature]
 */

import { useState, useEffect, useCallback } from 'react';
import { yourApi } from '../api/yourApi';
import { logger } from '@/lib/logger';
import type { YourType } from '../types';

interface UseYourFeatureResult {
  data: YourType | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  refetch: () => Promise<void>;
  doAction: (input: string) => Promise<void>;
}

export function useYourFeature(id: string): UseYourFeatureResult {
  // State
  const [data, setData] = useState<YourType | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Fetch function
  const fetchData = useCallback(async () => {
    try {
      setStatus('loading');
      setError(null);
      
      const result = await yourApi.getData(id);
      
      setData(result);
      setStatus('success');
      
      logger.info('Data fetched successfully', { id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      
      logger.error('Failed to fetch data', { id, error: errorMessage });
    }
  }, [id]);
  
  // Load on mount
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);
  
  // Action function
  const doAction = useCallback(async (input: string) => {
    try {
      setStatus('loading');
      
      await yourApi.doAction(id, input);
      
      // Refetch after action
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      setError(errorMessage);
      setStatus('error');
      
      logger.error('Action failed', { id, input, error: errorMessage });
    }
  }, [id, fetchData]);
  
  return {
    data,
    status,
    error,
    refetch: fetchData,
    doAction,
  };
}
```

### Hook Rules

**✅ Hooks CAN:**
- Manage state (`useState`, `useReducer`)
- Call Frontend APIs
- Call other hooks
- Use effects
- Transform/format data
- Handle errors
- Log with `logger`

**❌ Hooks CANNOT:**
- Import from `lib/` (except `lib/logger`)
- Call Supabase directly
- Render JSX
- Be >200 lines
- Have multiple responsibilities
- Use `console.log`

### Common Hook Patterns

**1. Data Fetching:**
```tsx
export function useData(id: string) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setData] = useState<Data | null>(null);
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  return { data, status };
}
```

**2. Form Handling:**
```tsx
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async () => {
    setStatus('submitting');
    // ... submit logic
  };
  
  return { values, handleChange, handleSubmit, status };
}
```

**3. Optimistic Updates:**
```tsx
export function useOptimisticAction() {
  const [items, setItems] = useState<Item[]>([]);
  
  const addItem = async (newItem: Item) => {
    // Optimistically add
    setItems(prev => [...prev, newItem]);
    
    try {
      await api.addItem(newItem);
    } catch (err) {
      // Rollback on error
      setItems(prev => prev.filter(item => item.id !== newItem.id));
      throw err;
    }
  };
  
  return { items, addItem };
}
```

---

## 📏 Layer 3: Frontend APIs (HTTP Client)

### Purpose
Thin HTTP wrapper - just fetch() with auth headers.

### Frontend API Template

```tsx
/**
 * Frontend API for [resource]
 * HTTP client for calling backend endpoints
 */

import { getAuthHeaders } from '@/lib/auth/getAuthHeaders';
import type { YourType, CreateInput } from '../types';

export const yourApi = {
  /**
   * Get [resource] by ID
   */
  async getData(id: string): Promise<YourType> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`/api/your-resource/${id}`, {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Create new [resource]
   */
  async create(input: CreateInput): Promise<YourType> {
    const headers = await getAuthHeaders();
    
    const response = await fetch('/api/your-resource', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
};
```

### Frontend API Rules

**✅ APIs CAN:**
- Import `getAuthHeaders` from `lib/auth`
- Make `fetch()` calls
- Check HTTP status codes
- Throw errors
- Return typed JSON

**❌ APIs CANNOT:**
- Have business logic
- Retry logic (handle in hook if needed)
- State management
- Call other APIs
- Import from `lib/db` or `lib/supabase`
- Be >30 lines per function

### Required Elements

Every API call MUST have:
```tsx
✅ const headers = await getAuthHeaders();
✅ credentials: 'same-origin'
✅ if (!response.ok) throw new Error(...)
✅ Type return value
```

---

## 🎯 State Management Patterns

### 1. Status Enum (Primary Pattern)

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error';

const [status, setStatus] = useState<Status>('idle');

// Usage
{status === 'loading' && <Spinner />}
{status === 'success' && <Data />}
{status === 'error' && <ErrorMessage />}
```

### 2. Discriminated Union (Advanced)

```tsx
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };

const [state, setState] = useState<State>({ status: 'idle' });

// TypeScript knows which properties exist
if (state.status === 'success') {
  console.log(state.data); // ✅ TypeScript knows data exists
}
```

### 3. Separate Data State

```tsx
const [status, setStatus] = useState<Status>('idle');
const [data, setData] = useState<Data | null>(null);
const [error, setError] = useState<string | null>(null);

// Clear pattern:
// - status: What's happening right now
// - data: The actual data (if loaded)
// - error: Error message (if failed)
```

---

## 🚨 Common Pitfalls & Fixes

### Pitfall 1: Race Conditions

**❌ Problem:**
```tsx
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  const result = await api.getData();
  setData(result);
  // ❌ Forgot to set loading = false!
};
```

**✅ Solution:**
```tsx
const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

const fetchData = async () => {
  try {
    setStatus('loading');
    const result = await api.getData();
    setData(result);
    setStatus('success');
  } catch (err) {
    setStatus('error');
  }
};
```

### Pitfall 2: Stale Closure

**❌ Problem:**
```tsx
useEffect(() => {
  fetchData(id); // Uses stale id
}, []); // ❌ Missing dependency
```

**✅ Solution:**
```tsx
useEffect(() => {
  fetchData(id);
}, [id]); // ✅ Include all dependencies
```

### Pitfall 3: Unmounted State Updates

**❌ Problem:**
```tsx
useEffect(() => {
  fetchData().then(data => {
    setData(data); // ❌ Might update after unmount
  });
}, []);
```

**✅ Solution:**
```tsx
useEffect(() => {
  let cancelled = false;
  
  fetchData().then(data => {
    if (!cancelled) {
      setData(data);
    }
  });
  
  return () => {
    cancelled = true;
  };
}, []);
```

### Pitfall 4: Button Stays Disabled

**❌ Problem:**
```tsx
const [submitted, setSubmitted] = useState(false);

const handleSubmit = async () => {
  setSubmitted(true);
  await api.submit();
  // ❌ Never resets submitted!
};

return <button disabled={submitted}>Submit</button>;
// Button stays disabled forever after first click
```

**✅ Solution:**
```tsx
const [status, setStatus] = useState<'idle' | 'submitting'>('idle');

const handleSubmit = async () => {
  try {
    setStatus('submitting');
    await api.submit();
    setStatus('idle'); // ✅ Resets after success
  } catch (err) {
    setStatus('idle'); // ✅ Resets after error too
  }
};

return <button disabled={status === 'submitting'}>Submit</button>;
```

---

## 📋 Frontend Checklist

### Before Committing a Component

- [ ] <150 lines total
- [ ] Props interface defined (no inline types)
- [ ] No `any` types
- [ ] No hooks imported (except useState for local UI)
- [ ] No `lib/` imports
- [ ] Named export (not default)
- [ ] No business logic
- [ ] Renders without glitching

### Before Committing a Hook

- [ ] <200 lines total
- [ ] Explicit return type interface
- [ ] Single responsibility
- [ ] Uses status enum (not multiple booleans)
- [ ] All async wrapped in try-catch
- [ ] Uses `logger` (not `console.log`)
- [ ] Calls Frontend API (not `lib/`)
- [ ] No race conditions

### Before Committing Frontend API

- [ ] Uses `getAuthHeaders()`
- [ ] `credentials: 'same-origin'`
- [ ] Checks `!response.ok`
- [ ] Typed return values
- [ ] <30 lines per function
- [ ] JSDoc comments
- [ ] No business logic

---

## 🎓 Key Principles

### 1. Separation of Concerns

- **Component:** How it looks
- **Hook:** What it does
- **API:** How it talks to backend

Don't mix these!

### 2. Single Responsibility

Each hook should do ONE thing:
- ✅ `useAuth` - Authentication only
- ✅ `useProfile` - Profile data only
- ❌ `useEverything` - Auth + Profile + Settings + ...

### 3. Status Over Booleans

Always prefer:
```tsx
status: 'loading' | 'success' | 'error'
```

Over:
```tsx
loading: boolean
success: boolean
error: boolean
```

### 4. Props Over Context

Pass props explicitly unless:
- Used by >5 deeply nested components
- Truly global (theme, auth)
- Changes rarely

### 5. Local State Over Global

Keep state as local as possible:
- UI state → Component
- Feature state → Hook
- Global state → Context (rare)

---

**Remember:** You're the frontend team. Your job is making the UI perfect, not fixing backend data. If data is wrong, note it for the backend team. If the UI glitches, that's on you.
