import Link from 'next/link';
import { Bug, TrendingUp, AlertTriangle, Activity, Upload, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const recentFailures = [
  {
    id: '1',
    title: 'Login test failed',
    project: 'E-Commerce App',
    time: '2h ago',
    category: 'locator_instability',
  },
  {
    id: '2',
    title: 'Checkout flow broken',
    project: 'E-Commerce App',
    time: '4h ago',
    category: 'synchronization',
  },
  {
    id: '3',
    title: 'Dashboard not loading',
    project: 'Admin Portal',
    time: '6h ago',
    category: 'timeout',
  },
];

const projects = [
  {
    id: '1',
    name: 'E-Commerce App',
    slug: 'ecommerce-app',
    failures: 12,
    reliability: 94,
  },
  {
    id: '2',
    name: 'Admin Portal',
    slug: 'admin-portal',
    failures: 5,
    reliability: 87,
  },
  {
    id: '3',
    name: 'Mobile App Tests',
    slug: 'mobile-app',
    failures: 8,
    reliability: 76,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s your test reliability overview.
          </p>
        </div>
        <Link href="/dashboard/failures/upload">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Failures
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Failures
            </CardTitle>
            <Bug className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">47</div>
            <p className="text-xs text-muted-foreground mt-1">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reliability Score
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <p className="text-xs text-green-500 mt-1">+3% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Flaky Tests
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-yellow-500 mt-1">2 critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tests Analyzed
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Failures */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Failures</CardTitle>
            <Link href="/dashboard/failures">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFailures.map((failure) => (
                <div
                  key={failure.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Bug className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{failure.title}</p>
                      <p className="text-sm text-muted-foreground">{failure.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {failure.category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">{failure.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {project.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.failures} failures
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      project.reliability >= 90 ? 'text-green-500' :
                      project.reliability >= 75 ? 'text-yellow-500' : 'text-destructive'
                    }`}>
                      {project.reliability}%
                    </p>
                    <p className="text-xs text-muted-foreground">reliable</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}