/**
 * Sign Up API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Creates new user account
 * - Calls Supabase auth service
 * - Sets auth cookie
 * - NO AUTH REQUIRED (creating new account)
 * 
 * ELITE STANDARDS:
 * - ZOD validation
 * - Proper logging
 * - Error handling
 * - <150 lines
 */

import { z } from 'zod';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const parseResult = signUpSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      logger.warn('Sign up validation failed', { 
        errors: parseResult.error.flatten() 
      });
      return res.status(400).json({ 
        error: 'Invalid input',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parseResult.data;

    logger.info('Sign up request', { email });

    // Call Supabase auth service
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now (no email verification)
    });

    if (error) {
      logger.error('Supabase sign up failed', { 
        email, 
        error: error.message 
      });
      return res.status(400).json({ 
        error: error.message 
      });
    }

    if (!data.user) {
      logger.error('No user returned from Supabase');
      return res.status(500).json({ 
        error: 'Failed to create account' 
      });
    }

    logger.info('User created successfully', { 
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
    logger.error('Sign up failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export default withRequestId(handler);
