import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analysisService } from '@/lib/services/analysis';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { failure_id, project_id, error_message, stack_trace, framework } = body;

    if (!error_message) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing error_message' } },
        { status: 400 }
      );
    }

    // Create analysis record
    const { data: analysis, error: createError } = await supabase
      .from('analyses')
      .insert({
        failure_id: failure_id || crypto.randomUUID(),
        user_id: session.user.id,
        status: 'processing',
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create analysis' } },
        { status: 500 }
      );
    }

    // Run analysis
    try {
      const result = await analysisService.analyze({
        errorMessage: error_message,
        stackTrace: stack_trace,
        framework: framework || 'playwright',
      });

      // Update analysis with results
      await supabase
        .from('analyses')
        .update({
          status: 'completed',
          category: result.category,
          root_cause: result.rootCause,
          confidence_score: result.confidence,
          explanation: result.explanation,
          processing_time_ms: result.processingTimeMs,
          token_usage: result.tokenUsage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysis.id);

      // Store recommendations
      if (result.recommendations.length > 0) {
        await supabase.from('recommendations').insert(
          result.recommendations.map(rec => ({
            analysis_id: analysis.id,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            suggested_code: rec.suggestedCode,
            confidence_score: rec.priority === 'high' ? 0.9 : rec.priority === 'medium' ? 0.7 : 0.5,
            priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
          }))
        );
      }

      // Get recommendations
      const { data: recommendations } = await supabase
        .from('recommendations')
        .select('*')
        .eq('analysis_id', analysis.id)
        .order('priority');

      return NextResponse.json({
        analysis: {
          id: analysis.id,
          status: 'completed',
          category: result.category,
          confidence: result.confidence,
          root_cause: result.rootCause,
          explanation: result.explanation,
          recommendations: recommendations || [],
          processing_time_ms: result.processingTimeMs,
        },
      });
    } catch (analysisError) {
      // Update analysis as failed
      await supabase
        .from('analyses')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', analysis.id);

      throw analysisError;
    }
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Analysis failed' } },
      { status: 500 }
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get analyses for user's projects
    const { data: analyses, count } = await supabase
      .from('analyses')
      .select(`
        *,
        recommendations(*)
      `, { count: 'exact' })
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({
      analyses: analyses || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
    });
  } catch (err) {
    console.error('Get analyses error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analyses' } },
      { status: 500 }
    );
  }
}