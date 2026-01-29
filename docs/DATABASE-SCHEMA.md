# Database Schema Guide

**Purpose:** MuniFlow database structure and design patterns  
**Last Updated:** January 2026

---

## 🗄️ Database Provider

MuniFlow uses **Supabase** (PostgreSQL) for:
- User data storage
- Bond generator drafts
- File metadata (files stored in Supabase Storage)
- Authentication (built-in)

---

## 📋 Core Tables

### `bond_drafts` Table

Stores in-progress bond generation sessions with auto-save.

```sql
CREATE TABLE bond_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_step TEXT NOT NULL,
  
  -- File metadata (JSONB columns)
  template_file JSONB,
  maturity_file JSONB,
  cusip_file JSONB,
  
  -- Tag assignments
  tag_map JSONB,
  
  -- State flags
  is_finalized BOOLEAN DEFAULT false,
  legal_accepted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bond_drafts_user_id ON bond_drafts(user_id);
CREATE INDEX idx_bond_drafts_updated ON bond_drafts(updated_at DESC);
```

---

## 🎯 Design Pattern: JSONB for File Metadata

### Why JSONB Instead of Separate Table?

**Traditional Approach (Rejected):**
```sql
-- ❌ NOT USED
CREATE TABLE bond_draft_files (
  id UUID PRIMARY KEY,
  draft_id UUID REFERENCES bond_drafts(id),
  file_type TEXT,
  file_name TEXT,
  file_path TEXT,
  created_at TIMESTAMP
);
```

**MuniFlow Approach (JSONB columns):**
```sql
-- ✅ USED
ALTER TABLE bond_drafts 
ADD COLUMN template_file JSONB,
ADD COLUMN maturity_file JSONB,
ADD COLUMN cusip_file JSONB;
```

### Benefits of JSONB Approach

1. **Simple Queries** - No joins needed
   ```typescript
   // Single SELECT gets everything
   const draft = await supabase
     .from('bond_drafts')
     .select('*')
     .eq('id', draftId)
     .single();
   
   // Access file metadata directly
   const templateFile = draft.template_file;
   ```

2. **Atomic Updates** - All data in one row
   ```typescript
   // Update everything in one transaction
   await supabase
     .from('bond_drafts')
     .update({
       template_file: { filename: 'bond.docx', size: 45678 },
       maturity_file: { filename: 'schedule.xlsx', size: 12345 },
       current_step: 'tagging',
     })
     .eq('id', draftId);
   ```

3. **Fast Reads** - Single SELECT
   - No join overhead
   - Perfect for auto-save pattern
   - Optimized for read-heavy workflows

4. **Flexible Schema** - JSONB can store any metadata
   ```json
   {
     "filename": "bond-template.docx",
     "size": 45678,
     "lastModified": 1706284800000,
     "storage_path": "guest-user/abc-123/template.docx",
     "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
   }
   ```

---

## 📁 File Storage Structure

### Supabase Storage Bucket: `bond-generator-files`

**Settings:**
- Public: NO (private bucket)
- File size limit: 50 MB
- Allowed types: `.docx`, `.xlsx`, `.csv`

**Path Structure:**
```
bond-generator-files/
  {user_id}/
    {draft_id}/
      template.docx
      maturity.xlsx
      cusip.xlsx
```

**Example:**
```
bond-generator-files/
  guest-user/
    abc-123-uuid/
      template.docx
      maturity.xlsx
      cusip.xlsx
  user-456-uuid/
    def-789-uuid/
      template.docx
      maturity.xlsx
      cusip.xlsx
```

---

## 🔄 Draft Auto-Save Pattern

### How It Works

1. **User makes change** (uploads file, tags template, etc.)
2. **Debounce 2 seconds** (wait for inactivity)
3. **Save to database**
   - Upload files to Storage (if new/changed)
   - Save file metadata to JSONB columns
   - Update `current_step`, `tag_map`, etc.
   - Update `updated_at` timestamp
4. **On mount** → Load latest draft for user

### Implementation

```typescript
// modules/bond-generator/hooks/useBondGenerator.ts
const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Clear previous timeout
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  // Debounce 2 seconds
  saveTimeoutRef.current = setTimeout(async () => {
    await saveDraftWithFilesApi(userId, {
      current_step: step,
      template_file: templateFile,
      maturity_file: maturityFile,
      cusip_file: cusipFile,
      tag_map: tagMap,
      is_finalized: isFinalized,
    });
  }, 2000);
  
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [step, templateFile, maturityFile, cusipFile, tagMap, isFinalized]);
```

---

## 📊 Column Details

### `current_step`

Tracks workflow progress:
- `'upload-template'` - User uploading bond template
- `'tagging'` - User assigning tags to template
- `'upload-data'` - User uploading maturity/CUSIP schedules
- `'preview-data'` - User reviewing parsed data
- `'assembly-check'` - User confirming bond assembly
- `'generating'` - Bonds being generated
- `'complete'` - Generation finished

### `template_file` (JSONB)

```json
{
  "filename": "bond-template.docx",
  "size": 45678,
  "lastModified": 1706284800000,
  "storage_path": "guest-user/abc-123/template.docx"
}
```

### `maturity_file` (JSONB)

```json
{
  "filename": "maturity-schedule.xlsx",
  "size": 12345,
  "lastModified": 1706284800000,
  "storage_path": "guest-user/abc-123/maturity.xlsx"
}
```

### `cusip_file` (JSONB)

```json
{
  "filename": "cusip-schedule.xlsx",
  "size": 9876,
  "lastModified": 1706284800000,
  "storage_path": "guest-user/abc-123/cusip.xlsx"
}
```

### `tag_map` (JSONB)

```json
{
  "templateId": "bond-template.docx",
  "templateHash": "abc123...",
  "tags": [
    { "tag": "CUSIP", "position": 125 },
    { "tag": "Principal", "position": 256 },
    { "tag": "Rate", "position": 387 }
  ],
  "filename": "bond-template.docx",
  "size": 45678
}
```

### `is_finalized`

- `false` - User can still edit (default)
- `true` - User locked inputs (rare, future feature)

### `legal_accepted`

- `false` - User hasn't accepted legal disclaimer
- `true` - User accepted legal disclaimer (required to proceed)

---

## 🔧 Service Layer Pattern

### How to Query Database

```typescript
// lib/services/bond-generator/draftManager.ts

export async function saveBondDraft(
  userId: string,
  draftData: Partial<BondDraft>
): Promise<ServiceResult<BondDraft>> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Upsert (insert or update)
    const { data, error } = await supabaseAdmin
      .from('bond_drafts')
      .upsert({
        user_id: userId,
        ...draftData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Key Principles:**
- ✅ Always use `supabaseAdmin` in backend (bypasses RLS)
- ✅ Always include `userId` parameter (auth is middleware's job)
- ✅ Return `ServiceResult<T>` pattern (no throwing errors)
- ✅ Use `.single()` for single row queries
- ✅ Use `.select()` after insert/update to get result

---

## 🔐 Row Level Security (RLS)

### Current Status: RLS Disabled

We use **Admin client** (`supabaseAdmin`) which **bypasses RLS**.

**Why?**
- Simpler than managing RLS policies
- Auth handled by middleware (`withApiAuth`)
- Service functions receive `userId` as parameter
- Better performance (no policy evaluation overhead)

**Example:**
```typescript
// Backend API
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // withApiAuth already verified user
  const userId = req.user.id;
  
  // Pass userId to service (service trusts it)
  const result = await saveBondDraft(userId, draftData);
  
  return res.json(result);
}

export default withApiAuth(handler);  // ← Auth happens here
```

### If You Want RLS Later

```sql
-- Enable RLS
ALTER TABLE bond_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own drafts
CREATE POLICY "Users can view own drafts"
  ON bond_drafts
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can only update their own drafts
CREATE POLICY "Users can update own drafts"
  ON bond_drafts
  FOR UPDATE
  USING (auth.uid()::text = user_id);
```

**Then use regular Supabase client instead of Admin:**
```typescript
import { supabase } from '@/lib/supabase';  // Regular client

const { data } = await supabase
  .from('bond_drafts')
  .select('*')
  .eq('user_id', userId);  // RLS policy will enforce this
```

---

## 🧹 Data Cleanup (Future)

### Stale Draft Cleanup (Not Implemented Yet)

Recommended: Delete drafts older than 30 days

```typescript
async function cleanupExpiredDrafts() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Delete old drafts
  const { data: deletedDrafts } = await supabaseAdmin
    .from('bond_drafts')
    .delete()
    .lt('updated_at', thirtyDaysAgo.toISOString())
    .select('id');
  
  // Delete associated files from storage
  for (const draft of deletedDrafts || []) {
    await deleteStorageFolder(`bond-generator-files/${draft.user_id}/${draft.id}`);
  }
}
```

**Run via:**
- Supabase Edge Function (cron)
- Vercel Cron Job
- GitHub Actions scheduled workflow

---

## 📝 Migration Scripts

### Location

All migrations are in `docs/supabase-migrations.sql`

### How to Apply

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-migrations.sql`
3. Paste and run
4. Verify with:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'bond_drafts'
   ORDER BY ordinal_position;
   ```

### Expected Columns

- `id` → `uuid`
- `user_id` → `text`
- `current_step` → `text`
- `template_file` → `jsonb` ✅
- `maturity_file` → `jsonb` ✅
- `cusip_file` → `jsonb` ✅
- `tag_map` → `jsonb`
- `is_finalized` → `boolean`
- `legal_accepted` → `boolean`
- `created_at` → `timestamp with time zone`
- `updated_at` → `timestamp with time zone`
- `last_accessed_at` → `timestamp with time zone` ✅

---

## 🎯 Quick Reference

| Task | Method | File |
|------|--------|------|
| Save draft | `saveBondDraft()` | `lib/services/bond-generator/draftManager.ts` |
| Load draft | `loadLatestDraft()` | `lib/services/bond-generator/draftManager.ts` |
| Upload file | `uploadFileToStorage()` | `lib/services/bond-generator/fileStorageService.ts` |
| Delete draft | `deleteBondDraft()` | `lib/services/bond-generator/draftManager.ts` |

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Update `updated_at`

```typescript
// ❌ WRONG
await supabaseAdmin
  .from('bond_drafts')
  .update({ current_step: 'tagging' })
  .eq('id', draftId);

// ✅ CORRECT
await supabaseAdmin
  .from('bond_drafts')
  .update({
    current_step: 'tagging',
    updated_at: new Date().toISOString(),  // ← Don't forget!
  })
  .eq('id', draftId);
```

### 2. Not Using `.single()` for Single Row

```typescript
// ❌ WRONG - Returns array
const { data } = await supabaseAdmin
  .from('bond_drafts')
  .select('*')
  .eq('id', draftId);

// data is BondDraft[] not BondDraft
const draft = data[0];  // Need to access array

// ✅ CORRECT - Returns single object
const { data: draft } = await supabaseAdmin
  .from('bond_drafts')
  .select('*')
  .eq('id', draftId)
  .single();  // ← Returns object directly

// draft is BondDraft (not array)
```

### 3. Storing Files in JSONB (Too Large)

```typescript
// ❌ WRONG - Don't store file content in database
const draft = {
  template_file: {
    filename: 'bond.docx',
    content: base64FileContent,  // ❌ Too large for JSONB!
  },
};

// ✅ CORRECT - Store file in Storage, metadata in JSONB
const storagePath = await uploadToStorage(file);
const draft = {
  template_file: {
    filename: 'bond.docx',
    size: file.size,
    storage_path: storagePath,  // ✅ Just the path
  },
};
```

---

**Remember:** Use JSONB for **metadata**, use Supabase Storage for **file content**.
