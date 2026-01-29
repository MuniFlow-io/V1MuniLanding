"use client";

/**
 * Auth Modal Component
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Shows signup/signin forms in modal
 * - No navigation - stays on same page
 * - Calls onSuccess callback when auth completes
 * 
 * ELITE STANDARDS:
 * - <150 lines
 * - No business logic
 * - Fully typed props
 * - Named export only
 */

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuthModal } from "@/modules/auth/hooks/useAuthModal";

interface AuthModalProps {
  isOpen: boolean;
  defaultMode?: 'signup' | 'signin';
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ 
  isOpen, 
  defaultMode = 'signup',
  onClose,
  onSuccess 
}: AuthModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>(defaultMode);
  
  const {
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
  } = useAuthModal({ onSuccess });

  if (!isOpen) return null;

  const isLoading = status === 'loading';
  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-b border-cyan-700/30 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {isSignUp ? 'Create Free Account' : 'Sign In'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {isSignUp ? 'Download bonds and save drafts' : 'Welcome back'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                placeholder={isSignUp ? "At least 6 characters" : "Enter your password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  disabled={isLoading}
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
