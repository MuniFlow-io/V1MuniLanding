/**
 * API Authentication Middleware
 * Stub for V1MuniLanding - will be replaced with actual auth
 */

import type { NextApiRequest, NextApiResponse } from 'next';

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
    // TODO: Implement actual auth when auth system is added
    // For now, allow all requests (guest mode)
    
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: 'guest-user',
      email: 'guest@example.com',
    };
    
    return handler(authenticatedReq, res);
  };
}
