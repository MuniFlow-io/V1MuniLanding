-- ============================================================================
-- MuniLanding Database Schema
-- Created: 2026-01-26
-- Purpose: Bond Generator feature tables
-- ============================================================================

-- ============================================================================
-- 1. BOND DRAFTS TABLE
-- Stores user's bond generator progress (auto-save every 2 seconds)
-- SCHEMA: Matches ProMuni implementation with JSONB file metadata columns
-- ============================================================================

-- Drop existing table if you need a fresh start
-- DROP TABLE IF EXISTS bond_drafts CASCADE;

-- Drop old table if exists (clean slate)
DROP TABLE IF EXISTS bond_drafts CASCADE;

-- Create table with all required columns
CREATE TABLE bond_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_step TEXT NOT NULL CHECK (current_step IN (
    'upload-template',
    'tagging',
    'upload-data',
    'preview-data',
    'assembly-check',
    'generating',
    'complete'
  )),
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

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bond_drafts_user_id ON bond_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_bond_drafts_updated ON bond_drafts(updated_at DESC);

-- ============================================================================
-- 3. AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bond_drafts_updated_at ON bond_drafts;
CREATE TRIGGER update_bond_drafts_updated_at
BEFORE UPDATE ON bond_drafts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check if table exists
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'bond_drafts';
  
  IF v_count > 0 THEN
    RAISE NOTICE '✅ SUCCESS: bond_drafts table exists';
    
    -- Check for required columns
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'bond_drafts'
    AND column_name IN ('template_file', 'maturity_file', 'cusip_file');
    
    IF v_count = 3 THEN
      RAISE NOTICE '✅ SUCCESS: All file columns exist (template_file, maturity_file, cusip_file)';
    ELSE
      RAISE WARNING '⚠️ WARNING: Some file columns are missing';
    END IF;
  ELSE
    RAISE EXCEPTION '❌ FAILED: bond_drafts table was not created';
  END IF;
END $$;

-- ============================================================================
-- 5. SAMPLE QUERY (Test)
-- ============================================================================
-- Uncomment to verify schema:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'bond_drafts'
-- ORDER BY ordinal_position;

-- ============================================================================
-- NOTES:
-- 
-- File Storage Structure:
--   - Metadata: JSONB columns in bond_drafts table
--   - Actual files: Supabase Storage bucket 'bond-generator-files'
--   - Path: {user_id}/{draft_id}/{file_type}.{extension}
--
-- JSONB Structure for file columns:
--   {
--     "filename": "template.docx",
--     "size": 45678,
--     "lastModified": 1706284800000,
--     "storage_path": "guest-user/abc-123-uuid/template.docx"
--   }
--
-- Storage Bucket Setup (Manual):
--   1. Go to Supabase Dashboard → Storage
--   2. Create new bucket: 'bond-generator-files'
--   3. Make it PRIVATE (not public)
--   4. File size limit: 50 MB
--   5. Allowed types: .docx, .xlsx, .csv
--
-- ============================================================================
