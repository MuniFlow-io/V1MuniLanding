/**
 * Bond Generator API Route
 *
 * ARCHITECTURE: Backend API Layer (Layer 4)
 * - Handles file uploads
 * - Calls backend service
 * - Returns JSON response
 * - Includes error logging
 *
 * AUTH: App-level (withApiAuth) - User must be logged in
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { assembleBonds, type BondNumberingConfig } from '@/lib/services/bond-generator';
import { convertCsvToExcel } from '@/lib/services/bond-generator/parsing/csv/csvToExcel';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({ multiples: false });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    // Extract bond numbering config from fields (optional)
    const config: BondNumberingConfig | undefined =
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

    // Extract files
    const maturityFileArray = files.maturityFile;
    const cusipFileArray = files.cusipFile;

    if (!maturityFileArray || !cusipFileArray) {
      return res.status(400).json({ error: 'Both maturityFile and cusipFile are required' });
    }

    const maturityFile = Array.isArray(maturityFileArray)
      ? maturityFileArray[0]
      : maturityFileArray;
    const cusipFile = Array.isArray(cusipFileArray) ? cusipFileArray[0] : cusipFileArray;

    if (!maturityFile || !cusipFile) {
      return res.status(400).json({ error: 'Files are required' });
    }

    // Read file buffers
    let maturityBuffer = await fs.readFile(maturityFile.filepath);
    let cusipBuffer = await fs.readFile(cusipFile.filepath);

    // NEW: Convert CSV to Excel if needed (Section 1 - CSV support)
    const maturityFilename = maturityFile.originalFilename || 'maturity';
    const cusipFilename = cusipFile.originalFilename || 'cusip';

    // Check if maturity file is CSV
    if (maturityFilename.toLowerCase().endsWith('.csv')) {
      logger.info('Converting maturity CSV to Excel', { filename: maturityFilename });
      const convertResult = await convertCsvToExcel(maturityBuffer, maturityFilename);

      if (!convertResult.data) {
        logger.error('Maturity CSV conversion failed', { error: convertResult.error });
        return res.status(400).json({
          error: `Failed to convert maturity CSV: ${convertResult.error!.message}`,
          code: convertResult.error!.code,
        });
      }

      maturityBuffer = Buffer.from(convertResult.data);
      logger.info('Maturity CSV converted successfully');
    }

    // Check if CUSIP file is CSV
    if (cusipFilename.toLowerCase().endsWith('.csv')) {
      logger.info('Converting CUSIP CSV to Excel', { filename: cusipFilename });
      const convertResult = await convertCsvToExcel(cusipBuffer, cusipFilename);

      if (!convertResult.data) {
        logger.error('CUSIP CSV conversion failed', { error: convertResult.error });
        return res.status(400).json({
          error: `Failed to convert CUSIP CSV: ${convertResult.error!.message}`,
          code: convertResult.error!.code,
        });
      }

      cusipBuffer = Buffer.from(convertResult.data);
      logger.info('CUSIP CSV converted successfully');
    }

    logger.info('Bond assembly request (public)', {
      maturityFileSize: maturityBuffer.length,
      cusipFileSize: cusipBuffer.length,
      maturityWasCSV: maturityFilename.toLowerCase().endsWith('.csv'),
      cusipWasCSV: cusipFilename.toLowerCase().endsWith('.csv'),
      customNumbering: !!config,
    });

    // Call service with optional config
    const result = await assembleBonds(
      {
        maturityBuffer,
        cusipBuffer,
      },
      config
    );

    if (!result.data) {
      logger.error('Bond assembly failed', { error: result.error });
      return res.status(400).json({
        error: result.error!.message,
        code: result.error!.code,
      });
    }

    logger.info('Bond assembly successful', {
      bondCount: result.data.bonds.length,
    });

    return res.status(200).json(result.data);
  } catch (error) {
    logger.error('Bond assembly API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: 'Internal server error during bond assembly',
    });
  }
}

// PUBLIC endpoint - no auth required
export default withRequestId(handler);
