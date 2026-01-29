'use client';

/**
 * Auth Provider
 * 
 * ARCHITECTURE: Provider (Client-Side Context)
 * - Manages authentication state across the app
 * - Wraps entire application in layout.tsx
 * - Provides useAuth() hook for components
 * - Tracks session changes via Supabase client listener
 * 
 * NOTE: This provider ONLY manages state.
 * Auth operations (signUp/signIn/signOut) are in hooks that call APIs.
 * 
 * ELITE STANDARDS:
 * - Clean separation (no UI, just state)
 * - Uses Supabase client for session listening
 * - Cookie-based sessions (automatic)
 * - Proper logging
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resetPreviewCount } from '@/lib/previewLimiter';
import { logger } from '@/lib/logger';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userData = session?.user 
        ? { id: session.user.id, email: session.user.email || '' }
        : null;
      
      setUser(userData);
      setIsLoading(false);
      
      if (userData) {
        logger.info('Existing session found', { userId: userData.id });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const userData = session?.user 
          ? { id: session.user.id, email: session.user.email || '' }
          : null;
        
        logger.info('Auth state changed', { event, userId: userData?.id });
        
        setUser(userData);
        
        // Reset preview count when user signs in
        if (event === 'SIGNED_IN' && userData) {
          resetPreviewCount();
          logger.info('User signed in, preview count reset', { 
            userId: userData.id 
          });
        }
        
        // Log sign out
        if (event === 'SIGNED_OUT') {
          logger.info('User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
