/**
 * CSV to Excel Converter
 *
 * ARCHITECTURE: Backend Service (Layer 5)
 * - Converts CSV files to Excel format
 * - Allows existing Excel parsers to work unchanged
 * - Pure function - no side effects
 *
 * FOUNDER'S REQUIREMENT: Section 1
 * - "Input can be uploaded via Excel / CSV"
 */

import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import * as XLSX from 'xlsx';

/**
 * Convert CSV buffer to Excel buffer
 *
 * @param csvBuffer - CSV file as Buffer
 * @param filename - Original filename (for logging)
 * @returns Excel buffer compatible with parseMaturityExcel/parseCusipExcel
 */
export async function convertCsvToExcel(
  csvBuffer: Buffer,
  filename: string
): Promise<ServiceResult<Buffer>> {
  try {
    logger.info('Converting CSV to Excel format', { filename });

    // Step 1: Parse CSV data
    const csvText = csvBuffer.toString('utf-8');

    // Detect delimiter (comma, semicolon, or tab)
    const delimiter = detectDelimiter(csvText);
    logger.info('CSV delimiter detected', { delimiter, filename });

    // Step 2: Parse CSV using xlsx library (handles CSV natively)
    const workbook = XLSX.read(csvText, {
      type: 'string',
      raw: true, // Preserve exact values (no date conversion)
      cellDates: false, // We'll handle dates ourselves
    });

    // Step 3: Get first sheet (CSV files have only one sheet)
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return failure('PARSING_ERROR', 'CSV file appears to be empty', {
        filename,
      });
    }

    // Step 4: Convert to Excel buffer
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    logger.info('CSV converted to Excel successfully', {
      filename,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      bufferSize: excelBuffer.length,
      sheetName,
    });

    return success(Buffer.from(excelBuffer as Buffer));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('CSV to Excel conversion failed', {
      filename,
      error: errorMessage,
    });

    return failure('PARSING_ERROR', `Failed to convert CSV file: ${errorMessage}`, {
      filename,
      error: errorMessage,
    });
  }
}

/**
 * Detect CSV delimiter (comma, semicolon, or tab)
 * Uses heuristic: check first 5 lines, pick most common delimiter
 */
function detectDelimiter(csvText: string): string {
  const lines = csvText.split('\n').slice(0, 5); // First 5 lines

  const delimiters = [',', ';', '\t'];
  const counts = delimiters.map((delim) => {
    const count = lines.reduce((sum, line) => sum + (line.split(delim).length - 1), 0);
    return { delimiter: delim, count };
  });

  // Pick delimiter with highest count
  const winner = counts.reduce((max, curr) => (curr.count > max.count ? curr : max));

  return winner.delimiter;
}

/**
 * Validate that CSV has required structure
 * (Called before conversion to give better error messages)
 */
export function validateCsvStructure(csvBuffer: Buffer): ServiceResult<void> {
  try {
    const csvText = csvBuffer.toString('utf-8');
    const lines = csvText.split('\n').filter((line) => line.trim().length > 0);

    // Must have at least 2 lines (header + 1 data row)
    if (lines.length < 2) {
      return failure(
        'VALIDATION_ERROR',
        'CSV file must have at least a header row and one data row'
      );
    }

    // Header must have at least 3 columns
    const delimiter = detectDelimiter(csvText);
    const headerCols = lines[0].split(delimiter).length;

    if (headerCols < 3) {
      return failure(
        'VALIDATION_ERROR',
        `CSV file must have at least 3 columns (found ${headerCols})`
      );
    }

    return success(undefined);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure('VALIDATION_ERROR', `CSV validation failed: ${errorMessage}`);
  }
}
