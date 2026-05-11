import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Brain, Bug } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default async function FailureDetailPage({ params }: { params: Promise<{ failureId: string }> }) {
  const { failureId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: failure } = await supabase
    .from('failures')
    .select('*, projects!inner(id, name, user_id)')
    .eq('id', failureId)
    .eq('projects.user_id', user.id)
    .single();

  if (!failure) notFound();

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, status, category, root_cause, confidence_score, explanation, created_at')
    .eq('failure_id', failure.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const latestAnalysis = analyses?.[0];

  return (
    <div className="space-y-6">
      <Link href="/dashboard/failures" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Failures
      </Link>
      <div>
        <h1 className="text-3xl font-bold">{failure.title}</h1>
        <p className="mt-1 text-muted-foreground">
          {failure.projects?.name} · {formatDate(failure.created_at)}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Category</CardTitle></CardHeader>
          <CardContent className="font-semibold capitalize">{failure.failure_category.replace('_', ' ')}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Framework</CardTitle></CardHeader>
          <CardContent className="font-semibold capitalize">{failure.framework}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Flaky</CardTitle></CardHeader>
          <CardContent className="font-semibold">{failure.is_flaky ? 'Yes' : 'No'}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Error Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{failure.error_message || 'No error message captured.'}</p>
          {failure.stack_trace && (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
              <code>{failure.stack_trace}</code>
            </pre>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestAnalysis ? (
            <div className="space-y-3">
              <p className="font-medium">{latestAnalysis.root_cause || 'Analysis is processing.'}</p>
              <p className="text-sm text-muted-foreground">{latestAnalysis.explanation}</p>
              <p className="text-xs text-muted-foreground">Status: {latestAnalysis.status}</p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-5">
              <p className="text-sm text-muted-foreground">No AI analysis has been generated for this failure yet.</p>
              <Link href="/dashboard/failures/upload">
                <Button variant="outline">Upload More Artifacts</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
