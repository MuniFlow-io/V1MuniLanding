/**
 * Bond Numbering Service
 * Pure function - deterministic sorting and numbering of bonds
 *
 * Implements the bond numbering spec:
 * 1. Sort by: series (asc, null last), maturity_date (asc), principal_amount (desc), cusip_no (asc)
 * 2. Assign sequential bond numbers
 * 3. Format: {series}-{seq} or BOND-{seq}
 */

import { logger } from '@/lib/logger';

export interface BondRow {
  series?: string | null;
  maturity_date: string;
  principal_amount: number;
  cusip_no: string;
  coupon_rate: number;
}

export interface NumberedBond extends BondRow {
  bond_number: string;
}

/**
 * Compare function for bond sorting
 * Implements deterministic sort order per spec
 */
function compareBonds(a: BondRow, b: BondRow): number {
  // 1. Series (ascending, null last)
  const seriesA = a.series || '';
  const seriesB = b.series || '';

  if (!a.series && b.series) return 1; // null comes last
  if (a.series && !b.series) return -1; // null comes last
  if (seriesA !== seriesB) return seriesA.localeCompare(seriesB);

  // 2. Maturity date (ascending)
  if (a.maturity_date !== b.maturity_date) {
    return a.maturity_date.localeCompare(b.maturity_date);
  }

  // 3. Principal amount (descending - larger amounts first)
  if (a.principal_amount !== b.principal_amount) {
    return b.principal_amount - a.principal_amount;
  }

  // 4. CUSIP (ascending)
  return a.cusip_no.localeCompare(b.cusip_no);
}

/**
 * Format bond number based on series and optional custom settings
 *
 * SECURITY: customPrefix is sanitized to prevent path traversal attacks
 * Only allows alphanumeric characters and hyphens
 */
function formatBondNumber(
  series: string | null | undefined,
  sequence: number,
  customPrefix?: string
): string {
  const paddedSeq = sequence.toString().padStart(3, '0');

  // Use custom prefix if provided (after sanitization)
  if (customPrefix) {
    // SECURITY: Sanitize custom prefix - only allow alphanumeric and hyphen
    // Prevents path traversal attacks (e.g., "../../../etc/passwd")
    const sanitized = customPrefix.replace(/[^a-zA-Z0-9-]/g, '');

    // If sanitization removed everything, fall back to series or default
    if (sanitized.length === 0) {
      logger.warn('Custom prefix sanitized to empty string, using fallback', {
        originalPrefix: customPrefix,
      });
      return series ? `${series}-${paddedSeq}` : `BOND-${paddedSeq}`;
    }

    return `${sanitized}-${paddedSeq}`;
  }

  // Otherwise use series or default to BOND
  return series ? `${series}-${paddedSeq}` : `BOND-${paddedSeq}`;
}

/**
 * Assign bond numbers to an array of bonds
 * Deterministic - same input always produces same output
 *
 * @param bonds - Array of bond rows to number
 * @param startingNumber - Starting sequence number (default: 1)
 * @param customPrefix - Optional custom prefix for bond numbers
 * @returns Array of numbered bonds
 */
export function assignBondNumbers(
  bonds: BondRow[],
  startingNumber = 1,
  customPrefix?: string
): NumberedBond[] {
  logger.info('Assigning bond numbers', {
    bondCount: bonds.length,
    startingNumber,
    customPrefix: customPrefix || 'auto',
  });

  // Validate input
  if (!Array.isArray(bonds)) {
    logger.error('Invalid input to assignBondNumbers', { bonds });
    throw new Error('Bonds must be an array');
  }

  if (bonds.length === 0) {
    logger.warn('Empty bond array provided');
    return [];
  }

  // Sort bonds deterministically
  const sorted = [...bonds].sort(compareBonds);

  // Assign sequential numbers starting at startingNumber
  const numbered = sorted.map((bond, index) => ({
    ...bond,
    bond_number: formatBondNumber(bond.series, startingNumber + index, customPrefix),
  }));

  logger.info('Bond numbering complete', {
    totalBonds: numbered.length,
    firstBond: numbered[0]?.bond_number,
    lastBond: numbered[numbered.length - 1]?.bond_number,
    customSettings: customPrefix ? 'applied' : 'none',
  });

  return numbered;
}

/**
 * Validate that all bonds have required fields for numbering
 */
export function validateBondsForNumbering(bonds: unknown[]): bonds is BondRow[] {
  if (!Array.isArray(bonds)) return false;

  return bonds.every(
    (bond) =>
      typeof bond === 'object' &&
      bond !== null &&
      'maturity_date' in bond &&
      'principal_amount' in bond &&
      'cusip_no' in bond &&
      'coupon_rate' in bond &&
      typeof bond.maturity_date === 'string' &&
      typeof bond.principal_amount === 'number' &&
      typeof bond.cusip_no === 'string' &&
      typeof bond.coupon_rate === 'number'
  );
}
