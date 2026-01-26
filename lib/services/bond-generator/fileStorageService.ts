/**
 * Bond Generator File Storage Service
 *
 * ARCHITECTURE: Backend Service (Layer 5)
 * - Uploads/downloads bond generator files to Supabase Storage
 * - Stores template, maturity, and CUSIP files for draft recovery
 * - Uses RLS policies for user-scoped access
 * - Pure functions (userId and draftId are parameters)
 *
 * STORAGE STRUCTURE:
 *   bond-generator-files/
 *     {user_id}/
 *       {draft_id}/
 *         template.docx
 *         maturity.xlsx (or .csv)
 *         cusip.xlsx (or .csv)
 */

import { supabaseAdmin } from '@/lib/db';
import { failure, success, type ServiceResult } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';

const BUCKET_NAME = 'bond-generator-files';

// Use admin client to bypass RLS (backend APIs handle auth)

/**
 * Build storage path for a file
 */
function buildPath(
  userId: string,
  draftId: string,
  fileType: 'template' | 'maturity' | 'cusip',
  filename: string
): string {
  const extension = filename.split('.').pop() || 'unknown';
  return `${userId}/${draftId}/${fileType}.${extension}`;
}

/**
 * Upload template file to storage
 */
export async function uploadTemplateFile(
  userId: string,
  draftId: string,
  file: File
): Promise<ServiceResult<string>> {
  try {
    const path = buildPath(userId, draftId, 'template', file.name);

    logger.info('Uploading template file', { userId, draftId, path, size: file.size });

    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      logger.error('Template upload failed', { userId, draftId, error: error.message });
      return failure('STORAGE_ERROR', `Failed to upload template: ${error.message}`);
    }

    const uploadPath = data.path as string;
    logger.info('Template uploaded successfully', { userId, draftId, path: uploadPath });
    return success(uploadPath);
  } catch (error) {
    logger.error('Unexpected error uploading template', { userId, draftId, error });
    return failure('INTERNAL_ERROR', 'Failed to upload template file');
  }
}

/**
 * Upload maturity file to storage
 */
export async function uploadMaturityFile(
  userId: string,
  draftId: string,
  file: File
): Promise<ServiceResult<string>> {
  try {
    const path = buildPath(userId, draftId, 'maturity', file.name);

    logger.info('Uploading maturity file', { userId, draftId, path, size: file.size });

    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      logger.error('Maturity upload failed', { userId, draftId, error: error.message });
      return failure('STORAGE_ERROR', `Failed to upload maturity: ${error.message}`);
    }

    const uploadPath = data.path as string;
    logger.info('Maturity file uploaded successfully', { userId, draftId, path: uploadPath });
    return success(uploadPath);
  } catch (error) {
    logger.error('Unexpected error uploading maturity', { userId, draftId, error });
    return failure('INTERNAL_ERROR', 'Failed to upload maturity file');
  }
}

/**
 * Upload CUSIP file to storage
 */
export async function uploadCusipFile(
  userId: string,
  draftId: string,
  file: File
): Promise<ServiceResult<string>> {
  try {
    const path = buildPath(userId, draftId, 'cusip', file.name);

    logger.info('Uploading CUSIP file', { userId, draftId, path, size: file.size });

    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      logger.error('CUSIP upload failed', { userId, draftId, error: error.message });
      return failure('STORAGE_ERROR', `Failed to upload CUSIP: ${error.message}`);
    }

    const uploadPath = data.path as string;
    logger.info('CUSIP file uploaded successfully', { userId, draftId, path: uploadPath });
    return success(uploadPath);
  } catch (error) {
    logger.error('Unexpected error uploading CUSIP', { userId, draftId, error });
    return failure('INTERNAL_ERROR', 'Failed to upload CUSIP file');
  }
}

/**
 * Download file from storage
 * Returns file blob that can be converted to File object
 */
export async function downloadFile(
  userId: string,
  storagePath: string
): Promise<ServiceResult<Blob>> {
  try {
    logger.info('Downloading file', { userId, path: storagePath });

    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).download(storagePath);

    if (error) {
      logger.error('File download failed', { userId, path: storagePath, error: error.message });
      return failure('STORAGE_ERROR', `Failed to download file: ${error.message}`);
    }

    if (!data) {
      logger.error('No data returned from download', { userId, path: storagePath });
      return failure('STORAGE_ERROR', 'File not found');
    }

    const blob = data as Blob;
    logger.info('File downloaded successfully', { userId, path: storagePath, size: blob.size });
    return success(blob);
  } catch (error) {
    logger.error('Unexpected error downloading file', { userId, path: storagePath, error });
    return failure('INTERNAL_ERROR', 'Failed to download file');
  }
}

/**
 * Delete all files for a draft
 */
export async function deleteDraftFiles(
  userId: string,
  draftId: string
): Promise<ServiceResult<void>> {
  try {
    const folderPath = `${userId}/${draftId}`;

    logger.info('Deleting draft files', { userId, draftId, folderPath });

    // List all files in draft folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (listError) {
      logger.error('Failed to list draft files', { userId, draftId, error: listError.message });
      return failure('STORAGE_ERROR', `Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      logger.info('No files to delete', { userId, draftId });
      return success(undefined);
    }

    // Delete all files
    const filePaths = files.map((f) => `${folderPath}/${f.name}`);
    const { error: deleteError } = await supabaseAdmin.storage.from(BUCKET_NAME).remove(filePaths);

    if (deleteError) {
      logger.error('Failed to delete draft files', { userId, draftId, error: deleteError.message });
      return failure('STORAGE_ERROR', `Failed to delete files: ${deleteError.message}`);
    }

    logger.info('Draft files deleted successfully', { userId, draftId, count: filePaths.length });
    return success(undefined);
  } catch (error) {
    logger.error('Unexpected error deleting draft files', { userId, draftId, error });
    return failure('INTERNAL_ERROR', 'Failed to delete draft files');
  }
}
