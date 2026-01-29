/**
 * Bond Draft with Files API
 *
 * ARCHITECTURE: Backend API (Layer 4)
 * - POST: Save draft WITH actual file uploads to storage
 * - Handles multipart/form-data
 * - Uploads files to Supabase Storage
 * - Saves metadata to database
 *
 * AUTH STRATEGY:
 * - Anonymous users: Return 401 with helpful message
 * - Logged-in users: Save draft with files
 * 
 * This supports freemium: Anonymous users can explore,
 * but must sign up to save progress.
 */

import { createSupabaseServerClient } from '@/lib/auth/supabaseServer';
import { withRequestId } from '@/lib/middleware/withRequestId';
import { logger } from '@/lib/logger';
import {
  saveDraftWithFiles,
  type SaveDraftInput,
} from '@/lib/services/bond-generator/draftManager';
import formidable from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: { bodyParser: false },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for session
  const supabase = createSupabaseServerClient(req, res);
  const { data: { session } } = await supabase.auth.getSession();
  
  const userId = session?.user?.id;

  // Require auth for saving files
  if (!userId) {
    logger.warn('POST /api/bond-generator/draft-with-files - unauthorized');
    return res.status(401).json({ 
      error: 'Please sign in to save your progress',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    logger.info('Save draft with files request', { userId });

    // Parse multipart form data
    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024 });
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

    // Extract draft metadata from fields
    const draftDataJson = Array.isArray(fields.draftData) ? fields.draftData[0] : fields.draftData;
    if (!draftDataJson) {
      return res.status(400).json({
        error: 'draftData field is required',
        code: 'VALIDATION_ERROR',
      });
    }

    const draftData: SaveDraftInput = JSON.parse(draftDataJson);

    // Extract files
    const templateFile = Array.isArray(files.template) ? files.template[0] : files.template;
    const maturityFile = Array.isArray(files.maturity) ? files.maturity[0] : files.maturity;
    const cusipFile = Array.isArray(files.cusip) ? files.cusip[0] : files.cusip;

    // Convert formidable files to File objects
    const fileObjects: {
      template?: File;
      maturity?: File;
      cusip?: File;
    } = {};

    if (templateFile) {
      const buffer = await import('fs/promises').then((fs) => fs.readFile(templateFile.filepath));
      fileObjects.template = new File(
        [new Uint8Array(buffer)],
        templateFile.originalFilename || 'template.docx',
        {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      );
    }

    if (maturityFile) {
      const buffer = await import('fs/promises').then((fs) => fs.readFile(maturityFile.filepath));
      const isCSV = maturityFile.originalFilename?.endsWith('.csv');
      fileObjects.maturity = new File(
        [new Uint8Array(buffer)],
        maturityFile.originalFilename || 'maturity.xlsx',
        {
          type: isCSV
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      );
    }

    if (cusipFile) {
      const buffer = await import('fs/promises').then((fs) => fs.readFile(cusipFile.filepath));
      const isCSV = cusipFile.originalFilename?.endsWith('.csv');
      fileObjects.cusip = new File(
        [new Uint8Array(buffer)],
        cusipFile.originalFilename || 'cusip.xlsx',
        {
          type: isCSV
            ? 'text/csv'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      );
    }

    logger.info('Files extracted from request', {
      userId,
      hasTemplate: !!fileObjects.template,
      hasMaturity: !!fileObjects.maturity,
      hasCusip: !!fileObjects.cusip,
    });

    // Save draft with files
    const result = await saveDraftWithFiles(userId, draftData, fileObjects);

    if (result.error) {
      return res.status(500).json({
        error: result.error.message || 'Failed to save draft',
        code: result.error.code,
      });
    }

    logger.info('Draft with files saved successfully', { userId, draftId: result.data?.id });
    return res.status(200).json({ draft: result.data });
  } catch (error) {
    logger.error('Save draft with files failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({
      error: 'Failed to save draft',
      code: 'INTERNAL_ERROR',
    });
  }
}

// No withApiAuth - we handle auth manually to provide better error messages
export default withRequestId(handler);
