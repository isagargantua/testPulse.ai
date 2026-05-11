import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKETS = {
  UPLOADS: 'uploads',
  SCREENSHOTS: 'screenshots',
  EXPORTS: 'exports',
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

interface StorageConfig {
  public?: boolean;
  maxSizeMb?: number;
  allowedMimeTypes?: string[];
}

const DEFAULT_CONFIG: Record<BucketName, StorageConfig> = {
  uploads: {
    public: false,
    maxSizeMb: 50,
    allowedMimeTypes: [
      'text/plain', 'text/log', 'application/json', 'application/xml',
      'image/png', 'image/jpeg', 'image/gif', 'image/webp',
      'application/xhtml+xml', 'application/trace+json',
    ],
  },
  screenshots: {
    public: true,
    maxSizeMb: 10,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  },
  exports: {
    public: false,
    maxSizeMb: 100,
    allowedMimeTypes: ['application/pdf', 'application/json', 'text/csv'],
  },
};

export class StorageService {
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Get public URL for a file
  getPublicUrl(bucket: BucketName, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Download file content
  async downloadFile(bucket: BucketName, path: string): Promise<ArrayBuffer | null> {
    const { data, error } = await this.supabase.storage.from(bucket).download(path);

    if (error || !data) {
      console.error('Download error:', error);
      return null;
    }

    return data.arrayBuffer();
  }

  // Get signed URL for private files
  async getSignedUrl(
    bucket: BucketName,
    path: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; expiresAt: string } | null> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data) {
      console.error('Signed URL error:', error);
      return null;
    }

    return {
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }

  // Upload file (admin only)
  async uploadFile(
    bucket: BucketName,
    path: string,
    file: Buffer | ArrayBuffer,
    options?: { contentType?: string; upsert?: boolean }
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const { data, error } = await this.adminClient.storage
        .from(bucket)
        .upload(path, file, {
          contentType: options?.contentType || 'application/octet-stream',
          upsert: options?.upsert || false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, path: data.path };
    } catch (err) {
      return { success: false, error: 'Upload failed' };
    }
  }

  // Delete file (admin only)
  async deleteFile(
    bucket: BucketName,
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.adminClient.storage.from(bucket).remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Delete failed' };
    }
  }

  // List files in a bucket
  async listFiles(
    bucket: BucketName,
    path: string = '',
    options?: { limit?: number; sortBy?: { column: string; order: 'asc' | 'desc' } }
  ): Promise<{ files: StorageFile[]; error?: string }> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(path, {
        limit: options?.limit || 100,
        sortBy: options?.sortBy || { column: 'created_at', order: 'desc' },
      });

    if (error) {
      return { files: [], error: error.message };
    }

    const files: StorageFile[] = (data || []).map((item) => ({
      name: item.name,
      path: path ? `${path}/${item.name}` : item.name,
      size: item.metadata?.size || 0,
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
      mimeType: item.metadata?.mimetype || 'application/octet-stream',
    }));

    return { files };
  }

  // Move/rename file
  async moveFile(
    bucket: BucketName,
    fromPath: string,
    toPath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.adminClient.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Move failed' };
    }
  }

  // Create signed upload URL (for direct browser uploads)
  async createSignedUploadUrl(
    bucket: BucketName,
    path: string
  ): Promise<{ url: string; token: string; expiresAt: string } | null> {
    const { data, error } = await this.adminClient.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error('Signed upload URL error:', error);
      return null;
    }

    return {
      url: data.signedUrl,
      token: data.token,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  // Get bucket config
  getBucketConfig(bucket: BucketName): StorageConfig {
    return DEFAULT_CONFIG[bucket];
  }

  // Verify bucket exists, create if not (admin only)
  async ensureBucket(bucket: BucketName): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets } = await this.adminClient.storage.listBuckets();
      const exists = buckets?.find((b) => b.name === bucket);

      if (!exists) {
        const config = DEFAULT_CONFIG[bucket];
        const { error } = await this.adminClient.storage.createBucket(bucket, {
          public: config.public || false,
        });

        if (error) {
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to ensure bucket' };
    }
  }
}

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  mimeType: string;
}

let storageServiceSingleton: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageServiceSingleton) {
    storageServiceSingleton = new StorageService();
  }
  return storageServiceSingleton;
}

export { BUCKETS };
export type { StorageConfig };
export const storageService = new StorageService();
