/**
 * Date Parser Service
 *
 * ATOMIC SERVICE - ONE JOB: Parse date values (Excel numbers OR strings)
 *
 * Graceful degradation - returns partial result + reason for failure
 */

import * as XLSX from 'xlsx';
import { logger } from '@/lib/logger';

export interface DateParseResult {
  success: boolean;
  value: string | null; // ISO format (YYYY-MM-DD) OR year only (YYYY)
  rawValue: unknown;
  error?: string;
  format?: 'excel_number' | 'iso_string' | 'us_date' | 'year_only' | 'unknown';
}

/**
 * Parse date value to ISO format (YYYY-MM-DD)
 *
 * Supports:
 * - Excel date numbers (e.g., 44927 = 2023-01-01)
 * - ISO strings (e.g., "2023-01-01")
 * - US date strings (e.g., "1/1/2023", "June 15, 2023")
 *
 * @param value - Raw cell value from Excel
 * @returns Parse result with diagnostics
 */
export function parseDate(value: unknown): DateParseResult {
  if (!value) {
    return {
      success: false,
      value: null,
      rawValue: value,
      error: 'Date value is empty or null',
    };
  }

  // Case 1: Excel date number OR just a year
  if (typeof value === 'number') {
    // Check if this is just a YEAR (not an Excel date number)
    // Years are small numbers (1900-2100), date numbers are large (40000+)
    if (value >= 1900 && value <= 2100 && Number.isInteger(value)) {
      logger.info('[dateParser] Year detected (not a date)', { value });

      return {
        success: true,
        value: String(value), // Store as "2025" (not a full date!)
        rawValue: value,
        format: 'year_only',
      };
    }

    // Otherwise it's an Excel date number - parse it
    try {
      // Parse with 1900 date system (Windows Excel default)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const date1900 = XLSX.SSF.parse_date_code(value);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const year1900 = date1900.y;

      // Also try 1904 date system (Mac Excel) for comparison
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const date1904 = XLSX.SSF.parse_date_code(value + 1462);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const year1904 = date1904.y;

      // DIAGNOSTIC: Log both parsed results to help debug
      logger.info('[dateParser] Excel date number detected', {
        rawValue: value,
        parsed1900: `${date1900.y}-${String(date1900.m).padStart(2, '0')}-${String(date1900.d).padStart(2, '0')}`,
        parsed1904: `${date1904.y}-${String(date1904.m).padStart(2, '0')}-${String(date1904.d).padStart(2, '0')}`,
        year1900,
        year1904,
      });

      // Use 1900 system if year is reasonable (1950-2100)
      // Otherwise try 1904 system
      let finalDate = date1900;
      let dateSystem = '1900';

      if (year1900 < 1950 || year1900 > 2100) {
        // 1900 parse looks wrong, try 1904
        if (year1904 >= 1950 && year1904 <= 2100) {
          finalDate = date1904;
          dateSystem = '1904';
        }
        // If BOTH look wrong, use 1900 and let user fix it
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const isoDate = `${finalDate.y}-${String(finalDate.m).padStart(2, '0')}-${String(finalDate.d).padStart(2, '0')}`;

      logger.info('[dateParser] Using date system', { dateSystem, isoDate });

      return {
        success: true,
        value: isoDate,
        rawValue: value,
        format: 'excel_number',
      };
    } catch (error) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Failed to parse Excel date number: ${value} (${error instanceof Error ? error.message : 'unknown error'})`,
        format: 'excel_number',
      };
    }
  }

  // Case 2: String date
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // Check for incomplete dates (e.g., "June 15, 20__")
    if (trimmed.includes('__') || trimmed.includes('_')) {
      return {
        success: false,
        value: null,
        rawValue: value,
        error: `Date contains placeholders: "${trimmed}"`,
        format: 'unknown',
      };
    }

    try {
      const parsedDate = new Date(trimmed);

      if (!isNaN(parsedDate.getTime())) {
        const isoDate = parsedDate.toISOString().split('T')[0];

        return {
          success: true,
          value: isoDate,
          rawValue: value,
          format: trimmed.match(/^\d{4}-\d{2}-\d{2}$/) ? 'iso_string' : 'us_date',
        };
      }
    } catch {
      // Fall through to error
    }

    return {
      success: false,
      value: null,
      rawValue: value,
      error: `Could not parse date string: "${trimmed}"`,
      format: 'unknown',
    };
  }

  // Case 3: Unknown type
  return {
    success: false,
    value: null,
    rawValue: value,
    error: `Unexpected date type: ${typeof value}`,
    format: 'unknown',
  };
}
