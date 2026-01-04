# Supabase Setup for Contact Form

## 1. Create the Contact Submissions Table

Go to your Supabase dashboard → SQL Editor → New Query, then run:

```sql
-- Create contact_submissions table
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

-- Add indexes for better query performance
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_timestamp ON contact_submissions(timestamp DESC);
CREATE INDEX idx_contact_submissions_intent ON contact_submissions(intent);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert (for API route)
CREATE POLICY "Allow service role to insert" 
  ON contact_submissions 
  FOR INSERT 
  TO service_role 
  WITH CHECK (true);

-- Create policy to allow service role to read (for future admin dashboard)
CREATE POLICY "Allow service role to read" 
  ON contact_submissions 
  FOR SELECT 
  TO service_role 
  USING (true);
```

## 2. Get Your Supabase Credentials

From your Supabase project settings:

1. **Project URL**: Settings → API → Project URL
   - Example: `https://xxxxxxxxxxx.supabase.co`

2. **Service Role Key**: Settings → API → Service Role Key (secret)
   - ⚠️ This is SECRET - never commit to GitHub
   - This key bypasses RLS, only use server-side

## 3. Set Up Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase (you should already have these from your main app)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for email notifications)
RESEND_API_KEY=re_xxxxxxxxxxxx
NOTIFICATION_EMAIL=steve@muniflow.io
```

## 4. Set Up Resend (Email Notifications)

### Step 1: Sign up for Resend
1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day, 3,000/month)
3. Verify your email

### Step 2: Add & Verify Your Domain
1. Go to **Domains** → **Add Domain**
2. Enter: `muniflow.io`
3. Add the DNS records they give you (in your domain registrar)
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Value: (they provide this)
4. Wait for verification (~5-10 minutes)

### Step 3: Get Your API Key
1. Go to **API Keys** → **Create API Key**
2. Name it: "Landing Page Notifications"
3. Copy the key (starts with `re_`)
4. Add to `.env.local`: `RESEND_API_KEY=re_xxxx`

### Step 4: Update Email Addresses
In `lib/email.ts`, update:
- Line 23: `from: 'MuniFlow Leads <leads@muniflow.io>'`
- Line 24: `to: process.env.NOTIFICATION_EMAIL || 'steve@muniflow.io'`
- Line 76: `from: 'MuniFlow <hello@muniflow.io>'`

## 5. Deploy Environment Variables

### For Vercel:
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add NOTIFICATION_EMAIL
```

Or in Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add each variable
3. Select "Production", "Preview", and "Development"
4. Redeploy

## 6. Test the Form

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   - Go to http://localhost:3000/contact
   - Fill out and submit the form
   - Check your email
   - Check Supabase table: Table Editor → contact_submissions

2. **Production Testing**:
   - Submit a test from your live site
   - Verify email received
   - Check Supabase table

## 7. Query Your Leads (SQL Examples)

### Get all leads from today
```sql
SELECT * FROM contact_submissions 
WHERE timestamp >= CURRENT_DATE 
ORDER BY timestamp DESC;
```

### Count leads by intent
```sql
SELECT intent, COUNT(*) as count 
FROM contact_submissions 
GROUP BY intent 
ORDER BY count DESC;
```

### Get all "try-app" leads
```sql
SELECT name, email, company, role, message, timestamp 
FROM contact_submissions 
WHERE intent = 'try-app' 
ORDER BY timestamp DESC;
```

### Export to CSV (in Supabase dashboard)
1. Run query
2. Click "Download CSV" button
3. Import to your CRM

## 8. Future: Build Admin Dashboard

You can build a simple admin page to view leads:

```typescript
// app/admin/leads/page.tsx
import { supabaseAdmin } from '@/lib/supabase';

export default async function LeadsPage() {
  const { data: leads } = await supabaseAdmin
    .from('contact_submissions')
    .select('*')
    .order('timestamp', { ascending: false });

  return (
    <div>
      <h1>Contact Leads</h1>
      <table>
        {/* Render leads */}
      </table>
    </div>
  );
}
```

## Troubleshooting

### Emails not sending?
- Check RESEND_API_KEY is correct
- Verify domain in Resend dashboard
- Check Vercel logs: `vercel logs`

### Data not saving to Supabase?
- Check SUPABASE_SERVICE_ROLE_KEY is set
- Verify table was created
- Check RLS policies are set correctly
- Look at Supabase logs: Logs → Database

### "Missing environment variables" error?
- Make sure `.env.local` exists
- Restart dev server: `npm run dev`
- In production, redeploy after adding env vars

---

## Summary

✅ Contact form data is now:
1. **Stored permanently** in Supabase (queryable, exportable)
2. **Emailed to you** instantly via Resend
3. **Confirmed to user** with professional email

You'll never lose a lead again!

