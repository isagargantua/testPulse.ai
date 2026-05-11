import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { failureService } from '@/lib/services/failures';

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
    const category = searchParams.get('category') as any;
    const isFlaky = searchParams.get('is_flaky');
    const search = searchParams.get('search');

    if (!projectId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'project_id is required' } },
        { status: 400 }
      );
    }

    const { failures, total } = await failureService.getFailures(projectId, {
      limit,
      offset,
      category,
      isFlaky: isFlaky === 'true',
      search: search || undefined,
    });

    return NextResponse.json({
      failures,
      total,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
      has_more: offset + limit < total,
    });
  } catch (err) {
    console.error('Get failures error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch failures' } },
      { status: 500 }
    );
  }
}

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
    const { project_id, title, description, framework, error_message, stack_trace } = body;

    if (!project_id || !title) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'project_id and title are required' } },
        { status: 400 }
      );
    }

    const failure = await failureService.createFailure(project_id, {
      title,
      description,
      framework,
      errorMessage: error_message,
      stackTrace: stack_trace,
    });

    return NextResponse.json({ failure }, { status: 201 });
  } catch (err) {
    console.error('Create failure error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create failure' } },
      { status: 500 }
    );
  }
}