# 🔧 Database Schema Fix - Bond Generator

**Issue:** Database schema mismatch causing "Could not find 'cusip_file' column" errors

**Root Cause:** Migration SQL used separate `bond_draft_files` table, but code expects JSONB columns in `bond_drafts` table (ProMuni design)

---

## ✅ Fixed Migration SQL

The migration has been updated to match the ProMuni schema:

**File:** `docs/supabase-migrations.sql`

**Changes:**
- ✅ Added `template_file JSONB` column
- ✅ Added `maturity_file JSONB` column  
- ✅ Added `cusip_file JSONB` column
- ✅ Added `last_accessed_at TIMESTAMP` column
- ✅ Removed `bond_draft_files` table (not needed)

---

## 🚀 How to Apply Fix

### Option 1: Fresh Supabase Project (Recommended if possible)

1. **Drop existing table** (if you created it already):
```sql
DROP TABLE IF EXISTS bond_draft_files CASCADE;
DROP TABLE IF EXISTS bond_drafts CASCADE;
```

2. **Run updated migration**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy entire contents of `docs/supabase-migrations.sql`
   - Paste and run

3. **Verify columns exist**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bond_drafts'
ORDER BY ordinal_position;
```

You should see:
- `template_file` → `jsonb`
- `maturity_file` → `jsonb`
- `cusip_file` → `jsonb`
- `tag_map` → `jsonb`
- `last_accessed_at` → `timestamp with time zone`

---

### Option 2: Add Missing Columns (If table already has data)

If you already have a `bond_drafts` table and don't want to drop it:

```sql
-- Add missing JSONB columns
ALTER TABLE bond_drafts 
ADD COLUMN IF NOT EXISTS template_file JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS maturity_file JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cusip_file JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update tag_map if it exists
ALTER TABLE bond_drafts 
ALTER COLUMN tag_map SET DEFAULT NULL,
ALTER COLUMN tag_map DROP NOT NULL;

-- Add comments
COMMENT ON COLUMN bond_drafts.template_file IS 'Template file metadata (JSONB): { filename, size, lastModified, storage_path }';
COMMENT ON COLUMN bond_drafts.maturity_file IS 'Maturity schedule file metadata (JSONB)';
COMMENT ON COLUMN bond_drafts.cusip_file IS 'CUSIP schedule file metadata (JSONB)';

-- Drop bond_draft_files table if it exists (not needed)
DROP TABLE IF EXISTS bond_draft_files CASCADE;
```

---

## 📊 Schema Structure (ProMuni Design)

### `bond_drafts` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | TEXT | User ID (guest-user for now) |
| `current_step` | TEXT | Current workflow step |
| **`template_file`** | **JSONB** | Template metadata `{ filename, size, lastModified, storage_path }` |
| **`maturity_file`** | **JSONB** | Maturity file metadata |
| **`cusip_file`** | **JSONB** | CUSIP file metadata |
| `tag_map` | JSONB | Tag assignments |
| `is_finalized` | BOOLEAN | Locked inputs? |
| `legal_accepted` | BOOLEAN | Legal disclaimer accepted? |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |
| **`last_accessed_at`** | **TIMESTAMP** | Last access time |

### File Storage

- **Metadata:** JSONB columns in `bond_drafts` table
- **Actual Files:** Supabase Storage bucket `bond-generator-files/`
- **Path Structure:** `{user_id}/{draft_id}/{file_type}.{extension}`

Example:
```
bond-generator-files/
  guest-user/
    abc-123-uuid/
      template.docx
      maturity.xlsx
      cusip.xlsx
```

---

## 🧪 Test After Fix

1. **Restart dev server** (files may be cached):
```bash
# Kill current server
# Then restart:
npm run dev
```

2. **Try uploading a file** in bond generator

3. **Check terminal** - should see:
```
[INFO] Saving bond draft
[INFO] Bond draft saved successfully
```

No more "Could not find 'cusip_file' column" errors!

---

## ❓ Why This Design?

### ProMuni Approach (JSONB columns):
- ✅ Simple queries (no joins needed)
- ✅ Atomic updates (all data in one row)
- ✅ Fast reads (single SELECT)
- ✅ Perfect for draft auto-save

### Example JSONB Data:
```json
{
  "filename": "bond-template.docx",
  "size": 45678,
  "lastModified": 1706284800000,
  "storage_path": "guest-user/abc-123/template.docx"
}
```

---

## 🔄 What Got Fixed

**Before (Broken):**
```
Code expects:     bond_drafts.template_file (JSONB)
Database has:     bond_drafts (no such column) ❌
Error:            "Could not find 'cusip_file' column"
```

**After (Fixed):**
```
Code expects:     bond_drafts.template_file (JSONB) ✅
Database has:     bond_drafts.template_file (JSONB) ✅
Result:           Auto-save works! ✅
```

---

## 📝 Next Steps

After applying migration:

1. ✅ Test file upload
2. ✅ Verify auto-save works (check Network tab in browser)
3. ✅ Test draft restoration (refresh page, should restore state)
4. ✅ Continue building UI components

---

**Fixed by:** Bridge Agent  
**Date:** January 26, 2026  
**Status:** ✅ Ready to apply
