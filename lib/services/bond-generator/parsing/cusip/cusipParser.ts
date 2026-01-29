/**
 * CUSIP Parser (Refactored with Atomic Services)
 *
 * ORCHESTRATOR SERVICE - Combines atomic parsers with graceful degradation
 *
 * Philosophy: Parse what works, report what doesn't, never block the user
 */

import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import * as XLSX from 'xlsx';
import { mapColumns } from '../excel/columnMapper';
import { detectHeaderRow } from '../excel/headerDetector';
import { parseDate } from '../maturity/dateParser';
import { assembleCusipFromParts, validateCusip } from './cusipValidator';

export interface CusipRow {
  cusip: string;
  maturity_date: string;
  series?: string;
}

// Status types for UI preview
export type CusipRowStatus = 'valid' | 'warning' | 'error' | 'skipped';

// Parsed row with status (used for preview UI)
export interface ParsedCusipRow {
  rowNumber: number;
  status: CusipRowStatus;
  cusip: string | null;
  maturity_date: string | null;
  series?: string | null;
  errors: string[];
  warnings: string[];
  rawData: unknown[];
}

export interface CusipSchedule {
  rows: CusipRow[]; // Only valid rows (for assembly)
  parsedRows: ParsedCusipRow[]; // All rows with status (for preview UI)
  warnings: string[];
  summary: {
    total: number;
    valid: number;
    warnings: number;
    errors: number;
    skipped: number;
  };
  diagnostics: {
    headerRowIndex: number;
    columnMappings: Record<string, number>;
    missingColumns: string[];
    availableColumns: string[];
    hasMultiColumnCusip: boolean;
  };
}

/**
 * Parse CUSIP schedule from Excel buffer
 *
 * GRACEFUL DEGRADATION:
 * - Returns partial results even if some rows fail
 * - Provides detailed diagnostics for failed rows
 * - Handles both single-column and split-column CUSIP formats
 * - Never throws error unless file is completely unreadable
 *
 * @param buffer - Excel file buffer
 * @returns Service result with parsed schedule + diagnostics
 */
export async function parseCusipExcel(buffer: Buffer): Promise<ServiceResult<CusipSchedule>> {
  logger.info('🚀 CUSIP parser started (atomic services with graceful degradation)');

  try {
    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 1: Read Excel file
    // ═══════════════════════════════════════════════════════════
    logger.info('📖 Checkpoint 1: Reading Excel file', { bufferSize: buffer.length });

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return failure('PARSING_ERROR', 'Excel file has no sheets');
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    logger.info('✅ Checkpoint 1 complete', {
      sheetName,
      totalRows: data.length,
      sampleFirstRow: data[0]?.slice(0, 5),
    });

    if (data.length < 2) {
      return failure(
        'PARSING_ERROR',
        'Excel file has no data rows (need at least header + 1 data row)'
      );
    }

    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 2: Detect header row
    // ═══════════════════════════════════════════════════════════
    logger.info('🔍 Checkpoint 2: Detecting header row');

    const headerResult = detectHeaderRow(data, ['cusip', 'maturity', 'date']);

    if (!headerResult.success) {
      logger.error('❌ Checkpoint 2 failed - no header row found', {
        scannedRows: headerResult.scannedRows,
        sampleRows: headerResult.diagnostics.sampleRows,
      });

      return failure('PARSING_ERROR', headerResult.error || 'Could not find header row', {
        scannedRows: headerResult.scannedRows,
        sampleRows: headerResult.diagnostics.sampleRows,
        hint: 'Expected columns: CUSIP (or Issuer/Issue/Check), Maturity Date',
      });
    }

    logger.info('✅ Checkpoint 2 complete', {
      headerRowIndex: headerResult.headerRowIndex,
      headers: headerResult.headers,
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 3: Map columns (detect single vs split CUSIP)
    // ═══════════════════════════════════════════════════════════
    logger.info('🗺️  Checkpoint 3: Mapping columns');

    // Try single-column CUSIP first
    const singleColumnResult = mapColumns(
      headerResult.headers,
      ['cusip', 'maturity_date'], // Required
      ['series'] // Optional
    );

    // Try split-column CUSIP format
    const splitColumnResult = mapColumns(
      headerResult.headers,
      ['cusip_issuer', 'cusip_issue', 'cusip_check', 'maturity_date'], // Required
      ['series'] // Optional
    );

    let columnMappings: Record<string, number>;
    let hasMultiColumnCusip = false;

    if (singleColumnResult.success) {
      // Single column format
      columnMappings = singleColumnResult.mappings;
      hasMultiColumnCusip = false;
      logger.info('✅ Checkpoint 3: Using single-column CUSIP format');
    } else if (splitColumnResult.success) {
      // Split column format
      columnMappings = splitColumnResult.mappings;
      hasMultiColumnCusip = true;
      logger.info('✅ Checkpoint 3: Using split-column CUSIP format (Issuer + Issue + Check)');
    } else {
      // Neither format found
      logger.error('❌ Checkpoint 3 failed - missing required columns', {
        singleColumnMissing: singleColumnResult.missingColumns,
        splitColumnMissing: splitColumnResult.missingColumns,
        availableColumns: headerResult.headers,
      });

      return failure('PARSING_ERROR', 'Missing required CUSIP columns', {
        singleColumnFormat: {
          missing: singleColumnResult.missingColumns,
          hint: 'Need: CUSIP, Maturity Date',
        },
        splitColumnFormat: {
          missing: splitColumnResult.missingColumns,
          hint: 'Need: Issuer Number, Issue Number, Check Digit, Maturity Date',
        },
        availableColumns: headerResult.headers,
      });
    }

    logger.info('✅ Checkpoint 3 complete', {
      mappings: columnMappings,
      hasMultiColumnCusip,
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 4: Parse data rows (GRACEFUL DEGRADATION)
    // ═══════════════════════════════════════════════════════════
    logger.info('📊 Checkpoint 4: Parsing data rows with graceful degradation');

    const startRow = headerResult.headerRowIndex + 1;
    const totalDataRows = data.length - startRow;
    const validRows: CusipRow[] = [];
    const allParsedRows: ParsedCusipRow[] = [];
    const warnings: string[] = [];

    logger.info('Row parsing started', {
      startRow,
      totalDataRows,
      columnIndexes: columnMappings,
      hasMultiColumnCusip,
    });

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1; // Excel row number (1-indexed)

      // Skip completely empty rows
      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        continue;
      }

      const errors: string[] = [];
      const rowWarnings: string[] = [];

      // Parse CUSIP (single or multi-column)
      let cusipResult;
      if (hasMultiColumnCusip) {
        cusipResult = assembleCusipFromParts(
          row[columnMappings.cusip_issuer],
          row[columnMappings.cusip_issue],
          row[columnMappings.cusip_check]
        );
      } else {
        cusipResult = validateCusip(row[columnMappings.cusip]);
      }

      if (!cusipResult.success) {
        errors.push(`CUSIP: ${cusipResult.error}`);
      }

      // Parse maturity date
      const maturityResult = parseDate(row[columnMappings.maturity_date]);
      if (!maturityResult.success) {
        errors.push(`Maturity Date: ${maturityResult.error}`);
      }

      // Parse series (optional)
      let series: string | undefined;
      if (columnMappings.series !== undefined) {
        const seriesValue = row[columnMappings.series];
        series = seriesValue ? String(seriesValue).trim() : undefined;
      }

      // Determine row status
      let status: CusipRowStatus;
      if (errors.length > 0) {
        status = 'error';
      } else if (rowWarnings.length > 0) {
        status = 'warning';
      } else {
        status = 'valid';
      }

      // Add to all parsed rows (for preview UI)
      allParsedRows.push({
        rowNumber,
        status,
        cusip: cusipResult.value || null,
        maturity_date: maturityResult.value || null,
        series,
        errors,
        warnings: rowWarnings,
        rawData: row,
      });

      // If valid, also add to valid rows (for assembly)
      if (status === 'valid') {
        validRows.push({
          cusip: cusipResult.value!,
          maturity_date: maturityResult.value!,
          series,
        });
      }

      if (errors.length > 0) {
        logger.warn('Row parsing failed', {
          rowNumber,
          errors,
          rawData: row.slice(0, 5),
        });
      }
    }

    // Calculate summary
    const summary = {
      total: allParsedRows.length,
      valid: allParsedRows.filter((r) => r.status === 'valid').length,
      warnings: allParsedRows.filter((r) => r.status === 'warning').length,
      errors: allParsedRows.filter((r) => r.status === 'error').length,
      skipped: allParsedRows.filter((r) => r.status === 'skipped').length,
    };

    logger.info('✅ Checkpoint 4 complete', {
      totalDataRows,
      validRows: summary.valid,
      warningRows: summary.warnings,
      errorRows: summary.errors,
      successRate: `${Math.round((summary.valid / totalDataRows) * 100)}%`,
    });

    // ═══════════════════════════════════════════════════════════
    // FINAL RESULT: ALWAYS return data (even if some/all rows failed)
    // ═══════════════════════════════════════════════════════════
    const result: CusipSchedule = {
      rows: validRows, // Only valid rows (for assembly)
      parsedRows: allParsedRows, // All rows with status (for preview UI)
      warnings,
      summary,
      diagnostics: {
        headerRowIndex: headerResult.headerRowIndex,
        columnMappings,
        missingColumns: hasMultiColumnCusip
          ? splitColumnResult.missingColumns
          : singleColumnResult.missingColumns,
        availableColumns: headerResult.headers,
        hasMultiColumnCusip,
      },
    };

    // SUCCESS - Always return data, even if NO valid rows
    // The UI will show what failed and let user fix it
    logger.info('🎉 CUSIP parser complete', {
      success: true,
      validRows: summary.valid,
      errorRows: summary.errors,
      warningRows: summary.warnings,
      format: hasMultiColumnCusip ? 'split-column' : 'single-column',
    });

    return success(result);
  } catch (error) {
    logger.error('💥 CUSIP parser crashed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('PARSING_ERROR', 'Failed to parse CUSIP schedule due to unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
