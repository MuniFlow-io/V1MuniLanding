/**
 * Generation Limiter Utility
 * 
 * Tracks how many times a guest user has generated bonds using localStorage.
 * Similar to previewLimiter but for actual bond generation.
 * 
 * FREE TIER LIMITS:
 * - Guest users: 1 generation (to encourage signup)
 * - Authenticated users: Unlimited (checked in backend)
 * 
 * STORAGE:
 * - Key: 'muniflow_generation_count'
 * - Value: number (0, 1, 2, etc.)
 * 
 * RESET:
 * - Cleared when user signs up (called in useSignUp hook)
 * - Browser-based (can be bypassed in incognito) - acceptable for MVP
 */

const GENERATION_COUNT_KEY = 'muniflow_generation_count';
const MAX_FREE_GENERATIONS = 1; // Only 1 free generation for guests

/**
 * Get current generation count from localStorage
 * Returns 0 if not set or invalid
 */
export function getGenerationCount(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const stored = localStorage.getItem(GENERATION_COUNT_KEY);
    if (!stored) return 0;
    
    const count = parseInt(stored, 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
}

/**
 * Increment generation count
 * Called after successful generation
 */
export function incrementGenerationCount(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getGenerationCount();
    localStorage.setItem(GENERATION_COUNT_KEY, String(current + 1));
  } catch {
    // Silent fail - don't block user
  }
}

/**
 * Check if user has generations remaining
 * Returns true if user can still generate (count < max)
 */
export function hasGenerationsRemaining(): boolean {
  return getGenerationCount() < MAX_FREE_GENERATIONS;
}

/**
 * Get number of generations remaining
 * Returns 0 if limit reached
 */
export function getGenerationsRemaining(): number {
  const count = getGenerationCount();
  const remaining = MAX_FREE_GENERATIONS - count;
  return remaining > 0 ? remaining : 0;
}

/**
 * Reset generation count
 * Called when user signs up to give them unlimited access
 */
export function resetGenerationCount(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GENERATION_COUNT_KEY);
  } catch {
    // Silent fail
  }
}
