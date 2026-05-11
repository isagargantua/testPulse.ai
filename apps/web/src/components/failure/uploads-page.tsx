'use client';

import { useState } from 'react';
import { Upload, Trash2, Clock, CheckCircle2, AlertCircle, FileText, ImageIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadZone, FileList } from '@/components/failure/upload-zone';
import { useUpload } from '@/hooks/use-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime, formatBytes } from '@/lib/utils';
import type { Upload as UploadType } from '@testpulse/types';

interface UploadsPageProps {
  projectId: string;
}

export function UploadsPage({ projectId }: UploadsPageProps) {
  const queryClient = useQueryClient();

  // Fetch uploads
  const { data, isLoading } = useQuery({
    queryKey: ['uploads', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/uploads?project_id=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch uploads');
      return response.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      const response = await fetch(`/api/v1/uploads/${uploadId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete upload');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', projectId] });
    },
  });

  // Upload hook
  const {
    files,
    addFiles,
    removeFile,
    uploadFiles,
    clearCompleted,
    isUploading,
    hasPending,
    hasCompleted,
  } = useUpload({ projectId });

  const handleUploadComplete = (uploadId: string) => {
    queryClient.invalidateQueries({ queryKey: ['uploads', projectId] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Uploads</h1>
          <p className="text-muted-foreground">Upload test failure artifacts for analysis</p>
        </div>
        {data?.total !== undefined && (
          <div className="text-sm text-muted-foreground">
            {data.total} total uploads
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            onFilesSelected={addFiles}
            disabled={isUploading}
          />

          <FileList files={files} onRemove={removeFile} />

          {hasPending && (
            <div className="flex items-center gap-3">
              <Button onClick={uploadFiles} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </Button>
              {hasCompleted && (
                <Button variant="ghost" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upload History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : data?.uploads?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No uploads yet. Upload some files above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {data?.uploads?.map((upload: UploadType) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {upload.file_type.startsWith('image/') ? (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{upload.filename}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatBytes(upload.file_size)}</span>
                        <span>{formatRelativeTime(upload.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {upload.status === 'completed' && (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-500">Completed</span>
                        </>
                      )}
                      {upload.status === 'processing' && (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-primary">Processing</span>
                        </>
                      )}
                      {upload.status === 'failed' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-sm text-destructive">Failed</span>
                        </>
                      )}
                      {upload.status === 'pending' && (
                        <>
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Pending</span>
                        </>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(upload.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
