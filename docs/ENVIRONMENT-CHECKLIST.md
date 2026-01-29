# ✅ Environment Setup Checklist

**Use this to verify your setup is complete**

---

## 🗄️ **Supabase**

### **1. Create Project**
- [ ] Go to [app.supabase.com](https://app.supabase.com)
- [ ] Create new project: `muniflow-landing`
- [ ] Save database password securely
- [ ] Wait for project to initialize (~2 minutes)

### **2. Get API Keys**
Go to **Settings → API**:
- [ ] Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### **3. Run Database Migration**
- [ ] Go to **SQL Editor**
- [ ] Click **New Query**
- [ ] Paste contents of `docs/supabase-migrations.sql`
- [ ] Click **Run**
- [ ] Verify: Should see "SUCCESS: bond_drafts table created"

### **4. Create Storage Bucket**
- [ ] Go to **Storage**
- [ ] Click **Create a new bucket**
- [ ] Name: `bond-generator-files`
- [ ] Public: **NO** (keep private)
- [ ] Click **Create bucket**

### **5. Verify Setup**
- [ ] Go to **Table Editor** → Should see `bond_drafts` table
- [ ] Go to **Table Editor** → Should see `bond_draft_files` table
- [ ] Go to **Storage** → Should see `bond-generator-files` bucket

---

## 📧 **Resend (Email)**

### **1. Create Account**
- [ ] Go to [resend.com](https://resend.com)
- [ ] Sign up (free tier: 100 emails/day)
- [ ] Verify your email

### **2. Get API Key**
- [ ] Go to **API Keys**
- [ ] Click **Create API Key**
- [ ] Name: `MuniLanding Production`
- [ ] Copy key (starts with `re_`) → `RESEND_API_KEY`

### **3. Set Notification Email**
- [ ] Choose email where contact form submissions will go
- [ ] Add to `.env.local`: `NOTIFICATION_EMAIL=your-email@muniflow.io`

### **4. (Optional) Verify Domain**
- [ ] Go to **Domains** → **Add Domain**
- [ ] Enter: `muniflow.io`
- [ ] Add DNS records (TXT, MX, CNAME)
- [ ] Wait for verification (~10 minutes)
- [ ] **OR** use test domain for now: `onboarding@resend.dev`

---

## 🐛 **Sentry (Optional)**

**Skip this if you want to launch quickly. Can add later.**

### **1. Create Project**
- [ ] Go to [sentry.io](https://sentry.io)
- [ ] Create project: Platform = Next.js
- [ ] Name: `muniflow-landing`

### **2. Get DSN**
- [ ] Go to **Settings → Client Keys (DSN)**
- [ ] Copy DSN → `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`

### **3. Get Auth Token**
- [ ] Go to **Settings → Account → Auth Tokens**
- [ ] Create token with scopes: `project:read`, `project:releases`
- [ ] Copy → `SENTRY_AUTH_TOKEN`

---

## 📝 **Create .env.local**

### **1. Copy Template**
```bash
cp .env.local.example .env.local
```

### **2. Fill in Values**

Open `.env.local` and replace placeholders:

```env
# SUPABASE (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# RESEND (Required)
RESEND_API_KEY=re_xxxxxxxxxxxx
NOTIFICATION_EMAIL=steve@muniflow.io

# SENTRY (Optional)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx

# ENVIRONMENT
NODE_ENV=development
```

### **3. Verify**
- [ ] `.env.local` exists in project root
- [ ] `.env.local` is in `.gitignore` (NEVER commit this file!)
- [ ] All required keys filled in
- [ ] Restart dev server: `npm run dev`

---

## ✅ **Verification Tests**

### **Test 1: Supabase Connection**
```bash
npm run dev
```
- [ ] No "Missing Supabase environment variables" errors
- [ ] Can visit [http://localhost:3000](http://localhost:3000)
- [ ] No console errors about Supabase

### **Test 2: Database Access**
Create test file: `scripts/test-db.ts`
```typescript
import { supabaseAdmin } from '@/lib/db';

async function testDatabase() {
  const { data, error } = await supabaseAdmin
    .from('bond_drafts')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Database error:', error);
  } else {
    console.log('✅ Database connected! Found', data?.length || 0, 'drafts');
  }
}

testDatabase();
```

Run: `npx tsx scripts/test-db.ts`

### **Test 3: File Upload**
- [ ] Try uploading a file to storage bucket
- [ ] Should accept .docx files
- [ ] Should reject other formats

### **Test 4: Email**
- [ ] Submit contact form
- [ ] Check email arrives at `NOTIFICATION_EMAIL`
- [ ] Check Resend dashboard shows delivery

---

## 🚨 **Common Issues**

### **"Missing Supabase environment variables"**
- Check `.env.local` exists
- Check all 3 Supabase keys are set
- Restart dev server

### **"Supabase admin client not configured"**
- Check `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)
- Verify key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

### **"Database connection failed"**
- Verify Supabase project is active (not paused)
- Check URL is correct (includes `https://`)
- Run migration SQL if tables don't exist

### **Email not sending**
- Verify `RESEND_API_KEY` starts with `re_`
- Check Resend dashboard for errors
- Verify domain is verified (or use test domain)

---

## 🎯 **What's Next After Setup?**

Once environment is configured:

1. **Test bond generator backend** - Try API endpoints
2. **Remove MUI** - Replace with Tailwind components
3. **Implement auth** - Real Supabase Auth
4. **Build workbench UI** - File upload, tagging, etc.
5. **Add account gate** - Freemium model
6. **Polish UX** - Tooltips, animations, feedback

---

**Estimated Time:** 1-2 hours for complete environment setup

**Need help?** See `docs/SETUP-GUIDE.md` for detailed instructions
