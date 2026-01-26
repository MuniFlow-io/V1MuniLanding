/**
 * Draft Files Restore API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - GET: Download specific file from draft (template, maturity, or cusip)
 * - Returns file blob directly
 * - Uses withApiAuth for authentication
 *
 * AUTH: App-level (withApiAuth) - User must be logged in
 *
 * Query params:
 * - draftId: Draft ID
 * - fileType: 'template' | 'maturity' | 'cusip'
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { getLatestDraft } from '@/lib/services/bond-generator/draftManager';
import { downloadFile } from '@/lib/services/bond-generator/fileStorageService';
import type { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.user.id;
  const { draftId, fileType } = req.query;

  if (!draftId || typeof draftId !== 'string') {
    return res.status(400).json({
      error: 'draftId query parameter is required',
      code: 'VALIDATION_ERROR',
    });
  }

  if (!fileType || !['template', 'maturity', 'cusip'].includes(fileType as string)) {
    return res.status(400).json({
      error: 'fileType must be: template, maturity, or cusip',
      code: 'VALIDATION_ERROR',
    });
  }

  try {
    logger.info('Restore draft file request', { userId, draftId, fileType });

    // Get draft to verify ownership and get storage path
    const draftResult = await getLatestDraft(userId);
    if (draftResult.error || !draftResult.data) {
      return res.status(404).json({
        error: 'Draft not found',
        code: 'NOT_FOUND',
      });
    }

    const draft = draftResult.data;
    if (draft.id !== draftId) {
      return res.status(403).json({
        error: 'Draft does not belong to user',
        code: 'FORBIDDEN',
      });
    }

    // Get storage path for requested file type
    let storagePath: string | undefined;
    let filename: string;
    let mimeType: string;

    if (fileType === 'template' && draft.template_file) {
      storagePath = draft.template_file.storage_path;
      filename = draft.template_file.filename;
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (fileType === 'maturity' && draft.maturity_file) {
      storagePath = draft.maturity_file.storage_path;
      filename = draft.maturity_file.filename;
      mimeType = filename.endsWith('.csv')
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (fileType === 'cusip' && draft.cusip_file) {
      storagePath = draft.cusip_file.storage_path;
      filename = draft.cusip_file.filename;
      mimeType = filename.endsWith('.csv')
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    if (!storagePath) {
      return res.status(404).json({
        error: `${fileType} file not found in draft`,
        code: 'FILE_NOT_FOUND',
      });
    }

    // Download file from storage
    const fileResult = await downloadFile(userId, storagePath);
    if (fileResult.error) {
      return res.status(500).json({
        error: fileResult.error.message || 'Failed to download file',
        code: fileResult.error.code,
      });
    }

    logger.info('Draft file downloaded successfully', { userId, draftId, fileType });

    // Return file blob
    const buffer = Buffer.from(await fileResult.data.arrayBuffer());
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    logger.error('Restore draft file failed', {
      userId,
      draftId,
      fileType,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to restore file',
      code: 'INTERNAL_ERROR',
    });
  }
}

export default withRequestId(withApiAuth(handler));
