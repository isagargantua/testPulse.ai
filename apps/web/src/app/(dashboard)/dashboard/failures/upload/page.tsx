'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderKanban, Upload } from 'lucide-react';
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

type Project = {
  id: string;
  name: string;
  slug: string;
};

export default function UploadFailuresPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const response = await fetch('/api/v1/projects');
      if (response.ok) {
        const result = await response.json();
        setProjects(result.projects || []);
      }
      setIsLoadingProjects(false);
    }

    loadProjects();
  }, []);

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
    onUploadComplete: () => {
      router.push('/dashboard/uploads');
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Failures</h1>
        <p className="mt-1 text-muted-foreground">
          Upload test logs, screenshots, and traces for AI analysis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Choose which project this upload belongs to.</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 && !isLoadingProjects ? (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-5">
              <div className="flex items-center gap-3">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Create a project before uploading artifacts.</p>
              </div>
              <Link href="/dashboard/projects">
                <Button variant="outline">Create Project</Button>
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project" className="mt-1.5">
                  <SelectValue placeholder={isLoadingProjects ? 'Loading projects...' : 'Select a project'} />
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Artifacts
          </CardTitle>
          <CardDescription>
            Supported formats: .log, .txt, .json, .xml, .png, .jpg, .har, .trace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone onFilesSelected={addFiles} disabled={isUploading || !selectedProject} />

          {files.length > 0 && (
            <>
              <FileList files={files} onRemove={removeFile} />

              {hasPending && (
                <div className="flex gap-3">
                  <Button onClick={uploadFiles} disabled={isUploading || !selectedProject}>
                    {isUploading ? 'Uploading...' : `Upload ${files.filter((file) => file.status === 'pending').length} File(s)`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCompleted}
                    disabled={files.every((file) => file.status !== 'completed')}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
