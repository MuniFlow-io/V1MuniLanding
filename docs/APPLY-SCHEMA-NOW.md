# 🚀 Apply Database Schema - Step by Step

**Issue:** Bond generator failing with "Could not find 'cusip_file' column"  
**Fix:** Run this migration to add missing JSONB columns

---

## Step 1: Create Storage Bucket (5 seconds)

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in left sidebar
4. Click **New bucket** button
5. Enter these settings:
   - **Name:** `bond-generator-files`
   - **Public:** OFF (leave unchecked)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** Leave default or add: `.docx`, `.xlsx`, `.csv`
6. Click **Create bucket**

✅ Done! Bucket created.

---

## Step 2: Run Migration SQL (30 seconds)

### If you already have a `bond_drafts` table:

**Run this SQL to add missing columns:**

```sql
-- Add missing JSONB columns
ALTER TABLE bond_drafts 
ADD COLUMN IF NOT EXISTS template_file JSONB,
ADD COLUMN IF NOT EXISTS maturity_file JSONB,
ADD COLUMN IF NOT EXISTS cusip_file JSONB,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bond_drafts'
AND column_name IN ('template_file', 'maturity_file', 'cusip_file', 'tag_map')
ORDER BY ordinal_position;
```

You should see output like:
```
template_file  | jsonb | YES
maturity_file  | jsonb | YES
cusip_file     | jsonb | YES
tag_map        | jsonb | YES
```

---

### If you DON'T have a `bond_drafts` table yet:

**Run the full migration:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire contents of `docs/supabase-migrations.sql`
3. Paste into SQL Editor
4. Click **Run**

You should see:
```
✅ SUCCESS: bond_drafts table exists
✅ SUCCESS: All file columns exist
```

---

## Step 3: Verify Setup (10 seconds)

Run this query to confirm everything is ready:

```sql
-- Should return TRUE for all checks
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'bond_drafts'
  ) as "table_exists",
  EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'bond_drafts' AND column_name = 'template_file'
  ) as "template_file_exists",
  EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'bond_drafts' AND column_name = 'maturity_file'
  ) as "maturity_file_exists",
  EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'bond_drafts' AND column_name = 'cusip_file'
  ) as "cusip_file_exists";
```

Expected output:
```
table_exists: true
template_file_exists: true
maturity_file_exists: true
cusip_file_exists: true
```

---

## Step 4: Restart Dev Server

```bash
# In terminal, kill the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 5: Test Upload

1. Go to http://localhost:3000/bond-generator/workbench
2. Upload a file
3. Check the terminal - you should see:
   ```
   [INFO] Saving bond draft
   [INFO] Bond draft saved successfully
   ```

**NO MORE ERRORS!** ✅

---

## 🆘 If It Still Fails

**Error:** "Column template_file does not exist"

**Solution:** The ALTER TABLE might not have worked. Try this instead:

```sql
-- Drop and recreate from scratch
DROP TABLE IF EXISTS bond_drafts CASCADE;

CREATE TABLE bond_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_step TEXT NOT NULL,
  template_file JSONB,
  maturity_file JSONB,
  cusip_file JSONB,
  tag_map JSONB,
  is_finalized BOOLEAN DEFAULT false,
  legal_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_bond_drafts_user_id ON bond_drafts(user_id);
CREATE INDEX idx_bond_drafts_updated ON bond_drafts(updated_at DESC);
```

Then restart your dev server and test again.

---

## ✅ Success Checklist

- [ ] Storage bucket `bond-generator-files` created in Supabase
- [ ] SQL migration ran without errors
- [ ] Columns verified to exist (template_file, maturity_file, cusip_file)
- [ ] Dev server restarted
- [ ] File upload works (no 500 error)
- [ ] Terminal shows "Bond draft saved successfully"

---

**Once all checked:** The bond generator auto-save will work! 🎉
