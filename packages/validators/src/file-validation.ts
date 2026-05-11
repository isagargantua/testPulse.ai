import { z } from 'zod';
import { ALLOWED_FILE_TYPES, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './auth';

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    extension: string;
    mimeType: string;
    size: number;
    detectedType: string;
  };
}

export function validateFile(
  file: {
    name: string;
    size: number;
    type: string;
  },
  options?: {
    allowedTypes?: readonly string[];
    allowedMimeTypes?: readonly string[];
    maxSize?: number;
  }
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allowedTypes = options?.allowedTypes || ALLOWED_FILE_TYPES;
  const allowedMimeTypes = options?.allowedMimeTypes || ALLOWED_MIME_TYPES;
  const maxSize = options?.maxSize || MAX_FILE_SIZE;

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Get extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const hasExtension = allowedTypes.includes(extension as typeof allowedTypes[number]);

  // Check MIME type
  const mimeType = file.type || 'application/octet-stream';
  const isAllowedMimeType = allowedMimeTypes.includes(mimeType as typeof allowedMimeTypes[number]) ||
    mimeType.startsWith('text/');

  // Determine detected type
  let detectedType = 'unknown';
  if (['.log', '.txt'].includes(extension)) detectedType = 'log';
  else if (['.json'].includes(extension)) detectedType = 'json';
  else if (['.xml'].includes(extension)) detectedType = 'xml';
  else if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extension)) detectedType = 'screenshot';
  else if (['.har'].includes(extension)) detectedType = 'network_log';
  else if (['.trace'].includes(extension)) detectedType = 'trace';
  else if (['.html', '.htm'].includes(extension)) detectedType = 'html';

  // Validation logic
  if (!hasExtension && !isAllowedMimeType) {
    errors.push(`File type "${extension}" is not supported`);
  }

  // Warnings for non-critical issues
  if (hasExtension && !isAllowedMimeType) {
    warnings.push(`MIME type "${mimeType}" may not be recognized`);
  }

  // Warn about large files
  if (file.size > 10 * 1024 * 1024) {
    warnings.push('Large file may take longer to process');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      extension,
      mimeType,
      size: file.size,
      detectedType,
    },
  };
}

// Schema for file validation response
export const fileValidationSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  metadata: z.object({
    extension: z.string(),
    mimeType: z.string(),
    size: z.number(),
    detectedType: z.string(),
  }).optional(),
});

export type FileValidationSchema = z.infer<typeof fileValidationSchema>;