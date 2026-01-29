/**
 * Upload Bond Template API
 *
 * ARCHITECTURE: Backend API (Layer 5)
 * - Handles file upload (multipart/form-data)
 * - Validates DOCX format
 * - Extracts and validates tags
 * - Returns template metadata
 *
 * AUTH: App-level (withApiAuth) - User must be logged in
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { extractTagsFromDocx } from '@/lib/services/bond-generator/docxParser';
import { logger } from '@/lib/logger';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';

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

interface UploadTemplateResponse {
  templateId: string;
  templateHash: string;
  tags: Array<{ tag: string; position: number }>;
  filename: string;
  size: number;
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
 * Validate file is DOCX format
 */
function validateFileType(filename: string | null): boolean {
  if (!filename) return false;
  return filename.toLowerCase().endsWith('.docx');
}

/**
 * Validate file size (max 10MB for templates)
 */
function validateFileSize(size: number): boolean {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  return size > 0 && size <= MAX_SIZE;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadTemplateResponse | ErrorResponse>
) {
  // Only accept POST
  if (req.method !== 'POST') {
    logger.warn('Invalid method for upload-template', {
      method: req.method,
      userId: req.user.id,
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info('Template upload request from authenticated user', {
    userId: req.user.id,
  });

  try {
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
      logger.warn('No template file provided');
      return res.status(400).json({
        error: 'Template file required',
        code: 'MISSING_FILE',
      });
    }

    // Validate file type
    if (!validateFileType(templateFile.originalFilename)) {
      logger.warn('Invalid file type', { filename: templateFile.originalFilename });
      return res.status(400).json({
        error: 'Only DOCX files are allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }

    // Validate file size
    if (!validateFileSize(templateFile.size)) {
      logger.warn('Invalid file size', { size: templateFile.size });
      return res.status(400).json({
        error: 'File size must be between 1 byte and 10MB',
        code: 'INVALID_FILE_SIZE',
      });
    }

    // Read file buffer
    const templateBuffer = await fs.readFile(templateFile.filepath);

    logger.debug('Template file read', {
      filename: templateFile.originalFilename,
      size: templateBuffer.length,
    });

    // Extract and validate tags
    const tagResult = await extractTagsFromDocx(templateBuffer);

    if (!tagResult.data) {
      logger.error('Template validation failed', {
        error: tagResult.error,
        filename: templateFile.originalFilename,
      });

      return res.status(400).json({
        error: tagResult.error!.message,
        code: tagResult.error!.code,
        details: tagResult.error!.details,
      });
    }

    const tagMap = tagResult.data;

    logger.info('Template uploaded and validated successfully', {
      templateId: tagMap.templateId,
      tagCount: tagMap.tags.length,
      filename: templateFile.originalFilename,
      size: templateBuffer.length,
    });

    // Return template metadata
    // Note: In production, you'd store the buffer in Redis, S3, or session
    // For MVP, frontend will re-upload for generation
    return res.status(200).json({
      templateId: tagMap.templateId,
      templateHash: tagMap.templateHash,
      tags: tagMap.tags.map((t) => ({
        tag: t.tag,
        position: t.textOffset,
      })),
      filename: templateFile.originalFilename || 'template.docx',
      size: templateBuffer.length,
    });
  } catch (error) {
    logger.error('Template upload failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: 'Upload failed',
      code: 'INTERNAL_ERROR',
    });
  }
}

// PUBLIC endpoint - no auth required
export default withRequestId(handler);
