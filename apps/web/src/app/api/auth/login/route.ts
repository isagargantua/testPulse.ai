import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { loginSchema } from '@testpulse/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { user, session, error } = await authService.signIn(result.data);

    if (error) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: error.message } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
      session,
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}