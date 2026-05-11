import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createUploadService } from '@/lib/services/upload';

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
    const { upload_id } = body;

    if (!upload_id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing upload_id' } },
        { status: 400 }
      );
    }

    // Get upload record
    const uploadService = createUploadService({ projectId: '' });
    const upload = await uploadService.getUpload(upload_id);

    if (!upload) {
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

    // Update status to processing
    await uploadService.updateUploadStatus(upload_id, 'processing');

    // TODO: Trigger analysis pipeline here

    return NextResponse.json({
      success: true,
      upload_id,
      status: 'processing',
    });
  } catch (err) {
    console.error('Complete upload error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to complete upload' } },
      { status: 500 }
    );
  }
}