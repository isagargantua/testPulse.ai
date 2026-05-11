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
    const { filename, file_size, project_id } = body;

    if (!filename || !file_size || !project_id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file_size > MAX_SIZE) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'File size exceeds 50MB limit' } },
        { status: 400 }
      );
    }

    // Validate file extension
    const extension = '.' + filename.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['.log', '.txt', '.json', '.xml', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.har', '.trace', '.html', '.htm'];
    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: `File type "${extension}" is not supported` } },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', project_id)
      .single();

    if (!project || project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied to this project' } },
        { status: 403 }
      );
    }

    // Create upload service
    const uploadService = createUploadService({ projectId: project_id });

    // Generate storage path
    const storagePath = uploadService.generateStoragePath(
      session.user.id,
      project_id,
      filename
    );

    // Create upload record
    const upload = await uploadService.createUploadRecord(
      project_id,
      session.user.id,
      filename,
      extension,
      file_size,
      storagePath
    );

    // Get presigned URL
    const { url } = await uploadService.getPresignedUrl(storagePath);

    return NextResponse.json({
      upload_id: upload.id,
      url,
      storage_path: storagePath,
    });
  } catch (err) {
    console.error('Presigned URL error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create upload URL' } },
      { status: 500 }
    );
  }
}