-- Migration: Add assembled_bonds column to bond_drafts table
-- Date: 2026-01-27
-- Purpose: Persist assembled bond data so users can resume after signup/refresh

-- Add assembled_bonds JSONB column
ALTER TABLE bond_drafts 
ADD COLUMN IF NOT EXISTS assembled_bonds JSONB;

-- Add comment for documentation
COMMENT ON COLUMN bond_drafts.assembled_bonds IS 'Assembled bond data array - preserves bonds after assembly step so user can resume after signup/refresh';
