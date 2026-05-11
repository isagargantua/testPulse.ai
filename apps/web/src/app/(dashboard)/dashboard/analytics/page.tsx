import { Activity, AlertTriangle, Bug, FolderKanban } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = user
    ? await supabase.from('projects').select('id').eq('user_id', user.id)
    : { data: [] };
  const projectIds = (projects || []).map((project) => project.id);
  const { data: failures } =
    projectIds.length > 0
      ? await supabase.from('failures').select('id, is_flaky').in('project_id', projectIds)
      : { data: [] };
  const { data: analyses } = user
    ? await supabase.from('analyses').select('id').eq('user_id', user.id)
    : { data: [] };

  const failureCount = failures?.length || 0;
  const flakyCount = failures?.filter((failure) => failure.is_flaky).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Reliability metrics built from your actual workspace data.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Projects" value={projectIds.length} icon={FolderKanban} />
        <Metric title="Failures" value={failureCount} icon={Bug} />
        <Metric title="Flaky Tests" value={flakyCount} icon={AlertTriangle} />
        <Metric title="AI Analyses" value={analyses?.length || 0} icon={Activity} />
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: typeof Bug }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="text-3xl font-bold">{value}</CardContent>
    </Card>
  );
}
