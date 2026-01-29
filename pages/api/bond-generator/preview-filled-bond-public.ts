/**
 * Preview Filled Bond API (Public)
 * 
 * ARCHITECTURE: Backend API (Layer 4)
 * - Fills ONE bond template with data
 * - Returns HTML preview for user review
 * - NO file storage - just in-memory processing
 * - NO AUTH REQUIRED - Public preview for freemium model
 * 
 * NOTE: This is a PUBLIC endpoint for previewing bonds before signup.
 * Rate limited to prevent abuse.
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { fillDocxTemplate } from '@/lib/services/bond-generator/docxFiller';
import { convertDocxToHtml } from '@/lib/services/bond-generator/docxToHtml';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';

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
    logger.info('Public bond preview request');

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

    let bondData;
    try {
      bondData = JSON.parse(bondDataJson);
    } catch (parseError) {
      logger.error('Failed to parse bond data JSON', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        bondDataJson: bondDataJson?.substring(0, 200), // Log first 200 chars
      });
      return res.status(400).json({ error: 'Invalid bond data format' });
    }

    // Read template buffer
    const templateBuffer = await fs.readFile(templateFile.filepath);

    logger.info('Filling bond template for public preview', {
      bondNumber: bondData.bond_number,
      cusip: bondData.cusip_no,
      hasPrincipalAmount: !!bondData.principal_amount,
      hasPrincipalWords: !!bondData.principal_words,
      hasMaturityDate: !!bondData.maturity_date,
      hasDatedDate: !!bondData.dated_date,
      hasCouponRate: !!bondData.coupon_rate,
    });

    // Fill template with bond data
    const fillResult = await fillDocxTemplate(templateBuffer, bondData);

    if (fillResult.error || !fillResult.data) {
      logger.error('Template fill failed', { 
        error: fillResult.error,
        bondData: JSON.stringify(bondData, null, 2), // Log full bond data for debugging
      });
      return res.status(500).json({ 
        error: fillResult.error?.message || 'Failed to fill template',
        code: fillResult.error?.code,
      });
    }

    // Convert filled DOCX to HTML for preview
    const htmlResult = await convertDocxToHtml(fillResult.data);

    if (htmlResult.error || !htmlResult.data) {
      logger.error('HTML conversion failed', { error: htmlResult.error });
      return res.status(500).json({ 
        error: htmlResult.error?.message || 'Failed to convert to HTML' 
      });
    }

    logger.info('Public bond preview generated', {
      bondNumber: bondData.bond_number,
      htmlLength: htmlResult.data.html.length,
    });

    return res.status(200).json({
      html: htmlResult.data.html,
      bondNumber: bondData.bond_number,
    });
  } catch (error) {
    logger.error('Public bond preview failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to generate preview',
    });
  }
}

export default withRequestId(handler);
