import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bug, Zap, Shield, Activity, Code2, FileSearch } from 'lucide-react';

function AnimatedIcon({ icon: Icon, delay }: { icon: typeof Bug; delay: number }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl animate-pulse" />
      <div
        className="relative w-14 h-14 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-xl flex items-center justify-center border border-primary/20"
        style={{ animationDelay: `${delay}ms` }}
      >
        <Icon className="w-7 h-7 text-primary" />
      </div>
    </div>
  );
}

const features = [
  {
    icon: Bug,
    title: 'Root Cause Analysis',
    description: 'AI identifies exactly why your test failed — synchronization, locator instability, overlay issues, and more.',
    href: '/features',
    delay: 0,
  },
  {
    icon: Zap,
    title: 'Fixed Locators',
    description: 'Get AI-generated, stable locators ready to paste into your test code. No more fragile selectors.',
    href: '/features',
    delay: 100,
  },
  {
    icon: Shield,
    title: 'Flakiness Detection',
    description: 'Identify which tests are flaky and get recommendations to stabilize them.',
    href: '/features',
    delay: 200,
  },
];

const supportedLanguages = [
  { name: 'Playwright', color: '#45B89A' },
  { name: 'Selenium', color: '#43B02A' },
  { name: 'Java', color: '#E76F00' },
  { name: 'Python', color: '#3776AB' },
  { name: 'JavaScript', color: '#F7DF1E' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'C#', color: '#512BD4' },
  { name: 'Cypress', color: '#17202C' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Bug className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">TestPulse</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-lg shadow-primary/20">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(38,92%,50%,0.08),transparent)]" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Test Reliability
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Stop debugging flaky tests.{' '}
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                Let AI find the root cause.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Upload your Playwright, Selenium, Cypress, or any test logs. Get instant AI analysis, fixed locators, and reduce debugging time by 80%.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
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
        </div>
      </section>

      {/* Languages */}
      <section className="py-12 border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-6">Supports all major frameworks and languages</p>
          <div className="flex flex-wrap justify-center gap-6">
            {supportedLanguages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                <span>{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need to fix test failures</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From upload to fix in seconds, not hours.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <AnimatedIcon icon={Icon} delay={feature.delay} />
                    <h3 className="text-xl font-semibold mt-6 mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-card/50 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureItem
              icon={FileSearch}
              title="Searchable History"
              description="Filter analysis history by project, framework, failure category, and recurrence."
            />
            <FeatureItem
              icon={Activity}
              title="Reliability Metrics"
              description="Monitor flaky counts, reliability scores, and AI summaries from one dashboard."
            />
            <FeatureItem
              icon={Code2}
              title="Multi-Language Support"
              description="Works with Java, Python, JavaScript, TypeScript, C#, and more."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to fix your flaky tests?</h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of teams who trust TestPulse to keep their automation pipelines reliable.
            </p>
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-amber-600 rounded flex items-center justify-center">
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

function FeatureItem({ icon: Icon, title, description }: { icon: typeof Bug; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}