import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { analysisService } from '@/lib/services/analysis';

export async function GET(
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

    const { data: analysis, error } = await supabase
      .from('analyses')
      .select(`
        *,
        recommendations(*)
      `)
      .eq('id', analysisId)
      .eq('user_id', session.user.id)
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Analysis not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('Get analysis error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analysis' } },
      { status: 500 }
    );
  }
}