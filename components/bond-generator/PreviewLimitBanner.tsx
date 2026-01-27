"use client";

/**
 * Preview Limit Banner Component
 * 
 * Displays warning when user is approaching or has reached preview limit.
 * 
 * ARCHITECTURE: Component (Layer 1) - DUMB
 * - Pure presentation, no logic
 * - All data passed via props
 * - No side effects
 * - No state management
 * 
 * ELITE STANDARDS:
 * - <100 lines
 * - Fully typed props
 * - No imports from lib/
 * - Named export only
 */

interface PreviewLimitBannerProps {
  previewsRemaining: number;
  show: boolean;
}

export function PreviewLimitBanner({ 
  previewsRemaining, 
  show 
}: PreviewLimitBannerProps) {
  if (!show || previewsRemaining > 1) return null;

  const isExhausted = previewsRemaining === 0;

  return (
    <div className={`
      rounded-lg p-4 border
      ${isExhausted 
        ? 'bg-red-900/20 border-red-700/40' 
        : 'bg-yellow-900/20 border-yellow-700/40'
      }
    `}>
      <div className="flex items-start gap-3">
        <svg 
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isExhausted ? 'text-red-400' : 'text-yellow-400'
          }`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isExhausted ? 'text-red-300' : 'text-yellow-300'
          }`}>
            {isExhausted 
              ? 'Free previews exhausted' 
              : 'Last free preview remaining'
            }
          </p>
          <p className={`text-xs mt-1 ${
            isExhausted ? 'text-red-200/80' : 'text-yellow-200/80'
          }`}>
            {isExhausted
              ? 'Create a free account to continue previewing bonds'
              : 'Create a free account for unlimited previews'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
