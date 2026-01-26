/**
 * CUSIP Validator Service
 *
 * ONE JOB: Validate CUSIP format (9 alphanumeric characters)
 *
 * Philosophy: Atomic service - validate format, return clear result
 */

export interface CusipValidationResult {
  success: boolean;
  value?: string;
  error?: string;
}

/**
 * Validate CUSIP format
 *
 * CUSIP must be exactly 9 characters:
 * - 6 characters: Issuer identification number
 * - 2 characters: Issue number
 * - 1 character: Check digit
 *
 * @param value - Value to validate as CUSIP
 * @returns Validation result with cleaned CUSIP or error
 */
export function validateCusip(value: unknown): CusipValidationResult {
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return {
      success: false,
      error: 'CUSIP is empty or null',
    };
  }

  // Convert to string, remove all whitespace, and uppercase
  const cusip = String(value).replace(/\s+/g, '').trim().toUpperCase();

  // Check length
  if (cusip.length !== 9) {
    return {
      success: false,
      error: `CUSIP must be 9 characters (got ${cusip.length}: "${cusip}")`,
    };
  }

  // Check format (alphanumeric only)
  if (!/^[A-Z0-9]{9}$/.test(cusip)) {
    return {
      success: false,
      error: 'CUSIP must contain only letters and numbers',
    };
  }

  return {
    success: true,
    value: cusip,
  };
}

/**
 * Assemble CUSIP from split columns
 *
 * Handles Excel files with split CUSIP columns:
 * - Issuer Number (6 chars)
 * - Issue Number (2 chars)
 * - Check Digit (1 char)
 *
 * @param issuer - Issuer identification (6 chars)
 * @param issue - Issue number (2 chars)
 * @param check - Check digit (1 char)
 * @returns Validation result with assembled CUSIP or error
 */
export function assembleCusipFromParts(
  issuer: unknown,
  issue: unknown,
  check: unknown
): CusipValidationResult {
  // Convert all parts to strings and remove whitespace
  const issuerStr = String(issuer || '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
  const issueStr = String(issue || '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
  const checkStr = String(check || '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();

  // Check for missing parts
  const missing: string[] = [];
  if (!issuerStr) missing.push('Issuer Number');
  if (!issueStr) missing.push('Issue Number');
  if (!checkStr) missing.push('Check Digit');

  if (missing.length > 0) {
    return {
      success: false,
      error: `Missing CUSIP parts: ${missing.join(', ')}`,
    };
  }

  // Validate lengths
  if (issuerStr.length !== 6) {
    return {
      success: false,
      error: `Issuer Number must be 6 characters (got ${issuerStr.length})`,
    };
  }

  if (issueStr.length !== 2) {
    return {
      success: false,
      error: `Issue Number must be 2 characters (got ${issueStr.length})`,
    };
  }

  if (checkStr.length !== 1) {
    return {
      success: false,
      error: `Check Digit must be 1 character (got ${checkStr.length})`,
    };
  }

  // Assemble full CUSIP
  const fullCusip = issuerStr + issueStr + checkStr;

  // Validate assembled CUSIP
  return validateCusip(fullCusip);
}
