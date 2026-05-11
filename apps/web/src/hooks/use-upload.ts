'use client';

import { useState, useCallback } from 'react';
import type { UploadItem } from '@/components/failure/upload-zone';

interface UseUploadOptions {
  projectId: string;
  onUploadComplete?: (uploadId: string) => void;
  onUploadError?: (error: string, fileId: string) => void;
}

export function useUpload(options: UseUploadOptions) {
  const [files, setFiles] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadItems: UploadItem[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const,
      name: file.name,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...uploadItems]);
    return uploadItems;
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileProgress = useCallback((id: string, progress: number) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress, status: 'uploading' } : f))
    );
  }, []);

  const updateFileStatus = useCallback(
    (id: string, status: 'completed' | 'failed', error?: string) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status, error, progress: status === 'completed' ? 100 : f.progress } : f
        )
      );
    },
    []
  );

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const pendingFiles = files.filter((f) => f.status === 'pending');

    for (const fileItem of pendingFiles) {
      try {
        updateFileProgress(fileItem.id, 10);

        // Step 1: Get presigned URL
        const presignedResponse = await fetch('/api/v1/uploads/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fileItem.name,
            file_size: fileItem.size,
            project_id: options.projectId,
          }),
        });

        if (!presignedResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        updateFileProgress(fileItem.id, 30);

        const { upload_id, url } = await presignedResponse.json();

        // Step 2: Upload to storage
        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: fileItem.file,
          headers: {
            'Content-Type': fileItem.file.type || 'application/octet-stream',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        updateFileProgress(fileItem.id, 80);

        // Step 3: Complete upload
        const completeResponse = await fetch('/api/v1/uploads/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upload_id }),
        });

        if (!completeResponse.ok) {
          throw new Error('Failed to complete upload');
        }

        updateFileProgress(fileItem.id, 100);
        updateFileStatus(fileItem.id, 'completed');
        options.onUploadComplete?.(upload_id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        updateFileStatus(fileItem.id, 'failed', errorMessage);
        options.onUploadError?.(errorMessage, fileItem.id);
      }
    }

    setIsUploading(false);
  }, [files, options, updateFileProgress, updateFileStatus]);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== 'completed'));
  }, []);

  return {
    files,
    addFiles,
    removeFile,
    uploadFiles,
    clearCompleted,
    isUploading,
    hasPending: files.some((f) => f.status === 'pending'),
    hasCompleted: files.some((f) => f.status === 'completed'),
  };
}