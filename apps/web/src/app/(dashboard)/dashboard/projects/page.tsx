import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CreateProjectForm } from '@/components/projects/create-project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  framework: string;
  created_at: string;
};

export default async function ProjectsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = user
    ? await supabase
        .from('projects')
        .select('id, name, slug, framework, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const projectRows = (projects || []) as ProjectRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-muted-foreground">Manage the test automation projects you want to monitor.</p>
      </div>

      <CreateProjectForm />

      {projectRows.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to organize uploads, failures, analyses, and reliability metrics."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectRows.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.slug}`}>
              <Card className="transition-colors hover:bg-accent/40">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="capitalize">{project.framework}</span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
