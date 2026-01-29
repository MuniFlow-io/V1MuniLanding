/**
 * Session Check API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Checks if user has valid session
 * - Uses server-side Supabase client to read cookies
 * - Returns user data if authenticated
 * - NO AUTH REQUIRED (checking session)
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/auth/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create server client that reads cookies from request
    const supabase = createSupabaseServerClient(req, res);

    // Read session from cookies
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Session check failed', { error: error.message });
      return res.status(500).json({ error: error.message });
    }

    if (!session) {
      return res.status(200).json({ session: null });
    }

    logger.info('Session validated', { userId: session.user.id });

    return res.status(200).json({
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
    });
  } catch (error) {
    logger.error('Session check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withRequestId(handler);
