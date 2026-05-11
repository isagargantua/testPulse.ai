import Link from 'next/link';
import { Activity, ArrowRight, Bug, Code2, FileSearch, Gauge, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Bug,
    title: 'Failure root cause analysis',
    description:
      'Classify failed tests into synchronization, locator instability, iframe, overlay, timeout, network, and API failure patterns.',
  },
  {
    icon: Code2,
    title: 'Locator and code recommendations',
    description:
      'Generate Playwright and Selenium-ready suggestions with stable locator strategies and focused remediation steps.',
  },
  {
    icon: Activity,
    title: 'Flakiness intelligence',
    description:
      'Track recurring failures, spot unstable tests, and prioritize the issues causing the most debugging drag.',
  },
  {
    icon: Upload,
    title: 'Artifact upload workflow',
    description:
      'Upload logs, stack traces, screenshots, HTML snippets, traces, and HAR files through a secure storage pipeline.',
  },
  {
    icon: FileSearch,
    title: 'Searchable failure history',
    description:
      'Filter analysis history by project, framework, failure category, confidence, and recurrence.',
  },
  {
    icon: Gauge,
    title: 'Reliability metrics',
    description:
      'Monitor flaky counts, reliability scores, test health signals, and AI summaries from one operational dashboard.',
  },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border/50">
        <div className="container mx-auto px-6 py-16">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Bug className="h-4 w-4" />
            TestPulse AI
          </Link>
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              <ShieldCheck className="h-4 w-4" />
              Built for automation teams
            </div>
            <h1 className="text-4xl font-bold tracking-tight">AI reliability workflows for failed automation tests</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              TestPulse AI turns raw test artifacts into structured failure intelligence, fix recommendations, and reliability trends.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/signup">
                <Button>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline">Read Docs</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
