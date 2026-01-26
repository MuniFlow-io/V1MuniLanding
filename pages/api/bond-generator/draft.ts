/**
 * Bond Draft API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - GET: Fetch user's latest draft
 * - POST: Save/update draft
 * - DELETE: Delete draft
 * - Uses withApiAuth for authentication
 * - Validates input with simple checks
 * - Calls draftManager service
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import {
  deleteDraft,
  getLatestDraft,
  saveDraft,
  type SaveDraftInput,
} from '@/lib/services/bond-generator/draftManager';
import type { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id;

  // GET: Fetch latest draft
  if (req.method === 'GET') {
    logger.info('GET /api/bond-generator/draft', { userId });

    const result = await getLatestDraft(userId);

    if (result.error) {
      return res.status(500).json({
        error: result.error.message || 'Failed to fetch draft',
        code: result.error.code,
      });
    }

    return res.status(200).json({ draft: result.data });
  }

  // POST: Save/update draft
  if (req.method === 'POST') {
    logger.info('POST /api/bond-generator/draft', { userId });

    const draftData = req.body as SaveDraftInput;

    // Basic validation
    if (!draftData.current_step) {
      return res.status(400).json({
        error: 'current_step is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const validSteps = [
      'upload-template',
      'tagging',
      'upload-data',
      'preview-data',
      'finality',
      'assembly-check',
      'generating',
      'complete',
    ];

    if (!validSteps.includes(draftData.current_step)) {
      return res.status(400).json({
        error: 'Invalid step value',
        code: 'VALIDATION_ERROR',
      });
    }

    // Pass draft_id if provided (for resume scenario)
    const result = await saveDraft(userId, draftData, draftData.draft_id);

    if (result.error) {
      return res.status(500).json({
        error: result.error.message || 'Failed to save draft',
        code: result.error.code,
      });
    }

    return res.status(200).json({ draft: result.data });
  }

  // DELETE: Delete draft
  if (req.method === 'DELETE') {
    logger.info('DELETE /api/bond-generator/draft', { userId });

    const { draftId } = req.query;

    if (!draftId || typeof draftId !== 'string') {
      return res.status(400).json({
        error: 'draftId query parameter is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await deleteDraft(userId, draftId);

    if (result.error) {
      return res.status(500).json({
        error: result.error.message || 'Failed to delete draft',
        code: result.error.code,
      });
    }

    return res.status(200).json({ success: true });
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withRequestId(withApiAuth(handler));
