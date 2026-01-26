# 🚀 MuniLanding Setup Guide

**Last Updated:** 2026-01-26

This guide walks you through setting up the MuniLanding project with all required services.

---

## 📋 **Prerequisites**

- Node.js 18+ installed
- Supabase account
- Resend account (for email)
- Sentry account (optional, for error tracking)

---

## 🔧 **Step 1: Environment Variables**

### **1.1 Create `.env.local`**

```bash
cp .env.local.example .env.local
```

### **1.2 Fill in Required Keys**

Open `.env.local` and update these values:

---

## 🗄️ **Step 2: Supabase Setup**

### **2.1 Create New Supabase Project**

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. **Name:** `muniflow-landing` (or your choice)
4. **Database Password:** Save this securely
5. **Region:** Choose closest to your users
6. Click "Create new project" (takes ~2 minutes)

### **2.2 Get API Keys**

1. Go to **Settings → API**
2. Copy these values to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

⚠️ **IMPORTANT:** Never commit `.env.local` to git!

### **2.3 Create Database Tables**

Run this SQL in Supabase SQL Editor (**SQL Editor → New Query**):

```sql
-- ============================================================================
-- BOND DRAFTS TABLE
-- Stores user's bond generator progress
-- ============================================================================
CREATE TABLE bond_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_step TEXT NOT NULL,
  tag_map JSONB,
  is_finalized BOOLEAN DEFAULT false,
  legal_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX idx_bond_drafts_user_id ON bond_drafts(user_id);
CREATE INDEX idx_bond_drafts_updated ON bond_drafts(updated_at DESC);

-- ============================================================================
-- BOND DRAFT FILES TABLE
-- Stores references to uploaded files
-- ============================================================================
CREATE TABLE bond_draft_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES bond_drafts(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL, -- 'template' | 'maturity' | 'cusip'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast draft lookups
CREATE INDEX idx_draft_files_draft_id ON bond_draft_files(draft_id);

-- ============================================================================
-- AUTO-UPDATE TIMESTAMP
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bond_drafts_updated_at
BEFORE UPDATE ON bond_drafts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### **2.4 Create Storage Bucket**

1. Go to **Storage** in Supabase
2. Click "Create a new bucket"
3. **Name:** `bond-generator-files`
4. **Public:** NO (keep private)
5. Click "Create bucket"

6. **Set Bucket Policies:**

Go to **Storage → Policies** and add:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bond-generator-files');

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'bond-generator-files');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'bond-generator-files');
```

---

## 📧 **Step 3: Resend Setup (Email)**

### **3.1 Create Resend Account**

1. Go to [https://resend.com](https://resend.com)
2. Sign up (free tier: 100 emails/day)
3. Verify your email

### **3.2 Get API Key**

1. Go to **API Keys**
2. Click "Create API Key"
3. **Name:** `MuniLanding Production`
4. Copy the key (starts with `re_`)
5. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

### **3.3 Verify Domain (Optional but Recommended)**

1. Go to **Domains**
2. Click "Add Domain"
3. Enter your domain (e.g., `muniflow.io`)
4. Add DNS records (TXT, MX, CNAME)
5. Wait for verification (~10 minutes)

**OR** use Resend's test domain for now: `onboarding@resend.dev`

### **3.4 Update Email Recipients**

In `.env.local`:
```
NOTIFICATION_EMAIL=your-email@muniflow.io
```

This is where contact form submissions will be sent.

---

## 🐛 **Step 4: Sentry Setup (Optional - Recommended)**

Sentry tracks errors in production. **Skip this for now if you want to launch quickly.**

### **4.1 Create Sentry Project**

1. Go to [https://sentry.io](https://sentry.io)
2. Click "Create Project"
3. **Platform:** Next.js
4. **Name:** `muniflow-landing`
5. Click "Create Project"

### **4.2 Get DSN**

1. Go to **Settings → Projects → muniflow-landing → Client Keys (DSN)**
2. Copy the DSN
3. Add to `.env.local`:
   ```
   SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   ```

### **4.3 Get Auth Token**

1. Go to **Settings → Account → Auth Tokens**
2. Click "Create New Token"
3. **Scopes:** `project:read`, `project:releases`
4. Copy token
5. Add to `.env.local`:
   ```
   SENTRY_AUTH_TOKEN=xxxxx
   ```

---

## ✅ **Step 5: Verify Setup**

### **5.1 Install Dependencies**

```bash
npm install
```

### **5.2 Start Dev Server**

```bash
npm run dev
```

### **5.3 Test Each Feature**

1. **Homepage:** [http://localhost:3000](http://localhost:3000)
   - Should load without errors
   
2. **Bond Generator:** [http://localhost:3000/bond-generator](http://localhost:3000/bond-generator)
   - Should show showcase page
   
3. **Contact Form:** [http://localhost:3000/contact](http://localhost:3000/contact)
   - Submit test (should send email)

4. **Check Logs:**
   - Terminal should show no Supabase connection errors
   - Pino logs should be clean

---

## 🚀 **Step 6: Deploy to Vercel**

### **6.1 Connect to Vercel**

```bash
npm i -g vercel
vercel login
vercel
```

### **6.2 Set Environment Variables in Vercel**

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `NOTIFICATION_EMAIL`
   - `SENTRY_DSN` (if using)
   - `NEXT_PUBLIC_SENTRY_DSN` (if using)
   - `SENTRY_AUTH_TOKEN` (if using)

### **6.3 Deploy**

```bash
vercel --prod
```

---

## 🗺️ **Roadmap: What's Next**

### **✅ Phase 1: Environment (DONE)**
- [x] Supabase project created
- [x] Database tables created
- [x] Storage bucket configured
- [x] Resend API key added
- [x] All env vars set

### **⚠️ Phase 2: Auth (NEXT)**
- [ ] Implement Supabase Auth
- [ ] Update `withApiAuth` to verify real tokens
- [ ] Add login/signup UI
- [ ] Protected routes for bond generator

### **🔧 Phase 3: Bond Generator (AFTER AUTH)**
- [ ] File upload component
- [ ] Tag assignment UI
- [ ] Validation screens
- [ ] Generation logic
- [ ] Account gate modal

### **💰 Phase 4: Subscriptions (FUTURE)**
- [ ] Stripe integration
- [ ] Free tier (preview only)
- [ ] Paid tier (download bonds)
- [ ] Usage tracking

---

## 🆘 **Troubleshooting**

### **"Missing Supabase environment variables" Error**

**Fix:** Make sure `.env.local` exists and has all 3 Supabase keys.

### **"Supabase admin client not configured" Error**

**Fix:** Check that `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key).

### **Email Not Sending**

**Fix:**
1. Check `RESEND_API_KEY` is correct
2. Verify domain in Resend dashboard
3. Check Resend logs for errors

### **Database Connection Errors**

**Fix:**
1. Verify Supabase URL is correct
2. Check database is not paused (free tier auto-pauses after 7 days)
3. Restart Supabase project

---

## 📝 **Quick Reference: Where to Find Keys**

| Service | Location | Key Name |
|---------|----------|----------|
| Supabase URL | Settings → API → Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Supabase Anon | Settings → API → Project API keys → anon | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase Service | Settings → API → Project API keys → service_role | `SUPABASE_SERVICE_ROLE_KEY` |
| Resend | API Keys → Create | `RESEND_API_KEY` |
| Sentry DSN | Settings → Projects → Client Keys | `SENTRY_DSN` |
| Sentry Token | Settings → Account → Auth Tokens | `SENTRY_AUTH_TOKEN` |

---

**Need help?** Request a walkthrough: [/contact?demo=true](/contact?demo=true)
