'use client';

import { FileText, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';

export interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

interface FileListProps {
  files: UploadItem[];
  onRemove: (id: string) => void;
}

export function UploadZone({ onFilesSelected, disabled = false }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled,
    multiple: true,
    onDrop: onFilesSelected,
  });

  return (
    <div
      {...getRootProps()}
      className={[
        'flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition-colors',
        isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/20 hover:bg-muted/40',
        disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : '',
      ].join(' ')}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">
        {isDragActive ? 'Drop artifacts here' : 'Drag files here or click to browse'}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Logs, screenshots, traces, stacktraces, and HTML snippets
      </p>
    </div>
  );
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {files.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
        >
          <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <span className="flex-shrink-0 text-xs text-muted-foreground">
                {formatBytes(item.size)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={item.progress} className="h-1.5" />
              <span className="w-20 text-right text-xs capitalize text-muted-foreground">
                {item.status}
              </span>
            </div>
            {item.error && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <XCircle className="h-3 w-3" />
                {item.error}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            disabled={item.status === 'uploading'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
