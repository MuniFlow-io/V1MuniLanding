"use client";

/**
 * Sign Up Page
 * 
 * ARCHITECTURE: Page Component (Client-Side)
 * - Allows users to create account
 * - Uses useAuth() hook for authentication logic
 * - Redirects after successful signup
 * - MuniFlow styling (dark theme, glass morphism)
 * 
 * ELITE STANDARDS:
 * - Component stays dumb (no auth logic)
 * - Auth logic in hook
 * - Form validation
 * - Error handling
 * - Loading states
 */

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@/modules/auth/hooks/useSignUp";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/bond-generator/workbench';
  
  const {
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
  } = useSignUp(redirect);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp();
  };

  return (
    <div className="bg-black min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
              Create Account
            </h1>
            <p className="text-gray-400">
              Sign up to download bonds and save drafts
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/20 border border-green-700/40 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-300">Account created!</p>
                  <p className="text-xs text-green-200/80 mt-1">
                    Redirecting you now...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-700/30 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  disabled={isLoading || success}
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
                  disabled={isLoading || success}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>

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
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center mt-6">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-cyan-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
