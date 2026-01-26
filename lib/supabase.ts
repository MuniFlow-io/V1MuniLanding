// Supabase client configuration and utilities
// This file contains the main Supabase client setup and common utilities

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder-anon-key';
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

// Client-side Supabase client (safe for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'muniflow-landing-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Server-side Supabase client with service role (admin privileges)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Utility functions for common Supabase operations
export const supabaseUtils = {
  // Check if we're in a server environment
  isServer: () => typeof window === 'undefined',

  // Get the appropriate client based on environment
  getClient: () => (supabaseUtils.isServer() ? supabaseAdmin || supabase : supabase),

  // Handle Supabase errors consistently
  handleError: (error: any) => {
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
      code: error.code,
    };
  },
};

// Legacy export for backwards compatibility
export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Missing Supabase environment variables');
  }
  return supabaseAdmin;
};

