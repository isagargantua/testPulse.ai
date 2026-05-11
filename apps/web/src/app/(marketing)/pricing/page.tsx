import Link from 'next/link';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Starter',
    price: '$19',
    description: 'For solo QA engineers and small automation suites.',
    features: ['3 projects', '250 AI analyses/month', 'Failure history', 'Secure artifact uploads'],
  },
  {
    name: 'Team',
    price: '$79',
    description: 'For growing SDET teams improving reliability together.',
    features: ['Unlimited projects', '2,000 AI analyses/month', 'Team dashboard', 'Priority analysis queue'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations with CI/CD and governance requirements.',
    features: ['Custom limits', 'CI integrations', 'Audit logs', 'Dedicated support'],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-6 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Zap className="h-4 w-4" />
          TestPulse AI
        </Link>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Pricing for serious test reliability work</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start small, then scale analysis volume, team collaboration, and integrations as your automation suite grows.
          </p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.name} className="flex flex-col rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.price.startsWith('$') && <span className="text-muted-foreground">/month</span>}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{tier.description}</p>
              <div className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/signup" className="mt-8">
                <Button className="w-full" variant={tier.name === 'Team' ? 'default' : 'outline'}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
