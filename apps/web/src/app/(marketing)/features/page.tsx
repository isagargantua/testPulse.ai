'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, Bug, Code2, FileSearch, Gauge, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Bug,
    title: 'Failure root cause analysis',
    description:
      'Classify failed tests into synchronization, locator instability, iframe, overlay, timeout, network, and API failure patterns.',
    category: 'Root Cause',
  },
  {
    icon: Code2,
    title: 'Locator and code recommendations',
    description:
      'Generate Playwright and Selenium-ready suggestions with stable locator strategies and focused remediation steps.',
    category: 'Fixes',
  },
  {
    icon: Activity,
    title: 'Flakiness intelligence',
    description:
      'Track recurring failures, spot unstable tests, and prioritize the issues causing the most debugging drag.',
    category: 'Intelligence',
  },
  {
    icon: Upload,
    title: 'Artifact upload workflow',
    description:
      'Upload logs, stack traces, screenshots, HTML snippets, traces, and HAR files through a secure storage pipeline.',
    category: 'Workflow',
  },
  {
    icon: FileSearch,
    title: 'Searchable failure history',
    description:
      'Filter analysis history by project, framework, failure category, confidence, and recurrence.',
    category: 'History',
  },
  {
    icon: Gauge,
    title: 'Reliability metrics',
    description:
      'Monitor flaky counts, reliability scores, test health signals, and AI summaries from one operational dashboard.',
    category: 'Metrics',
  },
];

const supportedLanguages = [
  { name: 'Playwright', color: '#45B89A', desc: 'TypeScript, JavaScript' },
  { name: 'Selenium', color: '#43B02A', desc: 'Java, Python, C#, Ruby' },
  { name: 'Cypress', color: '#17202C', desc: 'JavaScript, TypeScript' },
  { name: 'Java', color: '#E76F00', desc: 'TestNG, JUnit' },
  { name: 'Python', color: '#3776AB', desc: 'pytest, unittest' },
  { name: 'C#', color: '#512BD4', desc: '.NET Testing' },
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border/50">
        <div className="container mx-auto px-6 py-16">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Bug className="h-4 w-4" />
            TestPulse
          </Link>
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary font-medium">
              <ShieldCheck className="h-4 w-4" />
              Built for automation teams
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">AI reliability workflows for failed automation tests</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
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

      {/* Supported Languages */}
      <section className="border-b border-border/50 bg-card/50 py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Multi-Framework Support</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {supportedLanguages.map((lang) => (
              <div key={lang.name} className="p-4 rounded-lg border border-border bg-card text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: lang.color }} />
                <p className="font-medium text-sm">{lang.name}</p>
                <p className="text-xs text-muted-foreground">{lang.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Core Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg transition-all">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{feature.category}</span>
                </div>
                <h2 className="font-semibold mb-2">{feature.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}