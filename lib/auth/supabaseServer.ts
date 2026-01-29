/**
 * Server-side Supabase client for Next.js API routes
 * 
 * Uses @supabase/ssr for proper cookie handling in server context
 * Reads session cookies from request, sets cookies in response
 */

import { createServerClient } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;

/**
 * Creates a Supabase client that can read/write cookies in API routes
 * 
 * USAGE:
 * ```typescript
 * const supabase = createSupabaseServerClient(req, res);
 * const { data: { session } } = await supabase.auth.getSession();
 * ```
 */
export function createSupabaseServerClient(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies[name];
      },
      set(name: string, value: string, options) {
        res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${options.maxAge ? `Max-Age=${options.maxAge};` : ''} ${options.sameSite ? `SameSite=${options.sameSite};` : ''} ${options.secure ? 'Secure;' : ''} ${options.httpOnly ? 'HttpOnly;' : ''}`);
      },
      remove(name: string, options) {
        res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0; ${options.sameSite ? `SameSite=${options.sameSite};` : ''} ${options.secure ? 'Secure;' : ''} ${options.httpOnly ? 'HttpOnly;' : ''}`);
      },
    },
  });
}
