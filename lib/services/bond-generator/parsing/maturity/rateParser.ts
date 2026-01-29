/**
 * Coupon Rate Parser Service
 *
 * ATOMIC SERVICE - ONE JOB: Parse coupon rate values
 *
 * Graceful degradation - returns partial result + reason for failure
 */

export interface RateParseResult {
  success: boolean;
  value: number | null;
  rawValue: unknown;
  error?: string;
  warnings?: string[];
}

/**
 * Parse coupon rate
 *
 * Supports:
 * - Percentages (4.25%, 4.25)
 * - Decimals (0.0425)
 * - Strings with % sign
 *
 * @param value - Raw cell value from Excel
 * @returns Parse result with diagnostics
 */
export function parseRate(value: unknown): RateParseResult {
  if (!value && value !== 0) {
    return {
      success: false,
      value: null,
      rawValue: value,
      error: 'Coupon rate is empty or null',
    };
  }

  const warnings: string[] = [];

  // Case 1: Already a number
  if (typeof value === 'number') {
    // Accept any positive number
    // Could be 4.25 (percentage) or 0.0425 (decimal)
    if (value < 0) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Coupon rate cannot be negative. Got: ${value}`,
      };
    }

    // Warn if rate seems too high (probably a mistake)
    if (value > 100) {
      warnings.push(`Coupon rate is very high (${value}%). Is this correct?`);
    }

    return {
      success: true,
      value,
      rawValue: value,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Case 2: String rate
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Remove % sign if present
    const cleaned = trimmed.replace(/%/g, '');

    // Check for placeholders
    if (cleaned.includes('__') || cleaned.includes('_')) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Coupon rate contains placeholders: "${trimmed}"`,
      };
    }

    // Parse as float
    const num = parseFloat(cleaned);

    if (isNaN(num)) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Could not parse coupon rate: "${trimmed}"`,
      };
    }

    if (num < 0) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Coupon rate cannot be negative. Got: "${trimmed}" = ${num}`,
      };
    }

    // Warn if rate seems too high
    if (num > 100) {
      warnings.push(`Coupon rate is very high (${num}%). Is this correct?`);
    }

    return {
      success: true,
      value: num,
      rawValue: value,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Case 3: Unknown type
  return {
    success: false,
    value: null,
    rawValue: value,
    error: `Unexpected coupon rate type: ${typeof value}`,
  };
}
