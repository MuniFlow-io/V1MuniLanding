/**
 * Standardized Error Handling for API Routes and Services
 *
 * This module provides production-grade error handling with:
 * - Type-safe error responses
 * - User-friendly messages (no implementation details leaked)
 * - Structured logging support
 * - Consistent error codes
 *
 * Usage in Services:
 * ```typescript
 * return { data: result, error: null };
 * return { data: null, error: createServiceError('DEAL_NOT_FOUND', 'Deal not found') };
 * ```
 *
 * Usage in API Routes:
 * ```typescript
 * const { data, error } = await someService(dealId);
 * if (error) {
 *   return handleServiceError(error, res, logger, { userId, dealId });
 * }
 * ```
 */

import { NextApiResponse } from 'next';
import { logger as appLogger } from '../logger';

// ============================================
// ERROR CODES (Extensible)
// ============================================

export type ErrorCode =
  // General errors
  | 'INTERNAL_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'

  // Database errors
  | 'DATABASE_ERROR'
  | 'CONSTRAINT_VIOLATION'
  | 'DUPLICATE_ENTRY'
  | 'STORAGE_ERROR'

  // Business logic errors
  | 'DEAL_NOT_FOUND'
  | 'DOCUMENT_NOT_FOUND'
  | 'TASK_NOT_FOUND'
  | 'MILESTONE_NOT_FOUND'
  | 'PARTICIPANT_NOT_FOUND'
  | 'INVALID_STEP'
  | 'WIZARD_NOT_COMPLETE'
  | 'DEAL_TYPE_REQUIRED'
  | 'OFFERING_TYPE_REQUIRED'

  // File/Parsing errors
  | 'UNSUPPORTED_FILE_TYPE'
  | 'PARSING_ERROR'

  // Bond Generator errors
  | 'INVALID_DOCX'
  | 'INVALID_TEMPLATE'
  | 'INVALID_TAG'
  | 'INVALID_BOND'
  | 'MISSING_REQUIRED_TAGS'
  | 'DUPLICATE_REQUIRED_TAGS'
  | 'EXTRACTION_ERROR'
  | 'CONVERSION_ERROR'
  | 'FILL_ERROR'
  | 'REPLACEMENT_ERROR'
  | 'ZIP_ERROR'
  | 'NO_BONDS'
  | 'DETECTION_ERROR';

// ============================================
// SERVICE ERROR (for service layer)
// ============================================

export interface ServiceError {
  code: ErrorCode;
  message: string; // User-friendly message
  details?: any; // Additional context for logging (never sent to user)
  statusCode?: number; // HTTP status code (optional, defaults based on code)
}

/**
 * Create a service error object
 */
export function createServiceError(code: ErrorCode, message: string, details?: any): ServiceError {
  return {
    code,
    message,
    details,
    statusCode: getDefaultStatusCode(code),
  };
}

/**
 * Get default HTTP status code for error code
 */
function getDefaultStatusCode(code: ErrorCode): number {
  switch (code) {
    case 'NOT_FOUND':
    case 'DEAL_NOT_FOUND':
    case 'DOCUMENT_NOT_FOUND':
    case 'TASK_NOT_FOUND':
    case 'MILESTONE_NOT_FOUND':
    case 'PARTICIPANT_NOT_FOUND':
    case 'NO_BONDS':
      return 404;

    case 'UNAUTHORIZED':
      return 401;

    case 'FORBIDDEN':
      return 403;

    case 'VALIDATION_ERROR':
    case 'INVALID_STEP':
    case 'DEAL_TYPE_REQUIRED':
    case 'OFFERING_TYPE_REQUIRED':
    case 'INVALID_DOCX':
    case 'INVALID_TEMPLATE':
    case 'INVALID_TAG':
    case 'INVALID_BOND':
    case 'MISSING_REQUIRED_TAGS':
    case 'DUPLICATE_REQUIRED_TAGS':
    case 'PARSING_ERROR':
    case 'UNSUPPORTED_FILE_TYPE':
      return 400;

    case 'DUPLICATE_ENTRY':
    case 'CONSTRAINT_VIOLATION':
      return 409;

    case 'DATABASE_ERROR':
    case 'INTERNAL_ERROR':
    case 'EXTRACTION_ERROR':
    case 'CONVERSION_ERROR':
    case 'FILL_ERROR':
    case 'REPLACEMENT_ERROR':
    case 'ZIP_ERROR':
    case 'DETECTION_ERROR':
    default:
      return 500;
  }
}

// ============================================
// SERVICE RESULT (for service return values)
// ============================================

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: ServiceError };

/**
 * Create a successful service result
 */
export function success<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

/**
 * Create a failed service result
 */
export function failure<T = never>(
  code: ErrorCode,
  message: string,
  details?: any
): ServiceResult<T> {
  return {
    data: null,
    error: createServiceError(code, message, details),
  };
}

// ============================================
// API ROUTE ERROR HANDLING
// ============================================

/**
 * Handle a service error in an API route
 * Logs with context and returns appropriate HTTP response
 *
 * @param error - Service error object
 * @param res - Next.js API response object
 * @param logger - Logger instance (optional, uses default if not provided)
 * @param context - Additional context for logging (userId, dealId, etc.)
 */
export function handleServiceError(
  error: ServiceError,
  res: NextApiResponse,
  logger: typeof appLogger = appLogger,
  context?: Record<string, any>
): void {
  const statusCode = error.statusCode || 500;

  // Log with full context (including details that we don't send to user)
  logger.error(`Service error: ${error.code}`, {
    code: error.code,
    message: error.message,
    details: error.details,
    statusCode,
    ...context,
  });

  // Send user-friendly response (NO implementation details!)
  res.status(statusCode).json({
    error: error.message,
    code: error.code,
  });
}

/**
 * Wrap a service call with automatic error handling
 *
 * Usage:
 * ```typescript
 * const result = await withServiceErrorHandling(
 *   () => someService(dealId),
 *   res,
 *   logger,
 *   { userId, dealId }
 * );
 * if (!result) return; // Error already handled
 * // Use result.data
 * ```
 */
export async function withServiceErrorHandling<T>(
  serviceCall: () => Promise<ServiceResult<T>>,
  res: NextApiResponse,
  logger: typeof appLogger = appLogger,
  context?: Record<string, any>
): Promise<T | null> {
  try {
    const result = await serviceCall();

    if (result.error) {
      handleServiceError(result.error, res, logger, context);
      return null;
    }

    return result.data;
  } catch (error) {
    // Unexpected error (not a ServiceError)
    logger.error('Unexpected error in service call', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });

    res.status(500).json({
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR',
    });

    return null;
  }
}

// ============================================
// ERROR MESSAGE MAPPER (Database → User-Friendly)
// ============================================

/**
 * Convert raw database/system errors to user-friendly messages
 * Prevents leaking implementation details
 */
export function mapDatabaseError(error: any): ServiceError {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return createServiceError('DUPLICATE_ENTRY', 'This record already exists', {
      originalError: error.message,
    });
  }

  if (error.code === '23503') {
    return createServiceError(
      'CONSTRAINT_VIOLATION',
      'Cannot perform this action due to related records',
      { originalError: error.message }
    );
  }

  if (error.code === '23502') {
    return createServiceError('VALIDATION_ERROR', 'Required information is missing', {
      originalError: error.message,
    });
  }

  // Supabase-specific errors
  if (error.message?.includes('JWT')) {
    return createServiceError('UNAUTHORIZED', 'Your session has expired. Please log in again.', {
      originalError: error.message,
    });
  }

  if (error.message?.includes('RLS')) {
    return createServiceError('FORBIDDEN', 'You do not have permission to perform this action', {
      originalError: error.message,
    });
  }

  // Generic database error
  return createServiceError('DATABASE_ERROR', 'A database error occurred. Please try again.', {
    originalError: error.message,
    code: error.code,
  });
}

/**
 * Safely convert any error to a ServiceError
 */
export function toServiceError(error: unknown): ServiceError {
  // Already a ServiceError
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as ServiceError;
  }

  // Error instance
  if (error instanceof Error) {
    // Check if it looks like a database error
    if ('code' in error) {
      return mapDatabaseError(error);
    }

    return createServiceError('INTERNAL_ERROR', 'An unexpected error occurred', {
      originalError: error.message,
      stack: error.stack,
    });
  }

  // Unknown error type
  return createServiceError('INTERNAL_ERROR', 'An unexpected error occurred', {
    originalError: String(error),
  });
}
