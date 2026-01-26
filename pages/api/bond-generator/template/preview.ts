/**
 * Preview Bond Template API
 * Upload DOCX → Convert to HTML → Return for manual tagging
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - Accepts DOCX upload
 * - Converts to HTML with enhanced formatting
 * - Returns HTML for full-screen preview
 * - NO auto-detection - user manually selects text
 *
 * AUTH: App-level (withApiAuth) - User must be logged in
 */

import { withApiAuth, type AuthenticatedRequest } from '@/lib/auth/withApiAuth';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import { convertDocxToHtml } from '@/lib/services/bond-generator/docxToHtml';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiResponse } from 'next';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PreviewResponse {
  html: string;
  filename: string;
  size: number;
}

interface ErrorResponse {
  error: string;
  code?: string;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<PreviewResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Template preview request from authenticated user', {
      userId: req.user.id,
    });

    // Parse multipart form data
    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
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

    // Extract template file
    const templateFile = Array.isArray(files.template) ? files.template[0] : files.template;

    if (!templateFile) {
      return res.status(400).json({
        error: 'Template file required',
        code: 'MISSING_FILE',
      });
    }

    // Validate DOCX
    if (!templateFile.originalFilename?.toLowerCase().endsWith('.docx')) {
      return res.status(400).json({
        error: 'Only DOCX files allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }

    // Read file buffer
    const templateBuffer = await fs.readFile(templateFile.filepath);

    logger.info('Converting template to HTML', {
      filename: templateFile.originalFilename,
      size: templateBuffer.length,
    });

    // Convert DOCX to HTML (with enhanced formatting)
    const htmlResult = await convertDocxToHtml(templateBuffer);

    if (!htmlResult.data) {
      logger.error('HTML conversion failed', { error: htmlResult.error });
      return res.status(400).json({
        error: htmlResult.error!.message,
        code: htmlResult.error!.code,
      });
    }

    logger.info('Template preview generated successfully', {
      filename: templateFile.originalFilename,
      htmlLength: htmlResult.data.html.length,
    });

    // Return HTML for full-screen preview
    // User will manually select text to tag
    return res.status(200).json({
      html: htmlResult.data.html,
      filename: templateFile.originalFilename || 'template.docx',
      size: templateBuffer.length,
    });
  } catch (error) {
    logger.error('Template preview failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: 'Preview generation failed',
      code: 'INTERNAL_ERROR',
    });
  }
}

export default withRequestId(withApiAuth(handler));
