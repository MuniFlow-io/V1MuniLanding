/**
 * Apply Tags API
 * Replaces all blank spaces with assigned tags
 *
 * ARCHITECTURE: Backend API (Layer 5)
 * - Receives blank-to-tag assignments
 * - Calls blank replacer service
 * - Returns fully tagged DOCX
 *
 * AUTH: App-level (withApiAuth) - User must be logged in
 */

import { withRequestId } from '@/lib/middleware/withRequestId';
import { handleServiceError } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import { replaceAllBlanksWithTags } from '@/lib/services/bond-generator/blankSpaceTagInserter';
import * as Sentry from '@sentry/nextjs';
import formidable from 'formidable';
import fs from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: false },
};

interface Assignment {
  blankId: string;
  blankText: string;
  tagName: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Apply tags request from authenticated user', {
      userId: req.user.id,
      feature: 'bond-generator',
      operation: 'apply-tags',
    });

    // Parse multipart form data
    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 });
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            logger.error('Form parsing failed', {
              error: err.message,
              feature: 'bond-generator',
            });
            reject(err);
          } else {
            resolve([fields, files]);
          }
        });
      }
    );

    // Validate inputs
    const templateFile = Array.isArray(files.template) ? files.template[0] : files.template;
    if (!templateFile) {
      logger.warn('Template file missing in request', { feature: 'bond-generator' });
      return res.status(400).json({
        error: 'Template file is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const assignmentsJson = Array.isArray(fields.assignments)
      ? fields.assignments[0]
      : fields.assignments;

    if (!assignmentsJson) {
      logger.warn('Tag assignments missing in request', { feature: 'bond-generator' });
      return res.status(400).json({
        error: 'Tag assignments are required',
        code: 'VALIDATION_ERROR',
      });
    }

    const assignments: Assignment[] = JSON.parse(assignmentsJson);

    if (assignments.length === 0) {
      logger.warn('Empty tag assignments provided', { feature: 'bond-generator' });
      return res.status(400).json({
        error: 'At least one tag assignment is required',
        code: 'VALIDATION_ERROR',
      });
    }

    // Read template file
    const buffer = await fs.readFile(templateFile.filepath);

    // Build assignments map and blanks array
    const assignmentMap = new Map<string, string>();
    const blanks = assignments.map((a, index) => ({
      id: a.blankId,
      blankText: a.blankText,
      position: index,
    }));

    for (const assignment of assignments) {
      assignmentMap.set(assignment.blankId, assignment.tagName);
    }

    logger.info('Applying tags to template', {
      feature: 'bond-generator',
      operation: 'apply-tags',
      assignmentCount: assignments.length,
      tags: assignments.map((a) => a.tagName),
      templateSize: buffer.length,
    });

    // Call service to apply tags
    const result = await replaceAllBlanksWithTags(buffer, assignmentMap, blanks);

    // Handle service errors
    if (result.error) {
      handleServiceError(result.error, res, logger, {
        feature: 'bond-generator',
        operation: 'apply-tags',
        assignmentCount: assignments.length,
      });
      return;
    }

    logger.info('Tags applied successfully', {
      feature: 'bond-generator',
      operation: 'apply-tags',
      tagCount: assignments.length,
      outputSize: result.data.length,
    });

    // Return tagged DOCX file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="tagged-template.docx"');
    return res.status(200).send(result.data);
  } catch (error) {
    logger.error('Apply tags API failed', {
      feature: 'bond-generator',
      operation: 'apply-tags',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    Sentry.captureException(error, {
      tags: {
        feature: 'bond-generator',
        operation: 'apply-tags',
      },
    });

    return res.status(500).json({
      error: 'Failed to apply tags to template',
      code: 'INTERNAL_ERROR',
    });
  }
}

// PUBLIC endpoint - no auth required
export default withRequestId(handler);
