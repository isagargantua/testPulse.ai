import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Failure, FailureCategory, Framework } from '@testpulse/types';

export class FailureService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getFailures(
    projectId: string,
    options?: {
      limit?: number;
      offset?: number;
      category?: FailureCategory;
      isFlaky?: boolean;
      search?: string;
    }
  ): Promise<{ failures: Failure[]; total: number }> {
    let query = this.supabase
      .from('failures')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (options?.category) {
      query = query.eq('failure_category', options.category);
    }

    if (options?.isFlaky !== undefined) {
      query = query.eq('is_flaky', options.isFlaky);
    }

    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,error_message.ilike.%${options.search}%`);
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch failures: ${error.message}`);

    return {
      failures: (data as Failure[]) || [],
      total: count || 0,
    };
  }

  async getFailure(failureId: string): Promise<Failure | null> {
    const { data, error } = await this.supabase
      .from('failures')
      .select('*')
      .eq('id', failureId)
      .single();

    if (error) return null;
    return data as Failure;
  }

  async createFailure(
    projectId: string,
    data: {
      title: string;
      description?: string;
      framework?: Framework;
      errorMessage?: string;
      stackTrace?: string;
      testName?: string;
      testFile?: string;
      lineNumber?: number;
      browser?: string;
      os?: string;
      uploadId?: string;
      category?: FailureCategory;
      rawData?: Record<string, unknown>;
    }
  ): Promise<Failure> {
    const { data: failure, error } = await this.supabase
      .from('failures')
      .insert({
        project_id: projectId,
        title: data.title,
        description: data.description,
        framework: data.framework || 'playwright',
        error_message: data.errorMessage,
        stack_trace: data.stackTrace,
        test_name: data.testName,
        test_file: data.testFile,
        line_number: data.lineNumber,
        browser: data.browser,
        os: data.os,
        upload_id: data.uploadId,
        failure_category: data.category || 'unknown',
        raw_data: data.rawData || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create failure: ${error.message}`);
    return failure as Failure;
  }

  async updateFailure(
    failureId: string,
    data: Partial<{
      title: string;
      description: string;
      failure_category: FailureCategory;
      error_message: string;
      stack_trace: string;
      retry_count: number;
      is_flaky: boolean;
      flakiness_score: number;
    }>
  ): Promise<Failure> {
    const { data: failure, error } = await this.supabase
      .from('failures')
      .update(data)
      .eq('id', failureId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update failure: ${error.message}`);
    return failure as Failure;
  }

  async deleteFailure(failureId: string): Promise<void> {
    const { error } = await this.supabase
      .from('failures')
      .delete()
      .eq('id', failureId);

    if (error) throw new Error(`Failed to delete failure: ${error.message}`);
  }

  async getFlakyFailures(projectId: string): Promise<Failure[]> {
    const { data, error } = await this.supabase
      .from('failures')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_flaky', true)
      .order('flakiness_score', { ascending: false });

    if (error) throw new Error(`Failed to fetch flaky failures: ${error.message}`);
    return (data as Failure[]) || [];
  }

  async markAsFlaky(
    failureId: string,
    flakinessScore: number
  ): Promise<void> {
    await this.updateFailure(failureId, {
      is_flaky: true,
      flakiness_score: flakinessScore,
    });
  }

  async getFailureTrends(
    projectId: string,
    days: number = 30
  ): Promise<{ date: string; count: number }[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await this.supabase
      .from('failures')
      .select('created_at')
      .eq('project_id', projectId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch trends: ${error.message}`);

    // Group by date
    const grouped = (data || []).reduce((acc: Record<string, number>, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }
}

export const failureService = new FailureService();