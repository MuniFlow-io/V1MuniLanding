/**
 * Parse CUSIP Schedule API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - Parses CUSIP Excel file
 * - Returns parsed schedule with all rows (valid + errors)
 * - For preview UI
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { parseCusipExcel } from '@/lib/services/bond-generator/parsing/cusip/cusipParser';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info('Parsing CUSIP schedule', { userId: req.user.id });

  try {
    // Parse form data
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [, files] = await form.parse(req);

    const cusipFile = files.cusipFile?.[0];

    if (!cusipFile) {
      return res.status(400).json({ error: 'CUSIP file is required' });
    }

    // Read file buffer
    const buffer = await fs.readFile(cusipFile.filepath);

    // Parse CUSIP schedule
    const result = await parseCusipExcel(buffer);

    if (!result.data) {
      logger.error('CUSIP parsing failed', { error: result.error });
      return res.status(400).json({
        error: result.error?.message || 'Failed to parse CUSIP schedule',
        details: result.error?.details,
      });
    }

    logger.info('CUSIP schedule parsed', {
      validRows: result.data.summary.valid,
      errorRows: result.data.summary.errors,
      totalRows: result.data.summary.total,
    });

    return res.status(200).json(result.data);
  } catch (error) {
    logger.error('Parse CUSIP API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withRequestId(withApiAuth(handler));

export const config = {
  api: {
    bodyParser: false,
  },
};
