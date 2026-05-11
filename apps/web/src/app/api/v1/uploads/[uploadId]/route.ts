import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createUploadService } from '@/lib/services/upload';

export async function DELETE(
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

    const uploadService = createUploadService({ projectId: '' });
    const upload = await uploadService.getUpload(uploadId);

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

    await uploadService.deleteUpload(uploadId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete upload error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete upload' } },
      { status: 500 }
    );
  }
}