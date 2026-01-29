/**
 * Auth headers for API requests
 * Temporary stub - will be replaced with actual auth implementation
 */

export function getAuthHeaders(): HeadersInit {
  // TODO: Implement actual auth headers when auth system is added
  // For now, return empty object since we're in standalone mode (no auth required for steps 1-4)
  return {};
}

/**
 * Auth headers for FormData requests (file uploads)
 * Does NOT include Content-Type (browser sets it automatically with boundary)
 */
export async function getAuthHeadersForFormData(): Promise<HeadersInit> {
  // TODO: When auth is implemented, get token from session
  // For now, return empty object (guest mode)
  return {};
}
