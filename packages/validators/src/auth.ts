import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

// Project Schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(500).optional(),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
  repository_url: z.string().url().optional().or(z.literal('')),
});

export const updateProjectSchema = createProjectSchema.partial().omit({ slug: true });

// Upload Schemas
export const ALLOWED_FILE_TYPES = [
  '.log', '.txt', '.json', '.xml',
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.har', '.trace', '.html', '.htm',
] as const;

export const ALLOWED_MIME_TYPES = [
  'text/plain', 'text/log', 'application/json', 'application/xml',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/xhtml+xml', 'application/trace+json',
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadFileSchema = z.object({
  filename: z.string().min(1).max(255),
  file_type: z.string(),
  file_size: z.number().max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
  mime_type: z.string().optional(),
});

export const completeUploadSchema = z.object({
  upload_id: z.string().uuid(),
});

// Analysis Schemas
export const createAnalysisSchema = z.object({
  failure_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
});

export const retryAnalysisSchema = z.object({
  analysis_id: z.string().uuid(),
});

// Recommendation Schemas
export const recommendationQuerySchema = z.object({
  analysis_id: z.string().uuid(),
  type: z.enum(['locator_fix', 'code_fix', 'retry_strategy', 'best_practice']).optional(),
});

// Query Schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
});

export const failureFilterSchema = z.object({
  project_id: z.string().uuid().optional(),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']).optional(),
  category: z.enum([
    'synchronization', 'overlay', 'iframe', 'stale_element',
    'locator_instability', 'timeout', 'api_failure', 'network',
    'assertion', 'unknown'
  ]).optional(),
  is_flaky: z.boolean().optional(),
  search: z.string().max(200).optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FailureFilterInput = z.infer<typeof failureFilterSchema>;