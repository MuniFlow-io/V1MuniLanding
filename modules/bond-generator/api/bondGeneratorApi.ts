/**
 * Bond Generator Frontend API
 *
 * ARCHITECTURE: Frontend API Layer (Layer 4)
 * - ONLY makes HTTP requests
 * - NO business logic
 * - NO error handling (throws errors for hook to handle)
 * - Returns JSON response or blob
 *
 * AUTH: Uses getAuthHeadersForFormData() for authenticated requests with file uploads
 */

import { getAuthHeadersForFormData } from '@/lib/auth/getAuthHeaders';
import type { AssembledBond, TagMap } from '../types';
import type { BondInfo } from '../components/BondInfoFormSection';
import type { CusipSchedulePreview } from '../types/cusipPreview';
import type { MaturitySchedulePreview } from '../types/maturityPreview';

/**
 * Upload DOCX template and get HTML preview with detected blanks
 *
 * @param templateFile - DOCX template file
 * @returns HTML preview + detected blank spaces
 * @throws Error if request fails
 */
export async function getTemplatePreviewApi(templateFile: File): Promise<{
  html: string;
  blanks: Array<{
    id: string;
    position: number;
    blankText: string;
    beforeContext: string;
    suggestedTag: string | null;
  }>;
  totalBlanks: number;
  autoMatchedCount: number;
  filename: string;
  size: number;
}> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('template', templateFile);

  const response = await fetch('/api/bond-generator/template/preview', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Preview generation failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Upload and validate DOCX template
 *
 * @param templateFile - DOCX template file
 * @returns Tag map with template metadata
 * @throws Error if request fails
 */
export async function uploadTemplateApi(templateFile: File): Promise<TagMap> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('template', templateFile);

  const response = await fetch('/api/bond-generator/upload-template', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Template upload failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Parse maturity schedule Excel file
 *
 * @param maturityFile - Maturity schedule Excel file
 * @returns Parsed maturity schedule with status for each row
 * @throws Error if request fails
 */
export async function parseMaturityApi(maturityFile: File): Promise<MaturitySchedulePreview> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('maturityFile', maturityFile);

  const response = await fetch('/api/bond-generator/parse-maturity', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Failed to parse maturity file' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Parse CUSIP Excel file
 *
 * @param cusipFile - CUSIP Excel file
 * @returns Parsed CUSIP schedule with status for each row
 * @throws Error if request fails
 */
export async function parseCusipApi(cusipFile: File): Promise<CusipSchedulePreview> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('cusipFile', cusipFile);

  const response = await fetch('/api/bond-generator/parse-cusip', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse CUSIP file' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Assemble bonds from maturity and CUSIP Excel files
 *
 * @param maturityFile - Maturity schedule Excel file
 * @param cusipFile - CUSIP Excel file
 * @returns Array of assembled bonds
 * @throws Error if request fails
 */
export async function assembleBondsApi(
  maturityFile: File,
  cusipFile: File,
  bondNumbering?: { startingNumber?: number; customPrefix?: string }
): Promise<AssembledBond[]> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('maturityFile', maturityFile);
  formData.append('cusipFile', cusipFile);

  // Add bond numbering config if provided
  if (bondNumbering?.startingNumber) {
    formData.append('startingNumber', bondNumbering.startingNumber.toString());
  }
  if (bondNumbering?.customPrefix) {
    formData.append('customPrefix', bondNumbering.customPrefix);
  }

  const response = await fetch('/api/bond-generator/assemble', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to assemble bonds' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.bonds;
}

/**
 * Generate bond certificates from all inputs
 * Returns ZIP file as blob for download
 *
 * @param templateFile - DOCX template file
 * @param maturityFile - Maturity schedule Excel file
 * @param cusipFile - CUSIP Excel file
 * @param bondInfo - Bond information (issuer, title, interest dates)
 * @throws Error if request fails
 */
export async function generateBondsApi(
  templateFile: File,
  maturityFile: File,
  cusipFile: File,
  bondInfo: BondInfo
): Promise<void> {
  const headers = await getAuthHeadersForFormData();
  const formData = new FormData();
  formData.append('template', templateFile);
  formData.append('maturityFile', maturityFile);
  formData.append('cusipFile', cusipFile);

  // Serialize bondInfo with explicit date conversion to ISO strings
  // Backend expects { firstDate: string, secondDate: string }
  const serializedBondInfo = {
    issuerName: bondInfo.issuerName,
    bondTitle: bondInfo.bondTitle,
    interestDates: {
      firstDate: bondInfo.interestDates.firstDate?.toISOString() ?? '',
      secondDate: bondInfo.interestDates.secondDate?.toISOString() ?? '',
    },
  };

  formData.append('bondInfo', JSON.stringify(serializedBondInfo));

  // Add bond numbering config if provided
  if (bondInfo.bondNumbering?.startingNumber) {
    formData.append('startingNumber', bondInfo.bondNumbering.startingNumber.toString());
  }
  if (bondInfo.bondNumbering?.customPrefix) {
    formData.append('customPrefix', bondInfo.bondNumbering.customPrefix);
  }

  const response = await fetch('/api/bond-generator/generate', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Generation failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  // Download ZIP file
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bonds.zip';
  link.click();
  URL.revokeObjectURL(url);
}
