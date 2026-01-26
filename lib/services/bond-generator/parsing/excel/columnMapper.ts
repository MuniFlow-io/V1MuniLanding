/**
 * Excel Column Mapper Service
 *
 * ATOMIC SERVICE - ONE JOB: Map column names to indexes
 *
 * Handles variations, line breaks, case differences
 */

import { logger } from '@/lib/logger';

export interface ColumnMappingResult {
  success: boolean;
  mappings: Record<string, number>; // e.g., { maturity_date: 2, principal_amount: 3 }
  missingColumns: string[];
  availableColumns: string[];
  diagnostics: {
    normalized: string[];
    attemptedMappings: Array<{ field: string; aliases: string[]; found: boolean; index: number }>;
  };
}

/**
 * Column name mappings with all known variations
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  maturity_date: ['maturity date', 'maturity', 'date', 'mat date', 'mat. date'],
  principal_amount: ['principal amount', 'principal', 'amount', 'par amount', 'par', 'face amount'],
  coupon_rate: ['coupon rate', 'coupon', 'rate', 'interest rate', 'interest', 'int rate'],
  dated_date: ['dated date', 'dated', 'issue date', 'dated as of'],
  series: ['series', 'series name', 'bond series'],
  cusip: ['cusip', 'cusip no', 'cusip number', 'cusip #'],
  cusip_issuer: ['issuer number', 'issuer num', 'issuer', 'cusip issuer'],
  cusip_issue: ['issue number', 'issue num', 'issue', 'cusip issue'],
  cusip_check: ['check digit', 'issue check digit', 'check', 'cusip check'],
};

/**
 * Normalize column name
 * - Lowercase
 * - Replace line breaks with space
 * - Collapse multiple spaces
 * - Trim
 */
function normalizeColumnName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ') // Line breaks → space
    .replace(/\s+/g, ' ') // Multiple spaces → single space
    .trim();
}

/**
 * Find column index by trying all known aliases
 *
 * @param headers - Array of column headers
 * @param fieldName - Field to find (e.g., 'maturity_date')
 * @returns Column index or -1 if not found
 */
function findColumnIndex(headers: string[], fieldName: string): number {
  const normalized = headers.map(normalizeColumnName);
  const aliases = COLUMN_ALIASES[fieldName] || [fieldName];

  for (const alias of aliases) {
    const index = normalized.indexOf(alias.toLowerCase());
    if (index !== -1) {
      logger.info('Column found', { fieldName, alias, index, originalHeader: headers[index] });
      return index;
    }
  }

  return -1;
}

/**
 * Map all required and optional columns
 *
 * @param headers - Raw header row from Excel
 * @param requiredFields - Fields that MUST be present
 * @param optionalFields - Fields that are nice to have
 * @returns Mapping result with diagnostics
 */
export function mapColumns(
  headers: string[],
  requiredFields: string[] = ['maturity_date', 'principal_amount', 'coupon_rate'],
  optionalFields: string[] = ['dated_date', 'series']
): ColumnMappingResult {
  logger.info('Mapping Excel columns', {
    headerCount: headers.length,
    requiredFields,
    optionalFields,
  });

  const normalized = headers.map(normalizeColumnName);
  const mappings: Record<string, number> = {};
  const missingColumns: string[] = [];
  const attemptedMappings: Array<{
    field: string;
    aliases: string[];
    found: boolean;
    index: number;
  }> = [];

  // Try to map required fields
  for (const field of requiredFields) {
    const index = findColumnIndex(headers, field);
    const aliases = COLUMN_ALIASES[field] || [field];

    attemptedMappings.push({
      field,
      aliases,
      found: index !== -1,
      index,
    });

    if (index !== -1) {
      mappings[field] = index;
    } else {
      missingColumns.push(field);
    }
  }

  // Try to map optional fields (don't fail if missing)
  for (const field of optionalFields) {
    const index = findColumnIndex(headers, field);
    const aliases = COLUMN_ALIASES[field] || [field];

    attemptedMappings.push({
      field,
      aliases,
      found: index !== -1,
      index,
    });

    if (index !== -1) {
      mappings[field] = index;
    }
  }

  const success = missingColumns.length === 0;

  if (!success) {
    logger.warn('Some required columns not found', {
      missingColumns,
      availableColumns: headers,
      normalized,
    });
  } else {
    logger.info('All required columns mapped successfully', { mappings });
  }

  return {
    success,
    mappings,
    missingColumns,
    availableColumns: headers,
    diagnostics: {
      normalized,
      attemptedMappings,
    },
  };
}
