/**
 * Maturity Schedule Parser (Re-export from Atomic Services)
 *
 * This file now re-exports from the atomic parsing services.
 * The actual implementation is in parsing/maturity/ directory.
 *
 * REFACTORED: 2026-01-19
 * - Split into atomic services (dateParser, principalParser, rateParser)
 * - Graceful degradation (returns partial results)
 * - Detailed diagnostics for UI preview
 */

export {
  parseMaturityExcel,
  type MaturityRow,
  type MaturitySchedule,
  type ParsedMaturityRow,
  type RowStatus,
} from './parsing/maturity/maturityParser';

export { parseDate, type DateParseResult } from './parsing/maturity/dateParser';
export { parsePrincipal, type PrincipalParseResult } from './parsing/maturity/principalParser';
export { parseRate, type RateParseResult } from './parsing/maturity/rateParser';
