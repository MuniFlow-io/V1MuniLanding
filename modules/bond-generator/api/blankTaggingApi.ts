/**
 * Blank Tagging Frontend API
 *
 * ARCHITECTURE: Frontend API (Layer 4)
 * - HTTP requests ONLY
 * - NO business logic
 *
 * AUTH: Uses getAuthHeadersForFormData() for authenticated requests
 */

import { getAuthHeadersForFormData } from '@/lib/auth/getAuthHeaders';

/**
 * Apply all tag assignments to template
 * Returns tagged DOCX file as a File object
 */
export async function applyTagsToTemplate(
  templateFile: File,
  assignments: Array<{ blankId: string; blankText: string; tagName: string }>
): Promise<File> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('template', templateFile);
  formData.append('assignments', JSON.stringify(assignments));

  const response = await fetch('/api/bond-generator/template/apply-tags', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to apply tags' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  // Get the blob and convert to File
  const blob = await response.blob();
  const taggedFile = new File([blob], templateFile.name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return taggedFile;
}
