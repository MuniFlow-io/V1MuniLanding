/**
 * Display Helpers
 * Converts technical names to user-friendly labels
 *
 * ARCHITECTURE: Utility (Shared across module)
 * - Pure functions, no state
 * - Used by components to display user-friendly text
 * - Complies with Elite Standards: Single responsibility
 */

// Tag display names (for Bond Info form)
export const TAG_DISPLAY_NAMES: Record<string, string> = {
  INTEREST_DATES: 'Interest Payment Dates',
  ISSUER_NAME: 'Issuer Name',
  BOND_TITLE: 'Bond Title',
  BOND_NUMBER: 'Bond Number',
  DATED_DATE: 'Issue Date',
  MATURITY_DATE: 'Maturity Date',
  PRINCIPAL_AMOUNT_NUM: 'Principal Amount',
  PRINCIPAL_AMOUNT_WORDS: 'Principal Amount (in words)',
  CUSIP_NO: 'CUSIP Number',
  SERIES: 'Series',
};

// Field display names (for tables/forms)
export const FIELD_DISPLAY_NAMES: Record<string, string> = {
  maturity_date: 'Maturity Date',
  principal_amount: 'Principal Amount',
  coupon_rate: 'Interest Rate',
  cusip_no: 'CUSIP Number',
  series: 'Series',
  bond_number: 'Bond Number',
  dated_date: 'Issue Date',
};

// Section display names (for headers)
export const SECTION_DISPLAY_NAMES: Record<string, string> = {
  'Assembly Metadata': 'Bond Information Summary',
  'Series Detected': 'Series',
  'Dated Date': 'Issue Date',
  'Grouping Method': 'Matched By',
  'Number of Bonds': 'Total Bonds',
};

/**
 * Get display name for a tag
 */
export function getTagDisplayName(tag: string): string {
  return TAG_DISPLAY_NAMES[tag] || tag;
}

/**
 * Get display name for a field
 */
export function getFieldDisplayName(field: string): string {
  return FIELD_DISPLAY_NAMES[field] || field;
}

/**
 * Format grouping method for display
 * "maturity_date" → "Maturity Date"
 * "maturity_date + series" → "Maturity Date and Series"
 */
export function formatGroupingMethod(method: string): string {
  if (method.includes('+')) {
    const parts = method.split('+').map((p) => p.trim());
    return parts.map((p) => getFieldDisplayName(p)).join(' and ');
  }
  return getFieldDisplayName(method);
}
