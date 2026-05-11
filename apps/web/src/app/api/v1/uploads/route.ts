import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createUploadService } from '@/lib/services/upload';

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

    if (!projectId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Missing project_id' } },
        { status: 400 }
      );
    }

    // Verify project access
    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (!project || project.user_id !== session.user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    const uploadService = createUploadService({ projectId });
    const { uploads, total } = await uploadService.getProjectUploads(projectId, { limit, offset });

    return NextResponse.json({
      uploads,
      total,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
      has_more: offset + limit < total,
    });
  } catch (err) {
    console.error('Get uploads error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch uploads' } },
      { status: 500 }
    );
  }
}