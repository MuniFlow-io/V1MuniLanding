/**
 * Principal Amount to Words Converter
 * Pure function - deterministic conversion of numbers to words
 *
 * Converts principal amounts to formatted word strings for bond certificates
 * Example: 5000000 → "FIVE MILLION DOLLARS"
 *
 * Style Rules:
 * - ALL CAPS
 * - Hyphenated 21-99
 * - No "AND"
 * - Ends with "DOLLARS"
 * - Whole dollars only (no cents)
 */

import { logger } from '@/lib/logger';

// Number word mappings
const ONES = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
];

const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

const SCALES = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION'];

/**
 * Convert a number (0-999) to words
 */
function convertHundreds(num: number): string {
  if (num === 0) return '';

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  let result = '';

  // Handle hundreds place
  if (hundreds > 0) {
    result = ONES[hundreds] + ' HUNDRED';
  }

  // Handle tens and ones place
  if (remainder >= 20) {
    const tensDigit = Math.floor(remainder / 10);
    const onesDigit = remainder % 10;

    const tensWord = TENS[tensDigit];
    const onesWord = ONES[onesDigit];

    if (result) result += ' ';
    result += onesWord ? `${tensWord}-${onesWord}` : tensWord;
  } else if (remainder > 0) {
    if (result) result += ' ';
    result += ONES[remainder];
  }

  return result;
}

/**
 * Convert principal amount to words
 *
 * @param amount - Principal amount in whole dollars
 * @returns Formatted word string
 * @throws Error if amount is not a positive whole number
 */
export function principalToWords(amount: number): string {
  // Validation
  if (!Number.isInteger(amount)) {
    const error = 'Principal amount must be a whole number (no decimals)';
    logger.error('Invalid principal amount', { amount, error });
    throw new Error(error);
  }

  if (amount < 0) {
    const error = 'Principal amount must be positive';
    logger.error('Invalid principal amount', { amount, error });
    throw new Error(error);
  }

  if (amount > 999_999_999_999_999) {
    const error = 'Principal amount exceeds maximum supported value';
    logger.error('Invalid principal amount', { amount, error });
    throw new Error(error);
  }

  // Handle zero
  if (amount === 0) {
    return 'ZERO DOLLARS';
  }

  // Break into groups of 3 digits
  const groups: number[] = [];
  let remaining = amount;

  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  // Convert each group to words
  const words: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0) continue;

    const groupWords = convertHundreds(group);
    const scale = SCALES[i];

    words.push(scale ? `${groupWords} ${scale}` : groupWords);
  }

  const result = words.join(' ') + ' DOLLARS';

  logger.debug('Principal converted to words', { amount, result });

  return result;
}

/**
 * Validate principal amount format
 * Used by parsers to check if a value is valid
 */
export function isValidPrincipalAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
