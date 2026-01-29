/**
 * Date Formatting Utility
 *
 * ATOMIC UTILITY - ONE JOB: Format ISO dates for human display
 *
 * Used across ALL bond generator UI components to ensure
 * consistent date display (maturity dates, dated dates, etc.)
 *
 * CANONICAL FORMAT: "Month Day, Year" (e.g., "July 19, 2025")
 */

/**
 * Format ISO date string to human-readable format
 *
 * @param isoDate - ISO date string (YYYY-MM-DD) or null
 * @returns Formatted date string or empty string if invalid
 *
 * @example
 * formatDateForDisplay("2025-07-19") → "July 19, 2025"
 * formatDateForDisplay("2025") → "2025" (fallback to original)
 * formatDateForDisplay(null) → ""
 */
export function formatDateForDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '';
  }

  // If it's just a year (e.g., "2025"), return as-is
  if (/^\d{4}$/.test(isoDate)) {
    return isoDate;
  }

  try {
    const date = new Date(isoDate);

    // Verify date is valid
    if (isNaN(date.getTime())) {
      console.warn('[formatDate] Invalid date value:', isoDate);
      return isoDate; // Fallback to original value
    }

    // Format as "Month Day, Year" (e.g., "July 19, 2025")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.warn('[formatDate] Failed to format date:', isoDate, error);
    return isoDate; // Graceful degradation
  }
}

/**
 * Format ISO date string to short format
 *
 * @param isoDate - ISO date string (YYYY-MM-DD) or null
 * @returns Short formatted date string (M/D/YYYY)
 *
 * @example
 * formatDateShort("2025-07-19") → "7/19/2025"
 */
export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '';
  }

  // If it's just a year, return as-is
  if (/^\d{4}$/.test(isoDate)) {
    return isoDate;
  }

  try {
    const date = new Date(isoDate);

    if (isNaN(date.getTime())) {
      return isoDate;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
