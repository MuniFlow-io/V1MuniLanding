/**
 * Tag Constants
 * Centralized tag definitions for bond form templates
 *
 * SINGLE SOURCE OF TRUTH for all tag-related constants
 */

// ============================================================================
// REQUIRED TAGS (Must appear exactly once)
// ============================================================================

export const REQUIRED_TAGS = [
  'CUSIP_NO',
  'MATURITY_DATE',
  'DATED_DATE',
  'PRINCIPAL_AMOUNT_NUM',
  'PRINCIPAL_AMOUNT_WORDS',
  'INTEREST_RATE',
] as const;

// ============================================================================
// OPTIONAL TAGS (May appear zero or more times)
// ============================================================================

export const OPTIONAL_TAGS = [
  'BOND_NUMBER',
  'SERIES',
  'ISSUER_NAME',
  'BOND_TITLE',
  'INTEREST_DATES',
  'PROJECT_NAME',
] as const;

// ============================================================================
// TAG OPTIONS (For UI dropdowns)
// ============================================================================

export const TAG_OPTIONS = [
  { value: '', label: '-- Select Tag --', displayName: '-- Select Tag --', required: false },
  { value: 'CUSIP_NO', label: 'CUSIP Number', displayName: 'CUSIP Number', required: true },
  { value: 'MATURITY_DATE', label: 'Maturity Date', displayName: 'Maturity Date', required: true },
  { value: 'DATED_DATE', label: 'Dated Date', displayName: 'Dated Date', required: true },
  {
    value: 'PRINCIPAL_AMOUNT_NUM',
    label: 'Principal Amount (Number)',
    displayName: 'Principal Amount (Number)',
    required: true,
  },
  {
    value: 'PRINCIPAL_AMOUNT_WORDS',
    label: 'Principal Amount (Words)',
    displayName: 'Principal Amount (Words)',
    required: true,
  },
  { value: 'INTEREST_RATE', label: 'Interest Rate', displayName: 'Interest Rate', required: true },
  { value: 'BOND_NUMBER', label: 'Bond Number', displayName: 'Bond Number', required: false },
  { value: 'SERIES', label: 'Series', displayName: 'Series', required: false },
  {
    value: 'ISSUER_NAME',
    label: 'Issuer Name',
    displayName: 'Issuer Name',
    required: false,
  },
  {
    value: 'BOND_TITLE',
    label: 'Bond Title',
    displayName: 'Bond Title',
    required: false,
  },
  {
    value: 'INTEREST_DATES',
    label: 'Interest Payment Dates',
    displayName: 'Interest Payment Dates',
    required: false,
  },
  {
    value: 'PROJECT_NAME',
    label: 'Project Name',
    displayName: 'Project Name',
    required: false,
  },
] as const;

// ============================================================================
// TAG HINTS (For auto-detection)
// ============================================================================

export const TAG_HINTS: Record<string, string> = {
  'bond number': 'BOND_NUMBER',
  'bond no': 'BOND_NUMBER',
  cusip: 'CUSIP_NO',
  'maturity date': 'MATURITY_DATE',
  maturity: 'MATURITY_DATE',
  'dated date': 'DATED_DATE',
  'issue date': 'DATED_DATE',
  'principal amount': 'PRINCIPAL_AMOUNT_NUM',
  'in words': 'PRINCIPAL_AMOUNT_WORDS',
  'interest rate': 'INTEREST_RATE',
  'coupon rate': 'INTEREST_RATE',
  coupon: 'INTEREST_RATE',
  series: 'SERIES',
  issuer: 'ISSUER_NAME',
  project: 'PROJECT_NAME',
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RequiredTag = (typeof REQUIRED_TAGS)[number];
export type OptionalTag = (typeof OPTIONAL_TAGS)[number];
export type BondTag = RequiredTag | OptionalTag;

/**
 * Check if a tag name is valid
 */
export function isValidTag(tagName: string): tagName is BondTag {
  const allTags = [...REQUIRED_TAGS, ...OPTIONAL_TAGS];
  return allTags.includes(tagName as BondTag);
}

/**
 * Check if a tag is required
 */
export function isRequiredTag(tagName: string): tagName is RequiredTag {
  return REQUIRED_TAGS.includes(tagName as RequiredTag);
}

/**
 * Get user-friendly display name for a tag
 * Removes underscores and formats nicely for UI display
 */
export function getTagDisplayName(tagName: string): string {
  const option = TAG_OPTIONS.find((opt) => opt.value === tagName);
  return option?.displayName || tagName.replace(/_/g, ' ');
}
