/**
 * Session API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Gets current user session
 * - Calls Supabase auth service
 * - Returns user data if authenticated
 * - NO AUTH REQUIRED (checking session)
 * 
 * ELITE STANDARDS:
 * - Proper logging
 * - Error handling
 * - <100 lines
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call Supabase auth service
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Session check failed', { error: error.message });
      return res.status(500).json({ error: error.message });
    }

    if (!session || !session.user) {
      return res.status(200).json({ session: null });
    }

    logger.info('Session retrieved', { userId: session.user.id });

    return res.status(200).json({
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
    });
  } catch (error) {
    logger.error('Session check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withRequestId(handler);
