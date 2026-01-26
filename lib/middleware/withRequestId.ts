/**
 * Request ID Middleware
 * Adds unique request ID for tracing
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export function withRequestId(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Generate simple request ID
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to request (for logging)
    (req as any).requestId = requestId;
    
    // Add to response headers
    res.setHeader('X-Request-Id', requestId);
    
    return handler(req, res);
  };
}
