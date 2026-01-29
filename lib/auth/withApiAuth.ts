/**
 * Backend API Middleware - Authentication Guard
 * 
 * ARCHITECTURE: Backend Middleware (Layer 4)
 * - Wraps API route handlers to enforce authentication
 * - Uses server-side Supabase client to read cookies
 * - Attaches user object to request
 * - Returns 401 if not authenticated
 * 
 * USAGE:
 * ```typescript
 * export default withApiAuth(handler);
 * ```
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseServerClient } from './supabaseServer';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
  };
}

export type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

export function withApiAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Create server client that reads cookies from request
      const supabase = createSupabaseServerClient(req, res);
      
      // Read session from cookies
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        logger.warn('Unauthorized API request', { path: req.url });
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: session.user.id,
        email: session.user.email || '',
      };

      return handler(authenticatedReq, res);
    } catch (err) {
      logger.error('Auth middleware error', { error: err });
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
