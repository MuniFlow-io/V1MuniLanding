'use client';

/**
 * Sign Up Hook
 * 
 * ARCHITECTURE: Hook (Layer 2) - SMART
 * - Manages sign up form state
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
import { authApi } from '../api/authApi';
import { resetPreviewCount } from '@/lib/previewLimiter';
import { resetGenerationCount } from '@/lib/generationLimiter';
import { logger } from '@/lib/logger';

type SignUpStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseSignUpResult {
  email: string;
  password: string;
  confirmPassword: string;
  status: SignUpStatus;
  error: string | null;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleSignUp: () => Promise<void>;
}

export function useSignUp(redirectPath?: string): UseSignUpResult {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<SignUpStatus>('idle');
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
      
      logger.info('Sign up and sign in successful', { email });
      
      // Reset counters
      resetPreviewCount();
      resetGenerationCount();
      
      setStatus('success');
      
      // Redirect (session cookie is now set)
      router.push(redirectPath || '/bond-generator/workbench');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      logger.error('Sign up failed', { email, error: errorMessage });
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
  };
}
