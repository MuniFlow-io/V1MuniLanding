/**
 * Preview Limiter Utility
 * 
 * Simple localStorage-based preview tracking for freemium model.
 * Tracks how many bond previews a user has consumed without account.
 * 
 * ARCHITECTURE: Utility (Browser Storage)
 * - No backend calls
 * - Just localStorage operations
 * - Used by frontend components only
 */

const PREVIEW_LIMIT = 3;
const STORAGE_KEY = 'muniflow_preview_count';

/**
 * Get current preview count from localStorage
 * @returns Number of previews used (0 if none)
 */
export function getPreviewCount(): number {
  if (typeof window === 'undefined') return 0; // SSR safety
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Increment preview count and save to localStorage
 * @returns New preview count
 */
export function incrementPreviewCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const current = getPreviewCount();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEY, newCount.toString());
  return newCount;
}

/**
 * Get number of previews remaining
 * @returns Number of previews left (0 if exhausted)
 */
export function getPreviewsRemaining(): number {
  return Math.max(0, PREVIEW_LIMIT - getPreviewCount());
}

/**
 * Check if user has previews remaining
 * @returns True if user can still preview
 */
export function hasPreviewsRemaining(): boolean {
  return getPreviewsRemaining() > 0;
}

/**
 * Reset preview count (call after user signs up)
 */
export function resetPreviewCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
