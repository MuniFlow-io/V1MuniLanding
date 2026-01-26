/**
 * Bond Assembly Service
 * Orchestrates the complete bond generation process
 *
 * Combines:
 * - Maturity schedule parsing
 * - CUSIP file parsing
 * - Data merging (join)
 * - Bond numbering
 * - Principal to words conversion
 *
 * Returns fully assembled bond data ready for template generation
 */

import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { assignBondNumbers, type BondRow } from './bondNumbering';
import { parseCusipExcel, type CusipSchedule } from './parsing/cusip/cusipParser';
import { parseMaturityExcel, type MaturitySchedule } from './parsing/maturity/maturityParser';
import { principalToWords } from './principalWords';

export interface AssembleBondsInput {
  maturityBuffer: Buffer;
  cusipBuffer: Buffer;
}

export interface BondNumberingConfig {
  startingNumber?: number;
  customPrefix?: string;
}

export interface AssembledBond {
  bond_number: string;
  series?: string;
  maturity_date: string;
  principal_amount: number;
  principal_words: string;
  coupon_rate: number;
  cusip_no: string;
  dated_date: string;
}

export interface AssemblyPreviewResult {
  bonds: AssembledBond[];
  mergeErrors: string[];
  mergeWarnings: string[];
  summary: {
    totalMaturity: number;
    totalCusip: number;
    successfulMerges: number;
    failedMerges: number;
    successRate: number;
  };
  diagnostics: {
    maturitySampleDates: string[];
    cusipSampleDates: string[];
    dateFormatMismatch: boolean;
  };
}

/**
 * Merge maturity rows with CUSIP rows
 * Join strategy: maturity_date + series (if present)
 *
 * GRACEFUL DEGRADATION:
 * - Returns partial results (successful merges)
 * - Reports what didn't merge and why
 * - Never blocks the user
 */
function mergeCusips(
  maturitySchedule: MaturitySchedule,
  cusipSchedule: CusipSchedule
): ServiceResult<{ merged: BondRow[]; errors: string[]; warnings: string[] }> {
  logger.info('Merging maturity schedule with CUSIPs', {
    maturityCount: maturitySchedule.rows.length,
    cusipCount: cusipSchedule.rows.length,
  });

  const merged: BondRow[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const maturity of maturitySchedule.rows) {
    // Find matching CUSIP(s) - use only valid rows
    const matches = cusipSchedule.rows.filter((cusip) => {
      // Match on maturity_date
      if (cusip.maturity_date !== maturity.maturity_date) return false;

      // If series exists on either side, must match
      if (cusip.series || maturity.series) {
        return cusip.series === maturity.series;
      }

      return true;
    });

    // Validate match
    if (matches.length === 0) {
      errors.push(
        `No CUSIP found for maturity ${maturity.maturity_date}` +
          (maturity.series ? ` (Series: ${maturity.series})` : '')
      );
      continue;
    }

    if (matches.length > 1) {
      warnings.push(
        `Multiple CUSIPs found for maturity ${maturity.maturity_date}` +
          (maturity.series ? ` (Series: ${maturity.series})` : '') +
          ` - using first match`
      );
    }

    // Merge (use first match if multiple)
    const cusip = matches[0];
    merged.push({
      series: maturity.series,
      maturity_date: maturity.maturity_date,
      principal_amount: maturity.principal_amount,
      coupon_rate: maturity.coupon_rate,
      cusip_no: cusip.cusip!,
    });
  }

  // Log results (NEVER fail - always return what we got)
  logger.info('CUSIP merge complete', {
    mergedCount: merged.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    successRate: `${Math.round((merged.length / maturitySchedule.rows.length) * 100)}%`,
  });

  if (errors.length > 0) {
    logger.warn('Some maturities could not be matched with CUSIPs', {
      errors: errors.slice(0, 5),
      totalErrors: errors.length,
    });
  }

  return success({ merged, errors, warnings });
}

/**
 * Assemble bonds from maturity schedule and CUSIP file
 * Main orchestration function
 *
 * @param input - Buffers for maturity and CUSIP Excel files
 * @returns Service result with assembled bonds
 */
export async function assembleBonds(
  input: AssembleBondsInput,
  config?: BondNumberingConfig
): Promise<ServiceResult<AssemblyPreviewResult>> {
  const startTime = Date.now();

  logger.info('Bond assembly started');

  Sentry.addBreadcrumb({
    category: 'bond-generator',
    message: 'Starting bond assembly',
    level: 'info',
  });

  try {
    // Step 1: Parse maturity schedule (GRACEFUL DEGRADATION)
    logger.info('Step 1: Parsing maturity schedule');
    const maturityResult = await parseMaturityExcel(input.maturityBuffer);

    if (!maturityResult.data) {
      logger.error('Maturity parsing failed completely', { error: maturityResult.error });
      return failure(
        maturityResult.error!.code,
        maturityResult.error!.message,
        maturityResult.error!.details
      );
    }

    const maturitySchedule = maturityResult.data;

    // Log parsing diagnostics
    logger.info('Maturity parsing complete with diagnostics', {
      parsedRows: maturitySchedule.summary.valid,
      failedRows: maturitySchedule.summary.errors,
      successRate: `${Math.round((maturitySchedule.summary.valid / maturitySchedule.summary.total) * 100)}%`,
      warnings: maturitySchedule.warnings.length,
      missingColumns: maturitySchedule.diagnostics.missingColumns,
      sampleDates: maturitySchedule.rows.slice(0, 3).map((r) => r.maturity_date),
    });

    // Show failed rows if any (for user feedback)
    const maturityErrorRows = maturitySchedule.parsedRows.filter((r) => r.status === 'error');
    if (maturityErrorRows.length > 0) {
      logger.warn('Some maturity rows failed to parse', {
        failedCount: maturityErrorRows.length,
        sampleFailures: maturityErrorRows.slice(0, 3).map((r) => ({
          row: r.rowNumber,
          errors: r.errors,
        })),
      });
    }

    // Step 2: Parse CUSIP file (GRACEFUL DEGRADATION)
    logger.info('Step 2: Parsing CUSIP file');
    const cusipResult = await parseCusipExcel(input.cusipBuffer);

    if (!cusipResult.data) {
      logger.error('CUSIP parsing failed completely', { error: cusipResult.error });
      return failure(
        cusipResult.error!.code,
        cusipResult.error!.message,
        cusipResult.error!.details
      );
    }

    const cusipSchedule = cusipResult.data;

    // Log parsing diagnostics
    logger.info('CUSIP parsing complete with diagnostics', {
      parsedRows: cusipSchedule.summary.valid,
      failedRows: cusipSchedule.summary.errors,
      successRate: `${Math.round((cusipSchedule.summary.valid / cusipSchedule.summary.total) * 100)}%`,
      warnings: cusipSchedule.warnings.length,
      hasMultiColumnCusip: cusipSchedule.diagnostics.hasMultiColumnCusip,
      sampleDates: cusipSchedule.rows.slice(0, 3).map((r) => r.maturity_date),
    });

    // Show failed CUSIP rows if any (for user feedback)
    const cusipErrorRows = cusipSchedule.parsedRows.filter((r) => r.status === 'error');
    if (cusipErrorRows.length > 0) {
      logger.warn('Some CUSIP rows failed to parse', {
        failedCount: cusipErrorRows.length,
        sampleFailures: cusipErrorRows.slice(0, 3).map((r) => ({
          row: r.rowNumber,
          errors: r.errors,
        })),
      });
    }

    // Step 3: Merge maturity + CUSIP (GRACEFUL DEGRADATION)
    logger.info('Step 3: Merging maturity schedule with CUSIPs');
    const mergeResult = mergeCusips(maturitySchedule, cusipSchedule);

    if (!mergeResult.data) {
      logger.error('CUSIP merge failed catastrophically', { error: mergeResult.error });
      return failure(
        mergeResult.error!.code,
        mergeResult.error!.message,
        mergeResult.error!.details
      );
    }

    const { merged: mergedBonds, errors: mergeErrors, warnings: mergeWarnings } = mergeResult.data;

    // Log merge diagnostics
    logger.info('Merge complete with diagnostics', {
      successfulMerges: mergedBonds.length,
      failedMerges: mergeErrors.length,
      warnings: mergeWarnings.length,
      successRate: `${Math.round((mergedBonds.length / maturitySchedule.rows.length) * 100)}%`,
    });

    // Determine if there's a date format mismatch
    const maturitySampleDates = maturitySchedule.rows.slice(0, 3).map((r) => r.maturity_date);
    const cusipSampleDates = cusipSchedule.rows.slice(0, 3).map((r) => r.maturity_date);
    const dateFormatMismatch =
      mergedBonds.length === 0 && maturitySchedule.rows.length > 0 && cusipSchedule.rows.length > 0;

    // Step 4: Assign bond numbers (only for successfully merged bonds)
    let finalBonds: AssembledBond[] = [];

    if (mergedBonds.length > 0) {
      logger.info('Step 4: Assigning bond numbers', {
        startingNumber: config?.startingNumber || 1,
        customPrefix: config?.customPrefix || 'auto',
      });
      const numberedBonds = assignBondNumbers(
        mergedBonds,
        config?.startingNumber,
        config?.customPrefix
      );

      // Step 5: Add principal words and dated date
      logger.info('Step 5: Converting principal amounts to words');
      finalBonds = numberedBonds.map((bond) => ({
        ...bond,
        series: bond.series || undefined, // Convert null to undefined
        principal_words: principalToWords(bond.principal_amount),
        dated_date: maturitySchedule.dated_date,
      }));
    }

    const duration = Date.now() - startTime;
    const successRate = Math.round((mergedBonds.length / maturitySchedule.rows.length) * 100);

    logger.info('Bond assembly complete (graceful degradation)', {
      successfulBonds: finalBonds.length,
      failedMerges: mergeErrors.length,
      successRate: `${successRate}%`,
      datedDate: maturitySchedule.dated_date,
      durationMs: duration,
    });

    Sentry.addBreadcrumb({
      category: 'bond-generator',
      message: 'Bond assembly completed with preview',
      level: 'info',
      data: {
        bondCount: finalBonds.length,
        failedMerges: mergeErrors.length,
        successRate,
        durationMs: duration,
      },
    });

    // ALWAYS return data (even if no bonds merged - let UI show the problem)
    const result: AssemblyPreviewResult = {
      bonds: finalBonds,
      mergeErrors,
      mergeWarnings,
      summary: {
        totalMaturity: maturitySchedule.rows.length,
        totalCusip: cusipSchedule.rows.length,
        successfulMerges: mergedBonds.length,
        failedMerges: mergeErrors.length,
        successRate,
      },
      diagnostics: {
        maturitySampleDates,
        cusipSampleDates,
        dateFormatMismatch,
      },
    };

    return success(result);
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Bond assembly failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    Sentry.captureException(error, {
      tags: {
        feature: 'bond-generator',
        operation: 'assembleBonds',
      },
    });

    return failure('INTERNAL_ERROR', 'Bond assembly failed due to an unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
