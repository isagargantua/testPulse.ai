import Link from 'next/link';
import { ArrowRight, BookOpen, Database, KeyRound, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  {
    icon: KeyRound,
    title: 'Configure environment',
    body: 'Set Supabase, OpenRouter, and app URL variables in local and Vercel environments.',
  },
  {
    icon: Database,
    title: 'Run Supabase setup',
    body: 'Execute the database migration and storage setup SQL files from the infrastructure folder.',
  },
  {
    icon: Upload,
    title: 'Analyze failures',
    body: 'Upload logs, screenshots, traces, or stack traces from the dashboard upload workflow.',
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-6 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <BookOpen className="h-4 w-4" />
          TestPulse AI
        </Link>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The core setup path for running TestPulse AI locally and preparing it for deployment.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-lg border border-border bg-card p-6">
                <Icon className="mb-4 h-5 w-5 text-primary" />
                <h2 className="font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-10 rounded-lg border border-border bg-muted/30 p-6">
          <h2 className="font-semibold">Local run command</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-background p-4 text-sm">
            <code>{'cd D:\\AiBizz\\Agents\nnpm run dev'}</code>
          </pre>
          <Link href="/signup" className="mt-6 inline-block">
            <Button>
              Create Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
