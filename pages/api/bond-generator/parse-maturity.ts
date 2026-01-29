/**
 * Parse Maturity Schedule API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - Parses maturity Excel file
 * - Returns parsed schedule with all rows (valid + errors)
 * - For preview UI
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { parseMaturityExcel } from '@/lib/services/bond-generator/parsing/maturity/maturityParser';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse} from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info('Parsing maturity schedule (public)');

  try {
    // Parse form data
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [, files] = await form.parse(req);

    const maturityFile = files.maturityFile?.[0];

    if (!maturityFile) {
      return res.status(400).json({ error: 'Maturity file is required' });
    }

    // Read file buffer
    const buffer = await fs.readFile(maturityFile.filepath);

    // Parse maturity schedule
    const result = await parseMaturityExcel(buffer);

    if (!result.data) {
      logger.error('Maturity parsing failed', { error: result.error });
      return res.status(400).json({
        error: result.error?.message || 'Failed to parse maturity schedule',
        details: result.error?.details,
      });
    }

    logger.info('Maturity schedule parsed', {
      validRows: result.data.summary.valid,
      errorRows: result.data.summary.errors,
      totalRows: result.data.summary.total,
    });

    return res.status(200).json(result.data);
  } catch (error) {
    logger.error('Parse maturity API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUBLIC endpoint - no auth required
export default withRequestId(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
