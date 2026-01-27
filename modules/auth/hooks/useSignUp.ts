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
import { logger } from '@/lib/logger';

interface UseSignUpResult {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    
    setIsLoading(true);
    
    try {
      logger.info('Calling sign up API', { email });
      
      // Call Frontend API (which calls Backend API → Service)
      await authApi.signUp(email, password);
      
      logger.info('Sign up successful', { email });
      
      // Reset preview count for new user
      resetPreviewCount();
      
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(redirectPath || '/bond-generator/workbench');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      logger.error('Sign up failed', { email, error: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    confirmPassword,
    isLoading,
    error,
    success,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSignUp,
  };
}
