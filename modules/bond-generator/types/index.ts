/**
 * Bond Generator Types
 * Type definitions for bond generation module
 */

// Re-export maturity preview types
export type {
  CellEditState,
  EditableField,
  MaturitySchedulePreview,
  ParsedMaturityRow,
  RowStatus,
} from './maturityPreview';

export interface AssembledBond {
  bond_number: string;
  series?: string;
  maturity_date: string;
  principal_amount: number;
  principal_words: string;
  coupon_rate: number;
  cusip_no: string;
  dated_date: string;
}

export interface TagPosition {
  tag: string;
  position: number;
}

export interface TagMap {
  templateId: string;
  templateHash: string;
  tags: TagPosition[];
  filename: string;
  size: number;
}

export interface BondGeneratorState {
  templateFile: File | null;
  maturityFile: File | null;
  cusipFile: File | null;
  tagMap: TagMap | null;
  assembledBonds: AssembledBond[] | null;
  isLoading: boolean;
  error: string | null;
  isFinalized: boolean;
}

export type BondGeneratorStep =
  | 'upload-template' // Step 1: Upload bond form only
  | 'tagging' // Step 2: Tag template
  | 'upload-data' // Step 3: Upload maturity + CUSIP
  | 'preview-data' // Step 4: Preview parsed data with inline editing
  | 'assembly-check' // Step 5: Final review & confirmation
  | 'generating' // Step 6: Generate
  | 'complete'; // Step 7: Complete

/**
 * Bond draft - saved progress in database
 * Allows users to resume work after leaving
 */
export interface BondDraft {
  id: string;
  user_id: string;
  current_step: BondGeneratorStep;
  template_file: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string;
  } | null;
  maturity_file: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string;
  } | null;
  cusip_file: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string;
  } | null;
  tag_map: TagMap | null;
  assembled_bonds?: AssembledBond[]; // Store assembled bond data for recovery
  is_finalized: boolean;
  legal_accepted: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
}

// Re-export tag constants (not types - actual constants)
export {
  getTagDisplayName,
  isRequiredTag,
  isValidTag,
  OPTIONAL_TAGS,
  REQUIRED_TAGS,
  TAG_HINTS,
  TAG_OPTIONS,
  type BondTag,
  type OptionalTag,
  type RequiredTag,
} from './tagConstants';
