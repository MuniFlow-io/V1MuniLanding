/**
 * DOCX Template Filler Service
 * Pure function - fills DOCX template with bond data
 *
 * ARCHITECTURE: Backend Service (Layer 6)
 * - NO HTTP requests
 * - NO user interaction
 * - Pure business logic
 * - Returns filled DOCX buffer
 *
 * DETERMINISM: Same template + same data → same output
 */

import AdmZip from 'adm-zip';
import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import type { AssembledBond } from './bondAssembler';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BondInfo {
  issuerName: string;
  bondTitle: string;
  interestDates: {
    firstDate: string;
    secondDate: string;
  };
}

export interface BondFile {
  bond: AssembledBond; // Full bond data for rich filename generation
  buffer: Buffer;
  metadata: {
    issuerName: string;
    bondTitle: string;
  };
}

// ============================================================================
// TEMPLATE FILLING FUNCTIONS
// ============================================================================

/**
 * Format ISO date string to human-readable format
 * Example: "1909-07-19" → "July 19, 1909"
 *
 * CANONICAL DATE FORMATTER - Use for ALL date fields in bond certificates
 */
function formatDate(isoDate: string): string {
  if (!isoDate) {
    return '';
  }

  try {
    const date = new Date(isoDate);

    // Verify date is valid
    if (isNaN(date.getTime())) {
      logger.warn('Invalid date value', { isoDate });
      return isoDate; // Fallback to original value
    }

    // Format as "Month Day, Year" (e.g., "July 19, 1909")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    logger.warn('Failed to format date', {
      isoDate,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return isoDate; // Fallback to ISO if parsing fails
  }
}

/**
 * Format interest payment dates for bond certificate
 * Example: "June 1, 2024" & "December 1, 2024" → "June 1 and December 1"
 */
function formatInterestDates(interestDates: BondInfo['interestDates']): string {
  if (!interestDates.firstDate || !interestDates.secondDate) {
    return '';
  }

  try {
    const first = new Date(interestDates.firstDate);
    const second = new Date(interestDates.secondDate);

    const firstMonth = first.toLocaleDateString('en-US', { month: 'long' });
    const firstDay = first.getDate();
    const secondMonth = second.toLocaleDateString('en-US', { month: 'long' });
    const secondDay = second.getDate();

    return `${firstMonth} ${firstDay} and ${secondMonth} ${secondDay}`;
  } catch (error) {
    logger.warn('Failed to format interest dates', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return '';
  }
}

/**
 * Create replacements map from bond data
 * Maps {{TAG}} → actual value
 *
 * NOTE: All dates MUST be formatted using formatDate() to ensure consistent
 * human-readable output (e.g., "July 19, 1909" not "1909-07-19")
 */
function createReplacementsMap(
  bond: AssembledBond,
  bondInfo?: BondInfo | null
): Record<string, string> {
  return {
    BOND_NUMBER: bond.bond_number,
    SERIES: bond.series || '', // Empty string for optional tags
    MATURITY_DATE: formatDate(bond.maturity_date), // Format ISO → "Month Day, Year"
    PRINCIPAL_AMOUNT_NUM: bond.principal_amount.toLocaleString('en-US'),
    PRINCIPAL_AMOUNT_WORDS: bond.principal_words,
    INTEREST_RATE: `${bond.coupon_rate}%`,
    CUSIP_NO: bond.cusip_no,
    DATED_DATE: formatDate(bond.dated_date), // Format ISO → "Month Day, Year"
    // Optional tags from form fields
    ISSUER_NAME: bondInfo?.issuerName || '',
    BOND_TITLE: bondInfo?.bondTitle || '',
    INTEREST_DATES: bondInfo?.interestDates ? formatInterestDates(bondInfo.interestDates) : '',
    PROJECT_NAME: '', // Not yet implemented
  };
}

/**
 * Replace all {{TAG}} patterns in XML with actual values
 * Uses global regex to replace all occurrences
 */
function replaceTagsInXml(documentXml: string, replacements: Record<string, string>): string {
  let modifiedXml = documentXml;

  for (const [tag, value] of Object.entries(replacements)) {
    // Create regex for {{TAG}} pattern
    const pattern = new RegExp(`\\{\\{${tag}\\}\\}`, 'g');
    modifiedXml = modifiedXml.replace(pattern, value);
  }

  return modifiedXml;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Fill DOCX template with bond data
 *
 * Process:
 * 1. Extract document.xml from DOCX (ZIP file)
 * 2. Replace all {{TAG}} with actual values
 * 3. Update ZIP with modified XML
 * 4. Return new DOCX buffer
 *
 * @param templateBuffer - Original DOCX template buffer
 * @param bond - Bond data to fill into template
 * @param bondInfo - Optional bond info (issuer, title, interest dates)
 * @returns ServiceResult<Buffer> - Filled DOCX buffer or error
 */
export async function fillDocxTemplate(
  templateBuffer: Buffer,
  bond: AssembledBond,
  bondInfo?: BondInfo | null
): Promise<ServiceResult<Buffer>> {
  logger.debug('Filling template for bond', { bondNumber: bond.bond_number });

  try {
    // Step 1: Read DOCX as ZIP
    const zip = new AdmZip(templateBuffer);

    // Step 2: Extract document.xml
    let documentXml = zip.readAsText('word/document.xml');

    if (!documentXml) {
      logger.error('No document.xml found in template', { bondNumber: bond.bond_number });
      return failure('INVALID_TEMPLATE', 'Invalid template: missing document.xml');
    }

    // Step 3: Create replacements map
    const replacements = createReplacementsMap(bond, bondInfo);

    // Step 4: Replace all {{TAG}} with values
    documentXml = replaceTagsInXml(documentXml, replacements);

    // Step 5: Update ZIP with modified XML
    zip.updateFile('word/document.xml', Buffer.from(documentXml, 'utf-8'));

    // Step 6: Get final DOCX buffer
    const filledBuffer = zip.toBuffer();

    logger.debug('Template filled successfully', {
      bondNumber: bond.bond_number,
      outputSize: filledBuffer.length,
    });

    return success(filledBuffer);
  } catch (error) {
    logger.error('Template fill failed', {
      bondNumber: bond.bond_number,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('FILL_ERROR', `Failed to fill template for bond ${bond.bond_number}`, {
      bondNumber: bond.bond_number,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Fill template for all bonds
 *
 * Processes each bond sequentially and collects results
 * Returns Map of bond number → filled DOCX buffer
 *
 * Hard stop if ANY bond fails - maintains all-or-nothing principle
 *
 * @param templateBuffer - Original DOCX template buffer
 * @param bonds - Array of bond data to process
 * @param bondInfo - Optional bond info (issuer, title, interest dates)
 * @returns ServiceResult<Map<string, Buffer>> - Map of filled DOCXs or error
 */
export async function fillTemplateForAllBonds(
  templateBuffer: Buffer,
  bonds: AssembledBond[],
  bondInfo?: BondInfo | null
): Promise<ServiceResult<BondFile[]>> {
  logger.info('Filling templates for all bonds', {
    bondCount: bonds.length,
    hasBondInfo: !!bondInfo,
  });

  const startTime = Date.now();

  try {
    const bondFiles: BondFile[] = [];

    // Process each bond sequentially
    for (const bond of bonds) {
      const result = await fillDocxTemplate(templateBuffer, bond, bondInfo);

      // Hard stop if any bond fails
      if (!result.data) {
        logger.error('Batch fill failed', {
          failedBond: bond.bond_number,
          successfulBonds: bondFiles.length,
          totalBonds: bonds.length,
        });

        return failure(
          result.error!.code,
          `Failed to fill template for bond ${bond.bond_number}: ${result.error!.message}`,
          {
            failedBond: bond.bond_number,
            successfulBonds: bondFiles.length,
            totalBonds: bonds.length,
          }
        );
      }

      // Create rich BondFile with full context
      bondFiles.push({
        bond,
        buffer: result.data,
        metadata: {
          issuerName: bondInfo?.issuerName || '',
          bondTitle: bondInfo?.bondTitle || '',
        },
      });
    }

    const duration = Date.now() - startTime;

    logger.info('All templates filled successfully', {
      bondCount: bonds.length,
      durationMs: duration,
      avgTimePerBond: Math.round(duration / bonds.length),
    });

    return success(bondFiles);
  } catch (error) {
    logger.error('Batch template fill failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('FILL_ERROR', 'Failed to fill templates', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Validate template buffer is a valid DOCX
 * Quick check before processing
 */
export function validateTemplateBuffer(buffer: Buffer): ServiceResult<boolean> {
  try {
    const zip = new AdmZip(buffer);
    const documentXml = zip.readAsText('word/document.xml');

    if (!documentXml) {
      return failure('INVALID_TEMPLATE', 'Invalid DOCX: missing document.xml');
    }

    return success(true);
  } catch (error) {
    return failure('INVALID_TEMPLATE', 'Invalid DOCX file', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
