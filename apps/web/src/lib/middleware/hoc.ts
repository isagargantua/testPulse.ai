import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Session } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, context: { session: Session }) => Promise<NextResponse>
) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }

  return handler(request, { session });
}

// Usage example:
/*
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, { session }) => {
    // Use session.user.id for user-specific operations
    return NextResponse.json({ success: true });
  });
}
*/
