/**
 * DOCX Parser Service
 * Pure function - extracts and validates tags from DOCX templates
 *
 * ARCHITECTURE: Backend Service (Layer 6)
 * - NO HTTP requests
 * - NO user interaction
 * - Pure business logic
 * - Returns ServiceResult<TagMap>
 *
 * DETERMINISM: Same DOCX → same tag map
 */

import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Required tags that MUST appear exactly once in template
 * Per spec Section 5.2
 */
const REQUIRED_TAGS = [
  'BOND_NUMBER',
  'DATED_DATE',
  'INTEREST_RATE',
  'MATURITY_DATE',
  'CUSIP_NO',
  'PRINCIPAL_AMOUNT_NUM',
  'PRINCIPAL_AMOUNT_WORDS',
] as const;

/**
 * Optional tags that may appear (never block generation)
 * Per spec Section 5.2
 */
const OPTIONAL_TAGS = ['SERIES', 'ISSUER_NAME', 'PROJECT_NAME'] as const;

type RequiredTag = (typeof REQUIRED_TAGS)[number];
type OptionalTag = (typeof OPTIONAL_TAGS)[number];
type BondTag = RequiredTag | OptionalTag;

export interface TagPosition {
  tag: BondTag;
  paragraphIndex: number;
  textOffset: number;
}

export interface TagMap {
  templateId: string; // Short hash for display
  tags: TagPosition[];
  templateHash: string; // Full hash for determinism
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate that tag name is in whitelist
 */
function isValidTag(tagName: string): tagName is BondTag {
  const allValidTags = [...REQUIRED_TAGS, ...OPTIONAL_TAGS];
  return allValidTags.includes(tagName as BondTag);
}

/**
 * Validate all required tags are present
 * Hard stop if any missing - per spec Section 5.3
 */
function validateRequiredTags(foundTags: TagPosition[]): ServiceResult<boolean> {
  const foundTagNames = new Set(foundTags.map((t) => t.tag));

  const missingTags = REQUIRED_TAGS.filter((tag) => !foundTagNames.has(tag));

  if (missingTags.length > 0) {
    const tagList = missingTags.map((t) => `{{${t}}}`).join(', ');
    logger.error('Missing required tags', { missingTags });

    return failure('MISSING_REQUIRED_TAGS', `Missing required tags: ${tagList}`, {
      missingTags,
      foundTags: Array.from(foundTagNames),
    });
  }

  return success(true);
}

/**
 * Validate required tags appear exactly once
 * Hard stop if duplicates - per spec Section 5.3
 */
function validateNoDuplicateRequiredTags(foundTags: TagPosition[]): ServiceResult<boolean> {
  const tagCounts = new Map<string, number>();

  for (const tag of foundTags) {
    tagCounts.set(tag.tag, (tagCounts.get(tag.tag) || 0) + 1);
  }

  const duplicates = REQUIRED_TAGS.filter((tag) => (tagCounts.get(tag) || 0) > 1);

  if (duplicates.length > 0) {
    const tagList = duplicates.map((t) => `{{${t}}} (${tagCounts.get(t)} times)`).join(', ');
    logger.error('Duplicate required tags found', { duplicates });

    return failure('DUPLICATE_REQUIRED_TAGS', `Required tags appear more than once: ${tagList}`, {
      duplicates,
    });
  }

  return success(true);
}

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract document.xml from DOCX (which is a ZIP file)
 */
function extractDocumentXml(docxBuffer: Buffer): ServiceResult<string> {
  try {
    const zip = new AdmZip(docxBuffer);
    const documentXml = zip.readAsText('word/document.xml');

    if (!documentXml) {
      logger.error('No document.xml found in DOCX');
      return failure('INVALID_DOCX', 'Invalid DOCX file: missing document.xml');
    }

    return success(documentXml);
  } catch (error) {
    logger.error('Failed to extract document.xml', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return failure('INVALID_DOCX', 'Failed to read DOCX file');
  }
}

/**
 * Find all {{TAG}} patterns in XML
 * Pattern: {{TAG_NAME}} where TAG_NAME is uppercase letters and underscores
 */
function extractTagsFromXml(documentXml: string): ServiceResult<TagPosition[]> {
  const tagRegex = /\{\{([A-Z_]+)\}\}/g;
  const foundTags: TagPosition[] = [];
  const invalidTags: string[] = [];

  let match;
  while ((match = tagRegex.exec(documentXml)) !== null) {
    const tagName = match[1];

    // Validate tag name is in whitelist
    if (!isValidTag(tagName)) {
      invalidTags.push(tagName);
      continue;
    }

    foundTags.push({
      tag: tagName,
      paragraphIndex: 0, // Simplified for MVP - could enhance to track actual paragraph
      textOffset: match.index,
    });
  }

  // Hard stop if invalid tags found - per spec Section 5.3
  if (invalidTags.length > 0) {
    const tagList = invalidTags.map((t) => `{{${t}}}`).join(', ');
    logger.error('Invalid tags found', { invalidTags });

    return failure('INVALID_TAG', `Unknown tags found: ${tagList}`, {
      invalidTags,
      validTags: [...REQUIRED_TAGS, ...OPTIONAL_TAGS],
    });
  }

  logger.debug('Tags extracted from XML', {
    totalTags: foundTags.length,
  });

  return success(foundTags);
}

/**
 * Generate deterministic hash of template
 * Used for template ID and ensuring same inputs → same outputs
 */
function generateTemplateHash(docxBuffer: Buffer): string {
  return createHash('sha256').update(docxBuffer).digest('hex');
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Extract and validate tags from DOCX template
 *
 * Per spec Section 5:
 * - Searches for {{TAG_NAME}} patterns
 * - Validates all required tags present
 * - Validates no duplicate required tags
 * - Returns tag map with template hash
 *
 * @param docxBuffer - DOCX file buffer
 * @returns ServiceResult<TagMap> - Tag map or error
 *
 * Hard stops (per spec Section 5.3):
 * - Missing required tag
 * - Duplicate required tag
 * - Invalid tag name
 * - Invalid DOCX file
 */
export async function extractTagsFromDocx(docxBuffer: Buffer): Promise<ServiceResult<TagMap>> {
  logger.info('Extracting tags from DOCX template');

  try {
    // Step 1: Extract document.xml from DOCX
    const xmlResult = extractDocumentXml(docxBuffer);
    if (!xmlResult.data) {
      return failure(xmlResult.error!.code, xmlResult.error!.message, xmlResult.error!.details);
    }

    const documentXml = xmlResult.data;

    // Step 2: Find all {{TAG}} patterns
    const tagsResult = extractTagsFromXml(documentXml);
    if (!tagsResult.data) {
      return failure(tagsResult.error!.code, tagsResult.error!.message, tagsResult.error!.details);
    }

    const foundTags = tagsResult.data;

    // Step 3: Validate all required tags present
    const requiredResult = validateRequiredTags(foundTags);
    if (!requiredResult.data) {
      return failure(
        requiredResult.error!.code,
        requiredResult.error!.message,
        requiredResult.error!.details
      );
    }

    // Step 4: Validate no duplicate required tags
    const duplicateResult = validateNoDuplicateRequiredTags(foundTags);
    if (!duplicateResult.data) {
      return failure(
        duplicateResult.error!.code,
        duplicateResult.error!.message,
        duplicateResult.error!.details
      );
    }

    // Step 5: Generate deterministic hash
    const templateHash = generateTemplateHash(docxBuffer);
    const templateId = templateHash.slice(0, 16); // Short hash for display

    const tagMap: TagMap = {
      templateId,
      tags: foundTags,
      templateHash,
    };

    logger.info('Tags extracted successfully', {
      templateId,
      totalTags: foundTags.length,
      requiredTags: foundTags.filter((t) => REQUIRED_TAGS.includes(t.tag as RequiredTag)).length,
      optionalTags: foundTags.filter((t) => OPTIONAL_TAGS.includes(t.tag as OptionalTag)).length,
    });

    return success(tagMap);
  } catch (error) {
    logger.error('Tag extraction failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('EXTRACTION_ERROR', 'Failed to extract tags from template', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Validate that a tag map is complete and valid
 * Used before generation to ensure template is ready
 */
export function validateTagMap(tagMap: TagMap): ServiceResult<boolean> {
  const tagNames = tagMap.tags.map((t) => t.tag);

  const missingTags = REQUIRED_TAGS.filter((tag) => !tagNames.includes(tag));

  if (missingTags.length > 0) {
    const tagList = missingTags.map((t) => `{{${t}}}`).join(', ');

    return failure('VALIDATION_ERROR', `Missing required tags: ${tagList}`, {
      missingTags,
    });
  }

  return success(true);
}
