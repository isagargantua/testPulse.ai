import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { storageService, BUCKETS, type BucketName } from '@/lib/services/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; '*': string }> }
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

    const { bucket, '*': path } = await params;
    const filePath = path.replace(/%2F/g, '/');

    // Validate bucket
    if (!Object.values(BUCKETS).includes(bucket as typeof BUCKETS[keyof typeof BUCKETS])) {
      return NextResponse.json(
        { error: { code: 'INVALID_BUCKET', message: 'Invalid bucket name' } },
        { status: 400 }
      );
    }

    // Get signed URL for private files
    const result = await storageService.getSignedUrl(bucket as BucketName, filePath);

    if (!result) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'File not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      url: result.url,
      expires_at: result.expiresAt,
      path: filePath,
    });
  } catch (err) {
    console.error('Get file URL error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get file URL' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; '*': string }> }
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

    const { bucket, '*': path } = await params;
    const filePath = path.replace(/%2F/g, '/');

    // Validate bucket
    if (!Object.values(BUCKETS).includes(bucket as typeof BUCKETS[keyof typeof BUCKETS])) {
      return NextResponse.json(
        { error: { code: 'INVALID_BUCKET', message: 'Invalid bucket name' } },
        { status: 400 }
      );
    }

    // Verify ownership (file should be in user's folder)
    if (!filePath.startsWith(session.user.id)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const result = await storageService.deleteFile(bucket as BucketName, filePath);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'DELETE_ERROR', message: result.error } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete file error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete file' } },
      { status: 500 }
    );
  }
}
