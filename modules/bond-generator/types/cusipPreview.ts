/**
 * CUSIP Schedule Preview Type Definitions
 *
 * Types for interactive CUSIP preview with editing capability
 */

export type CusipRowStatus = 'valid' | 'warning' | 'error' | 'skipped';

export interface ParsedCusipRow {
  rowNumber: number;
  status: CusipRowStatus;
  cusip: string | null;
  maturity_date: string | null;
  series?: string | null;
  errors: string[];
  warnings: string[];
  rawData: unknown[];
  confirmed?: boolean; // User has explicitly confirmed this row
}

export interface CusipSchedulePreview {
  rows: ParsedCusipRow[];
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

export type EditableCusipField = 'cusip' | 'maturity_date' | 'series';
