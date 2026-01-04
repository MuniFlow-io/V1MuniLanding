# 🚀 Quick Start: Contact Form Lead Capture

## ⏱️ Setup Time: 15 minutes

Your contact form is now **fully integrated** with Supabase + Resend. Here's what you need to do:

---

## Step 1: Supabase Database Setup (5 min)

1. Go to your **Supabase dashboard**: https://app.supabase.com
2. Open your project (the same one you use for the main MuniFlow app)
3. Go to **SQL Editor** → **New Query**
4. Copy/paste this SQL and run it:

```sql
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  intent TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_timestamp ON contact_submissions(timestamp DESC);
CREATE INDEX idx_contact_submissions_intent ON contact_submissions(intent);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role to insert" 
  ON contact_submissions FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role to read" 
  ON contact_submissions FOR SELECT TO service_role USING (true);
```

5. Click **Run** ✅

---

## Step 2: Get Supabase Credentials (2 min)

You probably already have these for the main app, but just in case:

1. In Supabase dashboard: **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: (click to reveal, starts with `eyJ...`)

---

## Step 3: Set Up Resend (5 min)

### 3a. Sign up for Resend (free)
1. Go to https://resend.com
2. Sign up with GitHub or email
3. Verify your email

### 3b. Add your domain
1. Click **Domains** → **Add Domain**
2. Enter: `muniflow.io`
3. Copy the DNS records they show you
4. Add them to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
   - **Type**: TXT
   - **Name**: `resend._domainkey`
   - **Value**: (the long string they give you)
5. Wait 5-10 minutes for verification

### 3c. Get API Key
1. Go to **API Keys** → **Create API Key**
2. Name it: "Landing Page"
3. Copy the key (starts with `re_`)

---

## Step 4: Add Environment Variables (3 min)

Create a file called `.env.local` in your project root:

```bash
# Supabase (you might already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
NOTIFICATION_EMAIL=steve@muniflow.io
```

Replace with your actual values!

---

## Step 5: Deploy to Vercel (3 min)

### Option A: Vercel Dashboard
1. Go to https://vercel.com
2. Open your project → **Settings** → **Environment Variables**
3. Add all 4 variables from above
4. Redeploy: **Deployments** → **...** → **Redeploy**

### Option B: Vercel CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# (paste your value, press enter)

vercel env add SUPABASE_SERVICE_ROLE_KEY
# (paste your value, press enter)

vercel env add RESEND_API_KEY
# (paste your value, press enter)

vercel env add NOTIFICATION_EMAIL
# (paste your value, press enter)

vercel --prod
```

---

## ✅ You're Done!

### Test It:
1. Go to your live site: `https://muniflow.io/contact`
2. Fill out the form
3. Submit
4. Check your email inbox (steve@muniflow.io or whatever you set)
5. Check Supabase: **Table Editor** → `contact_submissions`

### You Should See:
- ✅ Email in your inbox with lead details
- ✅ Row in Supabase `contact_submissions` table
- ✅ User gets confirmation email

---

## 🔍 View Your Leads

### Quick View (Supabase Dashboard):
1. Go to **Table Editor**
2. Click `contact_submissions`
3. See all submissions
4. Click **Download CSV** to export

### SQL Queries:
```sql
-- All leads from today
SELECT * FROM contact_submissions 
WHERE timestamp >= CURRENT_DATE 
ORDER BY timestamp DESC;

-- Count by intent
SELECT intent, COUNT(*) 
FROM contact_submissions 
GROUP BY intent;

-- People who want to try the app
SELECT name, email, company 
FROM contact_submissions 
WHERE intent = 'try-app';
```

---

## 🚨 Troubleshooting

**"Missing environment variables" error?**
- Make sure `.env.local` exists in project root
- Restart dev server: `npm run dev`
- For production: redeploy after adding env vars to Vercel

**Emails not sending?**
- Check Resend dashboard → Logs
- Verify your domain is confirmed (green checkmark)
- Check RESEND_API_KEY is correct

**Data not saving to Supabase?**
- Check Supabase → Logs → Database
- Verify table was created (Table Editor)
- Make sure SUPABASE_SERVICE_ROLE_KEY is set

---

## 📊 What Happens Now

Every time someone submits the contact form:

1. ✅ **Saved to Supabase** (permanent, queryable)
2. ✅ **Email sent to you** (`NOTIFICATION_EMAIL`)
3. ✅ **Confirmation sent to user** (builds trust)

**You'll never lose another lead!**

---

Need help? Check the full docs: `SUPABASE-SETUP.md`

