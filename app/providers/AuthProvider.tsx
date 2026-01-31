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
  checkSession: () => Promise<void>; // ✅ PERFORMANCE: Lazy auth check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ✅ PERFORMANCE: Start false (lazy)
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // ✅ PERFORMANCE: Expose function for components that need auth
  // Don't check on every page load - only when needed
  const checkSession = async () => {
    if (isLoading || hasCheckedSession) return; // Prevent duplicate checks
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userData = session?.user 
        ? { id: session.user.id, email: session.user.email || '' }
        : null;
      
      setUser(userData);
      setHasCheckedSession(true);
      
      if (userData) {
        logger.info('Session check completed', { userId: userData.id });
      }
    } catch (error) {
      logger.error('Session check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // ✅ PERFORMANCE: Don't check session on mount - only listen to auth changes
    // Components that need auth will call checkSession() explicitly

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const userData = session?.user 
          ? { id: session.user.id, email: session.user.email || '' }
          : null;
        
        logger.info('Auth state changed', { event, userId: userData?.id });
        
        setUser(userData);
        setHasCheckedSession(true); // Mark as checked when auth changes
        
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
  }, [isLoading, hasCheckedSession]);

  return (
    <AuthContext.Provider value={{ user, isLoading, checkSession }}>
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
