/**
 * Production-Grade Logger with Pino
 *
 * Clean upgrade that keeps existing API signature
 * Backend code uses: logger.info('message', { metadata })
 */

import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

// PII fields to redact
const PII_FIELDS = [
  'password',
  'token',
  'secret',
  'apikey',
  'api_key',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'authorization',
  'cookie',
  'ssn',
  'social_security',
  'credit_card',
  'creditcard',
  'cvv',
  'pin',
  'session',
  'jwt',
];

const PARTIAL_REDACT_FIELDS = ['email', 'phone', 'phone_number'];

function redactPII(obj: unknown): unknown {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactPII(item));
  }

  if (obj instanceof Error) {
    return { name: obj.name, message: obj.message, stack: obj.stack };
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (PII_FIELDS.some((field) => lowerKey.includes(field))) {
      result[key] = '[REDACTED]';
    } else if (PARTIAL_REDACT_FIELDS.some((field) => lowerKey.includes(field))) {
      result[key] =
        typeof value === 'string' && value.length > 3
          ? value.substring(0, 3) + '***'
          : '[REDACTED]';
    } else {
      result[key] = typeof value === 'object' ? redactPII(value) : value;
    }
  }
  return result;
}

// Create Pino instance
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

const pinoLogger = pino({
  level: isDevelopment ? 'debug' : 'info',
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        },
      }
    : {}),
  base: { env: process.env.NODE_ENV },
});

// Helper to send errors to Sentry
function sendErrorToSentry(message: string, originalMetadata?: unknown): void {
  if (isTest || (isDevelopment && !process.env.NEXT_PUBLIC_ENABLE_SENTRY_DEV)) return;

  try {
    const tags: Record<string, string> = { logger: 'pino' };

    // 1. If metadata is an Error object directly, capture it
    if (originalMetadata instanceof Error) {
      Sentry.captureException(originalMetadata, {
        tags,
        extra: { message },
      });
      return;
    }

    const meta = (originalMetadata || {}) as Record<string, unknown>;

    // 2. Extract common fields for tags
    const TAG_FIELDS = ['userId', 'dealId', 'requestId', 'operation', 'endpoint', 'service'];
    for (const field of TAG_FIELDS) {
      if (meta[field] && typeof meta[field] === 'string') {
        tags[field] = meta[field] as string;
      }
    }

    // 3. Check for common error keys (err, error, e)
    const err = (meta.err || meta.error || meta.e) as Error | undefined;

    if (err instanceof Error) {
      // Send actual Error object to Sentry for proper stack traces
      Sentry.captureException(err, {
        tags,
        extra: { message, ...meta },
      });
    } else {
      // Just capture the message with metadata
      Sentry.captureMessage(message, {
        level: 'error',
        tags,
        extra: meta,
      });
    }
  } catch {
    // Silently fail if Sentry errors
  }
}

// Helper to create a wrapped logger instance
function createLoggerWrapper(pinoInstance: pino.Logger) {
  return {
    debug(message: string, meta?: unknown): void {
      const safe = meta ? redactPII(meta) : undefined;
      pinoInstance.debug(safe, message);
    },

    info(message: string, meta?: unknown): void {
      const safe = meta ? redactPII(meta) : undefined;
      pinoInstance.info(safe, message);
    },

    warn(message: string, meta?: unknown): void {
      const safe = meta ? redactPII(meta) : undefined;
      pinoInstance.warn(safe, message);
    },

    error(message: string, meta?: unknown): void {
      // Send to Sentry BEFORE redaction (preserve Error objects)
      sendErrorToSentry(message, meta);
      // Then redact and log to Pino
      const safe = meta ? redactPII(meta) : undefined;
      pinoInstance.error(safe, message);
    },

    fatal(message: string, meta?: unknown): void {
      // Send to Sentry BEFORE redaction (preserve Error objects)
      sendErrorToSentry(message, meta);
      // Then redact and log to Pino
      const safe = meta ? redactPII(meta) : undefined;
      pinoInstance.fatal(safe, message);
    },

    child(context: Record<string, unknown>) {
      // Return a new wrapped logger for the child pino instance
      const childPino = pinoInstance.child(redactPII(context) as Record<string, unknown>);
      return createLoggerWrapper(childPino);
    },
  };
}

// Export clean API matching existing codebase
export const logger = createLoggerWrapper(pinoLogger);

export const errorLogger = {
  logError(error: Error, context?: unknown): void {
    const meta = context && typeof context === 'object' ? context : {};
    logger.error('Application error occurred', { err: error, ...meta });
  },

  logApiError(endpoint: string, error: unknown, requestData?: unknown): void {
    logger.error('API error occurred', {
      endpoint,
      err: error,
      requestData,
      status: (error as { status?: number }).status,
    });
  },

  logDbError(operation: string, error: unknown, queryData?: unknown): void {
    logger.error('Database error occurred', {
      operation,
      err: error,
      queryData,
      code: (error as { code?: string }).code,
    });
  },
};
