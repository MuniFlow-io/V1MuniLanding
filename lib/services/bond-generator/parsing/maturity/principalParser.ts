/**
 * Principal Amount Parser Service
 *
 * ATOMIC SERVICE - ONE JOB: Parse principal amounts (MUST be whole numbers)
 *
 * Graceful degradation - returns partial result + reason for failure
 */

export interface PrincipalParseResult {
  success: boolean;
  value: number | null;
  rawValue: unknown;
  error?: string;
  warnings?: string[];
}

/**
 * Parse principal amount
 *
 * Requirements:
 * - MUST be whole number (no decimals)
 * - MUST be positive
 * - Can have $ and commas (will be stripped)
 *
 * @param value - Raw cell value from Excel
 * @returns Parse result with diagnostics
 */
export function parsePrincipal(value: unknown): PrincipalParseResult {
  if (!value && value !== 0) {
    return {
      success: false,
      value: null,
      rawValue: value,
      error: 'Principal amount is empty or null',
    };
  }

  const warnings: string[] = [];

  // Case 1: Already a number
  if (typeof value === 'number') {
    // Check if it's a whole number
    if (!Number.isInteger(value)) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Principal amount must be a whole number (no decimals). Got: ${value}`,
      };
    }

    if (value <= 0) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Principal amount must be greater than zero. Got: ${value}`,
      };
    }

    return {
      success: true,
      value,
      rawValue: value,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Case 2: String number
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Remove currency symbols and commas
    const cleaned = trimmed.replace(/[$,]/g, '');

    // Check for placeholders
    if (cleaned.includes('__') || cleaned.includes('_')) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Principal amount contains placeholders: "${trimmed}"`,
      };
    }

    // Parse as float first
    const num = parseFloat(cleaned);

    if (isNaN(num)) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Could not parse principal amount: "${trimmed}"`,
      };
    }

    // Check if it's a whole number
    if (!Number.isInteger(num)) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Principal amount must be a whole number (no decimals). Got: "${trimmed}" = ${num}`,
      };
    }

    if (num <= 0) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Principal amount must be greater than zero. Got: "${trimmed}" = ${num}`,
      };
    }

    // Check if original had decimals that were .00
    if (trimmed.includes('.')) {
      warnings.push('Principal amount had decimal point but was whole number');
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
    error: `Unexpected principal amount type: ${typeof value}`,
  };
}
