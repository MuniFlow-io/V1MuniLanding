/**
 * Sign Out API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Signs out current user
 * - Uses server-side Supabase client for cookie clearing
 * - Clears auth cookie
 * - NO AUTH REQUIRED (destroying session)
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/auth/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create server client that clears cookies from response
    const supabase = createSupabaseServerClient(req, res);

    // Sign out (cookies cleared automatically via server client)
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign out failed', { error: error.message });
      return res.status(500).json({ error: error.message });
    }

    logger.info('User signed out successfully');

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Sign out error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withRequestId(handler);
