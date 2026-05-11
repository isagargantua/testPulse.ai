import Link from 'next/link';
import { Clock, FileText, Upload } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes, formatRelativeTime } from '@/lib/utils';

type UploadRow = {
  id: string;
  filename: string;
  file_size: number;
  status: string;
  created_at: string;
  project_id: string;
};

export default async function UploadsRoute() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: uploads } = user
    ? await supabase
        .from('uploads')
        .select('id, filename, file_size, status, created_at, project_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const uploadRows = (uploads || []) as UploadRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uploads</h1>
          <p className="mt-1 text-muted-foreground">Artifacts uploaded for analysis.</p>
        </div>
        <Link href="/dashboard/failures/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Artifacts
          </Button>
        </Link>
      </div>

      {uploadRows.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No uploads yet"
          description="Upload your first log, screenshot, trace, or stacktrace after creating a project."
          actionHref="/dashboard/failures/upload"
          actionLabel="Upload Artifacts"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadRows.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{upload.filename}</p>
                    <p className="text-sm text-muted-foreground">{formatBytes(upload.file_size)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm capitalize">{upload.status}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(upload.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
