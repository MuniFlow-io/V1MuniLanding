/**
 * Maturity Schedule Parser (Refactored with Atomic Services)
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
import { parseDate } from './dateParser';
import { parsePrincipal } from './principalParser';
import { parseRate } from './rateParser';

export interface MaturityRow {
  maturity_date: string; // ISO date format (YYYY-MM-DD)
  principal_amount: number; // Whole dollars only
  coupon_rate: number; // Percentage (e.g., 4.25)
  series?: string;
}

// Status types for UI preview
export type RowStatus = 'valid' | 'warning' | 'error' | 'skipped';

// Parsed row with status (used for preview UI)
export interface ParsedMaturityRow {
  rowNumber: number;
  status: RowStatus;
  maturity_date: string | null;
  principal_amount: number | null;
  coupon_rate: number | null;
  series?: string | null;
  errors: string[];
  warnings: string[];
  rawData: unknown[];
}

export interface MaturitySchedule {
  dated_date: string;
  rows: MaturityRow[]; // Only valid rows (for assembly)
  parsedRows: ParsedMaturityRow[]; // All rows with status (for preview UI)
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
  };
}

/**
 * Parse maturity schedule from Excel buffer
 *
 * GRACEFUL DEGRADATION:
 * - Returns partial results even if some rows fail
 * - Provides detailed diagnostics for failed rows
 * - Never throws error unless file is completely unreadable
 *
 * @param buffer - Excel file buffer
 * @returns Service result with parsed schedule + diagnostics
 */
export async function parseMaturityExcel(buffer: Buffer): Promise<ServiceResult<MaturitySchedule>> {
  logger.info('🚀 Maturity parser started (atomic services with graceful degradation)');

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

    const headerResult = detectHeaderRow(data, ['maturity', 'principal', 'amount', 'rate']);

    if (!headerResult.success) {
      logger.error('❌ Checkpoint 2 failed - no header row found', {
        scannedRows: headerResult.scannedRows,
        sampleRows: headerResult.diagnostics.sampleRows,
      });

      return failure('PARSING_ERROR', headerResult.error || 'Could not find header row', {
        scannedRows: headerResult.scannedRows,
        sampleRows: headerResult.diagnostics.sampleRows,
        hint: 'Expected columns: Maturity Date, Principal Amount, Coupon Rate',
      });
    }

    logger.info('✅ Checkpoint 2 complete', {
      headerRowIndex: headerResult.headerRowIndex,
      headers: headerResult.headers,
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 3: Map columns
    // ═══════════════════════════════════════════════════════════
    logger.info('🗺️  Checkpoint 3: Mapping columns');

    const columnResult = mapColumns(
      headerResult.headers,
      ['maturity_date', 'principal_amount', 'coupon_rate'], // Required
      ['dated_date', 'series'] // Optional
    );

    if (!columnResult.success) {
      logger.error('❌ Checkpoint 3 failed - missing required columns', {
        missingColumns: columnResult.missingColumns,
        availableColumns: columnResult.availableColumns,
      });

      return failure(
        'PARSING_ERROR',
        `Missing required columns: ${columnResult.missingColumns.join(', ')}`,
        {
          missingColumns: columnResult.missingColumns,
          availableColumns: columnResult.availableColumns,
          normalizedColumns: columnResult.diagnostics.normalized,
          hint: 'Check that your Excel file has: Maturity Date, Principal Amount, Coupon Rate',
        }
      );
    }

    logger.info('✅ Checkpoint 3 complete', {
      mappings: columnResult.mappings,
      missingOptional: columnResult.missingColumns,
    });

    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 4: Extract dated date (if present)
    // ═══════════════════════════════════════════════════════════
    logger.info('📅 Checkpoint 4: Extracting dated date');

    let datedDate = '';
    const warnings: string[] = [];

    if (columnResult.mappings.dated_date !== undefined) {
      const firstDataRow = data[headerResult.headerRowIndex + 1];
      if (firstDataRow && firstDataRow[columnResult.mappings.dated_date]) {
        const dateResult = parseDate(firstDataRow[columnResult.mappings.dated_date]);
        if (dateResult.success && dateResult.value) {
          datedDate = dateResult.value;
          logger.info('✅ Checkpoint 4: Dated date found', { datedDate });
        } else {
          warnings.push(
            `Dated date column found but value couldn't be parsed: ${dateResult.error}`
          );
          logger.warn('⚠️  Checkpoint 4: Dated date not parseable', { error: dateResult.error });
        }
      }
    } else {
      warnings.push('Dated date column not found - user will need to enter manually');
      logger.info('⚠️  Checkpoint 4: No dated date column', {
        availableColumns: headerResult.headers,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // CHECKPOINT 5: Parse data rows (GRACEFUL DEGRADATION)
    // ═══════════════════════════════════════════════════════════
    logger.info('📊 Checkpoint 5: Parsing data rows with graceful degradation');

    const startRow = headerResult.headerRowIndex + 1;
    const totalDataRows = data.length - startRow;
    const validRows: MaturityRow[] = [];
    const allParsedRows: ParsedMaturityRow[] = [];

    logger.info('Row parsing started', {
      startRow,
      totalDataRows,
      columnIndexes: columnResult.mappings,
    });

    // Now start parsing rows with adjusted mappings
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1; // Excel row number (1-indexed)

      // Skip completely empty rows
      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        continue;
      }

      // Skip rows that are section headers (e.g., "Tax-Exempt Serial Bonds:")
      if (row.length === 2 && typeof row[1] === 'string' && row[1].includes(':')) {
        logger.info('Skipping section header row', { rowNumber, text: row[1] });
        continue;
      }

      const errors: string[] = [];
      const rowWarnings: string[] = [];

      // Parse maturity date
      const maturityResult = parseDate(row[columnResult.mappings.maturity_date]);
      if (!maturityResult.success) {
        errors.push(`Maturity Date: ${maturityResult.error}`);
      }

      // Parse principal amount
      const principalResult = parsePrincipal(row[columnResult.mappings.principal_amount]);
      if (!principalResult.success) {
        errors.push(`Principal Amount: ${principalResult.error}`);
      }
      if (principalResult.warnings) {
        rowWarnings.push(...principalResult.warnings);
      }

      // Parse coupon rate
      const rateResult = parseRate(row[columnResult.mappings.coupon_rate]);
      if (!rateResult.success) {
        errors.push(`Coupon Rate: ${rateResult.error}`);
      }
      if (rateResult.warnings) {
        rowWarnings.push(...rateResult.warnings);
      }

      // Parse series (optional)
      let series: string | undefined;
      if (columnResult.mappings.series !== undefined) {
        const seriesValue = row[columnResult.mappings.series];
        series = seriesValue ? String(seriesValue).trim() : undefined;
      }

      // Determine row status
      let status: RowStatus;
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
        maturity_date: maturityResult.value,
        principal_amount: principalResult.value,
        coupon_rate: rateResult.value,
        series,
        errors,
        warnings: rowWarnings,
        rawData: row,
      });

      // If valid, also add to valid rows (for assembly)
      if (status === 'valid') {
        validRows.push({
          maturity_date: maturityResult.value!,
          principal_amount: principalResult.value!,
          coupon_rate: rateResult.value!,
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

    logger.info('✅ Checkpoint 5 complete', {
      totalDataRows,
      validRows: summary.valid,
      warningRows: summary.warnings,
      errorRows: summary.errors,
      successRate: `${Math.round((summary.valid / totalDataRows) * 100)}%`,
    });

    // ═══════════════════════════════════════════════════════════
    // FINAL RESULT: ALWAYS return data (even if some/all rows failed)
    // ═══════════════════════════════════════════════════════════
    const result: MaturitySchedule = {
      dated_date: datedDate,
      rows: validRows, // Only valid rows (for assembly)
      parsedRows: allParsedRows, // All rows with status (for preview UI)
      warnings,
      summary,
      diagnostics: {
        headerRowIndex: headerResult.headerRowIndex,
        columnMappings: columnResult.mappings,
        missingColumns: columnResult.missingColumns,
        availableColumns: headerResult.headers,
      },
    };

    // SUCCESS - Always return data, even if NO valid rows
    // The UI will show what failed and let user fix it
    logger.info('🎉 Maturity parser complete', {
      success: true,
      validRows: summary.valid,
      errorRows: summary.errors,
      warningRows: summary.warnings,
      datedDate: datedDate || '(not found - user will enter manually)',
    });

    return success(result);
  } catch (error) {
    logger.error('💥 Maturity parser crashed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('PARSING_ERROR', 'Failed to parse maturity schedule due to unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
