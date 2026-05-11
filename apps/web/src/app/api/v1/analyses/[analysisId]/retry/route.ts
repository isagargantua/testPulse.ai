import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analysisService } from '@/lib/services/analysis';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { analysisId } = await params;

    // Get existing analysis
    const { data: existingAnalysis, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', session.user.id)
      .single();

    if (error || !existingAnalysis) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Analysis not found' } },
        { status: 404 }
      );
    }

    // Get associated failure data
    const { data: failure } = await supabase
      .from('failures')
      .select('*')
      .eq('id', existingAnalysis.failure_id)
      .single();

    if (!failure) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Failure not found' } },
        { status: 404 }
      );
    }

    // Update status to processing
    await supabase
      .from('analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // Re-run analysis
    const result = await analysisService.analyze({
      errorMessage: failure.error_message || 'Unknown error',
      stackTrace: failure.stack_trace || undefined,
      framework: failure.framework || 'playwright',
    });

    // Update with new results
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
      .eq('id', analysisId);

    // Delete old recommendations
    await supabase
      .from('recommendations')
      .delete()
      .eq('analysis_id', analysisId);

    // Insert new recommendations
    if (result.recommendations.length > 0) {
      await supabase.from('recommendations').insert(
        result.recommendations.map(rec => ({
          analysis_id: analysisId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          suggested_code: rec.suggestedCode,
          confidence_score: rec.priority === 'high' ? 0.9 : 0.7,
          priority: rec.priority === 'high' ? 1 : rec.priority === 'medium' ? 2 : 3,
        }))
      );
    }

    // Get updated analysis
    const { data: analysis } = await supabase
      .from('analyses')
      .select('*, recommendations(*)')
      .eq('id', analysisId)
      .single();

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Retry analysis error:', err);

    // Mark as failed
    const supabase = await createServerSupabaseClient();
    const { analysisId } = await params;

    await supabase
      .from('analyses')
      .update({ status: 'failed', completed_at: new Date().toISOString() })
      .eq('id', analysisId);

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Retry failed' } },
      { status: 500 }
    );
  }
}
