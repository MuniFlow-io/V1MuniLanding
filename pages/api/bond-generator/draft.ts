/**
 * Bond Draft API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - GET: Fetch user's latest draft
 * - POST: Save/update draft (requires auth)
 * - DELETE: Delete draft (requires auth)
 * 
 * AUTH STRATEGY:
 * - GET: Allow anonymous users (returns null if not logged in)
 * - POST/DELETE: Require authentication
 * 
 * This supports freemium model:
 * - Anonymous users can explore (no draft saving)
 * - Logged-in users get draft persistence
 */

import { createSupabaseServerClient } from '@/lib/auth/supabaseServer';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import {
  deleteDraft,
  getLatestDraft,
  saveDraft,
  type SaveDraftInput,
} from '@/lib/services/bond-generator/draftManager';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for session (but don't require it for GET)
  const supabase = createSupabaseServerClient(req, res);
  const { data: { session } } = await supabase.auth.getSession();
  
  const userId = session?.user?.id;

  // GET: Fetch latest draft (allowed for anonymous users)
  if (req.method === 'GET') {
    // If no user session, return null (no draft for anonymous users)
    if (!userId) {
      logger.info('GET /api/bond-generator/draft - anonymous user');
      return res.status(200).json({ draft: null });
    }

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

  // POST: Save/update draft (requires auth)
  if (req.method === 'POST') {
    // POST requires authentication
    if (!userId) {
      logger.warn('POST /api/bond-generator/draft - unauthorized');
      return res.status(401).json({ 
        error: 'Authentication required to save drafts',
        code: 'UNAUTHORIZED'
      });
    }

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

  // DELETE: Delete draft (requires auth)
  if (req.method === 'DELETE') {
    // DELETE requires authentication
    if (!userId) {
      logger.warn('DELETE /api/bond-generator/draft - unauthorized');
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }

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

// No withApiAuth - we handle auth manually to support freemium
export default withRequestId(handler);
