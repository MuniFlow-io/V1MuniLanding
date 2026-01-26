/**
 * Maturity Schedule Preview Types
 *
 * Centralized type definitions for the maturity preview/editing feature
 */

/**
 * Status of a parsed row
 */
export type RowStatus = 'valid' | 'warning' | 'error' | 'skipped';

/**
 * Parsed maturity row with validation state
 */
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
  confirmed?: boolean; // User has explicitly confirmed this row
}

/**
 * Complete maturity schedule preview
 */
export interface MaturitySchedulePreview {
  dated_date: string;
  rows: ParsedMaturityRow[];
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
    availableColumns: string[];
    missingColumns: string[];
  };
}

/**
 * Field being edited in a row
 */
export type EditableField = 'maturity_date' | 'principal_amount' | 'coupon_rate' | 'series';

/**
 * Edit state for a specific cell
 */
export interface CellEditState {
  rowNumber: number;
  field: EditableField;
  value: string;
}
