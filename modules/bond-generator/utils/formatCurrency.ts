/**
 * Currency Formatting Utility
 *
 * ARCHITECTURE: Pure utility function
 * - No side effects
 * - Uses built-in Intl.NumberFormat
 * - Works for any currency amount
 */

/**
 * Format number as US currency with commas and no decimals
 *
 * Examples:
 * - 1000000 → "$1,000,000"
 * - 5500000 → "$5,500,000"
 * - 250000 → "$250,000"
 *
 * @param amount - Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  // Handle null/undefined/empty
  if (amount === null || amount === undefined || amount === '') {
    return '-';
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return '-';
  }

  // Use built-in formatter (no external dependencies)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}
