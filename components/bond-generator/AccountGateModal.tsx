"use client";

/**
 * Account Gate Modal Component
 * 
 * Displays signup modal when user hits preview limit or tries to download.
 * Shows value props and CTAs for account creation.
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

import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface AccountGateModalProps {
  isOpen: boolean;
  reason: 'preview_limit' | 'download';
  bondCount: number;
  previewsUsed?: number;
  onClose: () => void;
  onBeforeAuth?: () => void; // Optional callback before auth redirect
}

export function AccountGateModal({ 
  isOpen, 
  reason, 
  bondCount,
  previewsUsed = 3,
  onClose,
  onBeforeAuth
}: AccountGateModalProps) {
  
  const handleAuthClick = () => {
    // Call prep callback before redirecting to auth
    if (onBeforeAuth) {
      onBeforeAuth();
    }
  };
  if (!isOpen) return null;

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
            <Link 
              href="/signup?redirect=/bond-generator/workbench" 
              className="block"
              onClick={handleAuthClick}
            >
              <Button variant="primary" size="large" className="w-full">
                Create Free Account →
              </Button>
            </Link>
            
            <Link 
              href="/signin?redirect=/bond-generator/workbench" 
              className="block"
              onClick={handleAuthClick}
            >
              <Button variant="glass" size="medium" className="w-full">
                Sign In
              </Button>
            </Link>
            
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
