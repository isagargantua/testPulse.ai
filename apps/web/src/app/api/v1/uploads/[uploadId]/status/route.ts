import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> }
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

    const { uploadId } = await params;

    const { data: upload, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (error || !upload) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Upload not found' } },
        { status: 404 }
      );
    }

    // Verify ownership
    if (upload.user_id !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ upload });
  } catch (err) {
    console.error('Get upload error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch upload' } },
      { status: 500 }
    );
  }
}