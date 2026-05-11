import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { projectService } from '@/lib/services/projects';
import { failureService } from '@/lib/services/failures';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's projects
    const projects = await projectService.getProjects(userId);

    // Get stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const stats = await projectService.getProjectStats(project.id);
        return { ...project, stats };
      })
    );

    // Get total failures across all projects
    let totalFailures = 0;
    let totalFlaky = 0;
    const recentFailures: unknown[] = [];

    for (const project of projects) {
      const { failures } = await failureService.getFailures(project.id, { limit: 5 });
      recentFailures.push(...failures.map(f => ({ ...f, project })));
    }

    // Sort recent failures by date
    recentFailures.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Calculate overall stats
    for (const project of projectsWithStats) {
      totalFailures += project.stats.totalFailures;
      totalFlaky += project.stats.flakyTests;
    }

    const reliabilityScore = totalFailures > 0
      ? Math.round(((totalFailures - totalFlaky) / totalFailures) * 100)
      : 100;

    return NextResponse.json({
      stats: {
        total_projects: projects.length,
        total_failures: totalFailures,
        flaky_tests: totalFlaky,
        reliability_score: reliabilityScore,
      },
      projects: projectsWithStats,
      recent_failures: recentFailures.slice(0, 10),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard' } },
      { status: 500 }
    );
  }
}