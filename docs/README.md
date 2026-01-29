# MuniFlow Documentation

**Purpose:** Essential documentation for AI agents and developers  
**Philosophy:** The best code comes from the least code  
**Last Updated:** January 2026

---

## 🎯 Start Here (Every AI Agent)

**Read these 4 docs first (15 minutes):**

1. **`company-context.md`** - What MuniFlow is and the vision
2. **`ELITE-STANDARDS.md`** - Code quality standards (size limits, forbidden patterns)
3. **`FRONTEND-ARCHITECTURE.md`** - Complete frontend guide (components, hooks, APIs)
4. **`BACKEND-ARCHITECTURE.md`** - Complete backend guide (APIs, services, database)

**After reading these, you'll know:**
- ✅ What we're building and why
- ✅ How to structure code (5 layers)
- ✅ What's allowed vs forbidden
- ✅ Size limits for each file type
- ✅ Where logic belongs

---

## 📚 Reference Documentation

**Read when needed:**

### Architecture & Patterns
5. **`COMPONENT-ARCHITECTURE.md`** - Where logic belongs (components vs hooks vs middleware)
6. **`AUTHENTICATION-GUIDE.md`** - How auth works, where it belongs (3 layers)
7. **`DATABASE-SCHEMA.md`** - Database patterns, why JSONB, auto-save design

### Design System
8. **`COLOR-STRATEGY.md`** - Brand colors (purple, cyan), usage patterns
9. **`COMPONENT-CATALOG.md`** - Available components (Button, Card, etc.)
10. **`component-development-guide.md`** - Component-first workflow, animation patterns

### Setup & Configuration
11. **`SETUP-GUIDE.md`** - Initial project setup
12. **`SUPABASE-SETUP.md`** - Database configuration
13. **`ENV-TEMPLATE.md`** - Environment variables
14. **`ENVIRONMENT-CHECKLIST.md`** - What needs configuration

---

## 🎯 Quick Links by Task

### Building Frontend Features
- **START HERE:** `FRONTEND-ARCHITECTURE.md` - Complete frontend guide
- Component patterns → `COMPONENT-ARCHITECTURE.md`
- Code quality → `ELITE-STANDARDS.md`
- Available components → `COMPONENT-CATALOG.md`
- Animation patterns → `component-development-guide.md`
- Design tokens → `COLOR-STRATEGY.md`

### Building Backend Features
- **START HERE:** `BACKEND-ARCHITECTURE.md` - Complete backend guide
- API template → `BACKEND-ARCHITECTURE.md` (The 11 Steps)
- Service patterns → `BACKEND-ARCHITECTURE.md`
- Code quality → `ELITE-STANDARDS.md`

### Authentication Work
- **START HERE:** `AUTHENTICATION-GUIDE.md`
- Where auth belongs (3 layers) → `AUTHENTICATION-GUIDE.md`
- Cookie-based auth flow → `AUTHENTICATION-GUIDE.md`
- Common pitfalls → `AUTHENTICATION-GUIDE.md`

### Database Work
- **START HERE:** `DATABASE-SCHEMA.md`
- Why JSONB pattern → `DATABASE-SCHEMA.md`
- Auto-save pattern → `DATABASE-SCHEMA.md`
- Running migrations → `supabase-migrations.sql`

### Project Setup
- Initial setup → `SETUP-GUIDE.md`
- Database setup → `SUPABASE-SETUP.md`
- Environment vars → `ENV-TEMPLATE.md`
- Verification → `ENVIRONMENT-CHECKLIST.md`

---

## 🗂️ Special Folders

### `passports/`
Page-specific context documents (AI agents working on specific pages should read these).

- `home-page-passport.md` - Homepage context
- `navigation-passport.md` - Navigation system
- `reach-out-page-passport.md` - Contact page context
- `performance-optimization-passport.md` - Performance standards

### `migrations/`
SQL migration scripts for database changes.

- `add-assembled-bonds-column.sql` - Example migration
- `../supabase-migrations.sql` - Main migration file (one level up)

---

## ✅ What This Folder Contains

**Architectural Knowledge** ✅
- How to structure code
- Where different logic belongs
- Why we made certain decisions
- Design patterns we use

**Standards & Best Practices** ✅
- Code quality requirements
- Component patterns
- Naming conventions
- Logging practices

**Setup Instructions** ✅
- How to configure the project
- Database setup
- Environment variables
- Verification steps

---

## ❌ What This Folder Does NOT Contain

**Session Logs** ❌
- "Here's what I built today"
- "Fixed bug X in session Y"
- Agent handoff notes
- Specific implementation details from one chat

**Temporary Plans** ❌
- "Week 1-4 roadmap"
- "Phase 1-3 implementation"
- Short-term TODO lists

**Troubleshooting Guides** ❌
- "How to fix error X"
- Step-by-step debugging
- One-time fixes applied

---

## 📖 Reading Guide for AI Agents

### Every Conversation Start (MANDATORY - 15 minutes)

**The Essential 4:**
1. `company-context.md` - What we're building
2. `ELITE-STANDARDS.md` - Code quality rules (size limits, forbidden patterns)
3. `FRONTEND-ARCHITECTURE.md` - If doing frontend work
4. `BACKEND-ARCHITECTURE.md` - If doing backend work

**After reading, you'll know:**
- ✅ What MuniFlow does and why
- ✅ The 5-layer architecture
- ✅ What's allowed vs forbidden (console.log, any, etc.)
- ✅ Size limits (<150 components, <200 hooks, etc.)
- ✅ Required patterns (status enum, ServiceResult, etc.)

### Building Specific Features

**Frontend work (components, hooks):**
- Primary: `FRONTEND-ARCHITECTURE.md` (complete guide)
- Reference: `COMPONENT-ARCHITECTURE.md` (where logic belongs)
- Reference: `COMPONENT-CATALOG.md` (available components)
- Reference: `COLOR-STRATEGY.md` (design tokens)

**Backend work (APIs, services):**
- Primary: `BACKEND-ARCHITECTURE.md` (complete guide + 11-step template)
- Reference: `DATABASE-SCHEMA.md` (JSONB patterns, auto-save)

**Authentication:**
- Primary: `AUTHENTICATION-GUIDE.md` (complete guide)
- Know: Auth checks in 3 places (hook, middleware, service query)

**Setup/Configuration:**
- `SETUP-GUIDE.md` for initial project setup
- `SUPABASE-SETUP.md` for database configuration
- `ENV-TEMPLATE.md` for environment variables

---

## 🎓 Key Principles (From This Documentation)

### Architecture (5 Layers)
```
Component (Dumb UI) 
  ↓ 
Hook (Smart Logic) 
  ↓ 
Frontend API (HTTP) 
  ↓ 
Backend API (Auth/Validation) 
  ↓ 
Service (Business Logic)
```

### Code Quality
- ✅ Components < 150 lines
- ✅ Hooks < 200 lines
- ✅ Services are pure functions
- ✅ Use `logger` not `console.log`
- ✅ TypeScript strict mode
- ✅ Zero `any` types (target)

### Design System
- Purple (`#580067`) + Cyan (`#66ffcc`) brand colors
- Dark theme (gray-950 backgrounds)
- Glass morphism where appropriate
- Clean, minimal, professional aesthetic

### Database Pattern
- JSONB for metadata (fast, simple)
- Supabase Storage for files
- Admin client (bypass RLS)
- ServiceResult<T> pattern

---

## 🔄 Maintenance

### When to Add Documentation
- New architectural pattern introduced
- New standard/convention established
- New utility/helper created
- Setup process changed

### When NOT to Add Documentation
- Completed a feature (that's a session log)
- Fixed a bug (that's a session log)
- Tried approach X (that's a session log)
- "Here's what I did today" (that's a session log)

### How to Update
1. Keep docs focused on **HOW** and **WHY**
2. Remove session-specific details
3. Extract patterns, not implementations
4. Keep under 500 lines per doc
5. Update last modified date

---

## 📞 Getting Help

### If Documentation is Unclear
- Ask the user to clarify
- Propose improvement to doc
- Extract pattern if you discover something new

### If You Need Session Context
- Ask the user directly
- Check git history for recent changes
- Look at actual code (source of truth)

### If Documentation Conflicts with Code
- **Code is truth** - update docs to match
- Or ask user which is correct

---

## 🎯 Success Metrics

**Good Documentation:**
- ✅ AI agents can build features without asking basic questions
- ✅ New developers understand architecture quickly
- ✅ Standards are consistently followed
- ✅ No duplicate work (components already built)

**Bad Documentation:**
- ❌ 20+ files with overlapping info
- ❌ Session-specific "what I did" logs
- ❌ Outdated roadmaps and plans
- ❌ Too much detail, not enough principles

---

**Current Status:** ✅ Clean, focused, useful documentation  
**Total Docs:** 12 core files + passports folder  
**All docs under 500 lines:** ✅ Yes (most under 300)

---

## 📋 Complete Document Index

### 🔴 Core Architecture (Read First)

| Document | Lines | Purpose | Priority |
|----------|-------|---------|----------|
| `company-context.md` | ~200 | What we're building | MANDATORY |
| `ELITE-STANDARDS.md` | ~200 | Code quality standards | MANDATORY |
| `FRONTEND-ARCHITECTURE.md` | ~500 | Complete frontend guide | If doing frontend |
| `BACKEND-ARCHITECTURE.md` | ~600 | Complete backend guide | If doing backend |

### 🟡 Reference Guides

| Document | Lines | Purpose | Read When |
|----------|-------|---------|-----------|
| `COMPONENT-ARCHITECTURE.md` | ~350 | Where logic belongs | Component questions |
| `AUTHENTICATION-GUIDE.md` | ~420 | Auth patterns (3 layers) | Building auth |
| `DATABASE-SCHEMA.md` | ~450 | JSONB patterns, auto-save | Database work |
| `COLOR-STRATEGY.md` | ~150 | Brand colors, design tokens | Building UI |
| `COMPONENT-CATALOG.md` | ~385 | Available components | Building UI |
| `component-development-guide.md` | ~290 | Component workflow | Building components |

### 🟢 Setup & Configuration

| Document | Lines | Purpose | Read When |
|----------|-------|---------|-----------|
| `SETUP-GUIDE.md` | ~250 | Project setup | Initial setup |
| `SUPABASE-SETUP.md` | ~200 | Database configuration | Initial setup |
| `ENV-TEMPLATE.md` | ~100 | Environment variables | Configuration |
| `ENVIRONMENT-CHECKLIST.md` | ~150 | Setup verification | Configuration |

### 📁 Special Folders

| Folder | Purpose | Contents |
|--------|---------|----------|
| `passports/` | Page-specific context | 5 page passports |
| `migrations/` | SQL migrations | Database changes |

---

---

## 🎓 How to Use This Documentation

### For AI Agents Starting Fresh

```
Step 1: Read the Essential 4 (15 min)
  → company-context.md
  → ELITE-STANDARDS.md
  → FRONTEND-ARCHITECTURE.md (if frontend work)
  → BACKEND-ARCHITECTURE.md (if backend work)

Step 2: Start coding with confidence
  → You now know: architecture, standards, patterns
  
Step 3: Reference guides as needed
  → Auth questions? → AUTHENTICATION-GUIDE.md
  → Database questions? → DATABASE-SCHEMA.md
  → Design questions? → COLOR-STRATEGY.md
```

### For Specific Tasks

**"Build a new component":**
1. Check `COMPONENT-CATALOG.md` - Does it exist?
2. Read `FRONTEND-ARCHITECTURE.md` - Component layer rules
3. Read `COLOR-STRATEGY.md` - Brand colors
4. Build following `ELITE-STANDARDS.md` - <150 lines, no logic

**"Build a new hook":**
1. Read `FRONTEND-ARCHITECTURE.md` - Hook patterns
2. Use status enum pattern (not multiple booleans)
3. Call Frontend APIs (not lib/)
4. Follow `ELITE-STANDARDS.md` - <200 lines

**"Build a new backend API":**
1. Read `BACKEND-ARCHITECTURE.md` - Copy the 11-step template
2. Use `withRequestId(withApiAuth(handler))`
3. Add ZOD validation
4. Call service (no direct DB queries)
5. Follow `ELITE-STANDARDS.md` - <150 lines

**"Fix authentication":**
1. Read `AUTHENTICATION-GUIDE.md` - Understand 3 layers
2. Know where auth belongs (hook vs middleware)
3. Follow cookie-based pattern

---

## 📊 Documentation Stats

**Core Docs:** 14 files  
**Passports:** 5 files  
**Total:** 19 organized documents

**Removed:** 17 session logs (233KB deleted)  
**Created:** 5 new consolidated guides  
**Result:** Focused, reusable architectural knowledge

---

**Last Cleanup:** January 2026  
**Status:** ✅ Optimized for AI agent learning  
**Philosophy:** Teach **HOW to think**, not **WHAT was done**
