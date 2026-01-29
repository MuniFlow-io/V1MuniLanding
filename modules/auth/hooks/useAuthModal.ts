'use client';

/**
 * Auth Modal Hook
 * 
 * ARCHITECTURE: Hook (Layer 2) - SMART
 * - Manages auth form state for modal
 * - Calls auth APIs
 * - Calls onSuccess callback instead of router.push
 * 
 * ELITE STANDARDS:
 * - <200 lines
 * - Single responsibility
 * - Explicit return type
 * - Status enum pattern
 */

import { useState } from 'react';
import { authApi } from '../api/authApi';
import { supabase } from '@/lib/supabase';
import { resetPreviewCount } from '@/lib/previewLimiter';
import { resetGenerationCount } from '@/lib/generationLimiter';
import { logger } from '@/lib/logger';

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAuthModalProps {
  onSuccess: () => void;
}

interface UseAuthModalResult {
  email: string;
  password: string;
  confirmPassword: string;
  status: AuthStatus;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleSignUp: () => Promise<void>;
  handleSignIn: () => Promise<void>;
}

export function useAuthModal({ onSuccess }: UseAuthModalProps): UseAuthModalResult {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    
    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setStatus('loading');
    
    try {
      // Create account
      await authApi.signUp(email, password);
      
      // Sign in to get session cookie
      await authApi.signIn(email, password);
      
      logger.info('Sign up and sign in successful (modal)', { email });
      
      // Reset counters
      resetPreviewCount();
      resetGenerationCount();
      
      setStatus('success');
      
      // Call success callback (no navigation)
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      logger.error('Sign up failed (modal)', { email, error: errorMessage });
      setStatus('error');
      setError(errorMessage);
    }
  };

  const handleSignIn = async () => {
    setError(null);
    
    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setStatus('loading');
    
    try {
      logger.info('Signing in (modal)', { email });
      
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
      
      logger.info('Sign in successful (modal)', { email, userId: data.user.id });
      
      setStatus('success');
      
      // Call success callback (no navigation)
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      logger.error('Sign in failed (modal)', { email, error: errorMessage });
      setStatus('error');
      setError(errorMessage);
    }
  };

  return {
    email,
    password,
    confirmPassword,
    status,
    error,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSignUp,
    handleSignIn,
  };
}
