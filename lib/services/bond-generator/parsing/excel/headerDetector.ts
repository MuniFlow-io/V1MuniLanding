/**
 * Excel Header Detection Service
 *
 * ATOMIC SERVICE - ONE JOB: Find the header row in Excel data
 *
 * Returns diagnostic info even on failure
 */

import { logger } from '@/lib/logger';

export interface HeaderDetectionResult {
  success: boolean;
  headerRowIndex: number;
  headers: string[];
  scannedRows: number;
  error?: string;
  diagnostics: {
    sampleRows: Array<{ index: number; firstCell: string; cellCount: number }>;
  };
}

/**
 * Detect which row contains the column headers
 *
 * Strategy:
 * 1. Scan first 10 rows
 * 2. Look for rows with keywords: maturity, principal, amount, rate, coupon
 * 3. Return first match with diagnostic info
 *
 * @param data - Raw Excel data (array of arrays)
 * @param requiredKeywords - Keywords that indicate header row
 * @returns Detection result with diagnostics
 */
export function detectHeaderRow(
  data: unknown[][],
  requiredKeywords: string[] = ['maturity', 'principal', 'amount', 'rate']
): HeaderDetectionResult {
  logger.info('Detecting header row in Excel', {
    totalRows: data.length,
    requiredKeywords,
  });

  const diagnostics: {
    sampleRows: Array<{ index: number; firstCell: string; cellCount: number }>;
  } = {
    sampleRows: [],
  };

  // Scan first 10 rows (or all rows if less)
  const scanLimit = Math.min(10, data.length);

  for (let i = 0; i < scanLimit; i++) {
    const row = data[i];

    if (!row || row.length === 0) {
      diagnostics.sampleRows.push({ index: i, firstCell: '(empty)', cellCount: 0 });
      continue;
    }

    // Sample for diagnostics
    const firstCell = String(row[0] || '').substring(0, 50);
    diagnostics.sampleRows.push({ index: i, firstCell, cellCount: row.length });

    // Check if this row contains header keywords
    const rowText = row.map((cell) => String(cell || '').toLowerCase()).join(' ');

    // Count how many required keywords are present
    const matchedKeywords = requiredKeywords.filter((keyword) =>
      rowText.includes(keyword.toLowerCase())
    );

    // Need at least 2 keywords to consider it a header row
    if (matchedKeywords.length >= 2) {
      const headers = row.map((cell) => String(cell || ''));

      logger.info('Header row detected', {
        rowIndex: i,
        headerCount: headers.length,
        matchedKeywords,
        headers,
      });

      return {
        success: true,
        headerRowIndex: i,
        headers,
        scannedRows: i + 1,
        diagnostics,
      };
    }
  }

  // No header row found
  logger.warn('No header row detected', {
    scannedRows: scanLimit,
    requiredKeywords,
    sampleRows: diagnostics.sampleRows,
  });

  return {
    success: false,
    headerRowIndex: -1,
    headers: [],
    scannedRows: scanLimit,
    error: `Could not find header row with keywords: ${requiredKeywords.join(', ')}`,
    diagnostics,
  };
}
