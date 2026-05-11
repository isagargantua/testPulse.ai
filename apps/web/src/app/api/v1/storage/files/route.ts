import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { storageService, type BucketName } from '@/lib/services/storage';

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
    const bucket = (searchParams.get('bucket') || 'uploads') as BucketName;
    const path = searchParams.get('path') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    const { files, error } = await storageService.listFiles(bucket, path, { limit });

    if (error) {
      return NextResponse.json(
        { error: { code: 'STORAGE_ERROR', message: error } },
        { status: 500 }
      );
    }

    return NextResponse.json({ files, bucket, path });
  } catch (err) {
    console.error('List files error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to list files' } },
      { status: 500 }
    );
  }
}
