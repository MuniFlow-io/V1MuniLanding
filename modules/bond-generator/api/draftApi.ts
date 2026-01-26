/**
 * Bond Draft Frontend API
 *
 * ARCHITECTURE: Frontend API (Layer 3)
 * - Wraps backend API calls
 * - Uses getAuthHeaders() for authentication
 * - Pure HTTP communication
 * - Returns typed data
 */

import { getAuthHeaders } from '@/lib/auth/getAuthHeaders';
import type { BondDraft, BondGeneratorStep, TagMap } from '../types';

/**
 * Draft data for saving
 */
export interface SaveDraftData {
  current_step: BondGeneratorStep;
  template_file?: {
    filename: string;
    size: number;
    lastModified: number;
  } | null;
  maturity_file?: {
    filename: string;
    size: number;
    lastModified: number;
  } | null;
  cusip_file?: {
    filename: string;
    size: number;
    lastModified: number;
  } | null;
  tag_map?: TagMap | null;
  is_finalized?: boolean;
  legal_accepted?: boolean;
  draft_id?: string; // Optional: ID of draft being updated (for resume)
}

/**
 * Get user's latest bond draft
 * Returns null if no draft exists
 */
export async function getLatestDraftApi(): Promise<BondDraft | null> {
  const headers = await getAuthHeaders();

  const response = await fetch('/api/bond-generator/draft', {
    method: 'GET',
    headers,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch draft' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.draft;
}

/**
 * Save or update bond draft (metadata only)
 * Creates new draft or updates existing one
 */
export async function saveDraftApi(draftData: SaveDraftData): Promise<BondDraft> {
  const headers = await getAuthHeaders();

  const response = await fetch('/api/bond-generator/draft', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(draftData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to save draft' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.draft;
}

/**
 * Save draft WITH actual file uploads
 * Uploads files to Supabase Storage and saves metadata
 */
export async function saveDraftWithFilesApi(
  draftData: SaveDraftData,
  files: {
    template?: File;
    maturity?: File;
    cusip?: File;
  }
): Promise<BondDraft> {
  const { getAuthHeadersForFormData } = await import('@/lib/auth/getAuthHeaders');
  const headers = await getAuthHeadersForFormData();

  const formData = new FormData();
  formData.append('draftData', JSON.stringify(draftData));

  if (files.template) {
    formData.append('template', files.template);
  }
  if (files.maturity) {
    formData.append('maturity', files.maturity);
  }
  if (files.cusip) {
    formData.append('cusip', files.cusip);
  }

  const response = await fetch('/api/bond-generator/draft-with-files', {
    method: 'POST',
    headers,
    credentials: 'same-origin',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to save draft' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.draft;
}

/**
 * Get all bond drafts for current user
 * Returns array of drafts sorted by most recent
 */
export async function getAllDraftsApi(): Promise<BondDraft[]> {
  const headers = await getAuthHeaders();

  const response = await fetch('/api/bond-generator/drafts', {
    method: 'GET',
    headers,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch drafts' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.drafts || [];
}

/**
 * Delete bond draft
 * Removes draft from database
 */
export async function deleteDraftApi(draftId: string): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`/api/bond-generator/draft?draftId=${draftId}`, {
    method: 'DELETE',
    headers,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete draft' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
}

/**
 * Download a specific file from a draft
 * Returns File object reconstructed from blob
 */
async function downloadDraftFile(
  draftId: string,
  fileType: 'template' | 'maturity' | 'cusip'
): Promise<File | null> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `/api/bond-generator/draft-files?draftId=${draftId}&fileType=${fileType}`,
    {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    }
  );

  if (!response.ok) {
    // 404 means file doesn't exist - that's OK
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to download ${fileType}: HTTP ${response.status}`);
  }

  // Get filename from Content-Disposition header
  const contentDisposition = response.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] || `${fileType}.unknown`;

  // Convert blob to File
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

/**
 * Restore all files from a draft
 * Downloads files from Supabase Storage
 */
export async function restoreDraftFilesApi(draftId: string): Promise<{
  template?: File;
  maturity?: File;
  cusip?: File;
}> {
  // Download all files in parallel
  const [template, maturity, cusip] = await Promise.all([
    downloadDraftFile(draftId, 'template'),
    downloadDraftFile(draftId, 'maturity'),
    downloadDraftFile(draftId, 'cusip'),
  ]);

  return {
    template: template || undefined,
    maturity: maturity || undefined,
    cusip: cusip || undefined,
  };
}
