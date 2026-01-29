/**
 * Bond Drafts List API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - GET: Fetch all user's drafts
 * - Uses withApiAuth for authentication
 * - Calls backend service
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { getAllDrafts } from '@/lib/services/bond-generator/draftManager';
import type { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const userId = req.user.id;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info('GET /api/bond-generator/drafts', { userId });

  const result = await getAllDrafts(userId);

  if (result.error) {
    return res.status(500).json({
      error: result.error.message || 'Failed to fetch drafts',
      code: result.error.code,
    });
  }

  return res.status(200).json({ drafts: result.data });
}

export default withRequestId(withApiAuth(handler));
