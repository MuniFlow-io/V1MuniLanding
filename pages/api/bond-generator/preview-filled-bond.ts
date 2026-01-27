/**
 * Preview Filled Bond API
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Fills ONE bond template with data
 * - Returns HTML preview for user review
 * - NO file storage - just in-memory processing
 * 
 * AUTH: App-level (withApiAuth)
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { fillDocxTemplate } from '@/lib/services/bond-generator/docxFiller';
import { convertDocxToHtml } from '@/lib/services/bond-generator/docxToHtml';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Bond preview request', { userId: req.user.id });

    // Parse form data
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      }
    );

    // Extract template file
    const templateFile = Array.isArray(files.template) ? files.template[0] : files.template;
    if (!templateFile) {
      return res.status(400).json({ error: 'Template file required' });
    }

    // Extract bond data
    const bondDataJson = Array.isArray(fields.bondData) ? fields.bondData[0] : fields.bondData;
    if (!bondDataJson) {
      return res.status(400).json({ error: 'Bond data required' });
    }

    const bondData = JSON.parse(bondDataJson);

    // Read template buffer
    const templateBuffer = await fs.readFile(templateFile.filepath);

    logger.info('Filling bond template for preview', {
      bondNumber: bondData.bond_number,
      cusip: bondData.cusip_no,
    });

    // Fill template with bond data
    const fillResult = await fillDocxTemplate(templateBuffer, bondData);

    if (!fillResult.success || !fillResult.data) {
      logger.error('Template fill failed', { error: fillResult.error });
      return res.status(500).json({ 
        error: fillResult.error?.message || 'Failed to fill template' 
      });
    }

    // Convert filled DOCX to HTML for preview
    const htmlResult = await convertDocxToHtml(fillResult.data);

    if (!htmlResult.success || !htmlResult.data) {
      logger.error('HTML conversion failed', { error: htmlResult.error });
      return res.status(500).json({ 
        error: htmlResult.error?.message || 'Failed to convert to HTML' 
      });
    }

    logger.info('Bond preview generated', {
      bondNumber: bondData.bond_number,
      htmlLength: htmlResult.data.html.length,
    });

    return res.status(200).json({
      html: htmlResult.data.html,
      bondNumber: bondData.bond_number,
    });
  } catch (error) {
    logger.error('Bond preview failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to generate preview',
    });
  }
}

export default withRequestId(withApiAuth(handler));
