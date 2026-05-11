import Link from 'next/link';
import { Activity, AlertTriangle, ArrowRight, Bug, FolderKanban, TrendingUp, Upload } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/dashboard/empty-state';
import { formatRelativeTime, getInitials } from '@/lib/utils';

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  framework: string;
  created_at: string;
};

type FailureRow = {
  id: string;
  project_id: string;
  title: string;
  failure_category: string;
  is_flaky: boolean;
  created_at: string;
};

type AnalysisRow = {
  id: string;
};

async function getDashboardData() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, projects: [], failures: [], analyses: [] };
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, framework, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const projectRows = (projects || []) as ProjectRow[];
  const projectIds = projectRows.map((project) => project.id);

  let failures: FailureRow[] = [];
  let analyses: AnalysisRow[] = [];

  if (projectIds.length > 0) {
    const { data: failureRows } = await supabase
      .from('failures')
      .select('id, project_id, title, failure_category, is_flaky, created_at')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });

    failures = (failureRows || []) as FailureRow[];
  }

  const { data: analysisRows } = await supabase
    .from('analyses')
    .select('id')
    .eq('user_id', user.id);

  analyses = (analysisRows || []) as AnalysisRow[];

  return { user, projects: projectRows, failures, analyses };
}

export default async function DashboardPage() {
  const { projects, failures, analyses } = await getDashboardData();
  const flakyTests = failures.filter((failure) => failure.is_flaky).length;
  const reliabilityScore =
    failures.length > 0 ? Math.round(((failures.length - flakyTests) / failures.length) * 100) : 100;
  const recentFailures = failures.slice(0, 5);

  const failuresByProject = failures.reduce<Record<string, number>>((acc, failure) => {
    acc[failure.project_id] = (acc[failure.project_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Your test reliability workspace starts from your uploaded artifacts.
          </p>
        </div>
        <Link href="/dashboard/failures/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Failures
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Failures" value={failures.length} detail="Across your projects" icon={Bug} />
        <MetricCard title="Reliability Score" value={`${reliabilityScore}%`} detail="Based on flaky ratio" icon={TrendingUp} />
        <MetricCard title="Flaky Tests" value={flakyTests} detail="Marked as flaky" icon={AlertTriangle} />
        <MetricCard title="Tests Analyzed" value={analyses.length} detail="AI analysis runs" icon={Activity} />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Fresh workspace"
          description="Create your first project, then upload failed-test artifacts to build reliability history."
          actionHref="/dashboard/projects"
          actionLabel="Create Project"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Failures</CardTitle>
              <Link href="/dashboard/failures">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentFailures.length === 0 ? (
                <EmptyState
                  icon={Bug}
                  title="No failures yet"
                  description="Upload logs, traces, screenshots, or stacktraces to start generating AI analysis."
                  actionHref="/dashboard/failures/upload"
                  actionLabel="Upload Artifacts"
                />
              ) : (
                <div className="space-y-4">
                  {recentFailures.map((failure) => {
                    const project = projects.find((item) => item.id === failure.project_id);
                    return (
                      <Link
                        key={failure.id}
                        href={`/dashboard/failures/${failure.id}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <Bug className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{failure.title}</p>
                            <p className="text-sm text-muted-foreground">{project?.name || 'Unknown project'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded bg-muted px-2 py-1 text-xs">
                            {failure.failure_category.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatRelativeTime(failure.created_at)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => {
                  const projectFailureCount = failuresByProject[project.id] || 0;
                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.slug}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-sm text-primary">
                            {getInitials(project.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{projectFailureCount} failures</p>
                        </div>
                      </div>
                      <span className="text-xs capitalize text-muted-foreground">{project.framework}</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof Bug;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
