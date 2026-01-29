# Component Architecture Guide

**Date:** January 27, 2026  
**Purpose:** Define where logic belongs in our 5-layer architecture

---

## 🎯 **The Golden Rule**

**Components are DUMB. Hooks are SMART.**

---

## 📋 **The 5 Layers (Quick Reference)**

```
[1] Component (DUMB)
     ↓ calls
[2] Hook (SMART)
     ↓ calls
[3] Frontend API
     ↓ HTTP
[4] Backend API
     ↓ calls
[5] Service Layer
```

---

## 🔴 **What Components Should NOT Have**

### **❌ NO Direct Imports of Infrastructure**

```typescript
// ❌ WRONG - Component imports infrastructure
import { logger } from '@/lib/logger';
import { useAuth } from '@/app/providers/AuthProvider';
import { previewLimiter } from '@/lib/previewLimiter';

export function MyComponent() {
  const { user } = useAuth();  // ❌ Business logic in component
  logger.info('Something happened');  // ❌ Logging in component
  
  if (!user) {
    // ❌ Auth checking in component
  }
}
```

### **❌ NO Business Logic**

```typescript
// ❌ WRONG - Component has business logic
export function MyComponent() {
  const handleClick = () => {
    if (!hasPreviewsRemaining()) {  // ❌ Business logic
      setShowModal(true);
    }
  };
}
```

### **❌ NO API Calls**

```typescript
// ❌ WRONG - Component makes API calls
export function MyComponent() {
  const handleSubmit = async () => {
    const response = await fetch('/api/something');  // ❌ API call in component
    const data = await response.json();
  };
}
```

### **❌ NO Logging**

```typescript
// ❌ WRONG - Component does logging
export function MyComponent() {
  const handleClick = () => {
    logger.info('Button clicked');  // ❌ Logging in component
  };
}
```

---

## ✅ **What Components SHOULD Have**

### **✅ ONLY UI Rendering**

```typescript
// ✅ CORRECT - Component is dumb
import { Button } from '@/components/ui/Button';
import { useMyFeature } from '@/modules/my-feature/hooks/useMyFeature';

export function MyComponent() {
  // Call the hook (all logic is in the hook)
  const { 
    data, 
    isLoading, 
    handleClick 
  } = useMyFeature();
  
  // Just render based on hook state
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Button onClick={handleClick}>
          {data?.label || 'Click me'}
        </Button>
      )}
    </div>
  );
}
```

### **✅ ONLY UI State (Show/Hide Modals, etc.)**

```typescript
// ✅ CORRECT - Only UI state
export function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);  // ✅ UI state
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Open</Button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
```

**Wait, didn't we just move modal state to the hook?** 

**Yes, because the modal is triggered by BUSINESS LOGIC (auth check, preview limit).**

**Rule:** If the modal appears because of business logic → hook controls it
**Rule:** If the modal appears only for UI reasons (user clicks "Settings") → component controls it

---

## 🧠 **What Hooks SHOULD Have**

### **✅ ALL Business Logic**

```typescript
// ✅ CORRECT - Hook has all logic
export function useMyFeature() {
  const { user } = useAuth();  // ✅ Hook can import auth
  const [data, setData] = useState(null);
  
  const handleClick = async () => {
    // ✅ Auth checking in hook
    if (!user) {
      logger.warn('Unauthorized action attempted');  // ✅ Logging in hook
      return;
    }
    
    // ✅ Business logic in hook
    if (!hasPermission(user)) {
      return;
    }
    
    // ✅ API call in hook
    const result = await myApi.doSomething();
    setData(result);
  };
  
  return { data, handleClick };
}
```

### **✅ ALL Infrastructure Imports**

```typescript
// ✅ CORRECT - Hook imports infrastructure
import { useAuth } from '@/app/providers/AuthProvider';
import { logger } from '@/lib/logger';
import { myApi } from '@/modules/my-feature/api/myApi';
import { hasPermission } from '@/lib/permissions';

export function useMyFeature() {
  // Hook can use all of these
  const { user } = useAuth();
  
  useEffect(() => {
    logger.info('Feature mounted', { userId: user?.id });
  }, [user]);
  
  // ...
}
```

### **✅ ALL State Management (Except Pure UI State)**

```typescript
// ✅ CORRECT - Hook manages all business state
export function useMyFeature() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAccountGate, setShowAccountGate] = useState(false);  // Business logic modal
  
  // Hook controls when account gate shows (based on auth check)
  const handleAction = () => {
    if (!user) {
      setShowAccountGate(true);  // Hook decides this
    }
  };
  
  return { 
    data, 
    isLoading, 
    error, 
    showAccountGate,  // Component just renders based on this
    closeAccountGate: () => setShowAccountGate(false),
  };
}
```

---

## 🏗️ **Real Example: Assembly Generation**

### **❌ BEFORE (Wrong - Logic in Component)**

```typescript
// components/bond-generator/AssemblyGeneration.tsx
import { useAuth } from '@/app/providers/AuthProvider';  // ❌
import { logger } from '@/lib/logger';  // ❌
import { previewLimiter } from '@/lib/previewLimiter';  // ❌

export function AssemblyGeneration({ bonds, onGenerate }) {
  const { user } = useAuth();  // ❌ Component knows about auth
  
  const handlePreview = async () => {
    // ❌ Auth checking in component
    if (!user && !hasPreviewsRemaining()) {
      logger.info('Preview limit reached');  // ❌ Logging in component
      setShowGate(true);
      return;
    }
    
    // ❌ API call in component
    const response = await fetch('/api/preview', { ... });
    
    // ❌ Business logic in component
    if (!user) {
      incrementPreviewCount();
    }
  };
  
  const handleGenerate = () => {
    // ❌ Auth checking in component
    if (!user) {
      logger.info('No auth');  // ❌ Logging in component
      setShowGate(true);
      return;
    }
    
    onGenerate();  // ✅ This part is fine
  };
  
  return <Button onClick={handleGenerate}>Generate</Button>;
}
```

### **✅ AFTER (Correct - Logic in Hook)**

```typescript
// modules/bond-generator/hooks/useAssemblyGeneration.ts
import { useAuth } from '@/app/providers/AuthProvider';  // ✅ Hook imports
import { logger } from '@/lib/logger';  // ✅
import { previewLimiter } from '@/lib/previewLimiter';  // ✅

export function useAssemblyGeneration({ bonds, onGenerate }) {
  const { user } = useAuth();  // ✅ Hook uses auth
  const [showGate, setShowGate] = useState(false);
  
  const handlePreview = async () => {
    // ✅ Auth checking in hook
    if (!user && !hasPreviewsRemaining()) {
      logger.info('Preview limit reached');  // ✅ Logging in hook
      setShowGate(true);
      return;
    }
    
    // ✅ API call in hook
    const response = await fetch('/api/preview', { ... });
    
    // ✅ Business logic in hook
    if (!user) {
      incrementPreviewCount();
    }
  };
  
  const handleGenerate = () => {
    // ✅ Auth checking in hook
    if (!user) {
      logger.info('No auth');  // ✅ Logging in hook
      setShowGate(true);
      return;
    }
    
    onGenerate();
  };
  
  return { 
    showGate, 
    handlePreview, 
    handleGenerate,
    closeGate: () => setShowGate(false),
  };
}
```

```typescript
// components/bond-generator/AssemblyGeneration.tsx
import { useAssemblyGeneration } from '@/modules/bond-generator/hooks/useAssemblyGeneration';

export function AssemblyGeneration({ bonds, onGenerate }) {
  // ✅ DUMB: Just call the hook
  const { 
    showGate, 
    handlePreview, 
    handleGenerate,
    closeGate,
  } = useAssemblyGeneration({ bonds, onGenerate });
  
  // ✅ DUMB: Just render
  return (
    <>
      <Button onClick={handleGenerate}>Generate</Button>
      <AccountGateModal isOpen={showGate} onClose={closeGate} />
    </>
  );
}
```

---

## 🤔 **When Should Logic Move to Backend Middleware?**

**Use backend middleware when:**
1. Protecting entire API endpoints (e.g., `/api/bond-generator/generate` requires auth)
2. Enforcing security (user can't bypass by disabling JavaScript)
3. Server-side validation

**Example:**

```typescript
// pages/api/bond-generator/generate.ts
export default withRequestId(withApiAuth(handler));
//                            ^^^^^^^^^^^ Backend middleware protects this endpoint

// withApiAuth checks:
// - Is there a valid session cookie?
// - Is the user authenticated?
// - If not, return 401 Unauthorized
```

**Use frontend hook when:**
1. Preventing unnecessary API calls (better UX)
2. Showing appropriate UI (account gate instead of error)
3. Client-side state management

**Example:**

```typescript
// modules/bond-generator/hooks/useAssemblyGeneration.ts
const handleGenerate = () => {
  // Frontend check: Show nice modal instead of API error
  if (!user) {
    setShowAccountGate(true);
    return;
  }
  
  // Make API call (backend will ALSO check auth)
  onGenerate();
};
```

**Both layers check auth:**
- Frontend: Better UX (show modal instead of error)
- Backend: Security (can't bypass by disabling JavaScript)

---

## 📊 **Architecture Decision Matrix**

| Type of Logic | Component | Hook | Frontend API | Backend API | Service |
|---------------|-----------|------|--------------|-------------|---------|
| **Rendering UI** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No |
| **UI State (modal open/close)** | ✅ Only pure UI | ✅ Business modals | ❌ No | ❌ No | ❌ No |
| **Auth Checking** | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Business Logic** | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **API Calls** | ❌ No | ✅ Yes (via Frontend API) | ✅ Yes | ❌ No | ❌ No |
| **Logging** | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Database Queries** | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Validation** | ❌ No | ✅ Client-side | ❌ No | ✅ Server-side | ❌ No |

---

## 🎓 **Why This Matters**

### **Testability**
```typescript
// ✅ Hook can be tested without React
const { handleGenerate } = useAssemblyGeneration({ bonds, onGenerate });
handleGenerate();
// Can assert: Was API called? Was modal shown?
```

### **Reusability**
```typescript
// ✅ Hook can be used in multiple components
function AssemblyGeneration() {
  const hook = useAssemblyGeneration({ ... });
  return <UI based on hook />;
}

function MobileAssemblyGeneration() {
  const hook = useAssemblyGeneration({ ... });  // Same hook, different UI
  return <Mobile UI based on hook />;
}
```

### **Maintainability**
```typescript
// ✅ Need to change auth logic? Just update hook
// Components don't change
```

### **Separation of Concerns**
```typescript
// Component developer: "I just render UI based on props/hook"
// Hook developer: "I handle all business logic"
// Backend developer: "I validate and call services"
```

---

## 🚀 **Quick Checklist**

**Before committing a component, ask:**

- [ ] Does the component import `useAuth`? → **Move to hook**
- [ ] Does the component import `logger`? → **Move to hook**
- [ ] Does the component import any service/lib? → **Move to hook**
- [ ] Does the component have auth checking (`if (!user)`)? → **Move to hook**
- [ ] Does the component make API calls (`fetch()`)? → **Move to hook**
- [ ] Does the component have business logic? → **Move to hook**
- [ ] Does the component only render UI? → **✅ Good!**

---

## 📝 **Template for New Features**

### **Step 1: Create Hook**

```typescript
// modules/my-feature/hooks/useMyFeature.ts
import { useAuth } from '@/app/providers/AuthProvider';
import { logger } from '@/lib/logger';
import { myApi } from '../api/myApi';

export function useMyFeature() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  
  const handleAction = async () => {
    if (!user) {
      logger.warn('Unauthorized');
      return;
    }
    
    const result = await myApi.doSomething();
    setData(result);
  };
  
  return { data, handleAction };
}
```

### **Step 2: Create Component**

```typescript
// components/my-feature/MyComponent.tsx
import { useMyFeature } from '@/modules/my-feature/hooks/useMyFeature';

export function MyComponent() {
  const { data, handleAction } = useMyFeature();
  
  return <button onClick={handleAction}>{data?.label}</button>;
}
```

---

**Last Updated:** January 27, 2026  
**Status:** Architectural standard for all components
