/**
 * Assembly Preview Type Definitions
 *
 * Types for reviewing bond assembly before final generation
 */

export interface MergeResult {
  maturityDate: string;
  cusipDate: string | null;
  cusip: string | null;
  principalAmount: number;
  couponRate: number;
  series?: string;
  status: 'matched' | 'no_cusip' | 'multiple_cusips' | 'date_mismatch';
  warnings: string[];
  errors: string[];
}

export interface AssemblyPreview {
  results: MergeResult[];
  summary: {
    total: number;
    matched: number;
    noCusip: number;
    multipleCusips: number;
    dateMismatches: number;
  };
  diagnostics: {
    maturitySampleDates: string[];
    cusipSampleDates: string[];
    dateFormatMismatch: boolean;
  };
}

export type EditableAssemblyField = 'cusip' | 'maturity_date';
