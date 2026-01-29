'use client';

/**
 * Sign In Hook
 * 
 * ARCHITECTURE: Hook (Layer 2) - SMART
 * - Manages sign in form state
 * - Handles validation logic
 * - Calls Frontend API (authApi)
 * - Returns state for dumb component
 * 
 * ELITE STANDARDS:
 * - <200 lines
 * - Single responsibility
 * - Explicit return type
 * - Proper error handling
 * - Uses logger
 * - NO direct lib imports (calls API)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

interface UseSignInResult {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleSignIn: () => Promise<void>;
}

export function useSignIn(redirectPath?: string): UseSignInResult {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    
    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      logger.info('Signing in', { email });
      
      // Sign in directly with Supabase (sets cookie properly)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw new Error(signInError.message);
      }
      
      if (!data.session) {
        throw new Error('No session created');
      }
      
      logger.info('Sign in successful', { email, userId: data.user.id });
      
      // Redirect - AuthProvider will sync automatically
      router.push(redirectPath || '/bond-generator/workbench');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      logger.error('Sign in failed', { email, error: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleSignIn,
  };
}
