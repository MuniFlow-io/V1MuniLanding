/**
 * Bond Generator Services
 * Barrel export for all bond generation services
 */

// Main orchestrator
export {
  assembleBonds,
  type AssembleBondsInput,
  type AssembledBond,
  type BondNumberingConfig,
} from './bondAssembler';

// Parsers
export { parseCusipExcel, type CusipRow } from './cusipParser';
export { parseMaturityExcel, type MaturityRow, type MaturitySchedule } from './maturityParser';

// Pure functions
export {
  assignBondNumbers,
  validateBondsForNumbering,
  type BondRow,
  type NumberedBond,
} from './bondNumbering';
export { isValidPrincipalAmount, principalToWords } from './principalWords';

// DOCX processing (Phase 2)
export {
  fillDocxTemplate,
  fillTemplateForAllBonds,
  validateTemplateBuffer,
  type BondFile,
} from './docxFiller';
export { extractTagsFromDocx, validateTagMap, type TagMap, type TagPosition } from './docxParser';
export { assembleBondsZip, getZipMetadata, validateBondFiles } from './zipAssembler';

// DOCX to HTML conversion
export { convertDocxToHtml, type DocxToHtmlResult } from './docxToHtml';

// Tag constants (centralized)
export {
  isRequiredTag,
  isValidTag,
  OPTIONAL_TAGS,
  REQUIRED_TAGS,
  TAG_HINTS,
  TAG_OPTIONS,
  type BondTag,
  type OptionalTag,
  type RequiredTag,
} from './tagConstants';

// Blank-space tagging (simplified approach)
export { replaceAllBlanksWithTags } from './blankSpaceTagInserter';
