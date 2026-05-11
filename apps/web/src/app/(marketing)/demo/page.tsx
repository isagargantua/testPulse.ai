import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-6 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <PlayCircle className="h-4 w-4" />
          TestPulse AI
        </Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Demo workflow</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              The demo path shows how TestPulse AI moves from raw failed-test artifacts to structured AI diagnosis.
            </p>
            <div className="mt-8 space-y-4">
              {['Upload test artifacts', 'Classify the failure category', 'Generate root cause and confidence score', 'Review locator and code recommendations'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </div>
              ))}
            </div>
            <Link href="/signup" className="mt-8 inline-block">
              <Button>
                Try It
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <PlayCircle className="h-4 w-4" />
              Sample analysis output
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Failure type</p>
                <p className="mt-1 font-semibold">Locator instability</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Root cause</p>
                <p className="mt-1 text-sm leading-6">
                  The selector depends on dynamic markup and fails when the checkout button re-renders after API hydration.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Recommendation</p>
                <pre className="mt-2 overflow-x-auto rounded-md bg-background p-3 text-xs">
                  <code>{"await page.getByRole('button', { name: 'Checkout' }).click();"}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
