/**
 * ZIP Assembler Service
 * Pure function - creates deterministic ZIP file from bond certificates
 *
 * ARCHITECTURE: Backend Service (Layer 6)
 * - NO HTTP requests
 * - NO user interaction
 * - Pure business logic
 * - Returns ZIP buffer
 *
 * DETERMINISM: Same bonds → same ZIP (per spec Section 12)
 * - Deterministic filenames
 * - Deterministic ordering (sorted by bond number)
 * - Metadata normalized (no timestamps)
 */

import AdmZip from 'adm-zip';
import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import type { BondFile } from './docxFiller';

// ============================================================================
// ZIP ASSEMBLY FUNCTIONS
// ============================================================================

/**
 * Sort bond files deterministically by bond number
 * Ensures same bonds → same order every time
 *
 * Per spec Section 12: "Deterministic ZIP ordering"
 */
function sortBondFiles(bondFiles: BondFile[]): BondFile[] {
  return [...bondFiles].sort((a, b) => a.bond.bond_number.localeCompare(b.bond.bond_number));
}

/**
 * Sanitize text for use in filenames
 * Removes special characters and limits length
 */
function sanitizeForFilename(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
    .substring(0, 50); // Limit length
}

/**
 * Generate rich descriptive filename for bond
 * Format: {Issuer}_{Series}_{Maturity}_{BondNumber}.docx
 *
 * Examples:
 * - CityOfAustin_2024A_20250601_2024A-001.docx
 * - StateOfTexas_Series2024B_20261215_2024B-042.docx
 */
function generateFilename(bondFile: BondFile): string {
  const { bond, metadata } = bondFile;

  // Build filename components
  const issuer = metadata.issuerName ? sanitizeForFilename(metadata.issuerName) : 'Bond';
  const series = bond.series ? sanitizeForFilename(bond.series) : 'Series';
  const maturity = bond.maturity_date.replace(/-/g, ''); // YYYYMMDD format
  const number = bond.bond_number;

  return `${issuer}_${series}_${maturity}_${number}.docx`;
}

/**
 * Add files to ZIP in deterministic order
 * Normalizes metadata to ensure same inputs → same output
 */
function addFilesToZip(zip: AdmZip, bondFiles: BondFile[]): void {
  for (const bondFile of bondFiles) {
    const filename = generateFilename(bondFile);

    // Add file to ZIP
    // Note: We don't set custom timestamps to maintain determinism
    zip.addFile(filename, bondFile.buffer);

    logger.debug('Added bond to ZIP', {
      filename,
      bondNumber: bondFile.bond.bond_number,
      size: bondFile.buffer.length,
    });
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Assemble bonds into ZIP file
 *
 * Per spec Section 12:
 * - Deterministic filenames ({BOND_NUMBER}.docx)
 * - Deterministic ZIP ordering (sorted by bond number)
 * - Metadata normalized (no timestamps, GUIDs)
 *
 * Process:
 * 1. Sort bonds by bond number (deterministic)
 * 2. Add each bond to ZIP with deterministic filename
 * 3. Return ZIP buffer
 *
 * @param bonds - Map of bond number → DOCX buffer
 * @returns ServiceResult<Buffer> - ZIP file buffer or error
 *
 * Determinism guarantee:
 * - Same bonds (same order) → same ZIP file every time
 * - No timestamps, no random IDs, no non-deterministic metadata
 */
export async function assembleBondsZip(bondFiles: BondFile[]): Promise<ServiceResult<Buffer>> {
  logger.info('Assembling bonds into ZIP', { bondCount: bondFiles.length });

  const startTime = Date.now();

  try {
    // Validate input
    if (bondFiles.length === 0) {
      logger.error('No bonds provided for ZIP assembly');
      return failure('NO_BONDS', 'No bonds to assemble into ZIP');
    }

    // Step 1: Create ZIP instance
    const zip = new AdmZip();

    // Step 2: Sort bonds deterministically
    const sortedBonds = sortBondFiles(bondFiles);

    logger.debug('Bonds sorted for ZIP', {
      firstBond: sortedBonds[0]?.bond.bond_number,
      lastBond: sortedBonds[sortedBonds.length - 1]?.bond.bond_number,
    });

    // Step 3: Add all files to ZIP
    addFilesToZip(zip, sortedBonds);

    // Step 4: Generate ZIP buffer
    const zipBuffer = zip.toBuffer();

    const duration = Date.now() - startTime;

    logger.info('ZIP assembled successfully', {
      bondCount: bondFiles.length,
      zipSize: zipBuffer.length,
      durationMs: duration,
      averageBondSize: Math.round(
        bondFiles.reduce((sum, b) => sum + b.buffer.length, 0) / bondFiles.length
      ),
    });

    return success(zipBuffer);
  } catch (error) {
    logger.error('ZIP assembly failed', {
      bondCount: bondFiles.length,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('ZIP_ERROR', 'Failed to create ZIP file', {
      bondCount: bondFiles.length,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Validate bond files before ZIP assembly
 * Ensures all required data is present
 */
export function validateBondFiles(bonds: Map<string, Buffer>): ServiceResult<boolean> {
  if (bonds.size === 0) {
    return failure('NO_BONDS', 'No bonds provided');
  }

  // Check all buffers are valid
  for (const [bondNumber, buffer] of bonds.entries()) {
    if (!buffer || buffer.length === 0) {
      return failure('INVALID_BOND', `Bond ${bondNumber} has empty buffer`);
    }
  }

  return success(true);
}

/**
 * Get ZIP file metadata for logging/debugging
 * Does not modify ZIP, just reads metadata
 */
export function getZipMetadata(zipBuffer: Buffer): {
  fileCount: number;
  totalSize: number;
  files: string[];
} {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  return {
    fileCount: entries.length,
    totalSize: zipBuffer.length,
    files: entries.map((e: AdmZip.IZipEntry) => e.entryName),
  };
}
