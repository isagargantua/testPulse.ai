import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { failureService } from '@/lib/services/failures';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ failureId: string }> }
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

    const { failureId } = await params;
    const failure = await failureService.getFailure(failureId);

    if (!failure) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Failure not found' } },
        { status: 404 }
      );
    }

    // Get related analysis
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*, recommendations(*)')
      .eq('failure_id', failureId)
      .order('created_at', { ascending: false });

    return NextResponse.json({ failure, analyses: analyses || [] });
  } catch (err) {
    console.error('Get failure error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch failure' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ failureId: string }> }
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

    const { failureId } = await params;
    const body = await request.json();

    const failure = await failureService.updateFailure(failureId, body);

    return NextResponse.json({ failure });
  } catch (err) {
    console.error('Update failure error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update failure' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ failureId: string }> }
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

    const { failureId } = await params;
    await failureService.deleteFailure(failureId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete failure error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete failure' } },
      { status: 500 }
    );
  }
}