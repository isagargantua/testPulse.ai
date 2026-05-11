import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bug, Upload } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatRelativeTime } from '@/lib/utils';

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, slug, framework, description, created_at')
    .eq('user_id', user.id)
    .eq('slug', slug)
    .single();

  if (!project) notFound();

  const { data: failures } = await supabase
    .from('failures')
    .select('id, title, failure_category, is_flaky, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false });

  const failureRows = failures || [];

  return (
    <div className="space-y-6">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Projects
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="mt-1 text-muted-foreground capitalize">{project.framework} automation project</p>
        </div>
        <Link href="/dashboard/failures/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Artifacts
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Failures</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{failureRows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Flaky</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{failureRows.filter((failure) => failure.is_flaky).length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Framework</CardTitle></CardHeader>
          <CardContent className="text-lg font-semibold capitalize">{project.framework}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Failures</CardTitle>
        </CardHeader>
        <CardContent>
          {failureRows.length === 0 ? (
            <EmptyState
              icon={Bug}
              title="No failures uploaded"
              description="Upload artifacts for this project to generate AI-powered failure analysis."
              actionHref="/dashboard/failures/upload"
              actionLabel="Upload Artifacts"
            />
          ) : (
            <div className="space-y-3">
              {failureRows.map((failure) => (
                <Link
                  key={failure.id}
                  href={`/dashboard/failures/${failure.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/40"
                >
                  <span className="font-medium">{failure.title}</span>
                  <span className="text-sm text-muted-foreground">{formatRelativeTime(failure.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
