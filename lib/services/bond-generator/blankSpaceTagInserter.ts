/**
 * Tag Inserter Service
 * Replaces selected text with {{TAGS}}
 *
 * User can select ANY text (not just blanks):
 * - Underscores: _____
 * - Placeholder text: [AMOUNT]
 * - Labels: Principal Amount:
 * - Example values: $1,000,000
 *
 * We replace the exact text they selected.
 */

import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import AdmZip from 'adm-zip';

/**
 * Replace all selected text with tags
 *
 * Strategy: Replace user-selected text with {{TAG}} markers in the DOCX XML
 * Handles ANY text (not just blanks)
 */
export async function replaceAllBlanksWithTags(
  docxBuffer: Buffer,
  assignments: Map<string, string>, // blankId -> tagName
  blanks: Array<{ id: string; blankText: string; position: number }>
): Promise<ServiceResult<Buffer>> {
  logger.info('Replacing selected text with tags', { count: assignments.size });

  try {
    const zip = new AdmZip(docxBuffer);
    let xml = zip.readAsText('word/document.xml');

    if (!xml) {
      return failure('INVALID_DOCX', 'Missing document.xml');
    }

    // Sort blanks by position (process from start to end)
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

    logger.info('Processing text selections in order', {
      selections: sortedBlanks.map((b) => ({
        id: b.id,
        text: b.blankText.substring(0, 30),
        tag: assignments.get(b.id),
      })),
    });

    // Track occurrences of each unique text pattern
    const textOccurrenceCount = new Map<string, number>();

    // Process each text selection in order
    for (const blank of sortedBlanks) {
      const tagName = assignments.get(blank.id);
      if (!tagName) {
        logger.warn('Skipping selection with no tag assignment', { blankId: blank.id });
        continue;
      }

      let blankText = blank.blankText.trim();
      if (!blankText) {
        logger.warn('Skipping selection with empty text', { blankId: blank.id });
        continue;
      }

      // NORMALIZE text - remove special characters that differ between HTML and XML
      // Replace non-breaking spaces, normalize whitespace
      blankText = blankText
        .replace(/\u00A0/g, ' ') // Non-breaking space → regular space
        .replace(/\s+/g, ' ') // Multiple spaces → single space
        .trim();

      // Track which occurrence of this text pattern we're on
      const occurrenceIndex = textOccurrenceCount.get(blankText) || 0;
      textOccurrenceCount.set(blankText, occurrenceIndex + 1);

      // Escape special regex characters
      const escapedBlank = blankText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Create flexible regex that handles whitespace variations
      const flexiblePattern = escapedBlank.replace(/\s+/g, '\\s+');
      const regex = new RegExp(flexiblePattern, 'g');
      let currentOccurrence = 0;
      let replaced = false;

      xml = xml.replace(regex, (match: string) => {
        if (currentOccurrence === occurrenceIndex) {
          replaced = true;
          currentOccurrence++;
          const replacement = `{{${tagName}}}`;
          logger.info('Replacing text with tag', {
            text: match.substring(0, 30),
            tag: tagName,
            occurrence: occurrenceIndex,
          });
          return replacement;
        }
        currentOccurrence++;
        return match;
      });

      if (!replaced) {
        // Text not found - might already be tagged or invalid selection
        // This is OK - just skip it (user might have re-selected tagged text)
        logger.warn('Skipping blank - text not found in document', {
          blankId: blank.id,
          blankText: blankText.substring(0, 50),
          tagName,
          occurrenceIndex,
          hint: 'Text may already be tagged or selection was invalid',
        });
      }
    }

    // Update DOCX with modified XML
    zip.updateFile('word/document.xml', Buffer.from(xml, 'utf-8'));

    logger.info('All text selections replaced with tags successfully', {
      totalSelections: sortedBlanks.length,
      assignedCount: assignments.size,
    });

    return success(zip.toBuffer());
  } catch (error) {
    logger.error('Blank replacement failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return failure('REPLACEMENT_ERROR', 'Failed to replace blanks with tags');
  }
}
