"use client";

/**
 * Account Gate Modal Component
 * 
 * Shows inline auth (no navigation) when user hits preview limit or tries to download.
 * Uses AuthModal component for signup/signin without leaving the page.
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Pure presentation modal
 * - No business logic
 * - All data via props
 * 
 * ELITE STANDARDS:
 * - <150 lines
 * - Fully typed props interface
 * - No state management (controlled by parent)
 * - Named export only
 */

import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

interface AccountGateModalProps {
  isOpen: boolean;
  reason: 'preview_limit' | 'download';
  bondCount: number;
  previewsUsed?: number;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export function AccountGateModal({ 
  isOpen, 
  reason, 
  bondCount,
  previewsUsed = 3,
  onClose,
  onAuthSuccess
}: AccountGateModalProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  if (!isOpen) return null;

  // If auth modal is open, show that instead
  if (showAuth) {
    return (
      <AuthModal
        isOpen={showAuth}
        defaultMode={authMode}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          onAuthSuccess();
        }}
      />
    );
  }

  const headline = reason === 'preview_limit' 
    ? "You've used all 3 free previews" 
    : `Sign up to download ${bondCount} bond${bondCount !== 1 ? 's' : ''}`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-cyan-700/30 rounded-2xl max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-b border-cyan-700/30 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{headline}</h3>
              <p className="text-sm text-gray-400 mt-1">
                Create a free account to continue
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
        <div className="p-6 space-y-6">
          {/* Usage Stats (if preview_limit) */}
          {reason === 'preview_limit' && (
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                📊 You&apos;ve used <strong>{previewsUsed} of 3</strong> free bond previews
              </p>
            </div>
          )}

          {/* Value Props */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">
              Free Account Includes:
            </p>
            <div className="space-y-2">
              {[
                'Unlimited bond previews',
                'Download bonds as ZIP',
                'Save drafts and resume later',
                'Edit bonds after generation',
                'Priority email support'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <button 
              onClick={() => {
                setAuthMode('signup');
                setShowAuth(true);
              }}
              className="w-full"
            >
              <div className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Create Free Account →
              </div>
            </button>
            
            <button 
              onClick={() => {
                setAuthMode('signin');
                setShowAuth(true);
              }}
              className="w-full"
            >
              <div className="w-full px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-cyan-700/40 hover:border-cyan-500/60 rounded-lg text-white font-medium transition-all duration-200">
                Sign In
              </div>
            </button>
            
            <p className="text-xs text-gray-500 text-center pt-2">
              Already have an account? Use Sign In above
            </p>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-600 text-center">
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </div>
  );
}
