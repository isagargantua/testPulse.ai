import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bug, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TestPulse AI</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Analysis
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Stop debugging flaky tests.
            <br />
            <span className="text-primary">Let AI find the root cause.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Upload your Playwright or Selenium logs and get instant AI analysis.
            Identify root causes, get fixed locators, and reduce debugging time by 80%.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="h-12 px-8">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to fix test failures</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From upload to fix in seconds, not hours.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bug className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Root Cause Analysis</h3>
              <p className="text-muted-foreground text-sm">
                AI identifies exactly why your test failed — synchronization, locator instability, overlay issues, and more.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fixed Locators</h3>
              <p className="text-muted-foreground text-sm">
                Get AI-generated, stable locators ready to paste into your test code. No more fragile selectors.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flakiness Detection</h3>
              <p className="text-muted-foreground text-sm">
                Identify which tests are flaky and get recommendations to stabilize them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Bug className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">TestPulse AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for QA teams who care about test reliability.
          </p>
        </div>
      </footer>
    </div>
  );
}