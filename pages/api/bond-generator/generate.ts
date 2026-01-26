/**
 * Generate Bonds API
 *
 * ARCHITECTURE: Backend API (Layer 5)
 * - Orchestrates complete bond generation
 * - Calls all services in sequence
 * - Returns ZIP file for download
 *
 * FLOW:
 * 1. Parse maturity schedule (Excel)
 * 2. Parse CUSIP file (Excel)
 * 3. Assemble bond data
 * 4. Fill DOCX templates for each bond
 * 5. Create ZIP file
 * 6. Return ZIP for download
 *
 * AUTH: App-level (withApiAuth) - User must be logged in
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import {
  assembleBonds,
  type BondNumberingConfig,
} from '@/lib/services/bond-generator/bondAssembler';
import { fillTemplateForAllBonds } from '@/lib/services/bond-generator/docxFiller';
import { assembleBondsZip } from '@/lib/services/bond-generator/zipAssembler';
import * as Sentry from '@sentry/nextjs';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiResponse } from 'next';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
    responseLimit: '50mb', // Allow large ZIP files
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BondInfo {
  issuerName: string;
  bondTitle: string;
  interestDates: {
    firstDate: string;
    secondDate: string;
  };
}

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate all required files are present
 */
function validateRequiredFiles(files: {
  template?: formidable.File | formidable.File[];
  maturityFile?: formidable.File | formidable.File[];
  cusipFile?: formidable.File | formidable.File[];
}): boolean {
  return !!(files.template && files.maturityFile && files.cusipFile);
}

/**
 * Extract single file from formidable result
 */
function extractFile(
  file: formidable.File | formidable.File[] | undefined
): formidable.File | null {
  if (!file) return null;
  return Array.isArray(file) ? file[0] : file;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(req: AuthenticatedRequest, res: NextApiResponse<Buffer | ErrorResponse>) {
  // Only accept POST
  if (req.method !== 'POST') {
    logger.warn('Invalid method for generate', {
      method: req.method,
      userId: req.user.id,
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    logger.info('Bond generation request from authenticated user', {
      userId: req.user.id,
    });

    Sentry.addBreadcrumb({
      category: 'bond-generator',
      message: 'Generation started',
      level: 'info',
    });

    // Parse multipart form data
    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            logger.error('Form parse error', { error: err.message });
            reject(err);
          } else {
            resolve([fields, files]);
          }
        });
      }
    );

    // Validate all files present
    if (!validateRequiredFiles(files)) {
      logger.warn('Missing required files');
      return res.status(400).json({
        error: 'All files required (template, maturityFile, cusipFile)',
        code: 'MISSING_FILES',
      });
    }

    // Extract files
    const templateFile = extractFile(files.template);
    const maturityFile = extractFile(files.maturityFile);
    const cusipFile = extractFile(files.cusipFile);

    if (!templateFile || !maturityFile || !cusipFile) {
      logger.warn('Failed to extract files');
      return res.status(400).json({
        error: 'Failed to process uploaded files',
        code: 'FILE_PROCESSING_ERROR',
      });
    }

    // Parse bond info from form data
    let bondInfo: BondInfo | null = null;
    if (fields.bondInfo) {
      try {
        const bondInfoString = Array.isArray(fields.bondInfo)
          ? fields.bondInfo[0]
          : fields.bondInfo;
        bondInfo = JSON.parse(bondInfoString);

        logger.info('Bond info received', {
          hasIssuerName: !!bondInfo?.issuerName,
          hasBondTitle: !!bondInfo?.bondTitle,
          hasInterestDates: !!(
            bondInfo?.interestDates?.firstDate && bondInfo?.interestDates?.secondDate
          ),
        });
      } catch (error) {
        logger.warn('Failed to parse bondInfo', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Parse bond numbering config from fields (optional)
    const numberingConfig: BondNumberingConfig | undefined =
      fields.startingNumber || fields.customPrefix
        ? {
            startingNumber: fields.startingNumber
              ? parseInt(
                  Array.isArray(fields.startingNumber)
                    ? fields.startingNumber[0]
                    : fields.startingNumber
                )
              : undefined,
            customPrefix: fields.customPrefix
              ? Array.isArray(fields.customPrefix)
                ? fields.customPrefix[0]
                : fields.customPrefix
              : undefined,
          }
        : undefined;

    // Read file buffers
    const templateBuffer = await fs.readFile(templateFile.filepath);
    const maturityBuffer = await fs.readFile(maturityFile.filepath);
    const cusipBuffer = await fs.readFile(cusipFile.filepath);

    logger.info('Files read successfully', {
      templateSize: templateBuffer.length,
      maturitySize: maturityBuffer.length,
      cusipSize: cusipBuffer.length,
    });

    // ========================================================================
    // STEP 1: Assemble Bond Data
    // ========================================================================

    logger.info('Step 1: Assembling bond data', {
      customNumbering: !!numberingConfig,
    });

    const bondsResult = await assembleBonds(
      {
        maturityBuffer,
        cusipBuffer,
      },
      numberingConfig
    );

    if (!bondsResult.data) {
      logger.error('Bond assembly failed', { error: bondsResult.error });

      Sentry.captureMessage('Bond assembly failed', {
        level: 'error',
        tags: { feature: 'bond-generator' },
        extra: { error: bondsResult.error },
      });

      return res.status(400).json({
        error: bondsResult.error!.message,
        code: bondsResult.error!.code,
        details: bondsResult.error!.details,
      });
    }

    const bonds = bondsResult.data.bonds;

    logger.info('Bond data assembled', {
      bondCount: bonds.length,
      datedDate: bonds[0]?.dated_date,
    });

    // ========================================================================
    // STEP 2: Fill Templates
    // ========================================================================

    logger.info('Step 2: Filling templates', { bondCount: bonds.length });

    const filledResult = await fillTemplateForAllBonds(templateBuffer, bonds, bondInfo);

    if (!filledResult.data) {
      logger.error('Template fill failed', { error: filledResult.error });

      Sentry.captureMessage('Template fill failed', {
        level: 'error',
        tags: { feature: 'bond-generator' },
        extra: { error: filledResult.error },
      });

      return res.status(400).json({
        error: filledResult.error!.message,
        code: filledResult.error!.code,
        details: filledResult.error!.details,
      });
    }

    const filledDocs = filledResult.data;

    logger.info('Templates filled successfully', {
      bondCount: filledDocs.length,
    });

    // ========================================================================
    // STEP 3: Assemble ZIP
    // ========================================================================

    logger.info('Step 3: Assembling ZIP file');

    const zipResult = await assembleBondsZip(filledDocs);

    if (!zipResult.data) {
      logger.error('ZIP assembly failed', { error: zipResult.error });

      Sentry.captureMessage('ZIP assembly failed', {
        level: 'error',
        tags: { feature: 'bond-generator' },
        extra: { error: zipResult.error },
      });

      return res.status(400).json({
        error: zipResult.error!.message,
        code: zipResult.error!.code,
        details: zipResult.error!.details,
      });
    }

    const zipBuffer = zipResult.data;

    const duration = Date.now() - startTime;

    logger.info('Bond generation complete', {
      bondCount: bonds.length,
      zipSize: zipBuffer.length,
      durationMs: duration,
    });

    Sentry.addBreadcrumb({
      category: 'bond-generator',
      message: 'Generation completed successfully',
      level: 'info',
      data: {
        bondCount: bonds.length,
        durationMs: duration,
      },
    });

    // ========================================================================
    // STEP 4: Return ZIP File
    // ========================================================================

    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="bonds.zip"');
    res.setHeader('Content-Length', zipBuffer.length);

    return res.status(200).send(zipBuffer);
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Bond generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    Sentry.captureException(error, {
      tags: {
        feature: 'bond-generator',
        operation: 'generate',
      },
    });

    return res.status(500).json({
      error: 'Generation failed',
      code: 'INTERNAL_ERROR',
    });
  }
}

export default withRequestId(withApiAuth(handler));
