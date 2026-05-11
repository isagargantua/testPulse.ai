import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Project, Framework } from '@testpulse/types';
import { slugify } from '@/lib/utils';

export class ProjectService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
    return data || [];
  }

  async getProject(projectId: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) return null;
    return data;
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  async createProject(
    userId: string,
    data: {
      name: string;
      description?: string;
      framework?: Framework;
      repository_url?: string;
    }
  ): Promise<Project> {
    const slug = slugify(data.name);

    // Check if slug exists
    const { data: existing } = await this.supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      throw new Error('A project with this name already exists');
    }

    const { data: project, error } = await this.supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: data.name,
        slug,
        description: data.description,
        framework: data.framework || 'playwright',
        repository_url: data.repository_url,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create project: ${error.message}`);
    return project;
  }

  async updateProject(
    projectId: string,
    userId: string,
    data: Partial<{
      name: string;
      description: string;
      framework: Framework;
      repository_url: string;
      settings: Record<string, unknown>;
      status: 'active' | 'archived';
    }>
  ): Promise<Project> {
    // Verify ownership
    const project = await this.getProject(projectId);
    if (!project || project.user_id !== userId) {
      throw new Error('Project not found or access denied');
    }

    const { data: updated, error } = await this.supabase
      .from('projects')
      .update(data)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update project: ${error.message}`);
    return updated;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    // Verify ownership
    const project = await this.getProject(projectId);
    if (!project || project.user_id !== userId) {
      throw new Error('Project not found or access denied');
    }

    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw new Error(`Failed to delete project: ${error.message}`);
  }

  async getProjectStats(projectId: string): Promise<{
    totalFailures: number;
    flakyTests: number;
    reliabilityScore: number;
    recentFailures: number;
  }> {
    const { data: failures } = await this.supabase
      .from('failures')
      .select('id, is_flaky, created_at')
      .eq('project_id', projectId);

    const totalFailures = failures?.length || 0;
    const flakyTests = failures?.filter(f => f.is_flaky).length || 0;

    // Calculate reliability score (example: based on flaky ratio)
    const reliabilityScore = totalFailures > 0
      ? Math.round(((totalFailures - flakyTests) / totalFailures) * 100)
      : 100;

    // Recent failures (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentFailures = failures?.filter(f => f.created_at > weekAgo).length || 0;

    return {
      totalFailures,
      flakyTests,
      reliabilityScore,
      recentFailures,
    };
  }
}

export const projectService = new ProjectService();