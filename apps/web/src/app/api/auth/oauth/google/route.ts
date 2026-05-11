import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: { code: 'OAUTH_ERROR', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'OAuth failed' } },
      { status: 500 }
    );
  }
}
