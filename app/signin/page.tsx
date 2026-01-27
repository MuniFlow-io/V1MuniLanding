"use client";

/**
 * Sign In Page
 * 
 * ARCHITECTURE: Page Component (Client-Side)
 * - Allows users to sign in to existing account
 * - Uses useAuth() hook for authentication logic
 * - Redirects after successful signin
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
import { useSignIn } from "@/modules/auth/hooks/useSignIn";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/bond-generator/workbench';
  
  const {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleSignIn,
  } = useSignIn(redirect);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn();
  };

  return (
    <div className="bg-black min-h-screen">
      <Navigation />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-400">
              Sign in to access your account
            </p>
          </div>

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
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
