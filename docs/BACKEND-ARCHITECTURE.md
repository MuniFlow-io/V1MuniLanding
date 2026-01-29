# 🔧 Backend Architecture Guide

**Purpose:** Complete backend development standards for MuniFlow  
**Audience:** AI agents and developers working on APIs and services  
**Last Updated:** January 2026

---

## 🎯 The Backend Team Mindset

### You Are the Backend Team

When working in `pages/api/` or `lib/services/`:

**Your ONLY responsibilities:**
- ✅ APIs return correct data
- ✅ Data is validated properly
- ✅ Services handle business logic
- ✅ Database queries are correct
- ✅ Auth is enforced
- ✅ Errors are logged

**NOT your responsibilities:**
- ❌ UI glitching (frontend team's job)
- ❌ Components rendering wrong (frontend team's job)
- ❌ Button states (frontend team's job)

---

## 🏗️ The 2-Layer Backend Architecture

```
┌─────────────────────────────────────┐
│  LAYER 4: Backend APIs              │
│  - Authentication (withApiAuth)     │
│  - Input validation (ZOD)           │
│  - Logging                          │
│  - Error handling                   │
│  - Max 150 lines                    │
└─────────────────────────────────────┘
              ↓ calls
┌─────────────────────────────────────┐
│  LAYER 5: Services                  │
│  - Business logic                   │
│  - Database queries                 │
│  - Pure functions                   │
│  - Max 200 lines                    │
└─────────────────────────────────────┘
```

**Key Principle:** APIs handle security, services handle logic.

---

## 📏 Layer 4: Backend APIs

### Purpose
Security boundary - authenticate, validate, log, then call service.

### The Mandatory API Template

```typescript
/**
 * [HTTP METHOD] /api/[route]
 * [What this API does in one sentence]
 */

import { z } from 'zod';
import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { yourService } from '@/lib/services/yourService';
import type { NextApiResponse } from 'next';

// STEP 1: ZOD VALIDATION SCHEMA (MANDATORY)
const querySchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

const bodySchema = z.object({
  name: z.string().min(3, 'Name too short'),
  email: z.string().email('Invalid email'),
});

// STEP 2: HANDLER FUNCTION
async function handler(
  req: AuthenticatedRequest, 
  res: NextApiResponse
) {
  // STEP 3: METHOD CHECK (MANDATORY)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  // STEP 4: EXTRACT USER ID (MANDATORY PATTERN)
  const userId = req.user.id;

  // STEP 5: VALIDATE INPUT (MANDATORY)
  const queryValidation = querySchema.safeParse(req.query);
  if (!queryValidation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      details: queryValidation.error.flatten(),
    });
  }

  const bodyValidation = bodySchema.safeParse(req.body);
  if (!bodyValidation.success) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request body',
      details: bodyValidation.error.flatten(),
    });
  }

  const { id } = queryValidation.data;
  const { name, email } = bodyValidation.data;

  try {
    // STEP 6: LOG OPERATION START (MANDATORY)
    logger.info('Operation started', { 
      operation: 'your-operation',
      userId, 
      id 
    });

    // STEP 7: CALL SERVICE (MANDATORY - NO DIRECT DB QUERIES)
    const result = await yourService(userId, id, { name, email });

    // STEP 8: CHECK SERVICE RESULT (MANDATORY)
    if (!result.success) {
      logger.warn('Operation failed', { 
        userId, 
        id, 
        error: result.error 
      });
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // STEP 9: SUCCESS RESPONSE (MANDATORY FORMAT)
    return res.status(200).json({
      success: true,
      data: result.data,
    });

  } catch (error: any) {
    // STEP 10: ERROR HANDLING (MANDATORY)
    logger.error('Unexpected error', { 
      userId, 
      id,
      error: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

// STEP 11: EXPORT WITH MIDDLEWARE (MANDATORY)
export default withRequestId(withApiAuth(handler));
```

### The 11 Mandatory Steps

**Every backend API MUST have:**

1. ✅ ZOD validation schema
2. ✅ Handler function with typed request
3. ✅ Method check (GET/POST/PUT/DELETE)
4. ✅ User ID extraction (`const userId = req.user.id`)
5. ✅ Input validation (ZOD `.safeParse()`)
6. ✅ Log operation start (`logger.info`)
7. ✅ Service call (NO direct database queries)
8. ✅ Result check (`if (!result.success)`)
9. ✅ Success response (`{ success: true, data: ... }`)
10. ✅ Error handling (try-catch with `logger.error`)
11. ✅ Middleware export (`withRequestId(withApiAuth(...))`)

**If ANY step is missing → API is NOT production-ready**

---

### Backend API Rules

**✅ APIs CAN:**
- Use `withApiAuth` middleware
- Use `withRequestId` middleware
- Validate with ZOD
- Log with `logger`
- Call services
- Return standard responses

**❌ APIs CANNOT:**
- Query Supabase directly
- Have business logic
- Be >150 lines
- Use `console.log`
- Skip validation
- Skip error handling

---

### Response Format Standard

**✅ Success Response:**
```typescript
return res.status(200).json({
  success: true,
  data: result.data,
});
```

**✅ Client Error (400):**
```typescript
return res.status(400).json({
  success: false,
  error: 'Human-readable message',
  code: 'ERROR_CODE', // Optional
  details: validation.error, // Optional
});
```

**✅ Forbidden (403):**
```typescript
return res.status(403).json({
  success: false,
  error: 'Insufficient permissions',
  code: 'FORBIDDEN',
});
```

**✅ Server Error (500):**
```typescript
return res.status(500).json({
  success: false,
  error: 'Internal server error',
  // NEVER expose stack traces to client
});
```

---

## 📏 Layer 5: Services

### Purpose
Pure business logic and database operations.

### Atomic Service Pattern (PRIMARY)

```typescript
/**
 * [Service name]
 * [What this service does]
 */

import { supabaseAdmin } from '@/lib/auth/supabaseServer';
import type { ServiceResult, YourType } from '@/types';

export async function yourService(
  userId: string,
  resourceId: string
): Promise<ServiceResult<YourType>> {
  try {
    // Single, focused database operation
    const { data, error } = await supabaseAdmin
      .from('your_table')
      .select('*')
      .eq('id', resourceId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    if (!data) {
      return { 
        success: false, 
        error: 'Resource not found' 
      };
    }
    
    return { 
      success: true, 
      data 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

### Service Rules

**✅ Services CAN:**
- Query Supabase
- Call other services
- Transform data
- Business logic
- Error handling

**❌ Services CANNOT:**
- Check auth (userId is a parameter)
- Make HTTP requests
- Import from `modules/` (frontend code)
- Be >200 lines (split it)
- Use `console.log`

### Size Guidelines

```
Atomic Service:    30-80 lines  (one database query)
Complex Service:   80-200 lines (orchestrates multiple services)

If >200 lines → Split into smaller services
```

### ServiceResult Pattern (MANDATORY)

**Every service MUST return:**
```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Success
return { success: true, data: yourData };

// Error
return { success: false, error: 'What went wrong' };
```

---

### Complex Service Pattern (Orchestration)

```typescript
/**
 * Creates resource with associated relationships
 * Orchestrates multiple atomic services
 */

export async function createResourceWithRelations(
  userId: string,
  input: CreateInput
): Promise<ServiceResult<Resource>> {
  try {
    // Step 1: Create main resource
    const resourceResult = await createResourceService(userId, input);
    if (!resourceResult.success) {
      return resourceResult;
    }
    
    const resource = resourceResult.data;
    
    // Step 2: Create related records
    const relationResult = await createRelationService(
      userId,
      resource.id,
      input.relations
    );
    
    if (!relationResult.success) {
      // Rollback main resource
      await deleteResourceService(userId, resource.id);
      return { 
        success: false, 
        error: relationResult.error 
      };
    }
    
    // Step 3: Return success
    return { 
      success: true, 
      data: resource 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

---

## 🔒 Authentication Patterns

### 1. withApiAuth (User-Level)

**Use when:** API accesses user's own data

```typescript
// pages/api/profile/index.ts
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id; // ✅ User is authenticated
  
  const result = await getProfileService(userId);
  
  return res.status(200).json({ success: true, data: result.data });
}

export default withRequestId(withApiAuth(handler));
```

### 2. withDealAuth (Resource-Level)

**Use when:** API accesses deal-scoped data (auto-checks membership)

```typescript
// pages/api/deals/[dealId]/documents.ts
async function handler(req: DealAuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id;
  const dealId = req.dealId; // ✅ Membership already checked
  
  const result = await getDocumentsService(userId, dealId);
  
  return res.status(200).json({ success: true, data: result.data });
}

export default withRequestId(withDealAuth(handler));
```

### When to Use Which Middleware

```
Accessing my own data (profile, settings)?
  → withApiAuth

Accessing data inside a deal (documents, tasks)?
  → withDealAuth (auto-checks membership)

Admin-only operations?
  → withAdminAuth (checks admin role)

Public endpoint (no auth)?
  → Just withRequestId (rare - most endpoints need auth)
```

---

## 📊 Database Patterns

### 1. Simple Select

```typescript
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### 2. Select with Relations

```typescript
const { data, error } = await supabaseAdmin
  .from('deals')
  .select(`
    *,
    deal_members(
      id,
      user_id,
      role
    )
  `)
  .eq('id', dealId)
  .single();
```

### 3. Insert

```typescript
const { data, error } = await supabaseAdmin
  .from('deals')
  .insert({
    name: input.name,
    status: 'active',
    created_by: userId,
  })
  .select()
  .single();
```

### 4. Update

```typescript
const { data, error } = await supabaseAdmin
  .from('deals')
  .update({
    name: input.name,
    updated_at: new Date().toISOString(),
  })
  .eq('id', dealId)
  .eq('created_by', userId) // ✅ Security check
  .select()
  .single();
```

### 5. Delete

```typescript
const { error } = await supabaseAdmin
  .from('deals')
  .delete()
  .eq('id', dealId)
  .eq('created_by', userId); // ✅ Security check
```

---

## 🚨 Common Pitfalls & Fixes

### Pitfall 1: Direct DB Queries in API

**❌ Problem:**
```typescript
// pages/api/deals/index.ts
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // ❌ Database query in API handler
  const { data } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', req.user.id);
  
  return res.json(data);
}
```

**✅ Solution:**
```typescript
// pages/api/deals/index.ts
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id;
  
  // ✅ Call service
  const result = await getDealsService(userId);
  
  return res.status(200).json({ success: true, data: result.data });
}

// lib/services/getDealsService.ts
export async function getDealsService(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('deals')
    .select('*')
    .eq('user_id', userId);
  
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
```

### Pitfall 2: No Input Validation

**❌ Problem:**
```typescript
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { dealId } = req.query; // ❌ Could be anything!
  
  const result = await getDeal(dealId);
  return res.json(result);
}
```

**✅ Solution:**
```typescript
const querySchema = z.object({
  dealId: z.string().uuid('Invalid deal ID'),
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
  
  const { dealId } = validation.data; // ✅ Validated
  const result = await getDeal(userId, dealId);
  return res.status(200).json({ success: true, data: result.data });
}
```

### Pitfall 3: Using console.log

**❌ Problem:**
```typescript
console.log('Fetching deals'); // ❌ Lost in production
console.error('Error:', error); // ❌ Not in monitoring
```

**✅ Solution:**
```typescript
import { logger } from '@/lib/logger';

logger.info('Fetching deals', { userId, count: deals.length });
logger.error('Failed to fetch', { userId, error: error.message });
```

### Pitfall 4: Missing Error Handling

**❌ Problem:**
```typescript
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const data = await someAsyncOperation(); // ❌ Can throw!
  return res.json(data);
}
```

**✅ Solution:**
```typescript
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const data = await someAsyncOperation();
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logger.error('Operation failed', { error: error.message });
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
```

---

## 📋 Backend Checklist

### Before Committing a Backend API

- [ ] Has `withRequestId` wrapper
- [ ] Has `withApiAuth` or `withDealAuth`
- [ ] Has ZOD validation schema
- [ ] Method check (GET/POST/PUT/DELETE)
- [ ] User ID extracted as `const userId = req.user.id`
- [ ] Calls service (NO direct DB queries)
- [ ] Uses `logger` (not `console.log`)
- [ ] Try-catch with error handling
- [ ] Standard response format
- [ ] <150 lines total

### Before Committing a Service

- [ ] Returns `ServiceResult<T>`
- [ ] Has try-catch
- [ ] userId as parameter (no auth checks)
- [ ] <200 lines total
- [ ] No imports from `modules/`
- [ ] Uses Supabase only (no HTTP)
- [ ] Single responsibility

---

## 🎯 Key Principles

### 1. APIs Are Thin

APIs should be <150 lines. If longer, service is doing too much.

**API's job:**
- Authenticate
- Validate
- Log
- Call service
- Return response

**NOT the API's job:**
- Business logic
- Database queries
- Data transformation

### 2. Services Are Pure

Services should be pure functions:
```typescript
// ✅ Pure service
export async function getDeals(userId: string) {
  // Same inputs → Same outputs
  // No side effects beyond database
}

// ❌ Impure service
export async function getDeals() {
  const userId = getUserFromSession(); // ❌ Hidden dependency
}
```

### 3. Always Return ServiceResult

```typescript
// ✅ Consistent return type
return { success: true, data };
return { success: false, error: 'What went wrong' };

// ❌ Throws errors (caller must handle)
throw new Error('What went wrong');
```

### 4. Security in Layers

```
Layer 1: Middleware (withApiAuth)
  → Is user authenticated?
  
Layer 2: Service parameter (userId)
  → Which user's data?
  
Layer 3: Database query (.eq('user_id', userId))
  → Filter by user
```

---

## 🔍 Security Checklist

**Every backend API must:**

- [ ] Has authentication middleware
- [ ] Validates all inputs with ZOD
- [ ] Logs operations for audit trail
- [ ] Filters data by userId in queries
- [ ] Never exposes stack traces to client
- [ ] Uses HTTPS only (credentials: 'same-origin')

**Every service must:**

- [ ] Accepts userId as parameter
- [ ] Filters by userId in database queries
- [ ] Returns ServiceResult (never throws)
- [ ] No hardcoded credentials
- [ ] Uses supabaseAdmin (not regular client)

---

**Remember:** You're the backend team. Your job is returning correct data with proper security. If the frontend glitches, that's their problem. If data is wrong or insecure, that's on you.
