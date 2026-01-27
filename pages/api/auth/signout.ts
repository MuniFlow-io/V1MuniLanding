/**
 * Sign Out API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Signs out current user
 * - Calls Supabase auth service
 * - Clears auth cookie
 * - NO AUTH REQUIRED (clearing session)
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Sign out request');

    // Call Supabase auth service
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign out failed', { error: error.message });
      return res.status(500).json({ error: error.message });
    }

    logger.info('User signed out successfully');

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Sign out failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withRequestId(handler);
