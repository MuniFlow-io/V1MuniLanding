/**
 * CUSIP Parser (Re-export from Atomic Services)
 *
 * This file now re-exports from the atomic parsing services.
 * The actual implementation is in parsing/cusip/ directory.
 *
 * REFACTORED: 2026-01-19
 * - Split into atomic services (cusipValidator, cusipParser)
 * - Graceful degradation (returns partial results)
 * - Handles both single-column and split-column CUSIP formats
 * - Detailed diagnostics for UI preview
 */

export {
  parseCusipExcel,
  type CusipRow,
  type CusipRowStatus,
  type CusipSchedule,
  type ParsedCusipRow,
} from './parsing/cusip/cusipParser';

export {
  assembleCusipFromParts,
  validateCusip,
  type CusipValidationResult,
} from './parsing/cusip/cusipValidator';
