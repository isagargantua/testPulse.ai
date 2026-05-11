import { createClient } from '@supabase/supabase-js';
import type { Upload, UploadStatus } from '@testpulse/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UploadFile {
  id: string;
  filename: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface UploadOptions {
  projectId: string;
  bucket?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_BUCKET = 'uploads';

const ALLOWED_EXTENSIONS = [
  '.log', '.txt', '.json', '.xml',
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.har', '.trace', '.html', '.htm',
];

const ALLOWED_MIME_TYPES = [
  'text/plain', 'text/log', 'application/json', 'application/xml',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/xhtml+xml', 'application/trace+json',
];

export class UploadService {
  private bucket: string;
  private maxSize: number;
  private allowedTypes: string[];

  constructor(options: UploadOptions) {
    this.bucket = options.bucket || DEFAULT_BUCKET;
    this.maxSize = options.maxSize || DEFAULT_MAX_SIZE;
    this.allowedTypes = options.allowedTypes || ALLOWED_EXTENSIONS;
  }

  validateFile(file: File): { valid: boolean; errors: string[]; extension: string } {
    const errors: string[] = [];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (file.size > this.maxSize) {
      errors.push(`File size exceeds ${this.maxSize / 1024 / 1024}MB limit`);
    }

    if (file.size === 0) {
      errors.push('File is empty');
    }

    if (!this.allowedTypes.includes(extension)) {
      errors.push(`File type "${extension}" is not supported`);
    }

    return {
      valid: errors.length === 0,
      errors,
      extension,
    };
  }

  async createUploadRecord(
    projectId: string,
    userId: string,
    filename: string,
    fileType: string,
    fileSize: number,
    storagePath: string
  ): Promise<Upload> {
    const { data, error } = await supabase
      .from('uploads')
      .insert({
        project_id: projectId,
        user_id: userId,
        filename,
        file_type: fileType,
        file_size: fileSize,
        storage_path: storagePath,
        storage_bucket: this.bucket,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create upload record: ${error.message}`);
    return data;
  }

  async updateUploadStatus(
    uploadId: string,
    status: UploadStatus,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const updates: Record<string, unknown> = { status };

    if (status === 'completed' || status === 'failed') {
      updates.processed_at = new Date().toISOString();
    }

    if (metadata) {
      updates.metadata = metadata;
    }

    const { error } = await supabase
      .from('uploads')
      .update(updates)
      .eq('id', uploadId);

    if (error) throw new Error(`Failed to update upload status: ${error.message}`);
  }

  async getPresignedUrl(storagePath: string): Promise<{ url: string; expiresAt: string }> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUploadUrl(storagePath);

    if (error) throw new Error(`Failed to create presigned URL: ${error.message}`);

    return {
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    };
  }

  async uploadToStorage(file: File, storagePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw new Error(`Failed to upload file: ${error.message}`);
  }

  generateStoragePath(userId: string, projectId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${projectId}/${timestamp}-${sanitizedFilename}`;
  }

  async getUpload(uploadId: string): Promise<Upload | null> {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (error) return null;
    return data;
  }

  async getProjectUploads(
    projectId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ uploads: Upload[]; total: number }> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const { data, error, count } = await supabase
      .from('uploads')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch uploads: ${error.message}`);

    return {
      uploads: data || [],
      total: count || 0,
    };
  }

  async deleteUpload(uploadId: string): Promise<void> {
    const upload = await this.getUpload(uploadId);
    if (!upload) throw new Error('Upload not found');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(this.bucket)
      .remove([upload.storage_path]);

    if (storageError) console.error('Failed to delete file from storage:', storageError);

    // Delete record
    const { error } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId);

    if (error) throw new Error(`Failed to delete upload: ${error.message}`);
  }
}

export function createUploadService(options: UploadOptions): UploadService {
  return new UploadService(options);
}
