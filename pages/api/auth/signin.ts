/**
 * Sign In API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Authenticates existing user
 * - Uses server-side Supabase client for cookie handling
 * - Sets auth cookie via Supabase SSR
 * - NO AUTH REQUIRED (creating session)
 */

import { z } from 'zod';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { createSupabaseServerClient } from '@/lib/auth/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const parseResult = signInSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      logger.warn('Sign in validation failed', { 
        errors: parseResult.error.flatten() 
      });
      return res.status(400).json({ 
        error: 'Invalid input',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parseResult.data;

    logger.info('Sign in request', { email });

    // Create server client that sets cookies in response
    const supabase = createSupabaseServerClient(req, res);

    // Authenticate user (cookies set automatically via server client)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Sign in failed', { 
        email, 
        error: error.message 
      });
      return res.status(401).json({ 
        error: error.message 
      });
    }

    if (!data.user || !data.session) {
      logger.error('No user/session returned from Supabase');
      return res.status(500).json({ 
        error: 'Failed to sign in' 
      });
    }

    logger.info('User signed in successfully', { 
      userId: data.user.id,
      email: data.user.email 
    });

    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    logger.error('Sign in failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withRequestId(handler);
