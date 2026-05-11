import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { forgotPasswordSchema } from '@testpulse/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { error } = await authService.resetPassword(result.data.email);

    if (error) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password reset email sent. Please check your inbox.',
    });
  } catch (err) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}