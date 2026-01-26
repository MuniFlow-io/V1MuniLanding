/**
 * Bond Draft Manager Service
 *
 * ARCHITECTURE: Backend Service (Layer 5)
 * - Manages bond generator draft persistence
 * - Allows users to save and restore their progress
 * - Uses Supabase for storage
 * - Returns ServiceResult pattern
 * - Pure functions (userId is parameter, not from context)
 */

import { getSupabaseAdmin } from '@/lib/db';
import { failure, success, type ServiceResult } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import {
  downloadFile,
  uploadTemplateFile,
  uploadMaturityFile,
  uploadCusipFile,
  deleteDraftFiles,
} from './fileStorageService';

// Use admin client to bypass RLS (backend APIs handle auth)
const supabaseAdmin = getSupabaseAdmin();

/**
 * Bond draft data structure
 * Matches database schema for bond_drafts table
 */
export interface BondDraft {
  id: string;
  user_id: string;
  current_step: string;
  template_file: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string; // Supabase storage path
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
  tag_map: {
    templateId: string;
    templateHash: string;
    tags: Array<{ tag: string; position: number }>;
    filename: string;
    size: number;
  } | null;
  is_finalized: boolean;
  legal_accepted: boolean;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
}

/**
 * Draft data for saving (subset of BondDraft)
 */
export interface SaveDraftInput {
  current_step: string;
  template_file?: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string; // Supabase storage path
  } | null;
  maturity_file?: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string;
  } | null;
  cusip_file?: {
    filename: string;
    size: number;
    lastModified: number;
    storage_path?: string;
  } | null;
  tag_map?: {
    templateId: string;
    templateHash: string;
    tags: Array<{ tag: string; position: number }>;
    filename: string;
    size: number;
  } | null;
  is_finalized?: boolean;
  legal_accepted?: boolean;
  draft_id?: string; // Optional: ID of draft being updated (for resume)
}

/**
 * Get user's latest bond draft
 * Returns most recently updated draft for the user
 */
export async function getLatestDraft(userId: string): Promise<ServiceResult<BondDraft | null>> {
  try {
    logger.info('Fetching latest bond draft', { userId });

    const { data, error } = await supabaseAdmin
      .from('bond_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No draft found is not an error - return null
      if (error.code === 'PGRST116') {
        logger.info('No bond draft found for user', { userId });
        return success(null);
      }

      logger.error('Failed to fetch bond draft', { userId, error });
      return failure('DATABASE_ERROR', 'Failed to load saved progress', error);
    }

    // Type assertion: data structure matches BondDraft interface
    const draft = data as BondDraft;
    logger.info('Bond draft fetched successfully', { userId, draftId: draft.id });
    return success(draft);
  } catch (error) {
    logger.error('Unexpected error fetching bond draft', { userId, error });
    return failure('INTERNAL_ERROR', 'Unexpected error loading saved progress', error);
  }
}

/**
 * Save or update bond draft
 * If draftId provided: update that specific draft
 * If draftId not provided: always create NEW draft (don't update latest)
 */
export async function saveDraft(
  userId: string,
  draftData: SaveDraftInput,
  draftId?: string
): Promise<ServiceResult<BondDraft>> {
  try {
    logger.info('Saving bond draft', { userId, step: draftData.current_step, draftId });

    const draftToSave = {
      user_id: userId,
      current_step: draftData.current_step,
      template_file: draftData.template_file ?? null,
      maturity_file: draftData.maturity_file ?? null,
      cusip_file: draftData.cusip_file ?? null,
      tag_map: draftData.tag_map ?? null,
      is_finalized: draftData.is_finalized ?? false,
      legal_accepted: draftData.legal_accepted ?? false,
    };

    let data;
    let error;

    if (draftId) {
      // Update specific draft (resume scenario)
      const updateResult = await supabaseAdmin
        .from('bond_drafts')
        .update(draftToSave)
        .eq('id', draftId)
        .eq('user_id', userId) // Security: ensure user owns draft
        .select()
        .single();

      data = updateResult.data;
      error = updateResult.error;
    } else {
      // No draft ID provided → Always create NEW draft
      const insertResult = await supabaseAdmin
        .from('bond_drafts')
        .insert(draftToSave)
        .select()
        .single();

      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      logger.error('Failed to save bond draft', { userId, draftId, error });
      return failure('DATABASE_ERROR', 'Failed to save progress', error);
    }

    // Type assertion: data structure matches BondDraft interface
    const draft = data as BondDraft;
    logger.info('Bond draft saved successfully', { userId, draftId: draft.id });
    return success(draft);
  } catch (error) {
    logger.error('Unexpected error saving bond draft', { userId, draftId, error });
    return failure('INTERNAL_ERROR', 'Unexpected error saving progress', error);
  }
}

/**
 * Get all bond drafts for a user
 * Returns all drafts sorted by most recent
 */
export async function getAllDrafts(userId: string): Promise<ServiceResult<BondDraft[]>> {
  try {
    logger.info('Fetching all bond drafts', { userId });

    const { data, error } = await supabaseAdmin
      .from('bond_drafts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch bond drafts', { userId, error });
      return failure('DATABASE_ERROR', 'Failed to load saved progress', error);
    }

    // Type assertion: data structure matches BondDraft[] interface
    const drafts = (data || []) as BondDraft[];
    logger.info('Bond drafts fetched successfully', { userId, count: drafts.length });
    return success(drafts);
  } catch (error) {
    logger.error('Unexpected error fetching bond drafts', { userId, error });
    return failure('INTERNAL_ERROR', 'Unexpected error loading saved progress', error);
  }
}

/**
 * Delete bond draft
 * Removes draft from database AND storage files
 */
export async function deleteDraft(userId: string, draftId: string): Promise<ServiceResult<void>> {
  try {
    logger.info('Deleting bond draft', { userId, draftId });

    // Delete files from storage first
    const fileDeleteResult = await deleteDraftFiles(userId, draftId);
    if (fileDeleteResult.error) {
      logger.warn('Failed to delete draft files, continuing with database delete', {
        userId,
        draftId,
        error: fileDeleteResult.error,
      });
      // Continue anyway - database delete is more important
    }

    // Delete database record
    const { error } = await supabaseAdmin
      .from('bond_drafts')
      .delete()
      .eq('id', draftId)
      .eq('user_id', userId); // Ensure user owns this draft

    if (error) {
      logger.error('Failed to delete bond draft', { userId, draftId, error });
      return failure('DATABASE_ERROR', 'Failed to delete saved progress', error);
    }

    logger.info('Bond draft deleted successfully', { userId, draftId });
    return success(undefined);
  } catch (error) {
    logger.error('Unexpected error deleting bond draft', { userId, draftId, error });
    return failure('INTERNAL_ERROR', 'Unexpected error deleting saved progress', error);
  }
}

/**
 * Save draft WITH actual file uploads
 * Uploads files to storage and saves metadata to database
 */
export async function saveDraftWithFiles(
  userId: string,
  draftData: SaveDraftInput,
  files: {
    template?: File;
    maturity?: File;
    cusip?: File;
  }
): Promise<ServiceResult<BondDraft>> {
  try {
    // First, save or update the draft record to get a draft ID
    const draftResult = await saveDraft(userId, draftData, draftData.draft_id);
    if (draftResult.error) {
      return draftResult;
    }

    const draft = draftResult.data;
    const draftId = draft.id;

    logger.info('Uploading files for draft', {
      userId,
      draftId,
      hasTemplate: !!files.template,
      hasMaturity: !!files.maturity,
      hasCusip: !!files.cusip,
    });

    // Upload files in parallel
    const uploadPromises: Promise<ServiceResult<string>>[] = [];
    const fileTypes: ('template' | 'maturity' | 'cusip')[] = [];

    if (files.template) {
      uploadPromises.push(uploadTemplateFile(userId, draftId, files.template));
      fileTypes.push('template');
    }
    if (files.maturity) {
      uploadPromises.push(uploadMaturityFile(userId, draftId, files.maturity));
      fileTypes.push('maturity');
    }
    if (files.cusip) {
      uploadPromises.push(uploadCusipFile(userId, draftId, files.cusip));
      fileTypes.push('cusip');
    }

    const uploadResults = await Promise.all(uploadPromises);

    // Check for upload failures
    const failures = uploadResults.filter((r) => r.error);
    if (failures.length > 0) {
      logger.error('Some file uploads failed', {
        userId,
        draftId,
        failures: failures.map((f) => f.error),
      });
      // Continue anyway - partial save is better than no save
    }

    // Update draft with storage paths
    const updatedMetadata: Partial<SaveDraftInput> = {};
    uploadResults.forEach((result, index) => {
      if (result.data) {
        const fileType = fileTypes[index];
        const file = files[fileType];
        if (file) {
          if (fileType === 'template') {
            updatedMetadata.template_file = {
              filename: file.name,
              size: file.size,
              lastModified: file.lastModified,
              storage_path: result.data,
            };
          } else if (fileType === 'maturity') {
            updatedMetadata.maturity_file = {
              filename: file.name,
              size: file.size,
              lastModified: file.lastModified,
              storage_path: result.data,
            };
          } else if (fileType === 'cusip') {
            updatedMetadata.cusip_file = {
              filename: file.name,
              size: file.size,
              lastModified: file.lastModified,
              storage_path: result.data,
            };
          }
        }
      }
    });

    // Update draft with storage paths
    if (Object.keys(updatedMetadata).length > 0) {
      const finalUpdateResult = await saveDraft(
        userId,
        { ...draftData, ...updatedMetadata },
        draftId
      );
      if (!finalUpdateResult.error) {
        return finalUpdateResult;
      }
    }

    // Return original draft if no updates needed
    return success(draft);
  } catch (error) {
    logger.error('Unexpected error saving draft with files', { userId, error });
    return failure('INTERNAL_ERROR', 'Failed to save draft with files');
  }
}

/**
 * Restore files from storage for a draft
 * Downloads files and converts to File objects
 */
export async function restoreDraftFiles(
  userId: string,
  draft: BondDraft
): Promise<
  ServiceResult<{
    template?: File;
    maturity?: File;
    cusip?: File;
  }>
> {
  try {
    logger.info('Restoring draft files', { userId, draftId: draft.id });

    const files: {
      template?: File;
      maturity?: File;
      cusip?: File;
    } = {};

    // Download template if exists
    if (draft.template_file?.storage_path) {
      const result = await downloadFile(userId, draft.template_file.storage_path);
      if (result.data) {
        files.template = new File([result.data], draft.template_file.filename, {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          lastModified: draft.template_file.lastModified,
        });
      } else {
        logger.warn('Failed to restore template file', { userId, draftId: draft.id });
      }
    }

    // Download maturity if exists
    if (draft.maturity_file?.storage_path) {
      const result = await downloadFile(userId, draft.maturity_file.storage_path);
      if (result.data) {
        const isCSV = draft.maturity_file.filename.endsWith('.csv');
        files.maturity = new File([result.data], draft.maturity_file.filename, {
          type: isCSV
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          lastModified: draft.maturity_file.lastModified,
        });
      } else {
        logger.warn('Failed to restore maturity file', { userId, draftId: draft.id });
      }
    }

    // Download CUSIP if exists
    if (draft.cusip_file?.storage_path) {
      const result = await downloadFile(userId, draft.cusip_file.storage_path);
      if (result.data) {
        const isCSV = draft.cusip_file.filename.endsWith('.csv');
        files.cusip = new File([result.data], draft.cusip_file.filename, {
          type: isCSV
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          lastModified: draft.cusip_file.lastModified,
        });
      } else {
        logger.warn('Failed to restore CUSIP file', { userId, draftId: draft.id });
      }
    }

    logger.info('Draft files restored', {
      userId,
      draftId: draft.id,
      hasTemplate: !!files.template,
      hasMaturity: !!files.maturity,
      hasCusip: !!files.cusip,
    });

    return success(files);
  } catch (error) {
    logger.error('Unexpected error restoring draft files', { userId, draftId: draft.id, error });
    return failure('INTERNAL_ERROR', 'Failed to restore draft files');
  }
}
