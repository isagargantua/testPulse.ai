'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { UploadZone, FileList } from '@/components/failure/upload-zone';
import { useUpload } from '@/hooks/use-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UploadFailuresPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string>('');

  const {
    files,
    addFiles,
    removeFile,
    uploadFiles,
    clearCompleted,
    isUploading,
    hasPending,
  } = useUpload({
    projectId: selectedProject,
    onUploadComplete: (uploadId) => {
      router.push(`/dashboard/failures/${uploadId}/analyze`);
    },
  });

  // Mock projects - in real app, fetch from API
  const projects = [
    { id: '1', name: 'E-Commerce App', slug: 'ecommerce-app' },
    { id: '2', name: 'Admin Portal', slug: 'admin-portal' },
    { id: '3', name: 'Mobile App Tests', slug: 'mobile-app' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload Failures</h1>
        <p className="text-muted-foreground mt-1">
          Upload your test logs, screenshots, and traces for AI analysis
        </p>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>
            Choose which project this upload belongs to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <Label htmlFor="project">Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger id="project" className="mt-1.5">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Artifacts
          </CardTitle>
          <CardDescription>
            Supported formats: .log, .txt, .json, .xml, .png, .jpg, .har, .trace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            onFilesSelected={addFiles}
            disabled={isUploading || !selectedProject}
          />

          {files.length > 0 && (
            <>
              <FileList files={files} onRemove={removeFile} />

              {hasPending && (
                <div className="flex gap-3">
                  <Button
                    onClick={uploadFiles}
                    disabled={isUploading || !selectedProject}
                  >
                    {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} File(s)`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCompleted}
                    disabled={files.every(f => f.status !== 'completed')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </>
          )}

          {!selectedProject && files.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Select a project to start uploading
            </p>
          )}
        </CardContent>
      </Card>

      {/* Supported File Types */}
      <Card>
        <CardHeader>
          <CardTitle>Supported File Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg border border-border">
              <p className="text-sm font-medium">Logs</p>
              <p className="text-xs text-muted-foreground">.log, .txt</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <p className="text-sm font-medium">JSON / XML</p>
              <p className="text-xs text-muted-foreground">.json, .xml</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <p className="text-sm font-medium">Screenshots</p>
              <p className="text-xs text-muted-foreground">.png, .jpg, .webp</p>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <p className="text-sm font-medium">Traces</p>
              <p className="text-xs text-muted-foreground">.har, .trace</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}