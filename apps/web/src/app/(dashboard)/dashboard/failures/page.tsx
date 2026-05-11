import Link from 'next/link';
import { Bug, Upload } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';

type ProjectRow = { id: string; name: string };
type FailureRow = {
  id: string;
  project_id: string;
  title: string;
  failure_category: string;
  is_flaky: boolean;
  created_at: string;
};

export default async function FailuresPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = user
    ? await supabase.from('projects').select('id, name').eq('user_id', user.id)
    : { data: [] };

  const projectRows = (projects || []) as ProjectRow[];
  const projectIds = projectRows.map((project) => project.id);
  const { data: failures } =
    projectIds.length > 0
      ? await supabase
          .from('failures')
          .select('id, project_id, title, failure_category, is_flaky, created_at')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
      : { data: [] };

  const failureRows = (failures || []) as FailureRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Failures</h1>
          <p className="mt-1 text-muted-foreground">Review uploaded failures and AI analysis history.</p>
        </div>
        <Link href="/dashboard/failures/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Failures
          </Button>
        </Link>
      </div>

      {failureRows.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No failures yet"
          description="Upload artifacts after creating a project. Your failures and analysis reports will appear here."
          actionHref={projectRows.length === 0 ? '/dashboard/projects' : '/dashboard/failures/upload'}
          actionLabel={projectRows.length === 0 ? 'Create Project' : 'Upload Artifacts'}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Failure History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {failureRows.map((failure) => {
              const project = projectRows.find((item) => item.id === failure.project_id);
              return (
                <Link
                  key={failure.id}
                  href={`/dashboard/failures/${failure.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/40"
                >
                  <div>
                    <p className="font-medium">{failure.title}</p>
                    <p className="text-sm text-muted-foreground">{project?.name || 'Unknown project'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm capitalize">{failure.failure_category.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(failure.created_at)}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
