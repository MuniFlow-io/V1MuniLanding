/**
 * Sign Up API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Creates new user account and signs them in
 * - Uses server-side Supabase client for cookie handling
 * - NO AUTH REQUIRED (creating new account)
 */

import { z } from 'zod';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/auth/supabaseServer';
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

    // Check if supabaseAdmin is configured
    if (!supabaseAdmin) {
      logger.error('Supabase admin client not configured');
      return res.status(500).json({ error: 'Authentication service not configured' });
    }

    // Step 1: Create user using admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now (no email verification)
    });

    if (createError) {
      logger.error('Supabase user creation failed', { 
        email, 
        error: createError.message 
      });
      return res.status(400).json({ 
        error: createError.message 
      });
    }

    if (!userData.user) {
      logger.error('No user returned from Supabase');
      return res.status(500).json({ 
        error: 'Failed to create account' 
      });
    }

    logger.info('User created successfully', { 
      userId: userData.user.id, 
      email: userData.user.email 
    });

    // Step 2: Sign them in immediately (auto-login after signup)
    logger.info('Auto-signing in new user', { userId: userData.user.id });
    
    // Create server client that sets cookies in response
    const supabase = createSupabaseServerClient(req, res);
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      logger.error('Auto sign-in failed after signup', { 
        userId: userData.user.id, 
        error: signInError.message 
      });
      // User was created but couldn't be signed in automatically
      // They can still sign in manually
      return res.status(201).json({
        success: true,
        message: 'Account created. Please sign in.',
        user: {
          id: userData.user.id,
          email: userData.user.email,
        },
      });
    }

    logger.info('User created and signed in successfully', { 
      userId: userData.user.id 
    });

    return res.status(201).json({
      success: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
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
